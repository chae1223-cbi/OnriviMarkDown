const fs = require('fs');
const file1 = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/lib/exportHandlers.ts';
let c1 = fs.readFileSync(file1, 'utf8');

const regex1 = /let\s*firstLevelFound\s*=\s*false;\s*\/\/[^\n]*\n\s*\/\/[^\n]*\n\s*\/\/[^\n]*\n\s*let\s*bufferStartEl\s*:\s*HTMLElement\s*\|\s*null\s*=\s*null;\s*for\s*\(let\s*i\s*=\s*0;\s*i\s*<\s*children\.length;\s*i\+\+\)\s*\{[\s\S]*?\/\/\s*?반 콘텐?p, ul/m;

const replacement1 = `
    let lastSeenLevel = 0;
    for (let i = 0; i < children.length; i++) {
      const el = children[i];
      const tagName = el.tagName.toLowerCase();
      const tagLevelMatch = tagName.match(/^h(\d)$/);
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
    // ?반 콘텐?p, ul`;

c1 = c1.replace(regex1, replacement1.trim());
fs.writeFileSync(file1, c1, 'utf8');

const file2 = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/lib/epubGenerator.ts';
let c2 = fs.readFileSync(file2, 'utf8');

const regex2 = /let\s*firstLevelFound\s*=\s*false;\s*const\s*extractHeadingTitle[\s\S]*?\/\/\s*?? 버퍼가 ?는 경우/m;

const replacement2 = `
      let lastSeenLevel = 0;
      const extractHeadingTitle = (hContent: string): string => {
        const match = hContent.match(/<\/h[1-6]>/i);
        return match && match.index !== undefined
          ? hContent.substring(0, match.index).replace(/<[^>]*>/g, '').trim()
          : '';
      };

      for (let i = 1; i < allParts.length; i += 2) {
        const hTag = allParts[i];
        const hContent = allParts[i + 1] || '';
        const tagLevelMatch = hTag.match(/<h(\d)/i);
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
      // ?? 버퍼가 ?는 경우`;

c2 = c2.replace(regex2, replacement2.trim());
fs.writeFileSync(file2, c2, 'utf8');
console.log('Applied true logic');
