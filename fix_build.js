const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/desktop-build.js';
let c = fs.readFileSync(file, 'utf8');

if (!c.includes("route: 'sitemap.ts'")) {
    c = c.replace(/\{ parent: APP_DIR, route: 'terms' \}/, "{ parent: APP_DIR, route: 'terms' },\n  { parent: APP_DIR, route: 'sitemap.ts' }");
    fs.writeFileSync(file, c, 'utf8');
}
console.log('Added sitemap.ts to desktop-build.js excludes');
