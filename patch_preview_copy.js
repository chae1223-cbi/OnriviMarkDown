const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MainEditorApp.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetRegex = /(style=\{pageStyle\}\s*>\s*)(<MarkdownViewer)/g;

const replaceStr = `$1{/* 미리보기 복사 버튼 */}
                                <div className="absolute top-4 right-4 z-50 no-print opacity-0 hover:opacity-100 transition-opacity group-hover:opacity-100 duration-200 group" style={{ opacity: 0 }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}>
                                  <button
                                    onClick={async (e) => {
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
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/90 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 backdrop-blur-sm active:scale-95 transition-all"
                                    title="미리보기 결과 복사 (서식 포함)"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                    복사
                                  </button>
                                </div>
                                $2`;

if (targetRegex.test(content)) {
    content = content.replace(targetRegex, replaceStr);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Patched!");
} else {
    console.log("Not found!");
}
