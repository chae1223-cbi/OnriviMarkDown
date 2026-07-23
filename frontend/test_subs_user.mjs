import postgres from 'postgres';
const sql = postgres('postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres', { max: 1 });
async function run() {
  try {
    const subs = await sql`SELECT user_id, plan_name, is_active FROM subscriptions`;
    console.log(subs);
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}
run();
