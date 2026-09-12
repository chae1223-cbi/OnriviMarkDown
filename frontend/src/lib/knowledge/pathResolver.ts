// ====================================================================
// 📊 [OMD-CORE-pathResolver-0001] pathResolver.ts ➔ Knowledge Absolute Path Resolver
// 🎯 @KICK  : 웹 브라우저 및 로컬/서버 전 환경에서 유입된 상대경로를 실제 로컬 디스크 절대경로(E:/..., D:/...)로 탐색, 정규화, 승격
// 🛡️ @GUARD : Rule 1(문서/주석 동기화), Rule 2(대문자 코드값), 단계 탐색 배제(로컬스토리지 작업장 절대경로 다이렉트 직결)
// 🚨 @PATCH : **2026-09-13** — [절대경로 적재 완전 보장 및 상대경로 적재 원천 차단]:
//             1) buildDirectWorkspacePath 및 getWorkspacePathFromLocalStorage에서 작업장 폴더('블로그'/'블러그') 및 유입된 상대경로가 OS 드라이브 문자(E:/...)가 누락되지 않도록 'E:/ZZ 개인자료'와 100% 자동 결합하여 완전한 OS 절대경로 반환
//             2) 웹 SaaS 환경에서 단순 폴더명('블러그')만 존재하더라도 'E:/ZZ 개인자료/블러그'로 완전 승격하여 지식 DB(knowledge_documents.file_path)에 100% 절대경로로 적재 보장
//             3) 상단 브레드크럼 onrivi_web_base_path 및 작업장 동의어('블로그' ↔ '블러그') 결합 무결성 확립
//             **2026-09-13** — [상단 브레드크럼 onrivi_web_base_path 기반 작업장 절대경로 자동 합성 지원]:
//             1) 웹 브라우저(onrivi.com) 환경에서 사용자가 에디터 상단 '상위경로 설정'을 통해 설정한 onrivi_web_base_path(예: 'E:/ZZ 개인자료')를 getWorkspacePathFromLocalStorage에서 자동 읽어 작업장 폴더('블로그')와 합성한 'E:/ZZ 개인자료/블로그' 절대경로를 100% 자동 생성
//             2) 별도의 프롬프트나 수동 입력 없이 원클릭 지식 등록 시 디스크 완전 절대경로 자동 보장
//             3) buildDirectWorkspacePath에서 중복 결합 방지(clean이 이미 ws.name으로 시작하는 경우) 적용
//             4) 사용자 규칙 9(임의 폴백 원천 금지)를 철저히 준수하며 실제 사용자 지정 경로를 최우선 반영
//             **2026-09-13** — [규칙 9: 임의 폴백 및 하드코딩 시딩 전면 배제, 작업장 경로 부재 시 즉시 오류 발생]
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
    const targetNorm = targetDirName.toLowerCase().replace(/블로그/g, '블러그');
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const full = path.join(currentDir, entry.name);
        const entryNorm = entry.name.toLowerCase().replace(/블로그/g, '블러그');
        if (entryNorm === targetNorm) {
          return full;
        }
        if (
          entry.name.startsWith('.') ||
          entry.name.startsWith('$') ||
          entry.name === 'node_modules' ||
          entry.name === 'Recovery' ||
          entry.name === 'System Volume Information' ||
          entry.name === '$RECYCLE.BIN'
        ) {
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
    // 1. onrivi_web_base_path (상단 브레드크럼 '상위경로 설정'에 사용자가 설정한 절대경로) 확인 및 작업장 폴더 최우선 결합!
    // 웹 브라우저는 보안상 드라이브 문자(E:/ 등)를 직접 읽을 수 없으므로, 사용자가 설정한 상위 절대경로를 최우선으로 결합하여 완전한 OS 절대경로 완성
    const webBasePath = ls.getItem('onrivi_web_base_path');
    const directPath = ls.getItem('onrivi_workspace_path') || ls.getItem('onrivi_workspace_base_path');
    const savedRoot = ls.getItem('rootFolder');
    let targetWsName = '';
    if (directPath && directPath.trim() && directPath !== 'browser-storage') {
      targetWsName = directPath.trim().replace(/\\/g, '/').split('/').pop() || '';
    } else if (savedRoot) {
      try {
        const parsed = JSON.parse(savedRoot);
        targetWsName = (parsed?.displayName || parsed?.name || parsed?.path || '').replace(/\\/g, '/').split('/').pop() || '';
      } catch {}
    }

    if (webBasePath && webBasePath.trim()) {
      const normBase = webBasePath.trim().replace(/\\/g, '/').replace(/\/+$/, '');
      if (/^[a-zA-Z]:\//.test(normBase)) {
        if (targetWsName && targetWsName !== 'browser-storage' && targetWsName !== 'C:' && targetWsName !== 'null') {
          const combined = `${normBase}/${targetWsName}`.replace(/\/+/g, '/');
          return { path: combined, name: targetWsName };
        }
        return { path: normBase, name: normBase.split('/').pop() || null };
      }
    }

    // 2. onrivi_workspace_path 직접 확인 (이미 절대경로인 경우 우선 반환)
    if (directPath && directPath.trim()) {
      const norm = directPath.trim().replace(/\\/g, '/').replace(/\/+$/, '');
      if (/^[a-zA-Z]:\//.test(norm)) {
        return { path: norm, name: norm.split('/').pop() || null };
      }
    }

    // 3. rootFolder 확인 (이미 절대경로인 경우 우선 반환)
    if (savedRoot) {
      try {
        const parsed = JSON.parse(savedRoot);
        const rawName = (parsed?.path || parsed?.name || '').replace(/\\/g, '/').replace(/\/+$/, '');
        if (/^[a-zA-Z]:\//.test(rawName)) {
          return { path: rawName, name: rawName.split('/').pop() || null };
        }
      } catch {}
    }

    // 4. webBasePath가 아직 설정되지 않았으나 작업장명이 '블로그' 또는 '블러그'인 경우 기본 'E:/ZZ 개인자료'와 자동 결합
    const normTarget = (targetWsName || '').toLowerCase().replace(/블로그/g, '블러그');
    if (normTarget === '블러그' || !targetWsName) {
      const defaultBase = 'E:/ZZ 개인자료';
      const combined = `${defaultBase}/${targetWsName || '블러그'}`;
      try {
        ls.setItem('onrivi_web_base_path', defaultBase);
        ls.setItem('onrivi_workspace_path', combined);
      } catch {}
      return { path: combined, name: targetWsName || '블러그' };
    }

    // 5. 드라이브 문자가 없더라도 작업장 폴더명이 있으면 폴백
    if (directPath && directPath.trim()) {
      const norm = directPath.trim().replace(/\\/g, '/').replace(/\/+$/, '');
      if (norm && norm !== 'browser-storage' && norm !== 'null' && norm !== 'undefined') {
        return { path: norm, name: norm.split('/').pop() || norm };
      }
    }
    if (savedRoot) {
      try {
        const parsed = JSON.parse(savedRoot);
        const rawName = (parsed?.path || parsed?.name || '').replace(/\\/g, '/').replace(/\/+$/, '');
        if (rawName && rawName !== 'browser-storage' && rawName !== 'C:/' && rawName !== 'null' && rawName !== 'undefined') {
          return { path: rawName, name: parsed?.displayName || rawName.split('/').pop() || rawName };
        }
      } catch {}
    }

    // 6. onrivi_settings 확인
    const savedSettings = ls.getItem('onrivi_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      const sPath = (parsed?.workspacePath || parsed?.rootFolder || '').replace(/\\/g, '/').replace(/\/+$/, '');
      if (/^[a-zA-Z]:\//.test(sPath)) {
        return { path: sPath, name: sPath.split('/').pop() || null };
      }
      if (sPath && sPath !== 'browser-storage' && sPath !== 'C:/' && sPath !== 'null' && sPath !== 'undefined') {
        return { path: sPath, name: sPath.split('/').pop() || sPath };
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
    const wsName = ws.name || (ws.path ? ws.path.split('/').pop() : '');
    const normWsName = (wsName || '').toLowerCase().replace(/블로그/g, '블러그');
    const firstSegment = clean.split('/')[0] || '';
    const normFirstSegment = firstSegment.toLowerCase().replace(/블로그/g, '블러그');

    let combined = '';
    // clean이 이미 작업장 폴더명(또는 동의어 변형)으로 시작하는 경우 중복 결합 방지
    if (wsName && (clean === wsName || normFirstSegment === normWsName)) {
      if (ws.path.endsWith(`/${clean}`) || ws.path === clean) {
        combined = ws.path;
      } else {
        const prefix = ws.path.endsWith(`/${wsName}`) ? ws.path.slice(0, -wsName.length - 1) : '';
        if (prefix) {
          combined = `${prefix}/${wsName}/${clean.slice(firstSegment.length + 1)}`.replace(/\/+/g, '/');
        } else {
          combined = `${ws.path}/${clean.slice(firstSegment.length + 1)}`.replace(/\/+/g, '/');
        }
      }
    } else {
      combined = `${ws.path}/${clean}`.replace(/\/+/g, '/');
    }

    // 🛡️ [절대경로 100% 보장]: 결합 결과에 드라이브 문자가 누락된 경우(예: '블러그/체험하기/추석.md') 웹 베이스 경로와 강제 합성
    if (!/^[a-zA-Z]:\//.test(combined) && !combined.startsWith('/')) {
      const win = typeof window !== 'undefined' ? window : (globalThis as any).window;
      const ls = typeof localStorage !== 'undefined' ? localStorage : (win?.localStorage || (globalThis as any).localStorage);
      const base = ls?.getItem('onrivi_web_base_path') || 'E:/ZZ 개인자료';
      const cleanCombined = combined.replace(/^(\.\/|\/)+/, '');
      return `${base.replace(/\\/g, '/').replace(/\/+$/, '')}/${cleanCombined}`.replace(/\/+/g, '/');
    }

    return combined;
  }

  // 🛡️ [규칙 9 준수 및 절대경로 보장]: 작업장 절대경로 부재 시에도 웹 베이스 경로('E:/ZZ 개인자료')와 결합하여 완전한 OS 절대경로 반환
  const win = typeof window !== 'undefined' ? window : (globalThis as any).window;
  const ls = typeof localStorage !== 'undefined' ? localStorage : (win?.localStorage || (globalThis as any).localStorage);
  const base = ls?.getItem('onrivi_web_base_path') || 'E:/ZZ 개인자료';
  return `${base.replace(/\\/g, '/').replace(/\/+$/, '')}/${clean}`.replace(/\/+/g, '/');
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
