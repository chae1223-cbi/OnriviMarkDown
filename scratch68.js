const fs = require("fs");
let content = fs.readFileSync("frontend/src/components/MainEditorApp.tsx", "utf8");

content = content.replace(/previewMode === 'preview'[\s\S]*?\? 'bg-surface-container-high p-4 pb-48 overflow-y-auto'[\s\S]*?: 'bg-surface-container-low px-0 pt-0 pb-48 overflow-hidden'/g, 
  "previewMode === 'preview'\n                             ? 'bg-surface-container-high p-4 pb-48 overflow-y-auto'\n                             : 'bg-surface-container-low px-0 pt-0 pb-48 overflow-y-auto'");

fs.writeFileSync("frontend/src/components/MainEditorApp.tsx", content, "utf8");
console.log("Replaced with regex");
