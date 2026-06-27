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
// 🚨 @PATCH : 없음
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

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-200"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">{title}</h3>
          <button 
            onClick={onCancel}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5">
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
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-blue-500/20 transition-all active:scale-95"
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
