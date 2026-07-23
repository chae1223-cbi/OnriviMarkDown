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
    const { p_license_id, p_device_uuid, p_device_name, p_user_id } = body;

    if (!p_license_id || !p_device_uuid || !p_device_name) {
      return new Response(JSON.stringify({ success: false, code: 'INVALID_PARAMS', message: '필수 인자가 누락되었습니다.' }), { status: 400, headers: corsHeaders });
    }

    const isValidUUID = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const validUserId = (p_user_id && isValidUUID(p_user_id)) ? p_user_id : null;

    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || 'https://niyvcgvayofdqbebmche.supabase.co';
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const headers = {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // 1. Get max_devices
    const subRes = await fetch(`${supabaseUrl}/rest/v1/subscriptions?id=eq.${p_license_id}&select=max_devices`, { headers });
    const subData = await subRes.json();
    
    if (!subData || subData.length === 0) {
      return new Response(JSON.stringify({ success: false, code: 'ERROR', message: '구독/라이선스 정보를 찾을 수 없습니다.' }), { status: 404, headers: corsHeaders });
    }
    const max_devices = subData[0].max_devices;

    // 2. Check existing device
    const curDevRes = await fetch(`${supabaseUrl}/rest/v1/license_activations?subscription_id=eq.${p_license_id}&device_uuid=eq.${p_device_uuid}&select=is_active`, { headers });
    const curDevData = await curDevRes.json();

    let isCurrentlyActive = false;
    let newIsActive = true;
    let isExisting = false;

    if (curDevData && curDevData.length > 0) {
      isExisting = true;
      isCurrentlyActive = curDevData[0].is_active;
    }

    // 3. max_devices check
    if (!isCurrentlyActive && max_devices !== null && max_devices > 0) {
      const activeCountRes = await fetch(`${supabaseUrl}/rest/v1/license_activations?subscription_id=eq.${p_license_id}&is_active=eq.true&select=id`, { headers });
      const activeCountData = await activeCountRes.json();
      const count = activeCountData ? activeCountData.length : 0;
      if (count >= max_devices) {
        newIsActive = false;
      }
    }

    const now = new Date().toISOString();

    // 4. Update or Insert
    if (isExisting) {
      await fetch(`${supabaseUrl}/rest/v1/license_activations?subscription_id=eq.${p_license_id}&device_uuid=eq.${p_device_uuid}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          activated_at: now,
          updated_at: now,
          is_active: newIsActive,
          device_name: p_device_name
        })
      });
    } else {
      const insertData = {
        subscription_id: p_license_id,
        device_uuid: p_device_uuid,
        device_name: p_device_name,
        activated_at: now,
        is_active: newIsActive
      };
      if (validUserId) {
        insertData.created_by = validUserId;
        insertData.updated_by = validUserId;
      }
      
      await fetch(`${supabaseUrl}/rest/v1/license_activations`, {
        method: 'POST',
        headers,
        body: JSON.stringify(insertData)
      });
    }

    if (!newIsActive) {
      return new Response(JSON.stringify({ success: false, code: 'EXCEED_MAX_DEVICES', message: '동시접속 기기 수를 초과하여 제한 모드로 연결됩니다.', max_devices }), { status: 200, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ success: true, code: 'SUCCESS', message: '기기가 활성화되었습니다.' }), { status: 200, headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, code: 'ERROR', message: err.message }), { status: 500, headers: corsHeaders });
  }
}
