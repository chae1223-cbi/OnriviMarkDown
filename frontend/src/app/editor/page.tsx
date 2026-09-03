// ====================================================================
// 📊 [OMD-UI-EditorPage-0001] editor/page.tsx ➔ Page
// 🎯 @KICK  : MainEditorApp을 SSR 비활성화(Client-side only) 및 청크 로드 실패 시 자동 복구 가드를 통해 안전하게 마운트하는 최상위 에디터 진입 라우트
// 🛡️ @GUARD : Next.js 빌드/HMR 청크 불일치로 인한 ChunkLoadError 방어 및 1회 자동 새로고침 복구 가드
// 🚨 @PATCH : **2026-09-03** — ChunkLoadError 자동 복구 리트라이 가드 추가 및 LDSG v5.0 로딩 스피너 UI 통일
// 🔗 @CALLS : dynamic, MainEditorApp
// ====================================================================
"use client";

import dynamic from "next/dynamic";

const MainEditorApp = dynamic(
  () =>
    import("@/components/MainEditorApp").catch((err) => {
      // 빌드/배포 후 청크 해시 불일치로 인한 ChunkLoadError 발생 시 1회 자동 하드리로드
      if (typeof window !== "undefined") {
        const hasRetried = sessionStorage.getItem("chunk_retry_editor");
        if (!hasRetried) {
          sessionStorage.setItem("chunk_retry_editor", "true");
          window.location.reload();
        }
      }
      throw err;
    }),
  {
    ssr: false,
    loading: () => (
      <div translate="no" className="flex items-center justify-center h-screen bg-[#F9F8F6] dark:bg-[#121314] text-[#1A1A18] dark:text-[#E8ECE9] font-sans select-none">
        <div className="flex flex-col items-center gap-6">
          <div className="relative flex items-center justify-center w-24 h-24">
            <div className="absolute inset-0 m-auto w-20 h-20 border-[3px] border-[#06C755]/20 border-t-[#06C755] rounded-full animate-spin" />
            <img src="/icon.png" alt="Onrivi Logo" className="w-9 h-9 object-contain z-10" />
          </div>
          <div className="text-sm font-bold tracking-tight text-[#111413] dark:text-white">
            <span>Onrivi Author 로딩 중...</span>
          </div>
        </div>
      </div>
    ),
  }
);

export default function Page() {
  return <MainEditorApp />;
}
