import postgres from 'postgres';
const sql = postgres('postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres', { max: 1 });
async function run() {
  try {
    const res = await sql`
      SELECT *
      FROM license_activations;
    `;
    console.log(res);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
