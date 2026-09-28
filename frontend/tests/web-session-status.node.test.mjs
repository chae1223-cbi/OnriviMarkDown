import test from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import { onRequestGet } from '../functions/api/device/session-status.js';

const userId = '11111111-1111-4111-8111-111111111111';
const originalFetch = globalThis.fetch;
const original = { connect: pg.Client.prototype.connect, query: pg.Client.prototype.query, end: pg.Client.prototype.end };
let found = true;
const queries = [];

pg.Client.prototype.connect = async () => {};
pg.Client.prototype.end = async () => {};
pg.Client.prototype.query = async (statement, params) => {
  queries.push({ statement, params });
  return { rows: statement.includes('SELECT 1 FROM public.license_activations') && found ? [{ '?column?': 1 }] : [] };
};

test.after(() => {
  globalThis.fetch = originalFetch;
  Object.assign(pg.Client.prototype, original);
});

const requestFor = (deviceUuid, token = 'token') => ({
  request: new Request(`https://onrivi.com/api/device/session-status?device_uuid=${encodeURIComponent(deviceUuid)}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }),
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon',
    HYPERDRIVE: { connectionString: 'postgres://test:test@localhost/test' },
  },
});

test('status lookup is scoped to the authenticated user and current web session', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ id: userId }), { status: 200 });
  queries.length = 0;
  found = true;
  assert.deepEqual(await (await onRequestGet(requestFor('tab-id'))).json(), { exists: true });
  const lookup = queries.find(({ statement }) => statement.includes('SELECT 1 FROM public.license_activations'));
  assert.deepEqual(lookup.params, [userId, 'tab-id']);
  assert.match(lookup.statement, /'web saas', 'web browser'/);
  found = false;
  assert.deepEqual(await (await onRequestGet(requestFor('tab-id'))).json(), { exists: false });
});

test('unauthenticated lookup does not query the database', async () => {
  queries.length = 0;
  assert.equal((await onRequestGet(requestFor('tab-id', null))).status, 401);
  assert.equal(queries.length, 0);
});
