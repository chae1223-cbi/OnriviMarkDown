import { Client } from 'pg';
import { sessionUser } from './_sessionAuth.js';
import { checkSession } from './_session.js';

const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
  'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS' };
export const onRequestOptions = () => new Response(null, { headers });
export async function onRequestPost({ request, env }) {
  let client;
  try {
    const body = await request.json();
    const user = await sessionUser(request, env);
    if (request.headers.has('Authorization') && !user) return new Response(JSON.stringify({ success: false, code: 'UNAUTHORIZED' }), { status: 401, headers });
    const result = await checkSession(body, user, async (text, params) => {
      const hyperdrive = env.HYPERDRIVE?.connectionString;
      const connectionString = hyperdrive || env.DATABASE_URL || env.BLOG_DATABASE_URL;
      if (!connectionString) throw new Error('Database is not configured');
      client = new Client({ connectionString, connectionTimeoutMillis: 10000, query_timeout: 10000,
        ...(hyperdrive ? {} : { ssl: env.BLOG_DATABASE_CA_CERT ? { ca: env.BLOG_DATABASE_CA_CERT.replace(/\\n/g, '\n'), rejectUnauthorized: true } : { rejectUnauthorized: false } }) });
      await client.connect();
      return (await client.query(text, params)).rows;
    });
    return new Response(JSON.stringify(result.data), { status: result.status, headers });
  } catch {
    return new Response(JSON.stringify({ success: false, code: 'SESSION_CHECK_FAILED' }), { status: 503, headers });
  } finally { if (client) await client.end().catch(() => {}); }
}
