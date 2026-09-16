"use client";

// ====================================================================
// 📊 [OMD-FILE-FileTreeItem-0001] FileTreeItem ➔ FileTreeItem
// 🎯 @KICK  : 파일 탐색기 트리 항목 컴포넌트 (파일/폴더 렌더링, 컨텍스트 메뉴, 지식 등록/해제)
// 🛡️ @GUARD : 파일/폴더 안전 조작, 드래그앤드롭 보호, LDSG v5.0 (#1d4ed8), Rule 7 원트랜잭션 무결성
// 🚨 @PATCH : **2026-09-16** — [삭제/이동된 폴더 NotFoundError 예외 처리 및 트리 자동 소거]: refreshThisDirectory 및 지연 로드 effect에서 NotFoundError 발생 시 경고 콘솔을 억제하고 isOpen 상태 해제, onrivi_expanded_paths 정리, refreshParent() 호출로 삭제된 폴더를 탐색기 트리에서 즉시 자동 제거하도록 개선
// 🚨 @PATCH : **2026-09-16** — [열려 있는 탭 파일/폴더 잘라내기(Cut) 방어 가드 탑재]: 탭에 열려 있는 파일이나 하위 파일이 포함된 폴더인 경우 우클릭 컨텍스트 메뉴의 '잘라내기' 버튼을 비활성화(disabled, opacity-40)하고, 클릭 시 탭을 먼저 닫도록 안내 토스트를 출력하여 원본 데이터 유실 원천 방어
// 🚨 @PATCH : **2026-09-16** — [웹/데스크톱 폴더 재귀 삭제 완벽 지원 & 삭제 차단 해제]: 비어있지 않은 폴더 삭제 차단 가드를 제거하고 브라우저(removeEntry recursive: true) 및 데스크톱(Electron) 양쪽 모두 하위 파일 포함 폴더 삭제를 완벽 지원, 삭제 후 file:refresh-all-directories 전역 동기화 연동
// 🚨 @PATCH : **2026-09-16** — [시스템 탐색기/Finder 열기 메뉴 데스크톱(Electron) 환경 전용 격리]: 웹 브라우저 환경에서 보안상 구동 불가능한 OS 탐색기 열기 메뉴를 원천 은닉하고 오직 electronAPI가 주입된 데스크톱 앱에서만 선택적으로 노출
// 🚨 @PATCH : **2026-09-16** — [탐색기 우클릭 컨텍스트 메뉴 아이콘 세련된 미니멀리즘 전면 교체]: 새 파일, 새 폴더, 이름 변경, 복사, 잘라내기, 붙여넣기, 탐색기 열기, 삭제 아이콘을 text-current 기반 Lucide 미니멀 라인 아이콘으로 통일하여 폰트 색상과 100% 일치
// 🚨 @PATCH : **2026-09-16** — [탐색기 세련된 미니멀리즘 아이콘 연동]: getFileIcon(node, isSelected, isOpen) 호출로 폴더 열림/닫힘 상태별 미니멀 라인 아이콘 렌더링, text-current 기반 인접 폰트 색상과 100% 동기화
// 🚨 @PATCH : **2026-09-16** — [탐색기 항목 잘라내기(Cut) 및 시스템 탐색기/Finder 열기 연동]: Scissors 아이콘 기반 잘라내기 메뉴(file:cut-node 발송) 추가, 잘라내기 활성 상태 시 opacity-40 반투명 시각 피드백 부여, 데스크톱 환경 파일/폴더 위치 탐색기/Finder 열기 메뉴 연동
// 🚨 @PATCH : **2026-09-13** — [지식관리 기능 데스크톱 전용 전환]: 탐색기 📗 뱃지 및 우클릭 컨텍스트 메뉴(지식문서 등록/해제/상세분석)를 isDesktop 전용으로 한정하여 웹 브라우저 UI 경량화
//             **2026-09-13** — [지식 문서 등록 시 불필요한 입력 팝업 전면 제거 및 무간섭 원클릭 등록 복원]: 웹 환경에서 상단 브레드크럼의 상위 설정(onrivi_web_base_path) 및 작업장 정보를 pathResolver가 자동 감지하도록 연계하고, 사용자에게 경로를 묻는 window.prompt를 전면 제거하여 원클릭 0초 즉시 등록 완벽 복원
//             **2026-09-12** — [스캔 배제 및 로컬스토리지 작업장 절대경로 직결]: 지식문서 등록 시 buildDirectWorkspacePath로 로컬스토리지 작업장 절대경로와 파일 상대경로를 즉시 다이렉트 연결하여 등록
//             **2026-09-12** — [지식 문서 등록 시 절대경로 표준화 및 양방향 캐싱]: 지식 등록 결과(registeredDetail.filePath)의 완전한 절대경로와 기존 상대경로를 동시 캐싱하여 📗 아이콘 표시 무결성 확보
// 🔗 @CALLS : @/lib/knowledge/knowledgeClient, @/lib/knowledge/pathResolver, @/lib/knowledge/knowledgeGuard
// ====================================================================

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight, ChevronDown, FilePlus, FolderPlus, Pencil, Trash2, Scissors, FolderOpen, Copy, ClipboardPaste } from 'lucide-react';
import { FileNode, getFileIcon } from '@/lib/indexedDbHelper';
import { getApiUrl } from '@/lib/apiUrlBuilder';
import { vfsCreateFile, vfsCreateFolder, vfsRename, vfsDelete } from '@/lib/virtualFileSystem';
import PromptModal from '@/components/PromptModal';
import { msg } from '@/lib/systemMessages';
import { useToast } from '@/components/ToastProvider';
import { checkKnowledgeGuard } from '@/lib/knowledge/knowledgeGuard';
import { loadSecureData } from '@/lib/secureStorage';
import { knowledgeClient, canAccessKnowledgeDb } from '@/lib/knowledge/knowledgeClient';
import { buildDirectWorkspacePath } from '@/lib/knowledge/pathResolver';

interface FileTreeItemProps {
  node: FileNode;
  parentHandle: any;
  level: number;
  openFile: (node: FileNode | null, parentHandle?: any) => void;
  previewMode: 'edit' | 'both' | 'preview' | 'css-style';
  setPreviewMode: (v: 'edit' | 'both' | 'preview' | 'css-style') => void;
  currentFileName: string;
  currentFilePath?: string;
  workspaceType: string;
  refreshParent: () => void;
  onRefreshAll?: () => void;
  openTabPaths?: string[];
  askConfirm: (config: { title: string, message: string, onConfirm: () => void, isDanger?: boolean }) => void;
  siblings?: FileNode[];
  isMergeMode?: boolean;
  selectedMergeNodes?: FileNode[];
  toggleMergeNodeSelect?: (node: FileNode) => void;
  onLazyLoad?: (node: FileNode) => Promise<FileNode[]>;
  isRestrictedUser?: boolean;
}

