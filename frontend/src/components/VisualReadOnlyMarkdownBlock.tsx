'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import TableHeaderCell from '@/components/TableHeaderCell';
import remarkGfm from 'remark-gfm';

// Complex blocks retain their exact MD source but remain readable in the
// document. Nested fenced examples stay code; they are never reinterpreted.
export default function VisualReadOnlyMarkdownBlock({ source }: { source: string }) {
  return <div className="visual-readonly-content">
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
      th: TableHeaderCell,
      pre({ children }) {
        return <div className="codeblock-area visual-code-block"><pre>{children}</pre></div>;
      },
      blockquote({ children }) {
        const blocks = React.Children.toArray(children);
        const first = blocks.findIndex(block => React.isValidElement(block));
        const paragraph = blocks[first];
        if (React.isValidElement<{ children: React.ReactNode }>(paragraph)) {
          const parts = React.Children.toArray(paragraph.props.children);
          const match = typeof parts[0] === 'string' ? parts[0].match(/^\[!([^\]]+)\]\s*/) : null;
          if (match) {
            parts[0] = (parts[0] as string).slice(match[0].length);
            blocks[first] = React.cloneElement(paragraph, {}, parts);
            return <aside className="visual-readonly-callout" data-alert-type={match[1]}><strong>{match[1]}</strong>{blocks}</aside>;
          }
        }
        return <blockquote>{children}</blockquote>;
      },
    }}>{source}</ReactMarkdown>

  </div>;
}
