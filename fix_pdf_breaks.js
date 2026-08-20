const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/lib/exportHandlers.ts';
let c = fs.readFileSync(file, 'utf8');

const target = `
    const tagLevel = parseInt(tagLevelMatch[1]);
    if (tagLevel <= levelNum) {
      if (lastSeenLevel !== 0 && tagLevel <= lastSeenLevel) {
        const marker = document.createElement('div');
        marker.style.cssText = 'break-before: page !important; page-break-before: always !important; height: 0; margin: 0; padding: 0; border: none;';
        root.insertBefore(marker, el);
      }
      lastSeenLevel = tagLevel;
    }
`;

const replacement = `
    const tagLevel = parseInt(tagLevelMatch[1]);
    if (tagLevel <= levelNum) {
      if (tagLevel < levelNum) {
        // 상위 레벨 헤딩(예: 설정이 2일 때 H1) -> 새 덩어리(Chunk)의 시작을 의미하므로 끊지 않고 묶음 상태 초기화
        firstLevelFound = false;
      } else if (tagLevel === levelNum) {
        // 정확히 설정된 타겟 레벨(예: 설정이 2일 때 H2)
        if (!firstLevelFound) {
          // 상위 헤딩과 묶이는 첫 번째 타겟 헤딩 -> 묶음(Chunk)의 시작이므로 끊지 않음
          firstLevelFound = true;
        } else {
          // 두 번째부터는 덩어리가 끝났음을 의미하므로 이 헤딩 앞에서 페이지 나눔
          const marker = document.createElement('div');
          marker.style.cssText = 'break-before: page !important; page-break-before: always !important; height: 0; margin: 0; padding: 0; border: none;';
          root.insertBefore(marker, el);
        }
      }
    }
`;

c = c.replace(target.trim(), replacement.trim());
// Replace `let lastSeenLevel = 0;` with `let firstLevelFound = false;`
c = c.replace('let lastSeenLevel = 0;', 'let firstLevelFound = false;');
fs.writeFileSync(file, c, 'utf8');
console.log('Fixed exportHandlers.ts');
