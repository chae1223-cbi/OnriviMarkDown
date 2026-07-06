import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';

const rehypeBrRaw = () => (tree) => {
  const isPageBreakString = (val) => 
    typeof val === 'string' && (val.includes('page-break-before: always') || val.includes('class="page-break"'));

  const walk = (node) => {
    if (node.children) {
      const newChildren = [];
      for (const child of node.children) {
        if (child.type === 'raw' && /<br\s*\/?>/i.test(child.value)) {
          // br logic
        } else if (child.type === 'raw' && isPageBreakString(child.value)) {
          newChildren.push({ type: 'element', tagName: 'div', properties: { className: ['page-break'] }, children: [] });
        } else if (child.type === 'element' && child.tagName === 'code' && child.children?.length === 1 && child.children[0].type === 'text' && isPageBreakString(child.children[0].value)) {
          newChildren.push({ type: 'element', tagName: 'div', properties: { className: ['page-break'] }, children: [] });
        } else if (child.type === 'text' && isPageBreakString(child.value)) {
          newChildren.push({ type: 'element', tagName: 'div', properties: { className: ['page-break'] }, children: [] });
        } else {
          newChildren.push(child);
          if (child.children) walk(child);
        }
      }
      node.children = newChildren;
    }
  };
  walk(tree);
};

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeBrRaw)
  .use(rehypeRaw);

const md1 = `    <div style="page-break-before: always"></div>`; // Indented code block

console.log(JSON.stringify(processor.runSync(processor.parse(md1)), null, 2));
