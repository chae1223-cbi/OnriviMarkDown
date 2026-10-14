// ====================================================================
// 📊 [OMD-COMP-PicturebookPreview-0001] PicturebookPreview.tsx
// 🚨 @PATCH : **2026-10-14** — [그림책 뷰어 0장면 시 텍스트 잘림(48px) 해결 및 일반 마크다운 미리보기 폴백 지원]:
//             1) height: 48px 고정 높이로 인해 안내문과 예시 텍스트가 가로로 반토막 잘리던 CSS 레이아웃 버그 완전 제거
//             2) 문서에 :::scene 블록이 없을 때(0장면) 빈 화면 대신 일반 마크다운 미리보기(renderMarkdown)를 즉시 표시하여 원고 내용을 선명하게 열람·편집 가능하도록 개선
//             3) 그림책 조판 서식 안내 카드 신설: '현재 본문을 그림책 장면으로 감싸기', '예시 추가', '일반 서식 변경 안내' 원클릭 액션 제공
// 🚨 @PATCH : **2026-10-14** — [그림책 뷰어 이미지 비트맵 클립보드 복사(copyImageToClipboard) 연동]: 페이지 사진 복사 버튼 클릭 시 마크다운 텍스트 주소가 아닌 실제 이미지 비트맵을 클립보드에 복사하도록 개선
// ====================================================================
'use client';

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import VisualDocumentEditor from './VisualDocumentEditor';
import PicturebookSceneInput, { type PicturebookEditorOptions } from './PicturebookSceneInput';
import { copyMediaSource, copyImageToClipboard } from '@/lib/mediaMarkup';
import type { CssProfile } from '@/types/cssProfile';
import { PAPER_SIZES } from '@/constants/paperSizes';
import { parseBookScenes, replaceBookScene, replaceSceneImage, moveBookSceneUp, sceneEditableBody, replaceSceneBody, duplicateBookScene, BOOK_SAMPLE } from '@/lib/picturebook';
import { parseDroppedDataToBlob, fetchExternalImageFile } from '@/lib/resourceMedia';
import { desktopClipboardImage } from '@/lib/desktopClipboard';

