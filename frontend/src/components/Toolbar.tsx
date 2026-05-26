"use client";

import React from 'react';
import { 
  BookOpen, 
  ZoomIn, ZoomOut, Settings, HelpCircle, Eraser
} from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import TablePicker from './TablePicker';

interface ToolbarProps {
  isDarkMode: boolean;
  setIsDarkMode: (v: boolean) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (v: boolean) => void;
  previewMode: 'edit' | 'both' | 'preview';
  setPreviewMode: (v: 'edit' | 'both' | 'preview') => void;
  fontSize: number;
  setFontSize: (v: number) => void;
  wordWrap: 'on' | 'off';
  setWordWrap: (v: 'on' | 'off') => void;
  handlers: any;
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
  },
  ja: {
    sidebarHide: "サイドバー를 隠す",
    sidebarShow: "サイドバーを表示",
    groupFormatting: "書式",
    groupHeading: "見出し",
    groupParagraph: "段落",
    groupInsert: "挿入",
    groupAdvanced: "詳細",
    groupText: "文字",
    groupView: "表示",
    groupSettings: "設定",
    groupOther: "その他",
    bold: "太字",
    italic: "斜体",
    inlineCode: "インラインコード",
    strikethrough: "打ち消し線",
    h1: "見出し 1",
    h2: "見出し 2",
    h3: "見出し 3",
    h4: "見出し 4",
    h5: "見出し 5",
    h6: "見出し 6",
    hr: "区切り線",
    orderedList: "番号付きリスト",
    list: "箇条書きリスト",
    quote: "引用",
    check: "タスクリスト",
    eraser: "書式をクリア (Ctrl+Shift+X)",
    link: "リンク挿入",
    image: "画像挿入",
    now: "当前の日時",
    emoji: "絵文字ピッカー",
    map: "Googleマップ挿入",
    table: "テーブル挿入",
    code: "コードブロック",
    latex: "数式 (LaTeX)",
    fontSmaller: "文字を小さく",
    fontLarger: "文字を大きく",
    wordWrap: "自動折り返し切り替え",
    search: "全体検索",
    toSplitMode: "分割表示モードに切り替え",
    toPreviewMode: "プレビュー専用モードに切り替え",
    toEditMode: "編集専用モードに切り替え",
    theme: "テーマ切り替え",
    settings: "設定",
    help: "ヘルプ",
    save: "保存",
    export: "書き出し",
    copyAll: "プレビューコピー",
    youtube: "YouTube動画挿入",
    cleanDoc: "ドキュメント書式の一括整理"
  },
  zh: {
    sidebarHide: "隐藏侧边栏",
    sidebarShow: "显示侧边栏",
    groupFormatting: "格式",
    groupHeading: "标题",
    groupParagraph: "段落",
    groupInsert: "插入",
    groupAdvanced: "高级",
    groupText: "文字",
    groupView: "视图",
    groupSettings: "设置",
    groupOther: "其他",
    bold: "加粗",
    italic: "斜体",
    inlineCode: "行内代码",
    strikethrough: "删除线",
    h1: "标题 1",
    h2: "标题 2",
    h3: "标题 3",
    h4: "标题 4",
    h5: "标题 5",
    h6: "标题 6",
    hr: "分割线",
    orderedList: "有序列表",
    list: "无序列表",
    quote: "引用",
    check: "任务列表",
    eraser: "清除格式 (Ctrl+Shift+X)",
    link: "插入链接",
    image: "插入图像",
    now: "当前日期时间",
    emoji: "表情符号选择器",
    map: "插入谷歌地图",
    table: "插入表格",
    code: "代码块",
    latex: "数学公式 (LaTeX)",
    fontSmaller: "减小字号",
    fontLarger: "增大字号",
    wordWrap: "切换自动折行",
    search: "全局搜索",
    toSplitMode: "切换到双栏视图模式",
    toPreviewMode: "切换到仅预览模式",
    toEditMode: "切换到仅编辑模式",
    theme: "切换主题配色",
    settings: "设置",
    help: "语法帮助",
    save: "保存",
    export: "导出",
    copyAll: "预览复制",
    youtube: "插入 YouTube 视频",
    cleanDoc: "一键清理文档格式"
  }
};

