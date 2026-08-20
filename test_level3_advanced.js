const docs = [
  { tagName: 'H1', text: '1장' },
  { tagName: 'H2', text: '1절' },
  { tagName: 'H3', text: '1항' },
  { tagName: 'H3', text: '2항' },
  { tagName: 'H2', text: '2절' },
  { tagName: 'H3', text: '1항' },
];

let firstLevelFound = false;
let levelNum = 3;

for (let i = 0; i < docs.length; i++) {
  const el = docs[i];
  const tagLevel = parseInt(el.tagName.replace('H', ''));
  
  if (tagLevel <= levelNum) {
    if (tagLevel < levelNum) {
      firstLevelFound = false;
      console.log(`NO BREAK (Reset): ${el.text}`);
    } else if (tagLevel === levelNum) {
      if (!firstLevelFound) {
        firstLevelFound = true;
        console.log(`NO BREAK (First): ${el.text}`);
      } else {
        console.log(`BREAK BEFORE: ${el.text}`);
      }
    }
  }
}
