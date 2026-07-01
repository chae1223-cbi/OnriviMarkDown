"use client";

import React from 'react';
import { 
  BookOpen, 
  ZoomIn, ZoomOut, Settings, Eraser
} from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import { useRouter } from 'next/navigation';

/**
 * [ONR-UI-006] ToolbarProps 인터페이스
 * @description 에디터 상단 툴바(Toolbar)에 전달되는 상태값들과 테마/폰트 조절 콜백 함수 및 액션 디스패치 규격 명세입니다.
 */
interface ToolbarProps {
  isDarkMode: boolean;
  setIsDarkMode: (v: boolean) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (v: boolean) => void;
  previewMode: 'edit' | 'both' | 'preview' | 'css-style';
  setPreviewMode: (v: 'edit' | 'both' | 'preview' | 'css-style') => void;
  fontSize: number;
  setFontSize: (v: number) => void;
  wordWrap: 'on' | 'off';
  setWordWrap: (v: 'on' | 'off') => void;
  dispatch: (type: any, payload?: any) => void;
  isExpired?: boolean;
}

const localTranslations: Record<string, Record<string, string>> = {
  ko: {
    sidebarHide: "사이드바 숨기기",
    sidebarShow: "사이드바 보이기",
    groupFormatting: "서식",
    groupHeading: "제목",
    groupParagraph: "문단",
    groupInsert: "삽입",
    groupAdvanced: "고급",
    groupText: "글자",
    groupView: "보기",
    groupSettings: "설정",
    groupOther: "기타",
    bold: "굵게",
    italic: "기울임",
    underline: "밑줄",
    inlineCode: "인라인 코드",
    strikethrough: "취소선",
    footnote: "각주",
    h1: "제목 1",
    h2: "제목 2",
    h3: "제목 3",
    h4: "제목 4",
    h5: "제목 5",
    h6: "제목 6",
    hr: "구분선",
    orderedList: "숫자 목록",
    list: "글머리 기호",
    quote: "인용구",
    check: "체크리스트",
    eraser: "태그 취소 (Ctrl+Shift+X)",
    link: "링크",
    taglink: "문서 연결",
    image: "이미지",
    now: "현재 날짜/시간",
    emoji: "이모지 피커",
    map: "지도 삽입",
    table: "표 생성",
    code: "코드 블록",
    latex: "수식(LaTeX)",
    fontSmaller: "글자 작게",
    fontLarger: "글자 크게",
    wordWrap: "자동 줄 바꿈",
    search: "전체 검색",
    toSplitMode: "분할 화면 모드로 전환",
    toPreviewMode: "미리보기 전용 모드로 전환",
    toEditMode: "편집 전용 모드로 전환",
    theme: "테마 전환",
    settings: "환경 설정",
    help: "도움말",
    save: "저장",
    export: "내보내기",
    copyAll: "미리보기 복사",
    youtube: "유튜브 동영상 삽입",
    cleanDoc: "문서 서식 일괄 정리",
    merge: "파일 병합"
  },
  en: {
    sidebarHide: "Hide Sidebar",
    sidebarShow: "Show Sidebar",
    groupFormatting: "Formatting",
    groupHeading: "Heading",
    groupParagraph: "Paragraph",
    groupInsert: "Insert",
    groupAdvanced: "Advanced",
    groupText: "Text",
    groupView: "View",
    groupSettings: "Settings",
    groupOther: "Other",
    bold: "Bold",
    italic: "Italic",
    underline: "Underline",
    inlineCode: "Inline Code",
    strikethrough: "Strikethrough",
    footnote: "Footnote",
    h1: "Heading 1",
    h2: "Heading 2",
    h3: "Heading 3",
    h4: "Heading 4",
    h5: "Heading 5",
    h6: "Heading 6",
    hr: "Horizontal Rule",
    orderedList: "Numbered List",
    list: "Bulleted List",
    quote: "Blockquote",
    check: "Task List",
    eraser: "Clear formatting (Ctrl+Shift+X)",
    link: "Insert Link",
    taglink: "Insert Doc Link",
    image: "Insert Image",
    now: "Current Date/Time",
    emoji: "Emoji Picker",
    map: "Insert Google Map",
    table: "Insert Table",
    code: "Code Block",
    latex: "Formula (LaTeX)",
    fontSmaller: "Decrease Font Size",
    fontLarger: "Increase Font Size",
    wordWrap: "Toggle Word Wrap",
    search: "Global Search",
    toSplitMode: "Switch to Split Mode",
    toPreviewMode: "Switch to Preview Mode",
    toEditMode: "Switch to Edit Mode",
    theme: "Toggle Theme",
    settings: "Settings",
    help: "Syntax Help",
    save: "Save",
    export: "Export",
    copyAll: "Copy Preview",
    youtube: "Insert YouTube Video",
    cleanDoc: "Clean Document Formatting",
    merge: "Merge Files"
  }
};

