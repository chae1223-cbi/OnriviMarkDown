const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/lib/exportHandlers.ts';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `el.style.setProperty('break-before', 'page', 'important');
            el.style.setProperty('page-break-before', 'always', 'important');
            el.classList.add('injected-page-break-marker');`;

// Let's inject a CSS rule into generateExportCss just in case!
const cssTarget = `hr:not(.page-break) {`;
const cssReplace = `.injected-page-break-marker {
      break-before: page !important;
      page-break-before: always !important;
    }
    hr:not(.page-break) {`;

if (content.includes(cssTarget)) {
    content = content.replace(cssTarget, cssReplace);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Patched CSS in generateExportCss!");
}
