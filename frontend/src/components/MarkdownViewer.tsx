import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';

interface MarkdownViewerProps {
  content: string;
  lineMap?: number[];
}

export default function MarkdownViewer({ content, lineMap = [] }: MarkdownViewerProps) {
  const rehypeSourceLinesPlugin = useMemo(() => {
    return () => (tree: any) => {
      const visit = (node: any) => {
        if (node.type === 'element' && node.position && node.position.start) {
          if (!node.properties) {
            node.properties = {};
          }
          const processedLine = node.position.start.line;
          const originalLine = lineMap[processedLine - 1] || processedLine;
          node.properties['data-line'] = originalLine;
        }
        if (node.children) {
          node.children.forEach(visit);
        }
      };
      visit(tree);
    };
  }, [lineMap]);

  const rehypeBrRaw = useMemo(() => {
    return () => (tree: any) => {
      const walk = (node: any) => {
        if (node.children) {
          const newChildren: any[] = [];
          for (const child of node.children) {
            if (child.type === 'raw' && /<br\s*\/?>/i.test(child.value)) {
              const parts = child.value.split(/(<br\s*\/?>)/gi);
              for (const part of parts) {
                if (/^<br\s*\/?>$/i.test(part)) {
                  newChildren.push({ type: 'element', tagName: 'br', properties: {}, children: [] });
                } else if (part) {
                  newChildren.push({ type: 'text', value: part });
                }
              }
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
  }, []);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
      rehypePlugins={[
        [rehypeKatex, { strict: false }],
        rehypeBrRaw,
        rehypeRaw,
        rehypeSourceLinesPlugin,
      ]}
      components={{
        a: ({ node, ...props }) => (
          <a {...props} target="_blank" rel="noopener noreferrer" />
        ),
        pre: ({ node, children, ...props }: any) => {
          return <div className="not-prose">{children}</div>;
        },
        code: ({ node, className, children, ...props }: any) => {
          const match = /language-(\w+)/.exec(className || '');
          const lang = match ? match[1] : '';
          const codeContent = String(children).replace(/\n$/, '');
          
          // react-markdown v9에서는 inline prop이 제공되지 않으므로
          // className 유무(language-xxx) 및 줄바꿈 문자로 인라인 여부를 식별합니다.
          const isInline = !match && !String(children).includes('\n');

          if (isInline) {
            return (
              <code 
                className="px-1.5 py-0.5 mx-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-mono text-[0.9em] border border-blue-200 dark:border-blue-800" 
                {...props}
              >
                {children}
              </code>
            );
          }

          return (
            <div className="my-4 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50/20 dark:bg-blue-950/15 overflow-hidden shadow-sm select-text">
              <pre className="m-0 p-4 overflow-x-auto font-mono text-sm leading-relaxed bg-transparent text-blue-700 dark:text-blue-300">
                <code className={`${className || ''} text-blue-700 dark:text-blue-300`} {...props}>
                  {children}
                </code>
              </pre>
            </div>
          );
        },
        h1: ({ node, children, ...props }) => {
          const line = (node as any).position?.start?.line;
          const origLine = line ? (lineMap[line - 1] || line) : undefined;
          return <h1 id={origLine ? `toc-line-${origLine}` : undefined} {...props}>{children}</h1>;
        },
        h2: ({ node, children, ...props }) => {
          const line = (node as any).position?.start?.line;
          const origLine = line ? (lineMap[line - 1] || line) : undefined;
          return <h2 id={origLine ? `toc-line-${origLine}` : undefined} {...props}>{children}</h2>;
        },
        h3: ({ node, children, ...props }) => {
          const line = (node as any).position?.start?.line;
          const origLine = line ? (lineMap[line - 1] || line) : undefined;
          return <h3 id={origLine ? `toc-line-${origLine}` : undefined} {...props}>{children}</h3>;
        },
        h4: ({ node, children, ...props }) => {
          const line = (node as any).position?.start?.line;
          const origLine = line ? (lineMap[line - 1] || line) : undefined;
          return <h4 id={origLine ? `toc-line-${origLine}` : undefined} {...props}>{children}</h4>;
        },
        h5: ({ node, children, ...props }) => {
          const line = (node as any).position?.start?.line;
          const origLine = line ? (lineMap[line - 1] || line) : undefined;
          return <h5 id={origLine ? `toc-line-${origLine}` : undefined} {...props}>{children}</h5>;
        },
        h6: ({ node, children, ...props }) => {
          const line = (node as any).position?.start?.line;
          const origLine = line ? (lineMap[line - 1] || line) : undefined;
          return <h6 id={origLine ? `toc-line-${origLine}` : undefined} {...props}>{children}</h6>;
        },
        p: ({ node, children, ...props }) => {
          if (!children) return <p />;
          return <p>{children}</p>;
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
