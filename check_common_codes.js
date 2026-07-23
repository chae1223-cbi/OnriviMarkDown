const { Client } = require('pg');
async function run() {
  const c = new Client({ connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres' });
  await c.connect();
  const res = await c.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'common_codes';
  `);
  console.log(res.rows);
  const data = await c.query(`SELECT * FROM common_codes WHERE group_code = 'PLAN_NAME'`);
  console.log(data.rows);
  await c.end();
}
run().catch(console.error);
