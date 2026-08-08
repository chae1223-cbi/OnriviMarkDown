require('dotenv').config({ path: './frontend/.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('id, plan_status, is_active')
    .eq('id', '5efe5aab-fdc3-4138-9585-f9b6b3d805d5');
    
  console.log('Select result:', data);
}
run();
