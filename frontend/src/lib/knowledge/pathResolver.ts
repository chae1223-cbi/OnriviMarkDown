// ====================================================================
// 📊 [OMD-CORE-pathResolver-0001] pathResolver.ts ➔ Knowledge Absolute Path Resolver
// 🎯 @KICK  : 웹 브라우저 및 로컬/서버 전 환경에서 유입된 상대경로를 실제 로컬 디스크 절대경로(E:/..., D:/...)로 탐색, 정규화, 승격
// 🛡️ @GUARD : Rule 1(문서/주석 동기화), Rule 2(대문자 코드값), 단계 탐색 배제(로컬스토리지 작업장 절대경로 다이렉트 직결)
// 🚨 @PATCH : **2026-09-13** — [규칙 9: 임의 폴백 및 하드코딩 시딩 전면 배제, 작업장 경로 부재 시 즉시 오류 발생]
//             1) 로컬스토리지의 onrivi_workspace_path가 존재하지 않는 경우 임의의 기본값(D:/, 리소스폴더 상위 디렉토리 등)으로 자동 폴백하거나 하드코딩 시딩하지 않고 명시적 에러(throw Error)를 즉시 발생
//             2) resolveDiskAbsolutePath에서 safeWorkspacePath 미탐색 시 D:\ 드라이브 임의 폴백을 완전히 제거하고 에러 발생
//             3) 사용자 규칙 9(임의 폴백 원천 금지 및 사용자 사전 확인 규칙) 엄격 준수
//             **2026-09-12** — [작업장 폴더 선택 시점에 절대경로 1회 저장 및 다이렉트 직결]
//             1) 작업장 폴더 선택 시점에 절대경로를 로컬스토리지(onrivi_workspace_path, rootFolder)에 1회 저장 완료
//             2) 지식 문서 등록 시 다단계 스캔/탐색을 전면 배제하고 buildDirectWorkspacePath로 로컬스토리지의 작업장 절대경로와 파일 상대경로를 즉시 다이렉트 연결
// 🔗 @CALLS : node:fs, node:path, @/lib/knowledge/knowledgeDb
// ====================================================================

import { resolveSafeResourceFolder } from './knowledgeDb';

/**
 * Node.js 환경에서 fs/path 모듈 동적 로드 (Webpack/브라우저 번들러 에러 방지)
 */
function getNodeModules() {
  if (typeof window !== 'undefined') {
    return { fs: null, path: null };
  }
  try {
    const proc = (globalThis as any).process;
    if (proc && typeof proc.getBuiltinModule === 'function') {
      return {
        fs: proc.getBuiltinModule('node:fs'),
        path: proc.getBuiltinModule('node:path'),
      };
    }
    return {
      fs: require('fs'),
      path: require('path'),
    };
  } catch {
    return { fs: null, path: null };
  }
}

/**
 * 디렉토리 하위를 최대 maxDepth까지 재귀 검색하여 특정 이름의 폴더를 찾습니다.
 * (작업장 폴더 선택 시 1회 절대경로 감지용)
 */
function findDirectoryDeep(fs: any, path: any, currentDir: string, targetDirName: string, depth: number, maxDepth: number): string | null {
  if (depth > maxDepth) return null;
  try {
    if (!fs.existsSync(currentDir)) return null;
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const full = path.join(currentDir, entry.name);
        if (entry.name.toLowerCase() === targetDirName.toLowerCase()) {
          return full;
        }
        if (entry.name.startsWith('.') || entry.name.startsWith('$') || entry.name === 'node_modules' || entry.name === 'Recovery') {
          continue;
        }
        const found = findDirectoryDeep(fs, path, full, targetDirName, depth + 1, maxDepth);
        if (found) return found;
      }
    }
  } catch {}
  return null;
}

/**
 * Node.js 서버 환경에서 주어진 상대경로 또는 파일명을 실제 로컬 디스크 상의 절대경로로 탐색/승격합니다.
 * @param rawFilePath 탐색할 파일 경로 (빈 문자열 시 작업장 경로 자체 반환)
 * @param rawResourceFolder 리소스 폴더 경로 (지식 DB 위치, 예: "Onrivi_Asset")
 * @param rawWorkspacePath 작업장 실폴더 경로 또는 이름 (예: "E:\\ZZ 개인자료\\블러그" 또는 "블러그")
 */
