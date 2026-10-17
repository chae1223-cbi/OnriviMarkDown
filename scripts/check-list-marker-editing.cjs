const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const req=require('node:module').createRequire(path.resolve('frontend/package.json')),ts=req('typescript');
function load(file,overrides={}){const exports={};Function('exports','require',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:1,target:7,esModuleInterop:true}}).outputText)(exports,id=>overrides[id]||req(id));return exports;}
const media=load('frontend/src/lib/mediaMarkup.ts');
const bullet=load('frontend/src/lib/bulletNumberText.ts');
const api=load('frontend/src/lib/visualDocumentCodec.ts',{'./mediaMarkup':media,'./bulletNumberText':bullet});
const lists=load('frontend/src/lib/visualListCommands.ts',{'./visualDocumentCodec':api});
const {EditorState,TextSelection}=req('prosemirror-state');
const {history,undo,redo}=req('prosemirror-history');
function textMarks(doc){const result=[];doc.descendants(node=>{if(node.isText)result.push([node.text,node.marks.map(mark=>mark.type.name).join(',')]);});return result;}
const source='1. 앞 문장\n\n- 1. **가나다**\n- 2. [마바사](https://example.com)\n- 3. 아자차\n- 4. 카타파\n';
const codec=api.createVisualDocumentCodec(source);
let state=EditorState.create({doc:codec.doc,plugins:[history()]});
state=state.apply(state.tr.setSelection(TextSelection.create(state.doc,TextSelection.atStart(state.doc).from,TextSelection.atEnd(state.doc).to)));
assert.equal(lists.selectedList('ordered')(state,tr=>state=state.apply(tr)),true);
state.doc.check();
assert.equal(state.doc.childCount,1);assert.equal(state.doc.firstChild.type.name,'ordered_list');
assert.equal(state.doc.firstChild.childCount,5);
assert.equal(state.doc.textContent,'앞 문장가나다마바사아자차카타파');
const marks=textMarks(state.doc);
assert.ok(marks.some(([text,mark])=>text==='가나다'&&mark==='strong'));
assert.ok(marks.some(([text,mark])=>text==='마바사'&&mark==='link'));
const serialized=codec.serialize(state.doc);
assert.ok(!/^\d+\. \d+\. /m.test(serialized),serialized);
assert.ok(serialized.includes('**가나다**'));assert.ok(serialized.includes('[마바사](https://example.com)'));
undo(state,tr=>state=state.apply(tr));assert.equal(state.doc.textContent,codec.doc.textContent);
redo(state,tr=>state=state.apply(tr));assert.equal(state.doc.textContent,'앞 문장가나다마바사아자차카타파');
let itemStart;
state.doc.descendants((node,pos)=>{if(node.type.name==='paragraph'&&node.textContent==='가나다')itemStart=pos+1;});
state=state.apply(state.tr.setSelection(TextSelection.create(state.doc,itemStart)));
assert.equal(lists.removeListMarkerAtStart(state,tr=>state=state.apply(tr)),true);
state.doc.check();assert.equal(state.doc.child(1).type.name,'paragraph');assert.equal(state.doc.child(1).textContent,'가나다');
assert.ok(textMarks(state.doc).some(([text,mark])=>text==='가나다'&&mark==='strong'));
assert.equal(state.doc.textContent,'앞 문장가나다마바사아자차카타파');
// Genuine nested lists retain their text/marks when lifting one level.
const nested=api.createVisualDocumentCodec('1. 부모\n   - **자식**\n   - 다음\n2. 끝\n');
let nestedState=EditorState.create({doc:nested.doc});
nestedState.doc.descendants((node,pos)=>{if(node.type.name==='paragraph'&&node.textContent==='자식')itemStart=pos+1;});
nestedState=nestedState.apply(nestedState.tr.setSelection(TextSelection.create(nestedState.doc,itemStart)));
lists.removeListMarkerAtStart(nestedState,tr=>nestedState=nestedState.apply(tr));nestedState.doc.check();
assert.equal(nestedState.doc.textContent,nested.doc.textContent);
assert.ok(textMarks(nestedState.doc).some(([text,mark])=>text==='자식'&&mark==='strong'));
console.log('PASS: screenshot mixed markers, ordered conversion, bold/link retention, Backspace unlist, nested lifting, undo/redo and serialization');
const supplied='가나다라마바사아자차카타파하\n\n1. 가나다\n\n1) 마바사\n\n1. 아자차\n\n- 4.카타파';
const suppliedCodec=api.createVisualDocumentCodec(supplied);
let suppliedState=EditorState.create({doc:suppliedCodec.doc});
suppliedState=suppliedState.apply(suppliedState.tr.setSelection(TextSelection.between(
  suppliedState.doc.resolve(suppliedState.doc.firstChild.nodeSize),
  suppliedState.doc.resolve(TextSelection.atEnd(suppliedState.doc).to))));
