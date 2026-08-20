const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/lib/epubGenerator.ts';
let c = fs.readFileSync(file, 'utf8');

const target = `
      if (tagLevel <= levelNum) {
        if (lastSeenLevel !== 0 && tagLevel <= lastSeenLevel) {
          sections.push(buffer);
          buffer = '';
        }
        lastSeenLevel = tagLevel;
      }
`;

const replacement = `
      if (tagLevel <= levelNum) {
        if (tagLevel < levelNum) {
          firstLevelFound = false;
        } else if (tagLevel === levelNum) {
          if (!firstLevelFound) {
            firstLevelFound = true;
          } else {
            sections.push(buffer);
            buffer = '';
          }
        }
      }
`;

c = c.replace(target.trim(), replacement.trim());
c = c.replace('let lastSeenLevel = 0;', 'let firstLevelFound = false;');
fs.writeFileSync(file, c, 'utf8');
console.log('Fixed epubGenerator.ts');
