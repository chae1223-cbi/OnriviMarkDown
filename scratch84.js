const fs = require("fs");
let content = fs.readFileSync("frontend/src/hooks/editor/useMonacoSetup.ts", "utf8");
let lines = content.split(/\r?\n/);
let start = -1;
for (let i=0; i<lines.length; i++) {
    if (lines[i].includes("let interpolatedPreviewTop = previewTopA;")) {
        start = i;
        break;
    }
}
if (start !== -1) {
    for (let i=start-15; i<start+15; i++) {
        console.log(`${i}: ${lines[i]}`);
    }
}
