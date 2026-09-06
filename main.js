// ====================================================================
// 📊 [OMD-MAIN-main-0001] main.js ➔ CSP_connect_src_fix
// 🎯 @KICK  : CSP connect-src 지침에 http: https: 추가하여 외부 이미지/폰트 fetch 차단 해결
// 🛡️ @GUARD : Monaco editor 등 기존 설정 유지
// 🚨 @PATCH : **2026-09-06** — [데스크톱 지식 베이스 SQLite 로컬 라우팅 탑재] 데스크톱 앱 내 /api/knowledge/* 요청이 외부 실서버(onrivi.com)로 프록시되어 405/404 발생 및 데이터가 누락되던 문제를 해결하기 위해, Electron 메인 프로세스에서 app:// 프로토콜 핸들러 내에 로컬 SQLite DB({resourceFolder}/db/onrivi_knowledge.db) 직접 라우팅 엔진(handleDesktopKnowledgeApi)을 구현하여 탐색기 📗 뱃지, 지식 허브 대시보드(KUI-001), 큐/컬렉션 통계 및 상세 조회가 100% 로컬 독립 동작하도록 개편 | **2026-09-05** — 데스크톱 앱 내비게이션/새창 분기 가드 보강: SaaS 웹 전용 경로(/login, /dashboard, /signup, /pricing 등) 진입 시 Electron 윈도우 내부 로드 차단 및 외부 기본 브라우저 강제 오픈 처리, app:// 커스텀 프로토콜 핸들러 내 /login 및 /dashboard 방어 라우트 추가로 404 에러 원천 차단 | **2026-08-26** — 소스맵(.js.map) 등 없는 정적 자산 파일 요청 시 ENOENT 콘솔 트레이스 에러 노이즈를 방지하기 위해, app 프로토콜 핸들러 내에 fs.existsSync 예외 가드 추가 및 404 리턴 처리 | **2026-06-28** — 데스크톱 앱 내에서 에디터 외 일반 웹 경로(대시보드, 랜딩 등) 클릭 시 기존 에디터 화면을 덮어쓰지 않고 기본 웹 브라우저 새창으로 띄워 안전하게 분리하도록 내비게이션 라우팅 제어 패치; 데스크톱 패키징/실행 시 실서버 대신 100% 로컬 독립 서빙을 실현하기 위해 `file://` 프로토콜 기반의 빌드 아웃풋 파일(`frontend/out/editor.html`)을 불러오도록 로드 방식을 변경하는 패치; Monaco Editor 로더 CDN CSP 차단 문제 해결; Next.js 정적 빌드 시 `public/` 폴더 내용이 `out/` 폴더로 자동 복사되는 구조를 반영하여 `file:readFromPath` 핸들러 탐색 경로에 `frontend/out`을 최우선으로 추가 — 이로써 설치판에서 도움말(`help/00_시작하기.md`) 파일을 정상적으로 읽어오지 못하던 버그 수정
//             **2026-06-19** — PNG 및 EPUB 내보내기 시 외부 이미지/웹폰트 fetch CSP 차단 버그를 해결하기 위해 connect-src에 http: https: 추가 허용; Node.js net 모듈과 Electron net 모듈 충돌로 인한 net.fetch TypeError 해결 | **2026-06-20** — 딥링크(onriviauthor://activate) 파라미터 파싱 로직 보완하여 licenseKey와 paymentNo를 함께 추출 및 license.json 저장
// 🔗 @CALLS : loadURL, onrivi.com
// ====================================================================
const { app, BrowserWindow, session, ipcMain, dialog, protocol, net, screen } = require('electron');
const path = require('path');
const chokidar = require('chokidar');

const fs = require('fs');
const nodeNet = require('net'); // 빈 포트를 찾기 위한 네이티브 모듈 추가

// 🌐 [ 프로토콜 Privilege 등록 - app.ready 이전에 호출되어야 함 ]
protocol.registerSchemesAsPrivileged([
  { scheme: 'media', privileges: { standard: true, bypassCSP: true, secure: true, supportFetchAPI: true, corsEnabled: true } },
  { scheme: 'media-local', privileges: { standard: true, bypassCSP: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } },
  // 앱 문서는 CSP가 실제로 적용되어야 하므로 bypassCSP를 사용하지 않습니다.
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } }
]);


// 앱 이름 및 Taskbar 그룹 아이디 설정 (우클릭 메뉴 및 알림 이름 변경)
app.name = "Onrivi Author";
if (process.platform === 'win32') {
  app.setAppUserModelId("com.onrivi.author");
}

// 백엔드 구동 플래그 설정
process.env.IS_ELECTRON = 'true';
if (app.isPackaged) {
  process.env.NODE_ENV = 'production';
}

let mainWindow;
let activePort = 4000; // 기본 백엔드 포트
let filePathToOpen = null; // 윈도우 파일 연결(더블클릭)로 전달된 .md 경로 임시 저장

// 🔒 [ 중복 실행 방지 (Single Instance Lock) 설정 ]
const gotTheLock = app.requestSingleInstanceLock();

// 💡 onriviauthor:// 커스텀 프로토콜 등록 (윈도우 파일 연결 + URL 프로토콜)
if (process.platform === 'win32') {
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient('onriviauthor', process.execPath, [path.resolve(process.argv[1])]);
    }
  } else {
    app.setAsDefaultProtocolClient('onriviauthor');
  }
}

if (!gotTheLock) {
  // 이미 실행 중인 앱이 있으면 이 실행 프로세스를 즉각 폭파 종료
  app.quit();
} else {
  // 사용자가 이미 앱이 켜진 상태에서 또 exe를 더블 클릭하면 기존 창을 포커싱 + 파일 연결 경로 전달
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();

      // 1. commandLine에서 .md 파일 경로 추출하여 프론트엔드로 전달
      const fileArg = commandLine.find(arg => {
        const lower = arg.toLowerCase();
        return lower.endsWith('.md') || lower.endsWith('.markdown');
      });
      if (fileArg && fs.existsSync(fileArg)) {
        mainWindow.webContents.send('open-external-md', fileArg);
        return;
      }
      // 2. onriviauthor:// 프로토콜 URL 처리
      const protocolArg = commandLine.find(arg =>
        arg.toLowerCase().startsWith('onriviauthor://')
      );
      if (protocolArg) {
        try {
          const url = new URL(protocolArg);
          if (url.host === 'activate') {
            const verifyKey = url.searchParams.get('key');
            const userId = url.searchParams.get('user');
            const licenseKey = url.searchParams.get('licenseKey');
            const paymentNo = url.searchParams.get('paymentNo');
            if (verifyKey) {
              const userDataPath = app.getPath('userData');
              const licenseJsonPath = path.join(userDataPath, 'license.json');
              let existingData = {};
              try {
                if (fs.existsSync(licenseJsonPath)) {
                  existingData = JSON.parse(fs.readFileSync(licenseJsonPath, 'utf-8'));
                }
              } catch {}
              
              const updatedData = {
                ...existingData,
                verifyKey,
                userId: userId || existingData.userId || '',
                licenseKey: licenseKey || existingData.licenseKey || '',
                paymentNo: paymentNo || existingData.paymentNo || ''
              };
              fs.writeFileSync(licenseJsonPath, JSON.stringify(updatedData, null, 2), 'utf-8');
              
              // 렌더러 프로세스에 이벤트 전송
              mainWindow.webContents.send('license-activated', updatedData);
            }
          } else {
            const filePath = url.searchParams.get('path') || decodeURIComponent(url.pathname.replace(/^\//, ''));
            if (filePath && fs.existsSync(filePath)) {
              mainWindow.webContents.send('open-external-md', filePath);
            }
          }
        } catch {}
      }
    }
  });
}

// macOS: 파일을 앱 아이콘에 드래그&드롭하거나 더블클릭
app.on('open-file', (event, path) => {
  event.preventDefault();
  if (mainWindow && (path.toLowerCase().endsWith('.md') || path.toLowerCase().endsWith('.markdown'))) {
    mainWindow.webContents.send('open-external-md', path);
  }
});

