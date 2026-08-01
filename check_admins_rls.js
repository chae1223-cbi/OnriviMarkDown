require('dotenv').config({path: './frontend/.env.local'});
const { Client } = require('pg');
const client = new Client(process.env.DATABASE_URL);
async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT pol.polname, pol.polcmd, pol.polqual, pol.polwithcheck
    FROM pg_policy pol
    JOIN pg_class tbl ON pol.polrelid = tbl.oid
    WHERE tbl.relname = 'admins';
  `);
  console.log('Policies:', res.rows);
  await client.end();
}
run();
