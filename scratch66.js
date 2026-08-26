const fs = require("fs");
let content = fs.readFileSync("frontend/src/components/MainEditorApp.tsx", "utf8");
let lines = content.split(/\r?\n/);
let found = -1;
for (let i=5840; i<5860; i++) {
    if (lines[i].includes("previewMode === 'preview'")) {
        console.log(`${i}: ${lines[i]}`);
        console.log(`${i+1}: ${lines[i+1]}`);
        console.log(`${i+2}: ${lines[i+2]}`);
    }
}
