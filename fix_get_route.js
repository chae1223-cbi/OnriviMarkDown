const fs = require('fs');
const filePath = 'D:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/app/api/subscription/get/route.ts';
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `  export async function POST(request: Request) {
    try {
      const { user_id: userId } = await request.json();
  
      if (!userId) {
        return NextResponse.json({ success: false, message: 'user_id 파라미터가 필요합니다.' }, { status: 400 });
      }`;

const newStr = `  export async function POST(request: Request) {
    try {
      let { user_id: userId } = await request.json();
  
      if (!userId) {
        return NextResponse.json({ success: false, message: 'user_id 파라미터가 필요합니다.' }, { status: 400 });
      }

      // UUID가 아닌 경우 (예: onrivi@naver.com) users 테이블에서 UUID를 찾는다
      const isValidUUID = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (!isValidUUID(userId)) {
        const userRow = await sql\`SELECT id FROM users WHERE email = \${userId} LIMIT 1\`;
        if (userRow && userRow.length > 0) {
          userId = userRow[0].id;
        } else {
          return NextResponse.json({ success: false, message: '해당 이메일의 사용자를 찾을 수 없습니다.' }, { status: 404 });
        }
      }`;

content = content.replace(targetStr, newStr);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed API route to handle email');
