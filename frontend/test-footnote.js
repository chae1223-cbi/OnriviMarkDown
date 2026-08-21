import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';

const markdown = `
This is a test[^1] and another[^2].

[^1]: First footnote
[^2]: Second footnote
`;

function mockRehypePreserveFootnotes() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'section' && node.properties && node.properties.dataFootnotes !== undefined) {
        const h2 = node.children.find((c) => c.tagName === 'h2' && c.properties?.id === 'footnote-label');
        if (h2 && h2.children && h2.children.length > 0 && h2.children[0].type === 'text') {
          h2.children[0].value = '각주( FootNote )';
        }
        if (h2 && h2.properties) {
          h2.properties.className = ['text-sm', 'font-bold', 'text-gray-500', 'mb-2', 'mt-2', 'dark:text-gray-400'];
        }
        
        const hrIndex = node.children.findIndex((c) => c.tagName === 'hr');
        if (hrIndex === -1 && h2) {
          const h2Index = node.children.indexOf(h2);
          node.children.splice(h2Index, 0, {
            type: 'element',
            tagName: 'hr',
            properties: { className: ['my-4', 'border-t-2', 'border-gray-200', 'dark:border-gray-700'] },
            children: []
          });
        }

        const ol = node.children.find((c) => c.tagName === 'ol');
        if (ol) {
          ol.properties = ol.properties || {};
          ol.properties.className = ['!space-y-0', '!my-0', '!py-0', 'text-sm'];

          const lis = ol.children.filter((c) => c.tagName === 'li');
          lis.forEach((li) => {
            li.properties = li.properties || {};
            li.properties.className = ['!my-0', '!py-0', '!leading-tight'];

            if (li.children) {
              const p = li.children.find((c) => c.tagName === 'p');
              if (p) {
                p.properties = p.properties || {};
                p.properties.className = ['!my-0', '!py-0'];
              }
            }
          });
          
          ol.children = [];
          lis.forEach((li) => {
            ol.children.push({ type: 'text', value: '\n' });
            ol.children.push(li);
          });
          ol.children.push({ type: 'text', value: '\n' });
        }
      }
    });
  };
}

unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(mockRehypePreserveFootnotes)
  .use(rehypeStringify)
  .process(markdown)
  .then(file => console.log(String(file)));
