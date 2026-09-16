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
    const subRes = await fetch(`${supabaseUrl}/rest/v1/subscriptions?payment_no=eq.${encodeURIComponent(p_payment_no)}&plan_status=in.(ACTIVE,FREE,active,free)&select=id,max_devices,user_id,is_active,plan_status&limit=1`, { headers });
    const subRows = await subRes.json();

    if (!subRows || subRows.length === 0) {
      return new Response(JSON.stringify({ success: true, has_session: false, max_devices: 0 }), { status: 200, headers: corsHeaders });
    }

    const sub = subRows[0];
    const isFreePlan = sub.plan_status && sub.plan_status.toUpperCase() === 'FREE';
    
    // 활성 라이선스 조건: is_active가 true이거나 FREE 플랜인 경우
    if (!sub.is_active && !isFreePlan) {
      return new Response(JSON.stringify({ success: true, has_session: false, max_devices: 0 }), { status: 200, headers: corsHeaders });
    }

    const licenseId = sub.id;
    const max_devices = sub.max_devices;
    const userId = sub.user_id;

    // 2. license_activations에서 해당 device_uuid 세션 존재 여부 확인
    const actRes = await fetch(`${supabaseUrl}/rest/v1/license_activations?subscription_id=eq.${licenseId}&device_uuid=eq.${p_device_uuid}&select=id,is_active&limit=1`, { headers });
    const actRows = await actRes.json();

    const sessionExists = actRows && actRows.length > 0;
    let isActiveSession = sessionExists && actRows[0].is_active;
    // 3. 🚨 @PATCH : 2026-09-16 하트비트에서 임의 1대 한도 동기화 및 자동 승급(Auto-promote) 완전 배제
    // 사용자의 명시적 지침에 따라 하트비트는 세션 상태를 조작하지 않고, 오직 DB 세션의 생존(updated_at)만 갱신하며
    // 다른 곳(대시보드 기기 해제, 타 기기 인수 등)에서 세션이 비활성화되거나 삭제된 것을 그대로 감지하여 반환합니다.
    if (sessionExists) {
      await fetch(`${supabaseUrl}/rest/v1/license_activations?subscription_id=eq.${licenseId}&device_uuid=eq.${p_device_uuid}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ updated_at: new Date().toISOString(), updated_by: userId })
      });
    }

    return new Response(JSON.stringify({
      success: true,
      has_session: isActiveSession,
      is_restricted: sessionExists && !isActiveSession,
      is_terminated: !sessionExists,
      max_devices: max_devices || 1
    }), { status: 200, headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, code: 'ERROR', message: err.message }), { status: 500, headers: corsHeaders });
  }
}
