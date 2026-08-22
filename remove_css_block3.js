const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MainEditorApp.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /\/\/ .*?Page Break.*?\r?\n\s*const pbLevel = prof\.pageStyle\.exportPageBreakLevel[\s\S]*?break-before: auto !important;\s*\}\s*\}\s*`;\s*\}\s*\}/;

if (regex.test(content)) {
    content = content.replace(regex, `// Legacy CSS page-break logic removed in favor of injectPageBreakMarkers.`);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Successfully removed block using flexible regex!");
} else {
    console.log("Regex failed.");
}
