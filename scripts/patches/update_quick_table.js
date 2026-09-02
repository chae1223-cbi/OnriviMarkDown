const fs = require('fs');
const path = require('path');

const tablePath = path.resolve(__dirname, '../../OMD_QUICK_TABLE.md');
let content = fs.readFileSync(tablePath, 'utf8');

const lines = content.split(/\r?\n/);
let found = false;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('OMD-STYLE-MarkdownViewer-0010')) {
    lines[i] = '| OMD-STYLE-MarkdownViewer-0010 ✅ FIXED | MarkdownViewer.tsx | CodeBlock | [ONRIVI-DS-SYSTEM-002 v4.1] Content Document Scope 격리를 위해 최상위 루트에 .onrivi-content-root 표준 클래스 적용 및 서식 스코프 완전 격리 | 최상위 컨테이너에 onrivi-content-root 클래스 부여 | **2026-09-02** — [ONRIVI-DS-SYSTEM-002 v4.1] Content Document Scope 격리를 위해 최상위 루트에 .onrivi-content-root 표준 클래스 적용 및 서식 스코프 완전 격리 ✅ FIXED | style, className |';
    found = true;
    break;
  }
}

if (found) {
  fs.writeFileSync(tablePath, lines.join('\n'), 'utf8');
  console.log('Successfully updated OMD-STYLE-MarkdownViewer-0010 in OMD_QUICK_TABLE.md');
} else {
  console.error('Line not found');
  process.exit(1);
}
