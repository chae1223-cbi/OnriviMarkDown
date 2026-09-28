import React from 'react';

export type MediaAlign = 'left' | 'center' | 'right';

interface MediaSizeInputsProps {
  width: string;
  height: string;
  onWidthChange: (value: string) => void;
  onHeightChange: (value: string) => void;
  isDarkMode: boolean;
}

interface MediaAlignmentControlProps {
  align: MediaAlign;
  onChange: (align: MediaAlign) => void;
  isDarkMode: boolean;
}

export function MediaSizeInputs({ width, height, onWidthChange, onHeightChange, isDarkMode }: MediaSizeInputsProps) {
  const inputClass = `w-full font-mono text-xs border rounded px-3 py-2.5 outline-none focus:ring-1 transition-all ${
    isDarkMode
      ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-600 focus:border-[#1d4ed8] focus:ring-[#1d4ed8]/30'
      : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400 focus:border-[#1d4ed8] focus:ring-[#1d4ed8]/20'
  }`;

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 mb-1 block">가로 (PX)</label>
        <input type="text" value={width} onChange={e => onWidthChange(e.target.value)} placeholder="600px 또는 100%" className={inputClass} />
      </div>
      <div>
        <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 mb-1 block">세로 (PX)</label>
        <input type="text" value={height} onChange={e => onHeightChange(e.target.value)} placeholder="auto 또는 400px" className={inputClass} />
      </div>
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
