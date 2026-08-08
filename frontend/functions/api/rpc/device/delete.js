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
    const { p_activation_id } = body;

    if (!p_activation_id) {
      return new Response(JSON.stringify({ success: false, code: 'INVALID_PARAM', message: '기기 접속 ID가 필요합니다.' }), { status: 400, headers: corsHeaders });
    }

    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || 'https://niyvcgvayofdqbebmche.supabase.co';
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const headers = {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Prefer': 'return=representation'
    };

    const delRes = await fetch(`${supabaseUrl}/rest/v1/license_activations?id=eq.${p_activation_id}`, {
      method: 'DELETE',
      headers
    });
    const delData = await delRes.json();

    if (!delRes.ok) {
      return new Response(JSON.stringify({ success: false, code: 'ERROR', message: delData.message || '삭제 실패' }), { status: 200, headers: corsHeaders });
    }

    if (!delData || delData.length === 0) {
      return new Response(JSON.stringify({ success: false, code: 'NOT_FOUND', message: '해당 기기 접속 정보를 찾을 수 없습니다.' }), { status: 200, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ success: true, code: 'SUCCESS', message: '기기가 해제되었습니다.' }), { status: 200, headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, code: 'ERROR', message: error.message }), { status: 500, headers: corsHeaders });
  }
}
