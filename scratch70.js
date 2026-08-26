const fs = require("fs");
let content = fs.readFileSync("frontend/src/components/MainEditorApp.tsx", "utf8");

const oldStr1 = "previewMode === 'preview'\n                              ? 'bg-surface-container-high p-4 pb-48 overflow-y-auto'\n                              : 'bg-surface-container-low px-0 pt-0 pb-48 overflow-hidden'";
const newStr1 = "previewMode === 'preview'\n                              ? 'bg-surface-container-high p-4 pb-48 overflow-y-auto'\n                              : 'bg-surface-container-low px-0 pt-0 pb-48 overflow-y-auto'";

const oldStr2 = "previewMode === 'preview'\\n                              ? 'bg-surface-container-high p-4 pb-48 overflow-y-auto'\\n                              : 'bg-surface-container-low px-0 pt-0 pb-48 overflow-hidden'";

let lines = content.split(/\r?\n/);
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("bg-surface-container-low px-0 pt-0 pb-48 overflow-hidden")) {
        lines[i] = lines[i].replace("overflow-hidden", "overflow-y-auto");
        console.log("Replaced at line " + i);
    }
}
fs.writeFileSync("frontend/src/components/MainEditorApp.tsx", lines.join("\n"), "utf8");
