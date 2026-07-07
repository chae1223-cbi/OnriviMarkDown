// @ts-nocheck
import { useRef, useEffect, useCallback } from 'react';
import { EditorTab } from '@/components/UnifiedTabBar';
import { FileNode } from '@/lib/indexedDbHelper';
import { getWelcomeContent } from "@/constants/welcomeContent";
import { vfsReadFile } from '@/lib/virtualFileSystem';
import { getApiUrl } from '@/lib/apiUrlBuilder';

/**
 * [OMD-HOOK-0003] useEditorTabs 커스텀 훅
 * @description Monaco Editor의 가상 모델 다중 탭 관리와 관련된 상태 및 로직을 통합 관리합니다.
 * @note tabs/setTabs/activeTabId/setActiveTabId는 외부(MainEditorApp)에서 주입받습니다.
 *       TDZ 방지를 위해 최상위 컴포넌트에서 상태를 선언하고 훅에 전달합니다.
 */
// ====================================================================
// 📊 [OMD-HOOK-0003] useEditorTabs.ts ➔ useEditorTabs
// 🎯 @KICK  : Monaco 에디터 가상 모델 다중 탭 관리 — 탭 전환·생성·콘텐츠 동기화
// 🛡️ @GUARD : tabs/setTabs/activeTabId/setActiveTabId 외부 주입으로 TDZ 원천 차단
// 🚨 @PATCH : **2026-07-04** — 서식설정(isStyleTab) 탭 전환 시 에디터 뷰캐시(viewState) 저장/복원 로직 탑재 및 모델 바인딩 예외 처리 패치 | 2026-06-15 — 내부 useState 제거 → 외부 주입 방식으로 전환 | MainEditorApp L526 tabMetadata_sync가 useEditorTabs 선언 전에 setTabs/activeTabId 참조하여 rS TDZ 에러 발생
//              **2026-07-07** — [BUG#1] activeTabIdRef 초기값 null → activeTabId 수정 (useEffect 비동기 갱신 지연으로 early return 미작동 원인 제거)
//              **2026-07-07** — [BUG#2] 동일 탭 재클릭 시 완전 early return; 가상 탭(path=null+model=null) Monaco 작업 건너뜀
//              **2026-07-07** — [BUG#3] createNewTab onDidChangeContent에 preview 가드 추가 (preview 모드에서 setValue("")로 content 초기화 방지)
// 🔗 @CALLS : getWelcomeContent, monaco.editor.createModel
// ====================================================================
export const useEditorTabs = (
  editorRef: any,
  setContent: (val: string) => void,
  setCurrentFileName: (name: string) => void,
  setCurrentFileNode: (node: FileNode | null) => void,
  isEditorMountedRef: any,
  previewModeRef: any,
  previewDebounceRef: any,
  isComposingRef: any,
  workspaceType: string,
  showToast: (msg: string, type?: string) => void,
  getRelativePath: (from: string | null | undefined, to: string) => string,
  // 💡 [TDZ 방어] 외부에서 주입되는 탭 상태 - MainEditorApp에서 최상단 const로 선언됨
  tabs: any[],
  setTabs: (fn: any) => void,
  activeTabId: string | null,
  setActiveTabId: (id: string | null) => void,
  setPreviewModeRaw?: (mode: any) => void
) => {
  const tabsRef = useRef<EditorTab[]>([]);
  // 🛡️ [BUG FIX 2026-07-07] 기존 null 초기값은 첫 렌더 직후 탭 클릭 시 useEffect 갱신이
  // 아직 실행되지 않아 activeTabIdRef.current=null 상태에서 early return이 미작동했음.
  // activeTabId를 초기값으로 직접 설정하여 동기화 지연 버그를 완전 제거합니다.
  const activeTabIdRef = useRef<string | null>(activeTabId);

  useEffect(() => { tabsRef.current = tabs; }, [tabs]);
  useEffect(() => { activeTabIdRef.current = activeTabId; }, [activeTabId]);

  // ====================================================================
  // 📊 [OMD-FILE-USEEDITORTABS-0003] useEditorTabs.ts ➔ updateContent
  // 🎯 @KICK  : 에디터/외부에서 콘텐츠 변경 시 탭 상태와 Monaco 모델을 디바운스하여 동기화
  // 🛡️ @GUARD : isEditorMounted, previewMode, isComposing 상태에 따른 early return
  // 🚨 @PATCH : 없음
  // 🔗 @CALLS : setContent, setTabs
  // ====================================================================
  const updateContent = useCallback((newValue: string, fromEditor: boolean = false) => {
    if (fromEditor && !isEditorMountedRef.current) return;
    if (fromEditor && previewModeRef.current === 'preview') return;

    if (fromEditor) {
      if (previewDebounceRef.current) clearTimeout(previewDebounceRef.current);
      if (isComposingRef.current) return;

      previewDebounceRef.current = setTimeout(() => {
        if (!isEditorMountedRef.current) return;
        if (previewModeRef.current === 'preview') return;
        setContent(newValue);
        setTabs(prev => prev.map(t => t.id === activeTabIdRef.current ? { ...t, content: newValue, isModified: true } : t));
      }, 100);
    } else {
      if (previewDebounceRef.current) clearTimeout(previewDebounceRef.current);
      setContent(newValue);
      setTabs(prev => prev.map(t => t.id === activeTabIdRef.current ? { ...t, content: newValue } : t));
      if (editorRef.current && editorRef.current.getValue() !== newValue) {
        editorRef.current.setValue(newValue);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setContent, isEditorMountedRef, previewModeRef, previewDebounceRef, isComposingRef, editorRef]);

  // ====================================================================
  // 📊 [OMD-FILE-USEEDITORTABS-0002 ✅ FIXED] useEditorTabs.ts ➔ switchTab
  // 🎯 @KICK  : 특정 탭으로 전환하며 스크롤 위치와 Monaco 모델을 복원. 탭 종류별 자동 모드 전환 (css-style↔both, help→preview)
  // 🛡️ @GUARD : 대상 탭 미존재 시 early return; 도움말 탭('도움말.md')은 preview 강제, css-style/도움말 탭 이탈 시 both 복원
  // 🚨 @PATCH : 도움말 탭 preview 모드 강제 + 모드 자동 전환 통합 (2026-06-17); isDisposed() 가드로 Model is disposed! 크래시 방지 (2026-06-18);
  //              **2026-07-07** — 동일 탭 재클릭 완전 early return; 가상 탭(path=null+model=null) Monaco 작업 전체 건너뜀
  //              (editor.setValue가 다른 탭 모델에 값을 쓰고 onDidChangeContent를 발화하여 content 초기화 유발하는 근본 원인 제거)
  // 🔗 @CALLS : setContent, setCurrentFileName, setCurrentFileNode, setPreviewModeRaw
  // ====================================================================
  const switchTab = useCallback((tabId: string) => {
    // 🛡️ [BUG FIX] 이미 활성화된 탭 재클릭 → 완전 무시
    if (activeTabIdRef.current === tabId) return;

    const targetTab = tabsRef.current.find(t => t.id === tabId);

    const monaco = (window as any).monaco;
    const editor = editorRef.current;

    // 💡 탭 전환 직전 현재 에디터 상태 및 스크롤 위치 완전 복원용 캐싱
    if (editor && activeTabIdRef.current) {
      const currentScrollTop = editor.getScrollTop();
      const currentViewState = editor.saveViewState();
      setTabs(prev => prev.map(t => t.id === activeTabIdRef.current ? { ...t, scrollTop: currentScrollTop, viewState: currentViewState } : t));
    }

    // 현재 탭의 에디터 내용을 React 상태에 동기화 (모드 전환 시 데이터 유실 방지)
    // 🛡️ [BUG FIX 2026-07-07] 가상 탭(path=null, model=null)은 editor.getValue()가 빈 문자열을
    // 반환하므로 content를 덮어쓰지 않음 (탭 내용이 소멸하는 현상 방지)
    if (editor && (previewModeRef.current === 'css-style' || previewModeRef.current === 'preview')) {
      const prevTab = tabsRef.current.find(t => t.id === activeTabIdRef.current);
      const isPrevVirtual = prevTab && !prevTab.path && !prevTab.model;
      if (!isPrevVirtual) {
        const latestVal = editor.getValue();
        if (activeTabIdRef.current) {
          setTabs(prev => prev.map(t => t.id === activeTabIdRef.current ? { ...t, content: latestVal } : t));
        }
      }
    }

    setActiveTabId(tabId);

    if (!targetTab) return;

    // 💡 서식설정 탭(isStyleTab)일 때는 에디터 상태 복원을 스킵합니다.
    if (targetTab.isStyleTab) {
      setContent('');
      setCurrentFileName(targetTab.name);
      setCurrentFileNode(null);
      return;
    }

    // 🛡️ [BUG FIX 2026-07-07] 가상 탭(path=null, model=null, no isStyleTab)의
    // content가 빈 문자열이면 getWelcomeContent()로 복원 (editor.getValue()가 빈 문자열을
    // 반환하여 tabs에 content=""가 저장된 후 switchTab이 이를 다시 setContent()하는 사이클 차단)
    let resolvedContent = targetTab.content;
    const isVirtualTabResolve = !targetTab.path && !targetTab.model;
    if (isVirtualTabResolve && !targetTab.isStyleTab && !resolvedContent) {
      resolvedContent = getWelcomeContent();
    }
    setContent(resolvedContent);
    setCurrentFileName(targetTab.name);
    setCurrentFileNode(targetTab.node);

    // 💡 도움말 문서 탭으로 전환할 때는 예외적으로 무조건 미리보기(preview) 모드를 강제 지정합니다.
    if (targetTab.name === '도움말.md' && setPreviewModeRaw) {
      setPreviewModeRaw('preview');
      previewModeRef.current = 'preview';
    }

    // 🛡️ [BUG FIX 2026-07-07] 가상 탭(path=null, model=null): Monaco 작업 전체 건너뜀
    // editor.setValue()는 현재 연결된 다른 탭의 모델에 값을 덮어쓰고
    // 그 모델의 onDidChangeContent를 발화시켜 content가 꼬이는 원인이 됩니다.
    const isVirtualTab = !targetTab.path && !targetTab.model;
    if (isVirtualTab) return;

    if (editor && monaco && targetTab.model && !targetTab.model.isDisposed()) {
      editor.setModel(targetTab.model);
      if (targetTab.viewState) {
        requestAnimationFrame(() => {
          editor.restoreViewState(targetTab.viewState);
        });
      } else if (targetTab.scrollTop !== undefined) {
        requestAnimationFrame(() => {
          editor.setScrollTop(targetTab.scrollTop || 0);
        });
      }
    } else if (editor) {
      editor.setValue(targetTab.content);
    }

    // 탭에 모델이 없으면 생성
    if (monaco && targetTab && !targetTab.model) {
      const newModel = monaco.editor.createModel(targetTab.content, 'markdown');
      newModel.onDidChangeContent(() => {
        // 🛡️ [BUG FIX 2026-07-07] preview 모드 / 비마운트 시 content 업데이트 차단
        if (!isEditorMountedRef.current) return;
        if (previewModeRef.current === 'preview') return;
        const val = newModel.getValue();
        setContent(val);
        setTabs(prev => prev.map(t => t.id === targetTab.id ? { ...t, content: val, isModified: val !== t.content } : t));
      });
      (targetTab as any).model = newModel;
      tabsRef.current = tabsRef.current.map(t => t.id === targetTab.id ? { ...t, model: newModel } : t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorRef, setContent, setCurrentFileName, setCurrentFileNode, previewModeRef, setPreviewModeRaw, isEditorMountedRef]);

  // ====================================================================
  // 📊 [OMD-FILE-USEEDITORTABS-0001 ✅ FIXED] useEditorTabs.ts ➔ createNewTab
  // 🎯 @KICK  : 새 탭을 생성하고 Monaco 모델을 만들어 에디터에 연결. 탭 종류/출발 탭에 따라 모드 자동 전환
  // 🛡️ @GUARD : monaco 미존재 시 모델 없이 탭만 생성; 도움말 탭 생성 시 preview 강제, css-style 출발 시 both 복원
  // 🚨 @PATCH : 모드 자동 전환 로직 추가; prevTabId를 modeTransition 이전에 캡처하도록 순서 수정 (2026-06-17); onDidChangeContent 핸들러 isModified: true → val !== t.content 비교로 전환 (2026-06-18)
  //              **2026-07-07** — onDidChangeContent에 isEditorMountedRef/preview 가드 추가
  //              (preview 모드에서 model.getValue()가 부정확한 값을 반환하여 content 초기화 유발하는 버그 방지)
  // 🔗 @CALLS : getWelcomeContent, setContent, setTabs, setActiveTabId, setCurrentFileName, setCurrentFileNode, setPreviewModeRaw
  // ====================================================================
  const createNewTab = useCallback((initialContent?: string, name?: string, isStyleTab?: boolean) => {
    const monaco = (window as any).monaco;
    const contentVal = initialContent !== undefined ? initialContent : getWelcomeContent();
    const tabName = name || '새 파일.md';
    const tabId = 'new-tab-' + Date.now();

    let model: any = null;
    if (monaco) {
      model = monaco.editor.createModel(contentVal, 'markdown');
      model.onDidChangeContent(() => {
        // 🛡️ [BUG FIX 2026-07-07] preview 모드 / 비마운트 시 content 업데이트 차단
        // preview 모드에서 model.getValue()가 ""를 반환하거나 부정확한 값을 반환하여
        // setContent("")가 호출되어 내용이 사라지는 버그 방지
        if (!isEditorMountedRef.current) return;
        if (previewModeRef.current === 'preview') return;
        const val = model.getValue();
        setContent(val);
        setTabs(prev => prev.map(t => t.id === tabId ? { ...t, content: val, isModified: val !== t.content } : t));
      });
    }

    const newTab: EditorTab = {
      id: tabId,
      name: tabName,
      path: null,
      node: null,
      content: contentVal,
      isModified: false,
      model: model,
      previewMode: previewModeRef.current, // 💡 현재 하단 상태표시줄 등에 설정된 UI 모드를 새 탭에 기본 할당하여 유지
      isStyleTab: isStyleTab || false
    };

    if (setPreviewModeRaw) {
      // 💡 도움말 문서 등 특정 고유 탭은 강제로 미리보기('preview') 모드로 설정되게 처리
      if (tabName === '도움말.md') {
        newTab.previewMode = 'preview';
        setPreviewModeRaw('preview');
        previewModeRef.current = 'preview';
      }
    }

    setTabs(prev => [...prev, newTab]);
    setActiveTabId(tabId);

    setContent(contentVal);
    setCurrentFileName(tabName);
    setCurrentFileNode(null);

    if (editorRef.current && model) {
      editorRef.current.setModel(model);
      requestAnimationFrame(() => {
        editorRef.current.setScrollTop(0);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorRef, setContent, setCurrentFileName, setCurrentFileNode, previewModeRef, setPreviewModeRaw, isEditorMountedRef]);

  return {
    tabsRef,
    activeTabIdRef,
    updateContent,
    switchTab,
    createNewTab
  };
};
