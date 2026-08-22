"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface PromptModalProps {
  isOpen: boolean;
  title: string;
  defaultValue?: string;
  placeholder?: string;
  error?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

// ====================================================================
// 📊 [OMD-IO-PromptModal-0004] PromptModal ➔ PromptModal
// 🎯 @KICK  : 사용자 입력을 받는 모달 다이얼로그 - 파일명/폴더명 입력 등
// 🛡️ @GUARD : isOpen/mounted false 시 null 반환; Escape 키로 취소
// 🚨 @PATCH : **2026-08-23** — ConfirmModal과 동일한 스타일로 통일: 상단 코너 회색 제거(rounded-t-xl), Dim 35% 완화, 다층 입체 그림자, 제목 내 파일명 따옴표 강조 표시
// 🔗 @CALLS : handleSubmit, handleKeyDown, onConfirm, onCancel
// ====================================================================
export default function PromptModal({ 
  isOpen, 
  title, 
  defaultValue = "", 
  placeholder = "", 
  error = "",
  onConfirm, 
  onCancel 
}: PromptModalProps) {
  const [value, setValue] = useState(defaultValue);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

// ====================================================================
// 📊 [OMD-IO-PromptModal-0003] PromptModal ➔ useEffect (mounted)
// 🎯 @KICK  : 클라이언트 마운트 완료 상태를 설정하여 hydration mismatch 방지
// 🛡️ @GUARD : 없음
// 🚨 @PATCH : 없음
// 🔗 @CALLS : setMounted
// ====================================================================
  useEffect(() => {
    setMounted(true);
  }, []);

// ====================================================================
// 📊 [OMD-IO-PromptModal-0002] PromptModal ➔ useEffect (focus)
// 🎯 @KICK  : 모달이 열릴 때 입력창에 defaultValue 설정 후 자동 포커스
// 🛡️ @GUARD : isOpen이 true일 때만 실행
// 🚨 @PATCH : 없음
// 🔗 @CALLS : setValue, inputRef.current.focus, inputRef.current.select
// ====================================================================
  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 10);
    }
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;
  if (!mounted) return null;

// ====================================================================
// 📊 [OMD-IO-PromptModal-0001] PromptModal ➔ handleSubmit
// 🎯 @KICK  : 폼 제출 시 입력값을 onConfirm으로 전달
// 🛡️ @GUARD : 없음
// 🚨 @PATCH : 없음
// 🔗 @CALLS : onConfirm
// ====================================================================
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onCancel();
  };

  // 제목 내 따옴표/대괄호로 감싸진 항목명 강조 처리
  const renderTitle = (t: string) => {
    const parts = t.split(/(\[.*?\]|'.*?')/g);
    return parts.map((part, i) =>
      (part.startsWith('[') && part.endsWith(']')) || (part.startsWith("'") && part.endsWith("'")) ? (
        <span key={i} className="font-bold text-blue-600 dark:text-blue-400">{part}</span>
      ) : part
    );
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 animate-in fade-in duration-200"
      style={{ overflowY: "auto", backgroundColor: "rgba(0,0,0,0.35)" }}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl border border-black/8 dark:border-white/10 animate-in zoom-in-95 duration-200 flex flex-col"
        style={{
          maxHeight: "90dvh",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07), 0 10px 24px -4px rgba(0,0,0,0.14), 0 32px 64px -12px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)"
        }}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 dark:border-white/5 rounded-t-xl shrink-0">
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">{renderTitle(title)}</h3>
          <button 
            onClick={onCancel}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto min-h-0 px-5 py-5">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className={`w-full px-4 py-2.5 bg-gray-100 dark:bg-white/5 border rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
              error ? 'border-red-500 ring-1 ring-red-500/50' : 'border-black/5 dark:border-white/10'
            }`}
            autoComplete="off"
          />
          
          {error && (
            <p className="mt-2 text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
              {error}
            </p>
          )}
          
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-95"
            >
              확인
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
