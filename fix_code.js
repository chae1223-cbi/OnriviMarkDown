const fs = require('fs');
const path = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MarkdownViewer.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'function CodeBlock({ lang, code, className, ...props }: { lang: string; code: string; className?: string; [key: string]: any }) {',
  'function CodeBlock({ lang, code, className, children, ...props }: { lang: string; code: string; className?: string; children?: React.ReactNode; [key: string]: any }) {'
);

content = content.replace(
  '<pre className="m-0 p-4 font-mono text-sm leading-relaxed bg-transparent w-max min-w-full">',
  '<pre className="m-0 p-4 font-mono text-sm leading-normal bg-transparent w-max min-w-full">'
);

content = content.replace(
  /{code}\s*<\/code>/g,
  '{children || code}</code>'
);

content = content.replace(
  /code: \(\{ node, className, children, \.\.\.props \}: any\) => \{/,
  'code: ({ node, inline, className, children, ...props }: any) => {'
);

content = content.replace(
  /const isInline = !match && !getTextFromChildren\(children\)\.includes\('\\n'\);/,
  'const isInline = inline || (!match && !codeContent.includes(\\'\\\\n\\'));'
);

content = content.replace(
  /return <CodeBlock lang=\{lang\} code=\{codeContent\} className=\{className\} \{\.\.\.props\} \/>;/,
  'return <CodeBlock lang={lang} code={codeContent} className={className} {...props}>{children}</CodeBlock>;'
);

fs.writeFileSync(path, content, 'utf8');
