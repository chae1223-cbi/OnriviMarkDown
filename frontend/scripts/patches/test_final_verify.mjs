import fs from 'fs';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';

// 1. cleanContent의 선행 공백 인용구 정규화
function cleanContent(content) {
  const sections = content.split(/(```[\s\S]*?```)/g);
  return sections.map((section, idx) => {
    if (idx % 2 === 1) return section;

    const lines = section.split('\n');
    return lines.map((line) => {
      if (/^[ \t]*[*+-]/.test(line) || /^[ \t]*\d+\./.test(line)) {
        const listMatch = line.match(/^([ \t]*[*+-]|[ \t]*\d+\.)\s+(.*)$/);
        if (listMatch) {
          const prefix = listMatch[1];
          let body = listMatch[2];
          body = body.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;').replace(/ {2,}/g, (spaces) => '&nbsp;'.repeat(spaces.length));
          return `${prefix} ${body}`;
        }
        return line;
      }

      // 선행 공백 인용구 정규화 ("    > - 홍시" -> ">     - 홍시")
      const leadingSpaceQuoteMatch = line.match(/^([ \t]+)((?:>+[ \t]?)+)(.*)$/);
      if (leadingSpaceQuoteMatch) {
        const spaces = leadingSpaceQuoteMatch[1];
        const quotes = leadingSpaceQuoteMatch[2].trim();
        const rest = leadingSpaceQuoteMatch[3];
        line = `${quotes} ${spaces}${rest}`;
      }

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
          const innerListMatch = body.match(/^([ \t]*[*+-]|[ \t]*\d+\.)\s+(.*)$/);
          if (innerListMatch) {
            const listPrefix = innerListMatch[1];
            let listBody = innerListMatch[2];
            listBody = listBody.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;').replace(/ {2,}/g, (spaces) => '&nbsp;'.repeat(spaces.length));
            return `${prefix}${listPrefix} ${listBody}`;
          }
          body = body.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;').replace(/ {2,}/g, (spaces) => '&nbsp;'.repeat(spaces.length));
          return `${prefix}${body}`;
        }
        return line;
      }
      return line;
    }).join('\n');
  }).join('\n');
}

// 2. rehypeSourceLinesPlugin의 listDepth
function rehypeSourceLinesPlugin() {
  return (tree) => {
    const visit = (node, depth = 0) => {
      let currentDepth = depth;
      if (node.type === 'element') {
        if (node.tagName === 'ul' || node.tagName === 'ol') {
          currentDepth = depth + 1;
        }
        if (node.tagName === 'li') {
          node.properties = node.properties || {};
          node.properties['data-list-depth'] = depth;
        }
      }
      if (node.children) {
        node.children.forEach(c => visit(c, currentDepth));
      }
    };
    visit(tree);
  };
}

const userText = `> **예시**
> 
> **[글머리 리스트]**
> - 사과
> - 바나나
> - 파인애플
> - 오렌지
> - 감
    > - 홍시
    > - 단감
    > - 곶감
> ---
> **[숫자 리스트]**
> 1. 첫 번째 순서
> 2. 두 번째 순서
> 3. 세 번째 순서
> ---
> **[체크 리스트]**
> **당신은 성별이 어떠헤 됩니까?**
> - [X] 여자
> - [ ] 남자`;

const cleaned = cleanContent(userText);
console.log('--- CLEANED TEXT (sample lines) ---');
cleaned.split('\n').slice(6, 12).forEach(l => console.log(JSON.stringify(l)));

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeSourceLinesPlugin)
  .use(rehypeStringify);

const html = processor.processSync(cleaned).toString();
console.log('--- GENERATED HTML ---');
console.log(html);