// 포트 충돌을 막기 위한 동적 포트 탐색 헬퍼 (의존성 없음, 100% 안전)
function getFreePort(startPort = 4000) {
  return new Promise((resolve) => {
    const server = nodeNet.createServer();
    server.listen(startPort, () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
    server.on('error', () => {
      resolve(getFreePort(startPort + 1));
    });
  });
}

// 최초 실행 시 커맨드라인 인수에 .md 파일 또는 onriviauthor:// 프로토콜 URL이 있는지 검사
function checkFileArgument() {
  const fileArg = process.argv.find(arg => {
    const lower = arg.toLowerCase();
    return lower.endsWith('.md') || lower.endsWith('.markdown');
  });
  if (fileArg && fs.existsSync(fileArg)) {
    filePathToOpen = fileArg;
    return;
  }
  const protocolArg = process.argv.find(arg =>
    arg.toLowerCase().startsWith('onriviauthor://')
  );
  if (protocolArg) {
    try {
      const url = new URL(protocolArg);
      if (url.host === 'activate') {
        const verifyKey = url.searchParams.get('key');
        const userId = url.searchParams.get('user');
        const licenseKey = url.searchParams.get('licenseKey');
        const paymentNo = url.searchParams.get('paymentNo');
        if (verifyKey) {
          const userDataPath = app.getPath('userData');
          const licenseJsonPath = path.join(userDataPath, 'license.json');
          let existingData = {};
          try {
            if (fs.existsSync(licenseJsonPath)) {
              existingData = JSON.parse(fs.readFileSync(licenseJsonPath, 'utf-8'));
            }
          } catch {}
          
          const updatedData = {
            ...existingData,
            verifyKey,
            userId: userId || existingData.userId || '',
            licenseKey: licenseKey || existingData.licenseKey || '',
            paymentNo: paymentNo || existingData.paymentNo || ''
          };
          fs.writeFileSync(licenseJsonPath, JSON.stringify(updatedData, null, 2), 'utf-8');
        }
      } else {
        filePathToOpen = url.searchParams.get('path') || decodeURIComponent(url.pathname.replace(/^\//, ''));
      }
    } catch {}
  }
}

function createWindow(port) {
  // 🧹 [ 일렉트론 Chromium 캐시 강제 소탕 (로컬 스토리지는 유지) ]
  try {
    session.defaultSession.clearCache().catch(() => {});
  } catch (e) {
    console.error("캐시 소탕 오류:", e.message);
  }

  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: Math.min(1400, screenWidth),
    height: Math.min(900, screenHeight),
    title: "온리비 어서",
    icon: path.join(__dirname, 'frontend/public/icon_onriveauther.png'),
       webPreferences: {
         nodeIntegration: false,
         contextIsolation: true,
         preload: path.join(__dirname, 'preload.js'),
         // renderer의 교차 출처 보호를 유지합니다. 로컬 미디어는 등록된 media
         // 프로토콜을 통해 제공하므로 webSecurity를 끌 필요가 없습니다.
         webSecurity: true,
         allowRunningInsecureContent: false,
       },
    // Windows 11 스타일의 깔끔한 프레임 디자인
    titleBarStyle: 'default',
    autoHideMenuBar: true, // 메뉴 바 자동 숨김으로 몰입도 극대화
  });

  // 🌐 [ 외부 링크 및 일반 웹 페이지 클릭 시 기본 웹 브라우저 새창으로 오픈하는 설정 ]
  // 1) target="_blank" 등으로 새 창을 띄우려는 시도를 가로채 시스템 브라우저/플레이어로 실행
  const isInternalUrl = (urlStr) => {
    try {
      const parsed = new URL(urlStr);
      const pathname = parsed.pathname.toLowerCase();
      // login, dashboard, signup, pricing, forgot-password 등 SaaS 웹 전용 경로는 일렉트론 내부 서빙 대상이 아님
      if (pathname.includes('/login') || pathname.includes('/dashboard') || pathname.includes('/signup') || pathname.includes('/pricing') || pathname.includes('/forgot-password') || pathname.includes('/reset-password')) {
        return false;
      }
      return urlStr.startsWith('file://') || 
             urlStr.startsWith('app://') || 
             pathname.includes('/editor') || 
             pathname.includes('/auth/callback');
    } catch {
      return false;
    }
  };

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    const { shell } = require('electron');

    if (url.startsWith('media://local/serve')) {
      const parsedUrl = new URL(url);
      const filePath = parsedUrl.searchParams.get('url');
      if (filePath) {
        shell.openPath(decodeURIComponent(filePath));
      }
      return { action: 'deny' };
    }

    const isInternal = isInternalUrl(url);
    if (!isInternal) {
      if (url.startsWith('app://')) {
        const parsed = new URL(url);
        shell.openExternal(`https://onrivi.com${parsed.pathname}${parsed.search}`);
      } else if (url.startsWith('http:') || url.startsWith('https:')) {
        shell.openExternal(url);
      }
    }
    return { action: 'deny' }; // 일렉트론 내부에서 새 창이 뜨는 것은 원천 차단
  });

  // 2) 내비게이션 인터셉터: 대시보드, 랜딩, 로그인 등 에디터 외 경로 클릭 시 외부 웹 브라우저 새창으로 강제 튕김 우회
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const isInternal = isInternalUrl(url);

    if (isInternal) {
      return; // 내부 서빙 허용
    }
    
    // 에디터 화면 외(로그인, 대시보드, 랜딩, 요금제 등)의 웹 주소로의 창 이동은 가로채 시스템 기본 브라우저로 띄웁니다.
    event.preventDefault();
    const { shell } = require('electron');
    if (url.startsWith('app://')) {
      const parsed = new URL(url);
      shell.openExternal(`https://onrivi.com${parsed.pathname}${parsed.search}`);
    } else if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
    }
  });

  // 🛡️ [ Content-Security-Policy 설정 ]
  // Monaco Editor가 eval()과 blob: 워커를 사용하므로 필요한 권한만 허용
  const cspDirectives = [
    "default-src 'self' app:",
    // Monaco와 Mermaid는 로컬 정적 스크립트 태그로 로드합니다. unsafe-eval을
    // 허용하지 않아 Electron의 CSP 보안 경고와 임의 코드 실행 위험을 제거합니다.
    "script-src 'self' app: 'unsafe-inline' https://maps.gstatic.com https://maps.googleapis.com https://cdn.jsdelivr.net",
    "worker-src 'self' app: blob:",
    "style-src 'self' app: 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
    "img-src 'self' app: data: blob: http: https: file: media:",
    "font-src 'self' app: data: https://fonts.gstatic.com https://cdn.jsdelivr.net",
    "connect-src 'self' app: ws: wss: https://*.supabase.co wss://*.supabase.co https://api.openai.com https://api.anthropic.com https://generativelanguage.googleapis.com http://localhost:11434 https://onrivi.com https://cdn.jsdelivr.net https://maps.googleapis.com",
    "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://maps.google.com https://www.google.com",
    "media-src 'self' app: media: https:"
  ];
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [cspDirectives.join('; ')]
      }
    });
  });

  // 프로덕션 빌드(패키징 완료)이거나 NO_SERVER 환경변수가 활성화된 경우 로컬 빌드 정적 HTML 로드
  if (app.isPackaged || process.env.NO_SERVER === 'true') {
    // Next.js App Router 정적 빌드는 file:// 프로토콜에서 동적 chunk 로드에 404를 발생시키므로 app:// 커스텀 프로토콜을 사용합니다.
    mainWindow.loadURL('app://-/editor.html?env=desktop');
  } else {
    mainWindow.loadURL('http://localhost:3100/editor?env=desktop');
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// ====================================================================
// 🧠 [OMD-MAIN-knowledge-0001] 데스크톱 전용 지식 베이스 SQLite 엔진 및 로컬 API 핸들러
// 🎯 @KICK  : 데스크톱 환경에서 /api/knowledge/* 호출 시 외부 실서버 대신 로컬 리소스 폴더({resourceFolder}/db/onrivi_knowledge.db)를 직접 조회/갱신
// 🛡️ @GUARD : Rule 1(문서/주석 동기화), Rule 2(코드값 대문자 통일), Rule 7(SQLite 트랜잭션 무결성), 동적 리소스 폴더(하드코딩 금지)
// ====================================================================

function resolveSafeResourceFolder(folder) {
  if (!folder || !folder.trim()) return null;
  const clean = folder.trim();
  if (path.isAbsolute(clean)) return clean;
  const cwd = process.cwd();
  const rootDrive = (cwd && path.parse(cwd).root) || 'C:\\';
  return path.join(rootDrive, clean);
}

function getKnowledgeDbPath(resourceFolder) {
  const safe = resolveSafeResourceFolder(resourceFolder);
  if (!safe) return null;
  return path.join(safe, 'db', 'onrivi_knowledge.db');
}

function applyDesktopKnowledgeSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS knowledge_collections (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      color TEXT DEFAULT '#06C755',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS knowledge_documents (
      id TEXT PRIMARY KEY,
      collection_id TEXT,
      file_path TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      file_hash TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      modified_at TEXT NOT NULL,
      summary TEXT,
      key_points TEXT,
      document_type TEXT DEFAULT 'other',
      priority INTEGER NOT NULL DEFAULT 3 CHECK(priority BETWEEN 1 AND 5),
      status TEXT NOT NULL CHECK(status IN ('REGISTERED', 'INDEXING', 'READY', 'OUTDATED', 'DISABLED', 'ERROR')),
      error_message TEXT,
      analysis_version INTEGER NOT NULL DEFAULT 1,
      analyzer_model TEXT,
      analyzed_at TEXT,
      indexed_at TEXT,
      FOREIGN KEY(collection_id) REFERENCES knowledge_collections(id) ON DELETE SET NULL
    );
    CREATE TABLE IF NOT EXISTS document_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id TEXT NOT NULL,
      tag_name TEXT NOT NULL,
      score INTEGER NOT NULL CHECK(score BETWEEN 0 AND 100),
      source TEXT DEFAULT 'AI',
      FOREIGN KEY(document_id) REFERENCES knowledge_documents(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_tags_doc ON document_tags(document_id);
    CREATE INDEX IF NOT EXISTS idx_tags_name_score ON document_tags(tag_name, score DESC);
    CREATE TABLE IF NOT EXISTS document_chunks (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL,
      chunk_index INTEGER NOT NULL,
      heading_title TEXT,
      heading_level INTEGER,
      heading_path TEXT,
      start_line INTEGER NOT NULL,
      end_line INTEGER NOT NULL,
      chunk_summary TEXT,
      keywords TEXT,
      FOREIGN KEY(document_id) REFERENCES knowledge_documents(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_chunks_doc ON document_chunks(document_id);
    CREATE VIRTUAL TABLE IF NOT EXISTS document_chunks_fts USING fts5(
      chunk_id UNINDEXED,
      document_id UNINDEXED,
      heading_title,
      keywords,
      chunk_text
    );
    CREATE TABLE IF NOT EXISTS knowledge_jobs (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL,
      file_path TEXT NOT NULL,
      title TEXT,
      job_type TEXT NOT NULL CHECK(job_type IN ('INDEX', 'REINDEX', 'DELETE')),
      target_hash TEXT NOT NULL,
      priority INTEGER NOT NULL DEFAULT 3 CHECK(priority BETWEEN 1 AND 5),
      status TEXT NOT NULL CHECK(status IN ('QUEUED', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED')),
      current_step TEXT DEFAULT 'QUEUED',
      retry_count INTEGER DEFAULT 0,
      max_retries INTEGER DEFAULT 3,
      retry_after TEXT,
      created_at TEXT NOT NULL,
      started_at TEXT,
      completed_at TEXT,
      error_log TEXT
    );
  `);
}

const desktopDbCache = new Map();

function getDesktopKnowledgeDb(resourceFolder, autoCreate = false) {
  const dbPath = getKnowledgeDbPath(resourceFolder);
  if (!dbPath) return null;
  if (!autoCreate && !fs.existsSync(dbPath)) return null;

  if (desktopDbCache.has(dbPath)) {
    const cached = desktopDbCache.get(dbPath);
    try {
      cached.prepare('SELECT 1').get();
      return cached;
    } catch {
      try { cached.close(); } catch {}
      desktopDbCache.delete(dbPath);
    }
  }

  const dbDir = path.dirname(dbPath);
  if (autoCreate && !fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const { DatabaseSync } = require('node:sqlite');
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA busy_timeout = 10000;');
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA synchronous = NORMAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  applyDesktopKnowledgeSchema(db);

  desktopDbCache.set(dbPath, db);
  return db;
}

function chunkMarkdownByHeadingsHelper(docId, markdownText) {
  if (!markdownText || !markdownText.trim()) return [];
  const lines = markdownText.split('\n');
  const totalLines = lines.length;
  const boundaries = [];
  const headingStack = [];
  let currentSection = {
    headingTitle: '개요 (서론)',
    headingLevel: 0,
    headingPath: '개요',
    startLine: 1,
  };
  const headingRegex = /^(#{1,6})\s+(.+)$/;
  for (let i = 0; i < totalLines; i++) {
    const line = lines[i];
    const match = line.match(headingRegex);
    if (match) {
      const level = match[1].length;
      const title = match[2].trim();
      if (i > 0 && i >= currentSection.startLine) {
        boundaries.push({ ...currentSection, endLine: i });
      }
      while (headingStack.length > 0 && headingStack[headingStack.length - 1].level >= level) {
        headingStack.pop();
      }
      headingStack.push({ level, title });
      currentSection = {
        headingTitle: title,
        headingLevel: level,
        headingPath: headingStack.map(h => h.title).join(' > '),
        startLine: i + 1,
      };
    }
  }
  boundaries.push({ ...currentSection, endLine: totalLines });

  return boundaries.map((b, idx) => {
    const chunkLines = lines.slice(b.startLine - 1, b.endLine);
    const chunkText = chunkLines.join('\n');
    const summary = chunkLines.slice(0, 3).join(' ').slice(0, 200).trim();
    return {
      id: `${docId}_chunk_${idx}`,
      documentId: docId,
      chunkIndex: idx,
      headingTitle: b.headingTitle,
      headingLevel: b.headingLevel,
      headingPath: b.headingPath,
      startLine: b.startLine,
      endLine: b.endLine,
      chunkSummary: summary,
      keywords: [b.headingTitle],
      chunkText,
    };
  });
}

async function handleDesktopKnowledgeApi(request, pathname, url) {
  try {
    let body = {};
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        const text = await request.text();
        if (text) body = JSON.parse(text);
      } catch (err) {
        console.warn('[DesktopKnowledgeApi] Body parse warning:', err.message);
      }
    }

    const subPath = pathname.replace(/^api\/knowledge\/?/, '').split('?')[0].replace(/\/$/, '');
    const resourceFolder = body.resourceFolder || url.searchParams.get('resourceFolder');

    // 1. 등록 지식 문서 목록 조회 (list)
    if (subPath === 'list') {
      if (!resourceFolder || !resourceFolder.trim()) {
        return Response.json(
          { ok: false, code: 'NO_RESOURCE_FOLDER', message: '공통 자원(리소스) 폴더가 설정되지 않았습니다.', documents: [] },
          { status: 400 }
        );
      }
      const db = getDesktopKnowledgeDb(resourceFolder, false);
      if (!db) {
        return Response.json({ ok: true, documents: [] });
      }

      const docs = db.prepare(`
        SELECT 
          d.id,
          d.file_path,
          d.title,
          d.file_hash,
          d.file_size,
          d.modified_at,
          d.summary,
          d.key_points,
          d.document_type,
          d.priority,
          d.status,
          d.error_message,
          d.analyzer_model,
          d.analyzed_at,
          d.indexed_at,
          (SELECT COUNT(*) FROM document_chunks c WHERE c.document_id = d.id) as chunk_count
        FROM knowledge_documents d
        ORDER BY d.indexed_at DESC
      `).all();

      const getTagsStmt = db.prepare('SELECT tag_name, score FROM document_tags WHERE document_id = ? ORDER BY score DESC');
      const documents = docs.map(doc => {
        let tags = [];
        try { tags = getTagsStmt.all(doc.id); } catch {}
        let keyPoints = [];
        if (typeof doc.key_points === 'string') {
          try { keyPoints = JSON.parse(doc.key_points); } catch {}
        } else if (Array.isArray(doc.key_points)) {
          keyPoints = doc.key_points;
        }
        return {
          ...doc,
          key_points: keyPoints,
          tags
        };
      });

      return Response.json({ ok: true, documents });
    }

    // 2. 큐 작업 현황 통계 (queue/stats)
    if (subPath === 'queue/stats') {
      const db = getDesktopKnowledgeDb(resourceFolder, false);
      if (!db) {
        return Response.json({
          ok: true,
          stats: {
            total: 0,
            completed: 0,
            running: 0,
            queued: 0,
            failed: 0,
            percent: 0,
            activeWorkers: 0,
            maxWorkers: 2,
            isPaused: false,
            rateLimitStatus: 'NORMAL'
          }
        });
      }

      const rows = db.prepare(`
        SELECT status, COUNT(*) as count
        FROM knowledge_jobs
        GROUP BY status
      `).all();

      let total = 0, queued = 0, running = 0, success = 0, failed = 0;
      for (const r of rows) {
        const count = Number(r.count || 0);
        total += count;
        if (r.status === 'QUEUED') queued = count;
        else if (r.status === 'RUNNING') running = count;
        else if (r.status === 'SUCCESS') success = count;
        else if (r.status === 'FAILED') failed = count;
      }
      const percent = total > 0 ? Math.round((success / total) * 100) : 0;

      return Response.json({
        ok: true,
        stats: {
          total,
          completed: success,
          running,
          queued,
          failed,
          percent,
          activeWorkers: Math.min(running, 2),
          maxWorkers: 2,
          isPaused: false,
          rateLimitStatus: 'NORMAL'
        }
      });
    }

    // 3. 지식 컬렉션 CRUD (collection)
    if (subPath === 'collection') {
      if (request.method === 'GET') {
        const db = getDesktopKnowledgeDb(resourceFolder, false);
        if (!db) return Response.json({ ok: true, collections: [] });

        const rows = db.prepare(`
          SELECT c.id, c.name, c.description, COALESCE(c.color, '#06C755') as color, c.created_at,
                 COUNT(d.id) as documentCount
          FROM knowledge_collections c
          LEFT JOIN knowledge_documents d ON d.collection_id = c.id
          GROUP BY c.id
          ORDER BY c.name ASC
        `).all();

        const collections = rows.map(r => ({
          id: r.id,
          name: r.name,
          description: r.description,
          color: r.color,
          createdAt: r.created_at,
          documentCount: Number(r.documentCount || 0)
        }));
        return Response.json({ ok: true, collections });
      }

      if (request.method === 'POST') {
        const { name, description, color } = body;
        if (!name || !name.trim()) {
          return Response.json({ ok: false, message: '컬렉션 이름이 필요합니다.' }, { status: 400 });
        }
        const db = getDesktopKnowledgeDb(resourceFolder, true);
        const id = body.id || `col_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const now = new Date().toISOString();
        const safeColor = color || '#06C755';
        db.prepare(`
          INSERT INTO knowledge_collections (id, name, description, color, created_at)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(name) DO UPDATE SET
            description = excluded.description,
            color = excluded.color
        `).run(id, name.trim(), description?.trim() || null, safeColor, now);
        const saved = db.prepare('SELECT * FROM knowledge_collections WHERE name = ?').get(name.trim());
        return Response.json({
          ok: true,
          collection: {
            id: saved.id,
            name: saved.name,
            description: saved.description,
            color: saved.color,
            createdAt: saved.created_at
          }
        });
      }

      if (request.method === 'DELETE') {
        const colId = url.searchParams.get('id') || body.id;
        if (!colId) return Response.json({ ok: false, message: '컬렉션 ID가 필요합니다.' }, { status: 400 });
        const db = getDesktopKnowledgeDb(resourceFolder, false);
        if (db) {
          db.exec('BEGIN TRANSACTION;');
          try {
            db.prepare('UPDATE knowledge_documents SET collection_id = NULL WHERE collection_id = ?').run(colId);
            db.prepare('DELETE FROM knowledge_collections WHERE id = ?').run(colId);
            db.exec('COMMIT;');
          } catch (e) {
            db.exec('ROLLBACK;');
            throw e;
          }
        }
        return Response.json({ ok: true });
      }
    }

    // 4. 지식 문서 상세 정보 (detail)
    if (subPath === 'detail') {
      const docId = url.searchParams.get('docId') || url.searchParams.get('documentId') || body.documentId || body.docId;
      const filePath = url.searchParams.get('filePath') || body.filePath;
      if (!docId && !filePath) {
        return Response.json({ ok: false, message: 'documentId 또는 filePath가 필요합니다.' }, { status: 400 });
      }
      const db = getDesktopKnowledgeDb(resourceFolder, false);
      if (!db) return Response.json({ ok: false, message: '문서를 찾을 수 없습니다.' }, { status: 404 });

      let doc = null;
      if (docId) {
        doc = db.prepare('SELECT * FROM knowledge_documents WHERE id = ?').get(docId);
      } else if (filePath) {
        doc = db.prepare('SELECT * FROM knowledge_documents WHERE file_path = ?').get(filePath);
      }
      if (!doc) {
        return Response.json({ ok: false, message: '문서를 찾을 수 없습니다.' }, { status: 404 });
      }

      const tags = db.prepare('SELECT tag_name, score FROM document_tags WHERE document_id = ? ORDER BY score DESC').all(doc.id);
      const chunks = db.prepare(`
        SELECT c.id, c.chunk_index, c.heading_title, c.heading_level, c.heading_path,
               c.start_line, c.end_line, c.chunk_summary, c.keywords,
               f.chunk_text
        FROM document_chunks c
        LEFT JOIN document_chunks_fts f ON f.chunk_id = c.id
        WHERE c.document_id = ?
        ORDER BY c.chunk_index ASC
      `).all(doc.id);

      let keyPoints = [];
      try { keyPoints = typeof doc.key_points === 'string' ? JSON.parse(doc.key_points) : (doc.key_points || []); } catch {}

      const detail = {
        documentId: doc.id,
        filePath: doc.file_path,
        title: doc.title,
        fileSize: doc.file_size,
        modifiedAt: doc.modified_at,
        status: doc.status,
        summary: doc.summary || '',
        keyPoints,
        documentType: doc.document_type || 'other',
        tags: tags.map(t => ({ name: t.tag_name, score: t.score })),
        searchTerms: [],
        analyzerModel: doc.analyzer_model || 'gemini-3.8-flash',
        chunksCount: chunks.length,
        chunks: chunks.map(c => ({
          id: c.id,
          chunkIndex: c.chunk_index,
          headingTitle: c.heading_title || '',
          headingLevel: c.heading_level || 0,
          headingPath: c.heading_path || '',
          startLine: c.start_line,
          endLine: c.end_line,
          chunkSummary: c.chunk_summary || '',
          keywords: c.keywords ? (typeof c.keywords === 'string' ? c.keywords.split(',').map(s => s.trim()) : c.keywords) : [],
          chunkText: c.chunk_text || ''
        }))
      };

      return Response.json({ ok: true, detail });
    }

    // 5. 지식 문서 삭제 (delete)
    if (subPath === 'delete') {
      const { documentId, filePath, deleteAllErrors } = body;
      const db = getDesktopKnowledgeDb(resourceFolder, false);
      if (!db) return Response.json({ ok: true, success: true, deletedCount: 0 });

      if (deleteAllErrors) {
        const errorDocs = db.prepare("SELECT id FROM knowledge_documents WHERE status = 'ERROR'").all();
        if (errorDocs.length > 0) {
          db.exec('BEGIN TRANSACTION;');
          try {
            for (const row of errorDocs) {
              db.prepare('DELETE FROM document_chunks_fts WHERE document_id = ?').run(row.id);
              db.prepare('DELETE FROM document_chunks WHERE document_id = ?').run(row.id);
              db.prepare('DELETE FROM document_tags WHERE document_id = ?').run(row.id);
              db.prepare('DELETE FROM knowledge_jobs WHERE document_id = ?').run(row.id);
              db.prepare('DELETE FROM knowledge_documents WHERE id = ?').run(row.id);
            }
            db.exec('COMMIT;');
          } catch (e) {
            db.exec('ROLLBACK;');
            throw e;
          }
        }
        return Response.json({ ok: true, success: true, deletedCount: errorDocs.length });
      }

      let targetId = documentId;
      if (!targetId && filePath) {
        const row = db.prepare('SELECT id FROM knowledge_documents WHERE file_path = ?').get(filePath);
        if (row) targetId = row.id;
      }
      if (targetId) {
        db.exec('BEGIN TRANSACTION;');
        try {
          db.prepare('DELETE FROM document_chunks_fts WHERE document_id = ?').run(targetId);
          db.prepare('DELETE FROM document_chunks WHERE document_id = ?').run(targetId);
          db.prepare('DELETE FROM document_tags WHERE document_id = ?').run(targetId);
          db.prepare('DELETE FROM knowledge_jobs WHERE document_id = ?').run(targetId);
          db.prepare('DELETE FROM knowledge_documents WHERE id = ?').run(targetId);
          db.exec('COMMIT;');
        } catch (e) {
          db.exec('ROLLBACK;');
          throw e;
        }
      }
      return Response.json({ ok: true, success: true });
    }

    // 6. 리소스 폴더 및 DB 초기화 (init)
    if (subPath === 'init') {
      const { forceReset } = body;
      const safeFolder = resolveSafeResourceFolder(resourceFolder);
      if (!safeFolder) return Response.json({ ok: false, message: '리소스 폴더가 설정되지 않았습니다.' }, { status: 400 });

      for (const dir of ['profiles', 'prompt', 'bible', 'media', 'db']) {
        const p = path.join(safeFolder, dir);
        if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
      }

      const db = getDesktopKnowledgeDb(resourceFolder, true);
      if (forceReset && db) {
        db.exec('BEGIN TRANSACTION;');
        try {
          db.prepare('DELETE FROM document_chunks_fts;').run();
          db.prepare('DELETE FROM document_tags;').run();
          db.prepare('DELETE FROM document_chunks;').run();
          db.prepare('DELETE FROM knowledge_documents;').run();
          db.prepare('DELETE FROM knowledge_jobs;').run();
          db.prepare('DELETE FROM knowledge_collections;').run();
          db.exec('COMMIT;');
          try { db.exec('VACUUM;'); } catch {}
        } catch (e) {
          db.exec('ROLLBACK;');
        }
      }
      return Response.json({ ok: true, message: '지식 데이터베이스가 성공적으로 초기화되었습니다.', path: safeFolder });
    }

    // 7. 작업 큐 관리 (queue)
    if (subPath === 'queue') {
      if (request.method === 'GET') {
        const status = url.searchParams.get('status');
        const limit = parseInt(url.searchParams.get('limit') || '50', 10);
        const db = getDesktopKnowledgeDb(resourceFolder, false);
        if (!db) return Response.json({ ok: true, jobs: [], total: 0 });

        let query = 'SELECT * FROM knowledge_jobs';
        const params = [];
        if (status && status !== 'ALL') {
          query += ' WHERE status = ?';
          params.push(status);
        }
        query += ' ORDER BY created_at DESC LIMIT ?';
        params.push(limit);
        const jobs = db.prepare(query).all(...params);
        return Response.json({ ok: true, jobs, total: jobs.length });
      }

      if (request.method === 'POST') {
        const { action } = body;
        const db = getDesktopKnowledgeDb(resourceFolder, true);

        if (action === 'ENQUEUE_BATCH') {
          const items = body.items || body.jobs || [];
          let enqueued = 0, suppressed = 0;
          for (const it of items) {
            const targetHash = it.targetHash || '';
            const existing = db.prepare(`
              SELECT id FROM knowledge_jobs
              WHERE file_path = ? AND target_hash = ? AND status IN ('QUEUED', 'RUNNING')
            `).get(it.filePath, targetHash);
            if (existing) {
              suppressed++;
              continue;
            }
            const docId = it.documentId || `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
            const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
            const now = new Date().toISOString();
            db.prepare(`
              INSERT INTO knowledge_jobs (id, document_id, file_path, title, job_type, target_hash, priority, status, current_step, retry_count, max_retries, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, 'QUEUED', 'QUEUED', 0, 3, ?)
            `).run(jobId, docId, it.filePath, it.title || null, it.jobType || 'INDEX', targetHash, it.priority || 3, now);
            enqueued++;
          }
          return Response.json({ ok: true, enqueued, enqueuedCount: enqueued, suppressed });
        }

        if (action === 'CANCEL') {
          db.prepare("UPDATE knowledge_jobs SET status = 'CANCELLED' WHERE id = ? AND status IN ('QUEUED', 'RUNNING')").run(body.jobId);
          return Response.json({ ok: true });
        }

        if (action === 'RETRY') {
          db.prepare("UPDATE knowledge_jobs SET status = 'QUEUED', retry_after = NULL, error_log = NULL WHERE status = 'FAILED'").run();
          return Response.json({ ok: true });
        }

        if (action === 'CLEAR_COMPLETED') {
          db.prepare("DELETE FROM knowledge_jobs WHERE status = 'SUCCESS'").run();
          return Response.json({ ok: true });
        }

        if (action === 'CLEAR_FAILED') {
          db.prepare("DELETE FROM knowledge_jobs WHERE status = 'FAILED'").run();
          return Response.json({ ok: true });
        }

        // 단일 작업 등록
        const { documentId, filePath, title, targetHash, priority, jobType } = body;
        if (!filePath) return Response.json({ ok: false, message: 'filePath가 필요합니다.' }, { status: 400 });
        const docId = documentId || `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const now = new Date().toISOString();
        db.prepare(`
          INSERT INTO knowledge_jobs (id, document_id, file_path, title, job_type, target_hash, priority, status, current_step, retry_count, max_retries, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'QUEUED', 'QUEUED', 0, 3, ?)
        `).run(jobId, docId, filePath, title || null, jobType || 'INDEX', targetHash || '', priority || 3, now);
        const job = db.prepare('SELECT * FROM knowledge_jobs WHERE id = ?').get(jobId);
        return Response.json({ ok: true, job });
      }
    }

    // 8. 큐 다음 작업 선점 (queue/pop)
    if (subPath === 'queue/pop') {
      const db = getDesktopKnowledgeDb(resourceFolder, false);
      if (!db) return Response.json({ ok: true, job: null });
      const nowIso = new Date().toISOString();
      const candidate = db.prepare(`
        SELECT * FROM knowledge_jobs
        WHERE status = 'QUEUED'
          AND (retry_after IS NULL OR retry_after <= ?)
        ORDER BY priority DESC, created_at ASC
        LIMIT 1
      `).get(nowIso);
      if (!candidate) {
        return Response.json({ ok: true, job: null });
      }
      db.prepare("UPDATE knowledge_jobs SET status = 'RUNNING', started_at = ? WHERE id = ?").run(nowIso, candidate.id);
      const popped = db.prepare('SELECT * FROM knowledge_jobs WHERE id = ?').get(candidate.id);
      return Response.json({ ok: true, job: popped });
    }

    // 9. 큐 작업 파이프라인 단계 갱신 (queue/step)
    if (subPath === 'queue/step') {
      const { jobId, step, errorLog } = body;
      if (!jobId || !step) return Response.json({ ok: false, message: 'jobId와 step이 필요합니다.' }, { status: 400 });
      const db = getDesktopKnowledgeDb(resourceFolder, false);
      if (db) {
        db.prepare("UPDATE knowledge_jobs SET current_step = ?, error_log = COALESCE(?, error_log) WHERE id = ?").run(step, errorLog || null, jobId);
      }
      return Response.json({ ok: true });
    }

    // 10. 큐 작업 완료/실패 처리 (queue/complete)
    if (subPath === 'queue/complete') {
      const { jobId, success, errorLog, backoffSeconds } = body;
      if (!jobId) return Response.json({ ok: false, message: 'jobId가 필요합니다.' }, { status: 400 });
      const db = getDesktopKnowledgeDb(resourceFolder, false);
      if (db) {
        const nowIso = new Date().toISOString();
        if (success) {
          db.prepare("UPDATE knowledge_jobs SET status = 'SUCCESS', completed_at = ?, error_log = NULL WHERE id = ?").run(nowIso, jobId);
        } else {
          const job = db.prepare('SELECT retry_count, max_retries FROM knowledge_jobs WHERE id = ?').get(jobId);
          const retryCount = (job?.retry_count || 0) + 1;
          const maxRetries = job?.max_retries || 3;
          if (retryCount >= maxRetries) {
            db.prepare("UPDATE knowledge_jobs SET status = 'FAILED', retry_count = ?, completed_at = ?, error_log = ? WHERE id = ?").run(retryCount, nowIso, errorLog || null, jobId);
          } else {
            const delaySec = backoffSeconds || Math.pow(2, retryCount) * 2;
            const retryAfter = new Date(Date.now() + delaySec * 1000).toISOString();
            db.prepare("UPDATE knowledge_jobs SET status = 'QUEUED', retry_count = ?, retry_after = ?, error_log = ? WHERE id = ?").run(retryCount, retryAfter, errorLog || null, jobId);
          }
        }
      }
      return Response.json({ ok: true });
    }

    // 11. 마크다운 문서 색인 및 AI 분석 (index)
    if (subPath === 'index') {
      let { filePath, fileContent, title, geminiApiKey, aiModelName } = body;
      if (!fileContent && filePath && fs.existsSync(filePath)) {
        try { fileContent = fs.readFileSync(filePath, 'utf-8'); } catch {}
      }
      if (!filePath || !fileContent) {
        return Response.json({ ok: false, message: 'filePath와 fileContent는 필수 항목입니다.' }, { status: 400 });
      }

      const db = getDesktopKnowledgeDb(resourceFolder, true);
      const crypto = require('crypto');
      const docId = `doc_${crypto.createHash('sha256').update(filePath).digest('hex').slice(0, 16)}`;
      const fileHash = crypto.createHash('sha256').update(fileContent).digest('hex');
      const fileSize = Buffer.byteLength(fileContent, 'utf-8');
      const docTitle = title || path.basename(filePath).replace(/\.md$/i, '') || '문서';
      const nowIso = new Date().toISOString();

      // 청킹
      const chunks = chunkMarkdownByHeadingsHelper(docId, fileContent);

      // Gemini AI 분석 (키가 있는 경우 호출, 실패 또는 미제공 시 기본 요약 폴백)
      let analysis = {
        summary: `${docTitle} 마크다운 문서입니다.`,
        key_points: chunks.slice(0, 5).map(c => c.headingTitle).filter(Boolean),
        document_type: 'guide',
        tags: [{ name: '마크다운', score: 90 }, { name: '지식문서', score: 85 }],
        search_terms: [docTitle]
      };

      if (geminiApiKey && geminiApiKey.trim()) {
        try {
          const modelToUse = (aiModelName || 'gemini-3.8-flash').trim();
          const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${geminiApiKey.trim()}`;
          const prompt = `당신은 개인 지식 베이스를 구축하는 전문 마크다운 분석 AI입니다.
주어진 마크다운 문서를 읽고, 반드시 유효한 단 하나의 JSON 객체 { ... } 로만 응답해야 합니다.
[응답 JSON 포맷]:
{
  "summary": "문서 요약문",
  "key_points": ["핵심 요점 1", "핵심 요점 2"],
  "document_type": "guide",
  "tags": [{ "name": "태그명", "score": 90 }],
  "search_terms": ["검색어1", "검색어2"]
}

[분석할 마크다운 원문]:
${fileContent.slice(0, 15000)}`;

          const aiRes = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json', temperature: 0.2 }
            })
          });

          if (aiRes.ok) {
            const aiData = await aiRes.json();
            const textOut = aiData?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (textOut) {
              const parsed = JSON.parse(textOut);
              if (parsed.summary) analysis.summary = parsed.summary;
              if (Array.isArray(parsed.key_points)) analysis.key_points = parsed.key_points;
              if (parsed.document_type) analysis.document_type = parsed.document_type;
              if (Array.isArray(parsed.tags)) analysis.tags = parsed.tags;
              if (Array.isArray(parsed.search_terms)) analysis.search_terms = parsed.search_terms;
            }
          }
        } catch (aiErr) {
          console.warn('[DesktopKnowledgeApi] AI analysis fallback used:', aiErr.message);
        }
      }

      // Rule 7 준수: 단일 트랜잭션으로 원자적 쓰기 (All-or-Nothing)
      db.exec('BEGIN TRANSACTION;');
      try {
        db.prepare('DELETE FROM document_chunks_fts WHERE document_id = ?').run(docId);
        db.prepare('DELETE FROM document_chunks WHERE document_id = ?').run(docId);
        db.prepare('DELETE FROM document_tags WHERE document_id = ?').run(docId);

        db.prepare(`
          INSERT INTO knowledge_documents (
            id, file_path, title, file_hash, file_size, modified_at,
            summary, key_points, document_type, priority, status,
            analyzer_model, analyzed_at, indexed_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'READY', ?, ?, ?)
          ON CONFLICT(file_path) DO UPDATE SET
            title = excluded.title,
            file_hash = excluded.file_hash,
            file_size = excluded.file_size,
            modified_at = excluded.modified_at,
            summary = excluded.summary,
            key_points = excluded.key_points,
            document_type = excluded.document_type,
            priority = excluded.priority,
            status = 'READY',
            error_message = NULL,
            analyzer_model = excluded.analyzer_model,
            analyzed_at = excluded.analyzed_at,
            indexed_at = excluded.indexed_at
        `).run(
          docId, filePath, docTitle, fileHash, fileSize, nowIso,
          analysis.summary, JSON.stringify(analysis.key_points), analysis.document_type, 3,
          aiModelName || 'gemini-3.8-flash', nowIso, nowIso
        );

        const insertChunkStmt = db.prepare(`
          INSERT INTO document_chunks (
            id, document_id, chunk_index, heading_title, heading_level,
            heading_path, start_line, end_line, chunk_summary, keywords
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const insertFtsStmt = db.prepare(`
          INSERT INTO document_chunks_fts (
            chunk_id, document_id, heading_title, keywords, chunk_text
          ) VALUES (?, ?, ?, ?, ?)
        `);

        for (const c of chunks) {
          const kwStr = Array.isArray(c.keywords) ? c.keywords.join(', ') : (c.keywords || '');
          insertChunkStmt.run(
            c.id, docId, c.chunkIndex, c.headingTitle || null, c.headingLevel || 0,
            c.headingPath || null, c.startLine, c.endLine, c.chunkSummary || null, kwStr
          );
          insertFtsStmt.run(
            c.id, docId, c.headingTitle || '', kwStr, c.chunkText || ''
          );
        }

        if (Array.isArray(analysis.tags)) {
          const insertTagStmt = db.prepare(`
            INSERT INTO document_tags (document_id, tag_name, score, source)
            VALUES (?, ?, ?, 'AI')
          `);
          for (const t of analysis.tags) {
            if (t && t.name) {
              insertTagStmt.run(docId, String(t.name).trim(), Math.min(100, Math.max(0, Number(t.score || 80))));
            }
          }
        }

        db.exec('COMMIT;');
      } catch (err) {
        db.exec('ROLLBACK;');
        throw err;
      }

      const detail = {
        documentId: docId,
        filePath,
        title: docTitle,
        fileSize,
        modifiedAt: nowIso,
        status: 'READY',
        summary: analysis.summary,
        keyPoints: analysis.key_points,
        documentType: analysis.document_type,
        tags: analysis.tags,
        searchTerms: analysis.search_terms,
        analyzerModel: aiModelName || 'gemini-3.8-flash',
        chunksCount: chunks.length,
        chunks
      };

      return Response.json({ ok: true, documentId: docId, chunksCount: chunks.length, detail });
    }

    // 12. 하이브리드/FTS 검색 (search)
    if (subPath === 'search') {
      const { query, limit = 20 } = body;
      const db = getDesktopKnowledgeDb(resourceFolder, false);
      if (!db || !query || !query.trim()) return Response.json({ ok: true, candidates: [] });

      let candidates = [];
      try {
        const cleanQ = query.trim().replace(/['"]/g, ' ');
        candidates = db.prepare(`
          SELECT c.id, c.document_id, c.chunk_index, c.heading_title, c.heading_level, c.heading_path,
                 c.start_line, c.end_line, c.chunk_summary, c.keywords,
                 d.title as doc_title, d.file_path, d.priority,
                 snippet(document_chunks_fts, 2, '<b>', '</b>', '...', 32) as match_snippet,
                 bm25(document_chunks_fts) as rank
          FROM document_chunks_fts f
          JOIN document_chunks c ON c.id = f.chunk_id
          JOIN knowledge_documents d ON d.id = c.document_id
          WHERE document_chunks_fts MATCH ?
          ORDER BY rank ASC
          LIMIT ?
        `).all(cleanQ, limit);
      } catch {
        candidates = db.prepare(`
          SELECT c.id, c.document_id, c.chunk_index, c.heading_title, c.heading_level, c.heading_path,
                 c.start_line, c.end_line, c.chunk_summary, c.keywords,
                 d.title as doc_title, d.file_path, d.priority,
                 c.chunk_summary as match_snippet,
                 0 as rank
          FROM document_chunks c
          JOIN knowledge_documents d ON d.id = c.document_id
          WHERE c.heading_title LIKE ? OR c.chunk_summary LIKE ? OR c.keywords LIKE ?
          LIMIT ?
        `).all(`%${query}%`, `%${query}%`, `%${query}%`, limit);
      }
      return Response.json({ ok: true, candidates });
    }

    // 13. 백업 및 복원 (backup, restore)
    if (subPath === 'backup') {
      const safeFolder = resolveSafeResourceFolder(resourceFolder);
      if (!safeFolder) return Response.json({ ok: false, message: '리소스 폴더가 없습니다.' }, { status: 400 });
      const backupsDir = path.join(safeFolder, 'backups');
      if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });

      if (request.method === 'GET') {
        const files = fs.readdirSync(backupsDir).filter(f => f.endsWith('.db'));
        const backups = files.map(f => {
          const stat = fs.statSync(path.join(backupsDir, f));
          return { fileName: f, size: stat.size, createdAt: stat.birthtime.toISOString() };
        });
        return Response.json({ ok: true, backups });
      }

      if (request.method === 'POST') {
        const dbPath = path.join(safeFolder, 'db', 'onrivi_knowledge.db');
        if (!fs.existsSync(dbPath)) return Response.json({ ok: false, message: '백업할 DB 파일이 없습니다.' }, { status: 404 });
        const now = new Date();
        const pad = n => String(n).padStart(2, '0');
        const ts = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
        const backupFileName = `backup_${ts}.db`;
        const destPath = path.join(backupsDir, backupFileName);
        fs.copyFileSync(dbPath, destPath);
        return Response.json({ ok: true, backup: { fileName: backupFileName, path: destPath } });
      }
    }

    if (subPath === 'restore') {
      const { backupFileName } = body;
      const safeFolder = resolveSafeResourceFolder(resourceFolder);
      if (!safeFolder || !backupFileName) return Response.json({ ok: false, message: '필수 인자가 누락되었습니다.' }, { status: 400 });
      const srcBackup = path.join(safeFolder, 'backups', backupFileName);
      const dbPath = path.join(safeFolder, 'db', 'onrivi_knowledge.db');
      if (!fs.existsSync(srcBackup)) return Response.json({ ok: false, message: '백업 파일을 찾을 수 없습니다.' }, { status: 404 });

      if (desktopDbCache.has(dbPath)) {
        try { desktopDbCache.get(dbPath).close(); } catch {}
        desktopDbCache.delete(dbPath);
      }
      fs.copyFileSync(srcBackup, dbPath);
      return Response.json({ ok: true, message: '복원이 완료되었습니다.' });
    }

    return Response.json({ ok: false, message: `지원되지 않는 로컬 지식 엔드포인트: ${subPath}` }, { status: 404 });
  } catch (err) {
    console.error('[DesktopKnowledgeApi Error]:', err);
    return Response.json({ ok: false, message: err?.message || '지식 API 처리 중 내부 오류 발생' }, { status: 500 });
  }
}

// 앱 구동 생명주기 시작
app.on('ready', async () => {
  // 🌐 [ Next.js App Router 정적 파일 서빙을 위한 app:// 프로토콜 핸들러 등록 ]
  protocol.handle('app', async (request) => {
    try {
      const url = new URL(request.url);
      let pathname = decodeURIComponent(url.pathname);
      if (pathname === '/' || pathname === '') pathname = '/editor.html';
      else if (pathname === '/editor') pathname = '/editor.html';
      
      // 🚨 @PATCH : 데스크톱 앱 내에서 /login 또는 /dashboard 등 SaaS 웹 경로로 직접 접근 시 404 방지 및 외부 브라우저 오픈
      if (pathname === '/login' || pathname === 'login') {
        const { shell } = require('electron');
        shell.openExternal(`https://onrivi.com/login${url.search}`);
        return new Response('<script>location.href="app://-/editor.html?env=desktop";</script>', {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }
      if (pathname === '/dashboard' || pathname === 'dashboard') {
        const { shell } = require('electron');
        shell.openExternal(`https://onrivi.com/dashboard${url.search}`);
        return new Response('<script>location.href="app://-/editor.html?env=desktop";</script>', {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }
      
      pathname = pathname.replace(/^\//, '');  // path.join이 앞 경로를 먹는 버그 방지
      
      // 🧠 [데스크톱 지식 베이스 SQLite 로컬 라우팅]
      // /api/knowledge/* 요청은 외부 실서버로 프록시하지 않고 사용자 지정 로컬 리소스 폴더의 SQLite DB를 직접 쿼리하여 응답
      if (pathname.startsWith('api/knowledge/')) {
        return await handleDesktopKnowledgeApi(request, pathname, url);
      }

      // 데스크탑에서 프론트엔드가 실수로 /api/... 로컬 경로로 fetch 할 경우 실서버로 프록시
      if (pathname.startsWith('api/')) {
        const fetchUrl = `https://onrivi.com/${pathname}`;
        
        // 🚨 @PATCH: Host 헤더 등 클라우드플레어 라우팅을 방해하는 커스텀 프로토콜 헤더 제거
        const cleanHeaders = new Headers();
        for (const [key, value] of request.headers.entries()) {
          const lowerKey = key.toLowerCase();
          if (lowerKey !== 'host' && lowerKey !== 'origin' && lowerKey !== 'referer') {
            cleanHeaders.set(key, value);
          }
        }
        
        const options = {
          method: request.method,
          headers: cleanHeaders
        };
        if (request.method !== 'GET' && request.method !== 'HEAD' && request.body) {
          options.body = request.body;
          options.duplex = 'half';
        }
        return fetch(fetchUrl, options);
      }

      let targetPath = path.join(__dirname, 'frontend/out', pathname);
      
      // html 파일 확장자 보완 (Next.js 정적 빌드 대응)
      if (!path.extname(targetPath) && !fs.existsSync(targetPath)) {
         if (fs.existsSync(targetPath + '.html')) {
             targetPath += '.html';
         } else if (fs.existsSync(path.join(targetPath, 'index.html'))) {
             targetPath = path.join(targetPath, 'index.html');
         }
      }

      const ext = path.extname(targetPath).toLowerCase();
      const mimeMap = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.webp': 'image/webp',
        '.ico': 'image/x-icon',
        '.woff2': 'font/woff2',
      };
      if (!fs.existsSync(targetPath)) {
        return new Response('File not found', { status: 404 });
      }

      const contentType = mimeMap[ext] || 'application/octet-stream';
      const content = fs.readFileSync(targetPath);
      const headers = new Headers();
      headers.set('Content-Type', contentType);
      headers.set('Content-Length', String(Buffer.byteLength(content)));
      return new Response(content, { status: 200, headers });
    } catch (err) {
      console.error('app protocol serve error:', err);
      return new Response('Internal Server Error', { status: 500 });
    }
  });

  // 🌐 [ 네이티브 미디어 스트리밍을 위한 media-local 프로토콜 핸들러 등록 ]
  // JS Stream을 거치지 않고 C++ 네이티브 레벨에서 파일 스트리밍과 Range Request를 완벽히 지원
  protocol.registerFileProtocol('media-local', (request, callback) => {
    try {
      const parsedUrl = new URL(request.url);
      
      // Chromium URL 파서가 커스텀 standard 프로토콜의 경로를 잘못 파싱하는 것을 방지하기 위해 ?url= 파라미터 우선 확인
      let filePath = parsedUrl.searchParams.get('url');
      if (!filePath) {
        // 하위 호환성 및 폴백
        filePath = decodeURIComponent(parsedUrl.pathname);
      }
      
      if (process.platform === 'win32' && filePath.startsWith('/')) {
        filePath = filePath.slice(1);
      }
      const normalizedPath = path.normalize(filePath);
      
      if (!fs.existsSync(normalizedPath)) {
        console.error('[media-local] File not found:', normalizedPath);
        return callback({ error: -6 });
      }
      callback({ path: normalizedPath });
    } catch (err) {
      console.error('[media-local] Error:', err);
      callback({ error: -2 });
    }
  });

  // 🌐 [ 로컬 이미지 및 미디어 서빙을 위한 media 프로토콜 핸들러 등록 ]
  protocol.handle('media', (request) => {
    try {
      const parsedUrl = new URL(request.url);
      const decodedPath = parsedUrl.searchParams.get('url');
      if (!decodedPath) {
        return new Response('URL parameter missing', { status: 400 });
      }
      
      // 🛡️ [웹 리소스 프록시 분기] 만약 http/https 외부 자원 주소인 경우, 오리진 CORS 제약 우회를 위해 메인 프로세스에서 fetch 대리 처리
      if (decodedPath.startsWith('http://') || decodedPath.startsWith('https://')) {
        return net.fetch(decodedPath, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        }).then(response => {
          const headers = new Headers(response.headers);
          headers.set('Access-Control-Allow-Origin', '*');
          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: headers
          });
        }).catch(err => {
          console.error('External media proxy error:', err);
          return new Response('External image load failed', { status: 502 });
        });
      }

      let filePath = decodedPath;
      if (process.platform === 'win32' && filePath.startsWith('/')) {
        filePath = filePath.slice(1);
      }
      let normalizedPath = path.normalize(filePath).normalize('NFC');
      
      if (!fs.existsSync(normalizedPath)) {
        // 🛡️ [에셋 폴백 강인성 보강] 로컬 절대 경로 파일이 존재하지 않는 경우, 
        // 경로 전체를 더하지 않고 파일명만 추출하여 frontend/out 또는 frontend/public 하위의 에셋을 탐색합니다.
        const fileNameOnly = path.basename(normalizedPath);
        const fallbackOutPath = path.join(__dirname, 'frontend/out', fileNameOnly);
        const fallbackPublicPath = path.join(__dirname, 'frontend/public', fileNameOnly);
        if (fs.existsSync(fallbackOutPath)) {
          normalizedPath = fallbackOutPath;
        } else if (fs.existsSync(fallbackPublicPath)) {
          normalizedPath = fallbackPublicPath;
        } else {
          return new Response('File not found', { status: 404 });
        }
      }
      
      const ext = path.extname(normalizedPath).toLowerCase();
      const mimeTypes = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.webp': 'image/webp',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.ogg': 'video/ogg',
        '.mov': 'video/quicktime',
        '.mp3': 'audio/mpeg'
      };
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      const stat = fs.statSync(normalizedPath);
      const fileSize = stat.size;
      const rangeHeader = request.headers.get('Range');
      const respHeaders = new Headers();
      respHeaders.set('Content-Type', contentType);
      respHeaders.set('Accept-Ranges', 'bytes');
      respHeaders.set('Access-Control-Allow-Origin', '*');

      if (rangeHeader) {
        const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
        if (match) {
          const start = parseInt(match[1], 10);
          const end = match[2] ? parseInt(match[2], 10) : fileSize - 1;
          const chunkSize = end - start + 1;
          respHeaders.set('Content-Range', `bytes ${start}-${end}/${fileSize}`);
          respHeaders.set('Content-Length', String(chunkSize));
          const stream = fs.createReadStream(normalizedPath, { start, end });
          return new Response(stream, { status: 206, headers: respHeaders });
        }
      }
      respHeaders.set('Content-Length', String(fileSize));
      return new Response(fs.createReadStream(normalizedPath), { status: 200, headers: respHeaders });
    } catch (err) {
      console.error('media protocol serve error:', err);
      return new Response('Error serving file', { status: 500 });
    }
  });

  // 윈도우 파일 연결 인수 검사
  checkFileArgument();

  // 백엔드 Express 서버 기동 생략 (순수 데스크톱 전환)
  createWindow(activePort);
});

app.on('window-all-closed', function () {
  // 모든 창이 닫히면 앱을 종료합니다 (백엔드 서버 포트도 함께 해제됨)
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow(activePort);
  }
});

// 🔒 [ 순수 데스크톱 파일 제어 IPC 핸들러 등록 ]

// 0. 초기 파일 연결 경로 조회 (renderer가 준비된 후 pull 방식으로 가져감)
ipcMain.handle('get-initial-file-path', () => {
  const path = filePathToOpen;
  filePathToOpen = null;
  return path;
});

// 0-1. 마지막 세션 데이터 저장 (오픈된 탭 파일 경로 목록 + 활성 탭 파일 경로)
ipcMain.handle('session:saveLastSession', (event, sessionData) => {
  try {
    const userDataPath = app.getPath('userData');
    const sessionPath = path.join(userDataPath, 'session.json');
    const data = {
      openFilePaths: sessionData?.openFilePaths || [],
      activeFilePath: sessionData?.activeFilePath || null,
      savedAt: new Date().toISOString()
    };
    fs.writeFileSync(sessionPath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('[session:saveLastSession] 오류:', e);
    return false;
  }
});

// 0-2. 마지막 세션 데이터 복원 (존재하는 파일들만 유효성 체크 후 반환)
ipcMain.handle('session:getLastSession', () => {
  try {
    const userDataPath = app.getPath('userData');
    const sessionPath = path.join(userDataPath, 'session.json');
    if (!fs.existsSync(sessionPath)) return null;
    const data = JSON.parse(fs.readFileSync(sessionPath, 'utf-8'));
    
    // 파일이 디스크에 실제 존재하고 있는 것만 필터링
    const validOpenPaths = (data?.openFilePaths || []).filter(filePath => 
      filePath && fs.existsSync(filePath)
    );
    const activePath = data?.activeFilePath;
    const validActivePath = (activePath && fs.existsSync(activePath)) ? activePath : null;

    return {
      openFilePaths: validOpenPaths,
      activeFilePath: validActivePath
    };
  } catch (e) {
    console.error('[session:getLastSession] 오류:', e);
    return null;
  }
});

// 2. 현재 파일 덮어쓰기 저장 핸들러
ipcMain.handle('file:save', async (event, filePath, content) => {
  try {
    const cleanPath = filePath.normalize('NFC');
    fs.writeFileSync(cleanPath, content, 'utf-8');
    return true;
  } catch (e) {
    console.error('로컬 파일 덮어쓰기 저장 실패:', e);
    throw e;
  }
});

// 3. 다른 이름으로 저장 핸들러 (워크스페이스 폴더 우선, suggestedName 및 커스텀 필터 지원)
ipcMain.handle('file:saveAs', async (event, content, suggestedName, defaultDir, filters) => {
  const defaultName = suggestedName || 'untitled.md';
  const cleanDefaultDir = defaultDir ? defaultDir.normalize('NFC') : undefined;
  const startDir = cleanDefaultDir && fs.existsSync(cleanDefaultDir) ? cleanDefaultDir : app.getPath('documents');
  const targetFilters = filters || [{ name: 'Markdown Files', extensions: ['md'] }];
  
  const result = await dialog.showSaveDialog(mainWindow, {
    title: '다른 이름으로 저장',
    defaultPath: path.join(startDir, defaultName),
    filters: targetFilters
  });

  if (result.canceled || !result.filePath) {
    return null;
  }

  const filePath = result.filePath.normalize('NFC');
  try {
    if (content.startsWith('data:') && content.includes(';base64,')) {
      const base64Data = content.split(';base64,')[1];
      fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
    } else {
      fs.writeFileSync(filePath, content, 'utf-8');
    }
    return {
      name: path.basename(filePath),
      path: filePath
    };
  } catch (e) {
    console.error('로컬 다른 이름 저장 실패:', e);
    throw e;
  }
});

// 4.5 프론트엔드에서 저장 다이얼로그 호출
ipcMain.handle('dialog:showSaveDialog', async (event, options) => {
  if (!mainWindow) return { canceled: true };
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

// 4. 프론트엔드에서 폴더 선택 다이얼로그 호출 시 OS 표준 창 띄우기
//    기본 경로는 사용자 Documents 폴더 혹은 전달받은 defaultPath
ipcMain.handle('dialog:selectFolder', async (event, defaultPath) => {
  if (!mainWindow) return { status: 'canceled' };
  
  // 💡 [요구사항 2] 전달받은 경로 문자열을 윈도우 파일 시스템 표준 경로구분자(path.sep)로 정밀 변환 및 NFC 노멀라이징 수행
  let cleanDefault = defaultPath ? defaultPath.normalize('NFC') : undefined;
  if (cleanDefault) {
    cleanDefault = path.resolve(cleanDefault.replace(/\//g, path.sep));
  }
  
  let startDir = cleanDefault && fs.existsSync(cleanDefault) && fs.statSync(cleanDefault).isDirectory()
    ? cleanDefault
    : app.getPath('documents');

  // 💡 [요구사항 2] 윈도우 OS 표준 다이얼로그의 폴더 입력란에 현재 폴더명이 자동으로 입력되게 하기 위한 보정
  // 윈도우 OS에서는 openDirectory와 openFile을 동시에 주면 부모 폴더가 열리면서 폴더명이 입력창에 pre-fill되게 할 수 있습니다.
  let properties = ['openDirectory', 'createDirectory'];
  if (process.platform === 'win32') {
    properties = ['openDirectory', 'openFile', 'createDirectory'];
  }

  const result = await dialog.showOpenDialog(mainWindow, {
    title: defaultPath ? `워크스페이스 폴더 선택 - ${defaultPath}` : '워크스페이스 폴더 선택',
    defaultPath: startDir,
    properties: properties
  });
  if (result.canceled || result.filePaths.length === 0) {
    return { status: 'canceled' };
  }
  const finalPath = result.filePaths[0];
  return { status: 'success', path: finalPath };
});

// 5. 절대 경로를 지정하여 직접 파일 내용 읽기
ipcMain.handle('file:readFromPath', async (event, filePath) => {
  try {
    let cleanPath = filePath.normalize('NFC');
    
    // 윈도우 슬래시 스타일 포함하여 절대 경로 정밀 판별
    const normalizedPath = filePath.replace(/\\/g, '/');
    const isAbsolute = path.isAbsolute(filePath) || /^[a-zA-Z]:\//.test(normalizedPath) || filePath.startsWith('/');

    if (isAbsolute) {
      cleanPath = filePath;
    } else if (filePath.startsWith('docs/help/')) {
      const projectRoot = app.getAppPath();
      cleanPath = path.join(projectRoot, filePath).normalize('NFC');
    } else {
      // 기존 로직: 개발/번들 내부, 설치된 환경 외부 리소스 순서로 탐색
      // 📌 Next.js 정적 빌드 시 public/ 폴더 내용이 out/ 폴더로 자동 복사됨.
      //    패키징 대상이 frontend/out/**/* 이므로 help 파일은 frontend/out/help/ 에 실재함.
      //    따라서 frontend/out 경로를 최우선으로 탐색하도록 설정.
      const pathsToTry = [
        path.join(app.getAppPath(), 'frontend/out', filePath),
        path.join(app.getAppPath(), filePath),
        path.join(app.getAppPath(), 'frontend/public', filePath),
        path.join(process.resourcesPath, 'frontend/out', filePath),
        path.join(process.resourcesPath, filePath),
        path.join(process.resourcesPath, 'frontend/public', filePath)
      ];
      
      let foundPath = '';
      for (const p of pathsToTry) {
        const normalizedP = p.normalize('NFC');
        if (fs.existsSync(normalizedP)) {
          cleanPath = normalizedP;
          break;
        }
      }
      if (!cleanPath && !path.isAbsolute(filePath)) {
         throw new Error(`파일을 찾을 수 없습니다: ${filePath}`);
      }
    }

    // 최종 검증
    if (!fs.existsSync(cleanPath)) {
      throw new Error(`파일을 찾을 수 없습니다: ${filePath}`);
    }
      
    const content = fs.readFileSync(cleanPath, 'utf-8');
    return {
      name: path.basename(cleanPath),
      path: cleanPath,
      content: content
    };
  } catch (e) {
    console.error('로컬 파일 절대경로 읽기 실패:', e);
    throw e;
  }
});

// 폴더 아래의 모든 .md 파일을 재귀적으로 찾는 헬퍼 함수
function getAllMdFiles(dirPath, fileList = []) {
  try {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        getAllMdFiles(filePath, fileList);
      } else if (stat.isFile() && file.toLowerCase().endsWith('.md')) {
        fileList.push(filePath);
      }
    });
  } catch (e) {
    console.error('폴더 스캔 에러:', e);
  }
  return fileList;
}

// 6. 드라이브 목록 조회 (Windows 탐색기)
ipcMain.handle('file:getDrives', async () => {
  try {
    const { execSync } = require('child_process');
    const output = execSync('wmic logicaldisk get caption 2>nul').toString();
    return output.split('\n').slice(1).map(s => s.trim()).filter(s => s.length > 0);
  } catch (e) {
    const drives = [];
    for (let i = 65; i <= 90; i++) {
      const letter = String.fromCharCode(i) + ':\\';
      try {
        if (fs.existsSync(letter)) drives.push(letter);
      } catch (ex) {}
    }
    return drives;
  }
});



// 워크스페이스 실시간 감지 (chokidar)
let workspaceWatcher = null;
ipcMain.handle('file:watchWorkspace', (event, workspacePath) => {
  try {
    if (workspaceWatcher) {
      workspaceWatcher.close();
      workspaceWatcher = null;
    }
    if (!workspacePath) return;

    const cleanPath = workspacePath.normalize('NFC');
    workspaceWatcher = chokidar.watch(cleanPath, {
      ignored: [/(^|[\/])\../, '**/node_modules/**', '**/.git/**', '**/.next/**', '**/.vscode/**'],
      persistent: true,
      ignoreInitial: true,
      depth: 10
    });

    const notify = () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('workspace-changed');
      }
    };

    workspaceWatcher
      .on('add', notify)
      .on('unlink', notify)
      .on('addDir', notify)
      .on('unlinkDir', notify)
      .on('change', notify);

    return { success: true };
  } catch (e) {
    console.error('watchWorkspace 오류:', e);
    return { success: false, error: e.message };
  }
});

// 7. 디렉토리 파일 목록 조회 (Windows 탐색기)
ipcMain.handle('file:listDirectory', async (event, dirPath) => {
  try {
    const cleanPath = dirPath.normalize('NFC');
    const entries = fs.readdirSync(cleanPath, { withFileTypes: true });
    const nodes = entries
      .filter(entry => {
        if (['node_modules', '.git', '.next', '.vscode'].includes(entry.name)) return false;
        if (entry.isFile()) {
          const nameLower = entry.name.toLowerCase();
          return nameLower.endsWith('.md') || nameLower.endsWith('.markdown') || nameLower.endsWith('.bib');
        }
        return true;
      })
      .map(entry => {
        const fullPath = path.join(cleanPath, entry.name);
        if (entry.isDirectory()) {
          return { name: entry.name, kind: 'directory', path: fullPath };
        } else {
          return { name: entry.name, kind: 'file', path: fullPath };
        }
      })
      .sort((a, b) => {
        if (a.kind === b.kind) return a.name.localeCompare(b.name, 'ko', { numeric: true });
        return a.kind === 'directory' ? -1 : 1;
      });
    return nodes;
    } catch (e) {
      if (e.code === 'ENOENT') {
        // 폴더가 삭제되었거나 이동된 직후 React가 언마운트되기 전 호출된 경우 무시
        return [];
      }
      console.error(`[Electron] listDirectory 오류 - 경로: [${dirPath}]:`, e);
      throw e; // 하위 에러를 삼키지 않고 프론트엔드로 전파
    }
});

// 9. 파일/폴더 이름 변경
ipcMain.handle('file:rename', async (event, oldPath, newPath) => {
  try {
    const cleanOld = oldPath.normalize('NFC');
    const cleanNew = newPath.normalize('NFC');
    if (!fs.existsSync(cleanOld)) {
      return { success: true, skipped: true };
    }
    const destDir = path.dirname(cleanNew);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    try {
      fs.renameSync(cleanOld, cleanNew);
    } catch (renameErr) {
      const stat = fs.statSync(cleanOld);
      if (stat.isDirectory()) {
        fs.cpSync(cleanOld, cleanNew, { recursive: true });
        fs.rmSync(cleanOld, { recursive: true, force: true });
      } else {
        fs.copyFileSync(cleanOld, cleanNew);
        fs.unlinkSync(cleanOld);
      }
    }
    return { success: true };
  } catch (e) {
    console.error('파일 이름 변경 실패:', e);
    throw e;
  }
});

// 9-1. 파일/폴더 복사 (Copy & Paste)
ipcMain.handle('file:copy', async (event, srcPath, destPath) => {
  try {
    const cleanSrc = srcPath.normalize('NFC');
    let cleanDest = destPath.normalize('NFC');

    if (!fs.existsSync(cleanSrc)) {
      throw new Error(`원본 파일 또는 폴더가 존재하지 않습니다: ${cleanSrc}`);
    }

    const srcStat = fs.statSync(cleanSrc);
    const isDir = srcStat.isDirectory();

    // 만약 대상 경로에 이미 파일이나 폴더가 존재하면 중복 방지 이름 생성
    if (fs.existsSync(cleanDest)) {
      const parsed = path.parse(cleanDest);
      const ext = isDir ? '' : parsed.ext;
      const base = isDir ? parsed.base : parsed.name;
      const dir = parsed.dir;

      let counter = 1;
      let candidate = path.join(dir, `${base}_copy${ext}`);
      while (fs.existsSync(candidate)) {
        counter++;
        candidate = path.join(dir, `${base}_copy${counter}${ext}`);
      }
      cleanDest = candidate;
    }

    // 대상 부모 디렉토리가 없으면 생성
    const destParent = path.dirname(cleanDest);
    if (!fs.existsSync(destParent)) {
      fs.mkdirSync(destParent, { recursive: true });
    }

    if (isDir) {
      fs.cpSync(cleanSrc, cleanDest, { recursive: true });
    } else {
      fs.copyFileSync(cleanSrc, cleanDest);
    }

    return { success: true, newPath: cleanDest };
  } catch (e) {
    console.error('파일/폴더 복사 실패:', e);
    throw e;
  }
});

// 10. 파일/폴더 삭제
ipcMain.handle('file:delete', async (event, targetPath) => {
  try {
    const cleanPath = targetPath.normalize('NFC');
    if (!fs.existsSync(cleanPath)) {
      return { success: true, alreadyDeleted: true };
    }
    const stat = fs.statSync(cleanPath);
    if (stat.isDirectory()) {
      const items = fs.readdirSync(cleanPath);
      if (items.length > 0) {
        throw new Error('ENOTEMPTY: directory not empty');
      }
      fs.rmdirSync(cleanPath);
    } else {
      fs.unlinkSync(cleanPath);
    }
    return { success: true };
  } catch (e) {
    console.error('파일 삭제 실패:', e);
    throw e;
  }
});

// 11. 새 파일 생성
ipcMain.handle('file:createFile', async (event, parentPath, name) => {
  try {
    const cleanParent = parentPath.normalize('NFC');
    const cleanName = name.normalize('NFC');
    const fullPath = path.join(cleanParent, cleanName);
    fs.writeFileSync(fullPath, '', 'utf-8');
    return { success: true, path: fullPath };
  } catch (e) {
    console.error('파일 생성 실패:', e);
    throw e;
  }
});

// 12. 새 폴더 생성
ipcMain.handle('file:createFolder', async (event, parentPath, name) => {
  try {
    const cleanParent = parentPath.normalize('NFC');
    const cleanName = name.normalize('NFC');
    const fullPath = path.join(cleanParent, cleanName);
    fs.mkdirSync(fullPath, { recursive: true });
    return { success: true, path: fullPath };
  } catch (e) {
    console.error('폴더 생성 실패:', e);
    throw e;
  }
});

// 13. 폴더 아래의 모든 마크다운 파일 내용 검색
ipcMain.handle('file:searchInFolder', async (event, { folderPath, searchTerm, matchCase, useRegex }) => {
  try {
    const mdFiles = getAllMdFiles(folderPath);
    const results = [];
    
    let regex;
    const escaped = searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    if (useRegex) {
      try {
        regex = new RegExp(searchTerm, matchCase ? 'g' : 'gi');
      } catch(e) {
        regex = new RegExp(escaped, matchCase ? 'g' : 'gi');
      }
    } else {
      regex = new RegExp(escaped, matchCase ? 'g' : 'gi');
    }

    for (const filePath of mdFiles) {
      const fileName = path.basename(filePath);
      const fileNameWithoutExt = path.basename(filePath, path.extname(filePath));
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      const snippets = [];
      const lineNumbers = [];
      let fileNameMatched = false;

      // 파일명 검사
      regex.lastIndex = 0;
      if (regex.test(fileName) || regex.test(fileNameWithoutExt)) {
        fileNameMatched = true;
      }

      // 내용 검사
      lines.forEach((line, index) => {
        regex.lastIndex = 0;
        if (regex.test(line)) {
          snippets.push(`Line ${index + 1}: ${line.trim()}`);
          lineNumbers.push(index + 1);
        }
      });

      if (snippets.length > 0) {
        results.push({
          fileName,
          path: filePath,
          count: snippets.length,
          snippets,
          lineNumbers
        });
      } else if (fileNameMatched) {
        results.push({
          fileName,
          path: filePath,
          count: 0,
          snippets: [],
          lineNumbers: [],
          fileNameMatch: true
        });
      }
    }
    return results;
  } catch (e) {
    console.error("폴더 전역 검색 에러:", e);
    throw e;
  }
});

// 14. OS 네이티브 폰트 공통 대화상자 호출 핸들러 (PowerShell 활용)
ipcMain.handle('dialog:openFontPicker', async () => {
  return new Promise((resolve) => {
    // 🔒 PowerShell을 사용하여 윈도우 순정 FontDialog 호출
    // Win32 API SetThreadPreferredUILanguages 및 SetThreadUILanguage를 결합하여
    // 영문 윈도우 OS나 시스템 로케일에 상관없이 대화상자 리소스를 '한국어'로 완전 강제 로드하도록 수술합니다.
    const command = `powershell -Command "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; [void][System.Reflection.Assembly]::LoadWithPartialName('System.Drawing'); [void][System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms'); Add-Type -MemberDefinition ('[DllImport(' + [char]34 + 'kernel32.dll' + [char]34 + ', CharSet=System.Runtime.InteropServices.CharSet.Unicode)] public static extern bool SetThreadPreferredUILanguages(uint dwFlags, string pwszLanguagesBuffer, ref uint pulNumLanguages);') -Name 'Mui' -Namespace 'Win32' -PassThru | Out-Null; $n = 0; [Win32.Mui]::SetThreadPreferredUILanguages(8, 'ko-KR' + [char]0, [ref]$n); [System.Threading.Thread]::CurrentThread.CurrentCulture = New-Object System.Globalization.CultureInfo('ko-KR'); [System.Threading.Thread]::CurrentThread.CurrentUICulture = New-Object System.Globalization.CultureInfo('ko-KR'); Add-Type -MemberDefinition ('[DllImport(' + [char]34 + 'kernel32.dll' + [char]34 + ')] public static extern ushort SetThreadUILanguage(ushort LangId);') -Name 'Kernel32' -Namespace 'Win32' -PassThru | Out-Null; [Win32.Kernel32]::SetThreadUILanguage(1042); $d = New-Object System.Windows.Forms.FontDialog; $d.Font = New-Object System.Drawing.Font('맑은 고딕', 10); $d.ShowColor = $false; if($d.ShowDialog() -eq 'OK') { Write-Output ($d.Font.Name + '|' + $d.Font.Size) } else { Write-Output 'cancel' }"`
    
    const { exec } = require('child_process');
    exec(command, (error, stdout) => {
      if (error || !stdout || stdout.trim() === 'cancel') {
        resolve(null);
        return;
      }
      const [family, size] = stdout.trim().split('|');
      resolve(JSON.stringify({ family, size: parseFloat(size) || 13 }));
    });
  });
});

// 15. Windows/macOS 네이티브 시스템 이모지 피커 호출 핸들러
ipcMain.handle('system:showEmojiPicker', () => {
  try {
    app.showEmojiPanel();
    return true;
  } catch (e) {
    console.error("네이티브 이모지 패널 호출 실패:", e);
    return false;
  }
});

// 15. 라이선스 키 로드 핸들러 (데스크탑 영구 저장 연동)
ipcMain.handle('license:load', async () => {
  try {
    const userDataPath = app.getPath('userData');
    const licenseFilePath = path.join(userDataPath, '.license');
    if (fs.existsSync(licenseFilePath)) {
      return fs.readFileSync(licenseFilePath, 'utf-8').trim();
    }
    return null;
  } catch (e) {
    console.error('라이선스 키 로드 실패:', e);
    return null;
  }
});

// 16. 라이선스 키 저장 핸들러 (데스크탑 영구 저장 연동)
ipcMain.handle('license:save', async (event, licenseKey) => {
  try {
    const userDataPath = app.getPath('userData');
    const licenseFilePath = path.join(userDataPath, '.license');
    fs.writeFileSync(licenseFilePath, licenseKey, 'utf-8');
    return true;
  } catch (e) {
    console.error('라이선스 키 저장 실패:', e);
    return false;
  }
});

// 하이브리드 라이선스 전체 정보 로드 핸들러
ipcMain.handle('license:load-full', async () => {
  try {
    const userDataPath = app.getPath('userData');
    const licenseJsonPath = path.join(userDataPath, 'license.json');
    if (fs.existsSync(licenseJsonPath)) {
      const raw = fs.readFileSync(licenseJsonPath, 'utf-8');
      return JSON.parse(raw);
    }
    return null;
  } catch (e) {
    console.error('라이선스 전체 정보 로드 실패:', e);
    return null;
  }
});

// 하이브리드 라이선스 전체 정보 저장 핸들러
ipcMain.handle('license:save-full', async (event, data) => {
  try {
    const userDataPath = app.getPath('userData');
    const licenseJsonPath = path.join(userDataPath, 'license.json');
    fs.writeFileSync(licenseJsonPath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('라이선스 전체 정보 저장 실패:', e);
    return false;
  }
});

// 물리 기기 고유 ID 수집 핸들러
ipcMain.handle('license:get-device-id', async () => {
  try {
    const { execSync } = require('child_process');
    if (process.platform === 'win32') {
      const output = execSync('powershell -Command "Get-CimInstance Win32_ComputerSystemProduct | Select-Object -ExpandProperty UUID"', { encoding: 'utf-8' });
      return output.trim();
    } else if (process.platform === 'darwin') {
      const output = execSync("ioreg -rd1 -c IOPlatformExpertDevice | awk '/IOPlatformUUID/ { split($0, line, \"\\\"\"); print line[4] }'", { encoding: 'utf-8' });
      return output.trim();
    } else {
      const output = fs.readFileSync('/var/lib/dbus/machine-id', 'utf-8');
      return output.trim();
    }
  } catch (err) {
    console.error('물리 기기 ID 획득 실패:', err);
  }
  return 'fallback-machine-id-' + process.platform;
});

// 23. 파일명 클립보드에 복사 API
ipcMain.handle('clipboard:copyText', (event, text) => {
  try {
    const { clipboard } = require('electron');
    clipboard.writeText(text);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// 24. 클립보드에서 네이티브 이미지 읽기 API (윈도우 캡쳐 0바이트/누락 버그 우회용)
ipcMain.handle('clipboard:readImage', () => {
  try {
    const { clipboard } = require('electron');
    const image = clipboard.readImage();
    if (!image.isEmpty()) {
      return image.toDataURL();
    }
    return null;
  } catch (err) {
    return null;
  }
});

// 시스템 브라우저 외부 링크 실행 핸들러
ipcMain.handle('system:openExternal', async (event, url) => {
  try {
    const { shell } = require('electron');
    shell.openExternal(url);
    return true;
  } catch (e) {
    console.error('외부 링크 기동 실패:', e);
    return false;
  }
});

// 17. 환경설정 로드 핸들러 (데스크탑 영구 저장 연동)
ipcMain.handle('settings:load', async () => {
  try {
    const userDataPath = app.getPath('userData');
    const settingsFilePath = path.join(userDataPath, 'settings.json');
    if (fs.existsSync(settingsFilePath)) {
      return JSON.parse(fs.readFileSync(settingsFilePath, 'utf-8'));
    }
    return null;
  } catch (e) {
    console.error('환경설정 로드 실패:', e);
    return null;
  }
});

// 18. 환경설정 저장 핸들러 (데스크탑 영구 저장 연동)
ipcMain.handle('settings:save', async (event, settings) => {
  try {
    const userDataPath = app.getPath('userData');
    const settingsFilePath = path.join(userDataPath, 'settings.json');
    fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('환경설정 저장 실패:', e);
    return false;
  }
});

// 19. 이미지 파일 저장 핸들러 (붙여넣기 대응)
ipcMain.handle('file:saveImage', async (event, targetFolder, base64Data, fileName) => {
  try {
    let rawFolder = targetFolder ? targetFolder.normalize('NFC') : '';
    let isRelative = false;
    
    // targetFolder가 .md 파일 경로인 경우 부모 디렉토리 사용
    if (rawFolder && (rawFolder.endsWith('.md') || rawFolder.endsWith('.markdown'))) {
      rawFolder = path.dirname(rawFolder);
    }
    
    if (rawFolder && fs.existsSync(rawFolder)) {
      // 대상 워크스페이스/파일 디렉토리 하위에 'assets' 폴더를 생성 및 타겟팅
      const folderName = path.basename(rawFolder).toLowerCase();
      if (folderName !== 'assets' && folderName !== 'media') {
        rawFolder = path.join(rawFolder, 'assets');
      }
      if (!fs.existsSync(rawFolder)) {
        fs.mkdirSync(rawFolder, { recursive: true });
      }
      isRelative = true;
    } else {
      // 대상 폴더가 유효하지 않은 경우 사용자 문서 디렉토리 하위의 'OnriviAuthorAssets'에 임시 저장
      const documentsPath = app.getPath('documents');
      const tempAssetsFolder = path.join(documentsPath, 'OnriviAuthorAssets');
      if (!fs.existsSync(tempAssetsFolder)) {
        fs.mkdirSync(tempAssetsFolder, { recursive: true });
      }
      rawFolder = tempAssetsFolder;
      isRelative = false;
    }

    const absolutePath = path.join(rawFolder, fileName);
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(absolutePath, buffer);

    const finalFolderName = path.basename(rawFolder);

    return {
      success: true,
      fileName,
      absolutePath: absolutePath,
      isRelative: isRelative,
      mediaPath: isRelative ? `/${finalFolderName}/${fileName}` : null
    };
  } catch (e) {
    console.error('이미지 저장 실패 (Electron):', e);
    return { success: false, error: e.message };
  }
});

// 20. 다중 파일 병합 (IPC — 백엔드 서버 불필요)
ipcMain.handle('file:mergeFiles', async (event, { sourcePaths, targetPath, deleteSources, separator, generateToc, insertPageBreak, shiftHeadings }) => {
  try {
    if (!sourcePaths || !Array.isArray(sourcePaths) || sourcePaths.length < 2) {
      return { success: false, error: 'At least two source files are required for merging.' };
    }
    if (!targetPath) {
      return { success: false, error: 'Target path is required.' };
    }

    const contents = [];
    const tocLines = [];
    
    // 타겟 폴더 절대 경로
    const targetDir = path.dirname(targetPath);

    for (const src of sourcePaths) {
      let fileContent = fs.readFileSync(src, 'utf-8');
      
      // 1. 프론트매터(YAML) 제거 로직
      fileContent = fileContent.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');

      // 1.5. 헤딩 강등 (Heading Shift)
      if (shiftHeadings) {
        fileContent = fileContent.replace(/^(#{1,5})(\s)/gm, '$1#$2');
      }

      // 2. 상대 경로 보정 로직 (이미지 및 링크)
      // 정규식: ![alt](path) 또는 [text](path)
      fileContent = fileContent.replace(/(!?\[.*?\])\((.*?)\)/g, (match, prefix, linkPath) => {
        // 이미 절대 경로이거나 외부 URL, data URI인 경우 건너뜀
        if (
          linkPath.startsWith('http://') || 
          linkPath.startsWith('https://') || 
          linkPath.startsWith('data:') || 
          linkPath.startsWith('/')
        ) {
          return match;
        }

        // src 파일이 위치한 폴더를 기준으로 링크의 절대 경로를 계산
        const srcDir = path.dirname(src);
        const absoluteLinkPath = path.resolve(srcDir, linkPath);

        // 타겟 폴더를 기준으로 새로운 상대 경로 계산
        let newRelativePath = path.relative(targetDir, absoluteLinkPath);

        // Windows 경로 구분자(\)를 웹 호환 슬래시(/)로 변환
        newRelativePath = newRelativePath.replace(/\\/g, '/');

        return `${prefix}(${newRelativePath})`;
      });

      const fileName = path.basename(src);
      const titleLabel = fileName.replace(/\.[^/.]+$/, "");

      if (generateToc) {
        const anchor = titleLabel.toLowerCase().replace(/\s+/g, '-');
        tocLines.push(`- [${titleLabel}](#${anchor})`);
      }

      let formattedContent = fileContent;
      if (separator === 'title') {
        formattedContent = `## ${titleLabel}\n\n${fileContent}`;
      }
      contents.push(formattedContent);
    }

    let joinSeparator = '\n\n';
    if (insertPageBreak) joinSeparator = '\n\n<hr class="page-break" />\n\n';
    else if (separator === 'divider') joinSeparator = '\n\n---\n\n';
    else if (separator === 'none') joinSeparator = '\n';
    else if (separator === 'title') joinSeparator = '\n\n';

    let mergedContent = contents.join(joinSeparator);

    if (generateToc) {
      const tocSection = `# 목차\n\n${tocLines.join('\n')}\n\n${insertPageBreak ? '<hr class="page-break" />\n\n' : '---\n\n'}`;
      mergedContent = tocSection + mergedContent;
    }

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetPath, mergedContent, 'utf-8');

    if (deleteSources) {
      for (const src of sourcePaths) {
        if (src !== targetPath) {
          fs.rmSync(src, { recursive: true, force: true });
        }
      }
    }

    return { success: true, path: targetPath };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

// 21. PDF 인쇄 (webContents.printToPDF API 연동)
ipcMain.handle('pdf:printToPDF', async (event, options) => {
  if (!mainWindow) throw new Error("메인 윈도우 인스턴스가 존재하지 않습니다.");
  try {
    const pdfBuffer = await mainWindow.webContents.printToPDF(options);
    return pdfBuffer;
  } catch (e) {
    console.error('Electron printToPDF 에러:', e);
    throw e;
  }
});

// 21-2. HTML 기반 PDF 인쇄 (임시 오프스크린 창 빌드 및 네이티브 printToPDF 구동)
ipcMain.handle('pdf:printHTMLToPDF', async (event, html, options) => {
  let printWindow = null;
  let tempFilePath = null;
  try {
    // 1. 화면에 표시하지 않는 오프스크린 BrowserWindow 생성
    printWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      }
    });

    // 2. 대용량 HTML 처리를 위해 임시 파일 생성 및 로드
    tempFilePath = path.join(app.getPath('temp'), `onrivi_author_print_${Date.now()}.html`);
    fs.writeFileSync(tempFilePath, html, 'utf8');
    
    await printWindow.loadFile(tempFilePath);

    // 3. 웹 폰트 및 스타일 렌더링 리플로우 시간 충분히 부여
    await new Promise(resolve => setTimeout(resolve, 800));

    // 4. Chromium 네이티브 A4 인쇄 규격으로 PDF 파일 구워내기
    const pdfOptions = {
      margins: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      },
      pageSize: 'A4',
      printBackground: true,
      ...options
    };
    
    const pdfBuffer = await printWindow.webContents.printToPDF(pdfOptions);
    return pdfBuffer;
  } catch (e) {
    console.error('Electron printHTMLToPDF 에러:', e);
    throw e;
  } finally {
    if (printWindow) {
      printWindow.close();
    }
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (err) {
        console.warn("임시 인쇄 파일 삭제 오류:", err);
      }
    }
  }
});

// 22. 로컬 이미지를 Base64 Data URI로 직접 읽기 (CORS 및 fetch 우회용)
ipcMain.handle('file:readImageAsBase64', async (event, filePath) => {
  try {
    const cleanPath = filePath.normalize('NFC');
    let targetPath = cleanPath;
    
    if (!fs.existsSync(cleanPath)) {
      // 🛡️ [에셋 폴백 탐색] 로컬 절대 경로 파일이 존재하지 않는 경우
      const fileNameOnly = path.basename(cleanPath);
      const fallbackOutPath = path.join(__dirname, 'frontend/out', fileNameOnly);
      const fallbackPublicPath = path.join(__dirname, 'frontend/public', fileNameOnly);
      if (fs.existsSync(fallbackOutPath)) {
        targetPath = fallbackOutPath;
      } else if (fs.existsSync(fallbackPublicPath)) {
        targetPath = fallbackPublicPath;
      } else {
        throw new Error(`File not found: ${cleanPath}`);
      }
    }
    
    const buffer = fs.readFileSync(targetPath);
    const ext = path.extname(targetPath).toLowerCase();
    const mimeTypes = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp'
    };
    const contentType = mimeTypes[ext] || 'image/png';
    return `data:${contentType};base64,${buffer.toString('base64')}`;
  } catch (e) {
    console.error('file:readImageAsBase64 에러:', e);
    throw e;
  }
});

// ──────────────────────────────────────────────
// 사용자 서식 프로필 저장소 (Desktop 환경)
// ──────────────────────────────────────────────
ipcMain.handle('file:readProfiles', async (event, resourceFolder) => {
  try {
    let profilePath;
    if (resourceFolder && fs.existsSync(resourceFolder)) {
      profilePath = path.join(resourceFolder, 'profiles', 'userCssProfiles.json');
      const fallbackPath1 = path.join(resourceFolder, 'user_profiles.json');
      const fallbackPath2 = path.join(resourceFolder, 'userCssProfiles.json');
      
      let useFallback = false;
      if (!fs.existsSync(profilePath)) {
        useFallback = true;
      } else {
        try {
          const raw = fs.readFileSync(profilePath, 'utf-8');
          if (raw.trim() === '[]' || raw.trim() === '') {
            useFallback = true;
          }
        } catch(e) {}
      }

      if (useFallback) {
        if (fs.existsSync(fallbackPath1)) {
          profilePath = fallbackPath1;
        } else if (fs.existsSync(fallbackPath2)) {
          profilePath = fallbackPath2;
        }
      }
    } else {
      profilePath = path.join(app.getPath('userData'), 'user_profiles.json');
      // 이전 버전 호환성 체크 (userCssProfiles.json이 있으면 마이그레이션)
      const oldProfilePath = path.join(app.getPath('userData'), 'userCssProfiles.json');
      if (!fs.existsSync(profilePath) && fs.existsSync(oldProfilePath)) {
        profilePath = oldProfilePath;
      }
    }
    
    if (!fs.existsSync(profilePath)) return [];
    const raw = fs.readFileSync(profilePath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('프로필 읽기 실패:', e);
    return [];
  }
});

ipcMain.handle('file:saveProfiles', async (event, profiles, resourceFolder) => {
  try {
    let dataPath = path.join(app.getPath('userData'), 'user_profiles.json');
    if (resourceFolder && fs.existsSync(resourceFolder)) {
      const profilesDir = path.join(resourceFolder, 'profiles');
      if (!fs.existsSync(profilesDir)) {
        fs.mkdirSync(profilesDir, { recursive: true });
      }
      dataPath = path.join(profilesDir, 'userCssProfiles.json');
    }
    fs.writeFileSync(dataPath, JSON.stringify(profiles, null, 2), 'utf-8');
    return { success: true };
  } catch (error) {
    console.error('Failed to save profiles:', error);
    return { success: false, error: error.message };
  }
});

// ──────────────────────────────────────────────
// 리소스 폴더 5대 디렉토리 및 onrivi_knowledge.db 일괄 생성 핸들러
// ──────────────────────────────────────────────
ipcMain.handle('resourceFolder:initStructure', async (event, resourceFolder) => {
  try {
    if (!resourceFolder || !fs.existsSync(resourceFolder)) {
      return { success: false, error: 'FOLDER_NOT_FOUND' };
    }

    // 1. 5대 하위 디렉토리 생성
    const subDirs = ['profiles', 'prompt', 'bible', 'media', 'db'];
    for (const dir of subDirs) {
      const dirPath = path.join(resourceFolder, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    }

    // 2. 기본 파일 생성 (기존 파일 보존)
    const profilesFile = path.join(resourceFolder, 'profiles', 'userCssProfiles.json');
    if (!fs.existsSync(profilesFile)) {
      fs.writeFileSync(profilesFile, '[]', 'utf-8');
    }

    const promptDir = path.join(resourceFolder, 'prompt');
    const aiPromptsFile = path.join(promptDir, 'ai_prompts.json');
    if (!fs.existsSync(aiPromptsFile)) {
      fs.writeFileSync(aiPromptsFile, '{}', 'utf-8');
    }
    const aiPresetsFile = path.join(promptDir, 'ai_presets.json');
    if (!fs.existsSync(aiPresetsFile)) {
      fs.writeFileSync(aiPresetsFile, '[]', 'utf-8');
    }
    const templatesFile = path.join(promptDir, 'promptTemplates.json');
    if (!fs.existsSync(templatesFile)) {
      fs.writeFileSync(templatesFile, '[]', 'utf-8');
    }

    const bibFile = path.join(resourceFolder, 'bible', 'references.bib');
    if (!fs.existsSync(bibFile)) {
      fs.writeFileSync(bibFile, '', 'utf-8');
    }

    // 3. db/onrivi_knowledge.db 생성 (★ 이미 존재하면 일체 손대지 않고 기존 데이터 100% 보존!)
    const dbPath = path.join(resourceFolder, 'db', 'onrivi_knowledge.db');
    if (!fs.existsSync(dbPath)) {
      try {
        let sqlite = null;
        try {
          const proc = globalThis.process;
          if (proc && typeof proc.getBuiltinModule === 'function') {
            sqlite = proc.getBuiltinModule('node:sqlite');
          }
        } catch (e) {}

        if (sqlite && sqlite.DatabaseSync) {
          const db = new sqlite.DatabaseSync(dbPath);
          db.exec('PRAGMA journal_mode = WAL;');
          db.exec('PRAGMA foreign_keys = ON;');
          db.exec(`
            CREATE TABLE IF NOT EXISTS knowledge_collections (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              description TEXT,
              color TEXT DEFAULT '#06C755',
              icon TEXT DEFAULT 'folder',
              created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
              updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
            );

            CREATE TABLE IF NOT EXISTS knowledge_documents (
              id TEXT PRIMARY KEY,
              collection_id TEXT,
              file_path TEXT NOT NULL UNIQUE,
              title TEXT NOT NULL,
              file_hash TEXT NOT NULL,
              file_size INTEGER NOT NULL DEFAULT 0,
              modified_at TEXT NOT NULL,
              summary TEXT,
              key_points TEXT,
              document_type TEXT DEFAULT 'other',
              priority INTEGER DEFAULT 3,
              status TEXT NOT NULL DEFAULT 'READY',
              error_message TEXT,
              analysis_version INTEGER DEFAULT 1,
              analyzer_model TEXT,
              analyzed_at TEXT,
              indexed_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
              FOREIGN KEY (collection_id) REFERENCES knowledge_collections(id) ON DELETE SET NULL
            );

            CREATE TABLE IF NOT EXISTS document_chunks (
              id TEXT PRIMARY KEY,
              document_id TEXT NOT NULL,
              heading_title TEXT NOT NULL,
              heading_path TEXT NOT NULL,
              heading_level INTEGER NOT NULL,
              chunk_index INTEGER NOT NULL,
              content TEXT NOT NULL,
              token_count INTEGER NOT NULL DEFAULT 0,
              char_count INTEGER NOT NULL DEFAULT 0,
              start_line INTEGER NOT NULL DEFAULT 1,
              end_line INTEGER NOT NULL DEFAULT 1,
              created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
              FOREIGN KEY (document_id) REFERENCES knowledge_documents(id) ON DELETE CASCADE
            );

            CREATE VIRTUAL TABLE IF NOT EXISTS document_chunks_fts USING fts5(
              chunk_id UNINDEXED,
              document_id UNINDEXED,
              heading_path,
              content,
              tokenize = 'unicode61'
            );

            CREATE TABLE IF NOT EXISTS document_tags (
              id TEXT PRIMARY KEY,
              document_id TEXT NOT NULL,
              tag_name TEXT NOT NULL,
              score REAL DEFAULT 1.0,
              source TEXT DEFAULT 'auto',
              created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
              FOREIGN KEY (document_id) REFERENCES knowledge_documents(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS knowledge_jobs (
              id TEXT PRIMARY KEY,
              job_type TEXT NOT NULL,
              file_path TEXT NOT NULL,
              status TEXT NOT NULL DEFAULT 'PENDING',
              error_message TEXT,
              retry_count INTEGER DEFAULT 0,
              created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
              finished_at TEXT
            );

            CREATE INDEX IF NOT EXISTS idx_docs_hash ON knowledge_documents(file_hash);
            CREATE INDEX IF NOT EXISTS idx_docs_status ON knowledge_documents(status);
            CREATE INDEX IF NOT EXISTS idx_chunks_doc_id ON document_chunks(document_id);
            CREATE INDEX IF NOT EXISTS idx_tags_doc_id ON document_tags(document_id);
            CREATE INDEX IF NOT EXISTS idx_tags_name ON document_tags(tag_name);
          `);
          db.close();
        } else {
          fs.writeFileSync(dbPath, '', 'utf-8');
        }
      } catch (dbErr) {
        console.error('[resourceFolder:initStructure DB Init Error]:', dbErr);
      }
    }

    return { success: true, path: resourceFolder };
  } catch (err) {
    console.error('[resourceFolder:initStructure Error]:', err);
    return { success: false, error: err.message };
  }
});

// 26. 로컬 보안 데이터 암복호화 (OS Keyring 연동)
ipcMain.handle('security:encrypt', async (event, plainText) => {
  const { safeStorage } = require('electron');
  if (safeStorage.isEncryptionAvailable() && plainText) {
    try {
      const buffer = safeStorage.encryptString(plainText);
      return buffer.toString('hex');
    } catch (e) {
      console.error('Encryption failed:', e);
    }
  }
  return plainText; // Fallback
});

ipcMain.handle('security:decrypt', async (event, cipherTextHex) => {
  const { safeStorage } = require('electron');
  if (safeStorage.isEncryptionAvailable() && cipherTextHex) {
    try {
      // Check if it's actually hex encoded
      const buffer = Buffer.from(cipherTextHex, 'hex');
      // A simple heuristic: if the length of the string is odd or not hex, it might be fallback plain text.
      // But Buffer.from handles it. safeStorage.decryptString will throw if invalid.
      return safeStorage.decryptString(buffer);
    } catch (e) {
      // If decryption fails, it might be unencrypted plain text from a previous version or fallback.
      return cipherTextHex;
    }
  }
  return cipherTextHex;
});


// --- AI Prompts and Presets IPC Handlers ---
ipcMain.handle('prompts:load', async (event, resourceFolder) => {
  try {
    if (!resourceFolder || resourceFolder.trim() === '' || !fs.existsSync(resourceFolder)) {
      return null;
    }
    const promptsFilePath = path.join(resourceFolder, 'prompt', 'ai_prompts.json');
    if (fs.existsSync(promptsFilePath)) {
      return JSON.parse(fs.readFileSync(promptsFilePath, 'utf-8'));
    }
    return null;
  } catch (e) {
    console.error('AI 프롬프트 로드 실패:', e);
    return null;
  }
});

ipcMain.handle('prompts:save', async (event, prompts, resourceFolder) => {
  fs.appendFileSync('d:/Developer/OnriviMarkDown/OnriviMarkDown/debug.log', `[prompts:save] resourceFolder: <${resourceFolder}>, type: ${typeof resourceFolder}, exists: ${fs.existsSync(resourceFolder)}\n`);
  try {
    if (!resourceFolder || resourceFolder.trim() === '' || !fs.existsSync(resourceFolder)) {
      return { success: false, error: 'NO_RESOURCE_FOLDER', receivedPath: resourceFolder };
    }
    const promptDir = path.join(resourceFolder, 'prompt');
    if (!fs.existsSync(promptDir)) {
      fs.mkdirSync(promptDir, { recursive: true });
    }
    const promptsFilePath = path.join(promptDir, 'ai_prompts.json');
    fs.writeFileSync(promptsFilePath, JSON.stringify(prompts, null, 2), 'utf-8');
    return { success: true };
  } catch (e) {
    console.error('AI 프롬프트 저장 실패:', e);
    return { success: false, error: e.message };
  }
});

ipcMain.handle('presets:load', async (event, resourceFolder) => {
  try {
    if (!resourceFolder || resourceFolder.trim() === '' || !fs.existsSync(resourceFolder)) {
      return null;
    }
    const presetsFilePath = path.join(resourceFolder, 'prompt', 'ai_presets.json');
    if (fs.existsSync(presetsFilePath)) {
      return JSON.parse(fs.readFileSync(presetsFilePath, 'utf-8'));
    }
    return null;
  } catch (e) {
    console.error('AI 프리셋 로드 실패:', e);
    return null;
  }
});

ipcMain.handle('presets:save', async (event, presets, resourceFolder) => {
  try {
    if (!resourceFolder || resourceFolder.trim() === '' || !fs.existsSync(resourceFolder)) {
      return { success: false, error: 'NO_RESOURCE_FOLDER', receivedPath: resourceFolder };
    }
    const promptDir = path.join(resourceFolder, 'prompt');
    if (!fs.existsSync(promptDir)) {
      fs.mkdirSync(promptDir, { recursive: true });
    }
    const presetsFilePath = path.join(promptDir, 'ai_presets.json');
    fs.writeFileSync(presetsFilePath, JSON.stringify(presets, null, 2), 'utf-8');
    return { success: true };
  } catch (e) {
    console.error('AI 프리셋 저장 실패:', e);
    return { success: false, error: e.message };
  }
});
