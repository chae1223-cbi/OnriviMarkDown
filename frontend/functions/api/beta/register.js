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
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ success: false, message: '유효한 이메일 주소를 입력해주세요.' }), { status: 400, headers: corsHeaders });
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

    // Supabase waitlist 테이블에 삽입
    const res = await fetch(`${supabaseUrl}/rest/v1/waitlist`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email })
    });

    const data = await res.json();

    if (!res.ok) {
      // 이미 등록된 이메일 처리 (고유 제약 조건 위반)
      if (data.code === '23505') {
        return new Response(JSON.stringify({ success: false, message: '이미 사전 등록된 이메일입니다!' }), { status: 409, headers: corsHeaders });
      }
      throw new Error(data.message || '등록 중 오류가 발생했습니다.');
    }

    return new Response(JSON.stringify({ success: true, message: '사전 등록이 완료되었습니다.' }), { status: 200, headers: corsHeaders });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500, headers: corsHeaders });
  }
}
