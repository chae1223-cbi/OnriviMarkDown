const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/OMD_QUICK_TABLE.md';
let c = fs.readFileSync(file, 'utf8');

const newEntries = `| OMD-UI-MainEditorApp-0004 ✅ FIXED | MainEditorApp.tsx | toc (useMemo) | 좌측 개요(TOC) 패널에 제목의 마크다운 기호가 필터링 없이 그대로 출력되어 지저분하게 보이는 현상 수정 | 정규식 치환 체인을 적용하여 개요 추출 시 굵게(**), 기울임(_), 취소선, 인라인 코드, 링크, HTML 태그 등 모든 렌더링용 기호를 깔끔하게 제거(Strip)하고 순수 텍스트만 표시되도록 정화 | **2026-08-20** 🚨 개요(TOC) 마크다운 태그 노출 방지 | text.replace |
`;

if (c.includes('</tbody>')) {
  c = c.replace('</tbody>', newEntries + '</tbody>');
} else {
  c += '\n' + newEntries;
}

fs.writeFileSync(file, c, 'utf8');
console.log('Added new entries to OMD_QUICK_TABLE.md');
