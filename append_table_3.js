const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/OMD_QUICK_TABLE.md';
let c = fs.readFileSync(file, 'utf8');

const newEntries = `| OMD-EXP-PageBreak-0001 ✅ FIXED | exportHandlers.ts, epubGenerator.ts | injectPageBreakMarkers, generateEpub | 사용자가 지정한 페이지 나누기 수준에 따라 하위 섹션을 한 덩어리로 묶고 본문 내용이 끝난 직후에 정확하게 페이지가 분리되도록 계층 추적(Hierarchy Tracking) 알고리즘 탑재 | 제목 계층을 동적으로 추적하여 하위 레벨로 진입할 때는 버퍼에 누적(병합)하고, 대등하거나 상위 레벨로 되돌아갈 때만 페이지 분할(Break) 마커를 삽입/분리하도록 PDF 및 EPUB 생성 로직 전면 재작성 | **2026-08-20** 🚨 서식 설정 수준 기반 페이지 분할 로직 개편 | exportPageBreakLevel, lastSeenLevel |
`;

if (c.includes('</tbody>')) {
  c = c.replace('</tbody>', newEntries + '</tbody>');
} else {
  c += '\n' + newEntries;
}

fs.writeFileSync(file, c, 'utf8');
console.log('Added new entries to OMD_QUICK_TABLE.md');
