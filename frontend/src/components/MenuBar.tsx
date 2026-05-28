"use client";

import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface MenuBarProps {
  isDarkMode: boolean;
  setIsDarkMode: (v: boolean) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (v: boolean) => void;
  isToolbarOpen: boolean;
  setIsToolbarOpen: (v: boolean) => void;
  previewMode: 'edit' | 'both' | 'preview' | 'css-style';
  setPreviewMode: (v: 'edit' | 'both' | 'preview') => void;
  dispatch: (type: any, payload?: any) => void;
  setContent: (v: string) => void;
  isSearchOpen: boolean;
  isAddonEnv?: boolean;
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
    pdf: "📚PDF 문서(.pdf)",
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
    toLightMode: "☀️라이트 모드 전환",
    toDarkMode: "🌙다크 모드 전환",
    globalSearch: "전역 검색",
    copyPreview: "미리보기 복사",
    toolbarToggle: "툴바 표시/숨김",
    settings: "환경 설정",
    userManual: "사용 설명서",
    shortcuts: "단축키 안내",
    updates: "업데이트 확인",
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
    pdf: "PDF Document (.pdf)",
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
    toLightMode: "Switch to Light Mode",
    toDarkMode: "Switch to Dark Mode",
    globalSearch: "Global Search",
    copyPreview: "Copy Preview",
    toolbarToggle: "Show/Hide Toolbar",
    settings: "Settings",
    userManual: "User Manual",
    shortcuts: "Keyboard Shortcuts",
    updates: "Check for Updates",
    about: "About Onrivi Author"
  }
};

export default function MenuBar({ 
  isDarkMode, setIsDarkMode, 
  isSidebarOpen, setIsSidebarOpen, 
  isToolbarOpen, setIsToolbarOpen, 
  previewMode, setPreviewMode, 
  dispatch, setContent,
  isSearchOpen,
  isAddonEnv
 }: MenuBarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const t = (key: string) => {
    const dict = localTranslations["ko"] || localTranslations['en'];
    return dict[key] || key;
  };

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
    ...(isAddonEnv ? [] : [{ label: "파일 열기", icon: <span>📤</span>, shortcut: 'Ctrl+O', onClick: () => dispatch('OPEN_FILE') } as const]),
    { label: t('openWorkspace'), icon: <span>📂</span>, shortcut: 'Ctrl+Shift+O', onClick: () => dispatch('OPEN_WORKSPACE') },
    { divider: true },
    { label: t('saveFile'), icon: <span>💾</span>, shortcut: 'Ctrl+S', onClick: () => dispatch('SAVE') },
    { label: t('saveFileAs'), icon: <span>💿</span>, shortcut: 'Ctrl+Shift+S', onClick: () => dispatch('SAVE_AS') },
    { divider: true },
    { 
      label: t('export'), 
      icon: <span>📤</span>,
      subItems: [
        { label: t('pdf'), onClick: () => dispatch('EXPORT_PDF') },
        { label: t('html'), onClick: () => dispatch('EXPORT_HTML') },
        { label: t('epub'), onClick: () => dispatch('EXPORT_EPUB') },
        { label: t('png'), onClick: () => dispatch('EXPORT_PNG') },
      ]
    },
    { divider: true },
    { label: t('exit'), icon: <span>📴</span>, onClick: () => dispatch('EXIT') },
  ];

  return (
    <nav ref={menuRef} className="h-8 bg-zinc-100 dark:bg-zinc-900 border-b border-black/5 dark:border-white/10 flex items-center px-1 text-xs font-medium relative z-[100] text-zinc-700 dark:text-zinc-300">
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
            ]
          },
          { label: isDarkMode ? t('toLightMode') : t('toDarkMode'), icon: isDarkMode ? <span>☀️</span> : <span>🌙</span>, onClick: () => setIsDarkMode(!isDarkMode) },
          { label: "🏛️ 서식 정의", shortcut: 'Ctrl+Shift+S', onClick: () => dispatch('TOGGLE_CSS_STYLE') },
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
          { label: t('userManual'), icon: <span>📖</span> },
          { label: t('shortcuts'), icon: <span>⌨️</span> },
          { label: t('updates'), icon: <span>🚀</span>, onClick: () => dispatch('UPDATES') },
          { divider: true },
          { label: t('about'), icon: <span>🍀</span>, onClick: () => dispatch('ABOUT') },
        ]}
      />
    </nav>
  );
}

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
                  className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-blue-600 hover:text-white transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-4 flex justify-center opacity-70">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.shortcut && <span className="text-[10px] opacity-50 ml-4 font-mono">{item.shortcut}</span>}
                  {item.subItems && <ChevronRight size={12} className="opacity-50" />}
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
                        className="w-full flex items-center px-3 py-1.5 hover:bg-blue-600 hover:text-white transition-colors text-left"
                      >
                        <span>{sub.label}</span>
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
