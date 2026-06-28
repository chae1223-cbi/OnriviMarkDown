const { Client } = require('pg');
async function run() {
  const client = new Client({ connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres' });
  await client.connect();
  await client.query("DELETE FROM license_activations");
  console.log('Cleared');
  await client.end();
}
run();
