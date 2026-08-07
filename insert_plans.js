const { Client } = require('pg');
require('dotenv').config({ path: 'frontend/.env.local' });

const connectionString = process.env.DATABASE_URL;

const sql1 = `
INSERT INTO "public"."pricing_plans" ("id", "created_by", "created_at", "updated_by", "updated_at", "plan_code", "sys_type", "tagline", "badge", "is_free", "tier_emoji", "price_monthly", "price_monthly_usd", "price_yearly", "price_yearly_usd", "features", "cta", "cta_variant", "is_highlighted", "sort_order", "is_active") VALUES 
('04b86113-a2c8-4797-a6e4-0aab61e6dc9f', null, '2026-08-05 23:27:24.573444+00', null, '2026-08-05 23:27:24.573444+00', 'APPRENTICE', 'WEB', '7일 무료 체험', '🥈', true, '🥈', null, null, null, null, '["가입 후 7일 동안 모든 문서 읽기 + 편집 기능 무료 체험","편집(Write): 단 1개의 브라우저에서만 작성 가능","웹 뷰어: 모든 마크다운 문서를 브라우저로 원클릭 공유!"]', '무료 체험 시작', 'secondary', false, 2, true)
ON CONFLICT (id) DO UPDATE SET 
  plan_code = EXCLUDED.plan_code, sys_type = EXCLUDED.sys_type, tagline = EXCLUDED.tagline, badge = EXCLUDED.badge, is_free = EXCLUDED.is_free, tier_emoji = EXCLUDED.tier_emoji, price_monthly = EXCLUDED.price_monthly, price_monthly_usd = EXCLUDED.price_monthly_usd, price_yearly = EXCLUDED.price_yearly, price_yearly_usd = EXCLUDED.price_yearly_usd, features = EXCLUDED.features, cta = EXCLUDED.cta, cta_variant = EXCLUDED.cta_variant, is_highlighted = EXCLUDED.is_highlighted, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active;

INSERT INTO "public"."pricing_plans" ("id", "created_by", "created_at", "updated_by", "updated_at", "plan_code", "sys_type", "tagline", "badge", "is_free", "tier_emoji", "price_monthly", "price_monthly_usd", "price_yearly", "price_yearly_usd", "features", "cta", "cta_variant", "is_highlighted", "sort_order", "is_active") VALUES 
('1c714143-d0ef-41c0-a6b7-a9fd13bb6836', null, '2026-08-05 23:27:24.573444+00', null, '2026-08-05 23:27:24.573444+00', 'READER', 'WEB', '평생 무료 읽기 전용', '🥉', true, '🥉', null, null, null, null, '["회원가입 시 세상의 모든 마크다운 문서를 제한 없이 자유롭게 읽기 가능"]', '무료 회원가입', 'secondary', false, 1, true)
ON CONFLICT (id) DO UPDATE SET 
  plan_code = EXCLUDED.plan_code, sys_type = EXCLUDED.sys_type, tagline = EXCLUDED.tagline, badge = EXCLUDED.badge, is_free = EXCLUDED.is_free, tier_emoji = EXCLUDED.tier_emoji, price_monthly = EXCLUDED.price_monthly, price_monthly_usd = EXCLUDED.price_monthly_usd, price_yearly = EXCLUDED.price_yearly, price_yearly_usd = EXCLUDED.price_yearly_usd, features = EXCLUDED.features, cta = EXCLUDED.cta, cta_variant = EXCLUDED.cta_variant, is_highlighted = EXCLUDED.is_highlighted, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active;

INSERT INTO "public"."pricing_plans" ("id", "created_by", "created_at", "updated_by", "updated_at", "plan_code", "sys_type", "tagline", "badge", "is_free", "tier_emoji", "price_monthly", "price_monthly_usd", "price_yearly", "price_yearly_usd", "features", "cta", "cta_variant", "is_highlighted", "sort_order", "is_active") VALUES 
('30198572-8eba-4306-b657-f6ac51b18b55', null, '2026-08-05 23:27:24.573444+00', null, '2026-08-05 23:27:24.573444+00', 'ELITEPRO', 'DESKTOP', '오프라인 + 웹 듀얼 환경', '💎', false, '💎', null, null, 45000, '30.00', '["내 컴퓨터에 직접 설치하는 독립 설치형 프로그램 제공","설치 권한: 단 1대 PC 설치 및 고유 인증","설치한 PC에서 무제한 읽기/편집 가능","웹 뷰어: 모든 마크다운 문서를 브라우저로 원클릭 공유!"]', 'Elite Pro 구독', 'primary', false, 4, true)
ON CONFLICT (id) DO UPDATE SET 
  plan_code = EXCLUDED.plan_code, sys_type = EXCLUDED.sys_type, tagline = EXCLUDED.tagline, badge = EXCLUDED.badge, is_free = EXCLUDED.is_free, tier_emoji = EXCLUDED.tier_emoji, price_monthly = EXCLUDED.price_monthly, price_monthly_usd = EXCLUDED.price_monthly_usd, price_yearly = EXCLUDED.price_yearly, price_yearly_usd = EXCLUDED.price_yearly_usd, features = EXCLUDED.features, cta = EXCLUDED.cta, cta_variant = EXCLUDED.cta_variant, is_highlighted = EXCLUDED.is_highlighted, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active;

INSERT INTO "public"."pricing_plans" ("id", "created_by", "created_at", "updated_by", "updated_at", "plan_code", "sys_type", "tagline", "badge", "is_free", "tier_emoji", "price_monthly", "price_monthly_usd", "price_yearly", "price_yearly_usd", "features", "cta", "cta_variant", "is_highlighted", "sort_order", "is_active") VALUES 
('43e5d255-5692-4fc3-a064-6bcc2e124436', null, '2026-08-05 23:27:24.573444+00', '1f32d402-5b78-4507-b8ee-7fd1d7102e83', '2026-08-05 23:39:45.254+00', 'REGULAR', 'WEB', '월 3,000원 / 연 30,000원', '🥇', false, '🥇', 3000, '2.00', 30000, '20.00', '["매달 가볍게 시작하는 월간 구독 또는 합리적인 연간 구독 선택","편집(Write): 1개의 브라우저에서만 문서 편집 가능","웹 뷰어: 모든 마크다운 문서를 브라우저로 원클릭 공유!"]', '구독 시작', 'primary', true, 3, true)
ON CONFLICT (id) DO UPDATE SET 
  plan_code = EXCLUDED.plan_code, sys_type = EXCLUDED.sys_type, tagline = EXCLUDED.tagline, badge = EXCLUDED.badge, is_free = EXCLUDED.is_free, tier_emoji = EXCLUDED.tier_emoji, price_monthly = EXCLUDED.price_monthly, price_monthly_usd = EXCLUDED.price_monthly_usd, price_yearly = EXCLUDED.price_yearly, price_yearly_usd = EXCLUDED.price_yearly_usd, features = EXCLUDED.features, cta = EXCLUDED.cta, cta_variant = EXCLUDED.cta_variant, is_highlighted = EXCLUDED.is_highlighted, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active;
`;

