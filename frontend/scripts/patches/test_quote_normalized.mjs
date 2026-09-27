import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

// 인용구 내부의 리스트 라인에 대해 들여쓰기를 정규화하는 헬퍼
function normalizeQuoteLines(lines) {
  let quoteListBaseIndent = -1;

  return lines.map(line => {
    const quoteMatch = line.match(/^([ \t]*>+[ \t]?)(.*)$/);
    if (!quoteMatch) {
      quoteListBaseIndent = -1;
      return line;
    }

    const quotePrefix = quoteMatch[1];
    const content = quoteMatch[2];

    const indentMatch = content.match(/^( +)/);
    const indentSpaces = indentMatch ? indentMatch[1] : '';
    const remainingText = content.substring(indentSpaces.length);
    const isList = /^(?:[-*+]\s|(?:\d+)\.\s|\[[ xX]?\])/.test(remainingText);

    if (isList) {
      const indentLength = indentSpaces.length;
      if (quoteListBaseIndent === -1) {
        quoteListBaseIndent = indentLength;
      }

      const relativeIndent = Math.max(0, indentLength - quoteListBaseIndent);
      let normalizedIndent = '';
      if (relativeIndent >= 2) {
        let steps = 1;
        if (relativeIndent <= 4) steps = 1;
        else if (relativeIndent <= 8) steps = 2;
        else if (relativeIndent <= 12) steps = 3;
        else steps = Math.floor((relativeIndent + 1) / 4);
        normalizedIndent = '    '.repeat(steps);
      }
      return `${quotePrefix}${normalizedIndent}${remainingText}`;
    } else {
      if (content.trim() === '' || content.startsWith('---') || content.startsWith('#') || content.startsWith('**[')) {
        quoteListBaseIndent = -1;
      }
      return line;
    }
  });
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

const normalized = normalizeQuoteLines(raw.split('\n')).join('\n');
console.log('=== Normalized Quote Markdown ===');
console.log(normalized);

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeStringify);

const html = await processor.process(normalized);
console.log('=== Rendered HTML ===');
console.log(String(html));
