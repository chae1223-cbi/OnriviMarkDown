const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/lib/aiFormatter.ts';
let c = fs.readFileSync(file, 'utf8');

const target = '2. 표(Table)로 보이는 데이터는 마크다운 표 형식으로 변환하세요.';
const replacement = '2. 표(Table)로 보이는 데이터는 마크다운 표 형식으로 변환하세요.\n3. [중요] 특히 한글(HWP) 문서에서 추출된 데이터의 경우, 표의 셀(Cell) 내용이나 단어들이 줄바꿈이나 공백 없이 하나로 뭉쳐서(예: "항목값1값2") 추출되었을 수 있습니다. 문맥을 매우 신중히 분석하여 뭉쳐진 텍스트를 논리적인 표의 행과 열로 분리해 마크다운 표로 완벽하게 복원하세요.';

c = c.replace(target, replacement);
// Also fix the prompt numbering if needed, but it's fine.

fs.writeFileSync(file, c, 'utf8');
console.log('Fixed AI prompt');
