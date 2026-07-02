"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Youtube, Code, Play, Check, Video, Upload, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import { supabase } from '@/lib/supabaseClient';

interface YoutubeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (code: string) => void;
  isDarkMode: boolean;
  targetFolder?: string;
}

export default function YoutubeModal({ isOpen, onClose, onInsert, isDarkMode, targetFolder }: YoutubeModalProps) {
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pasteRef = useRef<HTMLDivElement>(null);

  // Single source: URL or file path
  const [sourceUrl, setSourceUrl] = useState("");
  const [appliedPath, setAppliedPath] = useState("");

  // Common controls
  const [videoWidth, setVideoWidth] = useState("100%");
  const [videoHeight, setVideoHeight] = useState("400");
  const [videoAlign, setVideoAlign] = useState<'left' | 'center' | 'right'>('center');

  // YouTube-specific
  const [ytInsertType, setYtInsertType] = useState<'iframe' | 'thumbnail'>('iframe');

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Detect YouTube ──
  const detectedVideoId = useMemo(() => {
    const url = sourceUrl.trim();
    if (!url) return "";
    if (url.includes("<iframe")) {
      const srcMatch = url.match(/src=["']([^"']+)["']/);
      if (srcMatch && srcMatch[1]) {
        const idMatch = srcMatch[1].match(/\/embed\/([^/?#]+)/);
        if (idMatch) return idMatch[1];
      }
    }
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : "";
  }, [sourceUrl]);

  const isYoutube = !!detectedVideoId;
  const embedUrl = `https://www.youtube.com/embed/${detectedVideoId}?rel=0&modestbranding=1`;

  // Auto shorts detection
  useEffect(() => {
    if (sourceUrl.includes("/shorts/")) {
      setVideoWidth("315");
      setVideoHeight("560");
    } else if (!isYoutube) {
      setVideoWidth("100%");
      setVideoHeight("400");
    }
  }, [sourceUrl, isYoutube]);

  // ── File / clipboard upload ──
  const uploadVideo = async (file: File, base64Data: string) => {
    const fileName = `video_${Date.now()}.${file.name.split('.').pop() || 'mp4'}`;
    const api = (window as any).electronAPI;
    if (api) {
      let finalPath = '';
      let r2Success = false;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const resp = await fetch('https://onrivi.com/api/upload-image', {
          method: 'POST', headers,
          body: JSON.stringify({ base64Data, targetFolder: targetFolder || '', fileName }),
        });
        if (resp.ok) {
          const d = await resp.json();
          if (d.status === 'success' && d.relativePath) {
            finalPath = d.relativePath;
            r2Success = true;
          }
        }
      } catch {}
      if (!r2Success) {
        const saveResult = await api.saveImage(targetFolder || '', base64Data, fileName);
        if (saveResult && saveResult.success) {
          finalPath = saveResult.isRelative ? `assets/${fileName}` : `media://local/serve?url=${encodeURIComponent(saveResult.absolutePath)}`;
        }
      }
      if (finalPath) {
        setSourceUrl(finalPath);
        setAppliedPath(finalPath);
        showToast(r2Success ? 'R2 업로드 완료' : 'R2 실패 — 로컬 assets 저장', r2Success ? 'success' : 'error');
      } else {
        showToast('동영상 저장 실패', 'error');
      }
    } else {
      const blobPreview = URL.createObjectURL(file);
      setSourceUrl(blobPreview);
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
            setSourceUrl(data.relativePath);
            setAppliedPath(data.relativePath);
            showToast('클라우드 업로드 완료', 'success');
          } else {
            showToast('업로드 실패: ' + (data.error || ''), 'error');
          }
        } else {
          showToast(`서버 오류 (${response.status})`, 'error');
        }
      } catch (err) {
        console.error(err);
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

  const resolveClipboardFile = async (e: React.ClipboardEvent<HTMLDivElement>): Promise<File | null> => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('video/') || items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) return file;
        }
      }
    }
    const files = e.clipboardData?.files;
    if (files && files.length > 0) return files[0];
    return null;
  };

  const handlePasteEvent = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    const file = await resolveClipboardFile(e);
    if (!file) {
      showToast('클립보드에 동영상/이미지 파일이 없습니다.', 'error');
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    readFile(file);
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

  // ── Clean path ──
  const cleanPath = useMemo(() => {
    let raw = sourceUrl.trim();
    const srcMatch = raw.match(/src=["']([^"']+)["']/);
    const mdMatch = raw.match(/!\[[^\]]*\]\(([^)]*)\)/);
    let url = raw;
    if (srcMatch) url = srcMatch[1];
    else if (mdMatch) url = mdMatch[1];
    url = url.replace(/^[\("'\s]+|[\)"'\s]+$/g, '');
    url = url.replace(/[\?&](?:width|height|w|h)=[^&]*/gi, '');
    return url;
  }, [sourceUrl]);

  // ── Generated code ──
  const generatedCode = useMemo(() => {
    if (isYoutube) {
      if (ytInsertType === 'iframe') {
        return `<iframe width="${videoWidth}" height="${videoHeight}" src="${embedUrl}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen data-align="${videoAlign}"></iframe>`;
      } else {
        return `[![YouTube Video](https://img.youtube.com/vi/${detectedVideoId}/0.jpg)](https://www.youtube.com/watch?v=${detectedVideoId})`;
      }
    }
    const path = appliedPath || cleanPath;
    if (!path) return "";
    const params: string[] = [];
    if (videoWidth.trim() && videoWidth !== "100%") params.push(`width=${encodeURIComponent(videoWidth.trim())}`);
    if (videoHeight.trim() && videoHeight !== "400") params.push(`height=${encodeURIComponent(videoHeight.trim())}`);
    if (videoAlign && videoAlign !== 'left') params.push(`align=${videoAlign}`);
    let src = path;
    if (params.length > 0) src += (src.includes('?') ? '&' : '?') + params.join('&');
    return `<video controls src="${src}"></video>`;
  }, [isYoutube, detectedVideoId, ytInsertType, videoWidth, videoHeight, videoAlign, embedUrl, appliedPath, cleanPath]);

  const canInsert = isYoutube ? true : !!(appliedPath || cleanPath);

  const handleInsert = () => {
    if (!canInsert) {
      showToast(isYoutube ? '올바른 유튜브 링크를 입력해주세요.' : '동영상 파일을 선택하거나 URL을 입력해주세요.', 'warning');
      return;
    }
    onInsert(`\n${generatedCode}\n`);
    setSourceUrl("");
    setAppliedPath("");
    setVideoWidth("100%");
    setVideoHeight("400");
    setVideoAlign("center");
    onClose();
    showToast("동영상이 본문에 삽입되었습니다.", "success");
  };

  if (!isOpen) return null;
  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 dark:bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className={`relative w-full max-w-[520px] shadow-2xl rounded-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border ${
        isDarkMode ? 'bg-[#1e2022] border-[#44474e]' : 'bg-white border-[#c1c6d7]'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDarkMode ? 'border-[#44474e] bg-[#181c20]' : 'border-[#c1c6d7] bg-[#f7f9ff]'
        }`}>
          <div className="flex items-center gap-2">
            <Video size={20} className={isYoutube ? 'text-red-500' : 'text-blue-500'} />
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-blue-300' : 'text-[#181c20]'}`}>동영상 삽입</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 text-on-surface overflow-y-auto max-h-[70vh] no-scrollbar">
          {/* Source: file picker + URL input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block">동영상 URL 또는 파일</label>
            <div className="flex gap-2">
              <input type="text" value={sourceUrl} onChange={(e) => { setSourceUrl(e.target.value); setAppliedPath(""); }}
                placeholder="YouTube URL, 동영상 URL, 또는 파일 선택"
                className={`flex-1 border px-3 py-2 rounded-lg outline-none transition-all text-sm ${
                  isDarkMode ? 'bg-[#282a2f] border-[#44474e] text-white focus:border-blue-400' : 'bg-white border-[#c1c6d7] focus:border-blue-600'
                }`} />
              <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={handleFileSelect} />
              <button onClick={() => fileInputRef.current?.click()}
                className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all active:scale-95 flex items-center gap-1.5 ${
                  isDarkMode ? 'bg-[#33373b] border-[#44474e] text-blue-300 hover:bg-[#44474e]' : 'bg-[#ebeef3] border-[#c1c6d7] text-gray-700 hover:bg-[#e0e3e8]'
                }`}><Upload size={14} />찾아보기</button>
            </div>
            <p className="text-[10px] text-gray-400">YouTube URL, MP4/WebM/Ogg URL, 또는 파일 선택 (최대 100MB)</p>
          </div>

          {/* URL apply button (for non-YouTube direct URLs) */}
          {sourceUrl.trim() && !isYoutube && !appliedPath && (
            <button onClick={handleApplyUrl}
              className={`w-full py-2 rounded-lg text-xs font-medium border transition-all active:scale-95 ${
                isDarkMode ? 'bg-[#1e3a5f] border-[#2d5a8e] text-blue-200 hover:bg-[#2d5a8e]' : 'bg-[#d9e6f7] border-[#7a9ec7] text-[#1a4a7a] hover:bg-[#c5d7ef]'
              }`}>
              <LinkIcon size={14} className="inline mr-1 -mt-0.5" />URL 적용
            </button>
          )}

          {/* Applied path display */}
          {appliedPath && !isYoutube && (
            <div className={`p-2.5 border rounded-lg text-xs flex items-center gap-2 ${
              isDarkMode ? 'bg-[#282a2f] border-[#44474e] text-green-300' : 'bg-[#e8f5e9] border-[#a5d6a7] text-green-700'
            }`}>
              <Check size={13} />
              <span className="truncate flex-1">적용 경로: {appliedPath}</span>
            </div>
          )}

          {/* YouTube insert type */}
          {isYoutube && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block">삽입 방식</label>
              <div className={`p-1 rounded-lg flex border ${
                isDarkMode ? 'bg-[#282a2f] border-[#44474e]' : 'bg-[#f1f4f9] border-[#c1c6d7]/60'
              }`}>
                <button onClick={() => setYtInsertType('iframe')}
                  className={`flex-1 py-2 rounded-md text-xs font-medium transition-all active:scale-[0.98] ${
                    ytInsertType === 'iframe'
                      ? isDarkMode ? 'bg-[#33373b] text-blue-300 shadow-sm border border-[#44474e]' : 'bg-white border border-[#c1c6d7]/50 text-blue-600 shadow-sm font-semibold'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}>미리보기 직접 재생 (Iframe)</button>
                <button onClick={() => setYtInsertType('thumbnail')}
                  className={`flex-1 py-2 rounded-md text-xs font-medium transition-all active:scale-[0.98] ${
                    ytInsertType === 'thumbnail'
                      ? isDarkMode ? 'bg-[#33373b] text-blue-300 shadow-sm border border-[#44474e]' : 'bg-white border border-[#c1c6d7]/50 text-blue-600 shadow-sm font-semibold'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}>썸네일 링크 삽입 (Markdown)</button>
              </div>
            </div>
          )}

          {/* Size + Alignment (YouTube iframe or non-YouTube) */}
          {(!isYoutube || ytInsertType === 'iframe') && (
            <>
              <div className="flex gap-4 items-center justify-between p-3 rounded-lg border border-dashed text-xs text-gray-500 dark:text-gray-400 bg-black/5 dark:bg-white/5 border-zinc-200 dark:border-zinc-800">
                <span className="font-medium">플레이어 크기</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-400">너비:</span>
                    <input type="text" value={videoWidth} onChange={(e) => setVideoWidth(e.target.value)}
                      className={`w-14 border px-2 py-1 rounded outline-none text-center text-xs transition-all ${
                        isDarkMode ? 'bg-[#282a2f] border-[#44474e] text-white focus:border-blue-400' : 'bg-white border-[#c1c6d7] focus:border-blue-600'
                      }`} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-400">세로:</span>
                    <input type="text" value={videoHeight} onChange={(e) => setVideoHeight(e.target.value)}
                      className={`w-14 border px-2 py-1 rounded outline-none text-center text-xs transition-all ${
                        isDarkMode ? 'bg-[#282a2f] border-[#44474e] text-white focus:border-blue-400' : 'bg-white border-[#c1c6d7] focus:border-blue-600'
                      }`} />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 p-3 rounded-lg border border-dashed text-xs text-gray-500 dark:text-gray-400 bg-black/5 dark:bg-white/5 border-zinc-200 dark:border-zinc-800">
                <span className="font-medium">정렬</span>
                <div className="flex gap-1.5 ml-auto">
                  {([['left', '왼쪽'], ['center', '가운데'], ['right', '오른쪽']] as const).map(([val, label]) => (
                    <button key={val} onClick={() => setVideoAlign(val)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                        videoAlign === val
                          ? isDarkMode ? 'bg-[#33373b] text-blue-300' : 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                      }`}>{label}</button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Paste area */}
          <div ref={pasteRef} tabIndex={0} onPaste={handlePasteEvent} onClick={(e) => e.currentTarget.focus()}
            className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all focus:ring-2 focus:ring-blue-500 outline-none ${
              isDarkMode ? 'border-[#44474e] bg-[#282a2f] hover:border-blue-400 text-gray-400 focus:border-blue-400' : 'border-[#c1c6d7] bg-gray-50 hover:border-blue-600 text-gray-500 focus:border-blue-600'
            }`}>
            <p className="text-xs font-semibold">클릭 후 Ctrl+V</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500">클립보드 동영상 파일 붙여넣기</p>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block">미리보기</label>
            <div className={`rounded-xl border border-dashed flex items-center justify-center overflow-hidden bg-black/5 dark:bg-white/5 ${
              isDarkMode ? 'border-[#444755]' : 'border-[#c1c6d7]'
            }`} style={{ minHeight: '200px' }}>
              {isYoutube ? (
                ytInsertType === 'iframe' ? (
                  <div className="w-full aspect-video bg-black relative">
                    <iframe title="YouTube Preview" width="100%" height="100%" src={embedUrl} frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen className="absolute inset-0 w-full h-full" />
                  </div>
                ) : (
                  <div className="relative w-full aspect-video bg-zinc-950 flex items-center justify-center">
                    <img src={`https://img.youtube.com/vi/${detectedVideoId}/maxresdefault.jpg`} alt="YouTube Thumbnail"
                      className="w-full h-full object-cover opacity-85"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${detectedVideoId}/0.jpg`; }} />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                      <div className="w-14 h-14 rounded-full bg-blue-600/90 flex items-center justify-center shadow-lg text-white">
                        <Play className="w-5 h-5 fill-white translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                )
              ) : (appliedPath || cleanPath) ? (
                <video controls src={appliedPath || cleanPath}
                  style={{ maxWidth: '100%', maxHeight: '300px' }}
                  onError={() => {}} />
              ) : (
                <div className="text-center p-6 text-gray-400">
                  <Video size={48} className="mx-auto mb-2 opacity-20" />
                  <p className="text-xs">동영상 URL을 입력하거나 파일을 선택하면<br/>여기에 미리보기가 표시됩니다.</p>
                </div>
              )}
            </div>
            {isYoutube && ytInsertType === 'iframe' && (
              <div className={`mt-1.5 text-[10px] px-2 py-1 rounded flex items-center gap-1.5 ${isDarkMode ? 'text-yellow-400 bg-yellow-400/10' : 'text-yellow-700 bg-yellow-50'}`}>
                ⚠️ 일부 영상은 업로더가 외부 재생을 차단합니다. &apos;썸네일 링크 삽입&apos; 방식으로 전환해보세요.
              </div>
            )}
          </div>

          {/* Code snippet */}
          {generatedCode && (
            <div className={`p-2.5 border rounded-lg flex items-center gap-2.5 text-xs ${
              isDarkMode ? 'bg-[#282a2f] border-[#44474e] text-gray-300' : 'bg-[#f1f4f9] border-[#c1c6d7] text-gray-600'
            }`}>
              <Code size={13} className="text-gray-400 shrink-0" />
              <code className="text-[10px] font-mono truncate select-all flex-1">{generatedCode}</code>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex justify-end items-center gap-2 ${
          isDarkMode ? 'border-[#44474e] bg-[#1d2024]' : 'border-[#c1c6d7] bg-[#f1f4f9]'
        }`}>
          <button onMouseDown={(e) => e.preventDefault()} onClick={onClose}
            className={`px-6 py-2 border rounded-lg text-xs font-medium transition-all active:scale-95 ${
              isDarkMode ? 'bg-[#1e2022] border-[#44474e] text-gray-400 hover:bg-[#282a2f]' : 'bg-white border-[#c1c6d7] text-gray-600 hover:bg-gray-50'
            }`}>취소</button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={handleInsert} disabled={!canInsert}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center gap-2 ${
              canInsert
                ? 'bg-[#005bc1] text-white hover:brightness-110 shadow-sm'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed opacity-50 shadow-none'
            }`}>
            <Check size={14} />마크다운 코드 삽입
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
