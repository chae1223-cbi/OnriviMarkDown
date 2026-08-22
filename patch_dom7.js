const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/lib/exportHandlers.ts';
let content = fs.readFileSync(file, 'utf8');

const regex = /const seenLevels = new Set<number>\(\);[\s\S]*?seenLevels\.add\(tagLevel\);\s*\}/m;

const replaceStr = `let lastSeenLevel = 0;
        for (let i = 0; i < children.length; i++) {
          const el = children[i];
          const tagName = el.tagName.toLowerCase();
          const tagLevelMatch = tagName.match(/^h(\\d)$/);
          if (!tagLevelMatch) continue;
          
          const tagLevel = parseInt(tagLevelMatch[1]);
          
          if (tagLevel <= levelNum) {
            // 사용자님의 "Keep with Next" 의도 (예: 2 다음에 오는 첫 3은 자르지 않고 묶음)
            // 정확히 구현된 오리지널 lastSeenLevel 알고리즘을 복원합니다.
            if (lastSeenLevel !== 0 && tagLevel <= lastSeenLevel) {
                const marker = document.createElement('div');
                marker.className = 'page-break';
                marker.style.setProperty('break-before', 'page', 'important');
                marker.style.setProperty('page-break-before', 'always', 'important');
                marker.style.setProperty('height', '0', 'important');
                marker.style.setProperty('margin', '0', 'important');
                marker.style.setProperty('padding', '0', 'important');
                marker.style.setProperty('border', 'none', 'important');
                el.parentNode?.insertBefore(marker, el);
            }
            lastSeenLevel = tagLevel;
          }
        }`;

if (regex.test(content)) {
    content = content.replace(regex, replaceStr);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Patched back to lastSeenLevel algorithm!");
} else {
    console.log("Regex did not match!");
}
