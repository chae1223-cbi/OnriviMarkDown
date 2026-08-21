const fs = require('fs');
const f = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MainEditorApp.tsx';
let c = fs.readFileSync(f, 'utf8');

c = c.replace(/import 'highlight\.js\/styles\/github\.css';/g, "// import 'highlight.js/styles/github.css';");

fs.writeFileSync(f, c, 'utf8');
console.log('Removed highlight.js css import');
