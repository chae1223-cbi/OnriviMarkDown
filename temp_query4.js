const { Client } = require('pg');

async function testRPC() {
  const client = new Client({ connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres' });
  await client.connect();
  const res = await client.query("SELECT * FROM verify_desktop_license('chae1223@naver.com', 'ECFA1E00-B0B1-11F0-B89B-6D88C0B84201')");
  console.log(res.rows[0]);
  await client.end();
}
testRPC().catch(console.error);
