const fs = require("fs");
let content = fs.readFileSync("frontend/src/components/MainEditorApp.tsx", "utf8");
let lines = content.split(/\r?\n/);
for (let i=5840; i<5860; i++) {
    console.log(`${i}: ${lines[i]}`);
}
