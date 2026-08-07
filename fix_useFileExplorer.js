const fs = require('fs');
const path = 'frontend/src/hooks/useFileExplorer.ts';
let content = fs.readFileSync(path, 'utf8');

const target = `  useEffect(() => {
    if (rootFolder) {
      refreshFileList();
    } else {
      setFileList([]);
    }`;

const repl = `  useEffect(() => {
    if (rootFolder) {
      refreshFileList();
      // [Bug Fix] 워크스페이스 실시간 변경 감지 활성화
      const api = (window as any).electronAPI;
      if (workspaceType === 'local' && api?.watchWorkspace && api?.onWorkspaceChanged) {
        api.watchWorkspace(rootFolder.path);
        const unwatch = api.onWorkspaceChanged(() => {
          refreshFileList();
        });
        return () => {
          unwatch();
        };
      }
    } else {
      setFileList([]);
    }`;

content = content.replace(target, repl);

fs.writeFileSync(path, content, 'utf8');
console.log('done');
