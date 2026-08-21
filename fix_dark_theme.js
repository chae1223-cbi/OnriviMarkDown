const fs = require('fs');

// 1. Fix globals.css
const f1 = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/app/globals.css';
let c1 = fs.readFileSync(f1, 'utf8');

c1 = c1.replace(
  /\.vs-dark \.monaco-bold-text \{ color: #A6E22E !important; background-color: rgba\(255, 255, 255, 0\.05\) !important; \}/g,
  '.vs-dark .monaco-bold-text { color: #ffffff !important; font-weight: bold !important; }'
);
c1 = c1.replace(
  /\.vs-dark \.monaco-italic-text \{ color: #A6E22E !important; font-style: italic !important; \}/g,
  '.vs-dark .monaco-italic-text { color: #ffffff !important; font-style: italic !important; }'
);
c1 = c1.replace(
  /\.vs-dark \.monaco-md-syntax \{ color: #9ca3af !important; \}/g,
  '.vs-dark .monaco-md-syntax { color: #ffffff !important; }'
);

// Also make sure .dark .codeblock-area code * forces color
c1 = c1.replace(
  /\/\* --- Simple White Text for Dark Mode Code Blocks --- \*\/\s*\.dark \.codeblock-area code,\s*\.dark \.codeblock-area code \* \{/g,
  '/* --- Simple White Text for Dark Mode Code Blocks --- */\n.dark pre code,\n.dark pre code *,\n.dark .codeblock-area code,\n.dark .codeblock-area code * {'
);

fs.writeFileSync(f1, c1, 'utf8');


// 2. Fix editorThemes.ts
const f2 = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/lib/editorThemes.ts';
let c2 = fs.readFileSync(f2, 'utf8');

c2 = c2.replace(/foreground: 'ADBAC7'/g, "foreground: 'ffffff'");
c2 = c2.replace(/foreground: 'F69D50'/g, "foreground: 'ffffff'");
c2 = c2.replace(/foreground: '768390'/g, "foreground: 'ffffff'");
c2 = c2.replace(/foreground: 'F47067'/g, "foreground: 'ffffff'");
c2 = c2.replace(/foreground: '6CB6FF'/g, "foreground: 'ffffff'");
c2 = c2.replace(/foreground: '96D0FF'/g, "foreground: 'ffffff'");
c2 = c2.replace(/foreground: 'DCBDFB'/g, "foreground: 'ffffff'");
c2 = c2.replace(/foreground: '#ADBAC7'/g, "foreground: '#ffffff'");

c2 = c2.replace(/foreground: '839496'/g, "foreground: 'ffffff'");
c2 = c2.replace(/foreground: 'B58900'/g, "foreground: 'ffffff'");
c2 = c2.replace(/foreground: '586E75'/g, "foreground: 'ffffff'");
c2 = c2.replace(/foreground: 'DC322F'/g, "foreground: 'ffffff'");
c2 = c2.replace(/foreground: '268BD2'/g, "foreground: 'ffffff'");
c2 = c2.replace(/foreground: '2AA198'/g, "foreground: 'ffffff'");
c2 = c2.replace(/foreground: '6C71C4'/g, "foreground: 'ffffff'");
c2 = c2.replace(/foreground: '#839496'/g, "foreground: '#ffffff'");

fs.writeFileSync(f2, c2, 'utf8');

console.log('Fixed themes and css');
