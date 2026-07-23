const { Client } = require('pg');
async function run() {
  const c = new Client({ connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres' });
  await c.connect();
  try {
    await c.query(`
      DROP FUNCTION IF EXISTS public.verify_desktop_license(text, text);
      DROP FUNCTION IF EXISTS public.check_license_session(text, text);
      DROP FUNCTION IF EXISTS public.insert_license_activation(uuid, text, text, uuid);
    `);
    console.log("RPC functions dropped successfully.");
  } catch (e) {
    console.error(e);
  }
  await c.end();
}
run();
