const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/hooks/editor/useMonacoSetup.ts';
let content = fs.readFileSync(file, 'utf8');

// The corrupted code looks like:
// const isListLine = (lineStr: string) => /^[ \t\u200b\u00a0]*(?:[-*+]|\d+\.)/.test(lineStr);
// But with corrupted characters.
// Let's replace the whole autoRenumberList action block using regex.
const actionRegex = /editor\.addAction\(\{\s*id:\s*'autoRenumberList'[\s\S]*?(?=editor\.addAction\(\{\s*id:\s*'custom-enter-list-auto')/;

const correctStr = `editor.addAction({
  id: 'autoRenumberList',
  label: 'Auto Renumber Lists',
  run: () => {
    const model = editor.getModel();
    if (!model) return;
    
    const selection = editor.getSelection();
    if (!selection) return;
    
    const position = selection.startLineNumber;
    let blockStart = position;
    let blockEnd = position;
    
    // Use standard space and tab to avoid encoding issues
    const isListLine = (lineStr: string) => /^[ \\t]*(?:[-*+]|\\d+\\.)/.test(lineStr);
    
    while (blockStart > 1) {
      const prevContent = model.getLineContent(blockStart - 1);
      if (isListLine(prevContent)) {
        blockStart--;
      } else if (prevContent.trim() === '') {
        let foundList = false;
        for (let j = blockStart - 2; j >= 1; j--) {
          const upContent = model.getLineContent(j);
          if (isListLine(upContent)) {
            foundList = true;
            blockStart = j;
            break;
          } else if (upContent.trim() !== '') {
            break;
          }
        }
        if (!foundList) break;
      } else {
        break;
      }
    }
    
    const lineCount = model.getLineCount();
    while (blockEnd < lineCount) {
      const nextContent = model.getLineContent(blockEnd + 1);
      if (isListLine(nextContent)) {
        blockEnd++;
      } else if (nextContent.trim() === '') {
        let foundList = false;
        for (let j = blockEnd + 2; j <= lineCount; j++) {
          const downContent = model.getLineContent(j);
          if (isListLine(downContent)) {
            foundList = true;
            blockEnd = j;
            break;
          } else if (downContent.trim() !== '') {
            break;
          }
        }
        if (!foundList) break;
      } else {
        break;
      }
    }
    
    const edits: any[] = [];
    const indentStack: { indent: string, count: number }[] = [];
    
    for (let i = blockStart; i <= blockEnd; i++) {
      const lineContent = model.getLineContent(i);
      const match = lineContent.match(/^([ \\t]*)([-*+]|\\d+\\.)([ \\t]+)(.*)/);
      if (!match) continue;
      
      const currentIndent = match[1];
      const marker = match[2];
      const isNumbered = /^\\d+\\.$/.test(marker);
      
      let stackIndex = -1;
      for (let s = 0; s < indentStack.length; s++) {
        if (indentStack[s].indent === currentIndent) {
          stackIndex = s;
          break;
        }
      }
      
      if (stackIndex !== -1) {
        indentStack.splice(stackIndex + 1);
      } else {
        while (indentStack.length > 0 && indentStack[indentStack.length - 1].indent.length > currentIndent.length) {
          indentStack.pop();
        }
        if (indentStack.length === 0 || indentStack[indentStack.length - 1].indent !== currentIndent) {
          indentStack.push({ indent: currentIndent, count: 1 });
        }
        stackIndex = indentStack.length - 1;
      }
      
      if (isNumbered) {
        const currentCount = indentStack[stackIndex].count;
        const newMarker = currentCount + ".";
        if (marker !== newMarker) {
          const oldPrefixLength = currentIndent.length + marker.length + match[3].length;
          const newPrefix = currentIndent + newMarker + match[3];
          edits.push({
            range: new (window as any).monaco.Range(i, 1, i, oldPrefixLength + 1),
            text: newPrefix
          });
        }
        indentStack[stackIndex].count++;
      } else {
        indentStack[stackIndex].count = 1;
      }
    }
    
    if (edits.length > 0) {
      editor.pushUndoStop();
      editor.executeEdits("autoRenumber", edits);
      editor.pushUndoStop();
    }
  }
});

                    `;

if (actionRegex.test(content)) {
    content = content.replace(actionRegex, correctStr);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Successfully replaced autoRenumberList with clean regex.");
} else {
    console.log("Failed to find autoRenumberList block.");
}
