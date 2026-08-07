require('dotenv').config({ path: 'frontend/.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testPlans() {
  try {
    const { data: plans, error: plansError } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (plansError) throw plansError;
    
    console.log("Raw Plans:");
    console.log(plans);
  } catch (e) {
    console.error(e);
  }
}
testPlans();
