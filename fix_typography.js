const fs = require('fs');
const file = './frontend/src/constants/cssProfile.ts';
let content = fs.readFileSync(file, 'utf8');

// replace all "p": { ... } where it doesn't already have word-break
content = content.replace(/"p":\s*\{([\s\S]*?)\}/g, (match, p1) => {
  if (p1.includes('word-break')) return match;
  return '"p": {' + p1.replace(/(\s+)$/, ',\n        "word-break": "keep-all",\n        "overflow-wrap": "break-word"$1') + '}';
});

fs.writeFileSync(file, content);
console.log('Done updating cssProfile.ts');
