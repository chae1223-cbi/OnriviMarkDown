require('dotenv').config({ path: './frontend/.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  try {
    const res = await pool.query(`
      SELECT * FROM license_activations 
      WHERE subscription_id = '9c20c900-da60-4af0-9be5-f51623909c40'
    `);
    console.log(res.rows);
  } catch (e) {
    console.error(e);
  }
}
check();
