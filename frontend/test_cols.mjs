import postgres from 'postgres';
const sql = postgres('postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres', { max: 1 });
async function check() {
  try {
    const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'imsi_license_activations'`;
    console.log(cols.map(c => c.column_name).join(', '));
  } catch(e) { console.error(e); }
  await sql.end();
}
check();
