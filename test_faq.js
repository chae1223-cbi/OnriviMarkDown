require('dotenv').config({ path: './frontend/.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testUpdate() {
  const { data: faqs, error: fetchErr } = await supabaseAdmin.from('faqs').select('*').limit(1);
  if (fetchErr) {
    console.error('Fetch err:', fetchErr);
    return;
  }
  if (!faqs || faqs.length === 0) {
    console.log('No faqs found.');
    return;
  }
  
  const id = faqs[0].id;
  console.log('Found faq id:', id);
  
  const { data, error } = await supabaseAdmin
    .from('faqs')
    .update({
      question: faqs[0].question,
      answer: faqs[0].answer,
      sort_order: faqs[0].sort_order,
      is_active: faqs[0].is_active,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Update error:', error);
  } else {
    console.log('Update success:', data);
  }
}

testUpdate();
