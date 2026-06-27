const fs = require('fs');
const target = __dirname + '/src/components/AboutModal.tsx';
let content = fs.readFileSync(target, 'utf8');
if (content.startsWith('"')) {
  content = content.substring(1, content.length - 1);
  content = content.replace(/\\n/g, '\n');
  content = content.replace(/\\"/g, '"');
  fs.writeFileSync(target, content, 'utf8');
  console.log('Fixed AboutModal');
}
