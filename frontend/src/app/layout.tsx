import type { Metadata } from "next";
import "./globals.css";
import 'katex/dist/katex.min.css';

import { ToastProvider } from "@/components/ToastProvider";

export const metadata: Metadata = {
  title: "온리비 어서 - 프로페셔널 마크다운 에디터",
  description: "Next-generation web based markdown editor",
  icons: {
    icon: "./icon_onriveauther.png?v=1",
    shortcut: "./icon_onriveauther.png?v=1",
  }
};

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
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://maps.gstatic.com https://maps.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net data:; img-src 'self' data: https: blob: media:; connect-src 'self' http://localhost:4000 http://localhost:3000 data: media: https: https://fonts.googleapis.com https://fonts.gstatic.com https://maps.googleapis.com; child-src 'self' blob: media: https://maps.google.com https://www.google.com; frame-src https://www.youtube.com https://www.youtube-nocookie.com https://maps.google.com https://www.google.com;"
        />
        <link rel="icon" href="./icon_onriveauther.png?v=1" type="image/png" />
        <script src="./mermaid.min.js" defer></script>
      </head>
      <body suppressHydrationWarning>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
