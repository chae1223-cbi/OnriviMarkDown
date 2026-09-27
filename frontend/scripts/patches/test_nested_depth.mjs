import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';

function normalizeQuoteLine(line) {
  const leadingSpaceQuoteMatch = line.match(/^([ \t]+)((?:>+[ \t]?)+)(.*)$/);
  if (leadingSpaceQuoteMatch) {
    const spaces = leadingSpaceQuoteMatch[1];
    const quotes = leadingSpaceQuoteMatch[2].trim();
    const rest = leadingSpaceQuoteMatch[3];
    return `${quotes} ${spaces}${rest}`;
  }
  return line;
}

function rehypeDepthMarker() {
  return (tree) => {
    const visit = (node, depth = 0) => {
      let nextDepth = depth;
      if (node.type === 'element') {
        if (node.tagName === 'ul' || node.tagName === 'ol') {
          nextDepth = depth + 1;
        }
        if (node.tagName === 'li') {
          node.properties = node.properties || {};
          node.properties['data-list-depth'] = depth;
        }
      }
      if (node.children) {
        node.children.forEach(c => visit(c, nextDepth));
      }
    };
    visit(tree);
  };
}

const lines = [
  '> - 감',
  '    > - 홍시',
  '    > - 단감',
  '    > - 곶감',
  '> 1. 첫 번째 순서',
  '> 2. 두 번째 순서',
  '> 3. 세 번째 순서',
  '> - [X] 여자',
  '> - [ ] 남자'
];

const normalized = lines.map(normalizeQuoteLine).join('\n');
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeDepthMarker);

const hast = processor.runSync(processor.parse(normalized));

function inspect(node) {
  if (node.tagName === 'li') {
    const text = node.children?.[0]?.children?.[0]?.value || node.children?.[0]?.value || '';
    console.log(`LI "${text.slice(0, 10).trim()}..." -> listDepth: ${node.properties['data-list-depth']}`);
  }
  if (node.children) node.children.forEach(inspect);
}

inspect(hast);
