// ====================================================================
// 📊 [OMD-API-licenseInsert-0001] functions/api/rpc/license/insert.js
// 🎯 @KICK  : Cloudflare Pages Functions 라이선스 기기 활성화/등록 API
// 🛡️ @GUARD : Rule 1, Rule 2, p_user_id 이메일 유입 시 UUID 유효성 검증 및 subscription.user_id 폴백, 500 에러 차단 (200 SERVER_ERROR)
// 🚨 @PATCH : **2026-09-16** — [p_user_id 이메일 유입 시 Postgres UUID 문법 오류(500) 및 activation_id 누락 결함 해결]: p_user_id가 이메일 주소로 전달될 때 UUID 정규식 검증으로 subscription의 소유자 UUID로 자동 대체하고, 예외 시 500 대신 200 SERVER_ERROR 반환 및 activation_id 응답 동기화
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
    const { p_license_id, p_device_uuid, p_device_name, p_user_id, p_force_takeover } = body;

    if (!p_license_id || !p_device_uuid || !p_device_name) {
      return new Response(JSON.stringify({ success: false, code: 'INVALID_PARAMS', message: '필수 인자가 누락되었습니다.' }), { status: 400, headers: corsHeaders });
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
    const isDesktop = String(p_device_name || '').toLowerCase().includes('desktop');

    // 🧹 [좀비 세션 자동 정리 가드]: 2분 이상 활동(Heartbeat)이 중단된 웹 세션은 자동 비활성화하여 오탐지 방지
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    await fetch(`${supabaseUrl}/rest/v1/license_activations?subscription_id=eq.${p_license_id}&is_active=eq.true&device_name=not.ilike.*desktop*&updated_at=lt.${twoMinutesAgo}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ is_active: false, updated_at: now })
    }).catch(() => {});

    // ⚡ 제어권 인수 요청 시 타 활성 세션 비활성화 (웹 인수 시 데스크탑 세션 보존)
    if (p_force_takeover) {
      let takeoverUrl = `${supabaseUrl}/rest/v1/license_activations?subscription_id=eq.${p_license_id}&device_uuid=neq.${p_device_uuid}&is_active=eq.true`;
      if (!isDesktop) {
        takeoverUrl += '&device_name=not.ilike.*desktop*';
      } else {
        takeoverUrl += '&device_name=ilike.*desktop*';
      }
      await fetch(takeoverUrl, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ is_active: false, updated_at: now })
      });
    }

    // 1. Fetch max_devices and user_id
    const subRes = await fetch(`${supabaseUrl}/rest/v1/subscriptions?id=eq.${p_license_id}&select=max_devices,user_id&limit=1`, { headers });
    const subRows = await subRes.json();
    
    if (!subRes.ok || !subRows || subRows.length === 0) {
      return new Response(JSON.stringify({ success: false, code: 'ERROR', message: '구독/라이선스 정보를 찾을 수 없습니다.' }), { status: 200, headers: corsHeaders });
    }
    const max_devices = subRows[0].max_devices;
    const subOwnerId = subRows[0].user_id;

    // 🛡️ UUID 유효성 검증 방어 (이메일 주소 등이 들어왔을 때 Postgres UUID 문법 오류 방지)
    const isValidUUID = (id) => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const validUserId = isValidUUID(p_user_id) ? p_user_id : (isValidUUID(subOwnerId) ? subOwnerId : null);

    // 2. Fetch existing session
    const actRes = await fetch(`${supabaseUrl}/rest/v1/license_activations?subscription_id=eq.${p_license_id}&device_uuid=eq.${p_device_uuid}&select=id,is_active&limit=1`, { headers });
    const actRows = await actRes.json();

    let isCurrentlyActive = false;
    let newIsActive = true;
    let activationId = null;

    // 활성 웹 세션 카운트 헬퍼 (데스크탑 제외, 타 기기만 카운트)
    const checkLimitExceeded = async () => {
      if (max_devices === null || max_devices <= 0) return false;
      let countUrl = `${supabaseUrl}/rest/v1/license_activations?subscription_id=eq.${p_license_id}&is_active=eq.true&device_uuid=neq.${p_device_uuid}&select=id`;
      if (!isDesktop) {
        countUrl += '&device_name=not.ilike.*desktop*';
      } else {
        countUrl += '&device_name=ilike.*desktop*';
      }
      const countRes = await fetch(countUrl, { headers });
      const activeRows = await countRes.json();
      return (activeRows || []).length >= max_devices;
    };

    if (actRows && actRows.length > 0) {
      activationId = actRows[0].id;
      isCurrentlyActive = actRows[0].is_active;

      if (!isCurrentlyActive) {
        if (await checkLimitExceeded()) {
          newIsActive = false;
        }
      }

      const updateRes = await fetch(`${supabaseUrl}/rest/v1/license_activations?subscription_id=eq.${p_license_id}&device_uuid=eq.${p_device_uuid}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          activated_at: now,
          updated_at: now,
          is_active: newIsActive,
          device_name: p_device_name,
          updated_by: validUserId
        })
      });
      if (!updateRes.ok) {
        const err = await updateRes.json().catch(() => ({}));
        throw new Error(err.message || '세션 갱신 실패');
      }
    } else {
      if (await checkLimitExceeded()) {
        newIsActive = false;
      }

      const payload = {
        subscription_id: p_license_id,
        device_uuid: p_device_uuid,
        device_name: p_device_name,
        activated_at: now,
        is_active: newIsActive,
        created_by: validUserId,
        updated_by: validUserId
      };

      const insertRes = await fetch(`${supabaseUrl}/rest/v1/license_activations`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      if (!insertRes.ok) {
        const err = await insertRes.json().catch(() => ({}));
        throw new Error(err.message || '세션 등록 실패');
      }
      const inserted = await insertRes.json().catch(() => null);
      if (inserted && Array.isArray(inserted) && inserted.length > 0) {
        activationId = inserted[0].id;
      }
    }

    if (!newIsActive) {
      return new Response(JSON.stringify({ success: false, code: 'EXCEED_MAX_DEVICES', message: '동시접속 기기 수를 초과하여 제한 모드로 연결됩니다.', max_devices, activation_id: activationId }), { status: 200, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ success: true, code: 'SUCCESS', message: '기기가 활성화되었습니다.', activation_id: activationId }), { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error('[/api/rpc/license/insert Functions Error]:', error);
    return new Response(JSON.stringify({ success: false, code: 'SERVER_ERROR', message: error.message }), { status: 200, headers: corsHeaders });
  }
}
