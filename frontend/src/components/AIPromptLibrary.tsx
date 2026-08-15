import React, { useState, useMemo } from 'react';
import { X, Search, Folder, Star, Sparkles, Edit2, Trash2, BookOpen, PenTool } from 'lucide-react';
import { PromptTemplate } from '@/lib/promptTemplates';

export interface AIPreset {
  id: string;
  name: string;
  // Legacy fields for backwards compatibility during migration
  mode?: 'draft' | 'editorial';
  domainId?: string;
  docType?: string;
  systemPrompt?: string;
  userPrompt?: string;
  
  // Unified fields
  editorialCommand: string;
  targetScope?: 'selection' | 'document' | 'none';
  folder?: string;
}

interface AIPromptLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  templates: Record<string, Record<string, PromptTemplate>>;
  presets: AIPreset[];
  onSelectTemplate: (domain: string, docType: string, template: PromptTemplate) => void;
  onSelectPreset: (preset: AIPreset) => void;
  onDeletePreset: (id: string) => void;
  onRenamePreset: (id: string, newName: string) => void;
}

export default function AIPromptLibrary({
  isOpen,
  onClose,
  templates,
  presets,
  onSelectTemplate,
  onSelectPreset,
  onDeletePreset,
  onRenamePreset
}: AIPromptLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('presets_all');
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editingPresetName, setEditingPresetName] = useState('');

  // Extract all domains
  const domainFolders = useMemo(() => Object.keys(templates), [templates]);

  // Extract all preset folders
  const presetFolders = useMemo(() => {
    const folders = new Set<string>();
    presets.forEach(p => {
      if (p.folder) folders.add(p.folder);
    });
    return Array.from(folders).sort();
  }, [presets]);

  // Handle setting active tab if it gets lost
  if (!activeTab.startsWith('presets_') && !domainFolders.includes(activeTab) && domainFolders.length > 0) {
    setActiveTab(domainFolders[0]);
  }

  // Filtered items based on search query
  const filteredPresets = useMemo(() => {
    if (!activeTab.startsWith('presets_')) return [];
    return presets.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      
      if (activeTab === 'presets_all') return true;
      if (activeTab === 'presets_default') return !p.folder;
      if (activeTab.startsWith('presets_folder_')) {
        const targetFolder = activeTab.replace('presets_folder_', '');
        return p.folder === targetFolder;
      }
      return false;
    });
  }, [presets, searchQuery, activeTab]);

  const filteredTemplates = useMemo(() => {
    if (activeTab.startsWith('presets_')) return [];
    const domainTemplates = templates[activeTab] || {};
    return Object.entries(domainTemplates).filter(([docType, tpl]) => {
      if (!searchQuery) return true;
      const lowerQuery = searchQuery.toLowerCase();
      return docType.toLowerCase().includes(lowerQuery) || tpl.systemPrompt.toLowerCase().includes(lowerQuery);
    });
  }, [activeTab, templates, searchQuery]);

  const handleStartRename = (e: React.MouseEvent, p: AIPreset) => {
    e.stopPropagation();
    setEditingPresetId(p.id);
    setEditingPresetName(p.name);
  };

  const handleSaveRename = (e: React.MouseEvent | React.KeyboardEvent, id: string) => {
    e.stopPropagation();
    if (editingPresetName.trim()) {
      onRenamePreset(id, editingPresetName.trim());
    }
    setEditingPresetId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 bg-white dark:bg-zinc-900 flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.15)]">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-zinc-800 dark:text-zinc-200">AI 프롬프트 라이브러리</h3>
            <p className="text-[12px] text-zinc-500">템플릿과 내 프리셋을 한 곳에서 찾아 적용하세요.</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          title="라이브러리를 닫고 AI 모달로 돌아갑니다"
        >
          <span className="text-[12px] font-bold">AI 모달로 이동</span>
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar (Folders) */}
        <div className="w-[280px] bg-slate-50 dark:bg-zinc-900/50 border-r border-zinc-100 dark:border-zinc-800 p-4 flex flex-col shrink-0 custom-scrollbar overflow-y-auto">
          
          {/* My Presets Section */}
          <div className="text-[11px] font-extrabold text-zinc-400 mb-3 tracking-wider px-2">내 프리셋</div>
          <div className="flex flex-col gap-1 mb-8">
            <button
              onClick={() => { setActiveTab('presets_all'); setSearchQuery(''); }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-[13px] font-bold transition-colors ${
                activeTab === 'presets_all' ? 'bg-[#8b5cf6] text-white shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800'
              }`}
            >
              <Star className={`w-4 h-4 ${activeTab === 'presets_all' ? 'text-white' : 'text-amber-400'}`} />
              전체보기
              <span className={`ml-auto text-[11px] px-1.5 py-0.5 rounded-md ${activeTab === 'presets_all' ? 'bg-white/20' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
                {presets.length}
              </span>
            </button>
            <button
              onClick={() => { setActiveTab('presets_default'); setSearchQuery(''); }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-[13px] font-bold transition-colors ${
                activeTab === 'presets_default' ? 'bg-[#8b5cf6] text-white shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800'
              }`}
            >
              <Folder className={`w-4 h-4 ${activeTab === 'presets_default' ? 'text-white' : 'text-blue-400'}`} />
              기본
              <span className={`ml-auto text-[11px] px-1.5 py-0.5 rounded-md ${activeTab === 'presets_default' ? 'bg-white/20' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
                {presets.filter(p => !p.folder).length}
              </span>
            </button>
            {presetFolders.map(folder => {
              const count = presets.filter(p => p.folder === folder).length;
              return (
                <button
                  key={`folder_${folder}`}
                  onClick={() => { setActiveTab(`presets_folder_${folder}`); setSearchQuery(''); }}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-[13px] font-bold transition-colors ${
                    activeTab === `presets_folder_${folder}` ? 'bg-[#8b5cf6] text-white shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Folder className={`w-4 h-4 ${activeTab === `presets_folder_${folder}` ? 'text-white' : 'text-amber-400'}`} />
                  {folder}
                  <span className={`ml-auto text-[11px] px-1.5 py-0.5 rounded-md ${activeTab === `presets_folder_${folder}` ? 'bg-white/20' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] font-extrabold text-zinc-400 mt-8 mb-3 tracking-wider px-2">시스템 템플릿</div>
          <div className="flex flex-col gap-1">
            {domainFolders.map(domain => (
              <button
                key={domain}
                onClick={() => { setActiveTab(domain); setSearchQuery(''); }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-[13px] font-bold transition-colors ${
                  activeTab === domain ? 'bg-[#8b5cf6] text-white shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800'
                }`}
              >
                <Folder className={`w-4 h-4 ${activeTab === domain ? 'text-white' : 'text-blue-400'}`} />
                {domain}
                <span className={`ml-auto text-[11px] px-1.5 py-0.5 rounded-md ${activeTab === domain ? 'bg-white/20' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
                  {Object.keys(templates[domain] || {}).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 overflow-hidden relative">
          
          {/* Search Bar */}
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder={activeTab.startsWith('presets_') ? "내 프리셋 검색..." : `${activeTab} 템플릿 검색...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-9 pr-4 py-2 text-[13px] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          {/* Grid View */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-zinc-900/50 custom-scrollbar">
            {activeTab.startsWith('presets_') ? (
              // Presets View
              filteredPresets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                  <Star className="w-12 h-12 mb-3 text-zinc-300 dark:text-zinc-700" />
                  <p className="text-[14px] font-bold">저장된 프리셋이 없습니다.</p>
                  <p className="text-[12px] mt-1">자주 쓰는 설정을 저장해두면 편리합니다.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
                  {filteredPresets.map(p => (
                    <div
                      key={p.id}
                      onClick={() => onSelectPreset(p)}
                      className="group bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-purple-300 dark:hover:border-purple-500/50 cursor-pointer transition-all flex flex-col relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => handleStartRename(e, p)} className="p-1.5 bg-white dark:bg-zinc-700 text-zinc-400 hover:text-blue-500 rounded-md shadow-sm"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={(e) => { e.stopPropagation(); onDeletePreset(p.id); }} className="p-1.5 bg-white dark:bg-zinc-700 text-zinc-400 hover:text-red-500 rounded-md shadow-sm"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2 pr-12">
                        <Star className="w-4 h-4 text-amber-500 shrink-0" />
                        {editingPresetId === p.id ? (
                          <div className="flex-1" onClick={e => e.stopPropagation()}>
                            <input
                              type="text"
                              value={editingPresetName}
                              onChange={e => setEditingPresetName(e.target.value)}
                              onKeyDown={e => { if(e.key==='Enter') handleSaveRename(e, p.id); if(e.key==='Escape') setEditingPresetId(null); }}
                              autoFocus
                              className="w-full bg-slate-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 rounded px-2 py-0.5 text-[14px] font-bold"
                            />
                          </div>
                        ) : (
                          <h4 className="text-[14px] font-bold text-zinc-800 dark:text-zinc-200 truncate">{p.name}</h4>
                        )}
                      </div>
                      
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed mt-1 flex-1 whitespace-pre-wrap">
                        {p.editorialCommand || p.systemPrompt || "프롬프트 내용이 없습니다."}
                      </p>
                      
                      <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-700/50 flex justify-between items-center text-[10px] font-medium">
                        <span className="text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded flex items-center gap-1">
                          <Folder className="w-3 h-3" />
                          {p.folder || '기본'}
                        </span>
                        <span className="text-purple-600 dark:text-purple-400">적용하기 →</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              // Templates View
              filteredTemplates.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                  <Search className="w-12 h-12 mb-3 text-zinc-300 dark:text-zinc-700" />
                  <p className="text-[14px] font-bold">검색 결과가 없습니다.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
                  {filteredTemplates.map(([docType, template]) => (
                    <div
                      key={docType}
                      onClick={() => onSelectTemplate(activeTab, docType, template)}
                      className="group bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-purple-300 dark:hover:border-purple-500/50 cursor-pointer transition-all flex flex-col"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                          <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                        </div>
                        <h4 className="text-[14px] font-bold text-zinc-800 dark:text-zinc-200 truncate">{docType}</h4>
                      </div>
                      
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-4 leading-relaxed mt-1 flex-1">
                        {template.systemPrompt}
                      </p>
                      
                      <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-700/50 flex justify-between items-center text-[10px] font-medium">
                        <span className="text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded">
                          {activeTab}
                        </span>
                        <span className="text-purple-600 dark:text-purple-400">작성 시작 →</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
