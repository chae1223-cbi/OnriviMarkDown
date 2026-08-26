const fs = require("fs");
let content = fs.readFileSync("frontend/src/components/MainEditorApp.tsx", "utf8");

const startStr = "const elements = Array.from(target.querySelectorAll('[data-line]')) as HTMLElement[];";
const startIdx = content.indexOf(startStr);

if (startIdx !== -1) {
    const searchStr = "editor.setScrollTop(";
    let endIdx = content.indexOf(searchStr, startIdx);
    
    // find the two closing braces after editor.setScrollTop(...)
    let braceCount = 0;
    for (let i = endIdx; i < content.length; i++) {
        if (content[i] === '}') braceCount++;
        if (braceCount === 2) {
            endIdx = i + 1;
            break;
        }
    }
    
    const before = content.substring(0, startIdx);
    const after = content.substring(endIdx);
    
    const newStr = `const previewScrollTop = target.scrollTop;
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
                          
    fs.writeFileSync("frontend/src/components/MainEditorApp.tsx", before + newStr + after, "utf8");
    console.log("Success");
} else {
    console.log("Could not find start bound.");
}
