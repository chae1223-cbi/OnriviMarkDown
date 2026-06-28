const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres'
  });
  await client.connect();

  try {
    const res1 = await client.query("SELECT id FROM software_licenses LIMIT 1");
    if (res1.rows.length === 0) return;
    const license_id = res1.rows[0].id;
    console.log("Using license_id:", license_id);

    // Call the RPC like the app does!
    const uuid3 = '33333333-3333-3333-3333-333333333333';
    const rpcQuery = `SELECT * FROM insert_license_activation($1, $2, 'Browser Test 3')`;
    const rpcRes = await client.query(rpcQuery, [license_id, uuid3]);
    console.log("RPC call result:", rpcRes.rows[0]);

    const res2 = await client.query("SELECT * FROM license_activations WHERE license_id = $1", [license_id]);
    console.log("Total rows for this license after RPC:", res2.rows.length);

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.end();
  }
}
run();
