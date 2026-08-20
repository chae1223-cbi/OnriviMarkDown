const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MainEditorApp.tsx';
let c = fs.readFileSync(file, 'utf8');

const regex = /const level = match\[1\]\.length;\s*const text = match\[2\]\.trim\(\);\s*const lineNumber = index \+ 1;/;

const replacement = `const level = match[1].length;
          let text = match[2].trim();
          
          // 💡 개요(TOC)에서 마크다운 태그가 그대로 노출되는 현상 방지
          text = text.replace(/\\*\\*(.*?)\\*\\*/g, '$1') // 굵게 **
                     .replace(/__(.*?)__/g, '$1') // 굵게 __
                     .replace(/\\*(.*?)\\*/g, '$1') // 기울임 *
                     .replace(/_(.*?)_/g, '$1') // 기울임 _
                     .replace(/~~(.*?)~~/g, '$1') // 취소선 ~~
                     .replace(/\`(.*?)\`/g, '$1') // 인라인 코드
                     .replace(/\\[(.*?)\\]\\(.*?\\)/g, '$1') // 링크 [텍스트](URL) -> 텍스트
                     .replace(/!\\[(.*?)\\]\\(.*?\\)/g, '$1') // 이미지 ![텍스트](URL) -> 텍스트
                     .replace(/<[^>]*>?/gm, ''); // HTML 태그 제거
                     
          const lineNumber = index + 1;`;

c = c.replace(regex, replacement);
fs.writeFileSync(file, c, 'utf8');
console.log('Rewrote successfully using regex!');
