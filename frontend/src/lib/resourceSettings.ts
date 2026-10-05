// The selected resource destination is independent of the workspace destination.
export type ResourceSettings = { kind:'local'|'browser'|'drive'; path:string; folderId?:string; profilesFolderId?:string; promptFolderId?:string; bibleFolderId?:string; mediaFolderId?:string; dbFolderId?:string };
const KEY='onrivi_resource_settings';
const mode=()=>localStorage.getItem('workspaceType') === 'cloud' ? 'cloud' : 'local';
export function getResourceSettings(environment?:string):ResourceSettings|null {
  if(typeof window==='undefined') return null;
  try {
    const selectedMode=environment || mode();const all=JSON.parse(localStorage.getItem(KEY)||'{}');
    if(Object.prototype.hasOwnProperty.call(all,selectedMode)) return all[selectedMode] || null;
    const path=localStorage.getItem('onrivi_resource_folder_path') || '';
    let migrated:ResourceSettings|null=null;
    if(selectedMode==='cloud' && (path.startsWith('OnriviAuthor/') || path.startsWith('gdrive://'))) {
      const info=JSON.parse(localStorage.getItem('onrivi_gdrive_workspace_info')||'null');
      if(info?.resourceFolderId) migrated={kind:'drive',path,folderId:info.resourceFolderId,profilesFolderId:info.profilesFolderId,promptFolderId:info.promptFolderId,bibleFolderId:info.bibleFolderId,mediaFolderId:info.mediaFolderId,dbFolderId:info.dbFolderId};
    } else if(selectedMode==='local' && path && !path.startsWith('OnriviAuthor/') && !path.startsWith('gdrive://')) migrated={kind:/^(?:[A-Za-z]:[\\/]|\\\\)/.test(path)?'local':'browser',path};
    if(migrated) {all[selectedMode]=migrated;localStorage.setItem(KEY,JSON.stringify(all));}
    return migrated;
  } catch { return null; }
}
export function saveResourceSettings(settings:ResourceSettings|null) {
  const all=JSON.parse(localStorage.getItem(KEY)||'{}');all[mode()]=settings;localStorage.setItem(KEY,JSON.stringify(all));
  for(const key of ['onrivi_resource_folder_path','onrivi_resource_folder','resourceFolder']) { if(settings)localStorage.setItem(key,settings.path);else localStorage.removeItem(key); }
  window.dispatchEvent(new CustomEvent('onrivi:resource_folder_changed',{detail:settings?.path || ''}));
}
export function requireResourceSettings():ResourceSettings {
  const settings=getResourceSettings();
  if(!settings?.path || (settings.kind==='drive' && (!settings.folderId || !settings.mediaFolderId || !settings.profilesFolderId || !settings.promptFolderId || !settings.bibleFolderId))) { window.dispatchEvent(new CustomEvent('onrivi:resource-settings'));throw new Error('환경설정에서 리소스 폴더를 먼저 선택해 주세요.'); }
  return settings;
}
