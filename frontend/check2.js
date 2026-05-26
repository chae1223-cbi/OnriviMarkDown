const fs = require('fs');
const files = ['d:/developer/OnriviMarkDown/frontend/src/components/FormulaModal.tsx', 'd:/developer/OnriviMarkDown/frontend/src/components/YoutubeModal.tsx'];
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  content.split('\n').forEach((l, i) => {
    if (l.includes('?/')) console.log(file.split('/').pop() + ':' + (i+1) + ': ' + l.trim());
    if (l.includes('?<')) console.log(file.split('/').pop() + ':' + (i+1) + ': ' + l.trim());
    if (l.includes('?\"')) console.log(file.split('/').pop() + ':' + (i+1) + ': ' + l.trim());
    if (l.includes('?\'')) console.log(file.split('/').pop() + ':' + (i+1) + ': ' + l.trim());
    if (l.includes('?}')) console.log(file.split('/').pop() + ':' + (i+1) + ': ' + l.trim());
  });
});
