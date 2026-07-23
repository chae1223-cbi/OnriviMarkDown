import postgres from 'postgres';

const sql = postgres('postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres', {
  max: 1, idle_timeout: 5, connect_timeout: 10
});

const userId = '5f026af9-3835-4290-b5a7-debccbace4fa'; // bhchae76@gmail.com

try {
  const allSubs = await sql`
    SELECT s.id, s.user_id, s.plan_name, s.plan_status, s.billing_cycle,
      s.current_period_start, s.current_period_end, s.is_active, s.created_at,
      COALESCE(c_plan.code_name, s.plan_name) AS plan_name_kr,
      COALESCE(c_cycle.code_name, s.billing_cycle) AS billing_cycle_kr,
      COALESCE(c_status.code_name, s.plan_status) AS plan_status_kr
    FROM imsi_subscriptions s
    LEFT JOIN common_codes c_plan ON c_plan.group_code = 'PLAN_NAME' AND UPPER(c_plan.code_value) = UPPER(s.plan_name)
    LEFT JOIN common_codes c_cycle ON c_cycle.group_code = 'BILLING_CYCLE' AND UPPER(c_cycle.code_value) = UPPER(s.billing_cycle)
    LEFT JOIN common_codes c_status ON c_status.group_code = 'PLAN_STATUS' AND UPPER(c_status.code_value) = UPPER(s.plan_status)
    WHERE s.user_id = ${userId}
    ORDER BY s.created_at DESC
  `;
  console.log('✅ allSubs count:', allSubs.length);
  console.log(JSON.stringify(allSubs, null, 2));
} catch(e) {
  console.error('❌ SQL ERROR:', e.message);
} finally {
  await sql.end();
}
