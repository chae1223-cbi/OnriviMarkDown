const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MainEditorApp.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `      // 🔟 내보내기 페이지 나누기(Page Break) 동적 반영
      const pbLevel = prof.pageStyle.exportPageBreakLevel || 'h2';
      if (pbLevel !== 'none') {
        const levelNum = parseInt(pbLevel.replace('h', ''));
        if (!isNaN(levelNum)) {
          const breakSelectors = [];
          const autoSelectors = [];
          for (let i = 1; i <= levelNum; i++) {
            breakSelectors.push(\`.custom-preview-container h\${i}\`);
            autoSelectors.push(\`.custom-preview-container h\${i}:first-child\`);
          }
          css += \`
  @media print {
    \${breakSelectors.join(',\\n  ')} {
      page-break-before: always !important;
      break-before: page !important;
    }
    \${autoSelectors.join(',\\n  ')} {
      page-break-before: auto !important;
      break-before: auto !important;
    }
  }
  \`;
        }
      }`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, `      // 🔟 내보내기 페이지 나누기(Page Break) 동적 반영 - 제거됨 (injectPageBreakMarkers로 대체)`);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Successfully removed the obsolete CSS-based page break logic from MainEditorApp.tsx!");
} else {
    console.log("Target string not found in MainEditorApp.tsx. Let's try Regex.");
    const regex = /\/\/ 🔟 내보내기 페이지 나누기[\s\S]*?const pbLevel = prof\.pageStyle\.exportPageBreakLevel[\s\S]*?if \(!isNaN\(levelNum\)\) \{[\s\S]*?breakSelectors\.push[\s\S]*?css \+= `[\s\S]*?@media print \{[\s\S]*?break-before: auto !important;\s*\}\s*\}\s*`;\s*\}\s*\}/;
    if (regex.test(content)) {
        content = content.replace(regex, `// 🔟 내보내기 페이지 나누기(Page Break) 동적 반영 - 제거됨 (DOM 기반 injectPageBreakMarkers로 대체됨)`);
        fs.writeFileSync(file, content, 'utf8');
        console.log("Successfully removed via regex!");
    } else {
        console.log("Regex also failed.");
    }
}
