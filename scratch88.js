const fs = require("fs");
let content = fs.readFileSync("frontend/src/components/MainEditorApp.tsx", "utf8");

const oldStr = `const previewMaxScroll = previewScrollHeight - previewViewportHeight;
                            
                            if (previewMaxScroll <= 0) return;
                            
                            const scrollRatio = Math.max(0, Math.min(1, previewScrollTop / previewMaxScroll));`;

const newStr = `const previewMaxScroll = previewScrollHeight - previewViewportHeight;
                            
                            if (previewMaxScroll <= 0) return;
                            
                            const isAtBottom = previewScrollTop >= previewMaxScroll - 2;
                            const scrollRatio = isAtBottom ? 1 : Math.max(0, Math.min(1, previewScrollTop / previewMaxScroll));`;

content = content.replace(oldStr, newStr);

const oldStr2 = `let targetEditorScroll = interpolatedEditorTop - viewportHeight * scrollRatio;
                                targetEditorScroll = Math.max(0, Math.min(editorMaxScroll, targetEditorScroll));
                                
                                editor.setScrollPosition({ scrollTop: targetEditorScroll });`;

const newStr2 = `let targetEditorScroll = interpolatedEditorTop - viewportHeight * scrollRatio;
                                targetEditorScroll = Math.max(0, Math.min(editorMaxScroll, targetEditorScroll));
                                
                                if (isAtBottom) {
                                  targetEditorScroll = editorMaxScroll;
                                }
                                
                                editor.setScrollPosition({ scrollTop: targetEditorScroll });`;

content = content.replace(oldStr2, newStr2);
fs.writeFileSync("frontend/src/components/MainEditorApp.tsx", content, "utf8");
console.log("Fixed isAtBottom in preview -> editor");
