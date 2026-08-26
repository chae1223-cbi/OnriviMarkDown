const fs = require("fs");
let content = fs.readFileSync("frontend/src/components/ImageModal.tsx", "utf8");

const oldStr = `} else {
      const blobPreview = URL.createObjectURL(imageFile);
      setImagePath(finalPath);
      if (showToast) showToast('이미지 로컬 저장 실패 (임시 렌더링)', 'error');
    }`;
const newStr = `} else {
      const blobPreview = URL.createObjectURL(imageFile);
      setImagePath(blobPreview);
      if (showToast) showToast('이미지 로컬 저장 실패 (임시 렌더링)', 'error');
    }`;

content = content.replace(oldStr, newStr);
fs.writeFileSync("frontend/src/components/ImageModal.tsx", content, "utf8");
console.log("Fixed fallback");
