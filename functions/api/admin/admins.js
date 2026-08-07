import { corsHeaders, jsonResponse, handleOptions, getSupabaseAdmin, insertAuditLog } from './_shared.js';

export const onRequestOptions = handleOptions;

const ROOT_ADMIN_EMAIL = 'chaetang1223@gmail.com';

export async function onRequestGet(context) {
  try {
    const { env } = context;
    const supabaseAdmin = getSupabaseAdmin(env);

    const { data: admins, error } = await supabaseAdmin.from('admins').select('*').order('created_at', { ascending: false });
    if (error) throw error;

    return jsonResponse({ success: true, data: admins });
  } catch (error) {
    console.error('[Admin API] Error fetching admins:', error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const supabaseAdmin = getSupabaseAdmin(env);
    
    const body = await request.json();
    const { email, role, adminId } = body;

    if (!email || !role) {
      return jsonResponse({ success: false, error: '이메일과 권한(Role)은 필수입니다.' }, 400);
    }

    if (adminId) {
      const { data: requester } = await supabaseAdmin.from('admins').select('admin_role').eq('user_id', adminId).single();
      if (!requester || requester.admin_role !== 'SUPER') {
        return jsonResponse({ success: false, error: 'SUPER 권한이 필요합니다.' }, 403);
      }
    }

    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
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
      return jsonResponse({ success: false, error: '이미 등록된 관리자입니다.' }, 400);
    }

    const { error: insertError } = await supabaseAdmin.from('admins').insert({
      user_id: finalUserId,
      email: email,
      admin_role: role
    });

    if (insertError) throw insertError;

    await insertAuditLog(supabaseAdmin, finalUserId, adminId, 'ADMIN_INVITE', 'Invited as ' + role);

    return jsonResponse({ success: true, message: '관리자가 성공적으로 등록되었습니다.' });

  } catch (error) {
    console.error('[Admin API] Error inviting admin:', error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}

export async function onRequestPatch(context) {
  try {
    const { request, env } = context;
    const supabaseAdmin = getSupabaseAdmin(env);

    const body = await request.json();
    const { adminTargetId, targetEmail, newRole, adminId } = body;

    if (!adminTargetId || !newRole || !targetEmail) {
      return jsonResponse({ success: false, error: '필수 파라미터가 누락되었습니다.' }, 400);
    }

    if (targetEmail === ROOT_ADMIN_EMAIL) {
      return jsonResponse({ success: false, error: '최상위 관리자의 권한은 변경할 수 없습니다.' }, 403);
    }

    if (adminId) {
      const { data: requester } = await supabaseAdmin.from('admins').select('admin_role').eq('user_id', adminId).single();
      if (!requester || requester.admin_role !== 'SUPER') {
        return jsonResponse({ success: false, error: 'SUPER 권한이 필요합니다.' }, 403);
      }
    }

    const { error: updateError } = await supabaseAdmin.from('admins').update({ admin_role: newRole }).eq('id', adminTargetId);
    if (updateError) throw updateError;

    await insertAuditLog(supabaseAdmin, null, adminId, 'ADMIN_ROLE_CHANGE', 'Changed role of ' + targetEmail + ' to ' + newRole);

    return jsonResponse({ success: true, message: '관리자 권한이 성공적으로 변경되었습니다.' });

  } catch (error) {
    console.error('[Admin API] Error updating admin role:', error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}

export async function onRequestDelete(context) {
  try {
    const { request, env } = context;
    const supabaseAdmin = getSupabaseAdmin(env);

    const url = new URL(request.url);
    const adminTargetId = url.searchParams.get('adminTargetId');
    const targetEmail = url.searchParams.get('targetEmail');
    const adminId = url.searchParams.get('adminId');

    if (!adminTargetId || !targetEmail) {
      return jsonResponse({ success: false, error: '필수 파라미터가 누락되었습니다.' }, 400);
    }

    if (targetEmail === ROOT_ADMIN_EMAIL) {
      return jsonResponse({ success: false, error: '최상위 관리자는 비활성화(회수)할 수 없습니다.' }, 403);
    }

    if (adminId) {
      const { data: requester } = await supabaseAdmin.from('admins').select('admin_role').eq('user_id', adminId).single();
      if (!requester || requester.admin_role !== 'SUPER') {
        return jsonResponse({ success: false, error: 'SUPER 권한이 필요합니다.' }, 403);
      }
    }

    const { error: deleteError } = await supabaseAdmin.from('admins').delete().eq('id', adminTargetId);
    if (deleteError) throw deleteError;

    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    const targetAuthUser = users?.find(u => u.email === targetEmail);

    if (targetAuthUser) {
      const { data: factorData } = await supabaseAdmin.auth.admin.mfa.listFactors({ userId: targetAuthUser.id });
      const totpFactors = factorData?.factors?.filter(f => f.factor_type === 'totp') ?? [];
      for (const factor of totpFactors) {
        await supabaseAdmin.auth.admin.mfa.deleteFactor({ userId: targetAuthUser.id, id: factor.id });
      }
    }

    await insertAuditLog(supabaseAdmin, targetAuthUser?.id || null, adminId, 'ADMIN_REVOKE', 'Revoked admin access and deleted MFA for ' + targetEmail);

    return jsonResponse({ success: true, message: '관리자 권한이 즉시 회수되었으며, OTP 재등록이 초기화되었습니다.' });

  } catch (error) {
    console.error('[Admin API] Error revoking admin:', error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}
