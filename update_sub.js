const { Client } = require('pg');
async function run() {
  const c = new Client({ connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres' });
  await c.connect();
  await c.query("UPDATE public.subscriptions SET plan_name = 'ELITEPRO' WHERE user_id = (SELECT id FROM public.users WHERE email = 'chae1223@gmail.com');");
  console.log("Updated to ELITEPRO");
  await c.end();
}
run();
