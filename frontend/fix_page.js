const fs = require('fs');
let content = fs.readFileSync('d:/developer/OnriviMarkDown/frontend/src/app/page.tsx', 'utf8');

// Replace the entire block
content = content.replace(/const savedLang = localStorage\.getItem\('language'\) as Language;[\s\S]*?const savedWorkspace = localStorage\.getItem\('workspaceType'\)/, "const savedWorkspace = localStorage.getItem('workspaceType')");

fs.writeFileSync('d:/developer/OnriviMarkDown/frontend/src/app/page.tsx', content, 'utf8');
