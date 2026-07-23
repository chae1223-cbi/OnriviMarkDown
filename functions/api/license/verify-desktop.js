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
    const { p_email, p_device_uuid } = body;

    if (!p_email || !p_device_uuid) {
      return new Response(JSON.stringify({ success: false, code: 'MISSING_PARAM', message: '필수 파라미터가 누락되었습니다.' }), { status: 400, headers: corsHeaders });
    }

    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || 'https://niyvcgvayofdqbebmche.supabase.co';
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const headers = {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // 1. 유저 확인
    const userRes = await fetch(`${supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent(p_email)}&select=id&limit=1`, { headers });
    const userRows = await userRes.json();
    if (!userRows || userRows.length === 0) {
      return new Response(JSON.stringify({ success: false, code: 'NOT_FOUND', message: 'User not found.' }), { status: 200, headers: corsHeaders });
    }
    const userId = userRows[0].id;

    // 2. 데스크탑 활성 구독 확인
    // postgREST에서 like '%데스크탑%' 은 ilike.*데스크탑* 로 표현
    const subRes = await fetch(`${supabaseUrl}/rest/v1/subscriptions?user_id=eq.${userId}&plan_status=in.(ACTIVE,FREE,active,free)&plan_name=ilike.*Elite Pro*&order=current_period_end.desc&select=*&limit=1`, { headers });
    const subRows = await subRes.json();
    if (!subRows || subRows.length === 0) {
      return new Response(JSON.stringify({ success: false, code: 'NO_PLAN', message: 'No active desktop subscription.' }), { status: 200, headers: corsHeaders });
    }
    const sub = subRows[0];

    // 3. 라이선스 키 확인
    const licRes = await fetch(`${supabaseUrl}/rest/v1/software_licenses?subscription_id=eq.${sub.id}&select=*&limit=1`, { headers });
    const licRows = await licRes.json();
    if (!licRows || licRows.length === 0) {
      return new Response(JSON.stringify({ success: false, code: 'NO_LICENSE', message: 'No license found for subscription.' }), { status: 200, headers: corsHeaders });
    }
    const lic = licRows[0];

    // 4. 기기 세션 갱신 또는 생성
    // (insert.js의 로직과 유사하지만 데스크탑 전용이므로 데스크탑용 처리를 함)
    // 원래 RPC에서는 무조건 upsert 후 rank를 계산함.
    // 여기서는 간단히 is_active 처리를 함.
    const actCheckRes = await fetch(`${supabaseUrl}/rest/v1/license_activations?subscription_id=eq.${sub.id}&device_uuid=eq.${p_device_uuid}&select=id,is_active`, { headers });
    const actCheckRows = await actCheckRes.json();

    let sessionActive = true;
    let rank = 1;

    // 만약 세션이 없다면 추가 (is_active 여부는 초과 시 false)
    if (!actCheckRows || actCheckRows.length === 0) {
      const activeCountRes = await fetch(`${supabaseUrl}/rest/v1/license_activations?subscription_id=eq.${sub.id}&is_active=eq.true&select=id`, { headers });
      const activeCountRows = await activeCountRes.json();
      if (activeCountRows && activeCountRows.length >= sub.max_devices) {
        sessionActive = false;
      }
      
      await fetch(`${supabaseUrl}/rest/v1/license_activations`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          subscription_id: sub.id,
          device_uuid: p_device_uuid,
          device_name: 'Desktop App',
          is_active: sessionActive,
          activated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: userId
        })
      });
      // 임시 랭크
      rank = activeCountRows ? activeCountRows.length + 1 : 1;
    } else {
      sessionActive = actCheckRows[0].is_active;
      // PATCH 업데이트
      await fetch(`${supabaseUrl}/rest/v1/license_activations?subscription_id=eq.${sub.id}&device_uuid=eq.${p_device_uuid}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ updated_at: new Date().toISOString() })
      });
    }

    if (!sessionActive) {
      return new Response(JSON.stringify({
        success: false, code: 'ERR_MAX_DEVICES_EXCEEDED', message: '동시 접속 가능 기기 수를 초과했습니다. 제한 사용자로 접근합니다.',
        max_devices: sub.max_devices, verify_key: lic.verify_key, payment_no: lic.payment_no, license_key: lic.license_key, plan_name: sub.plan_name, next_payment_date: sub.current_period_end, rank
      }), { status: 200, headers: corsHeaders });
    }

    return new Response(JSON.stringify({
      success: true, code: 'SUCCESS', message: 'Desktop activated.',
      verify_key: lic.verify_key, payment_no: lic.payment_no, license_key: lic.license_key, plan_name: sub.plan_name, next_payment_date: sub.current_period_end, rank
    }), { status: 200, headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, code: 'ERROR', message: err.message }), { status: 500, headers: corsHeaders });
  }
}
