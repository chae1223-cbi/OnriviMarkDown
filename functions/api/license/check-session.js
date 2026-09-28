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

    // 1. payment_no -> subscriptions -> license_id 조회
    // 🚨 @PATCH: FREE 요금제는 DB 비즈니스 로직상 is_active=false 로 저장되므로 URL 쿼리에서 is_active=eq.true 조건을 제거하고 JS에서 검증합니다.
    const subRes = await fetch(`${supabaseUrl}/rest/v1/subscriptions?payment_no=eq.${encodeURIComponent(p_payment_no)}&select=id,user_id,is_active,plan_name,plan_status,current_period_end&limit=1`, { headers });
    if (!subRes.ok) throw new Error('구독 조회에 실패했습니다.');
    const subRows = await subRes.json();

    if (!subRows || subRows.length === 0) {
      return new Response(JSON.stringify({ success: true, has_session: false, is_terminated: true, max_devices: 0 }), { status: 200, headers: corsHeaders });
    }

    const sub = subRows[0];
    const licenseId = sub.id;
    const userId = sub.user_id;
    const eligible = String(sub.plan_name).toUpperCase() !== 'READER' &&
      ['ACTIVE', 'FREE'].includes(String(sub.plan_status).toUpperCase()) &&
      (sub.is_active === true || String(sub.plan_status).toUpperCase() === 'FREE') &&
      (!sub.current_period_end || new Date(sub.current_period_end).getTime() > Date.now());

    // 2. license_activations에서 해당 device_uuid 세션 존재 여부 확인
    const actRes = await fetch(`${supabaseUrl}/rest/v1/license_activations?subscription_id=eq.${licenseId}&device_uuid=eq.${p_device_uuid}&select=id,is_active,device_name&limit=1`, { headers });
    const actRows = await actRes.json();

    if (!actRes.ok) throw new Error('세션 조회에 실패했습니다.');
    const sessionExists = Array.isArray(actRows) && actRows.length > 0;
    const isWebSession = sessionExists && ['web saas', 'web browser'].includes(String(actRows[0].device_name || '').trim().toLowerCase());
    const isActiveSession = eligible && sessionExists && actRows[0].is_active === true &&
      (!isWebSession || String(sub.plan_name).toUpperCase() !== 'DESKTOP_ONLY');

    // 하트비트는 제한 세션을 자동 승격하지 않는다. 등록 API만 편집 좌석을 판정한다.
    if (sessionExists) {
      const patchBody = { updated_at: new Date().toISOString(), updated_by: userId };
      if (!eligible || (isWebSession && String(sub.plan_name).toUpperCase() === 'DESKTOP_ONLY')) patchBody.is_active = false;
      const heartbeat = await fetch(`${supabaseUrl}/rest/v1/license_activations?subscription_id=eq.${licenseId}&device_uuid=eq.${p_device_uuid}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(patchBody)
      });
      if (!heartbeat.ok) throw new Error('세션 갱신에 실패했습니다.');
    }

    return new Response(JSON.stringify({
      success: true,
      has_session: isActiveSession,
      is_restricted: sessionExists && !isActiveSession,
      is_terminated: !sessionExists,
      max_devices: eligible ? 1 : 0
    }), { status: 200, headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, code: 'ERROR', message: err.message }), { status: 500, headers: corsHeaders });
  }
}
