"use client";

import React from 'react';
import { X } from 'lucide-react';
import OAIcon from '../app/icon_onriveauther.png';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export default function AboutModal({ isOpen, onClose, isDarkMode }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose}>
      <div
        className={`relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border animate-in zoom-in-95 duration-200 ${
          isDarkMode ? 'bg-zinc-900 border-white/10' : 'bg-white border-black/5'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between px-5 py-4 border-b ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
          <div className="flex items-center gap-2">
            <img src={OAIcon.src} alt="Logo" className="w-4 h-4 object-contain" />
            <h2 className="text-sm font-bold">프로그램 정보</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
            <X size={16} className="opacity-50" />
          </button>
        </div>

        <div className="p-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <img src={OAIcon.src} alt="온리비 어서 브랜드 아이콘" className="w-12 h-12 object-contain" />
            <h3 className="text-xl font-bold">온리비 어서</h3>
          </div>
          
          <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold border ${
            isDarkMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-200'
          }`}>
            v1.2.0-beta
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 Onrivi. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}