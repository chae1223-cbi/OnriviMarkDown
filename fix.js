const fs = require('fs');
const path = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MarkdownViewer.txx';
let c = fs.readFileSync(path, 'utf8');

c = c.replace(/const isInline = inline \|\| \\(!match && !codeContent\.includes\([\r\n\s]+\)\)\;/, "const isInline = inline || (!match && !codeContent.includes('\\n'));");

fs.writeFileSync(path, c, 'utf8');
console.log('Fixed');