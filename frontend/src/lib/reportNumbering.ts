import type { CssProfile } from '@/types/cssProfile';

export const REPORT_LIST_STYLE = 'onrivi-report';
const HANGUL = '가나다라마바사아자차카타파하';
const ROMAN: [number,string][] = [[1000,'Ⅿ'],[900,'ⅭⅯ'],[500,'Ⅾ'],[400,'ⅭⅮ'],[100,'Ⅽ'],[90,'ⅩⅭ'],[50,'Ⅼ'],[40,'ⅩⅬ'],[12,'Ⅻ'],[11,'Ⅺ'],[10,'Ⅹ'],[9,'Ⅸ'],[8,'Ⅷ'],[7,'Ⅶ'],[6,'Ⅵ'],[5,'Ⅴ'],[4,'Ⅳ'],[3,'Ⅲ'],[2,'Ⅱ'],[1,'Ⅰ']];
export function reportListMarker(depth:number, value:number):string {
  let number=Math.max(1,Math.floor(value)||1),text='';
  if(depth===1 && number<=3999){for(const [amount,symbol] of ROMAN)while(number>=amount){text+=symbol;number-=amount;}return text+'.';}
  if(depth===3 || depth===5){while(number>0){number--;text=HANGUL[number%14]+text;number=Math.floor(number/14);}return text+(depth===5?')':'.');}
  return String(number)+(depth===4?')':'.');
}

export function reportNumberingCss(profile:CssProfile):string {
  if(profile.rules.ol?.['list-style-type']!==REPORT_LIST_STYLE)return '';
  const symbols=Array.from(HANGUL).map(x=>'"'+x+'"').join(' ');
  const types=['onrivi-report','decimal','onrivi-report-hangul','onrivi-report-decimal-paren','onrivi-report-hangul-paren'];
  const rules=types.map((type,i)=>`:is(.custom-preview-container,.onrivi-content-root,.markdown-viewer-root,.visual-document-surface) ${'ol '.repeat(i+1).trim()}{list-style-type:${type}!important;}`);
  rules.push(':is(.custom-preview-container,.onrivi-content-root,.markdown-viewer-root,.visual-document-surface) ol ol ol ol ol ol{list-style-type:decimal!important;}');
  return `@counter-style onrivi-report {system:additive;additive-symbols:1000 "Ⅿ",900 "ⅭⅯ",500 "Ⅾ",400 "ⅭⅮ",100 "Ⅽ",90 "ⅩⅭ",50 "Ⅼ",40 "ⅩⅬ",12 "Ⅻ",11 "Ⅺ",10 "Ⅹ",9 "Ⅸ",8 "Ⅷ",7 "Ⅶ",6 "Ⅵ",5 "Ⅴ",4 "Ⅳ",3 "Ⅲ",2 "Ⅱ",1 "Ⅰ";suffix:". ";fallback:upper-roman;}
@counter-style onrivi-report-hangul {system:alphabetic;symbols:${symbols};suffix:". ";}
@counter-style onrivi-report-hangul-paren {system:alphabetic;symbols:${symbols};suffix:") ";}
@counter-style onrivi-report-decimal-paren {system:extends decimal;suffix:") ";}
${rules.join('\n')}`;
}

/** Materialize labels only on an export clone. The editor retains real ordered lists. */
export function materializeReportNumbers(source:HTMLElement, clone:HTMLElement):void {
  const originals=Array.from(source.querySelectorAll('ol'));
  clone.querySelectorAll<HTMLOListElement>('ol').forEach((list,index)=>{
    const original=originals[index];
    if(!original)return;
    let parent:Element|null=original,depth=0,report=false;
    while(parent && parent!==source.parentElement){
      if(parent.tagName==='OL'){depth++;if(getComputedStyle(parent).listStyleType===REPORT_LIST_STYLE)report=true;}
      parent=parent.parentElement;
    }
    if(!report)return;
    list.dataset.onriviReportNumbering='true';
    list.dataset.onriviReportDepth=String(depth);
    let value=list.start || 1;
    Array.from(list.children).filter(node=>node.tagName==='LI').forEach(node=>{
      const item=node as HTMLLIElement;
      if(item.hasAttribute('value'))value=item.value;
      const label=reportListMarker(depth,value++);
      item.dataset.onriviReportMarker=label;
      item.style.setProperty('list-style-type','none','important');
      const marker=document.createElement('span');marker.className='export-list-marker onrivi-report-marker';marker.textContent=label+' ';
      marker.style.cssText='display:inline!important;white-space:pre!important';
      const paragraph=Array.from(item.children).find(child=>child.tagName==='P');
      (paragraph || item).prepend(marker);
    });
  });
}
