const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres'
  });
  await client.connect();
  
  const res = await client.query("SELECT delete_license_activation('PAY-20260628-2F11B90A', 'chrome-uuid-2')");
  console.log('Result:', res.rows[0]);
  
  const check = await client.query("SELECT * FROM license_activations WHERE device_uuid = 'chrome-uuid-2'");
  console.log('Exists?', check.rows.length > 0);
  
  await client.end();
}
run().catch(console.error);
