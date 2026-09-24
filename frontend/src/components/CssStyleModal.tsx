/**
 * 프로그램명 : OnriviAuthor
 * 파일명 : CssStyleModal.tsx
 * -----------------------------------------------------------------------
 * 변경내역
 * -----------------------------------------------------------------------
 * 🚨 @PATCH : **2026-09-24** — [표 래퍼(.table-wrapper-area) 펄스 및 여백 동기화 지원]: table 태그 조작 시 table 및 .table-wrapper-area 동시 타겟팅하여 펄스 애니메이션 및 정렬 뷰포트 추종
 *             **2026-09-24** — [수평 구분선(HR) 타겟 자동 스크롤 및 속성 변경 시 요소 뷰포트 자동 정렬]: HR 아코디언 토글 시 Card 5 내부 hr 요소로 직행 스크롤하고, 속성 변경 시 뷰포트 밖 요소를 화면 중앙으로 자동 정렬하여 실시간 반응성 보장
 *             **2026-09-24** — [서식 관리 우측 5대 서식별 모듈 뭉침 뷰 및 1:1 실시간 동기화 펄스 연동]:
 *             1) 우측 뷰어를 좌측 설정과 1:1 대응되는 5대 서식 뭉침 카드(Grouped Showcase Cards)로 개편
 *             2) [🎴 서식별 모아보기] ↔ [📝 현재 편집 문서] 듀얼 뷰 모드 스위처 신설
 *             3) 좌측 아코디언 토글 시 해당 모듈 카드로 스무스 자동 스크롤 및 테두리 포커스 조명
 *             4) 속성 변경 시 해당 대상 태그 요소 실시간 펄스 하이라이트(.onrivi-sync-pulse) 및 상단 HUD 동기화 상태 배지 연동
 *             2026-09-11** — Modern Technical Editorial 디자인 시스템 적용 (Cobalt #1d4ed8, Inter / Plus Jakarta Sans)
 *             2026-09-02** — LINE Design System (LDSG v5.0) 표준 적용: 헤더 Palette 아이콘 배지 및 LDSG Green 타이틀 적용, 좌측 패널 .bg-sidebar-luxury 럭셔리 그라데이션 적용
 *             2026-08-15** — 모달 창을 풀스크린으로 전환 / 서식 관리 전용
 *             StyleManagerModal 신규 연동 / 헤더에 [서식 관리] + [에디터로 가기] 버튼 추가
 * -----------------------------------------------------------------------
 */
'use client';

import React, { useEffect, useState, useRef } from 'react';
import CssStyleForm from './CssStyleForm';
import StyleManagerModal from './StyleManagerModal';
import MarkdownViewer from './MarkdownViewer';
import { getWelcomeContent } from '@/constants/welcomeContent';
import { SHOWCASE_MODULES } from '@/constants/styleShowcaseModules';
import { CssProfile } from '@/types/cssProfile';
import { DEFAULT_PROFILE } from '@/constants/cssProfile';
import { X, Palette, Sparkles, Layers, FileText } from 'lucide-react';

interface CssStyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: CssProfile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onUpdateProfile: (profile: CssProfile) => void;
  onAddProfile?: () => void;
  onDeleteProfile?: (id: string) => void;
  onImportProfile?: (profile: CssProfile) => void;
  isDarkMode?: boolean;
  dynamicCssString?: string;
  geminiApiKey?: string;
  aiModelName?: string;
  currentDocContent?: string;
}

