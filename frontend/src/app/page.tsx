"use client";

import dynamic from 'next/dynamic';

const MainEditorApp = dynamic(() => import('@/components/MainEditorApp'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-zinc-950 text-slate-500 font-sans select-none">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-sm font-medium">온리비 어서 로딩 중...</div>
      </div>
    </div>
  )
});

/**
 * [ONR-02-001] Page 컴포넌트 함수
 * @description Next.js의 클라이언트 진입 페이지 컴포넌트입니다. SSR 비활성화 모드 하에서 MainEditorApp을 동적으로 불러와 렌더링을 지시합니다.
 */
export default function Page() {
  return <MainEditorApp />;
}
