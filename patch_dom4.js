const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/lib/exportHandlers.ts';
let content = fs.readFileSync(file, 'utf8');

const regex = /let lastSeenLevel = 0;[\s\S]*?lastSeenLevel = tagLevel;\s*\}/;
const replaceStr = `const seenLevels = new Set<number>();
      for (let i = 0; i < children.length; i++) {
        const el = children[i];
        const tagName = el.tagName.toLowerCase();
        const tagLevelMatch = tagName.match(/^h(\\d)$/);
        if (!tagLevelMatch) continue;
        
        const tagLevel = parseInt(tagLevelMatch[1]);
        
        if (tagLevel <= levelNum) {
          // 최초 등장하는 해당 레벨의 헤딩은 페이지를 분할하지 않아 첫 그룹(H1, H2, H3)이 묶이도록 함.
          // 두 번째 등장부터는 무조건 페이지 분할!
          if (seenLevels.has(tagLevel) || (tagLevel < Math.max(...Array.from(seenLevels.size ? seenLevels : [0])))) {
              el.style.setProperty('break-before', 'page', 'important');
              el.style.setProperty('page-break-before', 'always', 'important');
              el.classList.add('injected-page-break-marker');
          }
          seenLevels.add(tagLevel);
        }`;

if (regex.test(content)) {
    content = content.replace(regex, replaceStr);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Patched injectPageBreakMarkers with seenLevels logic!");
} else {
    console.log("Could not find lastSeenLevel loop.");
}
