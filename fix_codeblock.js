const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MarkdownViewer.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(
  'className="m-0 p-4 font-mono text-sm leading-normal bg-transparent w-max min-w-full"',
  'className="m-0 p-4 font-mono text-sm leading-normal bg-transparent w-max min-w-full text-zinc-800 dark:text-zinc-200"'
);

fs.writeFileSync(file, c, 'utf8');
console.log('Fixed CodeBlock fallback text color');
