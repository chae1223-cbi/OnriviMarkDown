"use client";

import React, { useEffect, useState, MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { X, BookOpen, ChevronRight } from 'lucide-react';
import MarkdownViewer from '@/components/MarkdownViewer';
import { stripFrontmatter } from "@/lib/editorUtils";

// 💡 하드코딩된 도움말 파일 목록
const HELP_DOCS_LIST = [
  "00_시작하기.md",
  "01_마크다운에디트란.md",
  "02_에디터-기본.md",
  "03_파일-관리.md",
  "04_미리보기-모드.md",
  "05_서식-정의.md",
  "06_내보내기.md",
  "07_표-체크리스트.md",
  "08_다이어그램-수식.md",
  "09_슬래시-명령어.md",
  "10_한글-입력.md",
  "11_미디어-삽입.md",
  "12_내보내기-고급.md",
  "13_설정.md"
];

// 파일명에서 "00_시작하기.md" -> "시작하기" 로 표시용 제목 추출
const formatDocTitle = (filename: string) => {
  return filename.replace(/^\d+_/, '').replace(/\.md$/, '').replace(/-/g, ' ');
};

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  content?: string; // 이제 사용하지 않지만 하위호환을 위해 남겨둠
  isDarkMode: boolean;
}

export default function HelpModal({ isOpen, onClose, title = "도움말 센터", isDarkMode }: HelpModalProps) {
  const [mounted, setMounted] = useState(false);
  const [currentDoc, setCurrentDoc] = useState<string>(HELP_DOCS_LIST[0]);
  const [docContent, setDocContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 문서 로딩
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchDoc = async () => {
      setIsLoading(true);
      const api = (window as any).electronAPI;
      let rawMd = '';
      
      try {
        if (api?.readFromPath) {
          const file = await api.readFromPath(`help/${currentDoc}`);
          rawMd = file.content;
        } else {
          const res = await fetch(`/help/${currentDoc}`);
          if (!res.ok) throw new Error('Not found');
          rawMd = await res.text();
        }
      } catch (e) {
        rawMd = '## 문서를 불러올 수 없습니다.\n\n해당 도움말 파일을 찾을 수 없습니다.';
      }

      if (isMounted) {
        setDocContent(stripFrontmatter(rawMd));
        setIsLoading(false);
      }
    };

    fetchDoc();
    return () => { isMounted = false; };
  }, [currentDoc, isOpen]);

  // 내부 링크 클릭 인터셉트
  const handleLinkClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href) return;

    // 상대 경로 마크다운 링크인 경우 (예: ./03_파일-관리.md 또는 01_마크다운에디트란.md)
    if (href.endsWith('.md') && !href.startsWith('http')) {
      e.preventDefault();
      // 파일명만 추출
      const filename = href.split('/').pop();
      if (filename && HELP_DOCS_LIST.includes(filename)) {
        setCurrentDoc(filename);
      }
    } else if (href.startsWith('http')) {
      // 외부 링크인 경우 데스크탑 앱은 외부 브라우저로 띄움
      const api = (window as any).electronAPI;
      if (api?.openExternal) {
        e.preventDefault();
        api.openExternal(href);
      }
    }
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm transition-opacity ${isDarkMode ? 'dark' : ''}`} style={{ overflowY: "auto" }}>
      <div 
        className="w-full max-w-6xl bg-white dark:bg-zinc-950 rounded-xl shadow-2xl flex flex-col ring-1 ring-black/5 dark:ring-white/10 animate-in fade-in zoom-in-95 duration-200"
        style={{ maxHeight: "90dvh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
          <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            <BookOpen size={22} className="text-blue-500" />
            {title}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
            title="닫기 (ESC)"
          >
            <X size={20} />
          </button>
        </div>

        {/* 2-Pane 레이아웃 */}
        <div className="flex flex-1 overflow-hidden">
          {/* 좌측 네비게이션 메뉴 */}
          <div className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 overflow-y-auto shrink-0 py-4 px-3 flex flex-col gap-1">
            {HELP_DOCS_LIST.map((doc) => {
              const isSelected = currentDoc === doc;
              return (
                <button
                  key={doc}
                  onClick={() => setCurrentDoc(doc)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isSelected 
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 shadow-sm' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <span className="truncate">{formatDocTitle(doc)}</span>
                  {isSelected && <ChevronRight size={16} className="text-blue-500 opacity-70 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* 우측 마크다운 뷰어 */}
          <div 
            className="flex-1 overflow-y-auto p-8 md:p-12 bg-white dark:bg-zinc-950 scroll-smooth"
            onClick={handleLinkClick}
          >
            {isLoading ? (
              <div className="animate-pulse flex flex-col gap-4 max-w-3xl">
                <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3 mb-6"></div>
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6"></div>
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-4/6"></div>
              </div>
            ) : (
              <div className="prose prose-zinc dark:prose-invert max-w-none">
                <MarkdownViewer 
                  content={docContent || "도움말 내용이 없습니다."}
                />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
