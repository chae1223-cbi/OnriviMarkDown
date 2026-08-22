const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MarkdownViewer.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /\.markdown-viewer-root figure\s*\{[\s\n]*counter-increment:\s*onrivi-figure;[\s\n]*\}/;

const replaceStr = `.markdown-viewer-root figure {
            counter-increment: onrivi-figure;
          }
          .markdown-viewer-root figure img,
          .markdown-viewer-root figure video {
            margin: 0 !important;
          }
          .markdown-viewer-root figure figcaption {
            margin-top: 0.5rem !important;
            margin-bottom: 0 !important;
          }`;

if (regex.test(content)) {
    content = content.replace(regex, replaceStr);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Patched prose margins via Regex!");
} else {
    console.log("Not found via regex!");
}
