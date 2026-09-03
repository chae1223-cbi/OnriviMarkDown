const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://niyvcgvayofdqbebmche.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5peXZjZ3ZheW9mZHFiZWJtY2hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNDEzMjksImV4cCI6MjA5NjcxNzMyOX0.RERZT5U6SunxqGcun0ay3-SOojh6dpUD_DSFqKzPR5o';

// 브라우저에서 사용하는 익명 클라이언트
const supabaseAnon = createClient(supabaseUrl, anonKey);

async function testAnonSelect() {
  const { data, error } = await supabaseAnon
    .from('users')
    .select('*')
    .eq('id', '2ef98d8b-bd62-4a19-a0ad-564c83cb80e0');

  console.log('Anon SELECT result:', { data, error });
}

testAnonSelect();
