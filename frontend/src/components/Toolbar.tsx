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
    taglink: "태그링크",
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
    taglink: "Tag Link",
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
    toSplitMode: "Switch to Split View",
    toPreviewMode: "Switch to Preview Only",
    toEditMode: "Switch to Editor Only",
    theme: "Toggle Dark/Light Mode",
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
    <div className="w-full h-[60px] border-b border-emerald-500/10 dark:border-emerald-500/20 flex flex-row items-center px-4 bg-[#f3f9f4] dark:bg-[#0f1712] shadow-sm z-30 text-zinc-700 dark:text-zinc-300 overflow-x-auto overflow-y-hidden shrink-0">
      <div className="flex flex-row items-center gap-6 w-full h-full min-w-max">
        {previewMode !== 'preview' && (
          <div className="flex flex-row items-center gap-6 h-full animate-in fade-in slide-in-from-left-2 duration-300">
            {/* 제목 */}
            <ToolbarGroup label="제목">
              <HeadingSpinButton 
                headingLevel={headingLevel} 
                handleHeadingUp={handleHeadingUp} 
                handleHeadingDown={handleHeadingDown} 
                onHeadingSelect={(e) => {
                  e.preventDefault();
                  dispatch(`H${headingLevel}`);
                }} 
              />
            </ToolbarGroup>

            {/* 서식 */}
            <ToolbarGroup label="서식">
              <ToolbarButton label="B" title={t('bold')} onAction={() => dispatch('BOLD')} bold />
              <ToolbarButton label="I" title={t('italic')} onAction={() => dispatch('ITALIC')} italic />
              <ToolbarButton label={<span className="line-through">S</span>} title={t('strikethrough')} onAction={() => dispatch('STRIKETHROUGH')} />
              <ToolbarButton label="</>" title={t('inlineCode')} onAction={() => dispatch('INLINE_CODE')} />
            </ToolbarGroup>

            {/* 목록 */}
            <ToolbarGroup label="목록">
              <ToolbarButton label="1." title={t('orderedList')} onAction={() => dispatch('ORDERED_LIST')} />
              <ToolbarButton label="☰" title={t('list')} onAction={() => dispatch('LIST')} />
              <ToolbarButton label="❝" title={t('quote')} onAction={() => dispatch('QUOTE')} />
              <ToolbarButton label="☑️" title={t('check')} onAction={() => dispatch('CHECK')} />
            </ToolbarGroup>

            {/* 미디어 */}
            <ToolbarGroup label="미디어">
              <ToolbarButton label="🔗" title={t('link')} onAction={() => dispatch('LINK')} />
              <ToolbarButton label="🖼️" title={t('image')} onAction={() => dispatch('IMAGE')} />
              <ToolbarButton label="🎥" title={t('youtube')} onAction={() => dispatch('YOUTUBE')} />
              <ToolbarButton label="🗺️" title={t('map')} onAction={() => dispatch('MAP')} />
            </ToolbarGroup>

            {/* 코드 */}
            <ToolbarGroup label="코드">
              <ToolbarButton label="💻" title={t('code')} onAction={() => dispatch('CODE')} />
              <ToolbarButton label="📊" title={t('table')} onAction={() => dispatch('TABLE')} />
              <ToolbarButton label="Σ" title={t('latex')} onAction={() => dispatch('LATEX')} />
            </ToolbarGroup>

            {/* 문서 */}
            <ToolbarGroup label="문서">
              <ToolbarButton label="—" title={t('hr')} onAction={() => dispatch('HR')} />
              <ToolbarButton label="📅" title={t('now')} onAction={() => dispatch('NOW')} />
              <ToolbarButton label="✨" title={t('cleanDoc')} onAction={() => dispatch('CLEAN_DOC')} />
            </ToolbarGroup>
          </div>
        )}
        
        {/* 여백 (좌측 정렬용) */}
        <div className="flex-1" />

        {/* 💡 [요구사항] 현재 활성화된 화면 모드 실시간 시각적 배지 표시 */}
        <div className="flex items-center bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 dark:border-blue-500/30 rounded-full px-3.5 py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 select-none shadow-sm shrink-0">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 animate-pulse" />
          {previewMode === 'edit' && '편집 모드'}
          {previewMode === 'both' && '편집/미리보기 반반모드'}
          {previewMode === 'preview' && '미리보기 모드'}
          {previewMode === 'css-style' && '서식 정의 모드'}
        </div>

        {/* 부가기능 */}
        <div className="flex flex-row items-center gap-4 h-full">
          <ToolbarGroup label="부가기능" showDivider={false}>
            <ToolbarButton label={<span className="font-bold">🗃️</span>} title={t('sidebarShow')} onAction={() => setIsSidebarOpen(!isSidebarOpen)} />
            <ToolbarButton label={<span className="font-bold">♻️</span>} title={t('toolbarToggle')} onAction={() => dispatch('TOGGLE_TOOLBAR')} />
            <ToolbarButton label={<span className="font-bold">📜</span>} title={t('toEditMode')} onAction={() => dispatch('TOGGLE_MODE')} />
          </ToolbarGroup>
        </div>
      </div>
    </div>
  );
}

function ToolbarGroup({ label, children, showDivider = true }: { label: string, children: React.ReactNode, showDivider?: boolean }) {
  return (
    <div className="flex flex-row items-center h-full">
      <div className="flex flex-col items-center justify-center h-full pt-1">
        <div className="flex flex-row items-center gap-1 px-1">
          {children}
        </div>
        <span className="text-[9px] mt-0.5 font-semibold tracking-wider text-gray-500 dark:text-zinc-400">
          {label}
        </span>
      </div>
      {showDivider && (
        <div className="w-px h-8 bg-black/10 dark:bg-white/10 ml-4" />
      )}
    </div>
  );
}

function ToolbarButton({ label, title, onAction, bold, italic }: { label: string | React.ReactNode, title: string, onAction?: (e: any) => void, bold?: boolean, italic?: boolean }) {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // 포커스 유실 방지
    if (onAction) {
      onAction(e);
    }
  };
  return (
    <button 
      onMouseDown={handleMouseDown} 
      className={`w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px] ${bold ? 'font-black' : ''} ${italic ? 'italic font-serif' : ''}`} 
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
    <div className="flex items-center border border-emerald-500/20 dark:border-emerald-500/30 rounded bg-emerald-500/5 dark:bg-emerald-500/10 py-0.5 px-1.5 gap-1.5">
      <button 
        onMouseDown={handleHeadingUp}
        disabled={headingLevel === 1}
        className="w-5 h-6 flex items-center justify-center rounded hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 text-[9px]"
        title="제목 크기 키우기 (H1 방향)"
      >
        ▲
      </button>
      <button 
        onMouseDown={onHeadingSelect}
        className="w-7 h-6 flex items-center justify-center font-bold text-[11px] hover:bg-black/10 dark:hover:bg-white/10 rounded shrink-0"
        title={`제목 ${headingLevel} 적용`}
      >
        H{headingLevel}
      </button>
      <button 
        onMouseDown={handleHeadingDown}
        disabled={headingLevel === 6}
        className="w-5 h-6 flex items-center justify-center rounded hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 text-[9px]"
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
