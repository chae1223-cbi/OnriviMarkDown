const fs = require("fs");
let content = fs.readFileSync("frontend/src/components/MainEditorApp.tsx", "utf8");

const startStr = "if (tag === 'codeBlockTitle') {";
const endStr = "          return;\n        }";

let startIdx = content.indexOf(startStr);
let count = 0;
while(startIdx !== -1) {
    let endIdx = content.indexOf(endStr, startIdx);
    if(endIdx !== -1) {
        let block = content.substring(startIdx, endIdx + endStr.length);
        if (block.includes("const bgColor = ruleObj['background-color'];")) {
            console.log("Found block! Length:", block.length);
            const before = content.substring(0, startIdx);
            const after = content.substring(endIdx + endStr.length);
            
            const newStr = `if (tag === 'codeBlockTitle') {
          const bgColor = ruleObj['background-color'];
          const textColor = ruleObj['color'];
          if (bgColor) {
            css += \`.custom-preview-container .codeblock-header {\\n  background-color: \${bgColor} !important;\\n}\\n\`;
            
            let isDark = false;
            let tempColor = bgColor.trim();
            if (tempColor.startsWith('#')) {
              let hex = tempColor.replace('#', '');
              if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
              if (hex.length >= 6) {
                const r = parseInt(hex.substring(0,2), 16);
                const g = parseInt(hex.substring(2,4), 16);
                const b = parseInt(hex.substring(4,6), 16);
                const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                if (brightness < 128) isDark = true;
              }
            } else if (tempColor.startsWith('rgb')) {
              const matches = tempColor.match(/\\d+/g);
              if (matches && matches.length >= 3) {
                const r = parseInt(matches[0], 10);
                const g = parseInt(matches[1], 10);
                const b = parseInt(matches[2], 10);
                const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                if (brightness < 128) isDark = true;
              }
            }
            
            if (isDark) {
               css += \`.custom-preview-container .copy-button-hook {\\n  background-color: rgba(255,255,255,0.15) !important;\\n  color: #f8fafc !important;\\n}\\n\`;
               css += \`.custom-preview-container .copy-button-hook:hover {\\n  background-color: rgba(255,255,255,0.25) !important;\\n}\\n\`;
            } else {
               css += \`.custom-preview-container .copy-button-hook {\\n  background-color: rgba(0,0,0,0.05) !important;\\n  color: #334155 !important;\\n}\\n\`;
               css += \`.custom-preview-container .copy-button-hook:hover {\\n  background-color: rgba(0,0,0,0.15) !important;\\n}\\n\`;
            }
          }
          if (textColor) {
            css += \`.custom-preview-container .codeblock-header-text {\\n  color: \${textColor} !important;\\n}\\n\`;
          }
          return;
        }`;
            
            content = before + newStr + after;
            fs.writeFileSync("frontend/src/components/MainEditorApp.tsx", content, "utf8");
            console.log("Successfully replaced block.");
            break; // only do it once
        }
    }
    startIdx = content.indexOf(startStr, startIdx + 1);
    count++;
    if(count > 10) break;
}
