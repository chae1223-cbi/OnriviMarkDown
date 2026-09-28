import test from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import { onRequestPost } from '../functions/api/device/dashboard-sessions.js';

const userId = '11111111-1111-4111-8111-111111111111';
const originalFetch = globalThis.fetch;
const originalConnect = pg.Client.prototype.connect;
const originalQuery = pg.Client.prototype.query;
const originalEnd = pg.Client.prototype.end;
const queries = [];

pg.Client.prototype.connect = async () => {};
pg.Client.prototype.query = async (statement, params) => {
  queries.push({ statement, params });
  return { rowCount: statement.includes('DELETE FROM') ? 2 : 0 };
};
pg.Client.prototype.end = async () => {};

const requestFor = (body, token = 'test-token') => ({
  request: new Request('https://onrivi.com/api/device/dashboard-sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  }),
  env: { NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon', HYPERDRIVE: { connectionString: 'postgres://test:test@localhost/test' } },
});

test.after(() => {
  globalThis.fetch = originalFetch;
  pg.Client.prototype.connect = originalConnect;
  pg.Client.prototype.query = originalQuery;
  pg.Client.prototype.end = originalEnd;
});

test('anonymous and invalid requests do not touch the database', async () => {
  queries.length = 0;
  assert.equal((await onRequestPost(requestFor({ current_device_uuid: 'current' }, null))).status, 401);
  globalThis.fetch = async () => new Response(JSON.stringify({ id: userId }), { status: 200 });
  assert.equal((await onRequestPost(requestFor({ target_device_uuid: '', current_device_uuid: 'current' }))).status, 400);
  assert.equal((await onRequestPost(requestFor({ activation_id: 'old-client-id', current_device_uuid: 'current' }))).status, 400);
  assert.equal(queries.length, 0);
});

test('bulk deletion is bound to account and excludes web tab and browser fallback IDs', async () => {
  queries.length = 0;
  globalThis.fetch = async () => new Response(JSON.stringify({ id: userId }), { status: 200 });
  const response = await onRequestPost(requestFor({ current_device_uuid: 'tab-id', fallback_device_uuid: 'browser-id' }));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).deleted, 2);
  const deletion = queries.find(({ statement }) => statement.includes('DELETE FROM'));
  assert.ok(deletion);
  assert.match(deletion.statement, /subscription\.user_id = \$1/);
  assert.match(deletion.statement, /'web saas', 'web browser'/);
  assert.match(deletion.statement, /activation\.device_uuid <> \$3/);
  assert.match(deletion.statement, /activation\.device_uuid <> \$4/);
  assert.deepEqual(deletion.params, [userId, null, 'tab-id', 'browser-id']);
  assert.equal(queries.at(-1).statement, 'COMMIT');
});

test('a device UUID can be used to release another web session', async () => {
  queries.length = 0;
  globalThis.fetch = async () => new Response(JSON.stringify({ id: userId }), { status: 200 });
  const targetDeviceUuid = 'other-tab';
  const response = await onRequestPost(requestFor({ target_device_uuid: targetDeviceUuid, current_device_uuid: 'this-tab' }));
  assert.equal(response.status, 200);
  assert.deepEqual(queries.find(({ statement }) => statement.includes('DELETE FROM')).params, [userId, targetDeviceUuid, 'this-tab', null]);
});
