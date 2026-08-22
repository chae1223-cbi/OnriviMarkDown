const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MainEditorApp.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /\} else \{[\s\n]*\/\/\/ \[EMBEDDED WELCOME 2026-07-07\].*?[\s\n]*.*?[\s\n]*setTabs\(\[\]\);[\s\n]*setActiveTabId\(null\);[\s\n]*setPreviewModeRaw\('preview'\);[\s\n]*previewModeRef\.current = 'preview';[\s\n]*\}/;
if (regex.test(content)) {
    content = content.replace(regex, '}');
    fs.writeFileSync(file, content, 'utf8');
    console.log("Removed via regex!");
} else {
    // let's do a strict replacement based on the lines we just read.
    const target = `      } else {
        // ??? [EMBEDDED WELCOME 2026-07-07] 무료 사용자 무조건 시작하기 페이지 렌더링
        // 모두 날려버리고 시작하기 페이지가 렌더링되도록 합니다.
        setTabs([]);
        setActiveTabId(null);
        setPreviewModeRaw('preview');
        previewModeRef.current = 'preview';
      }`;
    
    // Convert target to a regex that ignores line endings and exact korean text
    const lines = content.split('\n');
    let newLines = [];
    let skip = false;
    for(let i = 0; i < lines.length; i++) {
        if (lines[i].includes('} else {') && lines[i+1] && lines[i+1].includes('[EMBEDDED WELCOME 2026-07-07]')) {
            newLines.push(lines[i].replace('} else {', '}'));
            skip = true;
            continue;
        }
        if (skip) {
            if (lines[i].includes("previewModeRef.current = 'preview';")) {
                skip = false;
                // skip the next line if it's the closing brace
                if (lines[i+1] && lines[i+1].trim() === '}') {
                    i++;
                }
            }
            continue;
        }
        newLines.push(lines[i]);
    }
    fs.writeFileSync(file, newLines.join('\n'), 'utf8');
    console.log("Removed via strict line iteration!");
}
