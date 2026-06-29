// ====================================================================
// 📊 [OMD-AUTH-dashboard-0001] DashboardPage ➔ DashboardPage
// 🎯 @KICK  : 로그인 유저 구독/라이선스/접속세션 관리 및 요금제 선택 대시보드
// 🛡️ @GUARD : getUser() 인증 가드, 비인증 진입 시 /login 리다이렉트
// 🚨 @PATCH : **2026-06-23** — 무료 요금제(FREE)의 라이선스가 DB상 is_active=false로 입력되는 비즈니스 제약에 따라 현재 활성 구독(subData.id)을 기준으로 현재 요금제 여부(is_active_license)를 동적 매핑 식별하도록 판별 방식을 고도화 보완 패치; 사용자 ID에 매칭되는 모든 라이선스의 동시접속 레코드를 일괄적으로 불러와(Show all activations regardless of license), 현재 사용자가 활성 구독 중인 플랜의 현재 브라우저 세션만 "현재 상태(보안)"로 표기하고 그 외(과거 요금제 및 다른 브라우저)는 모두 "해제 대상(해제)"으로 일원화 표기/제어하도록 동시접속 기기 관리 테이블 고도화 패치; 복수 요금제 이력 존재 시 software_licenses 테이블 maybeSingle 조회 카드 크래시(cardinality violation)를 방지하기 위해 is_active = true인 활성 라이선스를 우선 조회하고 없을 시 최신 등록 라이선스 순으로 fallback 탐색하도록 2단계 보완 패치; 동시접속자 기기 관리 목록을 특정 활성 요금제(subData) 존재 여부와 무관하게 사용자 ID(user_id) 단위로 직접 라이선스 테이블을 역추적 조회(Show activations by user_id)하여, 플랜 상태에 따라 동시접속 기기 제어 테이블이 화면에서 사라지지 않고 언제나 전체 표시/관리 가능하도록 개선 패치; 화면 내 고정식 {message} 경고 영역과 브라우저 alert 팝업을 모두 제거하고 모든 성공/오류/경고 안내를 공통 토스트 알람(showToast)으로 일괄 통합 개편 패치; 플랜 선택(handleSelectPlan) 처리를 프론트엔드 다중 DML에서 Supabase Stored Procedure (subscribe_user_plan RPC) 단일 호출 트랜잭션 방식으로 전환하여 보안 및 RLS 호환성을 확보하고, 각 단계별 트랜잭션 진행 상황 및 PostgreSQL 원천 예외 메시지를 사용자 에러 창에 구체적으로 표시(리턴)하도록 개편 패치; 기기 해제(handleDeactivateDevice) 및 로그아웃(handleLogout) 시의 직접 delete DML 작업을 Supabase stored procedure(delete_device_activation, deactivate_session_on_logout RPC) 호출 방식으로 위임 마이그레이션 패치; 모든 데이터의 코드값 대문자 통일 룰에 부합하도록 대시보드 로딩 시의 구독 조회 조건 상태값도 대문자 단독(`['ACTIVE', 'FREE']`) 필터 조건으로 통일하여 표준화 개편 패치; 요금제 선택 시 무료 플랜(FREE)을 제외한 모든 유료 요금제 카드를 비활성화하고 버튼을 '공사중' 상태로 노출하여 비즈니스 진입을 차단하는 임시 가드 패치; 구독 및 무료 체험 신청 이력이 한 번이라도 존재(`historyList.length > 0`)하면 무료 플랜으로의 재가입/재신청을 원천 차단하는 재가입 방지 가드 패치
// 🔗 @CALLS : supabase.auth, supabase.rpc, supabase.from, useRouter, plans constants, useToast
// ====================================================================
"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react'; // 🔗 React 코어 — 상태관리(useState), 부수효과(useEffect), 콜백 메모이제이션(useCallback), DOM/타이머 참조(useRef)
import { useRouter } from 'next/navigation'; // 🔗 Next.js 라우터 — 페이지 이동(router.push) 및 쿼리 파라미터 접근
import { supabase } from '@/lib/supabaseClient'; // 🔗 Supabase 클라이언트 — Auth 세션 관리, DB 쿼리(from), RPC 호출
import { plans } from '@/lib/constants'; // 🔗 요금제 정의 상수 — 플랜 카드 렌더링용 plan.name/plan.isFree 등 메타정보
import {
  Laptop, Power, RefreshCw, Key, ShieldCheck, AlertCircle,
  LogOut, ArrowRight, User, Calendar, CreditCard,
  CheckCircle, XCircle, Zap, Crown
} from 'lucide-react'; // 🎨 아이콘 세트 — 기기/전원/새로고침/라이선스/보안/경고/로그아웃/화살표/사용자/달력/결제/성공/실패/번개/왕관
import Link from 'next/link'; // 🔗 Next.js 링크 — 클라이언트 사이드 내비게이션 (<Link href=...>)
import { useToast } from '@/components/ToastProvider'; // 🛡️ 토스트 알림 — 사용자 피드백 (showToast: success/error/info/warning)
import ConfirmModal from '@/components/ConfirmModal';

interface SubscriptionInfo {
  id: string;
  plan_status: string;
  max_devices: number;
  plan_name: string;
  trial_end_at?: string;
  current_period_end?: string;
  trial_start_at?: string;
  billing_interval?: string;
}

interface LicenseInfo {
  id: string;
  license_key: string;
  verify_key: string;
  payment_no: string;
}

interface DeviceActivation {
  id: string;
  device_uuid: string;
  device_name: string;
  activated_at: string;
  license_id?: string;
  payment_no?: string;
  is_active_license?: boolean;
}

// ── 공통 스타일 토큰 ──────────────────────────────────────
const T = {
  font: "Inter, sans-serif",
  bg: "#f7f9fb",
  surface: "rgba(255,255,255,0.6)",
  surfaceHigh: "rgba(255,255,255,0.9)",
  border: "rgba(99,102,241,0.12)",
  borderSolid: "#e2e8f0",
  primary: "#6366f1",
  primaryDark: "#4f46e5",
  onSurface: "#0f172a",
  muted: "#475569",
  subtle: "#6e7881",
  success: "#10b981",
  danger: "#ef4444",
};

const glassCard = {
  background: T.surface,
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: `1px solid rgba(255,255,255,0.45)`,
  borderRadius: "1.5rem",
  boxShadow: "8px 8px 16px rgba(0, 0, 0, 0.04), -8px -8px 16px rgba(255, 255, 255, 0.8)",
} as React.CSSProperties;

