"use client";
import {useEffect,useState} from 'react';
import ReactMarkdown from 'react-markdown';
import {adminFetch} from '@/lib/adminFetch';
import {showToast} from '@/utils/toast';
import initialFiles from '@/lib/helpAssets.json';
type Doc={id:string;title:string;content:string;order:number;updated_at?:string};
export default function HelpManager(){
 const [drafts,setDrafts]=useState<Doc[]>([]),[published,setPublished]=useState<Doc[]>([]),[doc,setDoc]=useState<Doc|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[dirty,setDirty]=useState(false);
 async function load(){const response=await adminFetch('/api/admin/help');const data=await response.json();if(!response.ok)throw Error(data.error||'도움말 조회 실패');setDrafts(data.drafts);setPublished(data.published);}
 useEffect(()=>{void load().catch(e=>setError(e.message));},[]);
 function select(next:Doc){if(dirty&&!confirm('저장하지 않은 변경사항을 버릴까요?'))return;setDoc({...next});setDirty(false);}
 async function save(action:string){if(!doc)return;if(action==='publish'&&!confirm('이 내용을 사용자 도움말에 게시할까요?'))return;setBusy(true);try{const response=await adminFetch('/api/admin/help',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...doc,action})});const data=await response.json();if(!response.ok)throw Error(data.error);if(action!=='unpublish')setDirty(false);await load();showToast(action==='publish'?'도움말이 게시되었습니다.':action==='unpublish'?'게시가 내려갔습니다.':'초안이 저장되었습니다.','success');}catch(e){showToast(e instanceof Error?e.message:'저장 실패','error');}finally{setBusy(false);}}
 async function importFile(url:string,index:number){setBusy(true);try{const response=await fetch(url);if(!response.ok)throw Error('기존 파일을 불러오지 못했습니다.');const content=await response.text();select({id:crypto.randomUUID(),title:initialFiles.find(x=>x.url===url)?.source_title||'도움말',content:content.replace(/\]\((?:\.\/)?assets\//g,'](https://onrivi.com/help/assets/'),order:index});}catch(e){showToast(e instanceof Error?e.message:'불러오기 실패','error');}finally{setBusy(false);}}
 return <section className="admin-glass-card p-5 space-y-4">
 <div className="flex justify-between"><div><h2 className="text-lg font-bold">도움말 작성·게시</h2><p className="text-sm text-zinc-500">초안 저장은 공개 내용을 바꾸지 않습니다. 게시하면 사용자 도움말에 반영됩니다.</p></div><button disabled={busy} className="admin-btn-primary" onClick={()=>select({id:crypto.randomUUID(),title:'새 도움말',content:'# 새 도움말\n',order:drafts.length})}>새 도움말</button></div>
 {error&&<p role="alert" className="text-red-600">{error}</p>}
 <div className="grid lg:grid-cols-[240px_1fr] gap-5"><aside className="space-y-2">
 {drafts.map(item=><button disabled={busy} key={item.id} onClick={()=>select(item)} className="block w-full text-left p-3 border rounded-lg"><strong>{item.title}</strong><span className="block text-xs">{published.some(x=>x.id===item.id)?'게시 중':'초안'}{published.some(x=>x.id===item.id&&x.updated_at!==item.updated_at)?' · 미게시 수정 있음':''}</span></button>)}
 <details><summary className="cursor-pointer text-sm font-bold">기존 도움말 불러오기</summary>{initialFiles.filter(x=>x.file_name.endsWith('.md')).map((item,index)=><button disabled={busy} key={item.id} onClick={()=>void importFile(item.url,index)} className="block text-left text-sm p-2 hover:underline">{item.source_title}</button>)}</details>
 </aside>{doc?<div className="space-y-3">
 <label className="block text-sm font-bold">제목<input disabled={busy} className="admin-input w-full mt-1 p-2" value={doc.title} onChange={e=>{setDoc({...doc,title:e.target.value});setDirty(true);}}/></label>
 <label className="block text-sm font-bold">표시 순서<input disabled={busy} type="number" min="0" max="9999" className="admin-input ml-3 p-2 w-24" value={doc.order} onChange={e=>{setDoc({...doc,order:Number(e.target.value)});setDirty(true);}}/></label>
 <div className="grid xl:grid-cols-2 gap-3"><label className="text-sm font-bold">Markdown 본문<textarea disabled={busy} className="admin-input block w-full min-h-[420px] mt-2 p-3 font-mono text-sm" value={doc.content} onChange={e=>{setDoc({...doc,content:e.target.value});setDirty(true);}}/></label><div><h3 className="text-sm font-bold">미리보기</h3><div className="prose dark:prose-invert max-w-none mt-2 border rounded-lg p-4 max-h-[600px] overflow-auto"><ReactMarkdown>{doc.content}</ReactMarkdown></div></div></div>
 <div className="flex flex-wrap gap-2"><button disabled={busy} onClick={()=>void save('save')} className="admin-btn-secondary">초안 저장</button><button disabled={busy} onClick={()=>void save('publish')} className="admin-btn-primary">게시</button>{published.some(x=>x.id===doc.id)&&<button disabled={busy} onClick={()=>{if(confirm('이 도움말을 공개 목록에서 내릴까요?'))void save('unpublish');}} className="admin-btn-secondary">게시 내리기</button>}<span className="text-sm text-zinc-500">{dirty?'저장하지 않은 변경 있음':''}</span></div>
 </div>:<p className="text-zinc-500">새 도움말을 만들거나 기존 파일을 불러오세요.</p>}</div></section>;
}
