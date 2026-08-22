const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MainEditorApp.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      if (!previewRef.current) return;
                                      try {
                                        const htmlContent = previewRef.current.innerHTML;
                                        const textContent = previewRef.current.innerText;
                                        
                                        const blobHtml = new Blob([htmlContent], { type: 'text/html' });
                                        const blobText = new Blob([textContent], { type: 'text/plain' });
                                        const data = [new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText })];
                                        await navigator.clipboard.write(data);
                                        
                                        const btn = e.currentTarget;
                                        const originalText = btn.innerHTML;
                                        btn.innerHTML = '복사 완료!';
                                        setTimeout(() => { btn.innerHTML = originalText; }, 2000);
                                      } catch (err) {
                                        try {
                                          await navigator.clipboard.writeText(previewRef.current.innerText);
                                          const btn = e.currentTarget;
                                          const originalText = btn.innerHTML;
                                          btn.innerHTML = '텍스트 복사 완료!';
                                          setTimeout(() => { btn.innerHTML = originalText; }, 2000);
                                        } catch(e) {
                                          console.error("복사에 실패했습니다.", e);
                                        }
                                      }
                                    }}`;

const replaceStr = `                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!previewRef.current) return;
                                      
                                      const btn = e.currentTarget;
                                      const originalText = btn.innerHTML;
                                      
                                      try {
                                        const selection = window.getSelection();
                                        const originalRange = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
                                        
                                        const range = document.createRange();
                                        const targetEl = previewRef.current.querySelector('.markdown-viewer-root') || previewRef.current;
                                        range.selectNodeContents(targetEl);
                                        
                                        selection.removeAllRanges();
                                        selection.addRange(range);
                                        
                                        document.execCommand('copy');
                                        
                                        selection.removeAllRanges();
                                        if (originalRange) selection.addRange(originalRange);
                                        
                                        btn.innerHTML = '서식 복사 완료!';
                                        setTimeout(() => { btn.innerHTML = originalText; }, 2000);
                                      } catch (err) {
                                        console.error("서식 복사 실패:", err);
                                      }
                                    }}`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replaceStr);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Patched Rich Copy!");
} else {
    console.log("Not found targetStr for Rich Copy!");
}
