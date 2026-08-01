/**
 * web-build.js
 * 웹(Cloudflare Pages) 배포용 빌드 스크립트입니다.
 * Cloudflare Functions(frontend/functions)가 실제 API를 처리하므로,
 * Functions가 존재하지 않는 Next.js API 라우트(/api/admin, /api/cron)를
 * 빌드 대상에서 제외하여 정적 내보내기(output:export) 시 발생하는
 * NEXT_STATIC_GEN_BAILOUT 에러를 제거합니다.
 *
 * 동작 순서:
 * 1. 제외 대상 라우트를 임시 이동 (_dev_backup/)
 * 2. next build 실행
 * 3. 임시 이동한 폴더 원위치 복원
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const APP_DIR = path.join(__dirname, 'src', 'app');
const API_DIR = path.join(APP_DIR, 'api');
const BACKUP_DIR = path.join(__dirname, '_dev_api_backup');

// Cloudflare Functions가 존재하지 않아 정적 빌드에서 제외해야 하는 라우트들
const DEV_ONLY_ROUTES = [
  { parent: API_DIR, route: 'admin' },
  { parent: API_DIR, route: 'cron' }
];

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

console.log('[web-build] 정적 빌드 비대상 API 라우트들을 임시 백업 및 제외합니다...');
for (const item of DEV_ONLY_ROUTES) {
  const src = path.join(item.parent, item.route);
  const dest = path.join(BACKUP_DIR, item.route);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
    fs.rmSync(src, { recursive: true, force: true });
    console.log(`  - 백업 완료: ${item.route}`);
  }
}

let buildSuccess = false;
try {
  console.log('[web-build] next build 시작...');
  execSync('npx next build', { stdio: 'inherit', env: { ...process.env, ASSET_PREFIX: '' } });
  buildSuccess = true;
} catch (err) {
  console.error('[web-build] 빌드 실패:', err.message);
} finally {
  console.log('[web-build] 제외된 라우트들을 원본 위치로 복원합니다...');
  for (const item of DEV_ONLY_ROUTES) {
    const src = path.join(BACKUP_DIR, item.route);
    const dest = path.join(item.parent, item.route);
    if (fs.existsSync(src)) {
      if (fs.existsSync(dest)) {
        fs.rmSync(dest, { recursive: true, force: true });
      }
      fs.cpSync(src, dest, { recursive: true });
      console.log(`  - 복원 완료: ${item.route}`);
    }
  }
  if (fs.existsSync(BACKUP_DIR)) {
    fs.rmSync(BACKUP_DIR, { recursive: true, force: true });
  }
}

if (!buildSuccess) process.exit(1);
