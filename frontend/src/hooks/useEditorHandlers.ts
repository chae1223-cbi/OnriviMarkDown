// @ts-nocheck
import { useCallback } from 'react';
import { exportPDF, exportHTML, exportEPUB, exportPNG } from '@/lib/exportHandlers';
import { DEFAULT_PROFILE } from "@/constants/cssProfile";
import { vfsWriteFile } from '@/lib/vfsHelper';
import { getApiUrl } from '@/lib/api';
import { stripFrontmatter } from "@/lib/editorUtils";

/**
 * [ONR-16-004] useEditorHandlers 커스텀 훅
 * @description 에디터의 주요 액션 핸들러(파일 저장, 내보내기, 서식 삽입 등)를 분리 관리합니다.
 */
// ====================================================================
// 📊 [OMD-EDIT-USEEDITORHANDLERS-0014] useEditorHandlers.ts ➔ useEditorHandlers
// 🎯 @KICK  : 에디터 주요 액션 핸들러(저장, 내보내기, 서식 삽입 등)를 통합 관리
// 🛡️ @GUARD : 각 핸들러별 editorRef/selection/model 방어 로직; previewRef 누락 시 export early return
// 🚨 @PATCH : **2026-06-19** — 인쇄/PDF 기능 통합 처리: print 핸들러 실행 시 window.print() 인쇄 팝업 대신 직접 PDF 파일 저장 기능(exportPDF)을 다이렉트로 수행하도록 패치; exportPDF 호출 시 누락되었던 dynamicCssString(활성 CSS 프로필) 매개변수를 추가 전달하도록 패치; previewRef/setIsSettingsModalOpen 누락 복원 등
// 🔗 @CALLS : exportPDF, exportHTML, exportEPUB, exportPNG, vfsWriteFile, stripFrontmatter, sanitizePastedText, previewRef, setIsSettingsModalOpen
// ====================================================================
export const useEditorHandlers = ({
  editorRef,
  contentRef,
  currentFileNameRef,
  currentFileNodeRef,
  workspaceTypeRef,
  rootFolderRef,
  lastSavedContentRef,
  currentFileParentHandleRef,
  profiles,
  activeProfileId,
  isDarkMode,
  dynamicCssString,
  setSaveStatus,
  setCurrentFileName,
  setCurrentFileNode,
  setRootFolder,
  setWorkspaceType,
  setIsSidebarOpen,
  setIsExportModalOpen,
  setIsYoutubeModalOpen,
  setIsMapModalOpen,
  setIsTableModalOpen,
  setIsFormulaModalOpen,
  setIsSearchOpen,
  setIsAboutModalOpen,
  setIsLicenseModalOpen,
  setIsSettingsModalOpen,
  setIsImageModalOpen,
  setEditingImageInfo,
  setSettingsModalInitialTab,
  setFontSize,
  setHelpTitle,
  setHelpContent,
  setFloatingToolbar,
  setPromptConfig,
  showToast,
  refreshFileList,
  updateContent,
  wrapSelection,
  insertAtCursor,
  applyLinePrefix,
  removePrefix,
  insertLink,
  quickWrap,
  insertBlockTag,
  setShowDocLinkPicker,
  sanitizePastedText,
  isComposingRef,
  previewRef,
  createNewTab,
  switchTab,
  setTabs,
  activeTabIdRef,
}: any) => {

  const handlers = {
    // ====================================================================
    // 📊 [OMD-EDIT-USEEDITORHANDLERS-0013] useEditorHandlers.ts ➔ footnote
    // 🎯 @KICK  : 각주 참조 및 정의를 문서 끝에 자동 생성하여 삽입
    // 🛡️ @GUARD : editorRef, monaco, model, selection, position 존재 여부 확인
    // 🚨 @PATCH : 없음
    // 🔗 @CALLS : showToast
    // ====================================================================
    footnote: () => {
      if (!editorRef.current || typeof window === 'undefined' || !(window as any).monaco) return;
      const editor = editorRef.current;
      const model = editor.getModel();
      if (!model) return;

      const selection = editor.getSelection();
      const position = editor.getPosition();
      if (!position || !selection) return;

      const fullText = model.getValue();
      const footnoteRegex = /\[\^(\d+)\]/g;
      let maxNumber = 0;
      let match;
      while ((match = footnoteRegex.exec(fullText)) !== null) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) {
          maxNumber = num;
        }
      }
      const nextNumber = maxNumber + 1;
      const footnoteRef = `[^${nextNumber}]`;
      const footnoteDef = `\n\n[^${nextNumber}]: `;

      editor.pushUndoStop();
      const Range = (window as any).monaco.Range;
      
      const range = new Range(
        selection.startLineNumber,
        selection.startColumn,
        selection.endLineNumber,
        selection.endColumn
      );
      
      const lineCount = model.getLineCount();
      const lastLineLength = model.getLineLength(lineCount);
      const lastLineRange = new Range(
        lineCount,
        lastLineLength + 1,
        lineCount,
        lastLineLength + 1
      );

      editor.executeEdits("insertFootnote", [
        {
          range: range,
          text: footnoteRef,
          forceMoveMarkers: true
        },
        {
          range: lastLineRange,
          text: footnoteDef,
          forceMoveMarkers: true
        }
      ]);
      editor.pushUndoStop();

      setTimeout(() => {
        const newLineCount = model.getLineCount();
        const newLastLineLength = model.getLineLength(newLineCount);
        editor.setPosition({
          lineNumber: newLineCount,
          column: newLastLineLength + 1
        });
        editor.focus();
      }, 20);
    },
    // ====================================================================
    // 📊 [OMD-EDIT-USEEDITORHANDLERS-0012] useEditorHandlers.ts ➔ insertText
    // 🎯 @KICK  : 커서 위치에 임의 텍스트를 삽입 (슬래시 명령어 등에서 호출)
    // 🛡️ @GUARD : editorRef 존재 여부 확인
    // 🚨 @PATCH : 없음
    // 🔗 @CALLS : 없음
    // ====================================================================
    insertText: (text: string) => {
      if (!editorRef.current) return;
      const position = editorRef.current.getPosition();
      editorRef.current.executeEdits("insertText", [{
        range: new (window as any).monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
        text: text,
        forceMoveMarkers: true
      }]);
      editorRef.current.focus();
    },
    // ====================================================================
    // 📊 [OMD-EDIT-USEEDITORHANDLERS-0011] useEditorHandlers.ts ➔ cleanDoc
    // 🎯 @KICK  : 문서 내 HTML 브레이크 태그 등을 일괄 정리하여 순수 마크다운 유지
    // 🛡️ @GUARD : editorRef 존재 여부, 정리할 내용이 없으면 안내 메시지
    // 🚨 @PATCH : 없음
    // 🔗 @CALLS : sanitizePastedText, showToast
    // ====================================================================
    cleanDoc: () => {
      if (!editorRef.current) return;
      const editor = editorRef.current;

      const textarea = editor.getDomNode()?.querySelector('textarea');
      if (textarea) {
        textarea.blur();
        textarea.focus();
      }
      isComposingRef.current = false;

      const text = editor.getValue();
      const cleanedText = sanitizePastedText(text, true);
      if (text !== cleanedText) {
        editor.pushUndoStop();
        editor.executeEdits("cleanDoc", [{
          range: editor.getModel().getFullModelRange(),
          text: cleanedText
        }]);
        editor.pushUndoStop();
        showToast("문서 내 서식(<br> 태그 등)이 일괄 정리되었습니다.", "success");
      } else {
        showToast("정리할 서식이 없습니다.", "info");
      }
    },
    // ====================================================================
    // 📊 [OMD-EDIT-USEEDITORHANDLERS-0010] useEditorHandlers.ts ➔ copyAll
    // 🎯 @KICK  : 에디터 전체 마크다운 내용을 클립보드에 복사
    // 🛡️ @GUARD : contentRef 존재 여부, 클립보드 API 실패 시 오류 토스트
    // 🚨 @PATCH : 없음
    // 🔗 @CALLS : showToast
    // ====================================================================
    copyAll: async () => {
      const rawMarkdown = contentRef.current || "";
      if (rawMarkdown) {
        try {
          await navigator.clipboard.writeText(rawMarkdown);
          showToast("에디터의 원본 마크다운 전체 내용이 클립보드에 복사되었습니다.", "success");
        } catch (err) {
          showToast("마크다운 복사에 실패했습니다.", "error");
        }
      } else {
        showToast("복사할 마크다운 내용이 없습니다.", "info");
      }
    },
    // ====================================================================
    // 📊 [OMD-EDIT-USEEDITORHANDLERS-0009] useEditorHandlers.ts ➔ newFile
    // 🎯 @KICK  : 새 빈 문서를 생성하고 워크스페이스 사이드바를 활성화
    // 🛡️ @GUARD : 없음
    // 🚨 @PATCH : 없음
    // 🔗 @CALLS : updateContent, showToast
    // ====================================================================
    newFile: () => {
      updateContent('');
      setCurrentFileName('새 파일.md');
      setCurrentFileNode(null);
      lastSavedContentRef.current = '';
      setIsSidebarOpen(true);
      showToast("새 문서를 시작합니다.", "info");
    },
    // ====================================================================
    // 📊 [OMD-EDIT-USEEDITORHANDLERS-0008] useEditorHandlers.ts ➔ save
    // 🎯 @KICK  : 현재 문서를 Electron/웹/브라우저 환경에 맞게 저장
    // 🛡️ @GUARD : fileNode 경로/핸들 존재 여부, 저장 실패 시 fallback 처리
    // 🚨 @PATCH : 없음
    // 🔗 @CALLS : refreshFileList, showToast, vfsWriteFile, setPromptConfig
    // ====================================================================
    save: async () => {
      const api = (window as any).electronAPI;
      setSaveStatus('saving');

      const fileNode = currentFileNodeRef.current;
      const fileName = currentFileNameRef.current;
      const wType = workspaceTypeRef.current;
      const currentVal = contentRef.current;

      const hasPathOrHandle = fileNode && (fileNode.path || fileNode.handle);
      if (hasPathOrHandle && fileName !== '새 파일.md') {
        if (api) {
          try {
            const success = await api.saveFile(fileNode.path, currentVal);
            if (success) {
              lastSavedContentRef.current = currentVal;
              setSaveStatus('saved');
              setTabs(prev => prev.map(t => t.id === activeTabIdRef.current ? { ...t, isModified: false } : t));
              showToast("현재 파일에 안전하게 저장되었습니다.", "success");
              return;
            }
          } catch (e) {
            setSaveStatus('unsaved');
            showToast("저장 실패: " + e, 'error');
            return;
          }
        } else if (wType === 'local') {
          try {
            const res = await fetch(getApiUrl('/api/save'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ path: fileNode.path, content: currentVal })
            });
            if (res.ok) {
              lastSavedContentRef.current = currentVal;
              setSaveStatus('saved');
              setTabs(prev => prev.map(t => t.id === activeTabIdRef.current ? { ...t, isModified: false } : t));
              showToast("현재 파일에 안전하게 저장되었습니다.", "success");
              return;
            }
          } catch (e: any) {
            setSaveStatus('unsaved');
            showToast("저장 실패: " + e.message, 'error');
            return;
          }
        } else if (wType === 'browser') {
          if (fileNode.handle) {
            try {
              const writable = await fileNode.handle.createWritable();
              await writable.write(currentVal);
              await writable.close();
              lastSavedContentRef.current = currentVal;
              setSaveStatus('saved');
              setTabs(prev => prev.map(t => t.id === activeTabIdRef.current ? { ...t, isModified: false } : t));
              showToast("현재 파일에 안전하게 저장되었습니다.", "success");
              return;
            } catch (e: any) {
              setSaveStatus('unsaved');
              showToast("저장 실패: " + e.message, 'error');
              return;
            }
          } else {
            vfsWriteFile(fileNode.path, currentVal);
            lastSavedContentRef.current = currentVal;
            setSaveStatus('saved');
            setTabs(prev => prev.map(t => t.id === activeTabIdRef.current ? { ...t, isModified: false } : t));
            showToast("현재 파일에 안전하게 저장되었습니다.", "success");
            return;
          }
        }
      }

      if (api) {
        try {
          const suggestedName = fileName !== '새 파일.md' ? fileName : undefined;
          const defaultDir = rootFolderRef.current?.name && rootFolderRef.current.name !== '브라우저 스토리지' ? rootFolderRef.current.name : undefined;
          const file = await api.saveFileAs(currentVal, suggestedName, defaultDir);
          if (file) {
            const normalizedPath = file.path.replace(/\\/g, '/');
            const parentPath = normalizedPath.includes('/')
              ? normalizedPath.substring(0, normalizedPath.lastIndexOf('/'))
              : '';
            const osParentPath = parentPath.replace(/\//g, '\\');
            setRootFolder({ name: osParentPath });
            setWorkspaceType('local');
            localStorage.setItem('rootFolder', JSON.stringify({ name: osParentPath }));
            localStorage.setItem('workspaceType', 'local');
            setCurrentFileName(file.name);
            setCurrentFileNode({ name: file.name, kind: 'file', path: file.path });
            lastSavedContentRef.current = currentVal;
            setSaveStatus('saved');
            setTabs(prev => prev.map(t => t.id === activeTabIdRef.current ? { ...t, isModified: false } : t));
            await refreshFileList();
            showToast(`'${file.name}' 저장 완료 · 워크스페이스 → ${osParentPath}`, 'success');
          } else {
            setSaveStatus('unsaved');
          }
        } catch (e) {
          setSaveStatus('unsaved');
          showToast("저장 실패: " + e, 'error');
        }
      } else if (typeof (window as any).showSaveFilePicker === 'function') {
        try {
          const suggestedName = fileName !== '새 파일.md' ? fileName : 'untitled.md';

          let startIn: any = undefined;
          if (currentFileParentHandleRef.current) {
            startIn = currentFileParentHandleRef.current;
          } else if (fileNode?.handle) {
            startIn = fileNode.handle;
          } else if (rootFolderRef.current?.handle) {
            startIn = rootFolderRef.current.handle;
          }

          const fileHandle = await (window as any).showSaveFilePicker({
            suggestedName,
            excludeAcceptAllOption: true,
            startIn,
            types: [{
              description: 'Markdown Files (*.md)',
              accept: {
                'text/markdown': ['.md', '.markdown'],
                'text/plain': ['.md', '.markdown']
              }
            }]
          });

          const writable = await fileHandle.createWritable();
          await writable.write(currentVal);
          await writable.close();

          setCurrentFileName(fileHandle.name);
          setCurrentFileNode({ name: fileHandle.name, kind: 'file', handle: fileHandle });
          lastSavedContentRef.current = currentVal;
          setSaveStatus('saved');
          setTabs(prev => prev.map(t => t.id === activeTabIdRef.current ? { ...t, isModified: false } : t));
          await refreshFileList();
          showToast(`'${fileHandle.name}' 파일이 저장되었습니다.`, 'success');
        } catch (e: any) {
          if (e.name !== 'AbortError') {
            setSaveStatus('unsaved');
            showToast("저장 실패: " + e.message, 'error');
          } else {
            setSaveStatus('unsaved');
          }
        }
      } else if (typeof (window as any).showDirectoryPicker === 'function') {
        try {
          const dirHandle = await (window as any).showDirectoryPicker();
          const folderName = dirHandle.name;
          setRootFolder({ name: folderName, handle: dirHandle });
          setWorkspaceType('browser');
          localStorage.setItem('rootFolder', JSON.stringify({ name: folderName }));
          localStorage.setItem('workspaceType', 'browser');
          setSaveStatus('unsaved');
          showToast(`워크스페이스가 '${folderName}'(으)로 설정됨`, 'success');
          setPromptConfig({
            isOpen: true,
            title: '파일명 입력',
            defaultValue: fileName === '새 파일.md' ? 'untitled.md' : fileName,
            type: 'createFile',
            error: ""
          });
        } catch (e: any) {
          if (e.name !== 'AbortError') {
            setSaveStatus('unsaved');
            showToast("폴더 선택 실패", 'error');
          } else {
            setSaveStatus('unsaved');
          }
        }
      } else {
        setPromptConfig({
          isOpen: true,
          title: '새 파일 생성',
          defaultValue: fileName,
          type: 'createFile',
          error: ""
        });
        setSaveStatus('unsaved');
      }
    },

    // ====================================================================
    // 📊 [OMD-EDIT-USEEDITORHANDLERS-0007] useEditorHandlers.ts ➔ saveAs
    // 🎯 @KICK  : 새 경로/파일명으로 문서를 다른 이름으로 저장
    // 🛡️ @GUARD : Electron/File System Access/폴더 선택 각 환경별 예외 처리
    // 🚨 @PATCH : 없음
    // 🔗 @CALLS : refreshFileList, showToast, setPromptConfig
    // ====================================================================
    saveAs: async () => {
      const api = (window as any).electronAPI;
      const fileName = currentFileNameRef.current;
      const fileNode = currentFileNodeRef.current;
      const rootFld = rootFolderRef.current;
      const currentVal = contentRef.current;

      const suggestedName = fileName !== '새 파일.md' ? fileName : undefined;
      const defaultDir = rootFld?.name && rootFld.name !== '브라우저 스토리지' ? rootFld.name : undefined;

      setSaveStatus('saving');

      if (api) {
        try {
          const file = await api.saveFileAs(currentVal, suggestedName, defaultDir);
          if (file) {
            const normalizedPath = file.path.replace(/\\/g, '/');
            const parentPath = normalizedPath.includes('/')
              ? normalizedPath.substring(0, normalizedPath.lastIndexOf('/'))
              : '';
            const osParentPath = parentPath.replace(/\//g, '\\');
            setRootFolder({ name: osParentPath });
            setWorkspaceType('local');
            localStorage.setItem('rootFolder', JSON.stringify({ name: osParentPath }));
            localStorage.setItem('workspaceType', 'local');
            setCurrentFileName(file.name);
            setCurrentFileNode({ name: file.name, kind: 'file', path: file.path });
            lastSavedContentRef.current = currentVal;
            setSaveStatus('saved');
            await refreshFileList();
            showToast(`'${file.name}' 저장 완료`, 'success');
          } else {
            setSaveStatus('unsaved');
          }
        } catch (e) {
          setSaveStatus('unsaved');
          showToast("저장 실패: " + e, 'error');
        }
      } else if (typeof (window as any).showSaveFilePicker === 'function') {
        try {
          let startIn: any = undefined;
          if (currentFileParentHandleRef.current) {
            startIn = currentFileParentHandleRef.current;
          } else if (fileNode?.handle) {
            startIn = fileNode.handle;
          } else if (rootFld?.handle) {
            startIn = rootFld.handle;
          }

          const fileHandle = await (window as any).showSaveFilePicker({
            suggestedName: suggestedName || 'untitled.md',
            excludeAcceptAllOption: true,
            startIn,
            types: [{
              description: 'Markdown Files (*.md)',
              accept: {
                'text/markdown': ['.md', '.markdown'],
                'text/plain': ['.md', '.markdown']
              }
            }]
          });

          const writable = await fileHandle.createWritable();
          await writable.write(currentVal);
          await writable.close();

          setCurrentFileName(fileHandle.name);
          setCurrentFileNode({ name: fileHandle.name, kind: 'file', handle: fileHandle });
          lastSavedContentRef.current = currentVal;
          setSaveStatus('saved');
          await refreshFileList();
          showToast(`'${fileHandle.name}' 파일이 저장되었습니다.`, 'success');
        } catch (e: any) {
          if (e.name !== 'AbortError') {
            setSaveStatus('unsaved');
            showToast("저장 실패: " + e.message, 'error');
          } else {
            setSaveStatus('unsaved');
          }
        }
      } else if (typeof (window as any).showDirectoryPicker === 'function') {
        try {
          const dirHandle = await (window as any).showDirectoryPicker();
          const folderName = dirHandle.name;
          setRootFolder({ name: folderName, handle: dirHandle });
          setWorkspaceType('browser');
          localStorage.setItem('rootFolder', JSON.stringify({ name: folderName }));
          localStorage.setItem('workspaceType', 'browser');
          setSaveStatus('unsaved');
          showToast(`워크스페이스가 '${folderName}'(으)로 변경됨`, 'info');
          setPromptConfig({
            isOpen: true,
            title: '파일명 입력',
            defaultValue: suggestedName || '',
            type: 'createFile',
            error: ""
          });
        } catch (e: any) {
          if (e.name !== 'AbortError') {
            setSaveStatus('unsaved');
            showToast("저장 실패: " + (e.message || e), 'error');
          } else {
            setSaveStatus('unsaved');
          }
        }
      } else {
        setPromptConfig({
          isOpen: true,
          title: "다른 이름으로 저장",
          defaultValue: fileName,
          type: 'createFile',
          error: ""
        });
        setSaveStatus('unsaved');
      }
    },
    openExport: () => setIsExportModalOpen(true),
    print: async () => {
      if (!previewRef.current) return;
      const activeProfile = profiles.find(p => p.id === activeProfileId) || DEFAULT_PROFILE;
      const orientation = activeProfile.pageStyle.orientation as 'portrait' | 'landscape';
      const { marginTop, marginBottom, marginLeft, marginRight, backgroundColor, paperSize } = activeProfile.pageStyle;
      await exportPDF({ previewEl: previewRef.current, currentFileName: currentFileNameRef.current, isDarkMode, showToast, orientation, paperSize, dynamicCssString, marginTop, marginBottom, marginLeft, marginRight, backgroundColor });
    },
    exportPDF: async () => {
      if (!previewRef.current) return;
      const activeProfile = profiles.find(p => p.id === activeProfileId) || DEFAULT_PROFILE;
      const orientation = activeProfile.pageStyle.orientation as 'portrait' | 'landscape';
      const { marginTop, marginBottom, marginLeft, marginRight, backgroundColor, paperSize } = activeProfile.pageStyle;
      await exportPDF({ previewEl: previewRef.current, currentFileName: currentFileNameRef.current, isDarkMode, showToast, orientation, paperSize, dynamicCssString, marginTop, marginBottom, marginLeft, marginRight, backgroundColor });
    },
    exportHTML: async () => {
      if (!previewRef.current) return;
      const activeProfile = profiles.find(p => p.id === activeProfileId) || DEFAULT_PROFILE;
      const orientation = activeProfile.pageStyle.orientation as 'portrait' | 'landscape';
      const { marginTop, marginBottom, marginLeft, marginRight, backgroundColor, paperSize } = activeProfile.pageStyle;
      await exportHTML({ 
        previewEl: previewRef.current, 
        currentFileName: currentFileNameRef.current, 
        isDarkMode, 
        showToast, 
        orientation, 
        paperSize, 
        dynamicCssString, 
        marginTop, 
        marginBottom, 
        marginLeft, 
        marginRight, 
        backgroundColor 
      });
    },
    exportEPUB: async () => {
      if (!previewRef.current) return;
      const activeProfile = profiles.find(p => p.id === activeProfileId) || DEFAULT_PROFILE;
      await exportEPUB({ previewEl: previewRef.current, currentFileName: currentFileNameRef.current, isDarkMode, showToast, dynamicCssString, backgroundColor: activeProfile.pageStyle.backgroundColor });
    },
    exportPNG: async () => {
      if (!previewRef.current) return;
      const activeProfile = profiles.find(p => p.id === activeProfileId) || DEFAULT_PROFILE;
      const orientation = activeProfile.pageStyle.orientation as 'portrait' | 'landscape';
      const { marginTop, marginBottom, marginLeft, marginRight, backgroundColor, paperSize } = activeProfile.pageStyle;
      await exportPNG({ 
        previewEl: previewRef.current, 
        currentFileName: currentFileNameRef.current, 
        isDarkMode, 
        showToast, 
        orientation, 
        paperSize, 
        dynamicCssString, 
        marginTop, 
        marginBottom, 
        marginLeft, 
        marginRight, 
        backgroundColor 
      });
    },
    exit: () => window.confirm("종료하시겠습니까?") && window.close(),
    undo: () => editorRef.current?.trigger('keyboard', 'undo', null),
    redo: () => editorRef.current?.trigger('keyboard', 'redo', null),
    find: () => editorRef.current?.getAction('actions.find').run(),
    replace: () => editorRef.current?.getAction('editor.action.startFindReplaceAction').run(),
    bold: () => wrapSelection('**', '**', '텍스트'),
    italic: () => wrapSelection('*', '*', '텍스트'),
    inlineCode: () => wrapSelection('`', '`', '코드'),
    underline: () => wrapSelection('<u>', '</u>', '텍스트'),
    strikethrough: () => wrapSelection('~~', '~~', '텍스트'),
    h1: () => wrapSelection('# ', '', '제목'),
    h2: () => wrapSelection('## ', '', '제목'),
    h3: () => wrapSelection('### ', '', '제목'),
    h4: () => wrapSelection('#### ', '', '제목'),
    h5: () => wrapSelection('##### ', '', '제목'),
    h6: () => wrapSelection('###### ', '', '제목'),
    hr: () => insertAtCursor('\n---\n'),
    orderedList: () => applyLinePrefix('orderedList'),
    list: () => applyLinePrefix('list'),
    quote: () => applyLinePrefix('quote'),
    check: () => applyLinePrefix('check'),
    removePrefix: () => removePrefix(),
    link: () => insertLink(),
    doclink: () => setShowDocLinkPicker(prev => !prev),
    // ====================================================================
    // 📊 [OMD-EDIT-USEEDITORHANDLERS-0006] useEditorHandlers.ts ➔ image
    // 🎯 @KICK  : 이미지 마크다운 구문을 파싱하여 이미지 편집 모달 열기
    // 🛡️ @GUARD : editorRef, selection, model 존재 여부 확인
    // 🚨 @PATCH : setEditingImageInfo, setIsImageModalOpen 매개변수 누락으로 이미지 모달 미오픈 수정
    // 🔗 @CALLS : setEditingImageInfo, setIsImageModalOpen
    // ====================================================================
    image: () => {
      const editor = editorRef.current;
      if (editor) {
        const selection = editor.getSelection();
        const model = editor.getModel();
        if (selection && model) {
          let text = model.getValueInRange(selection);
          let range = selection;

          if (!text.trim()) {
            const lineNumber = selection.startLineNumber;
            const lineContent = model.getLineContent(lineNumber);
            const match = lineContent.match(/!\[([^\]]*)\]\(([^)]*)\)/);
            if (match) {
              const startCol = lineContent.indexOf(match[0]) + 1;
              const endCol = startCol + match[0].length;
              range = new (window as any).monaco.Range(lineNumber, startCol, lineNumber, endCol);
              text = match[0];
            }
          }

          const match = text.match(/!\[([^\]]*)\]\(([^)]*)\)/);
          if (match) {
            const alt = match[1];
            const fullPath = match[2];
            let path = fullPath;
            let width = '';
            let height = '';

            const widthMatch = fullPath.match(/[\?&]width=([^&]*)/);
            if (widthMatch) {
              width = decodeURIComponent(widthMatch[1]);
            }
            const heightMatch = fullPath.match(/[\?&]height=([^&]*)/);
            if (heightMatch) {
              height = decodeURIComponent(heightMatch[1]);
            }
            const alignMatch = fullPath.match(/[\?&]align=([^&]*)/);
            const align = alignMatch ? decodeURIComponent(alignMatch[1]) : 'center';
            path = fullPath.replace(/[\?&](?:width|height|align)=[^&]*/g, '');

            setEditingImageInfo({
              range,
              alt,
              path,
              width,
              height,
              align
            });
            setIsImageModalOpen(true);
            return;
          }
        }
      }

      setEditingImageInfo(null);
      setIsImageModalOpen(true);
    },
    video: () => setIsYoutubeModalOpen(true),
    youtube: () => setIsYoutubeModalOpen(true),
    now: () => insertAtCursor(new Date().toLocaleString()),
    map: () => setIsMapModalOpen(true),
    table: () => setIsTableModalOpen(true),
    quickTable: () => insertAtCursor('| 구분 | 데이터 1 | 데이터 2 |\n| --- | --- | --- |\n| 항목A | 100 | 200 |\n| 항목B | 300 | 400 |\n'),
    // ====================================================================
    // 📊 [OMD-EDIT-USEEDITORHANDLERS-0005] useEditorHandlers.ts ➔ insertTableRow
    // 🎯 @KICK  : 편집 중인 표 아래에 새 행을 추가하여 데이터 입력 공간 확보
    // 🛡️ @GUARD : editorRef, position, model 존재 여부 및 표 행 여부 확인
    // 🚨 @PATCH : 없음
    // 🔗 @CALLS : showToast
    // ====================================================================
    insertTableRow: () => {
      if (!editorRef.current) return;
      const editor = editorRef.current;
      const position = editor.getPosition();
      if (!position) return;
      const model = editor.getModel();
      if (!model) return;

      const lineText = model.getLineContent(position.lineNumber);
      const trimmed = lineText.trim();
      if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) {
        showToast("커서가 표 행에 위치해야 행을 추가할 수 있습니다.", "warning");
        return;
      }

      const cells = trimmed.split(/(?<!\\)\|/);
      const cellCount = cells.length - 2;

      if (cellCount < 1) return;

      const newRowText = '\n|' + '  |'.repeat(cellCount);
      const lineMaxColumn = model.getLineMaxColumn(position.lineNumber);
      const Range = (window as any).monaco.Range;
      const Selection = (window as any).monaco.Selection;

      editor.executeEdits("insertTableRow", [{
        range: new Range(position.lineNumber, lineMaxColumn, position.lineNumber, lineMaxColumn),
        text: newRowText,
        forceMoveMarkers: true
      }]);

      const nextLineNumber = position.lineNumber + 1;
      editor.setSelection(new Selection(
        nextLineNumber, 3,
        nextLineNumber, 3
      ));
      editor.focus();
      showToast("표 행이 추가되었습니다.", "info");
    },
    // ====================================================================
    // 📊 [OMD-EDIT-USEEDITORHANDLERS-0004] useEditorHandlers.ts ➔ deleteTableRow
    // 🎯 @KICK  : 편집 중인 표에서 현재 커서가 위치한 행을 삭제
    // 🛡️ @GUARD : editorRef, position, model 존재 여부 및 표 행 여부 확인
    // 🚨 @PATCH : 없음
    // 🔗 @CALLS : showToast
    // ====================================================================
    deleteTableRow: () => {
      if (!editorRef.current) return;
      const editor = editorRef.current;
      const position = editor.getPosition();
      if (!position) return;
      const model = editor.getModel();
      if (!model) return;

      const lineText = model.getLineContent(position.lineNumber);
      const trimmed = lineText.trim();
      if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) {
        showToast("커서가 표 행에 위치해야 행을 삭제할 수 있습니다.", "warning");
        return;
      }

      const maxColumn = model.getLineMaxColumn(position.lineNumber);
      let startLine = position.lineNumber;
      let startColumn = 1;
      let endLine = position.lineNumber;
      let endColumn = maxColumn;

      if (position.lineNumber < model.getLineCount()) {
        endLine = position.lineNumber + 1;
        endColumn = 1;
      } else if (position.lineNumber > 1) {
        startLine = position.lineNumber - 1;
        startColumn = model.getLineMaxColumn(startLine);
      }

      const Range = (window as any).monaco.Range;
      editor.executeEdits("deleteTableRow", [{
        range: new Range(startLine, startColumn, endLine, endColumn),
        text: "",
        forceMoveMarkers: true
      }]);

      editor.focus();
      showToast("표 행이 삭제되었습니다.", "info");
    },
    code: () => insertBlockTag('```javascript', '```', '코드'),
    chart: () => insertBlockTag('```mermaid', '```', '그래프'),
    math: () => setIsFormulaModalOpen(true),
    latex: () => setIsFormulaModalOpen(true),
    zoomIn: () => setFontSize(prev => Math.min(prev + 2, 32)),
    zoomOut: () => setFontSize(prev => Math.max(prev - 2, 12)),
    globalSearch: () => setIsSearchOpen(true),
    settings: (tab: 'editor' | 'app' | 'shortcuts' = 'editor') => {
      setSettingsModalInitialTab(tab);
      setIsSettingsModalOpen(true);
    },
    about: () => setIsAboutModalOpen(true),
    // ====================================================================
    // 📊 [OMD-EDIT-USEEDITORHANDLERS-0003] useEditorHandlers.ts ➔ help
    // 🎯 @KICK  : 도움말 문서를 Electron/웹 환경에서 읽어와 별도 탭으로 표시
    // 🛡️ @GUARD : api.readFromPath / fetch 실패 시 오류 메시지 표시
    // 🚨 @PATCH : helpContent 오버레이 대신 createNewTab으로 별도 탭 생성 (2026-06-17)
    // 🔗 @CALLS : stripFrontmatter, createNewTab
    // ====================================================================
    help: async () => {
      const api = (window as any).electronAPI;
      let helpMd = '';
      let helpTitle = '시작하기';
      try {
        if (api?.readFromPath) {
          const file = await api.readFromPath('docs/help/00_시작하기.md');
          helpMd = stripFrontmatter(file.content);
        } else {
          const res = await fetch('./docs/help/00_시작하기.md');
          const text = await res.text();
          helpMd = stripFrontmatter(text);
        }
      } catch (e) {
        helpMd = '## 문서를 불러올 수 없습니다.\n\n도움말 파일을 찾을 수 없습니다.';
        helpTitle = '오류';
      }
      if (createNewTab) {
        createNewTab(helpMd, '도움말.md');
      }
    },
    license: () => setIsLicenseModalOpen(true),
    // ====================================================================
    // 📊 [OMD-EDIT-USEEDITORHANDLERS-0002] useEditorHandlers.ts ➔ toggleFloatingToolbar
    // 🎯 @KICK  : 플로팅 툴바의 표시/숨김을 토글하고 커서 위치에 배치
    // 🛡️ @GUARD : editorRef, position, visiblePos 존재 여부 확인
    // 🚨 @PATCH : 없음
    // 🔗 @CALLS : 없음
    // ====================================================================
    toggleFloatingToolbar: () => {
      setFloatingToolbar(prev => {
        if (prev.visible) return { ...prev, visible: false };
        if (editorRef.current) {
          const editor = editorRef.current;
          editor.focus();
          const position = editor.getPosition();
          if (position) {
            const visiblePos = editor.getScrolledVisiblePosition(position);
            if (visiblePos) {
              return { visible: true, top: Math.max(0, visiblePos.top - 10), left: visiblePos.left };
            }
          }
        }
        return { visible: true, top: 100, left: 100 };
      });
    },
    quickWrap: (format: 'h1' | 'h2' | 'h3' | 'quote' | 'code') => quickWrap(format),
  };

  return handlers;
};
