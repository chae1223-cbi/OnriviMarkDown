const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MarkdownViewer.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. CodeBlock
content = content.replace(
  /className="text-xs px-2\.5 py-1 rounded bg-white dark:bg-zinc-800 text-blue-600 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-zinc-700 active:scale-95 transition-all shadow-sm font-medium"/g,
  `className="opacity-0 group-hover:opacity-100 text-xs px-2.5 py-1 rounded bg-white dark:bg-zinc-800 text-blue-600 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-zinc-700 active:scale-95 transition-all shadow-sm font-medium"`
);

// CodeBlock Button Text (Target: {copied ? '...복사됨...' : '...복사...'})
content = content.replace(
  /\{copied \? '[^']+' : '[^']+'\}/,
  `{copied ? '복사 완료' : '복사'}`
);

// 2. TableWrapper
// TableWrapper text (Target: <span>{copied ? '...차트...' : '...차트...'}</span>)
content = content.replace(
  /<span>\{copied \? '[^']+' : '[^']+'\}<\/span>/,
  `<span>{copied ? '복사 완료' : '복사'}</span>`
);

// 3. AsyncImage
const asyncImageRegex = /<button[\s\n]*onClick=\{handleCopy\}[\s\n]*className="absolute top-2 right-2 p-1\.5 bg-black\/60 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity text-xs flex items-center gap-1 z-10 hover:bg-black\/80"[^>]*>[\s\n]*\{copied \? \([\s\n]*<Check size=\{14\} className="text-green-400" \/>[\s\n]*\) : \([\s\n]*<Copy size=\{14\} \/>[\s\n]*\)\}[\s\n]*<\/button>/;

const asyncImageReplace = `<button
            onClick={handleCopy}
            className="absolute top-2 right-2 px-2.5 py-1.5 bg-black/60 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity text-xs flex items-center gap-1.5 z-10 hover:bg-black/80 font-medium"
            title="복사"
          >
            {copied ? (
              <>
                <Check size={14} className="text-green-400" />
                <span>복사 완료</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>복사</span>
              </>
            )}
          </button>`;
content = content.replace(asyncImageRegex, asyncImageReplace);

fs.writeFileSync(file, content, 'utf8');
console.log("Patched via Regex without Korean characters!");
