// ====================================================================
// 📊 [OMD-UI-Footer-0021] Footer ➔ Footer
// 🎯 @KICK  : 웹사이트 하단 푸터로 주요 서비스 바로가기 링크 및 사업자 고지 정보 노출
// 🛡️ @GUARD : 정적 데이터 출력 위주이나 현재 연도를 new Date().getFullYear()로 안전하게 가져와 출력
// 🚨 @PATCH : **2026-06-28** — 하단 제품 메뉴에 온라인 문의하기(/contact) 네비게이션 링크 추가 패치
//             **2026-06-21** — OMDLanding UI 이식 패치; 로고 아이콘 /icon.png 변경 패치
//             **2026-06-22** — Luminous Arctic 디자인 시스템 라이트모드 적용 패치 (글래스 푸터, Ice Blue 링크 호버)
// 🔗 @CALLS : Link
// ====================================================================
"use client";

import { SITE_NAME, SITE_TAGLINE, COMPANY_INFO } from "@/lib/constants";
import Link from "next/link";

const footerLinks = {
  제품: [
    { label: "기능 소개", href: "#features" },
    { label: "요금제", href: "#pricing" },
    { label: "도움말 센터", href: "/docs" },
    { label: "문의하기", href: "/contact" },
  ],
  약관: [
    { label: "이용약관", href: "/terms" },
    { label: "개인정보처리방침", href: "/privacy" },
  ],
};

export function Footer() {
  return (
    <footer
      className="bg-surface-container border-t border-outline/10 pt-14 pb-8 text-on-surface"
      style={{
        fontFamily: "LineSeed, Pretendard, sans-serif",
      }}
    >
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/icon.png" alt="Onrivi" className="w-8 h-8 rounded-lg" />
              <span className="font-bold text-base text-on-surface">Onrivi</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed mb-4">{SITE_TAGLINE}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <a
                href="https://www.youtube.com/@Onrivi-d4p"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#6e7881", textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#ff0000")}
                onMouseLeave={e => (e.currentTarget.style.color = "#6e7881")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                유튜브
              </a>
              <a
                href="https://blog.naver.com/onrivi"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#6e7881", textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#03c75a")}
                onMouseLeave={e => (e.currentTarget.style.color = "#6e7881")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z" />
                </svg>
                블로그
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="col-span-1 md:col-span-1">
              <h4 style={{ fontWeight: 600, fontSize: 13, color: "#0f172a", marginBottom: 14, letterSpacing: "0.01em" }}>
                {title}
              </h4>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {links.map((link) => (
                  <li key={link.label}>
                    {(link as any).external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 13, color: "#6e7881", textDecoration: "none", transition: "color 0.15s" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#0ea5e9")}
                        onMouseLeave={e => (e.currentTarget.style.color = "#6e7881")}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        style={{ fontSize: 13, color: "#6e7881", textDecoration: "none", transition: "color 0.15s" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#0ea5e9")}
                        onMouseLeave={e => (e.currentTarget.style.color = "#6e7881")}
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* 사업자 정보 */}
          <div className="col-span-2 md:col-span-2">
            <h4 style={{ fontWeight: 600, fontSize: 13, color: "#0f172a", marginBottom: 14 }}>사업자 정보</h4>
            <div
              style={{
                background: "rgba(255,255,255,0.6)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(14,165,233,0.10)",
                borderRadius: "0.75rem",
                padding: "14px 16px",
              }}
            >
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {COMPANY_INFO.map(([label, value]) => (
                  <div key={label} style={{ display: "flex", gap: 6, fontSize: 11, lineHeight: "18px" }}>
                    <span style={{ color: "#6e7881", whiteSpace: "nowrap" }}>{label}:</span>
                    <span style={{ color: "#3e4850", fontWeight: 500 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(14,165,233,0.08)", paddingTop: 24, display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 12, color: "#6e7881" }}>
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <div
              style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(14,165,233,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(14,165,233,0.16)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(14,165,233,0.08)")}
            >
              <svg style={{ width: 14, height: 14, color: "#6e7881", fill: "currentColor" }} viewBox="0 0 24 24" aria-hidden="true">
                <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
