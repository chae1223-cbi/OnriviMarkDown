import postgres from 'postgres';
const sql = postgres('postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres', { max: 1 });

async function run() {
  try {
    const actRows = await sql`SELECT * FROM license_activations`;
    console.log('Current activations:', actRows);
    
    // Find an active subscription
    const subs = await sql`SELECT id FROM subscriptions ORDER BY created_at DESC LIMIT 1`;
    console.log('Latest Sub:', subs[0]);

  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}
run();
