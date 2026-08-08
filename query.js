require('dotenv').config({ path: './frontend/.env.local' });
const { sql } = require('./frontend/src/lib/db');
async function test() {
  const res = await sql`SELECT id, plan_status FROM subscriptions WHERE user_id = '2ef98d8b-bd62-4a19-a0ad-564c83cb80e0'`;
  console.log(res);
  process.exit(0);
}
test();
