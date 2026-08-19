// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import GlobalSearch from './GlobalSearch';
import FileTreeItem from './FileTreeItem';
import { FileNode } from '@/lib/indexedDbHelper';
import { vfsRename } from '@/lib/virtualFileSystem';
import { getApiUrl } from '@/lib/apiUrlBuilder';
import PromptModal from '@/components/PromptModal';
import { Plus, FolderPlus, RefreshCw } from 'lucide-react';
import { msg } from '@/lib/systemMessages';
import { useUIStore } from '@/store/useUIStore';

import { useEditorContext } from '@/context/EditorContext';
import { BROWSER_STORAGE_NAME } from '@/constants/storage';

// ====================================================================
// 📊 [OMD-FILE-LeftSidebar-0007] LeftSidebar ➔ LeftSidebar
// 🎯 @KICK  : 좌측 사이드바 - 탐색기(파일트리), 개요(TOC), 검색 탭 제공
// 🛡️ @GUARD : isSidebarOpen false 시 null 반환; 파일 리스트 필터링으로 .md 확장자만 표시
// 🚨 @PATCH : **2026-08-12** — 개요(TOC) 클릭 시 preview/both(분할) 모드에 맞춰 스크롤 동작을 이원화하고 하위 수준 존재 여부와 무관하게 정상 스크롤되도록 보완; H3 이하의 뎁스 목차가 기본적으로 접힌 채 렌더링에서 누락되던 조건 버그(undefined!==false)를 ===true 접힘으로 전면 교정하여 전체 펼침 구현; **2026-08-12** — 미리보기 스크롤 시 좌측 개요(TOC) 탭 목록도 활성 헤딩 위치를 자동으로 추적하여 뷰포트 내로 자동 스크롤(Auto-scroll Follow)되는 지능형 연동 기능 구현; **2026-08-12** — 개요(TOC) 클릭 시 에디터-미리보기 간의 양방향 스크롤 동기화 간섭을 일시 차단하는 락킹(isScrollingRef) 루틴을 적용하고 미리보기 컨테이너(previewRef) 내에서 부드러운 스크롤(scrollTo)이 동작하도록 개선; **2026-08-12** — 사이드바 배경을 라이트모드에 최적화된 고급스러운 아이스 블루 및 실버 톤 그라데이션(linear-gradient)으로 교체하고 탭 헤더 및 워크스페이스 바를 반투명 처리하는 프리미엄 디자인 리뉴얼 패치 적용; **2026-08-12** — 사이드바 폰트 크기를 상태바와 동일하게 12px 굵은 글씨로 통일 적용 및 탐색기 폴더 명칭을 '작업장 실폴더'로 명명 변경; **2026-07-05** — MainEditorApp의 Props 의존성을 전면 제거하고 EditorContext 참조 방식으로 아키텍처 완전 개편 및 ts-nocheck 우회 적용; **2026-06-19** — openTabPaths prop 추가; **2026-07-06** — 탭 헤더 바로 아래 항상 표시되는 워크스페이스 선택 바 추가: FileTreeItem으로 전달하여 드래그 이동 시 열린 파일 보호
// 🔗 @CALLS : fetchDrives, handleLazyLoad, onPromptConfirm, onFileOpenAndJump, FileTreeItem, GlobalSearch, PromptModal
// ====================================================================
export default function LeftSidebar() {
  const {
    isSearchOpen, setIsSearchOpen,
    content, currentFileName, setCurrentFileName,
    setCurrentFileNode, setContent, lastSavedContentRef,
    editorRef, previewRef, toc = [], scrollToLine,
    isScrollingRef, scrollTimeoutRef, // 💡 동기식 스크롤 락 제어용 refs 추가
    showToast, fileList, rootFolder, resourceFolder, resourceFolderHandle, workspaceType,
    openFile, currentFileNode, refreshFileList, openTabPaths = [],
    askConfirm, isMergeMode = false, selectedMergeNodes = [],
    toggleMergeNodeSelect, onOpenMergeModal,
    onSelectRootFolder, onRestoreFolder, previewMode, setPreviewMode,
    tabs = [], licenseStatus,
    setIsMergeMode, setSelectedMergeNodes,
    geminiApiKey, aiModelName
  } = useEditorContext();

  const isRestrictedUser = false;
  const onCancelMerge = () => {
    if (setIsMergeMode) setIsMergeMode(false);
    if (setSelectedMergeNodes) setSelectedMergeNodes([]);
  };

  const { 
    isSidebarOpen, setIsSidebarOpen, 
    sidebarWidth, setSidebarWidth, 
    sidebarTab, setSidebarTab, 
    isDarkMode 
  } = useUIStore();
  
  const [drives, setDrives] = useState<FileNode[]>([]);
  const [isDrivesLoading, setIsDrivesLoading] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [collapsedH1s, setCollapsedH1s] = useState<Record<string, boolean>>({});
  const [isImporting, setIsImporting] = useState(false);
  // TOC 활성 헤딩 상태
  const [activeTocId, setActiveTocId] = useState<string>('');

  const [isDragOverRoot, setIsDragOverRoot] = useState(false);

  const handleDragOverRoot = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverRoot(true);
  };

  const handleDragLeaveRoot = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverRoot(false);
  };

  const dispatchMovedEvent = (srcPath: string, tgtPath: string, newPath?: string, sourceName?: string, newHandle?: any) => {
    const normSrc = srcPath.replace(/\\/g, '/');
    const normTgt = tgtPath.replace(/\\/g, '/');
    const srcParentPath = normSrc.includes('/') ? normSrc.substring(0, normSrc.lastIndexOf('/')) : '';
    const tgtParentPath = normTgt.includes('/') ? normTgt.substring(0, normTgt.lastIndexOf('/')) : '';
    
    window.dispatchEvent(new CustomEvent('file:moved', {
      detail: { sourceParentPath: srcParentPath, targetParentPath: tgtParentPath, targetPath: normTgt }
    }));

    if (newPath && sourceName) {
      window.dispatchEvent(new CustomEvent('file:tab-renamed', {
        detail: { oldPath: srcPath, newPath, newName: sourceName, newHandle }
      }));
    }
  };

  const handleDropRoot = async (e: React.DragEvent) => {
    if (isRestrictedUser) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverRoot(false);

    const sourcePath = e.dataTransfer.getData("sourcePath");
    const sourceName = e.dataTransfer.getData("sourceName");
    const draggedNode = typeof window !== 'undefined' ? (window as any)._draggedNode : null;
    const draggedNodeParent = typeof window !== 'undefined' ? (window as any)._draggedNodeParentHandle : null;
    const sourceParentPath = typeof window !== 'undefined' ? (window as any)._draggedNodeParentPath : null;

    const actualRootPath = (workspaceType === 'local' ? rootFolder?.name : rootFolder?.path) || '';

    if (!sourcePath || sourcePath === actualRootPath) return;
    // 이미 최상위(루트) 폴더에 있는 파일이면 이동하지 않음
    if (sourceParentPath === actualRootPath) return;

    try {
      if (workspaceType === 'local') {
        const rootPath = actualRootPath;
        const newPath = rootPath ? `${rootPath}\\${sourceName}` : sourceName;
        const api = (window as any).electronAPI;
        if (api?.renameFile) {
          await api.renameFile(sourcePath, newPath);
          showToast(`'${sourceName}' 루트로 이동 완료`, 'success');
          dispatchMovedEvent(sourcePath, rootPath, newPath, sourceName);
          await refreshFileList();
          window.dispatchEvent(new CustomEvent('file:refresh-all-directories'));
        } else {
          const res = await fetch(getApiUrl('/api/rename'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ oldPath: sourcePath, newPath })
          });
          if (res.ok) {
            showToast(`'${sourceName}' 루트로 이동 완료`, 'success');
            dispatchMovedEvent(sourcePath, rootPath, newPath, sourceName);
            await refreshFileList();
            window.dispatchEvent(new CustomEvent('file:refresh-all-directories'));
          }
        }
      } else if (workspaceType === 'browser') {
        if (draggedNode && draggedNode.handle && rootFolder?.handle) {
          const targetDirHandle = rootFolder.handle as FileSystemDirectoryHandle;
          let finalNewHandle: any = null;

          if (draggedNode.kind === 'file') {
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
          showToast(`'${draggedNode.name}' 루트로 이동 완료`, 'success');
          const newPath = rootFolder.path ? `${rootFolder.path}/${draggedNode.name}` : draggedNode.name;
          dispatchMovedEvent(sourcePath, rootFolder.path || '', newPath, draggedNode.name, finalNewHandle);
          await refreshFileList();
          window.dispatchEvent(new CustomEvent('file:refresh-all-directories'));
        } else if (sourcePath) {
          // LocalStorage 루트로 이동
          const oldPath = sourcePath;
          const normalizedPath = oldPath.replace(/\\/g, '/');
          const lastSlashIndex = normalizedPath.lastIndexOf('/');
          const filename = lastSlashIndex !== -1 ? normalizedPath.substring(lastSlashIndex + 1) : normalizedPath;
          const newPath = rootFolder?.path ? `${rootFolder.path}/${filename}` : filename;
          
          vfsRename(oldPath, newPath);
          showToast(`'${filename}' 루트로 이동 완료`, 'success');
          dispatchMovedEvent(oldPath, rootFolder?.path || '', newPath, filename);
          await refreshFileList();
          window.dispatchEvent(new CustomEvent('file:refresh-all-directories'));
        }
      }
    } catch (e) {
      showToast("이동 실패: " + e, 'error');
    }
  };

  useEffect(() => {
    const previewContainer = previewRef?.current;
    if (!previewContainer) return;

    let rafId: number;
    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (!toc || toc.length === 0) return;
        
        let foundId = '';
        const containerTop = previewContainer.getBoundingClientRect().top;

        // 아래에서 위로 스크롤하며, 화면 상단에 가장 가까운 헤딩을 찾음
        for (let i = toc.length - 1; i >= 0; i--) {
          const el = document.getElementById(toc[i].id);
          if (el) {
            const rect = el.getBoundingClientRect();
            // 약간의 오프셋(예: 150px)을 주어 제목이 상단에 닿기 직전에 하이라이트되도록 함
            if (rect.top - containerTop <= 150) {
              foundId = toc[i].id;
              break;
            }
          }
        }
        
        // 스크롤이 맨 위에 있어서 어떤 헤딩도 조건을 만족하지 않으면 첫 번째 헤딩 활성화
        if (!foundId && toc.length > 0) {
          foundId = toc[0].id;
        }

        if (foundId && foundId !== activeTocId) {
          setActiveTocId(foundId);

          // 활성화된 헤딩의 부모들을 모두 펼침 (Auto-expand)
          const activeIndex = toc.findIndex((t: any) => t.id === foundId);
          if (activeIndex >= 0) {
            const activeLevel = toc[activeIndex].level;
            let parentH1Id = '';
            let parentH2Id = '';
            let parentH3Id = '';
            for (let i = activeIndex - 1; i >= 0; i--) {
              const item = toc[i];
              if (item.level === 1 && !parentH1Id) parentH1Id = item.id;
              if (item.level === 2 && !parentH2Id && !parentH1Id) parentH2Id = item.id;
              if (item.level === 3 && !parentH3Id && !parentH2Id && !parentH1Id) parentH3Id = item.id;
              if (parentH1Id && parentH2Id && parentH3Id) break;
            }

            setCollapsedH1s(prev => {
              const next = { ...prev };
              let changed = false;

              if (parentH1Id && next[parentH1Id] === true) {
                next[parentH1Id] = false;
                changed = true;
              }
              if (parentH2Id && next[parentH2Id] !== false) {
                next[parentH2Id] = false;
                changed = true;
              }
              if (parentH3Id && next[parentH3Id] !== false) {
                next[parentH3Id] = false;
                changed = true;
              }

              if (activeLevel === 1 && next[foundId] === true) {
                next[foundId] = false;
                changed = true;
              } else if (activeLevel >= 2 && activeLevel <= 3 && next[foundId] !== false) {
                next[foundId] = false;
                changed = true;
              }

              return changed ? next : prev;
            });
          }
        }
      });
    };

    previewContainer.addEventListener('scroll', handleScroll, { passive: true });
    // 초기 렌더링 시 스크롤 위치 계산
    handleScroll();

    return () => {
      previewContainer.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [toc, previewRef, activeTocId]);

  const tocContainerRef = useRef<HTMLDivElement>(null); // 💡 개요 스크롤 동기화용 ref

  // 📝 활성화된 개요(TOC) 항목이 화면 밖으로 벗어날 경우 개요 탭 목록 컨테이너 자동 스크롤 동기화
  useEffect(() => {
    if (!activeTocId || sidebarTab !== 'toc' || !tocContainerRef.current) return;

    const activeItem = tocContainerRef.current.querySelector(`#toc-item-${activeTocId}`);
    if (activeItem) {
      activeItem.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest' // 💡 화면에 이미 보이면 대기, 화면 밖 이탈 시에만 부드럽게 복구
      });
    }
  }, [activeTocId, sidebarTab]);

  // 📝 루트 디렉토리 생성을 위한 Prompt 상태 제어 및 비동기 처리
  const [promptConfig, setPromptConfig] = useState<{
    isOpen: boolean;
    title: string;
    defaultValue: string;
    type: 'createFile' | 'createFolder' | null;
    error?: string;
  }>({ isOpen: false, title: "", defaultValue: "", type: null, error: "" });

  const importFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleTriggerImport = () => {
      importFileInputRef.current?.click();
    };
    window.addEventListener('TRIGGER_IMPORT', handleTriggerImport);
    return () => window.removeEventListener('TRIGGER_IMPORT', handleTriggerImport);
  }, []);

