import { corsHeaders, jsonResponse, handleOptions, getSupabaseAdmin } from '../_shared.js';

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
    const group_code = url.searchParams.get('group_code');

    if (!adminId) {
      return jsonResponse({ success: false, error: '관리자 ID(adminId)가 필요합니다.' }, 400);
    }

    const hasAccess = await checkAdmin(supabaseAdmin, adminId, 'SUPPORT');
    if (!hasAccess) {
      return jsonResponse({ success: false, error: '권한이 없습니다.' }, 403);
    }

    let query = supabaseAdmin
      .from('common_codes')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('code_value', { ascending: true });

    if (group_code) {
      query = query.eq('group_code', group_code);
    }

    const { data: codes, error } = await query;

    if (error) throw error;

    return jsonResponse({ success: true, data: codes });
  } catch (error) {
    console.error('[Admin API] Error fetching common codes:', error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const supabaseAdmin = getSupabaseAdmin(env);

    const body = await request.json();
    const { adminId, group_code, code_value, code_name, description, sort_order, is_use } = body;

    if (!adminId || !group_code || !code_value || !code_name) {
      return jsonResponse({ success: false, error: '필수 파라미터 누락' }, 400);
    }

    const hasAccess = await checkAdmin(supabaseAdmin, adminId, 'SUPER');
    if (!hasAccess) {
      return jsonResponse({ success: false, error: 'SUPER 권한이 필요합니다.' }, 403);
    }

    const uppercaseCodeValue = code_value.toUpperCase().replace(/\s+/g, '');

    const { data: existingCode } = await supabaseAdmin
      .from('common_codes')
      .select('id')
      .eq('group_code', group_code)
      .eq('code_value', uppercaseCodeValue)
      .single();

    if (existingCode) {
      return jsonResponse({ success: false, error: '해당 그룹에 이미 존재하는 코드 값입니다.' }, 400);
    }

    const { error: insertError } = await supabaseAdmin.from('common_codes').insert({
      group_code,
      code_value: uppercaseCodeValue,
      code_name,
      description: description || '',
      sort_order: sort_order || 0,
      is_use: is_use !== undefined ? is_use : true,
      created_by: adminId,
      updated_by: adminId,
    });

    if (insertError) throw insertError;

    return jsonResponse({ success: true, message: '상세 코드가 생성되었습니다.' });
  } catch (error) {
    console.error('[Admin API] Error creating common code:', error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}

export async function onRequestPatch(context) {
  try {
    const { request, env } = context;
    const supabaseAdmin = getSupabaseAdmin(env);

    const body = await request.json();
    const { adminId, id, code_name, description, sort_order, is_use } = body;

    if (!adminId || !id) {
      return jsonResponse({ success: false, error: '필수 파라미터 누락' }, 400);
    }

    const hasAccess = await checkAdmin(supabaseAdmin, adminId, 'SUPER');
    if (!hasAccess) {
      return jsonResponse({ success: false, error: 'SUPER 권한이 필요합니다.' }, 403);
    }

    const updateData = { updated_by: adminId, updated_at: new Date().toISOString() };
    if (code_name !== undefined) updateData.code_name = code_name;
    if (description !== undefined) updateData.description = description;
    if (sort_order !== undefined) updateData.sort_order = sort_order;
    if (is_use !== undefined) updateData.is_use = is_use;

    const { error: updateError } = await supabaseAdmin
      .from('common_codes')
      .update(updateData)
      .eq('id', id);

    if (updateError) throw updateError;

    return jsonResponse({ success: true, message: '상세 코드가 수정되었습니다.' });
  } catch (error) {
    console.error('[Admin API] Error updating common code:', error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}

export async function onRequestDelete(context) {
  try {
    const { request, env } = context;
    const supabaseAdmin = getSupabaseAdmin(env);

    const url = new URL(request.url);
    const adminId = url.searchParams.get('adminId');
    const id = url.searchParams.get('id');

    if (!adminId || !id) {
      return jsonResponse({ success: false, error: '필수 파라미터 누락' }, 400);
    }

    const hasAccess = await checkAdmin(supabaseAdmin, adminId, 'SUPER');
    if (!hasAccess) {
      return jsonResponse({ success: false, error: 'SUPER 권한이 필요합니다.' }, 403);
    }

    const { error: deleteError } = await supabaseAdmin
      .from('common_codes')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    return jsonResponse({ success: true, message: '상세 코드가 삭제되었습니다.' });
  } catch (error) {
    console.error('[Admin API] Error deleting common code:', error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}
