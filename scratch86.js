const fs = require("fs");
let content = fs.readFileSync("frontend/src/components/MainEditorApp.tsx", "utf8");
let lines = content.split(/\r?\n/);
let start = -1;
for (let i=0; i<lines.length; i++) {
    if (lines[i].includes("const handlePreviewScroll = (e: React.UIEvent<HTMLDivElement>) => {")) {
        start = i;
        break;
    }
}
if (start !== -1) {
    for (let i=start; i<start+40; i++) {
        console.log(`${i}: ${lines[i]}`);
    }
}
