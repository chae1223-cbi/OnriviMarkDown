import postgres from 'postgres';
const sql = postgres('postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres', { max: 1 });
async function run() {
  try {
    const res = await sql`
      CREATE POLICY "Users can view own subscriptions" 
      ON public.subscriptions 
      FOR SELECT 
      USING (auth.uid() = user_id);
    `;
    console.log("Policy created successfully.");
  } catch (e) { console.error(e); } finally { sql.end(); }
}
run();
