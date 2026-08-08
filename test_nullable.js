require('dotenv').config({ path: './frontend/.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  try {
    const res = await pool.query(`
      SELECT column_name, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'license_activations' AND column_name = 'subscription_id'
    `);
    console.log(res.rows);
  } catch (e) {
    console.error(e);
  }
}
check();
