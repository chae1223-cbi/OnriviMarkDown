const fs = require('fs');
let content = fs.readFileSync('d:/developer/OnriviMarkDown/frontend/src/lib/exportHandlers.ts', 'utf8');

// language 변수를 'ko'로 교체
content = content.replace(/\$\{language\}/g, 'ko');
content = content.replace(/`\${language}`/g, "'ko'");

fs.writeFileSync('d:/developer/OnriviMarkDown/frontend/src/lib/exportHandlers.ts', content, 'utf8');
console.log('Done');
