"use client";

import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight, FolderSync } from 'lucide-react';
import { EDITOR_THEMES } from '@/lib/editorThemes';
import { useRouter } from 'next/navigation';
import { useEditorContext } from '@/context/EditorContext';
import { supabase } from '@/lib/supabaseClient';

const localTranslations: Record<string, Record<string, string>> = {
  ko: {
    file: "파일(F)",
    edit: "편집(E)",
    tools: "도구(T)",
    help: "도움말(H)",
    newFile: "새문서",
    openFolder: "파일 열기",
    openWorkspace: "작업장 폴더 열기",
    saveFile: "저장",
    saveFileAs: "다른 이름으로 저장",
    export: "내보내기",
    print: "🖨️인쇄/PDF",
    html: "📜HTML 파일 (.html)",
    epub: "📘EPUB 전자책(.epub)",
    png: "🖼️PNG 이미지(.png)",
    exit: "로그아웃",
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
    search: "검색(S)",
    settings: "설정",
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
    openWorkspace: "Open Workspace Folder",
    saveFile: "Save File",
    saveFileAs: "Save File As",
    export: "Export",
    print: "🖨️Print/PDF",
    html: "HTML File (.html)",
    epub: "EPUB E-book (.epub)",
    png: "PNG Image (.png)",
    exit: "Logout",
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
// 🚨 @PATCH : **2026-09-03** — 상단 우측 사용자 정보 표시줄을 이메일 대신 별명(userNickname)으로 우선 표기 및 클릭 시 환경설정 '계정 관리' 탭(SETTINGS_ACCOUNT)으로 즉각 이동 연동; 환경설정에서 별명 변경 시 실시간 동기화 리스너 탑재
//             **2026-09-02** — [ONRIVI-DS-SYSTEM-002 v5.0] LINE Design System (LDSG) 표준 적용 (LINE Green #06C755 호버 및 Surface High 드롭다운)
//             **2026-07-23** — 파일 메뉴 용어 변경: '불러오기'→'파일 열기', '폴더 열기'→'작업장 폴더 열기' (ko/en 모두 적용); **2026-07-05** — MainEditorApp의 Props 의존성을 전면 제거하고 EditorContext 참조 방식으로 아키텍처 리팩토링; PDF/HTML 내보내기 → PRINT(OS 인쇄)로 통합; 번역키 pdf/html 제거, print 추가
// 🔗 @CALLS : MenuDropdown, dispatch, setIsSidebarOpen, setIsToolbarOpen, setPreviewMode
// ====================================================================
export default function MenuBar() {
  const { 
    previewMode, setPreviewMode, 
    dispatchCommand: dispatch, setContent,
    isSearchOpen,
    isAddonEnv,
    handleThemeChange: onThemeChange,
    isDarkMode, setIsDarkMode, 
    isSidebarOpen, setIsSidebarOpen, 
    isToolbarOpen, setIsToolbarOpen, 
    themePalette,
    licenseStatus, isActivated,
    resourceFolder, resourceFolderHandle
  } = useEditorContext();
  
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userNickname, setUserNickname] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('onrivi_user_nickname') ||
        localStorage.getItem('onrivi_nick_name') ||
        ''
      ).trim();
    }
    return '';
  });
  const menuRef = useRef<HTMLDivElement>(null);

  // 🌟 [리소스 폴더 미지정 및 전체사용자 여부 실시간 계산]
  const isResourceFolderMissing = !resourceFolder && !resourceFolderHandle;
  const isFullUser = (isActivated || !licenseStatus?.isExpired) && 
                     !licenseStatus?.planName?.includes('제한사용자');

  // 🌟 [별명 실시간 동기화 리스너] 환경설정 모달 등에서 별명이 변경되면 상단 메뉴바도 즉시 갱신
  useEffect(() => {
    const handleNickChange = (e: any) => {
      if (typeof e.detail === 'string') {
        setUserNickname(e.detail);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('onrivi:nickname_changed', handleNickChange);
      return () => window.removeEventListener('onrivi:nickname_changed', handleNickChange);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        const metaNick = (session.user.user_metadata?.nick_name || session.user.user_metadata?.name || '').trim();
        if (metaNick) {
          setUserNickname(metaNick);
        }

        // DB 원장의 최신 별명 조회
        fetch('/api/rpc/user/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ p_id: session.user.id, p_email: session.user.email })
        })
          .then(res => res.json())
          .then(data => {
            if (data?.nick_name) {
              setUserNickname(data.nick_name);
              localStorage.setItem('onrivi_user_nickname', data.nick_name);
            }
          })
          .catch(() => {});
      }
    }).catch(() => {});
  }, []);

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
    { label: t('openFolder'), icon: <span>📂</span>, shortcut: 'Ctrl+O', onClick: () => dispatch('OPEN_FILE') },
    { label: t('openWorkspace'), icon: <span>📁</span>, shortcut: 'Ctrl+Shift+O', onClick: () => dispatch('OPEN_WORKSPACE') },
    { divider: true },
    { label: t('saveFile'), icon: <span>💾</span>, shortcut: 'Ctrl+S', onClick: () => dispatch('SAVE') },
    { label: t('saveFileAs'), icon: <span>💿</span>, shortcut: 'Ctrl+Shift+S', onClick: () => dispatch('SAVE_AS') },
    { divider: true },
    { label: "문서 가져오기", icon: <span>📥</span>, onClick: () => window.dispatchEvent(new CustomEvent('TRIGGER_IMPORT')) },
    { 
      label: t('export') + (previewMode !== 'preview' ? " (미리보기 모드 전용)" : ""), 
      icon: <span>📤</span>,
      disabled: previewMode !== 'preview',
      subItems: [
        { label: t('print'), onClick: () => dispatch('PRINT') },
        { label: t('html'), onClick: () => dispatch('EXPORT_HTML') },
        { divider: true },
        { label: t('epub'), onClick: () => dispatch('EXPORT_EPUB') },
        { label: t('png'), onClick: () => dispatch('EXPORT_PNG') },
      ]
    },
    { divider: true },
    // 📊 [OMD-EDIT-MenuBar-0005] 파일 메뉴 하단 홈/대시보드 네비게이션
    // 🎯 @KICK  : useRouter.push('/') / push('/dashboard') 로 페이지 이동
    // 🚨 @PATCH : 2026-06-22 — 에디터에서 랜딩/대시보드 이동 가능하도록 추가
    ...((typeof window !== 'undefined' && !!(window as any).electronAPI) ? [] : [
      { label: t('exit'), icon: <span>🚪</span>, onClick: () => dispatch('EXIT') },
      { divider: true },
    ]),
    { label: "🏠 홈으로", icon: <span>🏠</span>, onClick: () => router.push('/') },
    { label: "📊 대시보드", icon: <span>📊</span>, onClick: () => router.push('/dashboard') },
  ];

  /* [ONR-UI-003] 상단 메뉴바 이벤트 연동: 테마 스위칭, 내보내기 대화상자 등 전역 레이아웃 제어를 메뉴 트리거와 연결합니다. */
  return (
    <nav ref={menuRef} className="h-[36px] bg-surface-container border-b border-outline/10 flex items-center px-1 text-sm font-medium relative z-[100] text-on-surface whitespace-nowrap select-none shrink-0">
      <MenuDropdown 
        label={t('file')} 
        isOpen={activeMenu === 'file'} 
        onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
        onClose={() => setActiveMenu(null)}
        items={fileItems}
        isDarkMode={isDarkMode}
      />
      <MenuDropdown 
        label={t('edit')} 
        isOpen={activeMenu === 'edit'} 
        onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
        onClose={() => setActiveMenu(null)}
        isDarkMode={isDarkMode}
        items={[
          { label: t('undo'), icon: <span>↩️</span>, shortcut: 'Ctrl+Z', onClick: () => dispatch('UNDO'), disabled: previewMode === 'preview' },
          { label: t('redo'), icon: <span>↪️</span>, shortcut: 'Ctrl+Y', onClick: () => dispatch('REDO'), disabled: previewMode === 'preview' },
          { divider: true },
          { label: t('find'), icon: <span>🔍</span>, shortcut: 'Ctrl+F', onClick: () => dispatch('FIND') },
          { label: t('replace'), icon: <span>🔄</span>, shortcut: 'Ctrl+H', onClick: () => dispatch('REPLACE'), disabled: previewMode === 'preview' },
          { divider: true },
          { label: t('zoomIn'), icon: <span>🔎</span>, onClick: () => dispatch('ZOOM_IN') },
          { label: t('zoomOut'), icon: <span>🔍</span>, onClick: () => dispatch('ZOOM_OUT') },
        ]}
      />
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
              { label: "미리보기", onClick: () => setPreviewMode('preview') }
            ]
          },
          { divider: true },
          { label: "서식 정의 (갤러리)", icon: <span>🏛️</span>, onClick: () => setPreviewMode('css-style') },
          { divider: true },
          { label: t('globalSearch'), icon: <span>🔎</span>, shortcut: 'Ctrl+Shift+F', onClick: () => dispatch('GLOBAL_SEARCH') },
          { label: t('copyPreview'), icon: <span>📋</span>, onClick: () => dispatch('COPY_ALL') },
          { label: "문서 병합", icon: <span>🔀</span>, onClick: () => dispatch('MERGE') },
            { label: "각주 정리", icon: <span>📑</span>, onClick: () => dispatch('ORGANIZE_FOOTNOTES') },
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
          ]}
      />
      
      {/* 📊 [OMD-EDIT-MenuBar-USER] 우측 끝 로그인 사용자 별명 표시 및 클릭 시 계정 관리 탭 이동 */}
      <div className="ml-auto flex items-center pr-4 gap-2">
        {/* 🌟 전체사용자 대상 리소스 폴더 미설정 퀵 알림 칩 */}
        {isResourceFolderMissing && isFullUser && (
          <button
             type="button"
             onClick={() => dispatch('SELECT_RESOURCE_FOLDER')}
             title="공통 리소스 폴더(서식/이미지/AI템플릿)가 지정되지 않았습니다. 클릭하여 폴더를 지정하세요."
             className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 transition-all text-xs font-bold animate-pulse cursor-pointer shadow-xs active:scale-98"
           >
             <FolderSync size={13} strokeWidth={2.5} />
             <span>리소스 폴더 미설정</span>
           </button>
        )}
        {(userNickname || userEmail || licenseStatus?.userId) && (
          <button
            type="button"
            onClick={() => dispatch('SETTINGS_ACCOUNT')}
            title="계정 관리로 이동"
            className="flex items-center gap-2 px-2.5 py-1 bg-white/70 dark:bg-black/30 hover:bg-white dark:hover:bg-zinc-800/80 rounded-lg border border-black/5 dark:border-white/10 shadow-xs hover:shadow-sm transition-all cursor-pointer group active:scale-98"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold text-[10px] group-hover:ring-2 group-hover:ring-blue-400/50 transition-all shrink-0">
              {((userNickname || userEmail || licenseStatus?.userId) || 'U').charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {userNickname || userEmail || licenseStatus?.userId}
              <span className="ml-1.5 opacity-80 font-bold text-[11px] text-zinc-500 dark:text-zinc-400">
                ({(licenseStatus?.isExpired || licenseStatus?.planName?.includes('동시 접속 초과') || licenseStatus?.planName?.includes('미인증') || licenseStatus?.planName?.includes('제한사용자')) ? '제한사용자' : '전체사용자'})
              </span>
            </span>
          </button>
        )}
      </div>
    </nav>
  );
}

