// 사용자 서식의 유일한 원본은 리소스 폴더의 profiles/userCssProfiles.json이다.
// 선택한 저장소의 오류/빈 배열을 다른 파일이나 localStorage로 대체하지 않는다.
import { CssProfile } from '@/types/cssProfile';
import { isSystemProfileId } from '@/constants/cssProfile';
import { loadSecureData } from '@/lib/secureStorage';
import { idb } from '@/lib/indexedDbHelper';

/**
 * 실시간 환경에 설정된 유효한 리소스 폴더 경로 또는 폴더명을 동적으로 계산합니다.
 */
export function getEffectiveResourceFolder(explicitFolder?: string | null): string {
  if (explicitFolder && typeof explicitFolder === 'string' && explicitFolder.trim() !== '') {
    return explicitFolder.trim();
  }

  if (typeof window === 'undefined') return '';

  const secure = loadSecureData<string>('resourceFolder');
  if (secure && typeof secure === 'string' && secure.trim() !== '') {
    return secure.trim();
  }

  const rawPath = localStorage.getItem('onrivi_resource_folder_path');
  if (rawPath && rawPath.trim() !== '') return rawPath.trim();

  const rawFolder = localStorage.getItem('onrivi_resource_folder');
  if (rawFolder && rawFolder.trim() !== '') return rawFolder.trim();

  const plain = localStorage.getItem('resourceFolder');
  if (plain && plain.trim() !== '' && !plain.startsWith('U2FsdGVkX1')) {
    return plain.trim();
  }

  return '';
}

async function getResourceHandle(folder: string, explicitHandle?: any): Promise<any> {
  if (explicitHandle) return explicitHandle;
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
  const folder = getEffectiveResourceFolder(explicitFolder);
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
  // 폴더명만으로 서버의 다른 드라이브/폴더를 추측하지 않는다.
  if (!folder || !/^(?:[a-z]:[\\/]|\/|\\\\)/i.test(folder)) {
    throw new Error('서식을 읽으려면 설정에서 리소스 폴더를 연결해 주세요.');
  }
  const res = await fetch(`/api/profiles?resourceFolder=${encodeURIComponent(folder)}`);
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'PROFILE_READ_FAILED');
  return parseProfiles(data.profiles);
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
  const folder = getEffectiveResourceFolder(explicitFolder);
  const save = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    try {
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
      if (!folder || !/^(?:[a-z]:[\\/]|\/|\\\\)/i.test(folder)) {
        throw new Error('서식을 저장하려면 설정에서 리소스 폴더를 연결해 주세요.');
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
