import test from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import { onRequestPost as upsert } from '../functions/api/user/upsert.js';
import { onRequestPost as checkUser } from '../functions/api/user/check.js';
import { onRequestPost as deleteUser } from '../functions/api/user/delete.js';
import { onRequestPost as requestReset } from '../functions/api/password/request.js';
import { onRequestPost as confirmReset } from '../functions/api/password/confirm.js';

const userId = '22222222-2222-4222-8222-222222222222';
const env = {
  HYPERDRIVE: { connectionString: 'postgres://test:test@localhost/test' },
  NEXT_PUBLIC_SUPABASE_URL: 'https://supabase.test',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon',
  SUPABASE_SERVICE_ROLE_KEY: 'service',
};
const original = { connect: pg.Client.prototype.connect, query: pg.Client.prototype.query, end: pg.Client.prototype.end };
const originalFetch = globalThis.fetch;
const calls = [];
let failAudit = false;
let mailFails = false;
let authEmail = 'member@example.com';

pg.Client.prototype.connect = async () => {};
pg.Client.prototype.end = async () => {};
pg.Client.prototype.query = async (statement, params = []) => {
  calls.push({ statement, params });
  if (failAudit && statement.includes('INSERT INTO public.user_audit_logs')) throw new Error('audit failed');
  if (statement.includes('FROM public.users')) return { rows: [{ id: userId, email: 'member@example.com', is_deleted: false }] };
  if (statement.includes('SELECT id FROM public.password_resets')) return { rows: [{ id: '33333333-3333-4333-8333-333333333333' }] };
  return { rows: [] };
};

test.beforeEach(() => {
  calls.length = 0;
  failAudit = false;
  mailFails = false;
  authEmail = 'member@example.com';
  globalThis.fetch = async (url) => {
    if (String(url).includes('/auth/v1/recover?')) return new Response('{}', { status: mailFails ? 500 : 200 });
    return new Response(JSON.stringify({ id: userId, email: authEmail }), { status: 200 });
  };
});
test.after(() => {
  Object.assign(pg.Client.prototype, original);
  globalThis.fetch = originalFetch;
});

const post = (path, body, authorized = true) => ({
  request: new Request(`https://onrivi.com${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(authorized ? { Authorization: 'Bearer test-token' } : {}) },
    body: JSON.stringify(body),
  }),
  env,
});

test('user upsert rejects an unauthenticated request and uses one DB transaction', async () => {
  const body = { p_id: userId, p_email: 'member@example.com', p_nick_name: 'Member' };
  assert.equal((await upsert(post('/api/user/upsert', body, false))).status, 401);
  assert.equal(calls.length, 0);
  const response = await upsert(post('/api/user/upsert', body));
  assert.equal((await response.json()).success, true);
  assert.equal(calls[0].statement, 'BEGIN');
  assert.equal(calls.at(-1).statement, 'COMMIT');
  assert.ok(calls.some(({ statement }) => statement.includes('INSERT INTO public.users')));
});

test('user lookup uses the id when settings sends both id and email', async () => {
  const response = await checkUser(post('/api/user/check', { p_id: userId, p_email: 'old@example.com' }, false));
  assert.equal((await response.json()).exists, true);
  const lookup = calls.find(({ statement }) => statement.includes('FROM public.users'));
  assert.ok(lookup.statement.includes('WHERE id = $1'));
  assert.deepEqual(lookup.params, [userId]);
});

test('account deletion rolls back all DB changes if audit insertion fails', async () => {
  failAudit = true;
  const response = await deleteUser(post('/api/user/delete', { p_user_id: userId }));
  assert.equal(response.status, 500);
  assert.equal(calls.at(-1).statement, 'ROLLBACK');
  assert.ok(calls.some(({ statement }) => statement.includes('DELETE FROM public.license_activations')));
});

test('reset request rolls back its DB record if email delivery fails', async () => {
  mailFails = true;
  const response = await requestReset(post('/api/password/request', {
    p_email: 'member@example.com', p_redirect_url: 'https://onrivi.com/reset-password',
  }, false));
  assert.equal((await response.json()).code, 'MAIL_ERROR');
  assert.equal(calls.at(-1).statement, 'ROLLBACK');
});

test('reset confirmation checks the Auth email and accepts the page token field', async () => {
  authEmail = 'other@example.com';
  const body = { p_email: 'member@example.com', p_new_password: 'New123!@', p_access_token: 'recovery-token' };
  assert.equal((await confirmReset(post('/api/password/confirm', body, false))).status, 401);
  assert.equal(calls.length, 0);
  authEmail = 'member@example.com';
  const response = await confirmReset(post('/api/password/confirm', body, false));
  assert.equal((await response.json()).code, 'RESET_COMPLETE');
  assert.ok(calls.some(({ statement }) => statement.includes('UPDATE public.password_resets SET used = true')));
  assert.equal(calls.at(-1).statement, 'COMMIT');
});
