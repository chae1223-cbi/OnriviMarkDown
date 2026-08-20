const docs = [
  { tagName: 'H1', text: '1장' },
  { tagName: 'H2', text: '1절' },
  { tagName: 'H3', text: '1항' },
  { tagName: 'H3', text: '2항' },
  { tagName: 'H2', text: '2절' },
  { tagName: 'H3', text: '1항' },
  { tagName: 'H3', text: '2항' }
];

let firstLevelFound = false;
let bufferStartEl = null;
let levelNum = 3;
let pageCounter = 1;

for (let i = 0; i < docs.length; i++) {
  const el = docs[i];
  const tagLevel = parseInt(el.tagName.replace('H', ''));
  
  if (tagLevel > 0 && tagLevel <= levelNum) {
    if (tagLevel < levelNum) {
      if (firstLevelFound && bufferStartEl === null) {
        bufferStartEl = el;
        console.log(`[STATE] bufferStartEl = ${el.text}`);
      }
    } else {
      if (!firstLevelFound) {
        firstLevelFound = true;
        bufferStartEl = null;
        console.log(`[NO BREAK] ${el.text} (First level)`);
      } else {
        const insertTarget = bufferStartEl || el;
        pageCounter++;
        console.log(`\n--- PAGE ${pageCounter} BREAK BEFORE ${insertTarget.text} ---`);
        console.log(`[RENDER] ${el.text}`);
        bufferStartEl = null;
      }
    }
  } else {
    console.log(`[RENDER] ${el.text}`);
  }
}
