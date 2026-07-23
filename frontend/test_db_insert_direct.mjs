import postgres from 'postgres';
const sql = postgres('postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres', { max: 1 });
async function run() {
  try {
    const res = await sql`
      INSERT INTO license_activations (subscription_id, device_uuid, device_name, activated_at)
      VALUES ('f77fa38d-cc39-4448-86de-4cc05bd32999', 'test-uuid-direct', 'Web SaaS', now())
      RETURNING *
    `;
    console.log('Inserted:', res);
  } catch (err) {
    console.error('Insert error:', err);
  } finally {
    await sql.end();
  }
}
run();
