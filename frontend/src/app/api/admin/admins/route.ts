import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sql } from '@/lib/db';
import { verifyAdmin } from '@/lib/adminAuth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// ROOT Admin email that cannot be demoted or deleted
const ROOT_ADMIN_EMAIL = 'chaetang1223@gmail.com';

export async function GET(req: Request) {
  try {
    const { user, error: authErr } = await verifyAdmin(req);
    if (authErr || !user) return NextResponse.json({ success: false, error: '권한이 없습니다.' }, { status: 403 });

    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Supabase Admin is not configured.' }, { status: 500 });
    }

    const { data: admins, error } = await supabaseAdmin.from('admins').select('*').order('created_at', { ascending: false });
    if (error) throw error;

    return NextResponse.json({ success: true, data: admins });
  } catch (error: any) {
    console.error('[Admin API] Error fetching admins:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user, adminRole, error: authErr } = await verifyAdmin(req, true);
    if (authErr || !user || adminRole !== 'SUPER') return NextResponse.json({ success: false, error: 'SUPER 권한이 필요합니다.' }, { status: 403 });

    if (!supabaseAdmin) throw new Error('Supabase Admin is not configured.');

    const body = await req.json();
    const { email, role } = body;
    const adminId = user.id;

    if (!email || !role) {
      return NextResponse.json({ success: false, error: '이메일과 권한(Role)은 필수입니다.' }, { status: 400 });
    }

    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    const authUser = users?.find(u => u.email === email);
    let finalUserId = authUser ? authUser.id : null;

    if (!finalUserId) {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
      });
      if (createError) throw new Error('Failed to create auth user: ' + createError.message);
      finalUserId = newUser.user.id;
      
      await supabaseAdmin.from('users').insert({
        id: finalUserId,
        email,
        nick_name: '관리자',
        status: 'ACTIVE'
      });
    }

    const { data: existingAdmin } = await supabaseAdmin.from('admins').select('id').eq('email', email).single();
    if (existingAdmin) {
      return NextResponse.json({ success: false, error: '이미 등록된 관리자입니다.' }, { status: 400 });
    }

    const { error: insertError } = await supabaseAdmin.from('admins').insert({
      user_id: finalUserId,
      email: email,
      admin_role: role
    });

    if (insertError) throw insertError;

    await sql`
      INSERT INTO user_audit_logs (target_user_id, admin_id, action_type, reason)
      VALUES (${finalUserId}, ${adminId || null}, 'ADMIN_INVITE', 'Invited as ' || ${role})
    `;

    return NextResponse.json({ success: true, message: '관리자가 성공적으로 등록되었습니다.' });

  } catch (error: any) {
    console.error('[Admin API] Error inviting admin:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { user, adminRole, error: authErr } = await verifyAdmin(req, true);
    if (authErr || !user || adminRole !== 'SUPER') return NextResponse.json({ success: false, error: 'SUPER 권한이 필요합니다.' }, { status: 403 });

    if (!supabaseAdmin) throw new Error('Supabase Admin is not configured.');

    const body = await req.json();
    const { adminTargetId, targetEmail, newRole } = body;
    const adminId = user.id;

    if (!adminTargetId || !newRole || !targetEmail) {
      return NextResponse.json({ success: false, error: '필수 파라미터가 누락되었습니다.' }, { status: 400 });
    }

    if (targetEmail === ROOT_ADMIN_EMAIL) {
      return NextResponse.json({ success: false, error: '최상위 관리자의 권한은 변경할 수 없습니다.' }, { status: 403 });
    }

    const { error: updateError } = await supabaseAdmin.from('admins').update({ admin_role: newRole }).eq('id', adminTargetId);
    if (updateError) throw updateError;

    await sql`
      INSERT INTO user_audit_logs (target_user_id, admin_id, action_type, reason)
      VALUES (null, ${adminId || null}, 'ADMIN_ROLE_CHANGE', 'Changed role of ' || ${targetEmail} || ' to ' || ${newRole})
    `;

    return NextResponse.json({ success: true, message: '관리자 권한이 성공적으로 변경되었습니다.' });

  } catch (error: any) {
    console.error('[Admin API] Error updating admin role:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { user, adminRole, error: authErr } = await verifyAdmin(req, true);
    if (authErr || !user || adminRole !== 'SUPER') return NextResponse.json({ success: false, error: 'SUPER 권한이 필요합니다.' }, { status: 403 });

    if (!supabaseAdmin) throw new Error('Supabase Admin is not configured.');

    const { searchParams } = new URL(req.url);
    const adminTargetId = searchParams.get('adminTargetId');
    const targetEmail = searchParams.get('targetEmail');
    const adminId = user.id;

    if (!adminTargetId || !targetEmail) {
      return NextResponse.json({ success: false, error: '필수 파라미터가 누락되었습니다.' }, { status: 400 });
    }

    if (targetEmail === ROOT_ADMIN_EMAIL) {
      return NextResponse.json({ success: false, error: '최상위 관리자는 비활성화(회수)할 수 없습니다.' }, { status: 403 });
    }

    // 1) admins 테이블에서 삭제 (권한 회수)
    const { error: deleteError } = await supabaseAdmin.from('admins').delete().eq('id', adminTargetId);
    if (deleteError) throw deleteError;

    // 2) 해당 유저의 auth user_id 조회
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    const targetAuthUser = users?.find(u => u.email === targetEmail);

    if (targetAuthUser) {
      // 3) MFA 팩터 전체 삭제 → 재로그인 시 aal2 통과 불가 (실질적 접근 차단)
      // listFactors 반환 타입: { factors: Factor[] } — factors.totp 없음
      const { data: factorData } = await supabaseAdmin.auth.admin.mfa.listFactors({ userId: targetAuthUser.id });
      const totpFactors = factorData?.factors?.filter(f => f.factor_type === 'totp') ?? [];
      for (const factor of totpFactors) {
        await supabaseAdmin.auth.admin.mfa.deleteFactor({ userId: targetAuthUser.id, id: factor.id });
      }
    }

    await sql`
      INSERT INTO user_audit_logs (target_user_id, admin_id, action_type, reason)
      VALUES (${targetAuthUser?.id || null}, ${adminId || null}, 'ADMIN_REVOKE', 'Revoked admin access and deleted MFA for ' || ${targetEmail})
    `;

    return NextResponse.json({ success: true, message: '관리자 권한이 즉시 회수되었으며, OTP 재등록이 초기화되었습니다.' });

  } catch (error: any) {
    console.error('[Admin API] Error revoking admin:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
