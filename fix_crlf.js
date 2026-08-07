const fs = require('fs');
const path = 'frontend/src/hooks/useFileExplorer.ts';
let content = fs.readFileSync(path, 'utf8');

const target = `      const monaco = (window as any).monaco;
      let model: any = null;`;

const repl = `      // [Bug Fix] CRLF를 LF로 정규화하여 Monaco getValue()와의 비교 시 isModified가 오작동하는 문제 해결
      fileContent = fileContent.replace(/\\r\\n/g, '\\n');

      const monaco = (window as any).monaco;
      let model: any = null;`;

content = content.replace(target, repl);
fs.writeFileSync(path, content, 'utf8');
console.log('done');
