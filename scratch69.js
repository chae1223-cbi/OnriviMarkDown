const fs = require("fs");
let content = fs.readFileSync("frontend/src/hooks/editor/useMonacoSetup.ts", "utf8");

const oldStr = `// 💡 [OMD-SYNC-DEPRECATED] 커서 이동 시 동기화는 스크롤 이벤트(onDidScrollChange) 내부의 단일 정렬식으로 대통합되어 제거되었습니다.`;

const newStr = `// 💡 [OMD-SYNC-DEPRECATED] 커서 이동 시 동기화는 기본적으로 스크롤(onDidScrollChange) 내부에서 처리되지만,
                    // 에디터 내용이 짧아서 스크롤바가 없는 경우(editorMaxScroll <= 0)에는 커서 이벤트를 통한 동기화를 보완합니다.
                    if (previewModeRef.current === 'both' && previewRef.current) {
                      const layoutInfo = editor.getLayoutInfo();
                      const viewportHeight = layoutInfo.height || 800;
                      const scrollHeight = editor.getScrollHeight();
                      const editorMaxScroll = scrollHeight - viewportHeight;
                      
                      if (editorMaxScroll <= 0) {
                        const parent = previewRef.current;
                        const el = parent.querySelector(\`[data-line="\${currentLine}"]\`);
                        if (el) {
                          const parentRect = parent.getBoundingClientRect();
                          const elTop = el.getBoundingClientRect().top - parentRect.top + parent.scrollTop;
                          const targetScroll = elTop - (parent.clientHeight / 2) + (el.clientHeight / 2);
                          parent.scrollTop = Math.max(0, targetScroll);
                        }
                      }
                    }`;

content = content.replace(oldStr, newStr);
fs.writeFileSync("frontend/src/hooks/editor/useMonacoSetup.ts", content, "utf8");
console.log("Added cursor sync for short docs");
