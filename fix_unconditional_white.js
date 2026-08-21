const fs = require('fs');
const f = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/app/globals.css';
let c = fs.readFileSync(f, 'utf8');

c = c.replace(
  /\/\* --- Simple White Text for Dark Mode Code Blocks --- \*\/\s*\.dark pre code,\s*\.dark pre code \*,\s*\.dark \.codeblock-area code,\s*\.dark \.codeblock-area code \* \{\s*color: #ffffff !important;\s*background-color: transparent !important;\s*\}/g,
  '/* --- Unconditional Inherit Text Color for Code Blocks --- */\n.codeblock-area code,\n.codeblock-area code * {\n  color: inherit !important;\n}\n.dark .codeblock-area code,\n.dark .codeblock-area code * {\n  color: #ffffff !important;\n}'
);

if (!c.includes('Unconditional Inherit Text Color')) {
  c += '\n\n/* --- Unconditional Inherit Text Color for Code Blocks --- */\n.codeblock-area code,\n.codeblock-area code * {\n  color: inherit !important;\n}\n.dark .codeblock-area code,\n.dark .codeblock-area code * {\n  color: #ffffff !important;\n}\n';
}

fs.writeFileSync(f, c, 'utf8');
console.log('Fixed globals.css');
