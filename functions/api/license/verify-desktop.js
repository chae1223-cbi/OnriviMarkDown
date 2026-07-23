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

    // 2. 데스크탑 활성 구독 확인 (ELITEPRO 요금제 필터링 버그 수정)
    // plan_name.eq.ELITEPRO 조건을 사용하여 띄어쓰기 없이 정확히 일치하는 요금제 찾기
    const subRes = await fetch(`${supabaseUrl}/rest/v1/subscriptions?user_id=eq.${userId}&plan_status=in.(ACTIVE,FREE,active,free)&or=(plan_name.eq.ELITEPRO,plan_name.ilike.*데스크탑*)&order=current_period_end.desc&select=*&limit=1`, { headers });
    const subRows = await subRes.json();
    if (!subRows || subRows.length === 0) {
      return new Response(JSON.stringify({ success: false, code: 'NO_PLAN', message: 'No active desktop subscription.' }), { status: 200, headers: corsHeaders });
    }
    const sub = subRows[0];

    // 3. 라이선스 키 확인
    if (!sub.license_key) {
      return new Response(JSON.stringify({ success: false, code: 'NO_LICENSE', message: 'No license found for subscription.' }), { status: 200, headers: corsHeaders });
    }

    // 4. 기기 검증
    const maxDevices = sub.max_devices || 1;
    const deviceRes = await fetch(`${supabaseUrl}/rest/v1/license_activations?subscription_id=eq.${sub.id}&select=device_uuid,device_name,activated_at`, { headers });
    const deviceRows = await deviceRes.json();
    const currentDevices = deviceRows || [];

    // 동일 기기가 이미 활성화되어 있는지 확인
    const existingDevice = currentDevices.find(d => d.device_uuid === p_device_uuid);

    if (existingDevice) {
      return new Response(JSON.stringify({
        success: true,
        code: 'SUCCESS',
        message: 'Subscription is active and device is verified.',
        subscription_id: sub.id,
        license_id: sub.id,
        device_uuid: p_device_uuid,
        max_devices: maxDevices, verify_key: sub.verify_key, payment_no: sub.payment_no, license_key: sub.license_key, plan_name: sub.plan_name, next_payment_date: sub.current_period_end, rank: 1
      }), { status: 200, headers: corsHeaders });
    }

    if (currentDevices.length >= maxDevices) {
      return new Response(JSON.stringify({
        success: false,
        code: 'ERR_MAX_DEVICES_EXCEEDED',
        message: 'Maximum number of devices exceeded.',
        max_devices: maxDevices,
        current_devices: currentDevices.length,
        verify_key: sub.verify_key, payment_no: sub.payment_no, license_key: sub.license_key, plan_name: sub.plan_name, next_payment_date: sub.current_period_end, rank: 1
      }), { status: 200, headers: corsHeaders });
    }

    // 5. 새 기기 추가
    await fetch(`${supabaseUrl}/rest/v1/license_activations`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        subscription_id: sub.id,
        device_uuid: p_device_uuid,
        activated_at: new Date().toISOString(),
        is_active: true,
        created_by: userId,
        updated_by: userId
      })
    });

    return new Response(JSON.stringify({
      success: true,
      code: 'SUCCESS',
      message: 'Subscription is active and new device registered.',
      subscription_id: sub.id,
      license_id: sub.id,
      device_uuid: p_device_uuid,
      max_devices: maxDevices, verify_key: sub.verify_key, payment_no: sub.payment_no, license_key: sub.license_key, plan_name: sub.plan_name, next_payment_date: sub.current_period_end, rank: 1
    }), { status: 200, headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, code: 'ERROR', message: err.message }), { status: 500, headers: corsHeaders });
  }
}
