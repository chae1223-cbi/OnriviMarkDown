const { Client } = require('pg');
async function run() {
  const c = new Client({ connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres' });
  await c.connect();
  const res = await c.query("SELECT * FROM public.verify_desktop_license('chae1223@gmail.com', 'ECFA1E00-B0B1-11F0-B89B-6D88C0B84201');");
  console.log(JSON.stringify(res.rows[0], null, 2));
  await c.end();
}
run();
