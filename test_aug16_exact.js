const docs = [
  { tagName: 'H2', text: 'Title' },
  { tagName: 'H2', text: '1. 온리비' },
  { tagName: 'H3', text: '1.1 상세' },
  { tagName: 'H3', text: '1.2 상세' },
  { tagName: 'H2', text: '2. 생산성' },
  { tagName: 'H3', text: '2.1 상세' },
  { tagName: 'H3', text: '2.2 상세' }
];

let firstLevelFound = false;
let bufferStartEl = null;
let levelNum = 3;

for (let i = 0; i < docs.length; i++) {
  const el = docs[i];
  const tagLevel = parseInt(el.tagName.replace('H', ''));
  
  if (tagLevel > 0 && tagLevel <= levelNum) {
    if (tagLevel < levelNum) {
      if (firstLevelFound && bufferStartEl === null) {
        bufferStartEl = el;
      }
    } else {
      if (!firstLevelFound) {
        firstLevelFound = true;
        bufferStartEl = null;
        console.log(`[FIRST TARGET NO BREAK] ${el.text}`);
      } else {
        const insertTarget = bufferStartEl || el;
        console.log(`[BREAK BEFORE] ${insertTarget.text}`);
        bufferStartEl = null;
      }
    }
  }
}
