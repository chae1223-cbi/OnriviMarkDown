import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { visit } from 'unist-util-visit';
import * as prod from 'react/jsx-runtime';
import rehypeReact from 'rehype-react';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

function plugin() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'p') {
        node.properties = node.properties || {};
        node.properties.style = 'margin-top: 0 !important; color: red;';
      }
    });
  };
}

const processor = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(plugin)
  .use(rehypeReact, { Fragment: prod.Fragment, jsx: prod.jsx, jsxs: prod.jsxs });

const file = processor.processSync('Hello').result;
console.log(renderToStaticMarkup(file));
