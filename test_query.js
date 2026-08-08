require('dotenv').config({ path: './frontend/.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  try {
    const res = await pool.query(`
      SELECT * FROM license_activations 
      WHERE created_by = (SELECT id FROM users WHERE email = 'chae1223@naver.com' LIMIT 1)
    `);
    console.log(res.rows);
  } catch (e) {
    console.error(e);
  }
}
check();
