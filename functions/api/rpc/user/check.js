// Cloudflare Pages Function: /api/rpc/user/check
// CORS 헤더 (Electron 데스크탑 file:// origin 지원)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}

function withCors(res) {
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries(corsHeaders)) headers.set(k, v);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { p_email } = body;

    if (!p_email) {
      return withCors(new Response(JSON.stringify({ exists: false, is_deleted: false }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      }));
    }

    const cleanEmail = p_email.trim().toLowerCase();
    
    // 환경 변수 설정
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || 'https://niyvcgvayofdqbebmche.supabase.co';
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5peXZjZ3ZheW9mZHFiZWJtY2hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MDQ1MTIsImV4cCI6MjA2NzA4MDUxMn0.0N2vQ-kUuQJ6x9iR_pY0n4z9b7X_o8S0Z9X5m2L6f34';

    // 1. Supabase REST API 호출 (users 테이블 조회)
    // RLS 우회를 위해 Service Role Key 사용
    const restUrl = `${supabaseUrl}/rest/v1/users?email=ilike.${encodeURIComponent(cleanEmail)}&select=id,is_deleted`;
    
    const resp = await fetch(restUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });

    if (resp.ok) {
      const data = await resp.json();
      if (data && data.length > 0) {
        return withCors(new Response(JSON.stringify({
          exists: true,
          id: data[0].id,
          is_deleted: data[0].is_deleted
        }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      } else {
        return withCors(new Response(JSON.stringify({ exists: false, is_deleted: false }), { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        }));
      }
    } else {
       console.error("Supabase API Error", resp.status, await resp.text());
    }

    return withCors(new Response(JSON.stringify({ exists: false, is_deleted: false }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    }));

  } catch (error) {
    console.error('[/api/rpc/user/check] Cloudflare Function Error:', error);
    return withCors(new Response(JSON.stringify({ exists: false, error: error.message }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    }));
  }
}
