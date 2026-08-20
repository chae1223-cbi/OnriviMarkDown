const fs = require('fs');
let c1 = fs.readFileSync('d:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/lib/exportHandlers.ts', 'utf8');
c1 = c1.replace(/\}\s*\}\s*\n\/\/ \[ONR-EXP-001\]/m, '}\n\n// [ONR-EXP-001]');
fs.writeFileSync('d:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/lib/exportHandlers.ts', c1, 'utf8');
