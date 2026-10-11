"use client";
import {useState} from 'react';
type Props={disabled:boolean;onNew:()=>void;onOpen:()=>void;onImport:()=>void;onImage:()=>void;onSave:()=>void;onFolderNew:()=>void};
export default function QuickStartBar({disabled,onNew,onOpen,onImport,onImage,onSave,onFolderNew}:Props){
 const [expanded,setExpanded]=useState(true);
 return <section className="no-print shrink-0 border-b border-blue-100 dark:border-zinc-700 bg-blue-50 dark:bg-zinc-900 px-3 py-2" aria-label="처음 시작하기">
 <div className="flex flex-wrap items-center gap-2"><button disabled={disabled} onClick={onNew} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold disabled:opacity-50">＋ 새 문서에 붙여넣기</button><button disabled={disabled} onClick={onOpen} className="px-3 py-2 rounded-lg border bg-white dark:bg-zinc-800 text-sm">MD 문서 열기</button><button disabled={disabled} onClick={onImport} className="px-3 py-2 rounded-lg border bg-white dark:bg-zinc-800 text-sm">문서 변환 · TXT 등</button><button disabled={disabled} onClick={onImage} className="px-3 py-2 rounded-lg border bg-white dark:bg-zinc-800 text-sm">사진 넣기</button><button disabled={disabled} onClick={onSave} className="px-3 py-2 rounded-lg border bg-white dark:bg-zinc-800 text-sm">문서 저장</button><button onClick={()=>setExpanded(!expanded)} aria-expanded={expanded} className="ml-auto text-xs underline text-blue-700 dark:text-blue-300">{expanded?'안내 접기':'시작 안내'}</button></div>
 {expanded&&<div className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300"><p><strong>① 새 문서 → ② AI 글 붙여넣기(Ctrl+V) → ③ 사진·서식 적용 → ④ 미리보기 → ⑤ 미리보기 내보내기</strong></p><p>Google Drive 연결 없이 바로 작성할 수 있습니다. 문서 저장은 현재 편집 중인 Markdown 내용을 MD 파일로 저장합니다. 미리보기 내보내기는 서식이 적용된 결과를 PDF·EPUB 등의 형식으로 저장합니다. 작성한 내용은 파일로 저장해 두세요.</p><button disabled={disabled} onClick={onFolderNew} className="text-xs underline">폴더와 이름을 지정해 새 파일 만들기</button></div>}
 </section>;
}
