"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Download, Printer, Globe, Image as ImageIcon, X, Check, BookOpen } from 'lucide-react';

/**
 * [ONR-UI-011] ExportModalProps 인터페이스
 * @description 완성된 마크다운을 타 포맷으로 내보내는 팝업창인 ExportModal에 주입되는 프롭 명세입니다.
 */
interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'print' | 'html' | 'png' | 'epub') => void;
  isDarkMode: boolean;
  pdfUseWatermark: boolean;
  setPdfUseWatermark: (v: boolean) => void;
  pdfWatermark: string;
  setPdfWatermark: (v: string) => void;
  pdfWatermarkOpacity: number;
  setPdfWatermarkOpacity: (v: number) => void;
}

/**
 * [ONR-UI-012] ExportModal 컴포넌트 함수
 * @description 에디터에서 완성된 문서를 OS 인쇄(미리보기+PDF저장), HTML, EPUB 전자책, PNG 이미지 포맷 중 선택하여 내보내기 요청을 처리하는 모달 창입니다.
 */
// ====================================================================
// 📊 [OMD-IO-ExportModal-0001] ExportModal ➔ ExportModal
// 🎯 @KICK  : OS 인쇄(미리보기+PDF저장)/HTML/EPUB/PNG 포맷 선택 및 내보내기 요청을 처리하는 모달 창
// 🛡️ @GUARD : isOpen 및 mounted 상태 모두 true일 때만 포털 렌더링
// 🚨 @PATCH : **2026-07-18** — 워터마크 입력창 타이핑 시 keydown 이벤트가 document.body로 전파되어 Monaco getModifierState 크래시가 발생하는 결함 해결을 위해 최외각 wrapper에 stopPropagation 가드 장착; 인쇄 모달 내 즉석 워터마크(pdfUseWatermark, pdfWatermark, pdfWatermarkOpacity) 설정 UI 추가 개편
//             PDF/HTML → OS 인쇄(print) 통합 후 HTML 파일 저장 별도 추가; icon/label/desc 변경
// 🔗 @CALLS : 없음
// ====================================================================
export default function ExportModal({ 
  isOpen, 
  onClose, 
  onExport, 
  isDarkMode,
  pdfUseWatermark,
  setPdfUseWatermark,
  pdfWatermark,
  setPdfWatermark,
  pdfWatermarkOpacity,
  setPdfWatermarkOpacity
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<'print' | 'html' | 'png' | 'epub'>('print');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen) return null;
  if (!mounted) return null;

  const formats = [
    { id: 'print', label: "인쇄 / PDF 출력", desc: "OS 인쇄 미리보기 후 프린터 출력 또는 PDF 저장", icon: <Printer size={20} className="text-red-500" /> },
    { id: 'html', label: "HTML 파일", desc: "웹 브라우저에서 바로 열기용 (.html)", icon: <Globe size={20} className="text-blue-500" /> },
    { id: 'epub', label: "EPUB 전자책", desc: "eBook 리더 및 태블릿 기기용", icon: <BookOpen size={20} className="text-purple-500" /> },
    { id: 'png', label: "PNG 이미지", desc: "SNS 공유 및 프리젠테이션용", icon: <ImageIcon size={20} className="text-green-500" /> },
  ];

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" 
      style={{ overflowY: "auto" }}
      onKeyDown={(e) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
      }}
    >
      <div 
        className={`w-full max-w-sm rounded-2xl shadow-2xl border flex flex-col ${
          isDarkMode ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white border-black/5 text-zinc-900'
        } animate-in zoom-in-95 duration-200`}
        style={{ maxHeight: "90dvh", overflow: "hidden" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 dark:border-white/5 shrink-0">
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

        <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-2">
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

          {/* 인쇄 및 PDF 저장 선택 시 실시간 워터마크 즉석 옵션 */}
          {selectedFormat === 'print' && (
            <div className={`mt-4 p-3.5 rounded-xl border space-y-3 transition-colors text-xs animate-in fade-in slide-in-from-top-1 duration-200 ${
              isDarkMode ? 'bg-black/10 border-white/5' : 'bg-slate-50/50 border-black/5'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span>배경 텍스트 워터마크</span>
                <div className="flex p-0.5 rounded-lg gap-0.5 border" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)' }}>
                  <button 
                    onClick={() => setPdfUseWatermark(true)}
                    className={`px-2.5 py-1 font-bold rounded-md transition-all ${
                      pdfUseWatermark 
                        ? 'bg-emerald-500 text-white shadow-sm' 
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    적용
                  </button>
                  <button 
                    onClick={() => setPdfUseWatermark(false)}
                    className={`px-2.5 py-1 font-bold rounded-md transition-all ${
                      !pdfUseWatermark 
                        ? (isDarkMode ? 'bg-zinc-800 text-white shadow-sm' : 'bg-white text-zinc-700 shadow-sm')
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    미적용
                  </button>
                </div>
              </div>

              {pdfUseWatermark && (
                <>
                  <div className="flex flex-col gap-1.5 animate-in fade-in duration-100">
                    <span className="font-semibold opacity-80">워터마크 문구</span>
                    <input
                      type="text"
                      placeholder="예: DRAFT, CONFIDENTIAL, 대외비"
                      value={pdfWatermark || ''}
                      onChange={(e) => setPdfWatermark(e.target.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs outline-none w-full border ${
                        isDarkMode ? 'bg-zinc-950 border-white/10 text-white' : 'bg-white border-black/10 text-zinc-900'
                      }`}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 text-xs font-semibold animate-in fade-in duration-100">
                    <span className="opacity-80">투명도 ({Math.round(pdfWatermarkOpacity * 100)}%)</span>
                    <input
                      type="range"
                      min="0.01"
                      max="0.4"
                      step="0.01"
                      value={pdfWatermarkOpacity}
                      onChange={(e) => setPdfWatermarkOpacity(parseFloat(e.target.value))}
                      className="w-24 cursor-pointer accent-emerald-500"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className={`flex items-center justify-end gap-2 px-5 py-4 border-t shrink-0 ${isDarkMode ? 'border-white/5 bg-black/20' : 'border-black/5 bg-black/5'}`}>
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
            {selectedFormat === 'print' ? <Printer size={16} /> : <Download size={16} />}
            {selectedFormat === 'print' ? '인쇄 / PDF 저장' : '파일 생성 및 저장'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
