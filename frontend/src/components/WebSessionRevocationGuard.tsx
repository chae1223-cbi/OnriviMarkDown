'use client';

import { useEffect } from 'react';

// ====================================================================
// 📊 [OMD-CORE-WebSessionRevocationGuard-0001] WebSessionRevocationGuard
// 🎯 @KICK  : 웹 세션 만료/해제 감시 가드 - 에디터 밖 페이지에서도 본인 웹 세션 해제 시 로컬 정리 및 로그아웃 유도
// 🛡️ @GUARD : Electron 데스크톱 앱 무조건 스킵, 세션 토큰 미존재 시 불필요한 Supabase 모듈 로딩 원천 차단
// 🚨 @PATCH : **2026-10-02** — [Supabase 클라이언트 동적 지연 임포트(Lazy Dynamic Import)]: 루트 layout.js에 2.8MB Supabase 라이브러리가 번들링되어 첫 로딩 지연 및 layout.js:500 SyntaxError 발생하던 문제 완전 해결. 실제 탭 세션 존재 시에만 비동기 import 수행
// 🔗 @CALLS : /api/device/session-status
// ====================================================================

export function WebSessionRevocationGuard() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as any).electronAPI || navigator.userAgent.toLowerCase().includes('electron') ||
        new URLSearchParams(window.location.search).get('env') === 'desktop') return;

    let observedKey = '';
    let hadSession = false;
    let inFlight = false;
    let signingOut = false;
    let disposed = false;

    const checkSession = async () => {
      if (inFlight || signingOut || disposed) return;
      const deviceUuid = sessionStorage.getItem('onrivi_tab_session_id');
      if (!deviceUuid) return;

      inFlight = true;
      try {
        const [{ supabase }, { clearAuthSessionStorage }] = await Promise.all([
          import('@/lib/supabaseClient'),
          import('@/lib/authSessionHelper'),
        ]);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token || !session.user?.id || disposed) return;

        const key = `${session.user.id}:${deviceUuid}`;
        if (observedKey !== key) {
          observedKey = key;
          hadSession = false;
        }

        const response = await fetch(`/api/device/session-status?device_uuid=${encodeURIComponent(deviceUuid)}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: 'no-store',
        });
        if (!response.ok || disposed) return;

        const data = await response.json() as { exists?: boolean };
        if (data.exists === true) {
          hadSession = true;
        } else if (data.exists === false && hadSession) {
          signingOut = true;
          try {
            await supabase.auth.signOut({ scope: 'local' });
          } finally {
            clearAuthSessionStorage();
            window.location.replace('/login?session=revoked');
          }
        }
      } catch (error) {
        // 일시적인 네트워크·DB 오류만으로 사용자를 로그아웃시키지 않는다.
        console.warn('[web session] revocation check failed', error);
      } finally {
        inFlight = false;
      }
    };

    void checkSession();
    const timer = window.setInterval(() => { void checkSession(); }, 5000);
    const checkOnFocus = () => { void checkSession(); };
    const checkOnVisibility = () => { if (document.visibilityState === 'visible') void checkSession(); };
    window.addEventListener('focus', checkOnFocus);
    document.addEventListener('visibilitychange', checkOnVisibility);
    return () => {
      disposed = true;
      window.clearInterval(timer);
      window.removeEventListener('focus', checkOnFocus);
      document.removeEventListener('visibilitychange', checkOnVisibility);
    };
  }, []);

  return null;
}
