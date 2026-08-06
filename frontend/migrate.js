const { Client } = require('pg');
const dotenv = require('dotenv');

// Run from project root
dotenv.config({ path: 'frontend/.env.local' });

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database.');

    const alterQuery = `
      ALTER TABLE public.support_inquiries 
      ADD COLUMN IF NOT EXISTS answer_content text,
      ADD COLUMN IF NOT EXISTS answered_at timestamptz,
      ADD COLUMN IF NOT EXISTS answered_by uuid;
    `;

    await client.query(alterQuery);
    console.log('Columns added to support_inquiries successfully.');

  } catch (err) {
    console.error('Error running migration:', err);
  } finally {
    await client.end();
  }
}

runMigration();