export default function CssStyleModal({
  isOpen,
  onClose,
  profiles,
  activeProfileId,
  onSelectProfile,
  onUpdateProfile,
  onAddProfile,
  onDeleteProfile,
  onImportProfile,
  isDarkMode,
  dynamicCssString,
  geminiApiKey,
  aiModelName,
  currentDocContent
}: CssStyleModalProps) {
  const [isStyleManagerOpen, setIsStyleManagerOpen] = useState(false);
  
  /* ─── 뷰 모드: 'modules' (서식별 뭉침 모아보기) vs 'document' (실제 내 문서 전체보기) ─── */
  const [previewViewMode, setPreviewViewMode] = useState<'modules' | 'document'>('modules');
  
  /* ─── 현재 포커스된 서식 모듈 ID ('typography' | 'headings' | 'lists' | 'boxes' | 'media') ─── */
  const [activeModuleId, setActiveModuleId] = useState<string>('typography');
  
  /* ─── 실시간 동기화 상태 텍스트 ─── */
  const [syncStatusText, setSyncStatusText] = useState<string>('실시간 미리보기');
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isStyleManagerOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isStyleManagerOpen]);

  /* ─── 좌측 아코디언 토글 시 우측 해당 모듈 카드로 자동 스크롤 & 활성화 ─── */
  const handleActiveSectionChange = (sectionId: string) => {
    let targetModule = 'typography';
    if (sectionId === 'headings') targetModule = 'headings';
    else if (sectionId === 'lists') targetModule = 'lists';
    else if (sectionId === 'others') targetModule = 'boxes';
    else if (sectionId === 'media' || sectionId === 'hr') targetModule = 'media';
    else if (sectionId === 'advanced' || sectionId === 'typography') targetModule = 'typography';

    setActiveModuleId(targetModule);

    // 모듈 모드일 때 해당 카드로 부드럽게 스크롤 이동
    if (previewViewMode === 'modules') {
      // 💡 수평 구분선(HR) 선택 시 Card 5 내부의 hr 위치로 직행 스크롤
      if (sectionId === 'hr') {
        const targetHr = document.querySelector('#omd-showcase-module-media hr');
        if (targetHr) {
          targetHr.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
      }
      const targetCard = document.getElementById('omd-showcase-module-' + targetModule);
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  /* ─── 속성 변경 시 해당 대상 태그 요소 펄스(Pulse) 하이라이트 & 헤더 HUD 갱신 ─── */
  const handleActiveTagChange = (tag: string, label?: string) => {
    const displayLabel = label || tag.toUpperCase();
    setSyncStatusText(`⚡ ${displayLabel} 실시간 동기화`);

    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
    }
    syncTimerRef.current = setTimeout(() => {
      setSyncStatusText('실시간 미리보기');
      syncTimerRef.current = null;
    }, 2000);

    // 우측 뷰어 컨테이너 내부의 해당 태그 요소에 펄스 애니메이션 부여
    const container = document.getElementById('omd-modal-preview-container');
    if (container) {
      const selector = tag === 'table' ? 'table, .table-wrapper-area' : tag;
      const targetElements = container.querySelectorAll(selector);
      targetElements.forEach((el) => {
        el.classList.remove('onrivi-sync-pulse');
        void (el as HTMLElement).offsetWidth; // 강제 reflow
        el.classList.add('onrivi-sync-pulse');
        setTimeout(() => {
          el.classList.remove('onrivi-sync-pulse');
        }, 1400);
      });

      // 💡 편집 중인 대상 요소가 현재 뷰포트 시야 밖에 있으면 중앙으로 부드럽게 스크롤 정렬
      if (targetElements.length > 0) {
        const firstEl = targetElements[0] as HTMLElement;
        const rect = firstEl.getBoundingClientRect();
        const isInViewport = rect.top >= 80 && rect.bottom <= (window.innerHeight - 80);
        if (!isInViewport) {
          firstEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  };

  if (!isOpen) return null;

  const welcomeContent = getWelcomeContent();
  const documentDisplayContent = (currentDocContent && currentDocContent.trim().length > 0)
    ? currentDocContent
    : welcomeContent;

  const activeProfile = profiles.find((p: any) => p.id === activeProfileId) || DEFAULT_PROFILE;
  const paperBgColor = activeProfile.pageStyle.backgroundColor || '#ffffff';

  return (
    <div className={`fixed inset-0 z-[200] flex flex-col transition-all duration-300 ${isDarkMode ? 'bg-[#111216]' : 'bg-[#F8F9FA]'}`}>
      <div className="w-full h-full flex flex-col overflow-hidden">

        {/* 상단 헤더 바 (Modern Technical Editorial & LDSG 규격) */}
        <div className={`flex items-center justify-between px-6 py-3 border-b shrink-0 ${isDarkMode ? 'border-[#22242A] bg-[#17191E]' : 'border-[#EFEFEF] bg-white'}`}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1d4ed8]/15 text-[#1d4ed8]">
              <Palette className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold tracking-tight text-[#1d4ed8]">
              서식 테마 설정
            </h2>

            {/* 실시간 동기화 상태 HUD 배지 */}
            <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold tracking-wide transition-all flex items-center gap-1.5 ${
              syncStatusText.startsWith('⚡')
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30 animate-pulse'
                : 'bg-[#1d4ed8]/10 text-[#1d4ed8]'
            }`}>
              <Sparkles className="w-3 h-3" />
              <span>{syncStatusText}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* 🎴 서식별 모아보기 ↔ 📝 현재 편집 문서 듀얼 뷰 모드 세그먼트 컨트롤 */}
            <div className="flex items-center p-0.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60 shadow-xs">
              <button
                type="button"
                onClick={() => setPreviewViewMode('modules')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  previewViewMode === 'modules'
                    ? 'bg-white dark:bg-zinc-700 text-[#1d4ed8] dark:text-blue-400 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
                title="5대 핵심 서식을 그룹별로 모아 한자리에서 정밀 비교"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>서식별 모아보기</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewViewMode('document')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  previewViewMode === 'document'
                    ? 'bg-white dark:bg-zinc-700 text-[#1d4ed8] dark:text-blue-400 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
                title="현재 에디터에서 작성 중인 실제 원고 전체에 서식 적용"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>현재 편집 문서</span>
              </button>
            </div>

            <div className="h-5 w-[1px] bg-zinc-200 dark:bg-zinc-800" />

            {/* 닫기 버튼 */}
            <button
              onClick={onClose}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-bold rounded-lg transition-colors ${isDarkMode ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-800'}`}
              title="닫기 (Esc)"
            >
              <span>에디터로 가기</span>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2분할 메인 콘텐츠 영역 */}
        <div className="flex flex-1 overflow-hidden relative">

          {/* 좌측: 서식 폼 (.bg-sidebar-luxury 표준) */}
          <div className={`w-[480px] shrink-0 h-full overflow-y-auto no-scrollbar border-r relative bg-sidebar-luxury ${isDarkMode ? 'border-[#22242A]' : 'border-[#EFEFEF]'}`}>
            <CssStyleForm
              profiles={profiles}
              activeProfileId={activeProfileId}
              onSelectProfile={onSelectProfile}
              onUpdateProfile={onUpdateProfile}
              onAddProfile={onAddProfile}
              onDeleteProfile={onDeleteProfile}
              onImportProfile={onImportProfile}
              onClose={onClose}
              onOpenStyleManager={() => setIsStyleManagerOpen(true)}
              isDarkMode={isDarkMode}
              geminiApiKey={geminiApiKey}
              aiModelName={aiModelName}
              onActiveSectionChange={handleActiveSectionChange}
              onActiveTagChange={handleActiveTagChange}
            />
          </div>

          {/* 우측: 듀얼 모드 프리뷰 뷰어 */}
          <div 
            ref={syncTimerRef as any}
            className={`flex-1 h-full overflow-y-auto p-6 lg:p-10 ${isDarkMode ? 'bg-[#0E0E10]' : 'bg-slate-100'}`}
          >
            <div
              className="max-w-[920px] mx-auto relative custom-preview-container"
              id="omd-modal-preview-container"
            >
              {dynamicCssString && (
                <style dangerouslySetInnerHTML={{ __html: dynamicCssString }} />
              )}

              {previewViewMode === 'modules' ? (
                /* 🎴 모드 1: 5대 서식별 뭉침 모아보기 카드 뷰 */
                <div className="space-y-8 pb-16">
                  {SHOWCASE_MODULES.map((mod) => {
                    const isCardActive = activeModuleId === mod.id;
                    return (
                      <div
                        key={mod.id}
                        id={'omd-showcase-module-' + mod.id}
                        className={`onrivi-showcase-card rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm ${
                          isCardActive
                            ? 'onrivi-showcase-card-active border-blue-500/80 ring-2 ring-blue-500/20 shadow-lg'
                            : 'border-slate-200/80 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700'
                        }`}
                        style={{ backgroundColor: paperBgColor }}
                      >
                        {/* 카드 상단 메타 헤더 바 */}
                        <div className={`px-6 py-3 border-b flex items-center justify-between ${
                          isDarkMode ? 'border-zinc-800/60 bg-zinc-900/40' : 'border-slate-200/60 bg-slate-50/70'
                        }`}>
                          <div className="flex items-center gap-2.5">
                            <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${
                              isCardActive
                                ? 'bg-blue-600 text-white'
                                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                            }`}>
                              {mod.badge}
                            </span>
                            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                              {mod.title}
                            </span>
                          </div>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:inline-block">
                            {mod.description}
                          </span>
                        </div>

                        {/* 마크다운 렌더링 바디 */}
                        <div className="p-6 lg:p-8">
                          <MarkdownViewer
                            content={mod.markdown}
                            originalContent={mod.markdown}
                            customCss={dynamicCssString}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* 📝 모드 2: 현재 편집 중인 실제 문서 전체 뷰 */
                <div
                  className="p-8 lg:p-12 relative shadow-sm border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl"
                  style={{ backgroundColor: paperBgColor }}
                >
                  <MarkdownViewer
                    content={documentDisplayContent}
                    originalContent={documentDisplayContent}
                    customCss={dynamicCssString}
                  />
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 서식 관리 모달 (풀스크린, z-index 더 높게) */}
      {isStyleManagerOpen && (
        <StyleManagerModal
          profiles={profiles}
          activeProfileId={activeProfileId}
          onSelectProfile={onSelectProfile}
          onUpdateProfile={onUpdateProfile}
          onAddProfile={onAddProfile}
          onDeleteProfile={onDeleteProfile}
          onImportProfile={onImportProfile}
          onClose={() => setIsStyleManagerOpen(false)}
          isDarkMode={isDarkMode}
          geminiApiKey={geminiApiKey}
          aiModelName={aiModelName}
        />
      )}
    </div>
  );
}
