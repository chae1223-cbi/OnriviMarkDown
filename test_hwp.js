const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/lib/fileImporter.ts';
let c = fs.readFileSync(file, 'utf8');

const target = `// hwp.js에서 그림(Picture)이나 컨트롤(Control) 객체인 경우 플레이스홀더 삽입
            if (obj.id === 'Picture' || obj.type === 'Picture' || obj.name === 'Picture' || obj.ctrlId === 'gso' || obj.ctrlId === 'tbl') {
               text += '\\n\\n::HWP_IMAGE_PLACEHOLDER::\\n\\n';
            }`;

const replacement = `// hwp.js에서 그림(Picture)이나 컨트롤(Control) 객체인 경우 플레이스홀더 삽입
            if (obj.id === 'Picture' || obj.type === 'Picture' || obj.name === 'Picture' || obj.ctrlId === 'gso' || obj.ctrlId === 'tbl') {
               let placeholder = '::HWP_IMAGE_PLACEHOLDER::';
               if (obj.info && obj.info.binID !== undefined) {
                   placeholder = '::HWP_IMAGE_PLACEHOLDER_' + obj.info.binID + '::';
               } else if (obj.binItem !== undefined) {
                   placeholder = '::HWP_IMAGE_PLACEHOLDER_' + obj.binItem + '::';
               }
               text += '\\n\\n' + placeholder + '\\n\\n';
            }`;

c = c.replace(target, replacement);

fs.writeFileSync(file, c, 'utf8');
console.log('Injected precise HWP image placeholder with binID');
