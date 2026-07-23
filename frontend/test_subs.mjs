import postgres from 'postgres';
const sql = postgres('postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres', { max: 1 });

async function checkSub() {
  try {
    const subs = await sql`
      SELECT id, plan_name, plan_status, current_period_end, is_active
      FROM subscriptions
      ORDER BY created_at DESC
      LIMIT 5
    `;
    console.log('subs:', subs);
  } catch(e) {
    console.error(e);
  }
  await sql.end();
}
checkSub();
