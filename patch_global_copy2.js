const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MainEditorApp.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /range\.selectNodeContents\(targetEl\);[\s\n]*selection\.removeAllRanges\(\);[\s\n]*selection\.addRange\(range\);[\s\n]*document\.execCommand\('copy'\);[\s\n]*selection\.removeAllRanges\(\);[\s\n]*if \(originalRange\) selection\.addRange\(originalRange\);/;

const replaceStr = `// 복사 버튼 훅 숨기기
                                          const hooks = Array.from(targetEl.querySelectorAll('.copy-button-hook'));
                                          const hookDisplays = hooks.map(h => h.style.display);
                                          hooks.forEach(h => h.style.display = 'none');
                                          
                                          range.selectNodeContents(targetEl);
                                          selection.removeAllRanges();
                                          selection.addRange(range);
                                          
                                          document.execCommand('copy');
                                          
                                          selection.removeAllRanges();
                                          if (originalRange) selection.addRange(originalRange);
                                          
                                          // 복사 버튼 훅 원상 복구
                                          hooks.forEach((h, i) => h.style.display = hookDisplays[i]);`;

if (regex.test(content)) {
    content = content.replace(regex, replaceStr);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Patched via Regex!");
} else {
    console.log("Not found via regex!");
}
