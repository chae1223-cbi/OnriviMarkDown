/**
 * 프로그램명 : OnriviAuthor 
 * 파일명 : visualListCommands.ts
 * 🚨 @PATCH : **2026-10-18** — [목록 번호 백스페이스 삭제 시 재진입/번호 재생성(핑퐁 토글) 결함 완전 해소]:
 *             1) 목록 항목에서 백스페이스로 번호를 지운 뒤 직후 백스페이스를 한 번 더 누를 때, generic joinBackward로 인해 다시 목록 항목으로 흡수되어 번호가 부활하던 결함 차단
 *             2) 목록 바로 아래 문단에서 백스페이스 시 이전 목록 끝에 빈 항목이 있으면 해당 빈 항목을 안전하게 삭제하고, 내용이 있으면 텍스트로 합쳐지도록 개선
 */
import { Fragment, Node as DocumentNode } from 'prosemirror-model';
import { Command, TextSelection } from 'prosemirror-state';
import { closeHistory } from 'prosemirror-history';
import { liftListItem } from 'prosemirror-schema-list';
import { joinForward } from 'prosemirror-commands';
import { visualSchema } from './visualDocumentCodec';

const isList=(node:DocumentNode)=>['bullet_list','ordered_list'].includes(node.type.name);

/** Remove the next item's boundary without letting a structural replacement
 * move the caret to an unrelated trailing paragraph. */
export const deleteNextListBoundary: Command = (state,dispatch,view) => {
  const {$from,empty}=state.selection;
  if(!empty || !$from.parent.isTextblock || $from.parentOffset!==$from.parent.content.size)return false;
  const depth=$from.depth-1;
  if(depth<2 || $from.node(depth).type!==visualSchema.nodes.list_item || !isList($from.node(depth-1)))return false;
  if($from.index(depth)!==$from.node(depth).childCount-1 || $from.index(depth-1)+1 >= $from.node(depth-1).childCount)return false;
  const caret=$from.pos;
  return joinForward(state,dispatch?tr=>{
    tr.setSelection(TextSelection.near(tr.doc.resolve(tr.mapping.map(caret,-1)),-1));
    dispatch(closeHistory(tr).scrollIntoView());
  }:undefined,view);
};

/** Keep an extended selection inside its list when moving past its last visual line. */
export const extendSelectionToListEnd: Command = (state,dispatch,view) => {
  const selection=state.selection;
  if(!(selection instanceof TextSelection) || selection.empty || selection.anchor>=selection.head || !view)return false;
  const head=selection.$head;
  let depth=head.depth;
  while(depth>0 && !isList(head.node(depth)))depth--;
  if(!depth)return false;
  const start=head.start(depth),list=head.node(depth);
  if(selection.anchor<start)return false;
  let end:number|undefined;
  list.descendants((node,pos)=>{if(node.isTextblock)end=start+pos+1+node.content.size;});
  if(end===undefined)return false;
  // Earlier wrapped lines retain normal browser vertical selection behavior.
  const here=view.coordsAtPos(selection.head),last=view.coordsAtPos(end);
  if(Math.abs(here.top-last.top)>2)return false;
  if(dispatch && selection.head!==end)dispatch(state.tr.setSelection(TextSelection.create(state.doc,selection.anchor,end)));
  return true;
};

/** Delete at an empty paragraph between ordered lists joins their items,
 * without joining the text of adjacent items. */
export const joinOrderedListsAcrossEmptyParagraph: Command = (state,dispatch) => {
  const {$from,empty}=state.selection;
  if(!empty || $from.depth!==1 || $from.parent.type!==visualSchema.nodes.paragraph || $from.parent.content.size)return false;
  const doc=state.doc,isBlank=(node:DocumentNode)=>node.type===visualSchema.nodes.paragraph && node.content.size===0;
  let before=$from.index(0)-1,after=$from.index(0)+1;
  while(before>=0 && isBlank(doc.child(before)))before--;
  while(after<doc.childCount && isBlank(doc.child(after)))after++;
  if(before<0 || after>=doc.childCount)return false;
  const previous=doc.child(before),next=doc.child(after);
  if(previous.type!==visualSchema.nodes.ordered_list || next.type!==visualSchema.nodes.ordered_list)return false;
  let from=0;for(let index=0;index<before;index++)from+=doc.child(index).nodeSize;
  let to=from;for(let index=before;index<=after;index++)to+=doc.child(index).nodeSize;
  if(dispatch){
    const merged=previous.copy(previous.content.append(next.content));
    const tr=state.tr.replaceWith(from,to,merged);
    const startOfNext=from+1+previous.content.size+2;
    tr.setSelection(TextSelection.near(tr.doc.resolve(startOfNext)));
    dispatch(closeHistory(tr).scrollIntoView());
  }
  return true;
};

