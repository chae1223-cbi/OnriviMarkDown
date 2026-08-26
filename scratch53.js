const fs = require("fs");
let content = fs.readFileSync("frontend/src/components/ImageModal.tsx", "utf8");

const startStr = "if ((cleanImagePath.startsWith('/media/') || cleanImagePath.startsWith('./media/')) && resourceFolderHandle) {";
const endStr = "if (active) setLocalBlobUrl(createdBlob);\n          }";

const startIdx = content.indexOf(startStr);
if (startIdx !== -1) {
    const nextIdx = content.indexOf(endStr, startIdx);
    if (nextIdx !== -1) {
        const actualEndIdx = nextIdx + endStr.length;
        const before = content.substring(0, startIdx);
        const after = content.substring(actualEndIdx);
        
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
        fs.writeFileSync("frontend/src/components/ImageModal.tsx", before + newStr + after, "utf8");
        console.log("Success ImageModal.tsx loadLocal");
    } else {
        console.log("Failed ImageModal.tsx to find endStr");
    }
} else {
    console.log("Failed ImageModal.tsx to find startStr");
}
