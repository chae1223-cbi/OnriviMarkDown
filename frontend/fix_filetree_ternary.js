const fs = require('fs');
const target = __dirname + '/src/components/FileTreeItem.tsx';
let content = fs.readFileSync(target, 'utf8');

content = content.replace(/const browserMoveMsg = language === 'ko' \? "[^"]*" :\s*language === 'ja' \? "[^"]*" :\s*language === 'zh' \? "[^"]*" :\s*"[^"]*";/g, 'const browserMoveMsg = "브라우저 모드에서는 드래그 이동을 준비 중입니다.";');

content = content.replace(/const moveFailedMsg = language === 'ko' \? "[^"]*" :\s*language === 'ja' \? "[^"]*" :\s*language === 'zh' \? "[^"]*" :\s*"[^"]*";/g, 'const moveFailedMsg = "이동 실패: ";');

content = content.replace(/const deleteFailedMsg = language === 'ko' \? "[^"]*" :\s*language === 'ja' \? "[^"]*" :\s*language === 'zh' \? "[^"]*" :\s*"[^"]*";/g, 'const deleteFailedMsg = "삭제 실패: ";');

fs.writeFileSync(target, content, 'utf8');
