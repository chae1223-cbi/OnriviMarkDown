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
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EFEFEF] dark:border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#06C755]/15 text-[#06C755]">
              <Download size={18} />
            </div>
            <h2 className="text-base font-bold tracking-tight text-[#06C755]">내보내기</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-2" style={{ fontFamily: "LineSeed, Pretendard, sans-serif" }}>
          <p className="text-[13px] opacity-60 px-1 mb-3">저장할 파일 형식을 선택해주세요.</p>
          
          <div className="grid grid-cols-1 gap-2">
            {formats.map((format) => (
              <button
                key={format.id}
                onClick={() => setSelectedFormat(format.id as any)}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all text-left ${
                  selectedFormat === format.id 
                    ? (isDarkMode ? 'bg-[#06C755]/20 border-[#06C755]/60' : 'bg-[#06C755]/10 border-[#06C755]')
                    : (isDarkMode ? 'bg-black/20 border-white/5 hover:border-white/20' : 'bg-black/5 border-black/5 hover:border-black/20')
                }`}
              >
                <div className={`mt-0.5 p-1.5 rounded-lg ${isDarkMode ? 'bg-black/40' : 'bg-white shadow-sm'}`}>
                  {format.icon}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm flex items-center justify-between">
                    {format.label}
                    {selectedFormat === format.id && <Check size={16} className="text-[#06C755]" />}
                  </div>
                  <div className="text-[11px] opacity-60 mt-0.5">{format.desc}</div>
                </div>
              </button>
            ))}
          </div>


        </div>

        <div className={`flex items-center justify-end gap-2 px-5 py-4 border-t shrink-0 ${isDarkMode ? 'border-white/5 bg-black/20' : 'border-black/5 bg-black/5'}`}>
          <button 
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/10'
            }`}
          >
            취소
          </button>
          <button 
            onClick={() => onExport(selectedFormat as any)}
            className="px-5 py-2.5 rounded-xl bg-[#06C755] hover:bg-[#05B04B] text-white text-sm font-bold shadow-md shadow-[#06C755]/20 transition-all flex items-center gap-2"
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
