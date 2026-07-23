export async function onRequestOptions() {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
  };
  return new Response(null, { headers: corsHeaders });
}

function generateHex(size) {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
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
      'Accept': 'application/json',
      'Prefer': 'return=representation'
    };

    const now = new Date().toISOString();
    const periodEndTs = new Date(Date.now() + 365 * 86400000).toISOString();

    const subId = crypto.randomUUID();
    const licenseKey = `OMD-${generateHex(4)}-${generateHex(4)}`;
    const verifyKey = generateHex(8);
    const paymentNo = `PAY-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${generateHex(4)}`;

    // ==========================================
    // 💡 소프트 롤백 (Saga 패턴) 기반 API 호출
    // ==========================================

    // [STEP 1] 신규 구독 생성
    const insertSubRes = await fetch(`${supabaseUrl}/rest/v1/subscriptions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        id: subId,
        created_by: p_user_id,
        updated_by: p_user_id,
        user_id: p_user_id,
        plan_name: '데스크탑 에디터 (연간)',
        plan_status: 'ACTIVE',
        billing_cycle: 'YEARLY',
        license_key: licenseKey,
        verify_key: verifyKey,
        payment_no: paymentNo,
        max_devices: 2,
        current_period_start: now,
        current_period_end: periodEndTs,
        is_active: true,
        created_at: now,
        updated_at: now
      })
    });

    if (!insertSubRes.ok) {
      const err = await insertSubRes.json();
      return new Response(JSON.stringify({ success: false, message: err.message || '구독 생성 실패' }), { status: 500, headers: corsHeaders });
    }

    // [STEP 2] 기기 활성화
    const insertDeviceRes = await fetch(`${supabaseUrl}/rest/v1/license_activations`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        subscription_id: subId,
        device_uuid: p_device_uuid,
        device_name: p_device_name || 'Desktop App',
        activated_at: now
      })
    });

    if (!insertDeviceRes.ok) {
      // 🚨 기기 등록 실패 시: [STEP 1]에서 만든 구독을 수동 롤백(DELETE)
      await fetch(`${supabaseUrl}/rest/v1/subscriptions?id=eq.${subId}`, { method: 'DELETE', headers });
      const err = await insertDeviceRes.json();
      return new Response(JSON.stringify({ success: false, message: '기기 등록 실패로 구독이 롤백되었습니다. ' + err.message }), { status: 500, headers: corsHeaders });
    }

    // [STEP 3] 기존 구독 만료 처리 (방금 만든 subId는 제외)
    const expireRes = await fetch(`${supabaseUrl}/rest/v1/subscriptions?user_id=eq.${p_user_id}&id=neq.${subId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        plan_status: 'EXPIRED',
        is_active: false,
        updated_at: now
      })
    });

    if (!expireRes.ok) {
      // 🚨 기존 구독 만료 실패 시: [STEP 1, 2] 모두 수동 롤백
      await fetch(`${supabaseUrl}/rest/v1/license_activations?subscription_id=eq.${subId}`, { method: 'DELETE', headers });
      await fetch(`${supabaseUrl}/rest/v1/subscriptions?id=eq.${subId}`, { method: 'DELETE', headers });
      return new Response(JSON.stringify({ success: false, message: '이전 구독 만료 처리 중 오류가 발생하여 롤백되었습니다.' }), { status: 500, headers: corsHeaders });
    }

    // 모든 작업 성공!
    return new Response(JSON.stringify({
      success: true,
      message: '데스크탑 구독이 활성화되었습니다.',
      license_key: licenseKey,
      verify_key: verifyKey,
      payment_no: paymentNo,
      subscription_id: subId,
    }), { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('[/api/subscription/subscribe-desktop] Request Error:', error);
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500, headers: corsHeaders });
  }
}
