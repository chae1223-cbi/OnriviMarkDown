const fs = require('fs');
const path = require('path');
const dir = 'd:/developer/OnriviMarkDown/frontend/src/components';
const files = ['FormulaModal.tsx', 'ImageModal.tsx', 'MapModal.tsx', 'SettingsModal.tsx', 'YoutubeModal.tsx'];
for (const file of files) {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  const lines = content.split('\n');
  lines.forEach((l, i) => {
    // count number of double quotes
    const doubleCount = (l.match(/"/g) || []).length;
    // count number of backticks
    const backtickCount = (l.match(/`/g) || []).length;
    if (doubleCount % 2 !== 0 && !l.includes('//') && !l.includes('`')) {
       console.log(file + ':' + (i+1) + ': ' + l.trim());
    }
  });
}
