const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres'
  });
  await client.connect();
  
  const res = await client.query("SELECT proname FROM pg_proc WHERE proname LIKE '%license%' OR proname LIKE '%session%' OR proname LIKE '%device%'");
  console.log(res.rows.map(r => r.proname));
  
  await client.end();
}
run().catch(console.error);
