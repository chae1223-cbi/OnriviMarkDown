const fs = require('fs');
const path = require('path');

const filepath = path.join('d:', 'developer', 'OnriviMarkDown', 'frontend', 'src', 'components', 'SettingsModal.tsx');
let content = fs.readFileSync(filepath, 'utf8');

// 1. Replace imports
content = content.replace(
  "import { DEFAULT_HOTKEYS, DEFAULT_SLASH_COMMANDS } from '@/lib/slashCommands';",
  "import { TOOLBAR_ITEMS, getDefaultHotkeys, getDefaultCommands } from '@/lib/toolbarConfig';"
);

// 2. Replace the tab content for shortcuts (around line 304)
const shortcutsStartStr = "{activeTab === 'shortcuts' && (";
const shortcutsEndStr = "              </section>";

const startIdx = content.indexOf(shortcutsStartStr);
const endIdx = content.indexOf(shortcutsEndStr, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const newShortcutsBlock = `{activeTab === 'shortcuts' && (
              <section className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold" style={{ color: colors.onSurface }}>단축키 및 슬래시 커맨드 설정</h3>
                  <button 
                    onClick={() => {
                      const defaultHotkeys = getDefaultHotkeys();
                      const defaultCmds = getDefaultCommands();
                      setCustomHotkeys(defaultHotkeys);
                      setCustomSlashCommands(defaultCmds);
                      localStorage.setItem('customHotkeys', JSON.stringify(defaultHotkeys));
                      localStorage.setItem('customSlashCommands', JSON.stringify(defaultCmds));
                    }}
                    className="px-3 py-1 text-[11px] font-bold rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all border border-red-500/20"
                  >
                    기본값으로 초기화 (Reset)
                  </button>
                </div>

                <div className="overflow-x-auto rounded-lg border bg-white dark:bg-zinc-900" style={{ borderColor: colors.border }}>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-black/5 dark:bg-white/5 border-b" style={{ borderColor: colors.border }}>
                        <th className="px-4 py-3 text-xs font-bold text-gray-500 w-16 text-center">툴바</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-500 w-24">툴바명</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-500 min-w-[120px]">태그형식</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-500 w-32 text-center">단축키</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-500 w-32 text-center">명령어 (/)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-xs font-medium" style={{ borderColor: colors.border, color: colors.onSurface }}>
                      {TOOLBAR_ITEMS.map((item) => (
                        <tr key={item.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          <td className="px-4 py-2 text-center text-sm font-bold">{item.icon}</td>
                          <td className="px-4 py-2">{item.name}</td>
                          <td className="px-4 py-2 font-mono text-[10px] opacity-70 truncate">{item.tagFormat}</td>
                          <td className="px-4 py-2 text-center">
                            <input 
                              type="text" 
                              value={customHotkeys[item.id] !== undefined ? customHotkeys[item.id] : ''}
                              onChange={(e) => {
                                const newHotkeys = { ...customHotkeys, [item.id]: e.target.value };
                                setCustomHotkeys(newHotkeys);
                                localStorage.setItem('customHotkeys', JSON.stringify(newHotkeys));
                              }}
                              className="w-full px-2 py-1 text-[11px] font-mono text-center bg-white dark:bg-zinc-800 border rounded outline-none focus:border-blue-500 transition-colors"
                              style={{ borderColor: colors.border, color: colors.onSurface }}
                              placeholder="없음"
                            />
                          </td>
                          <td className="px-4 py-2 text-center">
                            <div className="flex items-center">
                              <span className="opacity-50 mr-1 font-mono">/</span>
                              <input 
                                type="text" 
                                value={customSlashCommands[item.id] !== undefined ? customSlashCommands[item.id] : ''}
                                onChange={(e) => {
                                  const newCmds = { ...customSlashCommands, [item.id]: e.target.value };
                                  setCustomSlashCommands(newCmds);
                                  localStorage.setItem('customSlashCommands', JSON.stringify(newCmds));
                                }}
                                className="w-full px-2 py-1 text-[11px] font-mono bg-white dark:bg-zinc-800 border rounded outline-none focus:border-blue-500 transition-colors"
                                style={{ borderColor: colors.border, color: colors.onSurface }}
                                placeholder="명령어"
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>`;
  
  content = content.substring(0, startIdx) + newShortcutsBlock + content.substring(endIdx);
  fs.writeFileSync(filepath, content, 'utf8');
  console.log("SettingsModal updated successfully.");
} else {
  console.log("Could not find start/end indices in SettingsModal");
}
