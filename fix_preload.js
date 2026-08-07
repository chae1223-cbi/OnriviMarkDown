const fs = require('fs');
const path = 'preload.js';
let content = fs.readFileSync(path, 'utf8');

const target1 = `  // 7. 디렉토리 파일 목록 조회
  listDirectory: (dirPath) => ipcRenderer.invoke('file:listDirectory', dirPath),`;

const repl1 = `  // 7. 디렉토리 파일 목록 조회
  listDirectory: (dirPath) => ipcRenderer.invoke('file:listDirectory', dirPath),
  
  // [Bug Fix] 워크스페이스 실시간 감지 시작
  watchWorkspace: (workspacePath) => ipcRenderer.invoke('file:watchWorkspace', workspacePath),
  onWorkspaceChanged: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('workspace-changed', handler);
    return () => ipcRenderer.removeListener('workspace-changed', handler);
  },`;

content = content.replace(target1, repl1);

const target2 = `    ipcRenderer.removeAllListeners('menu:save-file-as');
    ipcRenderer.removeAllListeners('open-external-md');
    ipcRenderer.removeAllListeners('dialog:openFontPicker');
  }
});`;

const repl2 = `    ipcRenderer.removeAllListeners('menu:save-file-as');
    ipcRenderer.removeAllListeners('open-external-md');
    ipcRenderer.removeAllListeners('dialog:openFontPicker');
    ipcRenderer.removeAllListeners('workspace-changed');
  }
});`;

content = content.replace(target2, repl2);

fs.writeFileSync(path, content, 'utf8');
console.log('done');
