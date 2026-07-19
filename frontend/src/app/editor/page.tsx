"use client";

import dynamic from 'next/dynamic';

const MainEditorApp = dynamic(() => import('@/components/MainEditorApp'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-[#0f172a] text-slate-300 font-sans select-none">
      <div className="flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center w-28 h-28">
          <div className="absolute inset-0 m-auto w-24 h-24 border-[4px] border-blue-500/30 border-t-blue-400 rounded-full animate-spin" />
          <img src="/icon.png" alt="Onrivi Logo" className="w-10 h-10 object-contain animate-pulse z-10" />
        </div>
        <div className="text-sm font-medium tracking-wide">온리비 어서 로딩 중...</div>
      </div>
    </div>
  )
});

export default function Page() {
  return <MainEditorApp />;
}
