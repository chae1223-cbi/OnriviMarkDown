const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres'
  });
  await client.connect();

  try {
    // 1. Get an existing license_id
    const res1 = await client.query("SELECT id FROM software_licenses LIMIT 1");
    if (res1.rows.length === 0) {
      console.log("No licenses found");
      return;
    }
    const license_id = res1.rows[0].id;
    console.log("Using license_id:", license_id);

    // 2. Try inserting UUID 1
    const uuid1 = '11111111-1111-1111-1111-111111111111';
    await client.query(`
      INSERT INTO license_activations (license_id, device_uuid, device_name, activated_at, last_active_at)
      VALUES ($1, $2, 'Test Device 1', now(), now())
      ON CONFLICT (license_id, device_uuid) DO UPDATE SET last_active_at = now()
    `, [license_id, uuid1]);
    console.log("Inserted UUID 1 successfully");

    // 3. Try inserting UUID 2
    const uuid2 = '22222222-2222-2222-2222-222222222222';
    await client.query(`
      INSERT INTO license_activations (license_id, device_uuid, device_name, activated_at, last_active_at)
      VALUES ($1, $2, 'Test Device 2', now(), now())
      ON CONFLICT (license_id, device_uuid) DO UPDATE SET last_active_at = now()
    `, [license_id, uuid2]);
    console.log("Inserted UUID 2 successfully");

    // 4. Check contents
    const res2 = await client.query("SELECT * FROM license_activations WHERE license_id = $1", [license_id]);
    console.log("Total rows for this license:", res2.rows.length);

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.end();
  }
}
run();
