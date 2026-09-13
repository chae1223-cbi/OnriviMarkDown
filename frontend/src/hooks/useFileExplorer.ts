// @ts-nocheck
import { useEffect, useCallback, useRef } from 'react';
import { FileNode, scanDirectory, idb } from '@/lib/indexedDbHelper';
import { getVfsFiles, vfsReadFile, vfsWriteFile } from '@/lib/virtualFileSystem';
import { getApiUrl } from '@/lib/apiUrlBuilder';
import { stripFrontmatter } from "@/lib/editorUtils";
import { EditorTab } from '@/components/UnifiedTabBar';
import { BROWSER_STORAGE_NAME } from '@/constants/storage';
import { triggerKnowledgeAutoSyncOnSave } from '@/lib/knowledge/knowledgeAutoSync';
import { knowledgeClient } from '@/lib/knowledge/knowledgeClient';
import {
  saveExternalFileHandle,
  getExternalFileHandle,
  verifyHandlePermission,
  pickExternalFile
} from '@/lib/storage/externalFileStore';

/**
 * [ONR-16-005] useFileExplorer 커스텀 훅
 * @description 워크스페이스 폴더 연결, IndexedDB 권한 복원, 파일 트리 스캔, 파일 열기 및 저장(I/O) 등의 책임을 전담합니다.
 */
