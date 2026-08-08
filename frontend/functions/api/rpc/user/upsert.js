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
    const { p_id, p_email, p_provider, p_nick_name, p_password } = body;

    if (!p_id || !p_email) {
      return new Response(JSON.stringify({ success: false, code: 'INVALID_PARAMS', message: '필수 인자가 누락되었습니다.' }), { status: 400, headers: corsHeaders });
    }

    const cleanEmail = p_email.trim().toLowerCase();
    const upperProvider = (p_provider || 'EMAIL').toUpperCase();
    const nickName = p_nick_name ? p_nick_name.trim() : null;

    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || 'https://niyvcgvayofdqbebmche.supabase.co';
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const headers = {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    };

    // 1. Update Auth user if password is provided
    if (p_password) {
      await fetch(`${supabaseUrl}/auth/v1/admin/users/${p_id}`, {
        method: 'PUT',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: p_password,
          user_metadata: { name: nickName }
        })
      });
    }

    // 2. Upsert into users table
    const now = new Date().toISOString();
    const upsertRes = await fetch(`${supabaseUrl}/rest/v1/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        id: p_id,
        created_by: p_id,
        created_at: now,
        updated_by: p_id,
        updated_at: now,
        email: cleanEmail,
        provider: upperProvider,
        is_deleted: false,
        deleted_at: null,
        nick_name: nickName
      })
    });

    if (!upsertRes.ok) {
      const err = await upsertRes.json();
      return new Response(JSON.stringify({ success: false, code: 'ERROR', message: err.message || 'DB Upsert Failed' }), { status: 500, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ success: true, code: 'SUCCESS', message: '사용자 정보가 갱신되었습니다.' }), { status: 200, headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, code: 'ERROR', message: error.message }), { status: 500, headers: corsHeaders });
  }
}
