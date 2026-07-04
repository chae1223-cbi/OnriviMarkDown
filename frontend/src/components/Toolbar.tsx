"use client";

import React from 'react';
import { Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ToolbarProps {
  dispatch: (type: any) => void;
}

function openExternal(url: string) {
  if ((window as any).electronAPI?.openExternal) {
    (window as any).electronAPI.openExternal(url);
  } else {
    window.open(url, '_blank');
  }
}

export default function Toolbar({ dispatch }: ToolbarProps) {
  const router = useRouter();

  return (
    <div className="h-full w-14 flex flex-col items-center py-3 px-1 z-30 text-zinc-700 dark:text-zinc-300 overflow-y-auto overflow-x-hidden shrink-0 bg-zinc-50 dark:bg-zinc-900/50">
      <div className="flex-1 min-h-[8px]" />

      <div className="w-10 border-t-2 border-zinc-300 dark:border-zinc-700/60 mb-2" />

      <button
        onMouseDown={(e) => {
          e.preventDefault();
          const isDesktop = typeof window !== "undefined" && (
            !!(window as any).electronAPI || 
            navigator.userAgent.toLowerCase().includes('electron') ||
            new URLSearchParams(window.location.search).get('env') === 'desktop'
          );
          if (isDesktop) {
            openExternal('https://onrivi.com/');
          } else {
            router.push('/');
          }
        }}
        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all"
        title="온리비 어서 홈으로"
      >
        <img src="./icon.png" alt="온리비" className="w-5 h-5 object-contain" />
      </button>

      <button 
        onMouseDown={(e) => {
          e.preventDefault();
          const isDesktop = typeof window !== "undefined" && (
            !!(window as any).electronAPI || 
            navigator.userAgent.toLowerCase().includes('electron') ||
            new URLSearchParams(window.location.search).get('env') === 'desktop'
          );
          if (isDesktop) {
            openExternal('https://onrivi.com/dashboard');
          } else {
            router.push('/dashboard');
          }
        }}
        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all text-base"
        title="대시보드 이동"
      >
        <span className="text-zinc-500 dark:text-zinc-400 text-lg">🔠</span>
      </button>

      <button 
        onMouseDown={(e) => { e.preventDefault(); dispatch('SETTINGS'); }}
        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all"
        title="환경 설정"
      >
        <Settings size={18} className="text-zinc-500 dark:text-zinc-400" />
      </button>

      <div className="w-10 border-t-2 border-zinc-300 dark:border-zinc-600/60 my-1" />

      <button 
        onMouseDown={(e) => { e.preventDefault(); dispatch('EXIT'); }}
        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-all"
        title="로그아웃"
      >
        <span className="text-xl">🚪</span>
      </button>
    </div>
  );
}
