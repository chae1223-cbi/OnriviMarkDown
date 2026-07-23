const { Client } = require('pg');
async function run() {
  const c = new Client({ connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres' });
  await c.connect();
  const res = await c.query("SELECT * FROM public.users WHERE email = 'onrivi@naver.com';");
  console.log(JSON.stringify(res.rows, null, 2));
  await c.end();
}
run();
