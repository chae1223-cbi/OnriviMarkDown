import React from 'react';
import { renderToString } from 'react-dom/server';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeReact from 'rehype-react';
import rehypeCitation from 'rehype-citation/browser';
import * as prod from 'react/jsx-runtime';

const run = async () => {
  try {
    const processor = unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeCitation, { bibliography: '@article{smith2023, title={Test}}', path: '/' })
      .use(rehypeReact, {
        Fragment: prod.Fragment,
        jsx: prod.jsx,
        jsxs: prod.jsxs,
        components: {
          h1: ({node, ...props}) => React.createElement('h1', { style: { color: 'red' }, ...props }),
        }
      });
      
    const file = await processor.process('# Hello\n\nMy markdown text [@smith2023]');
    console.log(renderToString(file.result));
  } catch (e) {
    console.error(e);
  }
};
run();
