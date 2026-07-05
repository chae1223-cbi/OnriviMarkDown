"use client";

import React from 'react';
import { useEditorContext } from '@/context/EditorContext';

export default function EditorCore() {
  const context = useEditorContext();

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-zinc-950">
      {/* 여기에 탭 바, 포매팅 툴바, 실제 에디터 영역이 들어옵니다. */}
      <div>Editor Core Area</div>
    </div>
  );
}
