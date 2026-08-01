require('dotenv').config({path: './frontend/.env.local'});
const { Client } = require('pg');
const client = new Client(process.env.DATABASE_URL);
async function run() {
  await client.connect();
  try {
    await client.query(`DROP POLICY IF EXISTS "Admins can view all records" ON admins;`);
    console.log('Successfully dropped the recursive policy.');
  } catch (e) {
    console.error('Error dropping policy:', e);
  }
  await client.end();
}
run();
