/**
 * Onrivi Author API URL 헬퍼 함수
 * 
 * 1. 개발 모드(Next.js dev server - port 3000~3999)일 때는 고정된 백엔드 주소(http://localhost:4000)를 사용합니다.
 * 2. 일렉트론 및 프로덕션 모드(Express 포트 서빙)일 때는 포트 충돌 방지용 동적 포트를 지원하기 위해
 *    현재 브라우저 창의 도메인/포트를 기준으로 하는 상대 경로를 사용합니다.
 */
export const getApiUrl = (path: string): string => {
  if (typeof window !== 'undefined') {
    if (window.location.protocol === 'chrome-extension:') {
      return `http://localhost:4000${path}`;
    }
    const port = parseInt(window.location.port, 10);
    const isNextDev = port >= 3000 && port < 4000;
    const base = isNextDev ? 'http://localhost:4000' : '';
    return `${base}${path}`;
  }
  return `http://localhost:4000${path}`;
};
