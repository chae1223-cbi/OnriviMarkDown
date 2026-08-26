const fs = require("fs");
let content = fs.readFileSync("frontend/src/components/ImageModal.tsx", "utf8");

const startStr = "const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {";
const endStr = "reader.readAsDataURL(file);\n    }\n  };";

const startIdx = content.indexOf(startStr);

function makeRegex(str) {
  return new RegExp(str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s*'));
}
const regexEnd = makeRegex(endStr);
const m = content.substring(startIdx).match(regexEnd);

if (startIdx !== -1 && m) {
    const actualEndIdx = startIdx + m.index;
    const actualEndLen = m[0].length;
    
    const before = content.substring(0, startIdx);
    const after = content.substring(actualEndIdx + actualEndLen);
    
    const newStr = `const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // [Desktop ?화] ?미 리소스 ?더(media ??assets)? 있?? ?일?? ?택?? 경우 복사 ?략
      const api = (window as any).electronAPI;
      if (api && (file as any).path) {
        const filePath = (file as any).path;
        const freshResourceFolder = loadSecureData<string>('resourceFolder') || resourceFolder;
        
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
          
          // 만약 ?택?? ?일?? ?미 타겟 폴더 내부에 있다면 복사(덮어쓰기) 방지
          if (normFilePath.startsWith(normTargetDir + '/')) {
            const fileName = filePath.substring(Math.max(filePath.lastIndexOf('\\\\'), filePath.lastIndexOf('/')) + 1);
            
            // mediaPath 판단 로직 (main.js와 동일하게 구성)
            const isMediaDir = normTargetDir.endsWith('/media') || normTargetDir.endsWith('/assets');
            const finalFolderName = targetDir.substring(Math.max(targetDir.lastIndexOf('\\\\'), targetDir.lastIndexOf('/')) + 1);
            
            // mediaPath가 null이 아닌 경우 (상대경로 반환)
            let finalPath = '';
            const isRelative = !targetFolder; // targetFolder가 없으면 (즉 rawFolder가 임시폴더면) isRelative=false지만 보통 있음
            if (isMediaDir && targetFolder) {
              finalPath = \`/\${finalFolderName}/\${fileName}\`;
            } else {
              finalPath = \`media://local/serve?url=\${encodeURIComponent(filePath)}\`;
            }
            
            setImagePath(URL.createObjectURL(file));
            setAppliedPath(finalPath);
            setImageAlt("이미지 설명");
            if (showToast) showToast('리소스 폴더의 기존 파일을 선택하여 복사 없이 바로 적용합니다.', 'success');
            return; // 중단
          }
        }
      }

      const reader = new FileReader();
      reader.onload = async () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        const fileName = file.name ? file.name.replace(/\\s+/g, '_') : \`image_\${Date.now()}.png\`;
        await handleLocalImageSave(base64Data, fileName, file);
        setImageAlt("이미지 설명");
      };
      reader.readAsDataURL(file);
    }
  };`;
                          
    fs.writeFileSync("frontend/src/components/ImageModal.tsx", before + newStr + after, "utf8");
    console.log("Success ImageModal.tsx");
} else {
    console.log("Failed ImageModal.tsx");
}
