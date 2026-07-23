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
    const {
      p_user_id,
      p_plan_name,
      p_plan_status,
      p_billing_interval,
      p_max_devices,
      p_period_end,
      p_device_uuid,
      p_device_name,
    } = body;

    if (!p_user_id || !p_plan_name || !p_device_uuid) {
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

    // 1. 무료 요금제 재가입 방지
    if (p_plan_name === 'APPRENTICE' || p_plan_name === 'FREE') {
      const pastRes = await fetch(`${supabaseUrl}/rest/v1/subscriptions?user_id=eq.${p_user_id}&select=id&limit=1`, { headers });
      const pastSubs = await pastRes.json();
      if (pastSubs && pastSubs.length > 0) {
        return new Response(JSON.stringify({ success: false, code: 'ERROR', message: '이미 구독 신청 및 이용 이력이 존재하는 계정이므로 무료 체험 재가입이 불가능합니다. 유료 요금제를 선택해 주세요.' }), { status: 500, headers: corsHeaders });
      }
    }

    const now = new Date().toISOString();

    // 2. 기존 구독 만료 처리
    await fetch(`${supabaseUrl}/rest/v1/subscriptions?user_id=eq.${p_user_id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        plan_status: 'EXPIRED',
        is_active: false,
        updated_at: now
      })
    });

    // 3. 신규 구독 생성
    const subId = crypto.randomUUID();
    let periodEndTs;
    if (p_period_end && p_period_end.includes('-')) {
      periodEndTs = new Date(p_period_end).toISOString();
    } else if (p_period_end && p_period_end.length >= 8) {
      periodEndTs = `${p_period_end.substring(0, 4)}-${p_period_end.substring(4, 6)}-${p_period_end.substring(6, 8)}T23:59:59Z`;
    } else {
      periodEndTs = new Date(Date.now() + 30 * 86400000).toISOString();
    }

    const licenseKey = generateHex(8);
    const verifyKey = generateHex(8);
    const paymentNo = `PAY-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${generateHex(4)}`;
    
    const isActive = p_plan_status === 'ACTIVE' || p_plan_status === 'FREE';
    const billingCycle = p_billing_interval ? p_billing_interval.toUpperCase() : 'MONTHLY';

    const insertSubRes = await fetch(`${supabaseUrl}/rest/v1/subscriptions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        id: subId,
        created_by: p_user_id,
        updated_by: p_user_id,
        user_id: p_user_id,
        plan_name: p_plan_name,
        plan_status: p_plan_status,
        billing_cycle: billingCycle,
        license_key: licenseKey,
        verify_key: verifyKey,
        payment_no: paymentNo,
        max_devices: p_max_devices,
        current_period_start: now,
        current_period_end: periodEndTs,
        is_active: isActive,
        created_at: now,
        updated_at: now
      })
    });

    if (!insertSubRes.ok) {
      const err = await insertSubRes.json();
      return new Response(JSON.stringify({ success: false, code: 'ERROR', message: err.message || '구독 생성 실패' }), { status: 500, headers: corsHeaders });
    }

    // 4. 기기 활성화
    await fetch(`${supabaseUrl}/rest/v1/license_activations`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        subscription_id: subId,
        device_uuid: p_device_uuid,
        device_name: p_device_name,
        activated_at: now
      })
    });

    return new Response(JSON.stringify({
      success: true,
      code: 'SUCCESS',
      message: '플랜이 활성화되었습니다.',
      license_key: licenseKey,
      verify_key: verifyKey,
      payment_no: paymentNo,
      subscription_id: subId,
      license_id: subId,
    }), { status: 200, headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, code: 'ERROR', message: error.message }), { status: 500, headers: corsHeaders });
  }
}
