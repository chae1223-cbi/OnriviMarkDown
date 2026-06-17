import React from 'react';
import { X, Plus } from 'lucide-react';
import { FileNode } from '@/lib/helper';

// ====================================================================
// 📊 [OMD-EDIT-UnifiedTabBar-0002] UnifiedTabBar ➔ EditorTab
// 🎯 @KICK  : 에디터 탭 인터페이스 - id, name, path, content, isModified 등 탭 상태 정의
// 🛡️ @GUARD : 없음
// 🚨 @PATCH : 없음
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
}

interface UnifiedTabBarProps {
  tabs: EditorTab[];
  activeTabId: string | null;
  onSwitchTab: (id: string) => void;
  onCloseTab: (id: string, e?: React.MouseEvent) => void;
  onCreateNewTab: () => void;
  isDarkMode: boolean;
}

// ====================================================================
// 📊 [OMD-EDIT-UnifiedTabBar-0001] UnifiedTabBar ➔ UnifiedTabBar
// 🎯 @KICK  : 통합 탭바 컴포넌트 - 열린 문서 탭 목록 표시, 탭 전환/닫기/추가 기능 제공
// 🛡️ @GUARD : 없음
// 🚨 @PATCH : 없음
// 🔗 @CALLS : onSwitchTab, onCloseTab, onCreateNewTab
// ====================================================================
export default function UnifiedTabBar({
  tabs,
  activeTabId,
  onSwitchTab,
  onCloseTab,
  onCreateNewTab,
  isDarkMode
}: UnifiedTabBarProps) {
  /* [ONR-UI-004] 통합 탭바 제어 연동: 개별 문서 탭 간 전환 및 마우스 클릭 이벤트 바인딩 로직입니다. */
  return (
    <div className={`flex items-center w-full border-b border-black/5 dark:border-white/10 px-4 py-1.5 gap-1.5 overflow-x-auto select-none no-scrollbar h-[44px] ${
      isDarkMode ? 'bg-zinc-900 text-zinc-100' : 'bg-slate-50 text-slate-800'
    }`}>
      <div className="flex items-center gap-1.5 flex-1 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTabId === tab.id;
          return (
            <div
              key={tab.id}
              onClick={() => onSwitchTab(tab.id)}
              className={`group relative flex items-center gap-2 px-3.5 py-1.5 rounded-t-md text-sm cursor-pointer transition-all duration-200 border-t border-x ${
                isActive
                  ? isDarkMode
                    ? 'bg-zinc-950 text-zinc-100 border-zinc-800 border-b-zinc-950 font-semibold'
                    : 'bg-white text-slate-800 border-slate-200 border-b-white font-semibold shadow-[0_-2px_4px_rgba(0,0,0,0.02)]'
                  : isDarkMode
                    ? 'bg-zinc-900/50 text-zinc-400 border-transparent hover:bg-zinc-800/30 hover:text-zinc-200'
                    : 'bg-slate-50 text-slate-500 border-transparent hover:bg-slate-100/70 hover:text-slate-700'
              }`}
              style={{
                marginBottom: '-1.5px',
                zIndex: isActive ? 2 : 1
              }}
            >
              <span className="truncate max-w-[150px]">{tab.name}</span>
              
              {/* 수정됨(미저장) 표시 */}
              {tab.isModified && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 animate-pulse" title="수정됨" />
              )}
              
              {/* 닫기 버튼 */}
              <button
                onClick={(e) => onCloseTab(tab.id, e)}
                className={`w-4.5 h-4.5 flex items-center justify-center rounded-full transition-all duration-150 p-0.5 ${
                  isActive
                    ? isDarkMode
                      ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                      : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
                    : 'opacity-0 group-hover:opacity-100 hover:bg-slate-200/50 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200'
                }`}
                title="탭 닫기"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      <button
        onClick={onCreateNewTab}
        className={`p-1.5 rounded-full transition-colors flex-shrink-0 ${
          isDarkMode
            ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            : 'hover:bg-slate-200 text-slate-500 hover:text-slate-800'
        }`}
        title="새 탭 추가"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
}
