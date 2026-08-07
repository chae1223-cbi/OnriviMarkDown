const fs = require('fs');
const path = 'frontend/src/components/MainEditorApp.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `          // --- 이하 신규 탭 생성 로직은 기존과 동일 ---
          const monaco = (window as any).monaco;
          let model: any = null;
          if (monaco) {
            model = monaco.editor.createModel(file.content, 'markdown');`;

const repl = `          // --- 이하 신규 탭 생성 로직은 기존과 동일 ---
          // [Bug Fix] CRLF를 LF로 정규화하여 Monaco getValue()와의 비교 시 isModified가 오작동하는 문제 해결
          file.content = file.content.replace(/\\r\\n/g, '\\n');

          const monaco = (window as any).monaco;
          let model: any = null;
          if (monaco) {
            model = monaco.editor.createModel(file.content, 'markdown');`;

content = content.replace(target, repl);

fs.writeFileSync(path, content, 'utf8');
console.log('done');
