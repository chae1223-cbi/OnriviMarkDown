const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MainEditorApp.tsx';
let content = fs.readFileSync(file, 'utf8');

const lines = content.split('\n');
let newLines = [];
let skipClose = false;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('if (!isRestrictedUser) {') && lines[i+1] && lines[i+1].includes('// 1. [')) {
        // skip this line
        skipClose = true;
        continue;
    }
    
    // If we are skipping the close, we need to find the matching '}' which is after setContent, setCurrentFileName...
    if (skipClose && lines[i].includes('setCurrentFileNode(null);')) {
        // the next two lines should be } and }
        newLines.push(lines[i]);
        if (lines[i+1].trim() === '}') {
            newLines.push(lines[i+1]); // close inner if
            i++;
            if (lines[i+1].trim() === '}') {
                // this is the one we want to skip!
                i++;
                skipClose = false;
            }
        }
        continue;
    }
    newLines.push(lines[i]);
}

fs.writeFileSync(file, newLines.join('\n'), 'utf8');
console.log("Removed the if wrapper!");
