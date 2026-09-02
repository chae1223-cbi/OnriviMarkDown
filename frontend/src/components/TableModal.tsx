"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X } from 'lucide-react';

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
// 🚨 @PATCH : 2026-09-02 - 열(컬럼) 기본 정렬 프리셋 4종(기본 좌측, 전체 중앙, 회계형, 요약형) 선택 UI 및 마크다운 자동 생성 지원
//             2026-07-15 - 마우스 드래그 그리드 10x10 디자인 전면 개편 및 안개 블러 제거, 라운드 4px 규격 장착
// 🔗 @CALLS : handleInsert, createPortal
// ====================================================================
export default function TableModal({ isOpen, onClose, onInsert, isDarkMode }: TableModalProps) {
  const [hoverPos, setHoverPos] = useState({ r: 3, c: 2 });
  const [selectedPos, setSelectedPos] = useState({ r: 3, c: 2 });
  const [alignPreset, setAlignPreset] = useState<'default' | 'center' | 'numeric' | 'summary'>('default');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen) return null;
  if (!mounted) return null;

  const handleInsert = () => {
    const { r, c } = selectedPos;
    let header = "| " + Array(c).fill("제목").join(" | ") + " |\n";
    
    let dividerCols: string[] = [];
    for (let i = 0; i < c; i++) {
      if (alignPreset === 'center') {
        dividerCols.push(':---:');
      } else if (alignPreset === 'numeric') {
        dividerCols.push(i === 0 ? ':---' : '---:');
      } else if (alignPreset === 'summary') {
        dividerCols.push(i === 0 || i === c - 1 ? ':---:' : ':---');
      } else {
        dividerCols.push(':---');
      }
    }
    let divider = "| " + dividerCols.join(" | ") + " |\n";
    let row = "| " + Array(c).fill("내용").join(" | ") + " |\n";
    let body = Array(r).fill(row).join("");
    
    onInsert(`\n${header}${divider}${body}\n`);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4" style={{ overflowY: "auto" }}>
      {/* 선명한 투명 배경 (안개 블러 제거) */}
      <div className="absolute inset-0 bg-black/65" onClick={onClose} />
      
      {/* MainModalContainer */}
      <div 
        className={`relative w-full max-w-[360px] shadow-2xl rounded-2xl border flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden ${
          isDarkMode 
            ? 'bg-zinc-950 border-zinc-800 text-zinc-100' 
            : 'bg-white border-[#EFEFEF] text-slate-800'
        }`} 
        style={{ maxHeight: "90dvh", fontFamily: "LineSeed, Pretendard, sans-serif" }}
      >
        {/* ModalHeader */}
        <header className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${
          isDarkMode ? 'border-zinc-800 bg-zinc-900/50' : 'border-[#EFEFEF] bg-slate-50/40'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#06C755]/15 text-[#06C755]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </div>
            <h1 className="text-base font-bold tracking-tight text-[#06C755]">표 삽입</h1>
          </div>
          <span className="text-[#06C755] font-extrabold text-base tracking-wide">
            {selectedPos.c} × {selectedPos.r}
          </span>
        </header>

        {/* GridContent */}
        <main className="flex-1 flex flex-col items-center py-6 px-6 bg-white dark:bg-zinc-950 min-h-0 overflow-y-auto">
          {/* Table Grid Visualization Container */}
          <div 
            className={`p-4 rounded-xl mb-5 border shadow-sm ${
              isDarkMode ? 'bg-zinc-900/40 border-zinc-800' : 'bg-slate-50/50 border-slate-100'
            }`} 
            data-purpose="grid-visualization"
          >
            <div 
              className="grid grid-cols-10 gap-1"
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
                    className={`w-6 h-6 rounded-[2px] transition-all cursor-pointer ${
                      isHover 
                        ? 'bg-[#06C755] scale-105 shadow-sm z-10' 
                        : isSelected 
                          ? 'bg-[#06C755]/60' 
                          : isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-slate-100 hover:bg-slate-200'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Guide Text */}
          <p className="text-slate-400 dark:text-zinc-500 italic text-xs mb-4 text-center font-medium">
            그리드를 클릭하여 크기를 지정하세요
          </p>

          {/* Column Alignment Presets */}
          <div className="w-full mb-4">
            <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 mb-2 block text-center">
              열(컬럼) 기본 정렬 프리셋
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setAlignPreset('default')}
                className={`px-2.5 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                  alignPreset === 'default'
                    ? 'bg-[#06C755]/15 border-[#06C755] text-[#06C755] font-bold'
                    : isDarkMode
                      ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>⬅️</span>
                <span>기본 (왼쪽)</span>
              </button>
              <button
                type="button"
                onClick={() => setAlignPreset('center')}
                className={`px-2.5 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                  alignPreset === 'center'
                    ? 'bg-[#06C755]/15 border-[#06C755] text-[#06C755] font-bold'
                    : isDarkMode
                      ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>↔️</span>
                <span>전체 중앙</span>
              </button>
              <button
                type="button"
                onClick={() => setAlignPreset('numeric')}
                className={`px-2.5 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                  alignPreset === 'numeric'
                    ? 'bg-[#06C755]/15 border-[#06C755] text-[#06C755] font-bold'
                    : isDarkMode
                      ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>📊</span>
                <span>회계형 (좌+우)</span>
              </button>
              <button
                type="button"
                onClick={() => setAlignPreset('summary')}
                className={`px-2.5 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                  alignPreset === 'summary'
                    ? 'bg-[#06C755]/15 border-[#06C755] text-[#06C755] font-bold'
                    : isDarkMode
                      ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>📑</span>
                <span>요약/통계형</span>
              </button>
            </div>
          </div>

          {/* TipBox */}
          <section className={`w-full border rounded-xl p-4 ${
            isDarkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-slate-50/50 border-slate-200/60'
          }`} data-purpose="usage-tips">
            <h2 className="text-[#06C755] text-xs font-black text-center mb-3 flex items-center justify-center gap-1">
              <span>💡</span> 표 병합 TIP
            </h2>
            <ul className="text-[11px] text-slate-600 dark:text-zinc-400 space-y-2.5 font-medium leading-normal">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-slate-400 dark:bg-zinc-600 rounded-full shrink-0"></span>
                <span>
                  가로 병합: 병합 시작 셀에 
                  <span className="mx-1 px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded font-mono text-[9px] font-bold text-[#06C755]">{">"}</span> 
                  입력
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-slate-400 dark:bg-zinc-600 rounded-full shrink-0"></span>
                <span>
                  세로 병합: 병합될 대상 셀에 
                  <span className="mx-1 px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded font-mono text-[9px] font-bold text-[#06C755]">^</span> 
                  입력
                </span>
              </li>
            </ul>
          </section>
        </main>

        {/* ActionZone */}
        <footer className={`p-6 border-t flex flex-col gap-3 ${
          isDarkMode ? 'bg-zinc-900/30 border-zinc-800/80' : 'bg-slate-50/30 border-slate-150'
        }`}>
          <button 
            onClick={handleInsert}
            className="w-full bg-[#06C755] hover:bg-[#05B04B] text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-[#06C755]/20 transition-all flex items-center justify-center gap-2 text-xs active:scale-[0.98]"
            data-purpose="submit-button"
          >
            <Plus size={15} />
            {selectedPos.c} x {selectedPos.r} 표 삽입하기
          </button>
          <button 
            onClick={onClose}
            className="w-full text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 text-xs font-bold py-2 transition-colors active:scale-[0.98]"
            data-purpose="cancel-button"
          >
            취소
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}
