/**
 * 프로그램명 : OnriviAuthor
 * 파일명 : CssStyleModal.tsx
 * -----------------------------------------------------------------------
 * 변경내역
 * -----------------------------------------------------------------------
 * <2026-08-15> 최초작성
 * 🚨 @PATCH : **2026-09-02** — LINE Design System (LDSG v5.0) 표준 적용: 헤더 Palette 아이콘 배지 및 LDSG Green 타이틀 적용, 좌측 패널 .bg-sidebar-luxury 럭셔리 그라데이션 적용
 *             **2026-08-15** — 모달 창을 풀스크린으로 전환 / 서식 관리 전용
 *             StyleManagerModal 신규 연동 / 헤더에 [서식 관리] + [에디터로 가기] 버튼 추가
 *             z-index를 z-[200]으로 상향 (MenuBar z-[100] 완전 덮기) /
 *             좌측 CssStyleForm 패널 너비 480px로 확장 / CssStyleForm 내부 w-full로 변경
 * -----------------------------------------------------------------------
 */
'use client';

import React, { useEffect, useState } from 'react';
import CssStyleForm from './CssStyleForm';
import StyleManagerModal from './StyleManagerModal';
import MarkdownViewer from './MarkdownViewer';
import { getWelcomeContent } from '@/constants/welcomeContent';
import { CssProfile } from '@/types/cssProfile';
import { DEFAULT_PROFILE } from '@/constants/cssProfile';
import { X, Settings2, Palette } from 'lucide-react';

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
  aiModelName
}: CssStyleModalProps) {
  const [isStyleManagerOpen, setIsStyleManagerOpen] = useState(false);

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

  if (!isOpen) return null;

  const welcomeContent = getWelcomeContent();

  return (
    <div className={`fixed inset-0 z-[200] flex flex-col transition-all duration-300 ${isDarkMode ? 'bg-[#111216]' : 'bg-[#F8F9FA]'}`}>
      <div className="w-full h-full flex flex-col overflow-hidden">

        {/* 상단 헤더 바 (LDSG 규격 통일) */}
        <div className={`flex items-center justify-between px-6 py-3.5 border-b shrink-0 ${isDarkMode ? 'border-[#22242A] bg-[#17191E]' : 'border-[#EFEFEF] bg-white'}`}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#06C755]/15 text-[#06C755]">
              <Palette className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold tracking-tight text-[#06C755]">
              서식 테마 설정
            </h2>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold tracking-wide bg-[#06C755]/10 text-[#06C755]">
              실시간 미리보기
            </span>
          </div>
          <div className="flex items-center gap-2">
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
            />
          </div>

          {/* 우측: 샘플 검증 프리뷰 */}
          <div className={`flex-1 h-full overflow-y-auto ${isDarkMode ? 'bg-[#0E0E10]' : 'bg-slate-100'}`}>
            {(() => {
              const activeProfile = profiles.find((p: any) => p.id === activeProfileId) || DEFAULT_PROFILE;
              const paperBgColor = activeProfile.pageStyle.backgroundColor || '#ffffff';
              return (
                <div
                  className="max-w-[900px] mx-auto p-8 lg:p-12 relative custom-preview-container shadow-sm border border-slate-200/50 my-8 rounded-xl"
                  id="omd-modal-preview-container"
                  style={{ backgroundColor: paperBgColor }}
                >
                  {dynamicCssString && (
                    <style dangerouslySetInnerHTML={{ __html: dynamicCssString }} />
                  )}
                  <MarkdownViewer
                    content={welcomeContent}
                    originalContent={welcomeContent}
                  />
                </div>
              );
            })()}
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

