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

console.log('--- RAW INPUT ---');
sampleLines.forEach((l, i) => console.log(`${i + 89}: ${JSON.stringify(l)}`));

const processor = unified().use(remarkParse).use(remarkGfm);
const ast = processor.parse(rawInput);

function dumpTree(node, depth = 0) {
  const pad = '  '.repeat(depth);
  let extra = '';
  if (node.type === 'text') extra = ' ' + JSON.stringify(node.value);
  if (node.type === 'listItem') extra = ' checked=' + node.checked;
  console.log(pad + node.type + extra + ' (line: ' + node.position?.start?.line + ')');
  if (node.children) {
    node.children.forEach(c => dumpTree(c, depth + 1));
  }
}
console.log('--- AST ---');
dumpTree(ast);