export default function PicturebookPreview({ content, profile, fingerprint, renderMarkdown, onChange, sourceLineOffset = 0, onImageEdit, editorOptions }: {
  content: string; profile: CssProfile; fingerprint: string;
  renderMarkdown: (markdown: string) => React.ReactNode;
  onChange?: (markdown: string) => void;
  sourceLineOffset?: number;
  onImageEdit?: (index:number) => void;
  editorOptions?: PicturebookEditorOptions;
}) {
  const [editingScene,setEditingScene] = useState<number|null>(null);
  const contentRef=useRef(content); contentRef.current=content;
  const editorOptionsRef=useRef(editorOptions);editorOptionsRef.current=editorOptions;
  const [editError,setEditError] = useState('');
  const [copiedScene,setCopiedScene] = useState<number|null>(null);
  const [copyError,setCopyError] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const sceneList = useRef<HTMLDetailsElement>(null);
  const [scale, setScale] = useState(1);
  const [issues, setIssues] = useState<string[]>([]);
  const parsed = useMemo(() => parseBookScenes(content, sourceLineOffset), [content, sourceLineOffset]);
  const paper = PAPER_SIZES[profile.pageStyle.paperSize?.toLowerCase()] || PAPER_SIZES.a4;
  const landscape = profile.pageStyle.orientation === 'landscape';
  const width = landscape ? paper.height : paper.width;
  const height = landscape ? paper.width : paper.height;
  const layout = profile.layout!;
  useLayoutEffect(()=>{
    if(editingScene===null)return;
    const page=root.current?.querySelectorAll<HTMLElement>('.book-page')[editingScene];
    page?.querySelector<HTMLElement>('.visual-document-surface')?.focus({preventScroll:true});
  },[editingScene]);
  useLayoutEffect(() => {
    const element = root.current;
    if (element?.clientWidth) setScale(Math.min(1, element.clientWidth / (width * 96 / 25.4)));
  }, [width]);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    let disposed = false;
    let frame = 0;
    const check = () => {
      if (disposed) return;
      // Child Markdown fragments start at line 1; only full-document scene anchors are valid.
      element.querySelectorAll<HTMLElement>('[data-line]:not(.book-page)').forEach(child => {
        child.removeAttribute('data-line');
      });
      const nextScale = Math.min(1, element.clientWidth / (width * 96 / 25.4));
      setScale(previous => Math.abs(previous-nextScale) > .002 ? nextScale : previous);
      const next: string[] = [];
      if (element.querySelector('[data-export-state="error"]')) next.push('그림을 불러오지 못했습니다. 파일 경로와 드라이브 연결을 확인해 주세요.');
      element.querySelectorAll<HTMLElement>('[data-book-text]').forEach((text, i) => {
        if (text.scrollHeight > text.clientHeight + 2 || text.scrollWidth > text.clientWidth + 2) {
          next.push(`${i + 1}페이지의 글이 영역을 넘습니다. 글을 줄이거나 장면을 나눠 주세요.`);
          text.dataset.bookOverflow = 'true';
        } else delete text.dataset.bookOverflow;
      });
      element.querySelectorAll<HTMLImageElement>('.book-image img').forEach((image, i) => {
        if (!image.complete || !image.naturalWidth) next.push(`${i + 1}페이지의 그림을 불러오지 못했거나 준비 중입니다.`);
      });
      setIssues(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(() => { frame=0; check(); }); };
    const observer = new ResizeObserver(schedule);
    observer.observe(element);
    element.querySelectorAll('[data-book-text]').forEach(text => observer.observe(text));
    element.addEventListener('load', schedule, true);
    element.addEventListener('error', schedule, true);
    const mutation = new MutationObserver(schedule);
    mutation.observe(element, { childList: true, subtree: true });
    document.fonts.ready.then(schedule);
    const timer = setTimeout(check, 100);
    return () => { disposed = true; clearTimeout(timer); cancelAnimationFrame(frame); observer.disconnect(); mutation.disconnect(); element.removeEventListener('load', schedule, true); element.removeEventListener('error', schedule, true); };
  }, [content, profile, width]);

  const allIssues = [...parsed.errors, ...issues];
  const replaceScenePhoto = async (index:number, file:File, expectedRaw?:string, documentId=editorOptions?.documentId) => {
    const before=contentRef.current;
    const scene=parseBookScenes(before).scenes[index];
    if(!scene || !onChange || !editorOptions?.onImageFile)return;
    try {
      const path=await editorOptions.onImageFile(file);
      if(!path)throw new Error('그림 저장에 실패했습니다.');
      if(!root.current?.isConnected)return;
      if(editorOptionsRef.current?.documentId!==documentId)throw new Error('사진을 가져오는 동안 문서가 변경되었습니다. 다시 선택해 주세요.');
      const next=replaceSceneImage(contentRef.current,index,path,file.name,expectedRaw ?? scene.raw);
      contentRef.current=next;onChange(next);setEditError('');
    }catch(error){setEditError(error instanceof Error?error.message:'장면 그림 교체에 실패했습니다.');}
  };
  const goToScene = (index: number) => {
    const page = root.current?.querySelectorAll<HTMLElement>('.book-page')[index];
    if (!page) return;
    page.focus({ preventScroll: true });
    page.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start', inline: 'nearest',
    });
  };
  const returnToSceneList = (index: number) => {
    const list = sceneList.current;
    if (!list) return;
    list.open = true;
    const item = list.querySelectorAll<HTMLElement>('[data-scene-list-item]')[index];
    const target = item || list;
    item?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
    target.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start', inline: 'nearest',
    });
  };
  const addSceneAfter = (index:number) => {
    if(!onChange)return;
    const current=contentRef.current;
    const scene=parseBookScenes(current).scenes[index];
    if(!scene)return;
    const newScene='\n\n:::scene\n![새 장면 그림](media/scene.png)\n\n새 장면의 내용을 입력하세요.\n:::\n';
    const next=current.slice(0,scene.end)+newScene+current.slice(scene.end);
    contentRef.current=next;setEditingScene(index+1);onChange(next);
    requestAnimationFrame(()=>{
      root.current?.querySelectorAll<HTMLElement>('.book-page')[index+1]?.scrollIntoView({block:'start',inline:'nearest',behavior:'smooth'});
    });
  };
  return <div ref={root} className="markdown-viewer-root onrivi-content-root picturebook-root"
    data-picturebook="true" data-book-invalid={allIssues.length ? 'true' : 'false'} data-export-content={fingerprint}>
    <style>{`
      .picturebook-root .book-page { box-sizing:border-box; position:relative; flex:none; overflow:hidden; margin:0 auto 24px; outline:1px solid #cbd5e1; box-shadow:0 4px 16px rgba(15,23,42,.12); }
      .picturebook-root .book-text .visual-document-surface { min-height:0; padding:0; }
      .picturebook-root .book-image { min-width:0; min-height:0; overflow:hidden; }
      .picturebook-root .book-image { position:relative; }
      .picturebook-root .book-image-copy { right:90px!important; }
      .picturebook-root .book-image-edit { position:absolute; top:12px; right:12px; z-index:5; opacity:0; pointer-events:none; padding:8px 14px; border:1px solid #cbd5e1; border-radius:8px; background:white; color:#1e293b; box-shadow:0 2px 8px rgba(0,0,0,.15); cursor:pointer; }
      .picturebook-root .book-image:hover > .book-image-edit,.picturebook-root .book-image:focus-within > .book-image-edit { opacity:1; pointer-events:auto; }
      @media (hover:none) { .picturebook-root .book-image > .book-image-edit { opacity:1; pointer-events:auto; } }
      .picturebook-root .book-image .markdown-viewer-root { height:100%!important; min-height:0!important; padding:0!important; }
      .picturebook-root .book-image .markdown-viewer-root > div { height:100%!important; min-height:0!important; }
      .picturebook-root .book-image .onrivi-image-figure { width:100%!important; height:100%!important; min-height:0!important; margin:0!important; padding:0!important; }
      .picturebook-root .book-page .book-image .markdown-viewer-root p,.picturebook-root .book-page .book-image .markdown-viewer-root figure { height:100%!important; margin:0!important; padding:0!important; }
      .picturebook-root .book-image .onrivi-image-wrapper { box-sizing:border-box!important; width:100%!important; height:100%!important; min-height:0!important; margin:0!important; padding:0!important; border:none!important; border-radius:0!important; box-shadow:none!important; }
      .picturebook-root .book-page .book-image .markdown-viewer-root img { width:100%!important; height:100%!important; max-height:none!important; margin:0!important; object-fit:${layout.imageFit}!important; }
      .picturebook-root .book-image .markdown-viewer-root button { display:none!important; }
      .picturebook-root .book-image figcaption { display:none!important; }
      .picturebook-root .book-text { min-width:0; min-height:0; overflow:hidden; }
      .picturebook-root .book-text .markdown-viewer-root { padding:0!important; min-height:0!important; }
      .picturebook-root .book-cover-full .book-text { position:absolute; bottom:8%; left:8%; right:8%; max-height:45%; padding:16px; background:rgba(255,255,255,.9); }
      .picturebook-root [data-book-overflow] { outline:2px solid #ef4444; }
      .picturebook-root .book-validation { background:#fff8e6!important; color:#713f12!important; font-size:14px!important; line-height:1.65!important; }
      .picturebook-root .book-validation summary { color:#713f12!important; font-size:14px!important; font-weight:700!important; padding:6px 0!important; }
      .picturebook-root .book-validation .book-issue-text { color:#172033!important; background:#fff!important; opacity:1!important; -webkit-text-fill-color:#172033!important; font-size:14px!important; line-height:1.7!important; border:1px solid #d6c8a3!important; padding:14px!important; }
      .picturebook-root .book-validation button { color:#172033!important; background:#fff!important; border:1px solid #ad8c47!important; font-size:14px!important; padding:6px 12px!important; }
      @media print { .picturebook-root .book-page { zoom:1!important; margin:0!important; outline:none!important; box-shadow:none!important; break-after:page; break-inside:avoid; } .picturebook-root .book-page:last-of-type { break-after:auto; } .book-screen-only {display:none!important;} }
    `}</style>
    {editError && <p className="book-screen-only p-3 mb-3 rounded-lg bg-red-50 text-red-600 text-xs font-bold" role="alert">{editError}</p>}
    {copyError && <p className="book-screen-only p-3 mb-3 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold" role="status">{copyError}</p>}

    {!parsed.scenes.length ? (
      <div className="picturebook-empty-state space-y-4 book-screen-only my-2">
        {/* 그림책 조판 모드 친절 안내 카드 */}
        <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/30 text-slate-700 dark:text-zinc-200 text-xs shadow-xs">
          <div className="flex items-center gap-2 mb-2 font-bold text-sm text-[#1d4ed8] dark:text-blue-400">
            <span>📘</span>
            <span>그림책 조판 서식이 적용되어 있습니다</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-mono">
              {profile.name || '그림책'}
            </span>
          </div>
          <p className="leading-relaxed mb-3 text-slate-600 dark:text-zinc-300">
            현재 문서에 그림책 장면(<code>:::scene</code>)이 정의되지 않았습니다. 원고 내용을 편안하게 확인하고 집필하실 수 있도록 아래에 <strong>일반 마크다운 미리보기</strong>로 표시합니다.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {onChange && (
              <>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-[#1d4ed8] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
                  onClick={() => onChange(':::scene\n![장면 그림](media/scene.png)\n\n' + content.trim() + '\n:::\n')}
                >
                  + 현재 본문을 그림책 장면으로 감싸기
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold text-xs transition-all active:scale-95 cursor-pointer"
                  onClick={() => onChange(content + '\n\n' + BOOK_SAMPLE)}
                >
                  표지·본문 예시 추가
                </button>
              </>
            )}
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 ml-auto font-medium">
              💡 일반 서식으로 변경하시려면 상단 [스타일 관리(🎨)]에서 ‘Onrivi 기본’ 등을 선택하세요.
            </span>
          </div>
        </div>

        {/* 일반 마크다운 본문 선명하게 표시 */}
        <div className="picturebook-fallback-body rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
          {renderMarkdown(content)}
        </div>
      </div>
    ) : (
      <>
        {onChange && <details ref={sceneList} className="book-screen-only border rounded-lg p-3 mb-3 text-sm">
          <summary className="font-bold cursor-pointer text-slate-700 dark:text-zinc-200 flex items-center gap-2 select-none">
            <span>📖 그림책 장면 편집</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#1d4ed8]/10 text-[#1d4ed8] dark:text-blue-400 font-mono">
              {parsed.scenes.length}개 장면
            </span>
          </summary>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 mb-3">
            그림은 기존 사진 넣기로 저장한 이미지의 참조를 사용하세요. 각 장면의 첫 이미지가 그림 영역에 표시됩니다.
          </p>
          <div className="flex gap-2 mb-3">
            <button type="button" className="border rounded px-3 py-1 text-xs font-bold" onClick={() => onChange(content + '\n\n:::scene\n![장면 그림](media/scene.png)\n\n새 장면의 내용을 입력하세요.\n:::\n')}>+ 장면 추가</button>
          </div>
          {parsed.scenes.map((scene, i) => <div key={i} data-scene-list-item className="border-t py-3">
            <button type="button" className="mr-2 border rounded px-2" aria-label={`${scene.cover ? '표지' : `장면 ${i+1}`}으로 이동`} onClick={()=>goToScene(i)}>장면으로 이동</button>
            <button type="button" className="mr-2 border rounded px-2" onClick={()=>{setEditingScene(i);goToScene(i);}}>본문 편집</button>
            <button type="button" className="mr-2 border rounded px-2" onClick={()=>{setEditingScene(null);onChange(duplicateBookScene(content,i));}}>복제</button>
            <strong>{scene.cover ? '표지' : `장면 ${i+1}`}</strong>
            <button type="button" className="ml-3 border rounded px-2" disabled={i === 0 || scene.cover || parsed.scenes[i-1]?.cover}
              onClick={() => {setEditingScene(null);onChange(moveBookSceneUp(content,i));}}>위로</button>
            <button type="button" className="ml-2 border rounded px-2" disabled={scene.cover || i===parsed.scenes.length-1}
              onClick={()=>{setEditingScene(null);onChange(moveBookSceneUp(content,i+1));}}>아래로</button>
            <button type="button" className="ml-2 border rounded px-2" onClick={() => { if (window.confirm('이 장면을 문서에서 삭제할까요?')) {setEditingScene(null);onChange(content.slice(0,scene.start) + content.slice(scene.end));} }}>삭제</button>
            <PicturebookSceneInput key={`${editorOptions?.documentId || 'book'}:${i}`} label={`${i+1}번째 장면 원고`} value={scene.raw} options={editorOptions}
              onCommit={text => {
                const current = parseBookScenes(contentRef.current).scenes[i];
                if (current) {const next=replaceBookScene(contentRef.current, current, text);contentRef.current=next;onChange(next);}
              }} />
          </div>)}
        </details>}

        {/* 검증 이슈 (높이 48px 제한 제거 및 가독성 확보) */}
        {allIssues.length > 0 && (
          <div className="book-validation book-screen-only mb-3 p-3 rounded-lg border border-amber-300 font-medium space-y-2" role="status">
            {allIssues.map((issue, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">⚠️</span>
                <span>{issue}</span>
              </div>
            ))}
            {parsed.outsideBlocks.map(block => <details key={block.startLine} className="pt-2">
              <summary className="cursor-pointer">{block.location} · 원문 {block.startLine}행의 문제 본문 확인</summary>
              <pre className="book-issue-text mt-2 rounded whitespace-pre-wrap break-words font-sans max-h-72 overflow-auto">{block.text}</pre>
              {parsed.scenes.length > 0 && <button type="button" className="border rounded px-2 py-1 mt-1" onClick={() => goToScene(Math.max(0, block.afterScene - 1))}>관련 장면으로 이동</button>}
            </details>)}
          </div>
        )}
        {/* 장면 목록 렌더링 */}
        {parsed.scenes.map((scene, i) => {
          const full = scene.cover && layout.cover === 'full-image';
          const startLine = sourceLineOffset + content.slice(0, scene.start).split('\n').length;
          const endLine = sourceLineOffset + content.slice(0, scene.end).split('\n').length;
          return <React.Fragment key={i}><section tabIndex={-1} aria-label={scene.cover ? '표지 장면' : `장면 ${i+1}`}
            onDragOverCapture={event=>{
              if(onChange && editorOptions?.onImageFile && Array.from(event.dataTransfer.types).some(type=>['Files','text/html','text/uri-list'].includes(type))){event.preventDefault();event.stopPropagation();event.dataTransfer.dropEffect='copy';}
            }}
            onDropCapture={event=>{
              if(!onChange || !editorOptions?.onImageFile)return;
              const item=parseDroppedDataToBlob(event.dataTransfer);if(!item)return;
              event.preventDefault();event.stopPropagation();
              void (async()=>{
                try {
                  const file=item.file || (item.webUrl?await fetchExternalImageFile(item.webUrl):null);
                  if(!file)throw new Error('끌어온 사진을 읽지 못했습니다. 사진 편집에서 파일을 선택해 주세요.');
                  await replaceScenePhoto(i,file,scene.raw,editorOptions?.documentId);
                }catch(error){setEditError(error instanceof Error?error.message:'사진을 읽지 못했습니다.');}
              })();
            }}
            onPasteCapture={event=>{
              const file=Array.from(event.clipboardData.files).find(file=>file.type.startsWith('image/'));
              if(file && onChange && editorOptions?.onImageFile){event.preventDefault();event.stopPropagation();void replaceScenePhoto(i,file);}
            }}
            onKeyDownCapture={event=>{
              if(event.nativeEvent.isComposing)return;
              const file=desktopClipboardImage(event);
              if(file && onChange && editorOptions?.onImageFile){event.preventDefault();event.stopPropagation();void replaceScenePhoto(i,file);}
            }}
            data-line={startLine} data-book-end-line={endLine} data-paper-width={width} data-paper-height={height} data-paper-orientation={landscape ? 'landscape' : 'portrait'} className={`book-page ${full ? 'book-cover-full' : ''}`} style={{
            width: `${width}mm`, height: `${height}mm`, zoom: scale,
            display: 'grid', gridTemplateRows: 'minmax(0, 1fr)', gridTemplateColumns: full ? '1fr' : scene.cover
              ? `${(1 - layout.imageRatio) * 100}fr ${layout.imageRatio * 100}fr`
              : `${layout.imageRatio * 100}fr ${(1 - layout.imageRatio) * 100}fr`,
            gap: full ? 0 : layout.gap,
            padding: `${profile.pageStyle.marginTop} ${profile.pageStyle.marginRight} ${profile.pageStyle.marginBottom} ${profile.pageStyle.marginLeft}`,
            background: profile.pageStyle.backgroundColor, fontFamily: profile.pageStyle.fontFamily,
            fontSize: profile.pageStyle.fontSize, lineHeight: profile.pageStyle.lineHeight,
          }}>
            <div className="book-image" style={{ order: scene.cover && !full ? 2 : 0 }}>
              {renderMarkdown(scene.image)}
              {scene.image && <button type="button" className="onrivi-media-control book-image-edit book-image-copy book-screen-only no-print" title="이미지 복사"
                aria-label={`${i + 1}페이지 사진 복사`} onClick={event => { event.stopPropagation(); void copyImageToClipboard(scene.image, event.currentTarget.closest('.book-image')?.querySelector('img')).then((ok) => { if (ok) { setCopiedScene(i); setCopyError(''); } else { setCopyError('이미지 복사에 실패했습니다.'); } }).catch(() => setCopyError('클립보드 복사에 실패했습니다.')); }}>{copiedScene === i ? '복사됨' : '복사'}</button>}
              {onImageEdit && <button type="button" className="onrivi-media-control book-image-edit book-screen-only"
                aria-label={`${scene.cover ? '표지' : `${i + 1}페이지`} 사진 편집`}
                onClick={event => { event.stopPropagation(); onImageEdit(i); }}>편집</button>}
            </div>
            <div className="book-text" data-book-text="true" style={editingScene === i ? { overflow: 'auto' } : undefined}>
              {onChange && <div className="book-screen-only no-print" data-editor-controls>
                <button type="button" className="onrivi-media-control" onMouseDown={event=>event.preventDefault()} onClick={() => setEditingScene(editingScene === i ? null : i)}>{editingScene === i ? '편집 완료' : '본문 편집'}</button>
                <button type="button" className="onrivi-media-control ml-2" onClick={() => returnToSceneList(i)}>↑ 장면 목록으로</button>
              </div>}
              {editingScene === i && onChange ? <VisualDocumentEditor key={`scene-${i}`} renderImage={renderMarkdown} content={sceneEditableBody(scene)}
                documentId={editorOptions?.documentId}
                commandRef={editorOptions?.commandRef}
                tabSize={editorOptions?.tabSize}
                customCommands={editorOptions?.customCommands}
                customHotkeys={editorOptions?.customHotkeys}
                floatingToolbarVisible={editorOptions?.floatingToolbarVisible}
                onFloatingToolbar={editorOptions?.onFloatingToolbar}
                onStyleSettings={() => editorOptions?.onAction?.('TOGGLE_CSS_STYLE')}
                onImageFile={editorOptions?.onImageFile ? file => editorOptions.onImageFile!(file as File) : undefined}
                onImageDialog={editorOptions?.onImageDialog ? (source, insert) => editorOptions.onImageDialog!(text => {
                  const match = text.match(/!\[([^\]]*)\]\(([^\n]+)\)/);
                  return match ? insert(match[2].replace(/^<|>$/g, ''), match[1]) : false;
                }, source || undefined) : undefined}
                onMediaDialog={editorOptions?.onMediaDialog ? (kind, source, insert) => editorOptions.onMediaDialog!(kind === 'map' ? 'map' : 'video', insert) : undefined}
                onFormulaDialog={editorOptions?.onFormulaDialog ? insert => editorOptions.onFormulaDialog!(text => { insert(text); return true; }) : undefined}
                onChange={body => {
                  try { onChange(replaceSceneBody(contentRef.current, i, body, scene.raw)); setEditError(''); }
                  catch (error) { setEditError(error instanceof Error ? error.message : '장면 수정에 실패했습니다.'); }
                }} /> : renderMarkdown(scene.body)}
            </div>
            {layout.pageNumbers && !scene.cover && <span style={{ position: 'absolute', bottom: '3mm', right: '6mm', fontSize: '10pt' }}>{i + 1}</span>}
          </section>
          {onChange && <div className="book-screen-only no-print flex justify-center mb-6" data-editor-controls>
            <button type="button" className="onrivi-media-control" aria-label={`${scene.cover?'표지':`장면 ${i+1}`} 다음 장면 추가`} onClick={()=>addSceneAfter(i)}>＋ 다음 장면 추가</button>
          </div>}
          </React.Fragment>;
        })}
      </>
    )}
  </div>;
}
