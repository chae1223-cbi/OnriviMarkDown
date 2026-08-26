const fs = require("fs");
let content = fs.readFileSync("frontend/src/hooks/editor/useMonacoSetup.ts", "utf8");
let lines = content.split(/\r?\n/);
for (let i=1418; i<1425; i++) {
    console.log(`${i}: ${lines[i]}`);
}
