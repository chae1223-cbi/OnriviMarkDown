"use client";

import React from 'react';
import { 
  BookOpen, 
  ZoomIn, ZoomOut, Settings, HelpCircle, Eraser
} from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

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
    taglink: "문서링크",
    doclink: "다른 문서 연결",
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
    cleanDoc: "문서 서식 일괄 정리"
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
    taglink: "Doc Link",
    doclink: "Link Other Doc",
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
    cleanDoc: "Clean Document Formatting"
  }
};

export default function Toolbar({ 
  isDarkMode, setIsDarkMode, 
  isSidebarOpen, setIsSidebarOpen, 
  previewMode, setPreviewMode, 
  fontSize, setFontSize,
  wordWrap, setWordWrap,
  dispatch
 }: ToolbarProps) {
  const { showToast } = useToast();
  const [headingLevel, setHeadingLevel] = React.useState(3);

  const t = (key: string) => {
    const dict = localTranslations["ko"] || localTranslations['en'];
    return dict[key] || key;
  };

  const handleHeadingUp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (headingLevel > 1) {
      const next = headingLevel - 1;
      setHeadingLevel(next);
    }
  };

  const handleHeadingDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (headingLevel < 6) {
      const next = headingLevel + 1;
      setHeadingLevel(next);
    }
  };

  return (
    <div className="w-full h-[76px] border-b border-emerald-500/10 dark:border-emerald-500/20 flex flex-row items-center px-4 bg-[#f3f9f4] dark:bg-[#0f1712] shadow-sm z-30 text-zinc-700 dark:text-zinc-300 overflow-x-auto overflow-y-hidden shrink-0">
      <div className="flex flex-row items-center justify-between w-full h-full min-w-max">
        {/* 🎨 왼쪽 영역: 플로팅 툴바 디자인의 카드 모음 */}
        {previewMode !== 'preview' && (
          <div className="flex items-center bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-md rounded-2xl px-4 py-1.5 gap-3.5 select-none animate-in fade-in zoom-in-95 duration-100">
            {/* 서식 */}
            <div className="flex flex-row items-center gap-0.5">
              <ToolbarButton label="B" title={t('bold')} onAction={() => dispatch('BOLD')} bold />
              <ToolbarButton label="I" title={t('italic')} onAction={() => dispatch('ITALIC')} italic />
              <ToolbarButton label="</>" title={t('inlineCode')} onAction={() => dispatch('INLINE_CODE')} />
              <ToolbarButton label="U" title={t('underline')} onAction={() => dispatch('UNDERLINE')} underline />
              <ToolbarButton label={<span className="line-through">S</span>} title={t('strikethrough')} onAction={() => dispatch('STRIKETHROUGH')} />
            </div>
            
            <div className="w-px h-6 bg-black/10 dark:bg-white/10" />

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

            <div className="w-px h-6 bg-black/10 dark:bg-white/10" />

            {/* 문서/구분선 */}
            <div className="flex flex-row items-center gap-0.5">
              <ToolbarButton label="—" title={t('hr')} onAction={() => dispatch('HR')} />
              <ToolbarButton label="1." title={t('orderedList')} onAction={() => dispatch('ORDERED_LIST')} />
              <ToolbarButton label="☰" title={t('list')} onAction={() => dispatch('LIST')} />
              <ToolbarButton label="❝" title={t('quote')} onAction={() => dispatch('QUOTE')} />
              <ToolbarButton label="☑️" title={t('check')} onAction={() => dispatch('CHECK')} />
              <ToolbarButton label={<Eraser size={16} className="text-red-500 opacity-80" />} title={t('eraser')} onAction={() => dispatch('REMOVE_PREFIX')} />
              <ToolbarButton label="✨" title={t('cleanDoc')} onAction={() => dispatch('CLEAN_DOC')} />
            </div>

            <div className="w-px h-6 bg-black/10 dark:bg-white/10" />

            {/* 링크/미디어 */}
            <div className="flex flex-row items-center gap-0.5">
              <ToolbarButton label="🔗" title={t('link')} onAction={() => dispatch('LINK')} />
              <ToolbarButton label="🔖" title={t('taglink')} onAction={() => dispatch('TAGLINK')} />
              <ToolbarButton label="📄" title={t('doclink')} onAction={() => dispatch('DOCLINK')} />
              <ToolbarButton label="🖼️" title={t('image')} onAction={() => dispatch('IMAGE')} />
              <ToolbarButton label="🎥" title={t('youtube')} onAction={() => dispatch('YOUTUBE')} />
              <ToolbarButton label="📅" title={t('now')} onAction={() => dispatch('NOW')} />
            </div>

            <div className="w-px h-6 bg-black/10 dark:bg-white/10" />

            {/* 고급/코드 */}
            <div className="flex flex-row items-center gap-0.5">
              <ToolbarButton label="🗺️" title={t('map')} onAction={() => dispatch('MAP')} />
              <ToolbarButton label="📊" title={t('table')} onAction={() => dispatch('TABLE')} />
              <ToolbarButton label="💻" title={t('code')} onAction={() => dispatch('CODE')} />
              <ToolbarButton label="Σ" title={t('latex')} onAction={() => dispatch('LATEX')} />
            </div>
          </div>
        )}

        {/* 여백 (분리용) */}
        <div className="flex-1 min-w-[20px]" />

        {/* ⚙️ 오른쪽 영역: 설정 및 사용자설명서(도움말) 및 복사 */}
        <div className="flex items-center gap-2">
          <button 
            onMouseDown={(e) => { e.preventDefault(); dispatch('COPY_ALL'); }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all text-sm font-semibold select-none border border-transparent hover:border-black/5 dark:hover:border-white/5"
            title={t('copyAll')}
          >
            <span className="text-zinc-500 dark:text-zinc-400">📋</span>
            <span>마크다운 복사</span>
          </button>
          <button 
            onMouseDown={(e) => { e.preventDefault(); dispatch('SETTINGS'); }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all text-sm font-semibold select-none border border-transparent hover:border-black/5 dark:hover:border-white/5"
            title={t('settings')}
          >
            <Settings size={18} className="text-zinc-500 dark:text-zinc-400" />
            <span>설정</span>
          </button>
          <button 
            onMouseDown={(e) => { e.preventDefault(); dispatch('HELP'); }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all text-sm font-semibold select-none border border-transparent hover:border-black/5 dark:hover:border-white/5"
            title="사용자 설명서 열기"
          >
            <HelpCircle size={18} className="text-zinc-500 dark:text-zinc-400" />
            <span>사용자설명서</span>
          </button>
        </div>
      </div>
    </div>
  );
}

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
      className={`w-9 h-9 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[16px] ${bold ? 'font-black' : ''} ${italic ? 'italic font-serif' : ''} ${underline ? 'underline' : ''} ${
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
    <div className="flex items-center border border-emerald-500/20 dark:border-emerald-500/30 rounded bg-emerald-500/5 dark:bg-emerald-500/10 py-1 px-2 gap-2">
      <button 
        onMouseDown={handleHeadingUp}
        disabled={headingLevel === 1}
        className="w-6 h-8 flex items-center justify-center rounded hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 text-[11px]"
        title="제목 크기 키우기 (H1 방향)"
      >
        ▲
      </button>
      <button 
        onMouseDown={onHeadingSelect}
        className="w-10 h-8 flex items-center justify-center font-bold text-[14px] hover:bg-black/10 dark:hover:bg-white/10 rounded shrink-0"
        title={`제목 ${headingLevel} 적용`}
      >
        H{headingLevel}
      </button>
      <button 
        onMouseDown={handleHeadingDown}
        disabled={headingLevel === 6}
        className="w-6 h-8 flex items-center justify-center rounded hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 text-[11px]"
        title="제목 크기 줄이기 (H6 방향)"
      >
        ▼
      </button>
    </div>
  );
}

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
