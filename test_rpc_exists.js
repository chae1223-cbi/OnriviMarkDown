const { Client } = require('pg');
async function run() {
  const c = new Client({ connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres' });
  await c.connect();
  const res = await c.query(`
    SELECT proname 
    FROM pg_proc 
    WHERE proname IN ('verify_desktop_license', 'check_license_session', 'insert_license_activation');
  `);
  console.log(res.rows);
  await c.end();
}
run();
