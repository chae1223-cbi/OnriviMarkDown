require('dotenv').config({ path: './frontend/.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testUpdate() {
  const { data: faqs, error: fetchErr } = await supabaseAdmin.from('faqs').select('*');
  console.log(faqs.map(f => ({ id: f.id, q: f.question })));
}

testUpdate();
