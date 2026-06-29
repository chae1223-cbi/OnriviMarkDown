const { Client } = require('pg');

async function checkRLS() {
  const client = new Client({ connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres' });
  await client.connect();
  const res = await client.query(`
    SELECT pol.polname, pol.polcmd, pol.polqual, pol.polwithcheck
    FROM pg_policy pol
    JOIN pg_class t ON pol.polrelid = t.oid
    WHERE t.relname = 'software_licenses';
  `);
  console.log(res.rows);
  await client.end();
}
checkRLS().catch(console.error);
