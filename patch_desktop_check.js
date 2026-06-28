const fs = require('fs');
let content = fs.readFileSync('frontend/src/components/MainEditorApp.tsx', 'utf8');

const regex = /let expiryMs = 0;\s*if\s*\(sub\)\s*\{\s*const targetDate = sub\.current_period_end \|\| sub\.trial_end_at;\s*if\s*\(targetDate\)\s*expiryMs = new Date\(targetDate\)\.getTime\(\);\s*\}/;

const replaceStr = `              let expiryMs = 0;
              if (sub) {
                if (sub.plan_name && sub.plan_name.includes('데스크탑')) {
                  console.warn('[loadAndVerifyLicense] Desktop plan cannot be used in Web SaaS.');
                  setLicenseStatus({
                    isActivated: false, isExpired: true, remainingDays: 0, userId: savedUserId,
                    licenseKey: '', paymentNo: savedPaymentNo || license?.payment_no || '',
                    planName: '데스크탑 전용 플랜 (웹 사용 불가)', nextPaymentDate: ''
                  });
                  return;
                }
                const targetDate = sub.current_period_end || sub.trial_end_at;
                if (targetDate) expiryMs = new Date(targetDate).getTime();
              }`;

content = content.replace(regex, replaceStr);

fs.writeFileSync('frontend/src/components/MainEditorApp.tsx', content);
console.log('Patch applied.');
