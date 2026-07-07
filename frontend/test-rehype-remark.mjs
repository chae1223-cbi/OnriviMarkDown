import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeCitation from 'rehype-citation/node';
import rehypeRemark from 'rehype-remark';
import remarkStringify from 'remark-stringify';

const run = async () => {
  const markdown = `My markdown text [@smith2023]`;
  
  const processor = unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeCitation, { bibliography: '@article{smith2023, title={Test}}', path: '/' })
    .use(rehypeRemark)
    .use(remarkStringify);
  
  try {
    const file = await processor.process(markdown);
    console.log("Output MD:");
    console.log(String(file));
  } catch (e) {
    console.error(e);
  }
};
run();
