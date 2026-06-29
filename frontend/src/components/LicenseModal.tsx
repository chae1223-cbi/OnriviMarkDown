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
    paymentNo?: string;
    planName?: string;
    nextPaymentDate?: string;
  };
  onSuccessActivation: (verifyKey: string, userId: string, paymentNo: string, explicitLicenseKey?: string) => void;
  isDarkMode?: boolean;
}

const maskSecret = (val: string | null | undefined) => {
  if (!val) return '';
  return val.length > 6 ? val.substring(0, 6) + '*'.repeat(val.length - 6) : val;
};

// ====================================================================
// 📊 [OMD-AUTH-LicenseModal-0004] LicenseModal ➔ LicenseModal
// 🎯 @KICK  : 라이선스 정품 인증 UI - Supabase 직접 수동 인증 (이메일 + 비밀번호 로그인)
// 🛡️ @GUARD : isOpen이 false이면 null 반환
// 🚨 @PATCH : **2026-06-28** — 웹과 동일한 방식(이메일+비밀번호 로그인)으로 데스크탑 라이선스 자동 연동 개편; 결제번호 입력 제거
//             **2026-06-28** — 백엔드 서버(localhost:5000) 의존 티켓 발급 방식 완전 제거
//             **2026-06-20** — 결제번호(paymentNo) 보안 연동 패치
// 🔗 @CALLS : handleManualActivate, handleCopyText, handleGoToPurchase
// ====================================================================
export default function LicenseModal({
  isOpen,
  onClose,
  deviceId,
  licenseStatus,
  onSuccessActivation,
  isDarkMode
}: LicenseModalProps) {
  const [inputUserId, setInputUserId] = useState(licenseStatus.userId || '');
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  if (!isOpen) return null;



// ====================================================================
// 📊 [OMD-AUTH-LicenseModal-0001] LicenseModal ➔ handleCopyText
// 🎯 @KICK  : 라이선스 키 텍스트를 클립보드에 복사하고 사용자 피드백 표시
// 🛡️ @GUARD : 없음
// 🚨 @PATCH : 없음
// 🔗 @CALLS : clipboard.writeText, setMessage
// ====================================================================
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setMessage({ text: `✓ ${label}가 클립보드에 복사되었습니다.`, type: 'success' });
  };

  const isEmailReadOnly = licenseStatus.isActivated || !!licenseStatus.paymentNo;

  const handleVerifyEmail = async () => {
    if (!inputUserId.trim()) {
      setMessage({ text: '가입하신 이메일(유저 ID)을 입력해 주세요.', type: 'error' });
      return;
    }
    
    setMessage({ text: '계정 정보를 확인 중입니다...', type: 'info' });
    setIsVerifyingEmail(true);
    
    try {
      const api = (window as any).electronAPI;
      const isDesktop = !!api;

      if (isDesktop) {
        const { data, error } = await supabase.rpc('verify_desktop_license', {
          p_email: inputUserId.trim(),
          p_device_uuid: deviceId
        });

        if (error) throw new Error(error.message);

        if (!data || (!data.success && data.code !== 'ERR_MAX_DEVICES_EXCEEDED')) {
          setMessage({ text: '등록되지 않은 이메일이거나 활성화된 구독이 없습니다. 회원가입 및 결제를 진행해주세요.', type: 'error' });
        } else {
          if (!data.success && data.code === 'ERR_MAX_DEVICES_EXCEEDED') {
            setMessage({ text: '동시 접속 제한을 초과하여 제한 사용자로 접근합니다.', type: 'warning' });
          } else {
            setMessage({ text: `본 계정은 성공적으로 확인되었습니다. (${data.plan_name || 'PRO'} 플랜)`, type: 'success' });
          }
          if (typeof api.saveLicenseFull === 'function') {
            await api.saveLicenseFull({ 
              userId: inputUserId.trim(), 
              lastRunTime: Date.now(),
              nextPaymentDate: data.next_payment_date || data.trial_end_at || '',
              licenseKey: data.license_key || '',
              planName: data.plan_name || ''
            });
          }
          onSuccessActivation('', inputUserId.trim(), data.payment_no || '', data.license_key || '');
          setTimeout(() => {
            onClose();
            window.location.reload(); 
          }, 1500);
        }
      } else {
        const { data, error } = await supabase.rpc('check_user_by_email', { p_email: inputUserId.trim() });
        if (error) throw new Error(error.message);

        if (!data || !data.exists) {
          setMessage({ text: '등록되지 않은 이메일입니다. 먼저 회원가입 후 진행해 주세요.', type: 'error' });
        } else {
          setMessage({ text: '✅ 이메일이 확인되었습니다. 구독 페이지로 이동하여 결제를 진행해 주세요.', type: 'success' });
        }
      }
    } catch (err: any) {
      setMessage({ text: `확인 중 오류가 발생했습니다: ${err.message}`, type: 'error' });
    } finally {
      setIsVerifyingEmail(false);
    }
  };

