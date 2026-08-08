const fs = require('fs');
const filePath = 'D:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MainEditorApp.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `              let planName = isFreeTrial ? '무료 체험 플랜' : \`\${sub?.plan_name || 'PRO'} 프리미엄 플랜\`;
  
              if (!isExpired) {
                let activationFailed = false;
                let activationError = '';
  
                console.log('[loadAndVerifyLicense] p_user_id to send:', savedUserId, 'sessionId:', sessionId);
                const actRes = await fetch(getApiUrl('/api/rpc/license/insert'), {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ p_license_id: license.id, p_device_uuid: sessionId, p_device_name: 'Web SaaS', p_user_id: savedUserId })
                });`;

const newStr = `              let planName = isFreeTrial ? '무료 체험 플랜' : \`\${sub?.plan_name || 'PRO'} 프리미엄 플랜\`;
  
              let activationFailed = false;
              let activationError = '';

              console.log('[loadAndVerifyLicense] p_user_id to send:', savedUserId, 'sessionId:', sessionId, 'isExpired:', isExpired);
              const actRes = await fetch(getApiUrl('/api/rpc/license/insert'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ p_license_id: license.id, p_device_uuid: sessionId, p_device_name: 'Web SaaS', p_user_id: savedUserId, p_is_expired: isExpired })
              });`;

content = content.replace(targetStr, newStr);

const targetStr2 = `                  if (chk2 && chk2.success && chk2.has_session) {
                    // 강탈 후 세션이 존재한다면 정상! (직전 로직에서 획득한 세션 유지)
                  } else {
                    // 2차 확인도 실패했으므로 진짜 제한 사용자
                    isExpired = true;
                    planName = activationError;
                  }
                }
                // activationFailed가 false면 insert 성공이므로 isExpired는 그대로 false 유지!
              }`;

const newStr2 = `                  if (chk2 && chk2.success && chk2.has_session) {
                    // 강탈 후 세션이 존재한다면 정상! (직전 로직에서 획득한 세션 유지)
                  } else {
                    // 2차 확인도 실패했으므로 진짜 제한 사용자
                    isExpired = true;
                    planName = activationError;
                  }
                }
                // activationFailed가 false면 insert 성공이므로 isExpired는 그대로 false 유지!`;

content = content.replace(targetStr2, newStr2);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed MainEditorApp insert call');
