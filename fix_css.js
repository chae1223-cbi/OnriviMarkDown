const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/app/globals.css';
let content = fs.readFileSync(file, 'utf8');

// Replace the indented frontmatter block with a top-level rule
const regex = /\s*\/\* Frontmatter \(YAML\)[\s\S]*?\.monaco-frontmatter-line \{[\s\S]*?\}\s*/;

const replacement = `

/* Frontmatter (YAML) 영역 박스형 배경 */
.monaco-frontmatter-line {
  background-color: rgba(14, 165, 233, 0.10) !important;
  border-left: 3px solid rgba(14, 165, 233, 0.6) !important;
}

`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Fixed frontmatter CSS to top-level selector!");
} else {
    console.log("Not found!");
}
