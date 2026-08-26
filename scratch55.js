const fs = require("fs");
let content = fs.readFileSync("frontend/src/components/ImageModal.tsx", "utf8");
let lines = content.split(/\r?\n/);
for (let i=250; i<275; i++) {
    console.log(`${i}: ${lines[i]}`);
}
