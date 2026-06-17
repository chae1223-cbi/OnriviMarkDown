"use client";

import React, { useState } from 'react';
import { EDITOR_THEMES } from '@/lib/editorThemes';

interface StatusBarProps {
  content: string;
  folderName?: string;
  fileName: string;
  driveLetter: string;
  workspaceType: 'local' | 'cloud' | 'browser';
  cloudProvider: string | null;
  path?: string;
  cursorLine?: number;
  cursorColumn?: number;
  saveStatus?: 'saved' | 'saving' | 'unsaved' | '';
  isToolbarOpen?: boolean;
  setIsToolbarOpen?: (v: boolean) => void;
  isSidebarOpen?: boolean;
  setIsSidebarOpen?: (v: boolean) => void;
  previewMode?: 'edit' | 'both' | 'preview' | 'css-style';
  setPreviewMode?: (v: 'edit' | 'both' | 'preview' | 'css-style') => void;
  isDarkMode?: boolean;
  setIsDarkMode?: (v: boolean) => void;
  themePalette?: string;
  onThemeChange?: (themeId: string) => void;
  isActivated?: boolean;
  activeProfileName?: string;
}

const localTranslations: Record<string, Record<string, string>> = {
  ko: {
    charCount: "글자 수",
    wordCount: "단어 수",
    manuscript: "원고지",
    page: "매",
    target: "목표",
    path: "경로",
    saved: "저장됨",
    saving: "저장 중...",
    unsaved: "저장되지 않음",
    toolbarHide: "툴바 숨기기",
    toolbarShow: "툴바 보이기",
    sidebarHide: "사이드바 숨기기",
    sidebarShow: "사이드바 보이기",
    toSplitMode: "분할 화면 모드로 전환",
    toPreviewMode: "미리보기 전용 모드로 전환",
    toEditMode: "편집 전용 모드로 전환",
    theme: "테마 전환"
  },
  en: {
    charCount: "Characters",
    wordCount: "Words",
    manuscript: "Ms.",
    page: "p",
    target: "Target",
    path: "Path",
    saved: "Saved",
    saving: "Saving...",
    unsaved: "Unsaved",
    toolbarHide: "Hide Toolbar",
    toolbarShow: "Show Toolbar",
    sidebarHide: "Hide Sidebar",
    sidebarShow: "Show Sidebar",
    toSplitMode: "Switch to Split View",
    toPreviewMode: "Switch to Preview Only",
    toEditMode: "Switch to Editor Only",
    theme: "Toggle Dark/Light Mode"
  },
  ja: {
    charCount: "文字数",
    wordCount: "単語数",
    manuscript: "原稿用紙",
    page: "枚",
    target: "目標",
    path: "パス",
    saved: "保存済み",
    saving: "保存中...",
    unsaved: "未保存",
    toolbarHide: "ツールバーを隠す",
    toolbarShow: "ツールバーを表示",
    sidebarHide: "サイドバーを隠す",
    sidebarShow: "サイドバーを表示",
    toSplitMode: "分割表示モードに切り替え",
    toPreviewMode: "プレビュー専用モードに切り替え",
    toEditMode: "編集専用モードに切り替え",
    theme: "テーマ切り替え"
  },
  zh: {
    charCount: "字数",
    wordCount: "词数",
    manuscript: "原稿纸",
    page: "张",
    target: "目标",
    path: "路径",
    saved: "已保存",
    saving: "保存中...",
    unsaved: "未保存",
    toolbarHide: "隐藏工具栏",
    toolbarShow: "显示工具栏",
    sidebarHide: "隐藏侧边栏",
    sidebarShow: "显示侧边栏",
    toSplitMode: "切换到双栏视图模式",
    toPreviewMode: "切换到仅预览模式",
    toEditMode: "切换到仅编辑模式",
    theme: "切换主题配色"
  }
};

