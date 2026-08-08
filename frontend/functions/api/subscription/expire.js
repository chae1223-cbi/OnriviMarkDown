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
    const { p_subscription_id } = body;

    if (!p_subscription_id) {
      return new Response(JSON.stringify({ success: false, code: 'INVALID_PARAMS', message: '필수 파라미터가 누락되었습니다.' }), { status: 400, headers: corsHeaders });
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

    const now = new Date().toISOString();

    const updateRes = await fetch(`${supabaseUrl}/rest/v1/subscriptions?id=eq.${p_subscription_id}&is_active=eq.true`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        plan_status: 'EXPIRED',
        is_active: false,
        canceled_at: now,
        updated_at: now
      })
    });

    const updatedSub = await updateRes.json();

    if (!updateRes.ok) {
      return new Response(JSON.stringify({ success: false, code: 'ERROR', message: updatedSub.message || '만료 처리 오류' }), { status: 500, headers: corsHeaders });
    }

    if (!updatedSub || updatedSub.length === 0) {
      return new Response(JSON.stringify({ success: false, code: 'NOT_FOUND', message: '만료 처리할 구독을 찾을 수 없거나 이미 만료되었습니다.' }), { status: 200, headers: corsHeaders });
    }

    const delRes = await fetch(`${supabaseUrl}/rest/v1/license_activations?subscription_id=eq.${p_subscription_id}`, {
      method: 'DELETE',
      headers
    });

    if (!delRes.ok) {
      // 🚨 기기 정보 삭제 실패 시, 구독 상태 원상 복구(롤백)
      await fetch(`${supabaseUrl}/rest/v1/subscriptions?id=eq.${p_subscription_id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          plan_status: 'ACTIVE',
          is_active: true,
          canceled_at: null,
          updated_at: now
        })
      });
      const delErr = await delRes.json();
      return new Response(JSON.stringify({ success: false, code: 'ERROR', message: '기기 해제 중 오류가 발생하여 만료 처리가 롤백되었습니다. ' + (delErr.message || '') }), { status: 500, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ success: true, code: 'SUCCESS', message: '구독 만료 처리가 완료되었습니다.' }), { status: 200, headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, code: 'ERROR', message: error.message }), { status: 500, headers: corsHeaders });
  }
}
