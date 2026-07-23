import postgres from 'postgres';

const sql = postgres('postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres', { max: 1 });

async function check() {
  try {
    const subs = await sql`SELECT * FROM subscriptions LIMIT 5`;
    console.log('Subscriptions:', subs);
    
    const users = await sql`SELECT id, email FROM users LIMIT 5`;
    console.log('Users:', users);
  } catch(e) {
    console.error(e);
  }
  await sql.end();
}

check();
