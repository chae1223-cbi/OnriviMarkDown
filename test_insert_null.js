require('dotenv').config({ path: './frontend/.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function testInsertNull() {
  try {
    const res = await pool.query(`
      INSERT INTO license_activations (subscription_id, device_uuid, device_name, activated_at, is_active)
      VALUES ('9c20c900-da60-4af0-9be5-f51623909c40', 'test-null-user', 'Web SaaS', now(), true)
      RETURNING *
    `);
    console.log("Inserted without user:", res.rows);
  } catch (e) {
    console.error("DB Error:", e);
  }
}

testInsertNull();