// ====================================================================
// 📊 [OMD-EDIT-Toolbar-0008] Toolbar ➔ Toolbar
// 🎯 @KICK  : 에디터 상단 툴바 컴포넌트 - 서식/제목/문단/삽입/고급/보기/설정 그룹 제공
// 🛡️ @GUARD : ToolbarProps 인터페이스로 props 타입 검증; isExpired 시 formatting 영역 pointer-events-none+opacity-40
// 🚨 @PATCH : **2026-06-28** — 데스크톱 앱(Electron) 내부 서빙 시 하단부의 온리비 홈(랜딩) 및 마이페이지 대시보드 바로가기 버튼을 항상 노출시키되, 일렉트론 환경일 때 클릭 시 외부 시스템 기본 브라우저 새창으로 열리도록(openExternal 연동) 보완하여 화면 이탈을 방지하고, 라이선스가 만료된 미리보기 모드일 때(isExpired) 서식 및 서식 편집 관련 아이콘들이 툴바에서 완전히 숨김 처리되도록 렌더링 초기화 가드 추가
//             2026-06-18 — h-[60px]→h-11 (44px) 좌측 사이드바 탭과 높이 수평 정렬; bg/shadow/border-white 제거; 2026-06-22 — isExpired prop 추가, overlay 제거 → formatting 영역 직접 비활성화; 우측 순서 설정→대시보드→온리비어서로 변경 (항시 클릭 가능)
// 🔗 @CALLS : ToolbarGroup, ToolbarButton, HeadingSpinButton, CopyPreviewButton, useToast
// ====================================================================
export default function Toolbar({ 
  isDarkMode, setIsDarkMode, 
  isSidebarOpen, setIsSidebarOpen, 
  previewMode, setPreviewMode, 
  fontSize, setFontSize,
  wordWrap, setWordWrap,
  dispatch,
  isExpired
 }: ToolbarProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [headingLevel, setHeadingLevel] = React.useState(3);

// ====================================================================
// 📊 [OMD-EDIT-Toolbar-0007] Toolbar ➔ t
// 🎯 @KICK  : 다국어 키-값 조회 함수 - localTranslations에서 key에 해당하는 번역 문자열 반환
// 🛡️ @GUARD : dict[key]가 없으면 key 자체를 fallback으로 반환
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
  const t = (key: string) => {
    const dict = localTranslations["ko"] || localTranslations['en'];
    return dict[key] || key;
  };

// ====================================================================
// 📊 [OMD-EDIT-Toolbar-0006] Toolbar ➔ handleHeadingUp
// 🎯 @KICK  : 제목 레벨 증가 핸들러 - headingLevel 1 초과일 때 -1
// 🛡️ @GUARD : headingLevel > 1 조건 검사
// 🚨 @PATCH : 없음
// 🔗 @CALLS : setHeadingLevel
// ====================================================================
  const handleHeadingUp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (headingLevel > 1) {
      const next = headingLevel - 1;
      setHeadingLevel(next);
    }
  };

