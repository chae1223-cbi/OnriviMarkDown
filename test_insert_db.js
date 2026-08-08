require('dotenv').config({ path: './frontend/.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function testQuery() {
  try {
    const licenseId = '9c20c900-da60-4af0-9be5-f51623909c40';
    const deviceUuid = 'test-uuid-123';
    const deviceName = 'Web SaaS';
    const userId = '825a8feb-d34e-4d24-a66c-c04c28dcdf5f';
    const isExpired = true;

    // Simulate insert logic
    let newIsActive = !isExpired; // false

    // Simulate checkLimits for completely new device
    // activeSessions count = 0, max_devices = 1
    if (1 !== null && 1 > 0) {
      if (0 >= 1) {
        newIsActive = false; // Doesn't hit this
      } else {
        newIsActive = true; // IT HITS THIS!!!
      }
    }

    console.log("newIsActive will be:", newIsActive);

    // Now insert
    const res = await pool.query(`
      INSERT INTO license_activations (subscription_id, device_uuid, device_name, activated_at, created_by, updated_by, is_active)
      VALUES ($1, $2, $3, now(), $4, $5, $6)
      RETURNING *
    `, [licenseId, deviceUuid, deviceName, userId, userId, newIsActive]);
    
    console.log("Inserted:", res.rows);
  } catch(e) {
    console.error("DB Error:", e);
  }
}

testQuery();
