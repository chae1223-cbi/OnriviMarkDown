import postgres from 'postgres';
const sql = postgres('postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres', { max: 1 });
async function run() {
  try {
    const res = await sql`SELECT id, user_id, plan_name, payment_no, is_active FROM subscriptions ORDER BY created_at DESC LIMIT 5`;
    console.log(res);
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
