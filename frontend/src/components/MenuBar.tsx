"use client";

import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { EDITOR_THEMES } from '@/lib/editorThemes';

interface MenuBarProps {
  isDarkMode: boolean;
  setIsDarkMode: (v: boolean) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (v: boolean) => void;
  isToolbarOpen: boolean;
  setIsToolbarOpen: (v: boolean) => void;
  previewMode: 'edit' | 'both' | 'preview' | 'css-style';
  setPreviewMode: (v: 'edit' | 'both' | 'preview' | 'css-style') => void;
  dispatch: (type: any, payload?: any) => void;
  setContent: (v: string) => void;
  isSearchOpen: boolean;
  isAddonEnv?: boolean;
  themePalette?: string;
  onThemeChange?: (themeId: string) => void;
}

const localTranslations: Record<string, Record<string, string>> = {
  ko: {
    file: "파일(F)",
    edit: "편집(E)",
    tools: "도구(T)",
    help: "도움말(H)",
    newFile: "새문서",
    openFolder: "불러오기",
    openWorkspace: "폴더 열기",
    saveFile: "저장",
    saveFileAs: "다른 이름으로 저장",
    export: "내보내기",
    print: "🖨️인쇄/PDF",
    html: "📜HTML 파일 (.html)",
    epub: "📘EPUB 전자책(.epub)",
    png: "🖼️PNG 이미지(.png)",
    exit: "종료",
    undo: "실행 취소",
    redo: "다시 실행",
    find: "찾기",
    replace: "바꾸기",
    insertImage: "이미지 삽입",
    insertDateTime: "날짜/시간 삽입",
    zoomIn: "확대",
    zoomOut: "축소",
    sidebarToggle: "사이드바 표시/숨김",
    viewMode: "화면 보기 모드",
    modeEdit: "✍️편집 전용 모드",
    modeSplit: "📖분할 화면 모드",
    modePreview: "👁️미리보기 전용 모드",
    themeSwitch: "테마 전환",
    globalSearch: "전역 검색",
    copyPreview: "마크다운 복사",
    toolbarToggle: "툴바 표시/숨김",
    settings: "환경 설정",
    userManual: "사용 설명서",
    shortcuts: "단축키 안내",
    license: "라이선스 등록",
    about: "프로그램 정보"
  },
  en: {
    file: "File",
    edit: "Edit",
    tools: "Tools",
    help: "Help",
    newFile: "New File",
    openFolder: "Open File",
    openWorkspace: "Open Folder",
    saveFile: "Save File",
    saveFileAs: "Save File As",
    export: "Export",
    print: "🖨️Print/PDF",
    html: "HTML File (.html)",
    epub: "EPUB E-book (.epub)",
    png: "PNG Image (.png)",
    exit: "Exit",
    undo: "Undo",
    redo: "Redo",
    find: "Find",
    replace: "Replace",
    insertImage: "Insert Image",
    insertDateTime: "Insert Date/Time",
    zoomIn: "Zoom In",
    zoomOut: "Zoom Out",
    sidebarToggle: "Show/Hide Sidebar",
    viewMode: "View Mode",
    modeEdit: "Editor Only Mode",
    modeSplit: "Split View Mode",
    modePreview: "Preview Only Mode",
    themeSwitch: "Theme Switch",
    globalSearch: "Global Search",
    copyPreview: "Copy Preview",
    toolbarToggle: "Show/Hide Toolbar",
    settings: "Settings",
    userManual: "User Manual",
    shortcuts: "Keyboard Shortcuts",
    license: "Register License",
    about: "About Onrivi Author"
  }
};

