"use client";

import React, { useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDanger?: boolean;
}

export default function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  confirmText = "확인", 
  cancelText = "취소", 
  onConfirm, 
  onCancel,
  isDanger = false
}: ConfirmModalProps) {
  
  // Enter or Escape Key Down
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onConfirm, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className={isDanger ? "text-red-500" : "text-blue-500"} />
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">{title}</h3>
          </div>
          <button 
            onClick={onCancel}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {message}
          </p>
          
          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-5 py-2.5 ${
                isDanger 
                ? 'bg-red-600 hover:bg-red-500 shadow-red-500/20' 
                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'
              } text-white text-xs font-bold rounded-xl shadow-lg transition-all active:scale-95`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
