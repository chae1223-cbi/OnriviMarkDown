const fs = require("fs");
let content = fs.readFileSync("frontend/src/components/MainEditorApp.tsx", "utf8");

const startStr = "const previewScrollTop = target.scrollTop;";
const endStr = "editor.setScrollPosition({ scrollTop: targetEditorScroll });\n                              }\n                            }";

const startIdx = content.indexOf(startStr);

function makeRegex(str) {
  return new RegExp(str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s*'));
}
const regexEnd = makeRegex(endStr);
const m = content.substring(startIdx).match(regexEnd);

if (startIdx !== -1 && m) {
    const actualEndIdx = startIdx + m.index;
    const actualEndLen = m[0].length;
    
    const before = content.substring(0, startIdx);
    const after = content.substring(actualEndIdx + actualEndLen);
    
    const newStr = `const previewScrollTop = target.scrollTop;
                            const previewScrollHeight = target.scrollHeight;
                            const previewViewportHeight = target.clientHeight;
                            const previewMaxScroll = previewScrollHeight - previewViewportHeight;
                            
                            if (previewMaxScroll <= 0) return;
                            
                            const scrollRatio = Math.max(0, Math.min(1, previewScrollTop / previewMaxScroll));
                            const targetPreviewY = previewScrollTop + previewViewportHeight * scrollRatio;
                            
                            const elements = Array.from(target.querySelectorAll('[data-line]')) as HTMLElement[];
                            if (elements.length === 0) return;
                            
                            let elA: HTMLElement | null = null;
                            let elB: HTMLElement | null = null;
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
                                
                                const viewportHeight = editor.getLayoutInfo().height || 800;
                                const scrollHeight = editor.getScrollHeight();
                                const editorMaxScroll = scrollHeight - viewportHeight;
                                
                                const topA = lineA === 1 ? 0 : editor.getTopForLineNumber(lineA);
                                const topB = elB ? editor.getTopForLineNumber(parseInt(elB.getAttribute('data-line')!, 10)) : scrollHeight;
                                
                                const previewTopA = elA.getBoundingClientRect().top - containerRect.top + previewScrollTop;
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
                                
                                editor.setScrollPosition({ scrollTop: targetEditorScroll });
                              }
                            }`;
                          
    fs.writeFileSync("frontend/src/components/MainEditorApp.tsx", before + newStr + after, "utf8");
    console.log("Success MainEditorApp.tsx");
} else {
    console.log("Failed MainEditorApp.tsx");
}
