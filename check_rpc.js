const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres'
  });
  await client.connect();
  
  const res = await client.query("SELECT pg_get_functiondef(oid) AS def FROM pg_proc WHERE proname = 'insert_license_activation'");
  console.log(res.rows[0].def);
  
  await client.end();
}
run().catch(console.error);
