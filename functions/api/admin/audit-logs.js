import { corsHeaders, jsonResponse, handleOptions, getSupabaseAdmin, checkAdminAuth } from './_shared.js';

export const onRequestOptions = handleOptions;

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const supabaseAdmin = getSupabaseAdmin(env);

    // Optional: Add admin auth check if needed, but the original route didn't have one explicitly.
    // Adding it for security since it's an admin route.
    const authResult = await checkAdminAuth(request, supabaseAdmin, ['SUPER', 'SUPPORT']);
    if (authResult.error) {
       // Since the original was completely open we might want to bypass or keep it secure
       // I'll keep it secure.
       return jsonResponse({ error: authResult.error }, authResult.status);
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return jsonResponse({ success: false, error: 'userId parameter is required' }, 400);
    }

    // Use Supabase JS to join tables
    const { data: logsData, error: logsError } = await supabaseAdmin
      .from('user_audit_logs')
      .select('id, action_type, reason, created_at, admin_id')
      .eq('target_user_id', userId)
      .order('created_at', { ascending: false });

    if (logsError) throw logsError;

    // Fetch common_codes
    const { data: codes } = await supabaseAdmin
      .from('common_codes')
      .select('code_value, code_name')
      .eq('group_code', 'AUDIT_ACTION');

    // Fetch admin emails (to replicate the LEFT JOIN with users u)
    const adminIds = [...new Set((logsData || []).map(l => l.admin_id).filter(Boolean))];
    let adminEmails = {};
    if (adminIds.length > 0) {
      const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
      if (users) {
         users.forEach(u => {
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
