const fs = require("fs");
let content = fs.readFileSync("frontend/src/components/MainEditorApp.tsx", "utf8");
let lines = content.split(/\r?\n/);
let matchIdx = -1;
for (let i=0; i<lines.length; i++) {
    if (lines[i].includes("setScrollPosition")) {
        console.log(`Line ${i}: ${lines[i]}`);
    }
}