export function resolveDiskAbsolutePath(
  rawFilePath: string,
  rawResourceFolder?: string | null,
  rawWorkspacePath?: string | null,
): string {
  const { fs, path } = getNodeModules();
  if (!fs || !path) {
    return ensureClientAbsolutePath(rawFilePath, rawResourceFolder);
  }

  // 1. 작업장 실폴더(safeWorkspacePath) 탐색 및 확정
  let safeWorkspacePath = '';
  const drives = ['E:\\', 'D:\\', 'C:\\', 'F:\\'];

  if (rawWorkspacePath && rawWorkspacePath.trim() && rawWorkspacePath !== ':memory:') {
    const wp = rawWorkspacePath.trim().replace(/\\/g, '/');
    if (/^[a-zA-Z]:\//.test(wp)) {
      safeWorkspacePath = wp.replace(/\/+$/, '');
    } else {
      const targetFolder = wp.split('/').pop() || wp;
      for (const drive of drives) {
        const found = findDirectoryDeep(fs, path, drive, targetFolder, 1, 3);
        if (found) {
          safeWorkspacePath = found;
          break;
        }
      }
    }
  }

  // 2. 만약 rawFilePath가 비어있는 경우, 작업장 절대경로 자체를 반환 (폴더 선택 시 즉시 획득용)
  if (!rawFilePath || !rawFilePath.trim()) {
    if (!safeWorkspacePath) {
      throw new Error(`❌ 작업장 절대경로(${rawWorkspacePath || '미지정'})를 찾을 수 없습니다. 작업장 폴더를 먼저 지정해 주세요.`);
    }
    return safeWorkspacePath.replace(/\\/g, '/');
  }

  let clean = rawFilePath.trim().replace(/^<|>$/g, '');

  // 3. 이미 완전한 절대경로인 경우 슬래시 정규화 후 즉시 반환 (단계를 거치지 않음!)
  const isWinAbs = /^[a-zA-Z]:[\\/]/.test(clean);
  const isPosixAbs = clean.startsWith('/') && !clean.startsWith('/.') && clean.length > 2;
  if (isWinAbs || isPosixAbs) {
    return clean.replace(/\\/g, '/');
  }

  // 4. 상대경로인 경우: 작업장 절대경로가 있으면 다이렉트로 결합하여 즉시 반환!
  const relPath = clean.replace(/^(\.\/|\/)+/, '');
  if (safeWorkspacePath) {
    return path.resolve(safeWorkspacePath, relPath).replace(/\\/g, '/');
  }

  // 🛡️ [규칙 9: 임의 폴백 원천 금지]: 작업장 절대경로 부재 시 D:\ 임의 기본 경로 폴백을 원천 금지하고 즉시 명시적 에러 발생
  throw new Error(
    `❌ 작업장 절대경로(${rawWorkspacePath || '미지정'})를 확인할 수 없습니다. 임의 기본 경로(D:\\ 등)로 폴백하지 않고 오류를 발생시킵니다. 작업장 폴더를 먼저 열어주세요.`
  );
}

/**
 * 클라이언트(웹 브라우저) 로컬스토리지에서 작업장 폴더 경로 또는 이름을 추출하는 헬퍼
 */
