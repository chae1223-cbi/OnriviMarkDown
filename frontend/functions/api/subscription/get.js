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
    const { user_id: userId } = await request.json();

    if (!userId) {
      return new Response(JSON.stringify({ success: false, message: 'user_id 파라미터가 필요합니다.' }), { status: 400, headers: corsHeaders });
    }

    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || 'https://niyvcgvayofdqbebmche.supabase.co';
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const headers = {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // 1. Fetch subscriptions
    const subRes = await fetch(`${supabaseUrl}/rest/v1/subscriptions?user_id=eq.${userId}&order=created_at.desc`, { headers });
    const rawSubs = await subRes.json();

    if (!subRes.ok || !rawSubs || rawSubs.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        subscription: null,
        historyList: [],
        license: null,
        devices: []
      }), { status: 200, headers: corsHeaders });
    }

    // 2. Fetch common_codes for mapping
    const codeRes = await fetch(`${supabaseUrl}/rest/v1/common_codes?group_code=in.(PLAN_NAME,BILLING_CYCLE,PLAN_STATUS)`, { headers });
    const codes = await codeRes.json();
    
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

    // 3. Find active sub
    const activeSub = allSubs.find(s => s.is_active && (s.plan_status || '').toUpperCase() === 'ACTIVE') || allSubs[0];
    const latestSub = (activeSub && activeSub.is_active && (activeSub.plan_status || '').toUpperCase() === 'ACTIVE') ? activeSub : null;

    // 4. Fetch license_activations
    const subIds = allSubs.map(s => s.id);
    let activations = [];
    if (subIds.length > 0) {
      // Split into chunks if too many, but typically < 50
      const actRes = await fetch(`${supabaseUrl}/rest/v1/license_activations?subscription_id=in.(${subIds.join(',')})&order=activated_at.desc`, { headers });
      const actData = await actRes.json();
      if (actRes.ok && Array.isArray(actData)) {
        activations = actData;
      }
    }

    const mappedDevices = activations.map(device => {
      const matchedSub = allSubs.find(s => s.id === device.subscription_id);
      return {
        id: device.id,
        license_id: device.subscription_id,
        device_uuid: device.device_uuid,
        device_name: device.device_name,
        activated_at: device.activated_at,
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
      devices: mappedDevices,
      historyList: allSubs,
      license: latestSub ? {
        id: latestSub.id,
        license_key: latestSub.license_key || '',
        verify_key: latestSub.verify_key || '',
        payment_no: latestSub.payment_no || ''
      } : null
    }), { status: 200, headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500, headers: corsHeaders });
  }
}
