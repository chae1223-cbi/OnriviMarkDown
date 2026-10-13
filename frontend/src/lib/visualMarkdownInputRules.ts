import { InputRule, inputRules, textblockTypeInputRule, wrappingInputRule } from 'prosemirror-inputrules';
import { MarkType } from 'prosemirror-model';
import { EditorState, Transaction } from 'prosemirror-state';
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
    // Also accept an entire heading inserted by IME/text input in one event.
    new InputRule(/^(#{1,6})[ \t](.*)$/, (state, match, start, end) => {
      if (state.selection.$from.parent.type !== nodes.paragraph || insideCell(state)) return null;
      return state.tr.insertText(match[2], start, end).setBlockType(start, start, nodes.heading, { level: match[1].length });
    }),
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
  ] });
}
