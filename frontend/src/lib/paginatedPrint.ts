// ====================================================================
// 📊 [OMD-LIB-PAGINATEDPRINT-0001] paginatedPrint.ts
// 🎯 @KICK  : 쪽 윤곽 및 인쇄 페이지 계산 PagedJS 엔진 연동
// 🚨 @PATCH : **2026-10-19** — [PagedJS querySelectorAll 가상요소(::before) 파싱 오류 방어 및 인쇄 CSS 가드]:
//             1) iframe 샌드박스 내부 DocumentFragment/Element/Document의 querySelectorAll을 안전 래핑하여 ::before, ::after 등 유효하지 않은 선택자 파싱 시 DOMException 크래시 완전 방어
//             2) Tailwind Typography의 코드 백틱 생성 규칙(content: '`') 등 가상 요소 충돌 룰을 pageCss에서 content: none !important로 안전 무력화
// 🚨 @PATCH : **2026-10-19** — [워터마크 이미지/문구 미지정 시 기본 엠블럼 및 Onrivi Author 자동 폴백 적용]: 이미지 미등록 시 기본 엠블럼, 문구 미입력 시 Onrivi Author 자동 렌더링
// ====================================================================
import { resolvePageGeometry, PAGE_BREAK_CSS } from './pageGeometry';
import { DocumentPrintSettings, DEFAULT_WATERMARK_IMAGE, DEFAULT_WATERMARK_TEXT } from './documentPrintSettings';

