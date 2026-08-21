const fs = require('fs');
const f1 = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/YoutubeModal.tsx';
let c1 = fs.readFileSync(f1, 'utf8');

c1 = c1.replace(
  /appliedPath\.startsWith\('\/media\/'\)/g,
  "(appliedPath.startsWith('/media/') || appliedPath.startsWith('./media/'))"
);

c1 = c1.replace(
  /raw\.startsWith\('\/media\/'\)/g,
  "(raw.startsWith('/media/') || raw.startsWith('./media/'))"
);

c1 = c1.replace(
  /const fileName = raw\.replace\('\/media\/', ''\);/g,
  "const fileName = raw.replace(/^\\.?\\/media\\//, '');"
);

c1 = c1.replace(
  "const normalizedSrc = sep === '\\\\' ? raw.replace(/\\//g, '\\\\') : raw;",
  "const strippedSrc = raw.startsWith('./') ? raw.substring(1) : raw;\n          const normalizedSrc = sep === '\\\\' ? strippedSrc.replace(/\\//g, '\\\\') : strippedSrc;"
);

fs.writeFileSync(f1, c1, 'utf8');
console.log('Fixed Youtube');
