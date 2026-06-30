/**
 * desktop-build.js
 * 데스크탑(Electron) 빌드 시 개발 전용 Next.js API 라우트를 빌드 대상에서 제외합니다.
 * 
 * 동작 순서:
 * 1. /api/view, /api/upload-pasted-image 폴더를 임시 이동 (_dev_backup/)
 * 2. next build 실행
 * 3. 임시 이동한 폴더 원위치 복원
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const API_DIR = path.join(__dirname, 'src', 'app', 'api');
const BACKUP_DIR = path.join(__dirname, '_dev_api_backup');

const DEV_ONLY_ROUTES = ['view', 'upload-pasted-image'];

// 1. 개발 전용 API 라우트를 백업 폴더로 이동
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

console.log('[desktop-build] 개발 전용 API 라우트를 임시 제외합니다...');
for (const route of DEV_ONLY_ROUTES) {
  const src = path.join(API_DIR, route);
  const dest = path.join(BACKUP_DIR, route);
  if (fs.existsSync(src)) {
    fs.renameSync(src, dest);
    console.log(`  - ${route} → _dev_api_backup/${route}`);
  }
}

// 2. Next.js 빌드 실행
let buildSuccess = false;
try {
  console.log('[desktop-build] next build 시작...');
  execSync('npx next build', { stdio: 'inherit' });
  buildSuccess = true;
} catch (err) {
  console.error('[desktop-build] 빌드 실패:', err.message);
} finally {
  // 3. 백업 폴더에서 원위치 복원 (빌드 성공/실패 상관없이 항상 복원)
  console.log('[desktop-build] 개발 전용 API 라우트를 복원합니다...');
  for (const route of DEV_ONLY_ROUTES) {
    const src = path.join(BACKUP_DIR, route);
    const dest = path.join(API_DIR, route);
    if (fs.existsSync(src)) {
      fs.renameSync(src, dest);
      console.log(`  - _dev_api_backup/${route} → ${route}`);
    }
  }
  // 백업 디렉토리 정리
  if (fs.existsSync(BACKUP_DIR)) {
    fs.rmdirSync(BACKUP_DIR, { recursive: true });
  }
}

if (!buildSuccess) process.exit(1);
