import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Copy, ArrowRightToLine, ArrowLeftRight, XSquare } from 'lucide-react';
import { FileNode } from '@/lib/indexedDbHelper';
import { useEditorContext } from '@/context/EditorContext';

// ====================================================================
// 📊 [OMD-EDIT-UnifiedTabBar-0002] UnifiedTabBar ➔ EditorTab
// 🎯 @KICK  : 에디터 탭 인터페이스 - id, name, path, content, isModified 등 탭 상태 정의
// 🛡️ @GUARD : 없음
// 🚨 @PATCH : **2026-09-02** — [ONRIVI-DS-SYSTEM-002 v5.0] 좌측 사이드바 탭과 100% 동일한 폰트(LineSeed/D2Coding/Pretendard 12px bold), 캡슐형 형태(rounded-md), LDSG 그린 그라데이션(bg-gradient-to-r from-[#06C755] to-[#05B04B])으로 상단 탭 스타일 통일
//             **2026-08-27** — 에디터 개별 문서 탭을 마우스 드래그 앤 드롭(HTML5 Drag & Drop)으로 원하는 순서대로 자유롭게 이동시킬 수 있도록 UI 지원하고, 변경된 탭 순서를 localStorage(onrivi_tabs_order)에 저장 및 다음 접속/새로고침 시 해당 순서로 자동 복원 및 정렬 동기화 구현; **2026-07-04** — 저장이 필요한 경우에만 탭명 옆에 황금색 도트(#FFD700)를 노출하고, 닫기 버튼은 저장 여부와 상관없이 항시 우측에 배치하여 언제든지 탭을 닫을 수 있도록 UI 편의성 보정 패치
// 🔗 @CALLS : 없음
// ====================================================================
export interface EditorTab {
  id: string;
  name: string;
  path: string | null;
  node: FileNode | null;
  content: string;
  isModified: boolean;
  scrollTop?: number;
  model?: any;
  previewMode?: 'edit' | 'both' | 'preview' | 'css-style';
  isStyleTab?: boolean;
}

