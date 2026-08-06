const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function r() {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  const q = `ALTER TABLE public.support_inquiries ADD COLUMN IF NOT EXISTS answer_attachment_urls text[] DEFAULT '{}'`;
  await c.query(q);
  console.log('Column added');
  await c.end();
}
r();
