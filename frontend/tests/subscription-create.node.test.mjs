import test from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import { onRequestPost } from '../functions/api/subscription/create.js';

const userId = '22222222-2222-4222-8222-222222222222';
const original = { connect: pg.Client.prototype.connect, query: pg.Client.prototype.query, end: pg.Client.prototype.end, fetch: globalThis.fetch };
const calls = [];
let plan;
let previous;
let current;
let failInsert;

pg.Client.prototype.connect = async () => {};
pg.Client.prototype.end = async () => {};
pg.Client.prototype.query = async (statement, params = []) => {
  calls.push({ statement, params });
  if (statement.includes('FROM public.users')) return { rows: [{ id: userId }] };
  if (statement.includes('FROM public.pricing_plans')) return { rows: plan ? [plan] : [] };
  if (statement.includes("plan_name <> 'READER'")) return { rows: previous ? [previous] : [] };
  if (statement.includes("plan_status IN ('ACTIVE', 'FREE')")) return { rows: current ? [current] : [] };
  if (failInsert && statement.includes('INSERT INTO public.subscriptions')) throw new Error('simulated database error');
  return { rows: [] };
};

test.after(() => {
  Object.assign(pg.Client.prototype, { connect: original.connect, query: original.query, end: original.end });
  globalThis.fetch = original.fetch;
});
test.beforeEach(() => {
  calls.length = 0;
  plan = { plan_code: 'APPRENTICE', sys_type: 'WEB', is_free: true, price_monthly: null, price_yearly: null };
  previous = null;
  current = { plan_name: 'READER', billing_cycle: 'FREE' };
  failInsert = false;
  globalThis.fetch = async () => new Response(JSON.stringify({ id: userId }), { status: 200 });
});

const request = (planCode = 'APPRENTICE', interval = 'trial', token = true) => ({
  request: new Request('https://onrivi.com/api/subscription/create', {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer token' } : {}) },
    body: JSON.stringify({ p_user_id: userId, p_plan_name: planCode, p_billing_interval: interval, p_device_uuid: 'tab-1' }),
  }),
  env: { HYPERDRIVE: { connectionString: 'postgres://test:test@localhost/test' }, NEXT_PUBLIC_SUPABASE_URL: 'https://supabase.test', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon' },
});

test('free application is blocked by any previous non-Reader subscription before writes', async () => {
  previous = { plan_name: 'REGULAR' };
  const result = await onRequestPost(request());
  assert.equal(result.status, 409);
  assert.equal((await result.json()).code, 'FREE_ALREADY_USED');
  assert.ok(calls.some(({ statement }) => statement.includes('FOR UPDATE')));
  assert.equal(calls.some(({ statement }) => statement.includes('UPDATE public.subscriptions')), false);
});

test('new free application uses one transaction and creates a web activation', async () => {
  const result = await onRequestPost(request());
  assert.equal(result.status, 200);
  assert.ok(calls.some(({ statement, params }) => statement.includes('INSERT INTO public.subscriptions') && params.includes('7 days') && params.includes(0)));
  assert.ok(calls.some(({ statement }) => statement.includes('INSERT INTO public.license_activations')));
  assert.equal(calls.at(-1).statement, 'COMMIT');
});

test('paid plan and billing cycle are validated from active pricing row', async () => {
  plan = { plan_code: 'REGULAR', sys_type: 'WEB', is_free: false, price_monthly: 3000, price_yearly: 30000 };
  const result = await onRequestPost(request('REGULAR', 'year'));
  assert.equal(result.status, 200);
  assert.ok(calls.some(({ statement, params }) => statement.includes('INSERT INTO public.subscriptions') && params.includes('1 year') && params.includes(30000)));
});

test('desktop plan does not create a browser activation', async () => {
  plan = { plan_code: 'ELITEPRO', sys_type: 'DESKTOP', is_free: false, price_monthly: null, price_yearly: 45000 };
  const result = await onRequestPost(request('ELITEPRO', 'year'));
  assert.equal(result.status, 200);
  assert.equal(calls.some(({ statement }) => statement.includes('INSERT INTO public.license_activations')), false);
});

test('database failure rolls back the prior subscription change', async () => {
  failInsert = true;
  const result = await onRequestPost(request());
  assert.equal(result.status, 500);
  assert.ok(calls.some(({ statement }) => statement === 'ROLLBACK'));
  assert.equal(calls.some(({ statement }) => statement === 'COMMIT'), false);
});

test('unauthenticated application never touches the database', async () => {
  const result = await onRequestPost(request('APPRENTICE', 'trial', false));
  assert.equal(result.status, 401);
  assert.equal(calls.length, 0);
});

test('inactive or missing pricing plan cannot change a subscription', async () => {
  plan = null;
  const result = await onRequestPost(request());
  assert.equal(result.status, 400);
  assert.equal((await result.json()).code, 'PLAN_NOT_AVAILABLE');
  assert.equal(calls.some(({ statement }) => statement.includes('UPDATE public.subscriptions')), false);
});

test('paid plan rejects a billing cycle without a price', async () => {
  plan = { plan_code: 'ELITEPRO', sys_type: 'DESKTOP', is_free: false, price_monthly: null, price_yearly: 45000 };
  const result = await onRequestPost(request('ELITEPRO', 'month'));
  assert.equal(result.status, 400);
  assert.equal((await result.json()).code, 'INVALID_CYCLE');
  assert.equal(calls.some(({ statement }) => statement.includes('UPDATE public.subscriptions')), false);
});
