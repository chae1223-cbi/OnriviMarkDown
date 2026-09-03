const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://niyvcgvayofdqbebmche.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5peXZjZ3ZheW9mZHFiZWJtY2hlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTE0MTMyOSwiZXhwIjoyMDk2NzE3MzI5fQ.QkXW98XK4oh8rcCHO_rGc1_dZ0UQ6CdDlrP1LQZszoE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function findUser() {
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, nick_name, provider, created_at, updated_at');

  console.log('Total users:', users?.length);
  users?.forEach(u => {
    console.log(`ID: ${u.id} | Email: ${u.email} | Nick: ${u.nick_name} | Created: ${u.created_at} | Updated: ${u.updated_at}`);
  });
}

findUser();
