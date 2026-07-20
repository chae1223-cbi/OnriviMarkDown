"use client";

import React from 'react';
import { Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEditorContext } from '@/context/EditorContext';

function openExternal(url: string) {
  if ((window as any).electronAPI?.openExternal) {
    (window as any).electronAPI.openExternal(url);
  } else {
    window.open(url, '_blank');
  }
}

export default function Toolbar() {
  const { dispatchCommand: dispatch, previewMode, isExpired, activeTabId, geminiApiKey, showToast } = useEditorContext();
  const router = useRouter();
  const showProductivity = previewMode !== 'preview' && !isExpired && activeTabId;

  return (
    <div className="flex flex-col items-center gap-2 pb-1 mt-auto">
      
      {/* ⚡ 생산성 단축 도구 (미리보기 모드/라이선스 만료 시 숨김/문서 열려있을때만) */}
      {showProductivity && (
        <>
          <button
            onMouseDown={(e) => { e.preventDefault(); dispatch('TOGGLE_FLOATING_TOOLBAR'); }}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all text-base"
            title="플로팅 서식 툴바 켜기/끄기"
          >
            <span className="text-zinc-500 dark:text-zinc-400">🎈</span>
          </button>
          
          <button
            onMouseDown={(e) => { e.preventDefault(); dispatch('SLASH_COMMAND'); }}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all text-base"
            title="슬래시(/) 빠른 명령어 호출"
          >
            <span className="text-zinc-500 dark:text-zinc-400">⚡</span>
          </button>


        </>
      )}

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
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all"
        title="온리비 어서 홈으로"
      >
        <img src="./icon.png" alt="온리비" className="w-4 h-4 object-contain" />
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
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all text-base"
        title="대시보드 이동"
      >
        <span className="text-zinc-500 dark:text-zinc-400 text-sm">🔠</span>
      </button>

      <button
        onMouseDown={(e) => { e.preventDefault(); dispatch('TOGGLE_CSS_STYLE'); }}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all text-base"
        title="서식관리"
      >
        <span className="text-zinc-500 dark:text-zinc-400">🎨</span>
      </button>

      <button 
        onMouseDown={(e) => { e.preventDefault(); dispatch('SETTINGS'); }}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all"
        title="환경 설정"
      >
        <Settings size={16} className="text-zinc-500 dark:text-zinc-400" />
      </button>

      <div className="w-5 h-px bg-zinc-300 dark:bg-zinc-600/60 my-1" />

      {!((window as any).electronAPI) && (
        <button 
          onMouseDown={(e) => { e.preventDefault(); dispatch('EXIT'); }}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-all"
          title="로그아웃"
        >
          <span className="text-base">🚪</span>
        </button>
      )}
    </div>
  );
}
