// @ts-nocheck

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
      editor.executeEdits("insert", [{ range, text, forceMoveMarkers: true }]);
      
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
    editor.executeEdits("insertBlockTag", [{
      range: selection,
      text: newText,
      forceMoveMarkers: true
    }]);
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
    editor.executeEdits("insertBlockTag", [{
      range: selection,
      text: newText,
      forceMoveMarkers: true
    }]);

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
    const textToWrap = (isEmpty && defaultText) ? defaultText : text;

    if (before && after && text.startsWith(before) && text.endsWith(after) && text.length >= (before.length + after.length)) {
      const stripped = text.slice(before.length, text.length - after.length);

      const range = new (window as any).monaco.Range(
        selection.startLineNumber,
        selection.startColumn,
        selection.endLineNumber,
        selection.endColumn
      );
      editor.executeEdits("toggle-off-inside", [{ range, text: stripped, forceMoveMarkers: true }]);

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
          editor.executeEdits("toggle-off-outside", [{ range: fullRange, text: text, forceMoveMarkers: true }]);

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

    const range = new (window as any).monaco.Range(
      selection.startLineNumber,
      selection.startColumn,
      selection.endLineNumber,
      selection.endColumn
    );
    editor.executeEdits("toggle-on", [{ range, text: `${before}${textToWrap}${after}`, forceMoveMarkers: true }]);

    setTimeout(() => {
      if (!selection) return;
      const startLine = selection.startLineNumber;
      const startCol = selection.startColumn;
      const endLine = selection.endLineNumber;
      const endCol = selection.endColumn;

      if (startLine === endLine) {
        const selectStart = startCol + before.length;
        const selectEnd = isEmpty && defaultText ? selectStart + defaultText.length : endCol + before.length;
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
