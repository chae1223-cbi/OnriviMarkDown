/**
 * web-build.js
 * 웹(Cloudflare Pages) 배포용 빌드 스크립트입니다.
 * Cloudflare Functions(frontend/functions)가 실제 API를 처리하므로,
 * Functions가 존재하지 않는 Next.js API 라우트(/api/admin, /api/cron)를
 * 빌드 대상에서 제외하여 정적 내보내기(output:export) 시 발생하는
 * NEXT_STATIC_GEN_BAILOUT 에러를 제거합니다.
 *
 * 🚨 @PATCH 2026-08-07: Cloudflare Pages는 wrangler.toml의 functions_directory 필드를
 * 지원하지 않으므로 무시됩니다 (빌드 로그에 WARNING 표시).
 * 대신 레포 루트의 /functions/ 디렉토리를 자동으로 탐지하여 배포합니다.
 * 따라서 frontend/functions/api/admin/ 에 있는 admin API Functions는
 * 빌드 전에 루트 functions/api/admin/ 으로 반드시 동기화되어야 합니다.
 *
 * 동작 순서:
 * 1. frontend/functions/api/admin/ → 루트 functions/api/admin/ 동기화 (신규)
 * 2. 제외 대상 라우트를 임시 이동 (_dev_backup/)
 * 3. next build 실행
 * 4. 임시 이동한 폴더 원위치 복원
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const APP_DIR = path.join(__dirname, 'src', 'app');
const API_DIR = path.join(APP_DIR, 'api');
const BACKUP_DIR = path.join(__dirname, '_dev_api_backup');

// 🚨 @PATCH 2026-08-07: admin Functions를 루트 /functions/api/admin/ 으로 동기화
// Cloudflare Pages는 functions_directory(wrangler.toml) 필드를 무시하고
// 레포 루트의 /functions/ 디렉토리만 Functions로 배포합니다.
// 따라서 admin Functions가 배포에 포함되려면 이 동기화가 필수입니다.
const FRONTEND_FUNCS_SRC = path.join(__dirname, 'functions');
const ROOT_FUNCS_DEST = path.join(__dirname, '..', 'functions');

if (fs.existsSync(FRONTEND_FUNCS_SRC)) {
  console.log('[web-build] Cloudflare Functions 전체를 루트 /functions/ 로 동기화합니다...');
  // 주의: ROOT_FUNCS_DEST 전체를 rmSync하면 기존 Cloudflare API(device, license 등)가 모두 날아가므로 절대 삭제하면 안 됨!
  if (!fs.existsSync(ROOT_FUNCS_DEST)) {
    fs.mkdirSync(ROOT_FUNCS_DEST, { recursive: true });
  }
  fs.cpSync(FRONTEND_FUNCS_SRC, ROOT_FUNCS_DEST, { recursive: true, force: true });
  console.log('  - 동기화 완료: /functions/ (병합 완료)');
}

// Cloudflare Functions가 존재하지 않아 정적 빌드에서 제외해야 하는 라우트들
const DEV_ONLY_ROUTES = [
  { parent: API_DIR, route: 'admin' },
  { parent: API_DIR, route: 'cron' },
  { parent: API_DIR, route: 'faqs' },
  { parent: API_DIR, route: 'plans' },
  { parent: API_DIR, route: 'license' },
  { parent: API_DIR, route: 'knowledge' }
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
