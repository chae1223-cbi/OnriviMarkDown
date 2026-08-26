const fs = require("fs");
let content = fs.readFileSync("frontend/src/components/MainEditorApp.tsx", "utf8");

// We'll use a very specific replace
const originalCodeBlockTitle = `      if (tag === 'codeBlockTitle') {
        const bgColor = ruleObj['background-color'];
        const textColor = ruleObj['color'];
        if (bgColor) {
          css += \`.custom-preview-container .codeblock-header {\\n  background-color: \${bgColor} !important;\\n}\\n\`;
        }
        if (textColor) {
          css += \`.custom-preview-container .codeblock-header-text {\\n  color: \${textColor} !important;\\n}\\n\`;
        }
        return;
      }`;

const newCodeBlockTitle = `      if (tag === 'codeBlockTitle') {
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

// Normalize line endings to do a string replacement
let normalizedContent = content.replace(/\r\n/g, '\n');
let success1 = false;
let success2 = false;

if (normalizedContent.includes(originalCodeBlockTitle)) {
    normalizedContent = normalizedContent.replace(originalCodeBlockTitle, newCodeBlockTitle);
    success1 = true;
}

const originalCodeBlockStr = `      if (tag === 'codeBlock') {
        const bgColor = ruleObj['background-color'];
        const color = ruleObj['color'];
        const fontSize = ruleObj['font-size'];
        const padding = ruleObj['padding'];
        const borderRadius = ruleObj['border-radius'];

        if (bgColor) {
          css += \`.custom-preview-container .codeblock-area {\\n  background-color: \${bgColor} !important;\\n}\\n\`;
        }`;

const newCodeBlockStr = `      if (tag === 'codeBlock') {
        const bgColor = ruleObj['background-color'];
        const color = ruleObj['color'];
        const fontSize = ruleObj['font-size'];
        const padding = ruleObj['padding'];
        const borderRadius = ruleObj['border-radius'];

        if (bgColor) {
          css += \`.custom-preview-container .codeblock-area {\\n  background-color: \${bgColor} !important;\\n}\\n\`;
          
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
        }`;

if (normalizedContent.includes(originalCodeBlockStr)) {
    normalizedContent = normalizedContent.replace(originalCodeBlockStr, newCodeBlockStr);
    success2 = true;
}

if (success1 && success2) {
    fs.writeFileSync("frontend/src/components/MainEditorApp.tsx", normalizedContent, "utf8");
    console.log("Success replacing both blocks safely");
} else {
    console.log("Failed replacing safely:", {success1, success2});
}
