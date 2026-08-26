const fs = require("fs");
let content = fs.readFileSync("frontend/src/components/MainEditorApp.tsx", "utf8");
content = content.replace(/\r\n/g, '\n');

const startStr = "const scrollRatio = Math.max(0, Math.min(1, previewScrollTop / previewMaxScroll));";
const endStr = "scrollTimeoutRef.current = setTimeout(() => { isScrollingRef.current = null; }, 50);";

const startIdx = content.indexOf(startStr);
const endIdx = content.indexOf(endStr, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
    const block = content.substring(startIdx, endIdx);
    console.log("MainEditorApp.tsx block:\n", block);
}
