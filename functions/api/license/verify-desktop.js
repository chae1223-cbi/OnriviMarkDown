// ====================================================================
// 📊 [OMD-AUTH-verify-desktop-0002 ✅ FIXED] functions/api/license/verify-desktop.js
// 🎯 @KICK  : Cloudflare Pages 데스크탑 앱 라이선스 인증 및 세션 검증
// 🛡️ @GUARD : is_active=true 활성 세션만 집계, 데스크탑 전용 기기 필터링 및 동시접속 1대 가드
// 🚨 @PATCH : **2026-09-16** — [데스크톱 세션 검증 is_active=true 필터링 및 데스크톱 기기 구분 집계]: 과거 비활성화(is_active=false)된 이전 세션이 기기 수에 누적 합산되어 발생하던 ERR_MAX_DEVICES_EXCEEDED 차단 오류 해결, 데스크탑(Desktop App) 기기만 한도(1대)로 독립 집계
// 🔗 @CALLS : Supabase REST API (users, subscriptions, license_activations)
// ====================================================================
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
    const { p_email, p_device_uuid, p_force_takeover } = body;

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

    const cleanInput = String(p_email).trim();

    // 1. 유저 확인 (이메일 또는 UUID 동시 지원)
    let userQuery = cleanInput.includes('@') 
      ? `email=eq.${encodeURIComponent(cleanInput.toLowerCase())}`
      : `id=eq.${encodeURIComponent(cleanInput)}`;
    const userRes = await fetch(`${supabaseUrl}/rest/v1/users?${userQuery}&select=id,email&limit=1`, { headers });
    const userRows = await userRes.json();
    if (!userRows || userRows.length === 0) {
      return new Response(JSON.stringify({ success: false, code: 'NOT_FOUND', message: '등록되지 않은 사용자입니다.' }), { status: 200, headers: corsHeaders });
    }
    const userId = userRows[0].id;

    // 2. 데스크탑 활성 구독 확인 (ELITEPRO 또는 DESKTOP 요금제)
    const subRes = await fetch(`${supabaseUrl}/rest/v1/subscriptions?user_id=eq.${userId}&is_active=eq.true&plan_status=in.(ACTIVE,FREE,active,free)&order=current_period_end.desc&select=*`, { headers });
    const subRows = await subRes.json();
    if (!subRows || subRows.length === 0) {
      return new Response(JSON.stringify({ success: false, code: 'NO_PLAN', message: '활성화된 구독이 없습니다.' }), { status: 200, headers: corsHeaders });
    }

    const sub = subRows.find(s => 
      s.plan_name?.toUpperCase().includes('ELITE') || 
      s.plan_name?.toUpperCase().includes('DESKTOP')
    );

    if (!sub) {
      return new Response(JSON.stringify({ success: false, code: 'NO_PLAN', message: '데스크탑을 지원하는 요금제 구독이 없습니다.' }), { status: 200, headers: corsHeaders });
    }

    // 2-1. 공통코드에서 plan_name 명칭(code_name) 가져오기
    let displayPlanName = sub.plan_name;
    const ccRes = await fetch(`${supabaseUrl}/rest/v1/common_codes?group_code=eq.PLAN_NAME&code_value=eq.${sub.plan_name}&select=code_name&limit=1`, { headers });
    if (ccRes.ok) {
      const ccRows = await ccRes.json();
      if (ccRows && ccRows.length > 0 && ccRows[0].code_name) {
        displayPlanName = ccRows[0].code_name;
      }
    }

    // 3. 라이선스 키 확인
    if (!sub.license_key) {
      return new Response(JSON.stringify({ success: false, code: 'NO_LICENSE', message: '라이선스 키가 발급되지 않았습니다.' }), { status: 200, headers: corsHeaders });
    }

    const nowIso = new Date().toISOString();

    // 4. 기존 동일 기기 세션 확인 (is_active 여부 무관 조회)
    const deviceRes = await fetch(`${supabaseUrl}/rest/v1/license_activations?subscription_id=eq.${sub.id}&device_uuid=ilike.${encodeURIComponent(p_device_uuid.trim())}&select=*&limit=1`, { headers });
    const existingDevices = await deviceRes.json();
    const existingDevice = existingDevices && existingDevices.length > 0 ? existingDevices[0] : null;

    // ⚡ 제어권 인수(forceTakeover) 요청 시 타 활성 데스크탑 세션 비활성화
    if (p_force_takeover) {
      await fetch(`${supabaseUrl}/rest/v1/license_activations?subscription_id=eq.${sub.id}&device_uuid=neq.${encodeURIComponent(p_device_uuid.trim())}&device_name=ilike.*desktop*&is_active=eq.true`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ is_active: false, updated_at: nowIso })
      });
    }

    if (existingDevice) {
      // 기존 세션 활성화 및 갱신
      await fetch(`${supabaseUrl}/rest/v1/license_activations?id=eq.${existingDevice.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          updated_at: nowIso,
          activated_at: nowIso,
          is_active: true,
          device_name: 'Desktop App'
        })
      });

      return new Response(JSON.stringify({
        success: true,
        code: 'SUCCESS',
        message: '데스크탑 기기가 확인되었습니다.',
        subscription_id: sub.id,
        license_id: sub.id,
        device_uuid: p_device_uuid,
        max_devices: 1,
        verify_key: sub.verify_key,
        payment_no: sub.payment_no,
        license_key: sub.license_key,
        plan_name: displayPlanName,
        next_payment_date: sub.current_period_end,
        rank: 1
      }), { status: 200, headers: corsHeaders });
    }

    // 5. 신규 기기 등록 시 데스크탑 동시접속 한도 검사 (오직 활성 데스크탑 기기만 1대 한도 체크)
    const activeDesktopRes = await fetch(`${supabaseUrl}/rest/v1/license_activations?subscription_id=eq.${sub.id}&is_active=eq.true&device_name=ilike.*desktop*&select=id`, { headers });
    const activeDesktopSessions = await activeDesktopRes.json();

    if (activeDesktopSessions && activeDesktopSessions.length >= 1) {
      return new Response(JSON.stringify({
        success: false,
        code: 'ERR_MAX_DEVICES_EXCEEDED',
        message: '데스크탑 동시 접속 허용 대수(1대)를 초과했습니다. 웹 대시보드에서 기존 데스크탑 기기를 해제해 주세요.',
        max_devices: 1,
        current_devices: activeDesktopSessions.length,
        verify_key: sub.verify_key,
        payment_no: sub.payment_no,
        license_key: sub.license_key,
        plan_name: displayPlanName,
        next_payment_date: sub.current_period_end,
        rank: 1
      }), { status: 200, headers: corsHeaders });
    }

    // 6. 신규 데스크탑 기기 추가
    await fetch(`${supabaseUrl}/rest/v1/license_activations`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        subscription_id: sub.id,
        device_uuid: p_device_uuid.trim(),
        device_name: 'Desktop App',
        activated_at: nowIso,
        updated_at: nowIso,
        is_active: true,
        created_by: userId,
        updated_by: userId
      })
    });

    return new Response(JSON.stringify({
      success: true,
      code: 'SUCCESS',
      message: '데스크탑 기기가 성공적으로 등록되었습니다.',
      subscription_id: sub.id,
      license_id: sub.id,
      device_uuid: p_device_uuid,
      max_devices: 1,
      verify_key: sub.verify_key,
      payment_no: sub.payment_no,
      license_key: sub.license_key,
      plan_name: displayPlanName,
      next_payment_date: sub.current_period_end,
      rank: 1
    }), { status: 200, headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, code: 'ERROR', message: err.message }), { status: 500, headers: corsHeaders });
  }
}

