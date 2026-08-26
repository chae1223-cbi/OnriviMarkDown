const fs = require("fs");
let content = fs.readFileSync("frontend/src/components/MainEditorApp.tsx", "utf8");
content = content.replace(/\r\n/g, '\n');

const startStr = "if (tag === 'codeBlockTitle') {";
const endStr = "          return;\n        }";

const startIdx = content.indexOf(startStr);
const endIdx = content.indexOf(endStr, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
    const before = content.substring(0, startIdx);
    const after = content.substring(endIdx + endStr.length);
    
    const newStr = `if (tag === 'codeBlockTitle') {
          const bgColor = ruleObj['background-color'];
          const textColor = ruleObj['color'];
          if (bgColor) {
            css += \`.custom-preview-container .codeblock-header {\\n  background-color: \${bgColor} !important;\\n}\\n\`;
            
            // 배경 밝기(Brightness)를 계산하여 복사 버튼 색상 대비 조정
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

    fs.writeFileSync("frontend/src/components/MainEditorApp.tsx", before + newStr + after, "utf8");
    console.log("Success");
} else {
    console.log("Failed to match oldStr");
}
