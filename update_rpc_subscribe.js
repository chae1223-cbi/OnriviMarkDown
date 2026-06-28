const { Client } = require('pg');
const fs = require('fs');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres'
  });
  await client.connect();
  const sql = fs.readFileSync('database/rpc_setup.sql', 'utf8');
  
  // Extract just the subscribe_user_plan function using string manipulation
  const startKeyword = 'CREATE OR REPLACE FUNCTION subscribe_user_plan(';
  const endKeyword = '$$$;';
  
  const startIndex = sql.indexOf(startKeyword);
  const tempStr = sql.substring(startIndex);
  const endIndex = tempStr.indexOf(endKeyword) + endKeyword.length;
  const functionSql = tempStr.substring(0, endIndex);
  
  if (startIndex === -1 || endIndex === -1) {
    throw new Error('Function not found');
  }

  await client.query(functionSql);
  await client.end();
  console.log('SQL Executed successfully');
}
run().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
