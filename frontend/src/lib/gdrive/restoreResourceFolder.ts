import { getResourceSettings } from '@/lib/resourceSettings';

// Reuse the last destination; transient authorization/network failures must not reset it.
export async function restoreDriveResourceFolder(token: string): Promise<{id:string;name:string}|null> {
  const saved = getResourceSettings('cloud');
  if (saved?.kind !== 'drive' || !saved.folderId) return null;
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(saved.folderId)}?fields=id,name,mimeType,trashed`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`마지막 리소스 폴더에 접근하지 못했습니다 (${response.status}). 연결 및 Google Drive 권한을 확인하고 다시 시도해 주세요.`);
  const folder = await response.json();
  if (folder.trashed || folder.mimeType !== 'application/vnd.google-apps.folder') return null;
  return {id:folder.id,name:folder.name};
}
