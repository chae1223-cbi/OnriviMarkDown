const fs = require("fs");
let content = fs.readFileSync("frontend/src/app/globals.css", "utf8");
let lines = content.split(/\r?\n/);
for (let i=520; i<535; i++) {
    console.log(`${i}: ${lines[i]}`);
}
