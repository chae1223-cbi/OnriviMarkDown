const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MainEditorApp.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `                                <div className="absolute top-4 right-4 z-50 no-print opacity-0 hover:opacity-100 transition-opacity group-hover:opacity-100 duration-200 group" style={{ opacity: 0 }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}>`;

const replaceStr = `                                <div className="absolute top-4 right-4 z-50 no-print opacity-30 hover:opacity-100 transition-opacity duration-200">`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replaceStr);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Patched!");
} else {
    console.log("Not found targetStr!");
}
