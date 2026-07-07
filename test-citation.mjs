import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeCitation from 'rehype-citation';

const run = () => {
  try {
    const file = unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeCitation, { bibliography: '@article{smith2023, title={Test}}', path: '/' })
      .use(rehypeStringify)
      .processSync('My markdown text [@smith2023]');
    console.log(String(file));
  } catch (e) {
    console.error(e);
  }
};
run();
