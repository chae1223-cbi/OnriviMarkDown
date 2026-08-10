// ====================================================================
// 📊 [OMD-UI-Navbar-0020] Navbar ➔ Navbar
// 🎯 @KICK  : 상단 고정식 내비게이션 바로, 테마 스위처와 Supabase Auth 로그인 유무에 따른 동적 버튼/사용자 이메일 노출 및 로그아웃 기능 지원
// 🛡️ @GUARD : Supabase Auth 세션 상태를 실시간 감지하여 hydration 미스매치 방지 및 안전한 로그아웃 예외 처리
// 🚨 @PATCH : **2026-06-28** — 데스크톱 앱(Electron) 환경 진입 시 웹 상단 헤더가 레이아웃을 해쳐 에디터 집중을 방해하지 않도록 렌더링 무조건 스킵(return null) 가드 패치; 비밀번호 재설정(/reset-password) 화면 진입 시 임시 토큰으로 로그인 상태의 헤더 UI가 노출되지 않도록 강제 필터링 우회 패치
//             **2026-06-23** — 로그아웃 시 license_activations 직접 delete DML을 Supabase Stored Procedure (deactivate_session_on_logout RPC) 호출 방식으로 위임 개편 패치
//             **2026-06-22** — Luminous Arctic 디자인 시스템 라이트모드 적용 패치 (글래스모피즘 Navbar, Inter 폰트, Ice Blue 액센트); 비로그인 상태 진입 경로 제거(로그인/시작하기 버튼 숨김) 패치; 헤더에 비로그인용 '시작하기' 버튼 복원 패치
//             **2026-06-21** — OMDLanding UI 디자인 이식에 따른 신규 컴포넌트 생성 및 Supabase Auth 연동 패치; 깨진 logo 이미지 아이콘을 /icon.png로 변경; 다운로드 네비게이션 링크 제거 대응 패치
//             **2026-08-10** — 진행 중 이벤트 동적 뱃지 링크 추가 (활성 프로모션 없으면 숨김)
// 🔗 @CALLS : window.electronAPI, supabase.auth, supabase.rpc, Button, useRouter
// ====================================================================
"use client";

import React, { useState, useEffect } from "react";  // useState, useEffect : 상태관리 hook 
import { NAV_LINKS, SITE_NAME } from "@/lib/constants"; //NAV_LINKS, SITE_NAME : 상수들 
import Link from "next/link"; // next/link : 페이지 이동
import { useRouter } from "next/navigation"; // useRouter : 페이지 이동
import { supabase } from "@/lib/supabaseClient"; // supabase : 데이터베이스 연동

// =====================================================================
// 인터페이스 선언 
// NavbarContent : Navbar 컴포넌트의 props를 정의하는 타입
// navLinks : 네비게이션 링크
// dashboardLabel : 대시보드 페이지 이동
// editorLabel : 에디터 페이지 이동
// logoutLabel : 로그아웃 버튼
// startLabel : 시작하기 버튼 
// 인터페이스 타입 선언 끝
// =====================================================================
export interface NavbarContent {
  navLinks: { label: string; href: string }[];
  dashboardLabel: string;
  editorLabel: string;
  logoutLabel: string;
  startLabel: string;
}

