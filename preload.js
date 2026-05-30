const { contextBridge, ipcRenderer } = require('electron');

// 렌더러 프로세스(Next.js)에 노출할 안전한 API 정의
contextBridge.exposeInMainWorld('electronAPI', {
  // 1. 파일 열기 대화상자를 띄우고 파일 데이터 로드
  openFile: (defaultPath) => ipcRenderer.invoke('dialog:openFile', defaultPath),
  
  // 2. 현재 열린 파일 경로에 덮어쓰기 저장
  saveFile: (filePath, content) => ipcRenderer.invoke('file:save', filePath, content),
  
  // 3. 다른 이름으로 저장 대화상자를 띄워 파일 기록 (워크스페이스 경로 지원)
  saveFileAs: (content, suggestedName, defaultDir) => ipcRenderer.invoke('file:saveAs', content, suggestedName, defaultDir),

  // 4. 경로를 지정하여 직접 파일 읽기 (검색 결과 파일 로드용)
  readFromPath: (filePath) => ipcRenderer.invoke('file:readFromPath', filePath),

  // 5. 폴더 선택 대화상자 띄우기 (전체 검색 범위 선택용)
  selectFolder: (defaultPath) => ipcRenderer.invoke('dialog:selectFolder', defaultPath),

  // 6. 드라이브 목록 조회 (Windows 탐색기)
  getDrives: () => ipcRenderer.invoke('file:getDrives'),

  // 7. 디렉토리 파일 목록 조회
  listDirectory: (dirPath) => ipcRenderer.invoke('file:listDirectory', dirPath),

  // 9. 파일/폴더 이름 변경
  renameFile: (oldPath, newPath) => ipcRenderer.invoke('file:rename', oldPath, newPath),

  // 10. 파일/폴더 삭제
  deleteFile: (targetPath) => ipcRenderer.invoke('file:delete', targetPath),

  // 11. 새 파일 생성
  createFile: (parentPath, name) => ipcRenderer.invoke('file:createFile', parentPath, name),

  // 12. 새 폴더 생성
  createFolder: (parentPath, name) => ipcRenderer.invoke('file:createFolder', parentPath, name),

  // 13. 폴더 아래의 모든 마크다운 파일 대상 단어 검색
  searchInFolder: (config) => ipcRenderer.invoke('file:searchInFolder', config),

  // 7. 단축키 및 상단 시스템 메뉴 이벤트에 반응할 이벤트 리스너 등록
  onNewFileRequested: (callback) => ipcRenderer.on('menu:new-file', (_, value) => callback(value)),
  onOpenFileRequested: (callback) => ipcRenderer.on('menu:open-file', (_, value) => callback(value)),
  onSaveFileRequested: (callback) => ipcRenderer.on('menu:save-file', (_, value) => callback(value)),
  onSaveFileAsRequested: (callback) => ipcRenderer.on('menu:save-file-as', (_, value) => callback(value)),

  // 14. 시스템 네이티브 이모지 피커 호출
  showEmojiPicker: () => ipcRenderer.invoke('system:showEmojiPicker'),

  // 15. 라이선스 키 로드 (데스크탑 영구 저장 연동)
  loadLicense: () => ipcRenderer.invoke('license:load'),

  // 16. 라이선스 키 저장 (데스크탑 영구 저장 연동)
  saveLicense: (licenseKey) => ipcRenderer.invoke('license:save', licenseKey),

  // 리스너 해제를 위한 유틸리티 (컴포넌트 unmount 시 메모리 누수 방지)
  removeListeners: () => {
    ipcRenderer.removeAllListeners('menu:new-file');
    ipcRenderer.removeAllListeners('menu:open-file');
    ipcRenderer.removeAllListeners('menu:save-file');
    ipcRenderer.removeAllListeners('menu:save-file-as');
  }
});
