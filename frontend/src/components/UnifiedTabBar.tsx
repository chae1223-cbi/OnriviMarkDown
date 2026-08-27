import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Copy, ArrowRightToLine, ArrowLeftRight, XSquare } from 'lucide-react';
import { FileNode } from '@/lib/indexedDbHelper';
import { useEditorContext } from '@/context/EditorContext';

// ====================================================================
// 📊 [OMD-EDIT-UnifiedTabBar-0002] UnifiedTabBar ➔ EditorTab
// 🎯 @KICK  : 에디터 탭 인터페이스 - id, name, path, content, isModified 등 탭 상태 정의
// 🛡️ @GUARD : 없음
// 🚨 @PATCH : **2026-08-27** — 에디터 개별 문서 탭을 마우스 드래그 앤 드롭(HTML5 Drag & Drop)으로 원하는 순서대로 자유롭게 이동시킬 수 있도록 UI 지원하고, 변경된 탭 순서를 localStorage(onrivi_tabs_order)에 저장 및 다음 접속/새로고침 시 해당 순서로 자동 복원 및 정렬 동기화 구현; **2026-07-04** — 저장이 필요한 경우에만 탭명 옆에 황금색 도트(#FFD700)를 노출하고, 닫기 버튼은 저장 여부와 상관없이 항시 우측에 배치하여 언제든지 탭을 닫을 수 있도록 UI 편의성 보정 패치
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

  /* [ONR-UI-004] 통합 탭바 제어 연동: 개별 문서 탭 간 전환 및 마우스 클릭 이벤트 바인딩 로직입니다. */
  return (
    <>
      <div className={`flex items-center w-full border-b border-black/5 dark:border-white/10 px-4 py-1.5 gap-1.5 overflow-x-auto select-none no-scrollbar h-[44px] ${
        isDarkMode ? 'bg-zinc-900 text-zinc-100' : 'bg-slate-50 text-slate-800'
      }`}>
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
                className={`group relative flex items-center gap-2 px-3.5 py-1.5 rounded-t-md text-sm cursor-pointer transition-all duration-200 border-t border-x font-semibold ${
                  isActive
                    ? isDarkMode
                      ? 'text-white border-indigo-700 border-b-zinc-950'
                      : 'text-white border-indigo-500 border-b-white shadow-[0_-2px_4px_rgba(0,0,0,0.02)]'
                    : isDarkMode
                      ? 'bg-zinc-900/50 text-zinc-400 border-transparent hover:bg-zinc-800/30 hover:text-zinc-200'
                      : 'bg-slate-50 text-slate-500 border-transparent hover:bg-slate-100/70 hover:text-slate-700'
                } ${draggedTabId === tab.id ? 'opacity-40 scale-[0.98] border-dashed border-indigo-500/50' : ''}`}
                style={{
                  marginBottom: '-1.5px',
                  zIndex: isActive ? 2 : 1,
                  backgroundColor: isActive ? '#282E82' : undefined
                }}
              >
                <span className="truncate max-w-[150px]">{tab.name}</span>
                
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
                  className={`w-4.5 h-4.5 flex items-center justify-center rounded-full transition-all duration-150 p-0.5 ${
                    isActive
                      ? isDarkMode
                        ? 'hover:bg-white/20 text-zinc-300 hover:text-white'
                        : 'hover:bg-white/30 text-zinc-200 hover:text-white'
                      : 'opacity-65 group-hover:opacity-100 hover:bg-slate-200/50 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200'
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
              className={`flex items-center gap-2 px-4 py-2 text-sm text-left w-full hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors`}
            >
              <ArrowLeftRight className="w-4 h-4 text-zinc-400" />
              다른 탭 닫기
            </button>
            <button
              onClick={handleCloseTabsToRight}
              className={`flex items-center gap-2 px-4 py-2 text-sm text-left w-full hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors`}
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
