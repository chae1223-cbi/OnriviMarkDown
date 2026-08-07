// CORS headers for admin APIs
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
  'Access-Control-Max-Age': '86400',
};

// Response helper
export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}

// Global OPTIONS handler for CORS preflight
export async function handleOptions(request) {
  return new Response(null, { headers: corsHeaders });
}

// Supabase REST Config Provider
export function getSupabaseConfig(env) {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase admin credentials are missing in environment variables.');
  }

  return {
    supabaseUrl,
    supabaseServiceKey,
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };
}

// Executes a raw DB operation by calling a Supabase REST API
export async function executeDeleteActivations(env, subscriptionIds, userIds, deviceId) {
  const { supabaseUrl, headers } = getSupabaseConfig(env);
  
  if (deviceId) {
    await fetch(`${supabaseUrl}/rest/v1/license_activations?id=eq.${deviceId}`, {
      method: 'DELETE',
      headers
    });
  }
  
  if (subscriptionIds && subscriptionIds.length > 0) {
    await fetch(`${supabaseUrl}/rest/v1/license_activations?subscription_id=in.(${subscriptionIds.join(',')})`, {
      method: 'DELETE',
      headers
    });
  }

  if (userIds && userIds.length > 0) {
    await fetch(`${supabaseUrl}/rest/v1/license_activations?created_by=in.(${userIds.join(',')})`, {
      method: 'DELETE',
      headers
    });
  }
}

export async function insertAuditLog(env, targetUserId, adminId, actionType, reason = null) {
  const { supabaseUrl, headers } = getSupabaseConfig(env);
  const payload = {
    target_user_id: targetUserId,
    admin_id: adminId || null,
    action_type: actionType,
    reason: reason
  };

  const resp = await fetch(`${supabaseUrl}/rest/v1/user_audit_logs`, {
    method: 'POST',
    headers: { ...headers, 'Prefer': 'return=minimal' },
    body: JSON.stringify(payload)
  });

  if (!resp.ok) {
    throw new Error(`Failed to insert audit log: ${resp.status} ${await resp.text()}`);
  }
}

export async function checkAdminAuth(request, env, requiredRoles = ['SUPER', 'SUPPORT']) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return { error: 'Unauthorized', status: 401 };

  const token = authHeader.replace('Bearer ', '');
  const { supabaseUrl, headers: serviceHeaders } = getSupabaseConfig(env);

  // Get user via Auth REST API using the user's token
  const userResp = await fetch(`${supabaseUrl}/auth/v1/user`, {
    method: 'GET',
    headers: {
      'apikey': serviceHeaders.apikey,
      'Authorization': `Bearer ${token}`
    }
  });

  if (!userResp.ok) {
    return { error: 'Unauthorized', status: 401 };
  }
  
  const user = await userResp.json();

  // Get admin role via Data REST API
  const adminResp = await fetch(`${supabaseUrl}/rest/v1/admins?user_id=eq.${user.id}&select=admin_role`, {
    method: 'GET',
    headers: serviceHeaders
  });

  const adminRows = await adminResp.json();
  const adminData = adminRows && adminRows.length > 0 ? adminRows[0] : null;

  if (!adminData || !requiredRoles.includes(adminData.admin_role)) {
    return { error: 'Forbidden', status: 403 };
  }

  return { user, adminData };
}

