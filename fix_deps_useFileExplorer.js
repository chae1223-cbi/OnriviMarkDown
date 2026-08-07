const fs = require('fs');
const path = 'frontend/src/hooks/useFileExplorer.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  `  }, [rootFolder, refreshFileList, setFileList]);`,
  `  }, [rootFolder, refreshFileList, setFileList, workspaceType]);`
);
fs.writeFileSync(path, content, 'utf8');
console.log('done');
