// ====================================================================
// 📊 [OMD-AUTH-login-page-0001] page ➔ LoginPage
// 🎯 @KICK  : Supabase Auth 기반 이메일/구글 소셜 로그인 및 마스킹 해제 기능 지원 로그인 화면
// 🛡️ @GUARD : 이메일/비밀번호 빈 값 방지, Supabase 연동 검증 및 마우스 패럴랙스 예외 방어
// 🚨 @PATCH : **2026-06-23** — 화면 내 고정식 {errorMessage} 경고 영역을 제거하고 모든 로그인 단계의 오류 알림 메시지를 공통 토스트 알람(showToast)으로 일괄 연동 개편 패치;
//             **2026-06-21** — OMDLanding 로그인 폼 디자인 이식 및 Supabase 구글 소셜 로그인 연동 패치; 깨진 logo 이미지 아이콘을 /icon.png로 변경
//             **2026-06-21** — 로그인 성공 후 리다이렉션 경로를 /dashboard에서 /editor(실제 편집화면)로 변경 패치
//             **2026-06-22** — Luminous Arctic 디자인 적용 (Neomorphic 그림자 shadow-2xl 및 버튼 배경색 #6366f1 일원화) 패치; 이메일 로그인 성공 시 세션 UUID/라이선스 정보를 localStorage에 기록하고 license_activations 세션을 삽입하여 에디터 진입 후 로그인 강제 튕김 현상 수정 패치
// 🔗 @CALLS : supabase.auth, Navbar, Footer, useRouter, useToast
// ====================================================================
"use client";

import React, { useState, useEffect } from "react";     // 🔗 @HOOKS : useState, useEffect 
import { Navbar } from "@/components/layout/Navbar";     // 🔗 @COMPONENTS : Navbar
import { Footer } from "@/components/layout/Footer";     // 🔗 @COMPONENTS : Footer
import Link from "next/link";                               // 🔗 @COMPONENTS : Link
import { useRouter } from "next/navigation";               // 🔗 @COMPONENTS : useRouter
import { supabase } from "@/lib/supabaseClient";       // 🔗 @SUPABASE : supabaseClient
import { useToast } from "@/components/ToastProvider";   // 🔗 @COMPONENTS : useToast


