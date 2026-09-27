import fs from 'fs';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';

// 실제 MarkdownViewer.tsx의 cleanContent 그대로
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
      const leadMatch = line.match(/^([ \t]*)(.*)$/);
      if (!leadMatch) return line;
      let lead = leadMatch[1];
      let rest = leadMatch[2];
      lead = lead.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;').replace(/ /g, '&nbsp;');
      rest = rest.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;').replace(/ {2,}/g, (spaces) => '&nbsp;'.repeat(spaces.length));
      return lead + rest;
    }).join('\n');
  }).join('\n');

  return processed;
}

const fullFile = fs.readFileSync('../docs/blog/마크다운 가이드/01_MarkDown_기본.md', 'utf8');
const lines = fullFile.split('\n');
const sampleLines = lines.slice(88, 110);
const rawInput = sampleLines.join('\n');

const cleaned = cleanContent(rawInput);

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeStringify);

const html = processor.processSync(cleaned).toString();
console.log('--- HTML WITH CLEANED ---');
console.log(html);
