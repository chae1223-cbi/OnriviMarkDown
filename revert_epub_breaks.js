const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/lib/epubGenerator.ts';
let c = fs.readFileSync(file, 'utf8');

const regex = /if\s*\(tagLevel\s*<=\s*levelNum\)\s*\{\s*if\s*\(tagLevel\s*<\s*levelNum\)[\s\S]*?\}\s*\}/;

const replacement = `if (tagLevel <= levelNum) {
        if (lastSeenLevel !== 0 && tagLevel <= lastSeenLevel) {
          sections.push(buffer);
          buffer = '';
        }
        lastSeenLevel = tagLevel;
      }`;

c = c.replace(regex, replacement);
c = c.replace('let firstLevelFound = false;', 'let lastSeenLevel = 0;');
fs.writeFileSync(file, c, 'utf8');
console.log('Reverted epubGenerator.ts');
