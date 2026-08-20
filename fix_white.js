const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MarkdownViewer.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/dark:text-zinc-200/g, 'dark:text-white');

fs.writeFileSync(file, c, 'utf8');
console.log('Fixed MarkdownViewer dark text colors to white');
