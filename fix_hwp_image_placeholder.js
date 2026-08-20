const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/lib/fileImporter.ts';
let c = fs.readFileSync(file, 'utf8');

const target = `// hwp.js에서 '문단(Paragraph)'을 나타내는 전형적인 속성(controls, lines 등)이 있다면`;
const replacement = `// hwp.js에서 그림(Picture)이나 컨트롤(Control) 객체인 경우 플레이스홀더 삽입
            if (obj.id === 'Picture' || obj.type === 'Picture' || obj.name === 'Picture' || obj.ctrlId === 'gso' || obj.ctrlId === 'tbl') {
               text += '\\n\\n::HWP_IMAGE_PLACEHOLDER::\\n\\n';
            }
            // hwp.js에서 '문단(Paragraph)'을 나타내는 전형적인 속성(controls, lines 등)이 있다면`;

c = c.replace(target, replacement);

fs.writeFileSync(file, c, 'utf8');
console.log('Injected HWP image placeholder in hwp.js parsing');
