'use client';

import React, { useState } from 'react';
import { ShieldAlert, KeyRound, AlertTriangle } from 'lucide-react';

interface OTPResetModalProps {
  email: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function OTPResetModal({ email, onClose, onConfirm }: OTPResetModalProps) {
  const [isResetting, setIsResetting] = useState(false);

  const handleConfirm = async () => {
    setIsResetting(true);
    await onConfirm();
    setIsResetting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--admin-surface)] rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-[var(--admin-border)] animate-in zoom-in-95 duration-200">
        
        {/* Header with Icon */}
        <div className="p-6 pb-0 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-[rgba(231,76,60,0.1)] rounded-full flex items-center justify-center mb-4 relative">
            <KeyRound className="text-[var(--admin-error)]" size={32} />
            <div className="absolute -bottom-1 -right-1 bg-[var(--admin-surface)] rounded-full p-1 border border-[var(--admin-border)]">
              <AlertTriangle className="text-yellow-500" size={14} />
            </div>
          </div>
          <h3 className="text-xl font-bold text-[var(--admin-text)]">OTP (2단계 인증) 초기화</h3>
          <p className="text-sm text-[var(--admin-text-muted)] mt-2">
            사용자의 스마트폰 분실 또는 앱 삭제로 인해 2단계 인증이 불가능할 경우에만 진행해 주세요.
          </p>
        </div>
        
        {/* User Info & Warning */}
        <div className="p-6">
          <div className="bg-[var(--admin-background)] border border-[var(--admin-border)] rounded-lg p-4 mb-4">
            <div className="text-xs text-[var(--admin-text-muted)] font-medium mb-1 uppercase tracking-wider">대상 계정</div>
            <div className="text-base font-semibold text-[var(--admin-text)]">{email}</div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-[rgba(241,196,15,0.1)] border-l-4 border-yellow-500 rounded-r-md">
            <ShieldAlert className="text-yellow-600 shrink-0 mt-0.5" size={18} />
            <div className="text-xs text-yellow-800 dark:text-yellow-200 leading-relaxed">
              <strong>주의사항:</strong> 초기화 시 기존 OTP 앱(Google Authenticator 등)의 연결 코드는 더 이상 사용할 수 없습니다. 사용자는 다음 로그인 시 <strong>새로운 QR 코드를 스캔</strong>하여 기기를 다시 등록해야 합니다.
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="p-4 bg-[var(--admin-background)] flex justify-end gap-3 border-t border-[var(--admin-border)]">
          <button 
            onClick={onClose}
            disabled={isResetting}
            className="px-5 py-2.5 text-sm font-medium text-[var(--admin-text)] bg-[var(--admin-surface)] hover:bg-[var(--admin-border)] border border-[var(--admin-border)] rounded-lg transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button 
            onClick={handleConfirm}
            disabled={isResetting}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[var(--admin-error)] hover:bg-red-600 rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            {isResetting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                초기화 진행중...
              </>
            ) : (
              '초기화 승인'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
