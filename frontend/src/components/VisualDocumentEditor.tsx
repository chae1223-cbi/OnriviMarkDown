/**
 * 프로그램명 : OnriviAuthor 
 * 버전 정보 : 1.0.1
 * 프로그램 ID : oaar-visual-editor
 * 🚨 @PATCH : **2026-10-14** — [수식 옆 글쓰기(공백 보장) 및 블록 수식 다음 줄 즉각 집필 환경 지원]:
 *             1) visual_inline_math 삽입 시 후행 공백 텍스트 노드를 함께 생성하고 커서를 그 뒤로 이동시켜 인라인 수식 바로 옆에 끊김 없이 글쓰기 보장
 *             2) visual_math 블록 수식 삽입 시 바로 다음 줄에 신규 본문 문단(paragraph)을 자동 생성하고 커서를 배치하여 블록 수식 아래 즉각 집필 지원
 *             3) visual_math 및 visual_inline_math 전용 nodeView를 등록하여 수식을 코드블록/텍스트가 아닌 순수 KaTeX 렌더링으로 본문에 표시
 *             4) 블록 및 인라인 수식 더블클릭 시 수식 에디터 모달(FormulaModal)을 각각 블록/인라인 모드로 호출하여 LaTeX 즉시 수정 및 상호 전환 반영
 * 🚨 @PATCH : **2026-10-13** — [전용 인터랙티브 달력 모달(CalendarModal) 연동 및 위지윅 본문 날짜/시간 직접 삽입]:
 *             1) 슬래시 명령어(/now, /날짜, /달력) 및 툴바 날짜 커맨드 실행 시 전용 CalendarModal 대화상자 팝업 연동
 *             2) 달력에서 선택한 일자 및 서식을 현재 ProseMirror 위지윅 커서 위치에 즉시 텍스트 노드로 삽입
 * 🚨 @PATCH : **2026-10-13** — [문서링크(taglink) 커서 위치 문서선택창 호출 및 문서링크 클릭 시 해당 페이지 이동 구현]:
 *             1) onDocLinkDialog prop을 통해 문서보기 내 커서 위치(view.coordsAtPos)에 문서선택창(DocLinkPicker) 팝업 연동
 *             2) 문서 선택 시 커서 위치에 [문서명](<상대경로.md>) 네이티브 링크 마크 즉시 삽입 지원
 *             3) 본문 속 문서링크(.md, .markdown, knowledge:// 등) 클릭 시 onFileOpen(handleFileOpenByPath)을 호출하여 해당 문서/탭으로 즉각 전환 이동 완비
 * 🚨 @PATCH : **2026-10-13** — [문서보기 본문 하이퍼링크(<a>) 클릭 시 외부 브라우저 새 창 열기 연동]:
 *             1) EditorProps에 handleClick 핸들러를 장착하여 본문 내 링크 클릭 시 Electron(openExternal)/웹(window.open) 새 창으로 즉시 이동
 *             2) 내부 앵커(#제목) 링크 클릭 시 해당 섹션으로 부드러운 스크롤(scrollIntoView) 이동 지원
 *             3) .visual-document-surface a에 color(#1d4ed8), 밑줄 및 cursor:pointer 스타일을 부여하여 링크 식별성 및 호버 인터랙션 강화
 * 🚨 @PATCH : **2026-10-13** — [슬래시(/) 명령어 감지 및 실행 장애 완전 해소]:
 *             1) 줄바꿈(<br> hard_break) 바로 뒤에서 / 입력 시 textBetween의 leafText 누락으로 앞 글자와 결합되어 매칭이 실패하던 결함 완전 수정
 *             2) nativeCommands['h1'~'h6']에 setHeadingBlock을 연결하여 슬래시 메뉴에서 제목 명령 정상 전환 보장
 *             3) slashPattern에 전각 슬래시(／) 관용 지원 및 화면 하단 팝업 배치(spaceBelow) 클리핑 방어 완비
 * 🚨 @PATCH : **2026-10-13** — [하이퍼링크 전용 LinkModal 모달 폼 연동 및 텍스트·URL 2단 입력 지원]:
 *             1) window.prompt 대신 텍스트(예: 온리비)와 주소(URL)를 직관적으로 입력하는 LinkModal 모달 폼 전면 연동
 *             2) 선택 텍스트가 없는 상태에서도 모달에서 텍스트와 주소를 직접 지정하여 커서 위치에 즉시 하이퍼링크 생성 지원
 *             3) Ctrl+K 단축키, 플로팅 툴바(🔗), 상단 컨트롤(link)에서 LinkModal 즉시 호출 및 프로토콜 프리셋 지원
 * 🚨 @PATCH : **2026-10-13** — [고시인성 3px 도톰한 단일 커서 최적화 및 네이티브 커서 2중 중복 방어]:
 *             1) .visual-document-surface의 caret-color를 transparent로 지정하여 네이티브 1px 얇은 커서와의 2중 커서 중복을 완전 차단
 *             2) visualCaret 고도화와 연동하여 눈이 편안한 3px 코발트 블루 단일 커서 및 깜빡임 애니메이션 제공
 * 🚨 @PATCH : **2026-10-13** — [문서보기 링크 입력 지원 강화 및 Ctrl+K 단축키 연동]:
 *             1) keymap에 'Mod-k' 바인딩 추가하여 선택 텍스트에 즉각 하이퍼링크 주소 입력 팝업 연동
 *             2) visualMarkdownInputRules와 연동되어 본문에서 [텍스트](url) 타이핑 및 Ctrl+K 단축키로 직접 링크 작성 완비
 * 🚨 @PATCH : **2026-10-13** — [밑줄(<u>) 네이티브 인라인 마크(underline) 연동 및 위지윅 본문 직접 편집 지원]:
 *             1) visualSchema.marks.underline 등록에 맞춰 commands['UNDERLINE'], nativeCommands['underline'], keymap('Mod-u') 연동
 *             2) 밑줄 서식 적용 시 별도 source_block(원문 편집창)으로 빠지지 않고 에디터 표면에서 즉시 밑줄 렌더링 및 직접 타이핑/수정 가능
 * 🚨 @PATCH : **2026-10-13** — [제목 1~6 서식 명령 적용 시 앞머리 잔여 해시(#) 기호 자동 정돈 및 제목2 정상 전환 보장]:
 *             1) 툴바/슬래시 커맨드의 '제목 1~6'(H1~H6) 실행 시 텍스트 앞머리에 잘못 남아있던 마크다운 해시 접두사(^(?:#{1,6}\s*))를 자동 정리(setHeadingBlock)
 *             2) 사용자가 기존 문단에서 오타나 이전 변환으로 '# #2장'처럼 해시가 본문에 박힌 경우에도 제목 2 클릭 시 정상적인 H2 제목으로 변환 보장
 */
