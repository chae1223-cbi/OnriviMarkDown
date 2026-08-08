require('dotenv').config({ path: './frontend/.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  try {
    const userRes = await pool.query(`SELECT id FROM users WHERE email = 'chae1223@naver.com'`);
    const userId = userRes.rows[0].id;
    
    console.log('User ID:', userId);

    const updateRes = await pool.query(`
      UPDATE subscriptions
      SET plan_status = 'EXPIRED',
          is_active = false,
          updated_at = now()
      WHERE user_id = $1
        AND current_period_end < now()
        AND plan_status != 'EXPIRED'
      RETURNING *;
    `, [userId]);

    console.log('Update result:', updateRes.rows);
  } catch (e) {
    console.error('ERROR:', e.message);
  }
}
check();
