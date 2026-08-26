const fs = require("fs");
let content = fs.readFileSync("frontend/src/components/MainEditorApp.tsx", "utf8");
let lines = content.split(/\r?\n/);
let start = -1;
for (let i=0; i<lines.length; i++) {
    if (lines[i].includes("const observer = new ResizeObserver((entries) => {")) {
        start = i;
        break;
    }
}
if (start !== -1) {
    for (let i=start-10; i<start+30; i++) {
        if(i >= 0 && i < lines.length) console.log(`${i}: ${lines[i]}`);
    }
}
