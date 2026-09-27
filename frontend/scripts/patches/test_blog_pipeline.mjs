import fs from 'fs';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';

const fullFile = fs.readFileSync('../docs/blog/마크다운 가이드/01_MarkDown_기본.md', 'utf8');
const lines = fullFile.split('\n');
const sampleLines = lines.slice(88, 110);
const rawInput = sampleLines.join('\n');

// 실제 MarkdownViewer의 파이프라인
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeStringify);

const html = processor.processSync(rawInput).toString();
console.log('--- GENERATED HTML ---');
console.log(html);
