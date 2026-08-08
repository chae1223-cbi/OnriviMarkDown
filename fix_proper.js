const fs = require('fs');
const filePath = 'D:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MainEditorApp.tsx';
let lines = fs.readFileSync(filePath, 'utf8').split('\\n');

const replacement = \`            let activationFailed = false;
            let activationError = '';

            console.log('[loadAndVerifyLicense] p_user_id to send:', savedUserId, 'sessionId:', sessionId, 'isExpired:', isExpired);
            const actRes = await fetch(getApiUrl('/api/rpc/license/insert'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ p_license_id: license.id, p_device_uuid: sessionId, p_device_name: 'Web SaaS', p_user_id: savedUserId, p_is_expired: isExpired })
            });
            const actResult = actRes.ok ? await actRes.json() : null;
            const actErr = !actRes.ok ? new Error('서버 오류') : null;
            
            if (actErr || (actResult && !actResult.success)) {
              activationFailed = true;
              activationError = (actResult?.code === 'ERR_MAX_DEVICES_EXCEEDED' || actResult?.code === 'EXCEED_MAX_DEVICES')
                ? \\\`동시 접속 초과 (\${actResult?.max_devices || '?'}대) - 제한 사용자\\\` 
                : \\\`라이선스 오류: \${actResult?.message || actErr?.message || '알 수 없는 오류'}\\\`;
            }

            if (activationFailed) {
              // insert 실패 시, 혹시 이미 유효한 세션이 존재하는지 2차 확인
              const chk2Res = await fetch(getApiUrl('/api/license/check-session'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ p_payment_no: savedPaymentNo, p_device_uuid: sessionId })
              });
              const chk2 = chk2Res.ok ? await chk2Res.json() : null;
              
              if (chk2 && chk2.success && chk2.has_session) {
                // 이미 내 세션이 존재하므로 정상! (이전 탭 등에서 획득한 세션 유지)
              } else {
                // 2차 확인도 실패했으면 진짜 제한 사용자
                isExpired = true;
                planName = activationError;
              }
            }
            // activationFailed가 false면 insert 성공이므로 isExpired는 그대로 false 유지!\`;

// line 1214 is index 1213
lines.splice(1213, (1252 - 1214 + 1), replacement);

fs.writeFileSync(filePath, lines.join('\\n'), 'utf8');
console.log('Fixed by line number');
