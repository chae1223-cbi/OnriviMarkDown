// @ts-nocheck

// ====================================================================
// 📊 [OMD-EDIT-editorActions-0005] editorActions ➔ scrollToLine
// 🎯 @KICK  : Monaco 에디터 내에서 특정 라인 번호로 스크롤하고 포커스를 이동시킨다
// 🛡️ @GUARD : editorRef.current가 없으면 early return
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
/**
 * [ONR-15-010] scrollToLine 함수 (추출된 유틸리티)
 * @description Monaco 에디터 내에서 특정 라인 번호로 스크롤하고 커서 위치를 해당 라인의 첫 번째 열로 이동한 뒤 포커스를 줍니다.
 * @param editorRef 에디터 인스턴스 Ref 객체
 * @param lineNumber 에디터에서 이동하고자 하는 대상 라인 번호
 */
export const scrollToLine = (editorRef: any, lineNumber: number) => {
  if (editorRef.current) {
    const editor = editorRef.current;
    editor.revealLineInCenter(lineNumber);
    editor.setPosition({ lineNumber, column: 1 });
    editor.focus();
  }
};

// ====================================================================
// 📊 [OMD-EDIT-editorActions-0004] editorActions ➔ insertAtCursor
// 🎯 @KICK  : 현재 커서 위치 또는 마지막 선택 영역에 텍스트를 주입한다
// 🛡️ @GUARD : editorRef.current가 없으면 early return, selection 검증 후 처리
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
/**
 * [ONR-15-011] insertAtCursor 함수 (추출된 유틸리티)
 * @description 에디터의 현재 커서 위치 또는 마지막으로 선택된 영역에 텍스트를 주입하고 Monaco 에디터 토크나이저를 강제로 갱신합니다.
 * @param editorRef 에디터 인스턴스 Ref 객체
 * @param lastSelectionRef 마지막 선택 영역 Ref 객체
 * @param text 삽입할 텍스트 내용
 */
export const insertAtCursor = (editorRef: any, lastSelectionRef: any, text: string) => {
  if (editorRef.current) {
    const editor = editorRef.current;
    let selection = editor.getSelection();
    if (!selection || (selection.isEmpty() && lastSelectionRef.current)) {
      selection = lastSelectionRef.current;
    }
    if (selection) {
      const range = new (window as any).monaco.Range(
        selection.startLineNumber,
        selection.startColumn,
        selection.endLineNumber,
        selection.endColumn
      );
      editor.pushUndoStop();
      editor.executeEdits("insert", [{ range, text, forceMoveMarkers: true }]);
      editor.pushUndoStop();
      
      try {
        const model = editor.getModel();
        if (model && typeof model.forceTokenization === 'function') {
          const startLine = selection.startLineNumber;
          const lineCount = text.split('\n').length;
          for (let i = startLine; i <= startLine + lineCount; i++) {
            model.forceTokenization(i);
          }
        }
        editor.layout();
      } catch (_) {}

      editor.focus();
    }
  }
};

// ====================================================================
// 📊 [OMD-EDIT-editorActions-0003] editorActions ➔ findLineNumberByHeading
// 🎯 @KICK  : 문서 내에서 특정 제목 텍스트가 위치한 라인 번호를 탐색한다
// 🛡️ @GUARD : content나 heading이 falsy이면 1 반환, 매칭 실패 시에도 1 반환
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
/**
 * [ONR-15-012] findLineNumberByHeading 함수 (추출된 유틸리티)
 * @description 문서 내에서 특정 제목(Heading) 텍스트가 위치한 라인 번호를 탐색합니다.
 * @param content 전체 문서 내용
 * @param heading 찾고자 하는 대상 제목 텍스트
 * @returns 대상 제목이 발견된 라인 번호 (기본값: 1)
 */
export const findLineNumberByHeading = (content: string, heading: string): number => {
  if (!content || !heading) return 1;
  const lines = content.split('\n');
  const cleanTarget = heading.toLowerCase().replace(/\s+/g, '').normalize('NFC');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const match = line.match(/^#{1,6}\s+(.*)$/);
    if (match) {
      const headingText = match[1].trim();
      const cleanHeading = headingText.toLowerCase().replace(/\s+/g, '').normalize('NFC');
      if (cleanHeading === cleanTarget) {
        return i + 1;
      }
    }
  }
  return 1;
};

// ====================================================================
// 📊 [OMD-EDIT-editorActions-0002] editorActions ➔ insertBlockTag
// 🎯 @KICK  : 선택 영역 또는 커서 위치를 블록 태그로 감싼다
// 🛡️ @GUARD : editorRef.current가 없으면 early return, selection이 없으면 return
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
/**
 * [ONR-15-013] insertBlockTag 함수 (추출된 유틸리티)
 * @description 선택된 영역 또는 커서 위치를 HTML/마크다운 블록 태그(예: 코드 블록, 인용구 등)로 감싸줍니다.
 * @param editorRef 에디터 인스턴스 Ref 객체
 * @param startTag 시작 태그
 * @param endTag 종료 태그
 * @param defaultText 선택 영역이 없을 때 삽입할 기본 텍스트
 */
