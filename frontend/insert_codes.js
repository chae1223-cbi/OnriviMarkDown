const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function r() {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  const q = `
    INSERT INTO public.common_code_groups (group_code, group_name, description, is_use)
    VALUES
    ('INQUIRY_TYPE', '문의 유형', '고객 문의하기 유형 분류 코드', true),
    ('INQUIRY_STATUS', '문의 상태', '고객 문의 처리 상태 코드', true)
    ON CONFLICT (group_code) DO NOTHING;

    INSERT INTO public.common_codes (group_code, code_value, code_name, description, sort_order, is_use)
    VALUES
    ('INQUIRY_TYPE', 'GENERAL', '일반 문의', '서비스 일반 이용 관련 문의', 1, true),
    ('INQUIRY_TYPE', 'BILLING', '결제/환불', '결제, 환불, 요금제 관련 문의', 2, true),
    ('INQUIRY_TYPE', 'TECH', '기술 지원', '오류, 버그, 기술 관련 문의', 3, true),
    ('INQUIRY_TYPE', 'SUGGESTION', '기능 제안', '새로운 기능 제안 및 의견', 4, true),
    
    ('INQUIRY_STATUS', 'PENDING', '대기중', '접수되어 확인 대기 중인 상태', 1, true),
    ('INQUIRY_STATUS', 'IN_PROGRESS', '처리중', '관리자가 내용을 확인하고 처리 중인 상태', 2, true),
    ('INQUIRY_STATUS', 'RESOLVED', '답변완료', '처리가 완료되어 고객에게 답변이 전송된 상태', 3, true)
    ON CONFLICT (group_code, code_value) DO NOTHING;
  `;
  await c.query(q);
  console.log('Codes inserted');
  await c.end();
}
r();
