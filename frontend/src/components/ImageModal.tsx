"use client";

import React, { useRef } from 'react';
import { X, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (path: string, alt: string) => void;
  isDarkMode: boolean;
}

export default function ImageModal({ isOpen, onClose, onInsert, isDarkMode }: ImageModalProps) {
  const [imagePath, setImagePath] = React.useState("");
  const [imageAlt, setImageAlt] = React.useState("이미지 설명");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 실제 이미지 주소 추출
  const cleanImagePath = React.useMemo(() => {
    let raw = imagePath.trim();
    const srcMatch = raw.match(/src=["']([^"']+)["']/);
    const mdMatch = raw.match(/!\[.*\]\((.*)\)/);
    let url = raw;
    if (srcMatch) url = srcMatch[1];
    else if (mdMatch) url = mdMatch[1];
    return url.replace(/^[\("'\s]+|[\)"'\s]+$/g, '');
  }, [imagePath]);

  if (!isOpen) return null;

  const handleInsert = () => {
    if (cleanImagePath) {
      onInsert(cleanImagePath, imageAlt);
      setImagePath("");
      setImageAlt("이미지 설명");
      onClose(); // 삽입 후 모달 닫기 추가
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePath(previewUrl);
      setImageAlt("이미지 설명");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 dark:bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className={`relative w-full max-w-[520px] shadow-2xl rounded-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border ${
        isDarkMode ? 'bg-[#1e2022] border-[#44474e]' : 'bg-white border-[#c1c6d7]'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDarkMode ? 'border-[#44474e] bg-[#181c20]' : 'border-[#c1c6d7] bg-[#f7f9ff]'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-lg leading-none">이미지</span>
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-blue-300' : 'text-[#181c20]'}`}>이미지 삽입</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-on-surface">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block">이미지 경로 또는 URL</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={imagePath}
                onChange={(e) => setImagePath(e.target.value)}
                placeholder="https://example.com/image.png"
                className={`flex-1 border px-3 py-2 rounded-lg outline-none transition-all text-sm ${
                  isDarkMode 
                    ? 'bg-[#282a2f] border-[#44474e] text-white focus:border-blue-400' 
                    : 'bg-white border-[#c1c6d7] focus:border-blue-600'
                }`}
              />
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all active:scale-95 ${
                  isDarkMode 
                    ? 'bg-[#33373b] border-[#44474e] text-blue-300 hover:bg-[#44474e]' 
                    : 'bg-[#ebeef3] border-[#c1c6d7] text-gray-700 hover:bg-[#e0e3e8]'
                }`}
              >
                찾아보기
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block">이미지 설명 (Alt)</label>
            <input 
              type="text" 
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              className={`w-full border px-3 py-2 rounded-lg outline-none transition-all text-sm ${
                isDarkMode 
                  ? 'bg-[#282a2f] border-[#44474e] text-white focus:border-blue-400' 
                  : 'bg-white border-[#c1c6d7] focus:border-blue-600'
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block">미리보기</label>
            <div className={`mt-4 rounded-xl border border-dashed flex items-center justify-center overflow-hidden bg-black/5 dark:bg-white/5 ${
              isDarkMode ? 'border-[#444755]' : 'border-[#c1c6d7]'
            }`} style={{ minHeight: '200px' }}>
              {imagePath && (imagePath.startsWith('http') || imagePath.startsWith('/') || imagePath.startsWith('blob:')) ? (
                <img 
                  src={imagePath} 
                  alt="미리보기" 
                  className="max-w-full max-h-[300px] object-contain"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                  onLoad={(e) => (e.currentTarget.style.display = 'block')}
                />
              ) : (
                <div className="text-center p-6 text-gray-400">
                  <ImageIcon size={48} className="mx-auto mb-2 opacity-20" />
                  <p className="text-xs">유효한 이미지 주소를 입력하면<br/>여기에 미리보기가 표시됩니다.</p>
                </div>
              )}
            </div>
          </div>
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
            disabled={!cleanImagePath}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center gap-2 ${
              cleanImagePath 
                ? 'bg-[#c64f00] text-white hover:brightness-110' 
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
            }`}
          >
            <LinkIcon size={14} />
            마크다운 코드 삽입
          </button>
        </div>
      </div>
    </div>
  );
}
