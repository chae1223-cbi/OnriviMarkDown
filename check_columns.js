const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres'
  });
  await client.connect();
  
  const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'license_activations'");
  console.log(res.rows.map(r => r.column_name));
  
  await client.end();
}
run().catch(console.error);