// ====================================================================
// 📊 [OMD-EDIT-StatusBar-0003] StatusBar ➔ StatusBar
// 🎯 @KICK  : 상태 표시줄 컴포넌트 - 글자 수, 단어 수, 저장 상태, 라인/컬럼 정보, 테마, 프리뷰 모드 표시
// 🛡️ @GUARD : StatusBarProps 인터페이스로 props 타입 검증
// 🚨 @PATCH : 없음
// 🔗 @CALLS : getFullPath, t
// ====================================================================
export default function StatusBar({ 
  content, folderName, fileName, driveLetter, 
  workspaceType, cloudProvider, path: relativePath, cursorLine, cursorColumn, saveStatus,
  isToolbarOpen, setIsToolbarOpen,
  isSidebarOpen, setIsSidebarOpen,
  previewMode, setPreviewMode,
  isDarkMode, setIsDarkMode,
  themePalette, onThemeChange,
  isActivated,
  activeProfileName
}: StatusBarProps) {
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const currentTheme = EDITOR_THEMES.find(t => t.id === themePalette) || EDITOR_THEMES[0];
  const charCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const manuscriptPages = Math.ceil(charCount / 200);
  const targetCharCount = 2000;
  const progressPercent = Math.min(100, Math.round((charCount / targetCharCount) * 100));

// ====================================================================
// 📊 [OMD-EDIT-StatusBar-0002] StatusBar ➔ t
// 🎯 @KICK  : 다국어 키-값 조회 함수 - localTranslations에서 key에 해당하는 번역 문자열 반환
// 🛡️ @GUARD : dict[key]가 없으면 key 자체를 fallback으로 반환
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
  const t = (key: string) => {
    const dict = localTranslations["ko"] || localTranslations['en'];
    return dict[key] || key;
  };

  // 전체 경로 계산
// ====================================================================
// 📊 [OMD-EDIT-StatusBar-0001] StatusBar ➔ getFullPath
// 🎯 @KICK  : 전체 파일 경로를 workspaceType에 따라 조합하여 반환
// 🛡️ @GUARD : 없음
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
  const getFullPath = () => {
    if (workspaceType === 'browser') return folderName ? `${folderName} \\ ${fileName}` : `🌐 Browser Storage \\ ${fileName}`;
    if (workspaceType === 'cloud') return `[${cloudProvider || 'Cloud'}] \\ ${folderName || 'Sync'} \\ ${fileName}`;
    
    // 저장된 파일의 전체 경로가 있으면 그대로 사용
    if (relativePath?.includes(':')) return relativePath;
    
    // folderName에서 끝 백슬래시 제거 후 경로 조합
    const cleanFolder = folderName ? folderName.replace(/\\+$/, '') : undefined;
    if (cleanFolder?.includes(':')) return `${cleanFolder}\\${fileName}`;
    
    return `${driveLetter}\\새 문서\\${fileName}`;
  };

  const saveStatusText = saveStatus ? t(saveStatus) : '';
  const saveStatusColor = saveStatus === 'saved' ? 'text-green-600' : saveStatus === 'saving' ? 'text-blue-500' : saveStatus === 'unsaved' ? 'text-amber-500' : '';

  return (
    <footer className="h-12 bg-zinc-100 dark:bg-zinc-900 border-t border-black/5 dark:border-white/10 flex justify-between items-center px-4 text-[12px] font-bold text-gray-700 dark:text-zinc-300 relative z-40 whitespace-nowrap select-none">
      <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
        {/* 💡 [인증 키 가드] 라이선스 활성화 마크 */}
        {isActivated ? (
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-extrabold px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 shrink-0">
            정품 인증됨
          </span>
        ) : (
          <span className="text-[11px] text-rose-600 dark:text-rose-400 font-extrabold px-2 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 shrink-0 animate-pulse">
            체험판 (인증 필요)
          </span>
        )}
        <span className="shrink-0">|</span>
        <span className="shrink-0">{t('charCount')}: {charCount.toLocaleString()}</span>
        <span className="shrink-0">|</span>
        <span className="shrink-0">{t('wordCount')}: {wordCount.toLocaleString()}</span>
        <span className="hidden md:inline shrink-0">|</span>
        <span className="hidden md:inline shrink-0">{t('manuscript')}: {manuscriptPages}{t('page')}</span>
        <span className="hidden lg:inline shrink-0">|</span>
        <div className="hidden lg:flex items-center gap-1.5 shrink-0">
          <div className="w-16 h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: progressPercent >= 100 ? '#10b981' : '#3b82f6'
              }}
            />
          </div>
          <span className="tabular-nums">
            {Math.min(charCount, targetCharCount).toLocaleString()}/{targetCharCount.toLocaleString()} ({progressPercent}%)
          </span>
        </div>
        <span className="hidden sm:inline shrink-0">|</span>
        <span className="hidden sm:inline truncate max-w-[120px] md:max-w-[240px] lg:max-w-[400px]" title={getFullPath()}>
          {t('path')}: {getFullPath()}
        </span>
        {activeProfileName && (
          <>
            <span className="hidden md:inline shrink-0">|</span>
            <span className="hidden md:inline truncate max-w-[150px] text-blue-600 dark:text-blue-400 font-semibold" title={`현재 서식: ${activeProfileName}`}>
              서식: {activeProfileName}
            </span>
          </>
        )}
        {saveStatusText && (
          <>
            <span className="shrink-0">|</span>
            <span className={`${saveStatusColor} font-semibold shrink-0`}>{saveStatusText}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-2">
        {/* 툴바 숨기기/보이기 */}
        {setIsToolbarOpen && (
          <button
            onClick={() => setIsToolbarOpen(!isToolbarOpen)}
            className={`px-2 py-1 rounded-md text-[12px] font-semibold transition-all hover:bg-black/10 dark:hover:bg-white/10 ${
              isToolbarOpen ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-zinc-500'
            }`}
            title={isToolbarOpen ? t('toolbarHide') : t('toolbarShow')}
          >
            <span className="leading-none">♻️</span>
          </button>
        )}
        {/* 사이드바 숨기기/보이기 */}
        {setIsSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`px-2 py-1 rounded-md text-[12px] font-semibold transition-all hover:bg-black/10 dark:hover:bg-white/10 ${
              isSidebarOpen ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-zinc-500'
            }`}
            title={isSidebarOpen ? t('sidebarHide') : t('sidebarShow')}
          >
            <span className="leading-none">🗃️</span>
          </button>
        )}
        {/* 모드 표시 세그먼트 (항상 표시) */}
        {setPreviewMode && (
          <div className="flex items-center bg-black/5 dark:bg-white/5 rounded-lg overflow-hidden border border-black/10 dark:border-white/10">
            <button
              onClick={() => setPreviewMode('edit')}
              title="편집보기 - 에디터만 표시"
              className={`px-3 py-1.5 text-[12px] font-bold transition-all duration-150 select-none ${
                previewMode === 'edit'
                  ? 'bg-emerald-500 text-white'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/8 dark:hover:bg-white/8'
              }`}
            >편집보기</button>
            <div className="w-px h-4 bg-black/10 dark:bg-white/10" />
            <button
              onClick={() => setPreviewMode('both')}
              title="분할모드 - 에디터와 미리보기 함께 표시"
              className={`px-3 py-1.5 text-[12px] font-bold transition-all duration-150 select-none ${
                previewMode === 'both' || previewMode === 'css-style'
                  ? 'bg-emerald-500 text-white'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/8 dark:hover:bg-white/8'
              }`}
            >분할모드</button>
            <div className="w-px h-4 bg-black/10 dark:bg-white/10" />
            <button
              onClick={() => setPreviewMode('preview')}
              title="미리보기 - 렌더링된 문서만 표시"
              className={`px-3 py-1.5 text-[12px] font-bold transition-all duration-150 select-none ${
                previewMode === 'preview'
                  ? 'bg-emerald-500 text-white'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/8 dark:hover:bg-white/8'
              }`}
            >미리보기</button>
          </div>
        )}

        <span className="text-gray-300 dark:text-zinc-600 mx-1">|</span>
        <span className="hover:text-[#0058bc] cursor-default text-[12px]">UTF-8</span>
        <span className="hover:text-[#0058bc] cursor-default text-[12px]">.md</span>
        <span className="hover:text-[#0058bc] cursor-default text-[12px] tabular-nums">Ln {cursorLine || 1}, Col {cursorColumn || 1}</span>
      </div>
    </footer>
  );
}
