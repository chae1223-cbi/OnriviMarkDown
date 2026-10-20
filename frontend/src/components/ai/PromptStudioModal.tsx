// ====================================================================
// 📊 [OMD-AI-PromptStudioModal-0001] src/components/ai/PromptStudioModal.tsx
// 🎯 @KICK  : 프롬프트 템플릿 전체 원문 열람·입력사항(변수) 작성 및 질의창 연동 전용 스튜디오 모달
// 🛡️ @GUARD : Rule 1(소스코드 주석 관리), Rule 3(역할 기반 컴포넌트 격리), Rule 6(Modern Technical Editorial)
// 🚨 @PATCH : **2026-10-20** — [사용자 템플릿 삭제(Delete) 기능 및 목록/상세 원클릭 제거 완비]:
//             1) 사용자 템플릿 삭제(onDeleteTemplate) 파이프라인 탑재: 데스크톱 ai_presets.json 및 런타임 스토리지 동기 삭제
//             2) 안전 삭제 가드: 기본 공식 템플릿은 삭제 차단(보호)하고 오직 사용자 템플릿에만 삭제 액션 활성화 및 확인 컨펌 제공
//             3) 삭제 완료 시 잔여 템플릿 자동 선택 및 뷰어 갱신으로 UX 연속성 보장
// 🚨 @PATCH : **2026-10-20** — [프롬프트 템플릿 스튜디오 전용 모달 신설 및 질의창 실시간 연동 완비]:
//             1) 좌우 2단 분할 레이아웃: 좌측 템플릿 카테고리/검색 목록 + 우측 전체 프롬프트 원문 뷰어 및 입력사항 작성 폼 탑재
//             2) 전체 프롬프트 원문(시스템 지침/작성 규칙)과 입력 양식 시원한 대형 뷰어로 한눈에 확인
//             3) 변수({{변수명}}) 및 입력 항목 폼 실시간 파싱 제공으로 손쉬운 맞춤형 파라미터 기입
//             4) [질의창에 적용] 원클릭 실행 시 완성된 전체 프롬프트가 메인 AI 질의창으로 100% 자동 연동 주입
// ====================================================================
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { AITemplate } from '@/lib/ai/templates';
import { templateVariables, fillTemplate } from '@/lib/ai/templates';

interface PromptStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPrompt: (finalPrompt: string) => void;
  templates: AITemplate[];
  builtins: AITemplate[];
  resourceFolder?: string | null;
  onSaveTemplate?: (template: AITemplate, isUpdate: boolean) => Promise<void>;
  onDeleteTemplate?: (templateId: string) => Promise<void>;
  initialPrompt?: string;
}

