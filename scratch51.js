const fs = require("fs");
let content = fs.readFileSync("frontend/src/components/ImageModal.tsx", "utf8");

const startStr = "if (typeof window !== 'undefined' && (window as any).electronAPI) {";
const endStr = "return `media://local/serve?url=${encodeURIComponent(absolutePath)}`;\n    }";

const startIdx = content.indexOf(startStr);
if (startIdx !== -1) {
    const nextIdx = content.indexOf(endStr, startIdx);
    if (nextIdx !== -1) {
        const actualEndIdx = nextIdx + endStr.length;
        const before = content.substring(0, startIdx);
        const after = content.substring(actualEndIdx);
        
        const newStr = `if (typeof window !== 'undefined' && (window as any).electronAPI) {
      const isMediaOrAssets = cleanImagePath.startsWith('/media/') || cleanImagePath.startsWith('./media/') || cleanImagePath.startsWith('/assets/') || cleanImagePath.startsWith('./assets/');
      const isRootRelative = cleanImagePath.startsWith('/');
      
      if (isMediaOrAssets) {
        const freshRF = loadSecureData<string>('resourceFolder') || resourceFolder;
        if (freshRF) {
          const sep = freshRF.includes('\\\\') ? '\\\\' : '/';
          const cleanRoot = freshRF.endsWith(sep) ? freshRF.slice(0, -1) : freshRF;
          const strippedPath = cleanImagePath.startsWith('./') ? cleanImagePath.substring(1) : cleanImagePath;
          const normalizedSrc = sep === '\\\\' ? strippedPath.replace(/\\//g, '\\\\') : strippedPath;
          absolutePath = cleanRoot + normalizedSrc;
        } else if (targetFolder) {
          const sep = targetFolder.includes('\\\\') ? '\\\\' : '/';
          // targetFolder가 .md 파일이면 폴더로 잘라냄
          let rawDir = targetFolder;
          if (rawDir.endsWith('.md') || rawDir.endsWith('.markdown')) {
            rawDir = rawDir.substring(0, Math.max(rawDir.lastIndexOf('\\\\'), rawDir.lastIndexOf('/')));
          }
          const cleanRoot = rawDir.endsWith(sep) ? rawDir.slice(0, -1) : rawDir;
          const strippedPath = cleanImagePath.startsWith('./') ? cleanImagePath.substring(1) : cleanImagePath;
          const normalizedSrc = sep === '\\\\' ? strippedPath.replace(/\\//g, '\\\\') : strippedPath;
          absolutePath = cleanRoot + normalizedSrc;
        }
      } else {
        const isAbsoluteWin = /^[a-zA-Z]:[\\\\/]/.test(cleanImagePath);
        const isAbsoluteUnix = cleanImagePath.startsWith('/');
        const isAbsolute = isAbsoluteWin || isAbsoluteUnix;

        if (!isAbsolute && targetFolder) {
          const sep = targetFolder.includes('\\\\') ? '\\\\' : '/';
          let rawDir = targetFolder;
          if (rawDir.endsWith('.md') || rawDir.endsWith('.markdown')) {
            rawDir = rawDir.substring(0, Math.max(rawDir.lastIndexOf('\\\\'), rawDir.lastIndexOf('/')));
          }
          const cleanRoot = rawDir.endsWith(sep) ? rawDir.slice(0, -1) : rawDir;
          const normalizedSrc = sep === '\\\\' ? cleanImagePath.replace(/\\//g, '\\\\') : cleanImagePath;
          absolutePath = cleanRoot + sep + normalizedSrc;
        } else if (isRootRelative && targetFolder) {
          // 일반적인 /images/ 류의 루트 상대경로 처리
          const sep = targetFolder.includes('\\\\') ? '\\\\' : '/';
          let rawDir = targetFolder;
          if (rawDir.endsWith('.md') || rawDir.endsWith('.markdown')) {
            rawDir = rawDir.substring(0, Math.max(rawDir.lastIndexOf('\\\\'), rawDir.lastIndexOf('/')));
          }
          const cleanRoot = rawDir.endsWith(sep) ? rawDir.slice(0, -1) : rawDir;
          const normalizedSrc = sep === '\\\\' ? cleanImagePath.replace(/\\//g, '\\\\') : cleanImagePath;
          absolutePath = cleanRoot + normalizedSrc;
        }
      }
    }

    if (workspaceType === 'browser' || workspaceType === 'local') {
      if (localBlobUrl) {
        return localBlobUrl;
      }
    }
    
    if (absolutePath.startsWith('http') || absolutePath.startsWith('data:') || absolutePath.startsWith('blob:')) {
      return absolutePath;
    }
    
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      return \`media://local/serve?url=\${encodeURIComponent(absolutePath)}\`;
    }`;
        fs.writeFileSync("frontend/src/components/ImageModal.tsx", before + newStr + after, "utf8");
        console.log("Success ImageModal.tsx previewSrc");
    } else {
        console.log("Failed ImageModal.tsx to find endStr");
    }
} else {
    console.log("Failed ImageModal.tsx to find startStr");
}
