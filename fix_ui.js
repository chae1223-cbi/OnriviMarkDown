const fs = require('fs');
const path = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MarkdownViewer.tsx';
let c = fs.readFileSync(path, 'utf8');

c = c.replace(
  'className="codeblock-area my-4 rounded-lg bg-blue-50/20 overflow-hidden shadow-sm select-text max-w-full"',
  'className="codeblock-area my-4 rounded-lg bg-blue-50/20 dark:bg-black/20 overflow-hidden shadow-sm select-text max-w-full"'
);

c = c.replace(
  'className="codeblock-header flex items-center justify-between px-4 py-1.5 bg-blue-100/50 "',
  'className="codeblock-header flex items-center justify-between px-4 py-1.5 bg-blue-100/50 dark:bg-white/5"'
);

c = c.replace(
  'className="codeblock-header-text text-xs font-semibold text-blue-600  uppercase tracking-wider"',
  'className="codeblock-header-text text-xs font-semibold text-blue-600 dark:text-blue-300 uppercase tracking-wider"'
);

c = c.replace(
  'className="text-xs px-2.5 py-1 rounded bg-white  text-blue-600  hover:bg-blue-50 :bg-zinc-700 active:scale-95 transition-all shadow-sm font-medium"',
  'className="text-xs px-2.5 py-1 rounded bg-white dark:bg-zinc-800 text-blue-600 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-zinc-700 active:scale-95 transition-all shadow-sm font-medium"'
);

fs.writeFileSync(path, c, 'utf8');
