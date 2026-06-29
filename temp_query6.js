const { Client } = require('pg');

async function getWebRPC() {
  const client = new Client({ connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres' });
  await client.connect();
  const res = await client.query("SELECT prosrc FROM pg_proc WHERE proname = 'subscribe_user_plan'");
  console.log(res.rows[0]?.prosrc);
  await client.end();
}
getWebRPC().catch(console.error);
