const fs = require('fs');
let c1 = fs.readFileSync('d:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/lib/exportHandlers.ts', 'utf8');
c1 = c1.replace('  }\n}\n  \n// ====================================================================', '  }\n  \n// ====================================================================');
fs.writeFileSync('d:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/lib/exportHandlers.ts', c1, 'utf8');
console.log('Fixed syntax');