const sql2 = `
INSERT INTO "public"."common_codes" ("id", "created_by", "created_at", "updated_by", "updated_at", "group_code", "code_value", "code_name", "description", "sort_order", "is_use", "attr_1", "attr_2") VALUES 
('02aa14eb-4c86-40f0-b357-783b9a0570b5', null, '2026-07-22 03:53:18.13427+00', null, '2026-07-22 03:53:18.13427+00', 'PLAN_NAME', 'APPRENTICE', 'Apprentice 플랜', '7일 무료 1대 접속 기본 요금제', 2, true, null, null) ON CONFLICT (id) DO UPDATE SET code_value = EXCLUDED.code_value, code_name = EXCLUDED.code_name;

INSERT INTO "public"."common_codes" ("id", "created_by", "created_at", "updated_by", "updated_at", "group_code", "code_value", "code_name", "description", "sort_order", "is_use", "attr_1", "attr_2") VALUES 
('72a1beef-7ef3-4a01-89ef-58e4d21018ea', null, '2026-07-22 03:53:18.13427+00', null, '2026-07-22 03:53:18.13427+00', 'PLAN_NAME', 'ELITEPRO', 'Elite Pro 플랜', '전문 창작자 전용 요금제', 4, true, null, null) ON CONFLICT (id) DO UPDATE SET code_value = EXCLUDED.code_value, code_name = EXCLUDED.code_name;

INSERT INTO "public"."common_codes" ("id", "created_by", "created_at", "updated_by", "updated_at", "group_code", "code_value", "code_name", "description", "sort_order", "is_use", "attr_1", "attr_2") VALUES 
('738b313b-d42f-4728-ad8d-bbdab3114ddd', null, '2026-08-01 01:01:49.822795+00', null, '2026-08-01 01:01:49.822795+00', 'PLAN_NAME', 'READER', 'Reader (제한사용자)', '회원가입 기본 및 요금제 만료 시 전환되는 평생 무료 읽기 전용 상태', 1, true, null, null) ON CONFLICT (id) DO UPDATE SET code_value = EXCLUDED.code_value, code_name = EXCLUDED.code_name;

INSERT INTO "public"."common_codes" ("id", "created_by", "created_at", "updated_by", "updated_at", "group_code", "code_value", "code_name", "description", "sort_order", "is_use", "attr_1", "attr_2") VALUES 
('9a6153f5-d3ae-4b30-b0fd-857b3e7ad176', null, '2026-07-22 03:53:18.13427+00', null, '2026-07-22 03:53:18.13427+00', 'PLAN_NAME', 'REGULAR', 'Regular 플랜', '기초 작성자 전용 요금제', 3, true, null, null) ON CONFLICT (id) DO UPDATE SET code_value = EXCLUDED.code_value, code_name = EXCLUDED.code_name;
`;

async function insertData() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    await client.query(sql1);
    await client.query(sql2);
    console.log("Insert successful!");
  } catch (err) {
    console.error("Error inserting data", err);
  } finally {
    await client.end();
  }
}
insertData();
