const fs = require('fs');
const path = require('path');

const brainsDir = 'C:\\Users\\채병익\\.gemini\\antigravity\\brain';
const convDirs = fs.readdirSync(brainsDir).filter(d => fs.statSync(path.join(brainsDir, d)).isDirectory());

const fileContents = {};

for (const convDir of convDirs) {
  const logPath = path.join(brainsDir, convDir, '.system_generated', 'logs', 'transcript.jsonl');
  if (!fs.existsSync(logPath)) continue;
  
  const lines = fs.readFileSync(logPath, 'utf8').split('\n');
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const step = JSON.parse(line);
      if (convDir === 'ffb8a404-1081-4452-a5ca-2c0571ee8032' && step.step_index >= 1988) continue;
      
      if (step.tool_calls) {
        for (const call of step.tool_calls) {
          if (call.name === 'write_to_file' || call.name === 'default_api:write_to_file') {
            let target = call.args.TargetFile;
            if (target) {
              target = target.replace(/^\"|\"$/g, '');
              if (target.match(/Modal\.tsx/i)) {
                fileContents[path.basename(target)] = call.args.CodeContent;
              }
            }
          }
        }
      }
    } catch (e) {}
  }
}

const targetDir = 'd:/developer/OnriviMarkDown/frontend/src/components';
for (const basename of Object.keys(fileContents)) {
  const targetPath = path.join(targetDir, basename);
  fs.writeFileSync(targetPath, fileContents[basename], 'utf8');
  console.log('Restored: ' + targetPath);
}