'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Fragment } from 'prosemirror-model';
import { createPortal } from 'react-dom';
import TableModal from '@/components/TableModal';
import LinkModal from '@/components/LinkModal';
import CalendarModal from '@/components/CalendarModal';
import DateTimeInsertPicker from '@/components/DateTimeInsertPicker';
import { selectedList } from '@/lib/visualListCommands';
import { tableContext, tableAction, moveTableCell, tableEnter } from '@/lib/visualTableCommands';
import VisualReadOnlyMarkdownBlock from '@/components/VisualReadOnlyMarkdownBlock';
import { EditorState, TextSelection, Command } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { mediaDetails, copyMediaSource, type MediaKind } from '@/lib/mediaMarkup';
import { desktopClipboardImage } from '@/lib/desktopClipboard';
import { markdownPasteTransaction } from '@/lib/visualMarkdownPaste';
import { baseKeymap, chainCommands, exitCode, lift, setBlockType, toggleMark, wrapIn } from 'prosemirror-commands';
import { splitListItem, sinkListItem, liftListItem } from 'prosemirror-schema-list';
import { history, undo, redo, closeHistory } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { createVisualDocumentCodec, visualSchema, visualImageDetails } from '@/lib/visualDocumentCodec';
import { visualMarkdownInputRules } from '@/lib/visualMarkdownInputRules';
import { undoInputRule } from 'prosemirror-inputrules';
import { visualCommandCatalog, filterVisualCommands } from '@/lib/visualCommandCatalog';
import { TOOLBAR_ITEMS, configuredHotkeyItem } from '@/lib/toolbarConfig';
import { installVisualCaret } from '@/lib/visualCaret';
import katex from 'katex';

const slashPattern = new RegExp('(?:^|\\s)([\\/／][\\p{L}\\p{N}_-]*)$', 'u');

