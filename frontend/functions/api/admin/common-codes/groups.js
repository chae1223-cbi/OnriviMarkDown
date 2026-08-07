import { corsHeaders, jsonResponse, handleOptions, getSupabaseAdmin } from '../../_shared.js';

export const onRequestOptions = handleOptions;

async function checkAdmin(supabaseAdmin, adminId, requiredRole = 'SUPPORT') {
  if (!supabaseAdmin || !adminId) return false;
  const { data } = await supabaseAdmin.from('admins').select('admin_role').eq('user_id', adminId).single();
  if (!data) return false;
  if (requiredRole === 'SUPER' && data.admin_role !== 'SUPER') return false;
  return true;
}

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const supabaseAdmin = getSupabaseAdmin(env);

    const url = new URL(request.url);
    const adminId = url.searchParams.get('adminId');

    if (!adminId) {
      return jsonResponse({ success: false, error: '관리자 ID(adminId)가 필요합니다.' }, 400);
    }

    const hasAccess = await checkAdmin(supabaseAdmin, adminId, 'SUPPORT');
    if (!hasAccess) {
      return jsonResponse({ success: false, error: '권한이 없습니다.' }, 403);
    }

    const { data: groups, error } = await supabaseAdmin
      .from('common_code_groups')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('group_code', { ascending: true });

    if (error) throw error;

    return jsonResponse({ success: true, data: groups });
  } catch (error) {
    console.error('[Admin API] Error fetching common code groups:', error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const supabaseAdmin = getSupabaseAdmin(env);

    const body = await request.json();
    const { adminId, group_code, group_name, description, sort_order, is_use } = body;

    if (!adminId || !group_code || !group_name) {
      return jsonResponse({ success: false, error: '필수 파라미터 누락' }, 400);
    }

    const hasAccess = await checkAdmin(supabaseAdmin, adminId, 'SUPER');
    if (!hasAccess) {
      return jsonResponse({ success: false, error: 'SUPER 권한이 필요합니다.' }, 403);
    }

    const { data: existingGroup } = await supabaseAdmin.from('common_code_groups').select('group_code').eq('group_code', group_code.toUpperCase()).single();
    if (existingGroup) {
      return jsonResponse({ success: false, error: '이미 존재하는 그룹 코드입니다.' }, 400);
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

    return jsonResponse({ success: true, message: '그룹 코드가 생성되었습니다.' });
  } catch (error) {
    console.error('[Admin API] Error creating common code group:', error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}

export async function onRequestPatch(context) {
  try {
    const { request, env } = context;
    const supabaseAdmin = getSupabaseAdmin(env);

    const body = await request.json();
    const { adminId, group_code, group_name, description, sort_order, is_use } = body;

    if (!adminId || !group_code) {
      return jsonResponse({ success: false, error: '필수 파라미터 누락' }, 400);
    }

    const hasAccess = await checkAdmin(supabaseAdmin, adminId, 'SUPER');
    if (!hasAccess) {
      return jsonResponse({ success: false, error: 'SUPER 권한이 필요합니다.' }, 403);
    }

    const updateData = { updated_by: adminId, updated_at: new Date().toISOString() };
    if (group_name !== undefined) updateData.group_name = group_name;
    if (description !== undefined) updateData.description = description;
    if (sort_order !== undefined) updateData.sort_order = sort_order;
    if (is_use !== undefined) updateData.is_use = is_use;

    const { error: updateError } = await supabaseAdmin
      .from('common_code_groups')
      .update(updateData)
      .eq('group_code', group_code);

    if (updateError) throw updateError;

    return jsonResponse({ success: true, message: '그룹 코드가 수정되었습니다.' });
  } catch (error) {
    console.error('[Admin API] Error updating common code group:', error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}

export async function onRequestDelete(context) {
  try {
    const { request, env } = context;
    const supabaseAdmin = getSupabaseAdmin(env);

    const url = new URL(request.url);
    const adminId = url.searchParams.get('adminId');
    const group_code = url.searchParams.get('group_code');

    if (!adminId || !group_code) {
      return jsonResponse({ success: false, error: '필수 파라미터 누락' }, 400);
    }

    const hasAccess = await checkAdmin(supabaseAdmin, adminId, 'SUPER');
    if (!hasAccess) {
      return jsonResponse({ success: false, error: 'SUPER 권한이 필요합니다.' }, 403);
    }

    const { error: deleteError } = await supabaseAdmin
      .from('common_code_groups')
      .delete()
      .eq('group_code', group_code);

    if (deleteError) throw deleteError;

    return jsonResponse({ success: true, message: '그룹 코드가 삭제되었습니다.' });
  } catch (error) {
    console.error('[Admin API] Error deleting common code group:', error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}
