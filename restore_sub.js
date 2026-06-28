const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres'
  });
  await client.connect();
  
  await client.query(`
    UPDATE subscriptions
    SET plan_status = 'ACTIVE', is_expired = 'N'
    WHERE id = 'dd594a3f-12f0-4aa8-a8b9-50c1fb75db10';
  `);
  
  console.log('Restored Desktop subscription');
  
  await client.end();
}
run().catch(console.error);