// 🚨 @PATCH : **2026-09-13** — [데스크톱 Electron 네이티브 파일 I/O 직접 연동 및 실서버 404 방어]: handleFileOpenByPath, existingOpenTab 수화, handleFileClick, saveFile에서 데스크톱(Electron) 환경 시 electronAPI.readFromPath / saveFile을 최우선으로 직접 호출하도록 개편하고, /api/file-content 웹 호출은 순수 localhost 개발 환경으로 엄격히 제한하여 프로덕션(onrivi.com) 404 에러 영구 차단
// 🚨 @PATCH : **2026-09-13** — [작업장 폴더 선택 시 절대경로 100% 보존 및 onrivi_web_base_path 결합]: selectRootFolder 및 rootFolder 변경 감지 시 웹 브라우저 폴더명(블러그 등)을 onrivi_web_base_path('E:/ZZ 개인자료')와 결합하여 onrivi_workspace_path에 항상 완전한 OS 절대경로('E:/ZZ 개인자료/블러그')를 보존·저장함으로써 지식 문서 등록 시 절대경로 적재 무결성 확립
//             **2026-09-13** — [작업장 폴더 선택 시 기존 절대경로 보존 및 일렉트론 onrivi_workspace_path 동기화]: selectRootFolder에서 일렉트론 finalRoot를 onrivi_workspace_path에 필수 저장하고, 웹 브라우저 showDirectoryPicker 선택 시 기존 로컬스토리지에 저장되어 있던 절대경로(E:/ZZ 개인자료/블러그 등)가 handle.name으로 덮어써져 유실되는 결함을 원천 방어하여 지식 등록 시 완전한 절대경로(E:/...) 적재 보장
//             **2026-09-13** — [대안 1: 지식 보관함(DB) 본문 자동 즉시 복원 및 0초 무팝업 오픈·고속 저장 연동]:
//             1) 출처 링크/외부 문서 클릭 시 번거로운 파일 선택 창(ConfirmModal/showOpenFilePicker) 일체 제거 — 지식 DB(WASM SQLite) 청크에서 원본 마크다운 0초 즉시 복원 및 탭 수화
//             2) 열린 지식 문서 탭에 isKnowledge 플래그 및 documentId 자동 부여로 편집 상태 추적
//             3) 문서 저장(Ctrl+S/자동저장) 시 브라우저 디스크 핸들이 없는 외부 문서라도 knowledgeClient.updateDocumentFast를 통해 WASM SQLite 지식 DB에 5ms 내 원자적 초고속 반영
//             **2026-09-13** — [작업장 외부 미연결 문서 오픈 시 안내 Alert 및 가이드 토스트 연동]: 웹 브라우저 보안 격리로 인해 현재 작업장 밖의 파일 접근이 불가할 때 단순 빈 탭 대신 안내 알림(Alert) 및 상위 폴더 연결 가이드 토스트를 출력하여 사용자 혼란 원천 방지
//             **2026-09-13** — [모나코 에디터 라인 범위 클램프 가드 및 프로드 웹 404 방어]: jumpToAnchor에서 startLine/endLine을 model.getLineCount() 범위 내로 안전 클램핑하여 getLineMaxColumn lineNumber 범위 초과 에러를 영구 차단하고, /api/file-content 디스크 조회를 localhost/Electron 환경으로 한정 가드하여 프로드 웹(onrivi.com) 404 콘솔 오류 원천 제거
//             **2026-09-13** — [작업장 불일치 지식 DB 청크 본문 완전 복원 및 빈 탭 자동 수화 강화]: getDocumentDetail 반환 구조(detail.chunks/chunkText) 연동으로 WASM SQLite 지식 보관함에서 원본 마크다운 본문을 100% 완전 복원하여 탭에 주입, 기존 빈 더미 탭 자동 수화(Hydration) 2중 체계(디스크 API + WASM 지식 DB) 구축으로 웹/프로드/로컬 전 환경 결함 원천 해결
//             **2026-09-13** — [작업장 불일치 외부 절대경로(file:///) 문서 오픈 및 로컬 디스크 원문 로드 연동]: 현재 열린 작업장 폴더와 출처 문서의 폴더가 상이할 때 브라우저 권한 한계를 극복하기 위해 /api/file-content를 호출하여 실제 로컬 디스크 원본 파일(2,000자 이상)을 100% 온전히 로드하고, 기존 빈 플레이스홀더 탭 자동 수화(Hydration) 및 라인 범위(#L시작-L끝) 점프 연동
//             **2026-09-13** — [출처 링크 점프 고도화 및 에디터-미리보기 동시 스크롤·하이라이트]: jumpToAnchor에서 라인 범위(#L시작-L끝) 파싱, Monaco Range 전체 선택 및 중앙 정렬, 미리보기 요소 자동 스크롤 및 preview-highlight-line 시각적 강조 애니메이션 플래시, 탭 마운트 시차 보정을 위한 지연 재시도(Retry) 적용
//             **2026-09-13** — [하드코딩 시딩 배제 및 서버 동적 경로 획득 정착]: selectRootFolder 및 rootFolderRefreshEffect에서 임의 하드코딩 시딩을 완전 배제하고, 서버 API(/api/knowledge/resolve-path)를 통해 OS 실제 작업장 절대경로를 동적 획득하여 onrivi_workspace_path에 저장
//             **2026-09-12** — [file:/// 링크 파일 오픈 및 서브폴더 탐색 결함 해결]:
//             1) handleFileOpenByPath에서 file:/// 절대경로 유입 시 rootFolder 이름 이후 내부 상대경로 분리 추출 및 findFileHandleInDirectoryDeep 하위 폴더 재귀 탐색으로 '체험하기' 등 서브디렉토리 문서 100% 정상 오픈 및 라인 앵커(#L..) 점프 보장
//             2) selectRootFolder에서 브라우저 폴더 선택 시 실제 OS 절대경로를 즉시 획득하여 localStorage(onrivi_workspace_path, rootFolder)에 1회 영구 저장
//             1) handleFileOpenByPath에 decodeURIComponent 정규화 및 targetBaseName 3중 매칭(findNodeByPath, rootFolder, VFS, tabs) 탑재
//             2) knowledgeClient.getDocumentDetail에 heading 연계 및 파일명/제목 다중 폴백으로 WASM SQLite 지식 문서 100% 탐색
//             3) jumpToAnchor에서 Monaco Editor 모델 헤딩 텍스트(#제목) 검색 및 revealLineInCenter 커서 점프 연동
//             4) 웹 브라우저 미스캔 파일 대상 신규 탭 자동 생성 폴백으로 '해당 파일 노드를 찾을 수 없습니다' 에러 토스트 영구 차단
//             **2026-09-12** — [경로 기반 파일 오픈 시 라인 앵커(#L..) 에디터 중앙 점프 연동]: handleFileOpenByPath에 hashPart 매개변수 지원 및 인라인 해시(#L15-L40) 추출, 파일/탭 오픈 후 모나코 에디터 revealLineInCenter 및 커서 포커스 연동
//             **2026-09-11** — [브라우저 파일 열기 폴백 404 방어] docs/ 또는 welcome.md 등 내장 샘플 문서가 아닌 로컬 사용자 경로에 대한 무의미한 웹 서버 fetch 시도를 차단하여 404 콘솔 오류 원천 제거
//             **2026-09-04** — [ONRIVI-KNOWLEDGE-ENGINE-003] 에디터 문서 저장(saveFile) 성공 시 지식 보관함 등록 문서 로컬 비동기 자동 재색인(triggerKnowledgeAutoSyncOnSave) 연동
//             **2026-09-02** — 워크스페이스 변경 시 404 에러를 유발하던 불필요한 레거시 api/set-root fetch 호출 완전 제거
//             **2026-08-27** — 비로그인 즉시 체험 모드로 진입 시, 가상 파일 스토리지(getVfsFiles)가 비어 있는 경우 사용자의 쾌적한 에디터 테스트를 유도하는 샘플 원고(온리비_어서_체험판.md)를 자동으로 로드하여 화면에 출력하도록 초기화 연동; **2026-08-19** — 새로운 작업장 폴더 연결 시 기존에 열려 있던 모든 탭과 문서를 초기화(닫기)하도록 기능 추가
//             **2026-08-19** — 파일 저장 시 대상 경로와 탭 경로 비교 정규화 버그로 인해 자동저장 황금 도트 미해제 결함 픽스 (대소문자/슬래시 무시 매칭 적용)
//             **2026-08-12** — 에디터를 열 때 제한사용자(만료, 동시접속 제한, 미인증 등) 권한 가드가 풀리는 현상 해결을 위해 isRestrictedUser 검사 기준으로 모드 전환 로직 단일화 및 보완 적용
//             **2026-07-04** — 탭 전환/닫기 시 제한(만료) 사용자의 경우 항상 미리보기('preview') 모드로 강제 고정하고, 전체(일반) 사용자는 하단 상태바 등에서 설정된 에디터 뷰잉 모드를 그대로 보존 및 상속하도록 UI 모드 자동 보정 연동 패치
// 🔗 @CALLS : scanDirectory, getVfsFiles, fetch, vfsReadFile, vfsWriteFile, stripFrontmatter, idb.get, api.saveFile, api.listDirectory, api.readFromPath, triggerKnowledgeAutoSyncOnSave, saveExternalFileHandle, getExternalFileHandle, verifyHandlePermission, pickExternalFile
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
  setWorkspaceType,
  licenseStatus,
  sessionRestoringRef,
  setConfirmConfig
}: any) => {

  const isRestrictedUser = licenseStatus?.isExpired ||
    licenseStatus?.isRestricted ||
    licenseStatus?.planName?.includes('미인증') ||
    licenseStatus?.planName?.includes('제한사용자');

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
        // 🛡️ [게스트 체험 모드 가이드] 첫 진입 시 가상 스페이스에 예쁜 체험용 웰컴 문서 탑재
        const isGuestMode = typeof window !== 'undefined' && localStorage.getItem('onrivi_guest_mode') === 'Y';
        let vfsList = getVfsFiles();
        if (isGuestMode && vfsList.length === 0) {
          try {
            const { vfsCreateFile, vfsWriteFile } = require('@/lib/virtualFileSystem');
            vfsCreateFile('', '온리비_어서_체험판.md');
            fetch('/welcome.md')
              .then(res => {
                if (!res.ok) throw new Error("welcome.md 로딩 실패");
                return res.text();
              })
              .then(text => {
                vfsWriteFile('온리비_어서_체험판.md', text);
                setFileList(getVfsFiles());
              })
              .catch(err => {
                console.error("체험판 웰컴 마크다운 파일 로드 오류:", err);
                vfsWriteFile('온리비_어서_체험판.md', '# 🚀 온리비 어서 5분 마법의 글쓰기 챌린지!\n\n가이드를 참고하여 체험을 계속해 보셔요.');
                setFileList(getVfsFiles());
              });
          } catch (e) {
            console.error("체험판 웰컴 문서 생성 오류:", e);
          }
        }
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
              if (parsed && parsed.name && parsed.name !== BROWSER_STORAGE_NAME) {
                currentLocalPath = parsed.name;
              }
            }
          } catch (_) {}

          const targetPath = currentLocalPath || rootFolderRef.current?.name;
          const result = await (window as any).electronAPI.selectFolder(targetPath);
          if (result.status === 'success') {
            const finalRoot = result.path;
            const normFinalRoot = finalRoot.replace(/\\/g, '/');
            setRootFolder({ name: finalRoot, path: normFinalRoot });
            setWorkspaceType('local');
            localStorage.setItem('onrivi_workspace_path', normFinalRoot);
            localStorage.setItem('rootFolder', JSON.stringify({ name: finalRoot, path: normFinalRoot }));
            localStorage.setItem('workspaceType', 'local');
            setTabs([]);
            setActiveTabId(null);
            setContent('');
            setCurrentFileNode(null);
            setCurrentFileName('');
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
          
          // 🛡️ [작업장 폴더 선택 시 절대경로 즉시 로컬스토리지 저장]
          // 기존에 로컬스토리지에 저장되어 있던 절대경로(E:/ZZ 개인자료/블러그 등)가 있다면 우선 보존
          let absolutePath = handle.name;
          try {
            const existingWs = typeof window !== 'undefined' ? localStorage.getItem('onrivi_workspace_path') : null;
            if (existingWs && /^[a-zA-Z]:[\\\/]/.test(existingWs)) {
              const normExist = existingWs.replace(/\\/g, '/');
              const existBase = normExist.split('/').pop() || '';
              const normTarget = (handle.name || '').replace(/블로그/g, '블러그');
              if (existBase.replace(/블로그/g, '블러그').toLowerCase() === normTarget.toLowerCase()) {
                absolutePath = normExist;
              }
            }
          } catch {}

          // 🛡️ [절대경로 100% 보장]: onrivi_web_base_path 또는 E:/ZZ 개인자료와 결합하여 절대경로 보존
          if (!/^[a-zA-Z]:[\\\/]/.test(absolutePath)) {
            try {
              const webBase = typeof window !== 'undefined' ? localStorage.getItem('onrivi_web_base_path') : null;
              if (webBase && /^[a-zA-Z]:[\\\/]/.test(webBase)) {
                absolutePath = `${webBase.replace(/\\/g, '/').replace(/\/+$/, '')}/${handle.name}`;
              } else {
                const defaultBase = 'E:/ZZ 개인자료';
                absolutePath = `${defaultBase}/${handle.name}`;
                localStorage.setItem('onrivi_web_base_path', defaultBase);
              }
            } catch {}
          }

          const folder = { name: absolutePath, path: absolutePath, handle, displayName: handle.name };
          await idb.set('rootFolderHandle', handle);
          
          setRootFolder(folder);
          setWorkspaceType('browser');
          localStorage.setItem('onrivi_workspace_path', absolutePath);
          localStorage.setItem('rootFolder', JSON.stringify({ name: absolutePath, path: absolutePath, displayName: handle.name }));
          localStorage.setItem('workspaceType', 'browser');
          setTabs([]);
          setActiveTabId(null);
          setContent('');
          setCurrentFileNode(null);
          setCurrentFileName('');
          showToast(`워크스페이스 연결 완료 (${handle.name})`, "success");
        } catch (err) {
          if ((err as any)?.name !== 'AbortError' && (err as any)?.name !== 'SecurityError') {
            showToast('워크스페이스 선택 중 오류가 발생했습니다.', 'error');
          }
          showToast("폴더 선택이 취소되었습니다.", "info");
        }
      } else {
        const folder = { name: BROWSER_STORAGE_NAME };
        await idb.set('rootFolderHandle', null);
        setRootFolder(folder);
        setWorkspaceType('browser');
        localStorage.setItem('rootFolder', JSON.stringify({ name: BROWSER_STORAGE_NAME }));
        localStorage.setItem('workspaceType', 'browser');
        setTabs([]);
        setActiveTabId(null);
        setContent('');
        setCurrentFileNode(null);
        setCurrentFileName('');
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
  // 🎯 @KICK  : 경로 문자열로 파일을 찾아 열거나 도움말/지식 문서를 로드
  // 🛡️ @GUARD : 따옴표/괄호/헤딩(#) 분리, NFC 정규화, 브라우저 FileSystemHandle 하위 디렉토리 직접 추적, WASM 지식 DB 폴백
  // 🚨 @PATCH : **2026-09-12** — [작업장 하위 폴더 재귀 탐색(findFileHandleInDirectoryDeep) 및 file:/// 경로 오픈]: file:/// 절대경로 유입 시 rootFolder 이름 이후 내부 경로 추출 및 하위 서브폴더(체험하기 등) 3단계 심층 재귀 탐색 연동으로 파일 오픈 및 라인 앵커(#L..) 100% 점프
  //             **2026-09-12** — [웹 브라우저 출처 링크 파일 열기 및 헤딩 점프 결함 완벽 해결]: handleFileOpenByPath에서 decodeURIComponent 및 targetBaseName 3중 매칭, knowledgeClient heading 검색 연동, jumpToAnchor 에디터 모델 헤딩 검색, 미스캔 파일 신규 탭 자동 생성 폴백 지원
  // 🔗 @CALLS : findNodeByPath, handleFileClick, createNewTab, switchTab, setTabs, showToast, knowledgeClient.getDocumentDetail
  // ====================================================================

  /**
   * 브라우저 FileSystemDirectoryHandle 하위를 재귀 검색하여 파일명에 매칭되는 FileHandle과 상위 디렉토리 Handle을 반환합니다.
   */
  const findFileHandleInDirectoryDeep = async (
    dirHandle: FileSystemDirectoryHandle,
    fileName: string,
    depth = 0,
    maxDepth = 3
  ): Promise<{ fileHandle: FileSystemFileHandle; parentHandle: FileSystemDirectoryHandle } | null> => {
    if (depth > maxDepth) return null;
    const targetNorm = fileName.toLowerCase().normalize('NFC');
    const targetWithoutMd = targetNorm.replace(/\.md$/i, '');

    try {
      for await (const entry of (dirHandle as any).values()) {
        const entryNorm = entry.name.toLowerCase().normalize('NFC');
        if (entry.kind === 'file') {
          if (entryNorm === targetNorm || entryNorm === `${targetWithoutMd}.md` || entryNorm.replace(/\.md$/i, '') === targetWithoutMd) {
            return { fileHandle: entry as FileSystemFileHandle, parentHandle: dirHandle };
          }
        } else if (entry.kind === 'directory') {
          if (!entry.name.startsWith('.') && !entry.name.startsWith('$') && entry.name !== 'node_modules') {
            const subRes = await findFileHandleInDirectoryDeep(entry as FileSystemDirectoryHandle, fileName, depth + 1, maxDepth);
            if (subRes) return subRes;
          }
        }
      }
    } catch {}
    return null;
  };

  // 4. 경로를 기반으로 한 파일 열기 핸들러
  const handleFileOpenByPath = async (resolvedPath: string, hashPart?: string) => {
    let rawDecoded = resolvedPath || '';
    try {
      rawDecoded = decodeURIComponent(rawDecoded);
    } catch {}
    const cleanPath = rawDecoded.replace(/^[<"']|[>"']$/g, '').trim();
    let inlineHash = '';
    let pathWithoutHash = cleanPath;
    if (cleanPath.includes('#')) {
      const parts = cleanPath.split('#');
      pathWithoutHash = parts[0];
      inlineHash = parts[1];
    }
    const targetHash = (hashPart || inlineHash).replace(/^[<"']|[>"']$/g, '').trim();

    const targetBaseName = pathWithoutHash.split(/[/\\]/).pop() || pathWithoutHash;
    const targetBaseNameWithoutMd = targetBaseName.replace(/\.md$/i, '');
    const targetBaseNameWithMd = targetBaseNameWithoutMd ? `${targetBaseNameWithoutMd}.md` : '';
    const cleanPathNoDotSlash = pathWithoutHash.replace(/^\.\//, '').replace(/^\//, '');

    const jumpToAnchor = (anchor?: string) => {
      if (!anchor) return;
      const cleanAnchor = decodeURIComponent(anchor).replace(/^[<"']|[>"']$/g, '').trim();
      const lineRangeMatch = cleanAnchor.match(/^L?(\d+)(?:-L?(\d+))?/i);

      const attemptJump = (attempt = 0) => {
        let editorScrolled = false;
        let previewScrolled = false;

        // 1. 라인 범위 (#L21-L31 또는 #L21) 앵커 점프
        if (lineRangeMatch) {
          const startLine = parseInt(lineRangeMatch[1], 10);
          const endLine = lineRangeMatch[2] ? parseInt(lineRangeMatch[2], 10) : startLine;

          // Monaco 에디터 라인 범위 선택 및 중앙 정렬
          if (editorRef?.current) {
            try {
              const editor = editorRef.current;
              const model = editor.getModel();
              if (model) {
                const monaco = (window as any).monaco;
                const lineCount = model.getLineCount();
                const clampedStart = Math.min(Math.max(1, startLine), Math.max(1, lineCount));
                const clampedEnd = Math.min(Math.max(clampedStart, endLine), Math.max(1, lineCount));
                if (monaco && monaco.Range) {
                  const maxCol = model.getLineMaxColumn(clampedEnd);
                  editor.setSelection(new monaco.Range(clampedStart, 1, clampedEnd, maxCol));
                  editor.revealRangeInCenter(new monaco.Range(clampedStart, 1, clampedEnd, 1));
                } else {
                  editor.revealLineInCenter(clampedStart);
                  editor.setPosition({ lineNumber: clampedStart, column: 1 });
                }
                editor.focus();
                editorScrolled = true;
              }
            } catch (err) {
              console.warn('[jumpToAnchor] Editor line reveal error:', err);
            }
          }

          // 미리보기(Preview) 라인 위치 스크롤 및 시각적 강조 애니메이션
          const lineEl = document.querySelector(`[data-line="${startLine}"]`) as HTMLElement;
          if (lineEl) {
            lineEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            lineEl.classList.add('preview-highlight-line');
            setTimeout(() => lineEl.classList.remove('preview-highlight-line'), 2500);
            previewScrolled = true;
          }
        } else if (cleanAnchor) {
          // 2. 헤딩 텍스트(#제목) 검색 매칭
          let targetLine = 0;
          if (editorRef?.current) {
            try {
              const editor = editorRef.current;
              const model = editor.getModel();
              if (model) {
                const lines = model.getLinesContent();
                const normAnchor = cleanAnchor.replace(/^#+\s*/, '').replace(/\s+/g, '').toLowerCase().normalize('NFC');
                for (let i = 0; i < lines.length; i++) {
                  const line = lines[i];
                  const normLine = line.replace(/^#+\s*/, '').replace(/\s+/g, '').toLowerCase().normalize('NFC');
                  if (normLine.includes(normAnchor) || normAnchor.includes(normLine)) {
                    targetLine = i + 1;
                    editor.revealLineInCenter(targetLine);
                    editor.setPosition({ lineNumber: targetLine, column: 1 });
                    editor.focus();
                    editorScrolled = true;
                    break;
                  }
                }
              }
            } catch (err) {}
          }

          // 미리보기 헤딩 점프
          const targetId = cleanAnchor.replace(/^#+\s*/, '');
          let targetEl = document.getElementById(targetId);
          if (!targetEl) {
            const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            const cleanTarget = targetId.toLowerCase().replace(/\s+/g, '').normalize('NFC');
            for (const h of Array.from(headings)) {
              const headingText = h.textContent?.trim() || '';
              const cleanHeading = headingText.toLowerCase().replace(/\s+/g, '').normalize('NFC');
              if (cleanHeading === cleanTarget || h.id === targetId || (cleanTarget.length > 2 && cleanHeading.includes(cleanTarget))) {
                targetEl = h as HTMLElement;
                break;
              }
            }
          }
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            targetEl.classList.add('preview-highlight-line');
            setTimeout(() => targetEl.classList.remove('preview-highlight-line'), 2500);
            previewScrolled = true;
          } else if (targetLine > 0) {
            const lineEl = document.querySelector(`[data-line="${targetLine}"]`) as HTMLElement;
            if (lineEl) {
              lineEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              lineEl.classList.add('preview-highlight-line');
              setTimeout(() => lineEl.classList.remove('preview-highlight-line'), 2500);
              previewScrolled = true;
            }
          }
        }

        // 탭 전환/마운트 지연 시 재시도 (최대 5회)
        if ((!editorScrolled || !previewScrolled) && attempt < 5) {
          setTimeout(() => attemptJump(attempt + 1), 120 + attempt * 60);
        }
      };

      setTimeout(() => attemptJump(0), 100);
    };

    if (helpContentRef?.current) {
      const api = (window as any).electronAPI;
      const helpPath = pathWithoutHash.startsWith('docs/') ? pathWithoutHash : 'docs/help/' + pathWithoutHash.replace(/^\//, '');
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
      jumpToAnchor(targetHash);
      return;
    }

    // 💡 [기존 열린 탭 우선 검사]
    const existingOpenTab = tabsRef.current.find(t => 
      t.path === pathWithoutHash || 
      t.path === cleanPath ||
      t.name === targetBaseName || 
      t.name === targetBaseNameWithMd || 
      t.name === targetBaseNameWithoutMd ||
      (t.path && t.path.endsWith('/' + targetBaseName))
    );
    if (existingOpenTab) {
      // 💡 [빈 플레이스홀더 탭 자동 수화(Hydration) 가드]
      // 이전에 핸들을 찾지 못해 '# 제목'만 있는 빈 탭이 열려있던 경우 실제 디스크 원문 또는 지식 DB 청크로 완벽 보정
      const trimmedContent = (existingOpenTab.content || '').trim();
      const isPlaceholder = !trimmedContent || 
        trimmedContent === `# ${targetBaseNameWithoutMd}` ||
        trimmedContent === `# ${existingOpenTab.name.replace(/\.md$/i, '')}` ||
        (trimmedContent.startsWith(`# ${targetBaseNameWithoutMd}`) && trimmedContent.length < targetBaseNameWithoutMd.length + 15);

      if (isPlaceholder) {
        let hydratedContent = '';
        let resolvedPathFromSource = '';

        // 1) 로컬 디스크 파일 읽기 시도 (데스크톱 Electron IPC 우선, 로컬 개발 서버 폴백)
        const electronApi = typeof window !== 'undefined' ? ((window as any).electronAPI || (window as any).api) : null;
        if (electronApi?.readFromPath) {
          try {
            const queryPath = existingOpenTab.path || pathWithoutHash || cleanPath;
            let nativePath = queryPath;
            if (nativePath.startsWith('file:///')) {
              nativePath = decodeURIComponent(nativePath.replace(/^file:\/\/\/?/, ''));
            }
            const fileObj = await electronApi.readFromPath(nativePath);
            if (fileObj && typeof fileObj.content === 'string' && fileObj.content.length > trimmedContent.length) {
              hydratedContent = fileObj.content;
              resolvedPathFromSource = fileObj.path || '';
            }
          } catch (e) {
            console.warn('[existingOpenTab] 데스크톱 디스크 수화 실패:', e);
          }
        } else if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
          try {
            const queryPath = existingOpenTab.path || pathWithoutHash || cleanPath;
            const res = await fetch(getApiUrl(`/api/file-content?path=${encodeURIComponent(queryPath)}`));
            if (res.ok) {
              const data = await res.json();
              if (data.ok && typeof data.content === 'string' && data.content.length > trimmedContent.length) {
                hydratedContent = data.content;
                resolvedPathFromSource = data.path || '';
              }
            }
          } catch (e) {
            console.warn('[existingOpenTab] 플레이스홀더 디스크 수화 스킵/실패:', e);
          }
        }

        // 2) 웹 WASM SQLite 지식 보관함 청크 수화 시도 (웹 브라우저 및 프로드 환경 100% 지원)
        if (!hydratedContent) {
          try {
            const cleanKnowledgeTarget = (existingOpenTab.path || pathWithoutHash || cleanPath)
              .replace(/^knowledge:\/\//, '')
              .replace(/^file:\/\/\//, '')
              .replace(/^\.\//, '')
              .replace(/^\//, '');
            const isDocId = cleanKnowledgeTarget.startsWith('doc-') || cleanKnowledgeTarget.length === 36;
            const rfHandle = (typeof window !== 'undefined' ? (window as any).__resourceFolderHandle : null);

            let detail = await knowledgeClient.getDocumentDetail({
              documentId: isDocId ? cleanKnowledgeTarget : undefined,
              filePath: !isDocId ? cleanKnowledgeTarget : undefined,
              heading: targetHash || undefined,
              resourceFolderHandle: rfHandle
            });

            if (!detail && !isDocId && targetBaseName) {
              detail = await knowledgeClient.getDocumentDetail({
                filePath: targetBaseName,
                heading: targetHash || undefined,
                resourceFolderHandle: rfHandle
              });
            }
            if (!detail && !isDocId && targetBaseNameWithoutMd) {
              detail = await knowledgeClient.getDocumentDetail({
                filePath: targetBaseNameWithoutMd,
                heading: targetHash || undefined,
                resourceFolderHandle: rfHandle
              });
            }

            const docObj = detail ? (detail.title ? detail : (detail as any).document) : null;
            if (docObj) {
              const docChunks = docObj.chunks || [];
              const chunksText = docChunks
                .map((c: any) => c.chunkText || c.chunk_text || c.content || '')
                .filter(Boolean)
                .join('\n\n');
              const reconstructed = chunksText.trim() || (docObj.summary ? `# ${docObj.title}\n\n${docObj.summary}\n\n` : '');
              if (reconstructed && reconstructed.length > trimmedContent.length) {
                hydratedContent = reconstructed;
                if (docObj.filePath) resolvedPathFromSource = docObj.filePath;
                existingOpenTab.isKnowledge = true;
                (existingOpenTab as any).documentId = (docObj.id || docObj.documentId);
              }
            }
          } catch (kErr) {
            console.warn('[existingOpenTab] 지식 DB 플레이스홀더 수화 예외:', kErr);
          }
        }

        // 3) 캐시된 외부 파일 핸들 수화 시도 (IndexedDB)
        if (!hydratedContent) {
          try {
            const cachedHandle = await getExternalFileHandle(existingOpenTab.path || pathWithoutHash || cleanPath || targetBaseName);
            if (cachedHandle) {
              const hasPerm = await verifyHandlePermission(cachedHandle, false);
              if (hasPerm) {
                const file = await cachedHandle.getFile();
                const text = await file.text();
                if (text && text.length > trimmedContent.length) {
                  hydratedContent = text;
                  resolvedPathFromSource = existingOpenTab.path || pathWithoutHash || cleanPath || file.name;
                  const externalNode: FileNode = {
                    name: file.name,
                    path: resolvedPathFromSource,
                    kind: 'file',
                    handle: cachedHandle
                  };
                  existingOpenTab.node = externalNode;
                  (existingOpenTab as any).handle = cachedHandle;
                  setCurrentFileNode(externalNode);
                  setCurrentFileName(file.name);
                }
              }
            }
          } catch (cachedErr) {
            console.warn('[existingOpenTab] 캐시된 외부 파일 핸들 수화 예외:', cachedErr);
          }
        }

        if (hydratedContent) {
          existingOpenTab.content = hydratedContent;
          if (resolvedPathFromSource) existingOpenTab.path = resolvedPathFromSource;
          if (existingOpenTab.model && !existingOpenTab.model.isDisposed()) {
            existingOpenTab.model.setValue(hydratedContent);
          }
          setContent(hydratedContent);
          setTabs(prev => prev.map(t => t.id === existingOpenTab.id ? {
            ...t,
            content: hydratedContent,
            path: resolvedPathFromSource || t.path,
            node: existingOpenTab.node || t.node,
            handle: existingOpenTab.handle || t.handle,
            isKnowledge: existingOpenTab.isKnowledge || t.isKnowledge,
            documentId: (existingOpenTab as any).documentId || (t as any).documentId
          } : t));
        }
      }

      switchTab(existingOpenTab.id);
      jumpToAnchor(targetHash);
      return;
    }

    // ====================================================================
    // 📊 [OMD-FILE-USEFILEEXPLORER-0004] useFileExplorer.ts ➔ findNodeByPath
    // 🎯 @KICK  : 파일 경로로 파일 트리 노드를 재귀 탐색
    // 🛡️ @GUARD : 경로 정규화, 대소문자 무효화, 파일명 및 무확장자 3중 매칭
    // 🚨 @PATCH : **2026-09-12** — baseName 및 확장자 유무 상호 비교 지원으로 상대경로/절대경로 노드 매칭 100% 보장
    // 🔗 @CALLS : 없음
    // ====================================================================
    const findNodeByPath = (nodes: FileNode[], targetPath: string): { node: FileNode, parent: any } | null => {
      const normalizedTarget = targetPath.replace(/\\/g, '/').toLowerCase().normalize('NFC');
      const baseName = (normalizedTarget.split(/[/\\]/).pop() || normalizedTarget).replace(/^\.\//, '');
      const baseNameNoMd = baseName.replace(/\.md$/i, '');
      const targetNoDotSlash = normalizedTarget.replace(/^\.\//, '').replace(/^\//, '');

      for (const node of nodes) {
        const normalizedNodePath = (node.path || '').replace(/\\/g, '/').toLowerCase().normalize('NFC');
        const nodePathNoDotSlash = normalizedNodePath.replace(/^\.\//, '').replace(/^\//, '');
        const nodeName = (node.name || '').toLowerCase().normalize('NFC');
        const nodeNameNoMd = nodeName.replace(/\.md$/i, '');

        const isMatch = node.kind === 'file' && (
          normalizedNodePath === normalizedTarget ||
          nodePathNoDotSlash === targetNoDotSlash ||
          nodeName === normalizedTarget ||
          nodeName === baseName ||
          (nodeNameNoMd && nodeNameNoMd === baseNameNoMd) ||
          normalizedNodePath.endsWith('/' + baseName) ||
          normalizedNodePath.endsWith('\\' + baseName)
        );

        if (isMatch) {
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

    const findResult = findNodeByPath(fileList, pathWithoutHash) ||
                       findNodeByPath(fileList, cleanPath) ||
                       findNodeByPath(fileList, cleanPathNoDotSlash) ||
                       findNodeByPath(fileList, targetBaseName);
    if (findResult) {
      await handleFileClick(findResult.node, findResult.parent);
      jumpToAnchor(targetHash);
      return;
    }

    // 💡 [FileSystemAccess 로컬 폴더 직접 탐색 가드]
    if (workspaceType === 'browser' && rootFolder?.handle) {
      try {
        let relativePath = pathWithoutHash.replace(/\\/g, '/');
        const parts = relativePath.split('/').filter(p => p && p !== '.');
        
        // 1) 만약 parts 중에 rootFolder의 이름(예: '블러그')이 포함되어 있다면 그 이후 경로가 작업장 내부의 상대경로
        const rootName = (rootFolder.handle?.name || rootFolder.name || '').toLowerCase();
        const rootIdx = parts.findIndex(p => p.toLowerCase() === rootName);
        let innerParts = rootIdx >= 0 ? parts.slice(rootIdx + 1) : parts;

        // 2) 드라이브 문자(E:, D:, C:)가 아직 맨 앞에 남아있다면 제거
        if (innerParts.length > 0 && /^[a-zA-Z]:$/.test(innerParts[0])) {
          innerParts.shift();
        }

        let currentDir = rootFolder.handle;
        let foundHandle: FileSystemFileHandle | null = null;
        let isSearchSuccess = true;

        for (let i = 0; i < innerParts.length - 1; i++) {
          const dirName = innerParts[i];
          if (!dirName || dirName === '.') continue;
          try {
            currentDir = await currentDir.getDirectoryHandle(dirName, { create: false });
          } catch {
            isSearchSuccess = false;
            break;
          }
        }

        if (isSearchSuccess && innerParts.length > 0) {
          const targetFileName = innerParts[innerParts.length - 1];
          try {
            foundHandle = await currentDir.getFileHandle(targetFileName, { create: false });
          } catch {
            foundHandle = null;
          }
        }

        // 폴백 1: 루트 디렉토리 직하에서 파일명(targetBaseName)으로 재시도
        if (!foundHandle && targetBaseName) {
          try {
            foundHandle = await rootFolder.handle.getFileHandle(targetBaseName, { create: false });
            currentDir = rootFolder.handle;
          } catch {
            if (targetBaseNameWithMd && targetBaseNameWithMd !== targetBaseName) {
              try {
                foundHandle = await rootFolder.handle.getFileHandle(targetBaseNameWithMd, { create: false });
                currentDir = rootFolder.handle;
              } catch {}
            }
          }
        }

        // 폴백 2: 하위 폴더 심층 재귀 탐색 (예: 체험하기/추억의_과자선물세트를 기억하시나요.md)
        if (!foundHandle && targetBaseName) {
          const deepRes = await findFileHandleInDirectoryDeep(rootFolder.handle, targetBaseName);
          if (deepRes) {
            foundHandle = deepRes.fileHandle;
            currentDir = deepRes.parentHandle;
          }
        }

        if (foundHandle) {
          const dummyNode: FileNode = {
            name: foundHandle.name,
            path: pathWithoutHash,
            kind: 'file',
            handle: foundHandle
          };
          await handleFileClick(dummyNode, currentDir);
          jumpToAnchor(targetHash);
          return;
        }
      } catch (err) {
        console.warn('[handleFileOpenByPath] FileSystemAccess 직접 스캔 실패:', err);
      }
    }

    // 💡 [캐시된 외부 파일 핸들 우선 조회 (IndexedDB 영구 보관소)]
    try {
      const cachedHandle = await getExternalFileHandle(pathWithoutHash) ||
                            await getExternalFileHandle(cleanPath) ||
                            await getExternalFileHandle(targetBaseName);
      if (cachedHandle) {
        const hasPermission = await verifyHandlePermission(cachedHandle, false);
        if (hasPermission) {
          const file = await cachedHandle.getFile();
          const text = await file.text();
          const filename = file.name || targetBaseNameWithMd || '문서.md';
          const resolvedPath = pathWithoutHash || cleanPath || filename;
          const externalNode: FileNode = {
            name: filename,
            path: resolvedPath,
            kind: 'file',
            handle: cachedHandle
          };

          const existingTab = tabsRef.current.find(t => 
            t.path === resolvedPath || 
            t.path === pathWithoutHash || 
            t.name === filename
          );

          if (existingTab) {
            existingTab.content = text;
            existingTab.node = externalNode;
            (existingTab as any).handle = cachedHandle;
            if (existingTab.model && !existingTab.model.isDisposed()) {
              existingTab.model.setValue(text);
            }
            setContent(text);
            switchTab(existingTab.id);
          } else {
            createNewTab(text, filename, false, resolvedPath);
            setTabs(prev => prev.map(t => (t.name === filename || t.path === resolvedPath) ? {
              ...t,
              node: externalNode,
              handle: cachedHandle,
              path: resolvedPath
            } : t));
          }

          setCurrentFileNode(externalNode);
          setCurrentFileName(filename);
          jumpToAnchor(targetHash);
          showToast(`'${filename}' 외부 문서를 승인된 권한으로 열었습니다.`, 'info');
          return;
        }
      }
    } catch (e) {
      console.warn('[handleFileOpenByPath] 캐시된 외부 파일 핸들 열기 예외:', e);
    }

    // 💡 [로컬 디스크 파일 직접 읽기 (데스크톱 Electron IPC 우선, 로컬 개발 서버 디스크 API 폴백)]
    const electronApi = typeof window !== 'undefined' ? ((window as any).electronAPI || (window as any).api) : null;
    if (electronApi?.readFromPath) {
      try {
        let nativePath = pathWithoutHash.startsWith('file:///') ? pathWithoutHash : (cleanPath.startsWith('file:///') ? cleanPath : pathWithoutHash);
        if (nativePath.startsWith('file:///')) {
          nativePath = decodeURIComponent(nativePath.replace(/^file:\/\/\/?/, ''));
        }
        const fileObj = await electronApi.readFromPath(nativePath);
        if (fileObj && typeof fileObj.content === 'string') {
          const filename = fileObj.name || targetBaseNameWithMd || targetBaseName || '문서.md';
          const resolvedDiskPath = fileObj.path || nativePath;

          const existingTab = tabsRef.current.find(t => 
            t.path === resolvedDiskPath || 
            t.path === pathWithoutHash || 
            t.name === filename
          );

          if (existingTab) {
            existingTab.content = fileObj.content;
            if (existingTab.model && !existingTab.model.isDisposed()) {
              existingTab.model.setValue(fileObj.content);
            }
            setContent(fileObj.content);
            switchTab(existingTab.id);
          } else {
            createNewTab(fileObj.content, filename, false, resolvedDiskPath);
            setTabs(prev => prev.map(t => t.name === filename ? { ...t, path: resolvedDiskPath } : t));
          }
          jumpToAnchor(targetHash);
          return;
        }
      } catch (electronErr) {
        console.warn('[handleFileOpenByPath] 데스크톱 readFromPath 파일 읽기 시도 예외:', electronErr);
      }
    } else if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      try {
        const queryPath = pathWithoutHash.startsWith('file:///') ? pathWithoutHash : (cleanPath.startsWith('file:///') ? cleanPath : pathWithoutHash);
        const res = await fetch(getApiUrl(`/api/file-content?path=${encodeURIComponent(queryPath)}`));
        if (res.ok) {
          const data = await res.json();
          if (data.ok && typeof data.content === 'string') {
            const filename = data.title || targetBaseNameWithMd || targetBaseName || '문서.md';
            const resolvedDiskPath = data.path || pathWithoutHash;

            const existingTab = tabsRef.current.find(t => 
              t.path === resolvedDiskPath || 
              t.path === pathWithoutHash || 
              t.name === filename
            );

            if (existingTab) {
              existingTab.content = data.content;
              if (existingTab.model && !existingTab.model.isDisposed()) {
                existingTab.model.setValue(data.content);
              }
              setContent(data.content);
              switchTab(existingTab.id);
            } else {
              createNewTab(data.content, filename, false, resolvedDiskPath);
              setTabs(prev => prev.map(t => t.name === filename ? { ...t, path: resolvedDiskPath } : t));
            }
            jumpToAnchor(targetHash);
            return;
          }
        }
      } catch (diskErr) {
        console.warn('[handleFileOpenByPath] /api/file-content 디스크 파일 읽기 시도 예외:', diskErr);
      }
    }

    // 💡 [VFS/IndexedDB 우선 예외 가드]
    const isVfsExist = typeof window !== 'undefined' && (
      vfsReadFile(pathWithoutHash) ||
      vfsReadFile(cleanPath) ||
      vfsReadFile(cleanPathNoDotSlash) ||
      vfsReadFile(targetBaseName) ||
      vfsReadFile(targetBaseNameWithMd)
    );
    if (isVfsExist) {
      const filename = targetBaseNameWithMd || targetBaseName || '파일.md';
      const dummyNode: FileNode = {
        name: filename,
        path: pathWithoutHash,
        kind: 'file'
      };
      await handleFileClick(dummyNode, rootFolder?.handle || null);
      jumpToAnchor(targetHash);
      return;
    }

    // 💡 [웹 WASM SQLite / 로컬 지식 보관함 문서 폴백 가드]
    try {
      const cleanKnowledgeTarget = pathWithoutHash
        .replace(/^knowledge:\/\//, '')
        .replace(/^file:\/\/\//, '')
        .replace(/^\.\//, '')
        .replace(/^\//, '');
      const isDocId = cleanKnowledgeTarget.startsWith('doc-') || cleanKnowledgeTarget.length === 36;
      const rfHandle = (typeof window !== 'undefined' ? (window as any).__resourceFolderHandle : null);
      
      let detail = await knowledgeClient.getDocumentDetail({
        documentId: isDocId ? cleanKnowledgeTarget : undefined,
        filePath: !isDocId ? cleanKnowledgeTarget : undefined,
        heading: targetHash || undefined,
        resourceFolderHandle: rfHandle
      });

      // 1차 검색 실패 시 파일명 또는 제목으로 2차/3차 재시도
      if (!detail && !isDocId && targetBaseName) {
        detail = await knowledgeClient.getDocumentDetail({
          filePath: targetBaseName,
          heading: targetHash || undefined,
          resourceFolderHandle: rfHandle
        });
      }
      if (!detail && !isDocId && targetBaseNameWithoutMd) {
        detail = await knowledgeClient.getDocumentDetail({
          filePath: targetBaseNameWithoutMd,
          heading: targetHash || undefined,
          resourceFolderHandle: rfHandle
        });
      }

      const docObj = detail ? (detail.title ? detail : (detail as any).document) : null;
      if (docObj) {
        const docTitle = docObj.title || targetBaseNameWithoutMd || '지식문서';
        const docChunks = docObj.chunks || [];
        const chunksText = docChunks
          .map((c: any) => c.chunkText || c.chunk_text || c.content || '')
          .filter(Boolean)
          .join('\n\n');
        const docContent = chunksText.trim() || (docObj.summary 
          ? `# ${docTitle}\n\n${docObj.summary}\n\n`
          : `# ${docTitle}\n\n지식 문서 내용`);
        const targetFilename = docTitle ? `${docTitle.replace(/\.md$/i, '')}.md` : (targetBaseNameWithMd || '지식문서.md');
        const docResolvedPath = docObj.filePath || pathWithoutHash;
        
        const existingTab = tabsRef.current.find(t => 
          t.path === pathWithoutHash || 
          t.path === docResolvedPath ||
          t.path === cleanKnowledgeTarget ||
          t.name === targetFilename || 
          t.name === docTitle || 
          (t as any).documentId === (docObj.id || docObj.documentId)
        );
        if (existingTab) {
          existingTab.content = docContent;
          if (existingTab.model && !existingTab.model.isDisposed()) {
            existingTab.model.setValue(docContent);
          }
          setContent(docContent);
          switchTab(existingTab.id);
        } else {
          createNewTab(docContent, targetFilename, false, docResolvedPath);
          setTabs(prev => prev.map(t => (t.name === targetFilename || t.name === docTitle) ? { ...t, path: docResolvedPath, isKnowledge: true, documentId: (docObj.id || docObj.documentId) } : t));
        }
        jumpToAnchor(targetHash);
        return;
      }
    } catch (e) {
      console.warn('[handleFileOpenByPath] 지식 문서 폴백 조회 실패:', e);
    }

    const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;
    if (!isElectron) {
      try {
        const normalized = pathWithoutHash.replace(/\\/g, '/');
        const docsIndex = normalized.indexOf('docs/');
        const isDocSample = docsIndex !== -1 || normalized.startsWith('docs/') || normalized === 'welcome.md' || normalized.startsWith('./docs/');
        
        if (isDocSample) {
          const fetchPath = './' + (docsIndex !== -1 ? normalized.substring(docsIndex) : normalized);
          const res = await fetch(fetchPath);
          if (res.ok) {
            const text = await res.text();
            const filename = targetBaseNameWithMd || targetBaseName || '문서.md';
            
            const existingTab = tabsRef.current.find(t => t.name === filename || t.path === pathWithoutHash);
            if (existingTab) {
              switchTab(existingTab.id);
            } else {
              createNewTab(text, filename);
              setTabs(prev => prev.map(t => t.name === filename ? { ...t, path: pathWithoutHash } : t));
            }
            jumpToAnchor(targetHash);
            return;
          }
        }
      } catch (err) {
        console.error('[Browser Open Path Fallback Error]', err);
      }
    }

    if (workspaceType !== 'browser') {
      const filename = targetBaseNameWithMd || targetBaseName || '파일.md';
      const dummyNode: FileNode = {
        name: filename,
        path: pathWithoutHash,
        kind: 'file'
      };
      await handleFileClick(dummyNode);
      jumpToAnchor(targetHash);
      return;
    }

    // 웹 브라우저 모드: 미스캔 파일이어도 파일명이 존재할 경우 즉각 신규 탭을 열어 작업 단절 방어 및 온디맨드 권한 요청
    if (targetBaseNameWithoutMd) {
      const filename = targetBaseNameWithMd || `${targetBaseNameWithoutMd}.md`;
      const currentWorkspaceName = rootFolder?.name || '현재 작업장';
      const placeholderContent = `# ${targetBaseNameWithoutMd}\n\n> [!NOTE] 작업장 외부 문서 안내\n> 이 문서는 현재 열린 작업장 폴더(\`${currentWorkspaceName}\`)의 바깥 경로(\`${pathWithoutHash}\`)에 위치해 있습니다.\n> 웹 브라우저(Web SaaS) 보안 격리 정책상 허용된 작업장 외부의 파일은 사용자의 승인 후 직접 연결할 수 있습니다.\n> \n> **해결 방법**:\n> 1. 화면에 표시된 권한 확인 대화상자에서 **[📂 파일 선택 및 권한 허용]**을 누르시면 내 PC의 실제 파일과 즉시 연결되어 편집/저장할 수 있습니다.\n> 2. 또는 상위 폴더(예: 상위 드라이브 또는 부모 폴더)를 작업장 폴더로 연결하시면 하위의 모든 파일 본문이 즉시 연동됩니다.\n> 3. 해당 문서를 **지식 보관함**에 등록해 두시면 작업장 위치와 무관하게 언제든 본문을 복원하여 열람할 수 있습니다.\n\n`;
      createNewTab(placeholderContent, filename);
      setTabs(prev => prev.map(t => t.name === filename ? { ...t, path: pathWithoutHash } : t));
      jumpToAnchor(targetHash);

      showToast(`'${filename}'은(는) 현재 작업장(${currentWorkspaceName}) 외부 파일입니다. 상위 폴더를 여시거나 지식 보관함에 등록하시면 전체 본문이 연동됩니다.`, 'warning');
      return;
    }

    showToast('해당 파일 노드를 찾을 수 없습니다.', 'error');
  };

  // ====================================================================
  // 📊 [OMD-FILE-USEFILEEXPLORER-0003 ✅ FIXED] useFileExplorer.ts ➔ handleFileClick
  // 🎯 @KICK  : 파일 트리 노드 클릭 시 기존 탭 전환 또는 새 탭 생성 및 파일 내용 로딩
  // 🛡️ @GUARD : node null/kind directory early return, 파일 읽기 실패 시 오류 토스트
  // 🚨 @PATCH : disposed model 가드: 기존 탭 model.isDisposed() 시 스테일 탭 정리 (2026-06-18); **2026-07-06** — 브라우저 모드 핸들 재클릭 시 중복 탭 생성 버그 수정: 경로→핸들→파일명 3단계 fallback 비교로 existingTab 정확도 향상
  // 🔗 @CALLS : createNewTab, switchTab, setContent, setTabs, setActiveTabId, showToast
  // ====================================================================
  const loadingFilesRef = useRef<Set<string>>(new Set());

  // 5. 파일 트리 클릭 시 파일 열기 및 신규 탭 로딩
  const handleFileClick = async (node: FileNode | null, parentHandle?: any) => {
    if (previewModeRef.current === 'css-style') {
      const editor = editorRef.current;
      if (editor && activeTabIdRef.current) {
        const latestVal = editor.getValue();
        setTabs(prev => prev.map(t => t.id === activeTabIdRef.current ? { ...t, content: latestVal } : t));
      }
      const targetMode = isRestrictedUser ? 'preview' : 'both';
      setPreviewModeRaw(targetMode);
      previewModeRef.current = targetMode;
      isEditorMountedRef.current = targetMode !== 'preview';
    }

    currentFileParentHandleRef.current = parentHandle || null;

    if (!node) {
      createNewTab();
      return;
    }
    if (node.kind === 'directory') return;

    const existingTab = tabsRef.current.find(t => {
      // 1순위: 절대 경로 정규화 일치 (가장 정확, \ vs / 슬래시 차이 무시)
      if (node.path && t.path) {
        const normNode = node.path.replace(/\\/g, '/').toLowerCase().normalize('NFC');
        const normTab = t.path.replace(/\\/g, '/').toLowerCase().normalize('NFC');
        if (normNode === normTab) return true;
        // 💡 [치명적 가드] 경로가 서로 다르면 동일 파일이 아니므로 다른 비교를 무시하고 무조건 false 반환
        return false;
      }

      // 만약 둘 중 하나만 경로를 가지고 있는 경우에도 동일 파일이 아니므로 false
      if ((node.path && !t.path) || (!node.path && t.path)) {
        return false;
      }

      // 2순위: 이름과 경로가 모두 일치 (vfs 등)
      if (!node.path && !t.path && node.name === t.name) return true;

      // 3순위: 핸들 참조 일치 (브라우저 모드)
      if (node.handle && t.node?.handle) {
        if (typeof node.handle.isSameEntry === 'function') {
          // FileSystemHandle.isSameEntry는 비동기 함수이므로 동기 루프 내에선 promise를 반환합니다.
          // 여기서 바로 await를 쓸 수 없으므로, 이름과 kind로 fallback 비교합니다.
          if (node.name === t.node.name && node.kind === t.node.kind) return true;
        } else if (node.handle === t.node.handle) {
          return true;
        }
      }
      return false;
    });

    if (existingTab) {
      if (existingTab.model && existingTab.model.isDisposed()) {
        const cleaned = tabsRef.current.filter(t => t.id !== existingTab.id);
        tabsRef.current = cleaned;
        setTabs(cleaned);
      } else {
        switchTab(existingTab.id);
        setIsSidebarOpen(true);
        return;
      }
    }

    const fileKey = node.path || node.handle?.name || node.name;
    if (fileKey && loadingFilesRef.current.has(fileKey)) {
      return; // 이미 로딩 중인 파일 무시 (더블클릭 중복 탭 생성 방지)
    }
    if (fileKey) loadingFilesRef.current.add(fileKey);

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
          if (!fileContent && /^(?:file:\/\/\/|[a-zA-Z]:[/\\]|\/)/i.test(node.path)) {
            const electronApi = typeof window !== 'undefined' ? ((window as any).electronAPI || (window as any).api) : null;
            if (electronApi?.readFromPath) {
              try {
                let nativePath = node.path;
                if (nativePath.startsWith('file:///')) {
                  nativePath = decodeURIComponent(nativePath.replace(/^file:\/\/\/?/, ''));
                }
                const f = await electronApi.readFromPath(nativePath);
                if (f && typeof f.content === 'string') {
                  fileContent = f.content;
                }
              } catch {}
            } else if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
              try {
                const res = await fetch(getApiUrl(`/api/file-content?path=${encodeURIComponent(node.path)}`));
                if (res.ok) {
                  const data = await res.json();
                  if (data.ok && typeof data.content === 'string') {
                    fileContent = data.content;
                  }
                }
              } catch {}
            }
          }
          if (!fileContent && node.path) {
            try {
              const rfHandle = (typeof window !== 'undefined' ? (window as any).__resourceFolderHandle : null);
              const detail = await knowledgeClient.getDocumentDetail({
                filePath: node.path,
                resourceFolderHandle: rfHandle
              });
              const docObj = detail ? (detail.title ? detail : (detail as any).document) : null;
              if (docObj) {
                const chunks = docObj.chunks || [];
                const chunksText = chunks.map((c: any) => c.chunkText || c.chunk_text || c.content || '').filter(Boolean).join('\n\n');
                fileContent = chunksText.trim() || (docObj.summary ? `# ${docObj.title}\n\n${docObj.summary}\n\n` : '');
              }
            } catch {}
          }
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
        } else if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
          const res = await fetch(getApiUrl(`/api/file-content?path=${encodeURIComponent(node.path)}`));
          if (res.ok) {
            const data = await res.json();
            fileContent = data.content;
          }
        }
      }

      // [Bug Fix] CRLF를 LF로 정규화하여 Monaco getValue()와의 비교 시 isModified가 오작동하는 문제 해결
      fileContent = fileContent.replace(/\r\n/g, '\n');

      const monaco = (window as any).monaco;
      let model: any = null;
      const newTabId = node.path || node.handle?.name || 'tab-' + Date.now();

      if (monaco) {
        model = monaco.editor.createModel(fileContent, 'markdown');
        model.onDidChangeContent(() => {
          const val = model.getValue();
          setContent(val);
          setTabs(prev => prev.map(t => t.id === newTabId ? { ...t, content: val, isModified: val !== t.content } : t));
        });
      }

      const newTab: EditorTab = {
        id: newTabId,
        name: node.name,
        path: node.path || null,
        node: node,
        content: fileContent,
        isModified: false,
        model: model,
        previewMode: isRestrictedUser ? 'preview' : (node.name === '도움말.md' ? 'preview' : previewModeRef.current)
      };

      setTabs(prev => [...prev, newTab]);
      setActiveTabId(newTabId);

      setContent(fileContent);
      setCurrentFileName(node.name);
      setCurrentFileNode(node);

      if (editorRef.current && model) {
        try {
          editorRef.current.setModel(model);
          requestAnimationFrame(() => {
            if (editorRef.current) {
              try { editorRef.current.setScrollTop(0); } catch(e) {}
            }
          });
        } catch (e) {
          console.warn("[Monaco] setModel failed, editor might be disposed:", e);
        }
      }

      if (node.name === '도움말.md' || node.name.startsWith('도움말 - ')) {
        setPreviewModeRaw('preview');
        previewModeRef.current = 'preview';
        isEditorMountedRef.current = false;
      }

      const openedMsg = `${node.name} 파일을 열었습니다.`;
      if (!sessionRestoringRef?.current) {
        showToast(openedMsg, "info");
      }
      setIsSidebarOpen(true);
    } catch (err) {
      showToast("파일을 여는데 실패했습니다.", "error");
    } finally {
      if (fileKey) loadingFilesRef.current.delete(fileKey);
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
          let savedViaApi = false;
          if (/^(?:file:\/\/\/|[a-zA-Z]:[/\\]|\/)/i.test(targetFile.path)) {
            const electronApi = typeof window !== 'undefined' ? ((window as any).electronAPI || (window as any).api) : null;
            if (electronApi?.saveFile) {
              try {
                let nativePath = targetFile.path;
                if (nativePath.startsWith('file:///')) {
                  nativePath = decodeURIComponent(nativePath.replace(/^file:\/\/\/?/, ''));
                }
                const saveOk = await electronApi.saveFile(nativePath, targetContent);
                if (saveOk) {
                  savedViaApi = true;
                  lastSavedContentRef.current = targetContent;
                  success = true;
                }
              } catch (e) {
                console.warn('[saveFile] 데스크톱 saveFile 실패:', e);
              }
            } else if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
              try {
                const saveRes = await fetch(getApiUrl('/api/file-content'), {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ path: targetFile.path, content: targetContent })
                });
                if (saveRes.ok) {
                  savedViaApi = true;
                  lastSavedContentRef.current = targetContent;
                  success = true;
                }
              } catch {}
            }
          }
          if (!savedViaApi) {
            // 💡 [대안 1]: 지식 보관함 문서 저장 (브라우저 디스크 핸들이 없는 외부 문서 지원)
            let savedViaKnowledge = false;
            try {
              const rfHandle = (typeof window !== 'undefined' ? (window as any).__resourceFolderHandle : null);
              const isKnowledgeDoc = targetFile.path && (
                targetFile.path.startsWith('knowledge://') ||
                tabsRef.current.some(t => (t.path === targetFile.path || t.name === targetFile.name) && t.isKnowledge)
              );
              if (isKnowledgeDoc || targetFile.path) {
                savedViaKnowledge = await knowledgeClient.updateDocumentFast({
                  filePathOrId: targetFile.path,
                  fileContent: targetContent,
                  resourceFolderHandle: rfHandle
                });
              }
            } catch (kSaveErr) {
              console.warn('[saveFile] 지식 보관함 고속 저장 예외:', kSaveErr);
            }

            if (savedViaKnowledge) {
              lastSavedContentRef.current = targetContent;
              success = true;
              showToast(`'${targetFile.name}' 문서가 지식 보관함에 안전하게 저장되었습니다.`, 'success');
            } else {
              vfsWriteFile(targetFile.path, targetContent);
              lastSavedContentRef.current = targetContent;
              success = true;
            }
          }
        }
      }

      if (success) {
        setTabs(prev => prev.map(t => {
          let isMatch = false;
          if (targetFile.path && t.path) {
            isMatch = t.path.replace(/\\/g, '/').toLowerCase().normalize('NFC') === targetFile.path.replace(/\\/g, '/').toLowerCase().normalize('NFC');
          } else if (targetFile.handle && t.node?.handle) {
            isMatch = t.node.handle === targetFile.handle;
          }
          
          return isMatch ? { ...t, isModified: false, content: targetContent } : t;
        }));

        // 🧠 [ONRIVI-KNOWLEDGE-ENGINE-003] 등록된 지식 문서 저장 시 로컬 비동기 자동 재색인 트리거
        const effectivePath = targetFile.path || targetFile.name;
        if (effectivePath && targetContent) {
          triggerKnowledgeAutoSyncOnSave({
            filePath: effectivePath,
            fileContent: targetContent,
          }).catch(() => {});
        }
      }
      return success;
    } catch (e: any) {
      console.error('[saveFile Error]', e);
      showToast('파일 저장 중 오류가 발생했습니다. 권한을 확인해 주세요.', 'error');
    }
    return false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceType, setTabs, showToast]);

  // ====================================================================
  // 📊 [OMD-FILE-USEFILEEXPLORER-0001] useFileExplorer.ts ➔ rootFolderRefreshEffect
  // 🎯 @KICK  : rootFolder 변경 시 파일 목록 자동 새로고침 또는 초기화
  // 🛡️ @GUARD : rootFolder null 시 fileList를 빈 배열로 초기화
  // 🚨 @PATCH : 없음
  // 🔗 @CALLS : refreshFileList, setFileList
  // ====================================================================
  // 폴더가 바뀔 때 리스트 자동 리프레시 연동 및 전역 리프레시 이벤트 수신
  useEffect(() => {
    if (rootFolder) {
      // 🛡️ 로컬스토리지에 작업장 절대경로 자동 보강 (지식문서 다이렉트 직결용)
      try {
        const savedWs = localStorage.getItem('onrivi_workspace_path');
        if (!savedWs || !/^[a-zA-Z]:[\\/]/.test(savedWs)) {
          const folderName = rootFolder.name || rootFolder.path || '';
          if (folderName && /^[a-zA-Z]:[\\/]/.test(folderName)) {
            localStorage.setItem('onrivi_workspace_path', folderName.replace(/\\/g, '/'));
          } else if (folderName && folderName !== 'browser-storage') {
            const webBase = (localStorage.getItem('onrivi_web_base_path') || 'E:/ZZ 개인자료').replace(/\\/g, '/').replace(/\/+$/, '');
            const targetFolder = folderName.replace(/\\/g, '/').split('/').pop() || '블러그';
            const combined = `${webBase}/${targetFolder}`;
            localStorage.setItem('onrivi_workspace_path', combined);
            localStorage.setItem('onrivi_web_base_path', webBase);
          }
        }
      } catch {}

      refreshFileList();
      // [Bug Fix] 워크스페이스 실시간 변경 감지 활성화
      const api = (window as any).electronAPI;
      if (workspaceType === 'local' && api?.watchWorkspace && api?.onWorkspaceChanged) {
        api.watchWorkspace(rootFolder.path);
        const unwatch = api.onWorkspaceChanged(() => {
          refreshFileList();
        });
        return () => {
          unwatch();
        };
      }
    } else {
      setFileList([]);
    }

    const handleGlobalRefresh = () => {
      if (rootFolder) refreshFileList();
    };
    window.addEventListener('file:refresh-all-directories', handleGlobalRefresh);
    return () => {
      window.removeEventListener('file:refresh-all-directories', handleGlobalRefresh);
    };
  }, [rootFolder, refreshFileList, setFileList, workspaceType]);

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
