const fs = require("fs");
let content = fs.readFileSync("frontend/src/components/ImageModal.tsx", "utf8");

content = content.replace(/setImagePath\(blobPreview\);/g, "setImagePath(finalPath);");
content = content.replace(/setImagePath\(URL\.createObjectURL\(file\)\);/g, "setImagePath(finalPath);");

fs.writeFileSync("frontend/src/components/ImageModal.tsx", content, "utf8");
console.log("Replaced setImagePath blob with finalPath");
