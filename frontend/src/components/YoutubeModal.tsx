"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Video, Upload, ExternalLink, Play, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import { loadSecureData } from '@/lib/secureStorage';
import { supabase } from '@/lib/supabaseClient';

interface YoutubeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (code: string) => void;
  isDarkMode: boolean;
  targetFolder?: string;
  initialUrl?: string;
  resourceFolderHandle?: any;
  workspaceType?: string;
  rootFolder?: any;
  resourceFolder?: string | null;
}

// ====================================================================
// 📊 [OMD-EDIT-YoutubeModal-0003] YoutubeModal ➔ YoutubeModal
// 🎯 @KICK  : 동영상 링크 삽입 모달 - YouTube/동영상 URL 및 파일 업로드, 썸네일 미리보기, 고급 테마 마크업
// 🛡️ @GUARD : isOpen/mounted false 시 null 반환
// 🚨 @PATCH : 2026-07-15 — 이미지 삽입 모달과 동일한 2단 분할 레이아웃(좌측 입력/우측 미리보기)으로 UI 전면 교체
// 🔗 @CALLS : uploadVideo, handleFileSelect, handleApplyUrl, handleInsert, createPortal
// ====================================================================
export default function YoutubeModal({
  isOpen,
  onClose,
  onInsert,
  isDarkMode,
  targetFolder,
  initialUrl,
  resourceFolderHandle,
  workspaceType,
  rootFolder,
  resourceFolder,
}: YoutubeModalProps) {
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sourceUrl, setSourceUrl] = useState("");
  const [appliedPath, setAppliedPath] = useState("");
  const [customDisplayName, setCustomDisplayName] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && initialUrl) {
      setSourceUrl(initialUrl);
      setAppliedPath(initialUrl);
    } else if (!isOpen) {
      setSourceUrl("");
      setAppliedPath("");
      setCustomDisplayName("");
    }
  }, [isOpen, initialUrl]);

  const uploadVideo = async (file: File, base64Data: string) => {
    const ext = file.name.split('.').pop() || 'mp4';
    const fileName = file.name ? file.name.replace(/\s+/g, '_') : `video_${Date.now()}.${ext}`;
    const api = (window as any).electronAPI;
    if (api) {
      // 🖥️ 데스크탑: 무조건 로컬(resourceFolder) 저장
      const freshResourceFolder = loadSecureData<string>('resourceFolder') || resourceFolder;
      const effectiveTargetFolder = freshResourceFolder
        ? freshResourceFolder + '\\media'
        : (targetFolder || '');
      const saveResult = await api.saveImage(effectiveTargetFolder, base64Data, fileName);
      if (saveResult && saveResult.success) {
        const finalPath = saveResult.mediaPath
          ? saveResult.mediaPath
          : `media://local/serve?url=${encodeURIComponent(saveResult.absolutePath)}`;
        setSourceUrl(finalPath);
        setAppliedPath(finalPath);
        showToast('동영상이 로컬 폴더에 저장되었습니다.', 'success');
      } else {
        showToast('동영상 저장 실패', 'error');
      }
    } else {
      setSourceUrl(URL.createObjectURL(file));
      let finalPath = '';
      if (workspaceType === 'browser' || workspaceType === 'local') {
        try {
          if (resourceFolderHandle) {
            const mediaDir = await resourceFolderHandle.getDirectoryHandle('media', { create: true });
            const fileHandle = await mediaDir.getFileHandle(fileName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(file);
            await writable.close();
            finalPath = `/media/${fileName}`;
          } else if (rootFolder?.handle) {
            const assetsDir = await rootFolder.handle.getDirectoryHandle('assets', { create: true });
            const fileHandle = await assetsDir.getFileHandle(fileName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(file);
            await writable.close();
            finalPath = `/assets/${fileName}`;
          }
        } catch (e) {
          console.error('브라우저 로컬 저장 실패:', e);
        }
      }
      if (finalPath) {
        setAppliedPath(finalPath);
        showToast('로컬 폴더에 저장되었습니다.', 'success');
        return;
      }
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        const isDev = process.env.NODE_ENV === 'development';
        const uploadEndpoint = isDev ? '/api/upload-pasted-image' : '/api/upload-image';
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const response = await fetch(uploadEndpoint, {
          method: 'POST', headers,
          body: JSON.stringify({ base64Data, targetFolder: targetFolder || '' }),
        });
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'success' && data.relativePath) {
            setAppliedPath(data.relativePath);
            showToast('동영상이 업로드되었습니다.', 'success');
          } else {
            showToast('서버 저장 실패', 'error');
          }
        } else {
          showToast(`서버 오류 (${response.status})`, 'error');
        }
      } catch (err) {
        showToast('네트워크 오류', 'error');
      }
    }
  };

  const readFile = (file: File) => {
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast('동영상 크기는 100MB를 초과할 수 없습니다.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      if (base64) uploadVideo(file, base64);
    };
    reader.onerror = () => showToast('파일 읽기 실패', 'error');
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  };

  const handleApplyUrl = () => {
    const url = sourceUrl.trim();
    if (!url) {
      showToast('URL을 입력해주세요.', 'warning');
      return;
    }
    setAppliedPath(url);
    showToast('URL이 적용되었습니다.', 'success');
  };

  const cleanPath = useMemo(() => {
    let raw = sourceUrl.trim();
    const srcMatch = raw.match(/src=["']([^"']+)["']/);
    const mdMatch = raw.match(/!\[[^\]]*\]\(([^)]*)\)/);
    if (srcMatch) raw = srcMatch[1];
    else if (mdMatch) raw = mdMatch[1];
    raw = raw.replace(/^[\("'\s]+|[\)"'\s]+$/g, '');
    return raw;
  }, [sourceUrl]);

  const detectedVideoId = useMemo(() => {
    const url = cleanPath;
    if (!url) return "";
    if (url.includes("<iframe")) {
      const srcMatch = url.match(/src=["']([^"']+)["']/);
      if (srcMatch && srcMatch[1]) {
        const idMatch = srcMatch[1].match(/\/embed\/([^/?#]+)/);
        if (idMatch) return idMatch[1];
      }
    }
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : "";
  }, [cleanPath]);

  const isYoutube = !!detectedVideoId;
  const originalFileName = useMemo(() => {
    if (appliedPath && (appliedPath.startsWith('/media/') || appliedPath.startsWith('./media/'))) {
      return appliedPath.split('/').pop()?.split('?')[0];
    }
    return null;
  }, [appliedPath]);
  const displayName = isYoutube ? 'YouTube 동영상' : (originalFileName || cleanPath.split('/').pop()?.split('?')[0] || '동영상');

  const previewSrc = useMemo(() => {
    let raw = sourceUrl;
    try { if (raw) raw = decodeURI(raw); } catch(e){}
    const isMediaOrAssets = raw && (raw.startsWith('/media/') || raw.startsWith('./media/') || raw.startsWith('/assets/') || raw.startsWith('./assets/'));
    const isRootRelative = raw && raw.startsWith('/');

    if (isMediaOrAssets) {
      const api = typeof window !== 'undefined' ? (window as any).electronAPI : null;
      if (api) {
        const freshRF = loadSecureData<string>('resourceFolder') || resourceFolder;
        if (freshRF) {
          const sep = freshRF.includes('\\') ? '\\' : '/';
          const cleanRoot = freshRF.endsWith(sep) ? freshRF.slice(0, -1) : freshRF;
          const strippedPath = raw.startsWith('./') ? raw.substring(1) : raw;
          const normalizedSrc = sep === '\\' ? strippedPath.replace(/\//g, '\\') : strippedPath;
          const absolutePath = cleanRoot + normalizedSrc;
          return `media-local://serve?url=${encodeURIComponent(absolutePath)}`;
        } else if (targetFolder) {
          const sep = targetFolder.includes('\\') ? '\\' : '/';
          let rawDir = targetFolder;
          if (rawDir.endsWith('.md') || rawDir.endsWith('.markdown')) {
            rawDir = rawDir.substring(0, Math.max(rawDir.lastIndexOf('\\'), rawDir.lastIndexOf('/')));
          }
          const cleanRoot = rawDir.endsWith(sep) ? rawDir.slice(0, -1) : rawDir;
          const strippedPath = raw.startsWith('./') ? raw.substring(1) : raw;
          const normalizedSrc = sep === '\\' ? strippedPath.replace(/\//g, '\\') : strippedPath;
          const absolutePath = cleanRoot + normalizedSrc;
          return `media-local://serve?url=${encodeURIComponent(absolutePath)}`;
        }
      }
    } else if (isRootRelative) {
      const api = typeof window !== 'undefined' ? (window as any).electronAPI : null;
      if (api && targetFolder) {
          const sep = targetFolder.includes('\\') ? '\\' : '/';
          let rawDir = targetFolder;
          if (rawDir.endsWith('.md') || rawDir.endsWith('.markdown')) {
            rawDir = rawDir.substring(0, Math.max(rawDir.lastIndexOf('\\'), rawDir.lastIndexOf('/')));
          }
          const cleanRoot = rawDir.endsWith(sep) ? rawDir.slice(0, -1) : rawDir;
          const normalizedSrc = sep === '\\' ? raw.replace(/\//g, '\\') : raw;
          const absolutePath = cleanRoot + normalizedSrc;
          return `media-local://serve?url=${encodeURIComponent(absolutePath)}`;
      }
    }
    return raw;
  }, [sourceUrl, resourceFolder]);

  const handleInsert = () => {
    const url = appliedPath || cleanPath;
    if (!url) {
      showToast('동영상 URL을 입력하거나 파일을 선택해주세요.', 'warning');
      return;
    }
    const finalDisplayName = customDisplayName.trim() || displayName;
    const linkUrl = isYoutube ? `https://www.youtube.com/watch?v=${detectedVideoId}` : url;
    onInsert(`\n[${finalDisplayName}](${linkUrl})\n`);
    setSourceUrl("");
    setAppliedPath("");
    setCustomDisplayName("");
    onClose();
    showToast("동영상 링크가 본문에 삽입되었습니다.", "success");
  };

  if (!isOpen) return null;
  if (!mounted) return null;

  const hasContent = !!(appliedPath || cleanPath);

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6" style={{ overflowY: "auto" }}>
      <div className="absolute inset-0 bg-black/65" onClick={onClose} />

      {/* PREMIUM WIDE MODAL — 동영상 삽입 */}
      <div
        className={`relative w-full max-w-5xl rounded-lg shadow-2xl overflow-hidden flex flex-col border animate-in zoom-in-95 duration-200 ${
          isDarkMode
            ? 'bg-zinc-950 border-zinc-800 text-zinc-100'
            : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}
      >
        {/* Header */}
        <div className={`flex justify-between items-center px-6 py-4 border-b shrink-0 ${
          isDarkMode ? 'border-zinc-800 bg-zinc-900' : 'border-slate-200 bg-white'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded flex items-center justify-center ${
              isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-600/10 text-indigo-600'
            }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                <path d="m22 8-6 4 6 4V8Z" />
                <rect height="12" rx="2" width="14" x="2" y="6" />
              </svg>
            </div>
            <h2 className="text-sm font-bold tracking-tight text-indigo-600 dark:text-indigo-400">동영상 링크 삽입</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1.5 transition-colors rounded-full active:scale-95"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body: 2-column split */}
        <div className="flex flex-col md:flex-row min-h-0">

          {/* ─── LEFT PANEL ─── */}
          <div className={`flex flex-col gap-3 p-5 md:w-[52%] border-r ${
            isDarkMode ? 'border-zinc-800' : 'border-slate-200'
          }`}>

            {/* 동영상 URL / 파일 */}
            <div className={`rounded-lg p-4 border ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
            }`}>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-2 block">
                동영상 URL 또는 파일
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sourceUrl}
                  onChange={(e) => { setSourceUrl(e.target.value); setAppliedPath(""); }}
                  placeholder="YouTube URL, 동영상 URL, 또는 파일 선택"
                  className={`w-full font-mono text-xs border rounded px-3 py-2.5 outline-none transition-all ${
                    isDarkMode
                      ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30'
                      : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20'
                  }`}
                />
                <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={handleFileSelect} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`px-4 py-2.5 border rounded font-bold text-xs transition-colors shrink-0 flex items-center gap-1.5 ${
                    isDarkMode
                      ? 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                      : 'border-slate-300 bg-white text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300'
                  }`}
                >
                  <Upload size={12} />
                  찾아보기
                </button>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono mt-2 leading-relaxed">
                YouTube URL 또는 MP4/WebM/Ogg 파일 (최대 100MB)
              </p>

              {/* URL 적용 버튼 */}
              {sourceUrl.trim() && !appliedPath && (
                <button
                  onClick={handleApplyUrl}
                  className="mt-3 w-full py-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors border border-indigo-100 dark:border-indigo-900/60"
                >
                  URL 적용
                </button>
              )}

              {/* 적용 완료 배지 */}
              {appliedPath && (
                <div className={`mt-2 px-3 py-1.5 rounded text-[10px] font-mono flex items-center gap-1.5 ${
                  isDarkMode ? 'bg-zinc-800 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                }`}>
                  <Check size={11} />
                  <span className="truncate">{appliedPath}</span>
                </div>
              )}
            </div>

            {/* 표시 이름 */}
            <div className={`rounded-lg p-4 border ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
            }`}>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-2 block">
                표시 이름 <span className="normal-case font-normal text-slate-400">(선택사항)</span>
              </label>
              <input
                type="text"
                value={customDisplayName}
                onChange={(e) => setCustomDisplayName(e.target.value)}
                placeholder="표시할 이름 (미입력 시 자동 설정)"
                className={`w-full text-xs border rounded px-3 py-2.5 outline-none focus:ring-1 transition-all ${
                  isDarkMode
                    ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-600 focus:border-indigo-500 focus:ring-indigo-500/30'
                    : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500/20'
                }`}
              />
            </div>

            {/* 삽입 방식 안내 */}
            <div className={`rounded-lg p-4 border flex gap-3 ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
            }`}>
              <ExternalLink size={14} className="text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-zinc-200 leading-none mb-1">새 창 열기 링크로 삽입됩니다</p>
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 leading-normal">
                  동영상 링크를 클릭하면 새 브라우저 창에서 재생됩니다.
                </p>
              </div>
            </div>
          </div>

          {/* ─── RIGHT PANEL: Preview ─── */}
          <div className={`flex flex-col md:w-[48%] ${
            isDarkMode ? 'bg-zinc-900' : 'bg-white'
          }`}>
            <div className={`px-5 py-3 border-b flex items-center gap-2 ${
              isDarkMode ? 'border-zinc-800 bg-zinc-900' : 'border-slate-200 bg-slate-50'
            }`}>
              <Video size={12} className="text-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                미리보기
              </span>
              {hasContent && (
                <span className="ml-auto text-[9px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                  ● LIVE
                </span>
              )}
            </div>

            <div className="flex-grow flex flex-col p-5 gap-3">
              {/* 썸네일 / 동영상 미리보기 영역 */}
              <div className={`relative flex-grow rounded-lg overflow-hidden border flex items-center justify-center ${
                isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-100 border-slate-200'
              }`} style={{ minHeight: '280px' }}>
                {hasContent ? (
                  <>
                    <div className="relative w-full h-full group">
                      <div className="aspect-video w-full bg-slate-900/90 flex items-center justify-center">
                        {isYoutube ? (
                          <img
                            src={`https://img.youtube.com/vi/${detectedVideoId}/maxresdefault.jpg`}
                            alt="Video Thumbnail"
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${detectedVideoId}/0.jpg`; }}
                          />
                        ) : (
                          <video 
                            src={previewSrc} 
                            controls 
                            className="w-full h-full object-contain"
                            preload="metadata"
                          />
                        )}
                        {/* 유튜브일 때만 커스텀 플레이 오버레이 표시 */}
                        {isYoutube && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                              <Play size={18} className="text-indigo-600 fill-indigo-600 ml-0.5" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* 메타데이터 오버레이 */}
                    <div className={`absolute bottom-0 inset-x-0 px-4 py-2.5 border-t flex gap-4 items-center ${
                      isDarkMode ? 'bg-zinc-900/95 border-zinc-700' : 'bg-white/95 border-slate-200'
                    }`}>
                      <div>
                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Source</div>
                        <div className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {isYoutube ? 'YOUTUBE' : 'LOCAL'}
                        </div>
                      </div>
                      {isYoutube && (
                        <div>
                          <div className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Video ID</div>
                          <div className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {detectedVideoId}
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Status</div>
                        <div className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {appliedPath ? 'APPLIED' : 'PREVIEW'}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-8">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                      isDarkMode ? 'bg-zinc-700' : 'bg-slate-200'
                    }`}>
                      <Video size={28} className="text-slate-400 dark:text-zinc-500" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 leading-relaxed">
                      YouTube URL 또는<br />동영상 파일을 입력하면<br />여기에 미리보기가 표시됩니다
                    </p>
                  </div>
                )}
              </div>

              {/* 삽입 코드 미리보기 */}
              {hasContent && (
                <div className={`rounded-lg px-4 py-3 border ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className="font-black uppercase text-[9px] tracking-widest text-slate-400 dark:text-zinc-500">삽입 코드 미리보기</span>
                  <div className={`mt-1.5 font-mono text-[10px] truncate ${
                    isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
                  }`}>
                    [{customDisplayName.trim() || displayName}]({isYoutube ? `https://www.youtube.com/watch?v=${detectedVideoId}` : (appliedPath || cleanPath)})
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex items-center justify-between gap-3 shrink-0 ${
          isDarkMode ? 'border-zinc-800 bg-zinc-900' : 'border-slate-200 bg-slate-50'
        }`}>
          {/* 브랜드 인디케이터 */}
          <div className="flex items-center gap-3 font-mono text-[9px] text-slate-400 dark:text-zinc-600 uppercase tracking-widest font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              ONRIVI AUTHOR
            </div>
            <span>ENGINE: LOCAL_FIRST_V3</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="font-bold text-xs text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-2 px-3"
            >
              취소
            </button>
            <button
              onClick={handleInsert}
              disabled={!hasContent}
              className={`px-6 py-2.5 rounded font-bold text-xs flex items-center gap-2 transition-all active:scale-[0.98] ${
                hasContent
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 cursor-not-allowed'
              }`}
            >
              <LinkIcon size={13} />
              동영상 삽입
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
