const { contextBridge, ipcRenderer } = require('electron');

// 렌더러 프로세스(Next.js)에 노출할 안전한 API 정의
contextBridge.exposeInMainWorld('electronAPI', {
  // 2. 현재 열린 파일 경로에 덮어쓰기 저장
  saveFile: (filePath, content) => ipcRenderer.invoke('file:save', filePath, content),
  
  // 3. 다른 이름으로 저장 대화상자를 띄워 파일 기록 (워크스페이스 경로 지원)
  saveFileAs: (content, suggestedName, defaultDir, filters) => ipcRenderer.invoke('file:saveAs', content, suggestedName, defaultDir, filters),

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
  onSaveFileRequested: (callback) => ipcRenderer.on('menu:save-file', (_, value) => callback(value)),
  onSaveFileAsRequested: (callback) => ipcRenderer.on('menu:save-file-as', (_, value) => callback(value)),

  // 8. 윈도우 파일 연결(더블클릭)로 외부 .md 파일 열기 요청 수신 (두 번째 실행부터)
  onReceiveFile: (callback) => {
    const handler = (_event, filePath) => callback(filePath);
    ipcRenderer.on('open-external-md', handler);
    return () => {
      ipcRenderer.removeListener('open-external-md', handler);
    };
  },

  // 9. 최초 실행 시 filePathToOpen 조회 (pull 방식, 경합 조건 없음)
  getInitialFilePath: () => ipcRenderer.invoke('get-initial-file-path'),

  // 14. 시스템 네이티브 이모지 피커 호출
  showEmojiPicker: () => ipcRenderer.invoke('system:showEmojiPicker'),

  // 15. 라이선스 키 로드 (데스크탑 영구 저장 연동)
  loadLicense: () => ipcRenderer.invoke('license:load'),

  // 16. 라이선스 키 저장 (데스크탑 영구 저장 연동)
  saveLicense: (licenseKey) => ipcRenderer.invoke('license:save', licenseKey),

  // 하이브리드 라이선스 정보 연동 API 추가
  loadLicenseFull: () => ipcRenderer.invoke('license:load-full'),
  saveLicenseFull: (data) => ipcRenderer.invoke('license:save-full', data),
  getMachineId: () => ipcRenderer.invoke('license:get-device-id'),
  openExternal: (url) => ipcRenderer.invoke('system:openExternal', url),
  onLicenseActivated: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('license-activated', handler);
    return () => {
      ipcRenderer.removeListener('license-activated', handler);
    };
  },

  // 17. 환경설정 로드 (데스크탑 영구 저장 연동)
  loadSettings: () => ipcRenderer.invoke('settings:load'),

  // 18. 환경설정 저장 (데스크탑 영구 저장 연동)
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),

  // 19. OS 네이티브 글꼴 선택 대화상자 호출
  openFontDialog: () => ipcRenderer.invoke('dialog:openFontPicker'),

  // 20. 클립보드 이미지 복사 및 로컬 파일 쓰기 핸들러 연동
  saveImage: (targetFolder, base64Data, fileName) => ipcRenderer.invoke('file:saveImage', targetFolder, base64Data, fileName),

  // 21. 일렉트론 네이티브 PDF 인쇄 API
  printToPDF: (options) => ipcRenderer.invoke('pdf:printToPDF', options),

  // 22. 로컬 이미지 파일 Base64 변환 읽기 API
  readImageAsBase64: (filePath) => ipcRenderer.invoke('file:readImageAsBase64', filePath),

  // 23. 사용자 서식 프로필 읽기 (Desktop — userData)
  readProfiles: () => ipcRenderer.invoke('file:readProfiles'),

  // 24. 사용자 서식 프로필 저장 (Desktop — userData)
  saveProfiles: (profiles) => ipcRenderer.invoke('file:saveProfiles', profiles),

  // 리스너 해제를 위한 유틸리티 (컴포넌트 unmount 시 메모리 누수 방지)
  removeListeners: () => {
    ipcRenderer.removeAllListeners('menu:new-file');
    ipcRenderer.removeAllListeners('menu:save-file');
    ipcRenderer.removeAllListeners('menu:save-file-as');
    ipcRenderer.removeAllListeners('open-external-md');
    ipcRenderer.removeAllListeners('dialog:openFontPicker');
  }
});
