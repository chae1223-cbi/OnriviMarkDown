const fs = require("fs");
let content = fs.readFileSync("frontend/src/components/ImageModal.tsx", "utf8");

// Fix 1: previewSrc useMemo for Electron path resolving
const previewSrcStartStr = "if (typeof window !== 'undefined' && (window as any).electronAPI) {\n      if (cleanImagePath.startsWith('/media/') || cleanImagePath.startsWith('./media/')) {";
const previewSrcEndStr = "return `media://local/serve?url=${encodeURIComponent(absolutePath)}`;\n    }";

const idx1 = content.indexOf("if (typeof window !== 'undefined' && (window as any).electronAPI) {\n      if (cleanImagePath.startsWith('/media/') || cleanImagePath.startsWith('./media/')) {");
if (idx1 !== -1) {
    const nextIdx = content.indexOf(previewSrcEndStr, idx1);
    if (nextIdx !== -1) {
        const actualEndIdx = nextIdx + previewSrcEndStr.length;
        const before = content.substring(0, idx1);
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
        content = before + newStr + after;
        console.log("Success ImageModal.tsx previewSrc (Fix 1)");
    }
}

// Fix 2: loadLocal
const loadLocalOld = `if ((cleanImagePath.startsWith('/media/') || cleanImagePath.startsWith('./media/')) && resourceFolderHandle) {
          const fileName = cleanImagePath.replace(/^\\.?\\/media\\//, '');
          const mediaDir = await resourceFolderHandle.getDirectoryHandle('media');
          const fileHandle = await mediaDir.getFileHandle(fileName);
          const file = await fileHandle.getFile();
          createdBlob = URL.createObjectURL(file);
          if (active) setLocalBlobUrl(createdBlob);
        }`;
        
const loadLocalNew = `const isMedia = cleanImagePath.startsWith('/media/') || cleanImagePath.startsWith('./media/');
        const isAssets = cleanImagePath.startsWith('/assets/') || cleanImagePath.startsWith('./assets/');
        if ((isMedia || isAssets) && resourceFolderHandle) {
          const folderName = isMedia ? 'media' : 'assets';
          const fileName = cleanImagePath.replace(/^\\.?\\/(media|assets)\\//, '');
          const mediaDir = await resourceFolderHandle.getDirectoryHandle(folderName);
          const fileHandle = await mediaDir.getFileHandle(fileName);
          const file = await fileHandle.getFile();
          createdBlob = URL.createObjectURL(file);
          if (active) setLocalBlobUrl(createdBlob);
        }`;
        
if (content.includes(loadLocalOld)) {
    content = content.replace(loadLocalOld, loadLocalNew);
    console.log("Success ImageModal.tsx loadLocal (Fix 2)");
}

// Fix 3: Handle file paste/upload not copying if already in resource folder
const handleFileChangeOld = `const fileName = file.name ? file.name.replace(/\\s+/g, '_') : \`image_\${Date.now()}.png\`;
        await handleLocalImageSave(base64Data, fileName, file);
        setImageAlt("이미지 설명");`;
        
const handleFileChangeNew = `const api = (window as any).electronAPI;
        if (api && (file as any).path) {
          const filePath = (file as any).path;
          const freshResourceFolder = loadSecureData('resourceFolder') || resourceFolder;
          
          let targetDir = '';
          if (freshResourceFolder) {
            targetDir = freshResourceFolder + (freshResourceFolder.includes('\\\\') ? '\\\\media' : '/media');
          } else if (targetFolder) {
            let rawDir = targetFolder;
            if (rawDir.endsWith('.md') || rawDir.endsWith('.markdown')) {
              rawDir = rawDir.substring(0, Math.max(rawDir.lastIndexOf('\\\\'), rawDir.lastIndexOf('/')));
            }
            const folderName = rawDir.substring(Math.max(rawDir.lastIndexOf('\\\\'), rawDir.lastIndexOf('/')) + 1).toLowerCase();
            if (folderName !== 'assets' && folderName !== 'media') {
              targetDir = rawDir + (rawDir.includes('\\\\') ? '\\\\assets' : '/assets');
            } else {
              targetDir = rawDir;
            }
          }
          
          if (targetDir) {
            const normFilePath = filePath.replace(/\\\\/g, '/').toLowerCase();
            const normTargetDir = targetDir.replace(/\\\\/g, '/').toLowerCase();
            
            if (normFilePath.startsWith(normTargetDir + '/')) {
              const fileName = filePath.substring(Math.max(filePath.lastIndexOf('\\\\'), filePath.lastIndexOf('/')) + 1);
              const isMediaDir = normTargetDir.endsWith('/media') || normTargetDir.endsWith('/assets');
              const finalFolderName = targetDir.substring(Math.max(targetDir.lastIndexOf('\\\\'), targetDir.lastIndexOf('/')) + 1);
              
              let finalPath = '';
              if (isMediaDir && targetFolder) {
                finalPath = \`/\${finalFolderName}/\${fileName}\`;
              } else {
                finalPath = \`media://local/serve?url=\${encodeURIComponent(filePath)}\`;
              }
              
              setImagePath(URL.createObjectURL(file));
              setAppliedPath(finalPath);
              setImageAlt("이미지 설명");
              if (showToast) showToast('리소스 폴더의 기존 파일을 선택하여 복사 없이 바로 적용합니다.', 'success');
              return;
            }
          }
        }

        const fileName = file.name ? file.name.replace(/\\s+/g, '_') : \`image_\${Date.now()}.png\`;
        await handleLocalImageSave(base64Data, fileName, file);
        setImageAlt("이미지 설명");`;

if (content.includes(handleFileChangeOld)) {
    content = content.replace(handleFileChangeOld, handleFileChangeNew);
    console.log("Success ImageModal.tsx handleFileChange (Fix 3)");
}

fs.writeFileSync("frontend/src/components/ImageModal.tsx", content, "utf8");
