const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres'
  });
  await client.connect();
  
  const res = await client.query(`
    SELECT device_uuid, device_name, activated_at, last_active_at 
    FROM license_activations WHERE license_id = (
      SELECT id FROM software_licenses WHERE payment_no = 'PAY-20260628-2F11B90A'
    );
  `);
  
  console.table(res.rows);
  
  await client.end();
}
run().catch(console.error);
