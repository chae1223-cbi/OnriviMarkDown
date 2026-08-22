const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MarkdownViewer.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. CodeBlock
const codeBlockTarget = `<button
            onClick={handleCopy}
            className="text-xs px-2.5 py-1 rounded bg-white dark:bg-zinc-800 text-blue-600 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-zinc-700 active:scale-95 transition-all shadow-sm font-medium"
          >
            {copied ? '복사됨' : '복사'}
          </button>`;
const codeBlockReplace = `<button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 text-xs px-2.5 py-1 rounded bg-white dark:bg-zinc-800 text-blue-600 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-zinc-700 active:scale-95 transition-all shadow-sm font-medium"
          >
            {copied ? '복사 완료' : '복사'}
          </button>`;
if (content.includes(codeBlockTarget)) {
    content = content.replace(codeBlockTarget, codeBlockReplace);
    console.log("Patched CodeBlock!");
}

// 2. TableWrapper
const tableTarget = `            <span>{copied ? '차트/도형으로 복사 완료' : '차트/도형으로 복사'}</span>`;
const tableReplace = `            <span>{copied ? '복사 완료' : '복사'}</span>`;
if (content.includes(tableTarget)) {
    content = content.replace(tableTarget, tableReplace);
    console.log("Patched TableWrapper!");
}

// 3. AsyncImage
const asyncImageTarget = `          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity text-xs flex items-center gap-1 z-10 hover:bg-black/80"
            title="이미지 복사"
          >
            {copied ? (
              <Check size={14} className="text-green-400" />
            ) : (
              <Copy size={14} />
            )}
          </button>`;
const asyncImageReplace = `          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 px-2.5 py-1.5 bg-black/60 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity text-xs flex items-center gap-1.5 z-10 hover:bg-black/80 font-medium"
            title="이미지 복사"
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
if (content.includes(asyncImageTarget)) {
    content = content.replace(asyncImageTarget, asyncImageReplace);
    console.log("Patched AsyncImage!");
}

fs.writeFileSync(file, content, 'utf8');
