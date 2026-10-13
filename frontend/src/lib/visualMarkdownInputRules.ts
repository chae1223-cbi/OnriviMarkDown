/**
 * 프로그램명 : OnriviAuthor 
 * 버전 정보 : 1.0.1
 * 프로그램 ID : oaar-vm-inputrules
 * 🚨 @PATCH : **2026-10-14** — [인라인 수식($수식$) 타이핑 시 visual_inline_math 노드 자동 변환 및 수식 옆 글쓰기 공백 보장]:
 *             본문에서 $수식$ 타이핑 시 네이티브 visual_inline_math 노드와 함께 후행 공백 텍스트 노드를 생성하고 커서를 그 뒤로 이동시켜, 인라인 수식 직후 끊김 없이 본문 글쓰기가 즉각 이어지도록 보장
 * 🚨 @PATCH : **2026-10-13** — [마크다운 링크([텍스트](url)) 및 일반 URL 타이핑 자동 변환 InputRule 추가]:
 *             1) 본문에서 [텍스트](url) 또는 [텍스트](url] 타이핑 즉시 네이티브 link 마크로 즉각 자동 변환 지원
 *             2) http/https 일반 URL 입력 후 공백 입력 시 자동 링크(Auto Link) 변환 지원
 * 🚨 @PATCH : **2026-10-13** — [밑줄(<u>...</u>) 타이핑 입력 규칙(InputRule) 추가]:
 *             본문에서 <u>...</u> 마크다운 태그 타이핑 시 네이티브 밑줄(underline) 마크로 즉각 자동 변환 지원
 * 🚨 @PATCH : **2026-10-13** — [기존 텍스트 문단에서 마크다운 헤딩(## ) 입력 시 제목 2 정상 전환 및 성급한 H1 오변환 방어]:
 *             1) 기존 텍스트가 있는 문단 앞머리에서 '#' 입력 시 공백 없이 H1으로 즉시 성급하게 변환되던 결함 방어 (후행 텍스트가 있을 때는 '## ' 등 공백 입력 완성 시에만 헤딩 변환)
 *             2) 빈 줄에서는 기존과 동일하게 '#' / '###' 단독 입력 시 즉각 헤딩 전환 동작 100% 호환 보장
 *             3) 이미 헤딩인 블록의 시작 위치에서 '## ' 등 다른 레벨의 마크다운 헤딩 입력 시 해당 레벨(H2 등)로 즉시 승격/전환 지원
 */
import { InputRule, inputRules, textblockTypeInputRule, wrappingInputRule } from 'prosemirror-inputrules';
import { Fragment, MarkType } from 'prosemirror-model';
import { EditorState, Transaction, TextSelection } from 'prosemirror-state';
import { visualSchema } from '@/lib/visualDocumentCodec';

function markRule(expression: RegExp, type: MarkType) {
  return new InputRule(expression, (state, match, start, end) => {
    const marker = match[1];
    const text = match[2];
    const from = start + match[0].length - marker.length;
    return state.tr.insertText(text, from, end).addMark(from, from + text.length, type.create()).removeStoredMark(type);
  }, { inCodeMark: false });
}

