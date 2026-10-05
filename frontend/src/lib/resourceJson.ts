import { requireResourceSettings } from './resourceSettings';
import { idb } from './indexedDbHelper';
export async function readResourceJson(name:'ai_prompts.json'|'ai_presets.json', explicitHandle?:any):Promise<any> {
 const settings=requireResourceSettings();
 if(settings.kind==='drive') {
   const drive=await import('./gdrive/googleDriveClient');const token=drive.getSavedDriveToken();
   if(!token || !settings.promptFolderId) throw new Error('드라이브 리소스 연결을 확인해 주세요.');
   const id=await drive.findDriveFile(token,name,settings.promptFolderId);return id?JSON.parse(await drive.readDriveFileContent(token,id)):name==='ai_presets.json'?[]:{};
 }
 const api=(window as any).electronAPI;
 if(settings.kind==='local' && api) return name==='ai_prompts.json'?api.loadPrompts(settings.path):api.loadPresets(settings.path);
 const handle=explicitHandle || (window as any).__resourceFolderHandle || await idb.get('resourceFolderHandle');
 if(!handle || handle.name!==settings.path)throw new Error('리소스 폴더 접근 권한을 다시 설정해 주세요.');
 try {const dir=await handle.getDirectoryHandle('prompt');return JSON.parse(await (await (await dir.getFileHandle(name)).getFile()).text());}catch(e:any){if(e.name==='NotFoundError')return name==='ai_presets.json'?[]:{};throw e;}
}
export async function writeResourceJson(name:'ai_prompts.json'|'ai_presets.json', value:any, explicitHandle?:any):Promise<{success:boolean;error?:string}> {
 try {
  const settings=requireResourceSettings();
  if(settings.kind==='drive') {
   const drive=await import('./gdrive/googleDriveClient');const token=drive.getSavedDriveToken();if(!token||!settings.promptFolderId)throw new Error('드라이브 리소스 연결을 확인해 주세요.');
   const id=await drive.ensureDriveTextFile(token,name,settings.promptFolderId,JSON.stringify(value),'application/json');
   if(!await drive.saveDriveFileContent(token,id,JSON.stringify(value,null,2)))throw new Error('드라이브 저장 실패');
  } else {
   const api=(window as any).electronAPI;
   if(settings.kind==='local' && api)return name==='ai_prompts.json'?api.savePrompts(value,settings.path):api.savePresets(value,settings.path);
   const handle=explicitHandle || (window as any).__resourceFolderHandle || await idb.get('resourceFolderHandle');
   if(!handle || handle.name!==settings.path)throw new Error('리소스 폴더 접근 권한을 다시 설정해 주세요.');
   const dir=await handle.getDirectoryHandle('prompt',{create:true});const file=await dir.getFileHandle(name,{create:true});const writer=await file.createWritable();await writer.write(JSON.stringify(value,null,2));await writer.close();
  }
  return {success:true};
 }catch(e:any){return {success:false,error:e.message};}
}
