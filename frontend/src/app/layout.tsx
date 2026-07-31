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
  title: "Onrivi Author - 마크다운 뷰어 & 마크다운 에디터 (Markdown Viewer & Edit) | 온리비 어서",
  description: "AI는 마크다운으로, 사람은 문서로. 한글 입력 결함(Input Glitch) 없는 무결점 마크다운 뷰어 및 마크다운 에디터. KaTeX 수식, Mermaid 다이어그램, JSON 서식 프로필을 통한 원클릭 PDF/EPUB 출판 및 로컬 우선(Local-First) 보안 환경을 제공합니다.",
  keywords: ["마크다운", "마크다운 에디터", "마크다운 뷰어", "마크다운viewer", "마크다운edit", "마크다운문서viwer", "Markdown Viewer", "Markdown Edit", "Markdown Editor", "Onrivi Author", "온리비어서", "Local-First", "로컬우선", "KaTeX", "Mermaid", "RAG전처리", "PDF변환", "EPUB출판", "1인개발"],
  authors: [{ name: "Onrivi (온리비) 채병익" }],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Onrivi Author - 완벽한 마크다운 뷰어 & 마크다운 에디터 플랫폼",
    description: "한글 입력 오류 제로, 인쇄소 품질의 PDF/EPUB 변환, 로컬 우선 보안 마크다운 뷰어 및 에디터 Onrivi Author를 만나보세요.",
    url: 'https://onrivi.com',
    siteName: 'Onrivi Author',
    images: [
      {
        url: 'https://onrivi.com/og-image.png',
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
    title: "Onrivi Author - 완벽한 마크다운 뷰어 & 마크다운 에디터 플랫폼",
    description: "한글 입력 오류 제로, 인쇄소 품질의 PDF/EPUB 변환, 로컬 우선 보안 마크다운 뷰어 및 에디터 Onrivi Author를 만나보세요.",
    images: ['https://onrivi.com/og-image.png'],
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
          content="default-src 'self' app: media: media-local:; script-src 'self' app: 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://maps.gstatic.com https://maps.googleapis.com https://static.cloudflareinsights.com; style-src 'self' app: 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' app: https://fonts.gstatic.com https://cdn.jsdelivr.net data:; img-src 'self' app: data: blob: http: https: file: media: media-local:; connect-src 'self' app: http://localhost:5000 http://localhost:4000 http://localhost:3000 data: media: media-local: https: ws: wss: https://fonts.googleapis.com https://fonts.gstatic.com https://maps.googleapis.com https://*.supabase.co wss://*.supabase.co https://cdn.jsdelivr.net; child-src 'self' app: blob: media: media-local: https: https://maps.google.com https://www.google.com; frame-src https://www.youtube.com https://www.youtube-nocookie.com https://maps.google.com https://www.google.com; media-src 'self' app: media: media-local: blob: https:;"
        />
        <meta name="color-scheme" content="light" />
        <link rel="icon" href="./icon_onriveauther.png?v=1" type="image/png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Onrivi Author",
              "alternateName": ["온리비 어서", "Onrivi", "마크다운 뷰어", "마크다운 에디터", "마크다운viewer", "마크다운edit", "마크다운문서viwer"],
              "operatingSystem": "Windows, Web",
              "applicationCategory": "DeveloperApplication, ProductivityApplication",
              "offers": {
                "@type": "Offer",
                "price": "3000",
                "priceCurrency": "KRW",
                "priceValidUntil": "2027-12-31"
              },
              "description": "마크다운 작성(Markdown Edit)과 인쇄소 품질의 뷰어/출판 서식을 결합한 로컬 우선(Local-First) 저작 플랫폼. KaTeX, Mermaid, JSON 서식 프로필 및 AI 연동 지원.",
              "url": "https://onrivi.com",
              "author": {
                "@type": "Person",
                "name": "채병익 (Chae Byeong-ik)"
              }
            })
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}