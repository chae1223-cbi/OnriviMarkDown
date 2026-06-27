"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Table as TableIcon, Plus } from 'lucide-react';

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (code: string) => void;
  isDarkMode: boolean;
}

// ====================================================================
// 📊 [OMD-EDIT-TableModal-0003] TableModal ➔ TableModal
// 🎯 @KICK  : 표 삽입 모달 - 10x10 그리드 UI로 마우스 표 크기 선택 후 마크다운 코드 생성
// 🛡️ @GUARD : isOpen false 또는 mounted false 시 null 반환으로 조기 종료
// 🚨 @PATCH : 없음
// 🔗 @CALLS : handleInsert, createPortal
// ====================================================================
export default function TableModal({ isOpen, onClose, onInsert, isDarkMode }: TableModalProps) {
  const [hoverPos, setHoverPos] = useState({ r: 3, c: 2 });
  const [selectedPos, setSelectedPos] = useState({ r: 3, c: 2 });
  const [mounted, setMounted] = useState(false);

// ====================================================================
// 📊 [OMD-EDIT-TableModal-0001] TableModal ➔ useEffect(mounted)
// 🎯 @KICK  : 클라이언트 마운트 완료 시 mounted 상태 true 설정 (SSR 하이드레이션 보호)
// 🛡️ @GUARD : 없음
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen) return null;
  if (!mounted) return null;

// ====================================================================
// 📊 [OMD-EDIT-TableModal-0002] TableModal ➔ handleInsert
// 🎯 @KICK  : 선택된 행/열로 마크다운 표 문자열 생성 후 onInsert 콜백 전달 및 모달 닫기
// 🛡️ @GUARD : 없음
// 🚨 @PATCH : 없음
// 🔗 @CALLS : onInsert, onClose
// ====================================================================
  const handleInsert = () => {
    const { r, c } = selectedPos;
    let header = "| " + Array(c).fill("제목").join(" | ") + " |\n";
    let divider = "| " + Array(c).fill("---").join(" | ") + " |\n";
    let row = "| " + Array(c).fill("내용").join(" | ") + " |\n";
    let body = Array(r).fill(row).join("");
    
    onInsert(`\n${header}${divider}${body}\n`);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 dark:bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className={`relative w-full max-w-[320px] shadow-2xl rounded-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border ${
        isDarkMode ? 'bg-[#1e2022] border-[#44474e]' : 'bg-white border-[#c1c6d7]'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${
          isDarkMode ? 'border-[#44474e] bg-[#181c20]' : 'border-[#c1c6d7] bg-[#f7f9ff]'
        }`}>
          <div className="flex items-center gap-2">
            <TableIcon size={18} className="text-blue-500" />
            <h2 className={`text-sm font-bold ${isDarkMode ? 'text-[#eef1f6]' : 'text-[#181c20]'}`}>표 삽입</h2>
          </div>
          <span className="text-blue-500 font-bold text-xs">{selectedPos.c} x {selectedPos.r}</span>
        </div>

        {/* Grid Area */}
        <div className="p-5 flex flex-col items-center">
          <div 
            className={`grid grid-cols-10 gap-1 p-1 rounded-lg border ${
              isDarkMode ? 'bg-[#131313] border-[#44474e]' : 'bg-[#f1f4f9] border-[#c1c6d7]'
            }`}
            onMouseLeave={() => setHoverPos(selectedPos)}
          >
            {[...Array(100)].map((_, i) => {
              const row = Math.floor(i / 10) + 1;
              const col = (i % 10) + 1;
              const isHover = col <= hoverPos.c && row <= hoverPos.r;
              const isSelected = col <= selectedPos.c && row <= selectedPos.r;

              return (
                <div
                  key={i}
                  onMouseEnter={() => setHoverPos({ r: row, c: col })}
                  onClick={() => {
                    setSelectedPos({ r: row, c: col });
                    setHoverPos({ r: row, c: col });
                  }}
                  className={`w-5 h-5 rounded-[2px] transition-all cursor-pointer ${
                    isHover 
                      ? 'bg-blue-500 scale-110 shadow-sm z-10' 
                      : isSelected 
                        ? 'bg-blue-400/60' 
                        : isDarkMode ? 'bg-[#2d3135]' : 'bg-[#c1c6d7]'
                  }`}
                />
              );
            })}
          </div>

          <p className="mt-4 text-[11px] text-gray-500 font-medium italic">
            그리드를 클릭하여 크기를 지정하세요
          </p>
        </div>

        {/* Footer */}
        <div className={`px-5 py-4 border-t flex flex-col gap-2 ${
          isDarkMode ? 'border-[#44474e] bg-[#1d2024]' : 'border-[#c1c6d7] bg-[#f1f4f9]'
        }`}>
          <button 
            onClick={() => {
              const { r, c } = selectedPos;
              let header = "| " + Array(c).fill("제목").join(" | ") + " |\n";
              let divider = "| " + Array(c).fill("---").join(" | ") + " |\n";
              let row = "| " + Array(c).fill("내용").join(" | ") + " |\n";
              let body = Array(r).fill(row).join("");
              onInsert(`\n${header}${divider}${body}\n`);
              onClose();
            }}
            onMouseDown={(e) => e.preventDefault()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Plus size={16} />
            {selectedPos.c} x {selectedPos.r} 표 삽입하기
          </button>
          <button 
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClose}
            className={`w-full py-2 text-[11px] font-medium transition-colors ${
              isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            취소
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