// ====================================================================
// ====================================================================
// 📊 [OMD-EDIT-MenuBar-0001] MenuBar ➔ MenuDropdown
// 🎯 @KICK  : 상단 메뉴 드롭다운 렌더링 - 서브메뉴 호버 열림 및 단축키 표시
// 🛡️ @GUARD : item.disabled 적용하여 클릭 및 서브메뉴 방지
// 🚨 @PATCH : **2026-06-19** — 메뉴 아이템 비활성화(disabled) 기능 추가: item.disabled가 true일 때 opacity 및 cursor 스타일을 비활성화 형태로 변환하고 클릭/서브메뉴 오픈을 차단하도록 보정
// 🔗 @CALLS : 없음
// ====================================================================
function MenuDropdown({ label, isOpen, onClick, onClose, items, isDarkMode }: { label: string, isOpen: boolean, onClick: () => void, onClose: () => void, items: any[], isDarkMode: boolean }) {
  return (
    <div className="relative h-full">
      <button 
        onClick={onClick}
        className={`h-full px-3 hover:bg-surface-high/60 transition-colors ${isOpen ? 'bg-primary-container/20 text-primary font-semibold' : ''}`}
      >
        {label}
      </button>
      {isOpen && (
        <div 
          className="absolute top-full left-0 w-56 border border-outline/10 rounded-md py-1 animate-in fade-in slide-in-from-top-1 duration-150 text-on-surface bg-surface-high shadow-xl"
          style={{ 
            zIndex: 9999
          }}
        >
          {items.map((item, i) => (
            item.divider ? (
              <div key={i} className="my-1 border-t border-outline/10" />
            ) : (
              <div key={i} className="relative group">
                <button 
                  disabled={item.disabled}
                  onClick={() => { 
                    if (item.disabled) return;
                    if (!item.subItems) { 
                      item.onClick?.(); 
                      onClose(); 
                    } 
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left text-sm ${
                    item.disabled 
                      ? 'opacity-40 cursor-not-allowed text-zinc-400 dark:text-zinc-500' 
                      : 'hover:bg-[#06c755] hover:text-white transition-colors'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-4 flex justify-center opacity-70">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.subItems && <ChevronRight size={14} className="opacity-50" />}
                </button>

                {/* Submenu — CSS group-hover로 제어 (mouse leave 문제 해결) */}
                {item.subItems && (
                  <div 
                    className="absolute top-0 left-full w-48 border border-outline/10 rounded-md py-1 invisible group-hover:visible ml-px text-on-surface bg-surface-high shadow-xl"
                    style={{ 
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
