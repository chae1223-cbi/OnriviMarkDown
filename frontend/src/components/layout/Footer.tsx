// ====================================================================
// 📊 [OMD-UI-Footer-0021] Footer ➔ Footer
// 🎯 @KICK  : 웹사이트 하단 푸터로 주요 서비스 바로가기 링크 및 사업자 고지 정보 노출
// 🛡️ @GUARD : 정적 데이터 출력 위주이나 현재 연도를 new Date().getFullYear()로 안전하게 가져와 출력
// 🚨 @PATCH : **2026-06-21** — OMDLanding UI 이식 패치; 로고 아이콘 /icon.png 변경 패치
//             **2026-06-22** — Luminous Arctic 디자인 시스템 라이트모드 적용 패치 (글래스 푸터, Ice Blue 링크 호버)
// 🔗 @CALLS : Link
// ====================================================================
"use client";

import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import Link from "next/link";

const footerLinks = {
  제품: [
    { label: "기능 소개", href: "#features" },
    { label: "요금제", href: "#pricing" },
    { label: "도움말 센터", href: "/docs" },
  ],
  약관: [
    { label: "이용약관", href: "/terms" },
    { label: "개인정보처리방침", href: "/privacy" },
  ],
};

export function Footer() {
  return (
    <footer
      style={{
        background: "rgba(247,249,251,0.95)",
        borderTop: "1px solid rgba(14,165,233,0.10)",
        paddingTop: 56,
        paddingBottom: 32,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <img src="/icon.png" alt="온리비" style={{ width: 32, height: 32, borderRadius: 8 }} />
              <span style={{ fontWeight: 700, fontSize: 17, color: "#0f172a" }}>온리비</span>
            </div>
            <p style={{ fontSize: 13, color: "#6e7881", lineHeight: "20px" }}>{SITE_TAGLINE}</p>
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
                    <Link
                      href={link.href}
                      style={{ fontSize: 13, color: "#6e7881", textDecoration: "none", transition: "color 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#0ea5e9")}
                      onMouseLeave={e => (e.currentTarget.style.color = "#6e7881")}
                    >
                      {link.label}
                    </Link>
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
                {[
                  ["상호명", "온리비"],
                  ["대표자", "채병익"],
                  ["사업자등록번호", "870-36-01561"],
                  ["통신판매업", "[신고 예정]"],
                  ["이메일", "support@onrivi.com"],
                  ["전화번호", "010-2262-1324"],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: "flex", gap: 6, fontSize: 11, lineHeight: "18px" }}>
                    <span style={{ color: "#6e7881", whiteSpace: "nowrap" }}>{label}:</span>
                    <span style={{ color: "#3e4850", fontWeight: 500 }}>{value}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(14,165,233,0.08)", fontSize: 11, color: "#6e7881" }}>
                <strong>주소:</strong> 경기도 안양시 만안구 경수대로 1219번길 8, 101동 302호
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
