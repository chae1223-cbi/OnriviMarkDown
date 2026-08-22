let sanitizedBody = `
<h1>전통</h1>
<h2>1. 역사</h2>
<h3>1경</h3>
<h3>2경</h3>
<h3>3경</h3>
<h2>2. 자연</h2>
<h3>4경</h3>
<h3>5경</h3>
<h3>6경</h3>
`;
const levelNum = 3;
const splitRegexAll = new RegExp(`(<h[1-${levelNum}]\\b[^>]*>)`, 'gi');
const allParts = sanitizedBody.split(splitRegexAll);

let buffer = allParts[0]; 
let currentTitle = "Test";
let sectionIdx = 1;
let sections = [];
let lastSeenLevel = 0;

const extractHeadingTitle = (hContent) => {
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
          sections.push({ id: `section${sectionIdx++}`, html: buffer, title: currentTitle });
          buffer = '';
      }
      lastSeenLevel = tagLevel;
    }
    buffer += hTag + hContent;
}
if (buffer.trim()) {
  sections.push({ id: `section${sectionIdx++}`, html: buffer, title: currentTitle });
}

console.log(sections.map(s => s.html.trim().replace(/\n/g, ' ')));
