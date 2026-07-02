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
// 🚨 @PATCH : 내부 useState 제거 → 외부 주입 방식으로 전환 | 2026-06-15 | MainEditorApp L526 tabMetadata_sync가 useEditorTabs 선언 전에 setTabs/activeTabId 참조하여 rS TDZ 에러 발생
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
  const activeTabIdRef = useRef<string | null>(null);

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
  }, [setContent, isEditorMountedRef, previewModeRef, previewDebounceRef, isComposingRef, editorRef]);

  // ====================================================================
  // 📊 [OMD-FILE-USEEDITORTABS-0002 ✅ FIXED] useEditorTabs.ts ➔ switchTab
  // 🎯 @KICK  : 특정 탭으로 전환하며 스크롤 위치와 Monaco 모델을 복원. 탭 종류별 자동 모드 전환 (css-style↔both, help→preview)
  // 🛡️ @GUARD : 대상 탭 미존재 시 early return; 도움말 탭('도움말.md')은 preview 강제, css-style/도움말 탭 이탈 시 both 복원
  // 🚨 @PATCH : 도움말 탭 preview 모드 강제 + 모드 자동 전환 통합 (2026-06-17); isDisposed() 가드로 Model is disposed! 크래시 방지 (2026-06-18)
  // 🔗 @CALLS : setContent, setCurrentFileName, setCurrentFileNode, setPreviewModeRaw
  // ====================================================================
  const switchTab = useCallback((tabId: string) => {
    const targetTab = tabsRef.current.find(t => t.id === tabId);

    if (setPreviewModeRaw && targetTab) {
      if (targetTab.name === '도움말.md' && previewModeRef.current !== 'preview') {
        setPreviewModeRaw('preview');
        previewModeRef.current = 'preview';
        isEditorMountedRef.current = false;
      } else if (targetTab.name === '서식 정의 미리보기.md' && previewModeRef.current !== 'css-style') {
        setPreviewModeRaw('css-style');
        previewModeRef.current = 'css-style';
        isEditorMountedRef.current = true;
      } else if (previewModeRef.current === 'preview' || previewModeRef.current === 'css-style') {
        const prevTab = tabsRef.current.find(t => t.id === activeTabIdRef.current);
        if (prevTab && (prevTab.name === '도움말.md' || prevTab.name === '서식 정의 미리보기.md')) {
          setPreviewModeRaw('both');
          previewModeRef.current = 'both';
          isEditorMountedRef.current = true;
        }
      }
    }

    const monaco = (window as any).monaco;
    const editor = editorRef.current;

    if (editor && activeTabIdRef.current) {
      const currentScrollTop = editor.getScrollTop();
      setTabs(prev => prev.map(t => t.id === activeTabIdRef.current ? { ...t, scrollTop: currentScrollTop } : t));
    }

    // 현재 탭의 에디터 내용을 React 상태에 동기화 (모드 전환 시 데이터 유실 방지)
    if (editor && (previewModeRef.current === 'css-style' || previewModeRef.current === 'preview')) {
      const latestVal = editor.getValue();
      if (activeTabIdRef.current) {
        setTabs(prev => prev.map(t => t.id === activeTabIdRef.current ? { ...t, content: latestVal } : t));
      }
    }

    setActiveTabId(tabId);

    if (!targetTab) return;

    setContent(targetTab.content);
    setCurrentFileName(targetTab.name);
    setCurrentFileNode(targetTab.node);

    if (editor && monaco && targetTab.model && !targetTab.model.isDisposed()) {
      editor.setModel(targetTab.model);
      if (targetTab.scrollTop !== undefined) {
        requestAnimationFrame(() => {
          editor.setScrollTop(targetTab.scrollTop || 0);
        });
      }
    } else if (editor) {
      editor.setValue(targetTab.content);
    }
  }, [editorRef, setContent, setCurrentFileName, setCurrentFileNode, previewModeRef, setPreviewModeRaw, isEditorMountedRef]);

  // ====================================================================
  // 📊 [OMD-FILE-USEEDITORTABS-0001 ✅ FIXED] useEditorTabs.ts ➔ createNewTab
  // 🎯 @KICK  : 새 탭을 생성하고 Monaco 모델을 만들어 에디터에 연결. 탭 종류/출발 탭에 따라 모드 자동 전환
  // 🛡️ @GUARD : monaco 미존재 시 모델 없이 탭만 생성; 도움말 탭 생성 시 preview 강제, css-style 출발 시 both 복원
  // 🚨 @PATCH : 모드 자동 전환 로직 추가; prevTabId를 modeTransition 이전에 캡처하도록 순서 수정 (2026-06-17); onDidChangeContent 핸들러 isModified: true → val !== t.content 비교로 전환 (2026-06-18)
  // 🔗 @CALLS : getWelcomeContent, setContent, setTabs, setActiveTabId, setCurrentFileName, setCurrentFileNode, setPreviewModeRaw
  // ====================================================================
  const createNewTab = useCallback((initialContent?: string, name?: string) => {
    const monaco = (window as any).monaco;
    const contentVal = initialContent !== undefined ? initialContent : getWelcomeContent();
    const tabName = name || '새 파일.md';
    const tabId = 'new-tab-' + Date.now();

    let model: any = null;
    if (monaco) {
      model = monaco.editor.createModel(contentVal, 'markdown');
      model.onDidChangeContent(() => {
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
      model: model
    };

    if (setPreviewModeRaw) {
      const prevTabId = activeTabIdRef.current;
      const prevTab = tabsRef.current.find(t => t.id === prevTabId);
      const isFromHelp = prevTab?.name === '도움말.md';
      const isFromCssStyle = prevTab?.name === '서식 정의 미리보기.md' && previewModeRef.current === 'css-style';

      if (tabName === '도움말.md' || tabName.startsWith('도움말 - ')) {
        setPreviewModeRaw('preview');
        previewModeRef.current = 'preview';
        isEditorMountedRef.current = false;
      } else if (tabName === '서식 정의 미리보기.md') {
        setPreviewModeRaw('css-style');
        previewModeRef.current = 'css-style';
        isEditorMountedRef.current = true;
      } else if (isFromHelp || previewModeRef.current === 'preview') {
        setPreviewModeRaw('preview');
        previewModeRef.current = 'preview';
        isEditorMountedRef.current = false;
      } else if (isFromCssStyle) {
        setPreviewModeRaw('both');
        previewModeRef.current = 'both';
        isEditorMountedRef.current = true;
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
  }, [editorRef, setContent, setCurrentFileName, setCurrentFileNode, previewModeRef, setPreviewModeRaw, isEditorMountedRef]);

  return {
    tabsRef,
    activeTabIdRef,
    updateContent,
    switchTab,
    createNewTab
  };
};
