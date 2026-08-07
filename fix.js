const fs = require('fs');
const path = 'frontend/src/components/MainEditorApp.tsx';
let content = fs.readFileSync(path, 'utf8');

const target1 = `    const isRestrictedUser = licenseStatus.isExpired ||
      licenseStatus.planName?.includes('동시 접속 초과') ||
      licenseStatus.planName?.includes('만료') ||
      licenseStatus.planName?.includes('미발급');`;

const repl1 = `    const isRestrictedUser = licenseStatus.isExpired ||
      licenseStatus.isRestricted ||
      licenseStatus.planName?.includes('만료') ||
      licenseStatus.planName?.includes('미발급');`;

content = content.replaceAll(target1, repl1);

const target2 = `            setLicenseStatus(prev => {
              if (!prev.isExpired) {
                showToast("⚠️ 동시 접속 한도를 초과하여 본 세션은 제한 모드(읽기 전용)로 동작합니다.", "warning");
              }
              return {
                ...prev,
                isActivated: false,
                isExpired: true,
                planName: \`동시 접속 초과 (\${chk.max_devices || '?'}대) - 제한 사용자\`
              };
            });`;

const repl2 = `            setLicenseStatus(prev => {
              if (!prev.isExpired) {
                showToast("⚠️ 동시 접속 한도를 초과하여 본 세션은 제한 모드(읽기 전용)로 동작합니다.", "warning");
              }
              return {
                ...prev,
                isActivated: false,
                isExpired: true,
                isRestricted: true
              };
            });`;

content = content.replaceAll(target2, repl2);

fs.writeFileSync(path, content, 'utf8');
console.log('done');
