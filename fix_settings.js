const fs = require('fs');
const f = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/SettingsModal.tsx';
let c = fs.readFileSync(f, 'utf8');

c = c.replace(
  /import \{ X, Settings, Command, Loader2, CheckCircle, AlertCircle, KeyRound, Type, AlignLeft, Braces, Save, RotateCcw \} from 'lucide-react';/,
  "import { X, Settings, Command, Loader2, CheckCircle, AlertCircle, KeyRound, Type, AlignLeft, Braces, Save, RotateCcw, Copy } from 'lucide-react';"
);

c = c.replace(
  /<button\s+onClick=\{\(\) => \{\s+const defaultHotkeys = getDefaultHotkeys\(\);/,
  `<div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const textLines = ['[단축키 및 명령어 매핑]'];
                      TOOLBAR_ITEMS.forEach(item => {
                        const hk = customHotkeys[item.id] || '없음';
                        const cmd = customSlashCommands[item.id] || '없음';
                        textLines.push(\`- \${item.name}: 단축키 [\${hk}], 명령어 [/\${cmd}]\`);
                      });
                      navigator.clipboard.writeText(textLines.join('\\n')).then(() => {
                        showToast('단축키 및 명령어가 복사되었습니다.', 'success');
                      }).catch(() => {
                        showToast('복사에 실패했습니다.', 'error');
                      });
                    }}
                    className="px-4 py-2 text-[13px] font-bold rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-all flex items-center gap-2"
                  >
                    <Copy size={14} />
                    복사하기
                  </button>
                  <button
                    onClick={() => {
                      const defaultHotkeys = getDefaultHotkeys();`
);

c = c.replace(
  /초기화\s+<\/button>\s+<\/div>/,
  `초기화
                  </button>
                </div>
              </div>`
);

fs.writeFileSync(f, c, 'utf8');
console.log('Fixed settings modal');
