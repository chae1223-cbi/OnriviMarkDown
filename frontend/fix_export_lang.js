const fs = require('fs');
const target = __dirname + '/src/lib/exportHandlers.ts';
let content = fs.readFileSync(target, 'utf8');

// language 변수를 'ko'로 교체
content = content.replace(/\$\{language\}/g, 'ko');
content = content.replace(/`\${language}`/g, "'ko'");

fs.writeFileSync(target, content, 'utf8');
console.log('Done');