lists.selectedList('ordered')(suppliedState,tr=>suppliedState=suppliedState.apply(tr));
suppliedState.doc.check();
assert.equal(suppliedState.doc.firstChild.textContent,'가나다라마바사아자차카타파하');
assert.equal(suppliedState.doc.child(1).childCount,4);
assert.equal(suppliedState.doc.child(1).lastChild.textContent,'카타파');
const suppliedOutput=suppliedCodec.serialize(suppliedState.doc);
assert.match(suppliedOutput,/4\. 카타파/);
assert.ok(!suppliedOutput.includes('4. 4.'));
for(const text of ['3.14 원주율','2026년 기록','v1.2 설명']){
 const c=api.createVisualDocumentCodec(text);let s=EditorState.create({doc:c.doc});
 lists.selectedList('ordered')(s,tr=>s=s.apply(tr));assert.equal(s.doc.textContent,text);
}
console.log('PASS: exact supplied Markdown, compact Korean ordinal cleanup and decimal/version preservation');
const literalNumbers='- 1\\. 가나다\n- 2\\. 마바사\n- 3\\. 아자차\n- 4\\. 카타파';
const literalCodec=api.createVisualDocumentCodec(literalNumbers);
let literalState=EditorState.create({doc:literalCodec.doc});
literalState=literalState.apply(literalState.tr.setSelection(TextSelection.create(literalState.doc,TextSelection.atStart(literalState.doc).from,TextSelection.atEnd(literalState.doc).to)));
lists.selectedList('bullet')(literalState,tr=>literalState=literalState.apply(tr));
assert.equal(literalState.doc.firstChild.type.name,'bullet_list');
assert.equal(literalState.doc.firstChild.childCount,4);
assert.equal(literalState.doc.firstChild.firstChild.textContent,'1. 가나다');
const roundtrip=api.createVisualDocumentCodec(literalCodec.serialize(literalState.doc));
assert.equal(roundtrip.doc.firstChild.childCount,4);
assert.equal(roundtrip.doc.firstChild.firstChild.childCount,1);
assert.equal(roundtrip.doc.textContent,'1. 가나다2. 마바사3. 아자차4. 카타파');
console.log('PASS: bullet lists retain editable literal numbers and serialize as valid escaped Markdown');
for(const raw of ['- 1. 가나다\n- 2. 마바사','- [ ] 1. 가나다\n- [x] 2. 마바사','- 부모\n  1. 가나다\n  2. 마바사','> - 1. 가나다','- - 1. 가나다','1. - 1. 가나다','- > 1. 가나다']){
 const normalized=bullet.bulletNumbersAsText(raw);
 assert.equal(bullet.bulletNumbersAsText(normalized),normalized);
 const c=api.createVisualDocumentCodec(raw);
 let orderedUnderBullet=false;
 function walk(node,inBullet=false){if(inBullet&&node.type.name==='ordered_list')orderedUnderBullet=true;node.forEach(child=>walk(child,inBullet||node.type.name==='bullet_list'));}
 walk(c.doc);assert.equal(orderedUnderBullet,false,raw);
 assert.ok(c.doc.textContent.includes('1. 가나다'),c.doc.toString());
}
const regular=api.createVisualDocumentCodec('1. 가나다\n2. 마바사');
assert.equal(regular.doc.firstChild.type.name,'ordered_list');
assert.equal(bullet.bulletNumbersAsText('1. 가나다\n2. 마바사'),'1. 가나다\n2. 마바사');
assert.equal(bullet.bulletNumbersAsText('1. 가나다\n2. 마바사',true),'1\\. 가나다\n2\\. 마바사');
for(const raw of ['```md\n- 1. 가나다\n```','---\ntext: - 1. 가나다\n---\n','<pre>\n- 1. 가나다\n</pre>'])assert.equal(bullet.bulletNumbersAsText(raw),raw);
console.log('PASS: raw bullet/checklist/nested/quote paste keeps numbers as text; standalone ordered lists and code/metadata remain intact');
for(const marker of ['- ','- [ ] ','- [x] ']){
 const original=['1. 가나다','2. 라마바','3. 아자차','4. 타파하'];
 const c=api.createVisualDocumentCodec(original.map(text=>marker+text.replace('.','\\.')).join('\n'));
 let s=EditorState.create({doc:c.doc,plugins:[history()]});
 s=s.apply(s.tr.setSelection(TextSelection.create(s.doc,TextSelection.atStart(s.doc).from,TextSelection.atEnd(s.doc).to)));
 lists.selectedList('clear')(s,tr=>s=s.apply(tr));s.doc.check();
 assert.equal(s.doc.childCount,4);
 s.doc.forEach((node,_pos,index)=>{assert.equal(node.type.name,'paragraph');assert.equal(node.textContent,original[index]);});
 const output=c.serialize(s.doc);
 for(let index=1;index<=4;index++)assert.ok(output.includes(index+'\\. '),output);
 const reparsed=api.createVisualDocumentCodec(output);
 assert.equal(reparsed.doc.childCount,4,JSON.stringify(output)+' '+reparsed.doc.toString());
 reparsed.doc.forEach((node,_pos,index)=>{assert.equal(node.type.name,'paragraph');assert.equal(node.textContent,original[index]);});
 undo(s,tr=>s=s.apply(tr));assert.equal(s.doc.firstChild.type.name,'bullet_list');
 redo(s,tr=>s=s.apply(tr));assert.equal(s.doc.childCount,4);
}
console.log('PASS: clearing bullet/checklists preserves all four literal ordinals as paragraphs after save/reparse and undo/redo');

