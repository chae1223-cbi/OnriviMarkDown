const fs = require('fs');
const path = require('path');
const os = require('os');

// In development, Electron uses 'Electron'. In production, 'onrivi-author'.
const appNames = ['Electron', 'onrivi-author'];
const appDataDir = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Application Support' : process.env.HOME + '/.config');

let deletedCount = 0;

appNames.forEach(appName => {
  const userDataPath = path.join(appDataDir, appName);
  const filesToDelete = ['license.json', '.license'];
  
  filesToDelete.forEach(file => {
    const targetPath = path.join(userDataPath, file);
    if (fs.existsSync(targetPath)) {
      try {
        fs.unlinkSync(targetPath);
        console.log(`✅ 삭제 완료: ${targetPath}`);
        deletedCount++;
      } catch (err) {
        console.error(`❌ 삭제 실패: ${targetPath}`, err.message);
      }
    }
  });
});

if (deletedCount === 0) {
  console.log('ℹ️ 삭제할 라이선스 파일이 없습니다.');
} else {
  console.log(`🎉 총 ${deletedCount}개의 라이선스 파일이 초기화되었습니다.`);
}
