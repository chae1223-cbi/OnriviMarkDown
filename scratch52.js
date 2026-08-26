const fs = require("fs");
let content = fs.readFileSync("frontend/src/components/ImageModal.tsx", "utf8");
let lines = content.split(/\r?\n/);
for (let i=0; i<lines.length; i++) {
    if (lines[i].includes("cleanImagePath.startsWith('/media/')")) {
        console.log(`Line ${i}: ${lines[i]}`);
    }
}