// ====================================================================
// 📊 [OMD-AUTH-LicenseModal-0003] LicenseModal ➔ handleGoToPurchase
// 🎯 @KICK  : onrivi.com/dashboard 결제/구독 페이지를 OS 기본 브라우저로 직접 오픈
// 🛡️ @GUARD : electronAPI 존재 여부에 따라 openExternal 또는 window.open 분기
// 🚨 @PATCH : **2026-06-28** — 백엔드 티켓 발급 방식(handleOpenRegister) 대체로 신설
// 🔗 @CALLS : electronAPI.openExternal, window.open
// ====================================================================
  const handleGoToPurchase = () => {
    const userIdVal = isEmailReadOnly ? (licenseStatus.userId || '') : inputUserId;
    const emailParam = userIdVal.trim() ? encodeURIComponent(userIdVal.trim()) : '';
    const deviceParam = deviceId ? encodeURIComponent(deviceId) : '';
    const url = `https://onrivi.com/dashboard?email=${emailParam}&device=${deviceParam}`;
    const api = (window as any).electronAPI;
    if (api && typeof api.openExternal === 'function') {
      api.openExternal(url);
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 backdrop-blur-[4px] transition-all">
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

        {/* 상태 요약 배너 */}
        <div className="mb-6 p-4 rounded-xl text-xs bg-slate-50/50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/80 shadow-sm">
          {licenseStatus.isActivated ? (
            <div className="space-y-1">
              <p className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                <span>💎</span>
                <span>정품 인증이 승인되어 모든 PRO 기능이 활성화 상태입니다.</span>
              </p>
              {licenseStatus.planName && (
                <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1 pl-5 space-y-0.5">
                  <p>• 요금제: <span className="font-semibold text-slate-700 dark:text-zinc-300">{licenseStatus.planName}</span></p>
                  {licenseStatus.nextPaymentDate && (
                    <p>• 다음 결제일: <span className="font-semibold text-slate-700 dark:text-zinc-300">{new Date(licenseStatus.nextPaymentDate).toLocaleDateString()}</span></p>
                  )}
                </div>
              )}
            </div>
          ) : licenseStatus.isExpired ? (
            <p className="text-rose-500 font-bold flex items-center gap-1.5">
              <span>⚠️</span>
              <span>체험 기간이 만료되었습니다. 에디터 잠금 해제를 위해 라이선스를 연동해 주세요.</span>
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
            <div className="flex gap-2">
              <input
                type="text"
                readOnly={isEmailReadOnly}
                value={isEmailReadOnly ? (licenseStatus.userId || '') : inputUserId}
                onChange={(e) => setInputUserId(e.target.value)}
                placeholder="onrivi.com 가입 이메일 입력"
                className={`w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-lg focus:outline-none text-slate-600 dark:text-zinc-400 ${isEmailReadOnly ? 'cursor-not-allowed' : 'focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}`}
              />
              {!isEmailReadOnly && (
                <button
                  onClick={handleVerifyEmail}
                  disabled={isVerifyingEmail || !inputUserId.trim()}
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-[11px] rounded-lg transition-all active:scale-95 shadow-sm disabled:opacity-50 whitespace-nowrap"
                >
                  {isVerifyingEmail ? '확인 중...' : '계정 확인'}
                </button>
              )}
            </div>
          </div>

          {/* 디바이스 정보 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 tracking-wide uppercase">디바이스 정보 (기기 고유 ID)</label>
            <input
              type="text"
              readOnly
              value={deviceId || '기기 식별 불가'}
              className="w-full px-3.5 py-2 text-[12px] font-mono bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-lg focus:outline-none text-slate-400 dark:text-zinc-500 cursor-not-allowed"
            />
          </div>

          {/* 2. 내 라이선스 식별 코드 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 tracking-wide uppercase">내 라이선스 식별 코드</label>
            <input
              type="text"
              readOnly
              value={maskSecret(licenseStatus.licenseKey)}
              className="w-full px-3.5 py-2 font-mono text-[11px] bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-lg select-all focus:outline-none text-slate-600 dark:text-zinc-400 cursor-not-allowed"
            />
          </div>

          {/* 3. 정품 결제번호 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 tracking-wide uppercase">정품 결제번호</label>
            <input
              type="text"
              readOnly
              value={maskSecret(licenseStatus.paymentNo)}
              className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-lg focus:outline-none text-slate-600 dark:text-zinc-400 cursor-not-allowed"
            />
          </div>

          {/* 4. 요금제 및 다음 결제일 */}
          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 tracking-wide uppercase">현재 요금제</label>
              <input
                type="text"
                readOnly
                value={licenseStatus.planName || '-'}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-lg focus:outline-none text-slate-600 dark:text-zinc-400 cursor-not-allowed"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 tracking-wide uppercase">다음 결제일</label>
              <input
                type="text"
                readOnly
                value={licenseStatus.nextPaymentDate ? new Date(licenseStatus.nextPaymentDate).toLocaleDateString() : '-'}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-lg focus:outline-none text-slate-600 dark:text-zinc-400 cursor-not-allowed"
              />
            </div>
          </div>

          {!licenseStatus.isActivated && (
            <div className="flex flex-col gap-5 border-t border-slate-150 dark:border-zinc-800/60 pt-5">
              {/* 결제 안내 박스 → onrivi.com 직접 링크 */}
              <div className="flex justify-between items-center bg-gradient-to-r from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10 p-4 rounded-xl border border-indigo-500/10 dark:border-indigo-500/20">
                <div>
                  <span className="block text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    아직 결제하지 않으셨나요?
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5 block">
                    onrivi.com 대시보드에서 구독 후 결제번호를 확인하세요.
                  </span>
                </div>
                <button
                  onClick={handleGoToPurchase}
                  className="px-4 py-2 text-[11px] font-black text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 rounded-lg transition-all active:scale-[0.98] shadow-lg shadow-indigo-600/10 whitespace-nowrap ml-3"
                >
                  구독 페이지 이동 ↗
                </button>
              </div>

            </div>
          )}
        </div>

        {/* 안내 메시지 출력 */}
        {message.text && (
          <div className={`mt-4 p-2.5 rounded text-[11px] font-bold ${
            message.type === 'error'   ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
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
