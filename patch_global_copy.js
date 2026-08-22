const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MainEditorApp.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `                                          range.selectNodeContents(targetEl);
                                          
                                          selection.removeAllRanges();
                                          selection.addRange(range);
                                          
                                          document.execCommand('copy');
                                          
                                          selection.removeAllRanges();
                                          if (originalRange) selection.addRange(originalRange);
                                          
                                          // 이미지 URL 원상 복구`;

const replaceStr = `                                          // 복사 버튼 훅 숨기기
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
                                          hooks.forEach((h, i) => h.style.display = hookDisplays[i]);
                                          
                                          // 이미지 URL 원상 복구`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replaceStr);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Patched MainEditorApp to hide copy button hooks!");
} else {
    console.log("Not found targetStr!");
}
