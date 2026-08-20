const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MarkdownViewer.tsx';
let c = fs.readFileSync(file, 'utf8');

const target = '<div className="overflow-x-auto w-full custom-scrollbar">';
const replacement = `
      <style>{\`
        .dark .codeblock-area code * {
          color: #ffffff !important;
          background-color: transparent !important;
        }
      \`}</style>
      <div className="overflow-x-auto w-full custom-scrollbar">`;

c = c.replace(target, replacement);

fs.writeFileSync(file, c, 'utf8');
console.log('Injected foolproof style tag into CodeBlock');
