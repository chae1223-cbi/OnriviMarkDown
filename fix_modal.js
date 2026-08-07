const fs = require('fs');
const path = 'frontend/src/components/LicenseModal.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `<h2 className="font-['Inter'] text-[18px] leading-[1.8] tracking-[-0.01em] font-semibold text-error mb-2">체험 기간이 만료되었습니다. 에디터 잠금 해제를 위해 라이선스를 연동해 주세요.</h2>`;

const repl = `<h2 className="font-['Inter'] text-[18px] leading-[1.8] tracking-[-0.01em] font-semibold text-error mb-2">
                  {licenseStatus.isRestricted 
                    ? "동시 접속 한도를 초과하여 제한 모드로 동작 중입니다. 다른 기기에서 로그아웃하거나 요금제를 업그레이드 해주세요." 
                    : "체험 기간이 만료되었습니다. 에디터 잠금 해제를 위해 라이선스를 연동해 주세요."}
                </h2>`;

content = content.replace(target, repl);

fs.writeFileSync(path, content, 'utf8');
console.log('done');
