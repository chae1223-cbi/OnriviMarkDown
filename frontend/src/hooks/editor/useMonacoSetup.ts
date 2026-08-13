// @ts-nocheck
// ====================================================================
// 📊 [OMD-CORE-useMonacoSetup-0001] useMonacoSetup ➔ List Tab Behavior Patch
// 🎯 @KICK  : 리스트 들여쓰기 시 스마트 번호 매기기 및 탭/스페이스 매칭 최적화
// 🛡️ @GUARD : hasList 체크 후 순차적으로 이전 줄의 탭 깊이와 숫자를 비교하여 번호 갱신
// 🚨 @PATCH : 2026-08-13 - onDidScrollChange 에디터 스크롤 동기화 시 짧은 문서 튕김 방지 가드(pureScrollHeight) 및 최하단 밀착 시 텍스트 시야 이탈 차단을 위해 120px 마진 보존 연동 패치 | 2026-08-12 - 에디터가 마지막 줄 주변(하단 영역)에 있거나 입력할 때 미리보기 스크롤이 위로 밀려 올라가지 않고 맨 아래에 고정되도록 수정, 스크롤 싱크 가드 범위 보강 | 2026-07-15 - 마지막 줄 타이핑 시 흔들림(jitter)을 방지하기 위해 padding.bottom을 0으로 강제 조정 | 2026-07-13 - 탭 간격 들여쓰기 시 새로운 하위 단계로 넘어가는 경우 1번으로 리셋 처리 및 점 뒤의 공백 문자(\t 등) 유연 매칭 지원 패치
// 🔗 @CALLS : model.getLineContent, editor.executeEdits
// ====================================================================
import { useRef } from 'react';

// 💡 [수평 스크롤 시프트 방지 헬퍼] scrollIntoView 대신 scrollTop만 직접 조절하는 수직 전용 스크롤 함수
const verticalScrollToElement = (parent: HTMLElement, child: HTMLElement, block: 'center' | 'nearest', behavior: 'smooth' | 'auto' | 'instant' = 'smooth') => {
  const parentRect = parent.getBoundingClientRect();
  const childRect = child.getBoundingClientRect();
  const relativeTop = childRect.top - parentRect.top + parent.scrollTop;
  
  let targetScrollTop = parent.scrollTop;
  if (block === 'center') {
    targetScrollTop = relativeTop - (parentRect.height / 2) + (childRect.height / 2);
  } else {
    // nearest
    const relativeBottom = relativeTop + childRect.height;
    if (relativeTop < parent.scrollTop) {
      targetScrollTop = relativeTop;
    } else if (relativeBottom > parent.scrollTop + parentRect.height) {
      targetScrollTop = relativeBottom - parentRect.height;
    }
  }
  
  parent.scrollTo({
    top: Math.max(0, targetScrollTop),
    behavior: behavior === 'instant' ? 'auto' : (behavior as ScrollBehavior)
  });
};

