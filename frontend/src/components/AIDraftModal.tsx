/**
 * 프로그램명 : OnriviAuthor 
 * 파일명 : AIDraftModal.tsx
 * -----------------------------------------------------------------------
 * 변경내역
 * -----------------------------------------------------------------------
 * <2026.05.31> 최초작성
 * 작성자 : 채병익
 * 🚨 @PATCH : **2026-07-20** — AI 모달창의 '프리셋 불러오기' 및 '현재 설정 저장' 팝업 드롭다운이 외부 영역(outside) 클릭 시 자동으로 닫히도록 `useRef` 및 이벤트 리스너(handleClickOutside) 로직 추가 적용
 * -----------------------------------------------------------------------
 */
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Wand2, Loader2, Check, Save, FolderOpen, Trash2, Copy, Paperclip } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import { PROMPT_TEMPLATES, getPromptTemplate } from '@/lib/promptTemplates';
import { generateDraftWithAIStream } from '@/lib/gemini';

interface AIDraftModalProps {
  onClose: () => void;
  onApply: (draftContent: string, action: 'insert' | 'replace' | 'append') => void;
  geminiApiKey: string;
  aiModelName: string;
  editorContext?: {
    selectedText: string;
    fullText: string;
  };
  initialMode?: 'draft' | 'editorial';
}

interface AIPreset {
  id: string;
  name: string;
  mode: 'draft' | 'editorial';
  // Draft specific
  domainId?: string;
  docType?: string;
  systemPrompt?: string;
  userPrompt?: string;
  // Editorial specific
  editorialCommand?: string;
  targetScope?: 'selection' | 'document' | 'none';
}

const DOMAIN_OPTIONS = Object.keys(PROMPT_TEMPLATES).map(domain => ({
  id: domain,
  label: domain,
  docTypes: Object.keys(PROMPT_TEMPLATES[domain])
}));

const LOCAL_STORAGE_KEY = 'onrivi_ai_presets';

