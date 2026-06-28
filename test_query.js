const { createClient } = require('@supabase/supabase-js');

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://niyvcgvayofdqbebmche.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // I need the anon key. Let me read it from .env.local
  const fs = require('fs');
  const envFile = fs.readFileSync('frontend/.env.local', 'utf8');
  const keyMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);
  const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
  const supabase = createClient(urlMatch[1], keyMatch[1]);
  
  const { data: userSub } = await supabase
    .from('subscriptions')
    .select('id, plan_name, plan_status, trial_end_at, current_period_end, max_devices')
    .eq('user_id', 'c3b53c9e-5e8d-4f11-9a74-6b92dc7ecbf4') // Assuming the user_id is the one we queried earlier? Wait, I don't know the exact user_id. Let's just query by email.
    .in('plan_status', ['ACTIVE', 'FREE'])
    .not('plan_name', 'like', '%데스크탑%')
    .order('current_period_end', { ascending: false })
    .limit(1)
    .maybeSingle();
    
  console.log('userSub:', userSub);
}
run().catch(console.error);
