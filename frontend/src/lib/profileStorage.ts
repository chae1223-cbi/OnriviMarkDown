import { getResourceSettings, requireResourceSettings } from '@/lib/resourceSettings';
// 사용자 서식의 유일한 원본은 리소스 폴더의 profiles/userCssProfiles.json이다.
// 선택한 저장소의 오류/빈 배열을 다른 파일이나 localStorage로 대체하지 않는다.
import { CssProfile } from '@/types/cssProfile';
import { SYSTEM_PROFILES, isSystemProfileId } from '@/constants/cssProfile';
import { loadSecureData } from '@/lib/secureStorage';
import { idb } from '@/lib/indexedDbHelper';
import {
  getSavedDriveToken,
  getSavedWorkspaceInfo,
  findDriveFile,
  readDriveFileContent,
  ensureDriveTextFile,
  saveDriveFileContent,
} from '@/lib/gdrive/googleDriveClient';

// ====================================================================
// 📊 [OMD-STORE-profileStorage-0001] profileStorage.ts ➔ getEffectiveResourceFolder
// 🎯 @KICK  : 유효한 공통 리소스 폴더 경로 또는 식별자 안전 획득
// 🛡️ @GUARD : Rule 1(단일 주석 관리), 평문 우선 검사 및 loadSecureData 암호화 안전 복호화
// 🚨 @PATCH : **2026-10-03** — [구글 드라이브 서식(userCssProfiles.json) 연동 및 리소스 폴더 미설정 에러 토스트 방어]: 구글 드라이브(OnriviAuthor/참조파일/profiles) 서식 읽기/쓰기 지원, 리소스 폴더 미설정 시 에러 throw 대신 빈 배열 반환으로 런타임 오류 방어
// 🚨 @PATCH : **2026-10-03** — [Malformed UTF-8 복호화 에러 원천 방지]: 평문 리소스 폴더(localStorage) 우선 감지 및 안전 복호화 연동
// 🔗 @CALLS : loadSecureData
// ====================================================================
export function getEffectiveResourceFolder(_explicitFolder?: string | null): string {
  return getResourceSettings()?.path || '';
}
export function getProfileResourceFolder(explicitFolder?:string|null):string { return getEffectiveResourceFolder(explicitFolder); }

async function getResourceHandle(folder: string, explicitHandle?: any): Promise<any> {
  if (explicitHandle?.name === folder) return explicitHandle;
  const liveHandle = (window as any).__resourceFolderHandle;
  if (liveHandle && liveHandle.name === folder) return liveHandle;
  // 새로고침 후에도 사용자가 선택한 브라우저 폴더를 사용한다.
  const savedHandle = await idb.get('resourceFolderHandle');
  return savedHandle?.name === folder ? savedHandle : null;
}

function parseProfiles(value: unknown): CssProfile[] {
  if (!Array.isArray(value)) throw new Error('INVALID_PROFILES_ARRAY');
  return value;
}

export async function fetchUserProfiles(
  explicitFolder?: string | null,
  resourceFolderHandle?: any
): Promise<CssProfile[]> {
  if (typeof window === 'undefined') return [];
  const folder = getProfileResourceFolder(explicitFolder);
  if (getResourceSettings()?.kind === 'drive') {
    const token = getSavedDriveToken();
    const workspace = getSavedWorkspaceInfo();
    if (!token || !workspace?.profilesFolderId) throw new Error('구글 드라이브 연결을 갱신해 주세요.');
    const fileId = await findDriveFile(token, 'userCssProfiles.json', workspace.profilesFolderId);
    return fileId ? parseProfiles(JSON.parse(await readDriveFileContent(token, fileId))) : [];
  }
  const api = (window as any).electronAPI;
  if (api?.readProfiles) return parseProfiles(await api.readProfiles(folder));

  const handle = await getResourceHandle(folder, resourceFolderHandle);
  if (handle) {
    try {
      const dir = await handle.getDirectoryHandle('profiles', { create: false });
      const file = await (await dir.getFileHandle('userCssProfiles.json', { create: false })).getFile();
      return parseProfiles(JSON.parse(await file.text()));
    } catch (err: any) {
      if (err.name === 'NotFoundError') return [];
      throw err;
    }
  }

  // ☁️ 구글 드라이브(GDRIVE) 리소스 폴더 지원
  if (getResourceSettings()?.kind === 'drive') {
    const token = getSavedDriveToken();
    const wsInfo = getSavedWorkspaceInfo();
    const profilesFolderId = wsInfo?.profilesFolderId;
    if (token && profilesFolderId) {
      try {
        const fileId = await findDriveFile(token, 'userCssProfiles.json', profilesFolderId);
        if (fileId) {
          const content = await readDriveFileContent(token, fileId);
          if (content && content.trim() !== '') {
            return parseProfiles(JSON.parse(content));
          }
        }
        return [];
      } catch (gErr) {
        console.warn('[fetchUserProfiles GDrive read failed]:', gErr);
        return [];
      }
    }
    return [];
  }

  // 리소스 폴더가 아직 연결되지 않은 초기/미설정 상태에서는 빈 배열 반환 (에러 토스트 방어)
  if (!folder || !/^(?:[a-z]:[\\/]|\/|\\\\)/i.test(folder)) {
    return [];
  }

  try {
    const res = await fetch(`/api/profiles?resourceFolder=${encodeURIComponent(folder)}`);
    const data = await res.json();
    if (!res.ok || !data.success) return [];
    return parseProfiles(data.profiles);
  } catch {
    return [];
  }
}

