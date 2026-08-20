const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/OMD_QUICK_TABLE.md';
let c = fs.readFileSync(file, 'utf8');

const newEntries = `| OMD-LAYOUT-MainEditorApp-0080 ✅ FIXED | MainEditorApp.tsx | previewMode rendering | 하단 툴바(FormattingToolbar)에 미리보기 화면 끝부분이 가려지는 현상 해결 | custom-preview-container 및 preview-page-sheet 하단 패딩 대폭 증가 (pb-40, pb-48, pb-56) | **2026-08-20** 🚨 하단 여백 대폭 확대로 스크롤 가림 현상 최종 해결 | className |
| OMD-STYLE-MarkdownViewer-0010 ✅ FIXED | MarkdownViewer.tsx | CodeBlock | 다크모드에서 자바스크립트 등 언어 지정 코드블록이 외부 css(github.css)에 의해 어둡게 유지되는 현상 해결 | CodeBlock 내부 최상위에 !important 인라인 style 태그 주입 | **2026-08-20** 🚨 react-markdown className 유실로 인한 CSS 특이성 문제 완벽 회피 및 흰글씨 강제 고정 | style |
| OMD-AI-aiFormatter-0002 ✅ FIXED | aiFormatter.ts | formatRawTextToMarkdown | HWP 문서 추출 텍스트의 표 데이터가 뭉쳐나오는 현상 해결을 위한 AI 프롬프트 강화 | 뭉쳐진 텍스트를 탭/공백 문맥을 통해 논리적 행/열로 완벽 복원하라는 중요 지시 추가 | **2026-08-20** 🚨 HWP 표 데이터 분리 및 Markdown 복원 성능 향상 | prompt |
`;

if (c.includes('</tbody>')) {
  c = c.replace('</tbody>', newEntries + '</tbody>');
} else {
  c += '\n' + newEntries;
}

fs.writeFileSync(file, c, 'utf8');
console.log('Added new entries to OMD_QUICK_TABLE.md');