export const insertBlockTag = (editorRef: any, startTag: string, endTag: string, defaultText: string = "") => {
  if (!editorRef.current) return;
  const editor = editorRef.current;
  let selection = editor.getSelection();
  if (!selection) return;

  const model = editor.getModel();
  const text = model.getValueInRange(selection);

  if (text) {
    const newText = `${startTag}\n${text}\n${endTag}`;
    editor.pushUndoStop();
    editor.executeEdits("insertBlockTag", [{
      range: selection,
      text: newText,
      forceMoveMarkers: true
    }]);
    editor.pushUndoStop();
    const linesAdded = startTag.split('\n').length;
    editor.setSelection(new (window as any).monaco.Selection(
      selection.startLineNumber + linesAdded,
      selection.startColumn,
      selection.endLineNumber + linesAdded,
      selection.endColumn
    ));
  } else {
    const textToWrap = defaultText;
    const newText = textToWrap ? `${startTag}\n${textToWrap}\n${endTag}` : `${startTag}\n\n${endTag}`;
    editor.pushUndoStop();
    editor.executeEdits("insertBlockTag", [{
      range: selection,
      text: newText,
      forceMoveMarkers: true
    }]);
    editor.pushUndoStop();

    const linesAdded = startTag.split('\n').length;
    if (textToWrap) {
      editor.setSelection(new (window as any).monaco.Selection(
        selection.startLineNumber + linesAdded,
        1,
        selection.startLineNumber + linesAdded,
        1 + textToWrap.length
      ));
    } else {
      editor.setPosition({
        lineNumber: selection.startLineNumber + linesAdded,
        column: 1
      });
    }
  }
  try {
    const model = editor.getModel();
    if (model && typeof model.forceTokenization === 'function') {
      const startLine = selection.startLineNumber;
      const endLine = selection.endLineNumber;
      const linesAdded = startTag.split('\n').length + endTag.split('\n').length + 2;
      for (let i = startLine; i <= endLine + linesAdded; i++) {
        model.forceTokenization(i);
      }
    }
    editor.layout();
  } catch (_) {}

  editor.focus();
};

// ====================================================================
// 📊 [OMD-EDIT-editorActions-0001] editorActions ➔ wrapSelection
// 🎯 @KICK  : 선택된 텍스트를 지정된 문자열로 감싸거나 토글 방식으로 제거한다
// 🛡️ @GUARD : 이전 선택 영역이 없거나 비어 있으면 early return
// 🚨 @PATCH : **2026-09-03** — 선택된 텍스트에 서식(Bold/Italic 등) 적용 시 텍스트 앞뒤 태그만 분리 주입하고 pushUndoStop을 적용하여, Ctrl+Z 실행취소 시 텍스트는 보존되고 태그만 단독 취소되도록 개선
// 🔗 @CALLS : 없음
// ====================================================================
/**
 * [ONR-15-014] wrapSelection 함수 (추출된 유틸리티)
 * @description 현재 드래그 선택된 텍스트의 앞뒤를 지정된 문자열로 감싸거나 토글식으로 제거합니다.
 */
