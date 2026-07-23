import postgres from 'postgres';
const sql = postgres('postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres', { max: 1 });
async function check() {
  try {
    const res = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'license_activations'`;
    console.log('Columns for license_activations:', res.map(r => r.column_name).join(', '));
  } catch(e) { console.error(e); }
  await sql.end();
}
check();
