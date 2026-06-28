const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres'
  });
  await client.connect();
  
  const res = await client.query(`
    SELECT u.email, s.id, s.plan_name, s.plan_status, s.current_period_end, s.is_expired
    FROM subscriptions s
    JOIN users u ON s.user_id = u.id
    ORDER BY s.created_at DESC
    LIMIT 5;
  `);
  
  console.table(res.rows);
  
  await client.end();
}
run().catch(console.error);
