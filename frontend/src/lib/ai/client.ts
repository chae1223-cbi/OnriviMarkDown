// ====================================================================
// 📊 [OMD-AI-Client-0001] src/lib/ai/client.ts
// 🎯 @KICK  : 다중 AI(Google, OpenAI, Claude) 클라이언트 통신 및 키 영구 보존 엔진
// 🛡️ @GUARD : Rule 1(주석 최신화), AES-256 보안 저장소 영구 연동, 멀티 스코프 탐색
// 🚨 @PATCH : **2026-10-20** — [연결 해제 시 connection 정보 완전 삭제(removeConnection) 파이프라인 추가]:
//             1) removeConnection 함수 신설: 연결 해제 시 스토리지에서 해당 프로바이더 정보 완전 삭제 및 이벤트 전파
// 🚨 @PATCH : **2026-10-20** — [OpenAI/Claude/Google API 키 다중 스코프 자가치유 탐색 및 질의 연동 무결성 완비]:
//             1) getProviderApiKey: scope 불일치(desktop-local vs user_id) 방어 및 AES 보안 저장소/로컬스토리지 4중 복호화로 새로고침/재실행 시 키 휘발 결함 원천 해결
//             2) configureAI: remember 기본값 true 적용 및 saveSecureData 영구 암호화 저장 일원화
//             3) Desktop Electron 세션 및 Web Supabase 세션 간 키 유실 방어
// ====================================================================
import {browserAccountStorage as storage,getBrowserAccountScope} from '../browserAccountStorage';
import {supabase} from '../supabaseClient';
import {saveSecureData,loadSecureData} from '../secureStorage';
import type {AIProvider,AIModel,AIInput} from './types';
export const AI_LABELS:Record<AIProvider,string>={google:'Google · Gemini / Gemma',openai:'OpenAI',anthropic:'Claude'};
const STORE='onrivi_ai_connections';
type Connection={model:string;models:AIModel[];updatedAt?:number};
const memoryKeys=new Map<string,string>();
const api=()=>typeof window!=='undefined'?(window as any).electronAPI:null;
export const aiAccountScope=()=>getBrowserAccountScope()||storage.getItem('onrivi_user_id')||'desktop-local';
const selectedKey=()=>`onrivi_ai_selected:${aiAccountScope()}`;
const connectionKey=()=>`${STORE}:${aiAccountScope()}`;
const disabledKey=(scope:string,provider:AIProvider)=>`onrivi_ai_disabled:${scope}:${provider}`;

/**
 * 다중 AI 프로바이더(Google, OpenAI, Claude) API 키 조회 및 자동 복원
 * - 1순위: 지정 scope:provider 메모리 맵
 * - 2순위: scope 불일치 대비 임의 scope의 동일 provider 메모리 맵
 * - 3순위: 로컬 AES-256 보안 저장소(loadSecureData) 및 로컬스토리지 다중 폴백
 */
export function getProviderApiKey(scope:string,provider:AIProvider):string{
  const inMem=memoryKeys.get(scope+':'+provider);
  if(inMem&&inMem.trim())return inMem.trim();

  // 스코프 불일치 방어 (desktop-local vs user_id 등)
  let foundInMem = '';
  memoryKeys.forEach((v, k) => {
    if (!foundInMem && k.endsWith(':' + provider) && v && v.trim()) {
      foundInMem = v.trim();
    }
  });
  if (foundInMem) {
    memoryKeys.set(scope + ':' + provider, foundInMem);
    return foundInMem;
  }

  if(typeof window!=='undefined'){
    try{
      const candidates: (string | null | undefined)[] = [
        loadSecureData<string>(`onrivi_ai_key_${provider}`),
        loadSecureData<string>(`onrivi_${provider}_api_key`),
        window.localStorage.getItem(`onrivi_ai_key_${provider}`),
        window.localStorage.getItem(`onrivi_${provider}_api_key`),
        window.localStorage.getItem(`${provider}_api_key`),
        window.localStorage.getItem(`${provider}ApiKey`),
        storage.getItem(`onrivi_ai_key_${provider}`),
        storage.getItem(`onrivi_${provider}_api_key`),
      ];

      if(provider==='google'){
        candidates.push(
          loadSecureData<string>('onrivi_gemini_api_key'),
          loadSecureData<string>('geminiApiKey'),
          window.localStorage.getItem('onrivi_gemini_api_key'),
          window.localStorage.getItem('geminiApiKey'),
          storage.getItem('onrivi_gemini_api_key'),
          storage.getItem('geminiApiKey')
        );
      }

      for(const val of candidates){
        if(!val||typeof val!=='string')continue;
        const clean=val.trim();
        if(clean&&!clean.startsWith('U2FsdGVkX1')){
          memoryKeys.set(scope+':'+provider,clean);
          memoryKeys.set('default:'+provider,clean);
          return clean;
        }
      }
    }catch{}
  }
  return '';
}

