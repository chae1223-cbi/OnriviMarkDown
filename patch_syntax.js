const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/lib/exportHandlers.ts';
let content = fs.readFileSync(file, 'utf8');

const regex = /\}\s*\/\/ 일반 콘텐츠\(p, ul 등\): bufferStartEl 상태 유지 \(버퍼 계속 쌓임\)\s*\}/m;

const replaceStr = `// 일반 콘텐츠(p, ul 등): bufferStartEl 상태 유지 (버퍼 계속 쌓임)
}`;

if (regex.test(content)) {
    content = content.replace(regex, replaceStr);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Fixed syntax error!");
} else {
    console.log("Regex did not match!");
}
