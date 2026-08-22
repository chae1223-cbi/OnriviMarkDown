const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/lib/exportHandlers.ts';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `el.style.breakBefore = 'page';
            el.style.pageBreakBefore = 'always';`;
const replaceStr = `el.style.setProperty('break-before', 'page', 'important');
            el.style.setProperty('page-break-before', 'always', 'important');
            el.classList.add('injected-page-break-marker');`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replaceStr);
    
    // Also inject the class in the dynamic CSS
    const cssTarget = `      hr.page-break {`;
    const cssReplace = `      hr.page-break {
          display: none !important;
        }
        .injected-page-break-marker {
          break-before: page !important;
          page-break-before: always !important;
        }`;
    
    if (content.includes(cssTarget)) {
        // Only doing inline style is enough, but adding class is bulletproof
        console.log("Patched inline styles with !important!");
        fs.writeFileSync(file, content, 'utf8');
    }
} else {
    console.log("Could not find targetStr");
}
