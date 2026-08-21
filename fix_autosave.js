const fs = require('fs');
const f = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MainEditorApp.tsx';
let c = fs.readFileSync(f, 'utf8');

c = c.replace(
  "const success = await saveFile(saveContent, currentFileNode);\n        setSaveStatus(success ? 'saved' : 'unsaved');\n        if (success) {",
  "const success = await saveFile(saveContent, currentFileNode);\n        setSaveStatus(success ? 'saved' : 'unsaved');\n        if (success) {\n          lastSavedContentRef.current = saveContent;"
);

fs.writeFileSync(f, c, 'utf8');
console.log('Fixed autoSave');