export default function Toolbar({ 
  isDarkMode, setIsDarkMode, 
  isSidebarOpen, setIsSidebarOpen, 
  previewMode, setPreviewMode, 
  fontSize, setFontSize,
  wordWrap, setWordWrap,
  handlers
 }: ToolbarProps) {
  const { showToast } = useToast();
  const [headingLevel, setHeadingLevel] = React.useState(3);
  const [isTablePickerOpen, setIsTablePickerOpen] = React.useState(false);

  const t = (key: string) => {
    const dict = localTranslations["ko"] || localTranslations['en'];
    return dict[key] || key;
  };

  const handleHeadingUp = () => {
    if (headingLevel > 1) {
      const next = headingLevel - 1;
      setHeadingLevel(next);
      handlers[`h${next}`]?.();
    }
  };

  const handleHeadingDown = () => {
    if (headingLevel < 6) {
      const next = headingLevel + 1;
      setHeadingLevel(next);
      handlers[`h${next}`]?.();
    }
  };
  return (
    <div className="w-full h-[60px] border-b border-emerald-500/10 dark:border-emerald-500/20 flex flex-row items-center px-4 bg-[#f3f9f4] dark:bg-[#0f1712] shadow-sm z-30 text-zinc-700 dark:text-zinc-300 overflow-x-auto overflow-y-hidden shrink-0">
      <div className="flex flex-row items-center gap-6 w-full h-full min-w-max">
        {previewMode !== 'preview' && (
          <div className="flex flex-row items-center gap-6 h-full animate-in fade-in slide-in-from-left-2 duration-300">
            {/* 서식 */}
            <ToolbarGroup label={t('groupFormatting')}>
              <ToolbarButton label="B" title={t('bold')} onClick={() => handlers.bold()} bold />
              <ToolbarButton label="I" title={t('italic')} onClick={() => handlers.italic()} italic />
              <ToolbarButton label="</>" title={t('inlineCode')} onClick={() => handlers.inlineCode()} />
              <ToolbarButton label={<span className="line-through">S</span>} title={t('strikethrough')} onClick={() => handlers.strikethrough()} />
            </ToolbarGroup>

            {/* 제목 */}
            <ToolbarGroup label={t('groupHeading')}>
              <HeadingSpinButton 
                headingLevel={headingLevel} 
                handleHeadingUp={handleHeadingUp} 
                handleHeadingDown={handleHeadingDown} 
                handlers={handlers} 
              />
            </ToolbarGroup>

            {/* 문단 */}
            <ToolbarGroup label={t('groupParagraph')}>
              <ToolbarButton label="—" title={t('hr')} onClick={() => handlers.hr()} />
              <ToolbarButton label="1." title={t('orderedList')} onClick={() => handlers.orderedList()} />
              <ToolbarButton label="☰" title={t('list')} onClick={() => handlers.list()} />
              <ToolbarButton label="❝" title={t('quote')} onClick={() => handlers.quote()} />
              <ToolbarButton label="☑️" title={t('check')} onClick={() => handlers.check()} />
              <ToolbarButton label={<Eraser size={14} className="text-red-500 opacity-80 hover:opacity-100" />} title={t('eraser')} onClick={() => handlers.removePrefix && handlers.removePrefix()} />
              <ToolbarButton label="✨" title={t('cleanDoc')} onClick={() => handlers.cleanDoc && handlers.cleanDoc()} />
            </ToolbarGroup>

            {/* 삽입 */}
            <ToolbarGroup label={t('groupInsert')}>
              <ToolbarButton label="🔗" title={t('link')} onClick={() => handlers.link()} />
              <ToolbarButton label="🖼️" title={t('image')} onClick={() => handlers.image()} />
              <ToolbarButton label="🎥" title={t('youtube')} onClick={() => handlers.youtube && handlers.youtube()} />
              <ToolbarButton label="📅" title={t('now')} onClick={() => handlers.now()} />
              <ToolbarButton label="😊" title={t('emoji')} onClick={(e) => handlers.emoji && handlers.emoji(e)} />
            </ToolbarGroup>

            {/* 고급 */}
            <ToolbarGroup label={t('groupAdvanced')}>
              <ToolbarButton label="🗺️" title={t('map')} onClick={() => handlers.map()} />
              <div className="relative">
                <ToolbarButton label="📊" title={t('table')} onClick={() => setIsTablePickerOpen(!isTablePickerOpen)} />
                {isTablePickerOpen && (
                  <div className="absolute top-full left-0 mt-1">
                    <TablePicker 
                      isDarkMode={isDarkMode} 
                      onClose={() => setIsTablePickerOpen(false)}
                      onSelect={(r, c) => {
                        let header = "| " + Array(c).fill("제목").join(" | ") + " |\n";
                        let divider = "| " + Array(c).fill("---").join(" | ") + " |\n";
                        let row = "| " + Array(c).fill("내용").join(" | ") + " |\n";
                        let body = Array(r).fill(row).join("");
                        
                        // We need a way to insert text at cursor. The handlers.table doesn't take arguments.
                        // We will add a custom handler to page.tsx soon. For now we use handlers.insertTable(r, c) or handlers.insertText
                        if (handlers.insertText) {
                          handlers.insertText(`\n${header}${divider}${body}\n`);
                        }
                      }} 
                    />
                  </div>
                )}
              </div>
              <ToolbarButton label="💻" title={t('code')} onClick={() => handlers.code()} />
              <ToolbarButton label="Σ" title={t('latex')} onClick={() => handlers.latex()} />
            </ToolbarGroup>
          </div>
        )}
        
        {/* 여백 (좌측 정렬용) */}
        <div className="flex-1" />

        {/* 제어/보기 등 */}
        <div className="flex flex-row items-center gap-4 h-full">
          <ToolbarGroup label={t('groupText')}>
            <ToolbarButton label={<span className="font-bold">A-</span>} title={t('fontSmaller')} onClick={() => setFontSize(Math.max(10, fontSize - 1))} />
            <ToolbarButton label={<span className="font-bold text-xs">A+</span>} title={t('fontLarger')} onClick={() => setFontSize(Math.min(24, fontSize + 1))} />
            <ToolbarButton label={<span className={`text-[10px] font-bold ${wordWrap === 'on' ? 'text-blue-500' : ''}`}>Wrap</span>} title={t('wordWrap')} onClick={() => setWordWrap(wordWrap === 'on' ? 'off' : 'on')} />
          </ToolbarGroup>

          <ToolbarGroup label={t('groupSettings')}>
            <ToolbarButton label="⚙️" title={"환경 설정"} onClick={() => handlers.settings()} />
            <ToolbarButton label="❓" title={t('help')} onClick={() => handlers.helper()} />
          </ToolbarGroup>

          <ToolbarGroup label={t('groupOther')} showDivider={false}>
            <CopyPreviewButton 
              onClick={() => handlers.copyAll && handlers.copyAll()} 
              title={"전체 복사"} 
            />
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

function ToolbarButton({ label, title, onClick, bold, italic }: { label: string | React.ReactNode, title: string, onClick?: (e: any) => void, bold?: boolean, italic?: boolean }) {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick(e);
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
  handlers,
}: {
  headingLevel: number;
  handleHeadingUp: () => void;
  handleHeadingDown: () => void;
  handlers: any;
}) {
  return (
    <div className="flex items-center border border-emerald-500/20 dark:border-emerald-500/30 rounded bg-emerald-500/5 dark:bg-emerald-500/10 py-0.5 px-1.5 gap-1.5">
      <button 
        onClick={handleHeadingUp}
        disabled={headingLevel === 1}
        className="w-5 h-6 flex items-center justify-center rounded hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 text-[9px]"
        title="제목 크기 키우기 (H1 방향)"
      >
        ▲
      </button>
      <button 
        onClick={() => handlers[`h${headingLevel}`]?.()}
        className="w-7 h-6 flex items-center justify-center font-bold text-[11px] hover:bg-black/10 dark:hover:bg-white/10 rounded shrink-0"
        title={`제목 ${headingLevel} 적용`}
      >
        H{headingLevel}
      </button>
      <button 
        onClick={handleHeadingDown}
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
  onClick,
  title,
}: {
  onClick: () => void;
  title: string;
}) {
  return (
    <button 
      onClick={onClick}
      className="w-8 h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded shadow-md transition-all active:scale-95 flex items-center justify-center text-sm"
      title={title}
    >
      📋
    </button>
  );
}
