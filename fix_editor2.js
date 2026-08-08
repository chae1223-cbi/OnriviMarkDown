const fs = require('fs');
const filePath = 'D:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MainEditorApp.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `    savedUserId = localStorage.getItem('onrivi_user_id') || '';`;
const newStr = `    savedUserId = localStorage.getItem('onrivi_user_id') || '';
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) savedUserId = session.user.id;
    } catch (e) {}`;

content = content.replace(targetStr, newStr);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed savedUserId logic');
