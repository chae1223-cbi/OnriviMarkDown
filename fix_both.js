const fs = require('fs');

let c1 = fs.readFileSync('d:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/lib/exportHandlers.ts', 'utf8');
const p1Start = c1.indexOf('let firstLevelFound = false;');
const p1End = c1.indexOf('// 일반', p1Start) === -1 ? c1.indexOf('// ?반', p1Start) : c1.indexOf('// 일반', p1Start);
c1 = c1.substring(0, p1Start) + `
    let lastSeenLevel = 0;
    for (let i = 0; i < children.length; i++) {
      const el = children[i];
      const tagName = el.tagName.toLowerCase();
      const tagLevelMatch = tagName.match(/^h(\\d)$/);
      if (!tagLevelMatch) continue;
      
      const tagLevel = parseInt(tagLevelMatch[1]);
      
      if (tagLevel <= levelNum) {
        if (lastSeenLevel !== 0 && tagLevel <= lastSeenLevel) {
          const marker = document.createElement('div');
          marker.style.cssText = 'break-before: page !important; page-break-before: always !important; height: 0; margin: 0; padding: 0; border: none;';
          root.insertBefore(marker, el);
        }
        lastSeenLevel = tagLevel;
      }
    }
    ` + c1.substring(p1End);
fs.writeFileSync('d:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/lib/exportHandlers.ts', c1, 'utf8');

let c2 = fs.readFileSync('d:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/lib/epubGenerator.ts', 'utf8');
const p2Start = c2.indexOf('let firstLevelFound = false;');
const p2End = c2.indexOf('// 남은', p2Start) === -1 ? c2.indexOf('// ??', p2Start) : c2.indexOf('// 남은', p2Start);
c2 = c2.substring(0, p2Start) + `
      let lastSeenLevel = 0;
      const extractHeadingTitle = (hContent: string): string => {
        const match = hContent.match(/<\\/h[1-6]>/i);
        return match && match.index !== undefined
          ? hContent.substring(0, match.index).replace(/<[^>]*>/g, '').trim()
          : '';
      };

      for (let i = 1; i < allParts.length; i += 2) {
        const hTag = allParts[i];
        const hContent = allParts[i + 1] || '';
        const tagLevelMatch = hTag.match(/<h(\\d)/i);
        const tagLevel = tagLevelMatch ? parseInt(tagLevelMatch[1]) : 0;
  
        const headingText = extractHeadingTitle(hContent);
        if (headingText) currentTitle = headingText;

        if (tagLevel > 0 && tagLevel <= levelNum) {
          if (lastSeenLevel !== 0 && tagLevel <= lastSeenLevel) {
             sections.push({ id: \`section\${sectionIdx++}\`, html: buffer, title: currentTitle });
             buffer = '';
          }
          lastSeenLevel = tagLevel;
        }
        buffer += hTag + hContent;
      }
      ` + c2.substring(p2End);
fs.writeFileSync('d:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/lib/epubGenerator.ts', c2, 'utf8');

console.log('Fixed both');
