const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres'
  });
  await client.connect();
  
  const res = await client.query("SELECT proname, pg_get_functiondef(oid) FROM pg_proc WHERE proname IN ('insert_license_activation', 'check_license_session', 'verify_desktop_license')");
  console.log(res.rows.map(r => r.pg_get_functiondef).join('\n\n'));
  
  await client.end();
}
run().catch(console.error);
