const fs = require('fs');
let content = fs.readFileSync('database/rpc_setup.sql', 'utf8');

const targetStr = `  -- 1. 湲곗????꽦 ?щ룆????쑝????
  UPDATE subscriptions
  SET plan_status = 'CANCELED', -- ??截??곹깭 蹂€?      is_expired = 'Y', -- ??截?留뚮?      plan_end_date = p_today_str -- ??截??낅????젙
  WHERE user_id = p_user_id -- ???????ID
    AND is_expired = 'N';`;

// Let's use regex instead since the encoding breaks the text.
const regex = /-- 1\.\s+.*?UPDATE subscriptions\s+SET plan_status = 'CANCELED',\s+.*?is_expired = 'Y',\s+.*?plan_end_date = p_today_str\s+.*?WHERE user_id = p_user_id\s+.*?AND is_expired = 'N';/s;

const replaceStr = `  -- 1. 기존 활성 구독 취소 (플랫폼 분리: 데스크탑은 데스크탑만, 웹은 웹만 취소)
  IF p_plan_name LIKE '%데스크탑%' THEN
    UPDATE subscriptions
    SET plan_status = 'CANCELED',
        is_expired = 'Y',
        plan_end_date = p_today_str
    WHERE user_id = p_user_id
      AND is_expired = 'N'
      AND plan_name LIKE '%데스크탑%';
  ELSE
    UPDATE subscriptions
    SET plan_status = 'CANCELED',
        is_expired = 'Y',
        plan_end_date = p_today_str
    WHERE user_id = p_user_id
      AND is_expired = 'N'
      AND plan_name NOT LIKE '%데스크탑%';
  END IF;`;

content = content.replace(regex, replaceStr);

fs.writeFileSync('database/rpc_setup.sql', content);
console.log('Patch applied to rpc_setup.sql.');
