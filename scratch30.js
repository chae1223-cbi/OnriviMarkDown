const fs = require("fs");
let content = fs.readFileSync("frontend/src/components/MarkdownViewer.tsx", "utf8");

content = content.replace(
    'className="copy-button-hook px-2.5 py-1 bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 rounded opacity-0 group-hover:opacity-100 transition-opacity text-xs flex items-center gap-1.5 z-10 font-medium no-print"',
    'className="copy-button-hook px-2.5 py-1 bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 rounded opacity-60 hover:opacity-100 transition-opacity text-xs flex items-center gap-1.5 z-10 font-medium no-print"'
);

fs.writeFileSync("frontend/src/components/MarkdownViewer.tsx", content, "utf8");
console.log("Success");
