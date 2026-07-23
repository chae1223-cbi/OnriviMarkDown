import postgres from 'postgres';
const sql = postgres('postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres', { max: 1 });
async function run() {
  try {
    const res = await sql`SELECT id, user_id, plan_name, plan_status, is_active, current_period_end, created_at, payment_no FROM subscriptions LIMIT 10`;
    console.log(res);
  } catch (e) { console.error(e); } finally { sql.end(); }
}
run();
