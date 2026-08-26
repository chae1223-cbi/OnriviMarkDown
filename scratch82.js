const fs = require("fs");
let content = fs.readFileSync("frontend/src/components/YoutubeModal.tsx", "utf8");

const oldStr = `if (raw && (raw.startsWith('/media/') || raw.startsWith('./media/'))) {
      const api = typeof window !== 'undefined' ? (window as any).electronAPI : null;
      if (api) {
        const freshRF = loadSecureData<string>('resourceFolder') || resourceFolder;
        if (freshRF) {
          const sep = freshRF.includes('\\\\') ? '\\\\' : '/';
          const cleanRoot = freshRF.endsWith(sep) ? freshRF.slice(0, -1) : freshRF;
          const strippedSrc = raw.startsWith('./') ? raw.substring(1) : raw;
          const normalizedSrc = sep === '\\\\' ? strippedSrc.replace(/\\//g, '\\\\') : strippedSrc;
          let absolutePath = cleanRoot + normalizedSrc;
          return \`media-local://serve?url=\${encodeURIComponent(absolutePath)}\`;
        }
      }
    }`;

const newStr = `const isMediaOrAssets = raw && (raw.startsWith('/media/') || raw.startsWith('./media/') || raw.startsWith('/assets/') || raw.startsWith('./assets/'));
    const isRootRelative = raw && raw.startsWith('/');

    if (isMediaOrAssets) {
      const api = typeof window !== 'undefined' ? (window as any).electronAPI : null;
      if (api) {
        const freshRF = loadSecureData<string>('resourceFolder') || resourceFolder;
        if (freshRF) {
          const sep = freshRF.includes('\\\\') ? '\\\\' : '/';
          const cleanRoot = freshRF.endsWith(sep) ? freshRF.slice(0, -1) : freshRF;
          const strippedPath = raw.startsWith('./') ? raw.substring(1) : raw;
          const normalizedSrc = sep === '\\\\' ? strippedPath.replace(/\\//g, '\\\\') : strippedPath;
          const absolutePath = cleanRoot + normalizedSrc;
          return \`media-local://serve?url=\${encodeURIComponent(absolutePath)}\`;
        } else if (targetFolder) {
          const sep = targetFolder.includes('\\\\') ? '\\\\' : '/';
          let rawDir = targetFolder;
          if (rawDir.endsWith('.md') || rawDir.endsWith('.markdown')) {
            rawDir = rawDir.substring(0, Math.max(rawDir.lastIndexOf('\\\\'), rawDir.lastIndexOf('/')));
          }
          const cleanRoot = rawDir.endsWith(sep) ? rawDir.slice(0, -1) : rawDir;
          const strippedPath = raw.startsWith('./') ? raw.substring(1) : raw;
          const normalizedSrc = sep === '\\\\' ? strippedPath.replace(/\\//g, '\\\\') : strippedPath;
          const absolutePath = cleanRoot + normalizedSrc;
          return \`media-local://serve?url=\${encodeURIComponent(absolutePath)}\`;
        }
      }
    } else if (isRootRelative) {
      const api = typeof window !== 'undefined' ? (window as any).electronAPI : null;
      if (api && targetFolder) {
          const sep = targetFolder.includes('\\\\') ? '\\\\' : '/';
          let rawDir = targetFolder;
          if (rawDir.endsWith('.md') || rawDir.endsWith('.markdown')) {
            rawDir = rawDir.substring(0, Math.max(rawDir.lastIndexOf('\\\\'), rawDir.lastIndexOf('/')));
          }
          const cleanRoot = rawDir.endsWith(sep) ? rawDir.slice(0, -1) : rawDir;
          const normalizedSrc = sep === '\\\\' ? raw.replace(/\\//g, '\\\\') : raw;
          const absolutePath = cleanRoot + normalizedSrc;
          return \`media-local://serve?url=\${encodeURIComponent(absolutePath)}\`;
      }
    }`;

content = content.replace(oldStr, newStr);
fs.writeFileSync("frontend/src/components/YoutubeModal.tsx", content, "utf8");
console.log("Fixed previewSrc in YoutubeModal");
