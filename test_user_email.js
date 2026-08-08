require('dotenv').config({ path: './frontend/.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  try {
    const res = await pool.query(`SELECT id FROM users WHERE email = 'onrivi@naver.com'`);
    console.log(res.rows);
  } catch (e) {
    console.error('ERROR:', e.message);
  }
}
check();
