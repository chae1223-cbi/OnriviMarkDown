"use client";

import React from 'react';
import { X } from 'lucide-react';
import OAIcon from '../app/icon_onriveauther.png';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  licenseKey: string;
  setLicenseKey: (v: string) => void;
  isActivated: boolean;
}

export default function AboutModal({
  isOpen,
  onClose,
  isDarkMode,
  licenseKey,
  setLicenseKey,
  isActivated
}: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose}>
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

        <div className="p-6 text-center space-y-5">
          <div className="flex items-center justify-center gap-3">
            <img src={OAIcon.src} alt="온리비 어서 브랜드 아이콘" className="w-12 h-12 object-contain" />
            <h3 className="text-xl font-bold">온리비 어서</h3>
          </div>
          
          <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold border ${
            isDarkMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-200'
          }`}>
            v1.2.0-beta
          </div>

          <div className="pt-4 border-t border-black/5 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs px-2">
              <span className="opacity-70">라이선스 상태:</span>
              {isActivated ? (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  정품 인증됨
                </span>
              ) : (
                <span className="text-[10px] text-rose-600 dark:text-rose-400 font-extrabold px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 animate-pulse">
                  체험판 (인증 필요)
                </span>
              )}
            </div>

            <div className="space-y-1 text-left px-2">
              <label className="text-[10px] opacity-60 font-bold">정품 라이선스 키 등록</label>
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => {
                  setLicenseKey(e.target.value);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('onrivi_license_key', e.target.value);
                    const chromeStorage = (window as any).chrome?.storage?.local;
                    if (chromeStorage) {
                      chromeStorage.set({ onrivi_license_key: e.target.value });
                    }
                    const api = (window as any).electronAPI;
                    if (api && typeof api.saveLicense === 'function') {
                      api.saveLicense(e.target.value);
                    }
                  }
                }}
                className={`w-full px-3 py-1.5 text-xs font-mono rounded border outline-none focus:ring-1 focus:ring-blue-500 shadow-sm ${
                  isDarkMode 
                    ? 'bg-zinc-800 border-white/10 text-white' 
                    : 'bg-zinc-50 border-black/10 text-black'
                }`}
                placeholder="인증 키를 입력하세요"
              />
              <p className="text-[9px] opacity-50 mt-1">
                * 올바른 정품 라이선스 키를 입력하시면 고급 내보내기 등 모든 기능이 즉시 활성화됩니다.
              </p>
            </div>
          </div>

          <p className="text-[10px] text-gray-500 dark:text-gray-400 pt-2 border-t border-black/5 dark:border-white/10">
            © 2024 Onrivi. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}