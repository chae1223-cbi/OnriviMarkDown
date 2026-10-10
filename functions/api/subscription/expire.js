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
    const { p_subscription_id, p_user_id } = body;

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

    // 1. 기존 구독 정보 조회 (user_id 확보)
    let targetSub = null;
    const subRes = await fetch(`${supabaseUrl}/rest/v1/subscriptions?id=eq.${p_subscription_id}&select=*&limit=1`, { headers: { ...headers, 'Prefer': '' } });
    if (subRes.ok) {
      const subRows = await subRes.json();
      if (subRows && subRows.length > 0) {
        targetSub = subRows[0];
      }
    }

    const userId = p_user_id || targetSub?.user_id;

    // 2. 대상 구독 EXPIRED 처리
    const updateRes = await fetch(`${supabaseUrl}/rest/v1/subscriptions?id=eq.${p_subscription_id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        plan_status: 'EXPIRED',
        is_active: false,
        canceled_at: now,
        updated_at: now
      })
    });

    if (!updateRes.ok) {
      const errData = await updateRes.json();
      return new Response(JSON.stringify({ success: false, code: 'ERROR', message: errData.message || '만료 처리 오류' }), { status: 500, headers: corsHeaders });
    }

    // 3. 해당 구독의 기기 세션 비활성화 (삭제 대신 UPDATE로 Realtime 세션 유지 및 제한 사용자 전환)
    await fetch(`${supabaseUrl}/rest/v1/license_activations?subscription_id=eq.${p_subscription_id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        is_active: false,
        updated_at: now
      })
    });

    if (!userId) {
      return new Response(JSON.stringify({ success: true, code: 'SUCCESS', message: '구독이 만료 처리되었습니다.' }), { status: 200, headers: corsHeaders });
    }

    // 4. 사용자의 다른 활성 유료 요금제 또는 READER 존재 여부 확인
    const activeSubRes = await fetch(`${supabaseUrl}/rest/v1/subscriptions?user_id=eq.${userId}&is_active=eq.true&plan_status=in.(ACTIVE,FREE)&select=id,payment_no,plan_name&order=created_at.desc&limit=1`, { headers: { ...headers, 'Prefer': '' } });
    const activeSubs = await activeSubRes.json();

    let newSubId = null;
    let newPaymentNo = null;

    if (activeSubRes.ok && Array.isArray(activeSubs) && activeSubs.length > 0) {
      newSubId = activeSubs[0].id;
      newPaymentNo = activeSubs[0].payment_no;
    } else {
      // 5. 유료 요금제가 없는 경우 평생 무료 읽기 전용(READER) 플랜 자동 신규 생성 및 발급
      const readerPaymentNo = 'READER-' + Date.now();
      const readerLicenseKey = 'READER-' + Math.random().toString(36).substring(2, 15).toUpperCase();
      const readerVerifyKey = Math.random().toString(36).substring(2, 15).toUpperCase();

      const insertReaderRes = await fetch(`${supabaseUrl}/rest/v1/subscriptions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          user_id: userId,
          plan_name: 'READER',
          plan_status: 'ACTIVE',
          billing_cycle: 'FREE',
          is_active: true,
          max_devices: 1,
          price_amount: 0,
          current_period_start: now,
          current_period_end: '9999-12-31T23:59:59.000Z',
          payment_no: readerPaymentNo,
          license_key: readerLicenseKey,
          verify_key: readerVerifyKey
        })
      });

      const newReader = await insertReaderRes.json();
      if (insertReaderRes.ok && Array.isArray(newReader) && newReader.length > 0) {
        newSubId = newReader[0].id;
        newPaymentNo = newReader[0].payment_no;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      code: 'SUCCESS',
      message: '구독 만료 처리 및 READER 요금제 자동 전환이 완료되었습니다.',
      new_subscription_id: newSubId,
      new_payment_no: newPaymentNo
    }), { status: 200, headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, code: 'ERROR', message: error.message }), { status: 500, headers: corsHeaders });
  }
}
