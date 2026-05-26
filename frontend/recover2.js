const fs = require('fs');
const path = require('path');

const brainsDir = 'C:\\Users\\채병익\\.gemini\\antigravity\\brain';
const convDirs = fs.readdirSync(brainsDir).filter(d => fs.statSync(path.join(brainsDir, d)).isDirectory());

const outDir = 'd:/developer/OnriviMarkDown/frontend/recovered';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, {recursive: true});

for (const convDir of convDirs) {
  const logPath = path.join(brainsDir, convDir, '.system_generated', 'logs', 'transcript.jsonl');
  if (!fs.existsSync(logPath)) continue;
  
  const lines = fs.readFileSync(logPath, 'utf8').split('\n');
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const step = JSON.parse(line);
      // Skip recent broken steps in current conv
      if (convDir === 'ffb8a404-1081-4452-a5ca-2c0571ee8032' && step.step_index >= 1980) continue;
      
      if (step.tool_calls) {
        for (const call of step.tool_calls) {
          if (call.name.includes('write_to_file')) {
            let target = call.args.TargetFile;
            if (target && target.includes('Modal.tsx')) {
               target = target.replace(/^\"|\"$/g, '');
               const base = path.basename(target);
               fs.writeFileSync(path.join(outDir, base), call.args.CodeContent, 'utf8');
               console.log('Recovered', base, 'from', convDir);
            }
          }
        }
      }
    } catch(e) {}
  }
}
