const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/lib/exportHandlers.ts';
let c = fs.readFileSync(file, 'utf8');

const targetFunctionStart = c.indexOf('function injectPageBreakMarkers');
const targetFunctionEnd = c.indexOf('function flushIME'); // The next function is flushIME

if (targetFunctionStart === -1 || targetFunctionEnd === -1) {
  console.error("Could not find boundaries!");
  process.exit(1);
}

// Find the exact block to replace (from injectPageBreakMarkers up to the end of its block, just before flushIME's comment block)
const commentBeforeFlushIME = c.lastIndexOf('// ====================================================================', targetFunctionEnd);
const chunkToReplace = c.substring(targetFunctionStart, commentBeforeFlushIME);

const replacement = `function injectPageBreakMarkers(containerEl: HTMLElement, exportPageBreakLevel: string): void {
  if (!exportPageBreakLevel || exportPageBreakLevel === 'none') return;
  const levelNum = parseInt(exportPageBreakLevel.replace('h', ''));
  if (isNaN(levelNum) || levelNum < 1 || levelNum > 6) return;

  const root = containerEl.querySelector('.markdown-viewer-root') as HTMLElement || containerEl;
  const children = Array.from(root.children) as HTMLElement[];
  
  let lastSeenLevel = 0;

  for (let i = 0; i < children.length; i++) {
    const el = children[i];
    const tagName = el.tagName.toLowerCase();
    const tagLevelMatch = tagName.match(/^h(\\d)$/);
    if (!tagLevelMatch) continue;
    
    const tagLevel = parseInt(tagLevelMatch[1]);
    
    if (tagLevel <= levelNum) {
      if (lastSeenLevel !== 0 && tagLevel <= lastSeenLevel) {
        const marker = document.createElement('div');
        marker.style.cssText = 'break-before: page !important; page-break-before: always !important; height: 0; margin: 0; padding: 0; border: none;';
        root.insertBefore(marker, el);
      }
      lastSeenLevel = tagLevel;
    }
  }
}
  
`;

c = c.substring(0, targetFunctionStart) + replacement + c.substring(commentBeforeFlushIME);
fs.writeFileSync(file, c, 'utf8');
console.log('Rewrote safely!');
