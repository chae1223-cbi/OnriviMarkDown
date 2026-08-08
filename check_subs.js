require('dotenv').config({ path: './frontend/.env.local' });
const postgres = require('postgres');
const sqlDb = postgres(process.env.DATABASE_URL);

async function checkSub() {
  const subs = await sqlDb`SELECT * FROM subscriptions`;
  console.log('Subscriptions:', subs);
  process.exit(0);
}
checkSub();
