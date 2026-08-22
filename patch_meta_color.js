const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/lib/editorThemes.ts';
let content = fs.readFileSync(file, 'utf8');

// We will inject the 'meta' tokens for YAML frontmatter right before 'type.markdown'
const lightMeta = `
        { token: 'meta', foreground: '0ea5e9' }, // Light blue for metadata
        { token: 'meta.content', foreground: '0ea5e9' },
        { token: 'meta.separator', foreground: '0284c7', fontStyle: 'bold' },
`;

const darkMeta = `
        { token: 'meta', foreground: '38bdf8' }, // Light blue for metadata
        { token: 'meta.content', foreground: '38bdf8' },
        { token: 'meta.separator', foreground: '7dd3fc', fontStyle: 'bold' },
`;

// Inject into Onrivi Light
content = content.replace(
  /\{\s*token:\s*'type.markdown',\s*foreground:\s*'ea580c'\s*\},/g,
  `{ token: 'type.markdown', foreground: 'ea580c' },${lightMeta}`
);

// Inject into GitHub Dark Dimmed
content = content.replace(
  /\{\s*token:\s*'type.markdown',\s*foreground:\s*'fb923c'\s*\},/g,
  `{ token: 'type.markdown', foreground: 'fb923c' },${darkMeta}`
);

// Inject into Solarized Dark
content = content.replace(
  /\{\s*token:\s*'type.markdown',\s*foreground:\s*'cb4b16'\s*\},/g,
  `{ token: 'type.markdown', foreground: 'cb4b16' },${darkMeta}`
);

fs.writeFileSync(file, content, 'utf8');
console.log("Patched meta color!");
