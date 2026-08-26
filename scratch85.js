const fs = require("fs");
let content = fs.readFileSync("frontend/src/hooks/editor/useMonacoSetup.ts", "utf8");
let lines = content.split(/\r?\n/);
let start = -1;
for (let i=0; i<lines.length; i++) {
    if (lines[i].includes("const scrollRatio = Math.max(0, Math.min(1, scrollTop / editorMaxScroll));")) {
        start = i;
        break;
    }
}
if (start !== -1) {
    let replaced = false;
    for (let i=start; i<start+30; i++) {
        if (lines[i].includes("parent.scrollTop = targetPreviewScroll;")) {
            lines[i] = `const isAtBottom = scrollTop >= editorMaxScroll - 2;
                            if (isAtBottom) {
                              targetPreviewScroll = previewMaxScroll;
                            }
                            parent.scrollTop = targetPreviewScroll;`;
            replaced = true;
            break;
        }
    }
    if (replaced) {
        fs.writeFileSync("frontend/src/hooks/editor/useMonacoSetup.ts", lines.join("\n"), "utf8");
        console.log("Fixed isAtBottom in editor -> preview");
    }
}
