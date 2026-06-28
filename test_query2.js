const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres'
  });
  await client.connect();
  
  const res = await client.query(`
    SELECT id FROM users WHERE email = 'chae1223@naver.com';
  `);
  
  const userId = res.rows[0].id;
  
  const res2 = await client.query(`
    SELECT id, plan_name, plan_status, trial_end_at, current_period_end, max_devices
    FROM subscriptions
    WHERE user_id = $1
      AND plan_status IN ('ACTIVE', 'FREE')
      AND plan_name NOT LIKE '%데스크탑%'
    ORDER BY current_period_end DESC
    LIMIT 1;
  `, [userId]);
  
  console.log('userSub:', res2.rows[0]);
  
  if (res2.rows.length > 0) {
    const res3 = await client.query(`
      SELECT license_key, payment_no FROM software_licenses WHERE subscription_id = $1 LIMIT 1;
    `, [res2.rows[0].id]);
    console.log('userLic:', res3.rows[0]);
  }
  
  await client.end();
}
run().catch(console.error);
