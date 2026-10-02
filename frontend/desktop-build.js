/**
 * desktop-build.js
 * 데스크탑(Electron) 빌드 시 개발 전용 Next.js API 라우트를 빌드 대상에서 제외합니다.
 * 
 * 동작 순서:
 * 1. 웹 전용 라우트 임시 이동 (_dev_backup/)
 * 2. next build 실행
 * 3. 임시 이동한 폴더 원위치 복원
 * 
 * 🚨 @PATCH : **2026-10-02** — [빌드 산출물 자동 소탕(Purge) 탑재]: out 디렉터리 내 잔여 소스맵(.map), 테스트 파일, 임시/더미 에셋 자동 소탕 추가
 * 🚨 @PATCH : **2026-09-30** — [데스크톱 정적 빌드 안정화] Next.js 14 정적 내보내기(export) 워커 간 manifest 탐색 불일치(PageNotFoundError: /)를 유발하던 NEXT_BUILD_DIR 분리를 걷어내고 기본 .next 단일 빌드로 정상 복원
 * 🚨 @PATCH : **2026-09-26** — [데스크톱 빌드 캐시 자동 정리] .next 빌드 캐시 선행 삭제 로직 추가로 청크 불일치 오류 방지
 * 🚨 @PATCH : **2026-09-26** — [데스크톱 빌드 격리] DEV_ONLY_ROUTES에 /blog 라우트 추가하여 데스크톱 번들 빌드 안정화
 * 🚨 @PATCH : **2026-09-23** — [데스크톱 빌드 실패 해결] DEV_ONLY_ROUTES에 /knowledge 웹 리다이렉트 라우트 추가 및 빌드 후 public/icons 정적 에셋 동기화 보강
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
  { parent: APP_DIR, route: 'blog' },
  { parent: APP_DIR, route: 'contact' },
  { parent: APP_DIR, route: 'dashboard' },
  { parent: APP_DIR, route: 'docs' },
  { parent: APP_DIR, route: 'forgot-password' },
  { parent: APP_DIR, route: 'knowledge' },
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
  const nextCacheDir = path.join(__dirname, '.next');
  if (fs.existsSync(nextCacheDir)) {
    fs.rmSync(nextCacheDir, { recursive: true, force: true });
  }
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

if (buildSuccess) {
  try {
    const publicIconsDir = path.join(__dirname, 'public', 'icons');
    const outIconsDir = path.join(__dirname, 'out', 'icons');
    if (fs.existsSync(publicIconsDir) && fs.existsSync(path.join(__dirname, 'out'))) {
      if (!fs.existsSync(outIconsDir)) {
        fs.mkdirSync(outIconsDir, { recursive: true });
      }
      fs.cpSync(publicIconsDir, outIconsDir, { recursive: true });
      console.log('[desktop-build] public/icons -> out/icons 동기화 완료');
    }
  } catch (copyErr) {
    console.warn('[desktop-build] out/icons 동기화 경고:', copyErr.message);
  }

  // 🛡️ [용량 최적화 및 보안] out 디렉터리 내 불필요한 .map, 테스트 파일, 임시 에셋 자동 소탕
  try {
    const outDir = path.join(__dirname, 'out');
    if (fs.existsSync(outDir)) {
      function purgeFiles(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            purgeFiles(fullPath);
          } else {
            const nameLower = entry.name.toLowerCase();
            if (
              nameLower.endsWith('.map') ||
              nameLower.startsWith('users_image_') ||
              nameLower.includes('.test.') ||
              nameLower.includes('.spec.')
            ) {
              fs.rmSync(fullPath, { force: true });
            }
          }
        }
      }
      purgeFiles(outDir);
      console.log('[desktop-build] out 디렉터리 내 소스맵(.map) 및 테스트/더미 에셋 자동 소탕 완료');
    }
  } catch (purgeErr) {
    console.warn('[desktop-build] out 디렉터리 소탕 경고:', purgeErr.message);
  }
}

if (!buildSuccess) process.exit(1);
