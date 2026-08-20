const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/OMD_QUICK_TABLE.md';
let c = fs.readFileSync(file, 'utf8');

const newEntries = `| OMD-EDIT-fileImporter-0002 ✅ FIXED | fileImporter.ts | importHwp | HWP 파일에서 다수의 이미지가 존재할 경우 순서가 뒤죽박죽으로 섞이는 현상 및 표 구조 유실 현상 완벽 해결 | hwp.js 파서의 Picture/Table 객체를 직접 타겟팅하여 binID 기반의 정밀한 이미지 맵핑 로직 구축 및 Table 객체를 마크다운 표로 즉시 변환하는 AST 렌더러 탑재 | **2026-08-20** 🚨 HWP 표 및 이미지 뒤섞임 현상 근본 해결 | hwpLib.parse, binID |
`;

if (c.includes('</tbody>')) {
  c = c.replace('</tbody>', newEntries + '</tbody>');
} else {
  c += '\n' + newEntries;
}

fs.writeFileSync(file, c, 'utf8');
console.log('Added new entries to OMD_QUICK_TABLE.md');