// ====================================================================
// LoginPage 컴포넌트
// ====================================================================
export default function LoginPage() {
  const router = useRouter();                              // 🎯 Next.js 라우터
  const { showToast } = useToast();                          // 🎯 토스트 알림
  const [email, setEmail] = useState("");                    // 🎯 이메일 상태
  const [password, setPassword] = useState("");              // 🎯 비밀번호 상태
  const [showPassword, setShowPassword] = useState(false);     // 🎯 비밀번호 표시 상태
  const [loading, setLoading] = useState(false);             // 🎯 로딩 상태

  // 배경 블롭 마우스 무브 효과 (패럴랙스)
  useEffect(() => {  // 🎯 useEffect 훅 
    // 🎯 마우스 무브 이벤트 리스너
    const handleMouseMove = (e: MouseEvent) => {  // 🎯 이벤트 핸들러
      const x = e.clientX / window.innerWidth;  // 🎯 X 좌표
      const y = e.clientY / window.innerHeight;  // 🎯 Y 좌표

      const blob1 = document.getElementById("blob-1");  // 🎯 블롭 1
      const blob2 = document.getElementById("blob-2");  // 🎯 블롭 2

      if (blob1) {  // 🎯 블롭 1 존재 여부 확인
        blob1.style.transform = `translate(${x * 50}px, ${y * 50}px)`;  // 🎯 블롭 1 이동
      }
      if (blob2) {  // 🎯 블롭 2 존재 여부 확인
        blob2.style.transform = `translate(${x * -30}px, ${y * -30}px)`;  // 🎯 블롭 2 이동
      }
    };

    document.addEventListener("mousemove", handleMouseMove);  // 🎯 이벤트 리스너 등록
    return () => {  // 🎯 반환 함수
      document.removeEventListener("mousemove", handleMouseMove);  // 🎯 이벤트 리스너 해제
    };
  }, []);  // 🎯 빈 배열: 컴포넌트 마운트 시 한 번만 실행

  // 로그인 폼 제출 처리
  const handleLoginSubmit = async (e: React.FormEvent) => {  // 🎯 이벤트 핸들러
    e.preventDefault();
    if (!email.trim() || !password.trim()) {  // 🎯 빈 값 방지
      showToast("이메일과 비밀번호를 모두 입력해 주세요.", "warning");
      return;
    }

    setLoading(true);  // 🎯 로딩 시작

    try {
      // 0. 등록되지 않았거나 탈퇴한 계정 사전 차단 (RPC로 RLS 우회)
      const { data: preUser } = await supabase.rpc('check_user_by_email', {
        p_email: email.trim()
      });

      if (!preUser?.exists || preUser.is_deleted) {
        showToast('회원가입 후 로그인하십시오.', 'warning');
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({  // 🎯 Supabase 로그인
        email: email.trim(),  // 🎯 이메일
        password: password,  // 🎯 비밀번호
      });

      if (error) {  // 🎯 오류 처리
        throw new Error(error.message);  // 🎯 오류 throw
      }

      // ==================================================================
      // 로그인 성공 시 라이선스 상태 확인 후 분기 및 로컬 스토리지/세션 동기화
      // ==================================================================
      const { data: { user: loggedInUser } } = await supabase.auth.getUser();  // 🎯 Supabase 사용자 정보
      if (loggedInUser) {  // 🎯 사용자 정보 확인
        // 0. public.users 존재 확인 (RPC로 RLS 우회)
        const { data: userCheck } = await supabase.rpc('check_user_by_email', {
          p_email: loggedInUser.email
        });

        if (!userCheck?.exists) {
          showToast('회원가입이 필요한 계정입니다. 먼저 회원가입을 진행해주세요.', 'warning');
          await supabase.auth.signOut({ scope: 'local' });
          setLoading(false);
          return;
        }

        // 1. 활성 구독 및 라이선스 정보 조회
        const { data: subData } = await supabase  // 🎯 Supabase 구독 정보
          .from('subscriptions')  // 🎯 구독 테이블
          .select('id, plan_name, plan_status, trial_end_at, current_period_end')  // 🎯 구독 정보 조회
          .eq('user_id', loggedInUser.id)  // 🎯 사용자 ID
          .in('plan_status', ['ACTIVE', 'FREE'])  // 🎯 구독 상태
          .order('created_at', { ascending: false })  // 🎯 생성 시간 순서
          .limit(1)
          .maybeSingle();

        const targetDate = subData?.current_period_end || subData?.trial_end_at;  // 🎯 구독 만료일
        const isValid = targetDate ? Date.now() < new Date(targetDate).getTime() : false;  // 🎯 구독 유효성 확인

        if (isValid && subData) {  // 🎯 구독 유효성 및 구독 정보 확인
          const { data: licData } = await supabase  // 🎯 Supabase 라이선스 정보
            .from('software_licenses')  // 🎯 라이선스 테이블
            .select('id, payment_no, license_key')  // 🎯 라이선스 정보 조회
            .eq('subscription_id', subData.id)  // 🎯 구독 ID
            .eq('is_active', true)  // 🎯 라이선스 상태
            .maybeSingle();  // 🎯 단일 레코드 조회

          if (licData) {  // 🎯 라이선스 정보 확인
            const sessionId = crypto.randomUUID();  // 🎯 세션 ID 생성
            localStorage.setItem('onrivi_session_id', sessionId);  // 🎯 세션 ID 저장
            localStorage.setItem('onrivi_user_id', loggedInUser.id);  // 🎯 사용자 ID 저장
            localStorage.setItem('onrivi_payment_no', licData.payment_no || '');  // 🎯 결제 번호 저장
            localStorage.setItem('onrivi_license_key', licData.license_key || '');  // 🎯 라이선스 키 저장

            const { data: actResult, error: actError } = await supabase.rpc('insert_license_activation', { p_license_id: licData.id, p_device_uuid: sessionId, p_device_name: 'Web SaaS' });  // 🎯 라이선스 활성화
            if (actError) console.error('[ACTIVATION] RPC error:', actError);  // 🎯 오류 처리
            else if (actResult) console.log('[ACTIVATION]', actResult);  // 🎯 성공 처리
          }
          router.push("/editor");  // 🎯 에디터로 리다이렉션
        } else {  // 🎯 구독 만료 또는 구독 없음
          router.push("/dashboard");  // 🎯 대시보드로 리다이렉션
        }
      } else {  // 🎯 사용자 정보 없음
        router.push("/dashboard");  // 🎯 대시보드로 리다이렉션
      }
    } catch (err: any) {
      console.error("로그인 에러:", err);
      showToast(err.message || "로그인에 실패했습니다. 정보를 다시 확인해 주세요.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ====================================================================
  // 🎯 구글 로그인 처리
  // ====================================================================
  const handleGoogleLogin = async () => {  // 🎯 이벤트 핸들러
    try {  // 🎯 try-catch 블록
      const { error } = await supabase.auth.signInWithOAuth({  // 🎯 Supabase 구글 로그인
        provider: "google",  // 🎯 구글 로그인
        options: {  // 🎯 옵션
          redirectTo: typeof window !== "undefined"
            ? `${window.location.origin}/auth/callback?mode=login`
            : "http://localhost:3100/auth/callback?mode=login",  // 🎯 리다이렉트 URI
          queryParams: {  // 🎯 쿼리 파라미터
            prompt: 'select_account',  // 🎯 계정 선택 팝업
          },
        }
      });
      if (error) {  // 🎯 오류 처리
        throw new Error(error.message);  // 🎯 오류 throw
      }
    } catch (err: any) {
      console.error("구글 로그인 에러:", err);  // 🎯 오류 처리
      showToast(err.message || "구글 로그인 요청 중 오류가 발생했습니다.", "error");
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
              <h1 className="font-display-sm text-display-sm text-on-surface dark:text-gray-100 leading-tight font-bold">로그인</h1>
            </div>

            {/* Google Login Button */}
            <div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-750 dark:text-gray-300 font-label-md text-label-md py-4 rounded-xl flex items-center justify-center space-x-3 active:scale-95 hover:bg-gray-50 dark:hover:bg-gray-850 transition-all duration-200 cursor-pointer shadow-sm font-semibold"
                style={{
                  boxShadow: "2px 2px 6px rgba(0, 0, 0, 0.02), -2px -2px 6px rgba(255, 255, 255, 0.5)"
                }}
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                <span>Google 계정으로 로그인</span>
              </button>
            </div>

            {/* 구분선 */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-150 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-900 px-4 text-gray-500 dark:text-gray-400 font-label-md">또는 이메일로 로그인</span>
              </div>
            </div>

            <form className="space-y-6" id="login-form" onSubmit={handleLoginSubmit} method="POST">
              {/* Email Input */}
              <div className="group space-y-2">
                <label className="font-label-md text-label-md text-on-surface-variant dark:text-gray-400 block ml-1 uppercase tracking-wider font-semibold" htmlFor="email">이메일 주소</label>
                <div className="relative">
                  <input
                    className="w-full bg-blue-50/50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-6 py-4 font-sans text-on-surface dark:text-gray-100 placeholder:text-outline-variant dark:placeholder:text-gray-500 focus:ring-1 focus:ring-[#6366f1]/20 dark:focus:ring-indigo-500/30 focus:bg-white dark:focus:bg-gray-850 transition-all duration-300 outline-none"
                    id="email"
                    name="email"
                    type="email"
                    placeholder="editor@onrivi.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-20 group-focus-within:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-[#6366f1]">alternate_email</span>
                  </div>
                </div>
              </div>

              {/* Password Input */}
              <div className="group space-y-2">
                <label className="font-label-md text-label-md text-on-surface-variant dark:text-gray-400 block ml-1 uppercase tracking-wider font-semibold" htmlFor="password">비밀번호</label>
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
                      <span className="material-symbols-outlined text-[#6366f1]">
                        visibility_off
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-[#6366f1]">
                        lock
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Primary Action */}
              <div className="pt-2">
                <button
                  className="w-full bg-[#6366f1] text-white font-label-md text-label-md py-4 rounded-xl flex items-center justify-center space-x-3 active:scale-95 hover:scale-[1.02] transition-all duration-200 cursor-pointer disabled:opacity-50 font-bold"
                  style={{
                    boxShadow: "4px 4px 12px rgba(99, 102, 241, 0.3), -4px -4px 12px rgba(255, 255, 255, 0.8)"
                  }}
                  id="submit-btn"
                  type="submit"
                  disabled={loading}
                >
                  <span className="uppercase tracking-widest">{loading ? "로그인 중..." : "로그인"}</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </form>

            {/* Secondary Links */}
            <nav className="flex flex-col items-center space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Link
                className="font-label-sm text-label-sm text-on-surface-variant dark:text-gray-400 hover:text-[#6366f1] transition-colors flex items-center space-x-2 group cursor-pointer"
                href={`/signup${typeof window !== "undefined" && new URLSearchParams(window.location.search).get("ticket") ? `?ticket=${new URLSearchParams(window.location.search).get("ticket")}` : ""}`}
              >
                <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">person_add</span>
                <span className="uppercase tracking-tighter font-semibold">처음이신가요? 회원가입</span>
              </Link>
              <Link className="font-label-sm text-label-sm text-on-surface-variant dark:text-gray-400 hover:text-[#6366f1] transition-colors flex items-center space-x-2 group cursor-pointer" href="/forgot-password">
                <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">help_outline</span>
                <span className="uppercase tracking-tighter font-semibold">비밀번호를 잊으셨나요?</span>
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
