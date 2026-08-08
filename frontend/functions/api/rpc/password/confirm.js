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
    const { p_email, p_new_password, p_user_access_token } = body;

    if (!p_email || !p_new_password || !p_user_access_token) {
      return new Response(JSON.stringify({ success: false, code: 'INVALID_PARAMS', message: '필수 파라미터가 누락되었습니다.' }), { status: 400, headers: corsHeaders });
    }

    const cleanEmail = p_email.trim().toLowerCase();

    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || 'https://niyvcgvayofdqbebmche.supabase.co';
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const headers = {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Prefer': 'return=representation'
    };

    // 1. 토큰 유효성 검증
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'apikey': env.NEXT_PUBLIC_SUPABASE_ANON_KEY || supabaseKey,
        'Authorization': `Bearer ${p_user_access_token}`
      }
    });

    if (!userRes.ok) {
      return new Response(JSON.stringify({ success: false, code: 'TOKEN_INVALID', message: '세션이 만료되었습니다. 비밀번호 찾기를 다시 진행해 주세요.' }), { status: 401, headers: corsHeaders });
    }

    const userData = await userRes.json();
    const userId = userData.id;

    // 2. password_resets 확인
    const now = new Date().toISOString();
    const resetRes = await fetch(`${supabaseUrl}/rest/v1/password_resets?email=ilike.${encodeURIComponent(cleanEmail)}&used=eq.false&is_deleted=eq.false&expires_at=gt.${now}&select=id,expires_at,used&order=created_at.desc&limit=1`, { headers });
    const resetRows = await resetRes.json();

    if (!resetRes.ok || !resetRows || resetRows.length === 0) {
      return new Response(JSON.stringify({ success: false, code: 'TOKEN_INVALID', message: '유효한 비밀번호 재설정 요청이 없거나 만료되었습니다. 비밀번호 찾기를 다시 진행해 주세요.' }), { status: 400, headers: corsHeaders });
    }

    const resetRow = resetRows[0];

    // 3. used=true 업데이트
    const updateRes = await fetch(`${supabaseUrl}/rest/v1/password_resets?id=eq.${resetRow.id}&used=eq.false`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ used: true, updated_at: now })
    });
    
    if (!updateRes.ok) {
      return new Response(JSON.stringify({ success: false, code: 'DB_UPDATE_ERROR', message: '재설정 처리 중 오류가 발생했습니다.' }), { status: 500, headers: corsHeaders });
    }

    // 4. Admin API로 비밀번호 변경
    const pwRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ password: p_new_password })
    });

    if (!pwRes.ok) {
      // 롤백
      await fetch(`${supabaseUrl}/rest/v1/password_resets?id=eq.${resetRow.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ used: false, updated_at: new Date().toISOString() })
      });
      return new Response(JSON.stringify({ success: false, code: 'PW_UPDATE_ERROR', message: '비밀번호 변경 중 오류가 발생했습니다. 다시 시도해 주세요.' }), { status: 500, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ success: true, code: 'RESET_COMPLETE', message: '비밀번호가 성공적으로 변경되었습니다.' }), { status: 200, headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, code: 'ERROR', message: error.message }), { status: 500, headers: corsHeaders });
  }
}
