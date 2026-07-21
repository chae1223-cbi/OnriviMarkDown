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
  metadataBase: new URL('https://onrivi.com'),
  title: "온리비 어서 - 프로페셔널 마크다운 에디터",
  description: "AI 시대의 무결점 지식 자산화 인프라. 마크다운의 생산성과 전문가 수준의 출판 품질을 결합한 로컬 우선 저작 플랫폼.",
  keywords: ["마크다운 에디터", "마크다운 PDF 변환", "테크니컬 라이터", "Markdown Editor", "지식 관리", "온리비 어서", "로컬 우선 에디터", "AI 초안 작성", "문서 양식"],
  authors: [{ name: "Onrivi" }],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "온리비 어서 - 프로페셔널 마크다운 에디터",
    description: "AI 시대의 무결점 지식 자산화 인프라. 마크다운의 생산성과 전문가 수준의 출판 품질을 결합한 로컬 우선 저작 플랫폼.",
    url: 'https://onrivi.com',
    siteName: 'Onrivi Author',
    images: [
      {
        url: '/hero.png',
        width: 1200,
        height: 630,
        alt: 'Onrivi Author Preview',
      }
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "온리비 어서 - 프로페셔널 마크다운 에디터",
    description: "AI 시대의 무결점 지식 자산화 인프라. 마크다운의 생산성과 전문가 수준의 출판 품질을 결합한 로컬 우선 저작 플랫폼.",
    images: ['/hero.png'],
  },
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
          content="default-src 'self' app: media:; script-src 'self' app: 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://maps.gstatic.com https://maps.googleapis.com https://static.cloudflareinsights.com; style-src 'self' app: 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' app: https://fonts.gstatic.com https://cdn.jsdelivr.net data:; img-src 'self' app: data: blob: http: https: file: media:; connect-src 'self' app: http://localhost:5000 http://localhost:4000 http://localhost:3000 data: media: https: ws: wss: https://fonts.googleapis.com https://fonts.gstatic.com https://maps.googleapis.com https://*.supabase.co wss://*.supabase.co https://cdn.jsdelivr.net; child-src 'self' app: blob: media: https: https://maps.google.com https://www.google.com; frame-src https://www.youtube.com https://www.youtube-nocookie.com https://maps.google.com https://www.google.com; media-src 'self' app: media: https:;"
        />
        <meta name="color-scheme" content="light" />
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