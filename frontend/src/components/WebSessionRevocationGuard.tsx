'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { clearAuthSessionStorage } from '@/lib/authSessionHelper';

// 에디터 밖의 페이지에서도 본인 웹 세션이 해제되면 해당 브라우저만 로그아웃한다.
export function WebSessionRevocationGuard() {
  useEffect(() => {
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
          clearAuthSessionStorage();
          try {
            await supabase.auth.signOut({ scope: 'local' });
          } finally {
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
