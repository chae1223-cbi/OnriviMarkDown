'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Fragment } from 'prosemirror-model';
import { createPortal } from 'react-dom';
import TableModal from '@/components/TableModal';
import { tableContext, tableAction, moveTableCell, tableEnter } from '@/lib/visualTableCommands';
import VisualReadOnlyMarkdownBlock from '@/components/VisualReadOnlyMarkdownBlock';
import { EditorState, TextSelection, Command } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { mediaDetails, copyMediaSource, type MediaKind } from '@/lib/mediaMarkup';
import { desktopClipboardImage } from '@/lib/desktopClipboard';
import { markdownPasteTransaction } from '@/lib/visualMarkdownPaste';
import { baseKeymap, chainCommands, exitCode, lift, setBlockType, toggleMark, wrapIn } from 'prosemirror-commands';
import { wrapInList, splitListItem, sinkListItem, liftListItem } from 'prosemirror-schema-list';
import { history, undo, redo, closeHistory } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { createVisualDocumentCodec, visualSchema, visualImageDetails } from '@/lib/visualDocumentCodec';
import { visualMarkdownInputRules } from '@/lib/visualMarkdownInputRules';
import { undoInputRule } from 'prosemirror-inputrules';
import { visualCommandCatalog, filterVisualCommands } from '@/lib/visualCommandCatalog';
import { TOOLBAR_ITEMS, configuredHotkeyItem } from '@/lib/toolbarConfig';
import { installVisualCaret } from '@/lib/visualCaret';

const slashPattern = new RegExp('(?:^|\\s)(\\/[\\p{L}\\p{N}_-]*)$', 'u');

// Always consume Tab in the document so browser focus cannot jump to controls.
const makeChecklist:Command=(state,dispatch,currentView)=>{
  const apply=(tr:import('prosemirror-state').Transaction)=>{
    const position=tr.selection.$from;
    for(let depth=position.depth;depth>0;depth--)if(position.node(depth).type===visualSchema.nodes.list_item){tr.setNodeMarkup(position.before(depth),undefined,{...position.node(depth).attrs,checked:false});break;}
    dispatch?.(tr);
  };
  for(let depth=state.selection.$from.depth;depth>0;depth--)if(state.selection.$from.node(depth).type===visualSchema.nodes.list_item){apply(state.tr);return true;}
  return wrapInList(visualSchema.nodes.bullet_list)(state,apply,currentView);
};
const indentDocument = (backward=false): Command => (state,dispatch,currentView) => {
  const {$from,from,to}=state.selection;
  for(let depth=$from.depth;depth>0;depth--)if($from.node(depth).type===visualSchema.nodes.list_item){
    if($from.parentOffset>0 && $from.parentOffset<$from.parent.content.size)break;
    if(backward)return true;
    const listDepth=depth-1,list=$from.node(listDepth),container=$from.node(listDepth-1),index=$from.index(listDepth-1);
    if($from.index(listDepth)!==0 || index===0)return true;
    const previous=container.child(index-1);
    if(!['bullet_list','ordered_list'].includes(previous.type.name))return true;
    const item=list.firstChild!,last=previous.lastChild!;
    const nested=list.type.create({...list.attrs,tight:true},item);
    const changedLast=last.copy(last.content.append(Fragment.from(nested)));
    const changedPrevious=previous.copy(previous.content.replaceChild(previous.childCount-1,changedLast));
    const nodes=[changedPrevious];
    if(list.childCount>1)nodes.push(list.copy(list.content.cut(item.nodeSize)));
    const listPos=$from.before(listDepth),previousPos=listPos-previous.nodeSize;
    if(dispatch){let tr=state.tr.replaceWith(previousPos,listPos+list.nodeSize,nodes);let target=0;
      tr.doc.descendants((node,pos)=>{if(node===item && !target){target=pos+2;return false;}});
      tr=tr.setSelection(TextSelection.create(tr.doc,target+$from.parentOffset));dispatch(tr.scrollIntoView());}
    return true;
  }
  if(!$from.parent.isTextblock)return true;
  const configured=currentView?Number.parseInt(currentView.dom.dataset.editorTabSize || getComputedStyle(currentView.dom).tabSize,10):2;
  const size=Number.isFinite(configured)?Math.max(1,Math.min(16,configured)):2;
  const before=$from.parent.textBetween(0,$from.parentOffset,'\n');
  if(!backward){
    const gap=size;
    const spaces=$from.parent.type===visualSchema.nodes.code_block?' '.repeat(gap):'\u00a0'.repeat(gap);
    if(dispatch)dispatch(state.tr.insertText(spaces,from,to).scrollIntoView());
    return true;
  }
  const preceding=before.match(new RegExp('[ \t\u00a0]{1,'+size+'}$'))?.[0];
  if(preceding && dispatch)dispatch(state.tr.delete(from-preceding.length,from).scrollIntoView());
  else if($from.parentOffset===0){
    const leading=$from.parent.textContent.match(new RegExp('^[ \t\u00a0]{1,'+size+'}'))?.[0];
    if(leading && dispatch)dispatch(state.tr.delete(from,from+leading.length).scrollIntoView());
  }
  return true;
};

function synchronizeTextSelection(view: EditorView) {
  if (view.composing || !(view.state.selection instanceof TextSelection) || !view.hasFocus()) return;
  const selection = document.getSelection();
  if (!selection?.anchorNode || !selection.focusNode || !view.dom.contains(selection.anchorNode) || !view.dom.contains(selection.focusNode)) return;
  try {
    const anchor=view.posAtDOM(selection.anchorNode,selection.anchorOffset),head=view.posAtDOM(selection.focusNode,selection.focusOffset);
    if(anchor!==view.state.selection.anchor || head!==view.state.selection.head) {
      view.dispatch(view.state.tr.setSelection(TextSelection.between(view.state.doc.resolve(anchor),view.state.doc.resolve(head))));
    }
  } catch { /* A DOM selection may be removed during a document update. */ }
}

type Codec = ReturnType<typeof createVisualDocumentCodec>;
const sessions = new Map<string, { source: string; state: EditorState; codec: Codec }>();
type Props = { content: string; onChange: (markdown: string) => void; readOnly?: boolean;
  onSourceScroll?: (offset:number)=>void;
  tabSize?:number;
  onSourceCursor?: (offset:number)=>void;
  documentId?: string; commandRef?: React.MutableRefObject<((command: string) => boolean) | null>;
  customHotkeys?: Record<string, string>;
  customCommands?: Record<string, string>;
  onFloatingToolbar?: (visible: boolean, position: { top: number; left: number }) => void;
  floatingToolbarVisible?: boolean;
  renderImage?: (source: string) => React.ReactNode;
  onImageFile?: (file: Blob) => Promise<string | null>;
  onMediaDialog?: (kind: MediaKind, source: string | null, insert: (code: string) => boolean) => void;
  onImageDialog?: (source: string | null, insert: (path: string, alt: string) => boolean) => void;
  onSourceAction?: (id: string, source: string, from: number, to: number) => void };

