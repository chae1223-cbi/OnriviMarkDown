const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/lib/exportHandlers.ts';
let c = fs.readFileSync(file, 'utf8');

c = c.replace('lastSeenLevel = tagLevel;\n      }\n      }\n    }\n  }', 'lastSeenLevel = tagLevel;\n    }\n  }\n}');
fs.writeFileSync(file, c, 'utf8');
