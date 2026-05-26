"use client";

import React from 'react';

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
  previewMode?: 'edit' | 'both' | 'preview';
  setPreviewMode?: (v: 'edit' | 'both' | 'preview') => void;
  isDarkMode?: boolean;
  setIsDarkMode?: (v: boolean) => void;
}

const localTranslations: Record<string, Record<string, string>> = {
  ko: {
    charCount: "글자 수",
    wordCount: "단어 수",
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

export default function StatusBar({ 
  content, folderName, fileName, driveLetter, 
  workspaceType, cloudProvider, path: relativePath, cursorLine, cursorColumn, saveStatus,
  isToolbarOpen, setIsToolbarOpen,
  isSidebarOpen, setIsSidebarOpen,
  previewMode, setPreviewMode,
  isDarkMode, setIsDarkMode
}: StatusBarProps) {
  const charCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const t = (key: string) => {
    const dict = localTranslations["ko"] || localTranslations['en'];
    return dict[key] || key;
  };

  // 전체 경로 계산
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
    <footer className="h-8 bg-zinc-100 dark:bg-zinc-900 border-t border-black/5 dark:border-white/10 flex justify-between items-center px-4 text-[11px] font-medium text-gray-500 relative z-40">
      <div className="flex items-center gap-3">
        <span>{t('charCount')}: {charCount.toLocaleString()}</span>
        <span>|</span>
        <span>{t('wordCount')}: {wordCount.toLocaleString()}</span>
        <span>|</span>
        <span>{t('path')}: {getFullPath()}</span>
        {saveStatusText && (
          <>
            <span>|</span>
            <span className={`${saveStatusColor} font-semibold`}>{saveStatusText}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        {/* 툴바 숨기기/보이기 */}
        {setIsToolbarOpen && (
          <button
            onClick={() => setIsToolbarOpen(!isToolbarOpen)}
            className={`p-0.5 rounded transition-all hover:bg-black/10 dark:hover:bg-white/10 ${
              isToolbarOpen ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-zinc-500'
            }`}
            title={isToolbarOpen ? t('toolbarHide') : t('toolbarShow')}
          >
            <span className="text-[11px] leading-none">♻️</span>
          </button>
        )}
        {/* 사이드바 숨기기/보이기 */}
        {setIsSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-0.5 rounded transition-all hover:bg-black/10 dark:hover:bg-white/10 ${
              isSidebarOpen ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-zinc-500'
            }`}
            title={isSidebarOpen ? t('sidebarHide') : t('sidebarShow')}
          >
            <span className="text-[11px] leading-none">🗃️</span>
          </button>
        )}
        {/* 모드전환 */}
        {setPreviewMode && (
          <button
            onClick={() => {
              if (previewMode === 'edit') setPreviewMode('both');
              else if (previewMode === 'both') setPreviewMode('preview');
              else setPreviewMode('edit');
            }}
            className={`p-0.5 rounded transition-all hover:bg-black/10 dark:hover:bg-white/10 ${
              previewMode === 'both' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-zinc-500'
            }`}
            title={
              previewMode === 'edit'
                ? t('toSplitMode')
                : previewMode === 'both'
                  ? t('toPreviewMode')
                  : t('toEditMode')
            }
          >
            <span className="text-[11px] leading-none">{previewMode === 'edit' ? '✍️' : previewMode === 'both' ? '📳' : '📜'}</span>
          </button>
        )}
        {/* 테마전환 */}
        {setIsDarkMode && (
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-0.5 rounded transition-all hover:bg-black/10 dark:hover:bg-white/10 text-gray-400 dark:text-zinc-500"
            title={t('theme')}
          >
            <span className="text-[11px] leading-none">{isDarkMode ? '☀️' : '🌙'}</span>
          </button>
        )}
        <span className="text-gray-300 dark:text-zinc-600 mx-0.5">|</span>
        <span className="hover:text-[#0058bc] cursor-default">UTF-8</span>
        <span className="hover:text-[#0058bc] cursor-default">.md</span>
        <span className="hover:text-[#0058bc] cursor-default">Ln {cursorLine || 1}, Col {cursorColumn || 1}</span>
      </div>
    </footer>
  );
}
