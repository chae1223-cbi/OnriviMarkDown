import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeCitation from 'rehype-citation';

const run = () => {
  try {
    const processor = unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeCitation, { bibliography: '@article{smith2023, title={Test}}', path: '/' });
    
    const tree = processor.parse('My markdown text [@smith2023]');
    const result = processor.runSync(tree);
    console.log("Success");
  } catch (e) {
    console.error("ERROR CAUGHT:");
    console.error(e);
  }
};
run();
