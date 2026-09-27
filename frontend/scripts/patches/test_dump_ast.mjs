import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';

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
console.log('--- CLEANED LINES ---');
cleaned.split('\n').forEach((l, i) => console.log(`${i + 1}: ${JSON.stringify(l)}`));

const processor = unified().use(remarkParse).use(remarkGfm);
const ast = processor.parse(cleaned);

function dumpTree(node, depth = 0) {
  const pad = '  '.repeat(depth);
  let extra = '';
  if (node.type === 'text') extra = ` "${node.value}"`;
  if (node.type === 'listItem') extra = ` checked=${node.checked}`;
  console.log(`${pad}${node.type}${extra} (line: ${node.position?.start?.line})`);
  if (node.children) {
    node.children.forEach(c => dumpTree(c, depth + 1));
  }
}

console.log('--- DUMP TREE ---');
dumpTree(ast);
