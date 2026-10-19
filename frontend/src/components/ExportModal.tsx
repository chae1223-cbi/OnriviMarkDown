"use client";

import React, { useState, useEffect, useRef } from 'react';
import { readEffectivePrintSettings, DocumentPrintSettings, DEFAULT_PRINT_SETTINGS, normalizePrintSettings } from '@/lib/documentPrintSettings';
import { createPortal } from 'react-dom';
import { Download, Printer, Globe, Image as ImageIcon, X, Check, BookOpen, FileText } from 'lucide-react';

/**
 * [ONR-UI-011] ExportModalProps 인터페이스
 * @description 완성된 마크다운을 타 포맷으로 내보내는 팝업창인 ExportModal에 주입되는 프롭 명세입니다.
 */
interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'print' | 'docx' | 'hwpx' | 'html' | 'png' | 'epub') => void;
  isDarkMode: boolean;
  isPicturebook?: boolean;
  documentId?:string;
  documentContent?:string;
  onPrintSettingsChange?:(settings:DocumentPrintSettings)=>void;
  onOpenWatermarkSettings?:()=>void;
  onPagePreview?:(settings:DocumentPrintSettings,signal:AbortSignal)=>Promise<string|void>;
}

/**
 * [ONR-UI-012] ExportModal 컴포넌트 함수
 * @description 에디터에서 완성된 문서를 OS 인쇄(미리보기+PDF저장), Word(.docx), HTML, EPUB 전자책, PNG 이미지 포맷 중 선택하여 내보내기 요청을 처리하는 모달 창입니다.
 */
