const fs = require('fs');
const path = require('path');

const tablePath = path.resolve(__dirname, '../../OMD_QUICK_TABLE.md');
let content = fs.readFileSync(tablePath, 'utf8');

const lines = content.split(/\r?\n/);

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('OMD-STYLE-MarkdownViewer-0010')) {
    lines[i] = '| OMD-STYLE-MarkdownViewer-0010 ✅ FIXED | MarkdownViewer.tsx | CodeBlock | [ONRIVI-DS-SYSTEM-002 v5.0 LDSG] Content Document Scope 격리를 위해 최상위 루트에 .onrivi-content-root 표준 클래스 적용 및 서식 스코프 완전 격리 | 최상위 컨테이너에 onrivi-content-root 클래스 부여 | **2026-09-02** — [ONRIVI-DS-SYSTEM-002 v5.0 LDSG] LINE Design System (LDSG) 마이그레이션 및 서식 스코프 완전 격리 ✅ FIXED | style, className |';
  }
}

fs.writeFileSync(tablePath, lines.join('\n'), 'utf8');
console.log('Successfully updated OMD_QUICK_TABLE.md for LDSG v5.0');
