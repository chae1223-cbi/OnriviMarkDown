const { app, BrowserWindow, session, ipcMain, dialog, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const net = require('net'); // 빈 포트를 찾기 위한 네이티브 모듈 추가

// 🌐 [ media 프로토콜 Privilege 등록 - app.ready 이전에 호출되어야 함 ]
protocol.registerSchemesAsPrivileged([
  { scheme: 'media', privileges: { bypassCSP: true, secure: true, supportFetchAPI: true, corsEnabled: true } }
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
  app.setAsDefaultProtocolClient('onriviauthor');
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
                userId: userId || existingData.userId || ''
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
    const server = net.createServer();
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
            userId: userId || existingData.userId || ''
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

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    title: "온리비 어서",
    icon: path.join(__dirname, 'frontend/public/icon_onriveauther.png'),
       webPreferences: {
         nodeIntegration: false,
         contextIsolation: true,
         preload: path.join(__dirname, 'preload.js'),
         webSecurity: false, // 🛡️ Monaco 워커(CDN) 및 미디어 CORS를 위한 보안 정책 완화 (패키징 시 경고 사라짐)
         allowRunningInsecureContent: false,
       },
    // Windows 11 스타일의 깔끔한 프레임 디자인
    titleBarStyle: 'default',
    autoHideMenuBar: true, // 메뉴 바 자동 숨김으로 몰입도 극대화
  });

  // 🌐 [ 외부 링크 클릭 시 기본 웹 브라우저 새창으로 오픈하는 설정 ]
  // 1) target="_blank" 등으로 새 창을 띄우려는 시도를 가로채 시스템 브라우저로 실행
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    const isLocalApp = url.includes('localhost') || url.includes('127.0.0.1') || url.startsWith('file://');
    if (!isLocalApp && (url.startsWith('http:') || url.startsWith('https:'))) {
      const { shell } = require('electron');
      shell.openExternal(url);
    }
    return { action: 'deny' }; // 일렉트론 내부에서 새 창이 뜨는 것을 강제 차단
  });

  // 2) 내비게이션 인터셉터: 외부 링크는 시스템 브라우저로, 로컬 경로는 차단 (파일 탐색기 노출 방지)
  mainWindow.webContents.on('will-navigate', (event, url) => {
    // 로컬 앱 URL (localhost 개발서버, file:// 프로덕션 번들) 허용
    const isLocalApp = url.includes('localhost') || url.includes('127.0.0.1') || url.startsWith('file://');
    if (isLocalApp) {
      return; // 허용
    }
    event.preventDefault();
    if (url.startsWith('http:') || url.startsWith('https:')) {
      const { shell } = require('electron');
      shell.openExternal(url);
    }
  });

  // 🛡️ [ Content-Security-Policy 설정 ]
  // Monaco Editor가 eval()과 blob: 워커를 사용하므로 필요한 권한만 허용
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.gstatic.com https://maps.googleapis.com",
    "worker-src 'self' blob:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: http: https: file: media:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' ws: wss: https://maps.googleapis.com https://*.supabase.co wss://*.supabase.co",
    "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://maps.google.com https://www.google.com",
    "media-src 'self' media:"
  ];
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [cspDirectives.join('; ')]
      }
    });
  });

  // 프로덕션 빌드(패키징 완료)이거나 NO_SERVER 환경변수가 활성화된 경우 로컬 정적 HTML 로드
  if (app.isPackaged || process.env.NO_SERVER === 'true') {
    mainWindow.loadFile(path.join(__dirname, 'frontend/out/index.html'));
  } else {
    mainWindow.loadURL('http://localhost:3100');
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// 앱 구동 생명주기 시작
app.on('ready', async () => {
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
        '.mp3': 'audio/mpeg'
      };
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      const fileStream = fs.createReadStream(normalizedPath);
      return new Response(fileStream, {
        headers: { 
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*' 
        }
      });
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
      const pathsToTry = [
        path.join(app.getAppPath(), filePath),
        path.join(process.resourcesPath, filePath)
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
      // 최후의 수단: 하드코딩된 프로젝트 루트에서 시도 (빌드 환경 대비)
      const fallbackPath = path.join('D:\\developer\\OnriviMarkDown', filePath).normalize('NFC');
      if (fs.existsSync(fallbackPath)) {
        cleanPath = fallbackPath;
      } else {
        throw new Error(`파일을 찾을 수 없습니다: ${filePath}`);
      }
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
          return nameLower.endsWith('.md') || nameLower.endsWith('.markdown');
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
    console.error(`[Electron] listDirectory 오류 - 경로: [${dirPath}]:`, e);
    throw e; // 🛡️ 에러를 삼키지 않고 프론트엔드로 전파하여 파일 목록 유실 원인 추적 가능하게 함
  }
});

// 9. 파일/폴더 이름 변경
ipcMain.handle('file:rename', async (event, oldPath, newPath) => {
  try {
    const cleanOld = oldPath.normalize('NFC');
    const cleanNew = newPath.normalize('NFC');
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

// 10. 파일/폴더 삭제
ipcMain.handle('file:delete', async (event, targetPath) => {
  try {
    const cleanPath = targetPath.normalize('NFC');
    const stat = fs.statSync(cleanPath);
    if (stat.isDirectory()) {
      fs.rmSync(cleanPath, { recursive: true, force: true });
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
    let destFolder = targetFolder ? targetFolder.normalize('NFC') : '';
    let isRelative = false;
    
    if (destFolder && fs.existsSync(destFolder)) {
      // 대상 워크스페이스/파일 디렉토리 하위에 'assets' 폴더를 생성 및 타겟팅
      const assetsFolder = path.join(destFolder, 'assets');
      if (!fs.existsSync(assetsFolder)) {
        fs.mkdirSync(assetsFolder, { recursive: true });
      }
      destFolder = assetsFolder;
      isRelative = true;
    } else {
      // 대상 폴더가 유효하지 않은 경우 사용자 문서 디렉토리 하위의 'OnriviAuthorAssets'에 임시 저장
      const documentsPath = app.getPath('documents');
      const tempAssetsFolder = path.join(documentsPath, 'OnriviAuthorAssets');
      if (!fs.existsSync(tempAssetsFolder)) {
        fs.mkdirSync(tempAssetsFolder, { recursive: true });
      }
      destFolder = tempAssetsFolder;
      isRelative = false;
    }

    const absolutePath = path.join(destFolder, fileName);
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(absolutePath, buffer);

    return {
      success: true,
      absolutePath: absolutePath,
      isRelative: isRelative
    };
  } catch (e) {
    console.error('이미지 저장 실패 (Electron):', e);
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
ipcMain.handle('file:readProfiles', async () => {
  try {
    const profilePath = path.join(app.getPath('userData'), 'userCssProfiles.json');
    if (!fs.existsSync(profilePath)) return [];
    const raw = fs.readFileSync(profilePath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('프로필 읽기 실패:', e);
    return [];
  }
});

ipcMain.handle('file:saveProfiles', async (event, profiles) => {
  try {
    const profilePath = path.join(app.getPath('userData'), 'userCssProfiles.json');
    fs.writeFileSync(profilePath, JSON.stringify(profiles, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('프로필 저장 실패:', e);
    return false;
  }
});


