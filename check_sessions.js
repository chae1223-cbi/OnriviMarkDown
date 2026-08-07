require('dotenv').config({ path: 'frontend/.env.local' });
const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;

async function checkSessions() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const subs = await client.query(`SELECT * FROM subscriptions`);
    console.log("Subscriptions:");
    console.table(subs.rows);

    const acts = await client.query(`SELECT * FROM license_activations`);
    console.log("License Activations:");
    console.table(acts.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

checkSessions();
