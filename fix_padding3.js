const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MainEditorApp.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/pb-32/g, 'pb-56');

fs.writeFileSync(file, c, 'utf8');
console.log('Fixed padding bottom on preview-page-sheet');
