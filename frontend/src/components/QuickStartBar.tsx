"use client";
import {useState} from 'react';
type Props={disabled:boolean;onNew:()=>void;onOpen:()=>void;onImage:()=>void;onSave:()=>void};
export default function QuickStartBar({disabled,onNew,onOpen,onImage,onSave}:Props){
 const [expanded,setExpanded]=useState(true);
 return <section className="no-print shrink-0 border-b border-blue-100 dark:border-zinc-700 bg-blue-50 dark:bg-zinc-900 px-3 py-2" aria-label="처음 시작하기">
 <div className="flex flex-wrap items-center gap-2"><button disabled={disabled} onClick={onNew} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold disabled:opacity-50">＋ 새 문서작성</button><button disabled={disabled} onClick={onOpen} className="px-3 py-2 rounded-lg border bg-white dark:bg-zinc-800 text-sm">파일 열기</button><button disabled={disabled} onClick={onImage} className="px-3 py-2 rounded-lg border bg-white dark:bg-zinc-800 text-sm">사진 넣기</button><button disabled={disabled} onClick={onSave} className="px-3 py-2 rounded-lg border bg-white dark:bg-zinc-800 text-sm">문서 저장</button><button onClick={()=>setExpanded(!expanded)} aria-expanded={expanded} className="ml-auto text-xs underline text-blue-700 dark:text-blue-300">{expanded?'안내 접기':'시작 안내'}</button></div>
 {expanded&&<div className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300"><p><strong>① 폴더·이름 지정 → 새 문서작성 → ② AI 글 붙여넣기(Ctrl+V) → ③ 사진·서식 적용 → ④ 미리보기 → ⑤ 미리보기 내보내기</strong></p><p>Google Drive 연결은 선택 사항입니다. 파일 열기는 MD 파일을 가져오거나 지원 문서를 MD로 변환합니다. 새 문서는 지정한 폴더에 생성되며, 자동 저장이 켜져 있으면 편집 내용을 해당 파일에 저장합니다. 문서 저장은 현재 편집 중인 Markdown 내용을 MD 파일로 저장합니다. 미리보기 내보내기는 서식이 적용된 결과를 PDF·EPUB 등의 형식으로 저장합니다. 작성한 내용은 파일로 저장해 두세요.</p></div>}
 </section>;
}

