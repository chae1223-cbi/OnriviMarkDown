const fs = require('fs');

// FileTreeItem.tsx
const file1 = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/FileTreeItem.tsx';
let c1 = fs.readFileSync(file1, 'utf8');
c1 = c1.replace(/size=\{14\} strokeWidth=\{1\.8\}/g, 'size={16} strokeWidth={1.8}');
c1 = c1.replace(/className="p-1 hover:bg-blue-100/g, 'className="p-1.5 hover:bg-blue-100');
c1 = c1.replace(/className="p-1 rounded transition-colors text-zinc-400/g, 'className="p-1.5 rounded transition-colors text-zinc-400');
c1 = c1.replace(/className=\{`p-1 rounded/g, 'className={`p-1.5 rounded');
fs.writeFileSync(file1, c1, 'utf8');
console.log('FileTreeItem.tsx 완료');

// LeftSidebar.tsx
const file2 = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/LeftSidebar.tsx';
let c2 = fs.readFileSync(file2, 'utf8');
c2 = c2.replace(/size=\{14\} strokeWidth=\{1\.8\}/g, 'size={16} strokeWidth={1.8}');
c2 = c2.replace(/className="p-1 hover:bg-blue-100/g, 'className="p-1.5 hover:bg-blue-100');
c2 = c2.replace(/className="p-1 hover:bg-green-100/g, 'className="p-1.5 hover:bg-green-100');
c2 = c2.replace(/className="p-1 hover:bg-purple-100/g, 'className="p-1.5 hover:bg-purple-100');
fs.writeFileSync(file2, c2, 'utf8');
console.log('LeftSidebar.tsx 완료');
