import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface LicenseStatus {
  isActivated: boolean;
  isExpired: boolean;
  isRestricted?: boolean; // 추가: 동시접속 초과 등으로 인한 읽기 전용 제한 모드 여부
  remainingDays: number;
  userId: string;
  licenseKey: string;
  paymentNo?: string;
  planName?: string;
  nextPaymentDate?: string;
}

/**
 * [Step 1 Refactoring]
 * MainEditorApp에서 분리된 사용자 인증, 디바이스 ID, 라이선스 상태 관리 훅
 */
export const useEditorAuth = () => {
  const [deviceId, setDeviceId] = useState<string>('');
  const [isLicenseChecking, setIsLicenseChecking] = useState(true);
  
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus>({
    isActivated: false,
    isExpired: false,
    remainingDays: 14,
    userId: '',
    licenseKey: ''
  });

  // TODO: MainEditorApp에 흩어져 있는 fetchDeviceCount() 및 
  // checkLicenseStatus() 비즈니스 로직을 추후 이곳으로 모두 마이그레이션

  return {
    deviceId,
    setDeviceId,
    licenseStatus,
    setLicenseStatus,
    isLicenseChecking,
    setIsLicenseChecking
  };
};