// ====================================================================
// 📊 [OMD-EDIT-Toolbar-0005] Toolbar ➔ handleHeadingDown
// 🎯 @KICK  : 제목 레벨 감소 핸들러 - headingLevel 6 미만일 때 +1
// 🛡️ @GUARD : headingLevel < 6 조건 검사
// 🚨 @PATCH : 없음
// 🔗 @CALLS : setHeadingLevel
// ====================================================================
  const handleHeadingDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (headingLevel < 6) {
      const next = headingLevel + 1;
      setHeadingLevel(next);
    }
  };

  return (
    <div className="h-full w-14 flex flex-col items-center py-3 px-1 z-30 text-zinc-700 dark:text-zinc-300 overflow-y-auto overflow-x-hidden shrink-0 bg-zinc-50 dark:bg-zinc-900/50">
      {/* 🎨 서식 버튼들 (미리보기 모드 및 라이선스 만료 시에는 완전히 가림) */}
      {(previewMode !== 'preview' && !isExpired) && (
        <div className="flex flex-col items-center gap-0 select-none">
          {/* 서식 */}
          <ToolbarButton label="B" title={t('bold')} onAction={() => dispatch('BOLD')} bold />
          <ToolbarButton label="I" title={t('italic')} onAction={() => dispatch('ITALIC')} italic />
          <ToolbarButton label="</>" title={t('inlineCode')} onAction={() => dispatch('INLINE_CODE')} />
          <ToolbarButton label="U" title={t('underline')} onAction={() => dispatch('UNDERLINE')} underline />
          <ToolbarButton label={<span className="line-through">S</span>} title={t('strikethrough')} onAction={() => dispatch('STRIKETHROUGH')} />
          <ToolbarButton label="fn" title={t('footnote')} onAction={() => dispatch('FOOTNOTE')} />

          <div className="w-10 border-t-2 border-zinc-300 dark:border-zinc-600/60" />

          {/* 제목 */}
          <HeadingSpinButton 
            headingLevel={headingLevel} 
            handleHeadingUp={handleHeadingUp} 
            handleHeadingDown={handleHeadingDown} 
            onHeadingSelect={(e) => {
              e.preventDefault();
              dispatch(`H${headingLevel}`);
            }} 
          />

          <div className="w-10 border-t-2 border-zinc-300 dark:border-zinc-600/60" />

          {/* 문서/구분선 */}
          <ToolbarButton label="—" title={t('hr')} onAction={() => dispatch('HR')} />
          <ToolbarButton label="🔢" title={t('orderedList')} onAction={() => dispatch('ORDERED_LIST')} />
          <ToolbarButton label="☰" title={t('list')} onAction={() => dispatch('LIST')} />
          <ToolbarButton label="❝" title={t('quote')} onAction={() => dispatch('QUOTE')} />
          <ToolbarButton label="☑️" title={t('check')} onAction={() => dispatch('CHECK')} />
          <ToolbarButton label={<Eraser size={16} className="text-red-500 opacity-80" />} title={t('eraser')} onAction={() => dispatch('REMOVE_PREFIX')} />
          <ToolbarButton label="✨" title={t('cleanDoc')} onAction={() => dispatch('CLEAN_DOC')} />
          <ToolbarButton label="🔀" title={t('merge')} onAction={() => dispatch('MERGE')} />

          <div className="w-10 border-t-2 border-zinc-300 dark:border-zinc-600/60" />

          {/* 링크/미디어 */}
          <ToolbarButton label="🔗" title={t('link')} onAction={() => dispatch('LINK')} />
          <ToolbarButton label="🔖" title={t('taglink')} onAction={() => dispatch('DOCLINK')} />
          <ToolbarButton label="🖼️" title={t('image')} onAction={() => dispatch('IMAGE')} />
          <ToolbarButton label="🎞️" title={t('youtube')} onAction={() => dispatch('YOUTUBE')} />
          <ToolbarButton label="📅" title={t('now')} onAction={() => dispatch('NOW')} />

          <div className="w-10 border-t-2 border-zinc-300 dark:border-zinc-600/60" />

          {/* 고급/코드 */}
          <ToolbarButton label="🌏" title={t('map')} onAction={() => dispatch('MAP')} />
          <ToolbarButton label="📶" title={t('table')} onAction={() => dispatch('TABLE')} />
          <ToolbarButton label="⌨️" title={t('code')} onAction={() => dispatch('CODE')} />
          <ToolbarButton label="✖️" title={t('latex')} onAction={() => dispatch('LATEX')} />
        </div>
      )}

      {/* 하단 여백 확보를 위한 flex-1 */}
      <div className="flex-1 min-h-[8px]" />

      {/* ⚙️ 하단 영역: 온리비어서 → 대시보드 → 설정 → 로그아웃 */}
      <div className="w-10 border-t-2 border-zinc-300 dark:border-zinc-700/60 mb-2" />
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          const isDesktop = typeof window !== "undefined" && (
            !!(window as any).electronAPI || 
            navigator.userAgent.toLowerCase().includes('electron') ||
            new URLSearchParams(window.location.search).get('env') === 'desktop'
          );
          if (isDesktop && (window as any).electronAPI?.openExternal) {
            // full URL 전달하여 외부 시스템 기본 웹 브라우저 새창 연동 확실화
            (window as any).electronAPI.openExternal('https://onrivi.com/');
          } else if (isDesktop) {
            window.open('https://onrivi.com/', '_blank');
          } else {
            router.push('/');
          }
        }}
        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all"
        title="온리비 어서 홈으로"
      >
        <img src="./icon.png" alt="온리비" className="w-5 h-5 object-contain" />
      </button>
      <button 
        onMouseDown={(e) => {
          e.preventDefault();
          const isDesktop = typeof window !== "undefined" && (
            !!(window as any).electronAPI || 
            navigator.userAgent.toLowerCase().includes('electron') ||
            new URLSearchParams(window.location.search).get('env') === 'desktop'
          );
          if (isDesktop && (window as any).electronAPI?.openExternal) {
            // full URL 전달하여 외부 시스템 기본 웹 브라우저 새창 연동 확실화
            (window as any).electronAPI.openExternal('https://onrivi.com/dashboard');
          } else if (isDesktop) {
            window.open('https://onrivi.com/dashboard', '_blank');
          } else {
            router.push('/dashboard');
          }
        }}
        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all text-base"
        title="대시보드 이동"
      >
        <span className="text-zinc-500 dark:text-zinc-400 text-lg">🔠</span>
      </button>

      <button 
        onMouseDown={(e) => { e.preventDefault(); dispatch('SETTINGS'); }}
        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all"
        title={t('settings')}
      >
        <Settings size={18} className="text-zinc-500 dark:text-zinc-400" />
      </button>
      <div className="w-10 border-t-2 border-zinc-300 dark:border-zinc-600/60 my-1" />
      <button 
        onMouseDown={(e) => { e.preventDefault(); dispatch('EXIT'); }}
        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-all"
        title="로그아웃"
      >
        <span className="text-xl">🚪</span>
      </button>
    </div>
  );
}

