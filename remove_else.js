const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MainEditorApp.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /\} else \{[\s\n]*\/\/\/ \[EMBEDDED WELCOME.*?[\s\n]*\/\/.*?[\s\n]*setTabs\(\[\]\);[\s\n]*setActiveTabId\(null\);[\s\n]*setPreviewModeRaw\('preview'\);[\s\n]*previewModeRef\.current = 'preview';[\s\n]*\}/;
if (regex.test(content)) {
    content = content.replace(regex, '}');
    fs.writeFileSync(file, content, 'utf8');
    console.log("Removed the else block!");
} else {
    // Try simpler
    const simple = /\} else \{[\s\n]*\/\/\/ \[EMBEDDED WELCOME 2026-07-07\][\s\S]*?previewModeRef\.current = 'preview';[\s\n]*\}/;
    if (simple.test(content)) {
        content = content.replace(simple, '}');
        fs.writeFileSync(file, content, 'utf8');
        console.log("Removed via simpler regex!");
    } else {
        console.log("Still failed.");
        const lines = content.split('\n');
        let inElse = false;
        let result = [];
        for (let i = 0; i < lines.length; i++) {
             if (lines[i].includes('// ??? [EMBEDDED WELCOME 2026-07-07]')) {
                 // go back and remove '} else {'
                 let j = result.length - 1;
                 while (j >= 0 && !result[j].includes('} else {')) j--;
                 if (j >= 0) {
                     result[j] = result[j].replace('} else {', '}');
                 }
                 inElse = true;
             }
             if (inElse && lines[i].includes("previewModeRef.current = 'preview';")) {
                 inElse = false;
                 // skip the next closing brace
                 let k = i + 1;
                 while (k < lines.length && !lines[k].includes('}')) k++;
                 i = k;
                 continue;
             }
             if (!inElse) {
                 result.push(lines[i]);
             }
        }
        if (result.length !== lines.length) {
            fs.writeFileSync(file, result.join('\n'), 'utf8');
            console.log("Removed using manual line processing!");
        }
    }
}
