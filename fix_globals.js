const fs = require('fs');
const darkCssPath = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/node_modules/highlight.js/styles/github-dark.css';
const globalsPath = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/app/globals.css';

let globalsCss = fs.readFileSync(globalsPath, 'utf8');

let injectedStartIndex = globalsCss.indexOf('/* --- GitHub Dark Syntax Highlighting');
if (injectedStartIndex !== -1) {
    globalsCss = globalsCss.substring(0, injectedStartIndex);
}

let darkCss = fs.readFileSync(darkCssPath, 'utf8');
darkCss = darkCss.replace(/pre code\.hljs\s*{[^}]*}\s*code\.hljs\s*{[^}]*}/, '');

let lines = darkCss.split('\n');
let newLines = [];
for (let line of lines) {
    if (line.startsWith('.')) {
        let parts = line.split(',');
        for (let i = 0; i < parts.length; i++) {
            if (parts[i].trim().startsWith('.hljs')) {
                parts[i] = '.dark ' + parts[i].trim();
            }
        }
        newLines.push(parts.join(', '));
    } else {
        if (line.includes(':') && !line.includes('/*') && !line.includes('}')) {
            line = line.replace(/([^:]+):\s*([^;]+)(;?)/, '$1: $2 !important$3');
        }
        newLines.push(line);
    }
}

let prefixedCss = '\n\n/* --- GitHub Dark Syntax Highlighting (Injected for Dark Mode) --- */\n' + newLines.join('\n');
prefixedCss = prefixedCss.replace(/background:\s*#0d1117\s*!important/g, 'background: transparent !important');

fs.writeFileSync(globalsPath, globalsCss + prefixedCss, 'utf8');
console.log('Fixed globals.css');
