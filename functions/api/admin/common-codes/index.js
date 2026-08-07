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
    const group_code = url.searchParams.get('group_code');

    if (!adminId) {
      return jsonResponse({ success: false, error: '관리자 ID(adminId)가 필요합니다.' }, 400);
    }

    const hasAccess = await checkAdmin(env, adminId, 'SUPPORT');
    if (!hasAccess) {
      return jsonResponse({ success: false, error: '권한이 없습니다.' }, 403);
    }

    const { supabaseUrl, headers } = getSupabaseConfig(env);

    let apiUrl = `${supabaseUrl}/rest/v1/common_codes?select=*&order=sort_order.asc,code_value.asc`;
    if (group_code) {
      apiUrl += `&group_code=eq.${group_code}`;
    }

    const codesRes = await fetch(apiUrl, { headers });
    if (!codesRes.ok) throw new Error(`Failed to fetch common codes: ${await codesRes.text()}`);
    const codes = await codesRes.json();

    return jsonResponse({ success: true, data: codes });
  } catch (error) {
    console.error('[Admin API] Error fetching common codes:', error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    const body = await request.json();
    const { adminId, group_code, code_value, code_name, description, sort_order, is_use } = body;

    if (!adminId || !group_code || !code_value || !code_name) {
      return jsonResponse({ success: false, error: '필수 파라미터 누락' }, 400);
    }

    const hasAccess = await checkAdmin(env, adminId, 'SUPER');
    if (!hasAccess) {
      return jsonResponse({ success: false, error: 'SUPER 권한이 필요합니다.' }, 403);
    }

    const uppercaseCodeValue = code_value.toUpperCase().replace(/\s+/g, '');
    const { supabaseUrl, headers } = getSupabaseConfig(env);

    const checkRes = await fetch(`${supabaseUrl}/rest/v1/common_codes?group_code=eq.${group_code}&code_value=eq.${uppercaseCodeValue}&select=id`, { headers });
    const checkRows = await checkRes.json();
    if (checkRows && checkRows.length > 0) {
      return jsonResponse({ success: false, error: '해당 그룹에 이미 존재하는 코드 값입니다.' }, 400);
    }

    const payload = {
      group_code,
      code_value: uppercaseCodeValue,
      code_name,
      description: description || '',
      sort_order: sort_order || 0,
      is_use: is_use !== undefined ? is_use : true,
      created_by: adminId,
      updated_by: adminId,
    };

    const insertRes = await fetch(`${supabaseUrl}/rest/v1/common_codes`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify(payload)
    });

    if (!insertRes.ok) throw new Error(`Failed to insert common code: ${await insertRes.text()}`);

    return jsonResponse({ success: true, message: '상세 코드가 생성되었습니다.' });
  } catch (error) {
    console.error('[Admin API] Error creating common code:', error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}

export async function onRequestPatch(context) {
  try {
    const { request, env } = context;

    const body = await request.json();
    const { adminId, id, code_name, description, sort_order, is_use } = body;

    if (!adminId || !id) {
      return jsonResponse({ success: false, error: '필수 파라미터 누락' }, 400);
    }

    const hasAccess = await checkAdmin(env, adminId, 'SUPER');
    if (!hasAccess) {
      return jsonResponse({ success: false, error: 'SUPER 권한이 필요합니다.' }, 403);
    }

    const updateData = { updated_by: adminId, updated_at: new Date().toISOString() };
    if (code_name !== undefined) updateData.code_name = code_name;
    if (description !== undefined) updateData.description = description;
    if (sort_order !== undefined) updateData.sort_order = sort_order;
    if (is_use !== undefined) updateData.is_use = is_use;

    const { supabaseUrl, headers } = getSupabaseConfig(env);
    const updateRes = await fetch(`${supabaseUrl}/rest/v1/common_codes?id=eq.${id}`, {
      method: 'PATCH',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify(updateData)
    });

    if (!updateRes.ok) throw new Error(`Failed to update common code: ${await updateRes.text()}`);

    return jsonResponse({ success: true, message: '상세 코드가 수정되었습니다.' });
  } catch (error) {
    console.error('[Admin API] Error updating common code:', error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}

export async function onRequestDelete(context) {
  try {
    const { request, env } = context;

    const url = new URL(request.url);
    const adminId = url.searchParams.get('adminId');
    const id = url.searchParams.get('id');

    if (!adminId || !id) {
      return jsonResponse({ success: false, error: '필수 파라미터 누락' }, 400);
    }

    const hasAccess = await checkAdmin(env, adminId, 'SUPER');
    if (!hasAccess) {
      return jsonResponse({ success: false, error: 'SUPER 권한이 필요합니다.' }, 403);
    }

    const { supabaseUrl, headers } = getSupabaseConfig(env);
    const deleteRes = await fetch(`${supabaseUrl}/rest/v1/common_codes?id=eq.${id}`, {
      method: 'DELETE',
      headers
    });

    if (!deleteRes.ok) throw new Error(`Failed to delete common code: ${await deleteRes.text()}`);

    return jsonResponse({ success: true, message: '상세 코드가 삭제되었습니다.' });
  } catch (error) {
    console.error('[Admin API] Error deleting common code:', error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}
