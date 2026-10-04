import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import test from 'node:test';
import ts from 'typescript';
import JSZip from 'jszip';
import { JSDOM } from 'jsdom';
const require = createRequire(import.meta.url);
const moduleUrl = source => 'data:text/javascript;base64,' + Buffer.from(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText).toString('base64');
const paper = moduleUrl(await readFile(new URL('../src/constants/paperSizes.ts', import.meta.url), 'utf8'));
const formatting = moduleUrl((await readFile(new URL('../src/lib/docxFormatting.ts', import.meta.url), 'utf8')).replace('../constants/paperSizes', paper));
const source = (await readFile(new URL('../src/lib/docxGenerator.ts', import.meta.url), 'utf8')).replace("'jszip'", JSON.stringify(pathToFileURL(require.resolve('jszip')).href)).replace('./docxFormatting', formatting);
const { generateDocx } = await import(moduleUrl(source));
test('DOCX preserves styles, page settings, numbering, links and merged cell blocks', async () => {
  const dom = new JSDOM('<main><h1 id="title">Title</h1><p><a href="#title">Internal</a> <a href="https://example.com/?a=1&amp;b=2">External</a></p><ol start="3"><li>First<ul><li>Nested</li></ul></li><li>Second</li></ol><table><tr><td rowspan="2"><p>Paragraph one</p><p>Paragraph two</p></td><td colspan="2">Wide</td></tr><tr><td>A</td><td>B</td></tr></table></main>');
  globalThis.Node = dom.window.Node; globalThis.HTMLElement = dom.window.HTMLElement;
  const profile = { pageStyle: { paperSize: 'a5', orientation: 'landscape', marginTop: '10mm', marginBottom: '10mm', marginLeft: '10mm', marginRight: '10mm', fontFamily: 'Arial', fontSize: '16px', lineHeight: '1.5' }, rules: { h1: { 'font-size': '24px', color: '#123456' } } };
  const blob = await generateDocx(dom.window.document.querySelector('main'), { profile });
  const zip = await JSZip.loadAsync(await blob.arrayBuffer());
  const xml = await zip.file('word/document.xml').async('string');
  const parsed = new dom.window.DOMParser().parseFromString(xml, 'application/xml');
  assert.equal(parsed.querySelector('parsererror'), null);
  assert.match(xml, /w:orient="landscape"/); assert.match(xml, /w:gridSpan w:val="2"/); assert.match(xml, /w:vMerge w:val="restart"/); assert.match(xml, /<w:vMerge\/>/);
  assert.match(xml, /w:hyperlink w:anchor="onrivi_/); assert.match(xml, /w:hyperlink r:id="rIdLink1"/);
  assert.equal(parsed.getElementsByTagName('w:numPr').length, 3);
  const cell = Array.from(parsed.getElementsByTagName('w:tc')).find(cell => cell.textContent.includes('Paragraph one'));
  assert.equal(cell.getElementsByTagName('w:p').length, 2);
  assert.match(await zip.file('word/numbering.xml').async('string'), /w:startOverride w:val="3"/);
  assert.match(await zip.file('word/styles.xml').async('string'), /w:color w:val="123456"/);
  assert.match(await zip.file('word/_rels/document.xml.rels').async('string'), /TargetMode="External"/);
});
test('DOCX matches preserved line breaks and measured table proportions without creating breaks in normal text', async () => {
  const dom = new JSDOM(`<main><p data-docx-white-space="break-spaces">First\n<strong>Second</strong>\tThird<br>Fourth</p><p data-docx-white-space="normal">One\nTwo</p><table data-docx-width="600"><tr><td data-docx-width="100" data-docx-padding-left="12px">Short</td><td data-docx-width="500" data-docx-padding-left="20px">Long description</td></tr><tr><td colspan="2" data-docx-width="600">Merged</td></tr></table></main>`);
  globalThis.Node = dom.window.Node; globalThis.HTMLElement = dom.window.HTMLElement;
  const zip = await JSZip.loadAsync(await (await generateDocx(dom.window.document.querySelector('main'))).arrayBuffer());
  const xml = await zip.file('word/document.xml').async('string');
  const doc = new dom.window.DOMParser().parseFromString(xml, 'application/xml');
  assert.equal(doc.querySelector('parsererror'), null);
  assert.equal(doc.getElementsByTagName('w:br').length, 2);
  assert.equal(doc.getElementsByTagName('w:tab').length, 1);
  assert.ok(Array.from(doc.getElementsByTagName('w:t')).some(el => el.textContent === 'One Two'));
  const widths = Array.from(doc.getElementsByTagName('w:gridCol')).map(el => +el.getAttribute('w:w'));
  assert.ok(Math.abs(widths[1] / widths[0] - 5) < 0.01);
  const cells = Array.from(doc.getElementsByTagName('w:tc'));
  assert.equal(+cells[2].getElementsByTagName('w:tcW')[0].getAttribute('w:w'), widths[0] + widths[1]);
  assert.match(xml, /<w:left w:w="180" w:type="dxa"\/>/);
  assert.match(xml, /<w:left w:w="300" w:type="dxa"\/>/);
});


test('preview sentence break markers export as Word breaks without duplicate newlines', async () => {
  const dom = new JSDOM('<main><p data-docx-white-space="normal">First<span class="onrivi-sentence-br"></span>\n<strong>Second</strong></p><p data-docx-white-space="pre-wrap">Third<span class="onrivi-sentence-br"></span>\nFourth</p></main>');
  globalThis.Node = dom.window.Node; globalThis.HTMLElement = dom.window.HTMLElement;
  const zip = await JSZip.loadAsync(await (await generateDocx(dom.window.document.querySelector('main'))).arrayBuffer());
  const xml = await zip.file('word/document.xml').async('string');
  const doc = new dom.window.DOMParser().parseFromString(xml, 'application/xml');
  assert.equal(doc.querySelector('parsererror'), null);
  assert.equal(doc.getElementsByTagName('w:br').length, 2);
  assert.equal(Array.from(doc.getElementsByTagName('w:t')).map(t => t.textContent).join(''), 'FirstSecondThirdFourth');
});


test('HTML source line wrappers preserve paragraph line boundaries and inline emphasis', async () => {
  const dom = new JSDOM('<main><p data-docx-white-space="normal"><span class="onrivi-line">First</span><span class="onrivi-line">\n<strong>Second</strong> continued</span><span class="onrivi-line">\nThird</span></p></main>');
  globalThis.Node = dom.window.Node; globalThis.HTMLElement = dom.window.HTMLElement;
  const zip = await JSZip.loadAsync(await (await generateDocx(dom.window.document.querySelector('main'))).arrayBuffer());
  const doc = new dom.window.DOMParser().parseFromString(await zip.file('word/document.xml').async('string'), 'application/xml');
  assert.equal(doc.querySelector('parsererror'), null);
  assert.equal(doc.getElementsByTagName('w:br').length, 2);
  assert.equal(Array.from(doc.getElementsByTagName('w:t')).map(t => t.textContent).join(''), 'FirstSecond continuedThird');
  assert.equal(doc.getElementsByTagName('w:b').length, 1);
});


test('figures leave room for body text and Word paragraphs protect widow lines', async () => {
  const dom = new JSDOM('<main><h1>Heading</h1><p>Body introduction</p><figure data-export-img-id="1"><img alt="Figure"></figure><p>First line<span class="onrivi-sentence-br"></span>Second line</p><table><tr><td>Cell</td></tr></table></main>');
  globalThis.Node = dom.window.Node; globalThis.HTMLElement = dom.window.HTMLElement;
  const profile = { pageStyle: { paperSize: 'a4', orientation: 'portrait', marginTop: '18mm', marginBottom: '18mm', marginLeft: '12mm', marginRight: '12mm' }, rules: {} };
  const images = [{ id: 1, buffer: Uint8Array.from([137,80,78,71,13,10,26,10]).buffer, width: 3000, height: 3000, caption: 'Caption' }];
  const zip = await JSZip.loadAsync(await (await generateDocx(dom.window.document.querySelector('main'), { profile, images })).arrayBuffer());
  const xml = await zip.file('word/document.xml').async('string');
  const doc = new dom.window.DOMParser().parseFromString(xml, 'application/xml');
  assert.equal(doc.querySelector('parsererror'), null);
  const extent = doc.getElementsByTagName('wp:extent')[0];
  const maximum = (297 - 36) * 36000 * 0.45;
  assert.ok(+extent.getAttribute('cy') <= maximum + 1000);
  assert.equal(extent.getAttribute('cx'), extent.getAttribute('cy'));
  assert.match(xml, /<w:widowControl\/>/);
  assert.match(xml, /<w:cantSplit\/>/);
  const pictureParagraph = Array.from(doc.getElementsByTagName('w:p')).find(p => p.getElementsByTagName('w:drawing').length);
  assert.equal(pictureParagraph.getElementsByTagName('w:keepNext').length, 1);
  assert.match(await zip.file('word/styles.xml').async('string'), /<w:widowControl\/>/);
});


test('opening images receive a larger limit while body images retain the compact limit', async () => {
  const dom = new JSDOM('<main><h1>Title</h1><figure data-export-img-id="1"><img></figure><p>Body</p><figure data-export-img-id="2"><img></figure></main>');
  globalThis.Node = dom.window.Node; globalThis.HTMLElement = dom.window.HTMLElement;
  const png = Uint8Array.from([137,80,78,71,13,10,26,10]).buffer;
  const images = [1, 2].map(id => ({ id, buffer: png, width: 3000, height: 3000 }));
  const zip = await JSZip.loadAsync(await (await generateDocx(dom.window.document.querySelector('main'), { images })).arrayBuffer());
  const doc = new dom.window.DOMParser().parseFromString(await zip.file('word/document.xml').async('string'), 'application/xml');
  const heights = Array.from(doc.getElementsByTagName('wp:extent')).map(el => +el.getAttribute('cy'));
  assert.ok(Math.abs(heights[0] / heights[1] - 0.60 / 0.45) < 0.001);
});
