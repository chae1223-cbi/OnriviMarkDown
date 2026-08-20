const docs = [
  // Scenario 1: H1, H2, H2, H1, H2
  [
    { tagName: 'H1', text: 'Chap 1' },
    { tagName: 'H2', text: 'Sec 1' },
    { tagName: 'H2', text: 'Sec 2' },
    { tagName: 'H1', text: 'Chap 2' },
    { tagName: 'H2', text: 'Sec 1' }
  ],
  // Scenario 2: User's PDF (all H1)
  [
    { tagName: 'H1', text: '2026년' },
    { tagName: 'H1', text: '1. 온리비' },
    { tagName: 'H1', text: '2. 생산성' },
  ],
  // Scenario 3: User's PDF (H1 then H2)
  [
    { tagName: 'H1', text: '2026년' },
    { tagName: 'H2', text: '1. 온리비' },
    { tagName: 'H2', text: '2. 생산성' },
  ],
  // Scenario 4: Level 3 (H1, H2, H3, H3)
  [
    { tagName: 'H1', text: 'Title 1' },
    { tagName: 'H2', text: 'Title 2' },
    { tagName: 'H3', text: 'Title 3' },
    { tagName: 'H3', text: 'Next Title 3' },
  ]
];

for (let s = 0; s < docs.length; s++) {
  console.log(`\n--- Scenario ${s + 1} (Level 2) ---`);
  let firstLevelFound = false;
  let levelNum = 2;
  if (s === 3) levelNum = 3;

  for (let i = 0; i < docs[s].length; i++) {
    const el = docs[s][i];
    const tagLevel = parseInt(el.tagName.replace('H', ''));
    
    if (tagLevel <= levelNum) {
      if (tagLevel < levelNum) {
        firstLevelFound = false;
        console.log(`NO BREAK (Superior): ${el.text}`);
      } else if (tagLevel === levelNum) {
        if (!firstLevelFound) {
          firstLevelFound = true;
          console.log(`NO BREAK (First Target): ${el.text}`);
        } else {
          console.log(`BREAK BEFORE: ${el.text}`);
        }
      }
    } else {
      console.log(`IGNORED: ${el.text}`);
    }
  }
}