// Up from an empty ordered item goes to the preceding item's final text position.
for (const markdown of ['1. **긴 문장** 다음 줄까지 이어지는 본문\n2. \n', '1. 첫 문단\n\n   마지막 문단\n2. \n']) {
 const c=api.createVisualDocumentCodec(markdown);let s=EditorState.create({doc:c.doc});
 let lastEnd, emptyPos;
 s.doc.descendants((node,pos)=>{if(node.isTextblock){if(node.content.size)lastEnd=pos+1+node.content.size;else emptyPos=pos+1;}});
 assert.notEqual(emptyPos,undefined);
 s=s.apply(s.tr.setSelection(TextSelection.create(s.doc,emptyPos)));
 assert.equal(lists.moveUpFromEmptyOrderedItem(s,tr=>s=s.apply(tr)),true);
 assert.equal(s.selection.from,lastEnd);assert.equal(s.doc.eq(c.doc),true);
 assert.equal(lists.moveUpFromEmptyOrderedItem(s),false);
}
console.log('PASS: empty ordered item ArrowUp reaches previous item end without changing text');

for (const previousText of ['', '이전 **본문**']) {
 const c=api.createVisualDocumentCodec(`1. 처음\n2. 다음\n3. ${previousText}\n4. \n`);
 let s=EditorState.create({doc:c.doc,plugins:[history()]});let target,end;
 s.doc.descendants((node,pos)=>{if(node.isTextblock){end=target;target=pos+1+node.content.size;}});
 s=s.apply(s.tr.setSelection(TextSelection.create(s.doc,target)));
 assert.equal(lists.removeListMarkerAtStart(s,tr=>s=s.apply(tr)),true);
 s.doc.check();assert.equal(s.doc.childCount,1);assert.equal(s.doc.firstChild.childCount,3);
 assert.equal(s.selection.from,end);assert.equal(s.selection.empty,true);
 assert.equal(s.doc.textContent,c.doc.textContent);
 undo(s,tr=>s=s.apply(tr));assert.equal(s.doc.eq(c.doc),true);assert.equal(s.selection.from,target);
}
console.log('PASS: Backspace removes empty fourth item and selects third item end; undo restores item and cursor');

