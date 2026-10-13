'use client';

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import VisualDocumentEditor from './VisualDocumentEditor';
import { copyMediaSource } from '@/lib/mediaMarkup';
import type { CssProfile } from '@/types/cssProfile';
import { PAPER_SIZES } from '@/constants/paperSizes';
import { parseBookScenes, replaceBookScene, moveBookSceneUp, sceneEditableBody, replaceSceneBody, duplicateBookScene, BOOK_SAMPLE } from '@/lib/picturebook';

export default function PicturebookPreview({ content, profile, fingerprint, renderMarkdown, onChange, sourceLineOffset = 0, onImageEdit }: {
  content: string; profile: CssProfile; fingerprint: string;
  renderMarkdown: (markdown: string) => React.ReactNode;
  onChange?: (markdown: string) => void;
  sourceLineOffset?: number;
  onImageEdit?: (index:number) => void;
}) {
  const [editingScene,setEditingScene] = useState<number|null>(null);
  const contentRef=useRef(content); contentRef.current=content;
  const [editError,setEditError] = useState('');
  const [copiedScene,setCopiedScene] = useState<number|null>(null);
  const [copyError,setCopyError] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [issues, setIssues] = useState<string[]>([]);
  const parsed = useMemo(() => parseBookScenes(content), [content]);
  const paper = PAPER_SIZES[profile.pageStyle.paperSize?.toLowerCase()] || PAPER_SIZES.a4;
  const landscape = profile.pageStyle.orientation === 'landscape';
  const width = landscape ? paper.height : paper.width;
  const height = landscape ? paper.width : paper.height;
  const layout = profile.layout!;
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
      @media print { .picturebook-root .book-page { zoom:1!important; margin:0!important; outline:none!important; box-shadow:none!important; break-after:page; break-inside:avoid; } .picturebook-root .book-page:last-of-type { break-after:auto; } .book-screen-only {display:none!important;} }
    `}</style>
    {editError && <p className="book-screen-only" role="alert">{editError}</p>}
    {copyError && <p className="book-screen-only" role="status">{copyError}</p>}
    {onChange && <details className="book-screen-only border rounded-lg p-3 mb-3 text-sm">
      <summary>그림책 장면 편집 ({parsed.scenes.length}장면)</summary>
      <p>그림은 기존 사진 넣기로 저장한 이미지의 참조를 사용하세요. 각 장면의 첫 이미지가 그림 영역에 표시됩니다.</p>
      <button type="button" className="border rounded px-3 py-1 my-2" onClick={() => onChange(content + '\n\n:::scene\n![장면 그림](media/scene.png)\n\n새 장면의 내용을 입력하세요.\n:::\n')}>+ 장면 추가</button>
      {!parsed.scenes.length && <button type="button" className="border rounded px-3 py-1 ml-2" onClick={() => onChange(content + '\n\n' + BOOK_SAMPLE)}>표지·본문 예시 추가</button>}
      {parsed.scenes.map((scene, i) => <div key={i} className="border-t py-3">
        <button type="button" className="mr-2 border rounded px-2" onClick={()=>setEditingScene(i)}>본문 편집</button>
        <button type="button" className="mr-2 border rounded px-2" onClick={()=>{setEditingScene(null);onChange(duplicateBookScene(content,i));}}>복제</button>
        <strong>{scene.cover ? '표지' : `장면 ${i+1}`}</strong>
        <button type="button" className="ml-3 border rounded px-2" disabled={i === 0 || scene.cover || parsed.scenes[i-1]?.cover}
          onClick={() => {setEditingScene(null);onChange(moveBookSceneUp(content,i));}}>위로</button>
        <button type="button" className="ml-2 border rounded px-2" disabled={scene.cover || i===parsed.scenes.length-1}
          onClick={()=>{setEditingScene(null);onChange(moveBookSceneUp(content,i+1));}}>아래로</button>
        <button type="button" className="ml-2 border rounded px-2" onClick={() => { if (window.confirm('이 장면을 문서에서 삭제할까요?')) {setEditingScene(null);onChange(content.slice(0,scene.start) + content.slice(scene.end));} }}>삭제</button>
        <textarea aria-label={`${i+1}번째 장면 원고`} className="block w-full border rounded p-2 mt-2 font-mono" rows={6}
          value={scene.raw} onChange={e => onChange(replaceBookScene(content, scene, e.target.value))} />
      </div>)}
    </details>}
    <div className="book-screen-only mb-3 text-sm" style={{height:allIssues.length || parsed.scenes.length ? '48px' : 'auto',overflow:'auto'}} role="status">
      {allIssues.map((issue, i) => <p key={i}>{issue}</p>)}
      {!parsed.scenes.length && <details><summary>장면 작성 예시</summary><pre className="whitespace-pre-wrap">{BOOK_SAMPLE}</pre></details>}
    </div>
    {parsed.scenes.map((scene,i) => {
      const full=scene.cover && layout.cover==='full-image';
      const startLine=sourceLineOffset+content.slice(0,scene.start).split('\n').length;
      const endLine=sourceLineOffset+content.slice(0,scene.end).split('\n').length;
      return <section key={i} data-line={startLine} data-book-end-line={endLine} data-paper-width={width} data-paper-height={height} data-paper-orientation={landscape ? 'landscape' : 'portrait'} className={`book-page ${full ? 'book-cover-full' : ''}`} style={{
        width: `${width}mm`, height: `${height}mm`, zoom: scale,
        display: 'grid', gridTemplateRows:'minmax(0, 1fr)', gridTemplateColumns: full ? '1fr' : scene.cover
          ? `${(1-layout.imageRatio)*100}fr ${layout.imageRatio*100}fr`
          : `${layout.imageRatio*100}fr ${(1-layout.imageRatio)*100}fr`,
        gap: full ? 0 : layout.gap,
        padding: `${profile.pageStyle.marginTop} ${profile.pageStyle.marginRight} ${profile.pageStyle.marginBottom} ${profile.pageStyle.marginLeft}`,
        background: profile.pageStyle.backgroundColor, fontFamily: profile.pageStyle.fontFamily,
        fontSize: profile.pageStyle.fontSize, lineHeight: profile.pageStyle.lineHeight,
      }}>
        <div className="book-image" style={{ order: scene.cover && !full ? 2 : 0 }}
          >
          {renderMarkdown(scene.image)}
          {scene.image && <button type="button" className="onrivi-media-control book-image-edit book-image-copy book-screen-only no-print" title="미디어 참조 복사"
            aria-label={`${i+1}페이지 사진 참조 복사`} onClick={event=>{event.stopPropagation();void copyMediaSource(scene.image).then(()=>{setCopiedScene(i);setCopyError('');}).catch(()=>setCopyError('클립보드 복사에 실패했습니다.'));}}>{copiedScene===i?'복사됨':'복사'}</button>}
          {onImageEdit && <button type="button" className="onrivi-media-control book-image-edit book-screen-only"
            aria-label={`${scene.cover ? '표지' : `${i+1}페이지`} 사진 편집`}
            onClick={event => { event.stopPropagation(); onImageEdit(i); }}>편집</button>}
        </div>
        <div className="book-text" data-book-text="true" style={editingScene===i ? {overflow:'auto'} : undefined}>
          {onChange && <div className="book-screen-only no-print" data-editor-controls>
            <button type="button" className="onrivi-media-control" onClick={()=>setEditingScene(editingScene===i ? null : i)}>{editingScene===i ? '편집 완료' : '본문 편집'}</button>
          </div>}
          {editingScene===i && onChange ? <VisualDocumentEditor key={`scene-${i}`} renderImage={renderMarkdown} content={sceneEditableBody(scene)}
            onChange={body=>{
              try {onChange(replaceSceneBody(contentRef.current,i,body,scene.raw));setEditError('');}
              catch(error){setEditError(error instanceof Error?error.message:'장면 수정에 실패했습니다.');}
            }} /> : renderMarkdown(scene.body)}
        </div>
        {layout.pageNumbers && !scene.cover && <span style={{ position:'absolute', bottom:'3mm', right:'6mm', fontSize:'10pt' }}>{i+1}</span>}
      </section>;
    })}
  </div>;
}
