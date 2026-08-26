const fs = require("fs");
let content = fs.readFileSync("frontend/src/hooks/editor/useMonacoSetup.ts", "utf8");

const startStr = "const totalLines = editor.getModel()?.getLineCount() || 1;";
const endStr = "parent.scrollTop = targetPreviewScroll;";

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
    
    const newStr = `const scrollRatio = Math.max(0, Math.min(1, scrollTop / editorMaxScroll));
                              const targetEditorY = scrollTop + viewportHeight * scrollRatio;
                              const totalLines = editor.getModel()?.getLineCount() || 1;
                              
                              let targetLine = 1;
                              const visibleRanges = editor.getVisibleRanges();
                              if (visibleRanges && visibleRanges.length > 0) {
                                let minDiff = Infinity;
                                for (let line = visibleRanges[0].startLineNumber; line <= visibleRanges[visibleRanges.length - 1].endLineNumber; line++) {
                                  const top = editor.getTopForLineNumber(line);
                                  const diff = Math.abs(top - targetEditorY);
                                  if (diff < minDiff) {
                                    minDiff = diff;
                                    targetLine = line;
                                  }
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
                              const topA = lineA === 1 && !elA ? 0 : editor.getTopForLineNumber(lineA);
                              const topB = elB ? editor.getTopForLineNumber(lineB) : scrollHeight;
                              
                              const previewTopA = elA ? (elA.getBoundingClientRect().top - parentRect.top + parent.scrollTop) : 0;
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
                              
                              parent.scrollTop = targetPreviewScroll;`;
                          
    fs.writeFileSync("frontend/src/hooks/editor/useMonacoSetup.ts", before + newStr + after, "utf8");
    console.log("Success useMonacoSetup.ts");
} else {
    console.log("Failed useMonacoSetup.ts");
}