export function useMonacoSetup(deps: any) {
  const handleMount = (editor: any, monaco: any) => {
    // 의존성 풀기 (MainEditorApp에서 넘겨받은 변수들을 지역 변수로 할당)
    const {
      editorRef, tabsRef, activeTabIdRef, contentRef, isComposingRef, previewDebounceRef,
      setContent, setTabs, activeTabId, setSaveStatus, currentFileNodeRef, lastSavedContentRef,
      saveFile, autoSaveRef, previewModeRef, previewRef, isScrollingRef, scrollTimeoutRef,
      isEditorReady, setIsEditorReady, themePalette, EDITOR_THEMES, updateDecorations,
      decorationsCollectionRef, isEditorHovered, prevCursorLineRef,
      setActiveLine, setCursorLine, setCursorColumn, tabSizeRef, setFloatingToolbar, lastSelectionRef,
      completionProviderRef, getSlashCommands, customSlashCommandsRef,
      handleEditorPaste,
      wikilinkProviderRef, docLinkFilesRef, readFileTextRef, extractHeadings, getRelativePath,
      isEditorMountedRef, updateContent
    } = deps;

                  editorRef.current = editor;
                  if (typeof window !== 'undefined') {
                    (window as any).monaco = monaco;
                  }

                  const updatedTabs = tabsRef.current.map((tab: any) => {
                    if (!tab.model) {
                      const model = monaco.editor.createModel(tab.content, 'markdown');
                      model.onDidChangeContent(() => {
                        const val = model.getValue();
                        setContent(val);
                        setTabs(prev => prev.map(t => t.id === tab.id ? { ...t, content: val, isModified: val !== t.content } : t));
                      });
                      return { ...tab, model };
                    }
                    return tab;
                  });
                  setTabs(updatedTabs);

                  const activeTab = updatedTabs.find(t => t.id === activeTabIdRef.current);
                  if (activeTab && activeTab.model) {
                    editor.setModel(activeTab.model);
                  } else {
                    editor.setValue(contentRef.current);
                  }

                  // 💡 [IME 조합 감지 락]
                  setTimeout(() => {
                    const textarea = editor.getDomNode()?.querySelector('textarea');
                    if (textarea) {
                      textarea.addEventListener('compositionstart', () => {
                        isComposingRef.current = true;
                      });
                      textarea.addEventListener('compositionend', () => {
                        isComposingRef.current = false;
                        // 조합이 종료된 시점에 에디터 모델이 완전히 갱신되도록 10ms 지연 후 최종값 동기화
                        setTimeout(() => {
                          if (editorRef.current) {
                            setContent(editorRef.current.getValue());
                          }
                        }, 10);
                      });
                    }
                  }, 100);

                  // 🔒 [Tab 키 공식 editor.onKeyDown 안전 가드]
                  editor.onKeyDown((e: any) => {
                    if (e.keyCode === monaco.KeyCode.Tab && !e.shiftKey) {
                      try {
                        const contextKeyService = (editor as any)._contextKeyService;
                        const isSuggestVisible = contextKeyService?.getContextKeyValue('suggestWidgetVisible') === true;
                        const isSnippetMode = contextKeyService?.getContextKeyValue('inSnippetMode') === true;
                        if (isSuggestVisible || isSnippetMode) {
                          return; // 자동완성/스니펫 모드 시 Monaco 코어에 양보
                        }
                      } catch (_) {}

                      const selection = editor.getSelection();
                      const model = editor.getModel();
                      if (!model || !selection) return;

                      // ① 마크다운 표 영역인지 검사 및 표 내비게이션 / 행 추가 처리
                      const position = editor.getPosition();
                      let isTable = false;
                      if (position) {
                        let lineContent = model.getLineContent(position.lineNumber);
                        if (isTableLine(lineContent) && !isTableDividerLine(lineContent)) {
                          isTable = true;
                          e.preventDefault();
                          e.stopPropagation();
                          if (e.browserEvent) {
                            e.browserEvent.preventDefault();
                            e.browserEvent.stopPropagation();
                          }

                          // 사용자가 표를 작성 중인데 줄 끝에 | 를 안 닫고 Tab을 누른 경우 자동 보정
                          if (!lineContent.trimEnd().endsWith('|')) {
                            editor.pushUndoStop();
                            editor.executeEdits("appendPipe", [{
                              range: new monaco.Range(position.lineNumber, lineContent.length + 1, position.lineNumber, lineContent.length + 1),
                              text: " |",
                              forceMoveMarkers: true
                            }]);
                            editor.pushUndoStop();
                            lineContent = model.getLineContent(position.lineNumber);
                          }

                          const { ranges, pipeIndices } = getCellRanges(lineContent, position.lineNumber);
                          if (ranges.length > 0) {
                            let currentCellIdx = -1;
                            for (let i = 0; i < pipeIndices.length - 1; i++) {
                              const leftCol = pipeIndices[i] + 1;
                              const rightCol = pipeIndices[i + 1] + 2;
                              if (position.column >= leftCol && position.column <= rightCol) {
                                currentCellIdx = i;
                                break;
                              }
                            }

                            if (currentCellIdx !== -1) {
                              if (currentCellIdx < ranges.length - 1) {
                                // 다음 셀로 이동
                                const nextCell = ranges[currentCellIdx + 1];
                                editor.setSelection(new monaco.Selection(
                                  nextCell.lineNumber, nextCell.startColumn,
                                  nextCell.lineNumber, nextCell.endColumn
                                ));
                                return;
                              } else {
                                // 현재 행이 마지막 셀인 경우 -> 다음 행으로 이동 또는 신규 행 삽입
                                let targetLine = position.lineNumber + 1;
                                const lineCount = model.getLineCount();
                                if (targetLine <= lineCount) {
                                  let nextLineContent = model.getLineContent(targetLine);
                                  if (isTableLine(nextLineContent) && isTableDividerLine(nextLineContent)) {
                                    targetLine++;
                                    if (targetLine <= lineCount) {
                                      nextLineContent = model.getLineContent(targetLine);
                                    } else {
                                      nextLineContent = "";
                                    }
                                  }

                                  if (isTableLine(nextLineContent)) {
                                    const nextLineRanges = getCellRanges(nextLineContent, targetLine).ranges;
                                    if (nextLineRanges.length > 0) {
                                      const firstCell = nextLineRanges[0];
                                      editor.setSelection(new monaco.Selection(
                                        firstCell.lineNumber, firstCell.startColumn,
                                        firstCell.lineNumber, firstCell.endColumn
                                      ));

                                      // 💡 다음 행으로 이동 시 스크롤 튀는 현상 방지 락 및 강제 동기화
                                      isScrollingRef.current = 'editor';
                                      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                                      scrollTimeoutRef.current = setTimeout(() => { isScrollingRef.current = null; }, 200);
                                      setTimeout(() => {
                                        if (previewRef.current) {
                                          const targetElement = previewRef.current.querySelector(`[data-line="${targetLine}"]`) as HTMLElement;
                                          if (targetElement) {
                                            verticalScrollToElement(previewRef.current, targetElement, 'nearest', 'auto');
                                          }
                                        }
                                      }, 50);
                                      return;
                                    }
                                  }
                                }

                                // 다음 행이 없거나 표 행이 아니라면 -> 신규 행 자동 추가
                                const cellCount = ranges.length;
                                const newRowText = "\n|" + "  |".repeat(cellCount);
                                const lastLineMaxCol = model.getLineMaxColumn(position.lineNumber);
                                editor.pushUndoStop();
                                editor.executeEdits("insertTableRow", [{
                                  range: new monaco.Range(position.lineNumber, lastLineMaxCol, position.lineNumber, lastLineMaxCol),
                                  text: newRowText,
                                  forceMoveMarkers: true
                                }]);
                                editor.pushUndoStop();

                                const newRowNumber = position.lineNumber + 1;
                                const newRowContent = model.getLineContent(newRowNumber);
                                const newRowRanges = getCellRanges(newRowContent, newRowNumber).ranges;
                                if (newRowRanges.length > 0) {
                                  const firstCell = newRowRanges[0];
                                  editor.setSelection(new monaco.Selection(
                                    firstCell.lineNumber, firstCell.startColumn,
                                    firstCell.lineNumber, firstCell.endColumn
                                  ));
                                }

                                // 💡 행 추가 후 스크롤 튀는 현상 방지 락 및 강제 동기화
                                isScrollingRef.current = 'editor';
                                if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                                scrollTimeoutRef.current = setTimeout(() => { isScrollingRef.current = null; }, 300);
                                setTimeout(() => {
                                  if (previewRef.current) {
                                    const targetElement = previewRef.current.querySelector(`[data-line="${newRowNumber}"]`) as HTMLElement;
                                    if (targetElement) {
                                      verticalScrollToElement(previewRef.current, targetElement, 'center', 'auto');
                                    }
                                  }
                                }, 80);
                                return;
                              }
                            }
                          }
                        }
                      }

                      // ② 기존 리스트 및 인용문 들여쓰기(Indent) 처리
                      const startLine = selection.startLineNumber;
                      const endLine = selection.endLineNumber;

                      let hasList = false;
                      for (let i = startLine; i <= endLine; i++) {
                        const lineContent = model.getLineContent(i);
                        if (/^[ \t]*([-*+]|\d+\.|>)/.test(lineContent)) {
                          hasList = true;
                          break;
                        }
                      }

                      if (hasList && !isTable) {
                        e.preventDefault();
                        e.stopPropagation();
                        if (e.browserEvent) {
                          e.browserEvent.preventDefault();
                          e.browserEvent.stopPropagation();
                        }

                        editor.pushUndoStop();
                        const edits: any[] = [];
                        const virtualLines = new Map<number, string>();
                        const getLine = (lineIdx: number) => virtualLines.has(lineIdx) ? virtualLines.get(lineIdx)! : model.getLineContent(lineIdx);
                        const indentSize = (tabSizeRef && typeof tabSizeRef.current === 'number') ? tabSizeRef.current : 4;

                        for (let i = startLine; i <= endLine; i++) {
                          const lineContent = model.getLineContent(i);
                          const match = lineContent.match(/^([ \t\u200b\u00a0]*)(\d+)\.([ \t\u200b\u00a0]+)(.*)/);
                          if (match) {
                            const oldIndent = match[1];
                            const numStr = match[2];
                            const dotSpace = match[3]; // 점 뒤의 공백 문자들 (스페이스 또는 탭, 특수 공백 포함)
                            const newIndent = oldIndent + " ".repeat(indentSize);
                            
                            let newNum = 1;
                            if (i > 1) {
                              const prevLine = getLine(i - 1);
                              const prevMatch = prevLine.match(/^([ \t\u200b\u00a0]*)(\d+)\.([ \t\u200b\u00a0]+)(.*)/);
                              if (prevMatch && prevMatch[1] === newIndent) {
                                newNum = parseInt(prevMatch[2], 10) + 1;
                              }
                            }
                            const prefixLength = oldIndent.length + numStr.length + 1 + dotSpace.length;
                            const newPrefix = newIndent + newNum + "." + dotSpace;
                            const newLineContent = newPrefix + match[4];
                            virtualLines.set(i, newLineContent);
                            
                            edits.push({
                              range: new monaco.Range(i, 1, i, prefixLength + 1),
                              text: newPrefix
                            });
                          } else {
                            const newLineContent = " ".repeat(indentSize) + lineContent;
                            virtualLines.set(i, newLineContent);
                            edits.push({
                              range: new monaco.Range(i, 1, i, 1),
                              text: " ".repeat(indentSize)
                            });
                          }
                        }
                        editor.executeEdits("indentList", edits);
                        editor.pushUndoStop();
                      }
                    }
                  });

                  // 💡 [에디터 스크롤 및 우측 여백 최적화]
                  editor.updateOptions({
                    scrollBeyondLastLine: false,   // 마지막 줄 도달 시 즉시 자동 스크롤
                    padding: { top: 20, bottom: 0 }, // 마지막 줄 흔들림 버그 해결을 위해 bottom 패딩 0으로 설정
                    lineDecorationsWidth: 26,
                    lineNumbersMinChars: 4,
                    automaticLayout: true,
                    wrappingStrategy: 'advanced',

                    // 🔒 [하단 클릭 시 에디터 붕 뜸 및 상단 유실 방어 3대 마스터 가드]
                    cursorSurroundingLines: 0,
                    cursorSurroundingLinesStyle: 'all',
                    occurrencesHighlight: 'off',
                    scrollbar: {
                      vertical: 'visible',
                      horizontal: 'auto',
                      useShadows: false,
                      verticalHasArrows: false,
                      horizontalHasArrows: false
                    }
                  });

                  // 🛡️ [스크롤바 글자 가림 방지] .monaco-editor에 border-right + box-sizing: border-box로
                  // Monaco가 인식하는 content width를 강제로 줄여 줄바꿈 시 마지막 글자가
                  // 스크롤바 뒤에 숨지 않도록 방어합니다.
                  const scrollStyle = document.createElement('style');
                  scrollStyle.textContent = `
                    .monaco-editor {
                      border-right: 120px solid transparent !important;
                      box-sizing: border-box !important;
                    }
                  `;
                  document.head.appendChild(scrollStyle);
                  setTimeout(() => editor.layout(), 0);

                  // 💡 [테마 연동 가드] 비동기 세션 복원(restoreSettings)과 에디터 마운트 시차로 인한 테마 미적용 레이스 컨디션 방지
                  if (themePalette) {
                    monaco.editor.setTheme(themePalette);
                  }

                  // 💡 브라우저 맞춤법 검사(빨간 물결선)가 잘려 잔상/찌꺼기처럼 보이는 현상 차단
                  try {
                    const textarea = editor.getDomNode()?.querySelector('textarea');
                    if (textarea) textarea.setAttribute('spellcheck', 'false');
                  } catch (_) { }

                  // 💡 [추가 하드닝] 사이드바 신설/닫힘 시 에디터 굳음 방어: 50ms 후 강제 레이아웃 리프레시
                  setTimeout(() => { editor.layout(); }, 50);

                  // 🤝 [레이스 컨디션 진압 트리거] 
                  // 유저가 하단을 클릭하여 가상 스크롤 컨텍스트가 임의로 깨졌을 때를 대비해,
                  // 포커스 이벤트가 격발되는 순간 에디터의 레이아웃 좌표계를 강제로 제자리로 스냅(Snap) 백 시킵니다.
                  editor.onDidFocusEditorText(() => {
                    // 0.01초 만에 뒤틀린 레이아웃 좌표를 수평 정렬하여 상단 짤림을 영구 방어합니다.
                    editor.layout();
                  });

                  // 💡 [IME-blur] 포커스 아웃 시 즉시 React 상태와 에디터 최종 값 동기화 (이중 입력 방지 가드 탑재)
                  editor.onDidBlurEditorText(() => {
                    if (previewDebounceRef.current) {
                      clearTimeout(previewDebounceRef.current);
                      previewDebounceRef.current = null;
                    }
                    // 💡 [IME-blur 보완] 한글 입력 조합(Composition) 종료와 React 상태 갱신 타이밍 간의 레이스 컨디션을 방지하기 위해 
                    // 100ms 지연 후 에디터 최종 값을 React 상태에 동기화하여 마지막 글자 중복 입력을 원천 방어합니다.
                    setTimeout(() => {
                      if (editorRef.current) {
                        const latestVal = editorRef.current.getValue();
                        setContent(latestVal);
                      }
                    }, 100);
                  });

                  // 💡 에디터 내용이 바뀔 때마다(타이핑 및 setValue 포함) 다음 렌더링 프레임에서 데코레이션 즉시 업데이트
                  // 모나코 에디터의 자체 뷰 렌더러가 화면을 새로 그린 직후에 데코레이션을 덮어씌워 파란색 뒤집힘 버그 방지
                  editor.onDidChangeModelContent(() => {
                    requestAnimationFrame(() => {
                      updateDecorations(editor);
                    });
                  });

                  if (!(monaco.editor as any)._customActionCommandRegistered) {
                    (monaco.editor as any)._customActionCommandRegistered = true;
                    (monaco.editor as any).registerCommand('trigger-custom-action', (accessor: any, actionId: string) => {
                      if (typeof window !== 'undefined' && (window as any).dispatchEditorCommand) {
                        (window as any).dispatchEditorCommand(actionId);
                      }
                    });
                  }

                  // 💡 [슬래시 명령어 플레이스홀더 선택] 툴바/단축키와 동일하게 삽입 후 플레이스홀더를 자동 선택합니다.
                  //    arguments: [insertTextLength, placeholderOffset, placeholderLength]
                  //    Monaco completion command는 삽입 완료 후 실행되므로, 커서 위치에서 역산하여 선택 범위를 계산합니다.
                  if (!(monaco.editor as any)._slashPlaceholderCommandRegistered) {
                    (monaco.editor as any)._slashPlaceholderCommandRegistered = true;
                    (monaco.editor as any).registerCommand(
                      'select-slash-placeholder',
                      (accessor: any, insertTextLength: number, placeholderOffset: number, placeholderLength: number) => {
                        // 활성 에디터를 전역 참조에서 가져옴
                        const activeEditor = (monaco.editor as any).getEditors?.()[0];
                        if (!activeEditor) return;

                        const pos = activeEditor.getPosition();
                        if (!pos) return;

                        // 삽입된 텍스트는 단일 라인이므로: 삽입 후 커서 컬럼 = 삽입 시작 컬럼 + insertTextLength
                        // 플레이스홀더 시작 컬럼 = 삽입 시작 컬럼 + placeholderOffset
                        const insertStartCol = pos.column - insertTextLength;
                        const selStartCol = insertStartCol + placeholderOffset;
                        const selEndCol = selStartCol + placeholderLength;

                        if (selStartCol < 1) return;

                        setTimeout(() => {
                          activeEditor.setSelection(new (window as any).monaco.Selection(
                            pos.lineNumber,
                            selStartCol,
                            pos.lineNumber,
                            selEndCol
                          ));
                          activeEditor.focus();
                        }, 10);
                      }
                    );
                  }
                  // 대용량 문서 엔터 키 입력 시 자동 스크롤 패치 (CORE-01)
                  editor.onKeyDown((e) => {
                    if (e.keyCode === monaco.KeyCode.Enter) {
                      // 엔터가 입력되어 행이 추가된 직후, 커널 스케줄러를 한 틱 늦춰서 최신 좌표 추출
                      setTimeout(() => {
                        const position = editor.getPosition();
                        if (position) {
                          // 커서가 뷰포트 바깥으로 나가면 무조건 화면 중앙이나 하단으로 스크롤 강제 이송
                          editor.revealPositionInCenterIfOutsideViewport(position);
                        }
                      }, 10);
                    }
                  });

                  editor.onKeyUp((e) => {
                    if (e.browserEvent.key === '/') {
                      editor.trigger('keyboard', 'editor.action.triggerSuggest', {});
                    }
                  });

                  // Shift + Enter 를 누르면 실제 엔터(\n) 대신 <br> 태그를 삽입 (표 내부 줄바꿈 용도)
                  editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
                    const position = editor.getPosition();
                    if (!position) return;
                    editor.executeEdits("insertBr", [{
                      range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
                      text: "<br>",
                      forceMoveMarkers: true
                    }]);
                  });

                  // 🔮 Ctrl + K 전용 AI 글쓰기 어시스턴트 호출 단축키 표준 바인딩 (ReferenceError 및 getModifierState 에러 원천 차단)
                  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () => {
                    if (typeof window !== 'undefined' && (window as any).dispatchEditorCommand) {
                      (window as any).dispatchEditorCommand('AI_MODAL');
                    }
                  });

                  // 🛡️ [한글 주석 탑재] 표(Table) 자동 정렬 및 너비 계산 헬퍼 함수 정의
                  const getVisualLength = (str: string): number => {
                    let len = 0;
                    for (let i = 0; i < str.length; i++) {
                      const code = str.charCodeAt(i);
                      if (code >= 0x2e80 || (code >= 0xac00 && code <= 0xd7a3)) {
                        len += 2;
                      } else {
                        len += 1;
                      }
                    }
                    return len;
                  };

                  const padVisual = (str: string, targetVisualLen: number): string => {
                    const currentLen = getVisualLength(str);
                    const needed = targetVisualLen - currentLen;
                    if (needed <= 0) return str;
                    return str + ' '.repeat(needed);
                  };

                  const formatTableBlock = (editorInstance: any, targetLineNumber: number) => {
                    const model = editorInstance.getModel();
                    if (!model) return;

                    const lineCount = model.getLineCount();
                    let startLine = targetLineNumber;
                    let endLine = targetLineNumber;

                    // 위쪽 표 영역 시작점 찾기
                    while (startLine > 1) {
                      const prevLineContent = model.getLineContent(startLine - 1);
                      if (isTableLine(prevLineContent)) {
                        startLine--;
                      } else {
                        break;
                      }
                    }

                    // 아래쪽 표 영역 끝점 찾기
                    while (endLine < lineCount) {
                      const nextLineContent = model.getLineContent(endLine + 1);
                      if (isTableLine(nextLineContent)) {
                        endLine++;
                      } else {
                        break;
                      }
                    }

                    const rows: { lineNumber: number; content: string; isDivider: boolean; cells: string[] }[] = [];
                    let maxCols = 0;

                    for (let i = startLine; i <= endLine; i++) {
                      const content = model.getLineContent(i);
                      const isDivider = isTableDividerLine(content);
                      const trimmed = content.trim();
                      const inner = trimmed.substring(1, trimmed.length - 1);

                      const cells: string[] = [];
                      let currentCell = "";
                      for (let j = 0; j < inner.length; j++) {
                        if (inner[j] === '|') {
                          if (j > 0 && inner[j - 1] === '\\') {
                            currentCell += '|';
                          } else {
                            cells.push(currentCell);
                            currentCell = "";
                          }
                        } else {
                          currentCell += inner[j];
                        }
                      }
                      cells.push(currentCell);

                      const trimmedCells = cells.map(c => c.trim());
                      maxCols = Math.max(maxCols, trimmedCells.length);

                      rows.push({
                        lineNumber: i,
                        content,
                        isDivider,
                        cells: trimmedCells
                      });
                    }

                    if (rows.length === 0 || maxCols === 0) return;

                    // 각 열별 비주얼 너비 최댓값 계산 (구분행은 배제)
                    const colWidths = Array(maxCols).fill(0);
                    for (const row of rows) {
                      if (row.isDivider) continue;
                      for (let colIdx = 0; colIdx < maxCols; colIdx++) {
                        const cellText = row.cells[colIdx] || "";
                        const visualLen = getVisualLength(cellText);
                        colWidths[colIdx] = Math.max(colWidths[colIdx], visualLen);
                      }
                    }

                    // 최소 너비 3 보장
                    for (let colIdx = 0; colIdx < maxCols; colIdx++) {
                      colWidths[colIdx] = Math.max(3, colWidths[colIdx]);
                    }

                    const edits: any[] = [];
                    for (const row of rows) {
                      let formattedLine = "|";
                      for (let colIdx = 0; colIdx < maxCols; colIdx++) {
                        const cellText = row.cells[colIdx] || "";
                        const width = colWidths[colIdx];
                        if (row.isDivider) {
                          const text = cellText.trim();
                          const alignLeft = text.startsWith(':');
                          const alignRight = text.endsWith(':');
                          let dividerStr = "";
                          if (alignLeft && alignRight) {
                            dividerStr = ":" + "-".repeat(Math.max(1, width - 2)) + ":";
                          } else if (alignLeft) {
                            dividerStr = ":" + "-".repeat(Math.max(2, width - 1));
                          } else if (alignRight) {
                            dividerStr = "-".repeat(Math.max(2, width - 1)) + ":";
                          } else {
                            dividerStr = "-".repeat(Math.max(3, width));
                          }
                          formattedLine += ` ${dividerStr} |`;
                        } else {
                          const padded = padVisual(cellText, width);
                          formattedLine += ` ${padded} |`;
                        }
                      }
                      const originalLine = model.getLineContent(row.lineNumber);
                      const indentMatch = originalLine.match(/^([ \t]*)/);
                      const indent = indentMatch ? indentMatch[1] : '';
                      const finalLineText = indent + formattedLine;

                      if (finalLineText !== originalLine) {
                        edits.push({
                          range: new monaco.Range(row.lineNumber, 1, row.lineNumber, originalLine.length + 1),
                          text: finalLineText
                        });
                      }
                    }

                    if (edits.length > 0) {
                      editorInstance.pushUndoStop();
                      editorInstance.executeEdits("formatTable", edits);
                      editorInstance.pushUndoStop();
                    }
                  };

                  // 🛡️ [한글 주석 탑재] 표(Table) 여부 및 구분행 판별 헬퍼 함수 정의
                  const isTableLine = (text: string): boolean => {
                    const trimmed = text.trim();
                    if (!trimmed.startsWith('|')) return false;
                    const pipeCount = (trimmed.match(/\|/g) || []).length;
                    return pipeCount >= 2; // 줄 끝에 | 가 없어도 파이프가 2개 이상이면 표 행으로 간주
                  };

                  const isTableDividerLine = (text: string): boolean => {
                    const trimmed = text.trim();
                    if (!isTableLine(trimmed)) return false;
                    const inner = trimmed.substring(1, trimmed.length - 1);
                    const parts = inner.split('|');
                    return parts.every(part => /^[ \t]*:?-+:?[ \t]*$/.test(part));
                  };

                  const getCellRanges = (lineContent: string, lineNumber: number) => {
                    const ranges: { lineNumber: number; startColumn: number; endColumn: number; isEmpty: boolean }[] = [];
                    const pipeIndices: number[] = [];
                    for (let i = 0; i < lineContent.length; i++) {
                      if (lineContent[i] === '|') {
                        if (i > 0 && lineContent[i - 1] === '\\') continue;
                        pipeIndices.push(i);
                      }
                    }
                    if (pipeIndices.length < 2) return { ranges: [], pipeIndices: [] };
                    for (let i = 0; i < pipeIndices.length - 1; i++) {
                      const startIdx = pipeIndices[i] + 1;
                      const endIdx = pipeIndices[i + 1];
                      const rawText = lineContent.substring(startIdx, endIdx);
                      const hasLeftSpace = rawText.startsWith(' ');
                      const hasRightSpace = rawText.endsWith(' ');
                      const trimLeft = hasLeftSpace ? 1 : 0;
                      const trimRight = hasRightSpace ? 1 : 0;
                      const cellStartCol = startIdx + 1 + trimLeft;
                      const cellEndCol = endIdx + 1 - trimRight;
                      const coreText = rawText.substring(trimLeft, rawText.length - trimRight);
                      const isEmpty = coreText.trim().length === 0;

                      if (isEmpty) {
                        // 빈 셀: 파이프 사이 공백들의 정중앙 컬럼에 크기 0의 셀 범위를 생성 (타이핑 시 양옆 공백 1칸 보존)
                        const centerCol = startIdx + 1 + Math.max(1, Math.floor(rawText.length / 2));
                        ranges.push({
                          lineNumber,
                          startColumn: centerCol,
                          endColumn: centerCol,
                          isEmpty: true
                        });
                      } else {
                        ranges.push({
                          lineNumber,
                          startColumn: cellStartCol,
                          endColumn: cellEndCol,
                          isEmpty: false
                        });
                      }
                    }
                    return { ranges, pipeIndices };
                  };



                  // 🛡️ [한글 주석 탑재] Shift + Tab 키 입력 시 마크다운 표 역방향 셀 이동 및 목록 내어쓰기(Outdent) 통합 처리
                  // 현재 커서가 표 내부이면 이전 셀로 커서를 이동하고,
                  // 목록 계층에 있으면 맨 앞에 존재하는 2칸 공백 또는 1칸 탭 문자를 소거하여 아웃덴트 정렬합니다.
                  editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Tab, () => {
                    const selection = editor.getSelection();
                    const model = editor.getModel();
                    if (!model || !selection) return;

                    // ① 마크다운 표 영역인지 검사 및 표 역방향 셀 이동 처리
                    const position = editor.getPosition();
                    if (position) {
                      const lineContent = model.getLineContent(position.lineNumber);
                      if (isTableLine(lineContent) && !isTableDividerLine(lineContent)) {
                        const { ranges, pipeIndices } = getCellRanges(lineContent, position.lineNumber);
                        if (ranges.length > 0) {
                          let currentCellIdx = -1;
                          for (let i = 0; i < pipeIndices.length - 1; i++) {
                            const leftCol = pipeIndices[i] + 1;
                            const rightCol = pipeIndices[i + 1] + 2;
                            if (position.column >= leftCol && position.column <= rightCol) {
                              currentCellIdx = i;
                              break;
                            }
                          }

                          if (currentCellIdx !== -1) {
                            if (currentCellIdx > 0) {
                              // 이전 셀로 이동
                              const prevCell = ranges[currentCellIdx - 1];
                              editor.setSelection(new monaco.Selection(
                                prevCell.lineNumber, prevCell.startColumn,
                                prevCell.lineNumber, prevCell.endColumn
                              ));
                              return;
                            } else {
                              // 첫 번째 셀에서 Shift+Tab -> 이전 행의 마지막 셀로 이동
                              let targetLine = position.lineNumber - 1;
                              if (targetLine >= 1) {
                                let prevLineContent = model.getLineContent(targetLine);
                                if (isTableLine(prevLineContent) && isTableDividerLine(prevLineContent)) {
                                  targetLine--;
                                  if (targetLine >= 1) {
                                    prevLineContent = model.getLineContent(targetLine);
                                  } else {
                                    prevLineContent = "";
                                  }
                                }

                                if (isTableLine(prevLineContent)) {
                                  const prevLineRanges = getCellRanges(prevLineContent, targetLine).ranges;
                                  if (prevLineRanges.length > 0) {
                                    const lastCell = prevLineRanges[prevLineRanges.length - 1];
                                    editor.setSelection(new monaco.Selection(
                                      lastCell.lineNumber, lastCell.startColumn,
                                      lastCell.lineNumber, lastCell.endColumn
                                    ));

                                    // 💡 이전 행으로 이동 시 스크롤 튀는 현상 방지 락 및 강제 동기화
                                    isScrollingRef.current = 'editor';
                                    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                                    scrollTimeoutRef.current = setTimeout(() => { isScrollingRef.current = null; }, 200);
                                    setTimeout(() => {
                                      if (previewRef.current) {
                                        const targetElement = previewRef.current.querySelector(`[data-line="${targetLine}"]`) as HTMLElement;
                                        if (targetElement) {
                                          verticalScrollToElement(previewRef.current, targetElement, 'nearest', 'auto');
                                        }
                                      }
                                    }, 50);
                                    return;
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }

                    // 일반 문장이면 기본 아웃덴트 기능 트리거
                    editor.trigger('keyboard', 'outdent', null);
                  }, "textInputFocus && !suggestWidgetVisible && !inSnippetMode");

                  // 🛡️ [한글 주석 탑재] 엔터 키 입력 시 자동완성 및 리스트 연속 번호 매기기 처리 (텍스트 보존 및 커서 추적 지원)
                  // 자동완성(Suggest Widget)이 열려 있으면 Enter → 자동완성 수락에 양보
                  // 그 외에는 리스트 상태에서 엔터를 치면 다음 줄에 불릿 기호를 자동 주입합니다.
                  editor.addAction({
                    id: 'custom-enter-list-auto',
                    label: '리스트 자동완성 (Enter)',
                    keybindings: [monaco.KeyCode.Enter],
                    // suggestWidgetVisible = true 이면 이 액션 발동 안됨 → Monaco 기본 Enter(자동완성 수락)에 양보
                    precondition: '!suggestWidgetVisible && !editorReadonly',
                    run: () => {
                      // ① 자동완성 위젯이 열려 있으면 Enter = 자동완성 항목 수락
                      try {
                        const suggestCtrl = editor.getContribution('editor.contrib.suggestController') as any;
                        if (suggestCtrl?.widget?.value?.suggestWidgetVisible?.get?.()) {
                          editor.trigger('keyboard', 'acceptSelectedSuggestion', {});
                          return;
                        }
                      } catch (_) { /* 위젯 접근 실패 시 무시 */ }

                      const position = editor.getPosition();
                      if (!position) return;
                      const model = editor.getModel();
                      if (!model) return;

                      const lineNumber = position.lineNumber;
                      const lineContent = model.getLineContent(lineNumber);
                      // 커서를 기점으로 앞과 뒤의 텍스트 조각을 안전하게 분리
                      const beforeCursor = lineContent.substring(0, position.column - 1);
                      const afterCursor = lineContent.substring(position.column - 1);

                      // 목록 판단용 웅장한 정규식 엔진 모음
                      const taskRegex = /^([ \t]*)([-*+])[ \t]+\[([ xX])\](?:[ \t]+(.*)|)$/;
                      const orderRegex = /^([ \t]*)(\d+)\.(?:[ \t]+(.*)|)$/;
                      const listRegex = /^([ \t]*)([-*+])(?:[ \t]+(.*)|)$/;
                      const quoteRegex = /^([ \t]*)(>+)(?:[ \t]+(.*)|)$/;

                      let match: RegExpMatchArray | null = null;

                      // 1. 태스크 리스트 판단 가드 (예: - [ ] 작업)
                      if ((match = beforeCursor.match(taskRegex))) {
                        const indent = match[1];
                        const marker = match[2];
                        const checked = match[3];
                        const text = match[4] || '';

                        // 사용자가 아무것도 적지 않고 연속 엔터를 칠 경우 불릿 기호 말끔히 삭제 (리스트 탈출)
                        if (text.trim() === '' && afterCursor.trim() === '') {
                          editor.executeEdits("removeBullet", [{
                            range: new monaco.Range(lineNumber, 1, lineNumber, position.column + afterCursor.length),
                            text: indent,
                            forceMoveMarkers: true
                          }]);
                        } else {
                          // 작성 내용이 있다면 다음 줄에 태스크 불릿(- [ ]) 자동 연속 생성 및 커서 정밀 이전
                          const insertText = `\n${indent}${marker} [ ] ${afterCursor}`;
                          editor.executeEdits("insertBullet", [{
                            range: new monaco.Range(lineNumber, position.column, lineNumber, lineContent.length + 1),
                            text: insertText,
                            forceMoveMarkers: true
                          }]);
                          const nextLine = lineNumber + 1;
                          const nextColumn = indent.length + marker.length + 6 + 1;
                          editor.setPosition({ lineNumber: nextLine, column: nextColumn });
                        }
                        return;
                      }

                      // 2. 숫자로 나열된 순번 리스트 판단 가드 (예: 1. 첫 번째 작업)
                      if ((match = beforeCursor.match(orderRegex))) {
                        const indent = match[1];
                        const numStr = match[2];
                        const text = match[3] || '';

                        // 연속 엔터 시 번호 기호 자동 철거
                        if (text.trim() === '' && afterCursor.trim() === '') {
                          editor.executeEdits("removeBullet", [{
                            range: new monaco.Range(lineNumber, 1, lineNumber, position.column + afterCursor.length),
                            text: indent,
                            forceMoveMarkers: true
                          }]);
                        } else {
                          // 작성 내용 발견 시 다음 숫자를 계산(+1)하여 자동 연속 기입 수행
                          const nextNum = parseInt(numStr, 10) + 1;
                          const insertText = `\n${indent}${nextNum}. ${afterCursor}`;
                          editor.executeEdits("insertBullet", [{
                            range: new monaco.Range(lineNumber, position.column, lineNumber, lineContent.length + 1),
                            text: insertText,
                            forceMoveMarkers: true
                          }]);
                          const nextLine = lineNumber + 1;
                          const nextColumn = indent.length + String(nextNum).length + 2 + 1;
                          editor.setPosition({ lineNumber: nextLine, column: nextColumn });
                        }
                        return;
                      }

                      // 3. 일반 동그라미/대시 불릿 리스트 판단 가드 (예: - 내용)
                      if ((match = beforeCursor.match(listRegex))) {
                        const indent = match[1];
                        const marker = match[2];
                        const text = match[3] || '';

                        // 연속 엔터 시 리스트 불릿 소거
                        if (text.trim() === '' && afterCursor.trim() === '') {
                          editor.executeEdits("removeBullet", [{
                            range: new monaco.Range(lineNumber, 1, lineNumber, position.column + afterCursor.length),
                            text: indent,
                            forceMoveMarkers: true
                          }]);
                        } else {
                          // 다음 줄 불릿 기호 자동 확장
                          const insertText = `\n${indent}${marker} ${afterCursor}`;
                          editor.executeEdits("insertBullet", [{
                            range: new monaco.Range(lineNumber, position.column, lineNumber, lineContent.length + 1),
                            text: insertText,
                            forceMoveMarkers: true
                          }]);
                          const nextLine = lineNumber + 1;
                          const nextColumn = indent.length + marker.length + 1 + 1;
                          editor.setPosition({ lineNumber: nextLine, column: nextColumn });
                        }
                        return;
                      }

                      // 4. 인용구 블록 판단 가드 (예: > 내용)
                      if ((match = beforeCursor.match(quoteRegex))) {
                        const indent = match[1];
                        const quote = match[2];
                        const text = match[3] || '';

                        // 연속 엔터 시 인용구 기호 소거
                        if (text.trim() === '' && afterCursor.trim() === '') {
                          editor.executeEdits("removeBullet", [{
                            range: new monaco.Range(lineNumber, 1, lineNumber, position.column + afterCursor.length),
                            text: indent,
                            forceMoveMarkers: true
                          }]);
                        } else {
                          // 다음 줄 > 기호 연속 생성
                          const insertText = `\n${indent}${quote} ${afterCursor}`;
                          editor.executeEdits("insertBullet", [{
                            range: new monaco.Range(lineNumber, position.column, lineNumber, lineContent.length + 1),
                            text: insertText,
                            forceMoveMarkers: true
                          }]);
                          const nextLine = lineNumber + 1;
                          const nextColumn = indent.length + quote.length + 1 + 1;
                          editor.setPosition({ lineNumber: nextLine, column: nextColumn });
                        }
                        return;
                      }

                      // 5. 일반 문장 개행 처리 (기본 들여쓰기 탭 깊이 자동 보존 개행)
                      const indentMatch = beforeCursor.match(/^([ \t]*)/);
                      const indent = indentMatch ? indentMatch[1] : '';
                      editor.executeEdits("insertNewline", [{
                        range: new monaco.Range(lineNumber, position.column, lineNumber, position.column),
                        text: `\n${indent}`,
                        forceMoveMarkers: true
                      }]);

                    }
                  });

                  // 🛡️ [한글 주석 탑재] Ctrl + Shift + = (즉, Ctrl+Shift++) 입력 시 표 행 삽입
                  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Equal, () => {
                    const position = editor.getPosition();
                    const model = editor.getModel();
                    if (!position || !model) return;
                    const lineContent = model.getLineContent(position.lineNumber);
                    if (isTableLine(lineContent)) {
                      const { ranges } = getCellRanges(lineContent, position.lineNumber);
                      const cellCount = ranges.length;
                      if (cellCount > 0) {
                        const newRowText = "|" + "  |".repeat(cellCount) + "\n";
                        editor.pushUndoStop();
                        editor.executeEdits("insertTableRowAbove", [{
                          range: new monaco.Range(position.lineNumber, 1, position.lineNumber, 1),
                          text: newRowText,
                          forceMoveMarkers: false
                        }]);
                        editor.pushUndoStop();

                        // 삽입된 행의 첫 셀로 포커싱
                        const newRanges = getCellRanges(model.getLineContent(position.lineNumber), position.lineNumber).ranges;
                        if (newRanges.length > 0) {
                          editor.setSelection(new monaco.Selection(
                            position.lineNumber, newRanges[0].startColumn,
                            position.lineNumber, newRanges[0].endColumn
                          ));
                        }
                      }
                    }
                  });

                  // 🛡️ [한글 주석 탑재] Ctrl + Shift + - 입력 시 표 행 삭제 (구분행은 삭제 방지 가드 처리)
                  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Minus, () => {
                    const position = editor.getPosition();
                    const model = editor.getModel();
                    if (!position || !model) return;
                    const lineContent = model.getLineContent(position.lineNumber);
                    if (isTableLine(lineContent)) {
                      // 구분행(| --- | --- |)인 경우 표 붕괴를 막기 위해 삭제 완전 차단
                      if (isTableDividerLine(lineContent)) {
                        return;
                      }
                      editor.pushUndoStop();
                      const lineMaxCol = model.getLineMaxColumn(position.lineNumber);
                      let range: any;
                      if (position.lineNumber < model.getLineCount()) {
                        range = new monaco.Range(position.lineNumber, 1, position.lineNumber + 1, 1);
                      } else if (position.lineNumber > 1) {
                        const prevMaxCol = model.getLineMaxColumn(position.lineNumber - 1);
                        range = new monaco.Range(position.lineNumber - 1, prevMaxCol, position.lineNumber, lineMaxCol);
                      } else {
                        range = new monaco.Range(position.lineNumber, 1, position.lineNumber, lineMaxCol);
                      }
                      editor.executeEdits("deleteTableRow", [{
                        range,
                        text: ""
                      }]);
                      editor.pushUndoStop();
                    }
                  });

                  // Ctrl+Space: 슬래시 명령어 입력 중인 경우 제안 팝업 트리거, 그렇지 않으면 플로팅 툴바 토글
                  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space, () => {
                    const position = editor.getPosition();
                    const model = editor.getModel();
                    if (position && model) {
                      const lineContent = model.getLineContent(position.lineNumber);
                      const beforeCursor = lineContent.substring(0, position.column - 1);
                      // 커서 바로 직전이 / 이거나, / 뒤에 공백 없이 영문/숫자가 연속되는 슬래시 입력 패턴인 경우
                      const slashMatch = beforeCursor.match(/\/([a-zA-Z0-9]*)$/);
                      if (slashMatch) {
                        editor.trigger('keyboard', 'editor.action.triggerSuggest', {});
                        return;
                      }
                    }

                    setFloatingToolbar(prev => {
                      if (prev.visible) return { ...prev, visible: false };
                      let targetPosition = editor.getPosition();
                      const selection = editor.getSelection();
                      const activeSelection = (selection && !selection.isEmpty()) ? selection : lastSelectionRef.current;
                      if (activeSelection && !activeSelection.isEmpty()) {
                        targetPosition = activeSelection.getStartPosition();
                      }
                      if (!targetPosition) return prev;
                      const visiblePos = editor.getScrolledVisiblePosition(targetPosition);
                      if (!visiblePos) return prev;
                      return { visible: true, top: Math.max(0, visiblePos.top - 10), left: visiblePos.left };
                    });
                  });

                  // 💡 [테마 적용 안전장치] 마운트 시점에 수동으로 모든 테마를 다시 정의하고 강제 적용
                  EDITOR_THEMES.forEach(t => {
                    monaco.editor.defineTheme(t.id, {
                      base: t.base,
                      inherit: true,
                      rules: t.rules,
                      colors: t.colors
                    });
                  });
                  monaco.editor.setTheme(themePalette);

                  decorationsCollectionRef.current = editor.createDecorationsCollection();
                  updateDecorations(editor);
                  setIsEditorReady(true);
                  const container = editor.getContainerDomNode();
                  container.addEventListener('paste', handleEditorPaste, true);

                  // 💡 다른 문서에서 글을 마우스로 드래그앤드롭(Drag & Drop)하여 옮길 때 끝에 $0이 붙는 버그 방지 커스텀 핸들러
                  container.addEventListener('drop', (e: DragEvent) => {
                    const files = e.dataTransfer?.files;
                    if (files && files.length > 0) {
                      const file = files[0];
                      if (file.type.startsWith('image/')) {
                        e.preventDefault();
                        e.stopPropagation();
                        const target = editor.getTargetAtClientPoint(e.clientX, e.clientY);
                        const position = target?.position || editor.getPosition();
                        
                        if (position) {
                          editor.setPosition(position);
                          editor.focus();
                        }
                        
                        if (deps.handlePasteImageFile) {
                          deps.handlePasteImageFile(file);
                        }
                        return;
                      }
                    }

                    const text = e.dataTransfer?.getData('text');
                    if (text) {
                      e.preventDefault();
                      e.stopPropagation();

                      const target = editor.getTargetAtClientPoint(e.clientX, e.clientY);
                      const position = target?.position || editor.getPosition();

                      if (position) {
                        editor.executeEdits('dragDropText', [{
                          range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
                          text: text,
                          forceMoveMarkers: true
                        }]);
                        editor.focus();
                      }
                    }
                  }, true);

                  container.addEventListener('mouseenter', () => { isEditorHovered.current = true; });
                  container.addEventListener('mouseleave', () => { isEditorHovered.current = false; });

                  // 💡 [고속/역방향 드래그 가드] Monaco anchor 리셋 방어 — 마우스 다운 위치를 anchor로 고정
                  let editorMouseDown = false;
                  let editorMouseAnchor: { lineNumber: number; column: number } | null = null;

                  editor.onMouseDown((e: any) => {
                    editorMouseDown = true;
                    if (e.target?.position) {
                      editorMouseAnchor = {
                        lineNumber: e.target.position.lineNumber,
                        column: e.target.position.column
                      };
                    }
                  });

                  editor.onMouseUp(() => {
                    editorMouseDown = false;
                    editorMouseAnchor = null;
                  });

                  editor.onDidChangeCursorPosition((e) => {
                    setActiveLine(e.position.lineNumber);
                    setCursorLine(e.position.lineNumber);
                    setCursorColumn(e.position.column);

                    // 💡 [커서 연동 방향 감지 및 이전 줄 업데이트]
                    const currentLine = e.position.lineNumber;
                    const prevLine = prevCursorLineRef.current;
                    prevCursorLineRef.current = currentLine;

                    // 분할모드에서 커서가 새로운 행으로 이동 시 미리보기 동기화
                    if (prevLine !== null && prevLine !== currentLine && previewModeRef.current === 'both' && previewRef.current) {
                      const parent = previewRef.current;

                      let targetEl: HTMLElement | null = null;
                      let foundLine = 1;
                      for (let line = currentLine; line >= 1; line--) {
                        const found = parent.querySelector(`[data-line="${line}"]`) as HTMLElement;
                        if (found) {
                          targetEl = found;
                          foundLine = line;
                          break;
                        }
                      }

                      if (targetEl) {
                        isScrollingRef.current = 'editor';
                        const parentRect = parent.getBoundingClientRect();
                        const childRect = targetEl.getBoundingClientRect();

                        const baseTop = childRect.top - parentRect.top + parent.scrollTop;
                        const diffLines = currentLine - foundLine;
                        const lineOffset = diffLines * 26;

                        // 💡 [하단 바닥선 정렬 공식] 입력 중인 라인이 미리보기 화면 하단(바닥)에 걸치도록 스크롤 정렬
                        const targetScroll = baseTop + lineOffset - parentRect.height + 60;
                        parent.scrollTop = Math.max(0, targetScroll);

                        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                        scrollTimeoutRef.current = setTimeout(() => { isScrollingRef.current = null; }, 100);
                      }
                    }

                    // 💡 표(Table) 영역 이탈 시 자동 정렬 수행
                    if (prevLine && prevLine !== currentLine) {
                      const model = editor.getModel();
                      if (model) {
                        const lineCount = model.getLineCount();
                        if (prevLine >= 1 && prevLine <= lineCount && currentLine >= 1 && currentLine <= lineCount) {
                          const prevLineContent = model.getLineContent(prevLine);
                          const currentLineContent = model.getLineContent(currentLine);
                          if (isTableLine(prevLineContent) && (!isTableLine(currentLineContent) || Math.abs(currentLine - prevLine) > 1)) {
                            // 스크롤 및 렌더링 간섭을 차단하기 위해 비동기 틱으로 정렬 수행
                            setTimeout(() => {
                              const currentModel = editor.getModel();
                              if (currentModel && prevLine >= 1 && prevLine <= currentModel.getLineCount()) {
                                formatTableBlock(editor, prevLine);
                              }
                            }, 50);
                          }
                        }
                      }
                    }

                    // [WBS CORE-03] 마우스 클릭 등으로 명시적인 커서 행 강제 이동 감지 시 자동완성 팝업 강제 파괴
                    if (e.reason === 3) {
                      try {
                        const suggestCtrl = editor.getContribution('editor.contrib.suggestController') as any;
                        if (suggestCtrl && suggestCtrl.widget && suggestCtrl.widget.value) {
                          suggestCtrl.widget.value.hide();
                        }
                      } catch (_) {
                        editor.trigger('keyboard', 'hideSuggestWidget', {});
                      }
                    }
                  });
                  let scrollSyncRafId: number | null = null;
                  editor.onDidScrollChange(() => {
                    if (isScrollingRef.current === 'preview') return;
                    if (previewModeRef.current !== 'both' || !previewRef.current) return;
                    if (scrollSyncRafId !== null) return;
                    scrollSyncRafId = requestAnimationFrame(() => {
                      scrollSyncRafId = null;

                      const parent = previewRef.current;
                      if (!parent) return;
                      const range = editor.getVisibleRanges();
                      if (range && range.length > 0) {
                        const firstVisible = range[0].startLineNumber;
                        const lastVisible = range[0].endLineNumber;
                        const totalLines = editor.getModel()?.getLineCount() || 1;

                        // 💡 [에디터 최하단 스크롤 밀착 가드] 
                        // 에디터 뷰포트에 문서의 맨 끝(마지막 3줄 이내)이 보이고 있다면, 미리보기도 맨 아래로 밀착 스크롤하여 고정합니다.
                        // 이 가드가 없으면 타이핑 시 에디터 스크롤 싱크가 firstVisible 라인을 꼭대기에 맞추느라 미리보기 끝부분 10줄 가량이 화면 아래로 잘려 숨어버립니다.
                        // 🛡️ [짧은 문서 튕김 및 하단 텅빔 방지 가드]
                        // 여백(Margin, Padding) 및 조판지 최소 높이 등을 모두 제외한, 진짜 글자 텍스트 내용물만의 순수 렌더링 높이를 측정합니다.
                        // 이를 위해 .markdown-viewer-root 내부에서 <style> 태그를 제외한 실제 텍스트 렌더링 자식 엘리먼트를 추출합니다.
                        const rootViewer = parent.querySelector('.markdown-viewer-root') as HTMLElement;
                        const pureTextEl = rootViewer 
                          ? (Array.from(rootViewer.children).find(el => el.tagName !== 'STYLE') as HTMLElement) 
                          : null;
                        const contentHeight = pureTextEl ? pureTextEl.getBoundingClientRect().height : parent.scrollHeight - 160;

                        // 순수 본문 높이가 뷰포트 높이 이하인 경우(한 페이지 미만), 에디터의 스크롤/커서 위치와 무관하게 
                        // 스크롤을 0(맨 위)으로 완벽하게 고정하고 움직이지 않도록 early return 처리합니다.
                        if (contentHeight <= parent.clientHeight) {
                          parent.scrollTop = 0;
                          return;
                        }

                        // 1. 역추적으로 가장 가까운 data-line을 검색하여 라인 누락 방어
                        let targetEl: HTMLElement | null = null;
                        let foundLine = 1;
                        for (let line = firstVisible; line >= 1; line--) {
                          const found = parent.querySelector(`[data-line="${line}"]`) as HTMLElement;
                          if (found) {
                            targetEl = found;
                            foundLine = line;
                            break;
                          }
                        }

                        if (targetEl) {
                          isScrollingRef.current = 'editor';
                          const parentRect = parent.getBoundingClientRect();
                          const childRect = targetEl.getBoundingClientRect();

                          const baseTop = childRect.top - parentRect.top + parent.scrollTop;
                          const diffLines = firstVisible - foundLine;
                          const lineOffset = diffLines * 26;

                          parent.scrollTop = Math.max(0, baseTop + lineOffset);

                          if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                          scrollTimeoutRef.current = setTimeout(() => { isScrollingRef.current = null; }, 100);
                        }
                      }
                    });
                  });

                  // 💡 [커서 위치 실시간 비율 싱크 기능은 버그 유발로 제거되었습니다]
                  // 스크롤 동기화는 에디터 스크롤 이벤트 및 라인 변경 시의 커서 리스너에서 전담하여 동작합니다.

                  // 💡 [Enter 즉시 저장] 엔터를 치면 곧바로 저장 — 5초 디바운스 기다림 없음
                  editor.onKeyDown((e) => {
                    if (e.keyCode === monaco.KeyCode.Enter && !isComposingRef.current) {
                      if (autoSaveRef.current && currentFileNodeRef.current) {
                        const val = editor.getValue();
                        if (val && val !== lastSavedContentRef.current) {
                          setSaveStatus('saving');
                          saveFile(val, currentFileNodeRef.current).then(success => {
                            if (success) lastSavedContentRef.current = val;
                            setSaveStatus(success ? 'saved' : 'unsaved');
                          });
                        }
                      }
                    }
                  });

                  editor.onMouseDown((e) => {
                    // 🔥 마우스 클릭 시 자동완성 팝업 즉시 닫기
                    // 다른 행 클릭 시 이전 입력 버퍼 잔재로 팝업이 엉뚱한 위치에 뜨는 현상 방지
                    editor.trigger('mouse', 'hideSuggestWidget', {});

                    setTimeout(() => {
                      const position = editor.getPosition();
                      if (!position) return;
                      const clickedLine = position.lineNumber;

                      if (previewRef.current) {
                        // 💡 반반(both) 모드이고 미리보기가 한 페이지를 초과하는 경우에만 연동 진행
                        const isNotScrollable = previewRef.current.scrollHeight <= previewRef.current.clientHeight;
                        if (previewModeRef.current !== 'both' || isNotScrollable) return;

                        const totalLines = editor.getModel()?.getLineCount() || 1;

                        // 맨 위(첫 줄) 클릭 시 최상단 스크롤
                        if (clickedLine === 1) {
                          previewRef.current.scrollTo({
                            top: 0,
                            behavior: 'smooth'
                          });
                          return;
                        }

                        // 맨 아래(끝 줄) 클릭 시 최하단 스크롤
                        if (clickedLine === totalLines) {
                          previewRef.current.scrollTo({
                            top: previewRef.current.scrollHeight,
                            behavior: 'smooth'
                          });
                          return;
                        }

                        const targetElement = previewRef.current.querySelector(`[data-line="${clickedLine}"]`) as HTMLElement;
                        if (targetElement) {
                          verticalScrollToElement(previewRef.current, targetElement, 'center', 'smooth');
                        } else {
                          // 일치하는 엘리먼트가 없으면, 클릭한 라인보다 작거나 같은 가장 가까운 상위 엘리먼트를 찾아 스크롤
                          const elements = Array.from(previewRef.current.querySelectorAll('[data-line]')) as HTMLElement[];
                          let targetEl: HTMLElement | null = null;
                          let maxLine = -1;
                          for (const el of elements) {
                            const lineStr = el.getAttribute('data-line');
                            if (lineStr) {
                              const line = parseInt(lineStr, 10);
                              if (line <= clickedLine && line > maxLine) {
                                  maxLine = line;
                                  targetEl = el;
                              }
                            }
                          }
                          if (targetEl) {
                            verticalScrollToElement(previewRef.current, targetEl, 'center', 'smooth');
                          }
                        }
                      }
                    }, 10);
                  });
                  editor.onDidChangeCursorSelection((e) => {
                    // 실제 텍스트 선택 시에만 lastSelectionRef 갱신 (커서 이동으로 덮어써지는 버그 방지)
                    if (!e.selection.isEmpty()) {
                      lastSelectionRef.current = e.selection;
                    } else {
                      lastSelectionRef.current = null;
                    }
                    // 사장님 요청으로 텍스트 멀티선택 시 자동 노출은 완전 차단하되, 선택 영역이 지워지면(isEmpty) 플로팅 툴바를 자동으로 닫습니다.
                    if (e.selection.isEmpty()) {
                      setFloatingToolbar(prev => prev.visible ? { ...prev, visible: false } : prev);
                    }
                    // 💡 [고속 드래그 anchor 리셋 보정] Monaco가 mousemove 이벤트 간격 중 anchor를 잃으면 선택이 리셋되는 현상 방어
                    if (editorMouseDown && editorMouseAnchor && e.source === 'mouse') {
                      const sel = e.selection;
                      const anchorMatchStart = sel.startLineNumber === editorMouseAnchor.lineNumber && sel.startColumn === editorMouseAnchor.column;
                      const anchorMatchEnd = sel.endLineNumber === editorMouseAnchor.lineNumber && sel.endColumn === editorMouseAnchor.column;
                      if (!anchorMatchStart && !anchorMatchEnd) {
                        const aL = editorMouseAnchor.lineNumber, aC = editorMouseAnchor.column;
                        const fL = sel.positionLineNumber, fC = sel.positionColumn;
                        const forward = aL < fL || (aL === fL && aC < fC);
                        editor.setSelection({
                          startLineNumber: forward ? aL : fL,
                          startColumn: forward ? aC : fC,
                          endLineNumber: forward ? fL : aL,
                          endColumn: forward ? fC : aC
                        });
                      }
                    }
                  });

                  if (completionProviderRef.current) {
                    completionProviderRef.current.dispose();
                  }
                  completionProviderRef.current = monaco.languages.registerCompletionItemProvider('markdown', {
                    // 슬래시(/)와 일반 문자 모두에서 자동완성 트리거
                    triggerCharacters: ['/'],  // '/' 입력 시에만 슬래시 커맨드 팝업
                    provideCompletionItems: (model: any, position: any) => {
                      const textUntilPosition = model.getValueInRange({
                        startLineNumber: position.lineNumber,
                        startColumn: 1,
                        endLineNumber: position.lineNumber,
                        endColumn: position.column
                      });

                      // 현재 줄에서 마지막 '/' 부터 커서까지를 슬래시 단어로 추출
                      // 예) 'hello /bold' → slashWord = '/bold'
                      const slashMatch = textUntilPosition.match(/(^|\s)(\/\S*)$/);
                      if (!slashMatch) {
                        return { suggestions: [] };
                      }

                      const slashWord = slashMatch[2]; // '/bold', '/', '/im' 등
                      // '/' 하나만 있거나, '/단어' 형태일 때만 제안
                      if (!slashWord.startsWith('/')) {
                        return { suggestions: [] };
                      }

                      // 슬래시 단어 시작 컬럼 (교체 범위 시작)
                      const startColumn = position.column - slashWord.length;

                      const suggestions = getSlashCommands(monaco, customSlashCommandsRef.current);

                      // 입력한 단어로 필터링 (/ 이후 글자 기준)
                      const filterWord = slashWord.slice(1).toLowerCase(); // 'bold', 'im' 등

                      const filtered = filterWord.length === 0
                        ? suggestions  // '/' 만 입력 → 전체 표시
                        : suggestions.filter(s => {
                          const labelStr = typeof s.label === 'string' ? s.label : '';
                          const filterStr = typeof s.filterText === 'string' ? s.filterText : '';
                          return (
                            labelStr.toLowerCase().includes(filterWord) ||
                            filterStr.toLowerCase().includes(filterWord)
                          );
                        });

                      return {
                        suggestions: filtered.map(s => ({
                          ...s,
                          // '/bold' 전체를 교체하여 '/bold' → '**텍스트**' 로 올바르게 변환
                          range: {
                            startLineNumber: position.lineNumber,
                            endLineNumber: position.lineNumber,
                            startColumn: startColumn,
                            endColumn: position.column
                          }
                        }))
                      };
                    }
                  });

                  // [[ 위키 링크 자동완성 (파일 + 헤딩)
                  if (wikilinkProviderRef.current) {
                    wikilinkProviderRef.current.dispose();
                  }
                  wikilinkProviderRef.current = monaco.languages.registerCompletionItemProvider('markdown', {
                    triggerCharacters: ['[', '#'],
                    provideCompletionItems: async (model: any, position: any) => {
                      const textUntilPos = model.getValueInRange({
                        startLineNumber: position.lineNumber,
                        startColumn: Math.max(1, position.column - 80),
                        endLineNumber: position.lineNumber,
                        endColumn: position.column
                      });
                      const bracketMatch = textUntilPos.match(/\[\[([^\]\n]*)$/);
                      if (!bracketMatch) return { suggestions: [] };
                      const inside = bracketMatch[1];
                      const hashIdx = inside.indexOf('#');
                      const files = docLinkFilesRef.current;
                      const curPath = currentFileNodeRef.current?.path || '';
                      if (hashIdx >= 0) {
                        const fileMatch = inside.substring(0, hashIdx);
                        const headingFilter = inside.substring(hashIdx + 1).toLowerCase();
                        let targetFile: FileNode | null = null;
                        for (const f of files) {
                          if (f.path?.toLowerCase().includes(fileMatch.toLowerCase()) || f.name?.toLowerCase().includes(fileMatch.toLowerCase())) {
                            targetFile = f; break;
                          }
                        }
                        if (!targetFile) return { suggestions: [] };
                        let headings: string[] = [];
                        try {
                          const text = await readFileTextRef.current(targetFile);
                          headings = extractHeadings(text);
                        } catch { return { suggestions: [] }; }
                        const filtered = headingFilter ? headings.filter(h => h.toLowerCase().includes(headingFilter)) : headings;
                        const relPath = getRelativePath(curPath, targetFile.path || '');
                        const matchLen = bracketMatch[0].length;
                        return {
                          suggestions: filtered.map(h => ({
                            label: h, kind: monaco.languages.CompletionItemKind.Reference,
                            insertText: `[[${relPath}#${h}]]`,
                            range: { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: position.column - matchLen, endColumn: position.column }
                          }))
                        };
                      }
                      const fileFilter = inside.toLowerCase();
                      const filteredFiles = files.filter(f => {
                        const name = f.name || ''; const path = f.path || '';
                        return !fileFilter || name.toLowerCase().includes(fileFilter) || path.toLowerCase().includes(fileFilter);
                      });
                      const matchLen = bracketMatch[0].length;
                      return {
                        suggestions: filteredFiles.map(f => {
                          const relPath = getRelativePath(curPath, f.path || '');
                          return {
                            label: f.name || f.path || '', kind: monaco.languages.CompletionItemKind.File,
                            insertText: `[[${relPath}]]`,
                            range: { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: position.column - matchLen, endColumn: position.column }
                          };
                        })
                      };
                    }
                  });

                  // ⛔ [반반 스크롤 동기화 제거] — 타이핑 시 Monaco 자동 스크롤이 프리뷰를 흔들던 문제 수정
                  // 프리뷰 → 에디터 단방향 동기화만 유지 (프리뷰 onScroll)

                  editor.onDidDispose(() => {
                    if (editorRef.current === editor) {
                      editorRef.current = null;
                    }
                  });
  };

  return { handleMount };
}