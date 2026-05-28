const fs = require('fs');
const path = require('path');
const base = __dirname + '/src/components';
const files = [path.join(base, 'FormulaModal.tsx'), path.join(base, 'YoutubeModal.tsx')];
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
