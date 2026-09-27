import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

// 1. editorUtils.ts의 Step 2 인용문 리스트 들여쓰기 보정
function normalizeListAndQuoteIndents(lines) {
  let listBlockBaseIndent = -1;
  let quoteListBaseIndent = -1;

  return lines.map(line => {
    let processedLine = line.replace(/\t/g, "    ");

    // A. 인용구 내부 리스트 들여쓰기 보정
    const quoteMatch = processedLine.match(/^([ \t]*>+[ \t]?)(.*)$/);
    if (quoteMatch) {
      const quotePrefix = quoteMatch[1];
      const content = quoteMatch[2];

      const indentMatch = content.match(/^( +)/);
      if (indentMatch) {
        const indentSpaces = indentMatch[1];
        const remainingText = content.substring(indentSpaces.length);
        const isList = /^(?:[-*+]\s|(?:\d+)\.\s|\[[ xX]?\])/.test(remainingText);

        if (isList) {
          const indentLength = indentSpaces.length;
          if (quoteListBaseIndent === -1) {
            quoteListBaseIndent = indentLength;
          }
          const relativeIndent = Math.max(0, indentLength - quoteListBaseIndent);
          let normalizedIndent = "";
          if (relativeIndent >= 2) {
            let steps = 1;
            if (relativeIndent <= 4) steps = 1;
            else if (relativeIndent <= 8) steps = 2;
            else if (relativeIndent <= 12) steps = 3;
            else steps = Math.floor((relativeIndent + 1) / 4);
            normalizedIndent = "    ".repeat(steps);
          }
          return `${quotePrefix}${normalizedIndent}${remainingText}`;
        }
      } else {
        const isList = /^(?:[-*+]\s|(?:\d+)\.\s|\[[ xX]?\])/.test(content);
        if (isList) quoteListBaseIndent = 0;
        else if (content.trim() === '' || content.startsWith('---') || content.startsWith('#') || content.startsWith('**')) {
          quoteListBaseIndent = -1;
        }
      }
      return processedLine;
    }

    // B. 일반 본문 리스트 들여쓰기 보정 (기존 로직 유지)
    quoteListBaseIndent = -1;
    const isSpecial = /^(?:\s*#+\s|\s*[-*+]\s|\s*\d+\.\s|\s*>|\s*---|\s*\||\s*\$\$|\s*<[a-zA-Z]|\s*[①-⑩❶-❿\u2460-\u2469\u2756-\u2767])/.test(processedLine);
    if (isSpecial) {
      const indentMatch = processedLine.match(/^( +)/);
      if (indentMatch) {
        const indentSpaces = indentMatch[1];
        const remainingText = processedLine.substring(indentSpaces.length);
        const isList = /^(?:[-*+]\s|(?:\d+)\.\s|\[[ xX]?\])/.test(remainingText);
        if (isList) {
          const indentLength = indentSpaces.length;
          if (listBlockBaseIndent === -1) listBlockBaseIndent = indentLength;
          const relativeIndent = Math.max(0, indentLength - listBlockBaseIndent);
          let normalizedIndent = "";
          if (relativeIndent >= 2) {
            let steps = 1;
            if (relativeIndent <= 4) steps = 1;
            else if (relativeIndent <= 8) steps = 2;
            else if (relativeIndent <= 12) steps = 3;
            else steps = Math.floor((relativeIndent + 1) / 4);
            normalizedIndent = "    ".repeat(steps);
          }
          return `${normalizedIndent}${remainingText}`;
        }
      } else {
        const isList = /^(?:[-*+]\s|(?:\d+)\.\s|\[[ xX]?\])/.test(processedLine);
        if (isList) listBlockBaseIndent = 0;
        else listBlockBaseIndent = -1;
      }
    }
    return processedLine;
  });
}

// 2. cleanContent 보정
function cleanContent(content) {
  const lines = content.split('\n');
  return lines.map(line => {
    const isQuote = /^[ \t]*>/.test(line);
    if (isQuote) {
      const quoteMatch = line.match(/^([ \t]*>+[ \t]?)(.*)$/);
      if (quoteMatch) {
        const prefix = quoteMatch[1];
        let body = quoteMatch[2];
        const alertTagMatch = body.match(/^(\[!(?:NOTE|TIP|IMPORTANT|WARNING|CAUTION|참고|참조|메모|알림|팁|도움말|중요|필독|주의|경고|위험)\])(.*)$/i);
        if (alertTagMatch) {
          const tag = alertTagMatch[1];
          let tagBody = alertTagMatch[2];
          tagBody = tagBody.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;').replace(/ {2,}/g, (spaces) => '&nbsp;'.repeat(spaces.length));
          return `${prefix}${tag}${tagBody}`;
        }
        const isInnerList = /^[ \t]*([*+-]|\d+\.)\s+/.test(body);
        if (isInnerList) {
          const innerListMatch = body.match(/^([ \t]*[*+-]|[ \t]*\d+\.)\s+(.*)$/);
          if (innerListMatch) {
            const listPrefix = innerListMatch[1];
            let listBody = innerListMatch[2];
            listBody = listBody.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;').replace(/ {2,}/g, (spaces) => '&nbsp;'.repeat(spaces.length));
            return `${prefix}${listPrefix} ${listBody}`;
          }
        }
        body = body.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;').replace(/ {2,}/g, (spaces) => '&nbsp;'.repeat(spaces.length));
        return `${prefix}${body}`;
      }
      return line;
    }
    return line;
  }).join('\n');
}

const raw = `> **예시**
>
> **[글머리 리스트]**
> - 사과
>   - 바나나
> - 파인애플
> - 오렌지
> ---
> **[숫자 리스트]**
> 1. 첫 번째 순서
>   2. 두 번째 순서
> 3. 세 번째 순서
> ---
> **[체크 리스트]**
> **당신은 성별이 어떠해 됩니까?**
>   - [X] 여자
> - [ ] 남자`;

const step1 = normalizeListAndQuoteIndents(raw.split('\n')).join('\n');
console.log('=== Step 1: Preprocessed ===');
console.log(step1);

const step2 = cleanContent(step1);
console.log('=== Step 2: Cleaned ===');
console.log(step2);

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeStringify);

const html = await processor.process(step2);
console.log('=== Step 3: Rendered HTML ===');
console.log(String(html));