// ====================================================================
// 📊 [OMD-FILE-LeftSidebar-0006] LeftSidebar ➔ onPromptConfirm
// 🎯 @KICK  : PromptModal 확인 시 파일/폴더 생성 (브라우저/로컬/LocalStorage VFS 대응)
// 🛡️ @GUARD : 이름 중복 체크 후 중복 시 에러 메시지 재표시
// 🚨 @PATCH : 없음
// 🔗 @CALLS : refreshFileList, openFile, vfsCreateFile, vfsCreateFolder, fetch, api.createFile, api.createFolder
// ====================================================================
  const onPromptConfirm = async (name: string) => {
    const type = promptConfig.type;
    setPromptConfig({ ...promptConfig, isOpen: false });
    if (!name) return;

    const rootPath = rootFolder?.name || "";

    if (type === 'createFile') {
      const finalName = (name.toLowerCase().endsWith('.md') || name.toLowerCase().endsWith('.bib')) ? name : `${name}.md`;
      
      // 중복 체크
      if (fileList.some((c: any) => c.name.toLowerCase() === finalName.toLowerCase())) {
        setPromptConfig(prev => ({ ...prev, error: "이미 같은 이름의 파일이 존재합니다." }));
        return;
      }

      try {
        setPromptConfig(prev => ({ ...prev, isOpen: false, error: '' }));
        if (workspaceType === 'browser') {
          if (rootFolder?.handle) {
            const handle = await rootFolder.handle.getFileHandle(finalName, { create: true });
            await refreshFileList();
            window.dispatchEvent(new CustomEvent('file:refresh-all-directories'));
            openFile({ name: finalName, kind: 'file', handle, path: finalName }, rootFolder?.handle);
          } else {
            // LocalStorage 가상 파일 생성
            const { vfsCreateFile } = await import('@/lib/virtualFileSystem');
            vfsCreateFile("", finalName);
            await refreshFileList();
            window.dispatchEvent(new CustomEvent('file:refresh-all-directories'));
            openFile({ name: finalName, kind: 'file', path: finalName });
          }
        } else {
          const api = (window as any).electronAPI;
          if (api?.createFile) {
            const result = await api.createFile(rootPath, finalName);
            if (result.success) {
              await refreshFileList();
              window.dispatchEvent(new CustomEvent('file:refresh-all-directories'));
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
              await refreshFileList();
              window.dispatchEvent(new CustomEvent('file:refresh-all-directories'));
              openFile({ name: finalName, kind: 'file', path: data.path });
            }
          }
        }
      } catch(e) { showToast("생성 실패: " + e, 'error'); }
    } else if (type === 'createFolder') {
      // 중복 체크
      if (fileList.some((c: any) => c.name.toLowerCase() === name.toLowerCase())) {
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
            const { vfsCreateFolder } = await import('@/lib/virtualFileSystem');
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
        await refreshFileList();
        window.dispatchEvent(new CustomEvent('file:refresh-all-directories'));
      } catch(e) { showToast("생성 실패: " + e, 'error'); }
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      showToast('파일에서 텍스트를 추출 중입니다...', 'info');
      const imageSaveCallback = async (base64Data: string, contentType: string) => {
        const ext = contentType.split('/')[1] || 'png';
        let imgName = `img_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
        try {
          const binaryString = atob(base64Data);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i);
          }
          const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 12);
          imgName = `img_${hashHex}.${ext}`;
        } catch (e) {
          console.warn('해시 생성 실패, 기본 시간 기반 이름 사용', e);
        }
        const assetsDir = 'assets';
        const imgPath = `${assetsDir}/${imgName}`;

        if (workspaceType === 'browser') {
          if (resourceFolderHandle) {
            const mediaDir = await resourceFolderHandle.getDirectoryHandle('media', { create: true });
            const fileHandle = await mediaDir.getFileHandle(imgName, { create: true });
            const writable = await fileHandle.createWritable();
            const res = await fetch(`data:${contentType};base64,${base64Data}`);
            const blob = await res.blob();
            await writable.write(blob);
            await writable.close();
            return `/media/${imgName}`;
          } else if (rootFolder?.handle) {
            const assetsHandle = await rootFolder.handle.getDirectoryHandle(assetsDir, { create: true });
            const fileHandle = await assetsHandle.getFileHandle(imgName, { create: true });
            const writable = await fileHandle.createWritable();
            const res = await fetch(`data:${contentType};base64,${base64Data}`);
            const blob = await res.blob();
            await writable.write(blob);
            await writable.close();
            return `/${imgPath}`;
          } else {
            const { vfsCreateFile, vfsWriteFile } = await import('@/lib/virtualFileSystem');
            vfsCreateFile("", imgPath);
            vfsWriteFile(imgPath, base64Data); // Assuming VFS supports base64 string
            return `/${imgPath}`;
          }
        } else {
          // Electron 데스크톱 환경
          const api = (window as any).electronAPI;
          if (api && api.saveImage) {
            const targetFolder = resourceFolder ? resourceFolder + '\\media' : (rootFolder?.name || "");
            const saveResult = await api.saveImage(targetFolder, base64Data, imgName);
            if (saveResult && saveResult.success) {
              if (saveResult.mediaPath) {
                return saveResult.mediaPath;
              } else if (saveResult.absolutePath) {
                return `media://local/serve?url=${encodeURIComponent(saveResult.absolutePath)}`;
              }
            }
          }
        }
        
        // 만약 파일 저장을 건너뛰었다면 (Electron API 한계 등), 그냥 HTML 상에 base64로 직접 내장 (Data URI 반환)
        return `data:${contentType};base64,${base64Data}`;
      };

      const { convertFileToMarkdown } = await import('@/lib/fileImporter');
      let markdown = await convertFileToMarkdown(file, imageSaveCallback);

      const extension = file.name.split('.').pop()?.toLowerCase();
      const isAlreadyTextOrMd = ['md', 'markdown', 'txt'].includes(extension || '');
      let skipAiFormatting = false;

      if (!isAlreadyTextOrMd) {
        const MAX_CHARS = 30000;
        if (markdown.length > MAX_CHARS) {
          // 💡 [초과 크기 폴백] 30,000자 초과 시 전체 에러 대신 AI 구조화만 스킵 처리
          skipAiFormatting = true;
          showToast('문서 내용이 너무 커서 AI 마크다운 변환 없이 원본 문서 그대로 신속히 가져옵니다.', 'warning');
        }
        if (markdown.trim().length === 0) {
          throw new Error('문서에서 텍스트를 추출할 수 없습니다. 이미지로만 구성된 문서(스캔본 등)이거나 내용이 비어있습니다.');
        }
      }

      if (geminiApiKey && !isAlreadyTextOrMd && !skipAiFormatting) {
        showToast('AI가 문서를 분석하여 마크다운으로 구조화 중입니다... (최대 30초 소요)', 'info');
        try {
          const { formatRawTextToMarkdown } = await import('@/lib/aiFormatter');
          markdown = await formatRawTextToMarkdown(markdown, geminiApiKey, aiModelName || 'gemini-1.5-pro');
        } catch (aiError: any) {
          console.warn('AI 마크다운 구조화 실패, 원본 텍스트로 대체합니다:', aiError);
          const errMsg = aiError?.message || String(aiError);
          if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('Quota')) {
            showToast('AI API 호출 제한(429 Quota Exceeded)으로 인해 AI 포맷팅 없이 원본 문서 내용만 그대로 가져옵니다.', 'warning');
          } else {
            showToast('AI 구조화 처리에 실패하여 원본 문서 내용으로 가져옵니다.', 'warning');
          }
        }
      }
      const originalName = file.name.split('.').slice(0, -1).join('.') || file.name;
      let finalName = `${originalName}.md`;

      let counter = 1;
      while (fileList.some((c: any) => c.name.toLowerCase() === finalName.toLowerCase())) {
        finalName = `${originalName}_${counter}.md`;
        counter++;
      }

      const rootPath = rootFolder?.name || "";

      if (workspaceType === 'browser') {
        if (rootFolder?.handle) {
          const handle = await rootFolder.handle.getFileHandle(finalName, { create: true });
          const writable = await handle.createWritable();
          await writable.write(markdown);
          await writable.close();
          await refreshFileList();
          window.dispatchEvent(new CustomEvent('file:refresh-all-directories'));
          openFile({ name: finalName, kind: 'file', handle, path: finalName }, rootFolder?.handle);
        } else {
          const { vfsCreateFile, vfsWriteFile } = await import('@/lib/virtualFileSystem');
          vfsCreateFile("", finalName);
          vfsWriteFile(finalName, markdown);
          await refreshFileList();
          window.dispatchEvent(new CustomEvent('file:refresh-all-directories'));
          openFile({ name: finalName, kind: 'file', path: finalName });
        }
      } else {
        const api = (window as any).electronAPI;
        if (api?.createFile && api?.saveFile) {
          const result = await api.createFile(rootPath, finalName);
          if (result.success) {
            await api.saveFile(result.path, markdown);
            await refreshFileList();
            window.dispatchEvent(new CustomEvent('file:refresh-all-directories'));
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
            await fetch(getApiUrl('/api/save-file'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ path: data.path, content: markdown })
            });
            await refreshFileList();
            window.dispatchEvent(new CustomEvent('file:refresh-all-directories'));
            openFile({ name: finalName, kind: 'file', path: data.path });
          } else {
            throw new Error(`파일 생성 API 호출 실패: ${res.status}`);
          }
        }
      }
      showToast(`'${file.name}' 문서를 성공적으로 가져왔습니다.`, 'success');
    } catch (error: any) {
      showToast(error.message || '파일을 가져오는 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsImporting(false);
    }
    
    // input 초기화
    e.target.value = '';
  };

