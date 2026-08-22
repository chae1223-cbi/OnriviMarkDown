const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MarkdownViewer.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `          .markdown-viewer-root figure {
            counter-increment: onrivi-figure;
          }`;
const replaceStr = `          .markdown-viewer-root figure {
            counter-increment: onrivi-figure;
            margin: 1.5rem 0 !important;
          }
          .markdown-viewer-root figure img,
          .markdown-viewer-root figure video {
            margin: 0 !important;
          }
          .markdown-viewer-root figure figcaption {
            margin-top: 0.5rem !important;
            margin-bottom: 0 !important;
          }`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replaceStr);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Patched prose margins in CSS!");
} else {
    console.log("Not found targetStr!");
}
