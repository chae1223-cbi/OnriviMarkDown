const fs = require('fs');
const filePath = 'D:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MainEditorApp.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `    // 💻 [Heartbeat 가드] 20초마다 라이선스 세션의 활동 시각(last_active_at)을 갱신하고 강탈 여부를 검사
    useEffect(() => {
      if (typeof window === 'undefined' || !deviceId || isLicenseChecking) return;
      if (licenseStatus.isExpired) return; // 만료된 사용자는 세션 테이블에 없으므로 강탈 체크 불필요
  
      const intervalId = setInterval(async () => {`;

const newStr = `    // 💻 [Heartbeat 가드] 20초마다 라이선스 세션의 활동 시각(last_active_at)을 갱신하고 강탈 여부를 검사
    useEffect(() => {
      if (typeof window === 'undefined' || !deviceId || isLicenseChecking) return;
  
      const intervalId = setInterval(async () => {`;

content = content.replace(targetStr, newStr);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Restored heartbeat for expired users');
