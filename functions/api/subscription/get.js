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
    let { user_id: userId } = await request.json();

    if (!userId) {
      return new Response(JSON.stringify({ success: false, message: 'user_id 파라미터가 필요합니다.' }), { status: 400, headers: corsHeaders });
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

    // 0. UUID 검증 및 Email -> UUID 변환
    const isValidUUID = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isValidUUID(userId)) {
      const uRes = await fetch(`${supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent(userId)}&select=id&limit=1`, { headers });
      const uData = await uRes.json();
      if (uRes.ok && uData && uData.length > 0) {
        userId = uData[0].id;
      } else {
        return new Response(JSON.stringify({ success: false, message: '해당 이메일의 사용자를 찾을 수 없습니다.' }), { status: 404, headers: corsHeaders });
      }
    }

    const nowIso = new Date().toISOString();

    // 1. 만료된 구독 자동 EXPIRED 처리
    await fetch(`${supabaseUrl}/rest/v1/subscriptions?user_id=eq.${userId}&current_period_end=lt.${nowIso}&plan_status=neq.EXPIRED`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ plan_status: 'EXPIRED', is_active: false, updated_at: nowIso })
    });

    // 2. Fetch subscriptions & common_codes
    const [subRes, codeRes] = await Promise.all([
      fetch(`${supabaseUrl}/rest/v1/subscriptions?user_id=eq.${userId}&order=created_at.desc`, { headers: { ...headers, 'Prefer': '' } }),
      fetch(`${supabaseUrl}/rest/v1/common_codes?group_code=in.(PLAN_NAME,BILLING_CYCLE,PLAN_STATUS)`, { headers: { ...headers, 'Prefer': '' } })
    ]);
    
    let rawSubs = await subRes.json();
    const codes = await codeRes.json();
    
    // 3. 신규 유저(구독 없음) 자동 READER 발급
    if (!subRes.ok || !rawSubs || rawSubs.length === 0) {
      const readerPaymentNo = 'READER-' + Date.now();
      const readerLicenseKey = 'READER-' + Math.random().toString(36).substring(2, 15);
      
      const insertRes = await fetch(`${supabaseUrl}/rest/v1/subscriptions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          user_id: userId,
          plan_name: 'READER',
          plan_status: 'ACTIVE',
          is_active: true,
          max_devices: 1,
          current_period_start: nowIso,
          current_period_end: '9999-12-31T23:59:59.000Z',
          payment_no: readerPaymentNo,
          license_key: readerLicenseKey
        })
      });
      
      const newReader = await insertRes.json();
      if (insertRes.ok && newReader && newReader.length > 0) {
        rawSubs = [newReader[0]];
      } else {
        return new Response(JSON.stringify({ success: false, message: 'READER 요금제 자동 발급에 실패했습니다.' }), { status: 500, headers: corsHeaders });
      }
    }

    const getCodeName = (groupCode, codeValue, fallback) => {
      if (!codes || !Array.isArray(codes)) return fallback;
      const match = codes.find(c => c.group_code === groupCode && (c.code_value || '').toUpperCase() === (codeValue || '').toUpperCase());
      return match ? match.code_name : fallback;
    };

    const allSubs = rawSubs.map(s => ({
      ...s,
      plan_name_kr: getCodeName('PLAN_NAME', s.plan_name, s.plan_name),
      billing_cycle_kr: getCodeName('BILLING_CYCLE', s.billing_cycle, s.billing_cycle),
      plan_status_kr: getCodeName('PLAN_STATUS', s.plan_status, s.plan_status)
    }));

    // 4. Find active sub
    const activeSub = allSubs.find(s => (s.is_active && (s.plan_status || '').toUpperCase() === 'ACTIVE') || (s.plan_status || '').toUpperCase() === 'FREE');
    const latestSub = activeSub || allSubs[0];

    // 5. Fetch license_activations
    const activeSubIds = allSubs
      .filter(s => (s.plan_status || '').toUpperCase() === 'ACTIVE' || (s.plan_status || '').toUpperCase() === 'FREE')
      .map(s => s.id);
    const validSubIds = activeSubIds.length > 0 ? activeSubIds : (latestSub ? [latestSub.id] : []);

    let activations = [];
    if (validSubIds.length > 0) {
      const actRes = await fetch(`${supabaseUrl}/rest/v1/license_activations?subscription_id=in.(${validSubIds.join(',')})&order=activated_at.desc`, { headers: { ...headers, 'Prefer': '' } });
      const actData = await actRes.json();
      if (actRes.ok && Array.isArray(actData)) {
        activations = actData.map(a => ({
          ...a,
          license_id: a.subscription_id
        }));
      }
    }

    const mappedDevices = activations.map(device => {
      const matchedSub = allSubs.find(s => s.id === device.license_id);
      return {
        ...device,
        payment_no: matchedSub ? matchedSub.payment_no : '',
        is_active_license: latestSub ? matchedSub?.id === latestSub.id : false
      };
    });

    return new Response(JSON.stringify({
      success: true,
      subscription: latestSub ? {
        ...latestSub,
        active_device_count: mappedDevices.length || 1
      } : null,
      historyList: allSubs,
      license: latestSub ? {
        id: latestSub.id,
        license_key: latestSub.license_key || '',
        verify_key: latestSub.verify_key || '',
        payment_no: latestSub.payment_no || ''
      } : null,
      devices: mappedDevices
    }), { status: 200, headers: corsHeaders });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500, headers: corsHeaders });
  }
}
