require('dotenv').config({ path: './frontend/.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testGet() {
  const { data: admins, error } = await supabaseAdmin.from('admins').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Admins:', admins);
  }
}

testGet();
