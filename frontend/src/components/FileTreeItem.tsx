"use client";

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight, ChevronDown, FilePlus, FolderPlus, Pencil, Trash2 } from 'lucide-react';
import { FileNode, getFileIcon } from '@/lib/indexedDbHelper';
import { getApiUrl } from '@/lib/apiUrlBuilder';
import { vfsCreateFile, vfsCreateFolder, vfsRename, vfsDelete } from '@/lib/virtualFileSystem';
import PromptModal from '@/components/PromptModal';
import { msg } from '@/lib/systemMessages';
import { useToast } from '@/components/ToastProvider';
import { checkKnowledgeGuard } from '@/lib/knowledge/knowledgeGuard';
import { loadSecureData } from '@/lib/secureStorage';

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

// ====================================================================
// 📊 [OMD-FILE-FileTreeItem-0001] FileTreeItem ➔ FileTreeItem
// 🚨 @PATCH : **2026-09-05** — [ONRIVI-KNOWLEDGE-PATH-NORM-SYNC] 탐색기 새로고침(file:refresh-all-directories) 이벤트 연동 및 지식 문서 등록 판정 시 슬래시/역슬래시 및 경로 접미사/파일명 정규화(Normalization) 비교 알고리즘 적용하여 새로고침 시에도 지식문서 아이콘(📗)이 항상 완벽하게 유지/반영되도록 개선
//             **2026-09-05** — AI 미연결 시 우클릭 컨텍스트 메뉴의 '지식 베이스에 등록' 버튼을 비활성화(disabled, 흐린 흑백 스타일, 연동 필요 안내 툴팁) 처리
//             **2026-09-04** — 파일 탐색기 우클릭 컨텍스트 메뉴에서 '지식 허브 열기' 버튼 제거하여 메뉴 간소화
//             **2026-09-04** — 지식문서 등록 뱃지 및 우클릭 컨텍스트 메뉴의 지식문서 아이콘을 초록색 책(📗)으로 전면 교체
//             **2026-09-04** — [ONRIVI-CONTEXTMENU-CLAMP] 화면 하단(작업표시줄 인근)에서 우클릭 시 메뉴 하단이 잘리던 결함 해결 (BoundingRect 기반 동적 상향 클램핑 및 뷰포트 오버플로 방어 적용)
//             **2026-09-04** — [ONRIVI-KNOWLEDGE-UI-FIX] 파일 탐색기 우클릭 컨텍스트 메뉴 내 '지식문서 등록(⭐)' 텍스트 라벨 누락 결함 복원 (별 아이콘만 노출되던 현상 해결)
//             **2026-09-04** — [ONRIVI-KNOWLEDGE-ENGINE-002.1] 탐색기 우클릭 컨텍스트 메뉴에 '지식 분석 상세 (KUI-010)' 및 '지식 허브 열기' 원터치 진입점 연동
//             **2026-09-04** — [ONRIVI-KNOWLEDGE-DETAIL-001] 지식 베이스 등록 완료 시 단순 토스트 대신 상세 분석 결과(분할 청크, 행 범위, 키워드, 지식 태그, 검색어) 모달(knowledge:show-detail) 자동 팝업 연동
//             **2026-09-04** — [ONRIVI-KNOWLEDGE-ENGINE-002.1] 파일 탐색기 우클릭 컨텍스트 메뉴에 지식 베이스 등록(⭐) 및 등록 완료(🧠) 뱃지 연동
//             **2026-09-02** — 파일 노드 우클릭 시에도 부모 폴더를 대상으로 붙여넣기(Paste)를 직접 수행할 수 있도록 컨텍스트 메뉴 바인딩 개선
//             **2026-09-02** — 탐색기 선택 하이라이트 왼쪽 세로선(border-l) 제거, 선택 노드 폰트 색상을 고대비 선명한 검정/흰색(text-zinc-950 dark:text-white font-extrabold)으로 강화 및 폴더/파일 경로 정규화 기반 정확한 단독 선택 동기화
//             **2026-09-02** — [ONRIVI-DS-SYSTEM-002 v5.0] LINE Design System (LDSG) 표준 적용 (LINE Green #06C755 활성 노드 하이라이트 및 LineSeed 폰트)
//             **2026-08-27** — 탐색기 새로고침/폴더 생성 시 전체 트리가 다시 패치되어 모든 노드가 강제 닫힘(Collapse) 상태로 초기화되어 파일/폴더 위치를 매번 다시 찾아야 하는 불편을 해결하기 위해, localStorage(onrivi_expanded_paths) 기반의 폴더 펼침(isOpen) 상태 영구 보존 및 동기화 구현하고 마운트 시 열린 폴더의 자식 노드 목록을 자동 비동기 지연 로딩(onLazyLoad) 복원하도록 이펙트 보완 및 부모 리팩토링 시 빈 자식 props 주입에 의해 기존 지연 로딩 데이터가 깡통(length=0)으로 덮어써져 사라지는 리셋 버그 차단 가드 적용; 파일/폴더 삭제 시 확인 모달 타이틀("폴더 삭제"/"파일 삭제") 및 메시지 본문("폴더를 정말 삭제하시겠습니까?"/"파일을 정말 삭제하시겠습니까?")을 노드 종류에 맞춰 분기하여 정확하게 표시하도록 갱신; 이름 변경(Rename) 시 팝업 프롬프트 제목 및 실패 토스트 피드백 문구에서 폴더와 파일을 명확히 분리("폴더의 새 이름을 입력하세요"/"파일의 새 이름을 입력하세요")하여 노출하도록 리펙토링; **2026-08-23** — 폴더 생성 후 부모 폴더 자동 열기(setIsOpen) 및 file:select-node 이벤트로 신규 폴더 자동 선택 구현; 액션 버튼 이모지(📖📁✏❌) → lucide-react SVG(FilePlus/FolderPlus/Pencil/Trash2) 14px로 전면 교체 및 기능별 호버 컬러 적용; **2026-08-12** — 탐색기 아이템 텍스트 폰트 크기를 상태바와 동일한 12px 굵은 글씨로 변경 및 에디터 전용 fontFamily 지정, 아이콘 크기 배율 최적화; **2026-06-19** — 드래그 이동 시 열린 탭 보호: openTabPaths prop으로 열린 파일/포함 폴더 이동 차단; onRefreshAll prop으로 이동 후 전체 트리 갱신; **2026-07-06** — 파일명 변경 시 openFile 대신 file:tab-renamed 이벤트 발송으로 새 탭 생성 버그 수정, 탐색기 refresh 이벤트 시스템 추가
// 🔗 @CALLS : FileTreeItem (재귀), PromptModal, getFileIcon
// ====================================================================
const FileTreeItem = ({ 
  node: rawNode, parentHandle, level, openFile, previewMode, setPreviewMode, currentFileName, currentFilePath, workspaceType, refreshParent, onRefreshAll, openTabPaths,
  askConfirm, siblings,
  isMergeMode = false, selectedMergeNodes = [], toggleMergeNodeSelect, onLazyLoad, isRestrictedUser = false
}: FileTreeItemProps) => {
  const { showToast } = useToast();

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
          console.error("폴더 자동 갱신 실패", err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
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
  // 🛡️ @GUARD : 디렉토리가 아니거나 onLazyLoad 미존재 시 실행 차단
  // 🚨 @PATCH : 없음
  // 🔗 @CALLS : onLazyLoad
  // ====================================================================
  const refreshThisDirectory = async () => {
    if (node.kind !== 'directory' || !onLazyLoad) return;
    setIsLoading(true);
    try {
      const children = await onLazyLoad(node);
      setLocalChildren(children);
    } catch (err) {
      msg.warn('폴더 재갱신 실패', err);
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
    // 🚀 [비어있지 않은 폴더 삭제 방지] 클라이언트 상태 기반 1차 방어
    if (node.kind === 'directory') {
      const rawChildren = localChildren !== null ? localChildren : node.children;
      if (rawChildren && rawChildren.length > 0) {
        showToast("하위 폴더나 파일이 존재하는 폴더는 삭제할 수 없습니다. 내용을 먼저 비워주세요.", "warning");
        return;
      }
    }

    const isDir = node.kind === 'directory';
    askConfirm({
      title: isDir ? "폴더 삭제" : "파일 삭제",
      message: isDir 
        ? `'${node.name}' 폴더를 정말 삭제하시겠습니까?` 
        : `'${node.name}' 파일을 정말 삭제하시겠습니까?`,
      isDanger: true,
      onConfirm: async () => {
        try {
          if (workspaceType === 'browser') {
            if (node.handle) {
              // 🚀 [안전장치] recursive: true를 제거하여 하위 파일이 있을 때 삭제 실패를 유도함
              await parentHandle.removeEntry(node.name);
              refreshParent();
              setTimeout(() => refreshParent(), 300); // 🛡️ 지연 인덱싱 동기화 갱신
            } else if (node.path) {
              // LocalStorage 가상 파일/폴더 삭제
              vfsDelete(node.path);
              refreshParent();
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
            setTimeout(() => refreshParent(), 300);
          }
          if (currentFileName === node.name) {
            openFile(null); 
          }
          // 🚀 삭제된 파일/폴더와 연관된 탭들을 닫도록 이벤트 발송
          if (node.path) {
            window.dispatchEvent(new CustomEvent('file:tab-deleted', { detail: { deletedPath: node.path } }));
          }
        } catch(e: any) { 
          const errStr = e.message || e.toString();
          if (errStr.includes('not empty') || errStr.includes('ENOTEMPTY') || errStr.includes('directory not empty')) {
            showToast("하위 폴더나 파일이 존재하는 폴더는 삭제할 수 없습니다. 내용을 먼저 비워주세요.", 'error');
          } else {
            showToast("삭제 실패: " + errStr, 'error'); 
          }
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

  // 🧠 지식 베이스 등록 여부 추적 (경로 정규화 및 실시간 동기화)
  const [isKnowledgeRegistered, setIsKnowledgeRegistered] = useState(false);
  useEffect(() => {
    if (!isMarkdown) return;
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
  }, [node.path, node.name, isMarkdown]);

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
            ? 'bg-[#06C755]/15 dark:bg-[#06C755]/25 text-zinc-950 dark:text-white font-extrabold shadow-sm' 
            : isDragOver
              ? 'bg-[#06C755]/20 scale-[1.01]'
              : 'text-[#2A2A2A] dark:text-[#D4D4D4] hover:bg-zinc-200/80 dark:hover:bg-zinc-700/60 hover:text-black dark:hover:text-white hover:font-bold hover:shadow-2xs'
        }`}
        style={{ 
          paddingLeft: `${(level * 12) + 8}px`,
          fontFamily: "'D2Coding', 'JetBrains Mono', 'LineSeed', 'Pretendard', Consolas, 'Malgun Gothic', '맑은 고딕', monospace"
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
        
        <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0 origin-center">
          {getFileIcon(node, isSelected)}
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
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-white/5 w-full text-left transition-colors"
                      >
                        <img src="/icons/icon-file-plus.png" width={16} height={16} alt="새 파일" className="opacity-90" />
                        <span>새 파일</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setContextMenu(null); handleCreateFolder(e); }}
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-white/5 w-full text-left transition-colors"
                      >
                        <img src="/icons/icon-folder-plus.png" width={16} height={16} alt="새 폴더" className="opacity-90" />
                        <span>새 폴더</span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); setContextMenu(null); handleRename(e); }}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-amber-50 dark:hover:bg-white/5 w-full text-left transition-colors"
                  >
                    <img src="/icons/icon-rename.png" width={16} height={16} alt="이름 변경" className="opacity-90" />
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
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-indigo-50 dark:hover:bg-white/5 w-full text-left transition-colors"
                  >
                    <img src="/icons/icon-copy.png" width={16} height={16} alt="복사하기" className="opacity-90" />
                    <span>복사하기</span>
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
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-indigo-50 dark:hover:bg-white/5 w-full text-left transition-colors"
                  >
                    <img src="/icons/icon-paste.png" width={16} height={16} alt="붙여넣기" className="opacity-90" />
                    <span>붙여넣기</span>
                  </button>
                  <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (!isOpenInTab) {
                        setContextMenu(null); 
                        handleDelete(e); 
                      }
                    }}
                    disabled={isOpenInTab}
                    className={`flex items-center gap-2 px-3 py-1.5 w-full text-left transition-colors ${
                      isOpenInTab 
                        ? 'opacity-40 cursor-not-allowed' 
                        : 'hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400'
                    }`}
                    title={isOpenInTab ? "탭에서 열려있는 파일은 삭제할 수 없습니다" : "삭제"}
                  >
                    <img src="/icons/icon-delete.png" width={16} height={16} alt="삭제" className={`opacity-90 ${isOpenInTab ? 'grayscale' : ''}`} />
                    <span>삭제</span>
                  </button>

                  {/* 🧠 지식 베이스 등록 버튼 (마크다운 전용) */}
                  {node.kind === 'file' && isMarkdown && (() => {
                    const resourceFolder = (
                      loadSecureData<string>('resourceFolder') ||
                      (typeof window !== 'undefined' ? localStorage.getItem('resourceFolder') : '') ||
                      (() => {
                        try {
                          const raw = typeof window !== 'undefined' ? localStorage.getItem('onrivi_settings') : null;
                          return raw ? JSON.parse(raw).resourceFolder || '' : '';
                        } catch { return ''; }
                      })() ||
                      ''
                    ).trim();

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
                                const myPath = node.path || node.name;
                                try {
                                  showToast(`[${node.name}] 지식 상세 분석을 불러오는 중...`, 'info');
                                  const res = await fetch(`/api/knowledge/detail?filePath=${encodeURIComponent(myPath)}&resourceFolder=${encodeURIComponent(resourceFolder)}`);
                                  const data = await res.json();
                                  if (data.ok && data.detail) {
                                    window.dispatchEvent(new CustomEvent('knowledge:show-detail', { detail: data.detail }));
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
                                const myPath = node.path || node.name;
                                if (!confirm(`'${node.name}' 문서를 지식 베이스에서 해제하시겠습니까?`)) return;

                                try {
                                  showToast(`[${node.name}] 지식 문서 해제를 진행합니다...`, 'info');
                                  const res = await fetch('/api/knowledge/delete', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      filePath: myPath,
                                      resourceFolder,
                                      geminiApiKey,
                                      planCode,
                                    }),
                                  });
                                  const data = await res.json();
                                  if (!res.ok || !data.ok) {
                                    throw new Error(data.message || '지식 문서 해제에 실패했습니다.');
                                  }

                                  // 로컬 캐시에서 제거
                                  try {
                                    const list = JSON.parse(localStorage.getItem('onrivi_registered_knowledge_docs') || '[]');
                                    const updated = list.filter((p: string) => p !== myPath && p !== node.name);
                                    localStorage.setItem('onrivi_registered_knowledge_docs', JSON.stringify(updated));
                                  } catch {}

                                  showToast(`[${node.name}] 지식 문서 등록이 성공적으로 해제되었습니다.`, 'info');
                                  window.dispatchEvent(new CustomEvent('knowledge:updated'));
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
                              if (!guard.canUseKnowledge) {
                                showToast(guard.blockMessage || '지식 엔진을 사용할 수 없습니다.', 'warning');
                                window.dispatchEvent(new CustomEvent('app:dispatch-command', { detail: 'SETTINGS' }));
                                return;
                              }

                              try {
                                showToast(`[${node.name}] 지식 베이스 등록을 시작합니다...`, 'info');
                                let content = '';
                                if (node.handle?.getFile) {
                                  const file = await node.handle.getFile();
                                  content = await file.text();
                                } else if ((window as any).electronAPI?.readFile && node.path) {
                                  content = await (window as any).electronAPI.readFile(node.path);
                                }

                                if (!content.trim()) {
                                  showToast('파일 내용이 비어있어 등록할 수 없습니다.', 'warning');
                                  return;
                                }

                                // Electron 또는 웹 지식 서비스 호출
                                let registeredDetail: any = null;
                                if ((window as any).electronAPI?.indexKnowledgeDocument) {
                                  const deskRes = await (window as any).electronAPI.indexKnowledgeDocument({
                                    filePath: node.path || node.name,
                                    fileContent: content,
                                    title: node.name.replace(/\.md$/i, ''),
                                    resourceFolder,
                                    geminiApiKey,
                                    planCode,
                                  });
                                  if (deskRes?.detail) registeredDetail = deskRes.detail;
                                } else {
                                  const res = await fetch('/api/knowledge/index', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      filePath: node.path || node.name,
                                      fileContent: content,
                                      title: node.name.replace(/\.md$/i, ''),
                                      resourceFolder,
                                      geminiApiKey,
                                      planCode,
                                      aiModelName,
                                    }),
                                  });
                                  const data = await res.json();
                                  if (!res.ok || !data.ok) {
                                    console.error('[지식 등록 서버 에러 응답]:', data);
                                    throw new Error(data.message || '서버 지식 등록에 실패했습니다.');
                                  }
                                  if (data.detail) registeredDetail = data.detail;
                                }

                                // 🧠 클라이언트 로컬 스토리지에 등록 상태 보존
                                try {
                                  const myPath = node.path || node.name;
                                  const list = JSON.parse(localStorage.getItem('onrivi_registered_knowledge_docs') || '[]');
                                  if (!list.includes(myPath)) {
                                    list.push(myPath);
                                    localStorage.setItem('onrivi_registered_knowledge_docs', JSON.stringify(list));
                                  }
                                } catch {}

                                window.dispatchEvent(new CustomEvent('knowledge:updated'));

                                // 🧠 상세 분석 결과 모달 팝업 또는 토스트 피드백
                                if (registeredDetail) {
                                  window.dispatchEvent(new CustomEvent('knowledge:show-detail', { detail: registeredDetail }));
                                } else {
                                  showToast(`[${node.name}] 지식 베이스에 성공적으로 등록되었습니다! 📗`, 'success');
                                }
                              } catch (err: any) {
                                showToast(`지식 등록 실패: ${err?.message || '알 수 없는 오류'}`, 'error');
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
