const fs = require('fs');
const target = __dirname + '/src/app/page.tsx';
let content = fs.readFileSync(target, 'utf8');

// Replace the entire block
content = content.replace(/const savedLang = localStorage\.getItem\('language'\) as Language;[\s\S]*?const savedWorkspace = localStorage\.getItem\('workspaceType'\)/, "const savedWorkspace = localStorage.getItem('workspaceType')");

fs.writeFileSync(target, content, 'utf8');
