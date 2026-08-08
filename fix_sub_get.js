const fs = require('fs');
const filePath = 'D:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/app/api/subscription/get/route.ts';
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `    // 1. 전체 구독 이력 조회`;

const newStr = `    // 0. 현재 날짜 기준으로 만료일이 지난 활성 구독을 자동으로 EXPIRED 처리
    await sql\`
      UPDATE subscriptions
      SET plan_status = 'EXPIRED',
          is_active = false,
          updated_at = now()
      WHERE user_id = \${userId}
        AND current_period_end < now()
        AND plan_status != 'EXPIRED'
    \`;

    // 1. 전체 구독 이력 조회`;

content = content.replace(targetStr, newStr);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed API route properly');
