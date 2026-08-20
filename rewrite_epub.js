const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/lib/epubGenerator.ts';
let c = fs.readFileSync(file, 'utf8');

const targetRegex = /if \(\!isNaN\(levelNum\) && levelNum >= 1 && levelNum <= 6\) \{[\s\S]*?\}\n    \} else \{/m;

const replacement = `if (!isNaN(levelNum) && levelNum >= 1 && levelNum <= 6) {
    // 1~6단계 모든 헤딩을 찾아 계층을 추적합니다.
    const splitRegexAll = new RegExp(\`(<h[1-6]\\\\b[^>]*>)\`, 'gi');
    const allParts = sanitizedBody.split(splitRegexAll);

    let buffer = allParts[0]; 
    let currentTitle = title;
    let sectionIdx = 1;
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

      if (tagLevel > 0 && tagLevel <= levelNum) {
        if (lastSeenLevel !== 0 && tagLevel <= lastSeenLevel) {
          // 분할 조건 성립! 여태까지 쌓인 버퍼를 새로운 섹션으로 푸시하고 초기화합니다.
          if (buffer.replace(/<[^>]*>/g, '').trim() !== '') {
            sections.push({ id: \`section\${sectionIdx++}\`, html: buffer, title: currentTitle });
          }
          buffer = '';
        }
        
        lastSeenLevel = tagLevel;
        
        // 챕터 제목 갱신 (가장 최상위 혹은 대표 제목으로 쓸만한 것 갱신)
        if (tagLevel === 1 || (tagLevel === 2 && currentTitle === title)) {
          const headingText = extractHeadingTitle(hContent);
          if (headingText) currentTitle = headingText;
        }
      }
      
      // 분할 여부와 상관없이 현재 헤딩은 버퍼에 누적됩니다.
      buffer += hTag + hContent;
    }

    // 남은 버퍼 처리
    if (buffer.replace(/<[^>]*>/g, '').trim()) {
      sections.push({ id: \`section\${sectionIdx++}\`, html: buffer, title: currentTitle });
    }
  } else {`;

c = c.replace(targetRegex, replacement);
fs.writeFileSync(file, c, 'utf8');
console.log('Rewrote epubGenerator.ts logic!');
