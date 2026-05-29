const { app, BrowserWindow, session, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const net = require('net'); // 빈 포트를 찾기 위한 네이티브 모듈 추가

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

// 🔒 [ 중복 실행 방지 (Single Instance Lock) 설정 ]
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // 이미 실행 중인 앱이 있으면 이 실행 프로세스를 즉각 폭파 종료
  app.quit();
} else {
  // 사용자가 이미 앱이 켜진 상태에서 또 exe를 더블 클릭하면 기존 창을 포커싱
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

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
    },
    // Windows 11 스타일의 깔끔한 프레임 디자인
    titleBarStyle: 'default',
    autoHideMenuBar: true, // 메뉴 바 자동 숨김으로 몰입도 극대화
  });

  // 🌐 [ 외부 링크 클릭 시 기본 웹 브라우저 새창으로 오픈하는 설정 ]
  // 1) target="_blank" 등으로 새 창을 띄우려는 시도를 가로채 시스템 브라우저로 실행
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      const { shell } = require('electron');
      shell.openExternal(url);
      return { action: 'deny' }; // 일렉트론 내부에서 창이 추가로 뜨는 것을 강제 차단
    }
    return { action: 'allow' };
  });

  // 2) 현재 화면 내에서 외부 링크로 주소가 이동되는 시도를 가로채 시스템 브라우저로 실행
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      const isLocalhost = url.includes('localhost') || url.includes('127.0.0.1');
      if (!isLocalhost) {
        event.preventDefault(); // 일렉트론 내부 내비게이션 중단
        const { shell } = require('electron');
        shell.openExternal(url);
      }
    }
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

// 1. 네이티브 파일 열기 대화상자 핸들러
ipcMain.handle('dialog:openFile', async (event, defaultPath) => {
  const cleanDefault = defaultPath ? defaultPath.normalize('NFC') : undefined;
  const startDir = cleanDefault && fs.existsSync(cleanDefault) && fs.statSync(cleanDefault).isDirectory()
    ? cleanDefault
    : app.getPath('documents');
  const result = await dialog.showOpenDialog(mainWindow, {
    title: defaultPath ? `파일 열기 - ${defaultPath}` : '파일 열기',
    defaultPath: startDir,
    properties: ['openFile'],
    filters: [{ name: 'Markdown Files', extensions: ['md', 'markdown', 'txt'] }]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const filePath = result.filePaths[0];
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return {
      name: path.basename(filePath),
      path: filePath,
      content: content
    };
  } catch (e) {
    console.error('로컬 파일 읽기 실패:', e);
    throw e;
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

// 3. 다른 이름으로 저장 핸들러 (워크스페이스 폴더 우선, suggestedName 지원)
ipcMain.handle('file:saveAs', async (event, content, suggestedName, defaultDir) => {
  const defaultName = suggestedName || 'untitled.md';
  const cleanDefaultDir = defaultDir ? defaultDir.normalize('NFC') : undefined;
  const startDir = cleanDefaultDir && fs.existsSync(cleanDefaultDir) ? cleanDefaultDir : app.getPath('documents');
  const result = await dialog.showSaveDialog(mainWindow, {
    title: '다른 이름으로 저장',
    defaultPath: path.join(startDir, defaultName),
    filters: [{ name: 'Markdown Files', extensions: ['md'] }]
  });

  if (result.canceled || !result.filePath) {
    return null;
  }

  const filePath = result.filePath.normalize('NFC');
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
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
  const cleanDefault = defaultPath ? defaultPath.normalize('NFC') : undefined;
  const startDir = cleanDefault && fs.existsSync(cleanDefault) && fs.statSync(cleanDefault).isDirectory()
    ? cleanDefault
    : app.getPath('documents');
  const result = await dialog.showOpenDialog(mainWindow, {
    title: defaultPath ? `워크스페이스 폴더 선택 - ${defaultPath}` : '워크스페이스 폴더 선택',
    defaultPath: startDir,
    properties: ['openDirectory', 'createDirectory']
  });
  if (result.canceled || result.filePaths.length === 0) {
    return { status: 'canceled' };
  }
  return { status: 'success', path: result.filePaths[0] };
});

// 5. 절대 경로를 지정하여 직접 파일 내용 읽기
ipcMain.handle('file:readFromPath', async (event, filePath) => {
  try {
    const cleanPath = filePath.normalize('NFC');
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
    const output = execSync('wmic logicaldisk get caption').toString();
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
      .filter(entry => !['node_modules', '.git', '.next', '.vscode'].includes(entry.name))
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
    fs.renameSync(cleanOld, cleanNew);
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

// 14. Windows/macOS 네이티브 시스템 이모지 피커 호출 핸들러
ipcMain.handle('system:showEmojiPicker', () => {
  try {
    app.showEmojiPanel();
    return true;
  } catch (e) {
    console.error("네이티브 이모지 패널 호출 실패:", e);
    return false;
  }
});

