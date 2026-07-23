import postgres from 'postgres';
const sql = postgres('postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres', { max: 1 });
async function check() {
  try {
    const constraints = await sql`
      SELECT conname, contype 
      FROM pg_constraint 
      WHERE conrelid = 'public.license_activations'::regclass;
    `;
    console.log('Constraints on license_activations:', constraints);
  } catch(e) { console.error(e); }
  await sql.end();
}
check();
