const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres'
  });
  await client.connect();
  
  const licenseRes = await client.query("SELECT id FROM software_licenses WHERE payment_no = 'PAY-20260628-2F11B90A'");
  const licenseId = licenseRes.rows[0].id;

  // Insert Chrome
  await client.query("SELECT insert_license_activation($1, 'chrome-uuid', 'Web SaaS Chrome')", [licenseId]);
  
  // Insert Edge
  await client.query("SELECT insert_license_activation($1, 'edge-uuid', 'Web SaaS Edge')", [licenseId]);

  // Check Edge session
  const chkEdge = await client.query("SELECT * FROM check_license_session('PAY-20260628-2F11B90A', 'edge-uuid')");
  console.log('Edge Check:', chkEdge.rows[0]);

  // Check Chrome session
  const chkChrome = await client.query("SELECT * FROM check_license_session('PAY-20260628-2F11B90A', 'chrome-uuid')");
  console.log('Chrome Check:', chkChrome.rows[0]);

  await client.end();
}
run().catch(console.error);