export const wrapSelection = (editorRef: any, lastSelectionRef: any, before: string, after: string = before, defaultText: string = "") => {
  if (editorRef.current) {
    const editor = editorRef.current;
    const refreshTokens = (start: number, end: number) => {
      try {
        const model = editor.getModel();
        if (model && typeof model.forceTokenization === 'function') {
          for (let i = start; i <= end; i++) {
            model.forceTokenization(i);
          }
        }
        editor.layout();
      } catch (_) {}
    };

    let selection = editor.getSelection();
    if ((!selection || selection.isEmpty()) && lastSelectionRef.current && !lastSelectionRef.current.isEmpty()) {
      selection = lastSelectionRef.current;
    }
    if (!selection) return;
    const model = editor.getModel();

    let startLine = selection.startLineNumber;
    let startCol = selection.startColumn;
    let endLine = selection.endLineNumber;
    let endCol = selection.endColumn;
    let text = model.getValueInRange(selection);

    let adjusted = false;
    while (text.length > 0 && (text[0] === '\r' || text[0] === '\n')) {
      adjusted = true;
      if (text[0] === '\n') {
        startLine++;
        startCol = 1;
      } else {
        startCol++;
      }
      text = text.slice(1);
    }
    while (text.length > 0 && (text[text.length - 1] === '\r' || text[text.length - 1] === '\n')) {
      adjusted = true;
      const lastChar = text[text.length - 1];
      if (lastChar === '\n') {
        endLine--;
        endCol = model.getLineMaxColumn(endLine);
      } else {
        endCol = Math.max(1, endCol - 1);
      }
      text = text.slice(0, -1);
    }

    if (adjusted) {
      selection = new (window as any).monaco.Selection(startLine, startCol, endLine, endCol);
    }

    const isEmpty = !text || text.length === 0;

    if (before && after && text.startsWith(before) && text.endsWith(after) && text.length >= (before.length + after.length)) {
      const stripped = text.slice(before.length, text.length - after.length);

      const range = new (window as any).monaco.Range(
        selection.startLineNumber,
        selection.startColumn,
        selection.endLineNumber,
        selection.endColumn
      );
      editor.pushUndoStop();
      editor.executeEdits("toggle-off-inside", [{ range, text: stripped, forceMoveMarkers: true }]);
      editor.pushUndoStop();

      setTimeout(() => {
        if (!selection) return;
        const startLine = selection.startLineNumber;
        const startCol = selection.startColumn;
        editor.setSelection(new (window as any).monaco.Selection(
          startLine,
          startCol,
          startLine,
          startCol + stripped.length
        ));
        refreshTokens(startLine, startLine);
      }, 10);
      editor.focus();
      return;
    }

    if (before && after) {
      const startLine = selection.startLineNumber;
      const startCol = selection.startColumn;
      const endLine = selection.endLineNumber;
      const endCol = selection.endColumn;

      if (startLine === endLine && startCol > before.length) {
        const rangeBefore = new (window as any).monaco.Range(startLine, startCol - before.length, startLine, startCol);
        const rangeAfter = new (window as any).monaco.Range(endLine, endCol, endLine, endCol + after.length);

        const textBefore = model.getValueInRange(rangeBefore);
        const textAfter = model.getValueInRange(rangeAfter);

        if (textBefore === before && textAfter === after) {
          const fullRange = new (window as any).monaco.Range(startLine, startCol - before.length, endLine, endCol + after.length);
          editor.pushUndoStop();
          editor.executeEdits("toggle-off-outside", [{ range: fullRange, text: text, forceMoveMarkers: true }]);
          editor.pushUndoStop();

          setTimeout(() => {
            if (!selection) return;
            editor.setSelection(new (window as any).monaco.Selection(
              startLine,
              startCol - before.length,
              endLine,
              startCol - before.length + text.length
            ));
            refreshTokens(startLine, endLine);
          }, 10);
          editor.focus();
          return;
        }
      }
    }

    if (!isEmpty) {
      // 💡 [태그 분리 삽입 스마트 엔진]
      // 텍스트가 선택된 상태에서 서식 적용 시, 텍스트 자체를 치환하지 않고
      // 텍스트 앞(start)과 뒤(end)에 태그만 독립 주입합니다.
      // 이렇게 하면 Ctrl+Z(실행취소) 시 원본 텍스트는 100% 안전하게 보존되고 오직 '태그'만 취소되어
      // 사용자가 방금 입력한 문자가 통째로 날아가는 현상을 완벽하게 방지합니다!
      const edits = [];
      if (before) {
        edits.push({
          range: new (window as any).monaco.Range(startLine, startCol, startLine, startCol),
          text: before,
          forceMoveMarkers: true
        });
      }
      if (after) {
        edits.push({
          range: new (window as any).monaco.Range(endLine, endCol, endLine, endCol),
          text: after,
          forceMoveMarkers: true
        });
      }

      editor.pushUndoStop();
      editor.executeEdits("wrap-tag", edits);
      editor.pushUndoStop();

      setTimeout(() => {
        if (!selection) return;
        const selectStart = startCol + (before ? before.length : 0);
        const selectEnd = (startLine === endLine) ? (endCol + (before ? before.length : 0)) : endCol;
        editor.setSelection(new (window as any).monaco.Selection(
          startLine,
          selectStart,
          endLine,
          selectEnd
        ));
        refreshTokens(startLine, endLine);
      }, 10);
      editor.focus();
      return;
    }

    // 선택 영역이 비어 있는 경우: defaultText를 포함하여 통째로 삽입
    const textToWrap = defaultText || "";
    const range = new (window as any).monaco.Range(
      selection.startLineNumber,
      selection.startColumn,
      selection.endLineNumber,
      selection.endColumn
    );
    editor.pushUndoStop();
    editor.executeEdits("wrap-empty", [{ range, text: `${before}${textToWrap}${after}`, forceMoveMarkers: true }]);
    editor.pushUndoStop();

    setTimeout(() => {
      if (!selection) return;
      const startLine = selection.startLineNumber;
      const startCol = selection.startColumn;
      const endLine = selection.endLineNumber;
      const endCol = selection.endColumn;

      if (startLine === endLine) {
        const selectStart = startCol + before.length;
        const selectEnd = defaultText ? selectStart + defaultText.length : endCol + before.length;
        editor.setSelection(new (window as any).monaco.Selection(
          startLine,
          selectStart,
          endLine,
          selectEnd
        ));
      } else {
        editor.setSelection(new (window as any).monaco.Selection(
          startLine,
          startCol,
          endLine,
          endCol + after.length
        ));
      }
      refreshTokens(startLine, endLine);
    }, 10);
    editor.focus();
  }
};
