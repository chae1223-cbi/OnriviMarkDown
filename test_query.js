const { Client } = require('pg');
async function run() {
  const c = new Client({ connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres' });
  await c.connect();
  const res = await c.query("SELECT * FROM public.subscriptions WHERE user_id = (SELECT id FROM public.users WHERE email = 'onrivi@naver.com') AND is_active = true AND plan_status IN ('ACTIVE', 'FREE') AND (plan_name LIKE '%데스크탑%' OR plan_name = 'ELITEPRO') ORDER BY current_period_end DESC LIMIT 1;");
  console.log(JSON.stringify(res.rows, null, 2));
  await c.end();
}
run();
