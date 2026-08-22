const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/lib/exportHandlers.ts';
let content = fs.readFileSync(file, 'utf8');

const regex = /\/\/ 모든 직계 자식 요소를 순회하며 섹션 경계를 찾음\s*const children = Array\.from\(root\.children\) as HTMLElement\[\];/;

const replaceStr = `// .markdown-viewer-root 내부에 래퍼 div가 있을 수 있으므로 querySelectorAll로 모든 헤딩을 추출합니다.
    const children = Array.from(root.querySelectorAll('h1, h2, h3, h4, h5, h6')) as HTMLElement[];`;

if (regex.test(content)) {
    content = content.replace(regex, replaceStr);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Patched injectPageBreakMarkers to use querySelectorAll!");
} else {
    console.log("Regex did not match!");
}
