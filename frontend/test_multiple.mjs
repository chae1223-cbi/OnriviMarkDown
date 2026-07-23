import postgres from 'postgres';
const sql = postgres('postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres', { max: 1 });
async function run() {
  try {
    const res = await sql`
      SELECT user_id, COUNT(*) 
      FROM subscriptions 
      WHERE is_active = true AND plan_status IN ('ACTIVE', 'FREE') 
      GROUP BY user_id 
      HAVING COUNT(*) > 1
    `;
    console.log(res);
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
