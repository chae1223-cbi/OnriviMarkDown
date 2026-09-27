import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

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

// 1. cleanContent 로직 모사 (MarkdownViewer.tsx lines 1670~1735)
function cleanContent(content) {
  let processed = content;
  // cleanContent의 인용구 처리
  const lines = processed.split('\n');
  return lines.map(line => {
    const isListItem = /^[ \t]*([*+-]|\d+\.)\s+/.test(line);
    if (isListItem) {
      const listMatch = line.match(/^([ \t]*[*+-]|[ \t]*\d+\.)\s+(.*)$/);
      if (listMatch) {
        const prefix = listMatch[1];
        let body = listMatch[2];
        body = body.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;').replace(/ {2,}/g, (spaces) => '&nbsp;'.repeat(spaces.length));
        return `${prefix} ${body}`;
      }
      return line;
    }
    const isQuote = /^[ \t]*>/.test(line);
    if (isQuote) {
      const quoteMatch = line.match(/^([ \t]*>+[ \t]*)(.*)$/);
      if (quoteMatch) {
        const prefix = quoteMatch[1];
        let body = quoteMatch[2];
        body = body.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;').replace(/ {2,}/g, (spaces) => '&nbsp;'.repeat(spaces.length));
        return `${prefix}${body}`;
      }
      return line;
    }
    return line;
  }).join('\n');
}

const cleaned = cleanContent(raw);
console.log('=== Cleaned Text ===');
console.log(cleaned);

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeStringify);

const html = await processor.process(cleaned);
console.log('=== Rendered HTML ===');
console.log(String(html));
