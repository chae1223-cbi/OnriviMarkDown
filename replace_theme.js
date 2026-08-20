const fs = require('fs');
const globalsPath = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/app/globals.css';
const newThemePath = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/vscode-dark.css';

let globalsCss = fs.readFileSync(globalsPath, 'utf8');
let newThemeCss = fs.readFileSync(newThemePath, 'utf8');

let startIndex = globalsCss.indexOf('/* --- GitHub Dark Syntax Highlighting');
if (startIndex !== -1) {
    globalsCss = globalsCss.substring(0, startIndex);
} else {
    // maybe it was replaced already
    startIndex = globalsCss.indexOf('/* --- VS Code Dark+ Syntax Highlighting');
    if (startIndex !== -1) {
        globalsCss = globalsCss.substring(0, startIndex);
    }
}

fs.writeFileSync(globalsPath, globalsCss.trimEnd() + '\n\n' + newThemeCss, 'utf8');
console.log('Replaced dark theme');