const imageListSource='1. 첫 내용\n   - 하위 내용\n2. 다음 내용\n\n   ![목록 안 그림](/media/one.png)\n\n3. 마지막 내용\n\n![별도 그림](/media/two.png)\n';
const imageListCodec=api.createVisualDocumentCodec(imageListSource);
assert.equal(imageListCodec.doc.firstChild.type.name,'ordered_list');
let nestedImages=0,sourceBlocks=0;
imageListCodec.doc.descendants(n=>{if(n.type.name==='visual_image')nestedImages++;if(n.type.name==='source_block')sourceBlocks++;});
assert.equal(nestedImages,2);assert.equal(sourceBlocks,0);imageListCodec.doc.check();
assert.equal(imageListCodec.serialize(imageListCodec.doc),imageListSource);
let imageState=EditorState.create({doc:imageListCodec.doc});let imagePos;
imageState.doc.descendants((n,p)=>{if(n.type.name==='visual_image'&&n.attrs.source.includes('one.png'))imagePos=p;});
const {NodeSelection}=req('prosemirror-state');imageState=imageState.apply(imageState.tr.setSelection(NodeSelection.create(imageState.doc,imagePos)));
assert.equal(imageState.selection.node.type.name,'visual_image');
imageState=imageState.apply(imageState.tr.deleteSelection());
assert.ok(imageState.doc.textContent.includes('첫 내용'));assert.ok(imageState.doc.textContent.includes('마지막 내용'));
const afterImageDelete=imageListCodec.serialize(imageState.doc);
assert.ok(!afterImageDelete.includes('one.png'));assert.ok(afterImageDelete.includes('two.png'));
api.createVisualDocumentCodec(afterImageDelete).doc.check();
console.log('PASS: image inside ordered list is independently selectable/deletable; list text and other images remain intact');

for(const prompt of ['[한글 타이포그래피 및 정중앙 배치 원칙]: 이미지 내 들어가는 모든 글자는 정확하고 선명한 순수 한글로만 표기함.\n이미지의 정중앙에 시선이 집중되도록 배치.','[시각 구성]: 푸른 바다와 미래형 새만금 신도시 모형 위로 퍼지는 빛.\n1:1 비율, --ar 1:1']){
 const c=api.createVisualDocumentCodec(prompt);assert.equal(c.doc.firstChild.type.name,'paragraph');
 assert.equal(c.serialize(c.doc),prompt);assert.ok(!c.doc.toJSON().content.some(n=>n.type==='source_block'));
}
const proseCode=api.createVisualDocumentCodec('[시각 구성]: 푸른 바다와 미래형 도시\n\n```text\n내용\n```\n');
assert.equal(proseCode.doc.child(0).type.name,'paragraph');assert.equal(proseCode.doc.child(1).type.name,'code_block');
const refs=api.createVisualDocumentCodec('[ref]: https://example.com\n\n[ref]\n\n[시각 구성]: 푸른 바다와 미래 도시');
assert.equal(refs.doc.lastChild.type.name,'paragraph');
assert.ok(refs.serialize(refs.doc).includes('[ref]: https://example.com'));
console.log('PASS: bracket-colon Korean prose stays editable, code blocks stay separate, real link references preserved');