export default function PromptStudioModal({
  isOpen,
  onClose,
  onApplyPrompt,
  templates,
  builtins,
  onSaveTemplate,
  onDeleteTemplate,
  initialPrompt = '',
}: PromptStudioModalProps) {
  // 모달 활성화 및 선택 상태
  const [selectedId, setSelectedId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'builtin' | 'user'>('all');

  // 우측 폼 상태 (전체 프롬프트 원문 및 사용자 입력사항)
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [templateName, setTemplateName] = useState<string>('');
  const [templateFolder, setTemplateFolder] = useState<string>('');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [customUserInput, setCustomUserInput] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  const modalRef = useRef<HTMLDivElement>(null);

  // 통합 템플릿 목록
  const allTemplates = useMemo(() => {
    return [
      ...templates.map((t) => ({ ...t, isUser: true })),
      ...builtins.map((t) => ({ ...t, isUser: false })),
    ];
  }, [templates, builtins]);

  // 필터링된 템플릿 목록
  const filteredTemplates = useMemo(() => {
    let list = allTemplates;
    if (activeTab === 'user') list = list.filter((t) => t.isUser);
    if (activeTab === 'builtin') list = list.filter((t) => !t.isUser);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.folder && t.folder.toLowerCase().includes(q)) ||
          t.editorialCommand.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allTemplates, activeTab, searchQuery]);

  // 모달 열릴 때 기본 선택 초기화
  useEffect(() => {
    if (!isOpen) return;
    setFeedbackMsg('');
    if (allTemplates.length > 0 && !selectedId) {
      const first = allTemplates[0];
      setSelectedId(first.id);
      loadTemplateIntoView(first);
    } else if (selectedId) {
      const found = allTemplates.find((t) => t.id === selectedId);
      if (found) loadTemplateIntoView(found);
    }
  }, [isOpen, allTemplates]);

  // ESC 키 닫기 핸들러
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  // 템플릿 선택 시 우측 뷰에 로드
  const loadTemplateIntoView = (t: AITemplate & { isUser?: boolean }) => {
    setSelectedId(t.id);
    setTemplateName(t.name);
    setTemplateFolder(t.folder || '');
    setCurrentPrompt(t.editorialCommand || '');
    setFeedbackMsg('');

    // 변수 파싱
    const vars = templateVariables(t.editorialCommand || '');
    const initialVars: Record<string, string> = {};
    for (const v of vars) {
      initialVars[v] = '';
    }
    setVariables(initialVars);

    // {{변수}}가 없는 경우 userInputTemplate 또는 [입력 데이터] 영역 추출
    const userInputPart = (t as any).userInputTemplate || '';
    setCustomUserInput(userInputPart);
  };

  // 현재 감지된 변수 목록
  const detectedVariables = useMemo(() => {
    return templateVariables(currentPrompt);
  }, [currentPrompt]);

  // 최종 조합된 프롬프트 계산
  const computedFinalPrompt = useMemo(() => {
    let result = currentPrompt;
    if (detectedVariables.length > 0) {
      for (const [key, val] of Object.entries(variables)) {
        if (val) {
          result = result.replaceAll(`{{${key}}}`, val);
        }
      }
    }
    if (customUserInput.trim() && !currentPrompt.includes(customUserInput.trim())) {
      result += `\n\n[입력된 데이터]\n${customUserInput.trim()}`;
    }
    return result;
  }, [currentPrompt, detectedVariables, variables, customUserInput]);

  // 현재 선택된 템플릿 및 사용자 정의 여부 계산
  const currentSelectedTemplate = useMemo(() => {
    return allTemplates.find((t) => t.id === selectedId);
  }, [allTemplates, selectedId]);
  const isCurrentUserTemplate = Boolean(currentSelectedTemplate?.isUser);

  // 🚀 [질의창에 적용] 실행
  const handleApply = () => {
    onApplyPrompt(computedFinalPrompt);
    onClose();
  };

  // 🗑️ [템플릿 삭제]
  const handleDelete = async (targetIdToDelete?: string) => {
    const targetId = targetIdToDelete || selectedId;
    if (!onDeleteTemplate || !targetId) return;

    const targetTemplate = allTemplates.find((t) => t.id === targetId);
    if (!targetTemplate?.isUser) {
      setFeedbackMsg('⚠️ 기본 제공 공식 템플릿은 삭제할 수 없습니다.');
      return;
    }

    const confirmed = window.confirm(
      `정말로 '${targetTemplate.name}' 템플릿을 삭제하시겠습니까?\n삭제된 템플릿은 복구할 수 없습니다.`
    );
    if (!confirmed) return;

    setDeleting(true);
    setFeedbackMsg('');
    try {
      await onDeleteTemplate(targetId);
      setFeedbackMsg(`🗑️ '${targetTemplate.name}' 템플릿을 삭제했습니다.`);

      const remaining = allTemplates.filter((t) => t.id !== targetId);
      if (remaining.length > 0) {
        setSelectedId(remaining[0].id);
        loadTemplateIntoView(remaining[0]);
      } else {
        setSelectedId('');
        setTemplateName('');
        setTemplateFolder('');
        setCurrentPrompt('');
        setVariables({});
        setCustomUserInput('');
      }
    } catch (err: any) {
      setFeedbackMsg(`❌ 삭제 실패: ${err?.message || '알 수 없는 오류'}`);
    } finally {
      setDeleting(false);
    }
  };

  // 💾 [템플릿 저장]
  const handleSave = async (isUpdate: boolean) => {
    if (!onSaveTemplate) return;
    if (!templateName.trim()) {
      setFeedbackMsg('⚠️ 템플릿 이름을 입력해 주세요.');
      return;
    }
    setSaving(true);
    setFeedbackMsg('');
    try {
      const templateToSave: AITemplate = {
        id: isUpdate ? selectedId : `user-template-${Date.now()}`,
        name: templateName.trim(),
        folder: templateFolder.trim() || '사용자 템플릿',
        editorialCommand: currentPrompt,
      };
      await onSaveTemplate(templateToSave, isUpdate);
      setFeedbackMsg(isUpdate ? '✅ 템플릿을 수정 저장했습니다.' : '✅ 새 템플릿으로 저장했습니다.');
    } catch (err: any) {
      setFeedbackMsg(`❌ 저장 실패: ${err?.message || '알 수 없는 오류'}`);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="프롬프트 템플릿 스튜디오"
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-5xl h-[88vh] max-h-[760px] flex flex-col rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden text-zinc-900 dark:text-zinc-100"
      >
        {/* ── 1. 상단 헤더 ── */}
        <header className="shrink-0 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📑</span>
            <div>
              <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                프롬프트 템플릿 스튜디오
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold">
                  총 {allTemplates.length}개 템플릿
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                템플릿의 전체 프롬프트를 확인하고, 입력사항을 작성하여 메인 질의창으로 바로 전송하세요.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer text-base font-bold"
            title="닫기 (ESC)"
          >
            ✕
          </button>
        </header>

        {/* ── 2. 본문 2단 분할 영역 (좌: 템플릿 목록 / 우: 프롬프트 상세 및 입력폼) ── */}
        <div className="flex-1 flex overflow-hidden">
          {/* [좌측] 템플릿 탐색 사이드바 (너비 300px) */}
          <aside className="w-80 shrink-0 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-zinc-50/70 dark:bg-zinc-900/40">
            {/* 검색 및 카테고리 탭 */}
            <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 space-y-2">
              <input
                type="text"
                placeholder="템플릿 이름/내용 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <div className="flex rounded-lg bg-zinc-200/70 dark:bg-zinc-800 p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`flex-1 py-1 rounded-md transition ${
                    activeTab === 'all'
                      ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  전체 ({allTemplates.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('builtin')}
                  className={`flex-1 py-1 rounded-md transition ${
                    activeTab === 'builtin'
                      ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  공식 ({builtins.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('user')}
                  className={`flex-1 py-1 rounded-md transition ${
                    activeTab === 'user'
                      ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  내 템플릿 ({templates.length})
                </button>
              </div>
            </div>

            {/* 템플릿 리스트 */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredTemplates.length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-400">
                  검색 결과가 없습니다.
                </div>
              ) : (
                filteredTemplates.map((t) => {
                  const isSelected = selectedId === t.id;
                  return (
                    <div
                      key={t.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => loadTemplateIntoView(t)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          loadTemplateIntoView(t);
                        }
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition cursor-pointer flex flex-col gap-1 border relative group select-none ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-100 shadow-xs'
                          : 'bg-white dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold truncate flex-1">{t.name}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          {t.isUser ? (
                            <>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold shrink-0">
                                사용자
                              </span>
                              {onDeleteTemplate && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    void handleDelete(t.id);
                                  }}
                                  className="w-5 h-5 rounded flex items-center justify-center text-zinc-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/80 transition cursor-pointer text-xs opacity-60 group-hover:opacity-100"
                                  title="템플릿 삭제"
                                >
                                  🗑️
                                </button>
                              )}
                            </>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium shrink-0">
                              공식
                            </span>
                          )}
                        </div>
                      </div>
                      {t.folder && (
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium truncate">
                          📁 {t.folder}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          {/* [우측] 프롬프트 전체 원문 및 입력사항 작성 영역 */}
          <main className="flex-1 flex flex-col overflow-y-auto p-6 space-y-5 bg-white dark:bg-zinc-900">
            {/* 상단 템플릿 타이틀 & 피드백 & 삭제 버튼 */}
            <div className="flex flex-col gap-1.5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    선택된 템플릿
                  </span>
                  {templateFolder && (
                    <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">
                      📁 {templateFolder}
                    </span>
                  )}
                  {isCurrentUserTemplate ? (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                      사용자 템플릿
                    </span>
                  ) : (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">
                      시스템 공식 템플릿 (읽기 전용)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {feedbackMsg && (
                    <span className="text-xs font-semibold animate-in fade-in text-blue-600 dark:text-blue-400">
                      {feedbackMsg}
                    </span>
                  )}
                  {isCurrentUserTemplate && onDeleteTemplate && (
                    <button
                      type="button"
                      disabled={deleting}
                      onClick={() => void handleDelete()}
                      className="px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-bold text-rose-600 dark:text-rose-400 transition cursor-pointer flex items-center gap-1 disabled:opacity-40"
                      title="이 사용자 템플릿 영구 삭제"
                    >
                      <span>🗑️ 삭제</span>
                    </button>
                  )}
                </div>
              </div>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="템플릿 이름"
                className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-blue-500 focus:outline-none transition py-0.5"
              />
            </div>

            {/* ── A. 템플릿 전체 프롬프트 원문 뷰어 (많은 내용을 시원하게 확인) ── */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <span>📜</span>
                  <span>템플릿 전체 프롬프트 원문</span>
                  <span className="text-[11px] font-normal text-zinc-400">
                    ({currentPrompt.length.toLocaleString()}자)
                  </span>
                </label>
                <span className="text-[11px] text-zinc-400">
                  직접 수정 가능 · 아래 변수 폼과 자동 동기화
                </span>
              </div>
              <textarea
                rows={8}
                value={currentPrompt}
                onChange={(e) => setCurrentPrompt(e.target.value)}
                placeholder="전체 프롬프트 원문 (작성 규칙, 지침, 템플릿 양식 등)..."
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950/60 p-3.5 text-xs text-zinc-900 dark:text-zinc-100 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y max-h-[300px]"
              />
            </div>

            {/* ── B. 입력사항 (변수 및 사용자 데이터) 작성 폼 ── */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <span>✍️</span>
                  <span>템플릿 입력사항 작성</span>
                </label>
                <span className="text-[11px] text-zinc-400">
                  {detectedVariables.length > 0
                    ? `감지된 입력 변수: ${detectedVariables.length}개`
                    : '세부 입력 데이터를 기입하세요'}
                </span>
              </div>

              {/* 1) {{변수}}가 있는 경우: 각 변수별 개별 인풋 제공 */}
              {detectedVariables.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                  {detectedVariables.map((vName) => (
                    <div key={vName} className="space-y-1">
                      <label className="block text-xs font-bold text-blue-900 dark:text-blue-200">
                        {vName}
                      </label>
                      <input
                        type="text"
                        value={variables[vName] || ''}
                        onChange={(e) =>
                          setVariables((prev) => ({ ...prev, [vName]: e.target.value }))
                        }
                        placeholder={`${vName} 입력...`}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* 2) 추가 입력 데이터 / 사용자 요구사항 작성 */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400">
                  추가 고객 데이터 및 전달사항 (선택 기입)
                </label>
                <textarea
                  rows={4}
                  value={customUserInput}
                  onChange={(e) => setCustomUserInput(e.target.value)}
                  placeholder="예: 보고서 제목, 핵심 통계 수치, 타겟 독자, 특별 요구조건 등..."
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 text-xs text-zinc-900 dark:text-zinc-100 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y"
                />
              </div>
            </div>

            {/* ── C. 최종 연동 프롬프트 미리보기 아코디언 ── */}
            <details className="group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-3">
              <summary className="text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer flex items-center justify-between select-none">
                <span className="flex items-center gap-1.5">
                  <span>👁️</span> 완성될 프롬프트 미리보기 ({computedFinalPrompt.length.toLocaleString()}자)
                </span>
                <span className="text-[11px] text-blue-600 dark:text-blue-400 group-open:rotate-180 transition">
                  ▼
                </span>
              </summary>
              <div className="mt-2.5 p-3 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 max-h-48 overflow-y-auto text-xs font-mono whitespace-pre-wrap text-zinc-800 dark:text-zinc-200 leading-relaxed">
                {computedFinalPrompt}
              </div>
            </details>
          </main>
        </div>

        {/* ── 3. 하단 액션 버튼바 ── */}
        <footer className="shrink-0 px-6 py-3.5 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            {onSaveTemplate && (
              <>
                <button
                  type="button"
                  disabled={saving || !currentPrompt.trim()}
                  onClick={() => void handleSave(false)}
                  className="px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition cursor-pointer disabled:opacity-40"
                >
                  {saving ? '저장 중…' : '새 템플릿 복제 저장'}
                </button>
                <button
                  type="button"
                  disabled={saving || !currentPrompt.trim()}
                  onClick={() => void handleSave(true)}
                  className="px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition cursor-pointer disabled:opacity-40"
                >
                  수정 저장
                </button>
              </>
            )}
            {isCurrentUserTemplate && onDeleteTemplate && (
              <button
                type="button"
                disabled={deleting || saving}
                onClick={() => void handleDelete()}
                className="px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-xs font-bold text-rose-600 dark:text-rose-400 transition cursor-pointer disabled:opacity-40 flex items-center gap-1"
                title="현재 선택된 사용자 템플릿 영구 삭제"
              >
                <span>🗑️ 템플릿 삭제</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-extrabold shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-1.5"
            >
              <span>🚀 질의창에 적용하기</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
