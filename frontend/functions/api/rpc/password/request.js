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
    const { p_email, p_redirect_url } = body;

    if (!p_email) {
      return new Response(JSON.stringify({ success: false, code: 'INVALID_PARAMS', message: '이메일을 입력해 주세요.' }), { status: 400, headers: corsHeaders });
    }

    const cleanEmail = p_email.trim().toLowerCase();
    
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || 'https://niyvcgvayofdqbebmche.supabase.co';
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const redirectUrl = p_redirect_url || `${supabaseUrl}/reset-password`;

    const headers = {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Prefer': 'return=representation'
    };

    // 1. users 조회
    const userRes = await fetch(`${supabaseUrl}/rest/v1/users?email=ilike.${encodeURIComponent(cleanEmail)}&select=id,is_deleted&limit=1`, { headers });
    const userRows = await userRes.json();

    if (!userRes.ok) {
      return new Response(JSON.stringify({ success: false, code: 'DB_ERROR', message: '회원 정보 조회 중 오류가 발생했습니다.' }), { status: 500, headers: corsHeaders });
    }

    if (!userRows || userRows.length === 0 || userRows[0].is_deleted) {
      return new Response(JSON.stringify({ success: true, code: 'SENT', message: '비밀번호 재설정 이메일이 발송되었습니다.' }), { status: 200, headers: corsHeaders });
    }

    const userId = userRows[0].id;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const token = crypto.randomUUID();

    // 2. password_resets 등록
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/password_resets`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        created_by: userId,
        updated_by: userId,
        email: cleanEmail,
        token: token,
        expires_at: expiresAt,
        used: false,
        is_deleted: false
      })
    });

    if (!insertRes.ok) {
      return new Response(JSON.stringify({ success: false, code: 'DB_INSERT_ERROR', message: '재설정 요청 처리 중 오류가 발생했습니다.' }), { status: 500, headers: corsHeaders });
    }

    // 3. Auth 메일 발송
    const mailRes = await fetch(`${supabaseUrl}/auth/v1/recover`, {
      method: 'POST',
      headers: {
        'apikey': env.NEXT_PUBLIC_SUPABASE_ANON_KEY || supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: cleanEmail, redirect_to: redirectUrl })
    });

    if (!mailRes.ok) {
      // 롤백
      await fetch(`${supabaseUrl}/rest/v1/password_resets?email=eq.${encodeURIComponent(cleanEmail)}&used=eq.false&is_deleted=eq.false`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ is_deleted: true, deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      });
      return new Response(JSON.stringify({ success: false, code: 'MAIL_ERROR', message: '메일 발송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' }), { status: 500, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ success: true, code: 'SENT', message: '비밀번호 재설정 이메일이 발송되었습니다.' }), { status: 200, headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, code: 'ERROR', message: error.message }), { status: 500, headers: corsHeaders });
  }
}