const FileTreeItem = ({ 
  node: rawNode, parentHandle, level, openFile, previewMode, setPreviewMode, currentFileName, currentFilePath, workspaceType, refreshParent, onRefreshAll, openTabPaths,
  askConfirm, siblings,
  isMergeMode = false, selectedMergeNodes = [], toggleMergeNodeSelect, onLazyLoad, isRestrictedUser = false
}: FileTreeItemProps) => {
  const { showToast } = useToast();

  const isDesktop = typeof window !== 'undefined' && (
    !!(window as any).electronAPI ||
    navigator.userAgent.toLowerCase().includes('electron') ||
    new URLSearchParams(window.location.search).get('env') === 'desktop'
  );

  const [isCut, setIsCut] = useState(false);
  useEffect(() => {
    const checkIsCut = () => {
      const clip = typeof window !== 'undefined' ? (window as any)._omdClipboardNode : null;
      if (clip && clip.op === 'cut' && clip.node) {
        const clipPath = clip.node.path || clip.node.name;
        const myPath = rawNode.path || rawNode.name;
        setIsCut(clipPath === myPath);
      } else {
        setIsCut(false);
      }
    };
    checkIsCut();
    window.addEventListener('file:clipboard-changed', checkIsCut);
    return () => {
      window.removeEventListener('file:clipboard-changed', checkIsCut);
    };
  }, [rawNode.path, rawNode.name]);

  // 🛡️ 백엔드/VFS 노드 규격(type: 'dir'/'file' -> kind) 자동 호환 안전장치
  const node = React.useMemo(() => {
    const kind = rawNode.kind || ((rawNode as any).type === 'dir' || (rawNode as any).type === 'directory' ? 'directory' : 'file');
    return { ...rawNode, kind };
  }, [rawNode]);
  
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const saved = localStorage.getItem('onrivi_expanded_paths');
      if (saved && node.path) {
        const paths: string[] = JSON.parse(saved);
        const normalizedPath = node.path.replace(/\\/g, '/');
        return paths.some(p => p.replace(/\\/g, '/') === normalizedPath);
      }
    } catch (e) {
      // Safe guard
    }
    return false;
  });

  const [localChildren, setLocalChildren] = useState<FileNode[] | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const contextCloseTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleItemMouseLeave = () => {
    if (contextMenu) {
      if (contextCloseTimerRef.current) clearTimeout(contextCloseTimerRef.current);
      contextCloseTimerRef.current = setTimeout(() => {
        setContextMenu(null);
      }, 150);
    }
  };

  const handleMenuMouseEnter = () => {
    if (contextCloseTimerRef.current) {
      clearTimeout(contextCloseTimerRef.current);
      contextCloseTimerRef.current = null;
    }
  };

  const handleMenuMouseLeave = () => {
    if (contextMenu) {
      if (contextCloseTimerRef.current) clearTimeout(contextCloseTimerRef.current);
      contextCloseTimerRef.current = setTimeout(() => {
        setContextMenu(null);
      }, 100);
    }
  };

  useEffect(() => {
    return () => {
      if (contextCloseTimerRef.current) clearTimeout(contextCloseTimerRef.current);
    };
  }, []);

  // 📌 폴더 펼침/접힘 상태 변경 시 localStorage 동기화
  useEffect(() => {
    if (node.kind !== 'directory' || !node.path) return;
    try {
      const saved = localStorage.getItem('onrivi_expanded_paths');
      let paths: string[] = saved ? JSON.parse(saved) : [];
      const normalizedPath = node.path.replace(/\\/g, '/');

      if (isOpen) {
        if (!paths.some(p => p.replace(/\\/g, '/') === normalizedPath)) {
          paths.push(node.path);
        }
      } else {
        paths = paths.filter(p => p.replace(/\\/g, '/') !== normalizedPath);
      }
      localStorage.setItem('onrivi_expanded_paths', JSON.stringify(paths));
    } catch (e) {
      // Safe guard
    }
  }, [isOpen, node.path, node.kind]);

  // 📌 폴더가 열려있는(isOpen) 상태로 복구되었는데 자식 데이터가 없는 경우 자동으로 비동기 지연 로드 복원
  useEffect(() => {
    if (isOpen && node.kind === 'directory' && !localChildren && onLazyLoad) {
      setIsLoading(true);
      onLazyLoad(node)
        .then((children) => {
          setLocalChildren(children);
        })
        .catch((err) => {
          if (err?.name === 'NotFoundError' || err?.message?.includes('could not be found')) {
            setIsOpen(false);
            if (typeof refreshParent === 'function') {
              refreshParent();
            }
          } else {
            console.error("폴더 자동 갱신 실패", err);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, node, localChildren, onLazyLoad]);

  useEffect(() => {
    const handleClose = () => setContextMenu(null);
    if (contextMenu) {
      window.addEventListener('click', handleClose);
      window.addEventListener('close-context-menus', handleClose);
      return () => {
        window.removeEventListener('click', handleClose);
        window.removeEventListener('close-context-menus', handleClose);
      };
    }
  }, [contextMenu]);

  // ====================================================================
  // 📊 [OMD-FILE-FileTreeItem-0002] FileTreeItem ➔ useEffect (syncChildren)
  // 🎯 @KICK  : node.children 변경 시 localChildren 상태 동기화
  // 🛡️ @GUARD : undefined인 경우 동기화 생략
  // 🚨 @PATCH : 없음
  // 🔗 @CALLS : 없음
  // ====================================================================
  React.useEffect(() => {
    if (node.children !== undefined && node.children !== null) {
      // 🛡️ [지연 로드 덮어쓰기 방어 가드] 이미 로컬로 지연 로딩 완료된 자식이 있는데,
      // 부모로부터 빈 자식 목록(refresh 시의 깡통 노드)이 유입되면 덮어쓰지 않고 기존 자식을 유지함
      if (node.children.length === 0 && localChildren && localChildren.length > 0) {
        return;
      }
      setLocalChildren(node.children);
    }
  }, [node.children, localChildren]);
  // ====================================================================
  // 📊 [OMD-FILE-FileTreeItem-0003] FileTreeItem ➔ refreshThisDirectory
  // 🎯 @KICK  : 현재 디렉토리 노드의 자식 목록을 지연 로딩(onLazyLoad)으로 갱신
  // 🛡️ @GUARD : 디렉토리가 아니거나 onLazyLoad 미존재 시 실행 차단; NotFoundError 시 트리 및 로컬스토리지 정리
  // 🚨 @PATCH : **2026-09-16** — [삭제/이동된 폴더 NotFoundError 예외 처리 및 부모 갱신]: 삭제된 폴더 갱신 시 경고 대신 트리 닫기 및 부모 리프레시 연동
  // 🔗 @CALLS : onLazyLoad, refreshParent
  // ====================================================================
  const refreshThisDirectory = async () => {
    if (node.kind !== 'directory' || !onLazyLoad) return;
    setIsLoading(true);
    try {
      const children = await onLazyLoad(node);
      setLocalChildren(children);
    } catch (err: any) {
      if (err?.name === 'NotFoundError' || err?.message?.includes('could not be found')) {
        setIsOpen(false);
        try {
          const saved = localStorage.getItem('onrivi_expanded_paths');
          if (saved && node.path) {
            const normPath = node.path.replace(/\\/g, '/');
            const paths = JSON.parse(saved).filter((p: string) => {
              const np = p.replace(/\\/g, '/');
              return np !== normPath && !np.startsWith(normPath + '/');
            });
            localStorage.setItem('onrivi_expanded_paths', JSON.stringify(paths));
          }
        } catch {}
        if (typeof refreshParent === 'function') {
          refreshParent();
        }
      } else {
        msg.warn('폴더 재갱신 실패', err);
      }
    } finally {
      setIsLoading(false);
    }
  };
  // 드래그 이동 완료 후 이 디렉토리가 source/target이면 자식 목록 갱신
  const refreshThisDirectoryRef = useRef(refreshThisDirectory);
  refreshThisDirectoryRef.current = refreshThisDirectory;
  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (node.kind !== 'directory' || !node.path) return;
      const normNodePath = node.path.replace(/\\/g, '/');
      const matches =
        normNodePath === (detail.sourceParentPath || '').replace(/\\/g, '/') ||
        normNodePath === (detail.targetParentPath || '').replace(/\\/g, '/') ||
        normNodePath === (detail.targetPath || '').replace(/\\/g, '/');
      if (matches) refreshThisDirectoryRef.current();
    };
    
    const refreshAllHandler = () => {
      if (node.kind === 'directory' && isOpen) {
        refreshThisDirectoryRef.current();
      }
    };

    // 🆕 폴더 생성 후 자동 선택: 이 노드가 대상 경로와 일치하면 openFile 호출
    const selectNodeHandler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail?.path || !node.path) return;
      const normTarget = detail.path.replace(/\\/g, '/');
      const normThis = node.path.replace(/\\/g, '/');
      if (normTarget === normThis && node.kind === 'directory') {
        openFile(node, parentHandle);
      }
    };

    window.addEventListener('file:moved', handler);
    window.addEventListener('file:refresh-all-directories', refreshAllHandler);
    window.addEventListener('file:select-node', selectNodeHandler);
    
    return () => {
      window.removeEventListener('file:moved', handler);
      window.removeEventListener('file:refresh-all-directories', refreshAllHandler);
      window.removeEventListener('file:select-node', selectNodeHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node.kind, node.path, isOpen]);
  const [isLoading, setIsLoading] = useState(false);
  const [promptConfig, setPromptConfig] = useState<{
    isOpen: boolean;
    title: string;
    defaultValue: string;
    type: 'rename' | 'createFile' | 'createFolder' | null;
    error?: string;
  }>({ isOpen: false, title: "", defaultValue: "", type: null, error: "" });

  const [isDragOver, setIsDragOver] = useState(false);

  const dispatchMovedEvent = (srcPath: string, tgtPath: string, newPath?: string, sourceName?: string, newHandle?: any) => {
    const normSrc = srcPath.replace(/\\/g, '/');
    const normTgt = tgtPath.replace(/\\/g, '/');
    const srcParentPath = normSrc.includes('/') ? normSrc.substring(0, normSrc.lastIndexOf('/')) : '';
    const tgtParentPath = normTgt.includes('/') ? normTgt.substring(0, normTgt.lastIndexOf('/')) : '';
    
    // 트리 목록 갱신용 이벤트
    window.dispatchEvent(new CustomEvent('file:moved', {
      detail: { sourceParentPath: srcParentPath, targetParentPath: tgtParentPath, targetPath: normTgt }
    }));

    // 열린 탭 동기화용 이벤트 발송
    if (newPath && sourceName) {
      window.dispatchEvent(new CustomEvent('file:tab-renamed', {
        detail: { oldPath: srcPath, newPath, newName: sourceName, newHandle }
      }));
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.setData("sourcePath", node.path || "");
    e.dataTransfer.setData("sourceName", node.name);
    e.dataTransfer.setData("sourceKind", node.kind);
    e.dataTransfer.effectAllowed = "move";
    // 💡 FileSystem API 등에서 복잡한 핸들 복사 이동을 위해 드래그 중인 원본 노드 참조 저장
    if (typeof window !== 'undefined') {
      (window as any)._draggedNode = node;
      (window as any)._draggedNodeParentHandle = parentHandle;
      (window as any)._draggedNodeParentPath = node.path ? node.path.substring(0, node.path.lastIndexOf('/')) : '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (node.kind === 'directory') {
      e.dataTransfer.dropEffect = "move";
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  // ====================================================================
  // 📊 [OMD-FILE-FileTreeItem-0004] FileTreeItem ➔ handleDrop
  // 🎯 @KICK  : 파일/폴더 드래그 앤 드롭 이동 처리 - Electron, File System API, VFS 세 환경 지원
  // 🛡️ @GUARD : 자기 자신/하위 폴더 드롭 방지, 디렉토리만 드롭 대상 허용; openTabPaths로 열린 파일/폴더 드롭 차단
  // 🚨 @PATCH : **2026-06-19** — 열린 탭 보호 가드 추가 (파일/포함 폴더 이동 차단); 이동 후 onRefreshAll 전체 트리 갱신
  // 🔗 @CALLS : refreshParent, refreshThisDirectory, onRefreshAll, vfsRename, showToast
  // ====================================================================
  const handleDrop = async (e: React.DragEvent) => {
    if (isRestrictedUser) return; // 제한 사용자는 파일 조작/이동 불가
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (node.kind !== 'directory') return;

    const sourcePath = e.dataTransfer.getData("sourcePath");
    const sourceName = e.dataTransfer.getData("sourceName");
    const sourceKind = e.dataTransfer.getData("sourceKind");
    const draggedNode = typeof window !== 'undefined' ? (window as any)._draggedNode : null;
    const draggedNodeParent = typeof window !== 'undefined' ? (window as any)._draggedNodeParentHandle : null;

    if (sourcePath === node.path) return; // 자기 자신에게 드롭 방지
    // 드롭 대상이 드래그 중인 원본 폴더 하위에 위치하는지 방지 (재귀 루프 방지)
    if (draggedNode && draggedNode.kind === 'directory' && node.path && draggedNode.path) {
      if (node.path.startsWith(draggedNode.path + '/')) {
        showToast("하위 폴더로는 이동할 수 없습니다.", "warning");
        return;
      }
    }

    // 열린 탭 보호 해제: 이제 열려있는 문서도 이동 가능합니다.

      try {
        if (workspaceType === 'local') {
          const newPath = node.path ? `${node.path}\\${sourceName}` : sourceName;
          const api = (window as any).electronAPI;
          if (api?.renameFile) {
            await api.renameFile(sourcePath, newPath);
            showToast(`'${sourceName}' 이동 완료`, 'success');
            dispatchMovedEvent(sourcePath, node.path || '', newPath, sourceName);
            onRefreshAll?.();
            refreshParent();
            await refreshThisDirectory();
          } else {
            const res = await fetch(getApiUrl('/api/rename'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ oldPath: sourcePath, newPath })
            });
            if (res.ok) {
              showToast(`'${sourceName}' 이동 완료`, 'success');
              dispatchMovedEvent(sourcePath, node.path || '', newPath, sourceName);
              onRefreshAll?.();
              refreshParent();
              await refreshThisDirectory();
            }
          }
        } else if (workspaceType === 'browser') {
          if (draggedNode && draggedNode.handle) {
            // FileSystem API 환경
            const targetDirHandle = node.handle;
            if (!targetDirHandle) return;
  
            let finalNewHandle: any = null;
            if (draggedNode.kind === 'file') {
              // 파일 이동: 새 파일 생성 후 복사 및 기존 파일 엔트리 제거
              const file = await draggedNode.handle.getFile();
              const text = await file.text();
              const newFileHandle = await targetDirHandle.getFileHandle(draggedNode.name, { create: true });
              const writable = await newFileHandle.createWritable();
              await writable.write(text);
              await writable.close();
              if (draggedNodeParent) {
                await draggedNodeParent.removeEntry(draggedNode.name);
              }
              finalNewHandle = newFileHandle;
            } else if (draggedNode.kind === 'directory') {
              // 폴더 이동: 새 폴더를 생성하고 하위 파일/폴더들을 재귀적으로 복사한 뒤 원본 폴더 엔트리 제거
              const newDirHandle = await targetDirHandle.getDirectoryHandle(draggedNode.name, { create: true });
              
              const copyDirectory = async (srcDir: FileSystemDirectoryHandle, destDir: FileSystemDirectoryHandle) => {
                for await (const entry of (srcDir as any).values()) {
                  if (entry.kind === 'file') {
                    const file = await entry.getFile();
                    const text = await file.text();
                    const newFileHandle = await destDir.getFileHandle(entry.name, { create: true });
                    const writable = await newFileHandle.createWritable();
                    await writable.write(text);
                    await writable.close();
                  } else if (entry.kind === 'directory') {
                    const newSubDir = await destDir.getDirectoryHandle(entry.name, { create: true });
                    await copyDirectory(entry, newSubDir);
                  }
                }
              };
              
              await copyDirectory(draggedNode.handle, newDirHandle);
              if (draggedNodeParent) {
                await draggedNodeParent.removeEntry(draggedNode.name, { recursive: true });
              }
              finalNewHandle = newDirHandle;
            }
            showToast(`'${draggedNode.name}' 이동 완료`, 'success');
            const newPath = node.path ? `${node.path}/${draggedNode.name}` : draggedNode.name;
            dispatchMovedEvent(sourcePath, node.path || '', newPath, draggedNode.name, finalNewHandle);
            onRefreshAll?.();
            refreshParent();
            await refreshThisDirectory();
          } else if (sourcePath) {
            // LocalStorage 가상 파일/폴더 이동
            const oldPath = sourcePath;
            const normalizedPath = oldPath.replace(/\\/g, '/');
            const lastSlashIndex = normalizedPath.lastIndexOf('/');
            const filename = lastSlashIndex !== -1 ? normalizedPath.substring(lastSlashIndex + 1) : normalizedPath;
            const newPath = node.path ? `${node.path}/${filename}` : filename;
            
            vfsRename(oldPath, newPath);
            showToast(`'${filename}' 이동 완료`, 'success');
            dispatchMovedEvent(oldPath, node.path || '', newPath, filename);
            onRefreshAll?.();
            refreshParent();
            await refreshThisDirectory();
          }
        }
    } catch (e) {
      showToast("이동 실패: " + e, 'error');
    }
  };

  // ====================================================================
  // 📊 [OMD-FILE-FileTreeItem-0005] FileTreeItem ➔ handleClick
  // 🎯 @KICK  : 파일 트리 노드 클릭 - 폴더 토글/지연 로드, 파일 열기, 병합 선택 처리
  // 🛡️ @GUARD : isMergeMode 시 파일 선택 모드로 전환
  // 🚨 @PATCH : 없음
  // 🔗 @CALLS : toggleMergeNodeSelect, openFile, onLazyLoad
  // ====================================================================
  const handleClick = (e: React.MouseEvent) => {
    /* [ONR-UI-005] 파일 트리 노드 클릭 연동: 사용자가 좌측 파일 탐색기 트리의 특정 노드를 클릭 시 폴더인 경우 자식 노드 토글/지연로드를 처리하고, 파일인 경우 openFile 콜백을 트리거하여 탭을 열고 로드합니다. */
    e.stopPropagation();
    if (isMergeMode && node.kind === 'file' && node.name.toLowerCase().endsWith('.md')) {
      if (toggleMergeNodeSelect) toggleMergeNodeSelect(node);
      return;
    }
    if (node.kind === 'directory') {
      openFile(node, parentHandle);
      const willOpen = !isOpen;
      if (willOpen && onLazyLoad && (!localChildren || localChildren.length === 0)) {
        setIsLoading(true);
        onLazyLoad(node).then((children: FileNode[]) => {
          setLocalChildren(children);
          setIsLoading(false);
          setIsOpen(true);
        }).catch(() => setIsLoading(false));
      } else {
        setIsOpen(willOpen);
      }
    } else if (node.kind === 'file') {
      openFile(node, parentHandle);
    }
  };

  const handleRename = async (e: any) => {
    e.stopPropagation();
    const isDir = node.kind === 'directory';
    setPromptConfig({
      isOpen: true,
      title: isDir 
        ? `'${node.name}' 폴더의 새 이름을 입력하세요:` 
        : `'${node.name}' 파일의 새 이름을 입력하세요:`,
      defaultValue: node.name,
      type: 'rename'
    });
  };

  const handleCreateFile = async (e: any) => {
    e.stopPropagation();
    setPromptConfig({
      isOpen: true,
      title: `[${node.name}]에 생성할 새 파일의 이름을 입력하세요:`,
      defaultValue: "untitled.md",
      type: 'createFile'
    });
  };

  const handleCreateFolder = async (e: any) => {
    e.stopPropagation();
    setPromptConfig({
      isOpen: true,
      title: `[${node.name}]에 생성할 새 폴더의 이름을 입력하세요:`,
      defaultValue: "",
      type: 'createFolder'
    });
  };

  // ====================================================================
  // 📊 [OMD-FILE-FileTreeItem-0006] FileTreeItem ➔ onPromptConfirm
  // 🎯 @KICK  : 이름 변경/파일 생성/폴더 생성 프롬프트 확인 처리 - 브라우저 VFS 또는 Electron API 연동
  // 🛡️ @GUARD : 중복 체크 및 빈 이름 방어
  // 🚨 @PATCH : setTimeout 800ms 지연 새로고침으로 OS 파일 인덱싱 락 방어, NFC 경로 표준화로 한글 자소 분리 방지
  // 🔗 @CALLS : vfsRename, vfsCreateFile, vfsCreateFolder, openFile, refreshParent, refreshThisDirectory
  // ====================================================================
  const onPromptConfirm = async (name: string) => {
    const type = promptConfig.type;
    setPromptConfig({ ...promptConfig, isOpen: false });
    if (!name) return;

    if (type === 'rename') {
      if (name === node.name) return;
      const finalName = node.kind === 'file' && !(name.toLowerCase().endsWith('.md') || name.toLowerCase().endsWith('.markdown') || name.toLowerCase().endsWith('.bib')) ? `${name}.md` : name;
      
      // 중복 체크
      if (siblings?.some(s => s.name.toLowerCase() === finalName.toLowerCase() && s.path !== node.path)) {
        setPromptConfig(prev => ({ ...prev, error: "이미 같은 이름의 항목이 존재합니다." }));
        return;
      }

      try {
        setPromptConfig(prev => ({ ...prev, isOpen: false, error: '' }));
        if (workspaceType === 'browser') {
          if (node.handle) {
            if (node.kind === 'file') {
              // 파일 이름 변경: 새 파일을 만들어 쓰고 기존 파일 삭제
              const file = await node.handle.getFile();
              const text = await file.text();
              const newHandle = await parentHandle.getFileHandle(finalName, { create: true });
              const writable = await newHandle.createWritable();
              await writable.write(text);
              await writable.close();
              await parentHandle.removeEntry(node.name);

              // 💡 파일의 새 경로 계산
              const oldPath = node.path || "";
              const oldName = node.name;
              const normalizedPath = oldPath.replace(/\\/g, '/');
              const lastSlashIndex = normalizedPath.lastIndexOf('/');
              const parentPath = lastSlashIndex !== -1 ? normalizedPath.substring(0, lastSlashIndex) : "";
              const newPath = parentPath ? `${parentPath}/${finalName}` : finalName;

              node.handle = newHandle;
              node.name = finalName;
              node.path = newPath;

              setTimeout(() => {
                refreshParent();
              }, 800);
              // 💡 탭 메타데이터만 갱신 (새 탭 열지 않음)
              window.dispatchEvent(new CustomEvent('file:tab-renamed', {
                detail: { oldPath, newPath, newName: finalName, newHandle }
              }));
            } else if (node.kind === 'directory') {
              // 폴더 이름 변경: 새 폴더를 만들고 하위 항목들을 재귀적으로 복사한 뒤 기존 폴더 삭제
              const newDirHandle = await parentHandle.getDirectoryHandle(finalName, { create: true });
              
              const copyDirectory = async (srcDir: FileSystemDirectoryHandle, destDir: FileSystemDirectoryHandle) => {
                for await (const entry of (srcDir as any).values()) {
                  if (entry.kind === 'file') {
                    const file = await entry.getFile();
                    const text = await file.text();
                    const newFileHandle = await destDir.getFileHandle(entry.name, { create: true });
                    const writable = await newFileHandle.createWritable();
                    await writable.write(text);
                    await writable.close();
                  } else if (entry.kind === 'directory') {
                    const newSubDir = await destDir.getDirectoryHandle(entry.name, { create: true });
                    await copyDirectory(entry, newSubDir);
                  }
                }
              };
              
              await copyDirectory(node.handle, newDirHandle);
              await parentHandle.removeEntry(node.name, { recursive: true });
              
              // 💡 폴더의 새 경로 계산
              const oldPath = node.path || "";
              const normalizedPath = oldPath.replace(/\\/g, '/');
              const lastSlashIndex = normalizedPath.lastIndexOf('/');
              const parentPath = lastSlashIndex !== -1 ? normalizedPath.substring(0, lastSlashIndex) : "";
              const newPath = parentPath ? `${parentPath}/${finalName}` : finalName;

              // 메모리 내 노드 핸들과 이름 및 경로 즉시 업데이트
              node.handle = newDirHandle;
              node.name = finalName;
              node.path = newPath;

              // 💡 이전 자식 노드 캐시 리셋
              node.children = [];
              setLocalChildren(null);

              setTimeout(() => {
                refreshParent();
                refreshThisDirectory();
              }, 800);
            }
          } else if (node.path) {
            // LocalStorage 가상 파일/폴더 이름 변경
            const oldPath = node.path;
            const normalizedPath = oldPath.replace(/\\/g, '/');
            const lastSlashIndex = normalizedPath.lastIndexOf('/');
            const parentPath = lastSlashIndex !== -1 ? normalizedPath.substring(0, lastSlashIndex) : "";
            const newPath = parentPath ? `${parentPath}/${finalName}` : finalName;
            
            vfsRename(oldPath, newPath);
            refreshParent();
            // 💡 탭 메타데이터만 갱신 (새 탭 열지 않음)
            window.dispatchEvent(new CustomEvent('file:tab-renamed', {
              detail: { oldPath, newPath, newName: finalName }
            }));
          }
        } else {
          const api = (window as any).electronAPI;
          const normalizedPath = node.path ? node.path.replace(/\\/g, '/') : "";
          const lastSlashIndex = normalizedPath.lastIndexOf('/');
          const parentPath = lastSlashIndex !== -1 ? normalizedPath.substring(0, lastSlashIndex) : "";
          const finalParentPath = parentPath.replace(/\//g, '\\');
          // 🛡️ 한글 자소 분리 깨짐 방지를 위한 NFC 경로 표준화
          const newPath = (finalParentPath ? `${finalParentPath}\\${finalName}` : finalName).normalize('NFC');

          const oldNodePath = node.path || "";
          if (api?.renameFile) {
            await api.renameFile(node.path, newPath);
            // 💡 [요구사항 1] 이름 변경 시 노드 메모리 정보 즉시 갱신하여 하위 목록의 404 경로 유실 에러 원천 차단
            node.path = newPath;
            node.name = finalName;
            refreshParent();
            // 🛡️ [요구사항 1] 지연 새로고침을 800ms로 상향하여 OS 파일 인덱싱 락 완벽 방어
            setTimeout(() => refreshParent(), 800);

            // 💡 탭 메타데이터만 갱신 (새 탭 열지 않음) — oldNodePath 스냅샷 사용
            window.dispatchEvent(new CustomEvent('file:tab-renamed', {
              detail: { oldPath: oldNodePath, newPath, newName: finalName }
            }));
          } else {
            const res = await fetch(getApiUrl('/api/rename'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ oldPath: node.path, newPath })
            });
            if (res.ok) {
              // 💡 [요구사항 1] 이름 변경 시 노드 메모리 정보 즉시 갱신하여 하위 목록의 404 경로 유실 에러 원천 차단
              node.path = newPath;
              node.name = finalName;
              refreshParent();
              setTimeout(() => refreshParent(), 800);
              // 💡 탭 메타데이터만 갱신 (새 탭 열지 않음) — oldNodePath 스냅샷 사용
              window.dispatchEvent(new CustomEvent('file:tab-renamed', {
                detail: { oldPath: oldNodePath, newPath, newName: finalName }
              }));
            }
          }
        }
      } catch(e) { 
        const isDir = node.kind === 'directory';
        showToast((isDir ? "폴더" : "파일") + " 이름 변경 실패: " + e, 'error'); 
      }
    } else if (type === 'createFile') {
      const finalName = (name.toLowerCase().endsWith('.md') || name.toLowerCase().endsWith('.bib')) ? name : `${name}.md`;
      
      // 중복 체크
      if (node.children?.some(c => c.name.toLowerCase() === finalName.toLowerCase())) {
        setPromptConfig(prev => ({ ...prev, error: "이미 같은 이름의 파일이 존재합니다." }));
        return;
      }

      try {
        setPromptConfig(prev => ({ ...prev, isOpen: false, error: '' }));
        if (workspaceType === 'browser') {
          if (node.handle) {
            const handle = await node.handle.getFileHandle(finalName, { create: true });
            refreshParent();
            const filePath = node.path ? `${node.path}/${finalName}` : finalName;
            openFile({ name: finalName, kind: 'file', handle, path: filePath }, node.handle);
          } else if (node.path) {
            // LocalStorage 가상 파일 생성
            vfsCreateFile(node.path, finalName);
            refreshParent();
            window.dispatchEvent(new CustomEvent('file:refresh-all-directories'));
            const filePath = `${node.path}/${finalName}`;
            openFile({ name: finalName, kind: 'file', path: filePath }, node.handle);
          }
        } else {
          const api = (window as any).electronAPI;
          if (api?.createFile) {
            const result = await api.createFile(node.path, finalName);
            if (result.success) {
              await refreshThisDirectory();
              window.dispatchEvent(new CustomEvent('file:refresh-all-directories'));
              setTimeout(() => window.dispatchEvent(new CustomEvent('file:refresh-all-directories')), 300);
              openFile({ name: finalName, kind: 'file', path: result.path }, node.handle);
            }
          } else {
            const res = await fetch(getApiUrl('/api/create-file'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ parentPath: node.path, name: finalName })
            });
            if (res.ok) {
              const data = await res.json();
              await refreshThisDirectory();
              window.dispatchEvent(new CustomEvent('file:refresh-all-directories'));
              setTimeout(() => window.dispatchEvent(new CustomEvent('file:refresh-all-directories')), 300);
              openFile({ name: finalName, kind: 'file', path: data.path }, node.handle);
            }
          }
        }
      } catch(e) { showToast("생성 실패: " + e, 'error'); }
    } else if (type === 'createFolder') {
      // 중복 체크
      if (node.children?.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        setPromptConfig(prev => ({ ...prev, error: "이미 같은 이름의 폴더가 존재합니다." }));
        return;
      }

      try {
        setPromptConfig(prev => ({ ...prev, isOpen: false, error: '' }));
        if (workspaceType === 'browser') {
          if (node.handle) {
            await node.handle.getDirectoryHandle(name, { create: true });
          } else if (node.path) {
            // LocalStorage 가상 폴더 생성
            vfsCreateFolder(node.path, name);
          }
        } else {
          const api = (window as any).electronAPI;
          if (api?.createFolder) {
            await api.createFolder(node.path, name);
          } else {
            await fetch(getApiUrl('/api/create-folder'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ parentPath: node.path, name: name })
            });
          }
        }
        // 🆕 생성 직후 부모 폴더를 열고 새 폴더를 자동 선택/하이라이트
        setIsOpen(true);
        const newFolderPath = node.path ? `${node.path}/${name}` : name;
        
        // 🛡️ [OS 파일 인덱싱 지연 보정 가드] 300ms의 마진을 두고 자식 리스트 갱신 및 파일 시스템 전역 리플래시 연동
        setTimeout(async () => {
          await refreshThisDirectory();
          window.dispatchEvent(new CustomEvent('file:refresh-all-directories'));
          // 새로 생성된 폴더 자동 선택 이벤트
          window.dispatchEvent(new CustomEvent('file:select-node', { detail: { path: newFolderPath } }));
        }, 300);
      } catch(e) { showToast("생성 실패: " + e, 'error'); }
    }
  };

  // ====================================================================
  // 📊 [OMD-FILE-FileTreeItem-0007] FileTreeItem ➔ handleDelete
  // 🎯 @KICK  : 파일/폴더 삭제 처리 - 브라우저 VFS 또는 Electron API를 통해 삭제
  // 🛡️ @GUARD : askConfirm으로 사용자 재확인 후 실행; openTabPaths로 열린 파일/폴더 삭제 차단
  // 🚨 @PATCH : setTimeout 300ms 지연 인덱싱 동기화 갱신으로 OS 파일 락 방어; **2026-06-19** — 열린 탭 보호 가드 추가
  // 🔗 @CALLS : askConfirm, refreshParent, vfsDelete, openFile, showToast
  // ====================================================================
  const handleDelete = async (e: any) => {
    e.stopPropagation();

    // 열린 탭 보호 복구: 열려있는 문서나 그 문서가 포함된 폴더는 삭제 불가
    if (openTabPaths && openTabPaths.length > 0 && node.path) {
      const normPath = node.path.replace(/\\/g, '/');
      if (node.kind === 'directory') {
        const hasOpenDescendant = openTabPaths.some(tp => {
          const normTp = tp.replace(/\\/g, '/');
          return normTp === normPath || normTp.startsWith(normPath + '/');
        });
        if (hasOpenDescendant) {
          showToast("열려 있는 파일이 포함된 폴더는 삭제할 수 없습니다.", "warning");
          return;
        }
      } else {
        if (openTabPaths.some(tp => tp.replace(/\\/g, '/') === normPath)) {
          showToast("편집기에서 열려 있는 파일은 삭제할 수 없습니다.", "warning");
          return;
        }
      }
    }
    const isDir = node.kind === 'directory';
    const rawChildren = localChildren !== null ? localChildren : node.children;
    const hasChildren = isDir && rawChildren && rawChildren.length > 0;

    askConfirm({
      title: isDir ? "폴더 삭제" : "파일 삭제",
      message: isDir 
        ? (hasChildren 
            ? `'${node.name}' 폴더와 그 안의 모든 하위 파일/폴더를 완전히 삭제하시겠습니까?` 
            : `'${node.name}' 폴더를 정말 삭제하시겠습니까?`)
        : `'${node.name}' 파일을 정말 삭제하시겠습니까?`,
      isDanger: true,
      onConfirm: async () => {
        try {
          if (workspaceType === 'browser') {
            if (node.handle) {
              // 🚀 폴더 및 파일 재귀 삭제 지원 (recursive: true)
              await parentHandle.removeEntry(node.name, { recursive: true });
              if (isDir && node.path) {
                try {
                  const saved = localStorage.getItem('onrivi_expanded_paths');
                  if (saved) {
                    const normPath = node.path.replace(/\\/g, '/');
                    const paths = JSON.parse(saved).filter((p: string) => {
                      const np = p.replace(/\\/g, '/');
                      return np !== normPath && !np.startsWith(normPath + '/');
                    });
                    localStorage.setItem('onrivi_expanded_paths', JSON.stringify(paths));
                  }
                } catch {}
              }
              refreshParent();
              window.dispatchEvent(new CustomEvent('file:refresh-all-directories'));
              setTimeout(() => {
                refreshParent();
                window.dispatchEvent(new CustomEvent('file:refresh-all-directories'));
              }, 300);
            } else if (node.path) {
              // LocalStorage 가상 파일/폴더 삭제
              vfsDelete(node.path);
              if (isDir && node.path) {
                try {
                  const saved = localStorage.getItem('onrivi_expanded_paths');
                  if (saved) {
                    const normPath = node.path.replace(/\\/g, '/');
                    const paths = JSON.parse(saved).filter((p: string) => {
                      const np = p.replace(/\\/g, '/');
                      return np !== normPath && !np.startsWith(normPath + '/');
                    });
                    localStorage.setItem('onrivi_expanded_paths', JSON.stringify(paths));
                  }
                } catch {}
              }
              refreshParent();
              window.dispatchEvent(new CustomEvent('file:refresh-all-directories'));
            }
          } else {
            const api = (window as any).electronAPI;
            if (api?.deleteFile) {
              await api.deleteFile(node.path);
            } else {
              const res = await fetch(getApiUrl('/api/delete'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: node.path })
              });
              if (!res.ok) return;
            }
            refreshParent();
            window.dispatchEvent(new CustomEvent('file:refresh-all-directories'));
            setTimeout(() => {
              refreshParent();
              window.dispatchEvent(new CustomEvent('file:refresh-all-directories'));
            }, 300);
          }
          if (currentFileName === node.name) {
            openFile(null); 
          }
          // 🚀 삭제된 파일/폴더와 연관된 탭들을 닫도록 이벤트 발송
          if (node.path) {
            window.dispatchEvent(new CustomEvent('file:tab-deleted', { detail: { deletedPath: node.path } }));
          }
          showToast(`[${node.name}] ${isDir ? "폴더" : "파일"}가 삭제되었습니다.`, 'success');
        } catch(e: any) { 
          const errStr = e.message || e.toString();
          showToast("삭제 실패: " + errStr, 'error'); 
        }
      }
    });
  };

  const isSelected = (() => {
    if (currentFilePath && node.path) {
      const normCur = currentFilePath.replace(/\\/g, '/').toLowerCase();
      const normNode = node.path.replace(/\\/g, '/').toLowerCase();
      return normCur === normNode;
    }
    if (currentFileName && node.name) {
      return currentFileName.toLowerCase() === node.name.toLowerCase();
    }
    return false;
  })();

  const isMergeSelected = node.kind === 'file' && selectedMergeNodes.some(n => n.path ? n.path === node.path : n.name === node.name);
  const isMarkdown = node.kind === 'file' && node.name.toLowerCase().endsWith('.md');

  // 🧠 지식 베이스 등록 여부 추적 (데스크톱 전용 기능)
  const [isKnowledgeRegistered, setIsKnowledgeRegistered] = useState(false);
  useEffect(() => {
    if (!isDesktop || !isMarkdown) {
      setIsKnowledgeRegistered(false);
      return;
    }
    const checkRegistered = () => {
      try {
        const registeredList = JSON.parse(localStorage.getItem('onrivi_registered_knowledge_docs') || '[]');
        if (!Array.isArray(registeredList) || registeredList.length === 0) {
          setIsKnowledgeRegistered(false);
          return;
        }

        const norm = (s: string) => (s || '').replace(/\\/g, '/').toLowerCase().trim();
        const myPath = norm(node.path || node.name);
        const myName = norm(node.name);

        const matched = registeredList.some((rawP: string) => {
          const p = norm(rawP);
          return (
            p === myPath ||
            p === myName ||
            p.endsWith('/' + myName) ||
            myPath.endsWith('/' + p) ||
            p.endsWith(myPath) ||
            myPath.endsWith(p)
          );
        });

        setIsKnowledgeRegistered(matched);
      } catch {
        setIsKnowledgeRegistered(false);
      }
    };

    checkRegistered();
    window.addEventListener('knowledge:updated', checkRegistered);
    window.addEventListener('file:refresh-all-directories', checkRegistered);
    return () => {
      window.removeEventListener('knowledge:updated', checkRegistered);
      window.removeEventListener('file:refresh-all-directories', checkRegistered);
    };
  }, [node.path, node.name, isMarkdown, isDesktop]);

  return (
    <div className="select-none">
      <PromptModal 
        isOpen={promptConfig.isOpen}
        title={promptConfig.title}
        defaultValue={promptConfig.defaultValue}
        error={promptConfig.error}
        onConfirm={onPromptConfirm}
        onCancel={() => setPromptConfig({ ...promptConfig, isOpen: false, error: '' })}
      />
      <div 
        title={node.name}
        draggable={!isMergeMode && !isRestrictedUser}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onMouseLeave={handleItemMouseLeave}
        className={`group relative flex items-center w-full py-1 pr-2 my-0.5 rounded-lg transition-all cursor-pointer ${
          isSelected 
            ? 'bg-[#1d4ed8]/15 dark:bg-[#1d4ed8]/25 text-zinc-950 dark:text-white font-extrabold shadow-sm' 
            : isDragOver
              ? 'bg-[#1d4ed8]/20 scale-[1.01]'
              : 'text-[#2A2A2A] dark:text-[#D4D4D4] hover:bg-zinc-200/80 dark:hover:bg-zinc-700/60 hover:text-black dark:hover:text-white hover:font-bold hover:shadow-2xs'
        } ${isCut ? 'opacity-40 italic' : ''}`}
        style={{ 
          paddingLeft: `${(level * 12) + 8}px`,
          fontFamily: "'Pretendard', 'Pretendard Variable', -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', '맑은 고딕', sans-serif"
        }}
        onClick={handleClick}
        onContextMenu={(e) => {
          if (isMergeMode || isRestrictedUser) return;
          e.preventDefault();
          e.stopPropagation();
          window.dispatchEvent(new CustomEvent('close-context-menus'));
          setContextMenu({ x: e.clientX, y: e.clientY });
        }}
      >
        <span className="w-3.5 h-3.5 flex items-center justify-center mr-0.5 opacity-60 origin-center">
          {node.kind === 'directory' ? (
            isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />
          ) : null}
        </span>
        
        {isMergeMode && isMarkdown && (
          <input 
            type="checkbox" 
            checked={isMergeSelected}
            onChange={() => toggleMergeNodeSelect?.(node)}
            className="w-2.5 h-2.5 mr-1.5 rounded text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-1 cursor-pointer shrink-0"
            onClick={(e) => e.stopPropagation()}
          />
        )}
        
        <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0 origin-center text-current">
          {getFileIcon(node, isSelected, isOpen)}
        </span>
        
        <span className="ml-1.5 truncate text-[12px] font-bold text-left flex-1 flex items-center gap-1">
          <span className="truncate">{node.name}</span>
          {isKnowledgeRegistered && (
            <span className="text-[11px] shrink-0 select-none animate-in fade-in zoom-in-75 duration-200" title="지식 베이스에 등록된 문서입니다">📗</span>
          )}
        </span>

        {contextMenu && !isMergeMode && !isRestrictedUser && createPortal(
          <div
            ref={(el) => {
              if (el && typeof window !== 'undefined') {
                const rect = el.getBoundingClientRect();
                if (rect.bottom > window.innerHeight - 10) {
                  const newTop = Math.max(10, window.innerHeight - rect.height - 12);
                  el.style.top = `${newTop}px`;
                }
                if (rect.right > window.innerWidth - 10) {
                  const newLeft = Math.max(10, window.innerWidth - rect.width - 12);
                  el.style.left = `${newLeft}px`;
                }
              }
            }}
            className="fixed z-[100000] py-1 bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl border border-black/10 dark:border-white/10 min-w-[160px] max-h-[calc(100vh-24px)] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-100"
            style={{ 
              top: Math.max(10, Math.min(contextMenu.y, typeof window !== 'undefined' ? window.innerHeight - 340 : contextMenu.y)), 
              left: Math.max(10, Math.min(contextMenu.x, typeof window !== 'undefined' ? window.innerWidth - 220 : contextMenu.x)) 
            }}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
            onMouseEnter={handleMenuMouseEnter}
            onMouseLeave={handleMenuMouseLeave}
          >
            {(() => {
              // 탭에 열려있는지 확인
              const isOpenInTab = !!node.path && !!openTabPaths?.length && (() => {
                const normPath = node.path.replace(/\\/g, '/');
                if (node.kind === 'directory') {
                  return openTabPaths.some(tp => {
                    const normTp = tp.replace(/\\/g, '/');
                    return normTp === normPath || normTp.startsWith(normPath + '/');
                  });
                }
                return openTabPaths.some(tp => tp.replace(/\\/g, '/') === normPath);
              })();

              return (
                <div className="flex flex-col text-[12px] text-gray-700 dark:text-gray-300 font-medium">
                  {node.kind === 'directory' && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); setContextMenu(null); handleCreateFile(e); }}
                        className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white w-full text-left transition-colors"
                      >
                        <FilePlus size={15} strokeWidth={1.75} className="shrink-0 text-current opacity-80" />
                        <span>새 파일</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setContextMenu(null); handleCreateFolder(e); }}
                        className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white w-full text-left transition-colors"
                      >
                        <FolderPlus size={15} strokeWidth={1.75} className="shrink-0 text-current opacity-80" />
                        <span>새 폴더</span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); setContextMenu(null); handleRename(e); }}
                    className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white w-full text-left transition-colors"
                  >
                    <Pencil size={15} strokeWidth={1.75} className="shrink-0 text-current opacity-80" />
                    <span>이름 변경</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setContextMenu(null);
                      window.dispatchEvent(new CustomEvent('file:copy-node', {
                        detail: { node, parentHandle }
                      }));
                    }}
                    className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white w-full text-left transition-colors"
                  >
                    <Copy size={15} strokeWidth={1.75} className="shrink-0 text-current opacity-80" />
                    <span>복사하기</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isOpenInTab) {
                        showToast('편집기에서 열려 있는 파일은 잘라내기할 수 없습니다. 탭을 먼저 닫아주세요.', 'warning');
                        return;
                      }
                      setContextMenu(null);
                      window.dispatchEvent(new CustomEvent('file:cut-node', {
                        detail: { node, parentHandle }
                      }));
                    }}
                    disabled={isOpenInTab}
                    className={`flex items-center gap-2.5 px-3 py-1.5 w-full text-left transition-colors ${
                      isOpenInTab ? 'opacity-40 cursor-not-allowed' : 'hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
                    }`}
                    title={isOpenInTab ? "탭에서 열려있는 파일은 잘라내기할 수 없습니다" : "잘라내기"}
                  >
                    <Scissors size={15} strokeWidth={1.75} className="shrink-0 text-current opacity-80" />
                    <span>잘라내기</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setContextMenu(null);
                      window.dispatchEvent(new CustomEvent('file:paste-node', {
                        detail: { 
                          targetDirNode: node.kind === 'directory' ? node : undefined, 
                          targetHandle: node.kind === 'directory' ? node.handle : parentHandle 
                        }
                      }));
                    }}
                    className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white w-full text-left transition-colors"
                  >
                    <ClipboardPaste size={15} strokeWidth={1.75} className="shrink-0 text-current opacity-80" />
                    <span>붙여넣기</span>
                  </button>
                  {(() => {
                    const isElectronApp = typeof window !== 'undefined' && !!(window as any).electronAPI;
                    if (!isElectronApp || !node.path) return null;
                    const isMac = typeof navigator !== 'undefined' && /mac|iphone|ipad|ipod/i.test(navigator.userAgent);
                    const label = isMac ? 'Finder에서 보기' : '파일 탐색기에서 보기';
                    return (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          setContextMenu(null);
                          const api = (window as any).electronAPI;
                          if (node.kind === 'file' && api?.showItemInFolder) {
                            await api.showItemInFolder(node.path);
                          } else if (api?.openPath) {
                            await api.openPath(node.path);
                          }
                        }}
                        className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white w-full text-left transition-colors"
                      >
                        <FolderOpen size={15} strokeWidth={1.75} className="shrink-0 text-current opacity-80" />
                        <span>{label}</span>
                      </button>
                    );
                  })()}
                  <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (!isOpenInTab) {
                        setContextMenu(null); 
                        handleDelete(e); 
                      }
                    }}
                    disabled={isOpenInTab}
                    className={`flex items-center gap-2.5 px-3 py-1.5 w-full text-left transition-colors ${
                      isOpenInTab 
                        ? 'opacity-40 cursor-not-allowed' 
                        : 'hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400'
                    }`}
                    title={isOpenInTab ? "탭에서 열려있는 파일은 삭제할 수 없습니다" : "삭제"}
                  >
                    <Trash2 size={15} strokeWidth={1.75} className={`shrink-0 text-current opacity-80 ${isOpenInTab ? 'opacity-40' : ''}`} />
                    <span>삭제</span>
                  </button>

                  {/* 🧠 지식 베이스 등록 버튼 (마크다운 전용) */}
                  {node.kind === 'file' && isMarkdown && (() => {
                    let rawFolder = (
                      loadSecureData<string>('resourceFolder') ||
                      (typeof window !== 'undefined' ? localStorage.getItem('onrivi_resource_folder_path') : '') ||
                      (typeof window !== 'undefined' ? localStorage.getItem('onrivi_resource_folder') : '') ||
                      (() => {
                        try {
                          const raw = typeof window !== 'undefined' ? localStorage.getItem('onrivi_settings') : null;
                          return raw ? JSON.parse(raw).resourceFolder || '' : '';
                        } catch { return ''; }
                      })() ||
                      'Onrivi_Asset'
                    ).trim();

                    if (rawFolder.startsWith('U2FsdGVkX1')) {
                      const decrypted = loadSecureData<string>('resourceFolder');
                      rawFolder = (decrypted && !decrypted.startsWith('U2FsdGVkX1')) ? decrypted : 'Onrivi_Asset';
                    }
                    const resourceFolder = rawFolder || 'Onrivi_Asset';

                    const geminiApiKey = (
                      (typeof window !== 'undefined' ? localStorage.getItem('onrivi_gemini_api_key') : '') ||
                      loadSecureData<string>('geminiApiKey') ||
                      loadSecureData<string>('onrivi_gemini_api_key') ||
                      (() => {
                        try {
                          const raw = typeof window !== 'undefined' ? localStorage.getItem('onrivi_settings') : null;
                          return raw ? JSON.parse(raw).geminiApiKey || '' : '';
                        } catch { return ''; }
                      })() ||
                      ''
                    ).trim();

                    const planCode = (() => {
                      try {
                        const status = loadSecureData<any>('onrivi_license_status');
                        if (status?.planName) return String(status.planName);
                      } catch {}
                      return loadSecureData<string>('planCode') || 'ELITEPRO';
                    })();

                    const aiModelName = (
                      (typeof window !== 'undefined' ? localStorage.getItem('onrivi_ai_model_name') : '') ||
                      (() => {
                        try {
                          const raw = typeof window !== 'undefined' ? localStorage.getItem('onrivi_settings') : null;
                          return raw ? JSON.parse(raw).aiModelName || '' : '';
                        } catch { return ''; }
                      })() ||
                      'gemini-3.8-flash'
                    ).trim();

                    const isDesktopEnv = typeof window !== 'undefined' && (
                      !!(window as any).electronAPI ||
                      navigator.userAgent.toLowerCase().includes('electron') ||
                      new URLSearchParams(window.location.search).get('env') === 'desktop'
                    );

                    // 🚀 웹 브라우저(SaaS) 환경에서는 지식문서 등록/해제 메뉴를 숨김 (데스크톱 전용 기능)
                    if (!isDesktopEnv) {
                      return null;
                    }

                    const guard = checkKnowledgeGuard({ resourceFolder, geminiApiKey, planCode });

                    return (
                      <>
                        <div className="h-px bg-black/5 dark:bg-white/5 my-1" />
                        {isKnowledgeRegistered ? (
                          <>
                            {/* 📑 지식 문서 상세 분석 (KUI-010) */}
                            <button
                              type="button"
                              onClick={async (e) => {
                                e.stopPropagation();
                                setContextMenu(null);
                                const canUseLocalDb = await canAccessKnowledgeDb();
                                if (!canUseLocalDb) {
                                  showToast('로컬 지식 베이스를 사용하려면 먼저 공통 리소스 폴더(Onrivi_Asset)를 지정해 주세요.', 'info');
                                  return;
                                }
                                const myPath = node.path || node.name;
                                try {
                                  showToast(`[${node.name}] 지식 상세 분석을 불러오는 중...`, 'info');
                                  const detail = await knowledgeClient.getDocumentDetail({
                                    filePath: myPath,
                                    resourceFolder,
                                    geminiApiKey,
                                    planCode,
                                    resourceFolderHandle: typeof window !== 'undefined' ? (window as any).__resourceFolderHandle : undefined,
                                  });
                                  if (detail) {
                                    window.dispatchEvent(new CustomEvent('knowledge:show-detail', { detail }));
                                  } else {
                                    showToast('지식 상세 정보를 찾을 수 없습니다.', 'warning');
                                  }
                                } catch {
                                  showToast('지식 상세 정보 로드 실패', 'error');
                                }
                              }}
                              className="flex items-center gap-2 px-3 py-1.5 w-full text-left transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
                              title="이 문서의 AI 요약, 핵심 요점, 청크 구조 및 태그를 상세 열람합니다"
                            >
                              <span className="text-[14px]">📑</span>
                              <span>지식 분석 상세 (KUI-010)</span>
                            </button>

                            {/* 🧠 지식문서 해제 버튼 */}
                            <button
                              type="button"
                              onClick={async (e) => {
                                e.stopPropagation();
                                setContextMenu(null);
                                const canUseLocalDb = await canAccessKnowledgeDb();
                                if (!canUseLocalDb) {
                                  showToast('로컬 지식 베이스를 사용하려면 먼저 공통 리소스 폴더(Onrivi_Asset)를 지정해 주세요.', 'info');
                                  return;
                                }
                                const myPath = node.path || node.name;
                                if (!confirm(`'${node.name}' 문서를 지식 베이스에서 해제하시겠습니까?`)) return;

                                 try {
                                  showToast(`[${node.name}] 지식 문서 해제를 진행합니다...`, 'info');
                                  const ok = await knowledgeClient.deleteDocument({
                                    filePath: myPath,
                                    resourceFolder,
                                    geminiApiKey,
                                    planCode,
                                    resourceFolderHandle: typeof window !== 'undefined' ? (window as any).__resourceFolderHandle : undefined,
                                  });
                                  if (!ok) {
                                    throw new Error('지식 문서 해제에 실패했습니다.');
                                  }

                                  // 로컬 캐시에서 제거 (슬래시/역슬래시 및 파일명 접미사 정규화 비교로 완벽 제거)
                                  try {
                                    const list = JSON.parse(localStorage.getItem('onrivi_registered_knowledge_docs') || '[]');
                                    const norm = (s: string) => (s || '').replace(/\\/g, '/').toLowerCase().trim();
                                    const targetP = norm(myPath);
                                    const targetN = norm(node.name);

                                    const updated = (Array.isArray(list) ? list : []).filter((rawP: string) => {
                                      const p = norm(rawP);
                                      const isTarget =
                                        p === targetP ||
                                        p === targetN ||
                                        p.endsWith('/' + targetN) ||
                                        targetP.endsWith('/' + p) ||
                                        p.endsWith(targetP) ||
                                        targetP.endsWith(p);
                                      return !isTarget;
                                    });
                                    localStorage.setItem('onrivi_registered_knowledge_docs', JSON.stringify(updated));
                                  } catch {}

                                  showToast(`[${node.name}] 지식 문서 등록이 성공적으로 해제되었습니다.`, 'info');
                                  setIsKnowledgeRegistered(false);
                                  window.dispatchEvent(new CustomEvent('knowledge:updated'));
                                  window.dispatchEvent(new CustomEvent('knowledge:refresh'));
                                  window.dispatchEvent(new CustomEvent('file:refresh-all-directories'));
                                } catch (err: any) {
                                  showToast(`지식 해제 실패: ${err?.message || '알 수 없는 오류'}`, 'error');
                                }
                              }}
                              className="flex items-center gap-2 px-3 py-1.5 w-full text-left transition-colors hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold"
                              title="이 마크다운 문서를 지식 베이스에서 해제합니다"
                            >
                              <span className="text-[14px]">📗</span>
                              <span>지식문서 해제</span>
                            </button>
                          </>
                        ) : (
                          /* ⭐ 지식 베이스에 등록 버튼 */
                          <button
                            type="button"
                            disabled={!guard.canUseKnowledge}
                            onClick={async (e) => {
                              e.stopPropagation();
                              setContextMenu(null);
                              const canUseLocalDb = await canAccessKnowledgeDb();
                              if (!canUseLocalDb) {
                                showToast('로컬 지식 베이스를 사용하려면 먼저 공통 리소스 폴더(Onrivi_Asset)를 지정해 주세요.', 'info');
                                return;
                              }
                              if (!guard.canUseKnowledge) {
                                showToast(guard.blockMessage || '지식 엔진을 사용할 수 없습니다.', 'warning');
                                window.dispatchEvent(new CustomEvent('app:dispatch-command', { detail: 'SETTINGS' }));
                                return;
                              }

                              try {
                                showToast(`[${node.name}] 지식 베이스 등록을 시작합니다...`, 'info');
                                let content = '';
                                // 1) Web File System Access API
                                if (node.handle?.getFile) {
                                  try {
                                    const file = await node.handle.getFile();
                                    content = await file.text();
                                  } catch (e) {
                                    console.warn('[지식 등록] handle.getFile() 실패:', e);
                                  }
                                }
                                // 2) 데스크톱 electronAPI.readFromPath (반환: { name, path, content } 또는 string)
                                if (!content && (window as any).electronAPI?.readFromPath && node.path) {
                                  try {
                                    const res = await (window as any).electronAPI.readFromPath(node.path);
                                    content = typeof res === 'string' ? res : (res?.content || '');
                                  } catch (e) {
                                    console.warn('[지식 등록] electronAPI.readFromPath() 실패:', e);
                                  }
                                }
                                // 3) 데스크톱 electronAPI.readFile 폴백
                                if (!content && (window as any).electronAPI?.readFile && node.path) {
                                  try {
                                    const res = await (window as any).electronAPI.readFile(node.path);
                                    content = typeof res === 'string' ? res : (res?.content || '');
                                  } catch (e) {
                                    console.warn('[지식 등록] electronAPI.readFile() 실패:', e);
                                  }
                                }

                                // 🛡️ 로컬 데스크톱 또는 Node 서버 환경에서는 백엔드에서 node.path로 fs.readFileSync 자동 폴백을 수행할 수 있음
                                const hasValidDiskPath = Boolean(node.path && canUseLocalDb);
                                if (!content.trim() && !hasValidDiskPath) {
                                  showToast('파일 내용이 비어있어 등록할 수 없습니다.', 'warning');
                                  return;
                                }

                                showToast(`[${node.name}] AI 지식 분석 및 등록을 진행 중입니다...`, 'info');

                                // 🛡️ [스캔 배제]: 단계 찾아가지 않고 로컬스토리지 작업장 절대경로와 즉시 다이렉트 직결!
                                const directFilePath = buildDirectWorkspacePath(node.path || node.name);

                                // 통합 지식 서비스(Electron / Local / Web WASM) 호출
                                const regRes = await knowledgeClient.indexDocument({
                                  filePath: directFilePath,
                                  fileContent: content,
                                  title: node.name.replace(/\.md$/i, ''),
                                  resourceFolder,
                                  geminiApiKey,
                                  planCode,
                                  aiModelName,
                                  resourceFolderHandle: typeof window !== 'undefined' ? (window as any).__resourceFolderHandle : undefined,
                                });
                                const registeredDetail = regRes?.detail;

                                // 🧠 클라이언트 로컬 스토리지에 등록 상태 보존 (절대경로 및 상대경로 동시 캐싱)
                                try {
                                  const myPath = node.path || node.name;
                                  const resolvedPath = registeredDetail?.filePath || regRes?.documentId;
                                  const list = JSON.parse(localStorage.getItem('onrivi_registered_knowledge_docs') || '[]');
                                  if (myPath && !list.includes(myPath)) list.push(myPath);
                                  if (resolvedPath && !list.includes(resolvedPath)) list.push(resolvedPath);
                                  localStorage.setItem('onrivi_registered_knowledge_docs', JSON.stringify(list));
                                } catch {}

                                window.dispatchEvent(new CustomEvent('knowledge:updated'));

                                // 🧠 상세 분석 결과 모달 팝업 또는 토스트 피드백
                                if (registeredDetail) {
                                  window.dispatchEvent(new CustomEvent('knowledge:show-detail', { detail: registeredDetail }));
                                } else {
                                  showToast(`[${node.name}] 지식 베이스에 성공적으로 등록되었습니다! 📗`, 'success');
                                }
                              } catch (err: any) {
                                console.error('[지식 등록 실패]', err);
                                const errMsg = err?.message || String(err || '알 수 없는 오류');
                                showToast(`❌ 지식 등록 실패: ${errMsg}`, 'error');
                                if (typeof window !== 'undefined') {
                                  window.alert(`❌ AI 지식 문서 분석 및 등록 실패\n\n원인: ${errMsg}`);
                                }
                              }
                            }}
                            className={`flex items-center gap-2 px-3 py-1.5 w-full text-left transition-colors font-bold ${
                              !guard.canUseKnowledge
                                ? 'opacity-40 cursor-not-allowed grayscale text-zinc-400 dark:text-zinc-500'
                                : 'hover:bg-amber-50 dark:hover:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            }`}
                            title={guard.canUseKnowledge ? "이 마크다운 문서를 개인 지식 베이스에 등록합니다" : (guard.blockMessage || "지식 베이스에 등록하려면 AI 연동 설정이 필요합니다")}
                          >
                            <span className="text-[14px]">⭐</span>
                            <span>지식문서 등록{!guard.canUseKnowledge ? ' (연동 필요)' : ''}</span>
                          </button>
                        )}
                      </>
                    );
                  })()}
                </div>
              );
            })()}
          </div>,
          document.body
        )}
      </div>

      {node.kind === 'directory' && isOpen && (() => {
        const rawChildren = localChildren !== null ? localChildren : node.children;
        if (!rawChildren) return null;
        const children = rawChildren.filter(child => child.kind === 'directory' || child.name.toLowerCase().endsWith('.md') || child.name.toLowerCase().endsWith('.markdown') || child.name.toLowerCase().endsWith('.bib'));
        if (isLoading) {
          return <div className="text-[10px] text-zinc-400 pl-6 py-1 italic">불러오는 중...</div>;
        }
        return (
          <div className="mt-px">
            {children.length === 0 && (
              <div className="text-[10px] text-zinc-400 pl-6 py-1 italic">빈 폴더</div>
            )}
            {children.map((child, idx) => (
              <FileTreeItem 
                key={`${child.path || child.name}-${idx}`} 
                node={child} 
                parentHandle={node.handle}
                level={level + 1}
                openFile={openFile}
                previewMode={previewMode}
                setPreviewMode={setPreviewMode}
                currentFileName={currentFileName}
                currentFilePath={currentFilePath}
                workspaceType={workspaceType}
                refreshParent={refreshThisDirectory}
                onRefreshAll={onRefreshAll}
                openTabPaths={openTabPaths}
                askConfirm={askConfirm}
                siblings={children}
                isMergeMode={isMergeMode}
                selectedMergeNodes={selectedMergeNodes}
                toggleMergeNodeSelect={toggleMergeNodeSelect}
                onLazyLoad={onLazyLoad}
                isRestrictedUser={isRestrictedUser}
              />
            ))}
          </div>
        );
      })()}
    </div>
  );
};

export default FileTreeItem;
