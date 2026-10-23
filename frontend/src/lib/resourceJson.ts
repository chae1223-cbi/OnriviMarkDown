// ====================================================================
// 📊 [OMD-LIB-resourceJson-0001] src/lib/resourceJson.ts
// 🎯 @KICK  : 리소스 폴더(로컬/드라이브) JSON(프롬프트, 프리셋 등) 읽기/쓰기 통합 브릿지
// 🛡️ @GUARD : Rule 1(단일 주석 관리), 데스크톱(Electron) 및 웹 브라우저(/api/prompts) 환경 자동 감지 및 폴백 보장
// 🚨 @PATCH : **2026-10-20** — [웹 브라우저 환경 /api/prompts HTTP 통신 폴백 추가로 15종 템플릿 완전 로드]:
//             1) 웹 브라우저(localhost:3100) 접속 시 window.electronAPI가 없더라도 /api/prompts 엔드포인트를 호출하여 D:\Onrivi_Asset\prompt 하위 15개 프리셋 즉시 로드 및 저장 보장
//             2) Electron IPC, Web API, Google Drive, FileSystemAccess 4중 안전 연동 체계 완성
// ====================================================================

import { requireResourceSettings, getResourceSettings } from './resourceSettings';
import { idb } from './indexedDbHelper';

export async function readResourceJson(name: 'ai_prompts.json' | 'ai_presets.json', explicitHandle?: any, explicitFolder?: string): Promise<any> {
  const api = typeof window !== 'undefined' ? (window as any).electronAPI : null;
  let settings: any = null;
  try {
    settings = requireResourceSettings();
  } catch {
    settings = getResourceSettings();
  }

  const effectiveLocalPath = explicitFolder || (settings?.kind === 'local' ? settings?.path : null) || (typeof localStorage !== 'undefined' ? (localStorage.getItem('onrivi_resource_folder_path') || localStorage.getItem('resourceFolder') || localStorage.getItem('onrivi_local_backup_resource_folder_path')) : null);

  // 1. Electron 데스크톱 네이티브 IPC 직접 읽기 (explicitFolder 또는 settings.path 최우선)
  if (settings?.kind !== 'drive' && api && effectiveLocalPath) {
    try {
      const res = name === 'ai_prompts.json' ? await api.loadPrompts(effectiveLocalPath) : await api.loadPresets(effectiveLocalPath);
      if (res !== null && res !== undefined) return res;
      return name === 'ai_presets.json' ? [] : {};
    } catch (err) {
      console.warn('[readResourceJson] Electron load failed:', err);
      return name === 'ai_presets.json' ? [] : {};
    }
  }

  // 2. 웹 브라우저 환경(localhost:3100 등)에서 로컬 경로가 있는 경우: Next.js /api/prompts 로컬 API 읽기
  if (settings?.kind !== 'drive' && !api && effectiveLocalPath && typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname) && typeof fetch !== 'undefined') {
    try {
      const res = await fetch(`/api/prompts?name=${encodeURIComponent(name)}&resourceFolder=${encodeURIComponent(effectiveLocalPath)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data !== undefined) return json.data;
      }
    } catch (err) {
      console.warn('[readResourceJson] Web API fetch failed:', err);
    }
  }

  // 3. Google Drive 클라우드 리소스 읽기
  if (settings?.kind === 'drive') {
    const drive = await import('./gdrive/googleDriveClient');
    const token = drive.getSavedDriveToken();
    if (!token || !settings.promptFolderId) throw new Error('드라이브 리소스 연결을 확인해 주세요.');
    const id = await drive.findDriveFile(token, name, settings.promptFolderId);
    return id ? JSON.parse(await drive.readDriveFileContent(token, id)) : name === 'ai_presets.json' ? [] : {};
  }

  // 4. 브라우저 FileSystemAccess API (FileSystemDirectoryHandle) 읽기
  const handle = explicitHandle || (typeof window !== 'undefined' ? (window as any).__resourceFolderHandle : null) || await idb.get('resourceFolderHandle');
  if (handle) {
    try {
      const dir = await handle.getDirectoryHandle('prompt');
      return JSON.parse(await (await (await dir.getFileHandle(name)).getFile()).text());
    } catch (e: any) {
      if (e.name === 'NotFoundError') return name === 'ai_presets.json' ? [] : {};
      throw e;
    }
  }

  // 폴더가 연결되어 있지 않은 경우 안전한 기본값 반환
  return name === 'ai_presets.json' ? [] : {};
}

export async function writeResourceJson(name: 'ai_prompts.json' | 'ai_presets.json', value: any, explicitHandle?: any, explicitFolder?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const api = typeof window !== 'undefined' ? (window as any).electronAPI : null;
    let settings: any = null;
    try {
      settings = requireResourceSettings();
    } catch {
      settings = getResourceSettings();
    }

    const effectiveLocalPath = explicitFolder || (settings?.kind === 'local' ? settings?.path : null) || (typeof localStorage !== 'undefined' ? (localStorage.getItem('onrivi_resource_folder_path') || localStorage.getItem('resourceFolder') || localStorage.getItem('onrivi_local_backup_resource_folder_path')) : null);

    // 1. Electron 데스크톱 네이티브 IPC 직접 쓰기
    if (settings?.kind !== 'drive' && api && effectiveLocalPath) {
      return name === 'ai_prompts.json' ? await api.savePrompts(value, effectiveLocalPath) : await api.savePresets(value, effectiveLocalPath);
    }

    // 2. 웹 브라우저 환경(localhost:3100 등)에서 로컬 경로가 있는 경우: Next.js /api/prompts 로컬 API 쓰기
    if (settings?.kind !== 'drive' && !api && effectiveLocalPath && typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname) && typeof fetch !== 'undefined') {
      try {
        const res = await fetch('/api/prompts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resourceFolder: effectiveLocalPath, name, data: value }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success) return { success: true };
        }
      } catch (err: any) {
        console.warn('[writeResourceJson] Web API write failed:', err);
      }
    }

    // 3. Google Drive 클라우드 리소스 쓰기
    if (settings?.kind === 'drive') {
      const drive = await import('./gdrive/googleDriveClient');
      const token = drive.getSavedDriveToken();
      if (!token || !settings.promptFolderId) throw new Error('드라이브 리소스 연결을 확인해 주세요.');
      if (name === 'ai_presets.json') {
        const existing = await drive.findDriveFile(token, name, settings.promptFolderId);
        if (existing) {
          const original = await drive.readDriveFileContent(token, existing);
          JSON.parse(original);
          const backup = await drive.ensureDriveTextFile(token, 'ai_presets.backup.json', settings.promptFolderId, original, 'application/json');
          if (!await drive.saveDriveFileContent(token, backup, original)) throw new Error('템플릿 원본 백업 실패');
        }
      }
      const id = await drive.ensureDriveTextFile(token, name, settings.promptFolderId, JSON.stringify(value), 'application/json');
      if (!await drive.saveDriveFileContent(token, id, JSON.stringify(value, null, 2))) throw new Error('드라이브 저장 실패');
      return { success: true };
    }

    // 4. 브라우저 FileSystemAccess API (FileSystemDirectoryHandle) 쓰기
    const handle = explicitHandle || (typeof window !== 'undefined' ? (window as any).__resourceFolderHandle : null) || await idb.get('resourceFolderHandle');
    if (!handle) throw new Error('리소스 폴더 접근 권한을 다시 설정해 주세요.');
    const dir = await handle.getDirectoryHandle('prompt', { create: true });
    if (name === 'ai_presets.json') {
      try {
        const original = await (await (await dir.getFileHandle(name)).getFile()).text();
        JSON.parse(original);
        const backup = await dir.getFileHandle('ai_presets.backup.json', { create: true });
        const backupWriter = await backup.createWritable();
        await backupWriter.write(original);
        await backupWriter.close();
      } catch (error: any) {
        if (error.name !== 'NotFoundError') throw error;
      }
    }
    const file = await dir.getFileHandle(name, { create: true });
    const writer = await file.createWritable();
    try {
      await writer.write(JSON.stringify(value, null, 2));
      await writer.close();
    } catch (error) {
      await writer.abort().catch(() => {});
      throw error;
    }
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
