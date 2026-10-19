import { PAPER_SIZES } from '../constants/paperSizes';
function millimeters(value:unknown,fallback:number):number {
 if(typeof value==='number')return value;
 const match=String(value || '').trim().match(/^(-?\d+(?:\.\d+)?)(mm|cm|in|px|pt)?$/i);
 if(!match)return fallback;
 return Number(match[1])*({mm:1,cm:10,in:25.4,px:25.4/96,pt:25.4/72}[match[2]?.toLowerCase() || 'mm'] || 1);
}
export function resolvePageGeometry(style:any={}) {
 const paper=PAPER_SIZES[String(style.paperSize || 'a4').toLowerCase()];
 if(!paper)throw new Error('서식관리의 용지 크기를 확인해 주세요.');
 const landscape=style.orientation==='landscape';
 const width=landscape?paper.height:paper.width,height=landscape?paper.width:paper.height;
 const top=millimeters(style.marginTop,18),bottom=millimeters(style.marginBottom,18),left=millimeters(style.marginLeft,12),right=millimeters(style.marginRight,12);
 if(Math.min(top,bottom,left,right)<0 || width-left-right<=10 || height-top-bottom<=10)throw new Error('서식관리의 용지 여백이 너무 큽니다.');
 return {width,height,top,bottom,left,right,contentWidth:width-left-right,contentHeight:height-top-bottom,label:`${paper.label} · ${landscape?'가로':'세로'}`};
}
export const PAGE_BREAK_MARKER='<!-- onrivi:page-break -->';
export const PAGE_BREAK_CSS='[data-onrivi-page-break]{break-before:page!important;page-break-before:always!important;height:0!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;font-size:0!important;line-height:0!important}[data-onrivi-page-break]::before{display:none!important}';
