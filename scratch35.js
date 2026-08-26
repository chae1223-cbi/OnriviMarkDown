const fs = require("fs");
let content = fs.readFileSync("frontend/src/hooks/editor/useMonacoSetup.ts", "utf8");

const startStr = "editor.onDidChangeCursorPosition((e) => {";
const endStr = "prevCursorLineRef.current = currentLine;";

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
    
    const newStr = `editor.onDidChangeCursorPosition((e) => {
                      setActiveLine(e.position.lineNumber);
                      setCursorLine(e.position.lineNumber);
                      setCursorColumn(e.position.column);
  
                      const currentLine = e.position.lineNumber;
                      const prevLine = prevCursorLineRef.current;
                      prevCursorLineRef.current = currentLine;
                      
                      // 짧은 문서(스크롤 없음) 환경에서 커서 이동 시 미리보기 동기화 보장
                      if (previewModeRef.current === 'both' && previewRef.current) {
                        const layout = editor.getLayoutInfo();
                        if (editor.getScrollHeight() - (layout.height || 800) <= 0 || e.reason === 3) {
                          // e.reason === 3 (Explicit 커서 클릭/이동) 또는 스크롤바가 없는 상태
                          const parent = previewRef.current;
                          const el = parent.querySelector(\`[data-line="\${currentLine}"]\`);
                          if (el) {
                            verticalScrollToElement(parent, el as HTMLElement, 'center', 'smooth');
                          }
                        }
                      }`;
                          
    fs.writeFileSync("frontend/src/hooks/editor/useMonacoSetup.ts", before + newStr + after, "utf8");
    console.log("Success cursor sync");
} else {
    console.log("Failed cursor sync");
}
