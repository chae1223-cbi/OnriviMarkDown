// ====================================================================
// 📊 [OMD-EDIT-Toolbar-0003] Toolbar.tsx ➔ Toolbar
// 🎯 @KICK  : 에디터 우측 사이드바 툴바 - 홈, 대시보드, 지식베이스, 서식, 참조, 환경설정 퀵 액션 제공
// 🛡️ @GUARD : 라이선스 및 뷰포트 상태에 따른 프로덕티비티 도구 조건부 노출
// 🚨 @PATCH : **2026-09-05** — 제한모드(isRestrictedUser) 시 우측 툴바의 지식 베이스 전환 버튼(🏛️) 비활성화(disabled, opacity-30, grayscale, 안내 툴팁 및 토스트) 적용
//             **2026-09-05** — AI 미연결(!geminiApiKey) 시 우측 툴바의 지식 베이스 전환 버튼(🏛️) 비활성화(disabled, 흐린 흑백 스타일, 연동 안내 툴팁/토스트) 적용
//             **2026-09-04** — 우측 툴바의 지식 베이스 아이콘을 🏛️로 변경 연동 (클릭 시 app:open-knowledge-manager 이벤트 디스패치)
// 🔗 @CALLS : useEditorContext, useRouter
// ====================================================================
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
  const { dispatchCommand: dispatch, previewMode, isExpired, activeTabId, geminiApiKey, showToast, isRestrictedUser } = useEditorContext();
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
        title="Onrivi Author 홈으로"
      >
        <img src="./icon.png" alt="Onrivi" className="w-4 h-4 object-contain" />
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

      {/* 🏛️ 지식 베이스 화면 전환 (제한 모드 또는 AI 미연결 시 비활성화) */}
      {(() => {
        const isKnowledgeDisabled = Boolean(isRestrictedUser || !geminiApiKey);
        const disabledReasonTitle = isRestrictedUser
          ? "🔒 읽기 전용(제한사용자) 모드에서는 지식 베이스 화면으로 이동할 수 없습니다."
          : (!geminiApiKey ? "지식 베이스 화면 전환 (AI 연동 필요)" : "지식 베이스 화면으로 전환 (Ctrl+Shift+K)");

        return (
          <button
            disabled={isKnowledgeDisabled}
            onMouseDown={(e) => {
              e.preventDefault();
              if (isRestrictedUser) {
                showToast?.("🔒 읽기 전용(제한사용자) 모드에서는 지식 베이스 화면으로 이동할 수 없습니다. 상단 '이 화면에서 편집 시작하기'를 눌러주세요.", "warning");
                return;
              }
              if (!geminiApiKey) {
                showToast?.('지식 엔진을 사용하려면 환경설정에서 Gemini API Key를 먼저 등록해 주세요.', 'warning');
                return;
              }
              window.dispatchEvent(new CustomEvent('app:open-knowledge-manager'));
            }}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all text-base ${
              isKnowledgeDisabled
                ? 'opacity-30 cursor-not-allowed grayscale text-zinc-400 dark:text-zinc-600'
                : 'hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer'
            }`}
            title={disabledReasonTitle}
          >
            <span className="text-zinc-500 dark:text-zinc-400 text-base">🏛️</span>
          </button>
        );
      })()}

      <button
        onMouseDown={(e) => { e.preventDefault(); dispatch('TOGGLE_CSS_STYLE'); }}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all text-base"
        title="서식관리"
      >
        <span className="text-zinc-500 dark:text-zinc-400">🎨</span>
      </button>

      <button
        onMouseDown={(e) => { e.preventDefault(); dispatch('ADD_REFERENCE'); }}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all text-base"
        title="참조 파일 관리"
      >
        <span className="text-zinc-500 dark:text-zinc-400">📚</span>
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
