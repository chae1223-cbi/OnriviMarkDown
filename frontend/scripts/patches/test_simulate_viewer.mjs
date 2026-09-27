import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';

// 1. cleanContent
function cleanContent(content) {
  const sections = content.split(/(```[\s\S]*?```)/g);
  const processed = sections.map((section, idx) => {
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
      const isQuote = /^[ \t]*>/.test(line);
      if (isQuote) {
        const quoteMatch = line.match(/^([ \t]*>+[ \t]*)(.*)$/);
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
          body = body.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;').replace(/ {2,}/g, (spaces) => '&nbsp;'.repeat(spaces.length));
          return `${prefix}${body}`;
        }
        return line;
      }
      return line;
    }).join('\n');
  }).join('\n');

  return processed;
}

// 2. rehypeSourceLinesPlugin
function rehypeSourceLinesPlugin() {
  return (tree) => {
    const isMediaParagraph = (node) => false;
    const visit = (node, parentLine) => {
      if (node.type === 'element') {
        if (!node.properties) node.properties = {};
        if (node.tagName === 'p') {
          const newChildren = [];
          let currentLineChildren = [];
          let pLine = node.position?.start?.line || parentLine || 1;
          const pushLine = (lineNum) => {
            if (currentLineChildren.length === 0) currentLineChildren.push({ type: 'text', value: '\u200B' });
            newChildren.push({
              type: 'element',
              tagName: 'span',
              properties: { className: ['onrivi-line'], 'data-line': lineNum },
              children: currentLineChildren
            });
            currentLineChildren = [];
          };
          for (const child of node.children) {
            if (child.type === 'element' && child.tagName === 'br') {
              pushLine(pLine);
              pLine++;
            } else if (child.type === 'text' && child.value === '\n') {
            } else {
              if (child.type === 'element') {
                if (child.position?.start?.line) pLine = child.position.start.line;
                visit(child, pLine);
              }
              currentLineChildren.push(child);
            }
          }
          pushLine(pLine);
          node.children = newChildren;
          delete node.properties['data-line'];
          return;
        }
        let line = node.position?.start?.line || parentLine;
        if (line) {
          node.properties['data-line'] = line;
        }
      }
      if (node.children) {
        node.children.forEach((child) => visit(child));
      }
    };
    visit(tree);
  };
}

const rawInput = `> **[글머리 리스트]**
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

const cleaned = cleanContent(rawInput);
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeSourceLinesPlugin)
  .use(rehypeStringify);

const html = processor.processSync(cleaned).toString();
console.log(html);