// ====================================================================
// 📊 [OMD-FILE-LeftSidebar-0005] LeftSidebar ➔ useEffect (isDesktop)
// 🎯 @KICK  : 클라이언트 환경이 데스크톱(electron)인지 감지하여 isDesktop 상태 설정
// 🛡️ @GUARD : 없음
// 🚨 @PATCH : 없음
// 🔗 @CALLS : setIsDesktop
// ====================================================================
  useEffect(() => {
    setIsDesktop(typeof window !== 'undefined' && !!(window as any).electronAPI);
  }, []);

// ====================================================================
// 📊 [OMD-FILE-LeftSidebar-0004] LeftSidebar ➔ fetchDrives
// 🎯 @KICK  : electronAPI 또는 REST API를 통해 시스템 드라이브 목록 조회
// 🛡️ @GUARD : api 존재 여부에 따라 분기 처리
// 🚨 @PATCH : 없음
// 🔗 @CALLS : api.getDrives, fetch, msg.warn
// ====================================================================
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

// ====================================================================
// 📊 [OMD-FILE-LeftSidebar-0003] LeftSidebar ➔ useEffect (drives fetch)
// 🎯 @KICK  : 탐색기 탭이 활성화되고 데스크톱 환경일 때 드라이브 목록 자동 조회
// 🛡️ @GUARD : sidebarTab === 'explorer' && isDesktop 조건 검사
// 🚨 @PATCH : 없음
// 🔗 @CALLS : fetchDrives
// ====================================================================
  useEffect(() => {
    if (sidebarTab === 'explorer' && isDesktop) {
      fetchDrives();
    }
  }, [sidebarTab, isDesktop]);

