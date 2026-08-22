let sanitizedBody = `
<h2>2. 자연</h2>
<p>수려한 자연 속에서...</p>
<h3>4경</h3>
<p>숲속에서...</p>
<h3>5경</h3>
<p>안양 시내를...</p>
`;
const levelNum = 3;
const splitRegexAll = new RegExp(`(<h[1-${levelNum}]\\b[^>]*>)`, 'gi');
const allParts = sanitizedBody.split(splitRegexAll);

let buffer = allParts[0]; 
let currentTitle = "Test";
let sectionIdx = 1;
let sections = [];
let lastSeenLevel = 0;

for (let i = 1; i < allParts.length; i += 2) {
    const hTag = allParts[i];
    const hContent = allParts[i + 1] || '';
    const tagLevelMatch = hTag.match(/<h(\d)/i);
    const tagLevel = tagLevelMatch ? parseInt(tagLevelMatch[1]) : 0;

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
