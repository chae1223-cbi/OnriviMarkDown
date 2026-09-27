import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';

function normalizeQuoteLine(line) {
  // 줄 맨 앞에 공백/탭이 있고 그 뒤에 > 가 오는 경우 (예: "    > - 홍시")
  // > 마커를 맨 앞으로 옮기고 공백을 > 뒤로 이동 (예: ">     - 홍시")
  const leadingSpaceQuoteMatch = line.match(/^([ \t]+)((?:>+[ \t]?)+)(.*)$/);
  if (leadingSpaceQuoteMatch) {
    const spaces = leadingSpaceQuoteMatch[1];
    const quotes = leadingSpaceQuoteMatch[2].trim();
    const rest = leadingSpaceQuoteMatch[3];
    return `${quotes} ${spaces}${rest}`;
  }
  return line;
}

const sampleLines = [
  '> - 감',
  '    > - 홍시',
  '    > - 단감',
  '    > - 곶감',
  '> 1. 첫 번째',
  '    > 2. 두 번째',
  '> - [X] 여자',
  '    > - [ ] 남자'
];

const normalized = sampleLines.map(normalizeQuoteLine).join('\n');
console.log('--- NORMALIZED ---');
console.log(normalized);

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeStringify);

const html = processor.processSync(normalized).toString();
console.log('--- HTML ---');
console.log(html);
