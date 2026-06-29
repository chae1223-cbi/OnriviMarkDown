const { Client } = require('pg');

async function getDesktopRPC() {
  const client = new Client({ connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres' });
  await client.connect();
  const res = await client.query("SELECT prosrc FROM pg_proc WHERE proname = 'verify_desktop_license'");
  console.log(res.rows[0]?.prosrc || 'Not found');
  await client.end();
}
getDesktopRPC().catch(console.error);
