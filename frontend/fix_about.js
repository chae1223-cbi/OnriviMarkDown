const fs = require('fs');
let content = fs.readFileSync('d:/developer/OnriviMarkDown/frontend/src/components/AboutModal.tsx', 'utf8');
if (content.startsWith('"')) {
  content = content.substring(1, content.length - 1);
  content = content.replace(/\\n/g, '\n');
  content = content.replace(/\\"/g, '"');
  fs.writeFileSync('d:/developer/OnriviMarkDown/frontend/src/components/AboutModal.tsx', content, 'utf8');
  console.log('Fixed AboutModal');
}
