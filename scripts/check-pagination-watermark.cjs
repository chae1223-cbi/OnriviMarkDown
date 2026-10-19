const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve('.'),frontend=path.join(root,'frontend'),req=require('node:module').createRequire(path.join(frontend,'package.json')),ts=req('typescript');
const dir=path.join(root,'.tmp/pagination-qa');fs.mkdirSync(dir,{recursive:true});
const compile=file=>ts.transpileModule(fs.readFileSync(path.join(frontend,'src',file),'utf8'),{compilerOptions:{module:1,target:7,jsx:4,esModuleInterop:true}}).outputText;
for(const file of ['lib/browserAccountStorage.ts','lib/defaultWatermark.ts','lib/pageGeometry.ts','lib/paginatedPrint.ts','lib/documentPrintSettings.ts','lib/frontmatter.ts','constants/paperSizes.ts']){
 const out=path.join(dir,file.replace(/\.ts$/,'.js'));fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,compile(file));
}
const geometry=require(path.join(dir,'lib/pageGeometry')),settings=require(path.join(dir,'lib/documentPrintSettings'));
assert.equal(geometry.resolvePageGeometry({paperSize:'a4',orientation:'landscape'}).width,297);
assert.equal(geometry.resolvePageGeometry({paperSize:'a4'}).contentHeight,261);
assert.throws(()=>geometry.resolvePageGeometry({paperSize:'a4',marginTop:'300mm'}));
const raw='---\ntitle: 保留\ncss_profile: custom\n---\n\n본문';const saved=settings.writePrintSettings(raw,{...settings.DEFAULT_PRINT_SETTINGS,enabled:true,text:'검토용 "<초안>"'});
assert.equal(settings.readPrintSettings(saved).text,'검토용 "<초안>"');assert.ok(saved.includes('title: 保留'));assert.ok(saved.endsWith('본문'));
assert.equal(settings.writePrintSettings(saved,settings.readPrintSettings(saved)),saved);
fs.writeFileSync(path.join(dir,'ts-loader.cjs'),`const ts=require(${JSON.stringify(require.resolve(path.join(frontend,'node_modules/typescript')))});module.exports=function(source){return ts.transpileModule(source,{compilerOptions:{module:99,target:7,jsx:4,esModuleInterop:true}}).outputText;};`);
fs.writeFileSync(path.join(dir,'css-loader.cjs'),'module.exports=function(){return "";};');
fs.writeFileSync(path.join(dir,'resourceStub.js'),`exports.saveResourceMedia=async(file,name)=>{window.savedImage={name,size:file.size};return '/media/'+name;};`);
fs.writeFileSync(path.join(dir,'entry.js'),`window.paginate=require('./lib/paginatedPrint').paginatePrintHtml;window.defaults=require('./lib/documentPrintSettings').DEFAULT_PRINT_SETTINGS;window.runExport=require(${JSON.stringify(path.join(frontend,'src/lib/exportHandlers.ts'))}).exportPDF;
const React=require('react'),{createRoot}=require('react-dom/client'),Modal=require(${JSON.stringify(path.join(frontend,'src/components/ExportModal.tsx'))}).default;
window.mountModal=(id='one',content='본문')=>{if(!window.modalRoot){const div=document.createElement('div');document.body.append(div);window.modalRoot=createRoot(div);}window.modalRoot.render(React.createElement(Modal,{isOpen:true,onClose(){},onExport(){},isDarkMode:false,documentId:id,documentContent:content,onOpenWatermarkSettings:()=>{window.settingsRequested=true;},onPagePreview:async(settings,signal)=>{await new Promise(resolve=>setTimeout(resolve,100));signal.throwIfAborted();return '<html><body data-onrivi-pages="2">'+settings.text+'</body></html>';}}));};`);
async function main(){
 await new Promise((resolve,reject)=>req('webpack')({mode:'development',entry:path.join(dir,'entry.js'),output:{path:dir,filename:'bundle.js',publicPath:'/'},resolve:{extensions:['.ts','.tsx','.js'],alias:{'@/lib/resourceMedia':path.join(dir,'resourceStub.js'),'@':path.join(frontend,'src')},fallback:{fs:false,path:false,crypto:false},modules:[path.join(frontend,'node_modules'),'node_modules']},module:{rules:[{test:/\.tsx?$/,exclude:/node_modules/,use:path.join(dir,'ts-loader.cjs')},{test:/\.css$/,use:path.join(dir,'css-loader.cjs')}]},devtool:false},(error,stats)=>error?reject(error):stats.hasErrors()?reject(Error(stats.toString('errors-only'))):resolve()));
 const server=http.createServer((request,response)=>{
  const policy=fs.readFileSync(path.join(frontend,'public/_headers'),'utf8').split(/\r?\n/).find(line=>line.trim().startsWith('Content-Security-Policy:'))?.trim().slice('Content-Security-Policy:'.length).trim();
  if(policy)response.setHeader('Content-Security-Policy',policy);
  if(request.url==='/pagedjs/paged.polyfill.js'){response.setHeader('Content-Type','application/javascript');response.end(fs.readFileSync(path.join(frontend,'public/pagedjs/paged.polyfill.js')));}
  else if(request.url==='/bundle.js'){response.setHeader('Content-Type','application/javascript');response.end(fs.readFileSync(path.join(dir,'bundle.js')));}
  else if(/^\/[\w.-]+\.js$/.test(request.url)&&fs.existsSync(path.join(dir,request.url.slice(1)))){response.setHeader('Content-Type','application/javascript');response.end(fs.readFileSync(path.join(dir,request.url.slice(1))));}
  else {response.setHeader('Content-Type','text/html; charset=utf-8');response.end('<!doctype html><meta charset="utf-8"><script src="/bundle.js"></script>');}
 });await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await req('playwright-core').chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1100,height:850}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  const html=await page.evaluate(async()=>window.paginate('<html><head><style>body{font:16px/1.6 Arial}p{margin:0 0 12px}</style></head><body><h1>First page</h1><p>Before break</p><div data-onrivi-page-break>나누기</div><div data-onrivi-page-break>나누기</div><h2>Second page</h2><p>After break</p></body></html>',{paperSize:'a5',orientation:'portrait',marginTop:'12mm',marginBottom:'12mm',marginLeft:'10mm',marginRight:'10mm'},{...window.defaults,enabled:true,kind:'text',text:'DRAFT <safe>',excludeFirst:true}));
  fs.writeFileSync(path.join(dir,'preview.html'),html);
  await page.setContent(html);assert.equal(await page.locator('.pagedjs_page').count(),2);
  assert.equal(await page.locator('.onrivi-watermark').count(),1);assert.equal(await page.locator('.pagedjs_page').nth(1).locator('.onrivi-watermark').textContent(),'DRAFT <safe>');
  assert.equal(await page.locator('.onrivi-watermark safe').count(),0);
  await page.pdf({path:path.join(dir,'text.pdf'),preferCSSPageSize:true,printBackground:true});
  await page.screenshot({path:path.join(dir,'preview.png'),fullPage:true});
  const pdfjs=await import(require('node:url').pathToFileURL(path.join(frontend,'node_modules/pdfjs-dist/legacy/build/pdf.mjs')).href);
  const pdf=await pdfjs.getDocument({data:new Uint8Array(fs.readFileSync(path.join(dir,'text.pdf'))),useSystemFonts:true}).promise;
  assert.equal(pdf.numPages,2);
  const first=await (await pdf.getPage(1)).getTextContent(),second=await(await pdf.getPage(2)).getTextContent();
  assert.ok(first.items.some(t=>t.str.includes('Before break')));assert.ok(!first.items.some(t=>t.str.includes('DRAFT')));
  assert.ok(second.items.some(t=>t.str.includes('After break')));assert.ok(second.items.some(t=>t.str.includes('DRAFT')));
  const size=(await pdf.getPage(1)).view;assert.ok(Math.abs(size[2]-148/25.4*72)<2);
  // Reload fixture entry for another pagination pass after viewing standalone output.
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  const imageHtml=await page.evaluate(async()=>window.paginate('<p>Landscape page</p><div data-onrivi-page-break></div><p>Next page</p>',{paperSize:'a4',orientation:'landscape'},{...window.defaults,enabled:true,kind:'image',image:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWo4AAAAASUVORK5CYII=',rotation:0}));
  await page.setContent(imageHtml);assert.equal(await page.locator('.onrivi-watermark img').count(),2);
  assert.equal(await page.locator('.onrivi-watermark img').first().evaluate(img=>img.complete&&img.naturalWidth>0),true);
  await page.pdf({path:path.join(dir,'image.pdf'),preferCSSPageSize:true,printBackground:true});
  const imagePdf=await pdfjs.getDocument({data:new Uint8Array(fs.readFileSync(path.join(dir,'image.pdf')))}).promise;
  assert.equal(imagePdf.numPages,2);assert.ok((await imagePdf.getPage(1)).view[2]>(await imagePdf.getPage(1)).view[3]);
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  const auto=await page.evaluate(async()=>window.paginate(Array.from({length:80},(_,i)=>'<p>Paragraph '+i+' '+('flowing text '.repeat(15))+'</p>').join(''),{paperSize:'a5'},{...window.defaults}));
  await page.setContent(auto);assert.ok(await page.locator('.pagedjs_page').count()>2);assert.ok((await page.locator('body').textContent()).includes('Paragraph 79'));
  assert.deepEqual(errors,[]);
  // The supplied lesson uses an empty paragraph before a TIP, then tables and a manual break.
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  const lesson=await page.evaluate(async()=>{
    const input='<html><head><style>body{font:16px/1.6 Arial}p{margin:0}blockquote{margin:0;padding:12px}table{width:100%}</style></head><body><div style="height:940px">Lesson content</div><p></p><blockquote data-alert-type="tip"><p>TIP</p><p>Domain context determines quality.</p></blockquote><table><tr><td>Finance</td><td>E-Commerce</td></tr></table><div data-onrivi-page-break></div><h2>Summary</h2></body></html>';
    const style={paperSize:'a4',marginTop:'18mm',marginBottom:'18mm'};
    const settings={...window.defaults,enabled:false};
    const html=await window.paginate(input,style,settings);
    return {html,reused:html===await window.paginate(input,style,settings)};
  });
  assert.equal(lesson.reused,true);
  await page.setContent(lesson.html);
  const lessonPages=await page.locator('.pagedjs_page').allTextContents();
  const tipPage=lessonPages.findIndex(text=>text.includes('Domain context'));
  assert.ok(tipPage>0,'TIP should move intact to the next page');
  assert.ok(lessonPages[tipPage].includes('TIP'));
  assert.ok(lessonPages.findIndex(text=>text.includes('Summary'))>tipPage);
  await page.pdf({path:path.join(dir,'lesson.pdf'),preferCSSPageSize:true,printBackground:true});
  const lessonPdf=await pdfjs.getDocument({data:new Uint8Array(fs.readFileSync(path.join(dir,'lesson.pdf')))}).promise;
  assert.equal(lessonPdf.numPages,lessonPages.length,'PDF and preview must have the same page count');
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  const actual=await page.evaluate(async()=>{
   const root=document.createElement('div');root.innerHTML='<div class="markdown-viewer-root"><h1>Real export</h1><p>First section</p><div data-onrivi-page-break>페이지 나누기</div><p>Second section</p></div>';document.body.append(root);
   return window.runExport({previewEl:root,currentFileName:'검증.md',isDarkMode:false,showToast(){},paperSize:'a5',orientation:'landscape',marginTop:'12mm',marginBottom:'12mm',marginLeft:'10mm',marginRight:'10mm',previewOnly:true,printSettings:{...window.defaults,enabled:true,text:'실제 출력'}});
  });
  assert.ok(actual.includes('data-onrivi-pages="2"'));await page.setContent(actual);assert.equal(await page.locator('.onrivi-watermark').count(),2);
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  const desktop=await page.evaluate(async()=>{
    let captured,saved=false;
    window.electronAPI={showSaveDialog:async()=>({canceled:false,filePath:'fixture.pdf'}),saveBinaryFile:async()=>{saved=true;},printHTMLToPDF:async(html,options)=>{captured={html,options};return new Uint8Array([1]);}};
    const root=document.createElement('div');root.innerHTML='<div class="markdown-viewer-root"><p>Desktop first</p><div data-onrivi-page-break></div><p>Desktop second</p></div>';document.body.append(root);
    await window.runExport({previewEl:root,currentFileName:'검증.md',isDarkMode:false,showToast(){},activeProfile:undefined,paperSize:'a4',orientation:'landscape',printSettings:{...window.defaults,enabled:true,kind:'text',text:'Desktop watermark'}});
    delete window.electronAPI;return {...captured,saved};
  });
  assert.equal(desktop.saved,true);assert.equal(desktop.options.landscape,true);assert.equal(desktop.options.pageSize,'A4');assert.ok(desktop.html.includes('data-onrivi-pages="2"'));assert.ok(desktop.html.includes('Desktop watermark'));
  await page.goto(`http://127.0.0.1:${server.address().port}`);await page.evaluate(()=>window.mountModal());
  await page.getByText(/총 2페이지/).waitFor();
  assert.equal(await page.getByLabel('워터마크 문구').count(),0,'watermark management belongs to general settings');
  await page.getByRole('button',{name:'환경설정에서 워터마크 관리'}).click();assert.equal(await page.evaluate(()=>window.settingsRequested),true);
  assert.deepEqual(errors,[]);
  console.log('PASS: shared geometry; metadata preservation; manual/automatic pages; text/image watermark; first-page exclusion; actual PDF page count, paper size, orientation and text');
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(error=>{console.error(error);process.exitCode=1;});

