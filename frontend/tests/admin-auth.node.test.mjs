import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from '../functions/api/admin/_middleware.js';

const env = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://db.example',
  SUPABASE_SERVICE_ROLE_KEY: 'service-key',
};
const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

function token(aal) {
  return `header.${Buffer.from(JSON.stringify({ sub: 'admin-1', aal })).toString('base64url')}.signature`;
}

function request(path, aal, method = 'GET', headers = {}) {
  return new Request(`https://site.example${path}`, {
    method,
    headers: { Authorization: `Bearer ${token(aal)}`, ...headers },
  });
}

function mockSupabase(role = 'SUPER') {
  globalThis.fetch = async url => new Response(
    JSON.stringify(String(url).includes('/auth/v1/user') ? { id: 'admin-1' } : [{ admin_role: role }]),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
}

test('rejects requests without a bearer token', async () => {
  const response = await onRequest({
    request: new Request('https://site.example/api/admin/users'), env,
    next: () => new Response('unexpected'),
  });
  assert.equal(response.status, 401);
});

test('rejects an authenticated admin before OTP completion', async () => {
  mockSupabase();
  const response = await onRequest({
    request: request('/api/admin/users', 'aal1'), env,
    next: () => new Response('unexpected'),
  });
  assert.equal(response.status, 403);
});

test('rejects SUPPORT from SUPER-only writes', async () => {
  mockSupabase('SUPPORT');
  const response = await onRequest({
    request: request('/api/admin/common-codes', 'aal2', 'POST'), env,
    next: () => new Response('unexpected'),
  });
  assert.equal(response.status, 403);
});

test('replaces a spoofed admin identity with the validated user id', async () => {
  mockSupabase();
  const response = await onRequest({
    request: request('/api/admin/users', 'aal2', 'GET', { 'x-verified-admin-id': 'attacker' }), env,
    next: req => new Response(req.headers.get('x-verified-admin-id')),
  });
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'admin-1');
});
