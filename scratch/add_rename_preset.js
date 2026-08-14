const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('frontend/src/components/AIDraftModal.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Add Edit2 to imports
if (!content.includes('Edit2,')) {
    content = content.replace("import { X, Sparkles, Wand2, Loader2, Check, Save, FolderOpen, Trash2, Copy, Paperclip } from 'lucide-react';", 
    "import { X, Sparkles, Wand2, Loader2, Check, Save, FolderOpen, Trash2, Copy, Paperclip, Edit2 } from 'lucide-react';");
}

// 2. Add state
const stateMarker = "const [presetNameInput, setPresetNameInput] = useState('');";
if (!content.includes('editingPresetId')) {
    content = content.replace(stateMarker, `${stateMarker}\n  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);\n  const [editingPresetName, setEditingPresetName] = useState<string>('');`);
}

// 3. Add handleRename functions after handleDeletePreset
const deleteFuncMatch = `    } else {\n      showToast("리소스 폴더가 지정되지 않았습니다.", "error");\n    }\n  };\n`;
if (!content.includes('handleStartRename')) {
    const renameFuncs = `
  const handleStartRename = (e: React.MouseEvent, p: AIPreset) => {
    e.stopPropagation();
    setEditingPresetId(p.id);
    setEditingPresetName(p.name);
  };

  const handleSaveRename = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!editingPresetName.trim()) {
      showToast("이름을 입력해주세요.", "warning");
      return;
    }
    const updated = presets.map(p => p.id === id ? { ...p, name: editingPresetName.trim() } : p);
    
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      (window as any).electronAPI.savePresets(updated, resourceFolder).then((result: any) => {
        if (result.success) {
          setPresets(updated);
          showToast("프리셋 이름이 변경되었습니다.", "success");
        } else {
          showToast("이름 변경에 실패했습니다.", "error");
        }
      });
    } else if (resourceFolderHandle) {
      resourceFolderHandle.getDirectoryHandle('prompt', { create: true })
        .then((promptDir: any) => promptDir.getFileHandle('ai_presets.json', { create: true }))
        .then((fileHandle: any) => fileHandle.createWritable())
        .then(async (writable: any) => {
          await writable.write(JSON.stringify(updated, null, 2));
          await writable.close();
          setPresets(updated);
          showToast("프리셋 이름이 변경되었습니다.", "success");
        })
        .catch((e: any) => {
          console.error(e);
          showToast("이름 변경에 실패했습니다.", "error");
        });
    } else {
      showToast("리소스 폴더가 지정되지 않았습니다.", "error");
    }
    setEditingPresetId(null);
    setEditingPresetName('');
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPresetId(null);
    setEditingPresetName('');
  };
`;
    content = content.replace(deleteFuncMatch, deleteFuncMatch + renameFuncs);
}

// 4. Update UI in map
const mapStart = `presets.map(p => (\n                            <div key={p.id} className="flex items-center justify-between group hover:bg-zinc-50 dark:hover:bg-zinc-700/50 cursor-pointer border-b border-zinc-50 dark:border-zinc-700/50 last:border-0" onClick={() => handleLoadPreset(p)}>\n                              <div className="px-4 py-3 flex flex-col">\n                                <span className="text-[13px] font-bold text-zinc-800 dark:text-zinc-200">{p.name}</span>\n                                <span className="text-[10px] text-zinc-400 mt-0.5">{p.mode === 'draft' ? '초안 작성' : '편집 어시스턴트'}</span>\n                              </div>\n                              <button\n                                onClick={(e) => handleDeletePreset(e, p.id)}\n                                className="mr-3 p-1.5 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-red-50 dark:hover:bg-red-500/10"\n                              >\n                                <Trash2 className="w-4 h-4" />\n                              </button>\n                            </div>\n                          ))`;

const newMap = `presets.map(p => (
                            <div key={p.id} className="flex items-center justify-between group hover:bg-zinc-50 dark:hover:bg-zinc-700/50 cursor-pointer border-b border-zinc-50 dark:border-zinc-700/50 last:border-0" onClick={() => { if (editingPresetId !== p.id) handleLoadPreset(p); }}>
                              {editingPresetId === p.id ? (
                                <div className="px-4 py-2 flex flex-row w-full gap-2 items-center" onClick={e => e.stopPropagation()}>
                                  <input 
                                    type="text" 
                                    value={editingPresetName} 
                                    onChange={e => setEditingPresetName(e.target.value)} 
                                    onKeyDown={e => { if(e.key==='Enter') handleSaveRename(e as any, p.id); if(e.key==='Escape') handleCancelRename(e as any); }}
                                    className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-[12px] focus:outline-none focus:border-purple-500"
                                    autoFocus
                                  />
                                  <button onClick={(e) => handleSaveRename(e as any, p.id)} className="p-1 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 rounded"><Check className="w-4 h-4" /></button>
                                  <button onClick={handleCancelRename} className="p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"><X className="w-4 h-4" /></button>
                                </div>
                              ) : (
                                <>
                                  <div className="px-4 py-3 flex flex-col">
                                    <span className="text-[13px] font-bold text-zinc-800 dark:text-zinc-200">{p.name}</span>
                                    <span className="text-[10px] text-zinc-400 mt-0.5">{p.mode === 'draft' ? '초안 작성' : '편집 어시스턴트'}</span>
                                  </div>
                                  <div className="mr-3 flex opacity-0 group-hover:opacity-100 transition-all">
                                    <button
                                      onClick={(e) => handleStartRename(e, p)}
                                      className="p-1.5 text-zinc-300 hover:text-blue-500 rounded-md hover:bg-blue-50 dark:hover:bg-blue-500/10 mr-1"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={(e) => handleDeletePreset(e, p.id)}
                                      className="p-1.5 text-zinc-300 hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))`;

if (!content.includes('handleStartRename(e, p)')) {
    content = content.replace(mapStart, newMap);
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log("Successfully updated AIDraftModal.tsx for rename preset");
