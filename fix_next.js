const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/next.config.js';
let c = fs.readFileSync(file, 'utf8');
c = c.replace(/...\(isDev \? \{\} : \{ output: 'export' \}\),/, '...(isDev && !isDesktopBuild ? {} : { output: \'export\' }),');
fs.writeFileSync(file, c, 'utf8');
