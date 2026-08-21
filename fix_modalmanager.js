const fs = require('fs');
const f = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/editor/modals/ModalManager.tsx';
let c = fs.readFileSync(f, 'utf8');

c = c.replace(/setSaveStatus\('saved'\);/g, "setSaveStatus('saved');\n                      if (handlers && handlers.setTabs) {\n                        handlers.setTabs((prev: any[]) => prev.map(t => t.id === finalName || t.path === finalName ? { ...t, isModified: false } : t));\n                      }");

fs.writeFileSync(f, c, 'utf8');
console.log('Fixed ModalManager');
