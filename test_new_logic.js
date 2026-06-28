const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres'
  });
  await client.connect();
  
  const licenseRes = await client.query("SELECT id FROM software_licenses WHERE payment_no = 'PAY-20260628-2F11B90A'");
  const licenseId = licenseRes.rows[0].id;

  // 1. Chrome connects
  const res1 = await client.query("SELECT insert_license_activation($1, 'chrome-uuid', 'Web Chrome')", [licenseId]);
  console.log('Chrome Insert:', res1.rows[0]);
  
  // Wait 1 second
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 2. Edge connects
  const res2 = await client.query("SELECT insert_license_activation($1, 'edge-uuid', 'Web Edge')", [licenseId]);
  console.log('Edge Insert:', res2.rows[0]);
  
  // 3. Check DB
  const check = await client.query("SELECT * FROM license_activations");
  console.log('DB Activations:', check.rows.map(r => ({ uuid: r.device_uuid, name: r.device_name, time: r.activated_at })));
  
  await client.end();
}
run().catch(console.error);
