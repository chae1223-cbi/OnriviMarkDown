require('dotenv').config({ path: './frontend/.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  try {
    const res = await pool.query(`
      SELECT id, device_uuid, device_name, is_active, activated_at, updated_at
      FROM license_activations
      WHERE subscription_id = (SELECT id FROM subscriptions WHERE payment_no = 'PAY-20260722-51EC413B' LIMIT 1)
      ORDER BY activated_at ASC
    `);
    console.log("Current Activations:", res.rows);
  } catch (e) {
    console.error(e);
  }
}
check();
