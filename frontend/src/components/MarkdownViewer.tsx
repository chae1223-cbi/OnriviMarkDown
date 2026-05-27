import React, { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';

const getTextFromChildren = (children: React.ReactNode): string => {
  if (children === null || children === undefined) return '';
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(getTextFromChildren).join('');
  }
  if (React.isValidElement(children)) {
    return getTextFromChildren(children.props.children);
  }
  return '';
};

interface MarkdownViewerProps {
  content: string;
  originalContent?: string;
  lineMap?: number[];
  onCheckboxToggle?: (lineNumber: number, checked: boolean) => void;
}

// 🛡️ 들여쓰기 4칸/탭 입력 시 코드블록으로 인식되는 것을 완전히 차단하는 플러그인
function remarkDisableIndentedCode(this: any) {
  const data = this.data();
  if (!data.micromarkExtensions) {
    data.micromarkExtensions = [];
  }
  data.micromarkExtensions.push({
    disable: { null: ['codeIndented'] }
  });
}

function CodeBlock({ lang, code, className, ...props }: { lang: string; code: string; className?: string; [key: string]: any }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  return (
    <div className="my-4 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50/20 dark:bg-blue-950/15 overflow-hidden shadow-sm select-text">
      {/* 코드블록 상단 헤더 (언어명 및 복사 버튼) */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-blue-100/50 dark:bg-blue-950/40 border-b border-blue-200/60 dark:border-blue-900/40">
        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          {lang || 'plaintext'}
        </span>
        <button
          onClick={handleCopy}
          className="text-xs px-2.5 py-1 rounded bg-white dark:bg-zinc-800 border border-blue-200 dark:border-zinc-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-700 active:scale-95 transition-all shadow-sm font-medium"
        >
          {copied ? '✓ 복사됨' : '복사'}
        </button>
      </div>
      <pre className="m-0 p-4 overflow-x-auto font-mono text-sm leading-relaxed bg-transparent text-blue-700 dark:text-blue-300">
        <code className={`${className || ''} text-blue-700 dark:text-blue-300`} {...props}>
          {code}
        </code>
      </pre>
    </div>
  );
}

export default function MarkdownViewer({ content, originalContent, lineMap = [], onCheckboxToggle }: MarkdownViewerProps) {
  // 🛡️ 에디터 원본 텍스트의 해당 줄에 있는 탭과 공백을 계산하여 스타일(marginLeft)을 리턴하는 헬퍼 함수
  const getIndentStyle = (node: any) => {
    const line = node?.position?.start?.line;
    const origLine = line ? (lineMap[line - 1] || line) : undefined;
    if (!origLine) return {};

    const targetContent = originalContent || content;
    const lines = targetContent.split('\n');
    const lineText = lines[origLine - 1] || '';
    const indentMatch = lineText.match(/^([ \t]*)/);
    const indentStr = indentMatch ? indentMatch[1] : '';

    let marginLeft = 0;
    for (const char of indentStr) {
      if (char === '\t') {
        marginLeft += 24; // 탭 1개당 24px
      } else if (char === ' ') {
        marginLeft += 6;  // 공백 1개당 6px
      }
    }

    if (marginLeft > 0) {
      return { marginLeft: `${marginLeft}px` };
    }
    return {};
  };

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
      urlTransform={(uri) => uri}
      remarkPlugins={[remarkGfm, remarkBreaks, remarkMath, remarkDisableIndentedCode]}
      rehypePlugins={[
        [rehypeKatex, { strict: false }],
        rehypeBrRaw,
        rehypeRaw,
        rehypeSourceLinesPlugin,
      ]}
      components={{
        img: ({ node, src, alt, style, ...props }: any) => {
          if (!src) return <img alt={alt} {...props} />;
          
          let width: string | undefined = undefined;
          let height: string | undefined = undefined;
          
          try {
            const wMatch = src.match(/[?&](?:width|w)=([^&#]+)/);
            const hMatch = src.match(/[?&](?:height|h)=([^&#]+)/);
            if (wMatch) width = decodeURIComponent(wMatch[1]);
            if (hMatch) height = decodeURIComponent(hMatch[1]);
          } catch (e) {}

          const imgStyle: React.CSSProperties = {
            ...style,
            maxWidth: '100%',
            height: height ? height : 'auto',
          };
          if (width) {
            imgStyle.width = width;
          } else {
            imgStyle.maxWidth = '600px'; // 이미지 폭 폭탄 방지
          }

          return (
            <img 
              src={src} 
              alt={alt} 
              style={imgStyle} 
              className="rounded-lg shadow-sm border border-zinc-200/30 dark:border-zinc-800/30 my-3"
              {...props} 
            />
          );
        },
        a: ({ node, ...props }) => (
          <a {...props} target="_blank" rel="noopener noreferrer" />
        ),
        pre: ({ node, children, ...props }: any) => {
          return <div className="not-prose">{children}</div>;
        },
        code: ({ node, className, children, ...props }: any) => {
          const match = /language-(\w+)/.exec(className || '');
          const lang = match ? match[1] : '';
          const codeContent = getTextFromChildren(children).replace(/\n$/, '');
          
          // react-markdown v9에서는 inline prop이 제공되지 않으므로
          // className 유무(language-xxx) 및 줄바꿈 문자로 인라인 여부를 식별합니다.
          const isInline = !match && !getTextFromChildren(children).includes('\n');

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

          return <CodeBlock lang={lang} code={codeContent} className={className} {...props} />;
        },
        h1: ({ node, children, style, ...props }) => {
          const line = (node as any).position?.start?.line;
          const origLine = line ? (lineMap[line - 1] || line) : undefined;
          return <h1 id={origLine ? `toc-line-${origLine}` : undefined} style={{ ...style, ...getIndentStyle(node) }} {...props}>{children}</h1>;
        },
        h2: ({ node, children, style, ...props }) => {
          const line = (node as any).position?.start?.line;
          const origLine = line ? (lineMap[line - 1] || line) : undefined;
          return <h2 id={origLine ? `toc-line-${origLine}` : undefined} style={{ ...style, ...getIndentStyle(node) }} {...props}>{children}</h2>;
        },
        h3: ({ node, children, style, ...props }) => {
          const line = (node as any).position?.start?.line;
          const origLine = line ? (lineMap[line - 1] || line) : undefined;
          return <h3 id={origLine ? `toc-line-${origLine}` : undefined} style={{ ...style, ...getIndentStyle(node) }} {...props}>{children}</h3>;
        },
        h4: ({ node, children, style, ...props }) => {
          const line = (node as any).position?.start?.line;
          const origLine = line ? (lineMap[line - 1] || line) : undefined;
          return <h4 id={origLine ? `toc-line-${origLine}` : undefined} style={{ ...style, ...getIndentStyle(node) }} {...props}>{children}</h4>;
        },
        h5: ({ node, children, style, ...props }) => {
          const line = (node as any).position?.start?.line;
          const origLine = line ? (lineMap[line - 1] || line) : undefined;
          return <h5 id={origLine ? `toc-line-${origLine}` : undefined} style={{ ...style, ...getIndentStyle(node) }} {...props}>{children}</h5>;
        },
        h6: ({ node, children, style, ...props }) => {
          const line = (node as any).position?.start?.line;
          const origLine = line ? (lineMap[line - 1] || line) : undefined;
          return <h6 id={origLine ? `toc-line-${origLine}` : undefined} style={{ ...style, ...getIndentStyle(node) }} {...props}>{children}</h6>;
        },
        input: ({ node, ...props }: any) => {
          return <input {...props} />;
        },
        p: ({ node, children, style, ...props }) => {
          if (!children) return <p />;
          return <p style={{ ...style, ...getIndentStyle(node) }} {...props}>{children}</p>;
        },
        ul: ({ node, children, style, ...props }) => {
          return <ul style={style} {...props}>{children}</ul>;
        },
        ol: ({ node, children, style, ...props }) => {
          return <ol style={style} {...props}>{children}</ol>;
        },
        li: ({ node, children, style, ...props }) => {
          const line = (node as any).position?.start?.line;
          const origLine = line ? (lineMap[line - 1] || line) : undefined;
          
          const modifiedChildren = React.Children.map(children, (child) => {
            if (React.isValidElement(child) && child.type === 'input' && (child.props as any).type === 'checkbox') {
              return React.cloneElement(child as React.ReactElement<any>, {
                disabled: false,
                className: "w-4 h-4 rounded border-emerald-500/20 text-emerald-600 focus:ring-emerald-500 cursor-pointer mr-2 align-middle",
                onChange: (e: any) => {
                  if (origLine && onCheckboxToggle) {
                    onCheckboxToggle(origLine, e.target.checked);
                  }
                }
              });
            }
            return child;
          });

          return <li style={style} {...props}>{modifiedChildren}</li>;
        },
        blockquote: ({ node, children, style, ...props }) => {
          return (
            <blockquote 
              style={{ ...style, ...getIndentStyle(node) }} 
              className="my-4 p-4 rounded-r-lg border-l-4 border-blue-500 bg-blue-50/30 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 font-normal not-italic" 
              {...props}
            >
              {children}
            </blockquote>
          );
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
