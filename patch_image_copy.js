const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MainEditorApp.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `                                        const range = document.createRange();
                                        const targetEl = previewRef.current.querySelector('.markdown-viewer-root') || previewRef.current;
                                        range.selectNodeContents(targetEl);
                                        
                                        selection.removeAllRanges();
                                        selection.addRange(range);
                                        
                                        document.execCommand('copy');
                                        
                                        selection.removeAllRanges();
                                        if (originalRange) selection.addRange(originalRange);`;

const replaceStr = `                                        const range = document.createRange();
                                        const targetEl = previewRef.current.querySelector('.markdown-viewer-root') || previewRef.current;
                                        
                                        // 이미지 blob URL을 base64로 임시 변환 (Electron fetch 차단 대비 캔버스 사용)
                                        const imgs = Array.from(targetEl.querySelectorAll('img'));
                                        const restoredImgs = [];
                                        for (const img of imgs) {
                                          const src = img.src;
                                          if (src && src.startsWith('blob:')) {
                                            try {
                                              if (img.complete && img.naturalWidth > 0) {
                                                const canvas = document.createElement('canvas');
                                                canvas.width = img.naturalWidth;
                                                canvas.height = img.naturalHeight;
                                                const ctx = canvas.getContext('2d');
                                                if (ctx) {
                                                  ctx.drawImage(img, 0, 0);
                                                  img.dataset.originalSrc = src;
                                                  img.src = canvas.toDataURL('image/png');
                                                  restoredImgs.push(img);
                                                }
                                              }
                                            } catch (e) { console.error(e); }
                                          }
                                        }

                                        range.selectNodeContents(targetEl);
                                        
                                        selection.removeAllRanges();
                                        selection.addRange(range);
                                        
                                        document.execCommand('copy');
                                        
                                        selection.removeAllRanges();
                                        if (originalRange) selection.addRange(originalRange);
                                        
                                        // 이미지 URL 원상 복구
                                        for (const img of restoredImgs) {
                                          if (img.dataset.originalSrc) {
                                            img.src = img.dataset.originalSrc;
                                            delete img.dataset.originalSrc;
                                          }
                                        }`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replaceStr);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Patched Image Copy!");
} else {
    console.log("Not found targetStr for Image Copy!");
}