const setHeadingBlock = (level: number): Command => (state, dispatch, view) => {
  const { $from, $to } = state.selection;
  if (!$from.sameParent($to) || !$from.parent.isTextblock) {
    return setBlockType(visualSchema.nodes.heading, { level })(state, dispatch, view);
  }
  if (!dispatch) return true;
  let tr = state.tr;
  const parent = $from.parent;
  const blockStart = $from.start();
  const text = parent.textContent;
  const hashMatch = text.match(/^(#{1,6}\s*)/);
  if (hashMatch) {
    tr = tr.delete(blockStart, blockStart + hashMatch[1].length);
  }
  const from = tr.mapping.map($from.pos);
  const to = tr.mapping.map($to.pos);
  tr = tr.setBlockType(from, to, visualSchema.nodes.heading, { level });
  dispatch(tr.scrollIntoView());
  return true;
};

// Always consume Tab in the document so browser focus cannot jump to controls.
const removeHeadingAtStart:Command=(state,dispatch)=>{
  const position=state.selection.$from;
  if(!state.selection.empty || position.parent.type!==visualSchema.nodes.heading || position.parentOffset!==0)return false;
  if(dispatch)dispatch(closeHistory(state.tr.setBlockType(position.before(),position.after(),visualSchema.nodes.paragraph).setStoredMarks([])));
  return true;
};
const exitQuote=(emptyOnly=false):Command=>(state,dispatch)=>{
  const position=state.selection.$from;
  if(!state.selection.empty)return false;
  let depth=0;for(let i=1;i<position.depth;i++)if(position.node(i).type===visualSchema.nodes.blockquote){depth=i;break;}
  if(!depth)return false;
  const quote=position.node(depth),start=position.before(depth),end=start+quote.nodeSize;
  const trailingBreak=position.parentOffset===position.parent.content.size && position.parent.lastChild?.type===visualSchema.nodes.hard_break;
  const emptyLast=position.depth===depth+1 && position.parent.type===visualSchema.nodes.paragraph && (!position.parent.content.size || trailingBreak) && position.index(depth)===quote.childCount-1;
  if(emptyOnly && !emptyLast)return false;
  if(dispatch){
    let tr=state.tr;
    if(emptyOnly && quote.childCount===1 && !position.parent.content.size){tr=tr.replaceWith(start,end,visualSchema.nodes.paragraph.create());tr=tr.setSelection(TextSelection.create(tr.doc,start+1));}
    else {
      if(emptyOnly)tr=trailingBreak ? tr.delete(position.pos-1,position.pos) : tr.delete(position.before(),position.after());
      const after=tr.mapping.map(end,-1),following=tr.doc.nodeAt(after);
      if(following?.type!==visualSchema.nodes.paragraph)tr=tr.insert(after,visualSchema.nodes.paragraph.create());
      tr=tr.setSelection(TextSelection.create(tr.doc,after+1));
    }
    dispatch(closeHistory(tr).scrollIntoView());
  }
  return true;
};
const makeChecklist=selectedList('check');
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
  const before=$from.parent.textBetween(0,$from.parentOffset,'\n','\n');
  if(!backward){
    const gap=size;
    const spaces=' '.repeat(gap);
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

function resolveDocPath(relPath: string, currentFile: string): string {
  if (!relPath || relPath.startsWith('http://') || relPath.startsWith('https://')) return relPath;
  let normRel = relPath.replace(/\\/g, '/');
  if (normRel.startsWith('file:///')) normRel = normRel.replace(/^file:\/\/\//, '');
  if (/^[a-zA-Z]:\//.test(normRel) || normRel.startsWith('/')) return normRel;
  const normCurrent = currentFile.replace(/\\/g, '/');
  const lastSlash = normCurrent.lastIndexOf('/');
  const baseFolder = lastSlash !== -1 ? normCurrent.substring(0, lastSlash) : '';
  if (normRel.startsWith('./')) normRel = normRel.substring(2);
  const segments = (baseFolder ? baseFolder.split('/') : []).concat(normRel.split('/'));
  const resolvedSegments: string[] = [];
  for (const seg of segments) {
    if (seg === '.' || seg === '') continue;
    if (seg === '..') {
      if (resolvedSegments.length) resolvedSegments.pop();
    } else {
      resolvedSegments.push(seg);
    }
  }
  return resolvedSegments.join('/');
}

type Codec = ReturnType<typeof createVisualDocumentCodec>;
const sessions = new Map<string, { source: string; state: EditorState; codec: Codec; scrollTop?:number; scrollLeft?:number }>();
type Props = { content: string; onChange: (markdown: string) => void; readOnly?: boolean;
  onSourceScroll?: (offset:number)=>void;
  tabSize?:number;
  onSourceCursor?: (offset:number,reveal?:boolean)=>void;
  documentId?: string; commandRef?: React.MutableRefObject<((command: string) => boolean) | null>;
  customHotkeys?: Record<string, string>;
  customCommands?: Record<string, string>;
  onFloatingToolbar?: (visible: boolean, position: { top: number; left: number }) => void;
  floatingToolbarVisible?: boolean;
  renderImage?: (source: string) => React.ReactNode;
  onImageFile?: (file: Blob) => Promise<string | null>;
  onMediaDialog?: (kind: MediaKind, source: string | null, insert: (code: string) => boolean) => void;
  onImageDialog?: (source: string | null, insert: (path: string, alt: string) => boolean) => void;
  onDocLinkDialog?: (position: { top: number; left: number }, insert: (targetUrl: string, displayTitle: string) => boolean) => void;
  onFormulaDialog?: (apply: (formula: string) => boolean | void, initialLatex?: string) => void;
  currentFilePath?: string;
  onFileOpen?: (filePath: string, heading?: string) => void;
  onSourceAction?: (id: string, source: string, from: number, to: number) => void };

export default function VisualDocumentEditor({ content, onChange, readOnly = false, tabSize=4, onSourceScroll, onSourceCursor, documentId, commandRef, customCommands = {}, customHotkeys = {}, onSourceAction, onFloatingToolbar, floatingToolbarVisible, renderImage, onImageFile, onImageDialog, onMediaDialog, onDocLinkDialog, onFormulaDialog, currentFilePath, onFileOpen }: Props) {
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
  const onFileOpenRef = useRef(onFileOpen);
  onFileOpenRef.current = onFileOpen;
  const currentFilePathRef = useRef(currentFilePath);
  currentFilePathRef.current = currentFilePath;
  const images = useRef({ renderImage, onImageFile, onImageDialog, onMediaDialog, onDocLinkDialog, onFormulaDialog });
  images.current = { renderImage, onImageFile, onImageDialog, onMediaDialog, onDocLinkDialog, onFormulaDialog };
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
  const [linkDialog, setLinkDialog] = useState(false);
  const [calendarDialog, setCalendarDialog] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [datePickerPos, setDatePickerPos] = useState({ top: 0, left: 0 });
  const dateTargetRef = useRef<{ from: number; to: number; valid: boolean } | null>(null);
  const openDatePickerRef = useRef<(removeSlash?: boolean) => void>(() => {});
  const [linkDialogData, setLinkDialogData] = useState({ text: '', href: 'https://' });
  const linkTargetRef = useRef<{ from: number; to: number; valid: boolean } | null>(null);
  const linkCommandRef = useRef<Command>(() => false);
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

  useLayoutEffect(() => {
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
        Backspace: chainCommands(removeHeadingAtStart, undoInputRule, baseKeymap.Backspace),
        'Mod-u': toggleMark(visualSchema.marks.underline),
        'Mod-k': (state, dispatch) => linkCommandRef.current(state, dispatch),
        ArrowDown:(state,dispatch,currentView)=>{
          if(!state.selection.empty || !currentView?.endOfTextblock('down'))return false;
          const table=tableContext(state);
          if(table && table.row===table.table.childCount-1)return tableAction('afterTable')(state,dispatch,currentView);
          if(state.selection.$from.parent.type===visualSchema.nodes.code_block && state.selection.$from.parentOffset===state.selection.$from.parent.content.size)return exitCode(state,dispatch,currentView);
          return false;
        },
        'Mod-Enter': chainCommands(tableAction('afterTable'),exitCode,exitQuote()),
        Enter: chainCommands(tableEnter(), (state,dispatch)=>{const position=state.selection.$from;if(position.parent.type!==visualSchema.nodes.paragraph)return false;let quoted=false;for(let i=1;i<position.depth;i++)if(position.node(i).type===visualSchema.nodes.blockquote)quoted=true;if(!quoted)return false;if(dispatch)dispatch(state.tr.replaceSelectionWith(visualSchema.nodes.hard_break.create()).scrollIntoView());return true;}, (state,dispatch)=>{const position=state.selection.$from;if(position.parent.type!==visualSchema.nodes.paragraph || position.depth!==1)return false;if(dispatch)dispatch(state.tr.replaceSelectionWith(visualSchema.nodes.hard_break.create()).scrollIntoView());return true;}, (state,dispatch,currentView)=>{const parent=state.selection.$from.depth>0?state.selection.$from.node(state.selection.$from.depth-1):null;return splitListItem(visualSchema.nodes.list_item,parent?.type===visualSchema.nodes.list_item && parent.attrs.checked!==null ? {checked:false} : undefined)(state,dispatch,currentView);}, baseKeymap.Enter),
        Tab: chainCommands(moveTableCell(),sinkListItem(visualSchema.nodes.list_item),indentDocument()), 'Shift-Tab': chainCommands(moveTableCell(true),liftListItem(visualSchema.nodes.list_item),indentDocument(true)),
      }), keymap(baseKeymap)] }),
      editable: () => !readOnly,
      attributes: { class: 'visual-document-surface', 'aria-label': '문서 직접 편집', role: 'textbox', 'aria-multiline': 'true', 'data-editor-tab-size': String(tabSize) },
      nodeViews: { visual_image:mediaNodeView, visual_media:mediaNodeView,
        visual_math(node, currentView, getPos) {
          const dom = document.createElement('div');
          dom.className = 'visual-math-node my-4 py-3 px-4 text-center cursor-pointer select-none rounded-lg hover:ring-2 hover:ring-blue-500/40 transition-all';
          dom.contentEditable = 'false';
          dom.setAttribute('data-latex', node.attrs.latex || '');
          dom.setAttribute('title', '더블클릭하여 수식 에디터 열기');

          const render = () => {
            const cleanLatex = (node.attrs.latex || '').trim();
            try {
              dom.innerHTML = '';
              if (katex) {
                katex.render(cleanLatex || 'f(x) = x^2', dom, {
                  throwOnError: false,
                  displayMode: true,
                  strict: false
                });
              } else {
                dom.textContent = cleanLatex || '수식';
              }
            } catch {
              dom.textContent = cleanLatex;
            }
          };

          render();

          dom.addEventListener('dblclick', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const pos = getPos();
            if (typeof pos !== 'number' || !currentView.editable) return;
            if (images.current.onFormulaDialog) {
              images.current.onFormulaDialog((formulaCode: string) => {
                const cleanCode = formulaCode.trim();
                const isInline = cleanCode.startsWith('$') && !cleanCode.startsWith('$$');
                const rawLatex = cleanCode.startsWith('$$')
                  ? cleanCode.replace(/^\$\$|\$\$$/g, '').trim()
                  : cleanCode.startsWith('$')
                    ? cleanCode.replace(/^\$|\$$/g, '').trim()
                    : cleanCode.startsWith('```')
                      ? cleanCode.replace(/^```[a-z]*\r?\n|```$/gi, '').trim()
                      : cleanCode;
                if (isInline) {
                  currentView.dispatch(currentView.state.tr.replaceWith(pos, pos + 1, visualSchema.nodes.visual_inline_math.create({ latex: rawLatex })));
                } else {
                  currentView.dispatch(currentView.state.tr.setNodeMarkup(pos, undefined, { latex: rawLatex }));
                }
                return true;
              }, `\n$$\n${node.attrs.latex}\n$$\n`);
            }
          });

          return {
            dom,
            selectNode() { dom.classList.add('ring-2', 'ring-blue-500'); },
            deselectNode() { dom.classList.remove('ring-2', 'ring-blue-500'); },
            ignoreMutation: () => true,
            stopEvent: () => false,
            update(next) {
              if (next.type !== node.type) return false;
              if (next.attrs.latex !== node.attrs.latex) {
                node = next;
                render();
              } else {
                node = next;
              }
              return true;
            }
          };
        },
        visual_inline_math(node, currentView, getPos) {
          const dom = document.createElement('span');
          dom.className = 'visual-inline-math-node inline-flex items-center px-1 py-0.5 mx-0.5 align-baseline cursor-pointer select-none rounded hover:ring-2 hover:ring-blue-400/40 transition-all text-zinc-900 dark:text-zinc-100';
          dom.contentEditable = 'false';
          dom.setAttribute('data-latex', node.attrs.latex || '');
          dom.setAttribute('title', '더블클릭하여 인라인 수식 편집');

          const render = () => {
            const cleanLatex = (node.attrs.latex || '').trim();
            try {
              dom.innerHTML = '';
              if (katex) {
                katex.render(cleanLatex || 'x', dom, {
                  throwOnError: false,
                  displayMode: false,
                  strict: false
                });
              } else {
                dom.textContent = `$${cleanLatex}$`;
              }
            } catch {
              dom.textContent = `$${cleanLatex}$`;
            }
          };

          render();

          dom.addEventListener('dblclick', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const pos = getPos();
            if (typeof pos !== 'number' || !currentView.editable) return;
            if (images.current.onFormulaDialog) {
              images.current.onFormulaDialog((formulaCode: string) => {
                const cleanCode = formulaCode.trim();
                const isInline = cleanCode.startsWith('$') && !cleanCode.startsWith('$$');
                const rawLatex = cleanCode.startsWith('$$')
                  ? cleanCode.replace(/^\$\$|\$\$$/g, '').trim()
                  : cleanCode.startsWith('$')
                    ? cleanCode.replace(/^\$|\$$/g, '').trim()
                    : cleanCode.startsWith('```')
                      ? cleanCode.replace(/^```[a-z]*\r?\n|```$/gi, '').trim()
                      : cleanCode;
                if (isInline) {
                  currentView.dispatch(currentView.state.tr.setNodeMarkup(pos, undefined, { latex: rawLatex }));
                } else {
                  currentView.dispatch(currentView.state.tr.replaceWith(pos, pos + 1, visualSchema.nodes.visual_math.create({ latex: rawLatex })));
                }
                return true;
              }, `$${node.attrs.latex}$`);
            }
          });

          return {
            dom,
            selectNode() { dom.classList.add('ring-2', 'ring-blue-500'); },
            deselectNode() { dom.classList.remove('ring-2', 'ring-blue-500'); },
            ignoreMutation: () => true,
            stopEvent: () => false,
            update(next) {
              if (next.type !== node.type) return false;
              if (next.attrs.latex !== node.attrs.latex) {
                node = next;
                render();
              } else {
                node = next;
              }
              return true;
            }
          };
        },
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
          const header=document.createElement('div'); header.contentEditable='false'; header.className='visual-code-language no-print';
          header.textContent='CODE ';
          const input=document.createElement('input'); input.setAttribute('aria-label','코드 블록 언어');input.placeholder='text, javascript, python, mermaid';input.value=node.attrs.params || '';input.disabled=!currentView.editable;
          input.addEventListener('change',()=>{
            const pos=getPos();if(typeof pos!=='number' || !currentView.editable)return;
            currentView.dispatch(closeHistory(currentView.state.tr.setNodeMarkup(pos,undefined,{...node.attrs,params:input.value.replace(/[\r\n]/g,'').trim()})));
          });header.append(input);
          const copy=document.createElement('button');copy.type='button';copy.textContent='복사';copy.setAttribute('aria-label','코드 내용 복사');copy.className='onrivi-media-control no-print';copy.contentEditable='false';
          let copyTimer:ReturnType<typeof setTimeout>|undefined;
          copy.addEventListener('mousedown',event=>event.preventDefault());
          copy.addEventListener('click',async()=>{
            clearTimeout(copyTimer);
            try {
              const api=(window as any).electronAPI;
              if(api?.copyTextToClipboard)await api.copyTextToClipboard(node.textContent);
              else await navigator.clipboard.writeText(node.textContent);
              copy.textContent='복사됨';
            } catch { copy.textContent='복사 실패'; }
            if(dom.isConnected)copyTimer=setTimeout(()=>{copy.textContent='복사';},1800);
          });header.append(copy);
          const pre = document.createElement('pre'), code = document.createElement('code');
          pre.className = 'custom-scrollbar'; pre.spellcheck = false; code.spellcheck = false;
          const panel=document.createElement('details');panel.className='visual-code-editor-panel';
          const initialLang = String(node.attrs.params || '').split(/\s/)[0].toLowerCase();
          const isInitialMermaid = initialLang === 'mermaid';
          panel.open = !isInitialMermaid || !node.textContent;
          const summary=document.createElement('summary');summary.contentEditable='false';summary.textContent='코드 편집';summary.className='onrivi-media-control no-print text-[11px] opacity-70 hover:opacity-100';
          const done=document.createElement('button');done.type='button';done.textContent='편집 완료';done.className='onrivi-media-control no-print text-[11px]';done.contentEditable='false';
          done.addEventListener('mousedown',event=>event.preventDefault());done.addEventListener('click',()=>{panel.open=false;});header.append(done);
          panel.append(summary,header,pre);
          const preview=document.createElement('div'); preview.contentEditable='false';
          preview.className = 'visual-mermaid-preview';
          const id=++imageSequence.current;
          let renderedSource:string|null=null;let renderTimer:ReturnType<typeof setTimeout>|undefined;
          let previousSpecial = isInitialMermaid;
          const render=()=>{
            const lang = String(node.attrs.params || '').split(/\s/)[0].toLowerCase();
            const mermaid = lang === 'mermaid';
            preview.hidden = !mermaid;
            summary.hidden = !mermaid;
            done.hidden = !mermaid;
            if(!mermaid) panel.open = true;
            else if(!previousSpecial && node.textContent) panel.open = false;
            previousSpecial = mermaid;
            const source = mermaid ? '```mermaid\n' + node.textContent + '\n```' : null;
            if(source===renderedSource)return;
            renderedSource=source;
            clearTimeout(renderTimer);
            if(source && node.textContent.trim())renderTimer=setTimeout(()=>setImageMounts(previous=>[...previous.filter(item=>item.id!==id),{id,element:preview,source}]),180);
            else setImageMounts(previous=>previous.filter(item=>item.id!==id));
          };
          pre.appendChild(code); dom.append(panel,preview);render();
          return { dom, contentDOM: code, stopEvent:event=>header.contains(event.target as Node) || event.target===summary,
            ignoreMutation:mutation=>mutation.type!=='selection' && !code.contains(mutation.target) && mutation.target!==code,
            update(next) {if(next.type!==node.type)return false;node=next;if(document.activeElement!==input)input.value=node.attrs.params || '';render();return true;},
            destroy(){clearTimeout(renderTimer);clearTimeout(copyTimer);queueMicrotask(()=>{if(viewRef.current)setImageMounts(previous=>previous.filter(item=>item.id!==id));});} };
        },
        source_block(node, currentView, getPos) {
          const dom = document.createElement('div');dom.contentEditable = 'false';dom.className = 'visual-source-block';
          const picture=document.createElement('div');const id=++imageSequence.current;
          const details=document.createElement('details');details.className='no-print';
          const summary=document.createElement('summary');summary.textContent='편집';
          const input=document.createElement('textarea');input.setAttribute('aria-label','블록 원문');input.value=node.attrs.source;input.rows=8;input.style.width='100%';input.disabled=!currentView.editable;
          const apply=document.createElement('button');apply.type='button';apply.textContent='적용';apply.disabled=!currentView.editable;
          let sourceTimer:ReturnType<typeof setTimeout>|undefined;
          input.addEventListener('input',()=>{
            clearTimeout(sourceTimer);
            if(!/^\s*```mermaid(?:\s|$)/i.test(input.value))return;
            sourceTimer=setTimeout(()=>{
              const pos=getPos();if(typeof pos!=='number' || !currentView.editable || !dom.isConnected)return;
              if(currentView.state.doc.nodeAt(pos)?.type!==node.type)return;
              if(input.value!==node.attrs.source)currentView.dispatch(currentView.state.tr.setNodeMarkup(pos,undefined,{source:input.value}));
            },250);
          });

          apply.addEventListener('click',()=>{const pos=getPos();if(typeof pos==='number' && currentView.editable){currentView.dispatch(closeHistory(currentView.state.tr.setNodeMarkup(pos,undefined,{source:input.value})));details.open=false;}});
          details.append(summary,input,apply);dom.append(picture,details);
          const render=()=>setImageMounts(previous=>[...previous.filter(item=>item.id!==id),{id,element:picture,source:node.attrs.source}]);render();
          return {dom,ignoreMutation:()=>true,stopEvent:event=>details.contains(event.target as Node),
            update(next){if(next.type!==node.type)return false;if(next.attrs.source!==node.attrs.source){node=next;if(document.activeElement!==input || input.value!==node.attrs.source)input.value=node.attrs.source;render();}return true;},
            destroy(){clearTimeout(sourceTimer);queueMicrotask(()=>{if(viewRef.current)setImageMounts(previous=>previous.filter(item=>item.id!==id));});}};
        },
      },
      dispatchTransaction(transaction) {
        imageTargets.current.forEach(target => {
          const from = transaction.mapping.mapResult(target.from, 1);
          const to = transaction.mapping.mapResult(target.to, -1);
          if (target.source && (from.deleted || to.deleted)) target.valid = false;
          target.from = from.pos; target.to = Math.max(from.pos, to.pos);
        });
        const viewport=host.current?.closest('.custom-preview-container') as HTMLElement|null;
        const topBefore=viewport?.scrollTop;
        view.updateState(view.state.apply(transaction));
        if(transaction.docChanged && viewport && topBefore!==undefined && viewport.scrollTop!==topBefore){
          try{const bounds=viewport.getBoundingClientRect(),caret=view.coordsAtPos(view.state.selection.head);
            if(caret.top>=bounds.top+8 && caret.bottom<=bounds.bottom-8)viewport.scrollTop=topBefore;
          }catch{/* Let ProseMirror scroll when the caret is outside the viewport. */}
        }
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
        const markNames = ['strong', 'em', 'code', 'link', 'strike', 'underline'];
        const currentMarks = markNames.filter(name => empty
          ? (view.state.storedMarks ?? $from.marks()).some(mark => mark.type.name === name)
          : view.state.doc.rangeHasMark(from, to, visualSchema.marks[name]));
        setActiveMarks(previous => previous.join(',') === currentMarks.join(',') ? previous : currentMarks);
        const before = $from.parent.isTextblock && $from.parent.type !== visualSchema.nodes.code_block
          ? $from.parent.textBetween(Math.max(0, $from.parentOffset - 100), $from.parentOffset, '\n', '\n') : '';
        const match = before.match(slashPattern);
        slashRange.current = empty && match ? { from: from - match[1].length, to } : null;
        setSlash(Boolean(slashRange.current));
        setQuery(match?.[1].slice(1).toLowerCase() || '');
        menuIndexRef.current = 0; setMenuIndex(0);
        if (!empty || slashRange.current) {
          const rect = view.coordsAtPos(from);
          const spaceBelow = window.innerHeight - rect.bottom;
          const top = empty
            ? (spaceBelow < 260 && rect.top > 260 ? Math.max(8, rect.top - 240) : Math.max(8, Math.min(window.innerHeight - 150, rect.bottom + 6)))
            : Math.max(8, Math.min(window.innerHeight - 150, rect.top - 48));
          setPopup({ top, left: Math.max(8, Math.min(window.innerWidth - 360, rect.left)) });
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
              if(offset>=0)cursorCallback.current?.(offset,false);
            });
          }
        }
      },
      handleKeyDown(currentView, event) {
        if (!currentView.editable || event.isComposing) return false;
        if(event.key==='Tab' || event.key==='Backspace')synchronizeTextSelection(currentView);
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
          const before = $from.parent.isTextblock ? $from.parent.textBetween(0, $from.parentOffset, '\n', '\n') : '';
          const match = before.match(slashPattern);
          const rect = currentView.coordsAtPos(from);
          const slashCommand = empty && Boolean(match);
          const spaceBelow = window.innerHeight - rect.bottom;
          const top = slashCommand
            ? (spaceBelow < 260 && rect.top > 260 ? Math.max(8, rect.top - 240) : Math.max(8, Math.min(window.innerHeight - 150, rect.bottom + 6)))
            : Math.max(8, Math.min(window.innerHeight - 150, rect.top - 48));
          setPopup({ top, left: Math.max(8, Math.min(window.innerWidth - 360, rect.left)) });
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
      handleClick(currentView, pos, event) {
        const anchor = (event.target as HTMLElement | null)?.closest?.('a');
        let href = anchor?.getAttribute('href') || '';
        if (!href) {
          const mark = currentView.state.doc.resolve(pos).marks().find(m => m.type === visualSchema.marks.link);
          if (mark?.attrs?.href) href = mark.attrs.href;
        }
        href = href.trim();
        if (!href) return false;

        if (href.startsWith('<') && href.endsWith('>')) {
          href = href.slice(1, -1).trim();
        }
        href = href.replace(/^[<"']|[>"']$/g, '').trim();

        if (href.startsWith('#') || href.startsWith('.#')) {
          const rawId = href.startsWith('.#') ? href.slice(2) : href.slice(1);
          const targetId = decodeURIComponent(rawId);
          const targetEl = document.getElementById(targetId) || Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).find(h => (h.textContent?.trim() || '').normalize('NFC') === targetId.normalize('NFC'));
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            event.preventDefault();
            return true;
          }
        }

        const isMdFile = href.endsWith('.md') || href.endsWith('.markdown') || href.includes('.md#') || href.includes('.markdown#');
        const isKnowledgeLink = href.startsWith('knowledge://');
        const isRelativeDoc = !/^(https?:|mailto:|tel:)/i.test(href) && (isMdFile || isKnowledgeLink || href.includes('.md'));

        if (isRelativeDoc && onFileOpenRef.current) {
          event.preventDefault();
          event.stopPropagation();
          const cleanHref = href.split('#')[0].replace(/^[<"']|[>"']$/g, '').trim();
          const hashPart = href.includes('#') ? href.split('#')[1].replace(/^[<"']|[>"']$/g, '').trim() : undefined;

          let resolved = cleanHref;
          if (cleanHref.startsWith('file:///')) {
            resolved = decodeURIComponent(cleanHref.replace(/^file:\/\/\//, ''));
          } else if (currentFilePathRef.current) {
            resolved = resolveDocPath(cleanHref, currentFilePathRef.current);
          }
          onFileOpenRef.current(resolved, hashPart);
          return true;
        }

        let targetUrl = href;
        if (targetUrl.startsWith('www.')) targetUrl = `https://${targetUrl}`;
        const api = typeof window !== 'undefined' ? (window as any).electronAPI : null;
        if (api?.openExternal && (targetUrl.startsWith('http://') || targetUrl.startsWith('https://') || targetUrl.startsWith('mailto:') || targetUrl.startsWith('tel:'))) {
          event.preventDefault();
          api.openExternal(targetUrl);
          return true;
        } else if (api?.openPath && (targetUrl.startsWith('file:///') || /^[a-zA-Z]:[/\\]/.test(targetUrl))) {
          event.preventDefault();
          const cleanLocalPath = targetUrl.startsWith('file:///') ? decodeURIComponent(targetUrl.replace(/^file:\/\/\//, '')) : targetUrl;
          api.openPath(cleanLocalPath);
          return true;
        } else if (/^(https?:|mailto:|tel:)/i.test(targetUrl) || targetUrl.startsWith('www.')) {
          event.preventDefault();
          window.open(targetUrl, '_blank', 'noopener,noreferrer');
          return true;
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
    const scrollContainer=host.current.closest('.custom-preview-container') as HTMLElement|null;
    if(scrollContainer){scrollContainer.scrollTop=cached?.source===content ? cached.scrollTop || 0 : 0;scrollContainer.scrollLeft=cached?.source===content ? cached.scrollLeft || 0 : 0;}
    // Codec belongs to this editor instance, keeping unchanged source node bytes.
    (view as EditorView & { replaceSource?: (source: string) => void }).replaceSource = source => {
      imageTargets.current.forEach(target => { target.valid = false; });
      const top=scrollContainer?.scrollTop,left=scrollContainer?.scrollLeft;
      const nextCodec=createVisualDocumentCodec(source);
      const oldDoc=view.state.doc;
      if(oldDoc.content.eq(nextCodec.doc.content)){
        const mapped=new Map<import('prosemirror-model').Node,string>();
        oldDoc.forEach((node,_offset,index)=>{const raw=nextCodec.originalSource(nextCodec.doc.child(index));if(raw!==undefined)mapped.set(node,raw);});
        nextCodec.adopt({doc:oldDoc,originalSource:node=>mapped.get(node)});
        if(oldDoc.attrs.frontmatter!==nextCodec.doc.attrs.frontmatter)view.updateState(view.state.apply(view.state.tr.setDocAttribute('frontmatter',nextCodec.doc.attrs.frontmatter).setMeta('addToHistory',false)));
      } else {
        const from=oldDoc.content.findDiffStart(nextCodec.doc.content);
        const end=oldDoc.content.findDiffEnd(nextCodec.doc.content);
        let tr=view.state.tr;
        if(from!==null && end){const overlap=from-Math.min(end.a,end.b);const oldEnd=end.a+Math.max(0,overlap),newEnd=end.b+Math.max(0,overlap);tr=tr.replace(from,oldEnd,nextCodec.doc.slice(from,newEnd));}
        tr=tr.setDocAttribute('frontmatter',nextCodec.doc.attrs.frontmatter).setMeta('addToHistory',false);
        view.updateState(view.state.apply(tr));
        const preserved=new Map<import('prosemirror-model').Node,string>();
        view.state.doc.forEach((node,_offset,index)=>{const matching=nextCodec.doc.maybeChild(index);if(matching?.eq(node)){const raw=nextCodec.originalSource(matching);if(raw!==undefined)preserved.set(node,raw);}});
        nextCodec.adopt({doc:view.state.doc,originalSource:node=>preserved.get(node)});
      }
      codec=nextCodec;codecRef.current=codec;emitted.current=source;
      if(scrollContainer && top!==undefined){scrollContainer.scrollTop=top;scrollContainer.scrollLeft=left || 0;}
      setInTable(Boolean(tableContext(view.state)));
      setActiveMarks(view.state.selection.$from.marks().map(mark=>mark.type.name));
      caretRef.current?.schedule();
      manualFloatingRef.current = false;
      setSlash(false); setSelection(false);
    };
    return () => {
      if (documentId) {
        sessions.set(documentId, { source: emitted.current, state: view.state, codec,scrollTop:scrollContainer?.scrollTop,scrollLeft:scrollContainer?.scrollLeft });
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
    ['제목 1', setHeadingBlock(1)],
    ['제목 2', setHeadingBlock(2)],
    ['제목 3', setHeadingBlock(3)],
    ['글머리 목록', selectedList('bullet')],
    ['번호 목록', selectedList('ordered')],
    ['인용문', wrapIn(visualSchema.nodes.blockquote)],
    ['코드 블록', setBlockType(visualSchema.nodes.code_block)],
    ['구분선', (state, dispatch) => { dispatch?.(state.tr.replaceSelectionWith(visualSchema.nodes.horizontal_rule.create()).scrollIntoView()); return true; }],
  ];
  const link: Command = (state, dispatch) => {
    const view = viewRef.current;
    if (!view || !view.editable) return false;
    const { from, to, empty } = view.state.selection;
    let selectedText = '';
    let existingHref = 'https://';
    if (!empty) {
      selectedText = view.state.doc.textBetween(from, to, ' ');
      const mark = view.state.doc.nodeAt(from)?.marks.find(m => m.type.name === 'link');
      if (mark?.attrs?.href) existingHref = mark.attrs.href;
    }
    linkTargetRef.current = { from, to, valid: true };
    setLinkDialogData({ text: selectedText, href: existingHref });
    setLinkDialog(true);
    return true;
  };
  linkCommandRef.current = link;

  const handleLinkConfirm = ({ text, href }: { text: string; href: string }) => {
    const view = viewRef.current;
    const target = linkTargetRef.current;
    if (!view || !target?.valid || !view.editable) {
      setNotice('문서나 삽입 위치가 변경되었습니다.');
      return;
    }
    linkTargetRef.current = null;
    const mark = visualSchema.marks.link.create({ href });
    const textNode = view.state.schema.text(text, [mark]);
    const tr = view.state.tr.replaceWith(target.from, target.to, textNode);
    const nextPos = target.from + text.length;
    tr.setSelection(TextSelection.create(tr.doc, nextPos));
    view.dispatch(closeHistory(tr).scrollIntoView());
    view.focus();
  };
  const openDatePicker = (removeSlash = false) => {
    const view = viewRef.current;
    if (!view || readOnly) return;
    const from = view.state.selection.from;
    const to = view.state.selection.to;
    const rect = view.coordsAtPos(from);
    const isSlash = removeSlash && slashRange.current;
    dateTargetRef.current = {
      from: isSlash ? slashRange.current!.from : from,
      to: isSlash ? slashRange.current!.to : to,
      valid: true,
    };
    if (isSlash) {
      slashRange.current = null;
      setSlash(false);
    }
    setDatePickerPos({
      top: rect.bottom + 6,
      left: Math.max(16, rect.left),
    });
    setDatePickerOpen(true);
  };
  openDatePickerRef.current = openDatePicker;

  const handleDateInsert = (formattedDate: string) => {
    const view = viewRef.current;
    if (!view || !view.editable) return;
    const target = dateTargetRef.current;
    if (target && target.valid) {
      let tr = view.state.tr.replaceWith(target.from, target.to, view.state.schema.text(formattedDate));
      const nextPos = target.from + formattedDate.length;
      tr = tr.setSelection(TextSelection.create(tr.doc, nextPos));
      view.dispatch(closeHistory(tr).scrollIntoView());
    } else {
      view.dispatch(view.state.tr.insertText(formattedDate).scrollIntoView());
    }
    view.focus();
    setDatePickerOpen(false);
    dateTargetRef.current = null;
  };
  const clear: Command = (state, dispatch, view) => {
    if(selectedList('clear')(state,dispatch,view))return true;
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
    underline: toggleMark(visualSchema.marks.underline),
    inlineCode: toggleMark(visualSchema.marks.code), strikethrough:toggleMark(visualSchema.marks.strike), link, clear,
    quoteNote:setQuote('NOTE'),quoteTip:setQuote('TIP'),quoteImportant:setQuote('IMPORTANT'),quoteWarning:setQuote('WARNING'),quoteCaution:setQuote('CAUTION'),
    table:()=>{openTableRef.current();return true;},
    list: selectedList('bullet'), orderedList: selectedList('ordered'),
    checklist:makeChecklist, quote: setQuote(null), codeblock: setBlockType(visualSchema.nodes.code_block),
    divider: blockCommands[blockCommands.length - 1][1], undo, redo,
    math: () => { executeItem('math'); return true; }, latex: () => { executeItem('math'); return true; },
  };
  for (let level = 1; level <= 6; level++) nativeCommands[`h${level}`] = setHeadingBlock(level);
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
    if (id === 'now' || id === 'calendar') {
      openDatePicker(removeSlash);
      return;
    }
    if (id === 'taglink' && images.current.onDocLinkDialog) {
      const from = view.state.selection.from;
      const to = view.state.selection.to;
      const rect = view.coordsAtPos(from);
      const isSlash = removeSlash && slashRange.current;
      const target = {
        from: isSlash ? slashRange.current!.from : from,
        to: isSlash ? slashRange.current!.to : to,
        valid: true,
      };
      if (isSlash) {
        slashRange.current = null;
        setSlash(false);
      }
      images.current.onDocLinkDialog(
        { top: Math.max(8, Math.min(window.innerHeight - 150, rect.bottom + 6)), left: Math.max(8, Math.min(window.innerWidth - 440, rect.left)) },
        (targetUrl: string, displayTitle: string) => {
          if (!target.valid || viewRef.current !== view || !view.editable) return false;
          const mark = visualSchema.marks.link.create({ href: targetUrl });
          const textNode = view.state.schema.text(displayTitle, [mark]);
          let tr = view.state.tr.replaceWith(target.from, target.to, textNode);
          const nextPos = target.from + displayTitle.length;
          tr = tr.setSelection(TextSelection.create(tr.doc, nextPos));
          view.dispatch(closeHistory(tr).scrollIntoView());
          view.focus();
          return true;
        }
      );
      return;
    }
    if (id === 'math' || id === 'latex') {
      const isSlash = removeSlash && slashRange.current;
      const from = isSlash ? slashRange.current!.from : view.state.selection.from;
      const to = isSlash ? slashRange.current!.to : view.state.selection.to;
      if (isSlash) {
        slashRange.current = null;
        setSlash(false);
      }
      if (images.current.onFormulaDialog) {
        const target = { from, to, valid: true };
        imageTargets.current.add(target);
        images.current.onFormulaDialog((formulaCode: string) => {
          imageTargets.current.delete(target);
          if (!target.valid || viewRef.current !== view || !view.editable) return false;
          const cleanCode = formulaCode.trim();
          const isInline = cleanCode.startsWith('$') && !cleanCode.startsWith('$$') && cleanCode.endsWith('$') && cleanCode.length >= 2;
          let tr = view.state.tr;
          if (isInline) {
            const rawLatex = cleanCode.slice(1, -1).trim();
            const inlineNode = visualSchema.nodes.visual_inline_math.create({ latex: rawLatex });
            const spaceNode = view.state.schema.text(' ');
            tr = tr.replaceWith(target.from, target.to, [inlineNode, spaceNode]);
            const nextPos = target.from + inlineNode.nodeSize + spaceNode.nodeSize;
            tr = tr.setSelection(TextSelection.create(tr.doc, nextPos));
          } else {
            const rawLatex = cleanCode.startsWith('$$')
              ? cleanCode.replace(/^\$\$|\$\$$/g, '').trim()
              : cleanCode.startsWith('```')
                ? cleanCode.replace(/^```[a-z]*\r?\n|```$/gi, '').trim()
                : cleanCode;
            const mathNode = visualSchema.nodes.visual_math.create({ latex: rawLatex });
            const nextParagraph = visualSchema.nodes.paragraph.create();
            tr = tr.replaceWith(target.from, target.to, [mathNode, nextParagraph]);
            const nextPos = target.from + mathNode.nodeSize + 1;
            tr = tr.setSelection(TextSelection.create(tr.doc, nextPos));
          }
          view.dispatch(closeHistory(tr).scrollIntoView());
          view.focus();
          return true;
        });
        return;
      }
      const sampleText = '\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}';
      const sampleNode = visualSchema.nodes.visual_math.create({ latex: sampleText });
      let tr = view.state.tr.replaceWith(from, to, sampleNode);
      if (tr.selection.to === tr.doc.content.size || tr.selection.$to.parent === tr.doc) {
        tr = tr.insert(tr.doc.content.size, visualSchema.nodes.paragraph.create());
        tr = tr.setSelection(TextSelection.create(tr.doc, tr.doc.content.size - 1));
      }
      view.dispatch(closeHistory(tr).scrollIntoView());
      view.focus();
      return;
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
      ITALIC: toggleMark(visualSchema.marks.em), UNDERLINE: toggleMark(visualSchema.marks.underline),
      INLINE_CODE: toggleMark(visualSchema.marks.code),
      LIST: selectedList('bullet'), ORDERED_LIST: selectedList('ordered'),
      CHECK:makeChecklist,CHECKLIST:makeChecklist, QUOTE: setQuote(null), CODE_BLOCK: setBlockType(visualSchema.nodes.code_block),
      LINK: link, REMOVE_PREFIX: clear, STRIKETHROUGH:toggleMark(visualSchema.marks.strike),
      QUOTE_NOTE:setQuote('NOTE'),QUOTE_TIP:setQuote('TIP'),QUOTE_IMPORTANT:setQuote('IMPORTANT'),QUOTE_WARNING:setQuote('WARNING'),QUOTE_CAUTION:setQuote('CAUTION'),
      TABLE:()=>{openTableRef.current();return true;}, QUICK_TABLE:()=>{openTableRef.current();return true;}, INSERT_TABLE_ROW:tableAction('addRow'), DELETE_TABLE_ROW:tableAction('deleteRow'),
      NOW: () => { openDatePickerRef.current(); return true; }, CALENDAR: () => { openDatePickerRef.current(); return true; },
      MATH: () => { executeItemRef.current('math'); return true; }, LATEX: () => { executeItemRef.current('math'); return true; },
    };
    for (let level = 1; level <= 6; level++) commands[`H${level}`] = setHeadingBlock(level);
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
        const spaceBelow = window.innerHeight - rect.bottom;
        const top = command === 'SLASH_COMMAND'
          ? (spaceBelow < 260 && rect.top > 260 ? Math.max(8, rect.top - 240) : Math.max(8, Math.min(window.innerHeight - 150, rect.bottom + 6)))
          : Math.max(8, Math.min(window.innerHeight - 150, rect.top - 48));
        setPopup({ top, left: Math.max(8, Math.min(window.innerWidth - 360, rect.left)) });
        if (command === 'SLASH_COMMAND') {
          const before = $from.parent.isTextblock ? $from.parent.textBetween(0, $from.parentOffset, '\n', '\n') : '';
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
        NOW:'now', CALENDAR:'now',
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
      <span className="ml-auto text-xs text-zinc-500">/ 입력: 블록 추가 · Ctrl+Space: 툴바 · Ctrl+Enter: 표·코드·인용문 아래 본문 · Tab: 목록 들여쓰기</span>
      <span aria-label="현재 입력 서식" className="text-xs text-blue-700">{activeMarks.length ? activeMarks.map(name => ({strong:'bold',em:'italic',code:'inlinecode',link:'link',strike:'strike'})[name]).join(' + ') : 'plain'}</span>
    </div>
    {inTable && !readOnly && createPortal(<div style={tableToolPosition} className="no-print fixed z-[100000] flex flex-wrap gap-1 rounded-lg border border-blue-200 bg-blue-50 p-2 text-zinc-800 shadow-lg" data-editor-controls aria-label="표 편집 도구">
      <strong className="self-center px-2 text-sm">표 편집 도구</strong>
      <button type="button" className="onrivi-media-control" aria-label="표 복사" onMouseDown={e=>e.preventDefault()} onClick={async()=>{
        const view=viewRef.current,codec=codecRef.current;
        const context=view && tableContext(view.state);
        if(!context || !codec)return;
        const text=codec.serialize(visualSchema.nodes.doc.create(null,context.table));
        try {
          const api=(window as any).electronAPI;
          if(api?.copyTextToClipboard)await api.copyTextToClipboard(text);
          else await navigator.clipboard.writeText(text);
          setNotice('표를 마크다운 형식으로 복사했습니다.');
        } catch {setNotice('표 복사에 실패했습니다.');}
      }}>복사</button>
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
    <LinkModal
      isOpen={linkDialog}
      onClose={() => { setLinkDialog(false); linkTargetRef.current = null; }}
      onConfirm={handleLinkConfirm}
      initialText={linkDialogData.text}
      initialHref={linkDialogData.href}
      isDarkMode={false}
    />
    <CalendarModal
      isOpen={calendarDialog}
      onClose={() => setCalendarDialog(false)}
      onInsert={(formattedDate) => {
        const view = viewRef.current;
        if (!view || !view.editable) return;
        view.dispatch(view.state.tr.insertText(formattedDate).scrollIntoView());
        view.focus();
      }}
      isDarkMode={false}
    />
    <DateTimeInsertPicker
      isOpen={datePickerOpen}
      position={datePickerPos}
      onClose={() => { setDatePickerOpen(false); dateTargetRef.current = null; }}
      onInsert={handleDateInsert}
      isDarkMode={false}
    />
    {notice && <div role="status" className="flex justify-between bg-amber-50 px-4 py-2 text-sm text-amber-900" data-editor-controls>{notice}<button type="button" onClick={() => setNotice('')}>닫기</button></div>}
    {selection && !readOnly && !onFloatingToolbar && createPortal(<div role="toolbar" aria-label="선택한 글 서식" style={{ ...popup,
      left: Math.max(8, Math.min(popup.left, window.innerWidth - 916)), width: 'min(900px, calc(100vw - 16px))',
      maxHeight: Math.min(window.innerHeight * 0.4, window.innerHeight - popup.top - 8), overflow:'auto' }} className="fixed z-[1000] flex flex-wrap rounded-xl border bg-white text-zinc-800 shadow-lg" data-editor-controls>
      {([['bold','B'], ['italic','I'], ['inlineCode','</>'], ['link','🔗'], ['orderedList','1.'], ['list','•'], ['checklist','☑'], ['clear','⌫']] as [string,string][]).map(([id,label]) => itemButton(id,label))}
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
      .custom-preview-container:has(.visual-document-editor) { overflow-anchor:none!important; scroll-behavior:auto!important; }
      .visual-document-surface { caret-color:transparent; outline:none; min-height:360px; padding:28px; white-space:pre-wrap; overflow-wrap:anywhere; color:inherit; background:inherit; font-family:inherit; font-size:inherit; line-height:1.75; }
      .visual-document-surface a { color:#1d4ed8; text-decoration:underline; cursor:pointer; }
      .visual-document-surface a:hover { color:#1e40af; text-decoration:underline; }
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
      /* Keep the boundary between separate top-level lists, without adding item gaps. */
      .custom-preview-container .visual-document-surface > :is(ul,ol) + :is(ul,ol),
      .visual-document-surface > :is(ul,ol) + :is(ul,ol) { margin-top:1.5em!important; }

      .visual-document-surface ol { padding-left:2em; list-style:decimal; }
      .visual-document-surface blockquote { border-left:3px solid #93c5fd; padding-left:1em; }
      .visual-document-surface pre { background:#f4f4f5; padding:12px; white-space:pre-wrap; }
      .visual-document-surface .visual-code-block { margin-top:24px!important; min-width:0; max-width:100%; box-sizing:border-box; }
      .visual-document-surface .visual-code-editor-panel { min-width:0; max-width:100%; }
      .visual-document-surface .visual-code-block pre { display:block!important; max-width:100%!important; box-sizing:border-box!important; overflow-x:auto!important; white-space:pre!important; overflow-wrap:normal!important; word-break:normal!important; }
      .visual-document-surface .visual-code-block pre code { display:block!important; width:max-content!important; min-width:100%; white-space:pre!important; overflow:visible!important; overflow-wrap:normal!important; word-break:normal!important; }
      .visual-code-editor-panel > summary { width:max-content; margin:8px 12px; cursor:pointer; }
      .visual-code-editor-panel > summary[hidden] { display:none!important; }
      .visual-code-language button[aria-label="코드 내용 복사"] { margin-left:auto; }
      .visual-code-language button[hidden] { display:none!important; }
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
      .visual-math-preview { margin: 8px 0; overflow-x: auto; display: flex; justify-content: center; }
      .visual-math-preview .visual-readonly-content pre,
      .visual-math-preview pre { display: none !important; }
    `}</style>
  </section>;
}
