const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/lib/editorThemes.ts';
let content = fs.readFileSync(file, 'utf8');

const solarizedDarkRules = `      rules: [
        { token: '', foreground: '839496' },
        { token: 'keyword', fontStyle: 'bold', foreground: '268bd2' },
        { token: 'keyword.markdown', fontStyle: 'bold', foreground: '268bd2' },
        { token: 'comment', fontStyle: 'italic', foreground: '586e75' },
        { token: 'comment.markdown', fontStyle: 'italic', foreground: '586e75' },
        { token: 'strong', fontStyle: 'bold', foreground: '93a1a1' },
        { token: 'strong.markdown', fontStyle: 'bold', foreground: '93a1a1' },
        { token: 'emphasis', fontStyle: 'italic', foreground: '859900' },
        { token: 'emphasis.markdown', fontStyle: 'italic', foreground: '859900' },
        { token: 'string.link', fontStyle: 'underline', foreground: '2aa198' },
        { token: 'string.link.markdown', fontStyle: 'underline', foreground: '2aa198' },
        { token: 'string', foreground: '2aa198' },
        { token: 'variable', foreground: 'd33682' },
        { token: 'variable.source', foreground: 'd33682' },
        { token: 'type', foreground: 'cb4b16' },
        { token: 'type.markdown', foreground: 'cb4b16' },
      ],`;

const darkRegex = /name:\s*'Solarized Dark'[\s\S]*?rules:\s*\[[\s\S]*?variable[\s\S]*?\]\,/;
content = content.replace(darkRegex, match => match.replace(/rules:\s*\[[\s\S]*?variable[\s\S]*?\]\,/, solarizedDarkRules));

fs.writeFileSync(file, content, 'utf8');
console.log("Patched Solarized Dark!");
