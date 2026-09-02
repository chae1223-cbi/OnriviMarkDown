/**
 * 프로그램명 : OnriviAuthor
 * 파일명 : StyleManagerModal.tsx
 * -----------------------------------------------------------------------
 * 변경내역
 * -----------------------------------------------------------------------
 * <2026-08-15> 최초작성
 * 🚨 @PATCH : **2026-09-02** — LINE Design System (LDSG v5.0) 표준 적용: 좌측 서식 목록 사이드바 .bg-sidebar-luxury 럭셔리 그라데이션 적용 및 LDSG Green(#06C755)/Blue(#4D73FF) 컬러 시스템 100% 통일
 *             **2026-08-15** — 서식 테마 관리(추가/삭제/이름변경/가져오기/내보내기/AI생성)를
 *             CssStyleForm 인라인 UI에서 분리하여 전용 풀스크린 모달로 독립
 *             z-index를 z-[210]으로 상향 (CssStyleModal z-[200] 위) /
 *             닫기 버튼 → "서식설정으로 가기" 로 변경
 * -----------------------------------------------------------------------
 */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, Check, Upload, Download, Sparkles, BookOpen } from 'lucide-react';
import { CssProfile } from '@/types/cssProfile';
import { isSystemProfileId } from '@/constants/cssProfile';
import { CSS_PROFILE_GUIDE_MD } from '@/constants/cssProfileGuide';
import ConfirmModal from './ConfirmModal';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface StyleManagerModalProps {
  profiles: CssProfile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onUpdateProfile: (profile: CssProfile) => void;
  onAddProfile?: () => void;
  onDeleteProfile?: (id: string) => void;
  onImportProfile?: (profile: CssProfile) => void;
  onClose: () => void;
  isDarkMode?: boolean;
  geminiApiKey?: string;
  aiModelName?: string;
}

