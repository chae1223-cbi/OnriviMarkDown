const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MarkdownViewer.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove my-3 from AsyncImage
content = content.replace(
  /className=\{`rounded-lg shadow-sm border border-zinc-200\/30 my-3 \$\{forceAlignClass\}`\}/,
  'className={`rounded-lg shadow-sm border border-zinc-200/30 ${forceAlignClass}`}'
);

// 2. Remove my-3 from AsyncVideo return
content = content.replace(
  /className=\{`rounded-lg shadow-sm border border-zinc-200\/30 my-3 w-full max-w-full outline-none bg-black \$\{className \|\| ''\}`\}/,
  'className={`rounded-lg shadow-sm border border-zinc-200/30 w-full max-w-full outline-none bg-black ${className || \'\'}`}'
);

// 3. Change mt-2 to mt-1 in figcaption for images and videos
content = content.replace(
  /className="text-\[0\.9em\] text-zinc-500 mt-2 font-medium"/g,
  'className="text-[0.9em] text-zinc-500 mt-1 font-medium"'
);

fs.writeFileSync(file, content, 'utf8');
console.log("Patched margins!");
