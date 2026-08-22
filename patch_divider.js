const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MainEditorApp.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /className="flex-1 min-w-0 relative border-r border-transparent hover:border-black\/5 dark:hover:border-white\/5 transition-colors duration-500 no-print bg-surface-container-low dark:bg-zinc-950"/;

const replaceStr = `className="flex-1 min-w-0 relative border-r border-zinc-200 dark:border-zinc-800 transition-colors duration-300 no-print bg-surface-container-low dark:bg-zinc-950"`;

if (regex.test(content)) {
    content = content.replace(regex, replaceStr);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Patched divider!");
} else {
    console.log("Not found targetStr!");
}
