import { Fragment, Node as DocumentNode } from 'prosemirror-model';
import { Command, TextSelection } from 'prosemirror-state';
import { closeHistory } from 'prosemirror-history';
import { visualSchema } from './visualDocumentCodec';

const isList=(node:DocumentNode)=>['bullet_list','ordered_list'].includes(node.type.name);
function inlineLines(node:DocumentNode):Fragment[] {
  if(node.isTextblock){const lines:Fragment[]=[];let current:DocumentNode[]=[];
    node.forEach(child=>{if(child.type===visualSchema.nodes.hard_break){lines.push(Fragment.fromArray(current));current=[];}else current.push(child);});
    lines.push(Fragment.fromArray(current));return lines;
  }
  const result:Fragment[]=[];node.forEach(child=>result.push(...inlineLines(child)));return result;
}
export function selectedList(kind:'bullet'|'ordered'|'check'|'clear'):Command {
  return (state,dispatch)=>{
    const {$from,$to}=state.selection;
    const listRange=$from.blockRange($to,isList);
    const range=listRange || $from.blockRange($to);
    if(!range)return false;
    const parent=range.parent,selected:DocumentNode[]=[];
    for(let i=range.startIndex;i<range.endIndex;i++)selected.push(parent.child(i));
    if(kind==='clear' && !listRange && !selected.some(isList))return false;
    let unsupported=false;selected.forEach(node=>{if(node.isLeaf && !node.isTextblock)unsupported=true;node.descendants(child=>{if(child.isBlock && child.isLeaf && !child.isTextblock)unsupported=true;});});
    if(unsupported)return false;
    const lines=selected.flatMap(inlineLines);
    if(!lines.length)return false;
    const nodes=visualSchema.nodes;
    const content:DocumentNode[]=[];
    if(kind==='clear'){
      lines.forEach((line,index)=>{if(index)content.push(nodes.hard_break.create());line.forEach(node=>content.push(node.mark([])));});
    }
    const target=kind==='clear'?nodes.paragraph.create(null,Fragment.fromArray(content)):
      (kind==='ordered'?nodes.ordered_list:nodes.bullet_list).create({tight:true,order:1,bullet:'-'},lines.map(line=>nodes.list_item.create({checked:kind==='check'?false:null},nodes.paragraph.create(null,line))));
    const replacement:DocumentNode[]=[];
    let from=range.start,to=range.end;
    if(listRange){
      from=$from.before(listRange.depth);to=from+parent.nodeSize;
      if(range.startIndex)replacement.push(parent.copy(Fragment.fromArray(Array.from({length:range.startIndex},(_,i)=>parent.child(i)))));
      replacement.push(target);
      if(range.endIndex<parent.childCount)replacement.push(parent.copy(Fragment.fromArray(Array.from({length:parent.childCount-range.endIndex},(_,i)=>parent.child(i+range.endIndex)))));
    } else replacement.push(target);
    if(dispatch){
      let tr=state.tr.replaceWith(from,to,replacement);let start=-1;
      tr.doc.descendants((node,pos)=>{if(node===target){start=pos;return false;}});
      if(start>=0){const first=start+(kind==='clear'?1:3),last=kind==='clear'?start+1+target.content.size:start+target.nodeSize-3;
        tr=tr.setSelection(TextSelection.between(tr.doc.resolve(first),tr.doc.resolve(last)));
      }
      dispatch(closeHistory(tr));
    }
    return true;
  };
}
