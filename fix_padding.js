const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MainEditorApp.tsx';
let c = fs.readFileSync(file, 'utf8');

const target = `previewMode === 'preview'
                              ? 'bg-surface-container-high p-4 overflow-y-auto'
                              : 'bg-surface-container-low px-0 pt-0 pb-40 overflow-hidden'`;

const replacement = `previewMode === 'preview'
                              ? 'bg-surface-container-high p-4 pb-48 overflow-y-auto'
                              : 'bg-surface-container-low px-0 pt-0 pb-48 overflow-hidden'`;

c = c.replace(target, replacement);

fs.writeFileSync(file, c, 'utf8');
console.log('Fixed padding bottom in MainEditorApp');
