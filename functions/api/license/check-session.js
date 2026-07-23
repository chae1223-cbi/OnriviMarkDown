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
    const { p_payment_no, p_device_uuid } = body;

    if (!p_payment_no || !p_device_uuid) {
      return new Response(JSON.stringify({ success: false, has_session: false, message: '필수 파라미터가 누락되었습니다.' }), { status: 400, headers: corsHeaders });
    }

    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || 'https://niyvcgvayofdqbebmche.supabase.co';
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const headers = {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // 1. payment_no → subscriptions → license_id 조회
    const subRes = await fetch(`${supabaseUrl}/rest/v1/subscriptions?payment_no=eq.${encodeURIComponent(p_payment_no)}&is_active=eq.true&plan_status=in.(ACTIVE,FREE,active,free)&select=id,max_devices,user_id&limit=1`, { headers });
    const subRows = await subRes.json();

    if (!subRows || subRows.length === 0) {
      return new Response(JSON.stringify({ success: true, has_session: false, max_devices: 0 }), { status: 200, headers: corsHeaders });
    }

    const licenseId = subRows[0].id;
    const max_devices = subRows[0].max_devices;
    const userId = subRows[0].user_id;

    // 2. license_activations에서 해당 device_uuid 세션 존재 여부 확인
    const actRes = await fetch(`${supabaseUrl}/rest/v1/license_activations?subscription_id=eq.${licenseId}&device_uuid=eq.${p_device_uuid}&select=id,is_active&limit=1`, { headers });
    const actRows = await actRes.json();

    const sessionExists = actRows && actRows.length > 0;
    let isActiveSession = sessionExists && actRows[0].is_active;
    let promoted = false;

    // 3. Auto-promote if restricted but capacity available
    if (sessionExists && !isActiveSession && max_devices > 0) {
      const countRes = await fetch(`${supabaseUrl}/rest/v1/license_activations?subscription_id=eq.${licenseId}&is_active=eq.true&select=id`, { headers });
      const activeRows = await countRes.json();
      if (activeRows && activeRows.length < max_devices) {
        isActiveSession = true;
        promoted = true;
      }
    }

    // 4. updated_at 갱신 (하트비트) 및 필요시 is_active 승급
    if (sessionExists) {
      const patchBody = { updated_at: new Date().toISOString(), updated_by: userId };
      if (promoted) patchBody.is_active = true;
      
      await fetch(`${supabaseUrl}/rest/v1/license_activations?subscription_id=eq.${licenseId}&device_uuid=eq.${p_device_uuid}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(patchBody)
      });
    }

    return new Response(JSON.stringify({
      success: true,
      has_session: isActiveSession,
      is_restricted: sessionExists && !isActiveSession,
      max_devices: max_devices || 1
    }), { status: 200, headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, code: 'ERROR', message: err.message }), { status: 500, headers: corsHeaders });
  }
}
