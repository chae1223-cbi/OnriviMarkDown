import { corsHeaders, jsonResponse, handleOptions, getSupabaseConfig, checkAdminAuth } from './_shared.js';

export const onRequestOptions = handleOptions;

export async function onRequestGet(context) {
  try {
    const { request, env } = context;

    const authResult = await checkAdminAuth(request, env, ['SUPER', 'SUPPORT']);
    if (authResult.error) {
       return jsonResponse({ error: authResult.error }, authResult.status);
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return jsonResponse({ success: false, error: 'userId parameter is required' }, 400);
    }

    const { supabaseUrl, headers } = getSupabaseConfig(env);

    const logsRes = await fetch(`${supabaseUrl}/rest/v1/user_audit_logs?target_user_id=eq.${userId}&select=id,action_type,reason,created_at,admin_id&order=created_at.desc`, { headers });
    if (!logsRes.ok) throw new Error(`Failed to fetch logs: ${await logsRes.text()}`);
    const logsData = await logsRes.json();

    const codesRes = await fetch(`${supabaseUrl}/rest/v1/common_codes?group_code=eq.AUDIT_ACTION&select=code_value,code_name`, { headers });
    let codes = [];
    if (codesRes.ok) {
      codes = await codesRes.json();
    }

    const adminIds = [...new Set((logsData || []).map(l => l.admin_id).filter(Boolean))];
    let adminEmails = {};
    if (adminIds.length > 0) {
      const usersRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, { headers });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        usersData.users?.forEach(u => {
          if (adminIds.includes(u.id)) {
            adminEmails[u.id] = u.email;
          }
        });
      }
    }

    const logs = (logsData || []).map(l => {
      const c = codes?.find(cc => cc.code_value === l.action_type);
      return {
        id: l.id,
        raw_action: l.action_type,
        action_name: c ? c.code_name : l.action_type,
        reason: l.reason,
        created_at: l.created_at,
        admin_id: l.admin_id,
        admin_email: l.admin_id ? adminEmails[l.admin_id] : null
      };
    });

    return jsonResponse({ success: true, data: logs });
  } catch (error) {
    console.error('[/api/admin/audit-logs] Error fetching logs:', error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}
