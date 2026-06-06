/**
 * 🎨 온리비 마크다운 에디터 - 고성능 프론트엔드 마크다운 및 수식 전처리 공용 유틸리티
 */

/**
 * 🛡️ 해당 라인이 마크다운 리스트(순서 있는/없는 목록, 체크리스트 등)에 해당하는지 판별합니다.
 */
function isAnyListLine(line: string): boolean {
  if (!line) return false;
  const trimmed = line.trim();
  // 1. 순서 있는 목록 — 아라비아 숫자(1. 2.) 만 감지 (로마자·원문자·전각 기호 제외)
  const isOrdered = /^\d+[\.\)]\s/.test(trimmed);
  // 2. 순서 없는 목록 및 체크리스트 감지
  const isUnordered = /^(?:[-*+]\s|\[[ xX]?\])/.test(trimmed);
  return isOrdered || isUnordered;
}

/**
 * 📏 해당 라인의 들여쓰기 수준(Indent Level)을 스페이스 개수 기준으로 계산합니다.
 */
function getIndentLevel(line: string): number {
  if (!line) return 0;
  const match = line.match(/^([ \t]*)/);
  if (!match) return 0;
  const indentStr = match[1];
  let count = 0;
  for (let i = 0; i < indentStr.length; i++) {
    if (indentStr[i] === '\t') count += 4;
    else count += 1;
  }
  return count;
}

export interface ProcessedMarkdown {
  text: string;
  lineMap: number[];
}

/**
 * 마크다운 전처리 통합 파이프라인 함수
 * 1. 볼드 처리된 block math 수식 기호($$)의 개행 변환을 처리합니다.
 * 2. 탭 들여쓰기 보정 및 공백 정규화(correctMarkdownIndents)를 수행합니다.
 * 3. 마크다운의 문법적 구분을 위한 라인 브레이크 완충 개행(formatLineBreaksForPreview)을 주입합니다.
 * 이 모든 과정에서 결과물의 각 라인이 원본 에디터의 몇 번째 라인(1-based)에 해당하는지 매핑 정보(lineMap)를 함께 반환합니다.
 * 
 * @param content 원본 마크다운 텍스트
 * @returns 전처리된 텍스트 및 라인 매핑 배열
 */
