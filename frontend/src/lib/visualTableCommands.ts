import { Node as DocumentNode } from 'prosemirror-model';
import { Command, TextSelection } from 'prosemirror-state';
import { closeHistory } from 'prosemirror-history';
import { visualSchema } from './visualDocumentCodec';

export function tableContext(state: Parameters<Command>[0]) {
  const position = state.selection.$from;
  for(let depth=position.depth;depth>0;depth--) {
    if(position.node(depth).type.name === 'table') {
      return {table:position.node(depth),pos:position.before(depth),row:position.index(depth),column:position.index(depth+1)};
    }
  }
  return null;
}

function selectedTableCellSpan(state: Parameters<Command>[0]) {
  if (state.selection.empty) return null;
  const endpoint = (position: typeof state.selection.$from) => {
    let tablePos = -1, cellPos = -1;
    for (let depth = 1; depth <= position.depth; depth++) {
      const name = position.node(depth).type.name;
      if (name === 'table') tablePos = position.before(depth);
      if (name === 'table_cell' || name === 'table_header') cellPos = position.before(depth);
    }
    return { tablePos, cellPos };
  };
  const from = endpoint(state.selection.$from), to = endpoint(state.selection.$to);
  return from.tablePos >= 0 && from.tablePos === to.tablePos && from.cellPos >= 0 && to.cellPos >= 0 && from.cellPos !== to.cellPos
    ? { from: state.selection.from, to: state.selection.to } : null;
}

export function multiCellTableSelectionText(state: Parameters<Command>[0]): string | null {
  const span = selectedTableCellSpan(state);
  return span ? state.doc.textBetween(span.from, span.to, '\n', '\n') : null;
}

/** Clear selected text in each cell without deleting table rows or cell nodes. */
export const clearMultiCellTableSelection: Command = (state, dispatch) => {
  const span = selectedTableCellSpan(state);
  if (!span) return false;
  if (dispatch) {
    const ranges: { from: number; to: number }[] = [];
    state.doc.nodesBetween(span.from, span.to, (node, pos) => {
      if (node.type.name !== 'table_cell' && node.type.name !== 'table_header') return true;
      const start = pos + 2;
      const end = start + (node.firstChild?.content.size || 0);
      ranges.push({ from: Math.max(span.from, start), to: Math.min(span.to, end) });
      return false;
    });
    let tr = state.tr;
    for (let index = ranges.length - 1; index >= 0; index--) {
      const range = ranges[index];
      if (range.to > range.from) tr = tr.delete(range.from, range.to);
    }
    const anchor = ranges[0]?.from ?? span.from;
    tr = tr.setSelection(TextSelection.near(tr.doc.resolve(tr.mapping.map(anchor, -1))));
    dispatch(tr.scrollIntoView());
  }
  return true;
};
function rowsOf(table:DocumentNode) { const rows:DocumentNode[][]=[];table.forEach(row=>{const cells:DocumentNode[]=[];row.forEach(cell=>cells.push(cell));rows.push(cells);});return rows; }
function cell(header:boolean,align='left') {return (header?visualSchema.nodes.table_header:visualSchema.nodes.table_cell).create({align},visualSchema.nodes.paragraph.create());}
function textPosition(table:DocumentNode,pos:number,rowIndex:number,columnIndex:number) {
  let offset=pos+1;
  for(let row=0;row<rowIndex;row++)offset+=table.child(row).nodeSize;
  offset++;
  for(let column=0;column<columnIndex;column++)offset+=table.child(rowIndex).child(column).nodeSize;
  return offset+2;
}
type Action = 'addRow'|'deleteRow'|'addColumn'|'deleteColumn'|'deleteTable'|'afterTable'|'left'|'center'|'right';
export function tableAction(action:Action):Command {
  return (state,dispatch)=>{
    const context=tableContext(state);if(!context)return false;
    const {table,pos,row,column}=context;
    const rows=rowsOf(table);
    if(action==='afterTable') {
      if(dispatch){const end=pos+table.nodeSize;let tr=state.tr;const next=tr.doc.nodeAt(end);if(next?.type!==visualSchema.nodes.paragraph)tr=tr.insert(end,visualSchema.nodes.paragraph.create());dispatch(tr.setSelection(TextSelection.create(tr.doc,end+1)).scrollIntoView());}return true;
    }
    if(action==='deleteTable') {
      if(dispatch){let tr=state.tr.replaceWith(pos,pos+table.nodeSize,visualSchema.nodes.paragraph.create());tr=tr.setSelection(TextSelection.create(tr.doc,pos+1));dispatch(closeHistory(tr).scrollIntoView());}return true;
    }
    if(action==='deleteRow' && (row===0 || rows.length<=1))return false;
    if(action==='deleteColumn' && rows[0].length<=1)return false;
    let selectedRow=row,selectedColumn=column;
    if(action==='addRow'){rows.splice(row+1,0,rows[0].map(header=>cell(false,header.attrs.align)));selectedRow=row+1;}
    if(action==='deleteRow'){rows.splice(row,1);selectedRow=Math.min(row,rows.length-1);}
    if(action==='addColumn'){rows.forEach((cells,index)=>cells.splice(column+1,0,cell(index===0,cells[column].attrs.align)));selectedColumn=column+1;}
    if(action==='deleteColumn'){rows.forEach(cells=>cells.splice(column,1));selectedColumn=Math.min(column,rows[0].length-1);}
    if(['left','center','right'].includes(action))rows.forEach(cells=>{const current=cells[column];cells[column]=current.type.create({...current.attrs,align:action},current.content);});
    const next=visualSchema.nodes.table.create(null,rows.map(cells=>visualSchema.nodes.table_row.create(null,cells)));
    if(dispatch){let tr=state.tr.replaceWith(pos,pos+table.nodeSize,next);tr=tr.setSelection(TextSelection.create(tr.doc,textPosition(next,pos,selectedRow,selectedColumn)));dispatch(closeHistory(tr).scrollIntoView());}
    return true;
  };
}
export function moveTableCell(backward=false):Command {
  return (state,dispatch,view)=>{
    const context=tableContext(state);if(!context)return false;
    const {table,pos,row,column}=context;
    const width=table.firstChild!.childCount;
    const index=row*width+column+(backward?-1:1);
    if(index<0)return true;
    if(index>=table.childCount*width)return tableAction('addRow')(state,dispatch ? tr=>{const next=tr.doc.nodeAt(pos)!;dispatch(tr.setSelection(TextSelection.create(tr.doc,textPosition(next,pos,row+1,0))));}:undefined,view);
    if(dispatch){
      const targetRow=Math.floor(index/width), targetColumn=index%width;
      const from=textPosition(table,pos,targetRow,targetColumn);
      const paragraph=table.child(targetRow).child(targetColumn).firstChild!;
      dispatch(state.tr.setSelection(TextSelection.create(state.doc,from,from+paragraph.content.size)).scrollIntoView());
    }
    return true;
  };
}
export function tableEnter():Command { return (state,dispatch,view)=>tableContext(state) ? (dispatch?.(state.tr.replaceSelectionWith(visualSchema.nodes.hard_break.create()).scrollIntoView()), true) : false; }
