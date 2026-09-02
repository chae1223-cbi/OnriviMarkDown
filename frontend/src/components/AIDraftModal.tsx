/**
 * 프로그램명 : OnriviAuthor 
 * 파일명 : AIDraftModal.tsx
 * -----------------------------------------------------------------------
 * 변경내역
 * -----------------------------------------------------------------------
 * <2026.05.31> 최초작성
 * 작성자 : 채병익
 * 🚨 @PATCH : **2026-08-16** — useEffect 의존성 배열 누락 경고 해결: getPromptTemplates와 loadPresets useEffect에 resourceFolder, resourceFolderHandle 추가
 *              **2026-07-20** — AI 모달창의 '프리셋 불러오기' 및 '현재 설정 저장' 팝업 드롭다운이 외부 영역(outside) 클릭 시 자동으로 닫히도록 `useRef` 및 이벤트 리스너(handleClickOutside) 로직 추가 적용
 * -----------------------------------------------------------------------
 */
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Wand2, Loader2, Check, Save, FolderOpen, Trash2, Copy, Paperclip, Edit2, BookOpen, RotateCcw } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import { getPromptTemplates, savePromptTemplates, getPromptTemplate, PromptTemplate } from '@/lib/promptTemplates';
import { generateDraftWithAIStream } from '@/lib/gemini';
import AIPromptLibrary from './AIPromptLibrary';

interface AIDraftModalProps {
  onClose: () => void;
  onApply: (content: string, action: 'insert' | 'replace' | 'append', scope: 'selection' | 'document' | 'none') => void;
  geminiApiKey: string;
  aiModelName: string;
  editorContext?: {
    selectedText: string;
    fullText: string;
  };
  initialMode?: 'draft' | 'editorial';
  resourceFolder?: string;
  resourceFolderHandle?: any;
}

