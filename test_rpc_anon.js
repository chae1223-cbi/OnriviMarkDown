require('dotenv').config({ path: 'frontend/.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function run() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  const { data, error } = await supabase.rpc('verify_desktop_license', {
    p_email: 'onrivi@naver.com',
    p_device_uuid: 'ECFA1E00-B0B1-11F0-B89B-6D88C0B84201'
  });
  
  console.log('Error:', error);
  console.log('Data:', data);
}
run();
