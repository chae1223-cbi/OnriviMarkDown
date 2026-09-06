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

    // ⚡ 제어권 인수 요청 시 타 활성 세션 비활성화
    if (p_force_takeover) {
      await fetch(`${supabaseUrl}/rest/v1/license_activations?subscription_id=eq.${p_license_id}&device_uuid=neq.${p_device_uuid}&is_active=eq.true`, {
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
    const userId = subRows[0].user_id;

    // 2. Fetch existing session
    const actRes = await fetch(`${supabaseUrl}/rest/v1/license_activations?subscription_id=eq.${p_license_id}&device_uuid=eq.${p_device_uuid}&select=id,is_active&limit=1`, { headers });
    const actRows = await actRes.json();

    let isCurrentlyActive = false;
    let newIsActive = true;

    if (actRows && actRows.length > 0) {
      isCurrentlyActive = actRows[0].is_active;

      if (!isCurrentlyActive && max_devices !== null && max_devices > 0) {
        const countRes = await fetch(`${supabaseUrl}/rest/v1/license_activations?subscription_id=eq.${p_license_id}&is_active=eq.true&select=id`, { headers });
        const activeRows = await countRes.json();
        if (activeRows.length >= max_devices) {
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
          updated_by: p_user_id || userId
        })
      });
      if (!updateRes.ok) {
        throw new Error('업데이트 실패');
      }
    } else {
      if (max_devices !== null && max_devices > 0) {
        const countRes = await fetch(`${supabaseUrl}/rest/v1/license_activations?subscription_id=eq.${p_license_id}&is_active=eq.true&select=id`, { headers });
        const activeRows = await countRes.json();
        if (activeRows.length >= max_devices) {
          newIsActive = false;
        }
      }

      const payload = {
        subscription_id: p_license_id,
        device_uuid: p_device_uuid,
        device_name: p_device_name,
        activated_at: now,
        is_active: newIsActive,
        created_by: p_user_id || userId,
        updated_by: p_user_id || userId
      };

      const insertRes = await fetch(`${supabaseUrl}/rest/v1/license_activations`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      if (!insertRes.ok) {
        const err = await insertRes.json();
        throw new Error(err.message || '삽입 실패');
      }
    }

    if (!newIsActive) {
      return new Response(JSON.stringify({ success: false, code: 'EXCEED_MAX_DEVICES', message: '동시접속 기기 수를 초과하여 제한 모드로 연결됩니다.', max_devices }), { status: 200, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ success: true, code: 'SUCCESS', message: '기기가 활성화되었습니다.' }), { status: 200, headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, code: 'ERROR', message: error.message }), { status: 500, headers: corsHeaders });
  }
}
