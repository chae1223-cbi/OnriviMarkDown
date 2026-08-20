const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/OMD_QUICK_TABLE.md';
let c = fs.readFileSync(file, 'utf8');

const newEntries = `| OMD-UI-globals-0005 ✅ FIXED | globals.css | CSS | 다크 모드에서 언어 지정이 없는 코드블록(순수 텍스트 노드)이나 특정 구문 강조 테마가 적용된 경우 글씨가 흰색으로 덮어씌워지지 않고 어둡게 묻히는 현상 수정 | <code> 태그 내부의 자식(span 등)뿐만 아니라, <code> 태그 자체의 원시 텍스트 노드에도 강제 백색 스타일이 적용되도록 \`.dark .codeblock-area code, .dark .codeblock-area code *\` 로 선택자 커버리지 완벽 확장 | **2026-08-20** 🚨 다크 모드 코드블록 강제 백색 패치 | CSS !important |
`;

if (c.includes('</tbody>')) {
  c = c.replace('</tbody>', newEntries + '</tbody>');
} else {
  c += '\n' + newEntries;
}

fs.writeFileSync(file, c, 'utf8');
console.log('Added new entries to OMD_QUICK_TABLE.md');
