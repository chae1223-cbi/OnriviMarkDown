import postgres from 'postgres';
const sql = postgres('postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres', { max: 1 });

async function checkFree() {
  try {
    const freeSubs = await sql`
      SELECT id, plan_name, plan_status, created_at, current_period_end
      FROM subscriptions
      WHERE plan_name = 'FREE' OR plan_status = 'FREE'
      LIMIT 3
    `;
    console.log('Free subs:', freeSubs);
  } catch(e) {
    console.error(e);
  }
  await sql.end();
}
checkFree();
