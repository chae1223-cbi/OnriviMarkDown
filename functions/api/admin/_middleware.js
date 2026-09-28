// 🚨 @PATCH : 2026-09-28 — 사용자 요금제 수동 변경 API를 SUPER 전용 쓰기 경로로 보호
import { checkAdminAuth, jsonResponse } from './_shared.js';

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') return context.next();
  try {
    const auth = await checkAdminAuth(context.request, context.env);
    if (auth.error) return jsonResponse({ error: auth.error }, auth.status);

    const path = new URL(context.request.url).pathname;
    const superOnlyWrite = context.request.method !== 'GET' && (
      path === '/api/admin/admins' || path.startsWith('/api/admin/common-codes') ||
      path === '/api/admin/plans' || path === '/api/admin/users/plan'
    );
    if (superOnlyWrite && auth.adminData.admin_role !== 'SUPER') {
      return jsonResponse({ error: 'SUPER role required' }, 403);
    }

    const headers = new Headers(context.request.headers);
    headers.set('x-verified-admin-id', auth.user.id);
    headers.set('x-verified-admin-role', auth.adminData.admin_role);
    return context.next(new Request(context.request, { headers }));
  } catch {
    return jsonResponse({ error: 'Admin authentication unavailable' }, 503);
  }
}
