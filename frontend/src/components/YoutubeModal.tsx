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

type TabType = 'youtube' | 'internal';

export default function YoutubeModal({ isOpen, onClose, onInsert, isDarkMode, targetFolder }: YoutubeModalProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('youtube');
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pasteRef = useRef<HTMLDivElement>(null);

  // ── YouTube state ──
  const [inputUrl, setInputUrl] = useState("");
  const [width, setWidth] = useState("100%");
  const [height, setHeight] = useState("400");
  const [insertType, setInsertType] = useState<'iframe' | 'thumbnail'>('iframe');
  const [align, setAlign] = useState<'left' | 'center' | 'right'>('center');

  // ── Internal video state ──
  const [videoPath, setVideoPath] = useState("");
  const [appliedVideoPath, setAppliedVideoPath] = useState("");
  const [videoWidth, setVideoWidth] = useState("");
  const [videoHeight, setVideoHeight] = useState("");
  const [videoAlign, setVideoAlign] = useState<'left' | 'center' | 'right'>('center');

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── YouTube logic ──
  const videoId = useMemo(() => {
    if (!inputUrl.trim()) return "";
    if (inputUrl.includes("<iframe")) {
      const srcMatch = inputUrl.match(/src=["']([^"']+)["']/);
      if (srcMatch && srcMatch[1]) {
        const url = srcMatch[1];
        const idMatch = url.match(/\/embed\/([^/?#]+)/);
        if (idMatch) return idMatch[1];
      }
    }
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = inputUrl.match(regExp);
    return (match && match[2].length === 11) ? match[2] : "";
  }, [inputUrl]);

  useEffect(() => {
    if (inputUrl.includes("/shorts/")) {
      setWidth("315");
      setHeight("560");
    } else {
      setWidth("100%");
      setHeight("400");
    }
  }, [inputUrl]);

  const embedUrl = useMemo(() => {
    if (!videoId) return "";
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  }, [videoId]);

  const generatedYouTubeCode = useMemo(() => {
    if (!videoId) return "";
    if (insertType === 'iframe') {
      return `<iframe width="${width}" height="${height}" src="${embedUrl}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen data-align="${align}"></iframe>`;
    } else {
      return `[![YouTube Video](https://img.youtube.com/vi/${videoId}/0.jpg)](https://www.youtube.com/watch?v=${videoId})`;
    }
  }, [videoId, insertType, width, height, embedUrl, align]);

  const handleYouTubeInsert = () => {
    if (!videoId) {
      showToast("올바른 유튜브 링크나 소스코드를 입력해주세요.", "warning");
      return;
    }
    onInsert(`\n${generatedYouTubeCode}\n`);
    setInputUrl("");
    onClose();
    showToast("유튜브 영상이 본문에 삽입되었습니다.", "success");
  };

  // ── Internal video: R2 → local fallback (like ImageModal) ──
  const uploadInternalVideo = async (file: File, base64Data: string) => {
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
        setVideoPath(finalPath);
        setAppliedVideoPath(finalPath);
        if (showToast) {
          if (r2Success) showToast('R2 업로드 완료', 'success');
          else showToast('R2 업로드 실패 — 로컬 assets에 저장되었습니다.', 'error');
        }
      } else {
        if (showToast) showToast('동영상 저장 실패', 'error');
      }
    } else {
      const blobPreview = URL.createObjectURL(file);
      setVideoPath(blobPreview);
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
            setVideoPath(data.relativePath);
            setAppliedVideoPath(data.relativePath);
            if (showToast) showToast('클라우드 업로드 완료', 'success');
          } else {
            if (showToast) showToast('동영상 업로드 실패: ' + (data.error || ''), 'error');
          }
        } else {
          if (showToast) showToast(`서버 오류 (${response.status})`, 'error');
        }
      } catch (err) {
        console.error(err);
        if (showToast) showToast('동영상 업로드 중 네트워크 오류', 'error');
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      showToast('동영상 크기는 100MB를 초과할 수 없습니다.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      if (base64) uploadInternalVideo(file, base64);
    };
    reader.onerror = () => showToast('파일 읽기 실패', 'error');
    reader.readAsDataURL(file);
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
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast('동영상 크기는 100MB를 초과할 수 없습니다.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      if (base64) uploadInternalVideo(file, base64);
    };
    reader.onerror = () => showToast('클립보드 파일 읽기 실패', 'error');
    reader.readAsDataURL(file);
  };

  // ── Internal video: URL input ──
  const handleVideoUrlApply = () => {
    const url = videoPath.trim();
    if (!url) {
      showToast('동영상 URL을 입력해주세요.', 'warning');
      return;
    }
    setAppliedVideoPath(url);
    if (showToast) showToast('동영상 URL이 적용되었습니다.', 'success');
  };

  const cleanVideoPath = useMemo(() => {
    let raw = videoPath.trim();
    const srcMatch = raw.match(/src=["']([^"']+)["']/);
    const mdMatch = raw.match(/!\[[^\]]*\]\(([^)]*)\)/);
    let url = raw;
    if (srcMatch) url = srcMatch[1];
    else if (mdMatch) url = mdMatch[1];
    url = url.replace(/^[\("'\s]+|[\)"'\s]+$/g, '');
    url = url.replace(/[\?&](?:width|height|w|h)=[^&]*/gi, '');
    return url;
  }, [videoPath]);

  const generatedVideoCode = useMemo(() => {
    const path = appliedVideoPath || cleanVideoPath;
    if (!path) return "";
    const params: string[] = [];
    if (videoWidth.trim()) params.push(`width=${encodeURIComponent(videoWidth.trim())}`);
    if (videoHeight.trim()) params.push(`height=${encodeURIComponent(videoHeight.trim())}`);
    if (videoAlign && videoAlign !== 'left') params.push(`align=${videoAlign}`);
    let src = path;
    if (params.length > 0) src += (src.includes('?') ? '&' : '?') + params.join('&');
    return `<video controls src="${src}"></video>`;
  }, [appliedVideoPath, cleanVideoPath, videoWidth, videoHeight, videoAlign]);

  const handleInternalInsert = () => {
    const path = appliedVideoPath || cleanVideoPath;
    if (!path) {
      showToast('동영상 파일을 선택하거나 URL을 입력해주세요.', 'warning');
      return;
    }
    onInsert(`\n${generatedVideoCode}\n`);
    setVideoPath("");
    setAppliedVideoPath("");
    setVideoWidth("");
    setVideoHeight("");
    setVideoAlign("center");
    onClose();
    showToast("동영상이 본문에 삽입되었습니다.", "success");
  };

  // ── Combined insert ──
  const handleInsert = () => {
    if (activeTab === 'youtube') handleYouTubeInsert();
    else handleInternalInsert();
  };

  const canInsert = activeTab === 'youtube' ? !!videoId : !!(appliedVideoPath || cleanVideoPath);

  if (!isOpen) return null;
  if (!mounted) return null;

  const tabClass = (tab: TabType) =>
    `flex-1 py-2.5 rounded-lg text-xs font-medium transition-all active:scale-[0.98] ${
      activeTab === tab
        ? isDarkMode
          ? 'bg-[#33373b] text-blue-300 shadow-sm border border-[#44474e]'
          : 'bg-white border border-[#c1c6d7]/50 text-blue-600 shadow-sm font-semibold'
        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
    }`;

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
            {activeTab === 'youtube' ? (
              <Youtube size={20} className="text-red-500" />
            ) : (
              <Video size={20} className="text-blue-500" />
            )}
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-blue-300' : 'text-[#181c20]'}`}>
              {activeTab === 'youtube' ? '유튜브 영상 삽입' : '동영상 삽입'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className={`px-6 pt-4 pb-2 ${isDarkMode ? 'bg-[#1e2022]' : 'bg-white'}`}>
          <div className={`p-1 rounded-lg flex border ${
            isDarkMode ? 'bg-[#282a2f] border-[#44474e]' : 'bg-[#f1f4f9] border-[#c1c6d7]/60'
          }`}>
            <button onClick={() => setActiveTab('youtube')} className={tabClass('youtube')}>
              <Youtube size={14} className="inline mr-1.5 -mt-0.5 text-red-500" />유튜브 영상
            </button>
            <button onClick={() => setActiveTab('internal')} className={tabClass('internal')}>
              <Video size={14} className="inline mr-1.5 -mt-0.5 text-blue-500" />동영상 파일
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4 text-on-surface overflow-y-auto max-h-[70vh] no-scrollbar">
          {activeTab === 'youtube' ? (
            <>
              {/* YouTube URL */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block">유튜브 URL 또는 공유 소스코드</label>
                <input type="text" value={inputUrl} onChange={(e) => setInputUrl(e.target.value)}
                  className={`w-full border px-3 py-2 rounded-lg outline-none transition-all text-sm ${
                    isDarkMode ? 'bg-[#282a2f] border-[#44474e] text-white focus:border-blue-400' : 'bg-white border-[#c1c6d7] focus:border-blue-600'
                  }`} placeholder="https://www.youtube.com/watch?v=..." />
              </div>

              {/* Insert type */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block">삽입 방식</label>
                <div className={`p-1 rounded-lg flex border ${
                  isDarkMode ? 'bg-[#282a2f] border-[#44474e]' : 'bg-[#f1f4f9] border-[#c1c6d7]/60'
                }`}>
                  <button onClick={() => setInsertType('iframe')}
                    className={`flex-1 py-2 rounded-md text-xs font-medium transition-all active:scale-[0.98] ${
                      insertType === 'iframe'
                        ? isDarkMode ? 'bg-[#33373b] text-blue-300 shadow-sm border border-[#44474e]' : 'bg-white border border-[#c1c6d7]/50 text-blue-600 shadow-sm font-semibold'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}>미리보기 직접 재생 (Iframe)</button>
                  <button onClick={() => setInsertType('thumbnail')}
                    className={`flex-1 py-2 rounded-md text-xs font-medium transition-all active:scale-[0.98] ${
                      insertType === 'thumbnail'
                        ? isDarkMode ? 'bg-[#33373b] text-blue-300 shadow-sm border border-[#44474e]' : 'bg-white border border-[#c1c6d7]/50 text-blue-600 shadow-sm font-semibold'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}>썸네일 링크 삽입 (Markdown)</button>
                </div>
              </div>

              {insertType === 'iframe' && (
                <>
                  <div className="flex gap-4 items-center justify-between p-3 rounded-lg border border-dashed text-xs text-gray-500 dark:text-gray-400 bg-black/5 dark:bg-white/5 border-zinc-200 dark:border-zinc-800">
                    <span className="font-medium">플레이어 크기</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-400">너비:</span>
                        <input type="text" value={width} onChange={(e) => setWidth(e.target.value)}
                          className={`w-14 border px-2 py-1 rounded outline-none text-center text-xs transition-all ${
                            isDarkMode ? 'bg-[#282a2f] border-[#44474e] text-white focus:border-blue-400' : 'bg-white border-[#c1c6d7] focus:border-blue-600'
                          }`} />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-400">세로:</span>
                        <input type="text" value={height} onChange={(e) => setHeight(e.target.value)}
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
                        <button key={val} onClick={() => setAlign(val)}
                          className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                            align === val
                              ? isDarkMode ? 'bg-[#33373b] text-blue-300' : 'bg-white text-blue-600 shadow-sm'
                              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                          }`}>{label}</button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* YouTube Preview */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block">미리보기</label>
                <div className={`rounded-xl border border-dashed flex items-center justify-center overflow-hidden bg-black/5 dark:bg-white/5 ${
                  isDarkMode ? 'border-[#444755]' : 'border-[#c1c6d7]'
                }`} style={{ minHeight: '200px' }}>
                  {videoId ? (
                    insertType === 'iframe' ? (
                      <div className="w-full aspect-video bg-black relative">
                        <iframe title="YouTube Preview" width="100%" height="100%" src={embedUrl} frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen className="absolute inset-0 w-full h-full" />
                      </div>
                    ) : (
                      <div className="relative w-full aspect-video bg-zinc-950 flex items-center justify-center">
                        <img src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} alt="YouTube Thumbnail"
                          className="w-full h-full object-cover opacity-85"
                          onError={(e) => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/0.jpg`; }} />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                          <div className="w-14 h-14 rounded-full bg-blue-600/90 flex items-center justify-center shadow-lg text-white">
                            <Play className="w-5 h-5 fill-white translate-x-0.5" />
                          </div>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="text-center p-6 text-gray-400">
                      <Youtube size={48} className="mx-auto mb-2 opacity-20" />
                      <p className="text-xs">유효한 유튜브 링크를 입력하면<br/>여기에 미리보기가 표시됩니다.</p>
                    </div>
                  )}
                </div>
              </div>

              {videoId && (
                <div className={`p-2.5 border rounded-lg flex items-center gap-2.5 text-xs ${
                  isDarkMode ? 'bg-[#282a2f] border-[#44474e] text-gray-300' : 'bg-[#f1f4f9] border-[#c1c6d7] text-gray-600'
                }`}>
                  <Code size={13} className="text-gray-400 shrink-0" />
                  <code className="text-[10px] font-mono truncate select-all flex-1">{generatedYouTubeCode}</code>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Internal video: File picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block">동영상 파일 선택</label>
                <div className="flex gap-2">
                  <input type="text" value={videoPath} onChange={(e) => setVideoPath(e.target.value)}
                    placeholder="파일 선택 또는 URL 입력"
                    className={`flex-1 border px-3 py-2 rounded-lg outline-none transition-all text-sm ${
                      isDarkMode ? 'bg-[#282a2f] border-[#44474e] text-white focus:border-blue-400' : 'bg-white border-[#c1c6d7] focus:border-blue-600'
                    }`} />
                  <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={handleFileSelect} />
                  <button onClick={() => fileInputRef.current?.click()}
                    className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all active:scale-95 flex items-center gap-1.5 ${
                      isDarkMode ? 'bg-[#33373b] border-[#44474e] text-blue-300 hover:bg-[#44474e]' : 'bg-[#ebeef3] border-[#c1c6d7] text-gray-700 hover:bg-[#e0e3e8]'
                    }`}><Upload size={14} />찾아보기</button>
                </div>
                <p className="text-[10px] text-gray-400">MP4, WebM, Ogg 지원 (최대 100MB)</p>
              </div>

              {/* Apply URL button */}
              {videoPath.trim() && !appliedVideoPath && (
                <button onClick={handleVideoUrlApply}
                  className={`w-full py-2 rounded-lg text-xs font-medium border transition-all active:scale-95 ${
                    isDarkMode ? 'bg-[#1e3a5f] border-[#2d5a8e] text-blue-200 hover:bg-[#2d5a8e]' : 'bg-[#d9e6f7] border-[#7a9ec7] text-[#1a4a7a] hover:bg-[#c5d7ef]'
                  }`}>
                  <LinkIcon size={14} className="inline mr-1 -mt-0.5" />URL 적용
                </button>
              )}

              {/* Applied path display */}
              {appliedVideoPath && (
                <div className={`p-2.5 border rounded-lg text-xs flex items-center gap-2 ${
                  isDarkMode ? 'bg-[#282a2f] border-[#44474e] text-green-300' : 'bg-[#e8f5e9] border-[#a5d6a7] text-green-700'
                }`}>
                  <Check size={13} />
                  <span className="truncate flex-1">적용 경로: {appliedVideoPath}</span>
                </div>
              )}

              {/* Paste area */}
              <div ref={pasteRef} tabIndex={0} onPaste={handlePasteEvent} onClick={(e) => e.currentTarget.focus()}
                className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all focus:ring-2 focus:ring-blue-500 outline-none ${
                  isDarkMode ? 'border-[#44474e] bg-[#282a2f] hover:border-blue-400 text-gray-400 focus:border-blue-400' : 'border-[#c1c6d7] bg-gray-50 hover:border-blue-600 text-gray-500 focus:border-blue-600'
                }`}>
                <p className="text-xs font-semibold">클릭 후 Ctrl+V</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">클립보드 동영상 파일 붙여넣기</p>
              </div>

              {/* Size + Alignment */}
              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block">가로</label>
                  <input type="text" value={videoWidth} onChange={(e) => setVideoWidth(e.target.value)} placeholder="100%"
                    className={`w-full border px-2 py-2 rounded-lg outline-none transition-all text-sm ${
                      isDarkMode ? 'bg-[#282a2f] border-[#44474e] text-white focus:border-blue-400' : 'bg-white border-[#c1c6d7] focus:border-blue-600'
                    }`} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block">세로</label>
                  <input type="text" value={videoHeight} onChange={(e) => setVideoHeight(e.target.value)} placeholder="auto"
                    className={`w-full border px-2 py-2 rounded-lg outline-none transition-all text-sm ${
                      isDarkMode ? 'bg-[#282a2f] border-[#44474e] text-white focus:border-blue-400' : 'bg-white border-[#c1c6d7] focus:border-blue-600'
                    }`} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block">정렬</label>
                  <div className="flex gap-2">
                    {([['left', '왼쪽'], ['center', '가운데'], ['right', '오른쪽']] as const).map(([val, label]) => (
                      <button key={val} onClick={() => setVideoAlign(val)}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all border ${
                          videoAlign === val
                            ? isDarkMode ? 'bg-[#33373b] text-blue-300 border-[#44474e]' : 'bg-white text-blue-600 border-[#c1c6d7] shadow-sm'
                            : isDarkMode ? 'bg-transparent text-gray-400 border-transparent hover:bg-[#282a2f]' : 'bg-transparent text-gray-500 border-transparent hover:bg-gray-50'
                        }`}>{label}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block">미리보기</label>
                <div className={`rounded-xl border border-dashed flex items-center justify-center overflow-hidden bg-black/5 dark:bg-white/5 ${
                  isDarkMode ? 'border-[#444755]' : 'border-[#c1c6d7]'
                }`} style={{ minHeight: '150px' }}>
                  {(appliedVideoPath || cleanVideoPath) ? (
                    <video controls
                      src={appliedVideoPath || cleanVideoPath}
                      style={{ maxWidth: '100%', maxHeight: '300px' }}
                      onError={() => {}} />
                  ) : (
                    <div className="text-center p-6 text-gray-400">
                      <Video size={48} className="mx-auto mb-2 opacity-20" />
                      <p className="text-xs">동영상 파일을 선택하거나<br/>URL을 입력하면 미리보기가 표시됩니다.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Code snippet */}
              {generatedVideoCode && (
                <div className={`p-2.5 border rounded-lg flex items-center gap-2.5 text-xs ${
                  isDarkMode ? 'bg-[#282a2f] border-[#44474e] text-gray-300' : 'bg-[#f1f4f9] border-[#c1c6d7] text-gray-600'
                }`}>
                  <Code size={13} className="text-gray-400 shrink-0" />
                  <code className="text-[10px] font-mono truncate select-all flex-1">{generatedVideoCode}</code>
                </div>
              )}
            </>
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
                ? activeTab === 'youtube'
                  ? 'bg-[#005bc1] text-white hover:brightness-110 shadow-sm'
                  : 'bg-[#c64f00] text-white hover:brightness-110 shadow-sm'
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
