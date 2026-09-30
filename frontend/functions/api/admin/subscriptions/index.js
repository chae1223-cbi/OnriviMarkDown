import { withBlogTransaction, blogJson } from '../../blog/_db.js';
import { checkAdminAuth } from '../_shared.js';

export async function onRequestGet({ request, env }) {
  const auth = await checkAdminAuth(request, env);
  if (auth.error) return blogJson({ success: false, error: auth.error }, auth.status || 403);
  const params = new URL(request.url).searchParams;
  const page = Number(params.get('page') || 1);
  const search = (params.get('search') || '').trim();
  const status = params.get('status') || 'ALL';
  const plan = params.get('plan') || 'ALL';
  const grant = params.get('grant') || 'ALL';
  const attention = params.get('attention') || 'ALL';
  if (!Number.isInteger(page) || page < 1 || page > 100000 || search.length > 200 ||
      !['ALL', 'ACTIVE', 'CANCELED', 'EXPIRED'].includes(status) ||
      !['ALL', 'EXPIRING_7', 'EXPIRING_30', 'OVER_LIMIT', 'STALE_ACTIVE'].includes(attention) ||
      !['ALL', 'ADMIN_FREE', 'ADMIN_PAID', 'TRIAL', 'UNKNOWN'].includes(grant) ||
      (plan !== 'ALL' && !/^[A-Z][A-Z0-9_]{1,49}$/.test(plan))) {
    return blogJson({ success: false, error: '검색 조건이 올바르지 않습니다.' }, 400);
  }
  try {
    const result = await withBlogTransaction(env, async db => {
      const stats = await db.query(`
        WITH device_counts AS (SELECT subscription_id, count(*)::int AS devices FROM public.license_activations WHERE is_active = true GROUP BY subscription_id)
        SELECT count(*) FILTER (WHERE s.is_active AND s.plan_status = 'ACTIVE' AND s.current_period_end > now())::int AS active,
          count(*) FILTER (WHERE s.is_active AND s.plan_status = 'ACTIVE' AND s.current_period_end BETWEEN now() AND now() + interval '7 days')::int AS expiring_7,
          count(*) FILTER (WHERE s.is_active AND s.plan_status = 'ACTIVE' AND s.current_period_end BETWEEN now() AND now() + interval '30 days')::int AS expiring_30,
          count(*) FILTER (WHERE s.is_active AND s.current_period_end <= now())::int AS stale_active,
          coalesce(sum(d.devices), 0)::int AS devices,
          count(*) FILTER (WHERE coalesce(d.devices, 0) > s.max_devices)::int AS over_limit
        FROM public.subscriptions s LEFT JOIN device_counts d ON d.subscription_id = s.id`);
      const term = `%${search.replace(/[\\%_]/g, '\\$&')}%`;
      const rows = await db.query(`
        WITH device_counts AS (SELECT subscription_id, count(*)::int AS devices FROM public.license_activations WHERE is_active = true GROUP BY subscription_id)
        SELECT s.id, s.user_id, u.email, s.plan_name, s.plan_status, s.billing_cycle,
          s.is_active, s.current_period_start, s.current_period_end, s.max_devices,
          s.created_at, s.updated_at, coalesce(d.devices, 0)::int AS devices,
          CASE WHEN s.payment_no LIKE 'ADMIN-FREE-%' THEN 'ADMIN_FREE'
               WHEN s.payment_no LIKE 'ADMIN-PAID-%' THEN 'ADMIN_PAID'
               WHEN s.billing_cycle = 'TRIAL' THEN 'TRIAL' ELSE 'UNKNOWN' END AS grant_type,
          count(*) OVER()::int AS total
        FROM public.subscriptions s JOIN public.users u ON u.id = s.user_id
        LEFT JOIN device_counts d ON d.subscription_id = s.id
        WHERE ($1 = '' OR u.email ILIKE $2 ESCAPE '\\' OR s.user_id::text = $1)
          AND ($3 = 'ALL' OR s.plan_status = $3)
          AND ($4 = 'ALL' OR s.plan_name = $4)
          AND ($7 = 'ALL' OR
            ($7 = 'ADMIN_FREE' AND s.payment_no LIKE 'ADMIN-FREE-%') OR
            ($7 = 'ADMIN_PAID' AND s.payment_no LIKE 'ADMIN-PAID-%') OR
            ($7 = 'TRIAL' AND s.billing_cycle = 'TRIAL' AND coalesce(s.payment_no, '') NOT LIKE 'ADMIN-%') OR
            ($7 = 'UNKNOWN' AND s.billing_cycle <> 'TRIAL' AND coalesce(s.payment_no, '') NOT LIKE 'ADMIN-%'))
          AND ($5 = 'ALL'
            OR ($5 = 'EXPIRING_7' AND s.is_active AND s.plan_status = 'ACTIVE' AND s.current_period_end BETWEEN now() AND now() + interval '7 days')
            OR ($5 = 'EXPIRING_30' AND s.is_active AND s.plan_status = 'ACTIVE' AND s.current_period_end BETWEEN now() AND now() + interval '30 days')
            OR ($5 = 'OVER_LIMIT' AND coalesce(d.devices, 0) > s.max_devices)
            OR ($5 = 'STALE_ACTIVE' AND s.is_active AND s.current_period_end <= now()))
        ORDER BY s.created_at DESC, s.id DESC LIMIT 20 OFFSET $6`, [search, term, status, plan, attention, (page - 1) * 20, grant]);
      return { stats: stats.rows[0], rows: rows.rows };
    });
    return blogJson({ success: true, data: result.rows.map(({ total, ...row }) => row), total: result.rows[0]?.total || 0, stats: result.stats, canManage: auth.adminData.admin_role === 'SUPER', asOf: new Date().toISOString() });
  } catch (error) {
    console.error('[admin/subscriptions] GET failed', error);
    return blogJson({ success: false, error: '구독 현황을 불러오지 못했습니다.' }, 500);
  }
}
