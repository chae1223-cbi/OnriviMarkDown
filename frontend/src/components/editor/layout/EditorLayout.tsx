"use client";

import React from 'react';
import { useEditorContext } from '@/context/EditorContext';
import EditorCore from '../core/EditorCore';

export default function EditorLayout() {
  const context = useEditorContext();

  return (
    <div className="flex flex-col h-screen w-full bg-white dark:bg-zinc-950 overflow-hidden text-slate-800 dark:text-zinc-200">
      {/* 여기에 상단 메뉴바, 좌측 사이드바 레이아웃이 들어옵니다. */}
      {/* 내부의 실제 편집기 영역은 EditorCore로 위임합니다. */}
      <EditorCore />
    </div>
  );
}
