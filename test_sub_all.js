require('dotenv').config({ path: './frontend/.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  try {
    const res = await pool.query(`
      SELECT id, payment_no, plan_status, is_active FROM subscriptions 
      WHERE user_id = (SELECT id FROM users WHERE email = 'chae1223@naver.com' LIMIT 1)
      ORDER BY created_at DESC
    `);
    console.log(res.rows);
  } catch (e) {
    console.error(e);
  }
}
check();
