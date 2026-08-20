const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MarkdownViewer.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(
  'className="px-1.5 py-0.5 mx-0.5 rounded-md font-mono text-[0.9em]"',
  'className="px-1.5 py-0.5 mx-0.5 rounded-md font-mono text-[0.9em] bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"'
);

fs.writeFileSync(file, c, 'utf8');
console.log('Fixed inline code');
