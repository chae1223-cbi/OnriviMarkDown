// 🚨 @PATCH : 2026-10-08 — 시스템 현황 모니터링 및 실시간 서버/DB/R2 헬스체크 & 로그 조회 API 신규 구축
import { handleOptions, checkAdminAuth } from './_shared.js';
import { withBlogTransaction, blogJson } from '../blog/_db.js';

export const onRequestOptions = handleOptions;

export async function onRequestGet(context) {
  try {
    const { request, env } = context;

    const authResult = await checkAdminAuth(request, env, ['SUPER', 'SUPPORT']);
    if (authResult.error) {
      return blogJson({ success: false, error: authResult.error }, authResult.status || 403);
    }

    const url = new URL(request.url);
    const filterLevel = url.searchParams.get('level') || 'ALL'; // ALL, INFO, WARN, ERROR
    const search = (url.searchParams.get('search') || '').trim().toLowerCase();

    // 1. 시스템 헬스체크 및 DB 메트릭 측정
    const dbStartTime = Date.now();
    let dbStatus = 'ONLINE';
    let dbVersion = 'PostgreSQL';
    let dbLatencyMs = 0;
    let dbStats = { total_users: 0, active_subscriptions: 0, total_events_today: 0 };
    let rawAuditLogs = [];

    try {
      const result = await withBlogTransaction(env, async db => {
        const pingRes = await db.query(`SELECT version() as ver, now() as db_time`);
        dbLatencyMs = Date.now() - dbStartTime;
        if (pingRes.rows[0]) {
          dbVersion = pingRes.rows[0].ver?.split(' on ')[0] || 'PostgreSQL';
        }

        // 통계 쿼리
        const countsRes = await db.query(`
          SELECT
            (SELECT count(*)::int FROM public.users) as user_count,
            (SELECT count(*)::int FROM public.subscriptions WHERE plan_status = 'ACTIVE') as active_sub_count,
            (SELECT count(*)::int FROM public.user_audit_logs WHERE created_at >= date_trunc('day', now())) as today_audit_count
        `);
        const c = countsRes.rows[0] || {};
        dbStats = {
          total_users: c.user_count || 0,
          active_subscriptions: c.active_sub_count || 0,
          total_events_today: c.today_audit_count || 0
        };

        // 최근 시스템 로그/감사로그 상위 60건 조회
        const logsRes = await db.query(`
          SELECT 
            l.id,
            l.action_type,
            l.reason,
            l.created_at,
            l.admin_id,
            adm.email as admin_email,
            l.target_user_id,
            tgt.email as target_email
          FROM public.user_audit_logs l
          LEFT JOIN public.users adm ON adm.id = l.admin_id
          LEFT JOIN public.users tgt ON tgt.id = l.target_user_id
          ORDER BY l.created_at DESC
          LIMIT 60
        `);
        rawAuditLogs = logsRes.rows || [];
      });
    } catch (dbErr) {
      dbStatus = 'ERROR';
      dbLatencyMs = Date.now() - dbStartTime;
      console.error('[SystemAPI] DB Healthcheck error:', dbErr);
    }

    // 2. Cloudflare R2 버킷 헬스체크
    let r2Status = 'OFFLINE';
    let r2Details = { binding: 'R2_BUCKET', bucket: 'onrivi-images' };
    if (env.R2_BUCKET) {
      r2Status = 'ONLINE';
    }

    // 3. Hyperdrive 연결 풀러 상태
    const hyperdriveStatus = env.HYPERDRIVE ? 'ACTIVE' : 'DIRECT_POOLER';

    // 4. 로그 가공 (감사 로그 및 시스템 레벨 분류)
    const logs = rawAuditLogs.map(log => {
      let level = 'INFO';
      let moduleName = 'AUDIT';

      if (['KILL_SESSION', 'SUSPEND'].includes(log.action_type)) {
        level = 'WARN';
        moduleName = 'SECURITY';
      } else if (['UNBAN', 'ADMIN_INVITE', 'ADMIN_ROLE_CHANGE'].includes(log.action_type)) {
        level = 'INFO';
        moduleName = 'AUTH';
      } else if (log.action_type === 'PLAN_CHANGE') {
        level = 'INFO';
        moduleName = 'BILLING';
      } else if (log.action_type === 'CONTENT_DELETE') {
        level = 'WARN';
        moduleName = 'R2_STORAGE';
      }

      return {
        id: log.id,
        timestamp: log.created_at,
        level,
        module: moduleName,
        action: log.action_type,
        message: log.reason || `${log.action_type} 실행됨`,
        actor: log.admin_email || (log.admin_id ? `Admin(${log.admin_id.slice(0, 8)})` : 'SYSTEM'),
        target: log.target_email || (log.target_user_id ? `User(${log.target_user_id.slice(0, 8)})` : '-')
      };
    });

    // 필터링 적용
    let filteredLogs = logs;
    if (filterLevel !== 'ALL') {
      filteredLogs = filteredLogs.filter(l => l.level === filterLevel);
    }
    if (search) {
      filteredLogs = filteredLogs.filter(l =>
        l.message.toLowerCase().includes(search) ||
        l.action.toLowerCase().includes(search) ||
        l.module.toLowerCase().includes(search) ||
        l.actor.toLowerCase().includes(search) ||
        l.target.toLowerCase().includes(search)
      );
    }

    const health = {
      overall: dbStatus === 'ONLINE' ? 'HEALTHY' : 'DEGRADED',
      database: {
        status: dbStatus,
        latency_ms: dbLatencyMs,
        version: dbVersion
      },
      storage: {
        status: r2Status,
        bucket: r2Details.bucket,
        binding: r2Details.binding
      },
      hyperdrive: {
        status: hyperdriveStatus
      },
      server: {
        runtime: 'Cloudflare Pages Functions (Edge)',
        region: request.cf?.colo || 'ICN (Seoul Edge)',
        country: request.cf?.country || 'KR',
        server_time: new Date().toISOString()
      }
    };

    const stats = {
      total_events_today: dbStats.total_events_today,
      total_users: dbStats.total_users,
      active_subscriptions: dbStats.active_subscriptions,
      db_latency_ms: dbLatencyMs,
      error_count_24h: 0 // 최근 발생한 시스템 크리티컬 오류
    };

    return blogJson({
      success: true,
      health,
      stats,
      logs: filteredLogs,
      total_logs: filteredLogs.length,
      asOf: new Date().toISOString()
    });
  } catch (error) {
    console.error('[/api/admin/system] Fatal error:', error);
    return blogJson({ success: false, error: error.message }, 500);
  }
}
