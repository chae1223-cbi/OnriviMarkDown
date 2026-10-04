import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import test from 'node:test';
import ts from 'typescript';
import JSZip from 'jszip';
import { JSDOM } from 'jsdom';
const require = createRequire(import.meta.url);
const url = source => 'data:text/javascript;base64,' + Buffer.from(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64');
const prep = url(await readFile(new URL('../src/lib/exportPreparation.ts',import.meta.url),'utf8'));
const pagination = url(await readFile(new URL('../src/lib/exportPagination.ts',import.meta.url),'utf8'));
const source = (await readFile(new URL('../src/lib/epubGenerator.ts',import.meta.url),'utf8')).replace("'jszip'",JSON.stringify(pathToFileURL(require.resolve('jszip')).href)).replace("'./exportPreparation'",JSON.stringify(prep)).replace("'./exportPagination'",JSON.stringify(pagination));
const { generateEpub } = await import(url(source));
const dom = new JSDOM();
for(const key of ['window','DOMParser','XMLSerializer','HTMLElement','Node'])globalThis[key]=dom.window[key];
const fixture='<h1 id="original-title">Title</h1><p><span class="onrivi-line">First</span><span class="onrivi-line">\nSecond</span></p><img src="data:image/png;base64,iVBORw0KGgo=" alt="Picture"><div class="table-wrapper-area"><table><tr><td>Cell</td></tr></table></div><h2 id="part-two">Part two</h2><p><a href="#original-title">Back</a><a href="#part-two">Here</a><a href="other.md">Other file</a></p><h3>Detail</h3><script>alert(1)</script>';
for(const level of ['none','h2'])test(`EPUB ${level}: valid XML, full heading navigation, embedded images, working fragment targets`,async()=>{
 const blob=await generateEpub({title:'Book',contentHtml:fixture,exportPageBreakLevel:level});
 const buffer=await blob.arrayBuffer();const zip=await JSZip.loadAsync(buffer);
 assert.equal(await zip.file('mimetype').async('string'),'application/epub+zip');
 for(const [path,file] of Object.entries(zip.files))if(/\.(xhtml|xml|opf|ncx)$/.test(path)){
  const doc=new DOMParser().parseFromString(await file.async('string'),'application/xml');
  assert.equal(doc.querySelector('parsererror'),null,path + ': ' + doc.querySelector('parsererror')?.textContent);
 }
 const toc=new DOMParser().parseFromString(await zip.file('OEBPS/text/toc.xhtml').async('string'),'application/xml');
 assert.equal(toc.getElementsByTagName('a').length,3);
 const xhtml=Object.keys(zip.files).filter(path=>/section\d+\.xhtml$/.test(path));
 const combined=(await Promise.all(xhtml.map(path=>zip.file(path).async('string')))).join('');
 assert.match(combined,/id="original-title"/);assert.match(combined,/href="section1.xhtml#original-title"/);
 assert.match(combined,/href="other.md"/);assert.doesNotMatch(combined,/<script/);
 assert.match(combined,/<br\s*\/>/);assert.equal(Object.keys(zip.files).filter(path=>/image_\d+\.png$/.test(path)).length,1);
 for(const a of toc.getElementsByTagName('a')){
  const [file,id]=a.getAttribute('href').split('#');const content=await zip.file('OEBPS/text/'+file).async('string');
  const doc=new DOMParser().parseFromString(content,'application/xml');
  assert.ok(Array.from(doc.querySelectorAll('[id]')).some(el=>el.id===decodeURIComponent(id)));
 }
 assert.equal(xhtml.length,level==='none'?1:2);
});

