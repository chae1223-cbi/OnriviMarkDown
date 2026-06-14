// @ts-nocheck
import { FileNode } from '@/lib/helper';

/**
 * [ONR-15-001] sanitizePastedText 함수 (추출된 유틸리티)
 * @description 붙여넣기된 문자열에 대해 줄바꿈 통일, 특수문자 제거, 불필요한 HTML 태그 정리 등 마크다운에 적합한 데이터로 정제합니다.
 * @param text 원본 붙여넣기 텍스트
 * @param skipTsvConversion TSV 표 변환 로직을 우회할지 여부
 * @returns 위생 가공된 결과 텍스트
 */
export const sanitizePastedText = (text: string, skipTsvConversion = false) => {
  let sanitized = text;

  // 1. 운영체제 간 줄바꿈 차이 통합 (\r\n -> \n)
  sanitized = sanitized.replace(/\r\n/g, '\n');

  // 2. 눈에 보이지 않는 유령 문자(Zero-width space 등) 제거
  sanitized = sanitized.replace(/[\u200B-\u200D\uFEFF]/g, '');

  // 3. 웹 복사 시 자주 딸려오는 지저분한 HTML 태그 찌꺼기 제거 (마크다운 포맷팅 방해 요소)
  sanitized = sanitized.replace(/<\/?(span|div|font|style|script|meta)[^>]*>/gi, '');

  // 4. 표 등에서 줄바꿈이 파괴되지 않도록 <br>과 섞인 실제 줄바꿈(\n)을 제거하고 <br>로 통일합니다.
  sanitized = sanitized.replace(/<br\s*\/?>\s*[\r\n]+\s*<br\s*\/?>/gi, '<br><br>');
  sanitized = sanitized.replace(/<br\s*\/?>\s*[\r\n]+/gi, '<br>');
  sanitized = sanitized.replace(/[\r\n]+\s*<br\s*\/?>/gi, '<br>');

  // 불필요한 다중 줄바꿈 정리 (3개 이상의 줄바꿈을 2개로)
  sanitized = sanitized.replace(/\n{3,}/g, '\n\n');

  // 5. 마크다운 강조 닫힘 태그 뒤에 글자/숫자가 바로 붙어있으면 공백 삽입 (CommonMark 호환성)
  sanitized = sanitized.replace(/(?<=[^\s*])(\*\*|__|~~)(?=\S)/g, '$1 ');

  // Auto-convert TSV to Markdown Table
  if (!skipTsvConversion && sanitized.includes('\t') && sanitized.includes('\n') && !sanitized.includes('|')) {
    const lines = sanitized.split('\n');
    const isTable = lines.some(line => line.includes('\t'));

    if (isTable) {
      const mdLines = lines.map((line, index) => {
        if (!line.trim()) return line;
        const cells = line.split('\t').map(cell => cell.trim());
        const row = '| ' + cells.join(' | ') + ' |';

        if (index === 0) {
          const separator = '|' + cells.map(() => '---').join('|') + '|';
          return row + '\n' + separator;
        }
        return row;
      });
      sanitized = mdLines.join('\n');
    }
  }

  return sanitized;
};

/**
 * [ONR-15-002] fixMarkdownTable 함수 (추출된 유틸리티)
 * @description 여러 줄로 쪼개진 마크다운 표 셀 데이터를 한 행으로 강제 병합하여 정합성 있는 마크다운 표 형태로 보정합니다.
 * @param text 보정 대상 마크다운 표 텍스트
 * @returns 정돈된 마크다운 표 텍스트
 */
export const fixMarkdownTable = (text: string) => {
  if (!text.includes('|')) return text;

  const lines = text.split('\n');
  const result: string[] = [];
  let currentRow = '';
  let inTable = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!inTable && trimmed.startsWith('|')) {
      inTable = true;
    }

    if (inTable) {
      if (trimmed === '' && currentRow === '') {
        inTable = false;
        result.push(line);
        continue;
      }

      if (currentRow === '') {
        currentRow = line;
      } else {
        if (trimmed === '') {
          currentRow += ' ';
        } else {
          if (!currentRow.trim().endsWith(' ')) {
            currentRow += ' ';
          }
          currentRow += line;
        }
      }

      if (currentRow.trim().endsWith('|')) {
        result.push(currentRow);
        currentRow = '';
      }
    } else {
      result.push(line);
    }
  }

  if (currentRow !== '') {
    result.push(currentRow);
  }

  return result.join('\n');
};

/**
 * [ONR-15-003] parseHtmlTableToMarkdown 함수 (추출된 유틸리티)
 * @description 웹에서 복사해 붙여넣어진 HTML 형식의 <table> 구문을 표준 마크다운 표 형식으로 변환합니다.
 * @param html 붙여넣기 시도된 원본 HTML 문자열
 * @param showToast 토스트 메시지 함수
 * @returns 마크다운 표 문자열 또는 변환 실패 시 null
 */
export const parseHtmlTableToMarkdown = (html: string, showToast?: (msg: string, type: string) => void) => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const table = doc.querySelector('table');
    if (!table) return null;

    let mdTable = '';
    const rows = table.querySelectorAll('tr');
    let isFirstRow = true;

    rows.forEach((row) => {
      const cells = row.querySelectorAll('th, td');
      if (cells.length === 0) return;

      const cellTexts = Array.from(cells).map(cell => {
        let inner = cell.innerHTML;
        inner = inner.replace(/<br\s*\/?>/gi, ' <br> ');
        inner = inner.replace(/<\/(p|div)>/gi, ' <br> ');

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = inner;
        let text = tempDiv.textContent || tempDiv.innerText || '';

        text = text.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
        text = text.replace(/(<br>\s*)+/g, '<br>');
        if (text.startsWith('<br>')) text = text.substring(4).trim();
        if (text.endsWith('<br>')) text = text.substring(0, text.length - 4).trim();

        return text;
      });

      mdTable += '| ' + cellTexts.join(' | ') + ' |\n';

      if (isFirstRow) {
        mdTable += '|' + cellTexts.map(() => '---').join('|') + '|\n';
        isFirstRow = false;
      }
    });
    return mdTable.trim() + '\n';
  } catch (err) {
    if (showToast) {
      showToast('HTML 표 파싱 중 오류가 발생했습니다.', 'error');
    }
    return null;
  }
};
