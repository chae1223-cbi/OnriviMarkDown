require('dotenv').config({ path: './frontend/.env.local' });
const { sql } = require('./frontend/src/lib/db');

async function fix() {
  await sql`
    UPDATE subscriptions
    SET plan_status = 'ACTIVE',
        is_active = true,
        canceled_at = NULL
    WHERE id = '5efe5aab-fdc3-4138-9585-f9b6b3d805d5'
  `;
  console.log('Restored ELITEPRO to ACTIVE');
  process.exit(0);
}
fix();
