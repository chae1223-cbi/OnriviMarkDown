const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres'
  });
  await client.connect();
  
  const res = await client.query("SELECT pg_get_functiondef(oid) AS def FROM pg_proc WHERE proname = 'deactivate_session_on_logout'");
  if (res.rows.length > 0) {
    console.log(res.rows[0].def);
  } else {
    console.log('Not found');
  }
  
  await client.end();
}
run().catch(console.error);