export function getWorkspacePathFromLocalStorage(): { path: string | null; name: string | null } {
  const win = typeof window !== 'undefined' ? window : (globalThis as any).window;
  const ls = typeof localStorage !== 'undefined' ? localStorage : (win?.localStorage || (globalThis as any).localStorage);
  if (!ls) {
    return { path: null, name: null };
  }

  try {
    // 1. onrivi_workspace_path 직접 확인
    const directPath = ls.getItem('onrivi_workspace_path') || ls.getItem('onrivi_workspace_base_path');
    if (directPath && directPath.trim()) {
      const norm = directPath.trim().replace(/\\/g, '/').replace(/\/+$/, '');
      if (/^[a-zA-Z]:\//.test(norm)) {
        return { path: norm, name: norm.split('/').pop() || null };
      }
    }

    // 2. rootFolder 확인
    const savedRoot = ls.getItem('rootFolder');
    if (savedRoot) {
      const parsed = JSON.parse(savedRoot);
      const rawName = (parsed?.path || parsed?.name || '').replace(/\\/g, '/').replace(/\/+$/, '');
      if (/^[a-zA-Z]:\//.test(rawName)) {
        return { path: rawName, name: rawName.split('/').pop() || null };
      }
      if (rawName && rawName !== 'browser-storage' && rawName !== 'C:/') {
        return { path: null, name: rawName };
      }
    }

    // 3. onrivi_settings 확인
    const savedSettings = ls.getItem('onrivi_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      const sPath = (parsed?.workspacePath || parsed?.rootFolder || '').replace(/\\/g, '/').replace(/\/+$/, '');
      if (/^[a-zA-Z]:\//.test(sPath)) {
        return { path: sPath, name: sPath.split('/').pop() || null };
      }
    }
  } catch {}

  return { path: null, name: null };
}

/**
 * 🎯 [핵심 함수]: 로컬스토리지에 저장된 작업장 절대경로와 파일 상대경로를 단계 탐색 없이 즉시 다이렉트 연결!
 * 예: "E:/ZZ 개인자료/블러그" + "체험하기/2026_추석_물가.md" -> "E:/ZZ 개인자료/블러그/체험하기/2026_추석_물가.md"
 */
export function buildDirectWorkspacePath(rawFilePath: string, resourceFolder?: string | null): string {
  if (!rawFilePath || !rawFilePath.trim()) return '';
  let clean = rawFilePath.trim().replace(/^<|>$/g, '').replace(/\\/g, '/');

  // 이미 절대경로인 경우 유지
  if (/^[a-zA-Z]:\//.test(clean) || (clean.startsWith('/') && !clean.startsWith('/.') && clean.length > 2)) {
    return clean;
  }

  // 선행 슬래시 제거
  clean = clean.replace(/^(\.\/|\/)+/, '');

  // 1. 로컬스토리지 작업장 절대경로와 다이렉트 직결 (단계 찾아가지 않음!)
  const ws = getWorkspacePathFromLocalStorage();
  if (ws.path) {
    return `${ws.path}/${clean}`.replace(/\/+/g, '/');
  }

  // 🛡️ [규칙 9: 임의 폴백 원천 금지]: 로컬스토리지 onrivi_workspace_path 부재 시 임의의 기본값(D:/ 등) 폴백을 엄격히 금지하고 명시적 오류 발생
  throw new Error(
    "❌ 작업장 경로(onrivi_workspace_path)가 로컬스토리지에 설정되어 있지 않습니다. 임의 기본 경로(D:/ 등)로 폴백하지 않고 오류를 발생시킵니다. 작업장 폴더를 먼저 열어주세요."
  );
}

/**
 * 클라이언트(웹 브라우저) 환경에서 상대경로를 로컬스토리지 작업장 경로 기반의 완전한 절대경로로 승격하는 동기 헬퍼
 */
export function ensureClientAbsolutePath(rawPath: string, resourceFolder?: string | null): string {
  return buildDirectWorkspacePath(rawPath, resourceFolder);
}

/**
 * 웹 브라우저에서 절대경로를 보장하는 비동기 헬퍼 (로컬스토리지 작업장 경로 우선 즉시 결합)
 */
export async function resolveClientAbsolutePath(rawPath: string, resourceFolder?: string | null): Promise<string> {
  if (!rawPath || !rawPath.trim()) return '';
  let clean = rawPath.trim().replace(/^<|>$/g, '').replace(/\\/g, '/');
  if (/^[a-zA-Z]:\//.test(clean)) return clean;

  // 로컬스토리지 작업장 절대경로와 다이렉트 연결 (스캔/단계 탐색 없이 0ms 즉시 반환)
  return buildDirectWorkspacePath(clean, resourceFolder);
}