// ====================================================================
// 📊 [OMD-EDIT-Toolbar-0004] Toolbar ➔ ToolbarGroup
// 🎯 @KICK  : 툴바 그룹 컨테이너 - 자식 버튼들과 하단 라벨 표시
// 🛡️ @GUARD : 없음
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
function ToolbarGroup({ label, children, showDivider = true }: { label: string, children: React.ReactNode, showDivider?: boolean }) {
  return (
    <div className="flex flex-row items-center h-full">
      <div className="flex flex-col items-center justify-center h-full pt-1">
        <div className="flex flex-row items-center gap-1.5 px-1">
          {children}
        </div>
        <span className="text-[11px] mt-1 font-semibold tracking-wider text-gray-500 dark:text-zinc-400">
          {label}
        </span>
      </div>
      {showDivider && (
        <div className="w-px h-10 bg-black/10 dark:bg-white/10 ml-6" />
      )}
    </div>
  );
}

// ====================================================================
// 📊 [OMD-EDIT-Toolbar-0003] Toolbar ➔ ToolbarButton
// 🎯 @KICK  : 툴바 개별 버튼 - bold/italic/underline/active 스타일링 및 마우스다운 이벤트 처리
// 🛡️ @GUARD : e.preventDefault()로 포커스 유실 방지
// 🚨 @PATCH : 없음
// 🔗 @CALLS : onAction
// ====================================================================
function ToolbarButton({ label, title, onAction, bold, italic, underline, active }: { label: string | React.ReactNode, title: string, onAction?: (e: any) => void, bold?: boolean, italic?: boolean, underline?: boolean, active?: boolean }) {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // 포커스 유실 방지
    if (onAction) {
      onAction(e);
    }
  };
  return (
    <button 
      onMouseDown={handleMouseDown} 
      className={`w-10 h-10 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-all flex items-center justify-center text-[18px] ${bold ? 'font-black' : ''} ${italic ? 'italic font-serif' : ''} ${underline ? 'underline' : ''} ${
        active 
          ? 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20' 
          : ''
      }`} 
      title={title}
    >
      {label}
    </button>
  );
}

