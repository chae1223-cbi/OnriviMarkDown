const fs = require('fs');

const f1 = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/ImageModal.tsx';
let c1 = fs.readFileSync(f1, 'utf8');

c1 = c1.replace(
  "if (cleanImagePath.startsWith('/media/') && resourceFolderHandle) {",
  "if ((cleanImagePath.startsWith('/media/') || cleanImagePath.startsWith('./media/')) && resourceFolderHandle) {"
);

c1 = c1.replace(
  "const fileName = cleanImagePath.replace('/media/', '');",
  "const fileName = cleanImagePath.replace(/^\\.?\\/media\\//, '');"
);

c1 = c1.replace(
  "if (cleanImagePath.startsWith('/media/')) {",
  "if (cleanImagePath.startsWith('/media/') || cleanImagePath.startsWith('./media/')) {"
);

c1 = c1.replace(
  "const normalizedSrc = sep === '\\\\' ? cleanImagePath.replace(/\\//g, '\\\\') : cleanImagePath;",
  "const strippedPath = cleanImagePath.startsWith('./') ? cleanImagePath.substring(1) : cleanImagePath;\n            const normalizedSrc = sep === '\\\\' ? strippedPath.replace(/\\//g, '\\\\') : strippedPath;"
);

fs.writeFileSync(f1, c1, 'utf8');
console.log('Fixed ImageModal');
