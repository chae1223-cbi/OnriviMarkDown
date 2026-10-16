import { getResourceSettings } from './resourceSettings';
import { idb } from './indexedDbHelper';
import { browserPickerStartIn } from './browserPickerStartIn';
import { getSavedDriveToken } from './gdrive/googleDriveClient';
import { pickDriveResourceFile, pickLocalResourceFile } from './gdrive/ResourceFilePicker';

export const mediaFileTypes = {
  image:{description:'사진',accept:{'image/*':['.png','.jpg','.jpeg','.gif','.webp','.svg','.bmp','.avif']}},
  video:{description:'동영상',accept:{'video/*':['.mp4','.webm','.mov','.ogg','.m4v','.avi','.mkv']}},
};

/** Browse the connected workspace, starting at that environment's resource folder. */
export async function pickResourceMedia(kind:'image'|'video', workspaceType?:string, browserHandle?:any): Promise<File|null> {
  const environment = workspaceType === 'cloud' || workspaceType === 'gdrive' ? 'cloud' : workspaceType === 'local' || workspaceType === 'browser' ? 'local' : undefined;
  const settings = getResourceSettings(environment);
  if (!settings) throw new Error('현재 연결 위치의 환경설정에서 리소스 폴더를 먼저 지정해 주세요.');
  const extensions = Object.values(mediaFileTypes[kind].accept)[0];
  const accepted = (name:string) => extensions.some(extension=>name.toLowerCase().endsWith(extension));
  if (settings.kind === 'drive') {
    const token = getSavedDriveToken();
    if (!token || !settings.folderId) throw new Error('현재 Google Drive 연결과 리소스 폴더를 확인해 주세요.');
    const item = await pickDriveResourceFile(token,settings.folderId,{title:`Google Drive ${mediaFileTypes[kind].description} 선택`,accept:file=>accepted(file.name)});
    if (!item) return null;
    if (kind === 'video' && Number(item.size || 0) > 100*1024*1024) throw new Error('동영상 크기는 100MB를 초과할 수 없습니다.');
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(item.id)}?alt=media`,{headers:{Authorization:`Bearer ${token}`}});
    if (!response.ok) throw new Error('선택한 Drive 파일을 읽지 못했습니다.');
    return new File([await response.blob()],item.name,{type:item.mimeType});
  }
  const api = (window as any).electronAPI;
  if (api?.selectMediaFile) {
    const result = await api.selectMediaFile({kind,defaultPath:settings.path});
    if (!result || result.canceled) return null;
    if (!accepted(result.name)) throw new Error('지원하는 미디어 파일을 선택해 주세요.');
    return new File([new Uint8Array(result.bytes)],result.name,{type:result.mimeType});
  }
  let handle = browserHandle || (window as any).__resourceFolderHandle;
  if (!handle || handle.name !== settings.path) handle = await idb.get('resourceFolderHandle');
  if (!handle || handle.name !== settings.path) throw new Error('현재 로컬 리소스 폴더를 다시 연결해 주세요.');
  try {
    if ((window as any).showOpenFilePicker) {
      const startIn = await browserPickerStartIn(handle);
      const [selected] = await (window as any).showOpenFilePicker({id:`onrivi-${kind}`,startIn,multiple:false,excludeAcceptAllOption:true,types:[mediaFileTypes[kind]]});
      return selected ? selected.getFile() : null;
    }
    return await pickLocalResourceFile(handle,accepted);
  } catch(error:any) {
    if (error.name === 'AbortError') return null;
    throw error;
  }
}
