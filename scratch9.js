const fs = require("fs");
let content = fs.readFileSync("frontend/src/hooks/editor/useMonacoSetup.ts", "utf8");

const newStr = `                          const editorMaxScroll = scrollHeight - viewportHeight;
                          if (editorMaxScroll > 0) {
                            isScrollingRef.current = 'editor';
                            
                            const scrollRatio = Math.max(0, Math.min(1, scrollTop / editorMaxScroll));
                            const targetEditorY = scrollTop + viewportHeight * scrollRatio;
                            const totalLines = editor.getModel()?.getLineCount() || 1;
                            
                            let targetLine = range[0].startLineNumber;
                            let minDiff = Infinity;
                            const endLine = range[range.length - 1].endLineNumber;
                            for (let line = range[0].startLineNumber; line <= endLine; line++) {
                              const top = editor.getTopForLineNumber(line);
                              const diff = Math.abs(top - targetEditorY);
                              if (diff < minDiff) {
                                minDiff = diff;
                                targetLine = line;
                              }
                            }
                            
                            let elA = null;
                            let lineA = 1;
                            for (let line = targetLine; line >= 1; line--) {
                              const found = parent.querySelector(\`[data-line="\${line}"]\`);
                              if (found) {
                                elA = found;
                                lineA = line;
                                break;
                              }
                            }
                            
                            let elB = null;
                            let lineB = totalLines + 1;
                            for (let line = lineA + 1; line <= totalLines; line++) {
                              const found = parent.querySelector(\`[data-line="\${line}"]\`);
                              if (found) {
                                elB = found;
                                lineB = line;
                                break;
                              }
                            }
                            
                            const parentRect = parent.getBoundingClientRect();
                            const topA = (lineA === 1 && !elA) ? 0 : editor.getTopForLineNumber(lineA);
                            const previewTopA = elA ? (elA.getBoundingClientRect().top - parentRect.top + parent.scrollTop) : 0;
                            
                            const topB = elB ? editor.getTopForLineNumber(lineB) : scrollHeight;
                            const previewTopB = elB ? (elB.getBoundingClientRect().top - parentRect.top + parent.scrollTop) : parent.scrollHeight;
                            
                            const editorRange = topB - topA;
                            const previewRange = previewTopB - previewTopA;
                            
                            let interpolatedPreviewTop = previewTopA;
                            if (editorRange > 0) {
                              const progress = Math.max(0, Math.min(1, (targetEditorY - topA) / editorRange));
                              interpolatedPreviewTop = previewTopA + progress * previewRange;
                            }
                            
                            const previewMaxScroll = parent.scrollHeight - parent.clientHeight;
                            let targetPreviewScroll = interpolatedPreviewTop - parent.clientHeight * scrollRatio;
                            targetPreviewScroll = Math.max(0, Math.min(previewMaxScroll, targetPreviewScroll));
                            
                            parent.scrollTop = targetPreviewScroll;
                            
                            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                            scrollTimeoutRef.current = setTimeout(() => { isScrollingRef.current = null; }, 50);
                          }`;

// In case encoding or exact match fails, use regex block replace
content = content.replace(/const editorMaxScroll = scrollHeight - viewportHeight;[\s\S]*?scrollTimeoutRef\.current = setTimeout\(\(\) => \{ isScrollingRef\.current = null; \}, 50\);\n\s*\}/, newStr + '\n                            }');

fs.writeFileSync("frontend/src/hooks/editor/useMonacoSetup.ts", content, "utf8");
