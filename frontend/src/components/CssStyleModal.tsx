'use client';

import React, { useEffect } from 'react';
import CssStyleForm from './CssStyleForm';
import MarkdownViewer from './MarkdownViewer';
import { getWelcomeContent } from '@/constants/welcomeContent';
import { CssProfile } from '@/types/cssProfile';
import { X, BookOpen } from 'lucide-react';

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
  dynamicCssString
}: CssStyleModalProps) {
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
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];
  const welcomeContent = getWelcomeContent();

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 backdrop-blur-sm transition-all duration-300 ${isDarkMode ? 'bg-black/70' : 'bg-slate-900/40'}`}>
      <div className={`w-full max-w-[1600px] h-full max-h-[900px] flex flex-col rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${isDarkMode ? 'bg-zinc-950 border border-zinc-800' : 'bg-white border border-slate-200'}`}>
        
        {/* 상단 헤더 바 */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-zinc-800 bg-zinc-900' : 'border-slate-200 bg-slate-50'}`}>
          <div className="flex items-center gap-3">
            <span className="text-xl">🎨</span>
            <h2 className={`text-lg font-bold ${isDarkMode ? 'text-zinc-100' : 'text-slate-800'}`}>
              서식 테마 갤러리 (Style Settings)
            </h2>
            <span className={`text-sm px-2.5 py-0.5 rounded-full font-semibold ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>
              실시간 샘플 검증 모드
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/CSS_PROFILE_GUIDE.md"
              download
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${isDarkMode ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300 hover:text-slate-900'}`}
              title="서식설정 전용 CSS 문법 및 속성 설명서 다운로드"
            >
              <BookOpen className="w-4 h-4" />
              <span>CSS 가이드 문서 다운로드</span>
            </a>
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-800'}`}
              title="닫기 (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2분할 메인 콘텐츠 영역 */}
        <div className="flex flex-1 overflow-hidden relative">
          
          {/* 좌측: 서식 폼 (35%) */}
          <div className={`w-[35%] min-w-[380px] max-w-[500px] h-full overflow-y-auto no-scrollbar border-r relative ${isDarkMode ? 'border-zinc-800 bg-zinc-950/50' : 'border-slate-200 bg-white'}`}>
            <CssStyleForm
              profiles={profiles}
              activeProfileId={activeProfileId}
              onSelectProfile={onSelectProfile}
              onUpdateProfile={onUpdateProfile}
              onAddProfile={onAddProfile}
              onDeleteProfile={onDeleteProfile}
              onImportProfile={onImportProfile}
              onClose={onClose}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* 우측: 샘플 검증 프리뷰 (65%) */}
          <div className={`flex-1 h-full overflow-y-auto ${isDarkMode ? 'bg-[#0E0E10]' : 'bg-slate-100'}`}>
             <div className="max-w-[900px] mx-auto p-8 lg:p-12 relative custom-preview-container" id="omd-modal-preview-container">
                {/* 실시간 CSS 인젝터 (MainEditorApp에서 생성된 동적 CSS를 받아서 주입) */}
                {dynamicCssString && (
                  <style dangerouslySetInnerHTML={{ __html: dynamicCssString }} />
                )}
                <MarkdownViewer
                  content={welcomeContent}
                  originalContent={welcomeContent}
                />
             </div>
          </div>

        </div>

        {/* 하단 푸터 (적용 버튼) */}
        <div className={`flex items-center justify-end px-6 py-4 border-t ${isDarkMode ? 'border-zinc-800 bg-zinc-900' : 'border-slate-200 bg-slate-50'}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className={`px-5 py-2 text-sm font-bold rounded-lg transition-colors border ${isDarkMode ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border-slate-300 text-slate-600 hover:bg-slate-100'}`}
            >
              취소
            </button>
            <button
              onClick={() => {
                // 실시간 저장이므로 단순히 닫기만 해도 적용이 유지됨
                onClose();
              }}
              className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <span>✅</span> 적용 및 닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
