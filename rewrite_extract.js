const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/lib/fileImporter.ts';
let c = fs.readFileSync(file, 'utf8');

const targetRegex = /const extractText = \(obj: any\) => \{[\s\S]*?if \(hwpDoc && hwpDoc.sections\) \{\s*extractText\(hwpDoc\.sections\);\s*\}/;

const replacement = `const extractTextNode = (obj: any): string => {
          let result = '';
          if (typeof obj === 'string') {
            return obj;
          } else if (Array.isArray(obj)) {
            return obj.map(item => extractTextNode(item)).join(' ');
          } else if (obj !== null && typeof obj === 'object') {
            // Table (id = 543974004)
            if (obj.id === 543974004 && Array.isArray(obj.content)) {
              let mdTable = '\\n\\n';
              obj.content.forEach((row: any, rIdx: number) => {
                let rowText = '| ';
                if (Array.isArray(row)) {
                  row.forEach((cell: any) => {
                    let cellStr = extractTextNode(cell).replace(/\\r?\\n/g, ' ').trim();
                    rowText += cellStr + ' | ';
                  });
                }
                mdTable += rowText + '\\n';
                if (rIdx === 0) {
                  let sep = '|';
                  if (Array.isArray(row)) {
                    row.forEach(() => { sep += '---|'; });
                  }
                  mdTable += sep + '\\n';
                }
              });
              return mdTable + '\\n\\n';
            }
            
            // Picture (type = 1667854372 or GenShapeObject = 544174951)
            if (obj.type === 1667854372 || obj.id === 544174951) {
              let placeholder = '::HWP_IMAGE_PLACEHOLDER::';
              if (obj.info && obj.info.binID !== undefined) {
                placeholder = '::HWP_IMAGE_PLACEHOLDER_' + obj.info.binID + '::';
              }
              return '\\n\\n' + placeholder + '\\n\\n';
            }

            if (obj.text) result += extractTextNode(obj.text);
            else if (obj.chars) result += extractTextNode(obj.chars);
            else {
              Object.values(obj).forEach(v => {
                if (typeof v === 'string' || typeof v === 'number' || (typeof v === 'object' && v !== null)) {
                   result += extractTextNode(v);
                }
              });
            }
            
            if ('controls' in obj || 'lines' in obj) {
              result += '\\n\\n';
            }
          }
          return result;
        };
        
        if (hwpDoc && hwpDoc.sections) {
          text = extractTextNode(hwpDoc.sections);
          // hwpDoc 객체를 외부에 노출하여 이미지 맵핑에 활용할 수 있도록 함
          (view as any)._parsedHwpDoc = hwpDoc;
        }`;

c = c.replace(targetRegex, replacement);

fs.writeFileSync(file, c, 'utf8');
console.log('Rewrote extractText to perfectly handle tables and pictures!');
