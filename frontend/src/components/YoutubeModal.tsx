"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Video, Upload, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import { supabase } from '@/lib/supabaseClient';

interface YoutubeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (code: string) => void;
  isDarkMode: boolean;
  targetFolder?: string;
  initialUrl?: string;
}

export default function YoutubeModal({ isOpen, onClose, onInsert, isDarkMode, targetFolder, initialUrl }: YoutubeModalProps) {
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sourceUrl, setSourceUrl] = useState("");
  const [appliedPath, setAppliedPath] = useState("");

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
    }
  }, [isOpen, initialUrl]);

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
      setSourceUrl(URL.createObjectURL(file));
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

  const cleanPath = (() => {
    let raw = sourceUrl.trim();
    const srcMatch = raw.match(/src=["']([^"']+)["']/);
    const mdMatch = raw.match(/!\[[^\]]*\]\(([^)]*)\)/);
    if (srcMatch) raw = srcMatch[1];
    else if (mdMatch) raw = mdMatch[1];
    raw = raw.replace(/^[\("'\s]+|[\)"'\s]+$/g, '');
    return raw;
  })();

  const detectedVideoId = (() => {
    const url = cleanPath;
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
  })();

  const isYoutube = !!detectedVideoId;
  const displayName = isYoutube ? 'YouTube 동영상' : (cleanPath.split('/').pop()?.split('?')[0] || '동영상');

  const handleInsert = () => {
    const url = appliedPath || cleanPath;
    if (!url) {
      showToast('동영상 URL을 입력하거나 파일을 선택해주세요.', 'warning');
      return;
    }
    const linkUrl = isYoutube ? `https://www.youtube.com/watch?v=${detectedVideoId}` : url;
    onInsert(`\n[${displayName}](${linkUrl})\n`);
    setSourceUrl("");
    setAppliedPath("");
    onClose();
    showToast("동영상 링크가 본문에 삽입되었습니다.", "success");
  };

  if (!isOpen) return null;
  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 dark:bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className={`relative w-full max-w-[480px] shadow-2xl rounded-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border ${
        isDarkMode ? 'bg-[#1e2022] border-[#44474e]' : 'bg-white border-[#c1c6d7]'
      }`}>
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDarkMode ? 'border-[#44474e] bg-[#181c20]' : 'border-[#c1c6d7] bg-[#f7f9ff]'
        }`}>
          <div className="flex items-center gap-2">
            <Video size={20} className="text-blue-500" />
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-blue-300' : 'text-[#181c20]'}`}>동영상 링크 삽입</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh] no-scrollbar">
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
            <p className="text-[10px] text-gray-400">YouTube URL 또는 MP4/WebM/Ogg 동영상 URL, 파일 선택 (최대 100MB)</p>
          </div>

          {sourceUrl.trim() && !appliedPath && (
            <button onClick={handleApplyUrl}
              className={`w-full py-2 rounded-lg text-xs font-medium border transition-all active:scale-95 ${
                isDarkMode ? 'bg-[#1e3a5f] border-[#2d5a8e] text-blue-200 hover:bg-[#2d5a8e]' : 'bg-[#d9e6f7] border-[#7a9ec7] text-[#1a4a7a] hover:bg-[#c5d7ef]'
              }`}>
              URL 적용
            </button>
          )}

          {appliedPath && (
            <div className={`p-2.5 border rounded-lg text-xs flex items-center gap-2 ${
              isDarkMode ? 'bg-[#282a2f] border-[#44474e] text-green-300' : 'bg-[#e8f5e9] border-[#a5d6a7] text-green-700'
            }`}>
              <Check size={13} />
              <span className="truncate flex-1">적용 경로: {appliedPath}</span>
            </div>
          )}

          {(appliedPath || cleanPath) && (
            <div className={`rounded-xl border border-dashed flex items-center justify-center overflow-hidden bg-black/5 dark:bg-white/5 ${
              isDarkMode ? 'border-[#444755]' : 'border-[#c1c6d7]'
            }`} style={{ minHeight: '120px' }}>
              {isYoutube ? (
                <div className="relative w-full aspect-video bg-zinc-950 flex items-center justify-center">
                  <img src={`https://img.youtube.com/vi/${detectedVideoId}/maxresdefault.jpg`} alt="YouTube Thumbnail"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${detectedVideoId}/0.jpg`; }} />
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-medium">
                    YouTube
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 text-gray-400">
                  <Video size={32} className="opacity-30 shrink-0" />
                  <div className="text-xs">
                    <p className="font-medium text-gray-500 dark:text-gray-300">{displayName}</p>
                    <p className="text-[10px] mt-0.5">동영상 파일 (링크 삽입)</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className={`p-3 rounded-lg border border-dashed text-xs ${
            isDarkMode ? 'bg-[#282a2f] border-[#44474e] text-gray-400' : 'bg-[#f1f4f9] border-[#c1c6d7] text-gray-500'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <ExternalLink size={13} />
              <span className="font-medium">새창 열기 링크로 삽입됩니다</span>
            </div>
            <p className="text-[10px]">문서에서 동영상 링크를 클릭하면 새 브라우저 창에서 재생됩니다.</p>
          </div>
        </div>

        <div className={`px-6 py-4 border-t flex justify-end items-center gap-2 ${
          isDarkMode ? 'border-[#44474e] bg-[#1d2024]' : 'border-[#c1c6d7] bg-[#f1f4f9]'
        }`}>
          <button onMouseDown={(e) => e.preventDefault()} onClick={onClose}
            className={`px-6 py-2 border rounded-lg text-xs font-medium transition-all active:scale-95 ${
              isDarkMode ? 'bg-[#1e2022] border-[#44474e] text-gray-400 hover:bg-[#282a2f]' : 'bg-white border-[#c1c6d7] text-gray-600 hover:bg-gray-50'
            }`}>취소</button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={handleInsert} disabled={!(appliedPath || cleanPath)}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center gap-2 ${
              (appliedPath || cleanPath)
                ? 'bg-[#005bc1] text-white hover:brightness-110 shadow-sm'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed opacity-50 shadow-none'
            }`}>
            <Check size={14} />삽입
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
