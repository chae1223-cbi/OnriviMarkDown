const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres'
  });
  await client.connect();
  
  const res = await client.query("SELECT proname, pg_get_function_arguments(oid) FROM pg_proc WHERE proname LIKE '%delete_license_activation%'");
  console.log(res.rows);
  
  await client.end();
}
run().catch(console.error);
