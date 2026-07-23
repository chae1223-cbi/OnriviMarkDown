import postgres from 'postgres';
const sql = postgres('postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres', { max: 1 });
async function run() {
  try {
    const tableInfo = await sql`
      SELECT column_name, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'license_activations'
    `;
    console.log('Columns:', tableInfo);
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
