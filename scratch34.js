const fs = require("fs");
let content = fs.readFileSync("frontend/src/hooks/editor/useMonacoSetup.ts", "utf8");

const startStr = "const scrollRatio = Math.max(0, Math.min(1, scrollTop / editorMaxScroll));";
const endStr = "targetPreviewScroll = Math.max(0, Math.min(previewMaxScroll, targetPreviewScroll));\n                            \n                            parent.scrollTop = targetPreviewScroll;";

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
    
    const newStr = `const totalLines = editor.getModel()?.getLineCount() || 1;
                              const targetLine = range[0].startLineNumber;
                              
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
                              const previewMaxScroll = parent.scrollHeight - parent.clientHeight;
                              
                              const editorTopA = lineA === 1 ? 0 : editor.getTopForLineNumber(lineA);
                              const editorTopB = elB ? editor.getTopForLineNumber(lineB) : editorMaxScroll + viewportHeight;
                              
                              const previewTopA = elA ? (elA.getBoundingClientRect().top - parentRect.top + parent.scrollTop) : 0;
                              const previewTopB = elB ? (elB.getBoundingClientRect().top - parentRect.top + parent.scrollTop) : parent.scrollHeight;
                              
                              let progress = 0;
                              if (!elB) {
                                const remaining = editorMaxScroll - editorTopA;
                                if (remaining > 0) progress = (scrollTop - editorTopA) / remaining;
                              } else if (editorTopB > editorTopA) {
                                progress = (scrollTop - editorTopA) / (editorTopB - editorTopA);
                              }
                              
                              let targetPreviewScroll = 0;
                              if (!elB) {
                                targetPreviewScroll = previewTopA + progress * (previewMaxScroll - previewTopA);
                              } else {
                                targetPreviewScroll = previewTopA + progress * (previewTopB - previewTopA);
                              }
                              
                              targetPreviewScroll = Math.max(0, Math.min(previewMaxScroll, targetPreviewScroll));
                              
                              parent.scrollTop = targetPreviewScroll;`;
                          
    fs.writeFileSync("frontend/src/hooks/editor/useMonacoSetup.ts", before + newStr + after, "utf8");
    console.log("Success useMonacoSetup.ts");
} else {
    console.log("Failed useMonacoSetup.ts");
}
