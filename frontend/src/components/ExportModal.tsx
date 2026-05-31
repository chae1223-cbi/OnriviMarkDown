"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Download, FileText, Globe, Image as ImageIcon, X, Check, BookOpen } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'pdf' | 'html' | 'png' | 'epub') => void;
  isDarkMode: boolean;
}

export default function ExportModal({ isOpen, onClose, onExport, isDarkMode }: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'html' | 'png' | 'epub'>('pdf');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen) return null;
  if (!mounted) return null;

  const formats = [
    { id: 'pdf', label: "PDF 문서", desc: "고품질 인쇄 및 문서 보관용", icon: <FileText size={20} className="text-red-500" /> },
    { id: 'html', label: "HTML 파일", desc: "웹 브라우저에서 바로 열기용", icon: <Globe size={20} className="text-blue-500" /> },
    { id: 'epub', label: "EPUB 전자책", desc: "eBook 리더 및 태블릿 기기용", icon: <BookOpen size={20} className="text-purple-500" /> },
    { id: 'png', label: "PNG 이미지", desc: "SNS 공유 및 프리젠테이션용", icon: <ImageIcon size={20} className="text-green-500" /> },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border ${
          isDarkMode ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white border-black/5 text-zinc-900'
        } animate-in zoom-in-95 duration-200`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2 font-bold">
            <span className="text-lg leading-none">📦</span>
            <span>내보내기</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
          >
            <X size={18} className="opacity-50" />
          </button>
        </div>

        <div className="p-4 space-y-2">
          <p className="text-[13px] opacity-60 px-1 mb-3">저장할 파일 형식을 선택해주세요.</p>
          
          <div className="grid grid-cols-1 gap-2">
            {formats.map((format) => (
              <button
                key={format.id}
                onClick={() => setSelectedFormat(format.id as any)}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all text-left ${
                  selectedFormat === format.id 
                    ? (isDarkMode ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-emerald-50 border-emerald-500/50')
                    : (isDarkMode ? 'bg-black/20 border-white/5 hover:border-white/20' : 'bg-black/5 border-black/5 hover:border-black/20')
                }`}
              >
                <div className={`mt-0.5 p-1.5 rounded-lg ${isDarkMode ? 'bg-black/40' : 'bg-white shadow-sm'}`}>
                  {format.icon}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm flex items-center justify-between">
                    {format.label}
                    {selectedFormat === format.id && <Check size={16} className="text-emerald-500" />}
                  </div>
                  <div className="text-[11px] opacity-60 mt-0.5">{format.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className={`flex items-center justify-end gap-2 px-5 py-4 border-t ${isDarkMode ? 'border-white/5 bg-black/20' : 'border-black/5 bg-black/5'}`}>
          <button 
            onClick={onClose}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/10'
            }`}
          >
            취소
          </button>
          <button 
            onClick={() => onExport(selectedFormat as any)}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Download size={16} />
            파일 생성 및 저장
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
