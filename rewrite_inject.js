const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/lib/exportHandlers.ts';
let c = fs.readFileSync(file, 'utf8');

const targetRegex = /function injectPageBreakMarkers[\s\S]*?\}\n  \}\n/m;

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
    
    // 사용자가 지정한 레벨(levelNum) 이하의 제목들만 페이지 나누기 대상입니다.
    if (tagLevel <= levelNum) {
      // 단, 문서의 맨 첫 제목이거나, 이전 제목의 첫 하위 제목인 경우(tagLevel > lastSeenLevel)는 나누지 않습니다.
      if (lastSeenLevel !== 0 && tagLevel <= lastSeenLevel) {
        const marker = document.createElement('div');
        marker.style.cssText = 'break-before: page !important; page-break-before: always !important; height: 0; margin: 0; padding: 0; border: none;';
        root.insertBefore(marker, el);
      }
      // 마지막으로 처리한 유효 레벨을 업데이트합니다.
      lastSeenLevel = tagLevel;
    }
  }
}
`;

c = c.replace(targetRegex, replacement);
fs.writeFileSync(file, c, 'utf8');
console.log('Rewrote injectPageBreakMarkers!');
