const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MarkdownViewer.tsx';
let content = fs.readFileSync(file, 'utf8');

const UNIFIED_BUTTON = `<button
            onClick={handleCopy}
            className="copy-button-hook absolute top-2 right-2 px-2.5 py-1.5 bg-black/60 dark:bg-white/20 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity text-xs flex items-center gap-1.5 z-10 hover:bg-black/80 font-medium no-print"
            title="복사"
            style={{ userSelect: 'none' }}
          >
            {copied ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span style={{ color: '#4ade80' }}>복사 완료</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                <span>복사</span>
              </>
            )}
          </button>`;

// 1. CodeBlock
const codeBlockRegex = /<button[\s\n]*onClick=\{handleCopy\}[\s\n]*className="text-xs px-2\.5 py-1 rounded bg-white dark:bg-zinc-800 text-blue-600 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-zinc-700 active:scale-95 transition-all shadow-sm font-medium"[\s\n]*>[\s\n]*\{copied \? '[^']+' : '[^']+'\}[\s\n]*<\/button>/;
content = content.replace(codeBlockRegex, UNIFIED_BUTTON);

// 2. TableWrapper
const tableRegex = /<div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">[\s\n]*<button[\s\n]*onClick=\{handleCopy\}[\s\n]*className="text-xs px-2\.5 py-1\.5 rounded-md bg-white  border border-zinc-200  text-zinc-600  hover:bg-zinc-50 :bg-zinc-700 hover:text-blue-600 :text-blue-400 active:scale-95 transition-all shadow-md font-semibold flex items-center gap-1\.5 cursor-pointer"[\s\n]*>[\s\n]*<span>\{copied \? '[^']+' : '[^']+'\}<\/span>[\s\n]*<span>\{copied \? '[^']+' : '[^']+'\}<\/span>[\s\n]*<\/button>[\s\n]*<\/div>/;
content = content.replace(tableRegex, UNIFIED_BUTTON);

// 3. AsyncImage
const asyncImageRegex = /<button[\s\n]*onClick=\{handleCopy\}[\s\n]*className="absolute top-2 right-2 p-1\.5 bg-black\/60 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity text-xs flex items-center gap-1 z-10 hover:bg-black\/80"[\s\n]*title="이미지 복사"[\s\n]*>[\s\n]*\{copied \? \([\s\n]*<>[\s\n]*<svg[^>]*>.*?<\/svg>[\s\n]*[^<]*[\s\n]*<\/>[\s\n]*\) : \([\s\n]*<>[\s\n]*<svg[^>]*>.*?<\/svg>[\s\n]*[^<]*[\s\n]*<\/>[\s\n]*\)\}[\s\n]*<\/button>/s;
content = content.replace(asyncImageRegex, UNIFIED_BUTTON);

fs.writeFileSync(file, content, 'utf8');
console.log("Patched MarkdownViewer unified copy buttons!");
