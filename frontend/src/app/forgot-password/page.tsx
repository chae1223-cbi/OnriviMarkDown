// ====================================================================
// 📊 [OMD-AUTH-forgot-password-0001] page ➔ ForgotPasswordPage
// 🎯 @KICK  : Supabase Auth 기반 비밀번호 재설정 보안 링크 메일 발송 기능 제공 비밀번호 찾기 화면
// 🛡️ @GUARD : 이메일 빈 값 및 오작동 가드, redirectUrl 분기 처리
// 🚨 @PATCH : **2026-06-27** — Supabase Auth resetPasswordForEmail 직접 호출로 복원 (static export에선 API route 불가)
//             **2026-06-23** — 화면 내 고정식 {errorMessage} 경고 및 success 안내 문구를 제거하고 성공/실패 알림을 공통 토스트 알람(showToast)으로 일괄 연동 개편 패치;
//             **2026-06-22** — Luminous Arctic 디자인 적용 (Neomorphic 그림자 shadow-2xl 및 버튼 배경색 #6366f1 일원화) 패치
// 🔗 @CALLS : fetch, Navbar, Footer, Link, useToast
// ====================================================================
"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ToastProvider";

export default function ForgotPasswordPage() {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast("가입하신 이메일 주소를 입력해 주세요.", "warning");
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {

      const redirectUrl = typeof window !== "undefined" 
        ? `${window.location.origin}/reset-password` 
        : "http://localhost:3100/reset-password";

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (error) {
        throw new Error(error.message);
      }

      setSuccess(true);
      showToast("비밀번호 재설정 이메일이 발송되었습니다. 메일함을 확인해 주세요.", "success");
      setEmail("");
    } catch (err: any) {
      console.error("비밀번호 재설정 요청 실패:", err);
      showToast(err.message || "요청 처리에 실패했습니다. 이메일 주소를 다시 확인해 주세요.", "error");
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
            <div className="text-center mb-4">
              <h1 className="font-display-sm text-display-sm text-on-surface dark:text-gray-100 leading-tight font-bold">비밀번호 찾기</h1>
            </div>

            <form className="space-y-6" id="forgot-password-form" onSubmit={handleSubmit} method="POST">
              {/* Email Input */}
              <div className="group space-y-2">
                <label className="font-label-md text-label-md text-on-surface-variant dark:text-gray-400 block ml-1 uppercase tracking-wider font-semibold" htmlFor="email">이메일 주소</label>
                <div className="relative">
                  <input
                    className="w-full bg-blue-50/50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-6 py-4 font-sans text-on-surface dark:text-gray-100 placeholder:text-outline-variant dark:placeholder:text-gray-500 focus:ring-1 focus:ring-[#6366f1]/20 dark:focus:ring-indigo-500/30 focus:bg-white dark:focus:bg-gray-850 transition-all duration-300 outline-none"
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@domain.tech"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-20 group-focus-within:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-[#6366f1]">alternate_email</span>
                  </div>
                </div>
              </div>

              {/* Primary Action */}
              <div className="pt-2">
                <button
                  className={`w-full font-label-md text-label-md py-4 rounded-xl flex items-center justify-center space-x-3 transition-all duration-200 cursor-pointer disabled:opacity-75 ${
                    success ? "bg-emerald-600 text-white" : "bg-[#6366f1] text-white hover:scale-[1.02] active:scale-95"
                  }`}
                  style={{
                    boxShadow: success ? "none" : "4px 4px 12px rgba(99, 102, 241, 0.3), -4px -4px 12px rgba(255, 255, 255, 0.8)"
                  }}
                  id="submit-btn"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="uppercase tracking-widest font-bold">요청 처리 중...</span>
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    </>
                  ) : success ? (
                    <>
                      <span className="uppercase tracking-widest font-bold">링크 발송 완료</span>
                      <span className="material-symbols-outlined">check_circle</span>
                    </>
                  ) : (
                    <>
                      <span className="uppercase tracking-widest font-bold">액세스 링크 발송</span>
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            </form>
            <nav className="flex justify-center pt-4 border-t border-gray-100 dark:border-gray-800">
              <Link className="font-label-sm text-label-sm text-on-surface-variant dark:text-gray-400 hover:text-[#6366f1] transition-colors flex items-center space-x-2 group cursor-pointer" href="/login">
                <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">keyboard_backspace</span>
                <span className="uppercase tracking-tighter font-semibold">로그인 화면으로 돌아가기</span>
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