// ====================================================================
// 📊 [OMD-EDIT-MenuBar-0004] MenuBar ➔ MenuBar
// 🎯 @KICK  : 상단 메뉴바 렌더링 - 파일/편집/도구/도움말 드롭다운 메뉴 제공
// 🛡️ @GUARD : previewMode가 'preview'일 때 편집 메뉴 숨김
// 🚨 @PATCH : PDF/HTML 내보내기 → PRINT(OS 인쇄)로 통합; 번역키 pdf/html 제거, print 추가
// 🔗 @CALLS : MenuDropdown, dispatch, setIsSidebarOpen, setIsToolbarOpen, setPreviewMode
// ====================================================================
export default function MenuBar({ 
  isDarkMode, setIsDarkMode, 
  isSidebarOpen, setIsSidebarOpen, 
  isToolbarOpen, setIsToolbarOpen, 
  previewMode, setPreviewMode, 
  dispatch, setContent,
  isSearchOpen,
  isAddonEnv,
  themePalette,
  onThemeChange
 }: MenuBarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

// ====================================================================
// 📊 [OMD-EDIT-MenuBar-0003] MenuBar ➔ handleThemeSelect
// 🎯 @KICK  : 테마 선택 시 onThemeChange 콜백 호출
// 🛡️ @GUARD : onThemeChange가 존재할 때만 호출
// 🚨 @PATCH : 없음
// 🔗 @CALLS : onThemeChange
// ====================================================================
  const handleThemeSelect = (themeId: string) => {
    if (onThemeChange) {
      onThemeChange(themeId);
    }
  };

  const t = (key: string) => {
    const dict = localTranslations["ko"] || localTranslations['en'];
    return dict[key] || key;
  };

// ====================================================================
// 📊 [OMD-EDIT-MenuBar-0002] MenuBar ➔ useEffect (click outside)
// 🎯 @KICK  : 메뉴 외부 클릭 시 activeMenu를 닫는 클릭 감지 리스너 설치
// 🛡️ @GUARD : menuRef.contains로 클릭 대상이 메뉴 내부인지 확인
// 🚨 @PATCH : 없음
// 🔗 @CALLS : setActiveMenu
// ====================================================================
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fileItems = [
    { label: "새 파일", icon: <span>📝</span>, shortcut: 'Ctrl+N', onClick: () => dispatch('NEW_FILE') },
    { label: t('openWorkspace'), icon: <span>📂</span>, shortcut: 'Ctrl+Shift+O', onClick: () => dispatch('OPEN_WORKSPACE') },
    { divider: true },
    { label: t('saveFile'), icon: <span>💾</span>, shortcut: 'Ctrl+S', onClick: () => dispatch('SAVE') },
    { label: t('saveFileAs'), icon: <span>💿</span>, shortcut: 'Ctrl+Shift+S', onClick: () => dispatch('SAVE_AS') },
    { divider: true },
    { 
      label: t('export'), 
      icon: <span>📤</span>,
      subItems: [
        { label: t('print'), onClick: () => dispatch('PRINT') },
        { label: t('html'), onClick: () => dispatch('EXPORT_HTML') },
        { divider: true },
        { label: t('epub'), onClick: () => dispatch('EXPORT_EPUB') },
        { label: t('png'), onClick: () => dispatch('EXPORT_PNG') },
      ]
    },
    { divider: true },
    { label: t('exit'), icon: <span>📴</span>, onClick: () => dispatch('EXIT') },
  ];

  /* [ONR-UI-003] 상단 메뉴바 이벤트 연동: 테마 스위칭, 내보내기 대화상자 등 전역 레이아웃 제어를 메뉴 트리거와 연결합니다. */
  return (
    <nav ref={menuRef} className="h-[36px] bg-zinc-100 dark:bg-zinc-900 border-b border-black/5 dark:border-white/10 flex items-center px-1 text-sm font-medium relative z-[100] text-zinc-700 dark:text-zinc-300 whitespace-nowrap select-none shrink-0">
      <MenuDropdown 
        label={t('file')} 
        isOpen={activeMenu === 'file'} 
        onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
        onClose={() => setActiveMenu(null)}
        items={fileItems}
        isDarkMode={isDarkMode}
      />
      {previewMode !== 'preview' && (
        <MenuDropdown 
          label={t('edit')} 
          isOpen={activeMenu === 'edit'} 
          onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
          onClose={() => setActiveMenu(null)}
          isDarkMode={isDarkMode}
          items={[
            { label: t('undo'), icon: <span>↩️</span>, shortcut: 'Ctrl+Z', onClick: () => dispatch('UNDO') },
            { label: t('redo'), icon: <span>↪️</span>, shortcut: 'Ctrl+Y', onClick: () => dispatch('REDO') },
            { divider: true },
            { label: t('find'), icon: <span>🔍</span>, shortcut: 'Ctrl+F', onClick: () => dispatch('FIND') },
            { label: t('replace'), icon: <span>🔄</span>, shortcut: 'Ctrl+H', onClick: () => dispatch('REPLACE') },
            { divider: true },
            { label: t('zoomIn'), icon: <span>🔎</span>, onClick: () => dispatch('ZOOM_IN') },
            { label: t('zoomOut'), icon: <span>🔍</span>, onClick: () => dispatch('ZOOM_OUT') },
          ]}
        />
      )}
      <MenuDropdown 
        label={t('tools')} 
        isOpen={activeMenu === 'tools'} 
        onClick={() => setActiveMenu(activeMenu === 'tools' ? null : 'tools')}
        onClose={() => setActiveMenu(null)}
        isDarkMode={isDarkMode}
        items={[
          { label: t('sidebarToggle'), icon: <span>📁</span>, onClick: () => setIsSidebarOpen(!isSidebarOpen) },
          { label: t('toolbarToggle'), icon: <span>🛠️</span>, onClick: () => setIsToolbarOpen(!isToolbarOpen) },
          { 
            label: "화면 보기 모드", 
            icon: <span>🖥️</span>, 
            subItems: [
              { label: "편집 전용", onClick: () => setPreviewMode('edit') },
              { label: "분할 화면", onClick: () => setPreviewMode('both') },
              { label: "미리보기", onClick: () => setPreviewMode('preview') },
              { label: "서식 정의", onClick: () => setPreviewMode('css-style') },
            ]
          },
          { divider: true },
          { label: t('globalSearch'), icon: <span>🔎</span>, shortcut: 'Ctrl+Shift+F', onClick: () => dispatch('GLOBAL_SEARCH') },
          { label: t('copyPreview'), icon: <span>📋</span>, onClick: () => dispatch('COPY_ALL') },
          { label: "환경 설정", icon: <span>⚙️</span>, onClick: () => dispatch('SETTINGS') },
        ]}
      />
      <MenuDropdown 
        label={t('help')} 
        isOpen={activeMenu === 'help'} 
        onClick={() => setActiveMenu(activeMenu === 'help' ? null : 'help')}
        onClose={() => setActiveMenu(null)}
        isDarkMode={isDarkMode}
          items={[
            { label: "사용 설명서", icon: <span>📖</span>, onClick: () => dispatch('HELP') },
            { label: t('license'), icon: <span>🔑</span>, onClick: () => dispatch('LICENSE') },
            { divider: true },
            { label: t('about'), icon: <span>🍀</span>, onClick: () => dispatch('ABOUT') },
          ]}
      />
    </nav>
  );
}

