// ====================================================================
// 📊 [OMD-UI-PreviewToolbar-0001] PreviewToolbar ➔ PreviewToolbar
// 🎯 @KICK  : 미리보기(Preview) 전용 컨트롤러 — 텍스트 찾기, 배율 확대/축소(50%~200%), 100% 리셋 및 내용 복사 지원
// 🛡️ @GUARD : 인쇄 시 no-print로 자동 숨김 처리, 문서 가독성을 해치지 않도록 미세 투명도 및 호버 시 완전 노출
// 🚨 @PATCH : **2026-09-30** — [미리보기 전용 컨트롤 툴바 신규 개발]:
//             1. 🔍 찾기 (Ctrl+Shift+F)
//             2. ➖ 축소 (Ctrl+-), 🏷️ 배율 리셋 (Ctrl+0), ➕ 확대 (Ctrl+=)
//             3. 📋 클립보드 복사 원클릭 버튼 연동
// 🔗 @CALLS : ZoomIn, ZoomOut, RotateCcw, Search, Copy, Check
// ====================================================================
"use client";

import React, { useState } from "react";
import { ZoomIn, ZoomOut, Search, Copy, Check } from "lucide-react";

interface PreviewToolbarProps {
  zoomScale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onToggleFind: () => void;
  isFindOpen: boolean;
  onCopyPreview?: () => void;
}

export function PreviewToolbar({
  zoomScale,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onToggleFind,
  isFindOpen,
  onCopyPreview,
}: PreviewToolbarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (onCopyPreview) {
      onCopyPreview();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const percentage = Math.round(zoomScale * 100);

  return (
    <div
      aria-label="미리보기 제어 도구 모음"
      className="preview-toolbar-root no-print absolute top-3 right-4 z-40 flex items-center gap-0.5 p-1 bg-white/85 dark:bg-zinc-800/85 backdrop-blur-md border border-slate-200/90 dark:border-zinc-700/80 shadow-md rounded-xl text-slate-700 dark:text-zinc-200 opacity-70 hover:opacity-100 transition-opacity duration-200 select-none"
      style={{ fontFamily: "Pretendard, sans-serif" }}
    >
      {/* 🔍 텍스트 찾기 토글 버튼 */}
      <button
        type="button"
        onClick={onToggleFind}
        title="미리보기에서 찾기 (단축키: Ctrl + Shift + F)"
        className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
          isFindOpen
            ? "bg-blue-600 text-white font-semibold shadow-xs"
            : "hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200"
        }`}
      >
        <Search className="w-3.5 h-3.5" />
      </button>

      {/* 구분선 */}
      <div className="w-[1px] h-3.5 bg-slate-200 dark:bg-zinc-700 mx-0.5" />

      {/* ➖ 축소 버튼 */}
      <button
        type="button"
        onClick={onZoomOut}
        disabled={zoomScale <= 0.5}
        title="미리보기 축소 (단축키: Ctrl + -)"
        className="p-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
      >
        <ZoomOut className="w-3.5 h-3.5" />
      </button>

      {/* 🏷️ 배율 리셋 (100% 버튼) */}
      <button
        type="button"
        onClick={onZoomReset}
        title="원래 크기(100%)로 복귀 (단축키: Ctrl + 0)"
        className="px-1.5 py-0.5 rounded-md text-[11px] font-mono font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        {percentage}%
      </button>

      {/* ➕ 확대 버튼 */}
      <button
        type="button"
        onClick={onZoomIn}
        disabled={zoomScale >= 2.0}
        title="미리보기 확대 (단축키: Ctrl + =)"
        className="p-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
      >
        <ZoomIn className="w-3.5 h-3.5" />
      </button>

      {/* 복사 버튼 */}
      {onCopyPreview && (
        <>
          <div className="w-[1px] h-3.5 bg-slate-200 dark:bg-zinc-700 mx-0.5" />
          <button
            type="button"
            onClick={handleCopy}
            title={copied ? "복사 완료!" : "미리보기 본문 복사"}
            className="p-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-colors flex items-center gap-1"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </>
      )}
    </div>
  );
}
