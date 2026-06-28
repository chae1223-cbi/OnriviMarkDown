const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres'
  });
  await client.connect();
  
  const res = await client.query("SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'license_activations'");
  console.log(res.rows);
  
  await client.end();
}
run().catch(console.error);
