const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MainEditorApp.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /if \(!isRestrictedUser\) \{[\s\n]*\/\/ 1\. \[.*?\]:.*?[\s\n]*if \(hasWelcome\) \{[\s\n]*const cleaned = tabsRef\.current\.filter\(t => !\(t\.name === 'Onrivi Author[^']*' && !t\.isStyleTab\)\);[\s\n]*setTabs\(cleaned\);[\s\n]*if \(cleaned\.length === 0\) \{[\s\n]*setActiveTabId\(null\);[\s\n]*\/\/.*?[\s\n]*const localDraft = localStorage\.getItem\('onrivi_content'\);[\s\n]*setContent\(localDraft \|\| ''\);[\s\n]*setCurrentFileName\('[^']*'\);[\s\n]*setCurrentFileNode\(null\);[\s\n]*\}[\s\n]*\}[\s\n]*\} else \{[\s\n]*\/\/\/ \[EMBEDDED WELCOME.*?[\s\n]*\/\/.*?[\s\n]*setTabs\(\[\]\);[\s\n]*setActiveTabId\(null\);[\s\n]*setPreviewModeRaw\('preview'\);[\s\n]*previewModeRef\.current = 'preview';[\s\n]*\}/;

const replaceStr = `// 1. [유/무료 공통]: 시작하기 탭 제거 (필요 시)
        if (hasWelcome) {
          const cleaned = tabsRef.current.filter(t => !(t.name === 'Onrivi Author 시작하기.md' && !t.isStyleTab));
          setTabs(cleaned);
          if (cleaned.length === 0) {
            setActiveTabId(null);
            // 빈 상태가 되면 로컬 저장소의 드래프트(임시) 불러오기
            const localDraft = localStorage.getItem('onrivi_content');
            setContent(localDraft || '');
            setCurrentFileName('새 문서.md');
            setCurrentFileNode(null);
          }
        }`;

if (regex.test(content)) {
    content = content.replace(regex, replaceStr);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Patched Welcome logic via Regex!");
} else {
    console.log("Not found via regex! Try simpler regex.");
    // Fallback if regex missed something due to Korean characters
    const fallbackRegex = /if \(!isRestrictedUser\) \{([\s\S]*?)\} else \{[\s\S]*?previewModeRef\.current = 'preview';\s*\}/;
    if (fallbackRegex.test(content)) {
        content = content.replace(fallbackRegex, `$1`);
        fs.writeFileSync(file, content, 'utf8');
        console.log("Patched Welcome logic via Fallback Regex!");
    } else {
        console.log("Fallback regex also failed.");
    }
}
