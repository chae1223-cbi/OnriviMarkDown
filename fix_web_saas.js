const fs = require('fs');
const file = 'frontend/src/components/MainEditorApp.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = \const { data: sub } = await supabase
              .from('subscriptions')
              .select('plan_name, plan_status, trial_end_at, current_period_end, max_devices')
              .eq('id', lic.subscription_id)
              .maybeSingle();\;
              
const replacement = \const { data: sub } = await supabase
              .from('subscriptions')
              .select('plan_name, plan_status, trial_end_at, current_period_end, max_devices')
              .eq('id', lic.subscription_id)
              .maybeSingle();

            // Web SaaS에서는 데스크탑 전용 요금제 사용 불가
            if (sub?.plan_name?.includes('데스크탑')) {
              console.warn('[loadAndVerifyLicense] Desktop plan cannot be used in Web SaaS.');
              setLicenseStatus({
                isActivated: false, isExpired: true, remainingDays: 0, userId: savedUserId,
                licenseKey: '', paymentNo: savedPaymentNo || license.payment_no || '',
                planName: '데스크탑 전용 라이선스', nextPaymentDate: ''
              });
              return;
            }\;

content = content.replace(targetStr, replacement);
fs.writeFileSync(file, content, 'utf8');
console.log('MainEditorApp updated for Web SaaS restrictions.');
