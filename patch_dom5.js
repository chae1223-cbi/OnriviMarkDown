const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/lib/exportHandlers.ts';
let content = fs.readFileSync(file, 'utf8');

const regex = /if \(seenLevels\.has\(tagLevel\) \|\| \(tagLevel < Math\.max\(\.\.\.Array\.from\(seenLevels\.size \? seenLevels : \[0\]\)\)\)\) \{[\s\S]*?seenLevels\.add\(tagLevel\);/m;

const replaceStr = `if (seenLevels.has(tagLevel) || (tagLevel < Math.max(...Array.from(seenLevels.size ? seenLevels : [0])))) {
                // el.style에 직접 주입하면 Chrome 인쇄 엔진이 씹는 버그를 방지하기 위해,
                // 이전에 문서에 명시된 대로 실제 '마커 div'를 요소 앞에 삽입합니다.
                const marker = document.createElement('div');
                marker.className = 'page-break';
                marker.style.setProperty('break-before', 'page', 'important');
                marker.style.setProperty('page-break-before', 'always', 'important');
                marker.style.setProperty('height', '0', 'important');
                marker.style.setProperty('margin', '0', 'important');
                marker.style.setProperty('padding', '0', 'important');
                marker.style.setProperty('border', 'none', 'important');
                el.parentNode?.insertBefore(marker, el);
            }
            seenLevels.add(tagLevel);`;

if (regex.test(content)) {
    content = content.replace(regex, replaceStr);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Patched injectPageBreakMarkers to use a physical marker DIV!");
} else {
    console.log("Regex did not match!");
}
