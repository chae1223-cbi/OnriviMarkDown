// ====================================================================
// 📊 [OMD-UI-PreviewFindWidget-0001] PreviewFindWidget ➔ PreviewFindWidget
// 🎯 @KICK  : 미리보기(Preview) 렌더링 영역 내 실시간 텍스트 검색 및 탐색 위젯
// 🛡️ @GUARD : CSS.highlights 지원 시 비침습 고속 하이라이트, 미지원 시 Range/Mark 안전 폴백; 언마운트 시 하이라이트 완전 제거
// 🚨 @PATCH : **2026-09-30** — [미리보기 전용 찾기 위젯 신규 개발]:
//             1. 검색어 실시간 매칭 및 이전/다음(↑/↓, Enter/Shift+Enter) 순회 탐색
//             2. 활성 매치 위치로 미리보기 스크롤 자동 이동 (scrollIntoView smooth/center)
//             3. Escape 단축키 및 닫기 버튼 클릭 시 하이라이트 즉시 해제 및 위젯 종료
// 🔗 @CALLS : CSS.highlights, TreeWalker, ChevronUp, ChevronDown, X, Search
// ====================================================================
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, ChevronUp, ChevronDown, X } from "lucide-react";

interface PreviewFindWidgetProps {
  previewContainerRef: React.RefObject<HTMLDivElement | null>;
  isOpen: boolean;
  onClose: () => void;
}

