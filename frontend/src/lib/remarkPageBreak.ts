export function remarkPageBreak(){
 return (tree:any)=>{
  function visit(node:any){
   if(node.type==='html' && /^(?:<!--\s*(?:onrivi:page-break|\[page-break\])\s*-->|<hr\s+class=["']page-break["']\s*\/?>)$/.test(String(node.value).trim())){
    node.value='<div data-onrivi-page-break="true" class="onrivi-page-break" aria-label="수동 페이지 나누기">수동 페이지 나누기</div>';
   }
   node.children?.forEach(visit);
  }visit(tree);
 };
}
