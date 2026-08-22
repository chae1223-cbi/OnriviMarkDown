const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MainEditorApp.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix the range so it covers the full line, and also add linesDecorationsClassName for the gutter indicator
const regex = /newDecorations\.push\(\{[\s\n]*range: new Range\(ln, 1, ln, 1\),[\s\n]*options: \{[\s\n]*isWholeLine: true,[\s\n]*className: 'monaco-frontmatter-line',[\s\n]*\}[\s\n]*\}\);/;

const replace = `newDecorations.push({
                range: new Range(ln, 1, ln, lines[ln - 1].length + 1),
                options: {
                  isWholeLine: true,
                  className: 'monaco-frontmatter-line',
                }
              });`;

if (regex.test(content)) {
    content = content.replace(regex, replace);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Fixed decoration range via regex!");
} else {
    console.log("Not found via regex!");
}
