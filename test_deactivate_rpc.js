const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres'
  });
  await client.connect();
  
  // Re-insert Chrome
  const licenseRes = await client.query("SELECT id FROM software_licenses WHERE payment_no = 'PAY-20260628-2F11B90A'");
  const licenseId = licenseRes.rows[0].id;
  await client.query("SELECT insert_license_activation($1, 'chrome-uuid-2', 'Web SaaS Chrome')", [licenseId]);
  
  // Test deactivate_session_on_logout
  const res = await client.query("SELECT deactivate_session_on_logout('PAY-20260628-2F11B90A', 'chrome-uuid-2')");
  console.log('Result:', res.rows[0]);
  
  const check = await client.query("SELECT * FROM license_activations WHERE device_uuid = 'chrome-uuid-2'");
  console.log('Exists?', check.rows.length > 0);
  
  await client.end();
}
run().catch(console.error);
