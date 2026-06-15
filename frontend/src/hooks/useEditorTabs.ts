// @ts-nocheck
import { useRef, useEffect, useCallback } from 'react';
import { EditorTab } from '@/components/UnifiedTabBar';
import { FileNode } from '@/lib/helper';
import { getWelcomeContent } from "@/constants/welcomeContent";
import { vfsReadFile } from '@/lib/vfsHelper';
import { getApiUrl } from '@/lib/api';

/**
 * [ONR-16-001] useEditorTabs 커스텀 훅
 * @description Monaco Editor의 가상 모델 다중 탭 관리와 관련된 상태 및 로직을 통합 관리합니다.
 * @note tabs/setTabs/activeTabId/setActiveTabId는 외부(MainEditorApp)에서 주입받습니다.
 *       TDZ 방지를 위해 최상위 컴포넌트에서 상태를 선언하고 훅에 전달합니다.
 */
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
  setActiveTabId: (id: string | null) => void
) => {
  const tabsRef = useRef<EditorTab[]>([]);
  const activeTabIdRef = useRef<string | null>(null);

  useEffect(() => { tabsRef.current = tabs; }, [tabs]);
  useEffect(() => { activeTabIdRef.current = activeTabId; }, [activeTabId]);

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

  const switchTab = useCallback((tabId: string) => {
    const monaco = (window as any).monaco;
    const editor = editorRef.current;

    if (editor && activeTabIdRef.current) {
      const currentScrollTop = editor.getScrollTop();
      setTabs(prev => prev.map(t => t.id === activeTabIdRef.current ? { ...t, scrollTop: currentScrollTop } : t));
    }

    setActiveTabId(tabId);

    const targetTab = tabsRef.current.find(t => t.id === tabId);
    if (!targetTab) return;

    setContent(targetTab.content);
    setCurrentFileName(targetTab.name);
    setCurrentFileNode(targetTab.node);

    if (editor && monaco && targetTab.model) {
      editor.setModel(targetTab.model);
      if (targetTab.scrollTop !== undefined) {
        requestAnimationFrame(() => {
          editor.setScrollTop(targetTab.scrollTop || 0);
        });
      }
    } else if (editor) {
      editor.setValue(targetTab.content);
    }
  }, [editorRef, setContent, setCurrentFileName, setCurrentFileNode]);

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
        setTabs(prev => prev.map(t => t.id === tabId ? { ...t, content: val, isModified: true } : t));
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
  }, [editorRef, setContent, setCurrentFileName, setCurrentFileNode]);

  return {
    tabsRef,
    activeTabIdRef,
    updateContent,
    switchTab,
    createNewTab
  };
};
