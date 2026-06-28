const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres'
  });
  await client.connect();
  
  const res = await client.query("SELECT * FROM check_license_session('PAY-20260628-2F11B90A', 'fake-uuid-1')");
  console.log(res.rows[0]);
  
  await client.end();
}
run().catch(console.error);
