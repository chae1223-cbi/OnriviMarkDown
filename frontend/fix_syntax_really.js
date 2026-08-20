const fs = require('fs');
let c1 = fs.readFileSync('d:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/lib/exportHandlers.ts', 'utf8');
c1 = c1.replace('    // ?반 콘텐?p, ul ??: bufferStartEl ?태 ?? (버퍼 계속 ?임)\r\n  }\r\n}', '    // ?반 콘텐?p, ul ??: bufferStartEl ?태 ?? (버퍼 계속 ?임)\r\n  }');
c1 = c1.replace('    // 일반 콘텐트(p, ul 등): bufferStartEl 상태 유지 (버퍼 계속 쌓임)\n  }\n}', '    // 일반 콘텐트(p, ul 등): bufferStartEl 상태 유지 (버퍼 계속 쌓임)\n  }');
fs.writeFileSync('d:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/lib/exportHandlers.ts', c1, 'utf8');
