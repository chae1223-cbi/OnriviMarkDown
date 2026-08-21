const fs = require('fs');

const f1 = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MarkdownViewer.tsx';
let c1 = fs.readFileSync(f1, 'utf8');

// Replace pureSrc.startsWith('/media/')
c1 = c1.replace(
  /pureSrc\.startsWith\('\/media\/'\)/g,
  "(pureSrc.startsWith('/media/') || pureSrc.startsWith('./media/'))"
);

// Replace fileName = pureSrc.replace('/media/', '')
c1 = c1.replace(
  /const fileName = pureSrc\.replace\('\/media\/', ''\);/g,
  "const fileName = pureSrc.replace(/^\\.?\\/media\\//, '');"
);

// Replace webTargetSrc.startsWith('/media/')
c1 = c1.replace(
  /webTargetSrc\.startsWith\('\/media\/'\)/g,
  "(webTargetSrc.startsWith('/media/') || webTargetSrc.startsWith('./media/'))"
);

// Replace fileName = webTargetSrc.replace('/media/', '')
c1 = c1.replace(
  /const fileName = webTargetSrc\.replace\('\/media\/', ''\);/g,
  "const fileName = webTargetSrc.replace(/^\\.?\\/media\\//, '');"
);

// Replace actualSrc.startsWith('/media/')
c1 = c1.replace(
  /actualSrc\.startsWith\('\/media\/'\)/g,
  "(actualSrc.startsWith('/media/') || actualSrc.startsWith('./media/'))"
);

// Replace fileName = actualSrc.replace('/media/', '')
c1 = c1.replace(
  /const fileName = actualSrc\.replace\('\/media\/', ''\);/g,
  "const fileName = actualSrc.replace(/^\\.?\\/media\\//, '');"
);

// For normalizing:
c1 = c1.replace(
  "const normalizedSrc = sep === '\\\\' ? actualSrc.replace(/\\//g, '\\\\') : actualSrc;",
  "const strippedSrc = actualSrc.startsWith('./') ? actualSrc.substring(1) : actualSrc;\n                    const normalizedSrc = sep === '\\\\' ? strippedSrc.replace(/\\//g, '\\\\') : strippedSrc;"
);

c1 = c1.replace(
  "const normalizedSrc = sep === '\\\\' ? pureSrc.replace(/\\//g, '\\\\') : pureSrc;",
  "const strippedSrc = pureSrc.startsWith('./') ? pureSrc.substring(1) : pureSrc;\n                      const normalizedSrc = sep === '\\\\' ? strippedSrc.replace(/\\//g, '\\\\') : strippedSrc;"
);
// note: there are multiple normalizedSrc replacements for pureSrc and actualSrc, so I'll just use string replacement carefully.
fs.writeFileSync(f1, c1, 'utf8');
console.log('Fixed MD Viewer');
