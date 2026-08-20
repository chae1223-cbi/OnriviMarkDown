const children = [
  { tagName: 'H1', text: '2026년' },
  { tagName: 'H2', text: '1. 온리비' },
  { tagName: 'H2', text: '2. 생산성' },
  { tagName: 'H2', text: '3. 집필' }
];

let lastSeenLevel = 0;
const levelNum = 2;

for (let i = 0; i < children.length; i++) {
  const el = children[i];
  const tagName = el.tagName.toLowerCase();
  const tagLevelMatch = tagName.match(/^h(\d)$/);
  if (!tagLevelMatch) continue;
  
  const tagLevel = parseInt(tagLevelMatch[1]);
  
  if (tagLevel <= levelNum) {
    if (lastSeenLevel !== 0 && tagLevel <= lastSeenLevel) {
      console.log(`BREAK BEFORE: ${el.text} (tagLevel: ${tagLevel}, lastSeenLevel: ${lastSeenLevel})`);
    } else {
      console.log(`NO BREAK: ${el.text} (tagLevel: ${tagLevel}, lastSeenLevel: ${lastSeenLevel})`);
    }
    lastSeenLevel = tagLevel;
  }
}
