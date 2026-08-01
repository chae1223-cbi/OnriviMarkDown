'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { showToast } from '@/utils/toast';

type LoginStep = 'GOOGLE_OAUTH' | 'OTP_ENROLL' | 'OTP_VERIFY' | 'LOADING';

export default function AdminLogin() {
  const router = useRouter();
  const [step, setStep] = useState<LoginStep>('LOADING');
  const [isLoading, setIsLoading] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(120);
  
  // Supabase MFA States
  const [factorId, setFactorId] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [qrCodeSvg, setQrCodeSvg] = useState('');

  useEffect(() => {
    let mounted = true;

    async function checkAuthState() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (mounted) setStep('GOOGLE_OAUTH');
        return;
      }

      // 1. 관리자 권한 확인 (admins 테이블)
      const { data: adminData } = await supabase
        .from('admins')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!adminData) {
        await supabase.auth.signOut();
        showToast('최고 관리자 권한이 없습니다.', 'error');
        if (mounted) setStep('GOOGLE_OAUTH');
        return;
      }

      // 2. MFA 인증 레벨 확인
      const { data: authLevel } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      const currentLevel = authLevel?.currentLevel;
      const nextLevel = authLevel?.nextLevel;
      
      if (currentLevel === 'aal2') {
        // 이미 2단계 인증을 완료한 경우
        router.push('/admin');
        return;
      }

      // 3. 2단계 인증(MFA) 정보 불러오기
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const totpFactor = factorsData?.totp[0];

      if (!totpFactor || totpFactor.status !== 'verified') {
        // 기존에 등록 시도만 하고 검증되지 않은(Unverified) 인스턴스가 남아있으면 싹 지워줍니다.
        if (factorsData?.all) {
          for (const factor of factorsData.all) {
            if (factor.status === 'unverified') {
              await supabase.auth.mfa.unenroll({ factorId: factor.id });
            }
          }
        }

        // 기기 등록이 안 되어있거나 검증이 안 된 경우 -> 새 등록(Enroll) 진행
        const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({ 
          factorType: 'totp',
          friendlyName: `Admin Device ${Date.now()}`
        });
        if (enrollError) {
          console.error('Enroll Error:', enrollError);
          showToast('OTP 등록 중 오류가 발생했습니다.', 'error');
          return;
        }
        if (mounted) {
          setFactorId(enrollData.id);
          setQrCodeSvg(enrollData.totp.qr_code);
          setStep('OTP_ENROLL');
        }
      } else {
        // 이미 등록된 기기가 있는 경우 -> 인증 챌린지 생성
        const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: totpFactor.id });
        if (challengeError) {
          console.error('Challenge Error:', challengeError);
          showToast('인증 정보를 불러오는 중 오류가 발생했습니다.', 'error');
          return;
        }
        if (mounted) {
          setFactorId(totpFactor.id);
          setChallengeId(challengeData.id);
          setStep('OTP_VERIFY');
        }
      }
    }

    checkAuthState();

    return () => { mounted = false; };
  }, [router]);

  // OTP 시간 제한 (2분)
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (step === 'OTP_ENROLL' || step === 'OTP_VERIFY') {
      setTimeLeft(120);
      intervalId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [step]);

  useEffect(() => {
    if (timeLeft <= 0 && (step === 'OTP_ENROLL' || step === 'OTP_VERIFY')) {
      (async () => {
        showToast('보안을 위해 2분이 지나 인증이 취소되었습니다. 다시 로그인해주세요.', 'warning');
        await supabase.auth.signOut();
        setStep('GOOGLE_OAUTH');
        setOtpCode(['', '', '', '', '', '']);
        setTimeLeft(120);
      })();
    }
  }, [timeLeft, step]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleGoogleLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/admin/login`,
        queryParams: {
          prompt: 'select_account',
        }
      }
    });
    if (error) {
      console.error(error);
      setIsLoading(false);
      showToast('구글 로그인 호출에 실패했습니다.', 'error');
    }
  };

  const handleEnrollDone = async () => {
    setIsLoading(true);
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    setIsLoading(false);
    
    if (challengeError) {
      showToast('오류가 발생했습니다.', 'error');
      return;
    }
    setChallengeId(challengeData.id);
    setStep('OTP_VERIFY');
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code: otpCode.join('')
    });
    setIsLoading(false);
    
    if (error) {
      showToast('OTP 인증에 실패했습니다. 코드를 다시 확인해주세요.', 'error');
    } else {
      showToast('인증이 완료되었습니다.', 'success');
      router.push('/admin');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setStep('GOOGLE_OAUTH');
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newCode = [...otpCode];
    newCode[index] = value;
    setOtpCode(newCode);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  if (step === 'LOADING') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a237e]">
        <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div 
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center p-6" 
      style={{
        backgroundColor: '#1a237e',
        background: `radial-gradient(circle at 20% 30%, #3949ab 0%, transparent 40%),
                     radial-gradient(circle at 80% 20%, #1e88e5 0%, transparent 40%),
                     radial-gradient(circle at 50% 80%, #512da8 0%, transparent 50%),
                     linear-gradient(135deg, #0d1117 0%, #1a237e 100%)`,
        fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif"
      }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        .admin-glass-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
          border-radius: 40px;
        }
        .google-btn {
          background: linear-gradient(90deg, #6085e6 0%, #7a98eb 100%);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .google-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(96, 133, 230, 0.4);
        }
        .google-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .otp-input {
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
        }
        .otp-input:focus {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.8);
          outline: none;
        }
      `}} />

      <main className="w-full max-w-[1336px] h-full flex items-center justify-center p-6 relative z-10">
        <section className="admin-glass-card w-full max-w-[650px] aspect-[1.1] flex flex-col items-center justify-center p-12 text-white animate-in zoom-in-95 duration-700">
          
          <div className="mb-8">
            <svg className="drop-shadow-lg opacity-90" fill="none" height="110" viewBox="0 0 100 110" width="100" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 0L10 15V45C10 70.8 27.1 94.8 50 110C72.9 94.8 90 70.8 90 45V15L50 0Z" fill="#1e293b"></path>
              <path d="M50 25C40.6 25 33 32.6 33 42C33 51.4 40.6 59 50 59C59.4 59 67 51.4 67 42C67 32.6 59.4 25 50 25ZM50 51C45 51 41 47 41 42C41 37 45 33 50 33C55 33 59 37 59 42C59 47 55 51 50 51Z" fill="white" fillOpacity="0.9"></path>
              <path d="M68 65L50 55L32 65V80L50 90L68 80V65Z" fill="white" fillOpacity="0.9"></path>
            </svg>
          </div>
          
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold mb-4 tracking-tight">
              {step === 'GOOGLE_OAUTH' ? '온리비 어드민' : '2단계 인증'}
            </h1>
            <p className="text-xl text-white/80 font-light">
              {step === 'GOOGLE_OAUTH' ? '관리자 전용 대시보드에 접속하세요' : '스마트폰 OTP 앱의 6자리 코드를 입력하세요'}
            </p>
            {step !== 'GOOGLE_OAUTH' && (
              <p className="mt-3 text-lg font-medium text-red-300 animate-pulse">
                남은 시간: {formatTime(timeLeft)}
              </p>
            )}
          </div>
          
          {step === 'GOOGLE_OAUTH' && (
            <button 
              onClick={handleGoogleLogin} 
              disabled={isLoading}
              className="google-btn w-full max-w-[450px] h-[72px] rounded-full flex items-center px-2 py-2 mb-16 shadow-lg group relative overflow-hidden animate-in slide-in-from-bottom-4 duration-500"
            >
              <div className="bg-white rounded-full w-[56px] h-[56px] flex items-center justify-center flex-shrink-0">
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                ) : (
                  <svg height="24" viewBox="0 0 24 24" width="24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                  </svg>
                )}
              </div>
              <span className="flex-grow text-center text-2xl font-medium pr-14">Google 계정으로 계속하기</span>
            </button>
          )}

          {step !== 'GOOGLE_OAUTH' && (
            <div className="w-full max-w-[450px] mb-12 flex flex-col items-center animate-in slide-in-from-bottom-4 duration-500">
              
              {step === 'OTP_ENROLL' && (
                <div className="bg-white rounded-xl flex items-center justify-center mb-8 shadow-lg p-4">
                   {qrCodeSvg ? (
                     <div dangerouslySetInnerHTML={{ __html: qrCodeSvg }} />
                   ) : (
                     <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin"></div>
                   )}
                </div>
              )}

              <form onSubmit={handleVerifyOTP} className="w-full">
                <div className="flex justify-center gap-3 mb-8">
                  {otpCode.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="otp-input w-12 h-16 sm:w-14 sm:h-16 text-center text-3xl font-bold rounded-2xl transition-all shadow-inner"
                    />
                  ))}
                </div>
                
                {step === 'OTP_VERIFY' && (
                  <button
                    type="submit"
                    disabled={isLoading || otpCode.join('').length < 6}
                    className="google-btn w-full h-[64px] rounded-full flex items-center justify-center px-6 py-2 shadow-lg group disabled:opacity-50"
                  >
                    <span className="text-xl font-medium flex items-center gap-2">
                      {isLoading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>인증 완료 <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" /></>
                      )}
                    </span>
                  </button>
                )}

                {step === 'OTP_ENROLL' && (
                  <button
                    type="button"
                    onClick={handleEnrollDone}
                    disabled={isLoading}
                    className="google-btn w-full h-[64px] rounded-full flex items-center justify-center px-6 py-2 shadow-lg group disabled:opacity-50"
                  >
                    <span className="text-xl font-medium flex items-center gap-2">
                      {isLoading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>QR 스캔 완료 <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" /></>
                      )}
                    </span>
                  </button>
                )}
              </form>
              
              <button
                type="button"
                onClick={handleLogout}
                className="mt-6 text-sm text-white/50 hover:text-white/80 transition-colors"
              >
                다른 계정으로 로그인하기 (로그아웃)
              </button>
            </div>
          )}
          
          <footer className="flex items-center gap-4 text-sm text-white/60 font-normal mt-auto">
            <a className="hover:text-white transition-colors" href="#">개인정보처리방침</a>
            <span className="opacity-30">|</span>
            <a className="hover:text-white transition-colors" href="#">이용약관</a>
          </footer>
        </section>
      </main>
    </div>
  );
}