// ====================================================================
// 📊 [OMD-EDIT-Toolbar-0002] Toolbar ➔ HeadingSpinButton
// 🎯 @KICK  : 제목 레벨 조절 스핀 버튼 - ▲/▼ 버튼으로 headingLevel 조정 및 H 적용
// 🛡️ @GUARD : headingLevel 1~6 범위 제한 (disabled 처리)
// 🚨 @PATCH : 없음
// 🔗 @CALLS : handleHeadingUp, handleHeadingDown, onHeadingSelect
// ====================================================================
function HeadingSpinButton({
  headingLevel,
  handleHeadingUp,
  handleHeadingDown,
  onHeadingSelect,
}: {
  headingLevel: number;
  handleHeadingUp: (e: any) => void;
  handleHeadingDown: (e: any) => void;
  onHeadingSelect: (e: any) => void;
}) {
  return (
    <div className="flex flex-col items-center border border-emerald-500/20 dark:border-emerald-500/30 rounded bg-emerald-500/5 dark:bg-emerald-500/10 px-1.5 py-1 gap-0.5">
      <button 
        onMouseDown={handleHeadingUp}
        disabled={headingLevel === 1}
        className="w-9 h-7 flex items-center justify-center rounded hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 text-[12px]"
        title="제목 크기 키우기 (H1 방향)"
      >
        ▲
      </button>
      <button 
        onMouseDown={onHeadingSelect}
        className="w-9 h-7 flex items-center justify-center font-bold text-[14px] hover:bg-black/10 dark:hover:bg-white/10 rounded shrink-0"
        title={`제목 ${headingLevel} 적용`}
      >
        H{headingLevel}
      </button>
      <button 
        onMouseDown={handleHeadingDown}
        disabled={headingLevel === 6}
        className="w-9 h-7 flex items-center justify-center rounded hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 text-[12px]"
        title="제목 크기 줄이기 (H6 방향)"
      >
        ▼
      </button>
    </div>
  );
}

// ====================================================================
// 📊 [OMD-EDIT-Toolbar-0001] Toolbar ➔ CopyPreviewButton
// 🎯 @KICK  : 미리보기 복사 버튼 - 클릭 시 onAction 콜백 실행
// 🛡️ @GUARD : 없음
// 🚨 @PATCH : 없음
// 🔗 @CALLS : onAction
// ====================================================================
function CopyPreviewButton({
  onAction,
  title,
}: {
  onAction: () => void;
  title: string;
}) {
  return (
    <button 
      onMouseDown={(e) => { e.preventDefault(); onAction(); }}
      className="w-8 h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded shadow-md transition-all active:scale-95 flex items-center justify-center text-sm"
      title={title}
    >
      📋
    </button>
  );
}
