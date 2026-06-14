"use client";

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import GlobalSearch from './GlobalSearch';
import FileTreeItem from './FileTreeItem';
import { FileNode } from '@/lib/helper';
import { getApiUrl } from '@/lib/api';
import PromptModal from '@/components/PromptModal';
import { Plus, FolderPlus } from 'lucide-react';
import { msg } from '@/lib/msg';

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
  openFile: (node: FileNode | null, parentHandle?: any) => void;
  currentFileNode: FileNode | null;
  refreshFileList: () => void;
  askConfirm: (config: { title: string; message: string; onConfirm: () => void; isDanger?: boolean }) => void;
  previewMode: 'edit' | 'both' | 'preview' | 'css-style';
  setPreviewMode: (v: 'edit' | 'both' | 'preview' | 'css-style') => void;
  isMergeMode?: boolean;
  selectedMergeNodes?: FileNode[];
  toggleMergeNodeSelect?: (node: FileNode) => void;
  onSelectRootFolder?: () => void;
  onRestoreFolder?: () => void;
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
  toc = [],
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
  onSelectRootFolder,
  onRestoreFolder,
  previewMode,
  setPreviewMode
}: LeftSidebarProps) {
  const [drives, setDrives] = useState<FileNode[]>([]);
  const [isDrivesLoading, setIsDrivesLoading] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [collapsedH1s, setCollapsedH1s] = useState<Record<string, boolean>>({});

  // 📝 루트 디렉토리 생성을 위한 Prompt 상태 제어 및 비동기 처리
  const [promptConfig, setPromptConfig] = useState<{
    isOpen: boolean;
    title: string;
    defaultValue: string;
    type: 'createFile' | 'createFolder' | null;
    error?: string;
  }>({ isOpen: false, title: "", defaultValue: "", type: null, error: "" });

  const onPromptConfirm = async (name: string) => {
    const type = promptConfig.type;
    setPromptConfig({ ...promptConfig, isOpen: false });
    if (!name) return;

    const rootPath = rootFolder?.name || "";

    if (type === 'createFile') {
      const finalName = name.toLowerCase().endsWith('.md') ? name : `${name}.md`;
      
      // 중복 체크
      if (fileList.some(c => c.name.toLowerCase() === finalName.toLowerCase())) {
        setPromptConfig(prev => ({ ...prev, error: "이미 같은 이름의 파일이 존재합니다." }));
        return;
      }

      try {
        setPromptConfig(prev => ({ ...prev, isOpen: false, error: '' }));
        if (workspaceType === 'browser') {
          if (rootFolder?.handle) {
            const handle = await rootFolder.handle.getFileHandle(finalName, { create: true });
            refreshFileList();
            openFile({ name: finalName, kind: 'file', handle }, rootFolder?.handle);
          } else {
            // LocalStorage 가상 파일 생성
            const { vfsCreateFile } = await import('@/lib/vfsHelper');
            vfsCreateFile("", finalName);
            refreshFileList();
            openFile({ name: finalName, kind: 'file', path: finalName });
          }
        } else {
          const api = (window as any).electronAPI;
          if (api?.createFile) {
            const result = await api.createFile(rootPath, finalName);
            if (result.success) {
              refreshFileList();
              openFile({ name: finalName, kind: 'file', path: result.path });
            }
          } else {
            const res = await fetch(getApiUrl('/api/create-file'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ parentPath: rootPath, name: finalName })
            });
            if (res.ok) {
              const data = await res.json();
              refreshFileList();
              openFile({ name: finalName, kind: 'file', path: data.path });
            }
          }
        }
      } catch(e) { showToast("생성 실패: " + e, 'error'); }
    } else if (type === 'createFolder') {
      // 중복 체크
      if (fileList.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        setPromptConfig(prev => ({ ...prev, error: "이미 같은 이름의 폴더가 존재합니다." }));
        return;
      }

      try {
        setPromptConfig(prev => ({ ...prev, isOpen: false, error: '' }));
        if (workspaceType === 'browser') {
          if (rootFolder?.handle) {
            await rootFolder.handle.getDirectoryHandle(name, { create: true });
          } else {
            // LocalStorage 가상 폴더 생성
            const { vfsCreateFolder } = await import('@/lib/vfsHelper');
            vfsCreateFolder("", name);
          }
        } else {
          const api = (window as any).electronAPI;
          if (api?.createFolder) {
            await api.createFolder(rootPath, name);
          } else {
            await fetch(getApiUrl('/api/create-folder'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ parentPath: rootPath, name: name })
            });
          }
        }
        refreshFileList();
      } catch(e) { showToast("생성 실패: " + e, 'error'); }
    }
  };

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
      msg.warn('드라이브 목록 조회 실패', err);
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
      if (workspaceType === 'browser') {
        if (node.handle) {
          const children: FileNode[] = [];
          for await (const entry of node.handle.values()) {
            const kind = entry.kind === 'directory' ? 'directory' : 'file';
            const path = node.path ? `${node.path}/${entry.name}` : entry.name;
            if (kind === 'file') {
              const nameLower = entry.name.toLowerCase();
              if (!nameLower.endsWith('.md') && !nameLower.endsWith('.markdown')) {
                continue;
              }
            }
            children.push({
              name: entry.name,
              kind,
              path,
              handle: entry
            });
          }
          children.sort((a, b) => {
            if (a.kind !== b.kind) {
              return a.kind === 'directory' ? -1 : 1;
            }
            return a.name.localeCompare(b.name);
          });
          return children;
        } else {
          // LocalStorage VFS용 폴백
          const { getVfsFiles } = await import('@/lib/vfsHelper');
          const allVfs = getVfsFiles();
          const findChildren = (nodes: FileNode[]): FileNode[] => {
            for (const n of nodes) {
              if (n.path === node.path) return n.children || [];
              if (n.kind === 'directory' && n.children) {
                const found = findChildren(n.children);
                if (found.length > 0 || n.path === node.path) return found;
              }
            }
            return [];
          };
          return findChildren(allVfs);
        }
      }

      const api = (window as any).electronAPI;
      if (api?.listDirectory) {
        return await api.listDirectory(node.path);
      }
      const res = await fetch(getApiUrl(`/api/list-files?path=${encodeURIComponent(node.path || '')}`));
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      msg.warn('폴더 목록 조회 실패', err);
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
        <div className="h-11 border-b border-zinc-200 dark:border-zinc-700/60 flex items-center px-2 bg-zinc-200/70 dark:bg-zinc-800/50 justify-between">
          <div className="flex gap-1.5 w-full">
            <button
              onClick={() => {
                setSidebarTab('explorer');
                setIsSearchOpen(false);
              }}
              className={`flex-1 py-1.5 text-[13px] font-bold rounded-md transition-all text-center ${
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
              className={`flex-1 py-1.5 text-[13px] font-bold rounded-md transition-all text-center ${
                sidebarTab === 'toc' 
                  ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:bg-white/50 dark:hover:bg-zinc-800'
              }`}
            >
              📝 개요
            </button>
            <button
              onClick={() => {
                setSidebarTab('search');
                setIsSearchOpen(true);
              }}
              className={`flex-1 py-1.5 text-[13px] font-bold rounded-md transition-all text-center ${
                sidebarTab === 'search' 
                  ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:bg-white/50 dark:hover:bg-zinc-800'
              }`}
            >
              🔍 검색
            </button>
          </div>
        </div>
      
      {/* 탭 바디 */}
      <div className="flex-1 min-h-0 relative flex flex-col">
        {sidebarTab === 'explorer' ? (
          <div className="flex-1 overflow-y-auto p-2">
            {(rootFolder as any)?.needPermission ? (
              // 이전 워크스페이스 권한 복구 안내
              <div className="text-zinc-500 dark:text-zinc-400 text-xs text-center py-8 space-y-4 px-4">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 space-y-2 text-left">
                  <p className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    ⚠️ 이전 폴더 연결 대기
                  </p>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    브라우저 보안 제약으로 인해 새로고침 후 폴더 권한 승인이 필요합니다. 아래 버튼을 눌러 이전 폴더(<strong>{rootFolder?.name}</strong>)의 복구를 승인하세요.
                  </p>
                </div>
                <button
                  onClick={onRestoreFolder}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-amber-500/20"
                >
                  🔄 워크스페이스 복구
                </button>
              </div>
            ) : rootFolder?.handle || (isDesktop && rootFolder?.name) || rootFolder?.name === '브라우저 스토리지' ? (
              // 폴더 연결됨 → 파일 트리 표시
              // 🛡️ [빈 폴더 방어] fileList가 비어있어도 루트 폴더 헤더(풀경로+버튼)를 항상 유지
              <div className="space-y-0.5">
                <div className="group relative flex items-center justify-between px-1 py-2 text-[15px] font-bold text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-700/60 mb-1">
                  <span className="truncate">📁 {rootFolder.name}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setPromptConfig({
                          isOpen: true,
                          title: "루트 워크스페이스에 생성할 새 파일의 이름을 입력하세요:",
                          defaultValue: "untitled.md",
                          type: 'createFile'
                        });
                      }} 
                      className="p-1 hover:bg-blue-500 hover:text-white rounded transition-colors text-zinc-400" 
                      title="새 파일"
                    >
                      <Plus size={14} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setPromptConfig({
                          isOpen: true,
                          title: "루트 워크스페이스에 생성할 새 폴더의 이름을 입력하세요:",
                          defaultValue: "",
                          type: 'createFolder'
                        });
                      }} 
                      className="p-1 hover:bg-blue-500 hover:text-white rounded transition-colors text-zinc-400" 
                      title="새 폴더"
                    >
                      <FolderPlus size={14} />
                    </button>
                  </div>
                </div>
                {fileList.length === 0 ? (
                  <div className="text-zinc-400 dark:text-zinc-500 text-xs text-center py-8">
                    <p>연결된 폴더에 파일이 없습니다.</p>
                  </div>
                ) : (
                  fileList
                    .filter(node => node.kind === 'directory' || node.name.toLowerCase().endsWith('.md'))
                    .map((node, i) => (
                    <FileTreeItem
                      key={node.path || node.name + i}
                      node={node}
                       parentHandle={rootFolder?.handle || null}
                      level={0}
                       openFile={openFile}
                       previewMode={previewMode}
                       setPreviewMode={setPreviewMode}
                       currentFileName={currentFileName}
                      currentFilePath={currentFileNode?.path}
                      workspaceType={workspaceType}
                      refreshParent={refreshFileList}
                      askConfirm={askConfirm}
                      isMergeMode={isMergeMode}
                      selectedMergeNodes={selectedMergeNodes}
                      toggleMergeNodeSelect={toggleMergeNodeSelect}
                      onLazyLoad={handleLazyLoad}
                    />
                  )))}
                </div>
            ) : (
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
            <div className="space-y-1.5 text-sm">
              {!toc || toc.length === 0 ? (
                <div className="text-zinc-400 dark:text-zinc-500 text-center py-8">목차가 없습니다.</div>
              ) : (() => {
                let currentH1Id = '';
                let currentH2Id = '';
                let currentH3Id = '';
                const processedToc = toc.map(item => {
                  if (item.level === 1) {
                    currentH1Id = item.id;
                    currentH2Id = '';
                    currentH3Id = '';
                    return { ...item, parentH1Id: '', parentH2Id: '', parentH3Id: '' };
                  } else if (item.level === 2) {
                    currentH2Id = item.id;
                    currentH3Id = '';
                    return { ...item, parentH1Id: currentH1Id, parentH2Id: '', parentH3Id: '' };
                  } else if (item.level === 3) {
                    currentH3Id = item.id;
                    return { ...item, parentH1Id: currentH1Id, parentH2Id: currentH2Id, parentH3Id: '' };
                  } else {
                    return { ...item, parentH1Id: currentH1Id, parentH2Id: currentH2Id, parentH3Id: currentH3Id };
                  }
                });

                return processedToc.map((item, i) => {
                  // 접힘 여부 판정 로직:
                  // H1: 기본 펼침 (collapsedH1s[id] === true 이면 숨김)
                  // H2: 기본 펼침 (H1이 접혀있으면 숨김)
                  // H3: 기본 펼침 (H1 or H2가 접혀있으면 숨김)
                  // H4 이하: 기본 접힘 (H1 or H2 or H3가 접혀있으면 숨김. H3은 기본이 접힘이므로 collapsedH1s[parentH3Id] !== false 이면 숨김)
                  let isCollapsed = false;

                  if (item.level === 2) {
                    if (item.parentH1Id && collapsedH1s[item.parentH1Id] === true) {
                      isCollapsed = true;
                    }
                  } else if (item.level === 3) {
                    if (item.parentH1Id && collapsedH1s[item.parentH1Id] === true) {
                      isCollapsed = true;
                    } else if (item.parentH2Id && collapsedH1s[item.parentH2Id] !== false) {
                      isCollapsed = true;
                    }
                  } else if (item.level >= 4) {
                    if (item.parentH1Id && collapsedH1s[item.parentH1Id] === true) {
                      isCollapsed = true;
                    } else if (item.parentH2Id && collapsedH1s[item.parentH2Id] !== false) {
                      isCollapsed = true;
                    } else if (item.parentH3Id && collapsedH1s[item.parentH3Id] !== false) {
                      isCollapsed = true;
                    }
                  }

                  if (isCollapsed) return null;

                  // 각 레벨별 자식 유무 체크
                  const hasH1Children = item.level === 1 && processedToc.some(child => child.level >= 2 && child.parentH1Id === item.id);
                  const hasH2Children = item.level === 2 && processedToc.some(child => child.level >= 3 && child.parentH2Id === item.id);
                  const hasH3Children = item.level === 3 && processedToc.some(child => child.level >= 4 && child.parentH3Id === item.id);

                  return (
                    <div 
                      key={i} 
                      style={{ paddingLeft: `${(item.level - 1) * 16}px` }}
                      className="cursor-pointer py-2 px-3 rounded-md hover:bg-zinc-200/70 dark:hover:bg-zinc-800/50 hover:text-blue-600 dark:hover:text-blue-400 transition-all truncate text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5"
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
                      {item.level === 1 ? (
                        hasH1Children ? (
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setCollapsedH1s(prev => ({ ...prev, [item.id]: !prev[item.id] })); 
                            }}
                            className="mr-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 w-5 h-5 flex items-center justify-center rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors shrink-0 text-[10px]"
                            title={collapsedH1s[item.id] === true ? "펼치기" : "접기"}
                          >
                            {collapsedH1s[item.id] === true ? '▶' : '▼'}
                          </button>
                        ) : (
                          <div className="w-5 h-5 mr-1 shrink-0" />
                        )
                      ) : item.level === 2 ? (
                        hasH2Children ? (
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setCollapsedH1s(prev => ({ ...prev, [item.id]: prev[item.id] === false })); 
                            }}
                            className="mr-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 w-5 h-5 flex items-center justify-center rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors shrink-0 text-[10px]"
                            title={collapsedH1s[item.id] === false ? "접기" : "펼치기"}
                          >
                            {collapsedH1s[item.id] === false ? '▼' : '▶'}
                          </button>
                        ) : (
                          <div className="w-5 h-5 mr-1 shrink-0" />
                        )
                      ) : item.level === 3 ? (
                        hasH3Children ? (
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              // H3은 기본 접힘(true)이므로 false(펼침) <-> true(접힘) 토글
                              setCollapsedH1s(prev => ({ ...prev, [item.id]: prev[item.id] === false })); 
                            }}
                            className="mr-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 w-5 h-5 flex items-center justify-center rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors shrink-0 text-[10px]"
                            title={collapsedH1s[item.id] === false ? "접기" : "펼치기"}
                          >
                            {collapsedH1s[item.id] === false ? '▼' : '▶'}
                          </button>
                        ) : (
                          <div className="w-5 h-5 mr-1 shrink-0" />
                        )
                      ) : (
                        <div className="w-5 h-5 mr-1 shrink-0" />
                      )}
                      <span className="truncate flex-1 font-medium">
                        {item.text}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        ) : (
          <GlobalSearch
            isDarkMode={isDarkMode}
            content={content}
            currentFileName={currentFileName}
            workspacePath={rootFolder?.name && rootFolder.name !== '브라우저 스토리지' ? rootFolder.name : undefined}
            rootFolderHandle={rootFolder?.handle}
            onSelectFolder={onSelectRootFolder}
            onFileOpenAndJump={async (filePath, lineNumber) => {
              // 서식설정이 켜져 있다면 일반 뷰어로 강제 원복
              if (previewMode === 'css-style') {
                setPreviewMode('preview');
              }

              if (filePath === 'current') {
                scrollToLine(lineNumber);
                setIsSearchOpen(false);
              } else {
                // 1. 탐색기 트리에서 해당 노드 재귀 탐색
                const findNodeRecursively = (nodes: FileNode[], targetPath: string): FileNode | null => {
                  for (const n of nodes) {
                    const normN = n.path ? n.path.replace(/\\/g, '/').toLowerCase() : '';
                    const normT = targetPath.replace(/\\/g, '/').toLowerCase();
                    if (n.kind === 'file' && (normN === normT || n.name.toLowerCase() === targetPath.toLowerCase())) {
                      return n;
                    }
                    if (n.kind === 'directory' && n.children) {
                      const found = findNodeRecursively(n.children, targetPath);
                      if (found) return found;
                    }
                  }
                  return null;
                };

                const targetNode = findNodeRecursively(fileList, filePath);

                if (targetNode) {
                  openFile(targetNode);
                  setTimeout(() => {
                    scrollToLine(lineNumber);
                  }, 150);
                  setIsSearchOpen(false);
                  showToast(`'${targetNode.name}' 파일을 열고 ${lineNumber}번째 줄로 이동했습니다.`, 'success');
                } else if (typeof window !== 'undefined' && (window as any).electronAPI) {
                  // 로컬 환경이고 트리에 없는 경로인 경우 더미 노드를 생성해 openFile(handleFileClick)로 정상 위임
                  const fileName = filePath.split(/[\\/]/).pop() || filePath;
                  const dummyNode = { name: fileName, kind: 'file' as const, path: filePath };
                  openFile(dummyNode);
                  setTimeout(() => {
                    scrollToLine(lineNumber);
                  }, 200);
                  setIsSearchOpen(false);
                  showToast(`'${fileName}' 파일을 열고 ${lineNumber}번째 줄로 이동했습니다.`, 'success');
                } else if (rootFolder?.handle) {
                  // 브라우저 FileSystem API 환경에서 트리에 없는 lazy 노드인 경우
                  try {
                    const fileHandle = await rootFolder.handle.getFileHandle(filePath);
                    if (fileHandle) {
                      const tempNode = { name: filePath, kind: 'file' as const, handle: fileHandle };
                      openFile(tempNode, rootFolder.handle);
                      setTimeout(() => {
                        scrollToLine(lineNumber);
                      }, 150);
                      setIsSearchOpen(false);
                      showToast(`'${filePath}' 파일을 열고 ${lineNumber}번째 줄로 이동했습니다.`, 'success');
                    }
                  } catch (e) {
                    showToast("파일을 찾지 못했습니다.", "error");
                  }
                } else {
                  showToast("파일을 찾지 못했습니다.", "error");
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
      <PromptModal 
        isOpen={promptConfig.isOpen}
        title={promptConfig.title}
        defaultValue={promptConfig.defaultValue}
        error={promptConfig.error}
        onConfirm={onPromptConfirm}
        onCancel={() => setPromptConfig({ ...promptConfig, isOpen: false, error: '' })}
      />
    </aside>
  );
}
