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

const APP_DIR = path.join(__dirname, 'src', 'app');
const API_DIR = path.join(APP_DIR, 'api');
const BACKUP_DIR = path.join(__dirname, '_dev_api_backup');

// 임시 이동 대상 라우트들 정의
const DEV_ONLY_ROUTES = [
  { parent: APP_DIR, route: 'admin' },
  { parent: APP_DIR, route: 'api' },
  { parent: APP_DIR, route: 'auth' },
  { parent: APP_DIR, route: 'contact' },
  { parent: APP_DIR, route: 'dashboard' },
  { parent: APP_DIR, route: 'docs' },
  { parent: APP_DIR, route: 'forgot-password' },
  { parent: APP_DIR, route: 'login' },
  { parent: APP_DIR, route: 'privacy' },
  { parent: APP_DIR, route: 'reset-password' },
  { parent: APP_DIR, route: 'signup' },
  { parent: APP_DIR, route: 'terms' },
  { parent: APP_DIR, route: 'test' },
  { parent: APP_DIR, route: 'sitemap.ts' }
];

// 1. 개발 전용 API 라우트 및 SaaS 라우트들을 백업 폴더로 복사 후 원본 삭제
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

console.log('[desktop-build] 데스크톱 컴파일 비대상 웹 라우트들을 임시 백업 및 제외합니다...');
for (const item of DEV_ONLY_ROUTES) {
  const src = path.join(item.parent, item.route);
  const dest = path.join(BACKUP_DIR, item.route);
  if (fs.existsSync(src)) {
    // 윈도우 파일잠금(EPERM) 우회를 위해 rename 대신 cpSync -> rmSync 적용
    fs.cpSync(src, dest, { recursive: true });
    fs.rmSync(src, { recursive: true, force: true });
    console.log(`  - 백업 완료: ${item.route}`);
  }
}

// 2. Next.js 빌드 실행
let buildSuccess = false;
try {
  console.log('[desktop-build] next build 시작...');
  execSync('npx next build', { stdio: 'inherit', env: { ...process.env, ASSET_PREFIX: './', NEXT_BUILD_TARGET: 'desktop' } });
  buildSuccess = true;
} catch (err) {
  console.error('[desktop-build] 빌드 실패:', err.message);
} finally {
  // 3. 백업 폴더에서 원위치 복원 (빌드 성공/실패 상관없이 항상 복원)
  console.log('[desktop-build] 제외된 라우트들을 원본 위치로 복원합니다...');
  for (const item of DEV_ONLY_ROUTES) {
    const src = path.join(BACKUP_DIR, item.route);
    const dest = path.join(item.parent, item.route);
    if (fs.existsSync(src)) {
      // 복원 시에도 기존 찌꺼기 제거 후 cpSync
      if (fs.existsSync(dest)) {
        fs.rmSync(dest, { recursive: true, force: true });
      }
      fs.cpSync(src, dest, { recursive: true });
      console.log(`  - 복원 완료: ${item.route}`);
    }
  }
  // 백업 디렉토리 정리
  if (fs.existsSync(BACKUP_DIR)) {
    fs.rmSync(BACKUP_DIR, { recursive: true, force: true });
  }
}

if (!buildSuccess) process.exit(1);