let engineSource:Promise<string>|undefined;
async function engine(){
 if(!engineSource)engineSource=(async()=>{
  const path=(window as any).electronAPI?'./pagedjs/paged.polyfill.js':'/pagedjs/paged.polyfill.js';
  const response=await fetch(path);if(!response.ok)throw new Error('페이지 분할 엔진을 불러오지 못했습니다.');
  return response.text();
 })().catch(error=>{engineSource=undefined;throw error;});
 return engineSource;
}
function timeout<T>(promise:Promise<T>,ms:number,label:string):Promise<T>{
 return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error(`${label} 시간이 초과되었습니다.`)),ms);promise.then(value=>{clearTimeout(timer);resolve(value);},error=>{clearTimeout(timer);reject(error);});});
}
let lastPrint:{input:string;output:string}|undefined;
export async function paginatePrintHtml(html:string,style:any,watermark:DocumentPrintSettings,signal?:AbortSignal):Promise<string>{
 signal?.throwIfAborted();
 const input=JSON.stringify([html,style,watermark]);
 if(lastPrint?.input===input)return lastPrint.output;
 const output=await renderPrintPages(html,style,watermark,signal);
 signal?.throwIfAborted();lastPrint={input,output};return output;
}
async function renderPrintPages(html:string,style:any,watermark:DocumentPrintSettings,signal?:AbortSignal):Promise<string>{
 signal?.throwIfAborted();
 const geometry=resolvePageGeometry(style),source=await engine();
 const frame=document.createElement('iframe');
 frame.setAttribute('aria-hidden','true');frame.style.cssText='position:fixed;left:-30000px;top:0;width:1400px;height:1000px;border:0;pointer-events:none';
 document.body.append(frame);
 const stopped=()=>frame.remove();signal?.addEventListener('abort',stopped,{once:true});
 const work=<T,>(promise:Promise<T>)=>new Promise<T>((resolve,reject)=>{
  if(signal?.aborted){reject(new DOMException('취소되었습니다.','AbortError'));return;}
  const abort=()=>reject(new DOMException('취소되었습니다.','AbortError'));
  signal?.addEventListener('abort',abort,{once:true});
  promise.then(value=>{signal?.removeEventListener('abort',abort);resolve(value);},error=>{signal?.removeEventListener('abort',abort);reject(error);});
 });
 try{
  const doc=frame.contentDocument!,win=frame.contentWindow! as any;
  doc.open();doc.write('<!doctype html><html lang="ko"><head><meta charset="utf-8"></head><body></body></html>');doc.close();

  // 🛡️ [DOM-GUARD] Paged.js가 Tailwind 가상 요소(::before, ::after)나 복잡한 의사 선택자를 쿼리할 때 발생하는 DOMException 크래시 원천 방어
  const safeWrapQSA = (proto: any) => {
    if (!proto || !proto.querySelectorAll) return;
    const orig = proto.querySelectorAll;
    proto.querySelectorAll = function(selector: string) {
      try {
        if (typeof selector === 'string') {
          // ::before, ::after, ::marker 등 가상 요소가 포함된 경우 정제
          if (selector.includes('::')) {
            const cleaned = selector.replace(/::[a-zA-Z_-]+/g, '').trim();
            if (!cleaned) return [];
            return orig.call(this, cleaned);
          }
        }
        return orig.call(this, selector);
      } catch {
        return [];
      }
    };
  };
  safeWrapQSA(win.DocumentFragment?.prototype);
  safeWrapQSA(win.Element?.prototype);
  safeWrapQSA(win.Document?.prototype);

  const parsed=new DOMParser().parseFromString(html,'text/html');
  parsed.querySelectorAll('script,iframe,object,embed').forEach(n=>n.remove());
  parsed.querySelectorAll('*').forEach(n=>Array.from(n.attributes).forEach(a=>{if(/^on/i.test(a.name)||/^javascript:/i.test(a.value))n.removeAttribute(a.name);}));
  const css=Array.from(parsed.querySelectorAll('style')).map(s=>s.textContent||'').join('\n');
  parsed.querySelectorAll('style,link').forEach(n=>n.remove());
  doc.body.className=parsed.body.className;
  const content=doc.createElement('div');content.innerHTML=parsed.body.innerHTML;
  content.querySelectorAll('[contenteditable]').forEach(n=>n.removeAttribute('contenteditable'));
  // Repeated/end breaks must not create accidental blank pages.
  const breaks=Array.from(content.querySelectorAll<HTMLElement>('[data-onrivi-page-break]'));
  const emptyElement=(node:Element)=>!node.textContent?.trim() && !node.querySelector('img,svg,table,video,canvas,math') && !node.matches('[data-onrivi-page-break]');
  breaks.forEach(marker=>{
    let before=marker.previousElementSibling,after=marker.nextElementSibling;
    while(before&&emptyElement(before))before=before.previousElementSibling;
    while(after&&(emptyElement(after)||after.matches('[data-onrivi-page-break]')))after=after.nextElementSibling;
    if(!before || !after || before.matches('[data-onrivi-page-break]'))marker.remove();
  });
  const staging=doc.createElement('div');staging.style.width=`${geometry.contentWidth}mm`;staging.append(content);doc.body.append(staging);
  const preloadStyle=doc.createElement('style');preloadStyle.textContent=css;doc.head.append(preloadStyle);
  await work(timeout(Promise.all(Array.from(content.querySelectorAll('img')).map(img=>img.decode().catch(()=>{throw new Error('출력 이미지가 준비되지 않았습니다. 리소스 연결을 확인해 주세요.');}))),25000,'이미지 준비'));
  await work(timeout(doc.fonts.ready,25000,'글꼴 준비'));
  const output=doc.createElement('div');doc.body.append(output);
  win.PagedConfig={auto:false};
  const script=doc.createElement('script');script.textContent=source;doc.head.append(script);
  const pageCss=`${css}\n${PAGE_BREAK_CSS}\n
  @page {size:${geometry.width}mm ${geometry.height}mm;margin:${geometry.top}mm ${geometry.right}mm ${geometry.bottom}mm ${geometry.left}mm;}
  html,body{height:auto!important;min-height:0!important;overflow:visible!important;padding:0!important;margin:0!important}
  .page-break-container,.custom-preview-container,.markdown-viewer-root,.visual-document-surface{width:auto!important;max-width:none!important;height:auto!important;min-height:0!important;padding:0!important;margin:0!important;overflow:visible!important;transform:none!important;zoom:1!important}
  .onrivi-page-guides,.onrivi-print-tools{display:none!important}
  h1,h2,h3,h4,h5,h6{break-after:avoid!important;page-break-after:avoid!important}
  h1+table,h2+table,h3+table,h4+table,h5+table,h6+table{break-before:avoid!important;page-break-before:avoid!important}
  img{max-width:100%!important;max-height:${geometry.contentHeight}mm!important;object-fit:contain} figure{break-inside:avoid}
  blockquote, [data-alert-type], .visual-readonly-callout, .callout-box { break-inside: avoid !important; page-break-inside: avoid !important; }
  table { break-inside: auto !important; page-break-inside: auto !important; }
  tr { break-inside: avoid !important; page-break-inside: avoid !important; }
  .prose :where(code):not(:where([class~="not-prose"] *))::before,
  .prose :where(code):not(:where([class~="not-prose"] *))::after,
  .prose code::before,
  .prose code::after { content: none !important; }
  `;
  const markup=content.innerHTML;staging.remove();preloadStyle.remove();
  await work(timeout(win.PagedPolyfill.preview(markup,[{[new URL('/onrivi-print.css',location.href).href]:pageCss}],output),90000,'페이지 계산'));
  const pages=Array.from(output.querySelectorAll<HTMLElement>('.pagedjs_page'));
  if(!pages.length)throw new Error('페이지를 만들지 못했습니다.');
  for(let index=0;index<pages.length;index++){
   const page=pages[index];page.dataset.onriviPage=String(index+1);
   page.style.backgroundColor=style.backgroundColor || '#ffffff';
   if(!watermark.enabled || (watermark.excludeFirst&&index===0))continue;
   const layer=doc.createElement('div');layer.className='onrivi-watermark';layer.setAttribute('aria-hidden','true');
   const x=watermark.position.endsWith('left')?'5%':watermark.position.endsWith('right')?'95%':'50%';
   const y=watermark.position.startsWith('top')?'8%':watermark.position.startsWith('bottom')?'92%':'50%';
   const tx=watermark.position.endsWith('left')?'0':watermark.position.endsWith('right')?'-100%':'-50%';
   const ty=watermark.position.startsWith('top')?'0':watermark.position.startsWith('bottom')?'-100%':'-50%';
   layer.style.cssText=`position:absolute;z-index:1000;pointer-events:none;user-select:none;left:${x};top:${y};opacity:${watermark.opacity/100};transform:translate(${tx},${ty}) rotate(${watermark.rotation}deg);width:${watermark.width}%;text-align:center;color:#475569;font-family:system-ui,sans-serif;font-size:${watermark.fontSize}px;line-height:1.2;overflow-wrap:anywhere`;
   if(watermark.kind==='image'){
    const imgSrc = watermark.image || DEFAULT_WATERMARK_IMAGE;
    const image=doc.createElement('img');image.src=imgSrc;image.style.cssText='width:100%;height:auto;max-height:80mm;object-fit:contain';layer.append(image);
   }else layer.textContent=watermark.text || DEFAULT_WATERMARK_TEXT;
   page.append(layer);
  }
  const finalCss=Array.from(doc.querySelectorAll('style')).map(s=>s.outerHTML).join('\n');
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>쪽 윤곽 미리보기</title>${finalCss}<style>
  @page{size:${geometry.width}mm ${geometry.height}mm;margin:0!important}
  html,body{padding:0!important;margin:0!important;height:auto!important;overflow:visible!important}
  .pagedjs_pages{display:block!important}.pagedjs_page{position:relative!important;overflow:hidden!important;break-after:page!important;page-break-after:always!important;margin:0!important;box-shadow:none!important}.pagedjs_page:last-child{break-after:auto!important;page-break-after:auto!important}
  [data-onrivi-page-break]{break-before:auto!important;page-break-before:auto!important}
  @media screen{body,body.custom-preview-container{background:#e2e8f0!important;padding:20px!important}.pagedjs_page{margin:0 auto 28px!important;box-shadow:0 2px 10px #0003!important}.pagedjs_page::after{content:attr(data-onrivi-page);position:absolute;right:12px;bottom:4px;font:11px system-ui;color:#64748b}}
  @media print{.pagedjs_page::after{display:none}}
  </style></head><body class="${parsed.body.className.replace(/[^\w\s-]/g,'')}" data-onrivi-pages="${pages.length}">${output.innerHTML}</body></html>`;
 }finally{signal?.removeEventListener('abort',stopped);frame.remove();}
}
