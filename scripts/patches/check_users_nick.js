const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://niyvcgvayofdqbebmche.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5peXZjZ3ZheW9mZHFiZWJtY2hlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTE0MTMyOSwiZXhwIjoyMDk2NzE3MzI5fQ.QkXW98XK4oh8rcCHO_rGc1_dZ0UQ6CdDlrP1LQZszoE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, nick_name, provider, updated_at, created_at')
    .order('updated_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error querying users:', error);
    return;
  }

  console.log('=== DB users 테이블 최근 10개 레코드 현황 ===');
  console.table(data);
}

checkUsers();