export default function AIDraftModal({ 
  onClose, 
  onApply, 
  geminiApiKey, 
  aiModelName,
  editorContext,
  initialMode = 'draft'
}: AIDraftModalProps) {
  const { showToast } = useToast();
  
  const [mode, setMode] = useState<'draft' | 'editorial'>(initialMode);
  const [presets, setPresets] = useState<AIPreset[]>([]);
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);
  
  // Preset Saving State
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [presetNameInput, setPresetNameInput] = useState('');

  // Draft Mode State
  const [selectedDomainId, setSelectedDomainId] = useState(DOMAIN_OPTIONS[0].id);
  const [selectedDocType, setSelectedDocType] = useState(DOMAIN_OPTIONS[0].docTypes[0]);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [userPrompt, setUserPrompt] = useState('');

  // Editorial Mode State
  const [editorialCommand, setEditorialCommand] = useState('');
  const [targetScope, setTargetScope] = useState<'selection' | 'document' | 'none'>('selection');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [draftResult, setDraftResult] = useState('');
  const [generationComplete, setGenerationComplete] = useState(false);
  const [aiCopied, setAiCopied] = useState(false);
  
  // File Attachment State
  const [attachedFileName, setAttachedFileName] = useState('');
  const [attachedFileContent, setAttachedFileContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const previewRef = useRef<HTMLDivElement>(null);
  const presetContainerRef = useRef<HTMLDivElement>(null);

  // Click outside to close preset dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (presetContainerRef.current && !presetContainerRef.current.contains(event.target as Node)) {
        setShowPresetDropdown(false);
        setIsSavingPreset(false);
      }
    };
    if (showPresetDropdown || isSavingPreset) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPresetDropdown, isSavingPreset]);

  // Load presets on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setPresets(JSON.parse(saved));
      } catch(e) {
        console.error('Failed to parse presets', e);
      }
    }
  }, []);

  // Set default targetScope if no selection
  useEffect(() => {
    if (!editorContext?.selectedText && targetScope === 'selection') {
      setTargetScope('document');
    }
  }, [editorContext, targetScope]);

  // Update prompts when domain or docType changes (Only for Draft mode)
  useEffect(() => {
    if (isGenerating || generationComplete || mode !== 'draft') return;
    // Only auto-fill if the user hasn't loaded a preset that customized it
    const template = getPromptTemplate(selectedDomainId, selectedDocType);
    setSystemPrompt(template.systemPrompt);
    setUserPrompt(template.userInputTemplate);
  }, [selectedDomainId, selectedDocType, mode, isGenerating, generationComplete]);

  // Auto-scroll the preview div as result streams in
  useEffect(() => {
    if (previewRef.current && isGenerating) {
      previewRef.current.scrollTop = previewRef.current.scrollHeight;
    }
  }, [draftResult, isGenerating]);

  const handleDomainChange = (domainId: string) => {
    const domain = DOMAIN_OPTIONS.find(d => d.id === domainId) || DOMAIN_OPTIONS[0];
    setSelectedDomainId(domain.id);
    setSelectedDocType(domain.docTypes[0]);
  };

  const handleSavePresetClick = () => {
    setIsSavingPreset(true);
    setPresetNameInput('');
    setShowPresetDropdown(false);
  };

  const handleConfirmSavePreset = () => {
    if (!presetNameInput.trim()) {
      showToast("프리셋 이름을 입력해주세요.", "warning");
      return;
    }

    const newPreset: AIPreset = {
      id: Date.now().toString(),
      name: presetNameInput.trim(),
      mode,
      ...(mode === 'draft' ? {
        domainId: selectedDomainId,
        docType: selectedDocType,
        systemPrompt,
        userPrompt
      } : {
        editorialCommand,
        targetScope
      })
    };

    const updated = [...presets, newPreset];
    setPresets(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    showToast("프리셋이 저장되었습니다.", "success");
    setIsSavingPreset(false);
  };

  const handleCancelSavePreset = () => {
    setIsSavingPreset(false);
    setPresetNameInput('');
  };

  const handleLoadPreset = (preset: AIPreset) => {
    setMode(preset.mode);
    if (preset.mode === 'draft') {
      setSelectedDomainId(preset.domainId || DOMAIN_OPTIONS[0].id);
      setSelectedDocType(preset.docType || DOMAIN_OPTIONS[0].docTypes[0]);
      setSystemPrompt(preset.systemPrompt || '');
      setUserPrompt(preset.userPrompt || '');
    } else {
      setEditorialCommand(preset.editorialCommand || '');
      setTargetScope(preset.targetScope || 'none');
    }
    setShowPresetDropdown(false);
    showToast("프리셋을 불러왔습니다.", "success");
  };

  const handleDeletePreset = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = presets.filter(p => p.id !== id);
    setPresets(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setAttachedFileContent(text);
      setAttachedFileName(file.name);
      showToast(`${file.name} 파일이 첨부되었습니다.`, "success");
    };
    reader.onerror = () => {
      showToast("파일을 읽는 중 오류가 발생했습니다.", "error");
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveAttachment = () => {
    setAttachedFileName('');
    setAttachedFileContent('');
  };

  const handleCopyResult = async () => {
    try {
      await navigator.clipboard.writeText(draftResult);
      setAiCopied(true);
      showToast("AI 생성 결과가 클립보드에 복사되었습니다.", "success");
      setTimeout(() => setAiCopied(false), 2000);
    } catch (err) {
      showToast("클립보드 복사 실패", "error");
    }
  };

  const handleGenerate = async () => {
    if (!geminiApiKey) {
      showToast("설정에서 Gemini API 키를 먼저 등록해주세요.", "warning");
      onClose();
      return;
    }

    let finalSystemPrompt = systemPrompt;
    let finalUserPrompt = userPrompt;

    if (mode === 'editorial') {
      if (!editorialCommand.trim()) {
        showToast("에디토리얼 명령을 입력해 주세요.", "warning");
        return;
      }
      finalSystemPrompt = "You are a professional editorial assistant. Help the user edit or create document text based on their instructions. Return only the finalized text without markdown code blocks unless requested.";
      
      if (targetScope === 'selection' && editorContext?.selectedText) {
        finalUserPrompt = `${editorialCommand}\n\n[대상 영역 텍스트]\n${editorContext.selectedText}`;
      } else if (targetScope === 'document' && editorContext?.fullText) {
        finalUserPrompt = `${editorialCommand}\n\n[대상 문서 전체 내용]\n${editorContext.fullText}`;
      } else {
        finalUserPrompt = editorialCommand;
      }
    } else {
      if (!systemPrompt.trim()) {
        showToast("작성 규칙(System Prompt)을 입력해 주세요.", "warning");
        return;
      }
      if (!userPrompt.trim()) {
        showToast("입력 데이터(User Input)를 작성해 주세요.", "warning");
        return;
      }
    }

    if (attachedFileContent) {
      finalUserPrompt += `\n\n[첨부 문서 내용: ${attachedFileName}]\n${attachedFileContent}`;
    }

    setIsGenerating(true);
    setGenerationComplete(false);
    setDraftResult('');

    try {
      await generateDraftWithAIStream(
        geminiApiKey,
        aiModelName || 'gemini-1.5-flash',
        finalSystemPrompt,
        finalUserPrompt,
        (chunkText) => {
          setDraftResult(chunkText);
        }
      );
      setGenerationComplete(true);
      showToast('AI 글 생성이 완료되었습니다. 결과를 확인해주세요.', 'success');
    } catch (e: any) {
      showToast(`AI 생성 실패: ${e.message}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = (action: 'insert' | 'replace' | 'append') => {
    if (!draftResult.trim()) {
      showToast("생성된 결과가 없습니다.", "warning");
      return;
    }
    onApply(draftResult, action);
  };

  const currentDomainObj = DOMAIN_OPTIONS.find(d => d.id === selectedDomainId) || DOMAIN_OPTIONS[0];

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm" onMouseDown={onClose}>
      <div
        className="bg-white dark:bg-zinc-900 w-[1300px] max-w-[95vw] h-[750px] max-h-[90vh] rounded-2xl shadow-2xl flex flex-col border border-zinc-200 dark:border-zinc-700/50 transition-all duration-300 overflow-hidden"
        onMouseDown={e => e.stopPropagation()}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.nativeEvent) {
            e.nativeEvent.stopImmediatePropagation?.();
          }
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8b5cf6] flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-[16px] font-bold text-[#8b5cf6]">
                AI 에디토리얼 어시스턴트
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <span className="text-[12px] font-medium text-zinc-400">
                  {isGenerating ? "AI가 작업을 수행하고 있습니다..." : "협업 준비 완료"}
                </span>
              </div>
            </div>
          </div>
          {!isGenerating && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body (Side-by-side) */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left Column: Prompts */}
          <div className="w-[600px] bg-slate-50 dark:bg-zinc-800/50 border-r border-zinc-100 dark:border-zinc-800 flex flex-col relative overflow-hidden">
            
            {/* Mode & Preset Top Bar */}
            <div className="px-6 pt-5 pb-3 shrink-0 flex items-center justify-between z-10 relative">
              <div className="flex bg-zinc-200/50 dark:bg-zinc-800 p-1 rounded-lg">
                <button
                  onClick={() => setMode('draft')}
                  className={`px-3 py-1.5 text-[12px] font-bold rounded-md transition-colors ${
                    mode === 'draft' ? 'bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700'
                  }`}
                >
                  초안 생성
                </button>
                <button
                  onClick={() => setMode('editorial')}
                  className={`px-3 py-1.5 text-[12px] font-bold rounded-md transition-colors ${
                    mode === 'editorial' ? 'bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700'
                  }`}
                >
                  편집 어시스턴트
                </button>
              </div>

              <div ref={presetContainerRef} className="flex items-center gap-2 relative">
                <button
                  onClick={() => { setShowPresetDropdown(!showPresetDropdown); setIsSavingPreset(false); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  불러오기
                </button>
                <button
                  onClick={handleSavePresetClick}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold text-[#8b5cf6] hover:bg-purple-100 dark:hover:bg-[#8b5cf6]/10 rounded-lg transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  현재 설정 저장
                </button>

                {/* Preset Saving Popover */}
                {isSavingPreset && (
                  <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden z-50 p-4 flex flex-col gap-3">
                    <span className="text-[12px] font-bold text-zinc-800 dark:text-zinc-200">새 프리셋 저장</span>
                    <input 
                      type="text" 
                      value={presetNameInput}
                      onChange={(e) => setPresetNameInput(e.target.value)}
                      onKeyDown={(e) => { if(e.key === 'Enter') handleConfirmSavePreset(); if(e.key === 'Escape') handleCancelSavePreset(); }}
                      placeholder="프리셋 이름을 입력하세요"
                      autoFocus
                      className="w-full bg-slate-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-[12px] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-purple-500"
                    />
                    <div className="flex items-center justify-end gap-2 mt-1">
                      <button onClick={handleCancelSavePreset} className="px-3 py-1.5 text-[11px] font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md">취소</button>
                      <button onClick={handleConfirmSavePreset} className="px-3 py-1.5 text-[11px] font-bold text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-md shadow-sm">저장하기</button>
                    </div>
                  </div>
                )}

                {showPresetDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-2 bg-slate-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-700">
                      <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">저장된 프리셋</span>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {presets.length === 0 ? (
                        <div className="p-4 text-center text-zinc-400 text-[12px]">저장된 프리셋이 없습니다.</div>
                      ) : (
                        presets.map(p => (
                          <div key={p.id} className="flex items-center justify-between group hover:bg-zinc-50 dark:hover:bg-zinc-700/50 cursor-pointer border-b border-zinc-50 dark:border-zinc-700/50 last:border-0" onClick={() => handleLoadPreset(p)}>
                            <div className="px-4 py-3 flex flex-col">
                              <span className="text-[13px] font-bold text-zinc-800 dark:text-zinc-200">{p.name}</span>
                              <span className="text-[10px] text-zinc-400 mt-0.5">{p.mode === 'draft' ? '초안 생성' : '편집 어시스턴트'}</span>
                            </div>
                            <button
                              onClick={(e) => handleDeletePreset(e, p.id)}
                              className="mr-3 p-1.5 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-red-50 dark:hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col h-full overflow-y-auto custom-scrollbar px-6 pb-24 relative">
              
              <div className="flex flex-col gap-6">
                
                {mode === 'draft' ? (
                  <>
                    {/* Domain & DocType */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-extrabold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 tracking-wider">
                        문서 유형 설정 <span className="text-zinc-400 font-medium">(DOCUMENT TYPE)</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={selectedDomainId}
                          onChange={(e) => handleDomainChange(e.target.value)}
                          disabled={isGenerating}
                          className="w-full bg-white dark:bg-zinc-900 border-2 border-transparent hover:border-[#e9d5ff] focus:border-[#a855f7] rounded-xl px-4 py-3 text-[12px] font-medium text-zinc-700 dark:text-zinc-200 focus:outline-none transition-colors shadow-sm disabled:opacity-50"
                        >
                          {DOMAIN_OPTIONS.map(d => (
                            <option key={d.id} value={d.id}>{d.label}</option>
                          ))}
                        </select>
                        <select
                          value={selectedDocType}
                          onChange={(e) => setSelectedDocType(e.target.value)}
                          disabled={isGenerating}
                          className="w-full bg-white dark:bg-zinc-900 border-2 border-transparent hover:border-[#e9d5ff] focus:border-[#a855f7] rounded-xl px-4 py-3 text-[12px] font-medium text-zinc-700 dark:text-zinc-200 focus:outline-none transition-colors shadow-sm disabled:opacity-50"
                        >
                          {currentDomainObj.docTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* System Prompt */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-extrabold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 tracking-wider">
                        AI 작성 규칙 <span className="text-zinc-400 font-medium">(SYSTEM PROMPT)</span>
                      </label>
                      <textarea
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        disabled={isGenerating}
                        placeholder="AI에게 지시할 작성 원칙과 톤앤매너를 입력하세요."
                        className="w-full bg-white dark:bg-zinc-900 border-2 border-transparent hover:border-[#e9d5ff] focus:border-[#a855f7] rounded-2xl p-4 text-[12px] text-zinc-700 dark:text-zinc-200 focus:outline-none transition-colors shadow-sm resize-none min-h-[200px] disabled:opacity-50 custom-scrollbar leading-relaxed"
                      />
                    </div>

                    {/* User Prompt */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-extrabold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 tracking-wider">
                        입력 데이터 <span className="text-zinc-400 font-medium">(USER INPUT)</span>
                      </label>
                      <textarea
                        value={userPrompt}
                        onChange={(e) => setUserPrompt(e.target.value)}
                        disabled={isGenerating}
                        placeholder="문서 작성에 필요한 핵심 데이터나 키워드를 양식에 맞게 기입해 주세요."
                        className="w-full bg-white dark:bg-zinc-900 border-2 border-[#e9d5ff] dark:border-[#8b5cf6]/30 focus:border-[#a855f7] rounded-2xl p-4 text-[12px] text-zinc-800 dark:text-zinc-100 focus:outline-none transition-colors shadow-sm resize-none min-h-[160px] disabled:opacity-50 custom-scrollbar leading-relaxed"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Editorial Mode Context Scope */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-extrabold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 tracking-wider">
                        컨텍스트 범위 <span className="text-zinc-400 font-medium">(CONTEXT SCOPE)</span>
                      </label>
                      <div className="flex bg-white dark:bg-zinc-900 p-1.5 rounded-xl border-2 border-transparent shadow-sm gap-1">
                        <button
                          onClick={() => setTargetScope('selection')}
                          disabled={!editorContext?.selectedText}
                          className={`flex-1 py-2 text-[12px] font-bold rounded-lg transition-all ${
                            targetScope === 'selection'
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-[#8b5cf6]'
                              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                          } disabled:opacity-40 disabled:cursor-not-allowed`}
                          title={editorContext?.selectedText ? `선택된 본문 사용` : '에디터에서 텍스트를 드래그한 후 사용 가능'}
                        >
                          선택 영역
                        </button>
                        <button
                          onClick={() => setTargetScope('document')}
                          className={`flex-1 py-2 text-[12px] font-bold rounded-lg transition-all ${
                            targetScope === 'document'
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-[#8b5cf6]'
                              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                          }`}
                        >
                          문서 전체
                        </button>
                        <button
                          onClick={() => setTargetScope('none')}
                          className={`flex-1 py-2 text-[12px] font-bold rounded-lg transition-all ${
                            targetScope === 'none'
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-[#8b5cf6]'
                              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                          }`}
                        >
                          사용 안함 (일반 질문)
                        </button>
                      </div>
                    </div>

                    {/* Editorial Command */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-extrabold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 tracking-wider">
                        에디토리얼 명령 <span className="text-zinc-400 font-medium">(EDITORIAL COMMAND)</span>
                      </label>
                      <textarea
                        value={editorialCommand}
                        onChange={(e) => setEditorialCommand(e.target.value)}
                        disabled={isGenerating}
                        placeholder="AI에게 요청할 편집 명령이나 주제를 입력하세요..."
                        className="w-full bg-white dark:bg-zinc-900 border-2 border-[#e9d5ff] dark:border-[#8b5cf6]/30 focus:border-[#a855f7] rounded-2xl p-4 text-[12px] text-zinc-800 dark:text-zinc-100 focus:outline-none transition-colors shadow-sm resize-none min-h-[350px] disabled:opacity-50 custom-scrollbar leading-relaxed"
                      />
                    </div>
                  </>
                )}
                
                {/* File Attachment UI (Shared between modes) */}
                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-[11px] font-extrabold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 tracking-wider">
                    문서 첨부 <span className="text-zinc-400 font-medium">(ATTACHMENT)</span>
                  </label>
                  
                  {attachedFileName ? (
                    <div className="flex items-center justify-between bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 px-3 py-2.5 rounded-xl">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Paperclip className="w-4 h-4 text-[#8b5cf6] shrink-0" />
                        <span className="text-[12px] font-bold text-[#8b5cf6] truncate">{attachedFileName}</span>
                      </div>
                      <button onClick={handleRemoveAttachment} className="p-1 hover:bg-[#8b5cf6]/20 rounded-md text-[#8b5cf6] transition-colors shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isGenerating}
                      className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-zinc-200 dark:border-zinc-700/80 hover:border-[#8b5cf6]/50 hover:bg-[#8b5cf6]/5 rounded-xl py-3 text-[12px] font-bold text-zinc-500 dark:text-zinc-400 transition-colors disabled:opacity-50"
                    >
                      <Paperclip className="w-4 h-4" />
                      참조할 텍스트 문서(.md, .txt) 첨부하기
                    </button>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileAttach}
                    accept=".txt,.md,.json,.csv"
                    className="hidden"
                  />
                </div>

              </div>

            </div>

            {/* Fixed Bottom Button */}
            <div className="absolute bottom-6 left-6 right-6 z-10 bg-slate-50 dark:bg-zinc-800/50 pt-2">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3.5 text-[14px] font-bold text-white bg-[#c4b5fd] hover:bg-[#a855f7] disabled:bg-[#ddd6fe] dark:disabled:bg-zinc-700 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    AI {mode === 'draft' ? '초안 생성' : '작업 수행'} 중...
                  </>
                ) : generationComplete ? (
                  <>
                    <Sparkles className="w-5 h-5" />
                    프롬프트 수정하여 다시 실행
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    AI {mode === 'draft' ? '초안 생성' : '글 생성'} 시작
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Result Preview */}
          <div className="flex-1 bg-white dark:bg-zinc-900 flex flex-col relative overflow-hidden">
            
            {/* Right Pane Header */}
            <div className="flex items-center justify-between px-8 py-5 shrink-0">
              <h3 className="text-[11px] font-extrabold text-zinc-400 tracking-wider">
                결과 미리보기 <span className="font-medium">(OUTPUT PREVIEW)</span>
              </h3>
              
              {/* Apply Buttons (Only visible when generated) */}
              {generationComplete && !isGenerating && draftResult.trim() && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyResult}
                    className="px-4 py-1.5 text-[12px] font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-1.5 mr-2"
                  >
                    {aiCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {aiCopied ? '복사됨' : '결과 복사'}
                  </button>

                  {mode === 'editorial' && targetScope !== 'none' && (
                    <>
                      <button
                        onClick={() => handleApply('replace')}
                        className="px-4 py-1.5 text-[12px] font-bold text-[#8b5cf6] border border-[#8b5cf6]/30 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                      >
                        기존 내용 덮어쓰기
                      </button>
                      <button
                        onClick={() => handleApply('append')}
                        className="px-4 py-1.5 text-[12px] font-bold text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        본문 아래에 이어쓰기
                      </button>
                    </>
                  )}
                  {(mode === 'draft' || targetScope === 'none') && (
                    <button
                      onClick={() => handleApply('insert')}
                      className="px-4 py-1.5 text-[12px] font-bold text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      에디터에 적용하기
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Right Pane Content */}
            <div className="flex-1 overflow-hidden relative">
              {(!isGenerating && !generationComplete && !draftResult) ? (
                // Empty State
                <div className="absolute inset-0 flex flex-col items-center justify-center pb-20">
                  <div className="w-16 h-16 bg-[#faf5ff] dark:bg-[#8b5cf6]/10 rounded-[20px] flex items-center justify-center mb-5">
                    <svg className="w-8 h-8 text-[#a855f7]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7z" />
                    </svg>
                  </div>
                  <h4 className="text-[15px] font-bold text-zinc-800 dark:text-zinc-200 mb-2">
                    AI 생성이 대기 중입니다
                  </h4>
                  <p className="text-[12px] text-zinc-500 dark:text-zinc-400 text-center leading-relaxed">
                    좌측 탭에서 모드를 선택하고 필요한 내용을 입력한 뒤<br/>
                    하단의 <span className="text-[#8b5cf6] font-bold">시작</span> 버튼을 눌러주세요.
                  </p>
                </div>
              ) : (
                // Generating or Generated State
                <div 
                  ref={previewRef}
                  className="absolute inset-0 px-8 pb-8 text-[13px] text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap overflow-y-auto custom-scrollbar select-text"
                  style={{ lineHeight: '1.8' }}
                >
                  {draftResult}
                  {isGenerating && (
                    <span className="inline-block w-2 h-4 ml-1 bg-[#8b5cf6] animate-pulse align-middle"></span>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
