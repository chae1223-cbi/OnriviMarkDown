/**
 * 🎨 온리비 마크다운 에디터 - 고성능 프론트엔드 마크다운 및 수식 전처리 공용 유틸리티
 */

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
  const expandedLines: string[] = [];
  const expandedLineMap: number[] = []; // 각 확장 라인이 원본의 몇 번째 줄(1-based)인지 기록

  originalLines.forEach((line, index) => {
    const originalLineNumber = index + 1;
    
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
      
      const isPrevLineEmpty = index > 0 && expandedLines[index - 1].trim() === "";
      if (isPrevLineEmpty) {
        return "\u00A0";
      }
      return line;
    }
    
    let processedLine = line.replace(/\t/g, "    ");
    
    // 🛡️ 코드 블록 외 본문 텍스트 내 위험 HTML 구조 태그 이스케이프
    const dangerousTags = ['pre', 'code', 'div', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'tbody', 'thead', 'blockquote'];
    dangerousTags.forEach(tag => {
      const openRegex = new RegExp(`<(${tag})(?:\\s+[^>]*)?>`, 'gi');
      const closeRegex = new RegExp(`</(${tag})>`, 'gi');
      processedLine = processedLine.replace(openRegex, '&lt;$1&gt;').replace(closeRegex, '&lt;/$1&gt;');
    });

    const isSpecial = /^(?:\s*#+\s|\s*[-*+]\s|\s*\d+\.\s|\s*>|\s*---|\s*\||\s*\$\$|\s*<[a-zA-Z])/.test(processedLine);
    
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
          // 🛡️ remarkDisableIndentedCode 플러그인이 적용되어 있으므로 코드블록 오매핑 염려가 없습니다.
          // 원본 들여쓰기 깊이를 그대로 보존하여 마크다운 파서가 정상적으로 ol/ul 계층을 파싱하고 번호를 1로 재시작하도록 처리합니다.
          processedLine = indentSpaces + remainingText.trim();
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
      return "\u00A0".repeat(lineIndent.length) + remainingText;
    } else {
      let targetIndent = lineIndent.length > paragraphBaseIndent.length ? paragraphBaseIndent : lineIndent;
      return "\u00A0".repeat(targetIndent.length) + remainingText;
    }
  });

  // Step 3: 미리보기용 여유 개행 주입 (formatLineBreaksForPreview) 및 라인 매핑 갱신
  const finalLines: string[] = [];
  const finalLineMap: number[] = [];

  for (let i = 0; i < correctedLines.length; i++) {
    const curr = correctedLines[i];
    const origLineNum = expandedLineMap[i];

    finalLines.push(curr);
    finalLineMap.push(origLineNum);

    if (i < correctedLines.length - 1) {
      const next = correctedLines[i + 1];
      
      const isCurrSpecial = /^(?:\s*[-*+]\s|\s*\d+\.\s|\s*#+\s|---|\s*\||\s*\$\$)/.test(curr.trim());
      const isNextSpecial = /^(?:\s*[-*+]\s|\s*\d+\.\s|\s*#+\s|---|\s*\||\s*\$\$)/.test(next.trim());
      
      const getLineIndent = (line: string): string => {
        const processed = line.replace(/\t/g, "  ");
        const match = processed.match(/^( +)/);
        return match ? match[1] : "";
      };
      
      const isListLine = (line: string): boolean => {
        const trimmed = line.trim();
        return /^(?:[-*+]\s|\d+\.\s|\[[ xX]?\])/.test(trimmed);
      };
      
      const currIndent = getLineIndent(curr);
      const nextIndent = getLineIndent(next);
      
      const isCurrEmpty = curr === "";
      const isNextEmpty = next === "";
      const isCurrSpacer = curr === "\u00A0";
      const isNextSpacer = next === "\u00A0";
      
      const isNextNewIndent = nextIndent !== "" && currIndent !== nextIndent;
      const isTableToTable = curr.trim().startsWith("|") && next.trim().startsWith("|");
      const isQuoteToQuote = curr.trim().startsWith(">") && next.trim().startsWith(">");
      const isListToList = isListLine(curr) && isListLine(next);
      
      if (!isTableToTable && !isQuoteToQuote && !isListToList && !isCurrEmpty && !isNextEmpty && (isCurrSpecial || isNextSpecial || isNextNewIndent || isCurrSpacer || isNextSpacer)) {
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
