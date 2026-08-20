const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MainEditorApp.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(
  /'bg-surface-container-high p-4 overflow-y-auto'/,
  "'bg-surface-container-high p-4 pb-48 overflow-y-auto'"
);
c = c.replace(
  /'bg-surface-container-low px-0 pt-0 pb-40 overflow-hidden'/,
  "'bg-surface-container-low px-0 pt-0 pb-48 overflow-hidden'"
);

fs.writeFileSync(file, c, 'utf8');
console.log('Fixed padding bottom again');
