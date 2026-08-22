const { JSDOM } = require("jsdom");
const dom = new JSDOM(`
  <div class="markdown-viewer-root">
    <h1>H1</h1>
    <p>Text</p>
    <h2>H2</h2>
    <p>Text</p>
    <h3>H3 (1)</h3>
    <p>Text</p>
    <h3>H3 (2)</h3>
  </div>
`);
const document = dom.window.document;
const root = document.querySelector('.markdown-viewer-root');
const children = Array.from(root.children);
const levelNum = 3;
const seenLevels = new Set();
for (let i = 0; i < children.length; i++) {
    const el = children[i];
    const tagName = el.tagName.toLowerCase();
    const tagLevelMatch = tagName.match(/^h(\d)$/);
    if (!tagLevelMatch) continue;
    
    const tagLevel = parseInt(tagLevelMatch[1]);
    
    if (tagLevel <= levelNum) {
        if (seenLevels.has(tagLevel) || (tagLevel < Math.max(...Array.from(seenLevels.size ? seenLevels : [0])))) {
            el.style.setProperty('break-before', 'page', 'important');
            console.log(`Broke: ${el.textContent}`);
        } else {
            console.log(`Did not break: ${el.textContent}`);
        }
        seenLevels.add(tagLevel);
    }
}
