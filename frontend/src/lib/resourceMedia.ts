import { requireResourceSettings } from './resourceSettings';
import { idb } from './indexedDbHelper';
import { getSavedDriveToken, uploadDriveImage } from './gdrive/googleDriveClient';

const mime: Record<string,string> = { png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',gif:'image/gif',svg:'image/svg+xml',mp4:'video/mp4',webm:'video/webm',mov:'video/quicktime',ogg:'video/ogg' };

/** Copy selected bytes to the configured resource destination, replacing by name. */
export async function saveResourceMedia(file: Blob, name: string, browserHandle?: any): Promise<string> {
  const settings = requireResourceSettings();
  const filename = name.normalize('NFC').split(/[\\/]/).pop() || `media_${Date.now()}`;
  if (filename === '.' || filename === '..' || /[\r\n\0]/.test(filename)) throw new Error('파일 이름이 올바르지 않습니다.');
  const revision = Date.now();
  const announce = () => window.dispatchEvent(new CustomEvent('onrivi:media-updated',{detail:{name:filename}}));
  if (settings.kind === 'drive') {
    if (!settings.mediaFolderId) throw new Error('환경설정의 드라이브 media 폴더를 확인해 주세요.');
    const uploaded = await uploadDriveImage(getSavedDriveToken() || undefined,settings.mediaFolderId,file,filename);
    announce();
    return `/media/${encodeURIComponent(uploaded.name)}?driveId=${encodeURIComponent(uploaded.id)}&v=${revision}`;
  }
  const api = (window as any).electronAPI;
  if (api) {
    const data = await new Promise<string>((resolve,reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(',')[1]); reader.onerror = () => reject(new Error('파일 읽기 실패')); reader.readAsDataURL(file); });
    const result = await api.saveImage(settings.path.replace(/[\\/]$/,'') + '/media',data,filename);
    if (!result?.success) throw new Error(result?.error || '리소스 파일 저장 실패');
    announce();
    return result.mediaPath || `media://local/serve?url=${encodeURIComponent(result.absolutePath)}&v=${revision}`;
  }
  let handle = browserHandle || (window as any).__resourceFolderHandle;
  if (!handle || handle.name !== settings.path) handle = await idb.get('resourceFolderHandle');
  if (!handle || handle.name !== settings.path) throw new Error('환경설정의 로컬 리소스 폴더를 다시 연결해 주세요.');
  const options = {mode:'readwrite'};
  if (await handle.queryPermission(options) !== 'granted' && await handle.requestPermission(options) !== 'granted') throw new Error('리소스 폴더 쓰기 권한이 필요합니다.');
  const media = await handle.getDirectoryHandle('media',{create:true});
  const destination = await media.getFileHandle(filename,{create:true});
  const writable = await destination.createWritable();
  try { await writable.write(file); await writable.close(); } catch (error) { await writable.abort?.(); throw error; }
  announce();
  return `/media/${encodeURIComponent(filename)}?v=${revision}`;
}

/** Import absolute local paths or private Drive URLs; normal web embeds stay links. */
export async function importResourceMedia(source: string, browserHandle?: any): Promise<string> {
  let path = source.trim();
  const drive = /^https?:\/\/(?:drive|docs)\.google\.com\//i.test(path);
  if (drive) {
    const url = new URL(path), id = url.pathname.match(/\/d\/([^/]+)/)?.[1] || url.searchParams.get('id');
    const token = getSavedDriveToken();
    if (!id || !token) throw new Error('Google Drive 연결과 파일 주소를 확인해 주세요.');
    const headers = {Authorization:`Bearer ${token}`};
    const metadata = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?fields=name,mimeType`,{headers});
    if (!metadata.ok) throw new Error('드라이브 파일 정보를 읽지 못했습니다.');
    const info = await metadata.json();
    if (!/^(image|video)\//.test(info.mimeType || '')) throw new Error('사진 또는 동영상 파일을 선택해 주세요.');
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?alt=media`,{headers});
    if (!response.ok) throw new Error('드라이브 파일을 읽지 못했습니다.');
    return saveResourceMedia(await response.blob(),info.name,browserHandle);
  }
  if (/^media(?:-local)?:\/\//.test(path)) path = new URL(path).searchParams.get('url') || path;
  if (path.startsWith('file:')) path = decodeURIComponent(new URL(path).pathname).replace(/^\/([A-Za-z]:)/,'$1');
  if (/^(?:[A-Za-z]:[\\/]|\\\\)/.test(path)) {
    const api = (window as any).electronAPI;
    if (!api?.readTransferFile) throw new Error('로컬 파일은 찾아보기로 선택해 주세요.');
    const name = path.split(/[\\/]/).pop()!;
    const bytes = await api.readTransferFile(path);
    return saveResourceMedia(new Blob([new Uint8Array(bytes)],{type:mime[name.split('.').pop()!.toLowerCase()] || 'application/octet-stream'}),name,browserHandle);
  }
  return source;
}
