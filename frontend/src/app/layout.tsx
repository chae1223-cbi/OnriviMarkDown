import type { Metadata } from "next";
import "./globals.css";
import 'katex/dist/katex.min.css';

import { ToastProvider } from "@/components/ToastProvider";

// ====================================================================
// 📊 [OMD-CORE-layout-0002] layout ➔ metadata
// 🎯 @KICK  : Next.js Metadata 객체 - 페이지 제목, 설명, 아이콘 경로 설정
// 🛡️ @GUARD : 없음
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
export const metadata: Metadata = {
  title: "온리비 어서 - 프로페셔널 마크다운 에디터",
  description: "Next-generation web based markdown editor",
  icons: {
    icon: "./icon_onriveauther.png?v=1",
    shortcut: "./icon_onriveauther.png?v=1",
  }
};

// ====================================================================
// 📊 [OMD-CORE-layout-0001] layout ➔ RootLayout
// 🎯 @KICK  : Next.js 루트 레이아웃 - 전역 HTML 구조, CSP, 폰트, Mermaid 설정 및 ToastProvider 래핑
// 🛡️ @GUARD : 없음
// 🚨 @PATCH : CSP script-src 'self' 차단으로 mermaid.min.js <script defer> 복원 (2026-06-18); Next.js hydration이 <script>를 제거하여 dynamic load 방식으로 전환, plain script defer 제거 (2026-06-18) | **2026-06-20** — 백엔드 API(포트 5000) 연동을 위해 CSP connect-src에 http://localhost:5000 추가 허용
//           : **2026-06-23** — Cloudflare Web Analytics 억까 차단 방지를 위해 script-src 목록에 https://static.cloudflareinsights.com 정밀 추가
// 🔗 @CALLS : ToastProvider
// ====================================================================
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="light" suppressHydrationWarning>
      <head>
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://maps.gstatic.com https://maps.googleapis.com https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net data:; img-src 'self' data: https: blob: media:; connect-src 'self' http://localhost:5000 http://localhost:4000 http://localhost:3000 data: media: https: https://fonts.googleapis.com https://fonts.gstatic.com https://maps.googleapis.com https://*.supabase.co wss://*.supabase.co; child-src 'self' blob: media: https://maps.google.com https://www.google.com; frame-src https://www.youtube.com https://www.youtube-nocookie.com https://maps.google.com https://www.google.com;"
        />
        <link rel="icon" href="./icon_onriveauther.png?v=1" type="image/png" />
      </head>
      <body suppressHydrationWarning>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}