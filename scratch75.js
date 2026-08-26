const fs = require("fs");
let content = fs.readFileSync("frontend/src/components/ImageModal.tsx", "utf8");
let lines = content.split(/\r?\n/);
for (let i=130; i<145; i++) {
    console.log(`${i}: ${lines[i]}`);
}
