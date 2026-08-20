const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MarkdownViewer.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/<style>\{`\s*\.dark \.codeblock-area code \* \{\s*color: #ffffff !important;\s*background-color: transparent !important;\s*\}\s*`\}<\/style>\s*/, '');
fs.writeFileSync(file, c, 'utf8');
console.log('Removed inline style from MarkdownViewer.tsx');

const globalFile = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/app/globals.css';
let gc = fs.readFileSync(globalFile, 'utf8');

const replacement = `
/* --- Simple White Text for Dark Mode Code Blocks --- */
.dark .codeblock-area code,
.dark .codeblock-area code * {
  color: #ffffff !important;
  background-color: transparent !important;
}
`;

if (gc.includes('/* --- Simple White Text for Dark Mode Code Blocks --- */')) {
    gc = gc.replace(/\/\* --- Simple White Text for Dark Mode Code Blocks --- \*\/[\s\S]*?(?=\n\n|\n*$)/, replacement.trim());
} else {
    gc += '\n' + replacement;
}

fs.writeFileSync(globalFile, gc, 'utf8');
console.log('Updated globals.css');
