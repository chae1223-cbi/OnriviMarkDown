const fs = require('fs');
const path = 'main.js';
let content = fs.readFileSync(path, 'utf8');

const chokidarImport = `const chokidar = require('chokidar');\n`;
if(!content.includes('chokidar')) {
    content = content.replace(`const path = require('path');`, `const path = require('path');\n` + chokidarImport);
}

const watcherCode = `

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
      ignored: [/(^|[\\/])\\../, '**/node_modules/**', '**/.git/**', '**/.next/**', '**/.vscode/**'],
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

`;

if(!content.includes('file:watchWorkspace')) {
    content = content.replace(`// 7. 디렉토리 파일 목록 조회`, watcherCode + `// 7. 디렉토리 파일 목록 조회`);
}

fs.writeFileSync(path, content, 'utf8');
console.log('done');
