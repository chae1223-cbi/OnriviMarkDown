const fs = require("fs");
let content = fs.readFileSync("frontend/src/components/ImageModal.tsx", "utf8");
let lines = content.split(/\r?\n/);
let start = -1, end = -1;
for (let i=0; i<lines.length; i++) {
    if (lines[i].includes("if ((cleanImagePath.startsWith('/media/')")) {
        start = i;
    }
    if (start !== -1 && i > start && lines[i].includes("if (active) setLocalBlobUrl(createdBlob);")) {
        end = i + 1; // include the closing brace line
        break;
    }
}
if (start !== -1 && end !== -1) {
    let before = lines.slice(0, start).join("\n");
    let after = lines.slice(end + 1).join("\n"); // skip the closing brace which is on end
    
    let newStr = `          const isMedia = cleanImagePath.startsWith('/media/') || cleanImagePath.startsWith('./media/');
          const isAssets = cleanImagePath.startsWith('/assets/') || cleanImagePath.startsWith('./assets/');
          if ((isMedia || isAssets) && resourceFolderHandle) {
            const folderName = isMedia ? 'media' : 'assets';
            const fileName = cleanImagePath.replace(/^\\.?\\/(media|assets)\\//, '');
            try {
              const targetDir = await resourceFolderHandle.getDirectoryHandle(folderName);
              const fileHandle = await targetDir.getFileHandle(fileName);
              const file = await fileHandle.getFile();
              createdBlob = URL.createObjectURL(file);
              if (active) setLocalBlobUrl(createdBlob);
            } catch(e) {}
          }`;
    fs.writeFileSync("frontend/src/components/ImageModal.tsx", before + "\n" + newStr + "\n" + after, "utf8");
    console.log("Success ImageModal.tsx loadLocal");
} else {
    console.log("Failed to find bounds");
}