export default function DashboardPage() { // 🎯 @KICK : 로그인 유저 구독/라이선스/접속세션 관리 및 요금제 선택 대시보드

  const router = useRouter();                           // 🔗 Next.js 라우터 — 페이지 이동(router.push)
  const { showToast } = useToast();                     // 🛡️ 토스트 알림 — 성공/오류 사용자 피드백
  const [user, setUser] = useState<any>(null);                                      // 🧑 현재 로그인 유저 (Supabase Auth user 객체)
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);     // 📋 현재 활성 구독 정보 (plan_name/plan_status/period_end 등)
  const [license, setLicense] = useState<LicenseInfo | null>(null);                    // 🔑 현재 활성 라이선스 (license_key/payment_no)
  const [devices, setDevices] = useState<DeviceActivation[]>([]);                    // 💻 접속 기기 세션 목록 (device_uuid/device_name)
  const [userMeta, setUserMeta] = useState<any>(null);                                   // 👤 users 테이블 메타데이터 (email/provider)
  const [isLoading, setIsLoading] = useState(true);                                        // ⏳ 최초 데이터 로딩 상태
  const [actionLoading, setActionLoading] = useState<string | null>(null);               // 🔄 개별 액션(기기해제 등) 로딩 중인 항목 ID

  const [historyList, setHistoryList] = useState<any[]>([]);                           // 📜 과거 구독 이력 목록 (재가입 방지 검증용)
  const subscriptionRef = useRef(subscription);                                        // 📋 클로저 안전 참조용 subscription 복제 (stale closure 방지)
  const [desktopDevice, setDesktopDevice] = useState<string | null>(null);
  const [desktopEmail, setDesktopEmail] = useState<string | null>(null);
  const [desktopLicense, setDesktopLicense] = useState<LicenseInfo | null>(null);
  const [desktopSubscription, setDesktopSubscription] = useState<SubscriptionInfo | null>(null);

  useEffect(() => {
    // Read URL params
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email');
    const device = params.get('device');
    if (email) setDesktopEmail(email);
    if (device) setDesktopDevice(device);
  }, []);

  useEffect(() => { subscriptionRef.current = subscription; }, [subscription]);         // 🔄 subscription 변경 시 ref 동기화
  const [confirmModal, setConfirmModal] = useState<{                                     // ⚠️ 확인 컨펌 모달 상태 (isOpen/title/message/resolve)
    isOpen: boolean; title: string; message: string;
    confirmText?: string; isDanger?: boolean;
    resolve?: (value: boolean) => void;
  }>({ isOpen: false, title: '', message: '' });

  const showConfirm = useCallback((title: string, message: string, options?: { confirmText?: string; isDanger?: boolean }): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmModal({ isOpen: true, title, message, ...options, resolve });
    });
  }, []);

  const loadDashboardData = async () => {                                                  // 🚨 최초 데이터 로딩 함수 (Supabase Auth, 구독/라이선스/기기목록 병렬 Fetch)
    setIsLoading(true);                                                                    // ⏳ 최초 로딩 플래그
    try {
      const { data: { user: currentUser }, error: authErr } = await supabase.auth.getUser(); // 🔗 Supabase Auth 세션 조회
      if (authErr || !currentUser) { router.push('/login'); return; }                      // 🚫 인증 실패 시 로그인 페이지로 리다이렉트
      setUser(currentUser);                                                                // 🧑 로그인 유저 정보 저장

      // 👤 users 테이블 존재 확인 (RPC로 RLS 우회)
      const { data: userCheck } = await supabase.rpc('check_user_by_email', {
        p_email: currentUser.email
      });
      if (!userCheck?.exists || userCheck.is_deleted) {
        showToast(!userCheck?.exists ? '회원가입이 필요한 계정입니다.' : '탈퇴한 계정입니다. 회원가입을 진행해주세요.', 'warning');
        await supabase.auth.signOut({ scope: 'local' });
        router.push('/signup');
        return;
      }

      // 👤 users 테이블 메타데이터 조회
      const { data: userData } = await supabase.from('users').select('*').eq('id', currentUser.id).maybeSingle();
      setUserMeta(userData);                                                                 // 👤 users 테이블 메타데이터 저장

      const { data: subData, error: subErr } = await supabase.from('subscriptions')           // 📋 구독 정보 조회  
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('is_expired', 'N')
        .eq('plan_end_date', '99991231')
        .in('plan_status', ['ACTIVE', 'FREE'])
        .not('plan_name', 'like', '%데스크탑%') // 웹 요금제만 필터링
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subErr) console.error('구독 조회 오류:', subErr);                                                               // ❌ 구독 조회 오류
      setSubscription(subData as SubscriptionInfo | null);                                                               // 📋 구독 정보 저장

      // 1. 사용자의 모든 라이선스 일괄 조회 (과거/현재 요금제 전체 커버)
      const { data: allLics, error: licErr } = await supabase.from('software_licenses')                                 // 🔑 라이선스 정보 조회
        .select('id, subscription_id, license_key, verify_key, payment_no, is_active')
        .eq('user_id', currentUser.id);

      if (licErr) console.error('라이선스 조회 오류:', licErr);                                                         // ❌ 라이선스 조회 오류

      // 데스크탑 구독/라이선스 별도 추출
      const { data: dSubRes } = await supabase.from('subscriptions')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('plan_status', 'ACTIVE')
        .like('plan_name', '%데스크탑%')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (dSubRes && allLics) {
        setDesktopSubscription(dSubRes as SubscriptionInfo);
        const dLic = allLics.find(l => l.subscription_id === dSubRes.id);
        if (dLic) setDesktopLicense(dLic);
      } else {
        setDesktopSubscription(null);
        setDesktopLicense(null);
      }

      if (allLics && allLics.length > 0) { // 🔑 라이선스 정보가 있는 경우
        // 현재 활성 구독(subData.id)에 연결된 라이선스를 대표로 설정 (없을 시 active, 그것도 없을 시 첫 번째 항목)
        const activeLic = allLics.find(l => subData && l.subscription_id === subData.id)
          || allLics.find(l => l.is_active === true)
          || allLics[0];
        setLicense(activeLic as LicenseInfo);                                                                           // 🔑 대표 라이선스 저장

        // 2. 모든 라이선스 ID에 대응하는 기기 접속 세션 전체 조회
        const licIds = allLics.map(l => l.id);                                                                          // 🔑 모든 라이선스 ID 매핑
        const { data: actData } = await supabase.from('license_activations')                                              // 💻 기기 접속 세션 조회
          .select('id, license_id, device_uuid, device_name, activated_at')
          .in('license_id', licIds);

        // 3. 각 기기가 속한 라이선스가 현재 활성 라이선스인지 매핑 (subData 기준 매핑으로 FREE 플랜 is_active=false 제약 우회)
        const mappedDevices = (actData || []).map(device => {
          const matchedLic = allLics.find(l => l.id === device.license_id);
          return {
            ...device,
            payment_no: matchedLic?.payment_no || '',
            is_active_license: subData && matchedLic ? matchedLic.subscription_id === subData.id : false
          };
        }) as DeviceActivation[];                                                                                // 💻 기기 접속 세션 매핑

        // 현재 브라우저 세션이 목록에 없으면 추가
        const currentDeviceUuid = localStorage.getItem('onrivi_session_id') || localStorage.getItem('onrivi_device_id'); // 💻 현재 브라우저 세션 ID
        if (currentDeviceUuid && !mappedDevices.some(d => d.device_uuid === currentDeviceUuid)) { // 💻 현재 브라우저 세션 추가
          mappedDevices.unshift({ // 💻 현재 브라우저 세션 추가
            id: 'current-session', // 💻 현재 브라우저 세션 ID
            device_uuid: currentDeviceUuid, // 💻 현재 브라우저 세션 ID                                                                          
            device_name: navigator.userAgent?.substring(0, 30) || 'Web Browser', // 💻 현재 브라우저 세션 ID
            activated_at: new Date().toISOString(), // 💻 현재 브라우저 세션 ID
            is_active_license: true // 💻 현재 브라우저 세션 ID
          });
        }

        setDevices(mappedDevices); // 💻 기기 접속 세션 저장
      } else { // 🔑 라이선스 정보가 없는 경우
        setLicense(null); // 🔑 라이선스 정보 초기화
        setDevices(() => { // 💻 기기 접속 세션 초기화
          const currentDeviceUuid = localStorage.getItem('onrivi_session_id') || localStorage.getItem('onrivi_device_id'); // 💻 현재 브라우저 세션 ID
          if (currentDeviceUuid) { // 💻 현재 브라우저 세션 추가
            return [{ // 💻 현재 브라우저 세션 추가
              id: 'current-session', // 💻 현재 브라우저 세션 ID
              device_uuid: currentDeviceUuid, // 💻 현재 브라우저 세션 ID
              device_name: navigator.userAgent?.substring(0, 30) || 'Web Browser', // 💻 현재 브라우저 세션 ID
              activated_at: new Date().toISOString(), // 💻 현재 브라우저 세션 ID
              is_active_license: true // 💻 현재 브라우저 세션 ID
            }];
          }
          return []; // 💻 기기 접속 세션 초기화
        });
      }

      // 구독 변경 내역 전체 조회 (생성일자 순 정렬)
      const { data: histData } = await supabase.from('subscriptions')        // 📋 subscriptions 테이블 조회
        .select('id, plan_name, plan_status, billing_interval, current_period_end, plan_start_date, is_expired, plan_end_date, created_at')
        .eq('user_id', currentUser.id)        // 📋 user_id로 필터링
        .order('created_at', { ascending: false });        // 📋 생성일자 역순 정렬
      setHistoryList(histData || []);        // 📋 구독 변경 내역 저장

    } catch (err: any) { // ❌ 에러 핸들링
      console.error('대시보드 로드 실패:', err);
      showToast('데이터를 불러오는 중 문제가 발생했습니다.', 'error');
    } finally { // ⏳ 로딩 플래그 해제
      setIsLoading(false);
    }
  };

  useEffect(() => { loadDashboardData(); }, []);   // ⏳ 최초 렌더링 시 로딩

  // 📊 [OMD-DASHBOARD-POLLING] 활성 구독 있을 때만 세션 삭제 감지 (15초 폴링)
  useEffect(() => { // ⏳ 15초 간격으로 세션 삭제 감지
    const sessionId = localStorage.getItem('onrivi_session_id') || localStorage.getItem('onrivi_device_id'); // 💻 현재 브라우저 세션 ID
    const currentPaymentNo = license?.payment_no || localStorage.getItem('onrivi_payment_no'); // 🔑 현재 결제번호 (상태에서 우선 가져옴)
    if (!sessionId || !currentPaymentNo) return; // 🔑 결제번호가 없으면 감지 중단
    let mounted = true; // ⏳ 마운트 플래그
    const forceLogout = async () => { // ⏳ 강제 로그아웃 함수
      if (!mounted) return; // ⏳ 마운트 플래그 체크
      showToast('다른 브라우저에서 접속 세션이 해제되어 로그아웃합니다.', 'error');
      Object.keys(localStorage).filter(k => k.startsWith('sb-') || k.startsWith('onrivi_')).forEach(k => localStorage.removeItem(k));
      try { await supabase.auth.signOut({ scope: 'local' }); } catch (_) { }
      window.location.href = '/login';
    };

    const check = async () => { // ⏳ 세션 체크 함수
      if (!mounted) return; // ⏳ 마운트 플래그 체크
      if (!subscriptionRef.current) return; // 🔑 구독 정보 체크
      const { data: chk } = await supabase.rpc('check_license_session', { p_payment_no: currentPaymentNo, p_device_uuid: sessionId }); // 💻 현재 브라우저 세션 ID
      if (chk && !chk.success) return; // 💻 현재 브라우저 세션 ID
      if (chk && !chk.has_session) forceLogout(); // ⏳ 세션이 없으면 강제 로그아웃
    };
    const interval = setInterval(check, 15000); // ⏳ 15초 간격으로 세션 체크
    return () => { mounted = false; clearInterval(interval); }; // ⏳ 컴포넌트 언마운트 시 인터벌 제거
  }, [license?.payment_no]); // 🚨 paymentNo가 변경되면 인터벌 재시작

  // 📊 [OMD-AUTH-dashboard-0005] 로그아웃 시 license_activation 제거
  // 🚨 @PATCH : 2026-06-22 — 로그아웃 시 접속 세션 자동 제거 (Navbar와 동일 로직)
  const handleLogout = async () => { // 🚪 수동 로그아웃 — 세션 제거 + DB 정리 + signOut
    const sessionId = localStorage.getItem('onrivi_session_id') || localStorage.getItem('onrivi_device_id'); // 💻 현재 브라우저 세션 ID
    const paymentNo = localStorage.getItem('onrivi_payment_no'); // 🔑 현재 결제번호
    if (sessionId && paymentNo) { // 🔑 세션/결제번호 모두 있을 때만 DB 세션 제거
      await supabase.rpc('deactivate_session_on_logout', { p_payment_no: paymentNo, p_device_uuid: sessionId }); // 🔗 Supabase RPC 호출 — license_activations에서 해당 세션 삭제
    }
    localStorage.removeItem('onrivi_session_id'); // 🗑️ 로컬 세션 ID 제거
    await supabase.auth.signOut({ scope: 'local' }); // 🚪 Supabase Auth 로컬 로그아웃
    router.push('/'); // 🏠 루트 페이지로 이동
  };

  const handleCancelSubscription = async () => { // ⏳ 구독 해지 함수
    if (!subscription || !user) { showToast('해지할 구독 정보가 없습니다.', 'warning'); return; } // 🛡️ 구독/유저 정보 존재 여부 확인
    const confirmed = await showConfirm('구독 해지', '정말로 현재 요금제를 해지하시겠습니까?', { confirmText: '해지', isDanger: true }); // ⚠️ 해지 확인 컨펌
    if (!confirmed) return;
    try {
      const { data: result, error } = await supabase.rpc('cancel_subscription', { p_subscription_id: subscription.id, p_user_id: user.id }); // 🔗 cancel_subscription RPC 호출
      if (error) throw new Error(error.message); // ❌ RPC 에러
      if (!result || !result.success) throw new Error(result?.message || '구독 해지에 실패했습니다.'); // ❌ RPC 실패 응답
      showToast('요금제가 해지되었습니다.', 'success'); // ✅ 성공 토스트
      await loadDashboardData(); // 🔄 대시보드 데이터 새로고침
    } catch (err: any) {
      showToast(`구독 해지 실패: ${err.message}`, 'error'); // ❌ 에러 토스트
    }
  };

  const handleCancelDesktopSubscription = async () => {
    if (!desktopSubscription || !user) { showToast('해지할 구독 정보가 없습니다.', 'warning'); return; }
    const confirmed = await showConfirm('구독 해지', '정말로 데스크탑 요금제를 해지하시겠습니까?', { confirmText: '해지', isDanger: true });
    if (!confirmed) return;
    try {
      const { data: result, error } = await supabase.rpc('cancel_subscription', { p_subscription_id: desktopSubscription.id, p_user_id: user.id });
      if (error) throw new Error(error.message);
      if (!result || !result.success) throw new Error(result?.message || '구독 해지에 실패했습니다.');
      showToast('데스크탑 요금제가 해지되었습니다.', 'success');
      await loadDashboardData();
    } catch (err: any) {
      showToast(`구독 해지 실패: ${err.message}`, 'error');
    }
  };

  const handleDeleteAccount = async () => { // 🗑️ 회원 탈퇴 — 구독 없을 때만 진행 가능
    if (!user) { showToast('사용자 정보가 없습니다.', 'warning'); return; } // 🛡️ 유저 정보 확인
    if (subscription) { // 📋 구독 존재 시 탈퇴 차단 → 먼저 계약 해지 유도
      showToast('계약이 존재합니다. 먼저 계약을 해지하신 후 다시 회원탈퇴를 진행해주세요.', 'warning');
      return;
    }
    const c1 = await showConfirm('회원 탈퇴', '정말로 회원 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.', { confirmText: '탈퇴', isDanger: true }); // ⚠️ 1차 확인
    if (!c1) return;
    const c2 = await showConfirm('최종 확인', '되돌릴 수 없습니다. 정말 탈퇴하시겠습니까?', { confirmText: '탈퇴', isDanger: true }); // ⚠️ 2차 최종 확인
    if (!c2) return;
    try {
      const { data: result, error } = await supabase.rpc('delete_user_account', { p_user_id: user.id }); // 🔗 delete_user_account RPC 호출
      if (error) throw new Error(error.message); // ❌ 탈퇴 RPC 에러
      if (!result || !result.success) throw new Error(result?.message || '회원 탈퇴에 실패했습니다.'); // ❌ 탈퇴 RPC 실패
      await supabase.auth.signOut({ scope: 'local' }); // 🚪 Supabase Auth 로컬 로그아웃
      localStorage.clear(); // 🗑️ localStorage 전부 정리
      router.push('/signup?deleted=true');
    } catch (err: any) {
      showToast(`회원 탈퇴 실패: ${err.message}`, 'error');
    }
  };

  // -------------------------------------------------------------------------------------
  // 🚨 @PATCH : 2026-06-26 — 기기 해제(접속 해제) 시 결제번호로 라이선스 조회 후 device_uuid로 삭제
  // (이전: activation_id로 직접 삭제 → payment_no 매핑 누락으로 DB에 레코드가 남을 수 있었음)
  // -------------------------------------------------------------------------------------  
  const handleDeactivateDevice = async (activationId: string) => { // 🚪 기기 해제 함수
    const confirmed = await showConfirm('기기 해제', '정말로 이 접속 세션의 연동을 해제하시겠습니까?', { confirmText: '해제', isDanger: true }); // ⚠️ 해지 확인 컨펌
    if (!confirmed) return;
    setActionLoading(activationId); // ⏳ 로딩 상태 설정
    try {
      const { data: result, error } = await supabase.rpc('delete_device_activation', { p_activation_id: activationId }); // 🔗 delete_device_activation RPC 호출

      if (error) throw new Error(error.message); // ❌ RPC 에러

      if (!result || !result.success) throw new Error(result?.message || '기기 해제에 실패했습니다.'); // ❌ RPC 실패 응답

      showToast('접속 연동이 성공적으로 해제되었습니다.', 'success'); // ✅ 성공 토스트

      await loadDashboardData(); // 🔄 대시보드 데이터 새로고침
    } catch (err: any) { // ❌ 에러
      showToast(`접속 연동 해제 실패: ${err.message}`, 'error'); // ❌ 에러 토스트

    } finally { // ⏳ 로딩 상태 해제
      setActionLoading(null); // ⏳ 로딩 상태 해제
    }
  };

  // -------------------------------------------------------------------------------------
  // 🚨 @PATCH : 2026-06-26 — 원리비 설치 유도(딥링크)
  // -------------------------------------------------------------------------------------
  const handleDesktopActivate = async () => {
    let currentDesktopPaymentNo = desktopLicense?.payment_no;
    let currentVerifyKey = desktopLicense?.verify_key;
    let currentLicenseKey = desktopLicense?.license_key;

    if (!currentDesktopPaymentNo) {
      if (!desktopDevice || !desktopEmail) {
        showToast('데스크탑에서 올바른 기기 정보가 전달되지 않았습니다.', 'warning');
        return;
      }
      
      // 이메일 검증
      if (user?.email !== desktopEmail) {
        showToast('현재 로그인된 웹 계정과 데스크탑 가입 이메일이 다릅니다. 확인해주세요.', 'error');
        return;
      }

      // 결제 이력이 없으므로 결제 진행 (목업)
      setActionLoading('desktop_activate');
      try {
        const { data, error } = await supabase.rpc('subscribe_desktop_plan', {
          p_user_id: user.id,
          p_device_uuid: desktopDevice,
          p_device_name: 'Desktop App'
        });

        if (error) throw new Error(error.message);
        if (!data || !data.success) throw new Error(data?.message || '결제 처리에 실패했습니다.');

        currentDesktopPaymentNo = data.payment_no;
        currentVerifyKey = data.verify_key;
        currentLicenseKey = data.license_key;

        showToast('데스크탑 결제 및 활성화가 완료되었습니다.', 'success');
        await loadDashboardData(); // 데이터 새로고침
      } catch (err: any) {
        showToast(`결제 실패: ${err.message}`, 'error');
        setActionLoading(null);
        return;
      }
      setActionLoading(null);
    }

    // 딥링크 호출
    const deepLinkUrl = `onriviauthor://activate?key=${encodeURIComponent(currentVerifyKey || '')}&user=${encodeURIComponent(user?.email || '')}&paymentNo=${encodeURIComponent(currentDesktopPaymentNo || '')}&licenseKey=${encodeURIComponent(currentLicenseKey || '')}`;
    window.location.href = deepLinkUrl;
  };

  // -------------------------------------------------------------------------------------
  // 🚨 @PATCH : 2026-06-26 — 남은 일수 계산 함수
  // -------------------------------------------------------------------------------------
  const getRemainingDays = () => {
    if (!subscription) return 0; // 🛡️ 구독 정보가 없을 때
    const d = subscription.trial_end_at || subscription.current_period_end;
    if (!d) return 0; // 🛡️ 종료일이 없을 때
    return Math.max(0, Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)); // ⏱️ 남은 일수 계산
  };

  // -------------------------------------------------------------------------------------
  // 🚨 @PATCH : 2026-06-26 — 무료 체험 만료 여부
  // -------------------------------------------------------------------------------------
  const isTrialExpired = subscription?.plan_status === 'FREE' && getRemainingDays() <= 0;   // 🛡️ 무료 체험 만료 여부

  // -------------------------------------------------------------------------------------
  // 🚨 @PATCH : 2026-06-26 — 라이선스 유효 여부
  // -------------------------------------------------------------------------------------
  const isLicenseValid = !!subscription && getRemainingDays() > 0; // 🛡️ 라이선스 유효 여부

  // -------------------------------------------------------------------------------------
  // 🚨 @PATCH : 2026-06-26 — 안전 UUID 사출 유틸리티
  // -------------------------------------------------------------------------------------
  function generateSafeFallbackUUID(): string { // 🔐 안전 UUID 생성
    if (typeof window === 'undefined') return 'SERVER'; // 🛡️ 서버 환경일 때
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') { // 🔐 crypto.randomUUID() 사용 가능할 때
      return crypto.randomUUID(); // 🔐 crypto.randomUUID() 사용
    }
    // 🛡️ crypto.randomUUID() 사용 불가능할 때 대체
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // -------------------------------------------------------------------------------------
  // 🚨 @PATCH : 2026-06-26 — 요금제 선택
  // -------------------------------------------------------------------------------------
  const handleSelectPlan = async (plan: typeof plans[0]) => { // 🎯 요금제 선택
    if (!user) return; // 🛡️ 유저 정보가 없을 때
    setActionLoading('plan_' + plan.name); // ⏳ 로딩 상태 설정

    try {
      // 🚨 [재가입 가드]: 한 번이라도 구독/무료 체험 신청 이력이 존재하는지 확인
            const hasWebHistory = historyList.some(h => !h.plan_name.includes('데스크탑'));
      if (plan.isFree && hasWebHistory) { // 🛡️ 무료 요금제 재가입 방지
        throw new Error("이미 구독 신청 이력이 존재하는 계정이므로 무료 요금제 재가입이 절대 불가합니다.");
      }
      const maxDevices = plan.isFree ? 1 : 3; // 🔒 최대 기기 수 설정 (현재 무료1, 유료 3 통일)
      const isYearly = plan.name.includes("연간") || plan.name.includes("데스크톱");
      const trialDays = plan.isFree ? 7 : (isYearly ? 365 : 30); // 🛡️ 무료 체험 기간 설정
      const interval = plan.isFree ? 'trial' : (isYearly ? 'year' : 'month'); // 🛡️ 구독 간격 설정
      const periodEnd = new Date(Date.now() + trialDays * 86400000).toISOString(); // 🛡️ 기간 종료일 설정

      // ⏳ 한국 시간대 기준 오늘 날짜 계산 (YYYYMMDD 규격 완벽 고수)
      const kstOffset = 9 * 60 * 60 * 1000; // ⏰ 9시간 오프셋
      const todayKst = new Date(Date.now() + kstOffset); // ⏰ 한국 시간대 오늘 날짜
      const yyyy = todayKst.getUTCFullYear ? todayKst.getUTCFullYear() : todayKst.getFullYear(); // ⏰ 연도 추출
      const mm = String(todayKst.getMonth ? todayKst.getMonth() + 1 : todayKst.getUTCMonth() + 1).padStart(2, '0'); // ⏰ 월 추출
      const dd = String(todayKst.getDate ? todayKst.getDate() : todayKst.getUTCDate()).padStart(2, '0'); // ⏰ 일 추출
      const todayStr = `${yyyy}${mm}${dd}`; // ⏰ YYYYMMDD 형식

      // 기기 디바이스 UUID 획득
      let deviceUuid = localStorage.getItem('onrivi_session_id') || localStorage.getItem('onrivi_device_id');
      if (!deviceUuid) { // 🛡️ 디바이스 UUID가 없을 때
        deviceUuid = generateSafeFallbackUUID(); // 🔐 안전 UUID 생성
        localStorage.setItem('onrivi_device_id', deviceUuid); // 🔒 디바이스 UUID 저장
      }
      localStorage.setItem('onrivi_session_id', deviceUuid); // 🔒 세션 ID 저장

      const deviceName = typeof navigator !== 'undefined' ? (navigator.userAgent || 'Web Browser') : 'Web Browser'; // 🛡️ 디바이스 이름 설정
      const calculatedStatus = plan.isFree ? 'FREE' : 'ACTIVE'; // 🛡️ 상태 계산

      // 📢 스토어드 프로시저 호출 (subscriptions, software_licenses, license_activations 업데이트/생성 단일 트랜잭션 처리)
      const { data: result, error: rpcErr } = await supabase.rpc('subscribe_user_plan', {
        p_user_id: user.id, // 🔑 사용자 ID
        p_plan_name: plan.name, // 🎯 요금제 이름
        p_plan_status: calculatedStatus, // 🛡️ 상태
        p_billing_interval: interval, // 🛡️ 구독 간격
        p_max_devices: maxDevices, // 🔒 최대 기기 수
        p_period_end: periodEnd, // 🛡️ 기간 종료일
        p_plan_end_date: '99991231', // 🛡️ 최대 종료일
        p_today_str: todayStr, // ⏰ 오늘 날짜
        p_device_uuid: deviceUuid, // 🔐 디바이스 UUID
        p_device_name: deviceName // 🛡️ 디바이스 이름
      });

      if (rpcErr) throw new Error(rpcErr.message); // ❌ RPC 오류
      if (!result || !result.success) throw new Error(result.message || '플랜 활성화 실패'); // ❌ 결과 오류

      // -------------------------------------------------------------------------------------------
      // 로컬 스토리지 정보 동기화
      // -------------------------------------------------------------------------------------------
      localStorage.setItem('onrivi_license_key', result.license_key || ''); // 🔒 라이선스 키 저장
      localStorage.setItem('onrivi_verify_key', result.verify_key || ''); // 🔒 인증 키 저장
      localStorage.setItem('onrivi_user_id', user.id); // 🔒 사용자 ID 저장
      localStorage.setItem('onrivi_payment_no', result.payment_no || ''); // 🔒 결제 번호 저장
      localStorage.setItem('onrivi_last_run_time', Date.now().toString()); // 🔒 마지막 실행 시간 저장
      // -------------------------------------------------------------------------------------------

      // ------------------------------------------------------------------------------------------ 
      // 🚨 [핵심]: 구독 신청 성공 시, 로컬 스토리지의 'onrivi_trial_claimed' 플래그를 즉시 삭제합니다.
      // ------------------------------------------------------------------------------------------

      showToast(`${plan.name} 플랜이 성공적으로 활성화되었습니다!`, 'success'); // 📢 토스트 알림
      await loadDashboardData(); // 🔄 대시보드 데이터 로드
    } catch (err: any) {
      console.error("❌ [Onrivi Purchase Terminal Critical Error]:", err); // ❌ 에러 로깅
      showToast(`플랜 활성화 실패: ${err.message}`, 'error'); // 📢 에러 토스트
    } finally {
      setActionLoading(null); // ❌ 로딩 상태 해제
    }
  };

  // ------------------------------------------------------------------------------------------------  
  // 상태 배지 컴포넌트
  // ------------------------------------------------------------------------------------------------
  const getStatusBadge = () => {
    if (isLicenseValid && subscription?.plan_status !== 'FREE')
      return { label: '정품 인증 완료', color: T.success, bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.25)', icon: <CheckCircle size={13} /> };
    if (isLicenseValid && subscription?.plan_status === 'FREE')
      return { label: `무료 체험 중 (${getRemainingDays()}일 남음)`, color: T.primary, bg: 'rgba(14,165,233,0.10)', border: 'rgba(14,165,233,0.25)', icon: <Zap size={13} /> };
    return { label: '라이선스 만료 / 미인증', color: T.danger, bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.20)', icon: <XCircle size={13} /> };
  };
  const badge = getStatusBadge();

  // ── 로딩 ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.font }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <RefreshCw size={32} style={{ color: T.primary, animation: "spin 1s linear infinite" }} />
          <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
          <p style={{ fontSize: 14, color: T.muted, fontWeight: 500 }}>마이페이지 정보 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // ── 메인 레이아웃 ──────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.font }}>

      {/* ── 상단 네비게이션 ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,0.80)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: `1px solid ${T.border}`,
        padding: "0 24px",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <img src="/icon.png" alt="Onrivi" style={{ width: 30, height: 30, borderRadius: 8 }} />
              <span style={{ fontWeight: 700, fontSize: 16, color: T.onSurface }}>Onrivi Author</span>
            </Link>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: T.muted, fontWeight: 500 }} className="hidden sm:block">{user?.email} 님</span>
            <Link href="/editor">
              <button className="btn-primary" style={{ fontSize: 12, padding: "6px 14px" }}>에디터 열기</button>
            </Link>
            <button
              onClick={handleLogout}
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.muted, fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: "6px 10px", borderRadius: 8, transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(71,85,105,0.06)")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              <LogOut size={13} /> 로그아웃
            </button>
          </div>
        </div>
      </nav>

      {/* ── 본문 ── */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* 환영 카드 */}
        <div style={{ ...glassCard, padding: "24px 28px", marginBottom: 24, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: "1rem", background: "linear-gradient(135deg, #006591 0%, #0ea5e9 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#fff", fontWeight: 700, boxShadow: "0 4px 14px rgba(14,165,233,0.25)", flexShrink: 0 }}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 700, color: T.onSurface, marginBottom: 4, letterSpacing: "-0.01em" }}>
                {user?.email?.split('@')[0]}님, 환영합니다!
              </h1>
              <p style={{ fontSize: 12, color: T.subtle }}>
                {user?.email} · 가입일: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
              </p>
            </div>
          </div>
          <Link href="/editor">
            <button className="btn-primary" style={{ fontSize: 13, padding: "10px 20px", display: "flex", alignItems: "center", gap: 6 }}>
              웹 에디터 열기 <ArrowRight size={14} />
            </button>
          </Link>
        </div>

        {/* 정보 카드 3열 */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {/* 사용자 정보 */}
          <div style={{ ...glassCard, padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <User size={14} style={{ color: T.subtle }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: T.subtle, letterSpacing: "0.06em", textTransform: "uppercase" }}>사용자 정보</span>
            </div>
            {[
              ["이메일", user?.email || '-'],
              ["제공자", userMeta?.provider || user?.app_metadata?.provider || 'email'],
              ["가입일", user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'],
              ["UUID", user?.id?.substring(0, 12) + '...' || '-'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12 }}>
                <span style={{ color: T.subtle }}>{label}</span>
                <span style={{ color: T.onSurface, fontWeight: 500, maxWidth: 160, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</span>
              </div>
            ))}
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.border}`, display: "flex", gap: 10 }}>
              <button
                onClick={handleDeleteAccount}
                style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0, transition: "color 0.15s", textDecoration: "underline", textUnderlineOffset: 3 }}
                onMouseEnter={e => (e.currentTarget.style.color = T.danger)}
                onMouseLeave={e => (e.currentTarget.style.color = "#94a3b8")}
              >
                회원 탈퇴
              </button>
            </div>
          </div>

          {/* 라이선스 상태 */}
          <div style={{ ...glassCard, padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <ShieldCheck size={14} style={{ color: T.subtle }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: T.subtle, letterSpacing: "0.06em", textTransform: "uppercase" }}>라이선스 상태</span>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 9999, background: badge.bg, border: `1px solid ${badge.border}`, color: badge.color, fontSize: 12, fontWeight: 600, marginBottom: 14 }}>
              {badge.icon} {badge.label}
            </div>
            {[
              ["현재 플랜", subscription?.plan_name || '없음'],
              ["최대 접속", `${subscription?.max_devices || 0}회`],
              ["결제번호", license?.payment_no ? license.payment_no.replace(/(?<=.{7})./g, '*') : '-'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12 }}>
                <span style={{ color: T.subtle }}>{label}</span>
                <span style={{ color: T.onSurface, fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>

          {/* 구독 내역 */}
          <div style={{ ...glassCard, padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Calendar size={14} style={{ color: T.subtle }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: T.subtle, letterSpacing: "0.06em", textTransform: "uppercase" }}>구독 내역</span>
            </div>
            {[
              ["시작일", subscription?.trial_start_at ? new Date(subscription.trial_start_at).toLocaleDateString() : '-'],
              ["만료일", (subscription?.trial_end_at || subscription?.current_period_end) ? new Date(subscription.trial_end_at || subscription.current_period_end!).toLocaleDateString() : '-'],
              ["남은 기간", `${getRemainingDays()}일`],
              ["청구 주기", subscription?.billing_interval || '-'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12 }}>
                <span style={{ color: T.subtle }}>{label}</span>
                <span style={{ color: label === "남은 기간" ? (isTrialExpired ? T.danger : T.success) : T.onSurface, fontWeight: 500 }}>{value}</span>
              </div>
            ))}
            {subscription && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
                <button
                  onClick={handleCancelSubscription}
                  style={{ fontSize: 12, color: T.muted, fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0, transition: "color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = T.danger)}
                  onMouseLeave={e => (e.currentTarget.style.color = T.muted)}
                >
                  구독 해지
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 원클릭 연동 + 세션 관리 */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Desktop Connector */}
          <div style={{ ...glassCard, padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: T.subtle, letterSpacing: "0.06em", textTransform: "uppercase" }}>Desktop Connector</span>
              <Key size={16} style={{ color: T.primary }} />
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.onSurface, marginBottom: 8 }}>데스크톱 앱 원클릭 정품인증</h2>
            <p style={{ fontSize: 13, color: T.muted, lineHeight: "20px", marginBottom: 16 }}>
              사용 중인 로컬 PC에 설치된 온리비 어서 데스크톱 앱의 잠금을 해제합니다.
            </p>
            {desktopDevice ? (
              <div style={{ padding: "12px 14px", background: "rgba(14,165,233,0.05)", border: `1px solid rgba(14,165,233,0.15)`, borderRadius: "0.75rem", marginBottom: 16, fontSize: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: T.subtle }}>기기 식별자</span>
                  <span style={{ color: T.onSurface, fontWeight: 600 }}>{desktopDevice.substring(0, 20)}...</span>
                </div>
                {desktopLicense?.payment_no && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: T.subtle }}>정품결제번호</span>
                    <span style={{ color: T.onSurface, fontWeight: 600, fontFamily: "monospace" }}>{desktopLicense.payment_no.replace(/(?<=.{7})./g, '*')}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: T.subtle }}>연동 준비</span>
                  <span style={{ color: T.success, fontWeight: 600 }}>✓ 데스크탑 앱 대기중</span>
                </div>
                {desktopSubscription && (
                  <div style={{ marginTop: 8, paddingTop: 10, borderTop: `1px solid rgba(14,165,233,0.1)`, textAlign: 'right' }}>
                    <button
                      onClick={handleCancelDesktopSubscription}
                      style={{ fontSize: 12, color: T.danger, fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      구독 해지
                    </button>
                  </div>
                )}
              </div>
            ) : desktopSubscription && desktopLicense ? (
              <div style={{ padding: "12px 14px", background: "rgba(14,165,233,0.05)", border: `1px solid rgba(14,165,233,0.15)`, borderRadius: "0.75rem", marginBottom: 16, fontSize: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: T.subtle }}>정품결제번호</span>
                  <span style={{ color: T.onSurface, fontWeight: 600, fontFamily: "monospace" }}>{desktopLicense.payment_no.replace(/(?<=.{7})./g, '*')}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: T.subtle }}>인증 상태</span>
                  <span style={{ color: T.success, fontWeight: 600 }}>✓ 데스크탑 연동 활성화됨</span>
                </div>
                <div style={{ marginTop: 8, paddingTop: 10, borderTop: `1px solid rgba(14,165,233,0.1)`, textAlign: 'right' }}>
                  <button
                    onClick={handleCancelDesktopSubscription}
                    style={{ fontSize: 12, color: T.danger, fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  >
                    구독 해지
                  </button>
                </div>
              </div>
            ) : license ? (
              <div style={{ padding: "12px 14px", background: "rgba(14,165,233,0.05)", border: `1px solid rgba(14,165,233,0.15)`, borderRadius: "0.75rem", marginBottom: 16, fontSize: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: T.subtle }}>정품결제번호</span>
                  <span style={{ color: T.onSurface, fontWeight: 600, fontFamily: "monospace" }}>{license.payment_no.replace(/(?<=.{7})./g, '*')}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: T.subtle }}>인증 상태</span>
                  <span style={{ color: T.success, fontWeight: 600 }}>✓ 대시보드 준비완료</span>
                </div>
              </div>
            ) : (
              <div style={{ padding: "12px 14px", background: "rgba(239,68,68,0.05)", border: `1px solid rgba(239,68,68,0.15)`, borderRadius: "0.75rem", marginBottom: 16, fontSize: 12, display: "flex", alignItems: "center", gap: 8, color: T.danger }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                데스크탑 앱에서 [구독 페이지 이동] 버튼을 클릭해 주세요.
              </div>
            )}
            <button
              onClick={handleDesktopActivate}
              disabled={!desktopLicense?.payment_no && !desktopDevice}
              style={{
                width: "100%", padding: "10px", borderRadius: "0.75rem",
                background: (!desktopLicense?.payment_no && !desktopDevice) ? "rgba(14,165,233,0.05)" : T.primary,
                color: (!desktopLicense?.payment_no && !desktopDevice) ? T.subtle : "#fff",
                border: `1px solid ${(!desktopLicense?.payment_no && !desktopDevice) ? T.border : "transparent"}`,
                fontSize: 13, fontWeight: 600, cursor: (!desktopLicense?.payment_no && !desktopDevice) ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                transition: "all 0.15s", opacity: (!desktopLicense?.payment_no && !desktopDevice) ? 0.6 : 1,
              }}
            >
              <ShieldCheck size={15} /> 
              {desktopLicense?.payment_no ? "프로그램 실행하기 ↗" : "결제하고 실행하기 (연 45,000원) ↗"}
            </button>
          </div>

          {/* 세션 관리 */}
          <div style={{ ...glassCard, padding: "24px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexShrink: 0 }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: T.onSurface }}>
                  동시접속 세션 관리 ({devices.length} / {subscription?.max_devices || 0})
                </h2>
                <p style={{ fontSize: 12, color: T.subtle, marginTop: 2 }}>한도 초과 시 기존 세션을 해제해 주세요.</p>
              </div>
              <Laptop size={18} style={{ color: T.subtle, flexShrink: 0 }} />
            </div>

            <div style={{ flex: 1, overflowY: "auto", maxHeight: 180, border: "1px solid rgba(14,165,233,0.1)", borderRadius: "0.5rem" }} className="custom-scrollbar">
              {devices.length === 0 ? (
                <div style={{ padding: "28px 0", textAlign: "center", fontSize: 13, color: T.subtle }}>
                  현재 접속 중인 세션이 없습니다.
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "rgba(14,165,233,0.05)", borderBottom: "1px solid rgba(14,165,233,0.1)" }}>
                      <th style={{ padding: "8px 12px", color: T.muted, fontWeight: 600 }}>접속 기기</th>
                      <th style={{ padding: "8px 12px", color: T.muted, fontWeight: 600 }}>최근 접속시간</th>
                      <th style={{ padding: "8px 12px", color: T.muted, fontWeight: 600, textAlign: "right" }}>작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const currentSessionId = typeof window !== 'undefined'
                        ? (localStorage.getItem('onrivi_session_id') || localStorage.getItem('onrivi_device_id'))
                        : null;
                      return devices.map((device) => {
                        const isCurrent = currentSessionId === device.device_uuid && device.is_active_license;
                        return (
                          <tr
                            key={device.id}
                            style={{
                              borderBottom: "1px solid rgba(14,165,233,0.06)",
                              background: isCurrent ? "rgba(16,185,129,0.03)" : "transparent",
                            }}
                          >
                            <td style={{ padding: "10px 12px", verticalAlign: "middle" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <Laptop size={14} style={{ color: isCurrent ? T.success : T.primary, flexShrink: 0 }} />
                                <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                                  <span style={{ fontWeight: 600, color: T.onSurface, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: 120 }} title={device.device_name}>
                                    {device.device_name}
                                  </span>
                                  <span style={{ fontSize: 9, color: T.subtle, fontFamily: "monospace", marginTop: 1 }}>
                                    {device.device_uuid}
                                  </span>
                                  {isCurrent && (
                                    <span style={{ fontSize: 9, fontWeight: 700, color: T.success, alignSelf: "flex-start" }}>
                                      [현재 접속]
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: "10px 12px", color: T.subtle, fontFamily: "monospace", verticalAlign: "middle" }}>
                              {new Date(device.activated_at).toLocaleDateString()}<br />
                              {new Date(device.activated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td style={{ padding: "10px 12px", textAlign: "right", verticalAlign: "middle" }}>
                              <button
                                onClick={() => handleDeactivateDevice(device.id)}
                                disabled={actionLoading === device.id || isCurrent}
                                style={{
                                  padding: "4px 8px", borderRadius: "0.375rem", fontSize: 11, fontWeight: 600,
                                  cursor: (actionLoading === device.id || isCurrent) ? "not-allowed" : "pointer",
                                  background: isCurrent ? "transparent" : "rgba(239,68,68,0.06)",
                                  color: isCurrent ? T.subtle : T.danger,
                                  border: `1px solid ${isCurrent ? "transparent" : "rgba(239,68,68,0.20)"}`,
                                  opacity: (actionLoading === device.id || isCurrent) ? 0.5 : 1,
                                  transition: "all 0.15s",
                                }}
                              >
                                {actionLoading === device.id ? '...' : isCurrent ? '보안' : '해제'}
                              </button>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
        {/* 요금제 선택 */}
        <div style={{ ...glassCard, padding: "28px", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${T.border}`, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: T.onSurface, display: "flex", alignItems: "center", gap: 8 }}>
                <CreditCard size={17} style={{ color: T.primary }} /> 웹요금제 선택 / 결제
              </h2>
              <p style={{ fontSize: 12, color: T.subtle, marginTop: 4 }}>
                원하는 요금제를 선택하여 결제를 진행하세요. 현재 플랜:{" "}
                <span style={{ color: T.primary, fontWeight: 600 }}>{subscription?.plan_name || '없음'}</span>
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {plans.map((plan) => {
              // 현재 플랜인지 여부 판별 (청구 주기도 함께 일치해야 함)
              const planBillingInterval = plan.name.includes("연간") || plan.name.includes("데스크톱") ? 'year' : 'month';
              const isSameInterval = plan.isFree ? true : subscription?.billing_interval === planBillingInterval;
              const isCurrentPlan = subscription?.plan_name === plan.name && (subscription?.plan_status === 'ACTIVE' || subscription?.plan_status === 'FREE') && isSameInterval;

              const priceVal = plan.isFree ? 0 : (plan.name.includes("연간") || plan.name.includes("데스크톱") ? plan.priceYearly : plan.priceMonthly);
              const suffix = plan.isFree ? "" : (plan.name.includes("연간") || plan.name.includes("데스크톱") ? "/년" : "/월");

              return (
                <div
                  key={plan.name}
                  style={{
                    position: "relative",
                    background: plan.highlighted ? "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(99,102,241,0.12) 100%)" : "rgba(255,255,255,0.5)",
                    border: `1px solid ${isCurrentPlan ? "rgba(16,185,129,0.35)" : plan.highlighted ? "rgba(99,102,241,0.35)" : T.border}`,
                    borderRadius: "1rem",
                    padding: "20px 16px",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.15s, box-shadow 0.15s",
                    boxShadow: plan.highlighted ? "0 4px 16px rgba(99,102,241,0.12)" : "none",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(99,102,241,0.12)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "none"; (e.currentTarget as HTMLDivElement).style.boxShadow = plan.highlighted ? "0 4px 16px rgba(99,102,241,0.12)" : "none"; }}
                >
                  {plan.badge && (
                    <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", padding: "2px 12px", background: "linear-gradient(135deg, #4f46e5, #6366f1)", borderRadius: 9999, fontSize: 10, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", boxShadow: "0 2px 8px rgba(99,102,241,0.3)" }}>
                      {plan.badge}
                    </div>
                  )}
                  {isCurrentPlan && (
                    <div style={{ position: "absolute", top: 8, right: 8, padding: "2px 8px", background: "rgba(16,185,129,0.12)", color: T.success, borderRadius: 9999, fontSize: 10, fontWeight: 700, border: "1px solid rgba(16,185,129,0.25)" }}>
                      현재 플랜
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    {plan.isFree ? <Zap size={15} style={{ color: T.subtle }} /> : <Crown size={15} style={{ color: plan.highlighted ? T.primary : T.subtle }} />}
                    <span style={{ fontSize: 14, fontWeight: 700, color: T.onSurface }}>{plan.name}</span>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: T.onSurface, marginBottom: 2 }}>
                    {plan.isFree ? '무료' : `${priceVal?.toLocaleString()}원`}
                    {!plan.isFree && <span style={{ fontSize: 12, fontWeight: 400, color: T.subtle }}>{suffix}</span>}
                  </div>
                  <p style={{ fontSize: 11, color: T.subtle, marginBottom: 14 }}>{plan.tagline}</p>
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", display: "flex", flexDirection: "column", gap: 6, flexGrow: 1 }}>
                    {plan.features.map((f, i) => (
                      <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 7, fontSize: 11, color: T.muted }}>
                        <CheckCircle size={12} style={{ color: T.success, flexShrink: 0, marginTop: 1 }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => {
                      if (!plan.isFree) {
                        showToast('현재 시스템 공사 중인 요금제입니다. 무료 체험을 이용해 주세요.', 'warning');
                        return;
                      }
                      handleSelectPlan(plan);
                    }}
                    disabled={isCurrentPlan || actionLoading === 'plan_' + plan.name || !plan.isFree}
                    style={{
                      width: "100%", padding: "9px 0", borderRadius: "0.75rem",
                      fontSize: 12, fontWeight: 700, cursor: (isCurrentPlan || actionLoading === 'plan_' + plan.name || !plan.isFree) ? "not-allowed" : "pointer",
                      transition: "all 0.15s",
                      background: !plan.isFree ? "rgba(226,232,240,0.4)" : (plan.highlighted ? T.primary : "rgba(99,102,241,0.06)"),
                      color: !plan.isFree ? T.subtle : (plan.highlighted ? "#fff" : T.primaryDark),
                      border: `1px solid ${!plan.isFree ? "rgba(226,232,240,0.8)" : (plan.highlighted ? "transparent" : "rgba(99,102,241,0.25)")}`,
                      opacity: (isCurrentPlan || actionLoading === 'plan_' + plan.name || !plan.isFree) ? 0.6 : 1,
                    }}
                  >
                    {actionLoading === 'plan_' + plan.name ? '처리 중...' : isCurrentPlan ? '✓ 현재 플랜' : plan.isFree ? plan.cta : '공사중'}
                  </button>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(99,102,241,0.04)", border: `1px solid rgba(99,102,241,0.10)`, borderRadius: "0.75rem", fontSize: 12, color: T.subtle, lineHeight: "18px" }}>
            <strong style={{ color: T.primary }}>💳 결제 안내:</strong> 현재 결제 데모 모드입니다. 실제 결제 시 PG사(토스페이먼츠, 아임포트 등) 결제창으로 연결됩니다. 요금제 업그레이드는 즉시 반영되며, 다운그레이드는 다음 결제일부터 적용됩니다.
          </div>
        </div>

        {/* 요금제 변동 히스토리 테이블 */}
        <div style={{ ...glassCard, padding: "28px" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: T.onSurface, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <Calendar size={17} style={{ color: T.primary }} /> 사용자 요금제 변동내역
          </h2>
          <div style={{ overflowX: "auto", border: `1px solid ${T.border}`, borderRadius: "0.75rem" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
              <thead>
                <tr style={{ background: "rgba(99,102,241,0.05)", borderBottom: `1px solid ${T.border}` }}>
                  <th style={{ padding: "12px 16px", color: T.muted, fontWeight: 600 }}>계약시작일</th>
                  <th style={{ padding: "12px 16px", color: T.muted, fontWeight: 600 }}>요금제</th>
                  <th style={{ padding: "12px 16px", color: T.muted, fontWeight: 600 }}>청구 주기</th>
                  <th style={{ padding: "12px 16px", color: T.muted, fontWeight: 600 }}>종료/갱신일</th>
                  <th style={{ padding: "12px 16px", color: T.muted, fontWeight: 600, textAlign: "right" }}>상태</th>
                </tr>
              </thead>
              <tbody>
                {historyList.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "32px 0", textAlign: "center", color: T.subtle }}>
                      요금제 변동 내역이 아직 없습니다.
                    </td>
                  </tr>
                ) : (
                  historyList.map((hist) => {
                    let badgeColor = T.muted;
                    let badgeBg = "rgba(71,85,105,0.08)";
                    if (hist.plan_status === 'ACTIVE' || hist.plan_status === 'FREE') {
                      badgeColor = T.success;
                      badgeBg = "rgba(16,185,129,0.08)";
                    } else if (hist.plan_status === 'EXPIRED') {
                      badgeColor = T.danger;
                      badgeBg = "rgba(239,68,68,0.08)";
                    }
                    // 날짜 문자열 포맷팅 헬퍼 (YYYYMMDD -> YYYY. MM. DD.)
                    const formatDateStr = (str?: string) => {
                      if (!str) return '-';
                      if (str === '99991231') return '무제한 (미만료)';
                      if (str.length === 8) {
                        return `${str.substring(0, 4)}. ${str.substring(4, 6)}. ${str.substring(6, 8)}.`;
                      }
                      return str;
                    };

                    return (
                      <tr key={hist.id} style={{ borderBottom: `1px solid rgba(99,102,241,0.05)` }}>
                        <td style={{ padding: "12px 16px", color: T.onSurface }}>
                          {formatDateStr(hist.plan_start_date)}
                        </td>
                        <td style={{ padding: "12px 16px", fontWeight: 600, color: T.onSurface }}>
                          {hist.plan_name}
                        </td>
                        <td style={{ padding: "12px 16px", color: T.muted }}>
                          {(hist.billing_interval === 'year' || hist.billing_interval === 'yearly') ? '연간 결제' : (hist.billing_interval === 'month' || hist.billing_interval === 'monthly') ? '월간 결제' : '무료 체험'}
                        </td>
                        <td style={{ padding: "12px 16px", color: T.muted }}>
                          {formatDateStr(hist.plan_end_date)}
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right" }}>
                          <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: "9999px", fontSize: 11, fontWeight: 600, color: badgeColor, background: badgeBg }}>
                            {hist.plan_status === 'ACTIVE' ? '사용 중' : hist.plan_status === 'FREE' ? '무료 체험 중' : '만료됨'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText || '확인'}
        cancelText="취소"
        isDanger={confirmModal.isDanger}
        onConfirm={() => { confirmModal.resolve?.(true); setConfirmModal(prev => ({ ...prev, isOpen: false })); }}
        onCancel={() => { confirmModal.resolve?.(false); setConfirmModal(prev => ({ ...prev, isOpen: false })); }}
      />
    </div>
  );
}
