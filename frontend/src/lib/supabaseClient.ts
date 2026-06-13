import { createClient } from '@supabase/supabase-js';

// 💡 [한글 주석] 빌드 시점에 환경변수가 제공되지 않아도 Prerendering 컴파일 오류로 붕괴하지 않도록 플레이스홀더 기본값을 부여합니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project-id.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-public-key';

if (supabaseUrl.includes('placeholder-project-id')) {
  console.warn(
    '⚠️ Supabase 환경 변수 설정이 비어 있어 임시 플레이스홀더 키로 작동 중입니다. .env 파일을 확인해 주세요.'
  );
}

// 💡 [한글 주석] 어플리케이션 전역에서 공유할 Supabase Client 싱글톤 인스턴스 초기화 및 익스포트
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
