const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MainEditorApp.tsx';
let content = fs.readFileSync(file, 'utf8');

const searchStr = `const pbLevel = prof.pageStyle.exportPageBreakLevel || 'h2';`;
const startIndex = content.indexOf(searchStr);

if (startIndex !== -1) {
    const endSearchStr = `break-before: auto !important;\n    }\n  }\n  \`;\n        }\n      }`;
    const endIndex = content.indexOf(endSearchStr, startIndex);
    
    if (endIndex !== -1) {
        // Rewind a bit for the comment
        const preComment = content.lastIndexOf('//', startIndex);
        const finalStartIndex = preComment !== -1 && (startIndex - preComment) < 100 ? preComment : startIndex;
        
        content = content.substring(0, finalStartIndex) + `// Obsolete CSS page break removed\n` + content.substring(endIndex + endSearchStr.length);
        fs.writeFileSync(file, content, 'utf8');
        console.log("Successfully removed block!");
    } else {
        console.log("Found start but not end");
    }
} else {
    console.log("Could not find start");
}
