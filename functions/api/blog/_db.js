import { Client } from 'pg';

// ====================================================================
// 📊 [OMD-IO-0040] frontend/functions/api/blog/_db.js ➔ withBlogTransaction
// 🎯 @KICK  : 한 요청의 게시글·리비전 변경을 동일한 PostgreSQL 연결에서 원자적으로 처리한다.
// 🛡️ @GUARD : 오류 시 ROLLBACK하고 연결을 닫으며, 준비된 문장/세션 상태에 의존하지 않는다.
// 🔗 @CALLS : Client.connect(), Client.query(), Client.end()
// ====================================================================
export async function withBlogTransaction(env, work) {
  const databaseUrl = env.BLOG_DATABASE_URL || env.DATABASE_URL;
  if (!databaseUrl) throw new Error('BLOG_DATABASE_URL or DATABASE_URL is not configured');
  const client = new Client({
    connectionString: databaseUrl,
    // Supabase pooler의 기본 인증서 체인은 로컬 신뢰 저장소에 없을 수 있다.
    // CA를 제공하면 인증서 검증을 켜고, 그렇지 않으면 SSL 암호화만 강제한다.
    ssl: env.BLOG_DATABASE_CA_CERT
      ? { ca: env.BLOG_DATABASE_CA_CERT.replace(/\\n/g, '\n'), rejectUnauthorized: true }
      : { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL statement_timeout = '15s'");
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch { /* 연결 종료 중이면 서버가 자동 롤백한다. */ }
    throw error;
  } finally {
    await client.end();
  }
}

export async function getBlogUser(request, env) {
  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!token || !env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null;
  const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });
  return response.ok ? response.json() : null;
}

export function blogJson(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
