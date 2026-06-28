const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres'
  });
  await client.connect();
  
  const licenseRes = await client.query("SELECT id FROM software_licenses WHERE payment_no = 'PAY-20260628-2F11B90A'");
  const licenseId = licenseRes.rows[0].id;

  const res = await client.query("SELECT insert_license_activation($1, 'chrome-test', 'Web Chrome')", [licenseId]);
  console.log('Insert Result:', res.rows[0]);
  
  const check = await client.query("SELECT * FROM license_activations");
  console.log('Activations in DB:', check.rows);
  
  await client.end();
}
run().catch(console.error);
