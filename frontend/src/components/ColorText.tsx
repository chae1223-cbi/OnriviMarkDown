"use client";

import React from 'react';

// 텍스트에서 헥사코드를 찾아 컬러 박스와 함께 렌더링하는 컴포넌트
const ColorText = ({ text }: { text: string }) => {
  const hexRegex = /(#[A-Fa-f0-9]{6}|#[A-Fa-f0-9]{3})\b/g;
  const parts = text.split(hexRegex);
  
  if (parts.length === 1) return <>{text}</>;

  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 1) { // 헥사코드 매칭 부분
          return (
            <span key={i} className="inline-flex items-center gap-1.5 px-1 py-0.5 rounded bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 mx-0.5 group/color transition-colors hover:border-blue-500/30">
              <span 
                className="w-3 h-3 rounded-sm border border-black/20 dark:border-white/20 shadow-sm" 
                style={{ backgroundColor: part }} 
              />
              <span className="font-mono text-[0.9em] opacity-90">{part}</span>
            </span>
          );
        }
        return part;
      })}
    </>
  );
};

export default ColorText;
