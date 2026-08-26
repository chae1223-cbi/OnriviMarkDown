const fs = require("fs");
let content = fs.readFileSync("frontend/src/hooks/editor/useMonacoSetup.ts", "utf8");
let lines = content.split(/\r?\n/);
let startIdx = -1;
for (let i=0; i<lines.length; i++) {
    if (lines[i].includes("editor.getVisibleRanges();")) {
        startIdx = i;
        break;
    }
}
if (startIdx !== -1) {
    for (let i=startIdx-10; i<startIdx+50; i++) {
        if(i >= 0 && i < lines.length) console.log(`${i}: ${lines[i]}`);
    }
}
