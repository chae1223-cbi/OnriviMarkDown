import test from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import { onRequestPost } from '../functions/api/license/activate.js';

const licenseId = '11111111-1111-4111-8111-111111111111';
const ownerId = '22222222-2222-4222-8222-222222222222';
const original = { connect: pg.Client.prototype.connect, query: pg.Client.prototype.query, end: pg.Client.prototype.end };
const calls = [];
let subscription;
let otherWebCount;
const originalFetch = globalThis.fetch;

pg.Client.prototype.connect = async () => {};
pg.Client.prototype.end = async () => {};
pg.Client.prototype.query = async (statement, params = []) => {
  calls.push({ statement, params });
  if (statement.includes('FROM public.subscriptions WHERE id')) return { rows: [subscription] };
  if (statement.includes('FROM public.users WHERE id')) return { rows: [{ id: ownerId }] };
  if (statement.includes('SELECT id FROM public.license_activations')) return { rows: [] };
  if (statement.includes('SELECT count(*)::int')) return { rows: [{ total: otherWebCount }] };
  if (statement.includes('RETURNING id')) return { rows: [{ id: '33333333-3333-4333-8333-333333333333' }] };
  return { rows: [] };
};

test.after(() => {
  Object.assign(pg.Client.prototype, original);
  globalThis.fetch = originalFetch;
});

const request = (deviceName, force = false, authorized = true) => ({
  request: new Request('https://onrivi.com/api/license/activate', {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...(authorized ? { Authorization: 'Bearer valid-token' } : {}) },
    body: JSON.stringify({ p_license_id: licenseId, p_device_uuid: 'this-tab', p_device_name: deviceName, p_force_takeover: force }),
  }),
  env: { HYPERDRIVE: { connectionString: 'postgres://test:test@localhost/test' }, NEXT_PUBLIC_SUPABASE_URL: 'https://supabase.test', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon' },
});

test.beforeEach(() => {
  calls.length = 0;
  otherWebCount = 0;
  subscription = { id: licenseId, user_id: ownerId, plan_name: 'FREE', plan_status: 'FREE', is_active: false, current_period_end: '2099-01-01T00:00:00Z' };
  globalThis.fetch = async () => new Response(JSON.stringify({ id: ownerId }), { status: 200 });
});

test('one web editor seat is enforced independently of legacy max_devices', async () => {
  otherWebCount = 1;
  const result = await (await onRequestPost(request('Web SaaS'))).json();
  assert.equal(result.code, 'EXCEED_MAX_DEVICES');
  assert.equal(result.max_devices, 1);
  assert.ok(calls.some(({ statement }) => statement.includes('FROM public.users WHERE id') && statement.includes('FOR UPDATE')));
  assert.ok(calls.some(({ statement }) => statement.includes("'web saas', 'web browser'") && statement.includes('SELECT count(*)::int')));
  assert.equal(calls.at(-1).statement, 'COMMIT');
});

test('desktop activation does not consume or check the web seat', async () => {
  otherWebCount = 1;
  const result = await (await onRequestPost(request('Desktop App'))).json();
  assert.equal(result.success, true);
  assert.equal(calls.some(({ statement }) => statement.includes('SELECT count(*)::int')), false);
});

test('reader and expired plans do not get editor seats', async () => {
  subscription.plan_name = 'READER';
  const result = await (await onRequestPost(request('Web SaaS'))).json();
  assert.equal(result.code, 'RESTRICTED_PLAN');
  assert.equal(result.max_devices, 0);
  assert.equal(calls.some(({ statement }) => statement.includes('SELECT count(*)::int')), false);
});

test('desktop-only plan cannot activate a web editor session', async () => {
  subscription.plan_name = 'ELITEPRO';
  subscription.plan_status = 'ACTIVE';
  subscription.is_active = true;
  const webResult = await (await onRequestPost(request('Web SaaS'))).json();
  assert.equal(webResult.code, 'RESTRICTED_PLAN');
  const desktopResult = await (await onRequestPost(request('Desktop App'))).json();
  assert.equal(desktopResult.success, true);
});

test('web activation requires authentication and subscription ownership', async () => {
  const anonymous = await onRequestPost(request('Web SaaS', false, false));
  assert.equal(anonymous.status, 401);
  assert.equal(calls.length, 0);
  globalThis.fetch = async () => new Response(JSON.stringify({ id: '44444444-4444-4444-8444-444444444444' }), { status: 200 });
  const otherUser = await (await onRequestPost(request('Web SaaS'))).json();
  assert.equal(otherUser.code, 'FORBIDDEN');
  assert.equal(calls.some(({ statement }) => statement.includes('INSERT INTO public.license_activations')), false);
});

test('web takeover requires owner authentication and deletes only other web sessions', async () => {
  const denied = await onRequestPost(request('Web SaaS', true, false));
  assert.equal(denied.status, 401);
  assert.equal(calls.length, 0);

  const accepted = await (await onRequestPost(request('Web SaaS', true, true))).json();
  assert.equal(accepted.success, true);
  assert.ok(calls.some(({ statement, params }) => statement.includes('DELETE FROM public.license_activations') &&
    statement.includes("'web saas', 'web browser'") && params[0] === ownerId && params[2] === 'this-tab'));
});