export function preprocessMarkdownForPreview(content: string): ProcessedMarkdown {
  if (!content) return { text: "", lineMap: [] };

  // Step 1: 볼드 수식($$) 개행 분리 및 초기 1-based 라인 매핑 생성
  const originalLines = content.split("\n");
  let expandedLines: string[] = [];
  let expandedLineMap: number[] = []; // 각 확장 라인이 원본의 몇 번째 줄(1-based)인지 기록

  originalLines.forEach((line, index) => {
    const originalLineNumber = index + 1;
    
    // ✂️ [수동 페이지 분할 문법 사전 지원] [page-break], <!-- [page-break] --> 또는 <!-- [auto-page-break] --> 를 미리 HTML div 태그로 변환하여 
    // 라인 매핑 정보(lineMap)가 뒤틀리거나 어긋나는 현상을 방지합니다.
    const isPageBreak = /^(?:\[page-break\]|<!--\s*\[?(?:auto-)?page-break\]?\s*-->)\s*$/.test(line.trim());
    if (isPageBreak) {
      expandedLines.push("");
      expandedLineMap.push(originalLineNumber);
      expandedLines.push("");
      expandedLineMap.push(originalLineNumber);
      expandedLines.push('<div class="page-break"></div>');
      expandedLineMap.push(originalLineNumber);
      expandedLines.push("");
      expandedLineMap.push(originalLineNumber);
      expandedLines.push("");
      expandedLineMap.push(originalLineNumber);
      return;
    }
    
    // 수식 기호 정규화 및 볼드 수식 분리
    let processedLine = line.replace(/\\/g, '\\');
    const replaced = processedLine.replace(/(\*\*|__)\$\$(.*?)\$\$(\*\*|__)/g, (match, p1, p2, p3) => {
      return `${p1}\n$$\n${p2}\n$$\n${p3}`;
    });
    
    const parts = replaced.split("\n");
    parts.forEach(part => {
      expandedLines.push(part);
      expandedLineMap.push(originalLineNumber);
    });
  });



  // Step 2: 탭 보정 및 들여쓰기 공백 정규화 (correctMarkdownIndents)
  let insideCodeBlock = false;
  let insideParagraph = false;
  let paragraphBaseIndent = "";

  const correctedLines = expandedLines.map((line, index) => {
    const trimmed = line.trim();
    
    if (trimmed === '<div class="page-break"></div>') {
      return line; // 💡 수동 페이지 분할용 특수 HTML 태그는 이스케이프 및 들여쓰기 공백 정규화에서 완전히 스킵합니다.
    }
    
    if (trimmed.startsWith("```")) {
      insideCodeBlock = !insideCodeBlock;
      insideParagraph = false;
      return line;
    }
    
    if (insideCodeBlock) {
      return line;
    }
    
    if (trimmed === "") {
      insideParagraph = false;
      paragraphBaseIndent = "";
      return line;
    }

    // 💡 숫자 목록(Ordered List) 및 다른 마크다운 요소들은 파서의 AST 분석 후 
    // 커스텀 렌더러에서 직접 가공하므로, 이전의 제로 너비 공백(\u200B) 주입 우회 처리는 필요가 없어 삭제합니다.
    
    let processedLine = line.replace(/\t/g, "    ");
    
    // 🛡️ 코드 블록 외 본문 텍스트 내 위험 HTML 구조 태그 이스케이프
    const dangerousTags = ['pre', 'code', 'div', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'tbody', 'thead', 'blockquote'];
    dangerousTags.forEach(tag => {
      const openRegex = new RegExp(`<(${tag})(?:\\s+[^>]*)?>`, 'gi');
      const closeRegex = new RegExp(`</(${tag})>`, 'gi');
      processedLine = processedLine.replace(openRegex, '&lt;$1&gt;').replace(closeRegex, '&lt;/$1&gt;');
    });

    const isSpecial = /^(?:\s*#+\s|\s*[-*+]\s|\s*\d+[\.\)]\s|\s*>|\s*---|\s*\||\s*\$\$|\s*<[a-zA-Z]|\s*[①-⑩❶-❿\u2460-\u2469\u2756-\u2767])/.test(processedLine);
    
    if (isSpecial) {
      insideParagraph = false;
      paragraphBaseIndent = "";
      
      const indentMatch = processedLine.match(/^( +)/);
      if (indentMatch) {
        const indentSpaces = indentMatch[1];
        const remainingText = processedLine.substring(indentSpaces.length);
        
        const isListOrQuote = /^(?:[-*+]\s|(?:\d+)\.\s|>|\s*\[[ xX]?\])/.test(remainingText.trim());
        const isHeading = /^(#{1,6})\s/.test(remainingText.trim());
        const isDivider = /^---/.test(remainingText.trim());

        if (isListOrQuote) {
          // 💡 공백 4칸(또는 탭 1개) 단위로만 들여쓰기 계층을 인정하고, 
          // 1~3칸의 어정쩡한 미세 공백은 0칸으로 싹 다 제거(Trim)하여 이중 들여쓰기 꼬임을 방지합니다.
          const indentLength = indentSpaces.length;
          let normalizedIndent = "";
          if (indentLength >= 4) {
            const steps = Math.floor(indentLength / 4);
            normalizedIndent = "    ".repeat(steps);
          }
          processedLine = normalizedIndent + remainingText.trim();
        } else if (isHeading || isDivider) {
          processedLine = remainingText.trim();
        }
      }
      
      return processedLine;
    }
    
    const indentMatch = processedLine.match(/^( +)/);
    const lineIndent = indentMatch ? indentMatch[1] : "";
    const remainingText = processedLine.substring(lineIndent.length);
    
    if (!insideParagraph) {
      insideParagraph = true;
      let baseIndent = "";
      let nextLineIndex = index + 1;
      while (nextLineIndex < expandedLines.length) {
        const nextLine = expandedLines[nextLineIndex];
        if (nextLine.trim() === "") break;
        
        const isNextSpecial = /^(?:\s*#+\s|\s*[-*+]\s|\s*\d+\.\s|\s*>|\s*---|\s*\||\s*\$\$|\s*<[a-zA-Z])/.test(nextLine);
        if (isNextSpecial) break;
        
        const nextLineProcessed = nextLine.replace(/\t/g, "  ");
        const nextLineMatch = nextLineProcessed.match(/^( +)/);
        baseIndent = nextLineMatch ? nextLineMatch[1] : "";
        break;
      }
      
      paragraphBaseIndent = baseIndent;
      return " ".repeat(lineIndent.length) + remainingText;
    } else {
      let targetIndent = lineIndent.length > paragraphBaseIndent.length ? paragraphBaseIndent : lineIndent;
      return " ".repeat(targetIndent.length) + remainingText;
    }
  });

  // Step 2.5: 숫자 목록(Ordered List)의 촘촘한 리스트 간격 및 뭉침 현상 재현을 위해 순서 없는 목록 기호(- ) 강제 주입
  let insideCodeBlockDeordered = false;

  const deorderedLines = correctedLines.map((line, index) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      insideCodeBlockDeordered = !insideCodeBlockDeordered;
      return line;
    }

    if (insideCodeBlockDeordered) {
      return line;
    }

    // 🛡️ 빈 줄 지능형 분기 처리:
    // ReactMarkdown(및 rehypeRaw)은 HTML 표준 스펙을 강하게 준수하므로, 리스트(ul/ol) 구조 중간에 
    // 직계 자식으로 <div> 태그가 강제 주입되면 파서가 이를 오류로 판단하여 날려버리고 리스트를 하나로 이어붙입니다.
    // 따라서 빈 줄 기준 가장 가까운 상하단 라인을 탐색하여, 들여쓰기가 일치하는 리스트 구조 내부라면 
    // 합법적 리스트 요소인 `<li class="onrivi-empty-list-row"></li>`를 주입하고, 그 외에는 `<div class="onrivi-list-spacer"></div>`를 주입합니다.
    if (trimmed === "" || trimmed === "\u00A0") {
      let prevNonEmptyLine = "";
      let pIdx = index - 1;
      while (pIdx >= 0) {
        if (correctedLines[pIdx].trim() !== "") {
          prevNonEmptyLine = correctedLines[pIdx];
          break;
        }
        pIdx--;
      }

      let nextNonEmptyLine = "";
      let nIdx = index + 1;
      while (nIdx < correctedLines.length) {
        if (correctedLines[nIdx].trim() !== "") {
          nextNonEmptyLine = correctedLines[nIdx];
          break;
        }
        nIdx++;
      }

      if (prevNonEmptyLine && nextNonEmptyLine && isAnyListLine(prevNonEmptyLine) && isAnyListLine(nextNonEmptyLine)) {
        const prevIndent = getIndentLevel(prevNonEmptyLine);
        const nextIndent = getIndentLevel(nextNonEmptyLine);
        if (prevIndent === nextIndent) {
          const indentSpaces = " ".repeat(prevIndent);
          // 💡 순서없는/체크리스트 계층 내부의 빈 행은 - onrivi-empty-row 로 채워 들여쓰기 꼬임을 방지합니다.
          return `${indentSpaces}- onrivi-empty-row`;
        }
      }
      return line;
    }

    return line;
  });

  // Step 3: 미리보기용 여유 개행 주입 (formatLineBreaksForPreview) 및 라인 매핑 갱신
  const finalLines: string[] = [];
  const finalLineMap: number[] = [];

  for (let i = 0; i < deorderedLines.length; i++) {
    const curr = deorderedLines[i];
    const origLineNum = expandedLineMap[i];

    finalLines.push(curr);
    finalLineMap.push(origLineNum);

    if (i < correctedLines.length - 1) {
      const next = correctedLines[i + 1];
      
      const isCurrSpecial = /^(?:\s*[-*+]\s|\s*\d+[\.\)]\s|\s*#+\s|---|\s*\||\s*\$\$|\s*[①-⑩❶-❿\u2460-\u2469\u2756-\u2767])/.test(curr.trim());
      const isNextSpecial = /^(?:\s*[-*+]\s|\s*\d+[\.\)]\s|\s*#+\s|---|\s*\||\s*\$\$|\s*[①-⑩❶-❿\u2460-\u2469\u2756-\u2767])/.test(next.trim());
      
      const getLineIndent = (line: string): string => {
        const processed = line.replace(/\t/g, "  ");
        const match = processed.match(/^( +)/);
        return match ? match[1] : "";
      };
      
      const isListLine = (line: string): boolean => {
        const trimmed = line.trim();
        return /^(?:[-*+]\s|\d+[\.\)]\s|\[[ xX]?\]|[①-⑩❶-❿\u2460-\u2469\u2756-\u2767])/.test(trimmed);
      };
      
      const currIndent = getLineIndent(curr);
      const nextIndent = getLineIndent(next);
      
      const isCurrEmpty = curr === "" || curr === "\u00A0" || curr.includes("onrivi-list-spacer");
      const isNextEmpty = next === "" || next === "\u00A0" || next.includes("onrivi-list-spacer");
      const isCurrSpacer = curr === "\u00A0" || curr.includes("onrivi-list-spacer");
      const isNextSpacer = next === "\u00A0" || next.includes("onrivi-list-spacer");
      
      const isNextNewIndent = nextIndent !== "" && currIndent !== nextIndent;
      const isTableToTable = curr.trim().startsWith("|") && next.trim().startsWith("|");
      const isQuoteToQuote = curr.trim().startsWith(">") && next.trim().startsWith(">");
      const isListToList = isListLine(curr) && isListLine(next);
      
      // onrivi-empty-list-row 태그나 빈 줄 사이, 리스트 아이템 사이에는 추가 빈 줄을 주입하지 않습니다.
      // (단, 문단 사이 공간을 보존하는 onrivi-list-spacer는 일반 문단 사이에 들어오므로 마크다운 파서가 이스케이프 등을 올바르게 인식하도록 뒤에 개행을 허용합니다.)
      const isCurrListRow = curr.includes('onrivi-empty-list-row');
      const isNextListRow = next.includes('onrivi-empty-list-row');

      if (!isTableToTable && !isQuoteToQuote && !isListToList && !isCurrEmpty && !isNextEmpty && !isCurrListRow && !isNextListRow && (isCurrSpecial || isNextSpecial || isNextNewIndent || isCurrSpacer || isNextSpacer)) {
        finalLines.push("");
        finalLineMap.push(origLineNum); // 추가된 빈 줄도 직전 원본 라인 번호에 매핑
      }
    }
  }

  return {
    text: finalLines.join("\n"),
    lineMap: finalLineMap
  };
}

/**
 * KaTeX 수학 수식에서 그리스 자모 단추와 수식 기호가 칠판 볼드체(Mathematical Bold)로 눈에 띄게 렌더링되도록
 * 실시간으로 LaTeX 수식을 \boldsymbol{...} 문법으로 래핑해 줍니다.
 * @param formula 원본 LaTeX 수식 문자열
 * @returns \boldsymbol{...}로 래핑되어 볼드 렌더링이 보장된 LaTeX 수식 문자열
 */
export function wrapMathWithBold(formula: string): string {
  if (!formula) return "";
  
  if (formula.includes("\\boldsymbol") || formula.includes("\\mathbf")) {
    return formula;
  }
  
  return `\\boldsymbol{${formula}}`;
}
