require('dotenv').config({ path: './frontend/.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  try {
    const res = await pool.query(`
      DELETE FROM license_activations
      WHERE subscription_id = (SELECT id FROM subscriptions WHERE payment_no = 'PAY-20260722-51EC413B' LIMIT 1)
      AND device_uuid = 'test-uuid-123'
      RETURNING *
    `);
    console.log("Deleted:", res.rows);
  } catch (e) {
    console.error(e);
  }
}
check();
