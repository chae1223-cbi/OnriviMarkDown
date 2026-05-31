"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Youtube, Code, Play, Check } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

interface YoutubeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (code: string) => void;
  isDarkMode: boolean;
}

export default function YoutubeModal({ isOpen, onClose, onInsert, isDarkMode }: YoutubeModalProps) {
  const { showToast } = useToast();
  const [inputUrl, setInputUrl] = useState("");
  const [width, setWidth] = useState("100%");
  const [height, setHeight] = useState("400");
  const [insertType, setInsertType] = useState<'iframe' | 'thumbnail'>('iframe');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 유튜브 URL 또는 iframe 코드에서 비디오 ID 추출하는 정규식 함수
  const videoId = useMemo(() => {
    if (!inputUrl.trim()) return "";

    // 1. iframe 소스코드에서 src 추출
    if (inputUrl.includes("<iframe")) {
      const srcMatch = inputUrl.match(/src=["']([^"']+)["']/);
      if (srcMatch && srcMatch[1]) {
        const url = srcMatch[1];
        const idMatch = url.match(/\/embed\/([^/?#]+)/);
        if (idMatch) return idMatch[1];
      }
    }

    // 2. 일반 youtube.com/watch?v=ID, shorts/ID, embed/ID 등
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = inputUrl.match(regExp);

    return (match && match[2].length === 11) ? match[2] : "";
  }, [inputUrl]);

  // 쇼츠(Shorts) 동영상 입력 시 자동으로 세로 최적화 비율(315x560) 설정
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
    // origin 파라미터 추가 및 불필요한 관련 영상/로고 제거 옵션 적용
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  }, [videoId]);

  const generatedCode = useMemo(() => {
    if (!videoId) return "";
    if (insertType === 'iframe') {
      return `<iframe width="${width}" height="${height}" src="${embedUrl}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
    } else {
      return `[![YouTube Video](https://img.youtube.com/vi/${videoId}/0.jpg)](https://www.youtube.com/watch?v=${videoId})`;
    }
  }, [videoId, insertType, width, height, embedUrl]);

  const handleInsert = () => {
    if (!videoId) {
      showToast("올바른 유튜브 링크나 소스코드를 입력해주세요.", "warning");
      return;
    }
    onInsert(`\n${generatedCode}\n`);
    setInputUrl("");
    onClose();
    showToast("유튜브 영상이 본문에 삽입되었습니다.", "success");
  };

  if (!isOpen) return null;
  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 dark:bg-black/80 backdrop-blur-md" 
        onClick={onClose} 
      />
      
      {/* Modal Card */}
      <div className={`relative w-full max-w-[520px] shadow-2xl rounded-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border ${
        isDarkMode ? 'bg-[#1e2022] border-[#44474e]' : 'bg-white border-[#c1c6d7]'
      }`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDarkMode ? 'border-[#44474e] bg-[#181c20]' : 'border-[#c1c6d7] bg-[#f7f9ff]'
        }`}>
          <div className="flex items-center gap-2">
            <Youtube size={20} className="text-red-500" />
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-blue-300' : 'text-[#181c20]'}`}>유튜브 영상 삽입</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-on-surface overflow-y-auto max-h-[70vh] no-scrollbar">
          {/* Input URL */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block">
              유튜브 URL 또는 공유 소스코드
            </label>
            <input 
              type="text" 
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className={`w-full border px-3 py-2 rounded-lg outline-none transition-all text-sm ${
                isDarkMode 
                  ? 'bg-[#282a2f] border-[#44474e] text-white focus:border-blue-400' 
                  : 'bg-white border-[#c1c6d7] focus:border-blue-600'
              }`}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          {/* Option: Insert Type */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block">삽입 방식</label>
            <div className={`p-1 rounded-lg flex border ${
              isDarkMode ? 'bg-[#282a2f] border-[#44474e]' : 'bg-[#f1f4f9] border-[#c1c6d7]/60'
            }`}>
              <button
                onClick={() => setInsertType('iframe')}
                className={`flex-1 py-2 rounded-md text-xs font-medium transition-all active:scale-[0.98] ${
                  insertType === 'iframe'
                    ? isDarkMode 
                      ? 'bg-[#33373b] text-blue-300 shadow-sm border border-[#44474e]' 
                      : 'bg-white border border-[#c1c6d7]/50 text-blue-600 shadow-sm font-semibold'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                미리보기 직접 재생 (Iframe)
              </button>
              <button
                onClick={() => setInsertType('thumbnail')}
                className={`flex-1 py-2 rounded-md text-xs font-medium transition-all active:scale-[0.98] ${
                  insertType === 'thumbnail'
                    ? isDarkMode 
                      ? 'bg-[#33373b] text-blue-300 shadow-sm border border-[#44474e]' 
                      : 'bg-white border border-[#c1c6d7]/50 text-blue-600 shadow-sm font-semibold'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                썸네일 링크 삽입 (Markdown)
              </button>
            </div>
          </div>

          {insertType === 'iframe' && videoId && (
            <div className="flex gap-4 items-center justify-between p-3 rounded-lg border border-dashed animate-in fade-in duration-200 text-xs text-gray-500 dark:text-gray-400 bg-black/5 dark:bg-white/5 border-zinc-200 dark:border-zinc-800">
              <span className="font-medium">플레이어 크기 지정</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-400">너비:</span>
                  <input 
                    type="text" 
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className={`w-14 border px-2 py-1 rounded outline-none text-center text-xs transition-all ${
                      isDarkMode 
                        ? 'bg-[#282a2f] border-[#44474e] text-white focus:border-blue-400' 
                        : 'bg-white border-[#c1c6d7] focus:border-blue-600'
                    }`}
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-400">세로:</span>
                  <input 
                    type="text" 
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className={`w-14 border px-2 py-1 rounded outline-none text-center text-xs transition-all ${
                      isDarkMode 
                        ? 'bg-[#282a2f] border-[#44474e] text-white focus:border-blue-400' 
                        : 'bg-white border-[#c1c6d7] focus:border-blue-600'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Preview Area */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block">미리보기</label>
            <div className={`rounded-xl border border-dashed flex items-center justify-center overflow-hidden bg-black/5 dark:bg-white/5 ${
              isDarkMode ? 'border-[#444755]' : 'border-[#c1c6d7]'
            }`} style={{ minHeight: '200px' }}>
              {videoId ? (
                insertType === 'iframe' ? (
                  <>
                    <div className="w-full aspect-video bg-black relative">
                      <iframe
                        title="YouTube Embed Preview"
                        width="100%"
                        height="100%"
                        src={embedUrl}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>
                    {/* 에러 153 안내: 영상 업로더가 embed 재생을 비허용한 경우 */}
                    <div className={`mt-1.5 text-[10px] px-2 py-1 rounded flex items-center gap-1.5 ${isDarkMode ? 'text-yellow-400 bg-yellow-400/10' : 'text-yellow-700 bg-yellow-50'}`}>
                      ⚠️ 일부 영상은 업로더가 외부 재생을 차단(오류 153)합니다. 다른 영상으로 테스트하거나 &apos;썸네일 링크 삽입&apos; 방식을 사용하세요.
                    </div>
                  </>
                ) : (
                  <div className="relative w-full aspect-video bg-zinc-950 flex items-center justify-center">
                    <img 
                      src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                      alt="YouTube Video Thumbnail"
                      className="w-full h-full object-cover opacity-85"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/0.jpg`;
                      }}
                    />
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

          {/* Code Snippet Box */}
          {videoId && (
            <div className={`p-2.5 border rounded-lg flex items-center gap-2.5 text-xs ${
              isDarkMode ? 'bg-[#282a2f] border-[#44474e] text-gray-300' : 'bg-[#f1f4f9] border-[#c1c6d7] text-gray-600'
            }`}>
              <Code size={13} className="text-gray-400 shrink-0" />
              <code className="text-[10px] font-mono truncate select-all flex-1">
                {generatedCode}
              </code>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex justify-end items-center gap-2 ${
          isDarkMode ? 'border-[#44474e] bg-[#1d2024]' : 'border-[#c1c6d7] bg-[#f1f4f9]'
        }`}>
          <button 
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClose}
            className={`px-6 py-2 border rounded-lg text-xs font-medium transition-all active:scale-95 ${
              isDarkMode 
                ? 'bg-[#1e2022] border-[#44474e] text-gray-400 hover:bg-[#282a2f]' 
                : 'bg-white border-[#c1c6d7] text-gray-600 hover:bg-gray-50'
            }`}
          >
            취소
          </button>
          <button 
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleInsert}
            disabled={!videoId}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center gap-2 ${
              videoId 
                ? 'bg-[#005bc1] text-white hover:brightness-110 shadow-sm' 
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed opacity-50 shadow-none'
            }`}
          >
            <Check size={14} />
            마크다운 코드 삽입
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