// ====================================================================
// 📊 [OMD-IO-ExportModal-0001] ExportModal ➔ ExportModal
// 🎯 @KICK  : OS 인쇄(미리보기+PDF저장)/Word/HTML/EPUB/PNG 포맷 선택 및 내보내기 요청을 처리하는 모달 창
// 🛡️ @GUARD : isOpen 및 mounted 상태 모두 true일 때만 포털 렌더링
// 🚨 @PATCH : **2026-10-19** — [useEffect cleanup 시점 generation ref 캡처를 통한 ESLint react-hooks 경고 해소]: cleanup 클로저 내부에서 변경 가능한 generation.current 대신 로컬 캡처 변수 gen 참조
// 🚨 @PATCH : **2026-10-19** — [모달 뒷배경 고농도 암전(bg-black/80) 제거 및 은은한 반투명 딤(bg-black/25) 최적화]: 과도하게 시커멓게 뒤덮이던 80% 블랙 오버레이를 25% 초미세 블러(backdrop-blur-xs)로 개선하여 에디터 화면 시인성 확보
// 🚨 @PATCH : **2026-10-19** — [워터마크 미지정 시 기본 엠블럼 및 Onrivi Author 자동 연동]: 이미지 미등록 시 기본 엠블럼 자동 적용, 문구 미입력 시 Onrivi Author 자동 적용
// 🚨 @PATCH : **2026-10-19** — [EPUB 전자책 내보내기 워터마크 지원 및 환경설정 기본 워터마크 자동 반영]: ExportModal에서 EPUB 선택 시에도 워터마크 설정 노출, 문서 설정 부재 시 readEffectivePrintSettings(환경설정 기본값) 자동 계승
// 🚨 @PATCH : **2026-10-01** — [한글(.hwpx) 내보내기 옵션 삭제]: 모달 선택 옵션에서 한글 문서(.hwpx) 항목 제거
// 🚨 @PATCH : **2026-09-30** — Word 문서(.docx) 내보내기 옵션 추가
// 🚨 @PATCH : **2026-09-11** — Modern Technical Editorial 디자인 시스템 적용 (Cobalt #1d4ed8, Inter / Plus Jakarta Sans)
//             2026-07-18** — 워터마크 입력창 타이핑 시 keydown 이벤트가 document.body로 전파되어 Monaco getModifierState 크래시가 발생하는 결함 해결을 위해 최외각 wrapper에 stopPropagation 가드 장착; 인쇄 모달 내 즉석 워터마크(pdfUseWatermark, pdfWatermark, pdfWatermarkOpacity) 설정 UI 추가 개편
//             PDF/HTML → OS 인쇄(print) 통합 후 HTML 파일 저장 별도 추가; icon/label/desc 변경
// 🔗 @CALLS : 없음
// ====================================================================
export default function ExportModal({ 
  isOpen, 
  onClose, 
  onExport, 
  isDarkMode,
  isPicturebook = false,
  documentId,documentContent='',onPrintSettingsChange,onPagePreview,onOpenWatermarkSettings,
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<'print' | 'docx' | 'hwpx' | 'html' | 'png' | 'epub'>('print');
  const [mounted, setMounted] = useState(false);
  const [settings,setSettings]=useState<DocumentPrintSettings>(DEFAULT_PRINT_SETTINGS);
  const [pageHtml,setPageHtml]=useState(''),[previewOpen,setPreviewOpen]=useState(false),[busy,setBusy]=useState(false),[printError,setPrintError]=useState('');
  const generation=useRef(0),currentDocument=useRef(documentId),previewCallback=useRef(onPagePreview);
  const settingsRef=useRef(settings);settingsRef.current=settings;
  currentDocument.current=documentId;previewCallback.current=onPagePreview;
  useEffect(()=>{generation.current++;const value=normalizePrintSettings(readEffectivePrintSettings(documentContent));settingsRef.current=value;setSettings(value);setSelectedFormat('print');setPageHtml('');setPreviewOpen(Boolean(isOpen&&!isPicturebook&&previewCallback.current));setPrintError('');setBusy(false);},[isOpen,documentId]);
  useEffect(()=>{
    if(!isOpen)return;
    const refresh=()=>setSettings(normalizePrintSettings(readEffectivePrintSettings(documentContent)));
    window.addEventListener('onrivi:watermark_changed',refresh);
    return()=>window.removeEventListener('onrivi:watermark_changed',refresh);
  },[isOpen,documentContent]);
  useEffect(()=>{
    if(!isOpen || !previewOpen || selectedFormat!=='print' || isPicturebook || !previewCallback.current)return;
    const request=++generation.current;setBusy(true);setPrintError('');
    const controller=new AbortController();
    const timer=setTimeout(()=>{void previewCallback.current?.(settings,controller.signal).then(html=>{
      if(generation.current!==request)return;
      if(!html)throw new Error('미리보기를 준비하지 못했습니다.');
      setPageHtml(html);setBusy(false);
    }).catch(error=>{if(generation.current===request){setPrintError(error.message);setBusy(false);}});},500);
    const gen = generation;
    return ()=>{clearTimeout(timer);controller.abort();if(gen.current===request)gen.current++;};
  },[isOpen,previewOpen,selectedFormat,settings,documentContent,isPicturebook]);
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => { if (isPicturebook && (selectedFormat === 'docx' || selectedFormat === 'hwpx')) setSelectedFormat('print'); }, [isPicturebook, selectedFormat]);

  if (!isOpen) return null;
  if (!mounted) return null;

  const formats = [
    { id: 'print', label: "인쇄 / PDF 출력", desc: "OS 인쇄 미리보기 후 프린터 출력 또는 PDF 저장", icon: <Printer size={20} className="text-red-500" /> },
    { id: 'docx', label: "Word 문서 (.docx)", desc: "MS Word 및 구글 Docs 완벽 호환 문서", icon: <FileText size={20} className="text-blue-600" /> },
    { id: 'hwpx', label: "한글 문서 (.hwpx)", desc: "한컴오피스에서 편집할 수 있는 문서", icon: <FileText size={20} className="text-cyan-600" /> },
    { id: 'html', label: "HTML 파일", desc: "웹 브라우저에서 바로 열기용 (.html)", icon: <Globe size={20} className="text-blue-500" /> },
    { id: 'epub', label: "EPUB 전자책", desc: "eBook 리더 및 태블릿 기기용", icon: <BookOpen size={20} className="text-purple-500" /> },
    { id: 'png', label: "PNG 이미지", desc: "SNS 공유 및 프리젠테이션용", icon: <ImageIcon size={20} className="text-green-500" /> },
  ].filter(format => !isPicturebook || (format.id !== 'docx' && format.id !== 'hwpx'));

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/25 dark:bg-black/50 backdrop-blur-xs animate-in fade-in duration-200" 
      style={{ overflowY: "auto" }}
      onKeyDown={(e) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
      }}
    >
      <div 
        className={`w-full ${previewOpen?'max-w-6xl':'max-w-lg'} rounded-2xl shadow-2xl border flex flex-col ${
          isDarkMode ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white border-black/5 text-zinc-900'
        } animate-in zoom-in-95 duration-200`}
        style={{ maxHeight: "90dvh", overflow: "hidden" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EFEFEF] dark:border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#1d4ed8]/15 text-[#1d4ed8]">
              <Download size={18} />
            </div>
            <h2 className="text-base font-bold tracking-tight text-[#1d4ed8]">내보내기</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-2" style={{ fontFamily: "Pretendard, sans-serif" }}>
          <p className="text-[13px] opacity-60 px-1 mb-3">저장할 파일 형식을 선택해주세요.</p>
          
          <div className="grid grid-cols-1 gap-2">
            {formats.map((format) => (
              <button
                key={format.id}
                onClick={() => setSelectedFormat(format.id as any)}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all text-left ${
                  selectedFormat === format.id 
                    ? (isDarkMode ? 'bg-[#1d4ed8]/20 border-[#1d4ed8]/60' : 'bg-[#1d4ed8]/10 border-[#1d4ed8]')
                    : (isDarkMode ? 'bg-black/20 border-white/5 hover:border-white/20' : 'bg-black/5 border-black/5 hover:border-black/20')
                }`}
              >
                <div className={`mt-0.5 p-1.5 rounded-lg ${isDarkMode ? 'bg-black/40' : 'bg-white shadow-sm'}`}>
                  {format.icon}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm flex items-center justify-between">
                    {format.label}
                    {selectedFormat === format.id && <Check size={16} className="text-[#1d4ed8]" />}
                  </div>
                  <div className="text-[11px] opacity-60 mt-0.5">{format.desc}</div>
                </div>
              </button>
            ))}
          </div>
          {(selectedFormat==='print' || selectedFormat==='epub') && !isPicturebook && <section className="mt-4 space-y-3 border-t pt-4" aria-label="페이지 및 워터마크 설정">
            <p className="text-sm">{selectedFormat==='print' ? '아래 쪽 윤곽이 실제 인쇄/PDF 기준입니다. 편집 화면의 점선은 예상 경계이며, 용지·방향·여백은 서식관리 설정을 사용합니다.' : 'EPUB의 워터마크는 환경설정 기본값을 사용합니다.'}</p>
            <p className="rounded border p-3 text-sm">워터마크: {settings.enabled?'사용':'사용 안 함'}{settings.enabled&&<> · {settings.kind==='text'?settings.text:'리소스 이미지'} · 진하기 {settings.opacity}%</>}</p>
            <button type="button" className="rounded border px-4 py-2" onClick={onOpenWatermarkSettings}>환경설정에서 워터마크 관리</button>
            <p className="text-xs opacity-70">환경설정 → 기본에서 문구·이미지·위치·진하기를 관리합니다.</p>
            {selectedFormat==='print' && <><button type="button" className="rounded border px-4 py-2" onClick={()=>setPreviewOpen(v=>!v)}>{previewOpen?'쪽 윤곽 닫기':'쪽 윤곽 미리보기'}</button>

            {busy&&<p role="status">페이지를 계산하고 있습니다. 이전 미리보기는 갱신 중입니다.</p>}
            {previewOpen&&pageHtml&&!busy&&!printError&&<p>총 {pageHtml.match(/data-onrivi-pages="(\d+)"/)?.[1] || '—'}페이지 · 용지 설정은 서식관리에서 변경할 수 있습니다.</p>}
            {printError&&<p role="alert" className="text-red-600">{printError}</p>}
            {previewOpen&&pageHtml&&!printError&&<iframe title="쪽 윤곽 미리보기" sandbox="allow-same-origin" srcDoc={pageHtml} className={`h-[65vh] w-full border ${busy?'opacity-40':''}`}/>}</>
          }</section>}
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
            disabled={selectedFormat==='print' && (busy || !!printError)}
            onClick={() => onExport(selectedFormat as any)}
            className="px-5 py-2.5 rounded-xl bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-sm font-bold shadow-md shadow-[#1d4ed8]/20 transition-all flex items-center gap-2"
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
