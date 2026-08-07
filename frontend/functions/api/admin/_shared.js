import { createClient } from '@supabase/supabase-js';

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

// Supabase Admin Client Initializer
export function getSupabaseAdmin(env) {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase admin credentials are missing in environment variables.');
  }

  // createClient inside edge environment
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Executes a raw DB operation by calling a Supabase REST API
export async function executeDeleteActivations(supabaseAdmin, subscriptionIds, userIds, deviceId) {
  // Note: RLS is bypassed because we are using Service Role Key
  if (deviceId) {
     const { error } = await supabaseAdmin.from('license_activations').delete().eq('id', deviceId);
     if (error) throw error;
  }
  
  if (subscriptionIds && subscriptionIds.length > 0) {
     const { error } = await supabaseAdmin.from('license_activations').delete().in('subscription_id', subscriptionIds);
     if (error) throw error;
  }

  if (userIds && userIds.length > 0) {
     const { error } = await supabaseAdmin.from('license_activations').delete().in('created_by', userIds);
     if (error) throw error;
  }
}

export async function insertAuditLog(supabaseAdmin, targetUserId, adminId, actionType, reason = null) {
  const { error } = await supabaseAdmin.from('user_audit_logs').insert({
    target_user_id: targetUserId,
    admin_id: adminId || null,
    action_type: actionType,
    reason: reason
  });
  if (error) throw error;
}

export async function checkAdminAuth(request, supabaseAdmin, requiredRoles = ['SUPER', 'SUPPORT']) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return { error: 'Unauthorized', status: 401 };

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  
  if (authError || !user) return { error: 'Unauthorized', status: 401 };

  const { data: adminData } = await supabaseAdmin
    .from('admins')
    .select('admin_role')
    .eq('user_id', user.id)
    .single();

  if (!adminData || !requiredRoles.includes(adminData.admin_role)) {
    return { error: 'Forbidden', status: 403 };
  }

  return { user, adminData };
}

