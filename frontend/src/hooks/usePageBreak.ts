// @ts-nocheck
import { useCallback, useRef } from 'react';
import { DEFAULT_PROFILE } from "@/constants/cssProfile";

/**
 * [ONR-16-003] usePageBreak 커스텀 훅
 * @description A4 용지 기준 지능형 페이지 나누기 계산 및 초기화 로직을 처리하는 커스텀 훅입니다.
 */
export const usePageBreak = (
  editorRef: any,
  previewRef: any,
  profiles: any[],
  activeProfileId: string,
  showToast: (message: string, type: 'success' | 'warning' | 'error' | 'info') => void
) => {
  const isAutoPageBreakingRef = useRef(false);
  const lastPageBreakCountRef = useRef(0);

  /**
   * 커서 이하의 수동/자동 페이지 구분선을 지능형으로 다시 계산하여 주입합니다.
   */
  const handleResetPageBreaks = useCallback(async () => {
    if (!editorRef.current || !previewRef.current) return;
    const editor = editorRef.current;
    const originalContent = editor.getValue();
    const cursorPosition = editor.getPosition();
    const cursorLineNum = cursorPosition ? cursorPosition.lineNumber : 1;

    const originalLines = originalContent.split('\n');

    // 1. 커서 기준 상단(Part A)과 하단(Part B)으로 원고 이분할
    const partALines = originalLines.slice(0, cursorLineNum - 1);
    const partBLines = originalLines.slice(cursorLineNum - 1);

    // Part B에서만 수동/자동 구분선 기호를 완전히 소거하여 초기화
    const cleanedPartBContent = partBLines.join('\n')
      .replace(/\n*(?:\[page-break\]|<!--\s*\[?(?:auto-)?page-break\]?\s*-->)\n*/gi, '\n');

    const cleanedContent = [...partALines, cleanedPartBContent].join('\n');
    editor.setValue(cleanedContent);

    // 가상 돔 및 렌더러가 완전히 안착할 수 있도록 150ms 비동기 지연 대기
    await new Promise(resolve => setTimeout(resolve, 150));

    const container = previewRef.current;
    let contentRoot = container.querySelector('.print\\:\\!block') as HTMLElement;
    if (!contentRoot) return;

    const hasSingleDivChild = contentRoot.children.length === 1 && contentRoot.children[0].tagName === 'DIV';
    if (hasSingleDivChild) {
      contentRoot = contentRoot.children[0] as HTMLElement;
    }

    const childNodes = Array.from(contentRoot.children) as HTMLElement[];
    if (childNodes.length === 0) return;

    // 현재 활성화된 용지 규격 및 마진 계측 (A4 기준)
    const activeProfile = profiles.find(p => p.id === activeProfileId) || DEFAULT_PROFILE;
    const isLandscape = activeProfile.pageStyle.orientation === 'landscape';
    const paperHeightPx = isLandscape ? 794 : 1123;
    const topPx = (parseFloat(activeProfile.pageStyle.marginTop || '10') || 10) * 3.7795;
    const botPx = (parseFloat(activeProfile.pageStyle.marginBottom || '10') || 10) * 3.7795;
    const usableHeight = paperHeightPx - topPx - botPx;

    let currentHeightSum = 0;
    const breakLineNumbers: number[] = [];

    // 개별 자식 컴포넌트들을 순회하며 높이 실측 및 나누기 임계선 산출
    childNodes.forEach((child) => {
      const isUserForcedPageBreak = (child.tagName === 'DIV' && child.className.includes('page-break')) ||
                                    child.getAttribute('data-page-break') === 'true';

      const lineStr = child.getAttribute('data-line');
      const lineNum = lineStr ? parseInt(lineStr, 10) : -1;

      // 상단 파트(Part A)의 기존 수동/자동 구분선은 하드브레이크로 인정하여 영점 리셋
      if (isUserForcedPageBreak) {
        currentHeightSum = 0;
        return;
      }

      if (lineNum <= 0) return;

      const elementHeight = child.offsetHeight || child.getBoundingClientRect().height || 0;
      const style = window.getComputedStyle(child);
      const marginTopVal = parseFloat(style.marginTop) || 0;
      const marginBottomVal = parseFloat(style.marginBottom) || 0;
      const totalHeight = elementHeight + marginTopVal + marginBottomVal;

      // 커서 위치 이하의 파트(Part B)에 대해서만 임계선 돌파 시 강제 페이지 나눔 주입 계산 실행
      if (lineNum >= cursorLineNum) {
        if (currentHeightSum + totalHeight > usableHeight && currentHeightSum > 0) {
          breakLineNumbers.push(lineNum);
          currentHeightSum = totalHeight;
        } else {
          currentHeightSum += totalHeight;
        }
      } else {
        currentHeightSum += totalHeight;
      }
    });

    // 2. 산출된 하단부(Part B) 분할 줄 번호 지점에 역순으로 <!-- [page-break] --> 코멘트를 직접 주입
    const lines = cleanedContent.split('\n');
    const uniqueLineNumbers = Array.from(new Set(breakLineNumbers)).sort((a, b) => b - a);
    uniqueLineNumbers.forEach((lineNum) => {
      if (lineNum > 1 && lineNum <= lines.length) {
        lines.splice(lineNum - 1, 0, '<!-- [page-break] -->');
      }
    });

    const finalContent = lines.join('\n');
    
    editor.pushUndoStop();
    editor.executeEdits("resetPageBreaks", [{
      range: editor.getModel().getFullModelRange(),
      text: finalContent,
      forceMoveMarkers: true
    }]);
    editor.pushUndoStop();

    if (cursorPosition) {
      editor.setPosition(cursorPosition);
      editor.focus();
    }

    showToast(`커서 ${cursorLineNum}행 이하의 페이지 나누기가 지능형으로 재계산되어 주입되었습니다.`, "success");
  }, [editorRef, previewRef, profiles, activeProfileId, showToast]);

  /**
   * 타이핑 시 지능형 자동 페이지 나눔을 실행합니다.
   */
  const executeAutoPageBreak = useCallback(async (editor: any, startLineNum: number) => {
    if (isAutoPageBreakingRef.current || !previewRef.current) return;
    
    isAutoPageBreakingRef.current = true; // Lock!
    const cursorPosition = editor.getPosition();
    
    try {
      const originalContent = editor.getValue();
      const originalLines = originalContent.split('\n');

      const partALines = originalLines.slice(0, startLineNum - 1);
      const partBLines = originalLines.slice(startLineNum - 1);

      const cleanedPartBContent = partBLines.join('\n')
        .replace(/\n*(?:\[page-break\]|<!--\s*\[?(?:auto-)?page-break\]?\s*-->)\n*/gi, '\n');

      const cleanedContent = [...partALines, cleanedPartBContent].join('\n');
      editor.setValue(cleanedContent);

      await new Promise(resolve => setTimeout(resolve, 150));

      const container = previewRef.current;
      let contentRoot = container.querySelector('.print\\:\\!block') as HTMLElement;
      if (!contentRoot) return;

      const hasSingleDivChild = contentRoot.children.length === 1 && contentRoot.children[0].tagName === 'DIV';
      if (hasSingleDivChild) {
        contentRoot = contentRoot.children[0] as HTMLElement;
      }

      const childNodes = Array.from(contentRoot.children) as HTMLElement[];
      if (childNodes.length === 0) return;

      const activeProfile = profiles.find(p => p.id === activeProfileId) || DEFAULT_PROFILE;
      const isLandscape = activeProfile.pageStyle.orientation === 'landscape';
      const paperHeightPx = isLandscape ? 794 : 1123;
      const topPx = (parseFloat(activeProfile.pageStyle.marginTop || '10') || 10) * 3.7795;
      const botPx = (parseFloat(activeProfile.pageStyle.marginBottom || '10') || 10) * 3.7795;
      const usableHeight = paperHeightPx - topPx - botPx;

      let currentHeightSum = 0;
      const breakLineNumbers: number[] = [];

      childNodes.forEach((child) => {
        const isUserForcedPageBreak = (child.tagName === 'DIV' && child.className.includes('page-break')) ||
                                      child.getAttribute('data-page-break') === 'true';

        const lineStr = child.getAttribute('data-line');
        const lineNum = lineStr ? parseInt(lineStr, 10) : -1;

        if (isUserForcedPageBreak) {
          currentHeightSum = 0;
          return;
        }

        if (lineNum <= 0) return;

        const elementHeight = child.offsetHeight || child.getBoundingClientRect().height || 0;
        const style = window.getComputedStyle(child);
        const marginTopVal = parseFloat(style.marginTop) || 0;
        const marginBottomVal = parseFloat(style.marginBottom) || 0;
        const totalHeight = elementHeight + marginTopVal + marginBottomVal;

        if (lineNum >= startLineNum) {
          if (currentHeightSum + totalHeight > usableHeight && currentHeightSum > 0) {
            breakLineNumbers.push(lineNum);
            currentHeightSum = totalHeight;
          } else {
            currentHeightSum += totalHeight;
          }
        } else {
          currentHeightSum += totalHeight;
        }
      });

      const lines = cleanedContent.split('\n');
      const uniqueLineNumbers = Array.from(new Set(breakLineNumbers)).sort((a, b) => b - a);
      uniqueLineNumbers.forEach((lineNum) => {
        if (lineNum > 1 && lineNum <= lines.length) {
          lines.splice(lineNum - 1, 0, '<!-- [page-break] -->');
        }
      });

      const finalContent = lines.join('\n');
      
      const pageBreakMatches = finalContent.match(/page-break/gi);
      lastPageBreakCountRef.current = pageBreakMatches ? pageBreakMatches.length : 0;

      editor.pushUndoStop();
      editor.executeEdits("autoPageBreak", [{
        range: editor.getModel().getFullModelRange(),
        text: finalContent,
        forceMoveMarkers: true
      }]);
      editor.pushUndoStop();

      if (cursorPosition) {
        editor.setPosition(cursorPosition);
        editor.focus();
      }

    } finally {
      isAutoPageBreakingRef.current = false;
    }
  }, [previewRef, profiles, activeProfileId]);

  return {
    isAutoPageBreakingRef,
    lastPageBreakCountRef,
    handleResetPageBreaks,
    executeAutoPageBreak
  };
};
