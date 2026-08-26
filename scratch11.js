const fs = require("fs");
let content = fs.readFileSync("frontend/src/components/MainEditorApp.tsx", "utf8");

const oldStr = `                          const elements = Array.from(target.querySelectorAll('[data-line]')) as HTMLElement[];
  
                            let elA = null;
                              let elB = null;
                              
                              for (let i = 0; i < elements.length; i++) {
                                const rect = elements[i].getBoundingClientRect();
                                const containerRect = target.getBoundingClientRect();
                                
                                if (rect.bottom >= containerRect.top) {
                                    elA = elements[i];
                                    const lineAStr = elA.getAttribute("data-line");
                                    if (lineAStr) {
                                      const lineA = parseInt(lineAStr, 10);
                                      for (let j = i + 1; j < elements.length; j++) {
                                        const nextEl = elements[j];
                                        const lineBStr = nextEl.getAttribute("data-line");
                                        if (lineBStr && parseInt(lineBStr, 10) > lineA) {
                                          elB = nextEl;
                                          break;
                                        }
                                      }
                                    }
                                    break;
                                  }
                              }
                              
                              if (elA && editorRef.current) {
                                const editor = editorRef.current;
                                const lineStrA = elA.getAttribute('data-line');
                                
                                if (lineStrA && typeof editor.getTopForLineNumber === 'function' && typeof editor.setScrollPosition === 'function') {
                                  const lineA = parseInt(lineStrA, 10);
                                  const topA = editor.getTopForLineNumber(lineA);
                                  
                                  let interpolatedScrollTop = topA;
                                  
                                  if (elB) {
                                    const lineStrB = elB.getAttribute('data-line');
                                    if (lineStrB) {
                                      const lineB = parseInt(lineStrB, 10);
                                      const topB = editor.getTopForLineNumber(lineB);
                                      
                                      const rectA = elA.getBoundingClientRect();
                                      const rectB = elB.getBoundingClientRect();
                                      const containerRect = target.getBoundingClientRect();
                                      
                                      const previewTopA = rectA.top - containerRect.top + target.scrollTop;
                                      const previewTopB = rectB.top - containerRect.top + target.scrollTop;
                                      
                                      const editorRange = topB - topA;
                                      const previewRange = previewTopB - previewTopA;
                                      
                                      if (previewRange > 0) {
                                        const progress = Math.max(0, Math.min(1, (target.scrollTop - previewTopA) / previewRange));
                                        interpolatedScrollTop = topA + progress * editorRange;
                                      }
                                    }
                                  }
                                  editor.setScrollTop(interpolatedScrollTop);
                                }
                              }`;

const newStr = `                          const previewScrollTop = target.scrollTop;
                          const previewScrollHeight = target.scrollHeight;
                          const previewViewportHeight = target.clientHeight;
                          const previewMaxScroll = previewScrollHeight - previewViewportHeight;
                          
                          let scrollRatio = 0;
                          if (previewMaxScroll > 0) {
                            scrollRatio = previewScrollTop / previewMaxScroll;
                          }
                          const targetPreviewY = previewScrollTop + previewViewportHeight * scrollRatio;
                          
                          const elements = Array.from(target.querySelectorAll('[data-line]')) as HTMLElement[];
                          
                          let elA = null;
                          let elB = null;
                          const containerRect = target.getBoundingClientRect();
                          
                          for (let i = 0; i < elements.length; i++) {
                            const rect = elements[i].getBoundingClientRect();
                            const elementTop = rect.top - containerRect.top + previewScrollTop;
                            
                            if (elementTop > targetPreviewY) {
                              break;
                            }
                            elA = elements[i];
                          }
                          
                          if (elA && editorRef.current) {
                            const editor = editorRef.current;
                            const lineAStr = elA.getAttribute('data-line');
                            
                            if (lineAStr && typeof editor.getTopForLineNumber === 'function' && typeof editor.setScrollPosition === 'function') {
                              const lineA = parseInt(lineAStr, 10);
                              
                              const indexA = elements.indexOf(elA);
                              for (let j = indexA + 1; j < elements.length; j++) {
                                const nextEl = elements[j];
                                const lineBStr = nextEl.getAttribute('data-line');
                                if (lineBStr && parseInt(lineBStr, 10) > lineA) {
                                  elB = nextEl;
                                  break;
                                }
                              }
                              
                              const topA = editor.getTopForLineNumber(lineA);
                              const previewTopA = elA.getBoundingClientRect().top - containerRect.top + previewScrollTop;
                              
                              const scrollHeight = editor.getScrollHeight();
                              const viewportHeight = editor.getLayoutInfo().height || 800;
                              const editorMaxScroll = scrollHeight - viewportHeight;
                              
                              const topB = elB ? editor.getTopForLineNumber(parseInt(elB.getAttribute('data-line'), 10)) : scrollHeight;
                              const previewTopB = elB ? (elB.getBoundingClientRect().top - containerRect.top + previewScrollTop) : previewScrollHeight;
                              
                              const previewRange = previewTopB - previewTopA;
                              const editorRange = topB - topA;
                              
                              let interpolatedEditorTop = topA;
                              if (previewRange > 0) {
                                const progress = Math.max(0, Math.min(1, (targetPreviewY - previewTopA) / previewRange));
                                interpolatedEditorTop = topA + progress * editorRange;
                              }
                              
                              let targetEditorScroll = interpolatedEditorTop - viewportHeight * scrollRatio;
                              targetEditorScroll = Math.max(0, Math.min(editorMaxScroll, targetEditorScroll));
                              
                              editor.setScrollTop(targetEditorScroll);
                            }
                          }`;

// simple replace all whitespace with \s* to create a flexible regex
function makeRegex(str) {
  return new RegExp(str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s*'));
}

content = content.replace(makeRegex(oldStr), newStr);
fs.writeFileSync("frontend/src/components/MainEditorApp.tsx", content, "utf8");