export function visualMarkdownInputRules() {
  const { nodes, marks } = visualSchema;
  const insideCell = (state: EditorState) => state.selection.$from.depth > 1 && ['table_cell','table_header'].includes(state.selection.$from.node(state.selection.$from.depth-1).type.name);
  const paragraphOnly = (rule: InputRule) => {
    const guarded = rule as InputRule & { match: RegExp; handler: (state: EditorState, match: RegExpMatchArray, start: number, end: number) => Transaction | null };
    return new InputRule(guarded.match, (state, match, start, end) => {
    if (state.selection.$from.parent.type !== nodes.paragraph || insideCell(state)) return null;
    return guarded.handler(state, match, start, end);
    });
  };
  return inputRules({ rules: [
    new InputRule(/^\[([ xX])\]\s$/, (state,match,start,end)=>{
      const position=state.selection.$from;
      for(let depth=position.depth;depth>0;depth--)if(position.node(depth).type===nodes.list_item)return state.tr.delete(start,end).setNodeMarkup(position.before(depth),undefined,{...position.node(depth).attrs,checked:match[1].toLowerCase()==='x'});
      return null;
    }),
    // Hash-only input activates a heading immediately on empty lines,
    // but requires a trailing space when there is existing content after the cursor.
    new InputRule(/(?:^|\ufffc)(#{1,6})(?:[ \t](.*))?$/, (state,match,start,end)=>{
      const position=state.selection.$from,parent=position.parent;
      if(insideCell(state) || ![nodes.paragraph,nodes.heading].includes(parent.type))return null;
      const title=match[2] || '';
      const hasSpace = match[2] !== undefined;
      if(parent.type===nodes.heading){
        if(!parent.content.size){
          const targetLevel = hasSpace ? match[1].length : Math.min(6, parent.attrs.level + match[1].length);
          return state.tr.insertText(title,start,end).setBlockType(start,start,nodes.heading,{level:targetLevel});
        }
        if(hasSpace && start === position.start()){
          const blockPos = position.before();
          const tr = state.tr.delete(start, end).setNodeMarkup(blockPos, undefined, { ...parent.attrs, level: match[1].length });
          return tr.setSelection(TextSelection.create(tr.doc, start));
        }
        return null;
      }
      if(position.depth>1 && position.node(position.depth-1).type===nodes.list_item)return null;
      const blockStart=position.start(),blockPos=position.before();
      const before=parent.content.cut(0,start-blockStart);
      const remaining=parent.content.cut(end-blockStart);
      if(remaining.size > 0 && !hasSpace) return null;
      let breakOffset=-1;remaining.forEach((node,offset)=>{if(breakOffset<0 && node.type===nodes.hard_break)breakOffset=offset;});
      const titleContent=(title?Fragment.from(state.schema.text(title)):Fragment.empty).append(breakOffset<0?remaining:remaining.cut(0,breakOffset));
      const blocks=[];if(before.size)blocks.push(nodes.paragraph.create(null,before));
      const headingPos=blockPos+(blocks[0]?.nodeSize || 0);
      blocks.push(nodes.heading.create({level:match[1].length},titleContent));
      if(breakOffset>=0)blocks.push(nodes.paragraph.create(null,remaining.cut(breakOffset+1)));
      const tr=state.tr.replaceWith(blockPos,blockPos+parent.nodeSize,blocks);
      return tr.setSelection(TextSelection.create(tr.doc,headingPos+1+title.length));
    }),
    new InputRule(/^ $/, (state,_match,start,end)=>state.selection.$from.parent.type===nodes.heading && !state.selection.$from.parent.content.size ? state.tr.delete(start,end) : null),
    paragraphOnly(wrappingInputRule(/^\s*>\s$/, nodes.blockquote)),
    new InputRule(/^\[!([^\]]+)\]\s$/, (state,match,start,end)=>{
      if(insideCell(state))return null;
      const position=state.selection.$from;
      for(let depth=position.depth;depth>0;depth--)if(position.node(depth).type===nodes.blockquote){return state.tr.delete(start,end).setNodeMarkup(position.before(depth),undefined,{alertType:match[1]});}
      return null;
    }),
    paragraphOnly(wrappingInputRule(/^\s*([-+*])\s$/, nodes.bullet_list, match => ({ bullet: match[1] }))),
    paragraphOnly(wrappingInputRule(/^\s*(\d+)\.\s$/, nodes.ordered_list, match => ({ order: Number(match[1]) }),
      (match, node) => node.childCount + node.attrs.order === Number(match[1]))),
    paragraphOnly(textblockTypeInputRule(/^```([a-zA-Z0-9_-]*)\s$/, nodes.code_block, match => ({ params: match[1] }))),
    new InputRule(/^(?:---|\*\*\*)\s$/, (state, _match, start, end) => {
      if (state.selection.$from.parent.type !== nodes.paragraph || insideCell(state)) return null;
      const transaction = state.tr.delete(start, end);
      return transaction.replaceWith(start - 1, start + 1, nodes.horizontal_rule.create());
    }),
    markRule(/(?:^|[^*])(\*\*([^*\n]+)\*\*)$/, marks.strong),
    markRule(/(?:^|[^_])(__(.+?)__)$/, marks.strong),
    markRule(/(?:^|[^*])(\*([^*\n]+)\*)$/, marks.em),
    markRule(/(?:^|[^\w_])(_([^_\n]+)_)$/, marks.em),
    markRule(/(~~([^~\n]+)~~)$/, marks.strike),
    markRule(/(`([^`\n]+)`)$/, marks.code),
    new InputRule(/(<u>([^<\n]+)<\/u>)$/, (state, match, start, end) => {
      const text = match[2];
      const from = start + match[0].length - match[1].length;
      return state.tr.insertText(text, from, end).addMark(from, from + text.length, marks.underline.create()).removeStoredMark(marks.underline);
    }),
    // 마크다운 링크 입력 규칙: [텍스트](url) 및 [텍스트](url] 입력 시 네이티브 link 마크로 즉각 변환
    new InputRule(/(?:^|[^\\])(\[([^\]\n]+)\]\((https?:\/\/[^\s\)]+|mailto:[^\s\)]+|\/[^\s\)]+|#[^\s\)]+|\.[^\s\)]*)(?:\)|\]))$/, (state, match, start, end) => {
      const fullMatch = match[1];
      const text = match[2];
      const href = match[3];
      const from = start + match[0].length - fullMatch.length;
      return state.tr
        .insertText(text, from, end)
        .addMark(from, from + text.length, marks.link.create({ href }))
        .removeStoredMark(marks.link);
    }),
    // 일반 URL 자동 링크 입력 규칙: https:// 또는 http:// URL 입력 후 공백 입력 시 link 마크 자동 적용
    new InputRule(/(?:^|\s)(https?:\/\/[^\s]+)\s$/, (state, match, start, end) => {
      const url = match[1];
      const from = start + match[0].length - url.length - 1;
      const to = from + url.length;
      return state.tr
        .addMark(from, to, marks.link.create({ href: url }))
        .removeStoredMark(marks.link);
    }),
    // 인라인 수식 입력 규칙: $수식$ 타이핑 시 네이티브 visual_inline_math 노드로 즉각 변환 및 후행 공백 삽입으로 옆에 글쓰기 보장
    new InputRule(/(?:^|[^\\])(\$([^\$\n]+)\$)$/, (state, match, start, end) => {
      const fullMatch = match[1];
      const latex = match[2].trim();
      if (!latex) return null;
      const from = start + match[0].length - fullMatch.length;
      const mathNode = nodes.visual_inline_math.create({ latex });
      const spaceNode = state.schema.text(' ');
      const tr = state.tr.replaceWith(from, end, [mathNode, spaceNode]);
      return tr.setSelection(TextSelection.create(tr.doc, from + mathNode.nodeSize + spaceNode.nodeSize));
    }),
  ] });
}
