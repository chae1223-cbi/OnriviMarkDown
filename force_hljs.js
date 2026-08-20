const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MarkdownViewer.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(
  '<code className={className || \'\'}',
  '<code className={`hljs ${className || \'\'}`}'
);

fs.writeFileSync(file, c, 'utf8');
console.log('Forced hljs class on CodeBlock');
