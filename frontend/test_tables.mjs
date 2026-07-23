import postgres from 'postgres';
const sql = postgres('postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres', { max: 1 });
async function check() {
  try {
    const res = await sql`SELECT table_name FROM information_schema.tables WHERE table_name LIKE '%license_activations%'`;
    console.log('Tables:', res);
  } catch(e) { console.error(e); }
  await sql.end();
}
check();