// 비동기 쓰기를 직렬화하여 늦게 완료된 이전 설정이 새 설정을 덮어쓰지 않도록 한다.
let pendingSave: Promise<unknown> = Promise.resolve();
export function persistUserProfiles(
  rawProfiles: CssProfile[],
  explicitFolder?: string | null,
  resourceFolderHandle?: any
): Promise<boolean> {
  const userProfiles = JSON.parse(JSON.stringify(rawProfiles.filter(
    p => p && p.id !== 'default' && !isSystemProfileId(p.id)
  )));
  const folder = getProfileResourceFolder(explicitFolder);
  const selectedResource=getResourceSettings();
  const save = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    try {
      const currentResource=requireResourceSettings();
      if (!selectedResource || currentResource.kind!==selectedResource.kind || currentResource.path!==selectedResource.path || currentResource.folderId!==selectedResource.folderId) return false;
      if (getResourceSettings()?.kind === 'drive') {
        const token = getSavedDriveToken();
        const workspace = getSavedWorkspaceInfo();
        if (!token || !workspace?.profilesFolderId) throw new Error('구글 드라이브 연결을 갱신해 주세요.');
        const fileId = await ensureDriveTextFile(token, 'userCssProfiles.json', workspace.profilesFolderId, '[]', 'application/json');
        return await saveDriveFileContent(token, fileId, JSON.stringify([...SYSTEM_PROFILES, ...userProfiles], null, 2));
      }
      const api = (window as any).electronAPI;
      if (api?.saveProfiles) {
        const result = await api.saveProfiles(userProfiles, folder);
        if (!result?.success) throw new Error(result?.error || 'PROFILE_SAVE_FAILED');
        return true;
      }
      const handle = await getResourceHandle(folder, resourceFolderHandle);
      if (handle) {
        const dir = await handle.getDirectoryHandle('profiles', { create: true });
        const file = await dir.getFileHandle('userCssProfiles.json', { create: true });
        const writable = await file.createWritable();
        try {
          await writable.write(JSON.stringify(userProfiles, null, 2));
          await writable.close();
        } catch (error) {
          await writable.abort?.().catch(() => {});
          throw error;
        }
        return true;
      }

      // ☁️ 구글 드라이브(GDRIVE) 리소스 폴더 지원
      if (getResourceSettings()?.kind === 'drive') {
        const token = getSavedDriveToken();
        const wsInfo = getSavedWorkspaceInfo();
        const profilesFolderId = wsInfo?.profilesFolderId;
        if (token && profilesFolderId) {
          const fileId = await ensureDriveTextFile(token, 'userCssProfiles.json', profilesFolderId, '[]', 'application/json');
          if (fileId) {
            await saveDriveFileContent(token, fileId, JSON.stringify([...SYSTEM_PROFILES, ...userProfiles], null, 2));
            return true;
          }
        }
        return false;
      }

      if (!folder || !/^(?:[a-z]:[\\/]|\/|\\\\)/i.test(folder)) {
        return false;
      }
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profiles: userProfiles, resourceFolder: folder }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'PROFILE_SAVE_FAILED');
      return true;
    } catch (error) {
      console.error('[persistUserProfiles] userCssProfiles.json 저장 실패:', error);
      return false;
    }
  };
  const result = pendingSave.then(save, save);
  pendingSave = result;
  return result;
}