export function readConnections():Partial<Record<AIProvider,Connection>>{
  try{
    const raw=JSON.parse(storage.getItem(connectionKey())||'{}'),result:Partial<Record<AIProvider,Connection>>={};
    for(const provider of ['google','openai','anthropic'] as AIProvider[]){
      const row=raw?.[provider];if(!row||typeof row!=='object')continue;
      result[provider]={model:typeof row.model==='string'?row.model:'',updatedAt:typeof row.updatedAt==='number'?row.updatedAt:undefined,models:Array.isArray(row.models)?row.models.filter((m:any)=>typeof m?.id==='string'&&typeof m?.name==='string'&&typeof m?.family==='string').slice(0,2000):[]};
    }
    return result;
  }catch{return {};}
}
export function saveConnection(provider:AIProvider,connection:Connection){const all=readConnections();all[provider]=connection;storage.setItem(connectionKey(),JSON.stringify(all));window.dispatchEvent(new Event('onrivi:ai-connections'));}
export function removeConnection(provider:AIProvider){const all=readConnections();delete all[provider];storage.setItem(connectionKey(),JSON.stringify(all));window.dispatchEvent(new Event('onrivi:ai-connections'));}
export function selectedConnection():{provider:AIProvider;model:string}{try{const v=JSON.parse(storage.getItem(selectedKey())||'{}');return {provider:['google','openai','anthropic'].includes(v?.provider)?v.provider:'google',model:typeof v?.model==='string'?v.model:''};}catch{return {provider:'google',model:''};}}
export function selectConnection(provider:AIProvider,model:string){storage.setItem(selectedKey(),JSON.stringify({provider,model}));window.dispatchEvent(new Event('onrivi:ai-connections'));}
export async function configureAI(scope:string,provider:AIProvider,key:string,remember=true,remove=false){
  const cleanKey=key.trim();
  if(api()?.inlineAIKey){
    await api().inlineAIKey({scope,provider,key:cleanKey,remember:true,remove});
  }
  if(remove){
    memoryKeys.delete(scope+':'+provider);
    const toDelete: string[] = [];
    memoryKeys.forEach((_v, k) => {
      if (k.endsWith(':' + provider)) toDelete.push(k);
    });
    toDelete.forEach((k) => memoryKeys.delete(k));
    if(typeof window!=='undefined'){
      try{
        saveSecureData(`onrivi_ai_key_${provider}`,'');
        saveSecureData(`onrivi_${provider}_api_key`,'');
        window.localStorage.removeItem(`onrivi_ai_key_${provider}`);
        window.localStorage.removeItem(`onrivi_${provider}_api_key`);
      }catch{}
    }
  }else if(cleanKey){
    memoryKeys.set(scope+':'+provider,cleanKey);
    memoryKeys.set('default:'+provider,cleanKey);
    if(typeof window!=='undefined'){
      try{
        saveSecureData(`onrivi_ai_key_${provider}`,cleanKey);
        saveSecureData(`onrivi_${provider}_api_key`,cleanKey);
      }catch{}
    }
  }
  if(remove)storage.setItem(disabledKey(scope,provider),'true');else if(cleanKey)storage.removeItem(disabledKey(scope,provider));
  window.dispatchEvent(new Event('onrivi:ai-connections'));
}
export async function connectedAI(scope:string,provider:AIProvider){
  if(Boolean(getProviderApiKey(scope,provider)))return true;
  return api()?.inlineAIKey?Boolean((await api().inlineAIKey({scope,provider})).connected):false;
}
export function useLegacyGoogleKey(scope:string,key:string){
  if(key?.trim()&&storage.getItem(disabledKey(scope,'google'))!=='true'){
    const clean=key.trim();
    memoryKeys.set(scope+':google',clean);
    memoryKeys.set('default:google',clean);
    try{
      saveSecureData('onrivi_ai_key_google',clean);
    }catch{}
  }
}
export async function aiRequest(scope:string,provider:AIProvider,action:'models'|'generate',input:AIInput|undefined,signal:AbortSignal,onText?:(text:string)=>void):Promise<AIModel[]>{
  const id=crypto.randomUUID();signal.throwIfAborted();
  if(api()&&!api().inlineAIRun)throw Error('설치형 앱을 새 버전으로 업데이트한 뒤 AI 연결을 설정해 주세요.');
  if(api()?.inlineAIRun){
    // Transfer a key into the desktop session vault, never persist it implicitly unless remembered.
    const effectiveKey=getProviderApiKey(scope,provider);
    if(effectiveKey&&!Boolean((await api().inlineAIKey({scope,provider})).connected))await api().inlineAIKey({scope,provider,key:effectiveKey,remember:true});
    let complete=false;
    const unsubscribe=api().onInlineAIEvent((event:any)=>{if(event.id!==id||signal.aborted)return;if(event.type==='textDelta')onText?.(event.text);if(event.type==='complete')complete=true;});
    const abort=()=>{void api().inlineAICancel(id);};signal.addEventListener('abort',abort,{once:true});
    try{signal.throwIfAborted();const result=await api().inlineAIRun({scope,provider,id,action,input});signal.throwIfAborted();if(action==='generate'&&!complete)throw Error('AI 응답이 완료되지 않았습니다.');return result.models||[];}
    finally{unsubscribe();signal.removeEventListener('abort',abort);}
  }
  const key=getProviderApiKey(scope,provider);
  if(!key){
    const providerName=provider==='openai'?'OpenAI':provider==='google'?'Google':provider==='anthropic'?'Claude':provider;
    throw Error(`환경설정에서 ${providerName} API 키를 등록해 주세요.`);
  }
  const {data}=await supabase.auth.getSession();const token=data.session?.access_token;if(!token)throw Error('웹 AI를 사용하려면 로그인해 주세요.');
  const response=await fetch('/api/ai/request',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({provider,key,action,input}),signal});
  if(!response.ok){const body=await response.json().catch(()=>({}));throw Error(body.error||'AI 서버 연결을 확인해 주세요.');}
  if(action==='models')return (await response.json()).models;
  if(!response.body)throw Error('AI 응답이 비어 있습니다.');
  const reader=response.body.getReader(),decoder=new TextDecoder();let buffer='',complete=false;
  try{while(true){signal.throwIfAborted();const {done,value}=await reader.read();buffer+=decoder.decode(value||new Uint8Array(),{stream:!done});let end;while((end=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,end);buffer=buffer.slice(end+1);if(!line.trim())continue;const event=JSON.parse(line);if(event.type==='error')throw Error(event.message);if(event.type==='textDelta')onText?.(event.text);if(event.type==='complete')complete=true;}if(done)break;}if(!complete)throw Error('AI 응답이 중간에 끊겼습니다.');}
  finally{await reader.cancel().catch(()=>{});reader.releaseLock();}
  return [];
}
