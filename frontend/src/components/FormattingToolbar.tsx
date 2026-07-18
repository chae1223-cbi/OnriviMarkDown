"use client";

import React from 'react';
import { Eraser, Sparkles } from 'lucide-react';

import { useEditorContext } from '@/context/EditorContext';

const SHORTCUTS: Record<string, string> = {
  bold: 'Ctrl+B',
  italic: 'Ctrl+I',
  inlineCode: 'Ctrl+E',
  underline: 'Ctrl+U',
  strikethrough: 'Ctrl+Shift+X',
  footnote: 'Ctrl+Alt+F',
  hr: 'Ctrl+Alt+-',
  orderedList: 'Ctrl+Shift+7',
  list: 'Ctrl+Shift+8',
  quote: 'Ctrl+Q',
  check: 'Ctrl+Shift+C',
  eraser: 'Ctrl+Shift+X',
  cleanDoc: 'Ctrl+Shift+L',
  link: 'Ctrl+K',
  table: 'Ctrl+T',
  code: 'Ctrl+Shift+E',
  math: 'Ctrl+M',
};

const tooltip = (label: string, shortcut?: string) =>
  shortcut ? `${label} (${shortcut})` : label;

export default function FormattingToolbar() {
  const { dispatchCommand: dispatch, previewMode, isExpired, geminiApiKey, showToast } = useEditorContext();
  const [headingLevel, setHeadingLevel] = React.useState(3);

  const handleHeadingUp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (headingLevel > 1) setHeadingLevel(prev => prev - 1);
  };

  const handleHeadingDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (headingLevel < 6) setHeadingLevel(prev => prev + 1);
  };

  if (previewMode === 'preview') return null;

  return (
    <div className="h-10 flex items-center px-2 gap-1 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl border-b border-black/5 dark:border-white/5 shrink-0 overflow-x-auto z-10 transition-colors duration-300">
      {/* AI 글쓰기 단독 버튼 */}
      <FormatBtn
        label={<Sparkles size={15} className={geminiApiKey ? "text-purple-500 animate-pulse" : "text-slate-400 dark:text-zinc-500"} />}
        title={geminiApiKey ? "AI 글쓰기 팝업 어시스턴트" : "AI 글쓰기 (설정에서 API 키를 등록해 주세요)"}
        onAction={() => {
          if (!geminiApiKey) {
            showToast("AI 기능을 사용하려면 설정에서 Gemini API Key를 등록해 주세요.", "warning");
            dispatch('SETTINGS');
            return;
          }
          dispatch('OPEN_AI_WRITER');
        }}
      />
      <Divider />

      {/* 서식 */}
      <FormatBtn label="B" title={tooltip('굵게', SHORTCUTS.bold)} onAction={() => dispatch('BOLD')} bold />
      <FormatBtn label="I" title={tooltip('기울임', SHORTCUTS.italic)} onAction={() => dispatch('ITALIC')} italic />
      <FormatBtn label="</>" title={tooltip('인라인 코드', SHORTCUTS.inlineCode)} onAction={() => dispatch('INLINE_CODE')} />
      <FormatBtn label="U" title={tooltip('밑줄', SHORTCUTS.underline)} onAction={() => dispatch('UNDERLINE')} underline />
      <FormatBtn label={<span className="line-through">S</span>} title={tooltip('취소선', SHORTCUTS.strikethrough)} onAction={() => dispatch('STRIKETHROUGH')} />
      <FormatBtn label="fn" title={tooltip('각주', SHORTCUTS.footnote)} onAction={() => dispatch('FOOTNOTE')} />

      <Divider />

      {/* 제목 */}
      <div className="flex items-center border border-emerald-500/20 dark:border-emerald-500/30 rounded bg-emerald-500/5 dark:bg-emerald-500/10 px-1">
        <button onMouseDown={handleHeadingUp} disabled={headingLevel === 1}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 text-[11px]" title="제목 크기 키우기">▲</button>
        <button onMouseDown={(e) => { e.preventDefault(); dispatch(`H${headingLevel}`); }}
          className="w-7 h-7 flex items-center justify-center font-bold text-[13px] hover:bg-black/10 dark:hover:bg-white/10 rounded" title={`제목 ${headingLevel} 적용`}>H{headingLevel}</button>
        <button onMouseDown={handleHeadingDown} disabled={headingLevel === 6}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 text-[11px]" title="제목 크기 줄이기">▼</button>
      </div>

      <Divider />

      {/* 문서/구분선 */}
      <FormatBtn label="—" title={tooltip('구분선', SHORTCUTS.hr)} onAction={() => dispatch('HR')} />
      <FormatBtn label="🔢" title={tooltip('숫자 목록', SHORTCUTS.orderedList)} onAction={() => dispatch('ORDERED_LIST')} />
      <FormatBtn label="☰" title={tooltip('글머리 기호', SHORTCUTS.list)} onAction={() => dispatch('LIST')} />
      <FormatBtn label="❝" title={tooltip('인용구', SHORTCUTS.quote)} onAction={() => dispatch('QUOTE')} />
      <FormatBtn label="☑️" title={tooltip('체크리스트', SHORTCUTS.check)} onAction={() => dispatch('CHECK')} />
      <FormatBtn label={<Eraser size={15} className="text-red-500 opacity-80" />} title={tooltip('태그 취소', SHORTCUTS.eraser)} onAction={() => dispatch('REMOVE_PREFIX')} />
      <FormatBtn label="✨" title={tooltip('문서 서식 일괄 정리', SHORTCUTS.cleanDoc)} onAction={() => dispatch('CLEAN_DOC')} />

      <Divider />

      {/* 링크/미디어 */}
      <FormatBtn label="🔗" title={tooltip('링크', SHORTCUTS.link)} onAction={() => dispatch('LINK')} />
      <FormatBtn label="🔖" title="문서 연결" onAction={() => dispatch('DOCLINK')} />
      <FormatBtn label="🖼️" title="이미지" onAction={() => dispatch('IMAGE')} />
      <FormatBtn label="🎞️" title="동영상삽입" onAction={() => dispatch('YOUTUBE')} />
      <FormatBtn label="📅" title="현재 날짜/시간" onAction={() => dispatch('NOW')} />

      <Divider />

      {/* 고급/코드 */}
      <FormatBtn label="🌏" title="지도 삽입" onAction={() => dispatch('MAP')} />
      <FormatBtn label="📶" title={tooltip('표 생성', SHORTCUTS.table)} onAction={() => dispatch('TABLE')} />
      <FormatBtn label="⌨️" title={tooltip('코드 블록', SHORTCUTS.code)} onAction={() => dispatch('CODE')} />
      <FormatBtn label="🧮" title={tooltip('수식(LaTeX)', SHORTCUTS.math)} onAction={() => dispatch('LATEX')} />
    </div>
  );
}

function FormatBtn({ label, title, onAction, bold, italic, underline }: {
  label: string | React.ReactNode;
  title: string;
  onAction?: (e: any) => void;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onAction?.(e); }}
      className={`w-8 h-8 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-all flex items-center justify-center text-[16px] shrink-0 ${bold ? 'font-black' : ''} ${italic ? 'italic font-serif' : ''} ${underline ? 'underline' : ''}`}
      title={title}
    >
      {label}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-600/60 mx-1 shrink-0" />;
}
