import postgres from 'postgres';
const sql = postgres('postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres', { max: 1 });
async function run() {
  try {
    const res = await sql`
      SELECT id, plan_name, plan_status, current_period_end, max_devices, license_key, payment_no
      FROM subscriptions
      WHERE user_id = 'b6e9295c-3684-4e2b-a65d-c06f5783fc5a'
        AND is_active = true
        AND UPPER(plan_status) IN ('ACTIVE', 'FREE')
        AND plan_name != 'ELITEPRO'
        AND plan_name NOT ILIKE '%DESKTOP%'
      ORDER BY current_period_end DESC
      LIMIT 1
    `;
    console.log('Result:', res);
  } catch (e) { console.error(e); } finally { sql.end(); }
}
run();
