"use client";

import React, { useState, useEffect } from 'react';
import GlobalSearch from './GlobalSearch';
import FileTreeItem from './FileTreeItem';
import { FileNode } from '@/lib/helper';
import { getApiUrl } from '@/lib/api';

interface TocItem {
  id: string;
  text: string;
  level: number;
  lineNumber: number;
}

interface LeftSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (v: boolean) => void;
  sidebarWidth: number;
  setSidebarWidth: (v: number) => void;
  sidebarTab: 'toc' | 'search' | 'explorer';
  setSidebarTab: (v: 'toc' | 'search' | 'explorer') => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (v: boolean) => void;
  isDarkMode: boolean;
  content: string;
  currentFileName: string;
  setCurrentFileName: (v: string) => void;
  setCurrentFileNode: (v: FileNode | null) => void;
  setContent: (v: string) => void;
  lastSavedContentRef: React.MutableRefObject<string>;
  editorRef: React.MutableRefObject<any>;
  previewRef: React.RefObject<HTMLDivElement>;
  toc: TocItem[];
  scrollToLine: (line: number) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  fileList: FileNode[];
  rootFolder: { name: string; handle?: any } | null;
  workspaceType: string;
  openFile: (node: FileNode | null) => void;
  currentFileNode: FileNode | null;
  refreshFileList: () => void;
  askConfirm: (config: { title: string; message: string; onConfirm: () => void; isDanger?: boolean }) => void;
  isMergeMode?: boolean;
  selectedMergeNodes?: FileNode[];
  toggleMergeNodeSelect?: (node: FileNode) => void;
  onSelectRootFolder?: () => void;
}

