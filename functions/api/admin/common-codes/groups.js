import { corsHeaders, jsonResponse, handleOptions, getSupabaseConfig } from '../_shared.js';

export const onRequestOptions = handleOptions;

async function checkAdmin(env, adminId, requiredRole = 'SUPPORT') {
  if (!env || !adminId) return false;
  const { supabaseUrl, headers } = getSupabaseConfig(env);
  const res = await fetch(`${supabaseUrl}/rest/v1/admins?user_id=eq.${adminId}&select=admin_role`, { headers });
  if (!res.ok) return false;
  const rows = await res.json();
  const data = rows && rows.length > 0 ? rows[0] : null;
  if (!data) return false;
  if (requiredRole === 'SUPER' && data.admin_role !== 'SUPER') return false;
  return true;
}

export async function onRequestGet(context) {
  try {
    const { request, env } = context;

    const url = new URL(request.url);
    const adminId = url.searchParams.get('adminId');

    if (!adminId) {
      return jsonResponse({ success: false, error: '관리자 ID(adminId)가 필요합니다.' }, 400);
    }

    const hasAccess = await checkAdmin(env, adminId, 'SUPPORT');
    if (!hasAccess) {
      return jsonResponse({ success: false, error: '권한이 없습니다.' }, 403);
    }

    const { supabaseUrl, headers } = getSupabaseConfig(env);
    
    const groupsRes = await fetch(`${supabaseUrl}/rest/v1/common_code_groups?select=*&order=sort_order.asc,group_code.asc`, { headers });
    if (!groupsRes.ok) throw new Error(`Failed to fetch common code groups: ${await groupsRes.text()}`);
    const groups = await groupsRes.json();

    return jsonResponse({ success: true, data: groups });
  } catch (error) {
    console.error('[Admin API] Error fetching common code groups:', error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    const body = await request.json();
    const { adminId, group_code, group_name, description, sort_order, is_use } = body;

    if (!adminId || !group_code || !group_name) {
      return jsonResponse({ success: false, error: '필수 파라미터 누락' }, 400);
    }

    const hasAccess = await checkAdmin(env, adminId, 'SUPER');
    if (!hasAccess) {
      return jsonResponse({ success: false, error: 'SUPER 권한이 필요합니다.' }, 403);
    }

    const { supabaseUrl, headers } = getSupabaseConfig(env);
    const uppercaseGroupCode = group_code.toUpperCase();

    const checkRes = await fetch(`${supabaseUrl}/rest/v1/common_code_groups?group_code=eq.${uppercaseGroupCode}&select=group_code`, { headers });
    const checkRows = await checkRes.json();
    if (checkRows && checkRows.length > 0) {
      return jsonResponse({ success: false, error: '이미 존재하는 그룹 코드입니다.' }, 400);
    }

    const payload = {
      group_code: uppercaseGroupCode,
      group_name,
      description: description || '',
      sort_order: sort_order || 0,
      is_use: is_use !== undefined ? is_use : true,
      created_by: adminId,
      updated_by: adminId,
    };

    const insertRes = await fetch(`${supabaseUrl}/rest/v1/common_code_groups`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify(payload)
    });

    if (!insertRes.ok) throw new Error(`Failed to insert common code group: ${await insertRes.text()}`);

    return jsonResponse({ success: true, message: '그룹 코드가 생성되었습니다.' });
  } catch (error) {
    console.error('[Admin API] Error creating common code group:', error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}

export async function onRequestPatch(context) {
  try {
    const { request, env } = context;

    const body = await request.json();
    const { adminId, group_code, group_name, description, sort_order, is_use } = body;

    if (!adminId || !group_code) {
      return jsonResponse({ success: false, error: '필수 파라미터 누락' }, 400);
    }

    const hasAccess = await checkAdmin(env, adminId, 'SUPER');
    if (!hasAccess) {
      return jsonResponse({ success: false, error: 'SUPER 권한이 필요합니다.' }, 403);
    }

    const updateData = { updated_by: adminId, updated_at: new Date().toISOString() };
    if (group_name !== undefined) updateData.group_name = group_name;
    if (description !== undefined) updateData.description = description;
    if (sort_order !== undefined) updateData.sort_order = sort_order;
    if (is_use !== undefined) updateData.is_use = is_use;

    const { supabaseUrl, headers } = getSupabaseConfig(env);
    const updateRes = await fetch(`${supabaseUrl}/rest/v1/common_code_groups?group_code=eq.${group_code}`, {
      method: 'PATCH',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify(updateData)
    });

    if (!updateRes.ok) throw new Error(`Failed to update common code group: ${await updateRes.text()}`);

    return jsonResponse({ success: true, message: '그룹 코드가 수정되었습니다.' });
  } catch (error) {
    console.error('[Admin API] Error updating common code group:', error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}

export async function onRequestDelete(context) {
  try {
    const { request, env } = context;

    const url = new URL(request.url);
    const adminId = url.searchParams.get('adminId');
    const group_code = url.searchParams.get('group_code');

    if (!adminId || !group_code) {
      return jsonResponse({ success: false, error: '필수 파라미터 누락' }, 400);
    }

    const hasAccess = await checkAdmin(env, adminId, 'SUPER');
    if (!hasAccess) {
      return jsonResponse({ success: false, error: 'SUPER 권한이 필요합니다.' }, 403);
    }

    const { supabaseUrl, headers } = getSupabaseConfig(env);
    const deleteRes = await fetch(`${supabaseUrl}/rest/v1/common_code_groups?group_code=eq.${group_code}`, {
      method: 'DELETE',
      headers
    });

    if (!deleteRes.ok) throw new Error(`Failed to delete common code group: ${await deleteRes.text()}`);

    return jsonResponse({ success: true, message: '그룹 코드가 삭제되었습니다.' });
  } catch (error) {
    console.error('[Admin API] Error deleting common code group:', error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}