export default function StyleManagerModal({
  profiles,
  activeProfileId,
  onSelectProfile,
  onUpdateProfile,
  onAddProfile,
  onDeleteProfile,
  onImportProfile,
  onClose,
  isDarkMode,
  geminiApiKey,
  aiModelName,
}: StyleManagerModalProps) {
  const [selectedId, setSelectedId] = useState(activeProfileId);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [importJsonText, setImportJsonText] = useState('');
  const [showJsonImport, setShowJsonImport] = useState(false);
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean; title: string; message: string; isDanger?: boolean; onConfirm: () => void;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedProfile = profiles.find(p => p.id === selectedId) || profiles[0];
  const isSystem = isSystemProfileId(selectedProfile?.id || '');

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const dk = isDarkMode;

  /* ─── 이름 변경 ─── */
  const handleRenameStart = () => {
    if (isSystem) return;
    setTempName(selectedProfile.name);
    setIsEditingName(true);
  };

  const handleRenameSave = () => {
    if (!tempName.trim()) return;
    onUpdateProfile({ ...selectedProfile, name: tempName.trim() });
    setIsEditingName(false);
    showToast('이름이 변경되었습니다.');
  };

  /* ─── 삭제 ─── */
  const handleDeleteClick = () => {
    if (isSystem || !onDeleteProfile) return;
    setConfirmConfig({
      isOpen: true,
      title: '서식 삭제',
      message: `서식 "${selectedProfile.name}"을(를) 정말로 삭제하시겠습니까?`,
      isDanger: true,
      onConfirm: () => {
        onDeleteProfile(selectedProfile.id);
        const remaining = profiles.filter(p => p.id !== selectedProfile.id);
        if (remaining.length > 0) {
          setSelectedId(remaining[0].id);
          onSelectProfile(remaining[0].id);
        }
        setConfirmConfig(null);
        showToast('서식이 삭제되었습니다.');
      },
    });
  };

  /* ─── 내보내기 ─── */
  const handleExport = () => {
    const json = JSON.stringify(selectedProfile, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedProfile.name.replace(/[^a-z0-9가-힣]/gi, '_')}_theme.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('서식 파일(.json)이 다운로드되었습니다.');
  };

  /* ─── 가져오기 (파일) ─── */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (!parsed.name || !parsed.pageStyle || !parsed.rules) {
          showToast('올바른 Onrivi 서식 양식이 아닙니다.');
          return;
        }
        if (onImportProfile) {
          onImportProfile(parsed);
          showToast('서식이 성공적으로 불러와졌습니다.');
        }
      } catch {
        showToast('JSON 문법 오류! 파일을 확인해 주세요.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  /* ─── 가져오기 (JSON 텍스트) ─── */
  const handleJsonImport = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (!parsed.name || !parsed.pageStyle || !parsed.rules) {
        showToast('올바른 Onrivi 서식 양식이 아닙니다.');
        return;
      }
      if (onImportProfile) {
        onImportProfile(parsed);
        setImportJsonText('');
        setShowJsonImport(false);
        showToast('서식이 성공적으로 불러와졌습니다.');
      }
    } catch {
      showToast('JSON 문법 오류! 내용을 확인해 주세요.');
    }
  };

  /* ─── AI 서식 생성 ─── */
  const handleAiGenerate = async () => {
    if (!aiPromptInput.trim() || !geminiApiKey) return;
    setIsAiGenerating(true);
    try {
      let guideContent = '';
      try {
        const res = await fetch('/CSS_PROFILE_GUIDE.md');
        if (res.ok) guideContent = await res.text();
      } catch {}

      const promptText = `당신은 마크다운 조판 서식 디자이너입니다. 사용자가 입력한 설명에 부합하는 세련되고 아름다운 CSS 서식 테마(CssProfile) 데이터를 생성해 주세요.
사용자 요청: "${aiPromptInput}"

다음은 Onrivi Author의 공식 CSS 서식 프로필 가이드 문서입니다. 이를 바탕으로 JSON 객체 규격을 완벽하게 준수하여 생성하세요:
--- 가이드 시작 ---
${guideContent}
--- 가이드 끝 ---

반드시 위 가이드라인과 JSON 구조를 준수해야 하며, 다른 텍스트 설명이나 코드 블록 기호(\`\`\`) 없이 오직 순수한 JSON 문자열만 출력해 주세요.`;

      const genAI = new GoogleGenerativeAI((geminiApiKey || '').trim());
      const model = genAI.getGenerativeModel({
        model: aiModelName || 'gemini-1.5-pro',
        systemInstruction: '당신은 CSS 서식 JSON 생성 전문가입니다. 오직 순수한 JSON 객체만 출력하십시오.',
      });
      const result = await model.generateContent(promptText);
      let cleanedText = result.response.text().trim();

      const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
      const match = cleanedText.match(jsonBlockRegex);
      if (match && match[1]) cleanedText = match[1].trim();

      const startIdx = cleanedText.indexOf('{');
      if (startIdx !== -1) {
        let braceCount = 0, inString = false, escape = false;
        for (let i = startIdx; i < cleanedText.length; i++) {
          const char = cleanedText[i];
          if (escape) { escape = false; continue; }
          if (char === '\\') { escape = true; continue; }
          if (char === '"') { inString = !inString; continue; }
          if (!inString) {
            if (char === '{') braceCount++;
            else if (char === '}') {
              braceCount--;
              if (braceCount === 0) { cleanedText = cleanedText.substring(startIdx, i + 1); break; }
            }
          }
        }
      }

      const parsedData = JSON.parse(cleanedText);
      if (onImportProfile) {
        onImportProfile(parsedData);
        setAiPromptInput('');
        showToast('AI 서식 테마가 생성되었습니다!');
      }
    } catch (err: any) {
      showToast(err.message || 'AI 서식 생성 실패.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  /* ─── CSS 가이드 다운로드 ─── */
  const handleDownloadGuide = () => {
    const dataStr = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(CSS_PROFILE_GUIDE_MD);
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', 'Onrivi_CSS_Profile_명세서.md');
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast('서식 작성 가이드가 다운로드되었습니다.');
  };

  // LDSG 기반 디자인 시스템 색상 상수
  const bg = dk ? 'bg-[#111216]' : 'bg-[#F8F9FA]';
  const border = dk ? 'border-[#22242A]' : 'border-[#EFEFEF]';
  const headerBg = dk ? 'bg-[#17191E]' : 'bg-white';
  const textMain = dk ? 'text-zinc-100' : 'text-slate-800';
  const textSub = dk ? 'text-zinc-400' : 'text-slate-500';
  const cardBg = dk ? 'bg-[#17191E]' : 'bg-white';
  
  const inputCls = `w-full bg-slate-50 dark:bg-[#131519] border border-[#EFEFEF] dark:border-[#22242A] rounded-lg px-3 py-2 text-[12px] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#06C755] transition-colors`;
  const btnPrimary = `px-4 py-1.5 text-[12px] font-bold text-white bg-[#06C755] hover:bg-[#05B34C] rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors`;
  const btnSecondary = `px-3 py-1.5 text-[12px] font-bold rounded-lg transition-colors ${dk ? 'bg-[#17191E] text-zinc-300 hover:bg-[#22242A] hover:text-white border border-[#22242A]' : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-[#EFEFEF]'}`;

  return (
    <div className={`fixed inset-0 z-[210] flex flex-col font-sans ${bg}`}>
      {/* LDSG 프리미엄 헤더 */}
      <div className={`flex items-center justify-between px-8 py-4 border-b shrink-0 ${headerBg} ${border}`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#06C755]/15 text-[#06C755]">
            <BookOpen className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold tracking-tight text-[#06C755]">서식 관리 센터</h2>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold tracking-wide bg-[#06C755]/10 text-[#06C755]">
            {profiles.length} Profiles
          </span>
        </div>
        <button
          onClick={onClose}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-bold rounded-lg transition-colors ${dk ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-800'}`}
        >
          <span>서식설정으로 가기</span>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 본문 레이아웃 */}
      <div className="flex flex-1 overflow-hidden">

        {/* 좌측: 서식 목록 사이드바 (.bg-sidebar-luxury 표준) */}
        <div className={`w-[280px] shrink-0 border-r ${border} bg-sidebar-luxury flex flex-col overflow-hidden`}>
          <div className={`px-4 py-3 flex items-center justify-between border-b ${border}`}>
            <span className={`text-[11px] font-bold tracking-widest uppercase ${textSub}`}>등록된 서식</span>
            <div className="flex items-center gap-0">
              {onAddProfile && (
                <button
                  onClick={onAddProfile}
                  className={`p-1 rounded-md transition-colors ${dk ? 'hover:bg-zinc-800' : 'hover:bg-slate-200'}`}
                  title="새 서식 추가"
                >
                  <img src="/icons/icon-file-plus.png" width={16} height={16} alt="새 서식" className="opacity-90" />
                </button>
              )}
              {onDeleteProfile && !isSystem && (
                <button
                  onClick={handleDeleteClick}
                  className={`p-1 rounded-md transition-colors ${dk ? 'hover:bg-red-900/30' : 'hover:bg-red-50'}`}
                  title="현재 선택된 서식 삭제"
                >
                  <img src="/icons/icon-delete.png" width={16} height={16} alt="삭제" className="opacity-90" />
                </button>
              )}
            </div>
          </div>
          
          {/* 검색 바 */}
          <div className={`px-3 py-2 border-b ${border}`}>
            <input
              type="text"
              placeholder="서식 검색..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 custom-scrollbar">
            {profiles.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => {
              const isSys = isSystemProfileId(p.id);
              const isActive = p.id === selectedId;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedId(p.id);
                    onSelectProfile(p.id);
                    setIsEditingName(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                    isActive
                      ? dk ? 'bg-[#06C755]/20 text-[#06C755] font-bold shadow-sm' : 'bg-[#06C755]/10 text-[#06C755] font-bold shadow-sm'
                      : dk ? 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200' : 'text-slate-600 hover:bg-black/5 hover:text-slate-900'
                  }`}
                >
                  <span className={`flex items-center justify-center text-[14px] ${isActive ? '' : 'opacity-60'}`}>
                    {isSys ? '🏛️' : '🫆'}
                  </span>
                  <span className={`text-[12px] ${isActive ? 'font-bold' : 'font-medium'} truncate`}>{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 우측: 디테일 관리 패널 */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div className="max-w-[640px] mx-auto space-y-8 pb-20">

            {/* 타이틀 영역 */}
            <div className="pb-4 border-b border-dashed border-zinc-200 dark:border-zinc-800 flex items-start justify-between gap-4">
              <div>
                <h1 className={`text-2xl font-bold tracking-tight ${textMain}`}>
                  {isEditingName ? '서식 이름 변경' : selectedProfile?.name}
                </h1>
                <p className={`text-sm mt-1.5 ${textSub}`}>
                  {isSystem ? '이 서식은 시스템 기본 서식으로 수정이 제한됩니다.' : '이 서식의 이름을 변경하거나 내보내기/가져오기를 수행할 수 있습니다.'}
                </p>
              </div>
              <button
                onClick={() => {
                  onSelectProfile(selectedProfile.id);
                  onClose();
                }}
                className={`shrink-0 px-4 py-2.5 text-[13px] font-bold text-white bg-[#06C755] hover:bg-[#05B34C] rounded-xl shadow-md transition-all duration-200 flex items-center gap-2 hover:scale-105 active:scale-95`}
              >
                <Check className="w-4 h-4" />
                이 서식 반영하고 돌아가기
              </button>
            </div>

            {/* 기본 설정 섹션 */}
            <section className="space-y-4">
              <h3 className={`text-[13px] font-semibold tracking-wider uppercase ${textSub}`}>기본 설정</h3>
              <div className={`p-6 rounded-2xl border ${border} ${cardBg} shadow-sm`}>
                <label className={`block text-[12px] font-medium mb-2 ${textMain}`}>서식 이름</label>
                {isEditingName ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tempName}
                      onChange={e => setTempName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleRenameSave(); if (e.key === 'Escape') setIsEditingName(false); }}
                      autoFocus
                      className={inputCls}
                    />
                    <button onClick={handleRenameSave} className={btnPrimary}>저장</button>
                    <button onClick={() => setIsEditingName(false)} className={btnSecondary}>취소</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className={`flex-1 px-4 py-2.5 text-[14px] font-bold rounded-xl border ${border} ${dk ? 'bg-zinc-900 text-zinc-200' : 'bg-slate-50 text-slate-800'}`}>
                      {selectedProfile?.name}
                    </div>
                    <button
                      onClick={handleRenameStart}
                      disabled={isSystem}
                      className={btnSecondary}
                    >
                      <div className="flex items-center gap-2">
                        <img src="/icons/icon-rename.png" width={14} height={14} alt="이름 변경" className="opacity-90" />
                        이름 변경
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* 데이터 관리 섹션 */}
            <section className="space-y-4">
              <h3 className={`text-[13px] font-semibold tracking-wider uppercase ${textSub}`}>데이터 관리</h3>
              <div className={`p-6 rounded-2xl border ${border} ${cardBg} shadow-sm space-y-6`}>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* JSON 파일 가져오기 */}
                  <div className={`p-4 rounded-xl border ${border} ${dk ? 'bg-zinc-900/30 hover:bg-zinc-900/50' : 'bg-slate-50 hover:bg-slate-100/70'} transition-colors group cursor-pointer flex items-center gap-3`} onClick={() => fileInputRef.current?.click()}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-transparent shrink-0`}>
                      <img src="/icons/icon-import.png" width={24} height={24} alt="가져오기" className="opacity-90" />
                    </div>
                    <div>
                      <h4 className={`text-[13px] font-bold ${textMain}`}>파일 불러오기</h4>
                      <p className={`text-[11px] ${textSub} leading-relaxed mt-0.5`}>기기에 저장된 서식 JSON 파일을 로드합니다.</p>
                    </div>
                    <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                  </div>

                  {/* 내보내기 */}
                  <div className={`p-4 rounded-xl border ${border} ${dk ? 'bg-zinc-900/30 hover:bg-zinc-900/50' : 'bg-slate-50 hover:bg-slate-100/70'} transition-colors group cursor-pointer flex items-center gap-3`} onClick={handleExport}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dk ? 'bg-zinc-800 text-zinc-300' : 'bg-white shadow-sm text-slate-600 border border-slate-200'} shrink-0`}>
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className={`text-[13px] font-bold ${textMain}`}>파일 내보내기</h4>
                      <p className={`text-[11px] ${textSub} leading-relaxed mt-0.5`}>현재 서식을 JSON 파일로 기기에 저장합니다.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800/60">
                  <button
                    onClick={() => setShowJsonImport(!showJsonImport)}
                    className={`text-[12px] font-medium ${textSub} hover:${textMain} transition-colors flex items-center gap-1.5`}
                  >
                    <span>{showJsonImport ? '▼' : '▶'}</span>
                    클립보드 텍스트로 가져오기
                  </button>
                  {showJsonImport && (
                    <div className="mt-4 flex flex-col gap-3 animate-fadeIn">
                      <textarea
                        value={importJsonText}
                        onChange={e => setImportJsonText(e.target.value)}
                        placeholder='{"name": "나의 서식", "pageStyle": {...}, "rules": {...}}'
                        className={`${inputCls} h-32 font-mono text-[11px] resize-none`}
                      />
                      <div className="flex justify-end">
                        <button onClick={handleJsonImport} disabled={!importJsonText.trim()} className={btnPrimary}>
                          적용하기
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* AI 자동 생성 섹션 */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className={`text-[13px] font-semibold tracking-wider uppercase ${textSub}`}>AI 제너레이터</h3>
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${dk ? 'bg-[#06C755]/20 text-[#06C755]' : 'bg-[#06C755]/10 text-[#06C755]'}`}>BETA</div>
              </div>
              <div className={`p-6 rounded-2xl border ${border} ${cardBg} shadow-sm relative overflow-hidden group`}>
                
                {/* 은은한 배경 그라데이션 장식 */}
                <div className={`absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none transition-opacity duration-700 group-hover:opacity-20 ${dk ? 'bg-gradient-to-bl from-[#06C755] to-transparent' : 'bg-gradient-to-bl from-emerald-300 to-transparent'} rounded-bl-full`} />

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className={`w-4 h-4 text-[#06C755]`} />
                    <span className={`text-[13px] font-bold ${textMain}`}>프롬프트로 서식 생성</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {[
                      { label: '감성 에세이', text: 'Noto Serif KR 명조체, 따뜻하고 은은한 아이보리 미색 배경(#FAF6ED), 넓고 부드러운 줄간격 1.8, 차분한 밤색 텍스트와 단정한 인용상자' },
                      { label: '기술 보고서', text: 'Noto Sans KR 고딕체, 맑고 깨끗한 화이트 배경(#FFFFFF), 신뢰감을 주는 네이비 블루 강조색상(#0058BC), 정돈된 표 서식' },
                      { label: '시나리오 대본', text: 'monospace 계열 글꼴, 차분한 다크 슬레이트 배경(#1E1E24), 흑백 모노톤, 단락 앞뒤 마진 크게 주어 대본 느낌 극대화' },
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => setAiPromptInput(chip.text)}
                        disabled={isAiGenerating}
                        className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-colors ${dk ? 'bg-zinc-800 hover:bg-[#06C755]/20 text-zinc-300 hover:text-[#06C755] border border-zinc-700' : 'bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-[#06C755] border border-slate-200'}`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>

                  <textarea
                    placeholder="원하는 서식 스타일을 자유롭게 묘사해 보세요."
                    value={aiPromptInput}
                    onChange={e => setAiPromptInput(e.target.value)}
                    disabled={isAiGenerating}
                    className={`${inputCls} h-24 resize-none mb-3`}
                  />
                  
                  <div className="flex items-center justify-between">
                    {!geminiApiKey ? (
                      <span className={`text-[11px] ${textSub}`}>* 환경설정에서 Gemini API Key를 등록해야 활성화됩니다.</span>
                    ) : <span />}
                    <button
                      onClick={handleAiGenerate}
                      disabled={isAiGenerating || !aiPromptInput.trim() || !geminiApiKey}
                      className={btnPrimary}
                    >
                      {isAiGenerating ? (
                        <div className="flex items-center gap-2"><span className="animate-spin">⏳</span> <span>생성 중...</span></div>
                      ) : (
                        <div className="flex items-center gap-1.5"><span>마법 실행</span> <Sparkles className="w-3.5 h-3.5" /></div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* 하단 관리 영역 */}
            <div className="pt-8 mt-8 border-t border-zinc-200 dark:border-zinc-800/60 flex items-center justify-between">
              <button
                onClick={handleDownloadGuide}
                className={`flex items-center gap-2 text-[12px] font-bold transition-colors ${dk ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <BookOpen className="w-4 h-4" />
                <span>CSS 프로필 개발자 가이드</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[70] px-6 py-3 bg-zinc-900 text-white text-[13px] font-medium rounded-xl shadow-2xl animate-in slide-in-from-bottom-5">
          {toast}
        </div>
      )}

      {/* Confirm Modal */}
      {confirmConfig && (
        <ConfirmModal
          isOpen={confirmConfig.isOpen}
          title={confirmConfig.title}
          message={confirmConfig.message}
          isDanger={confirmConfig.isDanger}
          onConfirm={confirmConfig.onConfirm}
          onCancel={() => setConfirmConfig(null)}
        />
      )}
    </div>
  );
}
