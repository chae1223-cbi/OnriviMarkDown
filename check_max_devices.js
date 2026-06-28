const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres'
  });
  await client.connect();
  
  const res = await client.query("SELECT s.max_devices FROM subscriptions s JOIN software_licenses l ON l.subscription_id = s.id WHERE l.payment_no = 'PAY-20260628-2F11B90A'");
  console.log('MAX DEVICES:', res.rows[0]);
  
  await client.end();
}
run().catch(console.error);
