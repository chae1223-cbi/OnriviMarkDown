const children = [
    { tagName: 'h1', textContent: 'H1' },
    { tagName: 'p', textContent: 'text' },
    { tagName: 'h2', textContent: 'H2 (First)' },
    { tagName: 'p', textContent: 'text' },
    { tagName: 'h3', textContent: 'H3 (First)' },
    { tagName: 'p', textContent: 'text' },
    { tagName: 'h3', textContent: 'H3 (Second)' },
    { tagName: 'p', textContent: 'text' },
    { tagName: 'h2', textContent: 'H2 (Second)' },
    { tagName: 'p', textContent: 'text' },
    { tagName: 'h3', textContent: 'H3 (Third)' }
];

const levelNum = 3;
let lastSeenLevel = 0;

for (let i = 0; i < children.length; i++) {
    const el = children[i];
    const tagName = el.tagName.toLowerCase();
    const tagLevelMatch = tagName.match(/^h(\d)$/);
    if (!tagLevelMatch) continue;
    
    const tagLevel = parseInt(tagLevelMatch[1]);
    
    if (tagLevel <= levelNum) {
        if (lastSeenLevel !== 0 && tagLevel <= lastSeenLevel) {
            console.log(`BREAK INJECTED BEFORE: ${el.textContent}`);
        } else {
            console.log(`NO BREAK BEFORE: ${el.textContent}`);
        }
        lastSeenLevel = tagLevel;
    }
}
