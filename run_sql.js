const { Client } = require('pg');
const fs = require('fs');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres'
  });
  await client.connect();
  const sql = fs.readFileSync('database/rpc_setup.sql', 'utf8');
  await client.query(sql);
  await client.end();
  console.log('SQL Executed successfully');
}
run().catch(console.error);
