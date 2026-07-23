import postgres from 'postgres';
const sql = postgres('postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres', { max: 1 });

async function testQuery() {
  try {
    const actRows = await sql`SELECT * FROM license_activations`;
    console.log('activations:', actRows);
  } catch(e) {
    console.error(e);
  }
  await sql.end();
}
testQuery();