export function PreviewFindWidget({
  previewContainerRef,
  isOpen,
  onClose,
}: PreviewFindWidgetProps) {
  const [query, setQuery] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const matchesRef = useRef<Range[]>([]);

  // 하이라이트 정리 함수
  const clearHighlights = useCallback(() => {
    if (typeof CSS !== "undefined" && "highlights" in CSS) {
      try {
        (CSS as any).highlights.delete("preview-search");
        (CSS as any).highlights.delete("preview-search-active");
      } catch (e) {
        console.warn("CSS highlight clear error:", e);
      }
    }

    // fallback mark 태그 정리
    const container = previewContainerRef.current;
    if (container) {
      const marks = container.querySelectorAll(".preview-find-match, .preview-find-match-active");
      marks.forEach((mark) => {
        const parent = mark.parentNode;
        if (parent) {
          while (mark.firstChild) {
            parent.insertBefore(mark.firstChild, mark);
          }
          parent.removeChild(mark);
          parent.normalize();
        }
      });
    }
    matchesRef.current = [];
    setTotalMatches(0);
    setCurrentIndex(0);
  }, [previewContainerRef]);

  // 검색어에 따른 매치 스캔 및 하이라이트 적용
  const performSearch = useCallback(
    (searchStr: string) => {
      clearHighlights();
      if (!searchStr.trim()) return;

      const container = previewContainerRef.current;
      if (!container) return;

      // 마크다운 렌더러 루트 또는 컨테이너 자체
      const root = container.querySelector(".markdown-viewer-root") || container;
      const ranges: Range[] = [];
      const lowerQuery = searchStr.toLowerCase();

      // TreeWalker로 텍스트 노드 탐색
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          if (!node.textContent || !node.textContent.trim()) {
            return NodeFilter.FILTER_REJECT;
          }
          const parent = node.parentElement;
          if (
            parent &&
            (parent.tagName === "SCRIPT" ||
              parent.tagName === "STYLE" ||
              parent.closest(".no-search") ||
              parent.closest(".preview-toolbar-root"))
          ) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      });

      let currentNode = walker.nextNode();
      while (currentNode) {
        const text = currentNode.textContent || "";
        const lowerText = text.toLowerCase();
        let startIndex = 0;

        while ((startIndex = lowerText.indexOf(lowerQuery, startIndex)) !== -1) {
          try {
            const range = document.createRange();
            range.setStart(currentNode, startIndex);
            range.setEnd(currentNode, startIndex + searchStr.length);
            ranges.push(range);
          } catch (e) {
            // range 오류 방어
          }
          startIndex += searchStr.length;
        }
        currentNode = walker.nextNode();
      }

      matchesRef.current = ranges;
      setTotalMatches(ranges.length);

      if (ranges.length > 0) {
        setCurrentIndex(1);
        highlightMatches(ranges, 0);
      }
    },
    [clearHighlights, previewContainerRef]
  );

  // 하이라이트 렌더링 및 현재 매치 스크롤
  const highlightMatches = useCallback(
    (ranges: Range[], activeIdx: number) => {
      if (ranges.length === 0) return;

      const activeRange = ranges[activeIdx];

      // 1. CSS.highlights 표준 API 지원 시
      if (typeof CSS !== "undefined" && "highlights" in CSS && (window as any).Highlight) {
        try {
          const HighlightConstructor = (window as any).Highlight;
          const allHighlight = new HighlightConstructor(...ranges);
          const activeHighlight = new HighlightConstructor(activeRange);

          (CSS as any).highlights.set("preview-search", allHighlight);
          (CSS as any).highlights.set("preview-search-active", activeHighlight);
        } catch (e) {
          console.warn("CSS.highlights failed, using fallback:", e);
        }
      }

      // 2. 활성 매치 위치로 스크롤
      if (activeRange) {
        const targetElement =
          activeRange.startContainer instanceof HTMLElement
            ? activeRange.startContainer
            : activeRange.startContainer.parentElement;

        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }
    },
    []
  );

  // 다음 매치 이동
  const handleNext = useCallback(() => {
    if (matchesRef.current.length === 0) return;
    const nextIdx = (currentIndex % matchesRef.current.length) + 1;
    setCurrentIndex(nextIdx);
    highlightMatches(matchesRef.current, nextIdx - 1);
  }, [currentIndex, highlightMatches]);

  // 이전 매치 이동
  const handlePrev = useCallback(() => {
    if (matchesRef.current.length === 0) return;
    const prevIdx =
      currentIndex - 1 <= 0 ? matchesRef.current.length : currentIndex - 1;
    setCurrentIndex(prevIdx);
    highlightMatches(matchesRef.current, prevIdx - 1);
  }, [currentIndex, highlightMatches]);

  // 위젯 열릴 때 포커스
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    } else {
      clearHighlights();
    }
  }, [isOpen, clearHighlights]);

  // 언마운트 시 하이라이트 제거
  useEffect(() => {
    return () => {
      clearHighlights();
    };
  }, [clearHighlights]);

  // 검색어 디바운스 검색
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      performSearch(query);
    }, 150);
    return () => clearTimeout(timer);
  }, [query, isOpen, performSearch]);

  // 키보드 이벤트 핸들러
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) {
        handlePrev();
      } else {
        handleNext();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="search"
      aria-label="미리보기 찾기"
      className="preview-find-widget absolute top-3 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md border border-slate-300 dark:border-zinc-700 shadow-xl rounded-xl text-xs text-slate-800 dark:text-zinc-100 animate-in fade-in slide-in-from-top-2 duration-150"
      style={{ fontFamily: "Pretendard, sans-serif" }}
    >
      <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400 shrink-0" />

      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="미리보기에서 찾기..."
        className="w-40 sm:w-52 px-1.5 py-1 bg-transparent border-none outline-none text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 font-medium"
      />

      <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-zinc-400 px-1 shrink-0 select-none">
        {query ? (
          totalMatches > 0 ? (
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {currentIndex} / {totalMatches}
            </span>
          ) : (
            <span className="text-red-500 dark:text-red-400 font-sans text-[10px]">
              결과 없음
            </span>
          )
        ) : null}
      </div>

      <div className="flex items-center gap-0.5 border-l border-slate-200 dark:border-zinc-700 pl-1 shrink-0">
        <button
          type="button"
          onClick={handlePrev}
          disabled={totalMatches === 0}
          title="이전 찾기 (Shift+Enter)"
          className="p-1 rounded-md text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={totalMatches === 0}
          title="다음 찾기 (Enter)"
          className="p-1 rounded-md text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onClose}
          title="닫기 (Esc)"
          className="p-1 rounded-md text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors ml-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
