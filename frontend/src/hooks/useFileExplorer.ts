// @ts-nocheck
import { useEffect, useCallback, useRef } from 'react';
import { FileNode, scanDirectory, idb } from '@/lib/helper';
import { getVfsFiles, vfsReadFile, vfsWriteFile } from '@/lib/vfsHelper';
import { getApiUrl } from '@/lib/api';
import { stripFrontmatter } from "@/lib/editorUtils";
import { EditorTab } from '@/components/UnifiedTabBar';

/**
 * [ONR-16-005] useFileExplorer 커스텀 훅
 * @description 워크스페이스 폴더 연결, IndexedDB 권한 복원, 파일 트리 스캔, 파일 열기 및 저장(I/O) 등의 책임을 전담합니다.
 */
// ====================================================================
// 📊 [OMD-FILE-USEFILEEXPLORER-0010] useFileExplorer.ts ➔ useFileExplorer
// 🎯 @KICK  : 워크스페이스 폴더 연결, 파일 트리 스캔, 파일 열기/저장 I/O 전담
// 🛡️ @GUARD : 각 환경별 API 실패 시 예외 처리 및 fallback
// 🚨 @PATCH : 없음
// 🔗 @CALLS : scanDirectory, getVfsFiles, fetch, vfsReadFile, vfsWriteFile, stripFrontmatter, idb.get, api.saveFile, api.listDirectory, api.readFromPath
// ====================================================================
export const useFileExplorer = ({
  editorRef,
  contentRef,
  currentFileNode,
  currentFileName,
  lastSavedContentRef,
  currentFileParentHandleRef,
  tabsRef,
  isSearchOpen,
  activeTabIdRef,
  setContent,
  setCurrentFileName,
  setCurrentFileNode,
  setTabs,
  setActiveTabId,
  setSaveStatus,
  setIsSidebarOpen,
  setIsSearchOpen,
  setHelpContent,
  setHelpTitle,
  setPreviewModeRaw,
  previewModeRef,
  isEditorMountedRef,
  showToast,
  createNewTab,
  switchTab,
  rootFolder,
  setRootFolder,
  fileList,
  setFileList,
  workspaceType,
  setWorkspaceType
}: any) => {

  const rootFolderRef = useRef(rootFolder);
  useEffect(() => { rootFolderRef.current = rootFolder; }, [rootFolder]);

  // ====================================================================
  // 📊 [OMD-FILE-USEFILEEXPLORER-0009] useFileExplorer.ts ➔ refreshFileList
  // 🎯 @KICK  : 브라우저/Electron/웹 환경별 파일 트리 목록을 새로고침
  // 🛡️ @GUARD : 각 환경별 API 실패 시 console.error로 대응
  // 🚨 @PATCH : 없음
  // 🔗 @CALLS : scanDirectory, getVfsFiles, api.listDirectory, fetch, setFileList
  // ====================================================================
  // 1. 파일 목록 리프레시 헬퍼 함수
  const refreshFileList = useCallback(async () => {
    const api = (window as any).electronAPI;
    const wType = workspaceType;

    if (wType === 'browser') {
      const handle = rootFolderRef.current?.handle;
      if (handle) {
        try {
          const tree = await scanDirectory(handle);
          setFileList(tree);
        } catch (err) {
          console.error('[refreshFileList scanDirectory Error]', err);
        }
      } else {
        const vfsList = getVfsFiles();
        setFileList(vfsList);
      }
    } else {
      if (api?.listDirectory && rootFolderRef.current?.name) {
        try {
          const list = await api.listDirectory(rootFolderRef.current.name);
          setFileList(list);
        } catch (e) {
          console.error('[refreshFileList listDirectory Error]', e);
        }
      } else {
        try {
          const res = await fetch(getApiUrl(`/api/files?t=${Date.now()}`));
          if (res.ok) {
            const list = await res.json();
            setFileList(list);
          }
        } catch (err) {
          console.error('[refreshFileList fetch Error]', err);
        }
      }
    }
  }, [workspaceType, setFileList]);

  // ====================================================================
  // 📊 [OMD-FILE-USEFILEEXPLORER-0008] useFileExplorer.ts ➔ selectRootFolder
  // 🎯 @KICK  : 로컬/브라우저 워크스페이스 루트 폴더를 선택하고 연결
  // 🛡️ @GUARD : Electron/file picker/로컬스토리지 각 환경별 예외 처리
  // 🚨 @PATCH : 없음
  // 🔗 @CALLS : scanDirectory, idb.set, showToast, setRootFolder, setWorkspaceType
  // ====================================================================
  // 2. 워크스페이스 루트 폴더 선택 핸들러
  const selectRootFolder = async (type: 'local' | 'browser', initialPath?: string | null) => {
    const api = (window as any).electronAPI;
    if (type === 'local') {
      if (api) {
        try {
          let currentLocalPath = initialPath || '';
          try {
            const savedRoot = localStorage.getItem('rootFolder');
            if (savedRoot) {
              const parsed = JSON.parse(savedRoot);
              if (parsed && parsed.name && parsed.name !== '브라우저 스토리지') {
                currentLocalPath = parsed.name;
              }
            }
          } catch (_) {}

          const targetPath = currentLocalPath || rootFolderRef.current?.name;
          const result = await (window as any).electronAPI.selectFolder(targetPath);
          if (result.status === 'success') {
            const finalRoot = result.path;
            try {
              await fetch(getApiUrl('/api/set-root'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newRoot: finalRoot })
              });
            } catch (_) { }
            setRootFolder({ name: finalRoot });
            setWorkspaceType('local');
            localStorage.setItem('rootFolder', JSON.stringify({ name: finalRoot }));
            localStorage.setItem('workspaceType', 'local');
            showToast(`워크스페이스가 ${finalRoot}(으)로 변경되었습니다.`, 'success');
          } else if (result.status === 'canceled') {
            showToast("폴더 선택이 취소되었습니다.", "info");
          }
        } catch (err: any) {
          showToast("폴더 선택 오류: " + err.message, "error");
        }
      } else if (typeof (window as any).showDirectoryPicker === 'function') {
        try {
          const handle = await (window as any).showDirectoryPicker();
          const folder = { name: handle.name, handle };
          await idb.set('rootFolderHandle', handle);
          setRootFolder(folder);
          setWorkspaceType('browser');
          localStorage.setItem('rootFolder', JSON.stringify({ name: handle.name }));
          localStorage.setItem('workspaceType', 'browser');
          showToast("워크스페이스 폴더가 연결되었습니다.", "success");
        } catch (err) {
          if ((err as any)?.name !== 'AbortError' && (err as any)?.name !== 'SecurityError') {
            showToast('워크스페이스 선택 중 오류가 발생했습니다.', 'error');
          }
          showToast("폴더 선택이 취소되었습니다.", "info");
        }
      } else {
        const folder = { name: '브라우저 스토리지' };
        await idb.set('rootFolderHandle', null);
        setRootFolder(folder);
        setWorkspaceType('browser');
        localStorage.setItem('rootFolder', JSON.stringify({ name: '브라우저 스토리지' }));
        localStorage.setItem('workspaceType', 'browser');
        showToast("로컬 스토리지 워크스페이스가 연결되었습니다.", "success");
      }
    }
  };

  // ====================================================================
  // 📊 [OMD-FILE-USEFILEEXPLORER-0007] useFileExplorer.ts ➔ restoreFolderPermission
  // 🎯 @KICK  : 브라우저 File System Access 권한을 복구하여 워크스페이스 재연결
  // 🛡️ @GUARD : rootFolder.handle 미존재 시 early return, 권한 거부/AbortError 처리
  // 🚨 @PATCH : 없음
  // 🔗 @CALLS : showToast, setRootFolder
  // ====================================================================
  // 3. 브라우저 저장소 권한 복구 핸들러
  const restoreFolderPermission = async () => {
    if (!rootFolder?.handle) return;
    try {
      const status = await rootFolder.handle.requestPermission({ mode: 'readwrite' });
      if (status === 'granted') {
        const restoredFolder = { name: rootFolder.handle.name, handle: rootFolder.handle };
        setRootFolder(restoredFolder);
        showToast("이전 워크스페이스 폴더가 정상 복구되었습니다.", "success");
      } else {
        showToast("폴더 읽기/쓰기 권한 승인이 거부되었습니다.", "warning");
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        showToast(`권한 복구 실패: ${err.message}`, "error");
      }
    }
  };

  // ====================================================================
  // 📊 [OMD-FILE-USEFILEEXPLORER-0006] useFileExplorer.ts ➔ handleFileOpenByPath
  // 🎯 @KICK  : 경로 문자열로 파일을 찾아 열거나 도움말 문서를 로드
  // 🛡️ @GUARD : helpContentRef 존재 시 도움말 경로로 라우팅, 파일 미발견 시 fetch fallback
  // 🚨 @PATCH : 없음
  // 🔗 @CALLS : findNodeByPath, handleFileClick, createNewTab, switchTab, setTabs, showToast
  // ====================================================================
  // 4. 경로를 기반으로 한 파일 열기 핸들러
  const handleFileOpenByPath = async (resolvedPath: string) => {
    if (helpContentRef?.current) {
      const api = (window as any).electronAPI;
      const helpPath = resolvedPath.startsWith('docs/') ? resolvedPath : 'docs/help/' + resolvedPath.replace(/^\//, '');
      // ====================================================================
      // 📊 [OMD-FILE-USEFILEEXPLORER-0005] useFileExplorer.ts ➔ loadHelp
      // 🎯 @KICK  : 도움말 파일 내용을 파싱하여 화면에 표시
      // 🛡️ @GUARD : 없음
      // 🚨 @PATCH : 없음
      // 🔗 @CALLS : stripFrontmatter, setHelpContent, setHelpTitle
      // ====================================================================
      const loadHelp = async (content: string) => {
        setHelpContent(stripFrontmatter(content));
        const fileName = helpPath.split('/').pop()?.replace('.md', '') || '';
        const titleMap: Record<string, string> = {
          '00_시작하기': '시작하기', '01_마크다운에디트란': '마크다운 에디트란',
          '02_에디터-기본': '에디터 기본 사용법', '03_파일-관리': '파일 관리',
          '04_미리보기-모드': '미리보기 모드', '05_서식-정의': '서식 정의',
          '06_내보내기': '내보내기', '07_표-체크리스트': '표 및 체크리스트',
          '08_다이어그램-수식': '다이어그램 및 수식', '09_슬래시-명령어': '슬래시 명령어 및 단축키',
          '10_한글-입력': '한글 입력', '11_미디어-삽입': '미디어 삽입',
          '12_내보내기-고급': '내보내기 고급', '13_설정': '설정 및 커스터마이징'
        };
        setHelpTitle(titleMap[fileName] || fileName);
      };
      if (api?.readFromPath) {
        try {
          const file = await api.readFromPath(helpPath);
          await loadHelp(file.content);
        } catch { setHelpContent('## 문서를 불러올 수 없습니다.'); }
      } else {
        try {
          const res = await fetch('./' + helpPath);
          const text = await res.text();
          await loadHelp(text);
        } catch { setHelpContent('## 문서를 불러올 수 없습니다.'); }
      }
      return;
    }

    // ====================================================================
    // 📊 [OMD-FILE-USEFILEEXPLORER-0004] useFileExplorer.ts ➔ findNodeByPath
    // 🎯 @KICK  : 파일 경로로 파일 트리 노드를 재귀 탐색
    // 🛡️ @GUARD : 경로 정규화 및 대소문자 무효화하여 비교
    // 🚨 @PATCH : 없음
    // 🔗 @CALLS : 없음
    // ====================================================================
    const findNodeByPath = (nodes: FileNode[], targetPath: string): { node: FileNode, parent: any } | null => {
      const normalizedTarget = targetPath.replace(/\\/g, '/').toLowerCase();
      for (const node of nodes) {
        const normalizedNodePath = (node.path || '').replace(/\\/g, '/').toLowerCase();
        if (normalizedNodePath === normalizedTarget && node.kind === 'file') {
          return { node, parent: rootFolder?.handle || null };
        }
        if (node.children && node.children.length > 0) {
          const found = findNodeByPath(node.children, targetPath);
          if (found) {
            return { node: found.node, parent: found.parent || node.handle };
          }
        }
      }
      return null;
    };

    const findResult = findNodeByPath(fileList, resolvedPath);
    if (findResult) {
      await handleFileClick(findResult.node, findResult.parent);
      return;
    }

    const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;
    if (!isElectron) {
      try {
        let fetchPath = resolvedPath;
        const docsIndex = resolvedPath.replace(/\\/g, '/').indexOf('docs/');
        if (docsIndex !== -1) {
          fetchPath = './' + resolvedPath.replace(/\\/g, '/').substring(docsIndex);
        } else if (resolvedPath.startsWith('docs/')) {
          fetchPath = './' + resolvedPath;
        }
        
        const res = await fetch(fetchPath);
        if (res.ok) {
          const text = await res.text();
          const filename = resolvedPath.split(/[/\\]/).pop() || '문서.md';
          
          const existingTab = tabsRef.current.find(t => t.name === filename || t.path === resolvedPath);
          if (existingTab) {
            switchTab(existingTab.id);
          } else {
            createNewTab(text, filename);
            setTabs(prev => prev.map(t => t.name === filename ? { ...t, path: resolvedPath } : t));
          }
          return;
        }
      } catch (err) {
        console.error('[Browser Open Path Fallback Error]', err);
      }
    }

    if (workspaceType !== 'browser') {
      const filename = resolvedPath.split('/').pop() || '파일.md';
      const dummyNode: FileNode = {
        name: filename,
        path: resolvedPath,
        kind: 'file'
      };
      await handleFileClick(dummyNode);
      return;
    }

    showToast('해당 파일 노드를 찾을 수 없습니다.', 'error');
  };

  // ====================================================================
  // 📊 [OMD-FILE-USEFILEEXPLORER-0003] useFileExplorer.ts ➔ handleFileClick
  // 🎯 @KICK  : 파일 트리 노드 클릭 시 기존 탭 전환 또는 새 탭 생성 및 파일 내용 로딩
  // 🛡️ @GUARD : node null/kind directory early return, 파일 읽기 실패 시 오류 토스트
  // 🚨 @PATCH : 없음
  // 🔗 @CALLS : createNewTab, switchTab, setContent, setTabs, setActiveTabId, showToast
  // ====================================================================
  // 5. 파일 트리 클릭 시 파일 열기 및 신규 탭 로딩
  const handleFileClick = async (node: FileNode | null, parentHandle?: any) => {
    setHelpContent(null);
    setHelpTitle('');
    if (previewModeRef.current === 'css-style') {
      setPreviewModeRaw('preview');
      previewModeRef.current = 'preview';
      isEditorMountedRef.current = false;
    }

    currentFileParentHandleRef.current = parentHandle || null;

    if (!node) {
      createNewTab();
      return;
    }
    if (node.kind === 'directory') return;

    const existingTab = tabsRef.current.find(t => 
      (node.path && t.path === node.path) || 
      (node.handle && t.node?.handle === node.handle)
    );

    if (existingTab) {
      switchTab(existingTab.id);
      if (isSearchOpen) setIsSearchOpen(false);
      setIsSidebarOpen(true);
      return;
    }

    try {
      let activeMode = workspaceType;
      if (workspaceType === 'browser') {
        activeMode = 'browser';
      } else if (node.path && !node.handle) {
        activeMode = 'local';
      } else if (node.handle && !node.path) {
        activeMode = 'browser';
      }

      let fileContent = '';
      if (activeMode === 'browser') {
        if (node.handle) {
          const file = await node.handle.getFile();
          fileContent = await file.text();
        } else if (node.path) {
          fileContent = vfsReadFile(node.path);
        }
      } else if (activeMode === 'local' && node.path) {
        const api = (window as any).electronAPI;
        if (api?.readFromPath) {
          try {
            const file = await api.readFromPath(node.path);
            if (file) {
              fileContent = file.content;
            }
          } catch (e) {
            showToast('파일 읽기 실패', 'error');
          }
        } else {
          const res = await fetch(getApiUrl(`/api/file-content?path=${encodeURIComponent(node.path)}`));
          if (res.ok) {
            const data = await res.json();
            fileContent = data.content;
          }
        }
      }

      const monaco = (window as any).monaco;
      let model: any = null;
      const newTabId = node.path || node.handle?.name || 'tab-' + Date.now();

      if (monaco) {
        model = monaco.editor.createModel(fileContent, 'markdown');
        model.onDidChangeContent(() => {
          const val = model.getValue();
          setContent(val);
          setTabs(prev => prev.map(t => t.id === newTabId ? { ...t, content: val, isModified: true } : t));
        });
      }

      const newTab: EditorTab = {
        id: newTabId,
        name: node.name,
        path: node.path || null,
        node: node,
        content: fileContent,
        isModified: false,
        model: model
      };

      setTabs(prev => [...prev, newTab]);
      setActiveTabId(newTabId);

      setContent(fileContent);
      setCurrentFileName(node.name);
      setCurrentFileNode(node);

      if (editorRef.current && model) {
        editorRef.current.setModel(model);
        requestAnimationFrame(() => {
          editorRef.current.setScrollTop(0);
        });
      }

      const openedMsg = `${node.name} 파일을 열었습니다.`;
      showToast(openedMsg, "info");
      if (isSearchOpen) setIsSearchOpen(false);
      setIsSidebarOpen(true);
    } catch (err) {
      showToast("파일을 여는데 실패했습니다.", "error");
    }
  };

  // ====================================================================
  // 📊 [OMD-FILE-USEFILEEXPLORER-0002] useFileExplorer.ts ➔ saveFile
  // 🎯 @KICK  : Electron/웹/브라우저 File System Access 환경에 파일을 물리적으로 저장
  // 🛡️ @GUARD : targetFile null 시 false 반환, 권한 거부 시 오류 토스트
  // 🚨 @PATCH : 없음
  // 🔗 @CALLS : vfsWriteFile, api.saveFile, showToast, setTabs
  // ====================================================================
  // 6. 물리적 스토리지 저장 로직
  const saveFile = useCallback(async (targetContent: string, targetFile: FileNode | null) => {
    if (!targetFile) return false;
    try {
      let success = false;
      const api = typeof window !== 'undefined' && (window as any).electronAPI;
      const isWebOrAddon = !api;
      const effectiveWorkspaceType = isWebOrAddon ? 'browser' : workspaceType;

      if (api) {
        success = await api.saveFile(targetFile.path, targetContent);
        if (success) {
          lastSavedContentRef.current = targetContent;
        }
      } else if (effectiveWorkspaceType === 'local') {
        const res = await fetch(getApiUrl('/api/save'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: targetFile.path, content: targetContent })
        });
        if (res.ok) {
          lastSavedContentRef.current = targetContent;
          success = true;
        }
      } else if (effectiveWorkspaceType === 'browser') {
        if (targetFile.handle) {
          const permissionMode = { mode: 'readwrite' as const };
          let isGranted = (await targetFile.handle.queryPermission(permissionMode)) === 'granted';
          if (!isGranted) {
            isGranted = (await targetFile.handle.requestPermission(permissionMode)) === 'granted';
          }
          if (isGranted) {
            const writable = await targetFile.handle.createWritable();
            await writable.write(targetContent);
            await writable.close();
            lastSavedContentRef.current = targetContent;
            success = true;
          } else {
            showToast("파일 쓰기 권한이 거부되었습니다.", "error");
            return false;
          }
        } else if (targetFile.path) {
          vfsWriteFile(targetFile.path, targetContent);
          lastSavedContentRef.current = targetContent;
          success = true;
        }
      }

      if (success) {
        setTabs(prev => prev.map(t => 
          (targetFile.path && t.path === targetFile.path) || 
          (targetFile.handle && t.node?.handle === targetFile.handle)
            ? { ...t, isModified: false } 
            : t
        ));
      }
      return success;
    } catch (e: any) {
      console.error('[saveFile Error]', e);
      showToast('파일 저장 중 오류가 발생했습니다. 권한을 확인해 주세요.', 'error');
    }
    return false;
  }, [workspaceType, setTabs, showToast]);

  // ====================================================================
  // 📊 [OMD-FILE-USEFILEEXPLORER-0001] useFileExplorer.ts ➔ rootFolderRefreshEffect
  // 🎯 @KICK  : rootFolder 변경 시 파일 목록 자동 새로고침 또는 초기화
  // 🛡️ @GUARD : rootFolder null 시 fileList를 빈 배열로 초기화
  // 🚨 @PATCH : 없음
  // 🔗 @CALLS : refreshFileList, setFileList
  // ====================================================================
  // 폴더가 바뀔 때 리스트 자동 리프레시 연동
  useEffect(() => {
    if (rootFolder) {
      refreshFileList();
    } else {
      setFileList([]);
    }
  }, [rootFolder, refreshFileList, setFileList]);

  const helpContentRef = useRef<any>(null);
  useEffect(() => {
    helpContentRef.current = null;
  }, []);

  return {
    refreshFileList,
    selectRootFolder,
    restoreFolderPermission,
    handleFileOpenByPath,
    handleFileClick,
    saveFile
  };
};
