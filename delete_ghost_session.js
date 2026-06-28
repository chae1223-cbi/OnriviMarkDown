const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres'
  });
  await client.connect();
  
  await client.query(`
    DELETE FROM license_activations WHERE device_uuid = '68aa8d6b-041e-4ee6-a844-907282c2870c';
  `);
  
  console.log('Deleted old ghost session');
  
  await client.end();
}
run().catch(console.error);