export default function VisualDocumentEditor({ content, onChange, readOnly = false, tabSize=4, onSourceScroll, onSourceCursor, documentId, commandRef, customCommands = {}, customHotkeys = {}, onSourceAction, onFloatingToolbar, floatingToolbarVisible, renderImage, onImageFile, onImageDialog, onMediaDialog }: Props) {
  const cursorFrame=useRef(0);
  useEffect(()=>()=>cancelAnimationFrame(cursorFrame.current),[]);
  const cursorCallback=useRef(onSourceCursor);cursorCallback.current=onSourceCursor;
  useEffect(()=>{if(viewRef.current)viewRef.current.dom.dataset.editorTabSize=String(tabSize);},[tabSize]);
  const host = useRef<HTMLDivElement>(null);
  const scrollCallback=useRef(onSourceScroll);scrollCallback.current=onSourceScroll;
  useEffect(()=>{
    let frame=0;
    const sync=(event:Event)=>{
      const container=host.current?.closest('.custom-preview-container');
      if(!container || event.target!==container || frame)return;
      frame=requestAnimationFrame(()=>{
        frame=0;const view=viewRef.current,codec=codecRef.current;if(!view || !codec || !scrollCallback.current)return;
        const rect=container.getBoundingClientRect(),body=view.dom.getBoundingClientRect();
        const point=view.posAtCoords({left:Math.max(rect.left+24,body.left+32),top:Math.max(rect.top+32,body.top+4)});
        if(point){
          const position=TextSelection.near(view.state.doc.resolve(point.pos)).head;
          const token='ONRIVISCROLLMAP';
          const offset=codec.serialize(view.state.tr.insertText(token,position).doc).indexOf(token);
          if(offset>=0){scrollCallback.current(offset);return;}
        }
        const ratio=container.scrollTop/Math.max(1,container.scrollHeight-container.clientHeight);
        scrollCallback.current(Math.round(codec.serialize(view.state.doc).length*Math.max(0,Math.min(1,ratio))));
      });
    };
    document.addEventListener('scroll',sync,true);
    return()=>{document.removeEventListener('scroll',sync,true);cancelAnimationFrame(frame);};
  },[]);

  const imageSequence = useRef(0);
  const [imageMounts, setImageMounts] = useState<{ id: number; element: HTMLElement; source: string }[]>([]);
  const viewRef = useRef<EditorView | null>(null);
  const caretRef = useRef<ReturnType<typeof installVisualCaret> | null>(null);
  const images = useRef({ renderImage, onImageFile, onImageDialog, onMediaDialog });
  images.current = { renderImage, onImageFile, onImageDialog, onMediaDialog };
  const imageTargets = useRef(new Set<{ from: number; to: number; source?: string; valid: boolean }>());
  const beginMediaRef = useRef<(kind: MediaKind, source?: string, position?: number) => void>(() => {});
  const beginImageRef = useRef<(source?: string, position?: number, file?: Blob) => void>(() => {});
  const callback = useRef(onChange);
  callback.current = onChange;
  const hotkeysRef = useRef(customHotkeys);
  hotkeysRef.current = customHotkeys;
  const emitted = useRef(content);
  const [inTable,setInTable] = useState(false);
  const [tableToolPosition,setTableToolPosition] = useState({top:8,left:8,width:700});
  useEffect(() => {
    if (!inTable || readOnly) return;
    const container=host.current?.closest('.custom-preview-container');
    const update=()=>{
      const rect=(container || host.current)?.getBoundingClientRect();
      if(rect)setTableToolPosition({top:container ? Math.max(8,rect.top+8) : Math.max(8,window.innerHeight-90),left:Math.max(8,rect.left+8),width:Math.max(240,Math.min(rect.width-16,window.innerWidth-24))});
    };
    update(); window.addEventListener('resize',update); window.addEventListener('scroll',update,true);
    return ()=>{window.removeEventListener('resize',update);window.removeEventListener('scroll',update,true);};
  }, [inTable,readOnly]);

  const [tableDialog,setTableDialog] = useState(false);
  const tableTargetRef = useRef<{from:number;to:number;valid:boolean}|null>(null);
  const openTableRef = useRef<() => void>(()=>{});
  const [selection, setSelection] = useState(false);
  const manualFloatingRef = useRef(false);
  const selectionVisibleRef = useRef(false);
  selectionVisibleRef.current = selection;
  const [slash, setSlash] = useState(false);
  const [popup, setPopup] = useState({ top: 0, left: 0 });
  const [notice, setNotice] = useState('');
  const slashRange = useRef<{ from: number; to: number } | null>(null);
  const codecRef = useRef<Codec | null>(null);
  const [query, setQuery] = useState('');
  const [activeMarks, setActiveMarks] = useState<string[]>([]);
  const [menuIndex, setMenuIndex] = useState(0);
  const menuIndexRef = useRef(0);
  const slashOpenRef = useRef(false);
  const menuItemsRef = useRef<{ id: string }[]>([]);
  const executeItemRef = useRef<(id: string, removeSlash?: boolean) => void>(() => {});
  slashOpenRef.current = slash;
  const floatingCallbackRef = useRef(onFloatingToolbar);
  floatingCallbackRef.current = onFloatingToolbar;
  const previousFloatingVisible = useRef(floatingToolbarVisible);
  useEffect(() => { floatingCallbackRef.current?.(selection && !readOnly, popup); }, [selection, readOnly, popup]);
  useEffect(() => () => floatingCallbackRef.current?.(false, { top: 0, left: 0 }), []);
  useEffect(() => {
    if (previousFloatingVisible.current && !floatingToolbarVisible && onFloatingToolbar) { manualFloatingRef.current = false; setSelection(false); }
    previousFloatingVisible.current = floatingToolbarVisible;
  }, [floatingToolbarVisible, onFloatingToolbar]);
  useEffect(() => {
    document.querySelector('#visual-slash-menu [data-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [menuIndex]);

  useEffect(() => {
    if (!host.current) return;
    const pendingImages = imageTargets.current;
    const cached = documentId ? sessions.get(documentId) : undefined;
    let codec = cached?.source === content ? cached.codec : createVisualDocumentCodec(content);
    codecRef.current = codec;
    emitted.current = content;
    const mediaNodeView: NonNullable<import('prosemirror-view').EditorProps['nodeViews']>[string] = (node, _view, getPos) => {
          const dom = document.createElement('figure');
          dom.contentEditable = 'false'; dom.className = 'visual-image-block visual-media-block';
          const picture = document.createElement('div'), button = document.createElement('button');
          button.type = 'button'; button.textContent = '편집'; button.className = 'visual-image-edit onrivi-media-control';
          button.setAttribute('aria-label', (node.type.name === 'visual_image' ? '이미지' : node.attrs.kind === 'map' ? '지도' : '동영상') + ' 편집');
          button.addEventListener('mousedown', event => event.preventDefault());
          button.addEventListener('click', event => {
            event.preventDefault(); event.stopPropagation();
            const position = getPos();
            if (view.editable && typeof position === 'number') {
              if (node.type.name === 'visual_image') beginImageRef.current(node.attrs.source, position);
              else beginMediaRef.current(node.attrs.kind, node.attrs.source, position);
            }
          });
          const copy = document.createElement('button'); copy.type = 'button'; copy.textContent = '복사';
          copy.className = 'visual-media-copy onrivi-media-control'; copy.setAttribute('aria-label','미디어 참조 복사'); copy.title = '다른 문서에 붙여넣을 수 있는 미디어 참조 복사';
          copy.addEventListener('mousedown',event => event.preventDefault());
          copy.addEventListener('click',event => { event.stopPropagation(); void copyMediaSource(node.attrs.source).then(() => setNotice('미디어 참조를 복사했습니다.')).catch(() => setNotice('클립보드 복사에 실패했습니다.')); });
          const id = ++imageSequence.current;
          const render = () => setImageMounts(previous => [...previous.filter(item => item.id !== id), { id, element:picture, source:node.attrs.source }]);
          const controls = document.createElement('div'); controls.className = 'visual-media-controls no-print'; controls.append(copy,button);
          render(); dom.append(picture, controls);
          return { dom, ignoreMutation: () => true,
            stopEvent: event => button.contains(event.target as Node) || copy.contains(event.target as Node),
            update(next) {
              if (next.type !== node.type) return false;
              if (next.attrs.source !== node.attrs.source) { node = next; render(); } else node = next;
              return true;
            }, destroy() { queueMicrotask(() => { if (viewRef.current) setImageMounts(previous => previous.filter(item => item.id !== id)); }); },
          };
    };
    const view = new EditorView(host.current, {
      state: cached?.source === content ? cached.state : EditorState.create({ doc: codec.doc, plugins: [history(), visualMarkdownInputRules(), keymap({
        Backspace: chainCommands(undoInputRule, baseKeymap.Backspace),
        ArrowDown:(state,dispatch,currentView)=>{
          if(!state.selection.empty || !currentView?.endOfTextblock('down'))return false;
          const table=tableContext(state);
          if(table && table.row===table.table.childCount-1)return tableAction('afterTable')(state,dispatch,currentView);
          if(state.selection.$from.parent.type===visualSchema.nodes.code_block && state.selection.$from.parentOffset===state.selection.$from.parent.content.size)return exitCode(state,dispatch,currentView);
          return false;
        },
        'Mod-Enter': chainCommands(tableAction('afterTable'),exitCode),
        Enter: chainCommands(tableEnter(), (state,dispatch)=>{const position=state.selection.$from;if(position.parent.type!==visualSchema.nodes.paragraph || position.depth!==1)return false;if(dispatch)dispatch(state.tr.replaceSelectionWith(visualSchema.nodes.hard_break.create()).scrollIntoView());return true;}, (state,dispatch,currentView)=>{const parent=state.selection.$from.depth>0?state.selection.$from.node(state.selection.$from.depth-1):null;return splitListItem(visualSchema.nodes.list_item,parent?.type===visualSchema.nodes.list_item && parent.attrs.checked!==null ? {checked:false} : undefined)(state,dispatch,currentView);}, baseKeymap.Enter),
        Tab: chainCommands(moveTableCell(),sinkListItem(visualSchema.nodes.list_item),indentDocument()), 'Shift-Tab': chainCommands(moveTableCell(true),liftListItem(visualSchema.nodes.list_item),indentDocument(true)),
      }), keymap(baseKeymap)] }),
      editable: () => !readOnly,
      attributes: { class: 'visual-document-surface', 'aria-label': '문서 직접 편집', role: 'textbox', 'aria-multiline': 'true', 'data-editor-tab-size': String(tabSize) },
      nodeViews: { visual_image:mediaNodeView, visual_media:mediaNodeView,
        list_item(node,currentView,getPos){
          const dom=document.createElement('li'),content=document.createElement('div'),checkbox=document.createElement('input');
          checkbox.type='checkbox';checkbox.contentEditable='false';checkbox.setAttribute('aria-label','할 일 완료');checkbox.style.cssText='float:left;margin:6px 8px 0 -24px;width:16px;height:16px';
          const update=()=>{
            const task=node.attrs.checked!==null;
            dom.classList.toggle('task-list-item',task);
            if(task && checkbox.parentNode!==dom)dom.insertBefore(checkbox,content);
            if(!task && checkbox.parentNode===dom)checkbox.remove();
            checkbox.checked=Boolean(node.attrs.checked);checkbox.disabled=!currentView.editable;
            dom.style.listStyle=task?'none':'';
          };
          checkbox.addEventListener('mousedown',event=>event.preventDefault());
          checkbox.addEventListener('change',()=>{const pos=getPos();if(typeof pos==='number' && currentView.editable)currentView.dispatch(currentView.state.tr.setNodeMarkup(pos,undefined,{...node.attrs,checked:checkbox.checked}));});
          dom.append(content);update();
          return {dom,contentDOM:content,stopEvent:event=>event.target===checkbox,ignoreMutation:mutation=>mutation.type!=='selection' && !content.contains(mutation.target) && mutation.target!==content,
            update(next){if(next.type!==node.type)return false;node=next;update();return true;}};
        },
        code_block(node, currentView, getPos) {
          const dom = document.createElement('div');
          dom.className = 'codeblock-area visual-code-block'; dom.spellcheck = false;
          const header=document.createElement('label'); header.contentEditable='false'; header.className='visual-code-language no-print';
          header.textContent='CODE ';
          const input=document.createElement('input'); input.setAttribute('aria-label','코드 블록 언어');input.placeholder='text, javascript, python, mermaid';input.value=node.attrs.params || '';input.disabled=!currentView.editable;
          input.addEventListener('change',()=>{
            const pos=getPos();if(typeof pos!=='number' || !currentView.editable)return;
            currentView.dispatch(closeHistory(currentView.state.tr.setNodeMarkup(pos,undefined,{...node.attrs,params:input.value.replace(/[\r\n]/g,'').trim()})));
          });header.append(input);
          const pre = document.createElement('pre'), code = document.createElement('code');
          pre.spellcheck = false; code.spellcheck = false;
          const preview=document.createElement('div'); preview.contentEditable='false';
          const id=++imageSequence.current;
          let renderedSource:string|null=null;
          const render=()=>{
            const mermaid=String(node.attrs.params || '').split(/\s/)[0]==='mermaid';
            preview.hidden=!mermaid;
            const source=mermaid?'```mermaid\n'+node.textContent+'\n```':null;
            if(source===renderedSource)return;
            renderedSource=source;
            if(source)setImageMounts(previous=>[...previous.filter(item=>item.id!==id),{id,element:preview,source}]);
            else setImageMounts(previous=>previous.filter(item=>item.id!==id));
          };
          pre.appendChild(code); dom.append(header,pre,preview);render();
          return { dom, contentDOM: code, stopEvent:event=>header.contains(event.target as Node),
            ignoreMutation:mutation=>mutation.type!=='selection' && !code.contains(mutation.target) && mutation.target!==code,
            update(next) {if(next.type!==node.type)return false;node=next;if(document.activeElement!==input)input.value=node.attrs.params || '';render();return true;},
            destroy(){queueMicrotask(()=>{if(viewRef.current)setImageMounts(previous=>previous.filter(item=>item.id!==id));});} };
        },
        source_block(node, currentView, getPos) {
          const dom = document.createElement('div');dom.contentEditable = 'false';dom.className = 'visual-source-block';
          const picture=document.createElement('div');const id=++imageSequence.current;
          const details=document.createElement('details');details.className='no-print';
          const summary=document.createElement('summary');summary.textContent='편집';
          const input=document.createElement('textarea');input.setAttribute('aria-label','블록 원문');input.value=node.attrs.source;input.rows=8;input.style.width='100%';input.disabled=!currentView.editable;
          const apply=document.createElement('button');apply.type='button';apply.textContent='적용';apply.disabled=!currentView.editable;
          apply.addEventListener('click',()=>{const pos=getPos();if(typeof pos==='number' && currentView.editable){currentView.dispatch(closeHistory(currentView.state.tr.setNodeMarkup(pos,undefined,{source:input.value})));details.open=false;}});
          details.append(summary,input,apply);dom.append(picture,details);
          const render=()=>setImageMounts(previous=>[...previous.filter(item=>item.id!==id),{id,element:picture,source:node.attrs.source}]);render();
          return {dom,ignoreMutation:()=>true,stopEvent:event=>details.contains(event.target as Node),
            update(next){if(next.type!==node.type)return false;if(next.attrs.source!==node.attrs.source){node=next;input.value=node.attrs.source;render();}return true;},
            destroy(){queueMicrotask(()=>{if(viewRef.current)setImageMounts(previous=>previous.filter(item=>item.id!==id));});}};
        },
      },
      dispatchTransaction(transaction) {
        imageTargets.current.forEach(target => {
          const from = transaction.mapping.mapResult(target.from, 1);
          const to = transaction.mapping.mapResult(target.to, -1);
          if (target.source && (from.deleted || to.deleted)) target.valid = false;
          target.from = from.pos; target.to = Math.max(from.pos, to.pos);
        });
        view.updateState(view.state.apply(transaction));
        caretRef.current?.schedule();
        if(transaction.selectionSet && !transaction.docChanged && view.hasFocus() && !view.composing && cursorCallback.current){
          const token='ONRIVICURSORMAP';
          const marker=view.state.tr.insertText(token,view.state.selection.head);
          const offset=codecRef.current?.serialize(marker.doc).indexOf(token);
          if(offset!==undefined && offset>=0)cursorCallback.current(offset);
        }
        setInTable(Boolean(tableContext(view.state)));
        const { from, to, $from, empty } = view.state.selection;
        if (transaction.docChanged) manualFloatingRef.current = false;
        setSelection(manualFloatingRef.current);
        const markNames = ['strong', 'em', 'code', 'link', 'strike'];
        const currentMarks = markNames.filter(name => empty
          ? (view.state.storedMarks ?? $from.marks()).some(mark => mark.type.name === name)
          : view.state.doc.rangeHasMark(from, to, visualSchema.marks[name]));
        setActiveMarks(previous => previous.join(',') === currentMarks.join(',') ? previous : currentMarks);
        const before = $from.parent.isTextblock && $from.parent.type !== visualSchema.nodes.code_block
          ? $from.parent.textBetween(Math.max(0, $from.parentOffset - 100), $from.parentOffset, '\n') : '';
        const match = before.match(slashPattern);
        slashRange.current = empty && match ? { from: from - match[1].length, to } : null;
        setSlash(Boolean(slashRange.current));
        setQuery(match?.[1].slice(1).toLowerCase() || '');
        menuIndexRef.current = 0; setMenuIndex(0);
        if (!empty || slashRange.current) {
          const rect = view.coordsAtPos(from);
          setPopup({ top: Math.max(8, Math.min(window.innerHeight - 150, empty ? rect.bottom + 6 : rect.top - 48)),
            left: Math.max(8, Math.min(window.innerWidth - 360, rect.left)) });
        }
        if (transaction.docChanged) {
          const next = codec.serialize(view.state.doc);
          emitted.current = next;
          callback.current(next);
          if(cursorCallback.current){
            cancelAnimationFrame(cursorFrame.current);
            cursorFrame.current=requestAnimationFrame(()=>{
              if(viewRef.current!==view || !view.hasFocus() || view.composing)return;
              const token='ONRIVICURSORMAP';
              const offset=codec.serialize(view.state.tr.insertText(token,view.state.selection.head).doc).indexOf(token);
              if(offset>=0)cursorCallback.current?.(offset);
            });
          }
        }
      },
      handleKeyDown(currentView, event) {
        if (!currentView.editable || event.isComposing) return false;
        if(event.key==='Tab')synchronizeTextSelection(currentView);
        if(event.key==='Tab'){
          const position=currentView.state.selection.$from;
          if(!tableContext(currentView.state) && position.parent.isTextblock && position.parentOffset>0 && position.parentOffset<position.parent.content.size){
            event.preventDefault();return indentDocument(event.shiftKey)(currentView.state,currentView.dispatch,currentView);
          }
        }
        const clipboardFile = desktopClipboardImage(event);
        if (clipboardFile && images.current.onImageFile) {
          event.preventDefault(); beginImageRef.current(undefined, undefined, clipboardFile); return true;
        }
        const configured = configuredHotkeyItem(event, hotkeysRef.current);
        if (configured) { synchronizeTextSelection(currentView); executeItemRef.current(configured.id); return true; }
        if (slashOpenRef.current && menuItemsRef.current.length && ['ArrowDown', 'ArrowUp', 'Enter', 'Tab'].includes(event.key)) {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            const length = menuItemsRef.current.length;
            menuIndexRef.current = (menuIndexRef.current + (event.key === 'ArrowDown' ? 1 : -1) + length) % length;
            setMenuIndex(menuIndexRef.current);
          } else {
            const item = menuItemsRef.current[menuIndexRef.current] || menuItemsRef.current[0];
            executeItemRef.current(item.id, true);
          }
          return true;
        }
        if ((event.ctrlKey || event.metaKey) && (event.code === 'Space' || event.key === ' ')) {
          const { from, to, $from, empty } = currentView.state.selection;
          const before = $from.parent.isTextblock ? $from.parent.textBetween(0, $from.parentOffset, '\n') : '';
          const match = before.match(slashPattern);
          const rect = currentView.coordsAtPos(from);
          const slashCommand = empty && Boolean(match);
          setPopup({ top: Math.max(8, Math.min(window.innerHeight - 150, slashCommand ? rect.bottom + 6 : rect.top - 48)),
            left: Math.max(8, Math.min(window.innerWidth - 360, rect.left)) });
          if (slashCommand) {
            slashRange.current = { from: from - match![1].length, to };
            setSlash(true); setSelection(false);
            setQuery(match![1].slice(1).toLowerCase());
          } else {
            setSlash(false); slashRange.current = null;
            const visible = !selectionVisibleRef.current;
            manualFloatingRef.current = visible;
            setSelection(visible);
          }
          return true;
        }
        if (event.key === 'Escape') { manualFloatingRef.current = false; slashOpenRef.current = false; setSlash(false); setSelection(false); slashRange.current = null; return true; }
        return false;
      },
      handlePaste(currentView, event) {
        if (!currentView.editable) return false;
        const text = event.clipboardData?.getData('text/plain') || '';
        const inCode = currentView.state.selection.$from.parent.type === visualSchema.nodes.code_block;
        // Raw Markdown wins over syntax-highlighting HTML from the clipboard.
        if (!inCode && codecRef.current && (/^(?:\uFEFF)?---[^\S\r\n]*\r?\n/.test(text) || /(^|\n)(#{1,6}\s|\s*[-*+]\s|\s*\d+\.\s|\s*>\s|```|\|)|\*\*[^*]+\*\*|`[^`]+`|!\[[^\]]*\]\(|^\s*<(?:video|iframe)\b/.test(text))) {
          currentView.dispatch(markdownPasteTransaction(currentView.state, codecRef.current, text));
          return true;
        }
        const image = Array.from(event.clipboardData?.files || []).find(file => file.type.startsWith('image/'))
          || Array.from(event.clipboardData?.items || []).find(item => item.type.startsWith('image/'))?.getAsFile();
        if (image && images.current.onImageFile) {
          event.preventDefault(); event.stopPropagation();
          beginImageRef.current(undefined, undefined, image); return true;
        }
        if (/<img\b/i.test(event.clipboardData?.getData('text/html') || '')) {
          setNotice('사진 넣기에서 이미지 파일이나 주소를 선택해 주세요.'); return true;
        }
        return false;
      },
      handleDrop(currentView, event) {
        if (!currentView.editable) return false;
        const files = Array.from(event.dataTransfer?.files || []).filter(file => file.type.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg|avif|bmp)$/i.test(file.name));
        if (files.length && images.current.onImageFile) {
          event.preventDefault(); event.stopPropagation();
          const position = currentView.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
          files.forEach(file => beginImageRef.current(undefined, position, file)); return true;
        }
        return false;
      },
      handleDOMEvents: { mouseup(currentView) {
        cancelAnimationFrame(cursorFrame.current);
        cursorFrame.current=requestAnimationFrame(()=>{
          if(viewRef.current!==currentView || currentView.composing || !currentView.hasFocus())return;
          synchronizeTextSelection(currentView);
          const codec=codecRef.current;if(!codec || !cursorCallback.current)return;
          const token='ONRIVICURSORMAP';
          const offset=codec.serialize(currentView.state.tr.insertText(token,currentView.state.selection.head).doc).indexOf(token);
          if(offset>=0)cursorCallback.current(offset);
        });
        return false;
      }, blur() { manualFloatingRef.current = false; setSelection(false); setSlash(false); return false; } },
    });
    viewRef.current = view;
    caretRef.current = installVisualCaret(view);
    // Codec belongs to this editor instance, keeping unchanged source node bytes.
    (view as EditorView & { replaceSource?: (source: string) => void }).replaceSource = source => {
      imageTargets.current.forEach(target => { target.valid = false; });
      codec = createVisualDocumentCodec(source);
      codecRef.current = codec;
      emitted.current = source;
      const previous = view.state.selection;
      const state = EditorState.create({ doc: codec.doc, plugins: view.state.plugins });
      // Metadata/save refreshes must not reset an active cursor to the start.
      const limit = state.doc.content.size;
      const selection = TextSelection.between(state.doc.resolve(Math.min(previous.anchor, limit)), state.doc.resolve(Math.min(previous.head, limit)));
      view.updateState(state.apply(state.tr.setSelection(selection)));
      setInTable(Boolean(tableContext(view.state)));
      setActiveMarks(view.state.selection.$from.marks().map(mark=>mark.type.name));
      caretRef.current?.schedule();
      manualFloatingRef.current = false;
      setSlash(false); setSelection(false);
    };
    return () => {
      if (documentId) {
        sessions.set(documentId, { source: emitted.current, state: view.state, codec });
        if (sessions.size > 20) sessions.delete(sessions.keys().next().value!);
      }
      pendingImages.forEach(target => { target.valid = false; }); pendingImages.clear();
      caretRef.current?.destroy(); caretRef.current = null;
      view.destroy(); viewRef.current = null;
    };
    // Document identity is supplied as the parent key; local input never remounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const view = viewRef.current as (EditorView & { replaceSource?: (source: string) => void }) | null;
    if (view && content !== emitted.current) view.replaceSource?.(content);
  }, [content]);
  useEffect(()=>{
    const sync=(event:Event)=>{
      const offset=(event as CustomEvent).detail?.offset,view=viewRef.current,codec=codecRef.current;
      if(!view || !codec || typeof offset!=='number' || view.hasFocus())return;
      const token='ONRIVICURSORMAP';let low=0,high=view.state.doc.content.size,best=1;
      while(low<=high){const mid=Math.floor((low+high)/2);const selection=TextSelection.near(view.state.doc.resolve(mid));const pos=selection.head;
        const marked=codec.serialize(view.state.tr.insertText(token,pos).doc);const index=marked.indexOf(token);
        if(index<0)break;best=pos;if(index===offset)break;if(index<offset)low=mid+1;else high=mid-1;
      }
      view.dispatch(view.state.tr.setSelection(TextSelection.near(view.state.doc.resolve(best))).scrollIntoView());
    };
    window.addEventListener('onrivi:source-cursor',sync);return()=>window.removeEventListener('onrivi:source-cursor',sync);
  },[]);
  useEffect(() => { viewRef.current?.setProps({ editable: () => !readOnly }); caretRef.current?.schedule(); }, [readOnly]);

  const run = (command: Command, removeSlash = false) => {
    const view = viewRef.current;
    if (!view || readOnly) return;
    synchronizeTextSelection(view);
    if (removeSlash && slashRange.current) {
      const { from, to } = slashRange.current;
      const transaction = view.state.tr.delete(from, to);
      view.dispatch(transaction.setSelection(TextSelection.create(transaction.doc, from)));
      slashRange.current = null; setSlash(false);
    }
    command(view.state, view.dispatch, view);
    view.focus();
  };
  const blockCommands: [string, Command][] = [
    ['본문', setBlockType(visualSchema.nodes.paragraph)],
    ['제목 1', setBlockType(visualSchema.nodes.heading, { level: 1 })],
    ['제목 2', setBlockType(visualSchema.nodes.heading, { level: 2 })],
    ['제목 3', setBlockType(visualSchema.nodes.heading, { level: 3 })],
    ['글머리 목록', wrapInList(visualSchema.nodes.bullet_list)],
    ['번호 목록', wrapInList(visualSchema.nodes.ordered_list)],
    ['인용문', wrapIn(visualSchema.nodes.blockquote)],
    ['코드 블록', setBlockType(visualSchema.nodes.code_block)],
    ['구분선', (state, dispatch) => { dispatch?.(state.tr.replaceSelectionWith(visualSchema.nodes.horizontal_rule.create()).scrollIntoView()); return true; }],
  ];
  const link: Command = (state, dispatch) => {
    if (state.selection.empty) { setNotice('링크로 만들 글을 먼저 선택해 주세요.'); return false; }
    const href = window.prompt('링크 주소를 입력해 주세요.', 'https://');
    if (!href) return false;
    if (!/^(https?:\/\/|mailto:|#|\/|\.\.?\/)/i.test(href.trim())) { setNotice('https://로 시작하는 주소를 입력해 주세요.'); return false; }
    return toggleMark(visualSchema.marks.link, { href: href.trim() })(state, dispatch);
  };
  const clear: Command = (state, dispatch, view) => {
    const { from, to, $from } = state.selection;
    const transaction = state.tr.removeMark(state.selection.empty ? $from.start() : from,
      state.selection.empty ? $from.end() : to).setStoredMarks([]);
    if ($from.parent.isTextblock) {
      transaction.setBlockType(from, to, visualSchema.nodes.paragraph);
    }
    dispatch?.(transaction);
    if (view && dispatch) {
      for (let depth = 0; depth < 10; depth++) {
        const current = view.state;
        const parentNames = Array.from({ length: current.selection.$from.depth }, (_, index) => current.selection.$from.node(index + 1).type.name);
        if (!parentNames.some(name => name === 'list_item' || name === 'blockquote')) break;
        if (!liftListItem(visualSchema.nodes.list_item)(current, dispatch, view) && !lift(current, dispatch, view)) break;
      }
    }
    return true;
  };
  const setQuote = (alertType:string|null):Command => (state,dispatch,view) => {
    const position=state.selection.$from;
    for(let depth=position.depth;depth>0;depth--) {
      if(position.node(depth).type===visualSchema.nodes.blockquote){dispatch?.(state.tr.setNodeMarkup(position.before(depth),undefined,{alertType}));return true;}
    }
    return wrapIn(visualSchema.nodes.blockquote,{alertType})(state,dispatch,view);
  };
  openTableRef.current = () => {
    const view=viewRef.current;if(!view?.editable)return;
    if(tableContext(view.state)){setNotice('현재 표는 행·열 추가로 확장할 수 있습니다. 새 표는 표 아래 본문에서 넣어 주세요.');return;}
    if(tableTargetRef.current)imageTargets.current.delete(tableTargetRef.current);
    const target={from:view.state.selection.from,to:view.state.selection.to,valid:true};
    tableTargetRef.current=target;imageTargets.current.add(target);setTableDialog(true);
  };
  const nativeCommands: Record<string, Command> = {
    bold: toggleMark(visualSchema.marks.strong), italic: toggleMark(visualSchema.marks.em),
    inlineCode: toggleMark(visualSchema.marks.code), strikethrough:toggleMark(visualSchema.marks.strike), link, clear,
    quoteNote:setQuote('NOTE'),quoteTip:setQuote('TIP'),quoteImportant:setQuote('IMPORTANT'),quoteWarning:setQuote('WARNING'),quoteCaution:setQuote('CAUTION'),
    table:()=>{openTableRef.current();return true;},
    list: wrapInList(visualSchema.nodes.bullet_list), orderedList: wrapInList(visualSchema.nodes.ordered_list),
    checklist:makeChecklist, quote: setQuote(null), codeblock: setBlockType(visualSchema.nodes.code_block),
    divider: blockCommands[blockCommands.length - 1][1], undo, redo,
  };
  for (let level = 1; level <= 6; level++) nativeCommands[`h${level}`] = setBlockType(visualSchema.nodes.heading, { level });
  beginImageRef.current = (source, position, file) => {
    const view = viewRef.current;
    if (!view || !view.editable) return;
    if(tableContext(view.state)){setNotice('표 안 미디어 삽입은 현재 Markdown 보기를 사용해 주세요.');return;}
    const from = position ?? view.state.selection.from;
    const target = { from, to: source ? from + (view.state.doc.nodeAt(from)?.nodeSize || 0) : position ?? view.state.selection.to, source, valid: true };
    imageTargets.current.add(target);
    const insert = (path: string, alt: string) => {
      imageTargets.current.delete(target);
      if (!target.valid || viewRef.current !== view || !view.editable) return false;
      if (source && view.state.doc.nodeAt(target.from)?.attrs.source !== source) return false;
      const title = source ? visualImageDetails(source).title : '';
      const markdown = `![${alt.replace(/([\\\[\]])/g, '\\$1')}](${path.includes(' ') ? '<' + path + '>' : path}${title ? ' \"' + title.replace(/([\\\"])/g, '\\$1') + '\"' : ''})\n\n`;
      const node = visualSchema.nodes.visual_image.create({ source: markdown });
      let tr = view.state.tr;
      if (source) tr = tr.replaceWith(target.from, target.to, node);
      else {
        tr = tr.setSelection(TextSelection.between(tr.doc.resolve(target.from), tr.doc.resolve(target.to))).replaceSelectionWith(node);
        if (tr.selection.$to.parent === tr.doc || tr.selection.to === tr.doc.content.size) {
          tr = tr.insert(tr.doc.content.size, visualSchema.nodes.paragraph.create());
          tr = tr.setSelection(TextSelection.create(tr.doc, tr.doc.content.size - 1));
        }
      }
      view.dispatch(closeHistory(tr).scrollIntoView()); view.focus(); return true;
    };
    if (file && images.current.onImageFile) {
      void images.current.onImageFile(file).then(path => {
        if (path && !insert(path, file instanceof File ? file.name : '')) setNotice('문서나 삽입 위치가 변경되었습니다. 저장된 사진을 다시 선택해 주세요.');
        if (!path) imageTargets.current.delete(target);
      }).catch(() => { imageTargets.current.delete(target); setNotice('이미지 저장에 실패했습니다. 리소스 폴더 연결을 확인해 주세요.'); });
    } else if (images.current.onImageDialog) images.current.onImageDialog(source || null, insert);
    else { imageTargets.current.delete(target); setNotice('사진 넣기 기능을 연결할 수 없습니다.'); }
  };
  beginMediaRef.current = (kind, source, position) => {
    const view = viewRef.current;
    if (!view?.editable || !images.current.onMediaDialog) return;
    if(tableContext(view.state)){setNotice('표 안 미디어 삽입은 현재 Markdown 보기를 사용해 주세요.');return;}
    const from = position ?? view.state.selection.from;
    const target = {from,to:source ? from + (view.state.doc.nodeAt(from)?.nodeSize || 0) : view.state.selection.to,source,valid:true};
    imageTargets.current.add(target);
    images.current.onMediaDialog(kind, source || null, code => {
      imageTargets.current.delete(target);
      if (!target.valid || viewRef.current !== view || !view.editable || !mediaDetails(code)) return false;
      if (source && view.state.doc.nodeAt(target.from)?.attrs.source !== source) return false;
      const node = visualSchema.nodes.visual_media.create({kind,source:code.trim() + '\n\n'});
      let tr = view.state.tr;
      if (source) tr = tr.replaceWith(target.from,target.to,node);
      else tr = tr.setSelection(TextSelection.between(tr.doc.resolve(target.from),tr.doc.resolve(target.to))).replaceSelectionWith(node);
      if (tr.selection.to === tr.doc.content.size || tr.selection.$to.parent === tr.doc) {
        tr = tr.insert(tr.doc.content.size,visualSchema.nodes.paragraph.create());
        tr = tr.setSelection(TextSelection.create(tr.doc,tr.doc.content.size - 1));
      }
      view.dispatch(closeHistory(tr).scrollIntoView()); view.focus(); return true;
    });
  };
  const executeItem = (id: string, removeSlash = false) => {
    const view = viewRef.current;
    if (!view || readOnly) return;
    if (['youtube','map'].includes(id) && images.current.onMediaDialog) {
      if (removeSlash && slashRange.current) {view.dispatch(view.state.tr.delete(slashRange.current.from,slashRange.current.to)); slashRange.current=null; setSlash(false);}
      beginMediaRef.current(id === 'map' ? 'map' : 'video'); return;
    }
    if (id === 'image' && images.current.onImageDialog) {
      if (removeSlash && slashRange.current) {
        view.dispatch(view.state.tr.delete(slashRange.current.from, slashRange.current.to));
        slashRange.current = null; setSlash(false);
      }
      beginImageRef.current(); return;
    }
    if (nativeCommands[id]) { run(nativeCommands[id], removeSlash); return; }
    if (removeSlash && slashRange.current) {
      const range = slashRange.current;
      view.dispatch(view.state.tr.delete(range.from, range.to));
      slashRange.current = null; setSlash(false);
    }
    if (!onSourceAction || !codecRef.current) { setNotice('이 명령은 Markdown 보기에서 사용할 수 있습니다.'); return; }
    // Map the visual selection to source without modifying the editor. Two
    // temporary plain tokens preserve the selected text and its mark wrappers.
    const token = `ONRIVICURSOR${Date.now()}${Math.floor(Math.random() * 1000000)}`;
    const { from, to } = view.state.selection;
    const transaction = view.state.tr.insertText(`${token}END`, to).insertText(`${token}START`, from);
    const marked = codecRef.current.serialize(transaction.doc);
    const start = marked.indexOf(`${token}START`);
    const end = marked.indexOf(`${token}END`);
    const source = marked.replace(`${token}START`, '').replace(`${token}END`, '');
    onSourceAction(id, source, start, end - `${token}START`.length);
  };
  executeItemRef.current = executeItem;
  useEffect(() => {
    if (!commandRef) return;
    const commands: Record<string, Command> = {
      UNDO: undo, REDO: redo, BOLD: toggleMark(visualSchema.marks.strong),
      ITALIC: toggleMark(visualSchema.marks.em), INLINE_CODE: toggleMark(visualSchema.marks.code),
      LIST: wrapInList(visualSchema.nodes.bullet_list), ORDERED_LIST: wrapInList(visualSchema.nodes.ordered_list),
      CHECK:makeChecklist,CHECKLIST:makeChecklist, QUOTE: setQuote(null), CODE_BLOCK: setBlockType(visualSchema.nodes.code_block),
      LINK: link, REMOVE_PREFIX: clear, STRIKETHROUGH:toggleMark(visualSchema.marks.strike),
      QUOTE_NOTE:setQuote('NOTE'),QUOTE_TIP:setQuote('TIP'),QUOTE_IMPORTANT:setQuote('IMPORTANT'),QUOTE_WARNING:setQuote('WARNING'),QUOTE_CAUTION:setQuote('CAUTION'),
      TABLE:()=>{openTableRef.current();return true;}, QUICK_TABLE:()=>{openTableRef.current();return true;}, INSERT_TABLE_ROW:tableAction('addRow'), DELETE_TABLE_ROW:tableAction('deleteRow'),
    };
    for (let level = 1; level <= 6; level++) commands[`H${level}`] = setBlockType(visualSchema.nodes.heading, { level });
    const bridge = (command: string) => {
      if (command.startsWith('INSERT_TEXT:')) {
        const view=viewRef.current;
        if (!view || readOnly) return true;
        view.dispatch(view.state.tr.insertText(command.slice('INSERT_TEXT:'.length)).scrollIntoView());
        view.focus(); caretRef.current?.schedule();
        return true;
      }
      if (command === 'TOGGLE_FLOATING_TOOLBAR' || command === 'SLASH_COMMAND') {
        const view = viewRef.current;
        if (!view || readOnly) return true;
        view.focus();
        const {from,to,$from,empty} = view.state.selection;
        const rect = view.coordsAtPos(from);
        setPopup({top:Math.max(8,Math.min(window.innerHeight-150,command==='SLASH_COMMAND'?rect.bottom+6:rect.top-48)),left:Math.max(8,Math.min(window.innerWidth-360,rect.left))});
        if (command === 'SLASH_COMMAND') {
          const before = $from.parent.isTextblock ? $from.parent.textBetween(0,$from.parentOffset,'\n') : '';
          const match = before.match(slashPattern);
          slashRange.current = {from:empty && match ? from-match[1].length : from,to};
          setQuery(empty && match ? match[1].slice(1).toLowerCase() : '');
          manualFloatingRef.current=false; setSelection(false); setSlash(true);
        } else {
          setSlash(false); slashRange.current=null;
          manualFloatingRef.current=!selectionVisibleRef.current;
          setSelection(manualFloatingRef.current);
        }
        return true;
      }
      if (command === 'FOCUS') { viewRef.current?.focus(); return true; }
      if (commands[command]) { run(commands[command]); return true; }
      const aliases: Record<string, string> = { HR:'divider', CHECK:'checklist', CHECKLIST:'checklist', CITE:'citation', DOCLINK:'taglink',
        VIDEO:'youtube', YOUTUBE:'youtube', ADD_REFERENCE:'add_reference', TOGGLE_CSS_STYLE:'styleSettings', AI_DRAFT:'aiHelp', CODE:'codeblock', LATEX:'math', MATH:'math' };
      const item = TOOLBAR_ITEMS.find(tool => tool.id === aliases[command] || tool.id.replace(/([A-Z])/g, '_$1').toUpperCase() === command);
      if (!item) return false;
      executeItemRef.current(item.id);
      return true;
    };
    commandRef.current = bridge;
    return () => { if (commandRef.current === bridge) commandRef.current = null; };
    // Commands read the current view state; do not reinstall on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commandRef, readOnly]);
  const button = (label: string, command: Command, removeSlash = false) => <button key={label} type="button"
    disabled={readOnly} onMouseDown={event => event.preventDefault()} onClick={() => run(command, removeSlash)}
    className="rounded px-3 py-2 text-sm hover:bg-blue-50 disabled:opacity-40">{label}</button>;
  const catalog = visualCommandCatalog(customCommands);
  const filtered = filterVisualCommands(catalog, query);
  menuItemsRef.current = filtered;
  const itemButton = (id: string, label: string, removeSlash = false) => <button key={id} type="button"
    aria-label={id === 'inlineCode' ? 'inlinecode' : id}
    disabled={readOnly} onMouseDown={event => event.preventDefault()} onClick={() => executeItem(id, removeSlash)}
    className={`rounded px-3 py-2 text-sm hover:bg-blue-50 ${activeMarks.includes(({ bold: 'strong', italic: 'em', inlineCode: 'code', link: 'link', strikethrough:'strike' } as Record<string, string>)[id]) ? 'bg-blue-100 ring-1 ring-blue-400' : ''}`}
    aria-pressed={['bold', 'italic', 'inlineCode', 'link', 'strikethrough'].includes(id) ? activeMarks.includes(({ bold: 'strong', italic: 'em', inlineCode: 'code', link: 'link', strikethrough:'strike' } as Record<string, string>)[id]) : undefined}>{label}</button>;

  return <section style={{tabSize}} className="visual-document-editor relative" aria-label="기본 직접 편집기"
    onClick={event => event.stopPropagation()} onDrop={event => event.stopPropagation()}>
    <div className="sticky top-0 z-20 flex flex-wrap items-center gap-1 border-b bg-white p-2 text-zinc-800" data-editor-controls>
      {itemButton('bold', 'bold')}{itemButton('italic', 'italic')}{itemButton('strikethrough', '취소선')}{itemButton('inlineCode', 'inlinecode')}{itemButton('link', 'link')}{itemButton('clear', 'clear')}{itemButton('image', '사진 넣기')}{itemButton('table', '표 넣기')}
      {button('실행 취소', undo)}{button('다시 실행', redo)}
      <select aria-label="문단 서식" defaultValue="" onChange={event => {
        const item = blockCommands.find(([label]) => label === event.target.value);
        if (item) run(item[1]); event.target.value = '';
      }} className="rounded border p-2 text-sm"><option value="">문단 서식</option>
        {blockCommands.map(([label]) => <option key={label}>{label}</option>)}
      </select>
      <span className="ml-auto text-xs text-zinc-500">/ 입력: 블록 추가 · Ctrl+Space: 툴바 · Ctrl+Enter: 표/코드 아래 본문 · Tab: 목록 들여쓰기</span>
      <span aria-label="현재 입력 서식" className="text-xs text-blue-700">{activeMarks.length ? activeMarks.map(name => ({strong:'bold',em:'italic',code:'inlinecode',link:'link',strike:'strike'})[name]).join(' + ') : 'plain'}</span>
    </div>
    {inTable && !readOnly && createPortal(<div style={tableToolPosition} className="no-print fixed z-[100000] flex flex-wrap gap-1 rounded-lg border border-blue-200 bg-blue-50 p-2 text-zinc-800 shadow-lg" data-editor-controls aria-label="표 편집 도구">
      <strong className="self-center px-2 text-sm">표 편집 도구</strong>
      {(['addRow','deleteRow','addColumn','deleteColumn','left','center','right','afterTable','deleteTable'] as const).map(action=><button key={action} type="button" className="rounded border bg-white px-2 py-1 text-sm" onMouseDown={e=>e.preventDefault()} onClick={()=>{const view=viewRef.current,command=tableAction(action);if(view && !command(view.state))setNotice('헤더 행과 마지막 열은 삭제할 수 없습니다. 표 전체를 지우려면 표 삭제를 사용해 주세요.');else run(command);}}>
        {{addRow:'행 추가',deleteRow:'행 삭제',addColumn:'열 추가',deleteColumn:'열 삭제',left:'본문 왼쪽',center:'본문 중앙',right:'본문 오른쪽',afterTable:'표 아래 본문',deleteTable:'표 삭제'}[action]}</button>)}
    </div>, document.body)}
    <TableModal isOpen={tableDialog} isDarkMode={false} onClose={()=>{setTableDialog(false);if(tableTargetRef.current)imageTargets.current.delete(tableTargetRef.current);tableTargetRef.current=null;}} onInsert={source=>{
      const view=viewRef.current,target=tableTargetRef.current;
      if(!view || !target?.valid || !view.editable || !codecRef.current){setNotice('문서나 삽입 위치가 변경되었습니다.');return;}
      const parsed=createVisualDocumentCodec(source),table=parsed.doc.firstChild;
      if(table?.type!==visualSchema.nodes.table)return;
      codecRef.current.adopt(parsed);imageTargets.current.delete(target);
      let tr=view.state.tr.setSelection(TextSelection.between(view.state.doc.resolve(target.from),view.state.doc.resolve(target.to))).replaceSelectionWith(table);
      let first=0;tr.doc.descendants((node,pos)=>{if(node===table){first=pos+4;return false;}return true;});
      tr=tr.setSelection(TextSelection.create(tr.doc,first));view.dispatch(closeHistory(tr).scrollIntoView());view.focus();
    }} />
    {notice && <div role="status" className="flex justify-between bg-amber-50 px-4 py-2 text-sm text-amber-900" data-editor-controls>{notice}<button type="button" onClick={() => setNotice('')}>닫기</button></div>}
    {selection && !readOnly && !onFloatingToolbar && createPortal(<div role="toolbar" aria-label="선택한 글 서식" style={{ ...popup,
      left: Math.max(8, Math.min(popup.left, window.innerWidth - 916)), width: 'min(900px, calc(100vw - 16px))',
      maxHeight: Math.min(window.innerHeight * 0.4, window.innerHeight - popup.top - 8), overflow:'auto' }} className="fixed z-[1000] flex flex-wrap rounded-xl border bg-white text-zinc-800 shadow-lg" data-editor-controls>
      {([['bold','B'], ['italic','I'], ['inlineCode','</>'], ['link','🔗'], ['clear','⌫']] as [string,string][]).map(([id,label]) => itemButton(id,label))}
    </div>, document.body)}
    {slash && !readOnly && createPortal(<div id="visual-slash-menu" role="menu" aria-label="슬래시 명령어" style={{ ...popup, width: 'min(650px, calc(100vw - 16px))',
      left: Math.max(8, Math.min(popup.left, window.innerWidth - 666)),
      maxHeight: Math.min(window.innerHeight * 0.4, window.innerHeight - popup.top - 8), overflow: 'auto' }} className="fixed z-[1000] flex flex-wrap rounded-xl border bg-white p-2 text-zinc-800 shadow-lg" data-editor-controls>
      {filtered.map((item, index) => <button key={item.id} type="button" aria-label={`/${item.command}`} data-selected={index === menuIndex}
        onMouseDown={event => event.preventDefault()} onClick={() => executeItem(item.id, true)}
        className={`flex w-full items-center gap-2 px-2 py-1 text-left text-sm ${index === menuIndex ? 'bg-[#3d5db5] text-white' : 'hover:bg-blue-50'}`}
        title={item.description}>
        <span className="w-6 shrink-0 text-center">{item.icon}</span><span className="w-28 shrink-0 font-semibold">/{item.command}</span>
        <span className="min-w-0 flex-1 truncate">{item.name}</span><span className="hidden max-w-[45%] truncate text-xs opacity-65 sm:block">{item.description}</span>
      </button>)}
      {!filtered.length && <span className="p-2 text-sm text-zinc-500">No commands</span>}
    </div>, document.body)}
    <div ref={host} />
    {imageMounts.map(item => createPortal(renderImage?.(item.source) || <VisualReadOnlyMarkdownBlock source={item.source} />, item.element, String(item.id)))}
    <style>{`
      .visual-document-surface { caret-color:#2563eb; outline:none; min-height:360px; padding:28px; white-space:pre-wrap; overflow-wrap:anywhere; color:inherit; background:inherit; font-family:inherit; font-size:inherit; line-height:1.75; }
      .custom-preview-container .visual-document-surface :is(p,h1,h2,h3,h4,h5,h6,li > div),
      .onrivi-content-root .visual-document-surface :is(p,h1,h2,h3,h4,h5,h6,li > div),
      .visual-document-surface :is(p,h1,h2,h3,h4,h5,h6,li > div) { white-space:break-spaces!important; tab-size:inherit; }
      .visual-document-surface p { margin:0 0 1em; }
      .visual-document-surface p:empty, .visual-document-surface p:has(>br.ProseMirror-trailingBreak:only-child) { min-height:1.75em!important; }
      .visual-document-surface li { margin-top:0!important; margin-bottom:0!important; padding-top:0!important; padding-bottom:0!important; }
      .visual-document-surface li p { margin-top:0!important; margin-bottom:0!important; }
      .custom-preview-container .visual-document-surface li ul, .custom-preview-container .visual-document-surface li ol, .visual-document-surface li ul, .visual-document-surface li ol { margin-top:0!important; margin-bottom:0!important; padding-top:0!important; padding-bottom:0!important; }
      .visual-document-surface h1 { font-size:2em; font-weight:700; }
      .visual-document-surface h2 { font-size:1.5em; font-weight:700; }
      .visual-document-surface h3 { font-size:1.25em; font-weight:700; }
      .visual-document-surface ul { padding-left:2em; list-style:disc; }
      .visual-document-surface ul, .visual-document-surface ol { padding-left:2em!important; margin-top:0!important; margin-bottom:0!important; }
      .visual-document-surface ol { padding-left:2em; list-style:decimal; }
      .visual-document-surface blockquote { border-left:3px solid #93c5fd; padding-left:1em; }
      .visual-document-surface pre { background:#f4f4f5; padding:12px; white-space:pre-wrap; }
      .visual-document-surface .visual-code-language { display:flex!important; gap:10px; align-items:center; padding:10px 16px!important; margin:0!important; background:#eef2f7!important; border-bottom:1px solid #dbe2ea; font-family:system-ui,sans-serif!important; font-size:11px!important; line-height:1.4!important; font-weight:700; letter-spacing:.06em; color:#475569!important; }
      .visual-document-surface .visual-code-language input { background:#fff!important; color:#334155!important; border:1px solid #cbd5e1; border-radius:6px; padding:4px 8px!important; width:120px!important; max-width:60%; height:28px; box-sizing:border-box; font-family:system-ui,sans-serif!important; font-size:12px!important; line-height:18px!important; letter-spacing:0; }
      .visual-code-language input:focus { outline:2px solid #93c5fd; outline-offset:2px; }
      .visual-document-surface code { background:#f4f4f5; font-family:monospace; }
      .visual-document-surface .visual-code-block { background:#1e293b; color:#e2e8f0; border:1px solid #dbe2ea; border-radius:10px; overflow:hidden; box-shadow:0 2px 8px rgba(15,23,42,.04); }
      .custom-preview-container .visual-document-surface .visual-code-block pre, .visual-document-surface .visual-code-block pre { background:transparent!important; color:inherit; margin:0!important; padding:18px 20px!important; white-space:pre; overflow-x:auto; line-height:1.65!important; }
      .custom-preview-container .visual-document-surface .visual-code-block code, .visual-document-surface .visual-code-block code { background:transparent!important; color:inherit; opacity:1; white-space:inherit; padding:0!important; font-family:"D2Coding","Cascadia Code",Consolas,monospace!important; line-height:inherit!important; letter-spacing:0!important; }
      .visual-image-block { position:relative; margin:16px 0; }
      .visual-media-controls { position:absolute; right:12px; top:12px; display:flex; gap:6px; z-index:20; opacity:0; pointer-events:none; }
      .visual-image-block:hover .visual-media-controls, .visual-image-block:focus-within .visual-media-controls { opacity:1; pointer-events:auto; }
      .visual-document-surface[contenteditable="false"] .visual-image-edit { display:none; }
      @media print { .visual-media-controls { display:none; } }
      @media (hover:none) { .visual-media-controls { opacity:1; pointer-events:auto; } }
      .visual-document-surface .visual-editable-table { border-collapse:collapse; width:100%; margin:16px 0; }
      .visual-document-surface .visual-editable-table th, .visual-document-surface .visual-editable-table td { border:1px solid #cbd5e1; padding:8px; min-width:60px; vertical-align:top; }
      .visual-document-surface table th p, .visual-document-surface table td p { margin:0!important; padding:0!important; }
      .visual-document-surface .visual-editable-table th { background:#f1f5f9; text-align:center!important; }
      .custom-preview-container .visual-document-surface blockquote[data-alert-type], .onrivi-content-root .visual-document-surface blockquote[data-alert-type], .visual-document-surface blockquote[data-alert-type] { background:var(--alert-bg,#eff6ff)!important; border-left:4px solid var(--alert-border,#3b82f6)!important; padding:12px!important; border-radius:0 10px 10px 0; }
      .visual-document-surface blockquote[data-alert-type]::before { content:attr(data-alert-type); display:block; font-weight:700; color:inherit!important; margin-bottom:8px; }
.visual-document-surface [data-alert-type="NOTE" i], .visual-document-surface [data-alert-type="참고" i], .visual-document-surface [data-alert-type="참조" i], .visual-document-surface [data-alert-type="메모" i], .visual-document-surface [data-alert-type="알림" i] { --alert-bg:#eff6ff; --alert-border:#3b82f6; --alert-text:#1d4ed8; }
.visual-document-surface [data-alert-type="TIP" i], .visual-document-surface [data-alert-type="팁" i], .visual-document-surface [data-alert-type="도움말" i] { --alert-bg:#ecfdf5; --alert-border:#10b981; --alert-text:#047857; }
.visual-document-surface [data-alert-type="IMPORTANT" i], .visual-document-surface [data-alert-type="중요" i], .visual-document-surface [data-alert-type="필독" i] { --alert-bg:#faf5ff; --alert-border:#a855f7; --alert-text:#7e22ce; }
.visual-document-surface [data-alert-type="WARNING" i], .visual-document-surface [data-alert-type="주의" i] { --alert-bg:#fffbeb; --alert-border:#f59e0b; --alert-text:#b45309; }
.visual-document-surface [data-alert-type="CAUTION" i], .visual-document-surface [data-alert-type="경고" i], .visual-document-surface [data-alert-type="위험" i] { --alert-bg:#fff1f2; --alert-border:#f43f5e; --alert-text:#be123c; }
      .visual-document-surface s { text-decoration:line-through; }
      .visual-source-block { border:1px dashed #a1a1aa; border-radius:8px; margin:12px 0; padding:12px; color:#52525b; font-size:13px; }
      .visual-source-block pre { max-height:160px; overflow:auto; }
      .visual-readonly-content table { border-collapse:collapse; width:100%; }
      .visual-readonly-content th, .visual-readonly-content td { border:1px solid #d4d4d8; padding:8px; }
      .visual-readonly-content pre { max-height:none; overflow:auto; }
      .visual-readonly-callout { border-left:4px solid var(--alert-border,#3b82f6)!important; background:var(--alert-bg,#eff6ff)!important; padding:12px; }
      .visual-readonly-callout > strong { color:inherit; display:block; margin-bottom:8px; }
      .visual-readonly-caption { margin-top:8px; color:#71717a; font-size:11px; }
      .visual-document-surface .ProseMirror-selectednode { outline:2px solid #93c5fd; }
    `}</style>
  </section>;
}