// ====================================================================
// 📊 [OMD-FILE-LeftSidebar-0002] LeftSidebar ➔ handleLazyLoad
// 🎯 @KICK  : FileSystem API 또는 로컬 API로 폴더 내 .md 파일 목록을 지연 로딩
// 🛡️ @GUARD : 파일 확장자가 .md/.markdown인 경우만 포함
// 🚨 @PATCH : 없음
// 🔗 @CALLS : fetch, getVfsFiles, listDirectory
// ====================================================================
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
              if (!nameLower.endsWith('.md') && !nameLower.endsWith('.markdown') && !nameLower.endsWith('.bib')) {
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
          const { getVfsFiles } = await import('@/lib/virtualFileSystem');
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

  if (!isSidebarOpen) return <input type="file" ref={importFileInputRef} style={{ display: 'none' }} accept=".docx,.hwp,.pdf,.txt,.md,.markdown,.html" onChange={handleImportFile} />;

  return (
    <>
      <input type="file" ref={importFileInputRef} style={{ display: 'none' }} accept=".docx,.hwp,.pdf,.txt,.md,.markdown,.html" onChange={handleImportFile} />
      <aside 
        style={{ 
          width: sidebarWidth,
          fontFamily: "'D2Coding', 'JetBrains Mono', 'Pretendard', Consolas, 'Malgun Gothic', '맑은 고딕', monospace",
          background: "linear-gradient(180deg, #f3f6fa 0%, #e7ecf5 100%)" // 💡 프리미엄 라이트모드 전용 아이스 블루 & 실버 그라데이션
        }} 
        className="flex flex-col border-r border-outline-variant/10 select-none relative z-10"
      >
        {/* 탭 헤더 */}
        <div className="h-10 border-b border-outline-variant/10 flex items-center px-2 bg-black/[0.03] justify-between">
          <div className="flex gap-1.5 w-full">
            <button
              onClick={() => {
                setSidebarTab('explorer');
                setIsSearchOpen(false);
              }}
              className={`flex-1 py-1 text-[12px] font-bold rounded-md transition-all text-center ${
                sidebarTab === 'explorer' 
                  ? 'bg-white/90 text-primary font-bold shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              📂 탐색기
            </button>
            <button
              onClick={() => {
                setSidebarTab('toc');
                setIsSearchOpen(false);
              }}
              className={`flex-1 py-1 text-[12px] font-bold rounded-md transition-all text-center ${
                sidebarTab === 'toc' 
                  ? 'bg-white/90 text-primary font-bold shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              📝 개요
            </button>
            <button
              onClick={() => {
                setSidebarTab('search');
                setIsSearchOpen(true);
              }}
              className={`flex-1 py-1 text-[12px] font-bold rounded-md transition-all text-center ${
                sidebarTab === 'search' 
                  ? 'bg-white/90 text-primary font-bold shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              🔍 검색
            </button>
          </div>
        </div>
      
      {/* 항상 표시되는 워크스페이스 선택 바 */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-outline-variant/10 bg-black/[0.05]">
        <span className="text-[12px] font-bold text-on-surface-variant/60 uppercase tracking-wide shrink-0">작업장 실폴더</span>
        <button
          onClick={onSelectRootFolder}
          className="flex-1 min-w-0 flex items-center gap-1 px-2 py-0.5 rounded-md text-left text-[12px] font-bold transition-colors
            bg-surface hover:bg-surface-container-high/30
            border border-outline-variant/30 hover:border-primary-container
            text-on-surface-variant hover:text-primary
            truncate"
          title={rootFolder?.name ? `워크스페이스 변경 (현재: ${rootFolder.name})` : '워크스페이스 폴더 선택'}
        >
          <span className="shrink-0">{rootFolder?.name ? '📁' : '📂'}</span>
          <span className="truncate">
            {rootFolder?.name ? rootFolder.name : '폴더를 선택하세요'}
          </span>
        </button>
      </div>

      {/* 탭 바디 — 항상 마운트, hidden으로 표시/숨김 제어 */}
      <div className="flex-1 min-h-0 relative flex flex-col">
        <div className={`flex-1 overflow-y-auto p-2 ${sidebarTab !== 'explorer' ? 'hidden' : ''}`}>
          {(rootFolder as any)?.needPermission ? (
            // 이전 워크스페이스 권한 복구 안내
            <div className="text-zinc-500 dark:text-zinc-400 text-[12px] text-center py-5 space-y-2.5 px-3">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 space-y-1.5 text-left">
                <p className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  ⚠️ 이전 폴더 연결 대기
                </p>
                <p className="text-[12px] leading-relaxed opacity-90">
                  브라우저 보안 제약으로 인해 새로고침 후 폴더 권한 승인이 필요합니다. 아래 버튼을 눌러 이전 폴더(<strong>{rootFolder?.name}</strong>)의 복구를 승인하세요.
                </p>
              </div>
              <button
                onClick={onRestoreFolder}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[12px] font-bold transition-all shadow-md shadow-amber-500/20"
              >
                🔄 워크스페이스 복구
              </button>
            </div>
          ) : rootFolder?.handle || (isDesktop && rootFolder?.name) || rootFolder?.name === BROWSER_STORAGE_NAME ? (
            // 폴더 연결됨 → 파일 트리 표시
            // 🛡️ [빈 폴더 방어] fileList가 비어있어도 루트 폴더 헤더(풀경로+버튼)를 항상 유지
            <div 
              className={`space-y-0.5 min-h-[50px] transition-colors rounded-lg ${isDragOverRoot ? 'bg-blue-500/10 border-2 border-dashed border-blue-500/50' : ''}`}
              onDragOver={handleDragOverRoot}
              onDragLeave={handleDragLeaveRoot}
              onDrop={handleDropRoot}
            >
              <div className="group relative flex items-center justify-between px-1 py-1 text-[12px] font-bold text-on-surface border-b border-outline-variant/20 mb-1">
                <span className="truncate">📁 {rootFolder.name}</span>
                {!isRestrictedUser && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
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
                      className="p-0.5 hover:bg-blue-500 hover:text-white rounded transition-colors text-zinc-400" 
                      title="새 파일"
                    >
                      <span className="text-[9px]">📖</span>
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
                      className="p-0.5 hover:bg-blue-500 hover:text-white rounded transition-colors text-zinc-400" 
                      title="새 폴더"
                    >
                      <span className="text-[9px]">📁</span>
                    </button>
                    <button 
                      onClick={async (e) => {
                        e.stopPropagation();
                        await refreshFileList();
                        window.dispatchEvent(new CustomEvent('file:refresh-all-directories'));
                      }} 
                      className="p-0.5 hover:bg-blue-500 hover:text-white rounded transition-colors text-zinc-400" 
                      title="새로고침"
                    >
                      <RefreshCw size={9} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        importFileInputRef.current?.click();
                      }} 
                      className="p-0.5 hover:bg-blue-500 hover:text-white rounded transition-colors text-zinc-400" 
                      title="문서 변환 및 가져오기 (DOCX, HWP, PDF, TXT, MD, HTML)"
                    >
                      <span className="text-[9px]">📥</span>
                    </button>
                  </div>
                )}
              </div>

              {isMergeMode && (
                <div className="flex flex-col gap-1 px-1.5 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mx-0.5 mb-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-semibold text-blue-700 dark:text-blue-300">
                      병합 모드 ({selectedMergeNodes.length}개 선택됨)
                    </span>
                    <button
                      onClick={onCancelMerge}
                      className="p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded text-blue-500 hover:text-blue-700 dark:hover:text-blue-200 transition-colors"
                      title="병합 취소"
                    >
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                  <button
                    onClick={onOpenMergeModal}
                    disabled={selectedMergeNodes.length < 2}
                    className="w-full px-1.5 py-0.5 text-[12px] font-bold bg-blue-600 hover:bg-blue-500 disabled:bg-blue-300 dark:disabled:bg-blue-800 text-white rounded-md transition-all active:scale-[0.98] disabled:cursor-not-allowed"
                  >
                    병합 실행
                  </button>
                </div>
              )}

              {fileList.length === 0 ? (
                <div className="text-zinc-400 dark:text-zinc-500 text-[12px] text-center py-5">
                  <p>연결된 폴더에 파일이 없습니다.</p>
                </div>
              ) : (
                fileList
                  .filter((node: any) => node.kind === 'directory' || node.name.toLowerCase().endsWith('.md') || node.name.toLowerCase().endsWith('.markdown') || node.name.toLowerCase().endsWith('.bib'))
                  .map((node: any, i: number) => (
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
                    refreshParent={async () => {
                      await refreshFileList();
                      window.dispatchEvent(new CustomEvent('file:refresh-all-directories'));
                    }}
                    onRefreshAll={async () => {
                      await refreshFileList();
                      window.dispatchEvent(new CustomEvent('file:refresh-all-directories'));
                    }}
                    openTabPaths={openTabPaths}
                    isRestrictedUser={isRestrictedUser}
                    askConfirm={askConfirm}
                    isMergeMode={isMergeMode}
                    selectedMergeNodes={selectedMergeNodes}
                    toggleMergeNodeSelect={toggleMergeNodeSelect}
                    onLazyLoad={handleLazyLoad}
                  />
                )))}
              </div>
          ) : (
            // 폴더 미연결 상태 — 간결한 안내
            <div className="flex flex-col items-center justify-center h-full min-h-[150px] text-zinc-400 dark:text-zinc-500 text-[8px] text-center space-y-2 px-4">
              <span className="text-xl opacity-40">📁</span>
              <p className="font-medium opacity-70">위의 폴더 선택 바를 눌러<br/>워크스페이스를 시작하세요.</p>
            </div>
          )}
        </div>
        <div 
          ref={tocContainerRef}
          className={`flex-1 overflow-y-auto p-2 ${sidebarTab !== 'toc' ? 'hidden' : ''}`}
        >
          <div className="space-y-0 text-[12px] font-bold">
            {!toc || toc.length === 0 ? (
                <div className="text-zinc-400 dark:text-zinc-500 text-center py-5">목차가 없습니다.</div>
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
                  let isCollapsed = false;

                  if (item.level === 2) {
                    if (item.parentH1Id && collapsedH1s[item.parentH1Id] === true) {
                      isCollapsed = true;
                    }
                  } else if (item.level === 3) {
                    if (item.parentH1Id && collapsedH1s[item.parentH1Id] === true) {
                      isCollapsed = true;
                    } else if (item.parentH2Id && collapsedH1s[item.parentH2Id] === true) {
                      isCollapsed = true;
                    }
                  } else if (item.level >= 4) {
                    if (item.parentH1Id && collapsedH1s[item.parentH1Id] === true) {
                      isCollapsed = true;
                    } else if (item.parentH2Id && collapsedH1s[item.parentH2Id] === true) {
                      isCollapsed = true;
                    } else if (item.parentH3Id && collapsedH1s[item.parentH3Id] === true) {
                      isCollapsed = true;
                    }
                  }

                  if (isCollapsed) return null;

                  const hasH1Children = item.level === 1 && processedToc.some(child => child.level >= 2 && child.parentH1Id === item.id);
                  const hasH2Children = item.level === 2 && processedToc.some(child => child.level >= 3 && child.parentH2Id === item.id);
                  const hasH3Children = item.level === 3 && processedToc.some(child => child.level >= 4 && child.parentH3Id === item.id);

                  return (
                    <div 
                      key={i} 
                      id={`toc-item-${item.id}`} // 💡 자동 스크롤 동기화 추적용 ID
                      style={{ paddingLeft: `${(item.level - 1) * 8}px` }}
                      className={`cursor-pointer py-0.5 px-1.5 rounded-md transition-all truncate flex items-center gap-1 ${
                        activeTocId === item.id 
                          ? 'bg-blue-100/60 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-semibold shadow-sm border border-blue-200 dark:border-blue-800/50' 
                          : 'hover:bg-zinc-200/70 dark:hover:bg-zinc-800/50 hover:text-blue-600 dark:hover:text-blue-400 text-zinc-600 dark:text-zinc-300 border border-transparent'
                      }`}
                      onClick={() => {
                        const isPreviewOnly = previewMode === 'preview';

                        if (isPreviewOnly) {
                          // A. [미리보기 전용 모드] - 동기화 락 없이 즉시 미리보기 스크롤 이동
                          const el = document.getElementById(item.id);
                          if (el && previewRef.current) {
                            const container = previewRef.current;
                            const containerRect = container.getBoundingClientRect();
                            const elRect = el.getBoundingClientRect();
                            const relativeTop = elRect.top - containerRect.top + container.scrollTop;

                            container.scrollTo({
                              top: relativeTop - 20, // 상단 20px 보정 마진
                              behavior: 'smooth'
                            });

                            // 줄 하이라이트 시각 효과
                            const elements = Array.from(container.querySelectorAll('[data-line]'));
                            elements.forEach(e => e.classList.remove('preview-highlight-line'));
                            el.classList.add('preview-highlight-line');
                          }
                          // 백그라운드 에디터 커서 이동
                          scrollToLine(item.lineNumber);
                        } else {
                          // B. [분할/에디터 모드] - 동기화 스크롤 간섭 락킹 후 순차 스크롤 연동
                          if (isScrollingRef && scrollTimeoutRef) {
                            isScrollingRef.current = 'preview';
                            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                          }

                          const el = document.getElementById(item.id);
                          if (el && previewRef.current) {
                            const container = previewRef.current;
                            const containerRect = container.getBoundingClientRect();
                            const elRect = el.getBoundingClientRect();
                            const relativeTop = elRect.top - containerRect.top + container.scrollTop;

                            container.scrollTo({
                              top: relativeTop - 20,
                              behavior: 'smooth'
                            });

                            const elements = Array.from(container.querySelectorAll('[data-line]'));
                            elements.forEach(e => e.classList.remove('preview-highlight-line'));
                            el.classList.add('preview-highlight-line');
                          }

                          // Monaco 에디터 줄 이동
                          scrollToLine(item.lineNumber);

                          if (isScrollingRef && scrollTimeoutRef) {
                            scrollTimeoutRef.current = setTimeout(() => {
                              isScrollingRef.current = null;
                            }, 500);
                          }
                        }
                      }}
                    >
                      {item.level === 1 ? (
                        hasH1Children ? (
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setCollapsedH1s(prev => ({ ...prev, [item.id]: !prev[item.id] })); 
                            }}
                            className="mr-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 w-3.5 h-3.5 flex items-center justify-center rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors shrink-0 text-[7px]"
                            title={collapsedH1s[item.id] === true ? "펼치기" : "접기"}
                          >
                            {collapsedH1s[item.id] === true ? '▶' : '▼'}
                          </button>
                        ) : (
                          <div className="w-3.5 h-3.5 mr-1 shrink-0" />
                        )
                      ) : item.level === 2 ? (
                        hasH2Children ? (
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
                      ) : item.level === 3 ? (
                        hasH3Children ? (
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
                      ) : (
                        <div className="w-5 h-5 mr-1 shrink-0" />
                      )}
                      <span className="truncate flex-1 font-bold">
                        {item.text}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
          <div className={`flex-1 min-h-0 ${sidebarTab !== 'search' ? 'hidden' : ''}`}>
            <GlobalSearch
            isDarkMode={isDarkMode}
            content={content}
            currentFileName={currentFileName}
            tabs={tabs}
            fileList={fileList}
            workspacePath={rootFolder?.name && rootFolder.name !== BROWSER_STORAGE_NAME ? rootFolder.name : undefined}
            rootFolderHandle={rootFolder?.handle}
            workspaceType={workspaceType}
            onSelectFolder={onSelectRootFolder}
            /* [ONR-UI-002] 전체 검색 더블클릭 연동: 파일 내 특정 줄을 더블클릭할 때 해당 파일 노드를 찾아 오픈한 뒤 지정 줄로 즉시 화면을 포커스시킵니다. */
// ====================================================================
// 📊 [OMD-FILE-LeftSidebar-0001] LeftSidebar ➔ onFileOpenAndJump
// 🎯 @KICK  : 전역 검색 결과 파일을 열고 지정 줄로 이동
// 🛡️ @GUARD : 파일 경로를 트리에서 재귀 탐색 후 없으면 dummy/브라우저 핸들로 fallback
// 🚨 @PATCH : 없음
// 🔗 @CALLS : scrollToLine, openFile, findNodeRecursively, showToast
// ====================================================================
            onFileOpenAndJump={async (filePath, lineNumber) => {
              // 서식설정이 켜져 있다면 일반 뷰어로 강제 원복
              if (previewMode === 'css-style') {
                setPreviewMode('preview');
              }

              if (filePath === 'current') {
                scrollToLine(lineNumber);
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
                  showToast(`'${targetNode.name}' 파일을 열고 ${lineNumber}번째 줄로 이동했습니다.`, 'success');
                } else if (tabs && tabs.length > 0) {
                  const matchedTab = tabs.find(t => t.path === filePath || t.name === filePath || (filePath !== 'current' && (t.path === filePath || t.name === filePath.split(/[\\/]/).pop())));
                  if (matchedTab) {
                    const tabNode = { name: matchedTab.name, kind: 'file' as const, path: matchedTab.path || matchedTab.name };
                    openFile(tabNode);
                    setTimeout(() => {
                      scrollToLine(lineNumber);
                    }, 150);
                    showToast(`'${matchedTab.name}' 파일을 열고 ${lineNumber}번째 줄로 이동했습니다.`, 'success');
                  } else {
                    showToast("파일을 찾지 못했습니다.", "error");
                  }
                } else if (typeof window !== 'undefined' && (window as any).electronAPI) {
                  const fileName = filePath.split(/[\\/]/).pop() || filePath;
                  const dummyNode = { name: fileName, kind: 'file' as const, path: filePath };
                  openFile(dummyNode);
                  setTimeout(() => {
                    scrollToLine(lineNumber);
                  }, 200);
                  showToast(`'${fileName}' 파일을 열고 ${lineNumber}번째 줄로 이동했습니다.`, 'success');
                } else if (rootFolder?.handle) {
                  try {
                    const fileHandle = await rootFolder.handle.getFileHandle(filePath);
                    if (fileHandle) {
                      const tempNode = { name: filePath, kind: 'file' as const, handle: fileHandle };
                      openFile(tempNode, rootFolder.handle);
                      setTimeout(() => {
                        scrollToLine(lineNumber);
                      }, 150);
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
        </div>
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
      
      {isImporting && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999999] flex items-center justify-center bg-[#0B1120]/95 backdrop-blur-md">
          <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center max-w-sm mx-4 border border-slate-700/50 text-center animate-in fade-in zoom-in duration-200">
            <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              <img src="./icon.png" alt="Onrivi" className="w-10 h-10 object-contain animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">문서 구조화 및 분석 중...</h3>
            <p className="text-sm text-slate-300 opacity-90 leading-relaxed">
              AI가 문서의 맥락을 유추하여<br/>마크다운으로 예쁘게 포맷팅하고 있습니다.
            </p>
            <p className="text-xs text-blue-400 mt-4 font-medium animate-pulse">
              문서 크기에 따라 30초에서 5분 정도 소요될 수 있습니다. 잠시만 기다려주세요.
            </p>
          </div>
        </div>,
        document.body
      )}
    </aside>
    </>
  );
}
