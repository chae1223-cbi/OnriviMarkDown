// ====================================================================
// 📊 [OMD-UI-Navbar-0020] Navbar ➔ Navbar
// 🎯 @KICK  : 상단 고정식 내비게이션 바로, 테마 스위처와 Supabase Auth 로그인 유무에 따른 동적 버튼/사용자 이메일 노출 및 로그아웃 기능 지원
// 🛡️ @GUARD : Supabase Auth 세션 상태를 실시간 감지하여 hydration 미스매치 방지 및 안전한 로그아웃 예외 처리
// 🚨 @PATCH : **2026-06-28** — 비밀번호 재설정(/reset-password) 화면 진입 시 임시 토큰으로 로그인 상태의 헤더 UI가 노출되지 않도록 강제 필터링 우회 패치
//             **2026-06-23** — 로그아웃 시 license_activations 직접 delete DML을 Supabase Stored Procedure (deactivate_session_on_logout RPC) 호출 방식으로 위임 개편 패치
//             **2026-06-22** — Luminous Arctic 디자인 시스템 라이트모드 적용 패치 (글래스모피즘 Navbar, Inter 폰트, Ice Blue 액센트); 비로그인 상태 진입 경로 제거(로그인/시작하기 버튼 숨김) 패치; 헤더에 비로그인용 '시작하기' 버튼 복원 패치
//             **2026-06-21** — OMDLanding UI 디자인 이식에 따른 신규 컴포넌트 생성 및 Supabase Auth 연동 패치; 깨진 logo 이미지 아이콘을 /icon.png로 변경; 다운로드 네비게이션 링크 제거 대응 패치
// 🔗 @CALLS : supabase.auth, supabase.rpc, Button, useRouter
// ====================================================================
"use client";

import React, { useState, useEffect } from "react";
import { NAV_LINKS, SITE_NAME } from "@/lib/constants";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export function Navbar() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // 비밀번호 재설정 페이지(/reset-password)에서는 임시 세션이 활성화되므로 Navbar의 로그인 상태를 강제로 비활성화
    const isResetPasswordPage = typeof window !== "undefined" && window.location.pathname.includes("/reset-password");

    if (isResetPasswordPage) {
      setIsLoggedIn(false);
      setUserEmail(null);
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUserEmail(session.user.email || null);
          setIsLoggedIn(true);
        }
      });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isResetPasswordPage) {
        setUserEmail(null);
        setIsLoggedIn(false);
      } else if (session?.user) {
        setUserEmail(session.user.email || null);
        setIsLoggedIn(true);
      } else {
        setUserEmail(null);
        setIsLoggedIn(false);
      }
    });
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll);
    return () => {
      subscription.unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const sessionId = localStorage.getItem('onrivi_session_id') || localStorage.getItem('onrivi_device_id');
      const paymentNo = localStorage.getItem('onrivi_payment_no');
      if (sessionId && paymentNo) {
        await supabase.rpc('deactivate_session_on_logout', { p_payment_no: paymentNo, p_device_uuid: sessionId });
      }
      localStorage.removeItem('onrivi_session_id');
      await supabase.auth.signOut({ scope: 'local' });
      setUserEmail(null);
      setIsLoggedIn(false);
      router.push("/");
    } catch (e) {
      console.error("[Navbar] 로그아웃 에러:", e);
    }
  };

  return (
    <nav
      className="fixed w-full z-50 transition-all duration-300"
      style={{
        fontFamily: "Inter, sans-serif",
        background: scrolled
          ? "rgba(255,255,255,0.85)"
          : "rgba(255,255,255,0.6)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: scrolled
          ? "1px solid rgba(14,165,233,0.12)"
          : "1px solid rgba(255,255,255,0.4)",
        boxShadow: scrolled ? "0 4px 24px rgba(14,165,233,0.06)" : "none",
      }}
    >
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <img src="/icon.png" alt={SITE_NAME} className="h-8 w-8 rounded-lg" />
            <span style={{ fontWeight: 700, fontSize: 18, color: "#0f172a", letterSpacing: "-0.01em" }}>
              {SITE_NAME}
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#475569",
                  textDecoration: "none",
                  transition: "color 0.15s",
                  letterSpacing: "0.01em",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "#0ea5e9")}
                onMouseLeave={e => (e.currentTarget.style.color = "#475569")}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {mounted && (
              isLoggedIn && userEmail ? (
                <>
                  <span style={{ fontSize: 13, color: "#475569", fontWeight: 500 }} className="hidden md:block max-w-[140px] truncate">
                    {userEmail}
                  </span>
                  <Link href="/dashboard">
                    <button className="btn-secondary" style={{ fontSize: 13, padding: "6px 16px" }}>대시보드</button>
                  </Link>
                  <Link href="/editor">
                    <button className="btn-primary" style={{ fontSize: 13, padding: "6px 16px" }}>에디터</button>
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{ fontSize: 13, color: "#64748b", fontWeight: 600, background: "none", border: "none", cursor: "pointer", transition: "color 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#475569")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#64748b")}
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <Link href="/login">
                  <button className="btn-primary" style={{ fontSize: 13, padding: "6px 16px" }}>시작하기</button>
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
