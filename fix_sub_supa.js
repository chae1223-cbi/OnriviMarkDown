require('dotenv').config({ path: './frontend/.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await supabase
    .from('subscriptions')
    .update({ plan_status: 'ACTIVE', is_active: true, canceled_at: null })
    .eq('id', '5efe5aab-fdc3-4138-9585-f9b6b3d805d5');
    
  console.log('Update result:', { data, error });
}
run();
