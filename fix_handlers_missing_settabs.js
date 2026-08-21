const fs = require('fs');
const f = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/hooks/useEditorHandlers.ts';
let c = fs.readFileSync(f, 'utf8');

c = c.replace(
  /setCurrentFileNode\(\{ name: file\.name, kind: 'file', path: file\.path \}\);\s+lastSavedContentRef\.current = currentVal;\s+setSaveStatus\('saved'\);\s+await refreshFileList\(\);/g,
  "setCurrentFileNode({ name: file.name, kind: 'file', path: file.path });\n              lastSavedContentRef.current = currentVal;\n              setSaveStatus('saved');\n              setTabs(prev => prev.map(t => t.id === activeTabIdRef.current ? { ...t, isModified: false } : t));\n              await refreshFileList();"
);

c = c.replace(
  /setCurrentFileNode\(\{ name: fileHandle\.name, kind: 'file', handle: fileHandle \}\);\s+lastSavedContentRef\.current = currentVal;\s+setSaveStatus\('saved'\);\s+await refreshFileList\(\);/g,
  "setCurrentFileNode({ name: fileHandle.name, kind: 'file', handle: fileHandle });\n            lastSavedContentRef.current = currentVal;\n            setSaveStatus('saved');\n            setTabs(prev => prev.map(t => t.id === activeTabIdRef.current ? { ...t, isModified: false } : t));\n            await refreshFileList();"
);

fs.writeFileSync(f, c, 'utf8');
console.log('Fixed missing setTabs in useEditorHandlers');
