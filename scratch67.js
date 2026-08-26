const fs = require("fs");
let content = fs.readFileSync("frontend/src/components/MainEditorApp.tsx", "utf8");

content = content.replace(
  "previewMode === 'preview'\n                             ? 'bg-surface-container-high p-4 pb-48 overflow-y-auto'\n                             : 'bg-surface-container-low px-0 pt-0 pb-48 overflow-hidden'",
  "previewMode === 'preview'\n                             ? 'bg-surface-container-high p-4 pb-48 overflow-y-auto'\n                             : 'bg-surface-container-low px-0 pt-0 pb-48 overflow-y-auto'"
);
// Also replacing other possible line endings:
content = content.replace(
  "previewMode === 'preview'\r\n                             ? 'bg-surface-container-high p-4 pb-48 overflow-y-auto'\r\n                             : 'bg-surface-container-low px-0 pt-0 pb-48 overflow-hidden'",
  "previewMode === 'preview'\r\n                             ? 'bg-surface-container-high p-4 pb-48 overflow-y-auto'\r\n                             : 'bg-surface-container-low px-0 pt-0 pb-48 overflow-y-auto'"
);

fs.writeFileSync("frontend/src/components/MainEditorApp.tsx", content, "utf8");
console.log("Replaced overflow-hidden with overflow-y-auto");