/** Enter exits an empty item at its own position; Backspace has a different
 * contract and may move to the preceding item. */
export const exitEmptyListItem: Command = (state, dispatch, view) => {
  const {$from,empty}=state.selection;
  if(!empty || $from.parent.type!==visualSchema.nodes.paragraph)return false;
  let blank=true;
  $from.parent.forEach(node=>{
    if(node.type!==visualSchema.nodes.hard_break && (!node.isText || /[^\s\u200b\ufeff]/.test(node.text||'')))blank=false;
  });
  if(!blank)return false;
  const depth=$from.depth-1;
  if(depth<1 || $from.node(depth).type!==visualSchema.nodes.list_item)return false;
  // A blank item may still own sublists or images. Lift its blocks together
  // instead of handing Enter to splitListItem and creating another number.
  const tr=state.tr;
  if($from.parent.content.size)tr.delete($from.start(),$from.end());
  const cleaned=tr.docChanged?state.apply(tr):state;
  return liftListItem(visualSchema.nodes.list_item)(cleaned,dispatch?lifted=>{
    for(const step of lifted.steps)tr.step(step);
    tr.setSelection(TextSelection.create(tr.doc,lifted.selection.anchor,lifted.selection.head));
    dispatch(closeHistory(tr).scrollIntoView());
  }:undefined,view);
};

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
export const removeListMarkerAtStart: Command = (state, dispatch, view) => {
  const { $from, empty } = state.selection;
  if (!empty || $from.parent.type !== visualSchema.nodes.paragraph || $from.parentOffset !== 0) return false;
  const itemDepth = $from.depth - 1;
  const inListItem = itemDepth >= 1 && $from.node(itemDepth).type === visualSchema.nodes.list_item && $from.index(itemDepth) === 0;

  if (inListItem) {
    // An entirely empty numbered item is removed, keeping the caret in the
    // preceding item instead of lifting it into a paragraph below the list.
    if (!$from.parent.content.size && $from.node(itemDepth).childCount === 1
      && moveUpFromEmptyOrderedItem(state, dispatch ? tr => {
        tr.delete($from.before(itemDepth), $from.after(itemDepth));
        dispatch(closeHistory(tr).scrollIntoView());
      } : undefined)) return true;
    return liftListItem(visualSchema.nodes.list_item)(state, dispatch ? tr => dispatch(closeHistory(tr)) : undefined, view);
  }

  // 목록 바로 아래 문단 맨 앞($from.parentOffset === 0)에서 백스페이스를 누를 때,
  // 상위 목록으로 강제 흡수(joinBackward)되어 번호가 다시 생기는 현상을 원천 방어
  const posBefore = $from.before();
  if (posBefore > 0) {
    const nodeBefore = state.doc.resolve(posBefore).nodeBefore;
    if (nodeBefore && isList(nodeBefore)) {
      const lastItem = nodeBefore.lastChild;
      const isLastItemEmpty = lastItem && (
        lastItem.content.size === 0 ||
        (lastItem.childCount === 1 && lastItem.firstChild && lastItem.firstChild.isTextblock && lastItem.firstChild.content.size === 0)
      );
      if (isLastItemEmpty) {
        if (dispatch) {
          const listStart = posBefore - nodeBefore.nodeSize;
          if (nodeBefore.childCount === 1) {
            dispatch(closeHistory(state.tr.delete(listStart, posBefore)).scrollIntoView());
          } else {
            const itemEnd = posBefore - 1;
            const itemStart = itemEnd - lastItem.nodeSize;
            dispatch(closeHistory(state.tr.delete(itemStart, itemEnd)).scrollIntoView());
          }
        }
        return true;
      }

      if (lastItem) {
        let lastTextblockOffset = -1;
        lastItem.descendants((n, p) => {
          if (n.isTextblock) lastTextblockOffset = p;
        });
        if (lastTextblockOffset !== -1) {
          const itemStart = posBefore - 1 - lastItem.nodeSize;
          const textblockStart = itemStart + 1 + lastTextblockOffset;
          const targetNode = state.doc.nodeAt(textblockStart);
          if (targetNode && targetNode.isTextblock) {
            const endOfLastText = textblockStart + 1 + targetNode.content.size;
            const startOfCurrentText = $from.pos;
            if (dispatch) {
              const tr = state.tr.delete(endOfLastText, startOfCurrentText);
              dispatch(closeHistory(tr).scrollIntoView());
            }
            return true;
          }
        }
      }
    }
  }

  return false;
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
