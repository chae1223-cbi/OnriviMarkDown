const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MainEditorApp.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `              newDecorations.push({
                range: new Range(ln, 1, ln, 1),
                options: {
                  isWholeLine: true,
                  className: 'monaco-frontmatter-line',
                }
              });`;

const replace = `              newDecorations.push({
                range: new Range(ln, 1, ln, lines[ln - 1].length + 1),
                options: {
                  isWholeLine: true,
                  className: 'monaco-frontmatter-line',
                  linesDecorationsClassName: 'monaco-frontmatter-gutter',
                }
              });`;

if (content.includes(target)) {
    content = content.replace(target, replace);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Fixed decoration range!");
} else {
    console.log("Not found!");
}
