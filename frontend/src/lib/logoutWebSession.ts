import { supabase } from '@/lib/supabaseClient';

// 세션 해제가 실패하면 호출자가 로그아웃을 멈추고 재시도할 수 있게 오류를 전달한다.
export async function logoutCurrentWebSession(): Promise<number> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return 0;

  const deviceUuid = sessionStorage.getItem('onrivi_tab_session_id');
  if (!deviceUuid) throw new Error('현재 탭의 세션 정보를 찾을 수 없습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요.');

  const response = await fetch('/api/device/logout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ device_uuid: deviceUuid }),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success) {
    throw new Error(result?.message || '웹 세션 해제에 실패했습니다.');
  }
  return result.deleted || 0;
}
