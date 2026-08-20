const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/OMD_QUICK_TABLE.md';
let c = fs.readFileSync(file, 'utf8');

const newEntries = `| OMD-EXP-PageBreak-0002 ✅ FIXED | exportHandlers.ts, epubGenerator.ts | injectPageBreakMarkers, generateEpub | 제목 2단계 수준 설정 시 제목 1단계에서도 페이지 나누기가 발생하는 논리적 오류 수정 | 사용자의 '수준2가 끝나는 부분만 잘라달라'는 요청에 맞게, 설정된 타겟 수준(levelNum)과 정확히 일치할 때(tagLevel === levelNum)에만 페이지를 나누도록 변경. 상위 헤딩(tagLevel < levelNum) 등장 시에는 덩어리(Chunk)의 시작으로 간주하여 firstLevelFound 플래그를 리셋함으로써, 상위 헤딩과 첫 하위 헤딩이 분리되지 않고 완벽하게 한 페이지에 묶이도록 개선. | **2026-08-20** 🚨 페이지 분할 알고리즘 타겟 레벨 단독 적용 패치 | firstLevelFound |
`;

if (c.includes('</tbody>')) {
  c = c.replace('</tbody>', newEntries + '</tbody>');
} else {
  c += '\n' + newEntries;
}

fs.writeFileSync(file, c, 'utf8');
console.log('Added new entries to OMD_QUICK_TABLE.md');
