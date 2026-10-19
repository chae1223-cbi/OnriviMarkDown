import React, { useEffect, useState } from 'react';

export type MediaAlign = 'left' | 'center' | 'right';

export function imagePathWithDimensions(path:string,width:string,height:string,align:string):string {
  const hashIndex=path.indexOf('#'),hash=hashIndex<0?'':path.slice(hashIndex);
  const main=hashIndex<0?path:path.slice(0,hashIndex),queryIndex=main.indexOf('?');
  const base=queryIndex<0?main:main.slice(0,queryIndex);
  const params=new URLSearchParams(queryIndex<0?'':main.slice(queryIndex+1));
  for(const key of ['width','w','height','h','align','a'])params.delete(key);
  if(width.trim())params.set('width',width.trim());
  if(height.trim())params.set('height',height.trim());
  if(align)params.set('align',align);
  const query=params.toString();return base+(query?'?'+query:'')+hash;
}

interface MediaSizeInputsProps {
  width: string;
  height: string;
  onWidthChange: (value: string) => void;
  onHeightChange: (value: string) => void;
  isDarkMode: boolean;
  imageSizing?: boolean;
}

interface MediaAlignmentControlProps {
  align: MediaAlign;
  onChange: (align: MediaAlign) => void;
  isDarkMode: boolean;
}

export function MediaSizeInputs({ width, height, onWidthChange, onHeightChange, isDarkMode, imageSizing=false }: MediaSizeInputsProps) {
  const [widthUnit,setWidthUnit]=useState(width ? (width.endsWith('%')?'%':'px') : '%');
  useEffect(()=>{if(width)setWidthUnit(width.endsWith('%')?'%':'px');},[width]);
  const inputClass = `w-full font-mono text-xs border rounded px-3 py-2.5 outline-none focus:ring-1 transition-all ${
    isDarkMode
      ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-600 focus:border-[#1d4ed8] focus:ring-[#1d4ed8]/30'
      : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400 focus:border-[#1d4ed8] focus:ring-[#1d4ed8]/20'
  }`;

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 mb-1 block">가로 {imageSizing?'':'(PX)'}</label>
        {imageSizing ? <div className="flex gap-2">
          <input aria-label="이미지 가로 크기" type="text" inputMode="decimal" value={width.replace(/(?:px|%)$/i,'')} onChange={e=>{
            const value=e.target.value.trim();
            if(!value){onWidthChange('');return;}
            if(/^\d*(?:\.\d*)?$/.test(value))onWidthChange(value+widthUnit);
            else if(/^\d+(?:\.\d+)?(?:px|%)$/i.test(value))onWidthChange(value.toLowerCase());
          }} placeholder={widthUnit==='%'?'100':'600'} className={inputClass}/>
          <select aria-label="이미지 가로 단위" value={widthUnit} className={inputClass+' !w-20 shrink-0'} onChange={e=>{
            const unit=e.target.value;setWidthUnit(unit);
            if(width)onWidthChange(width.replace(/(?:px|%)$/i,'')+unit);
          }}><option value="%">%</option><option value="px">px</option></select>
        </div> : <input type="text" value={width} onChange={e => onWidthChange(e.target.value)} placeholder="600px 또는 100%" className={inputClass} />}
      </div>
      <div>
        <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 mb-1 block">세로 {imageSizing?'(자동 / px)':'(PX)'}</label>
        <input aria-label={imageSizing?'이미지 세로 크기':undefined} type="text" value={height} onChange={e => onHeightChange(e.target.value)} placeholder="auto 또는 400px" className={inputClass} />
      </div>
      {imageSizing&&<p className="col-span-2 text-xs text-slate-500 dark:text-zinc-400">가로 80%는 본문 너비의 80%입니다. 세로를 비우거나 auto로 두면 원래 비율을 유지합니다. 단위를 바꾸면 입력한 숫자에 새 단위가 적용됩니다.</p>}
    </div>
  );
}

export function MediaAlignmentControl({ align, onChange, isDarkMode }: MediaAlignmentControlProps) {
  return (
    <div className={`rounded-lg p-4 border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-3 block">정렬</label>
      <div className="flex gap-2">
        {(['left', 'center', 'right'] as const).map(option => (
          <button
            type="button"
            key={option}
            onClick={() => onChange(option)}
            aria-pressed={align === option}
            className={`flex-1 py-2.5 rounded text-xs font-bold transition-all border ${
              align === option
                ? 'bg-[#1d4ed8] text-white border-[#1d4ed8] shadow-sm'
                : isDarkMode
                  ? 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
                  : 'border-slate-300 bg-slate-50 text-slate-500 hover:text-slate-700 hover:border-slate-400'
            }`}
          >
            {option === 'left' ? '⬅ 왼쪽' : option === 'center' ? '↔ 가운데' : '오른쪽 ➡'}
          </button>
        ))}
      </div>
    </div>
  );
}

// HTML 임베드에는 단위가 필요하다. 이미지 입력과 동일하게 숫자, px, %, auto를 받는다.
export function normalizeMediaDimension(value: string, fallback: string): string {
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  if (/^\d+(?:\.\d+)?$/.test(trimmed)) return `${trimmed}px`;
  if (/^\d+(?:\.\d+)?(?:px|%)$/i.test(trimmed) || trimmed.toLowerCase() === 'auto') return trimmed;
  return fallback;
}
