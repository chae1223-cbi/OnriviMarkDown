const fs = require("fs");
let content = fs.readFileSync("frontend/src/components/MainEditorApp.tsx", "utf8");
let lines = content.split(/\r?\n/);
for (let i=5870; i<5930; i++) {
    console.log(`${i}: ${lines[i]}`);
}
