const postgres = require('postgres');
const fs = require('fs');

// Manually load .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const eqIndex = line.indexOf('=');
  if (eqIndex > 0) {
    const key = line.slice(0, eqIndex).trim();
    const value = line.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '');
    if (key) process.env[key] = value;
  }
});

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL not found');
  process.exit(1);
}
console.log('Connecting...');

const sql = postgres(connectionString);

async function run() {
  try {
    await sql`ALTER TABLE admins RENAME COLUMN role TO admin_role`;
    console.log('SUCCESS: column renamed role -> admin_role');
    const rows = await sql`SELECT * FROM admins LIMIT 2`;
    console.log('Verify rows:', JSON.stringify(rows));
  } catch(e) {
    if (e.message.includes('does not exist') || e.message.includes('column "role"')) {
      console.log('Column "role" may already be renamed. Checking current state...');
    } else {
      console.error('Error:', e.message);
    }
    try {
      const rows = await sql`SELECT * FROM admins LIMIT 2`;
      console.log('Current rows:', JSON.stringify(rows));
    } catch(e2) {
      console.error('Verify error:', e2.message);
    }
  } finally {
    await sql.end();
  }
}
run();
