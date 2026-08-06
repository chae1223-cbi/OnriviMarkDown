import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

async function checkAdmin(adminId: string, requiredRole: 'SUPER' | 'SUPPORT' = 'SUPPORT') {
  if (!supabaseAdmin || !adminId) return false;
  const { data } = await supabaseAdmin.from('admins').select('admin_role').eq('user_id', adminId).single();
  if (!data) return false;
  if (requiredRole === 'SUPER' && data.admin_role !== 'SUPER') return false;
  return true;
}

export async function GET(req: Request) {
  try {
    if (!supabaseAdmin) throw new Error('Supabase Admin is not configured.');

    const { searchParams } = new URL(req.url);
    const adminId = searchParams.get('adminId');

    if (!adminId) {
      return NextResponse.json({ success: false, error: '관리자 ID(adminId)가 필요합니다.' }, { status: 400 });
    }

    // SUPPORT 이상이면 조회 가능
    const hasAccess = await checkAdmin(adminId, 'SUPPORT');
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: '권한이 없습니다.' }, { status: 403 });
    }

    const { data: groups, error } = await supabaseAdmin
      .from('common_code_groups')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('group_code', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, data: groups });
  } catch (error: any) {
    console.error('[Admin API] Error fetching common code groups:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!supabaseAdmin) throw new Error('Supabase Admin is not configured.');

    const body = await req.json();
    const { adminId, group_code, group_name, description, sort_order, is_use } = body;

    if (!adminId || !group_code || !group_name) {
      return NextResponse.json({ success: false, error: '필수 파라미터 누락' }, { status: 400 });
    }

    // 쓰기(생성)은 SUPER만 가능
    const hasAccess = await checkAdmin(adminId, 'SUPER');
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: 'SUPER 권한이 필요합니다.' }, { status: 403 });
    }

    const { data: existingGroup } = await supabaseAdmin.from('common_code_groups').select('group_code').eq('group_code', group_code.toUpperCase()).single();
    if (existingGroup) {
      return NextResponse.json({ success: false, error: '이미 존재하는 그룹 코드입니다.' }, { status: 400 });
    }

    const { error: insertError } = await supabaseAdmin.from('common_code_groups').insert({
      group_code: group_code.toUpperCase(),
      group_name,
      description: description || '',
      sort_order: sort_order || 0,
      is_use: is_use !== undefined ? is_use : true,
      created_by: adminId,
      updated_by: adminId,
    });

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, message: '그룹 코드가 생성되었습니다.' });
  } catch (error: any) {
    console.error('[Admin API] Error creating common code group:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    if (!supabaseAdmin) throw new Error('Supabase Admin is not configured.');

    const body = await req.json();
    const { adminId, group_code, group_name, description, sort_order, is_use } = body;

    if (!adminId || !group_code) {
      return NextResponse.json({ success: false, error: '필수 파라미터 누락' }, { status: 400 });
    }

    // 쓰기(수정)은 SUPER만 가능
    const hasAccess = await checkAdmin(adminId, 'SUPER');
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: 'SUPER 권한이 필요합니다.' }, { status: 403 });
    }

    const updateData: any = { updated_by: adminId, updated_at: new Date().toISOString() };
    if (group_name !== undefined) updateData.group_name = group_name;
    if (description !== undefined) updateData.description = description;
    if (sort_order !== undefined) updateData.sort_order = sort_order;
    if (is_use !== undefined) updateData.is_use = is_use;

    const { error: updateError } = await supabaseAdmin
      .from('common_code_groups')
      .update(updateData)
      .eq('group_code', group_code);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, message: '그룹 코드가 수정되었습니다.' });
  } catch (error: any) {
    console.error('[Admin API] Error updating common code group:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (!supabaseAdmin) throw new Error('Supabase Admin is not configured.');

    const { searchParams } = new URL(req.url);
    const adminId = searchParams.get('adminId');
    const group_code = searchParams.get('group_code');

    if (!adminId || !group_code) {
      return NextResponse.json({ success: false, error: '필수 파라미터 누락' }, { status: 400 });
    }

    // 쓰기(삭제)는 SUPER만 가능
    const hasAccess = await checkAdmin(adminId, 'SUPER');
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: 'SUPER 권한이 필요합니다.' }, { status: 403 });
    }

    const { error: deleteError } = await supabaseAdmin
      .from('common_code_groups')
      .delete()
      .eq('group_code', group_code);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true, message: '그룹 코드가 삭제되었습니다.' });
  } catch (error: any) {
    console.error('[Admin API] Error deleting common code group:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
