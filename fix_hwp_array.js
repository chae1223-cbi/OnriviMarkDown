const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/lib/fileImporter.ts';
let c = fs.readFileSync(file, 'utf8');

const target = `} else if (Array.isArray(obj)) {
          obj.forEach(extractText);
        }`;

const replacement = `} else if (Array.isArray(obj)) {
          obj.forEach((item, idx) => {
            extractText(item);
            // 배열 요소(셀, 문단 등) 사이에 탭 문자를 삽입하여 표 데이터가 뭉치는 것을 방지 (AI가 표를 인식하도록 힌트 제공)
            if (idx < obj.length - 1) text += '\\t';
          });
        }`;

c = c.replace(target, replacement);

fs.writeFileSync(file, c, 'utf8');
console.log('Fixed hwp.js array traversal delimiter');
