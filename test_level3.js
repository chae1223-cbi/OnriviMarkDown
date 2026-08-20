const docs = [
  { tagName: 'H1', text: '2026년 마크다운...' },
  { tagName: 'H2', text: '1. 온리비 어서' },
  { tagName: 'H3', text: '1.1 온리비 어서 상세' }, // Imaginary H3
  { tagName: 'H3', text: '1.2 온리비 어서 상세2' },
  { tagName: 'H2', text: '2. 생산성을 극대화' },
];

let firstLevelFound = false;
let levelNum = 3;

for (let i = 0; i < docs.length; i++) {
  const el = docs[i];
  const tagLevel = parseInt(el.tagName.replace('H', ''));
  
  if (tagLevel <= levelNum) {
    if (tagLevel < levelNum) {
      firstLevelFound = false;
      console.log(`NO BREAK (Reset Chunk): ${el.text}`);
    } else if (tagLevel === levelNum) {
      if (!firstLevelFound) {
        firstLevelFound = true;
        console.log(`NO BREAK (First Target): ${el.text}`);
      } else {
        console.log(`BREAK BEFORE: ${el.text}`);
      }
    }
  }
}
