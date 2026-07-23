import postgres from 'postgres';
const sql = postgres('postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres', { max: 1 });
async function run() {
  try {
    const res = await sql`SELECT relrowsecurity FROM pg_class WHERE relname = 'subscriptions'`;
    console.log(res);
  } catch (e) { console.error(e); } finally { sql.end(); }
}
run();
