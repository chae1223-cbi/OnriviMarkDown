// ====================================================================
// 📊 [OMD-AUTH-signup-page-0001] page ➔ SignupPage
// 🎯 @KICK  : Supabase Auth 기반 이메일/구글 소셜 가입 및 7일 무료 1대 라이선스 자동 발급 병합 회원가입 화면
// 🛡️ @GUARD : 비밀번호 영문소문자/숫자/특수문자 조합 8~20자 유효성, 비밀번호 확인 일치성 검증 및 소셜 가입 유입 가드
// 🚨 @PATCH : **2026-06-23** — 화면 내 고정식 {errorMessage}/{successMessage} 경고 영역을 제거하고 모든 회원가입 단계의 성공/오류/경고 알림 메시지를 공통 토스트 알람(showToast)으로 일괄 연동 개편 패치; 회원가입 시 public.users 테이블 동기화 처리를 프론트엔드 직접 INSERT/UPSERT에서 Supabase Stored Procedure (register_user) RPC 단일 호출 방식으로 위임하여 보안 및 RLS 호환성을 강화하고, 에러 발생 시 단계별 원천 예외 텍스트를 화면으로 리턴받아 처리하도록 개편 패치; 회원가입 및 소셜 가입 진행 시 이용약관/개인정보 동의 미체크 상태인 경우 경고 문구 노출과 동시에 Toast 알림 창을 띄워 인지성을 높이도록 동의 밸리데이션 가드 강화 패치
//             **2026-06-22** — Luminous Arctic 디자인 적용 (Neomorphic 그림자 shadow-2xl 및 버튼 배경색 #6366f1 일원화) 패치
//             **2026-06-21** — OMDLanding 가입 폼 디자인 이식 및 Supabase 구글 소셜 가입 연동 패치; 깨진 logo 이미지 아이콘을 /icon.png로 변경; 기기 대수 용어를 접속 횟수(최대 접속 횟수)로 용어 개편 패치
// 🔗 @CALLS : supabase.auth, supabase.rpc, useToast, Navbar, Footer, useRouter
// ====================================================================
"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ToastProvider";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
  
  // 이용약관 및 개인정보 동의 상태
  const [agreedTerms, setAgreedTerms] = useState(false);

  useEffect(() => {
    setHasMinLength(password.length >= 8 && password.length <= 20);
    setHasLowercase(/[a-z]/.test(password));
    setHasNumber(/\d/.test(password));
    setHasSpecialChar(/[!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/-]/.test(password));
  }, [password]);

  useEffect(() => {
    setIsPasswordMatched(password === confirmPassword && confirmPassword.length > 0);
  }, [password, confirmPassword]);

  const isFormValid = hasMinLength && hasLowercase && hasNumber && hasSpecialChar && isPasswordMatched && email.trim().length > 0 && name.trim().length > 0 && agreedTerms;

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

  const { showToast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('deleted') === 'true') {
      showToast('탈퇴가 완료되었습니다. 새로운 이메일로 회원가입해주세요.', 'info');
    }
  }, [showToast]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms) {
      showToast("이용약관 및 개인정보처리방침 동의는 필수입니다.", "warning");
      return;
    }
    if (!isFormValid) {
      showToast("비밀번호 유효성 조건과 비밀번호 확인 일치 여부를 점검해 주세요.", "warning");
      return;
    }

    setLoading(true);

    try {
      // 0. 기존 users 레코드 확인 (RLS 우회 RPC 사용)
      const { data: checkResult, error: checkErr } = await supabase.rpc('check_user_by_email', {
        p_email: email.trim()
      });

      if (checkErr) throw new Error(`사용자 확인 실패: ${checkErr.message}`);

      if (checkResult?.exists) {
        if (checkResult.is_deleted) {
          // 탈퇴자: auth.users는 유지, public.users만 upsert_user로 복구
          const { error: restoreErr } = await supabase.rpc('upsert_user', {
            p_id: checkResult.id,
            p_email: email.trim(),
            p_provider: 'email'
          });
          if (restoreErr) throw new Error(`계정 복구 실패: ${restoreErr.message}`);
          showToast("계정이 복구되었습니다. 로그인해주세요.", "success");
          setLoading(false);
          router.push("/login");
          return;
        }
        // 기존 활성 유저 → 중복 가입 차단
        throw new Error("User already registered");
      }

      // 1. Supabase Auth 회원가입 호출 (별명 name을 metadata에 주입)
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            name: name.trim()
          }
        }
      });

      if (error) {
        if (error.message === 'User already registered') {
          showToast('Google 계정이 이미 연동되어 있습니다. "Google 계정으로 회원가입" 버튼을 이용해주세요.', 'info');
          setLoading(false);
          return;
        }
        throw new Error(error.message);
      }

      // 💡 Supabase "이메일 인증" 기능이 활성화된 경우:
      //    signUp() 성공 시 data.user가 null이 아닌 identities가 빈 배열로 반환됩니다.
      //    data.session이 null이면 인증 메일 발송 상태 (확인 대기)
      if (!data.user && !data.session) {
        // 이메일 인증 메일 발송됨 → 사용자에게 안내
        showToast("입력하신 이메일로 인증 메일을 발송했습니다. 메일함을 확인해 주세요!", "success");
        setLoading(false);
        return;
      }

      // data.user가 있거나 identities가 있으면 정상 진행
      const userId = data.user?.id;
      if (!userId) {
        throw new Error("회원가입 결과를 받아올 수 없습니다.");
      }

      // 2. public.users 동기화 (Stored Procedure 'register_user' RPC 호출로 단일 처리하여 RLS 우회 및 예외 추적 제공)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: regResult, error: regErr } = await supabase.rpc("register_user", {
          p_user_id: userId,
          p_email: email.trim(),
          p_provider: "email"
        });

        if (regErr) throw new Error(`[RPC 호출 실패] ${regErr.message}`);
        if (regResult && !regResult.success) throw new Error(regResult.message);
      }

      // 구독/라이선스는 자동 생성하지 않음 — 대시보드에서 요금제 선택 후 결제 시 생성됨

      showToast("회원가입이 완료되었습니다! 로그인 후 대시보드에서 요금제를 선택해 주세요.", "success");
      
      // 입력 폼 비우기
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setAgreedTerms(false);

      setTimeout(() => {
        const params = new URLSearchParams(window.location.search);
        const ticketUrl = params.get("ticket");
        if (ticketUrl) {
          router.push(`/login?ticket=${ticketUrl}`);
        } else {
          router.push("/login");
        }
      }, 2500);

    } catch (err: any) {
      console.error("회원가입 에러:", err);
      showToast(err.message || "가입에 실패했습니다. 형식 오류를 확인해 주세요.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (!agreedTerms) {
      showToast("이용약관 및 개인정보처리방침 동의는 필수입니다.", "warning");
      return;
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: typeof window !== "undefined" 
            ? `${window.location.origin}/auth/callback?mode=signup` 
            : "http://localhost:3100/auth/callback?mode=signup",
          queryParams: {
            prompt: 'select_account',
          },
        }
      });
      if (error) {
        throw new Error(error.message);
      }
    } catch (err: any) {
      console.error("구글 소셜 가입 에러:", err);
      showToast(err.message || "구글 회원가입 요청 중 오류가 발생했습니다.", "error");
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
              <h1 className="font-display-sm text-display-sm text-on-surface dark:text-gray-100 leading-tight font-bold">회원가입</h1>
            </div>

            {/* 이용약관 & 개인정보 동의 여부 (구글 가입 버튼 상단) */}
            <div className="bg-blue-50/30 dark:bg-gray-850/30 border border-gray-100 dark:border-gray-800 p-4 rounded-xl space-y-3">
              <label className="flex items-start gap-3 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-1 h-4.5 w-4.5 rounded border-gray-300 text-[#6366f1] focus:ring-[#6366f1]"
                  id="agree-checkbox"
                />
                <span className="text-on-surface-variant dark:text-gray-300 leading-relaxed font-semibold">
                  <Link href="/terms" target="_blank" className="text-[#6366f1] hover:underline font-bold">이용약관</Link> 및{" "}
                  <Link href="/privacy" target="_blank" className="text-[#6366f1] hover:underline font-bold">개인정보처리방침</Link>의 내용을 충분히 이해하였으며 이에 동의합니다. <span className="text-red-500 font-bold">(필수)</span>
                </span>
              </label>
            </div>

            {/* Google Signup Button */}
            <div>
              <button
                type="button"
                onClick={handleGoogleSignup}
                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-750 dark:text-gray-300 font-label-md text-label-md py-4 rounded-xl flex items-center justify-center space-x-3 active:scale-95 hover:bg-gray-50 dark:hover:bg-gray-850 transition-all duration-200 cursor-pointer shadow-sm font-semibold"
                style={{
                  boxShadow: "2px 2px 6px rgba(0, 0, 0, 0.02), -2px -2px 6px rgba(255, 255, 255, 0.5)"
                }}
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span>Google 계정으로 회원가입</span>
              </button>
            </div>

            {/* 구분선 */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-150 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-900 px-4 text-gray-500 dark:text-gray-400 font-label-md">또는 이메일로 가입</span>
              </div>
            </div>

            <form className="space-y-4" id="register-form" onSubmit={handleRegisterSubmit} method="POST">
              {/* Name Input */}
              <div className="group space-y-2">
                <label className="font-label-md text-label-md text-on-surface-variant dark:text-gray-400 block ml-1 uppercase tracking-wider font-semibold" htmlFor="name">활동명(별명)</label>
                <div className="relative">
                  <input
                    className="w-full bg-blue-50/50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-6 py-4 font-sans text-on-surface dark:text-gray-100 placeholder:text-outline-variant dark:placeholder:text-gray-500 focus:ring-1 focus:ring-[#6366f1]/20 dark:focus:ring-indigo-500/30 focus:bg-white dark:focus:bg-gray-850 transition-all duration-300 outline-none"
                    id="name"
                    name="name"
                    type="text"
                    placeholder="활동명(별명) 입력"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-20 group-focus-within:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-[#6366f1]">person</span>
                  </div>
                </div>
              </div>

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
                <label className="font-label-md text-label-md text-on-surface-variant dark:text-gray-400 block ml-1 uppercase tracking-wider font-semibold" htmlFor="confirmPassword">비밀번호 확인</label>
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
                  <span className="uppercase tracking-widest">{loading ? "가입 처리 중..." : "회원가입 완료"}</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </form>

            {/* Secondary Links */}
            <nav className="flex flex-col items-center space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Link 
                className="font-label-sm text-label-sm text-on-surface-variant dark:text-gray-400 hover:text-[#6366f1] transition-colors flex items-center space-x-2 group cursor-pointer" 
                href={`/login${typeof window !== "undefined" && new URLSearchParams(window.location.search).get("ticket") ? `?ticket=${new URLSearchParams(window.location.search).get("ticket")}` : ""}`}
              >
                <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">login</span>
                <span className="uppercase tracking-tighter font-semibold">이미 계정이 있으신가요? 로그인</span>
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
