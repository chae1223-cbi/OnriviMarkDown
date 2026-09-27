import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';

const raw = `> - 사과
>   - 바나나
> 1. 첫째
>   2. 둘째`;

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw);

const hast = processor.runSync(processor.parse(raw));

function inspectNodes(node, depth = 0) {
  if (node.tagName === 'li') {
    console.log('li node at depth', depth, 'keys:', Object.keys(node), 'position:', node.position?.start);
  }
  if (node.children) {
    node.children.forEach(c => inspectNodes(c, depth + 1));
  }
}

inspectNodes(hast);
