const fs = require("fs");
let content = fs.readFileSync("frontend/src/hooks/editor/useMonacoSetup.ts", "utf8");
let lines = content.split(/\r?\n/);
for (let i=1430; i<1490; i++) {
    console.log(`${i}: ${lines[i]}`);
}
