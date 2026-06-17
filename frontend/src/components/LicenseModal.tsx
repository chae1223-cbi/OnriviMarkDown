"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceId: string;
  licenseStatus: {
    isActivated: boolean;
    isExpired: boolean;
    remainingDays: number;
    userId: string;
    licenseKey: string;
  };
  onSuccessActivation: (verifyKey: string, userId: string) => void;
  isDarkMode?: boolean;
}

// ====================================================================
// 📊 [OMD-AUTH-LicenseModal-0004] LicenseModal ➔ LicenseModal
// 🎯 @KICK  : 라이선스 정품 인증 UI - 대시보드 연동 및 Supabase 수동 인증 제공
// 🛡️ @GUARD : isOpen이 false이면 null 반환
// 🚨 @PATCH : 없음
// 🔗 @CALLS : handleOpenRegister, handleManualActivate, handleCopyText
// ====================================================================
export default function LicenseModal({
  isOpen,
  onClose,
  deviceId,
  licenseStatus,
  onSuccessActivation,
  isDarkMode
}: LicenseModalProps) {
  const [inputVerifyKey, setInputVerifyKey] = useState('');
  const [inputUserId, setInputUserId] = useState(licenseStatus.userId || '');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  if (!isOpen) return null;

// ====================================================================
// 📊 [OMD-AUTH-LicenseModal-0003] LicenseModal ➔ handleOpenRegister
// 🎯 @KICK  : 백엔드 API로 일회성 티켓을 발급하고 대시보드 결제 페이지로 이동
// 🛡️ @GUARD : 이메일 미입력/형식 오류 시 early return
// 🚨 @PATCH : 없음
// 🔗 @CALLS : fetch, window.open, api.openExternal
// ====================================================================
  // 1. [정품 연동하러 가기] 핸들러 - 백엔드 API를 호출하여 티켓 발급 후 대시보드 기동 (방법 1)
  const handleOpenRegister = async () => {
    if (!inputUserId.trim()) {
      setMessage({ text: '가입 이메일(유저 ID)을 먼저 입력해 주셔야 연동을 시작할 수 있습니다.', type: 'error' });
      return;
    }

    // 이메일 유효성 체크
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inputUserId.trim())) {
      setMessage({ text: '올바른 이메일 주소 형식을 입력해 주세요.', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage({ text: '연동 일회성 토큰을 준비하고 있습니다...', type: 'info' });

    try {
      // API 서버 URL 획득 (환경변수 참조, 기본값 localhost:5000)
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const issueUrl = `${backendUrl.replace(/\/$/, '')}/api/auth/tickets/issue`;

      console.log('[디버그] 호출 시도 중인 백엔드 API 주소:', issueUrl);

      // 백엔드 API에 POST 요청을 날려 3분 유효 티켓 발급 요청
      const res = await fetch(issueUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: inputUserId.trim(),
          deviceUuid: deviceId,
          deviceName: 'MyPC',
          licenseKey: licenseStatus.licenseKey,
          planStatus: 'free',
          trialEndAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `백엔드 서버 에러 (상태코드: ${res.status})`);
      }

      const data = await res.json();
      const ticketId = data.ticketId;

      if (!ticketId) {
        throw new Error('응답데이터에 ticketId가 존재하지 않습니다.');
      }

      // 대시보드 웹으로 이동 (환경 변수 기반 동적 경로 처리, 기본값 localhost:3000)
      const dashboardBaseUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3000';
      const landingUrl = `${dashboardBaseUrl.replace(/\/$/, '')}/dashboard?ticket=${ticketId}`;
      const api = (window as any).electronAPI;
      
      if (api && typeof api.openExternal === 'function') {
        api.openExternal(landingUrl);
      } else {
        window.open(landingUrl, '_blank');
      }

      setMessage({
        text: '🔔 웹 브라우저의 결제/연동 페이지로 이동했습니다. 결제를 마치시면 실시간으로 정품 락이 자동 해제됩니다.',
        type: 'info'
      });
    } catch (err: any) {
      console.error('백엔드 티켓 발급 실패 상세 로그:', err);
      setMessage({ 
        text: `연동 토큰 생성 실패: ${err.message || '백엔드 서버 접속 거부. 포트 5000번 백엔드 서버가 켜져 있는지 확인해 주세요.'}`, 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

// ====================================================================
// 📊 [OMD-AUTH-LicenseModal-0002] LicenseModal ➔ handleManualActivate
// 🎯 @KICK  : Supabase를 통해 라이선스 키+유저+verifyKey 일치 여부 검증 후 기기 등록
// 🛡️ @GUARD : 이메일/verifyKey가 비어있으면 early return; Supabase 설정 미비 시 차단
// 🚨 @PATCH : 없음
// 🔗 @CALLS : supabase.from, onSuccessActivation, onClose
// ====================================================================
  // 2. [인증하기] 수동 활성화 핸들러 (실제 schema 조인으로 수동 기기 검증 바인딩)
  const handleManualActivate = async () => {
    if (!inputUserId.trim()) {
      setMessage({ text: '가입하신 이메일(유저 ID)을 입력해 주세요.', type: 'error' });
      return;
    }
    if (!inputVerifyKey.trim()) {
      setMessage({ text: '전달받은 확인 인증키를 입력해 주세요.', type: 'error' });
      return;
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder-project-id')) {
      setMessage({ 
        text: '❌ Supabase 연동 설정이 필요합니다. .env 파일에 API 키를 설정해 주세요.', 
        type: 'error' 
      });
      return;
    }

    setIsLoading(true);
    setMessage({ text: '인증서 정보를 확인하는 중입니다...', type: 'info' });

    try {
      // A. users 테이블에서 이메일에 매칭되는 user_id(UUID)를 획득
      const { data: userData, error: userErr } = await supabase
        .from('users')
        .select('id')
        .eq('email', inputUserId.trim())
        .single();

      if (userErr || !userData) {
        setMessage({ text: '해당 이메일로 가입된 온리비 유저를 찾을 수 없습니다.', type: 'error' });
        setIsLoading(false);
        return;
      }

      // B. software_licenses 테이블에서 일치 조건 검사
      const { data: licenseData, error: licErr } = await supabase
        .from('software_licenses')
        .select('id, is_active')
        .eq('license_key', licenseStatus.licenseKey)
        .eq('user_id', userData.id)
        .eq('verify_key', inputVerifyKey.trim())
        .single();

      if (licErr || !licenseData) {
        setMessage({ text: '라이선스 식별 코드, 유저 ID 또는 확인 인증키가 일치하지 않습니다.', type: 'error' });
        setIsLoading(false);
        return;
      }

      if (!licenseData.is_active) {
        setMessage({ text: '구매 정보가 아직 활성화(결제 완료) 상태가 아닙니다. 결제를 마쳐주세요.', type: 'error' });
        setIsLoading(false);
        return;
      }

      // C. license_activations 테이블에 기기 등록 (Upsert)
      const { error: actErr } = await supabase
        .from('license_activations')
        .upsert({
          license_id: licenseData.id,
          device_uuid: deviceId,
          device_name: 'MyPC',
          activated_at: new Date().toISOString()
        }, { onConflict: 'device_uuid' });

      if (actErr) {
        throw new Error(actErr.message);
      }

      setMessage({ text: '🎉 정품 라이선스 인증 및 기기 등록에 성공했습니다!', type: 'success' });
      onSuccessActivation(inputVerifyKey.trim(), inputUserId.trim());
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error('수동 인증 실패 상세 로그:', err);
      setMessage({ text: `서버 인증 실패: ${err.message || '인터넷 연결 끊김 또는 Supabase 통신 오류'}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

// ====================================================================
// 📊 [OMD-AUTH-LicenseModal-0001] LicenseModal ➔ handleCopyText
// 🎯 @KICK  : 라이선스 키 텍스트를 클립보드에 복사하고 사용자 피드백 표시
// 🛡️ @GUARD : 없음
// 🚨 @PATCH : 없음
// 🔗 @CALLS : clipboard.writeText, setMessage
// ====================================================================
  // 클립보드 복사 헬퍼
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setMessage({ text: `✓ ${label}가 클립보드에 복사되었습니다.`, type: 'success' });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 backdrop-blur-[4px] transition-all">
      {/* 최고급 카드 레이아웃 (너비 w-[520px] 확장 및 그라데이션 조명 효과 추가) */}
      <div className="w-[520px] max-w-full bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] p-8 select-none relative animate-fade-in text-slate-800 dark:text-zinc-200">
        
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full border border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-all flex items-center justify-center font-bold text-sm"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center text-lg shadow-inner">
            🔑
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-zinc-300 bg-clip-text text-transparent">
              라이선스 정품 인증
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">Onrivi Author Premium License Guard</p>
          </div>
        </div>

        {/* 상태 요약 배너 (고급스러운 카드형 그라데이션) */}
        <div className="mb-6 p-4 rounded-xl text-xs bg-slate-50/50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/80 shadow-sm">
          {licenseStatus.isActivated ? (
            <p className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
              <span>💎</span>
              <span>정품 인증이 승인되어 모든 PRO 기능이 활성화 상태입니다.</span>
            </p>
          ) : licenseStatus.isExpired ? (
            <p className="text-rose-500 font-bold flex items-center gap-1.5">
              <span>⚠️</span>
              <span>14일 체험 기간이 만료되었습니다. 편집 락 해제를 위해 라이선스를 연동해 주세요.</span>
            </p>
          ) : (
            <p className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1.5">
              <span>⚡</span>
              <span>무료 체험 기간이 작동 중입니다. (남은 기한: {licenseStatus.remainingDays}일)</span>
            </p>
          )}
        </div>

        <div className="flex flex-col gap-5">
          {/* 1. 가입 이메일 (유저 ID) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 tracking-wide uppercase">가입 이메일 (유저 ID)</label>
            <input
              type="email"
              placeholder="example@email.com"
              value={inputUserId}
              onChange={(e) => setInputUserId(e.target.value)}
              disabled={isLoading || licenseStatus.isActivated}
              className="w-full px-3.5 py-2 text-sm bg-transparent border border-slate-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 transition-all disabled:bg-slate-100 dark:disabled:bg-zinc-900 disabled:text-slate-400 dark:disabled:text-zinc-600"
            />
          </div>

          {/* 2. 내 라이선스 식별 코드 */}
          <div>
            <span className="font-bold text-[11px] text-slate-500 dark:text-zinc-400 tracking-wide uppercase">내 라이선스 식별 코드 (기기 고유키)</span>
            <div className="flex items-center gap-2 mt-1.5">
              <input
                type="text"
                readOnly
                value={licenseStatus.licenseKey}
                className="flex-1 px-3.5 py-2 font-mono text-[11px] bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-lg select-all focus:outline-none text-slate-600 dark:text-zinc-400"
              />
              <button
                onClick={() => handleCopyText(licenseStatus.licenseKey, "라이선스 키")}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 font-bold text-[11px] rounded-lg transition-all active:scale-95 shadow-sm border border-slate-200/40 dark:border-zinc-800/40"
                title="라이선스 키 복사"
              >
                복사
              </button>
            </div>
          </div>

          {!licenseStatus.isActivated && (
            <div className="flex flex-col gap-5 border-t border-slate-150 dark:border-zinc-800/60 pt-5">
              {/* 3. 라이선스 구매/연동 박스 (프리미엄 네온 테두리) */}
              <div className="flex justify-between items-center bg-gradient-to-r from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10 p-4 rounded-xl border border-indigo-500/10 dark:border-indigo-500/20">
                <div>
                  <span className="block text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    아직 결제하지 않으셨나요?
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5 block">
                    정품 연동 페이지에서 라이선스를 연동하세요.
                  </span>
                </div>
                <button
                  onClick={handleOpenRegister}
                  disabled={isLoading}
                  className="px-4 py-2 text-[11px] font-black text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 rounded-lg transition-all active:scale-[0.98] shadow-lg shadow-indigo-600/10 disabled:opacity-50"
                >
                  라이선스 구매/연동 ↗
                </button>
              </div>

              {/* 4. 확인 인증키 입력 및 인증 버튼 */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 tracking-wide uppercase">확인 인증키 (verifyKey)</label>
                  <input
                    type="text"
                    placeholder="결제 후 발급받은 확인인증키 입력"
                    value={inputVerifyKey}
                    onChange={(e) => setInputVerifyKey(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3.5 py-2 text-sm bg-transparent border border-slate-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 transition-all placeholder-slate-350 dark:placeholder-zinc-650"
                  />
                </div>

                <button
                  onClick={handleManualActivate}
                  disabled={isLoading}
                  className="w-full mt-1 py-2 text-[12px] font-black text-white bg-zinc-800 dark:bg-zinc-700 hover:bg-zinc-700 dark:hover:bg-zinc-650 rounded transition-all disabled:opacity-50"
                >
                  {isLoading ? '인증 확인 중...' : '정품 인증 완료하기'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 안내 메시지 출력 */}
        {message.text && (
          <div className={`mt-4 p-2.5 rounded text-[11px] font-bold ${
            message.type === 'error' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 
            message.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 
            'bg-slate-500/10 text-slate-600 dark:text-zinc-400 border border-slate-500/20'
          }`}>
            {message.text}
          </div>
        )}

      </div>
    </div>
  );
}
