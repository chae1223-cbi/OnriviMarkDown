const { Client } = require('pg');

async function checkUser() {
  const client = new Client({ connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres' });
  await client.connect();
  const res = await client.query("SELECT * FROM subscriptions WHERE user_id = (SELECT id FROM users WHERE email = 'chae1223@naver.com' LIMIT 1)");
  console.log(res.rows);
  await client.end();
}
checkUser().catch(console.error);
