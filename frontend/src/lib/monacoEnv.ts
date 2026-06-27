import { loader } from '@monaco-editor/react';

// ====================================================================
// 📊 [OMD-EDIT-monacoEnv-0001] monacoEnv.ts ➔ configureMonacoEnvironment
// 🎯 @KICK  : Monaco Editor 워커/로더 경로를 로컬(Electron/Web) 또는 Extension 환경에 맞게 구성
// 🛡️ @GUARD : window 부재, Extension 환경(chrome.runtime.id) 조기 반환
// 🚨 @PATCH : loader.config try-catch로 미초기화 상태 무시
// 🔗 @CALLS : 없음
// ====================================================================
export function configureMonacoEnvironment(): void {
  if (typeof window === 'undefined') return;

  const isExtension = !!((window as any).chrome?.runtime?.id);

  if (isExtension) return; // page.tsx 모듈 레벨에서 처리됨

  // Electron/Local Web: 로컬 Monaco 워커 사용
  (window as any).MonacoEnvironment = {
    getWorkerUrl: (_moduleId: string, label: string) => {
      const map: Record<string, string> = {
        json: 'language/json/json.worker.js',
        css: 'language/css/css.worker.js',
        html: 'language/html/html.worker.js',
        typescript: 'language/typescript/ts.worker.js',
        javascript: 'language/typescript/ts.worker.js',
      };
      return `./monaco-editor/min/vs/${map[label] || 'base/worker/workerMain.js'}`;
    }
  };

  // Monaco loader 경로를 로컬로 설정 (dev: Next.js public/, packaged: out/)
  // 이렇게 하면 loader.js, editor.main.css 등 모든 리소스가 로컬에서 로드됨
  try {
    loader.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.50.0/min/vs' } });
  } catch {
    // 로더가 아직 초기화되지 않은 경우 무시 (onMount에서 처리됨)
  }
}