export default function UnifiedTabBar() {
  const { tabs, activeTabId, switchTab: onSwitchTab, closeTab: onCloseTab, isDarkMode, setTabs } = useEditorContext();
  
  // 📌 드래그 앤 드롭 탭 순서 제어 상태
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTabId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedTabId || draggedTabId === targetId) return;

    const sourceIndex = tabs.findIndex((t: EditorTab) => t.id === draggedTabId);
    const targetIndex = tabs.findIndex((t: EditorTab) => t.id === targetId);

    if (sourceIndex !== -1 && targetIndex !== -1) {
      const updatedTabs = [...tabs];
      const [draggedTab] = updatedTabs.splice(sourceIndex, 1);
      updatedTabs.splice(targetIndex, 0, draggedTab);
      
      if (setTabs) {
        setTabs(updatedTabs);
        // 💾 [탭 순서 영구 보존] localStorage 에 저장
        const tabOrder = updatedTabs.map(t => t.id);
        localStorage.setItem('onrivi_tabs_order', JSON.stringify(tabOrder));
      }
    }
    setDraggedTabId(null);
  };

  // 💡 Context Menu State
  const [contextMenu, setContextMenu] = useState<{ visible: boolean, x: number, y: number, tabId: string } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    if (contextMenu?.visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [contextMenu]);

  const handleContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      tabId
    });
  };

  const handleCloseOtherTabs = () => {
    if (!contextMenu) return;
    tabs.forEach((tab: EditorTab) => {
      if (tab.id !== contextMenu.tabId) onCloseTab(tab.id);
    });
    setContextMenu(null);
  };

  const handleCloseTabsToRight = () => {
    if (!contextMenu) return;
    const index = tabs.findIndex((t: EditorTab) => t.id === contextMenu.tabId);
    if (index !== -1) {
      for (let i = index + 1; i < tabs.length; i++) {
        onCloseTab(tabs[i].id);
      }
    }
    setContextMenu(null);
  };

  const handleCloseAllTabs = () => {
    tabs.forEach((tab: EditorTab) => onCloseTab(tab.id));
    setContextMenu(null);
  };

  /* [ONR-UI-004] 통합 탭바 제어 연동: 왼쪽 사이드바 탭과 동일한 폰트, 형태, LDSG 그린 그라데이션 적용 */
  return (
    <>
      <div 
        style={{
          fontFamily: "'D2Coding', 'JetBrains Mono', 'LineSeed', 'Pretendard', Consolas, 'Malgun Gothic', '맑은 고딕', monospace",
        }}
        className="flex items-center w-full border-b border-[#E2E8F0] dark:border-white/[0.08] px-2 gap-1.5 overflow-x-auto select-none no-scrollbar h-10 bg-white/75 dark:bg-black/30 backdrop-blur-md text-on-surface"
      >
        <div className="flex items-center gap-1.5 flex-1 overflow-x-auto no-scrollbar relative">
          {tabs.map((tab: EditorTab) => {
            const isActive = activeTabId === tab.id;
            return (
              <div
                key={tab.id}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, tab.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, tab.id)}
                onClick={() => { if (!isActive) onSwitchTab(tab.id); }}
                onContextMenu={(e) => handleContextMenu(e, tab.id)}
                className={`group relative flex items-center gap-2 px-3 py-1 rounded-md text-[12px] font-bold cursor-pointer transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#06C755] to-[#05B04B] text-white shadow-sm shadow-[#06C755]/30'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                } ${draggedTabId === tab.id ? 'opacity-40 scale-[0.98] border-dashed border-[#06C755]' : ''}`}
                style={{
                  zIndex: isActive ? 2 : 1,
                }}
              >
                <span className="truncate max-w-[160px]">{tab.name}</span>
                
                {/* 💡 1. 저장 필요 상태(isModified)인 경우 황금색 도트 표시 */}
                {tab.isModified && (
                  <span 
                    className="w-1.5 h-1.5 rounded-full bg-[#FFD700] shadow-[0_0_4px_#FFD700] flex-shrink-0 animate-pulse" 
                    title="저장 필요" 
                  />
                )}
                
                {/* 💡 2. 닫기 단추: 저장 여부와 관계없이 항상 언제나 노출 */}
                <button
                  onClick={(e) => onCloseTab(tab.id, e)}
                  className={`w-4 h-4 flex items-center justify-center rounded-full transition-all duration-150 p-0.5 ${
                    isActive
                      ? 'hover:bg-black/20 text-white/90 hover:text-white'
                      : 'opacity-65 group-hover:opacity-100 hover:bg-slate-200/60 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200'
                  }`}
                  title="탭 닫기"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Context Menu */}
      {contextMenu?.visible && (
        <div
          ref={menuRef}
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className={`fixed z-50 w-48 rounded-lg shadow-xl border overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
            isDarkMode 
              ? 'bg-zinc-800 border-zinc-700 text-zinc-200' 
              : 'bg-white border-zinc-200 text-zinc-800'
          }`}
        >
          <div className="py-1 flex flex-col">
            <button
              onClick={handleCloseOtherTabs}
              className={`flex items-center gap-2 px-4 py-2 text-sm text-left w-full hover:bg-[#06C755]/10 hover:text-[#06C755] transition-colors`}
            >
              <ArrowLeftRight className="w-4 h-4 text-zinc-400" />
              다른 탭 닫기
            </button>
            <button
              onClick={handleCloseTabsToRight}
              className={`flex items-center gap-2 px-4 py-2 text-sm text-left w-full hover:bg-[#06C755]/10 hover:text-[#06C755] transition-colors`}
            >
              <ArrowRightToLine className="w-4 h-4 text-zinc-400" />
              오른쪽 탭 닫기
            </button>
            <button
              onClick={handleCloseAllTabs}
              className={`flex items-center gap-2 px-4 py-2 text-sm text-left w-full hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors`}
            >
              <XSquare className="w-4 h-4 text-red-500/70" />
              모두 닫기
            </button>
          </div>
        </div>
      )}
    </>
  );
}
