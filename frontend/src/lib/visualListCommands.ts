import { Fragment, Node as DocumentNode } from 'prosemirror-model';
import { Command, TextSelection } from 'prosemirror-state';
import { closeHistory } from 'prosemirror-history';
import { liftListItem } from 'prosemirror-schema-list';
import { visualSchema } from './visualDocumentCodec';

const isList=(node:DocumentNode)=>['bullet_list','ordered_list'].includes(node.type.name);

/** Native vertical movement preserves the empty item's horizontal column,
 * which can land halfway through a wrapped previous item. */
export const moveUpFromEmptyOrderedItem: Command = (state, dispatch) => {
  const { $from, empty } = state.selection;
  if (!empty || !$from.parent.isTextblock || $from.parent.content.size) return false;
  const itemDepth = $from.depth - 1;
  const listDepth = itemDepth - 1;
  if (listDepth < 0 || $from.node(itemDepth).type.name !== 'list_item'
    || $from.node(listDepth).type.name !== 'ordered_list'
    || $from.index(itemDepth) !== 0 || $from.index(listDepth) === 0) return false;
  const previous = $from.node(listDepth).child($from.index(listDepth) - 1);
  const previousStart = $from.before(itemDepth) - previous.nodeSize;
  let end: number | undefined;
  previous.descendants((node, pos) => {
    if (node.isTextblock) end = previousStart + 1 + pos + 1 + node.content.size;
  });
  if (end === undefined) return false;
  if (dispatch) dispatch(state.tr.setSelection(TextSelection.create(state.doc, end)).scrollIntoView());
  return true;
};
function inlineLines(node:DocumentNode):Fragment[] {
  if(node.isTextblock){const lines:Fragment[]=[];let current:DocumentNode[]=[];
    node.forEach(child=>{if(child.type===visualSchema.nodes.hard_break){lines.push(Fragment.fromArray(current));current=[];}else current.push(child);});
    lines.push(Fragment.fromArray(current));return lines;
  }
  const result:Fragment[]=[];node.forEach((child,_offset,index)=>{
    // Markdown such as "- 1. text" may contain a structural empty paragraph
    // before its inner list. It must not become a new, empty numbered item.
    if(node.type.name==='list_item' && index===0 && !child.content.size && node.childCount>1 && isList(node.child(1)))return;
    result.push(...inlineLines(child));
  });return result;
}

function withoutTypedMarker(line: Fragment): Fragment {
  if(line.firstChild?.marks.some(mark=>mark.type.name==='code'))return line;
  const text=visualSchema.nodes.paragraph.create(null,line).textContent;
  // A pasted Korean ordinal often omits the space ("4.카타파"). Handle it
  // during an explicit list conversion without consuming decimals/versions.
  const prefix=text.match(/^[ \t]*(?:\d+[.)](?:[ \t]+|(?=[가-힣]))|[-+*][ \t]+)/);
  return prefix ? line.cut(prefix[0].length) : line;
}

/** At an item's first text position remove one list level, never join its text
 * into the preceding item as the generic Backspace command can do. */
export const removeListMarkerAtStart: Command = (state,dispatch,view) => {
  const {$from,empty}=state.selection;
  if(!empty || $from.parent.type!==visualSchema.nodes.paragraph || $from.parentOffset!==0)return false;
  const itemDepth=$from.depth-1;
  if(itemDepth<1 || $from.node(itemDepth).type!==visualSchema.nodes.list_item || $from.index(itemDepth)!==0)return false;
  // An entirely empty numbered item is removed, keeping the caret in the
  // preceding item instead of lifting it into a paragraph below the list.
  if (!$from.parent.content.size && $from.node(itemDepth).childCount === 1
    && moveUpFromEmptyOrderedItem(state, dispatch ? tr => {
      tr.delete($from.before(itemDepth), $from.after(itemDepth));
      dispatch(closeHistory(tr).scrollIntoView());
    } : undefined)) return true;
  return liftListItem(visualSchema.nodes.list_item)(state,dispatch ? tr=>dispatch(closeHistory(tr)) : undefined,view);
};
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
    // Numbers can be intentional text in a bullet/checklist. Only interpret
    // them as redundant ordinals when explicitly choosing a numbered list.
    const lines=selected.flatMap(inlineLines).map(line=>kind==='ordered'?withoutTypedMarker(line):line);
    if(!lines.length)return false;
    const nodes=visualSchema.nodes;
    // Each former item becomes its own paragraph. Joining with bare newlines
    // lets Markdown reparse the second numeric line as a new ordered list.
    const targets=kind==='clear'?lines.map(line=>{
      const content:DocumentNode[]=[];line.forEach(node=>content.push(node.mark([])));
      return nodes.paragraph.create(null,Fragment.fromArray(content));
    }):[(kind==='ordered'?nodes.ordered_list:nodes.bullet_list).create({tight:true,order:1,bullet:'-'},lines.map(line=>nodes.list_item.create({checked:kind==='check'?false:null},nodes.paragraph.create(null,line))))];
    const target=targets[0];
    const replacement:DocumentNode[]=[];
    let from=range.start,to=range.end;
    if(listRange){
      from=$from.before(listRange.depth);to=from+parent.nodeSize;
      if(range.startIndex)replacement.push(parent.copy(Fragment.fromArray(Array.from({length:range.startIndex},(_,i)=>parent.child(i)))));
      replacement.push(...targets);
      if(range.endIndex<parent.childCount)replacement.push(parent.copy(Fragment.fromArray(Array.from({length:parent.childCount-range.endIndex},(_,i)=>parent.child(i+range.endIndex)))));
    } else replacement.push(...targets);
    if(dispatch){
      let tr=state.tr.replaceWith(from,to,replacement);let start=-1;
      tr.doc.descendants((node,pos)=>{if(node===target){start=pos;return false;}});
      if(start>=0){const first=start+(kind==='clear'?1:3),last=kind==='clear'?start+targets.reduce((size,node)=>size+node.nodeSize,0)-1:start+target.nodeSize-3;
        tr=tr.setSelection(TextSelection.between(tr.doc.resolve(first),tr.doc.resolve(last)));
      }
      dispatch(closeHistory(tr));
    }
    return true;
  };
}