interface AIPreset {
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


export default function AIDraftModal({ 
  onClose, 
  onApply, 
  geminiApiKey, 
  aiModelName,
  editorContext,
  initialMode = 'draft',
  resourceFolder,
  resourceFolderHandle
}: AIDraftModalProps) {
  const { showToast } = useToast();
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSavingPrompts, setIsSavingPrompts] = useState(false);
  const [presets, setPresets] = useState<AIPreset[]>([]);
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);
  
  const [showLibrary, setShowLibrary] = useState(false);
  const [templatesDict, setTemplatesDict] = useState<Record<string, Record<string, PromptTemplate>>>({});

  // Preset Saving State
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [presetNameInput, setPresetNameInput] = useState('');
  const [presetFolderInput, setPresetFolderInput] = useState('');
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editingPresetName, setEditingPresetName] = useState<string>('');
  const [loadedPresetName, setLoadedPresetName] = useState<string>('');
  const [loadedPresetFolder, setLoadedPresetFolder] = useState<string>('');

  // Editorial Command State
  const [editorialCommand, setEditorialCommand] = useState('');
  const [targetScope, setTargetScope] = useState<'selection' | 'document' | 'none'>('selection');
  const [ignoreContext, setIgnoreContext] = useState(true);

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


  useEffect(() => {
    async function load() {
      const templates = await getPromptTemplates(resourceFolder, resourceFolderHandle);
      setTemplatesDict(templates);
      const options = Object.keys(templates).map(domain => ({
        id: domain,
        label: domain,
        docTypes: Object.keys(templates[domain])
      }));
    }
    load();
  // resourceFolder, resourceFolderHandle가 변경될 때 (e.g. 사용자가 폴더를 새로 선택) 템플릿을 다시 로드해야 함
  }, [resourceFolder, resourceFolderHandle]);

  // Load presets on mount
  useEffect(() => {
    async function loadPresets() {
      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        const saved = await (window as any).electronAPI.loadPresets(resourceFolder);
        if (saved) {
          setPresets(saved);
        }
      } else if (resourceFolderHandle) {
        try {
          const promptDir = await resourceFolderHandle.getDirectoryHandle('prompt');
          const fileHandle = await promptDir.getFileHandle('ai_presets.json');
          const file = await fileHandle.getFile();
          const text = await file.text();
          setPresets(JSON.parse(text));
        } catch (e) {
          // No presets file
        }
      }
    }
    loadPresets();
  // resourceFolderHandle이 변경될 때도 프리셋을 다시 로드해야 함
  }, [resourceFolder, resourceFolderHandle]);

  // Auto-Save Drafts logic
  const AI_DRAFT_CACHE_KEY = 'omd_ai_draft_cache';

  useEffect(() => {
    // [OMD-EDIT-AI] AI 모달 열릴 때 무조건 초기화 (캐시 로드 방지)
    localStorage.removeItem(AI_DRAFT_CACHE_KEY);
  }, []);

  useEffect(() => {
    const data = {
      editorialCommand,
      targetScope
    };
    localStorage.setItem(AI_DRAFT_CACHE_KEY, JSON.stringify(data));
  }, [editorialCommand, targetScope]);

  // Set default targetScope if no selection
  useEffect(() => {
    if (!editorContext?.selectedText && targetScope === 'selection') {
      setTargetScope('document');
    }
  }, [editorContext, targetScope]);


  // Auto-scroll the preview div as result streams in
  useEffect(() => {
    if (previewRef.current && isGenerating) {
      previewRef.current.scrollTop = previewRef.current.scrollHeight;
    }
  }, [draftResult, isGenerating]);



  const handleSavePresetClick = () => {
    setIsSavingPreset(true);
    setPresetNameInput(loadedPresetName || '');
    setPresetFolderInput(loadedPresetFolder || '');
    setShowPresetDropdown(false);
  };

  const handleConfirmSavePreset = () => {
    if (!presetNameInput.trim()) {
      showToast("프리셋 이름을 입력해주세요.", "warning");
      return;
    }

    const trimmedName = presetNameInput.trim();
    const trimmedFolder = presetFolderInput.trim();
    const existingIndex = presets.findIndex(p => p.name === trimmedName);
    let updated;
    if (existingIndex !== -1) {
      const updatedPreset: AIPreset = {
        ...presets[existingIndex],
        editorialCommand,
        targetScope: ignoreContext ? 'none' : targetScope,
        name: trimmedName,
        folder: trimmedFolder || undefined
      };
      updated = [...presets];
      updated[existingIndex] = updatedPreset;
    } else {
      const newPreset: AIPreset = {
        id: Date.now().toString(),
        name: trimmedName,
        editorialCommand,
        targetScope: ignoreContext ? 'none' : targetScope,
        folder: trimmedFolder || undefined
      };
      updated = [...presets, newPreset];
    }
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      (window as any).electronAPI.savePresets(updated, resourceFolder).then((result: any) => {
        if (result.success) {
          setPresets(updated);
          showToast("프리셋이 저장되었습니다.", "success");
          setIsSavingPreset(false);
        } else {
          if (result.error === 'NO_RESOURCE_FOLDER') {
            showToast("리소스 폴더가 지정되지 않았거나 존재하지 않습니다. 환경설정에서 확인해주세요.", "error");
          } else {
            showToast("프리셋 저장에 실패했습니다.", "error");
          }
          setIsSavingPreset(false);
        }
      }).catch(() => {
        showToast("프리셋 저장에 실패했습니다.", "error");
        setIsSavingPreset(false);
      });
    } else if (resourceFolderHandle) {
      resourceFolderHandle.getDirectoryHandle('prompt', { create: true })
        .then((promptDir: any) => promptDir.getFileHandle('ai_presets.json', { create: true }))
        .then((fileHandle: any) => fileHandle.createWritable())
        .then(async (writable: any) => {
          await writable.write(JSON.stringify(updated, null, 2));
          await writable.close();
          setPresets(updated);
          showToast("프리셋이 저장되었습니다.", "success");
        })
        .catch((e: any) => {
          console.error(e);
          showToast("프리셋 저장에 실패했습니다: " + e.message, "error");
        })
        .finally(() => setIsSavingPreset(false));
    } else {
      showToast("리소스 폴더가 지정되지 않았습니다. 환경설정에서 확인해주세요.", "error");
      setIsSavingPreset(false);
    }
  };

  const handleCancelSavePreset = () => {
    setIsSavingPreset(false);
    setPresetNameInput('');
  };

  const handleSelectTemplate = (domain: string, docType: string, template: PromptTemplate) => {
    const combinedCommand = `[작성 규칙]\n${template.systemPrompt}\n\n[입력 데이터]\n${template.userInputTemplate}`;
    setEditorialCommand(combinedCommand);
    setTargetScope('document');
    setShowLibrary(false);
    setLoadedPresetName(docType);
    setLoadedPresetFolder(domain);
    showToast("템플릿을 불러왔습니다.", "success");
  };

  const handleLoadPreset = (preset: AIPreset) => {
    setLoadedPresetName(preset.name);
    setLoadedPresetFolder(preset.folder || '');
    if (preset.mode === 'draft' || preset.systemPrompt || preset.userPrompt) {
      // Legacy preset migration on load
      const combined = `[작성 규칙]\n${preset.systemPrompt || ''}\n\n[입력 데이터]\n${preset.userPrompt || ''}`;
      setEditorialCommand(combined.trim());
      setTargetScope('document');
    } else {
      setEditorialCommand(preset.editorialCommand || '');
      if (preset.targetScope === 'none') {
        setIgnoreContext(true);
        setTargetScope('document');
      } else {
        setIgnoreContext(false);
        setTargetScope(preset.targetScope || 'selection');
      }
    }
    setShowPresetDropdown(false);
    setShowLibrary(false);
    showToast("프리셋을 불러왔습니다.", "success");
  };

  const handleDeletePreset = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = presets.filter(p => p.id !== id);
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      (window as any).electronAPI.savePresets(updated, resourceFolder).then((result: any) => {
        if (result.success) {
          setPresets(updated);
        } else {
          showToast("프리셋 삭제에 실패했습니다.", "error");
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
          showToast("프리셋이 삭제되었습니다.", "success");
        })
        .catch((e: any) => {
          console.error(e);
          showToast("프리셋 삭제에 실패했습니다.", "error");
        });
    } else {
      showToast("리소스 폴더가 지정되지 않았습니다.", "error");
    }
  };

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
    renamePreset(id, editingPresetName.trim());
    setEditingPresetId(null);
    setEditingPresetName('');
  };

  const renamePreset = (id: string, newName: string) => {
    const updated = presets.map(p => p.id === id ? { ...p, name: newName } : p);
    
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
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPresetId(null);
    setEditingPresetName('');
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

    if (!editorialCommand.trim()) {
      showToast("에디토리얼 명령을 입력해 주세요.", "warning");
      return;
    }

    let finalSystemPrompt = "You are a professional editorial assistant. Help the user edit or create document text based on their instructions. Return only the finalized text without markdown code blocks unless requested.";
    let finalUserPrompt = editorialCommand;
    
    if (ignoreContext) {
      // Do nothing, just pass the editorialCommand as the prompt
    } else if (targetScope === 'selection' && editorContext?.selectedText) {
      finalUserPrompt = `${editorialCommand}\n\n[대상 영역 텍스트]\n${editorContext.selectedText}`;
    } else if (targetScope === 'document' && editorContext?.fullText) {
      finalSystemPrompt = "You are a professional editorial assistant. Your task is to write a COMPLETELY NEW document based on the user's command. The provided existing document is ONLY a reference for output formatting (layout, lists, tables), style, tone, and structural format (like heading levels). Do NOT summarize or edit the existing document. Create brand new content that matches the user's command, but strictly mimics the output format, layout, form, and feeling of the reference document. Return only the finalized text without markdown code blocks unless requested.";
      finalUserPrompt = `[새 문서 작성 명령]\n${editorialCommand}\n\n[스타일/구조/출력양식 참고용 기존 문서]\n${editorContext.fullText}\n\n위의 '참고용 기존 문서'를 요약하거나 정리하지 마세요. 해당 문서는 오직 글의 출력 양식(레이아웃, 표, 목록 구조), 구조(제목 수준 등), 느낌(어조, 문체)을 파악하기 위한 '제공 자료'일 뿐입니다. 반드시 이 자료에 사용된 출력 양식과 톤앤매너 및 일관성을 똑같이 유지하면서, 맨 위 '[새 문서 작성 명령]'에 따라 '완전히 새로운 문서' 창작해 주세요.`;
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

  const handleReset = () => {
    setEditorialCommand('');
    setLoadedPresetName('');
    setLoadedPresetFolder('');
    setTargetScope('selection');
    setIgnoreContext(true);
    setAttachedFileName('');
    setAttachedFileContent('');
    setDraftResult('');
    setGenerationComplete(false);
    setIsGenerating(false);
    showToast('모든 입력 내용과 설정이 초기화되었습니다.', 'success');
  };

  const handleApply = (action: 'insert' | 'replace' | 'append') => {
    if (!draftResult.trim()) {
      showToast("생성된 결과가 없습니다.", "warning");
      return;
    }
    onApply(draftResult, action, targetScope);
  };



  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm" onMouseDown={onClose}>
      <div
        className="relative bg-white dark:bg-zinc-900 w-full h-full flex flex-col transition-all duration-300 overflow-hidden outline-none"
        onMouseDown={e => e.stopPropagation()}
        tabIndex={-1}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.nativeEvent) {
            e.nativeEvent.stopImmediatePropagation?.();
          }
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            handleGenerate();
          }
          if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            handleSavePresetClick();
          }
          if (e.key === 'Escape') {
            if (showLibrary) {
              setShowLibrary(false);
            } else if (isSavingPreset) {
              handleCancelSavePreset();
            } else {
              onClose();
            }
          }
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EFEFEF] dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#06C755]/15 text-[#06C755] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-base font-bold text-[#06C755] tracking-tight">
                AI 에디토리얼 어시스턴트
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#06C755]"></div>
                <span className="text-[11px] font-medium text-zinc-400">
                  {isGenerating ? "AI가 작업을 수행하고 있습니다..." : "협업 준비 완료"}
                </span>
              </div>
            </div>
          </div>
          {!isGenerating && (
            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 transition-colors"
                title="모든 입력 내용 및 설정 초기화"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-[12px] font-bold">초기화</span>
              </button>
              <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 mx-1"></div>
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 transition-colors"
                title="AI 모달을 닫고 에디터로 돌아갑니다"
              >
                <span className="text-[12px] font-bold">에디터로 이동</span>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Body (Side-by-side) */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left Column: Prompts */}
          <div className="flex-1 bg-slate-50 dark:bg-zinc-800/50 border-r border-zinc-100 dark:border-zinc-800 flex flex-col relative overflow-hidden">
            
            {/* Mode & Preset Top Bar */}
            <div className="px-6 pt-5 pb-3 shrink-0 flex items-center justify-between z-10 relative">
              <div className="flex bg-zinc-200/50 dark:bg-zinc-800 p-1 rounded-lg">
                <span className="px-3 py-1.5 text-[12px] font-bold bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 shadow-sm rounded-md">
                  에디토리얼 모드
                </span>
              </div>

              <div ref={presetContainerRef} className="flex items-center gap-2 relative">
                <button
                  onClick={() => { setShowLibrary(true); setIsSavingPreset(false); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  라이브러리 열기
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
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-zinc-500 flex items-center gap-1">
                          <FolderOpen className="w-3 h-3" /> 폴더명 (선택)
                        </label>
                        <input 
                          type="text" 
                          value={presetFolderInput}
                          onChange={(e) => setPresetFolderInput(e.target.value)}
                          onKeyDown={(e) => { if(e.key === 'Enter') handleConfirmSavePreset(); if(e.key === 'Escape') handleCancelSavePreset(); }}
                          placeholder="새 폴더명 입력"
                          className="w-full bg-slate-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-[12px] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#8b5cf6]"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-zinc-500 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> 프리셋명 (필수)
                        </label>
                        <input 
                          type="text" 
                          value={presetNameInput}
                          onChange={(e) => setPresetNameInput(e.target.value)}
                          onKeyDown={(e) => { if(e.key === 'Enter') handleConfirmSavePreset(); if(e.key === 'Escape') handleCancelSavePreset(); }}
                          placeholder="프리셋 이름 입력"
                          autoFocus
                          className="w-full bg-slate-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-[12px] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#8b5cf6]"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-1">
                      <button onClick={handleCancelSavePreset} className="px-3 py-1.5 text-[11px] font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md">취소</button>
                      <button onClick={handleConfirmSavePreset} className="px-3 py-1.5 text-[11px] font-bold text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-md shadow-sm">저장하기</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col h-full overflow-y-auto custom-scrollbar px-6 pb-24 relative">
              <div className="flex flex-col gap-6">
                
                {loadedPresetName && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-white dark:bg-zinc-800 flex items-center justify-center">
                        <BookOpen className="w-3.5 h-3.5 text-purple-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">적용된 템플릿/프리셋</span>
                        <span className="text-[12px] font-extrabold text-zinc-800 dark:text-zinc-200">{loadedPresetName}</span>
                      </div>
                    </div>
                    <button onClick={() => setLoadedPresetName('')} className="p-1 hover:bg-purple-200 dark:hover:bg-purple-800/50 rounded-md text-purple-400 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Editorial Mode Context Scope */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-extrabold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 tracking-wider">
                      컨텍스트 범위 <span className="text-zinc-400 font-medium">(CONTEXT SCOPE)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          checked={ignoreContext}
                          onChange={(e) => setIgnoreContext(e.target.checked)}
                          className="peer sr-only" 
                        />
                        <div className="w-3.5 h-3.5 border-2 border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 peer-checked:bg-[#8b5cf6] peer-checked:border-[#8b5cf6] transition-colors flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors">문서 적용 안함 (일반 질문)</span>
                    </label>
                  </div>
                  <div className={`flex bg-white dark:bg-zinc-900 p-1.5 rounded-xl border-2 border-transparent shadow-sm gap-1 transition-opacity ${ignoreContext ? 'opacity-40 pointer-events-none' : ''}`}>
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
                    placeholder="AI에게 요청할 지시문이나 작성할 내용을 자유롭게 입력하세요..."
                    className="w-full bg-white dark:bg-zinc-900 border-2 border-[#e9d5ff] dark:border-[#8b5cf6]/30 focus:border-[#a855f7] rounded-2xl p-4 text-[13px] text-zinc-800 dark:text-zinc-100 focus:outline-none transition-colors shadow-sm resize-none min-h-[450px] disabled:opacity-50 custom-scrollbar leading-relaxed"
                  />
                </div>

                
                {/* File Attachment UI (Shared between modes) */}
                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-[11px] font-extrabold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 tracking-wider">
                    문서 첨부 <span className="text-zinc-400 font-medium">(ATTACHMENT)</span>
                  </label>
                  
                  {attachedFileName ? (
                    <div className="flex items-center justify-between bg-[#06C755]/10 border border-[#06C755]/30 px-3 py-2.5 rounded-xl">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Paperclip className="w-4 h-4 text-[#06C755] shrink-0" />
                        <span className="text-[12px] font-bold text-[#06C755] truncate">{attachedFileName}</span>
                      </div>
                      <button onClick={handleRemoveAttachment} className="p-1 hover:bg-[#06C755]/20 rounded-md text-[#06C755] transition-colors shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isGenerating}
                      className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-zinc-200 dark:border-zinc-700/80 hover:border-[#06C755]/50 hover:bg-[#06C755]/5 rounded-xl py-3 text-[12px] font-bold text-zinc-500 dark:text-zinc-400 transition-colors disabled:opacity-50"
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
                className="w-full py-3.5 text-[14px] font-bold text-white bg-[#06C755] hover:bg-[#05B04B] disabled:bg-[#06C755]/40 dark:disabled:bg-zinc-700 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm shadow-[#06C755]/20"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    AI 작업 수행 중...
                  </>
                ) : generationComplete ? (
                  <>
                    <Sparkles className="w-5 h-5" />
                    프롬프트 수정하여 다시 실행
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    AI 실행
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
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopyResult}
                    className="px-2.5 py-1.5 text-[11px] font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors flex items-center gap-1.5 mr-1"
                    title="클립보드에 복사"
                  >
                    {aiCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {aiCopied ? '복사됨' : '복사'}
                  </button>

                  {targetScope !== 'none' && (
                    <>
                      <button
                        onClick={() => handleApply('replace')}
                        className="px-3 py-1.5 text-[11px] font-bold text-[#8b5cf6] border border-[#8b5cf6]/30 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-md transition-colors"
                        title="기존 내용을 지우고 이 결과로 덮어씁니다."
                      >
                        덮어쓰기
                      </button>
                      <button
                        onClick={() => handleApply('append')}
                        className="px-3 py-1.5 text-[11px] font-bold text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-md transition-colors flex items-center gap-1"
                        title="기존 내용은 유지하고 그 아래에 결과를 이어서 붙입니다."
                      >
                        <Check className="w-3 h-3" />
                        아래에 추가
                      </button>
                    </>
                  )}
                  {true && (
                    <button
                      onClick={() => handleApply('insert')}
                      className="px-3 py-1.5 text-[11px] font-bold text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-md transition-colors flex items-center gap-1"
                      title="에디터에서 현재 깜빡이고 있는 커서 위치에 결과를 삽입합니다."
                    >
                      <Check className="w-3 h-3" />
                      커서 위치에 삽입
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

        {/* AI Prompt Library Overlay */}
        <AIPromptLibrary 
          isOpen={showLibrary}
          onClose={() => setShowLibrary(false)}
          templates={templatesDict}
          presets={presets}
          onSelectTemplate={handleSelectTemplate}
          onSelectPreset={handleLoadPreset}
          onDeletePreset={(id) => handleDeletePreset({ stopPropagation: () => {} } as any, id)}
          onRenamePreset={renamePreset}
        />

      </div>
    </div>
  );
}
