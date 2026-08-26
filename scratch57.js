const fs = require("fs");
let content = fs.readFileSync("frontend/src/components/ImageModal.tsx", "utf8");

const oldStr = `if ((cleanImagePath.startsWith('/media/') || cleanImagePath.startsWith('./media/')) && resourceFolderHandle) {
          const fileName = cleanImagePath.replace(/^\\.?\\/media\\//, '');
          const mediaDir = await resourceFolderHandle.getDirectoryHandle('media');
          const fileHandle = await mediaDir.getFileHandle(fileName);
          const file = await fileHandle.getFile();
          createdBlob = URL.createObjectURL(file);
          if (active) setLocalBlobUrl(createdBlob);
        }`;
        
const newStr = `const isMedia = cleanImagePath.startsWith('/media/') || cleanImagePath.startsWith('./media/');
        const isAssets = cleanImagePath.startsWith('/assets/') || cleanImagePath.startsWith('./assets/');
        if ((isMedia || isAssets) && resourceFolderHandle) {
          const folderName = isMedia ? 'media' : 'assets';
          const fileName = cleanImagePath.replace(/^\\.?\\/(media|assets)\\//, '');
          const targetDir = await resourceFolderHandle.getDirectoryHandle(folderName);
          const fileHandle = await targetDir.getFileHandle(fileName);
          const file = await fileHandle.getFile();
          createdBlob = URL.createObjectURL(file);
          if (active) setLocalBlobUrl(createdBlob);
        }`;
        
content = content.replace(oldStr, newStr);
fs.writeFileSync("frontend/src/components/ImageModal.tsx", content, "utf8");