// ====================================================================
// 📊 [OMD-EDIT-MenuBar-0001] MenuBar ➔ MenuDropdown
// 🎯 @KICK  : 상단 메뉴 드롭다운 렌더링 - 서브메뉴 호버 열림 및 단축키 표시
// 🛡️ @GUARD : 없음
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
function MenuDropdown({ label, isOpen, onClick, onClose, items, isDarkMode }: { label: string, isOpen: boolean, onClick: () => void, onClose: () => void, items: any[], isDarkMode: boolean }) {
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);

  return (
    <div className="relative h-full">
      <button 
        onClick={onClick}
        className={`h-full px-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${isOpen ? 'bg-black/5 dark:bg-white/5 text-[#0058bc] dark:text-[#adc6ff]' : ''}`}
      >
        {label}
      </button>
      {isOpen && (
        <div 
          className="absolute top-full left-0 w-56 backdrop-blur-md border rounded-b-md py-1 animate-in fade-in slide-in-from-top-1 duration-150 text-zinc-800 dark:text-zinc-200"
          style={{ 
            backgroundColor: isDarkMode ? 'rgba(9, 9, 11, 0.99)' : 'rgba(255, 255, 255, 0.99)',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            zIndex: 9999
          }}
        >
          {items.map((item, i) => (
            item.divider ? (
              <div key={i} className="my-1 border-t border-black/5 dark:border-white/5" />
            ) : (
              <div key={i} className="relative group/item" onMouseEnter={() => item.subItems && setActiveSubMenu(item.label)} onMouseLeave={() => setActiveSubMenu(null)}>
                <button 
                  onClick={() => { 
                    if (!item.subItems) { 
                      item.onClick?.(); 
                      onClose(); 
                    } 
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-blue-600 hover:text-white transition-colors text-left text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-4 flex justify-center opacity-70">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.shortcut && <span className="text-xs opacity-50 ml-4 font-mono">{item.shortcut}</span>}
                  {item.subItems && <ChevronRight size={14} className="opacity-50" />}
                </button>

                {/* Submenu */}
                {item.subItems && activeSubMenu === item.label && (
                  <div 
                    className="absolute top-0 left-full w-48 backdrop-blur-md border rounded-md py-1 animate-in fade-in slide-in-from-left-1 duration-150 ml-px text-zinc-800 dark:text-zinc-200"
                    style={{ 
                      backgroundColor: isDarkMode ? 'rgba(9, 9, 11, 0.99)' : 'rgba(255, 255, 255, 0.99)',
                      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
                      zIndex: 10000
                    }}
                  >
                    {item.subItems.map((sub: any, j: number) => (
                      <button 
                        key={j}
                        onClick={() => { 
                          sub.onClick?.(); 
                          onClose(); 
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 transition-colors text-left text-sm ${
                          sub.isActive
                            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30'
                            : 'hover:bg-blue-600 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-4 flex justify-center">{sub.icon}</span>
                          <span>{sub.label}</span>
                        </div>
                        {sub.isActive && <span className="text-xs">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}
