import postgres from 'postgres';
const db = postgres('postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres', { max: 1 });

async function run() {
  try {
    await db`DELETE FROM license_activations`;
    console.log('All activations deleted');
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
