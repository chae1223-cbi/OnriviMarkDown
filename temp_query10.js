const { Client } = require('pg');

async function checkSecDefUser() {
  const client = new Client({ connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres' });
  await client.connect();
  const res = await client.query("SELECT prosecdef FROM pg_proc WHERE proname = 'subscribe_user_plan'");
  console.log(res.rows[0]);
  await client.end();
}
checkSecDefUser().catch(console.error);
