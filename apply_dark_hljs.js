const fs = require('fs');
const darkCssPath = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/node_modules/highlight.js/styles/github-dark.css';
const globalsPath = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/app/globals.css';

let darkCss = fs.readFileSync(darkCssPath, 'utf8');

// Remove pre code.hljs and code.hljs basic padding rules (we handle this in our own CSS)
darkCss = darkCss.replace(/pre code\.hljs\s*{[^}]*}\s*code\.hljs\s*{[^}]*}/, '');

// Prefix every selector that starts with .hljs with .dark 
let lines = darkCss.split('\n');
let newLines = [];
for (let line of lines) {
    if (line.startsWith('.')) {
        // Handle comma-separated selectors on the same line or multiple lines
        let parts = line.split(',');
        for (let i = 0; i < parts.length; i++) {
            if (parts[i].trim().startsWith('.hljs')) {
                parts[i] = '.dark ' + parts[i].trim();
            }
        }
        newLines.push(parts.join(', '));
    } else {
        newLines.push(line);
    }
}

let prefixedCss = '\n\n/* --- GitHub Dark Syntax Highlighting (Injected for Dark Mode) --- */\n' + newLines.join('\n');
fs.appendFileSync(globalsPath, prefixedCss, 'utf8');
console.log('Appended dark theme to globals.css');
