export async function onRequestOptions() {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
  };
  return new Response(null, { headers: corsHeaders });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
    'Content-Type': 'application/json'
  };

  try {
    const body = await request.json();
    const { p_user_id } = body;

    if (!p_user_id) {
      return new Response(JSON.stringify({ success: false, message: 'p_user_id가 필요합니다.' }), { status: 400, headers: corsHeaders });
    }

    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || 'https://niyvcgvayofdqbebmche.supabase.co';
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const headers = {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    const now = new Date().toISOString();

    // 1. Get user subscriptions
    const subRes = await fetch(`${supabaseUrl}/rest/v1/subscriptions?user_id=eq.${p_user_id}&select=id`, { headers });
    const subRows = await subRes.json();

    if (subRes.ok && subRows && subRows.length > 0) {
      const subIds = subRows.map(r => r.id).join(',');
      // Delete license_activations
      await fetch(`${supabaseUrl}/rest/v1/license_activations?subscription_id=in.(${subIds})`, {
        method: 'DELETE',
        headers
      });
    }

    // 2. Update subscriptions
    await fetch(`${supabaseUrl}/rest/v1/subscriptions?user_id=eq.${p_user_id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ is_active: false, plan_status: 'CANCELED', updated_at: now })
    });

    // 3. Update users (Soft delete)
    await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${p_user_id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ is_deleted: true, deleted_at: now, updated_at: now })
    });

    return new Response(JSON.stringify({ success: true, code: 'SUCCESS', message: '회원 탈퇴가 성공적으로 처리되었습니다.' }), { status: 200, headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, code: 'ERROR', message: error.message }), { status: 500, headers: corsHeaders });
  }
}
