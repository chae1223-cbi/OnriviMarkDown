const fs = require('fs');
const f = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/hooks/useEditorHandlers.ts';
let c = fs.readFileSync(f, 'utf8');

c = c.replace(
  "return {",
  "return {\n    setTabs,"
);

fs.writeFileSync(f, c, 'utf8');
console.log('Fixed handlers setTabs return');
