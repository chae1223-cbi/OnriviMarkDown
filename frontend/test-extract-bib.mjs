import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeCitation from 'rehype-citation';
import rehypeStringify from 'rehype-stringify';

const run = async () => {
  const markdown = `My markdown text [@smith2023]`;
  const bibContent = '@article{smith2023, title={Test Title}, author={Smith, John}, year={2023}}';
  
  const processor = unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeCitation, { bibliography: bibContent, path: '/' })
    .use(rehypeStringify);
  
  try {
    const file = await processor.process(markdown);
    console.log(String(file));
  } catch (e) {
    console.error(e);
  }
};
run();
