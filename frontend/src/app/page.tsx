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

export default function Page() {
  return <MainEditorApp />;
}
