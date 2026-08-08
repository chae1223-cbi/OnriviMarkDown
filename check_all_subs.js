require('dotenv').config({ path: './frontend/.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('id, plan_name, plan_status, is_active, max_devices, created_at')
    .eq('user_id', '2ef98d8b-bd62-4a19-a0ad-564c83cb80e0')
    .order('created_at', { ascending: false });
    
  console.log('Subscriptions:', data);
}
check();
