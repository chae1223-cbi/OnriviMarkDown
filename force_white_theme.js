const fs = require('fs');
const globalsPath = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/app/globals.css';

let globalsCss = fs.readFileSync(globalsPath, 'utf8');

let startIndex = globalsCss.indexOf('/* --- VS Code Dark+ Syntax Highlighting');
if (startIndex !== -1) {
    globalsCss = globalsCss.substring(0, startIndex);
}

const whiteTheme = `
/* --- Simple White Text for Dark Mode Code Blocks --- */
.dark .hljs,
.dark .hljs * {
  color: #ffffff !important;
  background: transparent !important;
}
`;

fs.writeFileSync(globalsPath, globalsCss.trimEnd() + '\n' + whiteTheme, 'utf8');
console.log('Replaced dark theme with pure white text');