// =====================================================================
// 네비게이션 구현 
// Navbar 컴포넌트는 사용자가 로그인했는지 여부에 따라 다른 UI를 표시합니다.
//  - 로그아웃 상태 : '시작하기' 버튼과 '로그인' 버튼을 표시합니다.
//  - 로그인 상태 : '대시보드', '에디터', '로그아웃' 버튼을 표시합니다.
// =====================================================================
export function Navbar({ content }: { content?: NavbarContent }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hasActivePromo, setHasActivePromo] = useState(false);

  // =====================================================================
  // 네비게이션 컴포넌트의 생명 주기 동안 필요한 초기화 및 이벤트 리스너 설정
  // =====================================================================
  useEffect(() => {
    setMounted(true); // mounted : 컴포넌트가 마운트되었음을 true로 설정

    // 비밀번호 재설정 페이지(/reset-password)에서는 임시 세션이 활성화되므로 Navbar의 로그인 상태를 강제로 비활성화
    const isResetPasswordPage = typeof window !== "undefined" && window.location.pathname.includes("/reset-password"); // isResetPasswordPage : 비밀번호 재설정 페이지 여부 

    if (isResetPasswordPage) { // 비밀번호 재설정 페이지인 경우
      setIsLoggedIn(false); // 로그인 상태를 false로 설정
      setUserEmail(null); // 사용자 이메일을 null로 설정
    } else { // 비밀번호 재설정 페이지가 아닌 경우
      supabase.auth.getSession().then(({ data: { session } }) => { // Supabase Auth 세션 정보를 가져옴 
        if (session?.user) { // 세션에 사용자 정보가 있는 경우
          setUserEmail(session.user.email || null); // 사용자 이메일을 설정 
          setIsLoggedIn(true); // 로그인 상태를 true로 설정
        }
      });
    }

    // =====================================================================
    // Supabase Auth 상태 변경 시 처리
    // =====================================================================
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { // auth state change : 로그인, 로그아웃, 세션 만료 등authStateChange 이벤트 구독 
      if (isResetPasswordPage) { // 비밀번호 재설정 페이지인 경우 
        setUserEmail(null); // 사용자 이메일을 null로 설정 
        setIsLoggedIn(false); // 로그인 상태를 false로 설정 
      } else if (session?.user) { // 세션에 사용자 정보가 있는 경우
        setUserEmail(session.user.email || null); // 사용자 이메일을 설정 
        setIsLoggedIn(true); // 로그인 상태를 true로 설정
      } else { // 세션에 사용자 정보가 없는 경우
        setUserEmail(null); // 사용자 이메일을 null로 설정 
        setIsLoggedIn(false); // 로그인 상태를 false로 설정 
      }
    });

    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll);

    // 진행 중인 이벤트 여부 확인
    fetch("/api/beta/active-promotion")
      .then(r => r.json())
      .then(data => { if (data.promotion) setHasActivePromo(true); })
      .catch(() => {});

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // =====================================================================
  // 로그아웃 처리
  // =====================================================================
  const handleLogout = async () => {
    try { // try : 예외 처리를 위한 블록 
      const sessionId = localStorage.getItem('onrivi_session_id') || localStorage.getItem('onrivi_device_id'); // sessionId : 세션 ID
      const paymentNo = localStorage.getItem('onrivi_payment_no'); // paymentNo : 결제 번호 
      if (sessionId && paymentNo) { // 세션 ID와 결제 번호가 모두 있는 경우
        await fetch('/api/device/deactivate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ p_payment_no: paymentNo, p_device_uuid: sessionId }) }); // API 호출로 세션 비활성화 
      }
      ['onrivi_session_id', 'onrivi_payment_no', 'onrivi_user_id', 'onrivi_license_key'].forEach(k => localStorage.removeItem(k)); // 로컬 스토리지에서 세션 ID, 결제 번호, 사용자 ID, 라이선스 키를 삭제 
      await supabase.auth.signOut(); // 로그아웃 
      setUserEmail(null); // 사용자 이메일을 null로 설정 
      setIsLoggedIn(false); // 로그인 상태를 false로 설정 
      router.push("/"); // 메인 페이지로 이동
    } catch (e) { // catch : 예외 처리를 위한 블록 
      console.error("[Navbar] 로그아웃 에러:", e); // 에러 로그 출력
    }
  };

  // 데스크톱 앱(Electron) 내부에서 작동 중일 때는 웹 상단 헤더가 레이아웃을 해치지 않도록 아예 렌더링하지 않습니다.
  const isDesktop = typeof window !== "undefined" && (
    !!(window as any).electronAPI ||
    navigator.userAgent.toLowerCase().includes('electron') ||
    new URLSearchParams(window.location.search).get('env') === 'desktop'
  );
  if (isDesktop) return null;

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
            {(content?.navLinks ?? NAV_LINKS).map((link) => (
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

            {/* 진행 중인 이벤트 — 활성 프로모션 있을 때만 노출 */}
            {hasActivePromo && (
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("openBetaModal"))}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#0ea5e9",
                  background: "rgba(14,165,233,0.08)",
                  border: "1.5px solid rgba(14,165,233,0.25)",
                  borderRadius: 9999,
                  padding: "4px 12px",
                  cursor: "pointer",
                  letterSpacing: "0.01em",
                  transition: "all 0.15s",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(14,165,233,0.15)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(14,165,233,0.5)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(14,165,233,0.08)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(14,165,233,0.25)";
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0ea5e9", display: "inline-block", animation: "pulse 1.5s infinite" }} />
                진행 중인 이벤트
              </button>
            )}
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
                    <button className="btn-secondary" style={{ fontSize: 13, padding: "6px 16px" }}>{content?.dashboardLabel ?? "대시보드"}</button>
                  </Link>
                  <Link href="/editor">
                    <button className="btn-primary" style={{ fontSize: 13, padding: "6px 16px" }}>{content?.editorLabel ?? "에디터"}</button>
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{ fontSize: 13, color: "#64748b", fontWeight: 600, background: "none", border: "none", cursor: "pointer", transition: "color 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#475569")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#64748b")}
                  >
                    {content?.logoutLabel ?? "로그아웃"}
                  </button>
                </>
              ) : (
                <Link href="/login">
                  <button className="btn-primary" style={{ fontSize: 13, padding: "6px 16px" }}>{content?.startLabel ?? "시작하기"}</button>
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