export default function LeftSidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  sidebarWidth,
  setSidebarWidth,
  sidebarTab,
  setSidebarTab,
  isSearchOpen,
  setIsSearchOpen,
  isDarkMode,
  content,
  currentFileName,
  setCurrentFileName,
  setCurrentFileNode,
  setContent,
  lastSavedContentRef,
  editorRef,
  previewRef,
  toc,
  scrollToLine,
  showToast,
  fileList,
  rootFolder,
  workspaceType,
  openFile,
  currentFileNode,
  refreshFileList,

  askConfirm,
  isMergeMode = false,
  selectedMergeNodes = [],
  toggleMergeNodeSelect,
  onSelectRootFolder
}: LeftSidebarProps) {
  const [drives, setDrives] = useState<FileNode[]>([]);
  const [isDrivesLoading, setIsDrivesLoading] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setIsDesktop(typeof window !== 'undefined' && !!(window as any).electronAPI);
  }, []);

  const fetchDrives = async () => {
    setIsDrivesLoading(true);
    try {
      const api = (window as any).electronAPI;
      if (api?.getDrives) {
        const list = await api.getDrives();
        setDrives(list.map((d: string) => ({ name: d, kind: 'directory' as const, path: d + '\\', children: [] })));
      } else if (!api) {
        const res = await fetch(getApiUrl('/api/drives'));
        if (res.ok) {
          setDrives(await res.json());
        }
      }
    } catch (err) {
      console.warn('드라이브 목록 조회 실패:', err);
    } finally {
      setIsDrivesLoading(false);
    }
  };

  useEffect(() => {
    if (sidebarTab === 'explorer' && isDesktop) {
      fetchDrives();
    }
  }, [sidebarTab, isDesktop]);

  const handleLazyLoad = async (node: FileNode): Promise<FileNode[]> => {
    try {
      const api = (window as any).electronAPI;
      if (api?.listDirectory) {
        return await api.listDirectory(node.path);
      }
      const res = await fetch(getApiUrl(`/api/list-files?path=${encodeURIComponent(node.path || '')}`));
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('폴더 목록 조회 실패:', err);
    }
    return [];
  };

  if (!isSidebarOpen) return null;

  return (
      <aside 
        style={{ width: sidebarWidth }} 
        className="flex flex-col border-r border-zinc-200 dark:border-zinc-700/60 bg-zinc-100 dark:bg-zinc-900 select-none relative z-10"
      >
        {/* 탭 헤더 */}
        <div className="h-9 border-b border-zinc-200 dark:border-zinc-700/60 flex items-center px-2 bg-zinc-200/70 dark:bg-zinc-800/50 justify-between">
          <div className="flex gap-1">
            <button
              onClick={() => {
                setSidebarTab('explorer');
                setIsSearchOpen(false);
              }}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                sidebarTab === 'explorer' 
                  ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:bg-white/50 dark:hover:bg-zinc-800'
              }`}
            >
              📂 탐색기
            </button>
            <button
              onClick={() => {
                setSidebarTab('toc');
                setIsSearchOpen(false);
              }}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                sidebarTab === 'toc' 
                  ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:bg-white/50 dark:hover:bg-zinc-800'
              }`}
            >
              📝 문서 개요
            </button>
            <button
              onClick={() => {
                setSidebarTab('search');
                setIsSearchOpen(true);
              }}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                sidebarTab === 'search' 
                  ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:bg-white/50 dark:hover:bg-zinc-800'
              }`}
            >
              🔍 전체 검색
            </button>
          </div>
        </div>
      
      {/* 탭 바디 */}
      <div className="flex-1 min-h-0 relative flex flex-col">
        {sidebarTab === 'explorer' ? (
          <div className="flex-1 overflow-y-auto p-2">
            {rootFolder?.handle || (isDesktop && rootFolder?.name) ? (
              // 폴더 연결됨 → 파일 트리 표시
              fileList.length === 0 ? (
                <div className="text-zinc-400 dark:text-zinc-500 text-xs text-center py-8">
                  <p>연결된 폴더에 파일이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <div className="px-1 py-1.5 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 truncate border-b border-zinc-200 dark:border-zinc-700/60 mb-1">
                    📁 {rootFolder.name}
                  </div>
                  {fileList.map((node, i) => (
                    <FileTreeItem
                      key={node.path || node.name + i}
                      node={node}
                       parentHandle={rootFolder?.handle || null}
                      level={0}
                      openFile={openFile}
                      currentFileName={currentFileName}
                      currentFilePath={currentFileNode?.path}
                      workspaceType={workspaceType}
                      refreshParent={refreshFileList}
                      askConfirm={askConfirm}
                     
                      isMergeMode={isMergeMode}
                      selectedMergeNodes={selectedMergeNodes}
                      toggleMergeNodeSelect={toggleMergeNodeSelect}
                    />
                  ))}
                </div>
              )
            ) : (
              // 폴더 미연결 → 폴더 선택 안내
              <div className="text-zinc-400 dark:text-zinc-500 text-xs text-center py-8 space-y-4">
                <p className="font-medium">연결된 워크스페이스 폴더가 없습니다.</p>
                <button
                  onClick={onSelectRootFolder}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-blue-500/20"
                >
                  📂 폴더 선택
                </button>
                <p className="text-[10px] opacity-50">메뉴 &gt; 파일 &gt; 폴더 열기 로 워크스페이스를 시작하세요.</p>
              </div>
            )}
          </div>
        ) : sidebarTab === 'toc' ? (
          <div className="flex-1 overflow-y-auto p-3">
            <div className="space-y-1 text-xs">
              {toc.length === 0 ? (
                <div className="text-zinc-400 dark:text-zinc-500 text-center py-8">목차가 없습니다.</div>
              ) : (
                toc.map((item, i) => (
                  <div 
                    key={i} 
                    style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
                    className="cursor-pointer py-1.5 px-2 rounded-md hover:bg-zinc-200/70 dark:hover:bg-zinc-800/50 hover:text-blue-600 dark:hover:text-blue-400 transition-all truncate text-zinc-600 dark:text-zinc-300 flex items-center"
                    onClick={() => {
                      const el = document.getElementById(item.id);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth' });
                        if (previewRef.current) {
                          const elements = Array.from(previewRef.current.querySelectorAll('[data-line]'));
                          elements.forEach(e => e.classList.remove('preview-highlight-line'));
                          el.classList.add('preview-highlight-line');
                        }
                      }
                      scrollToLine(item.lineNumber);
                    }}
                  >
                    <span className="text-zinc-400 dark:text-zinc-500 mr-2 select-none font-bold">•</span>
                    <span className="truncate">{item.text}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <GlobalSearch
            isDarkMode={isDarkMode}
            content={content}
            currentFileName={currentFileName}
            workspacePath={rootFolder?.name && rootFolder.name !== '브라우저 스토리지' ? rootFolder.name : undefined}
            rootFolderHandle={rootFolder?.handle}
            onFileOpenAndJump={async (filePath, lineNumber) => {
              if (filePath === 'current') {
                scrollToLine(lineNumber);
                setIsSearchOpen(false);
              } else {
                if (typeof window !== 'undefined' && (window as any).electronAPI) {
                  try {
                    const file = await (window as any).electronAPI.readFromPath(filePath);
                    if (file) {
                      setContent(file.content);
                      lastSavedContentRef.current = file.content;
                      if (editorRef.current) {
                        editorRef.current.setValue(file.content);
                      }
                      setCurrentFileName(file.name);
                      setCurrentFileNode({ name: file.name, kind: 'file', path: file.path });
                      setIsSidebarOpen(true);
                      setTimeout(() => {
                        scrollToLine(lineNumber);
                      }, 100);
                      setIsSearchOpen(false);
                      showToast(`'${file.name}' 파일을 열고 ${lineNumber}번째 줄로 이동했습니다.`, 'success');
                    }
                  } catch (err) {
                    showToast("파일을 열지 못했습니다: " + err, 'error');
                  }
                } else {
                  showToast("데스크톱 환경에서만 지원되는 기능입니다.", "warning");
                }
              }
            }}
          />
        )}
      </div>
      
      {/* 크기 조절 드래그 바 */}
      <div 
        className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors z-20"
        onMouseDown={(e) => {
          const startX = e.clientX;
          const startWidth = sidebarWidth;
          const doDrag = (moveEvent: MouseEvent) => {
            setSidebarWidth(Math.max(180, Math.min(450, startWidth + (moveEvent.clientX - startX))));
          };
          const stopDrag = () => {
            document.removeEventListener('mousemove', doDrag);
            document.removeEventListener('mouseup', stopDrag);
          };
          document.addEventListener('mousemove', doDrag);
          document.addEventListener('mouseup', stopDrag);
        }}
      />
    </aside>
  );
}
