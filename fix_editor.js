const fs = require('fs');
const filePath = 'D:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MainEditorApp.tsx';
let content = fs.readFileSync(filePath, 'utf8');
content = content.replace(
  'savedUserId = session.user.email || session.user.id;',
  'savedUserId = session.user.id;'
);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed savedUserId');
