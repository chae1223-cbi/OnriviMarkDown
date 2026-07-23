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
    const { p_user_id, p_device_uuid, p_device_name } = body;

    if (!p_user_id || !p_device_uuid) {
      return new Response(JSON.stringify({ success: false, message: '필수 파라미터가 누락되었습니다.' }), { status: 400, headers: corsHeaders });
    }

    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || 'https://niyvcgvayofdqbebmche.supabase.co';
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const headers = {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/subscribe_desktop_plan`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        p_user_id,
        p_device_uuid,
        p_device_name: p_device_name || 'Desktop App'
      })
    });

    const data = await rpcRes.json();

    if (!rpcRes.ok) {
      return new Response(JSON.stringify({ success: false, message: data.message || 'RPC 오류' }), { status: 500, headers: corsHeaders });
    }

    return new Response(JSON.stringify(data || { success: false, message: '응답 없음' }), { status: 200, headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500, headers: corsHeaders });
  }
}
