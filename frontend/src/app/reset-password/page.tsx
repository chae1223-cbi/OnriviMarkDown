// ====================================================================
// 📊 [OMD-AUTH-reset-password-0001] page ➔ ResetPasswordPage
// 🎯 @KICK  : Supabase Auth 기반 새로운 비밀번호 변경 입력창 및 패스워드 재설정 화면
// 🛡️ @GUARD : 비밀번호 영문소문자/숫자/특수문자 조합 8~20자 유효성, 비밀번호 확인 일치성 검증 가드
// 🚨 @PATCH : **2026-06-27** — Supabase Auth 대신 Next.js API Route Handler(/api/auth/reset-password-confirm)에 이메일 인증 토큰을 대조해 비밀번호를 변경하도록 개편 패치
//             **2026-06-23** — 화면 내 고정식 {errorMessage}/{successMessage} 경고 및 안내 문구를 제거하고 성공/실패 알림을 공통 토스트 알람(showToast)으로 일괄 연동 개편 패치;
//             **2026-06-22** — Luminous Arctic 디자인 적용 (Neomorphic 그림자 shadow-2xl 및 버튼 배경색 #6366f1 일원화) 패치
// 🔗 @CALLS : fetch, Navbar, Footer, useRouter, useToast
// ====================================================================
"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ToastProvider";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  // 실시간 유효성 체크 상태
  const [hasMinLength, setHasMinLength] = useState(false);
  const [hasLowercase, setHasLowercase] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  const [isPasswordMatched, setIsPasswordMatched] = useState(false);

  useEffect(() => {
    setHasMinLength(password.length >= 8 && password.length <= 20);
    setHasLowercase(/[a-z]/.test(password));
    setHasNumber(/\d/.test(password));
    setHasSpecialChar(/[!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/-]/.test(password));
  }, [password]);

  useEffect(() => {
    setIsPasswordMatched(password === confirmPassword && confirmPassword.length > 0);
  }, [password, confirmPassword]);

  const isFormValid = hasMinLength && hasLowercase && hasNumber && hasSpecialChar && isPasswordMatched;

  // 배경 블롭 마우스 무브 효과 (패럴랙스)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      
      const blob1 = document.getElementById("blob-1");
      const blob2 = document.getElementById("blob-2");
      
      if (blob1) {
        blob1.style.transform = `translate(${x * 50}px, ${y * 50}px)`;
      }
      if (blob2) {
        blob2.style.transform = `translate(${x * -30}px, ${y * -30}px)`;
      }
    };
    
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // URL hash에서 Supabase Auth 세션 복원
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          // hash에 access_token이 있으면 수동 세션 설정
          const params = new URLSearchParams(hash.replace('#', '?'));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          if (accessToken) {
            supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            }).catch(() => {});
          }
        }
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      showToast("비밀번호 유효성 조건과 비밀번호 확인 일치 여부를 점검해 주세요.", "warning");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        throw new Error(error.message);
      }

      showToast("비밀번호가 성공적으로 변경되었습니다! 로그인 페이지로 이동합니다.", "success");
      setPassword("");
      setConfirmPassword("");

      if (typeof window !== 'undefined') {
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }

      setTimeout(() => {
        router.replace("/login");
      }, 2500);
    } catch (err: any) {
      console.error("비밀번호 업데이트 실패:", err);
      showToast(err.message || "비밀번호 업데이트에 실패했습니다. 다시 시도해 주세요.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface dark:bg-gray-950 text-on-surface dark:text-gray-100 font-sans transition-colors duration-200">
      {/* 구글 폰트 및 Material Symbols 로드 */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <Navbar />

      {/* 본문 영역 */}
      <main className="flex-grow flex items-center justify-center px-4 pt-32 pb-24 relative z-10">
        <div 
          className="max-w-md w-full bg-white/70 dark:bg-gray-900/60 border border-white/40 rounded-3xl p-8 backdrop-blur-md"
          style={{
            boxShadow: "8px 8px 24px rgba(0, 0, 0, 0.04), -8px -8px 24px rgba(255, 255, 255, 0.9)"
          }}
        >
          
          <section className="space-y-6">
            <div className="space-y-2">
              <h1 className="font-display-sm text-display-sm text-on-surface dark:text-gray-100 leading-tight font-bold">비밀번호 재설정</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant dark:text-gray-400 max-w-sm">
                보안 규칙에 부합하는 새로운 비밀번호를 입력하여 복구 절차를 완료해 주세요.
              </p>
            </div>



            <form className="space-y-6" id="reset-password-form" onSubmit={handleSubmit} method="POST">
              {/* Password Input */}
              <div className="group space-y-2">
                <label className="font-label-md text-label-md text-on-surface-variant dark:text-gray-400 block ml-1 uppercase tracking-wider font-semibold" htmlFor="password">새 비밀번호</label>
                <div className="relative">
                  <input
                    className="w-full bg-blue-50/50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-6 py-4 font-sans text-on-surface dark:text-gray-100 placeholder:text-outline-variant dark:placeholder:text-gray-500 focus:ring-1 focus:ring-[#6366f1]/20 dark:focus:ring-indigo-500/30 focus:bg-white dark:focus:bg-gray-850 transition-all duration-300 outline-none"
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-4 flex items-center opacity-20 hover:opacity-80 group-focus-within:opacity-100 transition-opacity focus:outline-none"
                  >
                    {showPassword ? (
                      <span className="material-symbols-outlined text-[#6366f1]">visibility_off</span>
                    ) : (
                      <span className="material-symbols-outlined text-[#6366f1]">lock</span>
                    )}
                  </button>
                </div>

                {/* 실시간 유효성 체크 목록 */}
                <div className="mt-1.5 grid grid-cols-2 gap-1.5 p-3 bg-blue-50/50 dark:bg-gray-850/50 rounded-lg text-[10px] leading-relaxed">
                  <span className={`flex items-center gap-1 ${hasMinLength ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-gray-450 dark:text-gray-500"}`}>
                    {hasMinLength ? "✓" : "✗"} 8자 이상 20자 이하
                  </span>
                  <span className={`flex items-center gap-1 ${hasLowercase ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-gray-450 dark:text-gray-500"}`}>
                    {hasLowercase ? "✓" : "✗"} 영문 소문자 포함
                  </span>
                  <span className={`flex items-center gap-1 ${hasNumber ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-gray-450 dark:text-gray-500"}`}>
                    {hasNumber ? "✓" : "✗"} 숫자 포함
                  </span>
                  <span className={`flex items-center gap-1 ${hasSpecialChar ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-gray-450 dark:text-gray-500"}`}>
                    {hasSpecialChar ? "✓" : "✗"} 특수 문자 포함
                  </span>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="group space-y-2">
                <label className="font-label-md text-label-md text-on-surface-variant dark:text-gray-400 block ml-1 uppercase tracking-wider font-semibold" htmlFor="confirmPassword">새 비밀번호 확인</label>
                <div className="relative">
                  <input
                    className="w-full bg-blue-50/50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-6 py-4 font-sans text-on-surface dark:text-gray-100 placeholder:text-outline-variant dark:placeholder:text-gray-500 focus:ring-1 focus:ring-[#6366f1]/20 dark:focus:ring-indigo-500/30 focus:bg-white dark:focus:bg-gray-850 transition-all duration-300 outline-none"
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-4 flex items-center opacity-20 hover:opacity-80 group-focus-within:opacity-100 transition-opacity focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <span className="material-symbols-outlined text-[#6366f1]">visibility_off</span>
                    ) : (
                      <span className="material-symbols-outlined text-[#6366f1]">lock</span>
                    )}
                  </button>
                </div>
                {confirmPassword && (
                  <p className={`text-[10px] font-bold mt-0.5 ml-1 ${isPasswordMatched ? "text-emerald-500" : "text-rose-500"}`}>
                    {isPasswordMatched ? "✓ 비밀번호가 서로 일치합니다." : "✗ 비밀번호가 서로 일치하지 않습니다."}
                  </p>
                )}
              </div>

              {/* Primary Action */}
              <div className="pt-4">
                <button
                  className="w-full bg-[#6366f1] text-white font-label-md text-label-md py-4 rounded-xl flex items-center justify-center space-x-3 active:scale-95 hover:scale-[1.02] transition-all duration-200 cursor-pointer disabled:opacity-50 font-bold"
                  style={{
                    boxShadow: "4px 4px 12px rgba(99, 102, 241, 0.3), -4px -4px 12px rgba(255, 255, 255, 0.8)"
                  }}
                  id="submit-btn"
                  type="submit"
                  disabled={!isFormValid || loading}
                >
                  <span className="uppercase tracking-widest">{loading ? "비밀번호 변경 중..." : "비밀번호 재설정 완료"}</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </form>

            <nav className="flex justify-center pt-4 border-t border-gray-100 dark:border-gray-800">
              <Link className="font-label-sm text-label-sm text-on-surface-variant dark:text-gray-400 hover:text-[#6366f1] transition-colors flex items-center space-x-2 group cursor-pointer" href="/login">
                <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">keyboard_backspace</span>
                <span className="uppercase tracking-tighter font-semibold">로그인 화면으로 이동</span>
              </Link>
            </nav>
          </section>
        </div>
      </main>

      <Footer />

      {/* Background Atmospheric Elements */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
        <div id="blob-1" className="absolute top-[10%] left-[5%] w-[40rem] h-[40rem] bg-indigo-500/5 rounded-full blur-[120px] transition-transform duration-300"></div>
        <div id="blob-2" className="absolute bottom-[10%] right-[5%] w-[30rem] h-[30rem] bg-indigo-600/5 rounded-full blur-[100px] transition-transform duration-300"></div>
      </div>
    </div>
  );
}
