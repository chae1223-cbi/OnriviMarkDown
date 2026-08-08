require('dotenv').config({ path: './frontend/.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  try {
    const userRes = await pool.query(`SELECT id FROM users WHERE email = 'chae1223@naver.com'`);
    const userId = userRes.rows[0].id;
    const subRes = await pool.query(`SELECT plan_status, is_active, current_period_end, payment_no FROM subscriptions WHERE user_id = $1`, [userId]);
    console.log('Subscriptions:', subRes.rows);
  } catch (e) {
    console.error('ERROR:', e.message);
  }
}
check();
