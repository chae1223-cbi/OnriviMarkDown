/**
 * 프로그램명 : OnriviAuthor 
 * 파일명 : AIDraftModal.tsx
 * -----------------------------------------------------------------------
 * 변경내역
 * 🚨 @PATCH : **2026-09-12** — [하단 선택기 라벨 간소화: '제조사:', '모델:' 텍스트 제거 및 컴팩트 드롭다운 정돈]
 *             1) 사용자 UX 피드백 반영: 하단 드롭다운 선택기 내부의 불필요한 '제조사:', '모델:' 텍스트 라벨을 전면 제거하여 모던하고 슬림한 버튼 형태로 정돈
 * 🚨 @PATCH : **2026-09-12** — [가상 출처 환각 전면 차단 및 내부 시스템 출처만 단일 공급원(SSOT) 결합 보장]
 *             1) AI가 임의로 '참고 자료 및 출처' 섹션이나 가상 파일 경로(file:///...)를 날조하지 못하도록 프롬프트 금지 규칙을 엄격히 지정
 *             2) 생성 완료 후 stripHallucinatedCitations 정규식 필터링을 통해 AI가 임의로 덧붙인 모든 후행 출처 섹션 및 가상 링크를 100% 무조건 박멸
 *             3) 오직 실제 내부 지식 보관함에서 검색/첨부된 청크(activeKnowledge)가 존재하고 '출처 각주 포함' 옵션이 활성화된 경우에만 시스템 프로그램이 검증된 실제 내부 지식 출처 마크다운 블록을 단일 공급원(SSOT)으로 결합
 *             4) 지식 참조가 0건이거나 출처 옵션 해제 시 어떠한 참고자료나 출처 블록도 일체 노출되지 않도록 철저히 통제
 * 🚨 @PATCH : **2026-09-12** — [하단 액션바 UI 정돈: 초기화·에디터 이동 제거 및 AI 제조사(Provider)/모델 듀얼 선택기 복원]
 *             1) AI 실행 버튼 좌측에 위치했던 불필요한 '초기화' 및 '에디터 이동' 버튼을 전면 제거하여 하단 바 공간 확보 및 실행 집중도 강화
 *             2) AI 서비스 제조사(Google Gemini, Google Gemma, OpenAI, Anthropic, 직접 입력)와 세부 모델을 연동하여 고를 수 있는 듀얼 선택기 복원 탑재
 *             3) 실제 지식 문서가 주입되지 않은 일반 작성 시 AI가 가상의 출처(NUT_001_..., file:///... 등)를 지어내지 못하도록 환각(Hallucination) 방어 프롬프트 엄격화
 * 🚨 @PATCH : **2026-09-12** — [UI 버튼 정리: 우측 액션바 복사·각주 제거, 복사 아이콘 활성화, Auto-RAG 하단 각주 스위치 재배치]
 *             1) 우측 미리보기 상단 액션바에서 불필요하게 중복/돌출되던 '출처 각주 포함' 체크박스와 텍스트 '복사' 버튼 전면 제거
 *             2) '결과 미리보기' 타이틀 우측에 컴팩트한 복사 아이콘 활성 버튼을 배치하여 결과 텍스트가 있을 때 즉시 복사 가능하도록 사용성 극대화
 *             3) '출처 각주 포함' 옵션을 좌측 지식 팔레트 내 '지식 보관함 자동 참조 (Auto-RAG)' 스위치 바로 아래로 통합 재배치
 * 🚨 @PATCH : **2026-09-12** — [프롬프트 재실행 및 수정 시 지식 출처 배너 즉시 리셋(초기화) 및 닫기 버튼 탑재]
 *             1) 프롬프트 입력창(textarea) 수정 시 이전 실행의 citedSources 및 generationComplete 상태를 즉각 초기화하여 이전 출처 배너가 화면에 계속 남아있는 결함 원천 차단
 *             2) AI 재실행(isGenerating) 중에는 이전 출처 배너를 은닉하고 '새로운 프롬프트 관련 지식 문서 검색 중...' 실시간 상태 표시
 *             3) 참조된 지식 출처 요약 배너 우측 상단에 명시적 닫기([✕]) 버튼을 신설하여 언제든 사용자가 원클릭으로 출처 배너를 해제/초기화할 수 있도록 사용성 극대화
 *             4) Auto-RAG 검색 결과 0건 시 citedSources를 빈 배열([])로 유지하여 인공적인 오매칭 출처 생성 원천 차단
 * 🚨 @PATCH : **2026-09-12** — [환경설정-에디터-AI모달 3자간 AI 모델 단일 소스(SSOT) 동기화 및 단일 선택기 통일]
 *             1) 환경설정과 상이했던 AI 제조사(OpenAI/Anthropic 등 불필요 항목) 및 2단 듀얼 선택기를 전면 제거하고 환경설정과 100% 동일한 공인 10대 모델(ONRIVI_AI_MODELS) 단일 고대비 선택기로 일원화
 *             2) 환경설정의 aiModelName을 실시간 반영하고, 모달 내 선택 시 에디터 상태(onModelChange) 및 localStorage 양방향 즉시 동기화
 *             3) 모달 상단/하단 [초기화] 클릭 시 환경설정에 저장된 기본 모델로 완전 복원 동기화
 * 🚨 @PATCH : **2026-09-12** — [AI 모달 '초기화' 및 '에디터 이동' 버튼 전면 복원 및 시인성 강화]
 *             1) 상단 헤더에 '초기화' 및 '에디터 이동' 버튼을 Modern Technical Editorial 고대비 버튼 스타일로 격상하고 isGenerating 시에도 은닉되지 않도록 보장
 *             2) 하단 액션바(Action Bar)에도 '초기화' 및 '에디터 이동' 버튼을 추가 배치하여 사용자가 어느 위치에서든 즉시 모달 초기화 및 에디터 복귀가 가능하도록 사용성 극대화
 *             3) 우측 에러 진단 화면에도 '초기화' 및 '에디터 이동' 버튼을 추가하여 오류 상황에서도 즉시 탈출 및 재작성 가능
 * 🚨 @PATCH : **2026-09-12** — [사용자 직접 모델 선택 존중: 임의 모델 자동 폴백 전면 제거 및 명확한 오류 진단창 노출]
 *             1) 시스템에 의한 임의 모델 자동 폴백(gemini-2.5-flash 등)을 전면 제거하고 사용자가 지정한 모델만 정직하게 호출하도록 원복
 *             2) 503 과부하 또는 스트림 파싱 에러 발생 시 숨김 없이 화면 양측(좌측 프롬프트 하단 경고 배너 및 우측 전용 에러 화면)에 명확한 오류 원인과 권장 조치 안내를 100% 즉각 노출하여 사용자가 직접 원하는 모델로 변경할 수 있도록 개편
 *             3) draftResult 유무와 무관하게 오류 발생 시 에러 화면을 무조건 최우선 렌더링하고 오류 토스트 명확히 발화
 * 🚨 @PATCH : **2026-09-12** — [RAG 지식 검색 및 출처 연동 전면 정상화]
 *             1) knowledgeClient 통합 파사드 적용으로 웹 브라우저(WASM SQLite) 및 데스크톱 환경 모두에서 지식 검색 및 Auto-RAG 100% 정상 작동 보장
 *             2) resourceFolder/resourceFolderHandle 유연한 폴백(effectiveResourceFolder) 적용 및 KnowledgeAttachmentPalette 무조건 렌더링
 *             3) Auto-RAG 후보 청크 추출 시 신뢰할 수 있는 SSOT 지식 프롬프트 주입 및 상단 출처 배너와 '## 📚 참고 자료 및 출처' 섹션 자동 생성 완전 연동
 * 🚨 @PATCH : **2026-09-12** — 사용자 요구사항 반영: AI 실행 시 입력/참고 문서 상단 메타데이터(YAML Frontmatter, 메타 속성, 주석) 추출 및 출력 원천 차단(stripFrontmatterAndMeta 및 시스템 프롬프트 금지 규칙), RAG 지식 자료 추출 시 인라인 출처 명기 및 '## 📚 참고 자료 및 출처' 섹션 생성 규칙 엄격화; AI 제조사·모델 듀얼 선택기 하단 재배치 및 슬림화; 사용자 친화적 에러 진단 시스템 완비
 * 🚨 @PATCH : **2026-09-12** — 모달 타이틀을 'AI 프롬프트'로 변경, 용어 체계를 '프리셋'에서 '라이브러리'로 전면 통일, 라이브러리 저장 팝오버 Modern Technical Editorial 디자인 시스템 적용 및 기존 저장 폴더 드롭다운/칩 UI 탑재
 * 🚨 @PATCH : **2026-09-11** — Modern Technical Editorial 디자인 시스템 적용 (Cobalt #1d4ed8, Inter / Plus Jakarta Sans)
 *             2026-09-04** — [ONRIVI-KNOWLEDGE-EDITOR-001] 로컬 지식 보관함 검색 & 청크 첨부(KnowledgeAttachmentPalette) 연동, Auto-RAG 자동 참조 모드, 출처 각주(Citations) 자동 생성 및 LDSG v5.0 그린(#1d4ed8) 디자인 토큰 일원화
 * *2026-09-03** — 기본 AI 모델을 최신 플래그십 최고 버전인 Gemini 3.8 Flash(gemini-3.8-flash)로 전면 갱신
 * *2026-08-16** — useEffect 의존성 배열 누락 경고 해결: getPromptTemplates와 loadPresets useEffect에 resourceFolder, resourceFolderHandle 추가
 * *2026-07-20** — AI 모달창의 '프리셋 불러오기' 및 '현재 설정 저장' 팝업 드롭다운이 외부 영역(outside) 클릭 시 자동으로 닫히도록 `useRef` 및 이벤트 리스너(handleClickOutside) 로직 추가 적용
 * -----------------------------------------------------------------------
 */
"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Sparkles, Wand2, Loader2, Check, Save, FolderOpen, Trash2, Copy, Paperclip, Edit2, BookOpen, RotateCcw, Database, ExternalLink, ChevronDown, AlertCircle, Zap } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import { getPromptTemplates, savePromptTemplates, getPromptTemplate, PromptTemplate } from '@/lib/promptTemplates';
import { generateDraftWithAIStream, formatUserFriendlyAIError, FormattedAIError, ONRIVI_AI_MODELS, DEFAULT_AI_MODEL } from '@/lib/gemini';
import AIPromptLibrary from './AIPromptLibrary';
import { KnowledgeAttachmentPalette } from './knowledge/KnowledgeAttachmentPalette';
import { knowledgeClient } from '@/lib/knowledge/knowledgeClient';
import { loadSecureData } from '@/lib/secureStorage';
import type { RetrievalCandidate } from '@/types/knowledge';

export interface AIModelItem {
  id: string;
  label: string;
  badge?: string;
  desc?: string;
}

export interface AIProviderItem {
  id: 'google-gemini' | 'google-gemma' | 'openai' | 'anthropic' | 'custom';
  name: string;
  vendor: string;
  badge?: string;
  models: AIModelItem[];
}

export const AI_PROVIDERS: AIProviderItem[] = [
  {
    id: 'google-gemini',
    name: 'Google (Gemini)',
    vendor: 'Google',
    models: [
      { id: 'gemini-3.8-flash', label: '👑 Gemini 3.8 Flash (최신 최고 버전 / 초고속 플래그십)', badge: '최신' },
      { id: 'gemini-3.7-flash', label: '⚡ Gemini 3.7 Flash (차세대 고성능 모델)', badge: '추천' },
      { id: 'gemini-3.6-flash', label: '🛡️ Gemini 3.6 Flash (고성능 안정화 모델)' },
      { id: 'gemini-3.5-flash', label: '💡 Gemini 3.5 Flash (지능형 균형 모델)' },
      { id: 'gemini-3.1-flash-lite', label: '🪶 Gemini 3.1 Flash Lite (초경량 초고속 응답)' },
      { id: 'gemini-2.5-flash', label: '🚀 Gemini 2.5 Flash (최신 공인 안정 플래그십)', badge: '안정' },
      { id: 'gemini-2.0-flash', label: '⚡ Gemini 2.0 Flash (초고속 실시간 스트리밍)' },
      { id: 'gemini-1.5-flash', label: '📦 Gemini 1.5 Flash (글로벌 공인 표준 모델)' },
    ]
  },
  {
    id: 'google-gemma',
    name: 'Google (Gemma)',
    vendor: 'Google',
    models: [
      { id: 'gemma-2-27b-it', label: '💎 Gemma 2 27B IT (고성능 오픈 모델)' },
      { id: 'gemma-2-9b-it', label: '💎 Gemma 2 9B IT (경량 오픈 모델)' },
    ]
  },
  {
    id: 'openai',
    name: 'OpenAI (GPT)',
    vendor: 'OpenAI',
    models: [
      { id: 'gpt-4.5-preview', label: '🧠 GPT-4.5 Preview (최신 리서치 프리뷰)' },
      { id: 'gpt-4o', label: '🌟 GPT-4o (옴니 플래그십 모델)' },
      { id: 'gpt-4o-mini', label: '⚡ GPT-4o Mini (경량 고속 모델)' },
      { id: 'o3-mini', label: '🔬 o3 Mini (차세대 추론 모델)' },
    ]
  },
  {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    vendor: 'Anthropic',
    models: [
      { id: 'claude-3-7-sonnet-latest', label: '🎭 Claude 3.7 Sonnet (최신 하이브리드 추론)' },
      { id: 'claude-3-5-sonnet-latest', label: '⚡ Claude 3.5 Sonnet (최고 인기 코딩/작성 모델)' },
      { id: 'claude-3-5-haiku-latest', label: '🪶 Claude 3.5 Haiku (초고속 경량 모델)' },
    ]
  },
  {
    id: 'custom',
    name: '직접 입력 (Custom)',
    vendor: 'Custom',
    models: []
  }
];

function inferProviderFromModel(modelName: string): AIProviderItem['id'] {
  if (!modelName) return 'google-gemini';
  if (modelName.startsWith('gemma')) return 'google-gemma';
  if (modelName.startsWith('gpt-') || modelName.startsWith('o3-') || modelName.startsWith('o1-')) return 'openai';
  if (modelName.startsWith('claude-')) return 'anthropic';
  if (modelName.startsWith('gemini-')) return 'google-gemini';
  return 'custom';
}

interface AIDraftModalProps {
  onClose: () => void;
  onApply: (content: string, action: 'insert' | 'replace' | 'append', scope: 'selection' | 'document' | 'none') => void;
  geminiApiKey: string;
  aiModelName: string;
  onModelChange?: (model: string) => void;
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
  onModelChange,
  editorContext,
  initialMode = 'draft',
  resourceFolder,
  resourceFolderHandle
}: AIDraftModalProps) {
  const { showToast } = useToast();

  const effectiveResourceFolder = useMemo(() => {
    let saved = resourceFolder ||
      loadSecureData<string>('resourceFolder') ||
      (typeof window !== 'undefined' ? localStorage.getItem('onrivi_resource_folder_path') : '') ||
      (typeof window !== 'undefined' ? localStorage.getItem('onrivi_resource_folder') : '');
    if (saved && saved.startsWith('U2FsdGVkX1')) {
      const dec = loadSecureData<string>('resourceFolder');
      saved = (dec && !dec.startsWith('U2FsdGVkX1')) ? dec : 'Onrivi_Asset';
    }
    return saved || 'Onrivi_Asset';
  }, [resourceFolder]);
  const effectiveResourceFolderHandle = resourceFolderHandle;

  const [currentModel, setCurrentModel] = useState<string>(() => {
    return aiModelName || (typeof window !== 'undefined' ? localStorage.getItem('onrivi_ai_model_name') || '' : '') || DEFAULT_AI_MODEL;
  });
  const [selectedProviderId, setSelectedProviderId] = useState<AIProviderItem['id']>(() => {
    return inferProviderFromModel(aiModelName || (typeof window !== 'undefined' ? localStorage.getItem('onrivi_ai_model_name') || '' : '') || DEFAULT_AI_MODEL);
  });
  const [formattedError, setFormattedError] = useState<FormattedAIError | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    if (aiModelName) {
      setCurrentModel(aiModelName);
      setSelectedProviderId(inferProviderFromModel(aiModelName));
    }
  }, [aiModelName]);

  const currentProviderModels = useMemo(() => {
    const prov = AI_PROVIDERS.find(p => p.id === selectedProviderId);
    return prov ? prov.models : [];
  }, [selectedProviderId]);

  const handleProviderSelect = (providerId: AIProviderItem['id']) => {
    setSelectedProviderId(providerId);
    setFormattedError(null);
    setLastError(null);

    const targetProv = AI_PROVIDERS.find(p => p.id === providerId);
    if (targetProv && targetProv.models.length > 0) {
      const firstModel = targetProv.models[0].id;
      handleModelSelect(firstModel);
    }
  };

  const handleModelSelect = (newModel: string) => {
    setCurrentModel(newModel);
    setSelectedProviderId(inferProviderFromModel(newModel));
    setFormattedError(null);
    setLastError(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('onrivi_ai_model_name', newModel);
        const raw = localStorage.getItem('onrivi_settings');
        if (raw) {
          const parsed = JSON.parse(raw);
          parsed.aiModelName = newModel;
          localStorage.setItem('onrivi_settings', JSON.stringify(parsed));
        }
      } catch {}
    }
    onModelChange?.(newModel);
  };
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSavingPrompts, setIsSavingPrompts] = useState(false);
  const [presets, setPresets] = useState<AIPreset[]>([]);
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);
  
  const [showLibrary, setShowLibrary] = useState(false);
  const [templatesDict, setTemplatesDict] = useState<Record<string, Record<string, PromptTemplate>>>({});

  // Preset Saving State
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [showFolderDropdown, setShowFolderDropdown] = useState(false);
  const [presetNameInput, setPresetNameInput] = useState('');
  const [presetFolderInput, setPresetFolderInput] = useState('');
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editingPresetName, setEditingPresetName] = useState<string>('');
  const [loadedPresetName, setLoadedPresetName] = useState<string>('');
  const [loadedPresetFolder, setLoadedPresetFolder] = useState<string>('');

  // Existing folders list for preset categorization
  const existingFolders = useMemo(() => {
    const folderSet = new Set<string>();
    presets.forEach(p => {
      if (p.folder && p.folder.trim()) folderSet.add(p.folder.trim());
    });
    Object.keys(templatesDict || {}).forEach(domain => {
      if (domain && domain.trim()) folderSet.add(domain.trim());
    });
    return Array.from(folderSet).sort((a, b) => a.localeCompare(b));
  }, [presets, templatesDict]);

  // Editorial Command State
  const [editorialCommand, setEditorialCommand] = useState('');
  const [targetScope, setTargetScope] = useState<'selection' | 'document' | 'none'>('selection');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [draftResult, setDraftResult] = useState('');
  const [generationComplete, setGenerationComplete] = useState(false);
  const [aiCopied, setAiCopied] = useState(false);
  
  // 🧠 [ONRIVI-KNOWLEDGE-INTEGRATION] 로컬 지식 보관함 RAG 연동 상태
  const [attachedKnowledgeChunks, setAttachedKnowledgeChunks] = useState<RetrievalCandidate[]>([]);
  const [isAutoRagEnabled, setIsAutoRagEnabled] = useState(true);
  const [includeCitations, setIncludeCitations] = useState(true);
  const [citedSources, setCitedSources] = useState<RetrievalCandidate[]>([]);

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
        setShowFolderDropdown(false);
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
    setShowFolderDropdown(false);
    setPresetNameInput(loadedPresetName || '');
    setPresetFolderInput(loadedPresetFolder || '');
    setShowPresetDropdown(false);
  };

  const handleConfirmSavePreset = () => {
    if (!presetNameInput.trim()) {
      showToast("라이브러리 이름을 입력해주세요.", "warning");
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
        targetScope,
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
        targetScope,
        folder: trimmedFolder || undefined
      };
      updated = [...presets, newPreset];
    }
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      (window as any).electronAPI.savePresets(updated, resourceFolder).then((result: any) => {
        if (result.success) {
          setPresets(updated);
          showToast("라이브러리가 저장되었습니다.", "success");
          setIsSavingPreset(false);
          setShowFolderDropdown(false);
        } else {
          if (result.error === 'NO_RESOURCE_FOLDER') {
            showToast("리소스 폴더가 지정되지 않았거나 존재하지 않습니다. 환경설정에서 확인해주세요.", "error");
          } else {
            showToast("라이브러리 저장에 실패했습니다.", "error");
          }
          setIsSavingPreset(false);
          setShowFolderDropdown(false);
        }
      }).catch(() => {
        showToast("라이브러리 저장에 실패했습니다.", "error");
        setIsSavingPreset(false);
        setShowFolderDropdown(false);
      });
    } else if (resourceFolderHandle) {
      resourceFolderHandle.getDirectoryHandle('prompt', { create: true })
        .then((promptDir: any) => promptDir.getFileHandle('ai_presets.json', { create: true }))
        .then((fileHandle: any) => fileHandle.createWritable())
        .then(async (writable: any) => {
          await writable.write(JSON.stringify(updated, null, 2));
          await writable.close();
          setPresets(updated);
          showToast("라이브러리가 저장되었습니다.", "success");
        })
        .catch((e: any) => {
          console.error(e);
          showToast("라이브러리 저장에 실패했습니다: " + e.message, "error");
        })
        .finally(() => {
          setIsSavingPreset(false);
          setShowFolderDropdown(false);
        });
    } else {
      showToast("리소스 폴더가 지정되지 않았습니다. 환경설정에서 확인해주세요.", "error");
      setIsSavingPreset(false);
      setShowFolderDropdown(false);
    }
  };

  const handleCancelSavePreset = () => {
    setIsSavingPreset(false);
    setShowFolderDropdown(false);
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
      setTargetScope(preset.targetScope || 'selection');
    }
    setShowPresetDropdown(false);
    setShowLibrary(false);
    showToast("라이브러리를 불러왔습니다.", "success");
  };

  const handleDeletePreset = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = presets.filter(p => p.id !== id);
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      (window as any).electronAPI.savePresets(updated, resourceFolder).then((result: any) => {
        if (result.success) {
          setPresets(updated);
          showToast("라이브러리가 삭제되었습니다.", "success");
        } else {
          showToast("라이브러리 삭제에 실패했습니다.", "error");
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
          showToast("라이브러리가 삭제되었습니다.", "success");
        })
        .catch((e: any) => {
          console.error(e);
          showToast("라이브러리 삭제에 실패했습니다.", "error");
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
          showToast("라이브러리 이름이 변경되었습니다.", "success");
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
          showToast("라이브러리 이름이 변경되었습니다.", "success");
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

  const handleGenerate = async (overrideModel?: string) => {
    if (!geminiApiKey) {
      showToast("설정에서 Gemini API 키를 먼저 등록해주세요.", "warning");
      onClose();
      return;
    }

    if (selectedProviderId === 'openai' || selectedProviderId === 'anthropic') {
      const vendorName = selectedProviderId === 'openai' ? 'OpenAI' : 'Anthropic';
      const diag: FormattedAIError = {
        title: `${vendorName} 서비스 연동 준비 중`,
        description: `현재 온리비 에디터에는 Google Gemini API 키가 적용되어 있습니다. ${vendorName} 모델 직접 호출은 차기 업데이트에서 별도 API 키 설정과 함께 지원될 예정입니다.`,
        solution: "하단 '제조사'를 'Google (Gemini)' 또는 'Google (Gemma)'로 선택하시면 즉시 AI 초안 생성을 이용하실 수 있습니다.",
        category: 'unknown'
      };
      setFormattedError(diag);
      setLastError(diag.description);
      showToast(`${vendorName} 연동은 준비 중입니다. Google (Gemini) 제조사를 선택해 주세요.`, 'warning');
      return;
    }

    const targetModel = overrideModel || currentModel || DEFAULT_AI_MODEL;
    if (overrideModel && overrideModel !== currentModel) {
      handleModelSelect(overrideModel);
    }
    setFormattedError(null);
    setLastError(null);

    if (!editorialCommand.trim()) {
      showToast("AI에게 전달할 명령 또는 초안 주제를 입력해주세요.", "warning");
      return;
    }

    setIsGenerating(true);
    setDraftResult('');
    setGenerationComplete(false);
    setCitedSources([]); // 🌟 [화면 즉각 초기화] 이전 실행의 지식 출처 요약 배너를 즉각 비워 새로운 추출 준비

    // 🧠 [ONRIVI-KNOWLEDGE-INTEGRATION] 지식 보관함 연동 및 Auto-RAG 처리
    let activeKnowledge: RetrievalCandidate[] = [...attachedKnowledgeChunks];

    // 수동 첨부 청크가 없는데 Auto-RAG가 켜져 있는 경우, 프롬프트 기반으로 지식 자동 검색 수행
    if (activeKnowledge.length === 0 && isAutoRagEnabled) {
      try {
        const searchData = await knowledgeClient.searchKnowledge({
          query: editorialCommand.trim(),
          resourceFolder: effectiveResourceFolder,
          resourceFolderHandle: effectiveResourceFolderHandle,
          limit: 4,
          geminiApiKey,
          aiModelName: targetModel,
        });
        if (searchData && Array.isArray(searchData.candidates) && searchData.candidates.length > 0) {
          activeKnowledge = searchData.candidates.slice(0, 4);
        } else {
          activeKnowledge = [];
        }
      } catch (err) {
        console.warn('[AIDraftModal] Auto-RAG 검색 폴백 실패:', err);
        activeKnowledge = [];
      }
    }

    setCitedSources(activeKnowledge);

    // 문서 상단 메타정보(YAML Frontmatter, JSDoc/HTML 주석) 제거 헬퍼
    const stripFrontmatterAndMeta = (text: string): string => {
      if (!text) return '';
      let clean = text.trim();
      if (clean.startsWith('---')) {
        clean = clean.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
      }
      if (clean.startsWith('/**')) {
        clean = clean.replace(/^\/\*\*[\s\S]*?\*\/\r?\n?/, '');
      }
      if (clean.startsWith('<!--')) {
        clean = clean.replace(/^<!--[\s\S]*?-->\r?\n?/, '');
      }
      return clean.trim();
    };

    let finalSystemPrompt = "당신은 전문적이고 논리적인 고품격 마크다운 작가이자 에디터입니다. 지시사항을 정확하게 반영하여 실용적이고 완성도 높은 한국어 마크다운 문서를 작성하십시오.";
    
    // 메타정보 추출 금지 공통 원칙
    finalSystemPrompt += `\n\n[핵심 금지 규칙: 메타정보 추출 및 출력 절대 금지]
1. 원본 문서나 참고 자료 상단의 메타데이터(YAML Frontmatter \`--- ... ---\`, 제목/작성자/일자 메타 속성, 헤더 주석 등)는 절대로 추출하거나 결과물 상단에 포함하지 마십시오.
2. 결과물은 메타정보 없이 마크다운 본문(제목 헤딩 # 또는 첫 도입 단락)부터 곧바로 시작해야 합니다.`;

    let finalUserPrompt = editorialCommand;

    if (targetScope === 'selection' && editorContext?.selectedText) {
      const cleanSelection = stripFrontmatterAndMeta(editorContext.selectedText);
      finalSystemPrompt += "\n사용자가 제공한 [대상 영역 텍스트]를 참고하거나 이를 바탕으로 명령을 수행하십시오.";
      finalUserPrompt = `${editorialCommand}\n\n[대상 영역 텍스트]\n${cleanSelection}`;
    } else if (targetScope === 'document' && editorContext?.fullText) {
      const cleanDoc = stripFrontmatterAndMeta(editorContext.fullText);
      finalSystemPrompt += "\nYou are a professional editorial assistant. Your task is to write a COMPLETELY NEW document based on the user's command. The provided existing document is ONLY a reference for output formatting (layout, lists, tables), style, tone, and structural format (like heading levels). Do NOT summarize or edit the existing document. Create brand new content that matches the user's command, but strictly mimics the output format, layout, form, and feeling of the reference document. Return only the finalized text without markdown code blocks unless requested.";
      finalUserPrompt = `[새 문서 작성 명령]\n${editorialCommand}\n\n[스타일/구조/출력양식 참고용 기존 문서]\n${cleanDoc}\n\n위의 '참고용 기존 문서'를 요약하거나 정리하지 마세요. 해당 문서는 오직 글의 출력 양식(레이아웃, 표, 목록 구조), 구조(제목 수준 등), 느낌(어조, 문체)을 파악하기 위한 '제공 자료'일 뿐입니다. 반드시 이 자료에 사용된 출력 양식과 톤앤매너 및 일관성을 똑같이 유지하면서, 맨 위 '[새 문서 작성 명령]'에 따라 '완전히 새로운 문서' 창작해 주세요.`;
    }

    if (attachedFileContent) {
      const cleanAttached = stripFrontmatterAndMeta(attachedFileContent);
      finalUserPrompt += `\n\n[첨부 문서 내용: ${attachedFileName}]\n${cleanAttached}`;
    }

    // 🧠 지식 청크 컨텍스트 주입 및 출처 표기 규칙 강화
    if (activeKnowledge.length > 0) {
      const knowledgeContextBlocks = activeKnowledge.map((c, idx) => {
        const title = c.documentTitle || c.headingTitle;
        const path = c.headingPath || c.headingTitle;
        const lineInfo = `L${c.startLine}~L${c.endLine}`;
        const snippet = stripFrontmatterAndMeta(c.snippet || '');
        return `[참고 지식 자료 ${idx + 1}]
- 문서명: ${title}
- 상세 섹션(경로): ${path}
- 원본 파일: ${c.filePath} (${lineInfo})
- 발췌 내용:
${snippet}`;
      }).join('\n\n---\n\n');

      finalUserPrompt += `\n\n[참고 지식 문서 컨텍스트 (Knowledge Base Evidence)]\n${knowledgeContextBlocks}\n\n[출처 표기 필수 원칙] 위의 [참고 지식 문서 컨텍스트]를 최우선 근거로 활용하여 글을 작성하십시오. 단, 글의 마지막에 '참고 자료'나 '출처' 섹션을 절대로 직접 작성하지 마십시오. (시스템 엔진이 검증된 실제 내부 출처 링크를 하단에 자동 결합합니다.)`;
      finalSystemPrompt += `\n\n[지식 자료 추출 및 출처 표기 규칙]
1. 당신에게 제공된 [참고 지식 문서 컨텍스트]는 신뢰할 수 있는 단일 진실 공급원(Single Source of Truth)입니다. 지식 자료의 사실, 정책, 기술 규격 및 상세 정보를 우선적으로 반영하여 작성하십시오. 불필요한 날조나 왜곡(Hallucination)은 엄격히 금지됩니다.
2. 본문 작성 중 특정 지식 자료를 인용할 때는 필요 시 본문 내에서 가볍게 *(출처: [문서명])* 정도로만 언급하십시오.
3. [출처 목록 섹션 직접 작성 절대 금지] 본문 끝에 '## 참고 자료', '## 출처', '## 참고문헌', 'References' 등의 출처 목록 섹션을 절대로 직접 작성하지 마십시오. 검증된 실제 내부 지식 보관함 출처는 시스템에 의해 안전하게 자동 결합됩니다.`;
    } else {
      // 🛡️ [환각 방어] 참조된 실제 지식 문서가 없는 경우, AI가 가상의 파일명이나 출처 링크를 날조(Hallucination)하지 못하도록 원천 차단
      finalSystemPrompt += `\n\n[가상 출처 날조 절대 금지 규칙]
현재 작성 중인 작업에는 외부/내부 지식 보관함 문서가 주입되지 않았습니다(참조 문서 0건).
존재하지 않는 가상의 문서명(예: NUT_001_..., 과일_영양_DB 등), 가상의 파일 경로(file:///...), 가상의 출처 각주, 또는 '참고 자료 및 출처'/'References' 섹션을 절대로 지어내거나 포함하지 마십시오. 어떠한 참고자료나 출처 목록도 생성하지 말고, 오직 순수한 본문 콘텐츠만 완성도 있게 작성하십시오.`;
    }

    try {
      const generated = await generateDraftWithAIStream(
        geminiApiKey,
        targetModel,
        finalSystemPrompt,
        finalUserPrompt,
        (chunkText) => {
          setDraftResult(chunkText);
        }
      );

      // 🧹 [출처 환각 완벽 차단] AI 모델이 임의로 생성하거나 날조한 후행 출처/참고자료 섹션을 정규식으로 완벽 제거
      const stripHallucinatedCitations = (text: string): string => {
        if (!text) return '';
        let cleaned = text;

        // 1. 후행 수평선 + 출처 섹션 또는 독립 출처 섹션 헤딩 패턴 제거
        // 예: ## 📚 참고 자료 및 출처, ## 참고 자료, ## 출처, ## 참고문헌, ## References, ### Sources 등
        cleaned = cleaned.replace(
          /(?:\r?\n)+(?:---+\s*(?:\r?\n)+)?#{1,4}\s*(?:[📚📖🔍📎]\s*)?(?:참고\s*자료(?:\s*및\s*출처)?|참고\s*문헌|출처(?:\s*및\s*근거)?|References?|Sources?|Citations?)(?:[\s\S]*)$/i,
          ''
        );

        // 2. 인용구 형태의 후행 출처 블록 제거 (예: > 📚 **참고 자료**: ... 또는 > 출처: ...)
        cleaned = cleaned.replace(
          /(?:\r?\n)+(?:---+\s*(?:\r?\n)+)?>\s*(?:[📚📖🔍📎]\s*)?(?:\*{1,2})?(?:참고\s*자료|참고\s*문헌|출처|지식\s*보관함|References?|Sources?)(?:[\s\S]*)$/i,
          ''
        );

        // 3. 지식 문서가 0건일 때 AI가 본문 내에 날조한 가상 file:/// 링크를 일반 텍스트로 치환 방어
        if (activeKnowledge.length === 0) {
          cleaned = cleaned.replace(/\[([^\]]+)\]\(file:\/\/\/[^\)]+\)/gi, '$1');
        }

        return cleaned.trim();
      };

      const cleanedContent = stripHallucinatedCitations(generated || '');
      let finalized = cleanedContent;

      // 📚 [단일 진실 공급원(SSOT)] 오직 내부 시스템에 실제 존재하는 지식 청크가 있고, 출처 각주 포함 옵션이 켜져 있을 때만 시스템이 직접 검증된 출처 블록 결합!
      if (activeKnowledge.length > 0 && includeCitations) {
        const sourceList = activeKnowledge.map((c, i) => {
          const title = c.documentTitle || c.headingTitle || '내부 지식 문서';
          const path = c.headingPath || c.headingTitle || '';
          const fileUri = (c.filePath || '').replace(/\\/g, '/');
          const lineAnchor = (c.startLine && c.endLine) ? `#L${c.startLine}-L${c.endLine}` : '';
          const lineInfo = (c.startLine && c.endLine) ? ` (L${c.startLine}~L${c.endLine})` : '';
          const pathInfo = path ? ` - 섹션: \`${path}\`` : '';
          return `${i + 1}. [${title}](file:///${fileUri}${lineAnchor})${pathInfo}${lineInfo}`;
        }).join('\n');
        finalized = `${cleanedContent}\n\n---\n\n## 📚 내부 지식 보관함 출처\n${sourceList}\n`;
      }
      setDraftResult(finalized);
      setGenerationComplete(true);
      setFormattedError(null);
      setLastError(null);
      if (activeKnowledge.length > 0) {
        showToast(`AI 생성이 완료되었습니다. (지식 ${activeKnowledge.length}건 참조됨)`, 'success');
      } else {
        showToast('AI 글 생성이 완료되었습니다. 결과를 확인해주세요.', 'success');
      }
    } catch (e: any) {
      console.error('AIDraftModal handleGenerate Error:', e);
      const diagnosed: FormattedAIError = (e as any).diagnosed || formatUserFriendlyAIError(e, targetModel);
      setFormattedError(diagnosed);
      setLastError(diagnosed.description);
      setDraftResult('');
      setGenerationComplete(false);
      showToast(`${diagnosed.title}: ${diagnosed.description}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setEditorialCommand('');
    setLoadedPresetName('');
    setLoadedPresetFolder('');
    setTargetScope('selection');
    setAttachedFileName('');
    setAttachedFileContent('');
    setAttachedKnowledgeChunks([]);
    setCitedSources([]);
    setDraftResult('');
    setGenerationComplete(false);
    setIsGenerating(false);
    setFormattedError(null);
    setLastError(null);
    const defaultModel = aiModelName || DEFAULT_AI_MODEL;
    setCurrentModel(defaultModel);
    showToast('모든 입력 내용과 설정이 초기화되었습니다.', 'success');
  };

  const handleApply = (action: 'insert' | 'replace' | 'append') => {
    if (!draftResult.trim()) {
      showToast("생성된 결과가 없습니다.", "warning");
      return;
    }

    let finalOutput = draftResult;
    if (includeCitations && citedSources.length > 0) {
      const hasDirectFileLinks = finalOutput.includes('file:///');
      if (!hasDirectFileLinks) {
        const footnotes = citedSources.map((c, i) => {
          const title = c.documentTitle || c.headingTitle || '내부 지식 문서';
          const path = c.headingPath || c.headingTitle || '';
          const fileUri = (c.filePath || '').replace(/\\/g, '/');
          const lineAnchor = (c.startLine && c.endLine) ? `#L${c.startLine}-L${c.endLine}` : '';
          const lineInfo = (c.startLine && c.endLine) ? ` (L${c.startLine}~L${c.endLine})` : '';
          const pathInfo = path ? ` : \`${path}\`` : '';
          return `> ${i + 1}. [${title}](file:///${fileUri}${lineAnchor})${pathInfo}${lineInfo}`;
        }).join('\n');
        finalOutput += `\n\n---\n> 📚 **내부 지식 보관함 원본 출처**:\n${footnotes}\n`;
      }
    }

    onApply(finalOutput, action, targetScope);
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
            <div className="w-8 h-8 rounded-lg bg-[#1d4ed8]/15 text-[#1d4ed8] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-base font-bold text-[#1d4ed8] tracking-tight">
                AI 프롬프트
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isGenerating ? 'bg-amber-500 animate-pulse' : lastError ? 'bg-rose-500' : 'bg-[#1d4ed8]'}`}></div>
                <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                  {isGenerating ? "AI가 작업을 수행하고 있습니다..." : lastError ? "요청 실패 (우측 안내를 확인해 주세요)" : "협업 준비 완료"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200/90 dark:border-zinc-700 font-bold text-[12px] shadow-2xs transition-all disabled:opacity-40 cursor-pointer"
                title="모든 입력 내용 및 설정 초기화"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>초기화</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200/90 dark:border-zinc-700 font-bold text-[12px] shadow-2xs transition-all cursor-pointer"
                title="AI 모달을 닫고 에디터로 돌아갑니다"
              >
                <span>에디터 이동</span>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Body (Side-by-side) */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left Column: Prompts */}
          <div className="flex-1 bg-slate-50 dark:bg-zinc-800/50 border-r border-zinc-100 dark:border-zinc-800 flex flex-col relative overflow-hidden">
            
            {/* Mode & Preset Top Bar */}
            <div className="px-6 pt-5 pb-3 shrink-0 flex items-center justify-between z-10 relative">
              <div className="flex bg-zinc-200/50 dark:bg-zinc-800 p-1 rounded-lg">
                <span className="px-3 py-1.5 text-[12px] font-bold bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 shadow-sm rounded-md">
                  AI 프롬프트
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
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold text-[#1d4ed8] dark:text-blue-400 hover:bg-[#1d4ed8]/10 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  현재 설정 저장
                </button>

                {/* Preset Saving Popover */}
                {isSavingPreset && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 rounded-xl shadow-2xl overflow-visible z-50 p-4 flex flex-col gap-3.5">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-[#1d4ed8]/10 dark:bg-[#1d4ed8]/20 flex items-center justify-center text-[#1d4ed8] dark:text-blue-400">
                          <BookOpen className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">라이브러리 저장</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCancelSavePreset}
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 rounded transition-colors"
                        title="닫기"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-col gap-3">
                      {/* Folder Name & Selector */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                            <FolderOpen className="w-3.5 h-3.5 text-[#1d4ed8] dark:text-blue-400" />
                            <span>폴더명 <span className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400">(선택)</span></span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowFolderDropdown(prev => !prev)}
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 transition-colors ${
                              showFolderDropdown
                                ? 'bg-[#1d4ed8] text-white shadow-xs'
                                : 'text-[#1d4ed8] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800/60'
                            }`}
                          >
                            <FolderOpen className="w-3 h-3" />
                            <span>폴더 선택</span>
                            <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${showFolderDropdown ? 'rotate-180' : ''}`} />
                          </button>
                        </div>

                        <div className="relative">
                          <input 
                            type="text" 
                            value={presetFolderInput}
                            onChange={(e) => setPresetFolderInput(e.target.value)}
                            onKeyDown={(e) => { 
                              if (e.key === 'Enter') handleConfirmSavePreset(); 
                              if (e.key === 'Escape') {
                                if (showFolderDropdown) setShowFolderDropdown(false);
                                else handleCancelSavePreset();
                              }
                            }}
                            placeholder="새 폴더명 입력 또는 폴더 선택"
                            className="w-full bg-slate-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-[12px] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8] transition-all"
                          />

                          {/* Folder Dropdown */}
                          {showFolderDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl z-30 max-h-44 overflow-y-auto custom-scrollbar p-1">
                              <div className="px-2 py-1 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                                기존 저장 폴더 목록
                              </div>
                              {existingFolders.length === 0 ? (
                                <div className="px-3 py-2.5 text-[11px] text-zinc-600 dark:text-zinc-400 text-center">
                                  저장된 폴더가 없습니다.<br />새 폴더명을 직접 입력해주세요.
                                </div>
                              ) : (
                                existingFolders.map(folder => (
                                  <button
                                    key={folder}
                                    type="button"
                                    onClick={() => {
                                      setPresetFolderInput(folder);
                                      setShowFolderDropdown(false);
                                    }}
                                    className={`w-full text-left px-2.5 py-1.5 text-[11px] rounded flex items-center justify-between transition-colors ${
                                      presetFolderInput === folder
                                        ? 'bg-[#1d4ed8]/10 dark:bg-[#1d4ed8]/20 text-[#1d4ed8] dark:text-blue-400 font-bold'
                                        : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                    }`}
                                  >
                                    <span className="flex items-center gap-1.5 truncate">
                                      <FolderOpen className="w-3.5 h-3.5 shrink-0 opacity-70" />
                                      <span className="truncate">{folder}</span>
                                    </span>
                                    {presetFolderInput === folder && (
                                      <Check className="w-3.5 h-3.5 text-[#1d4ed8] shrink-0" />
                                    )}
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                        </div>

                        {/* Quick Selection Chips */}
                        {existingFolders.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 pt-0.5">
                            <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-medium">추천:</span>
                            {existingFolders.slice(0, 4).map(folder => (
                              <button
                                key={folder}
                                type="button"
                                onClick={() => setPresetFolderInput(folder)}
                                className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                                  presetFolderInput === folder
                                    ? 'bg-[#1d4ed8] text-white border-[#1d4ed8] font-bold shadow-xs'
                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-[#1d4ed8]/50'
                                }`}
                              >
                                {folder}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Library Name */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-[#1d4ed8] dark:text-blue-400" />
                          <span>라이브러리 이름 <span className="text-red-500">*</span></span>
                        </label>
                        <input 
                          type="text" 
                          value={presetNameInput}
                          onChange={(e) => setPresetNameInput(e.target.value)}
                          onKeyDown={(e) => { 
                            if (e.key === 'Enter') handleConfirmSavePreset(); 
                            if (e.key === 'Escape') handleCancelSavePreset(); 
                          }}
                          placeholder="라이브러리 이름 입력"
                          autoFocus
                          className="w-full bg-slate-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-[12px] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8] transition-all"
                        />
                      </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      <button 
                        type="button"
                        onClick={handleCancelSavePreset} 
                        className="px-3 py-1.5 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                      >
                        취소
                      </button>
                      <button 
                        type="button"
                        onClick={handleConfirmSavePreset} 
                        className="px-3.5 py-1.5 text-[11px] font-bold text-white bg-[#1d4ed8] hover:bg-[#1e40af] active:bg-[#1e3a8a] rounded-md shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        저장하기
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col h-full overflow-y-auto custom-scrollbar px-6 pb-28 relative">
              <div className="flex flex-col gap-6">
                
                {loadedPresetName && (
                  <div className="bg-blue-50/70 dark:bg-blue-900/20 border border-blue-200/80 dark:border-blue-800/60 rounded-lg p-3 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded bg-[#1d4ed8]/10 dark:bg-[#1d4ed8]/20 flex items-center justify-center">
                        <BookOpen className="w-3.5 h-3.5 text-[#1d4ed8] dark:text-blue-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-[#1d4ed8] dark:text-blue-400">적용된 템플릿/라이브러리</span>
                        <span className="text-[12px] font-extrabold text-zinc-900 dark:text-zinc-100">{loadedPresetName}</span>
                      </div>
                    </div>
                    <button onClick={() => setLoadedPresetName('')} className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800/40 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Editorial Prompt Input Area */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-2 rounded-xl border border-zinc-200/60 dark:border-zinc-800 shadow-2xs">
                    <label className="text-[12px] font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#1d4ed8]" />
                      <span>어시스턴트에게 지시할 내용 (프롬프트)</span>
                    </label>
                    <span className="text-[10px] font-medium text-zinc-400">Ctrl + Enter 로 즉시 실행</span>
                  </div>
                  <textarea
                    value={editorialCommand}
                    onChange={e => {
                      const val = e.target.value;
                      setEditorialCommand(val);
                      // 🌟 프롬프트 수정 시 이전 실행의 지식 출처 요약 배너 및 완료 상태 즉시 리셋 (오래된 정보 잔류 차단)
                      if (citedSources.length > 0) {
                        setCitedSources([]);
                      }
                      if (generationComplete) {
                        setGenerationComplete(false);
                      }
                    }}
                    placeholder="예: 위 글의 문체와 레이아웃을 그대로 유지하면서, 최신 클라우드 기술 트렌드를 소개하는 새로운 글을 작성해줘."
                    className="flex-1 min-h-[160px] p-3.5 text-[13px] border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 outline-none focus:border-[#1d4ed8] resize-none leading-relaxed transition-all shadow-2xs font-sans"
                  />
                </div>

                {/* 🚨 에러 발생 시 즉시 좌측 프롬프트 하단에도 명확히 노출되는 오류 경고 배너 */}
                {(formattedError || lastError) && !isGenerating && (
                  <div className="p-3.5 rounded-xl bg-rose-50/95 dark:bg-rose-950/50 border-2 border-rose-300 dark:border-rose-800/80 text-rose-800 dark:text-rose-200 flex flex-col gap-2 shadow-sm animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                        <span className="font-extrabold text-[13px] text-rose-700 dark:text-rose-300">
                          {formattedError?.title || "AI 실행 오류 발생"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setFormattedError(null); setLastError(null); }}
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 rounded cursor-pointer"
                        title="닫기"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-[12px] text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium bg-white/80 dark:bg-zinc-900/80 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900/60">
                      {formattedError?.description || lastError}
                    </div>
                    {formattedError?.solution && (
                      <div className="text-[11px] text-blue-700 dark:text-blue-300 font-semibold bg-blue-50/80 dark:bg-blue-950/40 p-2.5 rounded-lg border border-blue-200 dark:border-blue-900/60">
                        💡 <strong>해결 방법:</strong> {formattedError.solution}
                      </div>
                    )}
                  </div>
                )}

                {/* Scope & Context Options */}
                <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80 bg-white dark:bg-zinc-900/60 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-700 dark:text-zinc-300">작업 대상 범위</span>
                    <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setTargetScope('selection')}
                        className={`px-2.5 py-1 rounded-md font-semibold transition ${
                          targetScope === 'selection'
                            ? 'bg-white dark:bg-zinc-700 text-[#1d4ed8] shadow-xs'
                            : 'text-zinc-500'
                        }`}
                      >
                        선택 영역만
                      </button>
                      <button
                        type="button"
                        onClick={() => setTargetScope('document')}
                        className={`px-2.5 py-1 rounded-md font-semibold transition ${
                          targetScope === 'document'
                            ? 'bg-white dark:bg-zinc-700 text-[#1d4ed8] shadow-xs'
                            : 'text-zinc-500'
                        }`}
                      >
                        문서 전체 (양식 참조)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTargetScope('none')}
                        className={`px-2.5 py-1 rounded-md font-semibold transition ${
                          targetScope === 'none'
                            ? 'bg-white dark:bg-zinc-700 text-[#1d4ed8] shadow-xs'
                            : 'text-zinc-500'
                        }`}
                      >
                        본문 무시 (신규)
                      </button>
                    </div>
                  </div>

                  {/* Attachment Bar */}
                  {attachedFileName ? (
                    <div className="flex items-center justify-between bg-[#1d4ed8]/10 border border-[#1d4ed8]/30 px-3 py-2 rounded-xl">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Paperclip className="w-4 h-4 text-[#1d4ed8] shrink-0" />
                        <span className="text-[12px] font-bold text-[#1d4ed8] truncate">{attachedFileName}</span>
                      </div>
                      <button onClick={handleRemoveAttachment} className="p-1 hover:bg-[#1d4ed8]/20 rounded-md text-[#1d4ed8] transition-colors shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isGenerating}
                      className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-zinc-200 dark:border-zinc-700/80 hover:border-[#1d4ed8]/50 hover:bg-[#1d4ed8]/5 rounded-xl py-2.5 text-[12px] font-bold text-zinc-500 dark:text-zinc-400 transition-colors disabled:opacity-50 cursor-pointer"
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

                {/* 🧠 [ONRIVI-KNOWLEDGE-PALETTE] 지식 보관함 검색 & 첨부 팔레트 */}
                <KnowledgeAttachmentPalette
                  resourceFolder={effectiveResourceFolder}
                  resourceFolderHandle={effectiveResourceFolderHandle}
                  attachedChunks={attachedKnowledgeChunks}
                  onAttachChunk={(chunk) => {
                    if (!attachedKnowledgeChunks.some(c => c.chunkId === chunk.chunkId)) {
                      setAttachedKnowledgeChunks(prev => [...prev, chunk]);
                      showToast(`'${chunk.headingPath || chunk.headingTitle}' 청크가 첨부되었습니다.`, 'success');
                    }
                  }}
                  onDetachChunk={(chunkId) => {
                    setAttachedKnowledgeChunks(prev => prev.filter(c => c.chunkId !== chunkId));
                  }}
                  onClearAllChunks={() => setAttachedKnowledgeChunks([])}
                  isAutoRagEnabled={isAutoRagEnabled}
                  onToggleAutoRag={setIsAutoRagEnabled}
                  includeCitations={includeCitations}
                  onToggleIncludeCitations={setIncludeCitations}
                  currentCharsUsed={
                    attachedKnowledgeChunks.reduce((acc, c) => acc + (c.snippet?.length || 0), 0) +
                    (attachedFileContent?.length || 0)
                  }
                  showToast={showToast}
                />

              </div>

            </div>

            {/* Fixed Bottom Controls: Provider/Model Selector + AI 실행 Button */}
            <div className="absolute bottom-6 left-6 right-6 z-10 bg-slate-50/95 dark:bg-zinc-800/95 backdrop-blur-xs pt-2 flex items-center gap-2.5">
              {/* AI 제조사 및 모델 선택기 */}
              <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 p-1 rounded-xl border border-slate-200 dark:border-zinc-700/80 shadow-2xs shrink-0">
                {/* 제조사 선택 */}
                <div className="flex items-center px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700">
                  <div className="relative flex items-center">
                    <select
                      value={selectedProviderId}
                      onChange={(e) => handleProviderSelect(e.target.value as any)}
                      disabled={isGenerating}
                      className="appearance-none bg-transparent pr-4 text-[12px] font-bold text-[#1d4ed8] dark:text-blue-400 outline-none cursor-pointer disabled:opacity-50"
                      title="AI 서비스 제조사를 선택하세요"
                    >
                      {AI_PROVIDERS.map((p) => (
                        <option key={p.id} value={p.id} className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-medium">
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-0 pointer-events-none" />
                  </div>
                </div>

                {/* 모델 선택 */}
                <div className="flex items-center px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700">
                  <div className="relative flex items-center">
                    {selectedProviderId === 'custom' ? (
                      <input
                        type="text"
                        value={currentModel}
                        onChange={(e) => handleModelSelect(e.target.value)}
                        placeholder="모델명 직접 입력"
                        className="bg-transparent text-[12px] font-mono font-bold text-[#1d4ed8] dark:text-blue-400 outline-none w-32"
                      />
                    ) : (
                      <>
                        <select
                          value={currentModel}
                          onChange={(e) => handleModelSelect(e.target.value)}
                          disabled={isGenerating}
                          className="appearance-none bg-transparent pr-5 text-[12px] font-bold text-[#1d4ed8] dark:text-blue-400 outline-none cursor-pointer disabled:opacity-50 max-w-[210px] truncate"
                          title="사용할 AI 모델을 선택하세요"
                        >
                          {currentProviderModels.map((m) => (
                            <option key={m.id} value={m.id} className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-medium">
                              {m.label}
                            </option>
                          ))}
                          {!currentProviderModels.some(m => m.id === currentModel) && (
                            <option value={currentModel} className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-medium">
                              ✏️ {currentModel}
                            </option>
                          )}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-0 pointer-events-none" />
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* AI 실행 버튼 */}
              <button
                type="button"
                onClick={() => handleGenerate()}
                disabled={isGenerating}
                className="flex-1 py-3.5 text-[14px] font-bold text-white bg-[#1d4ed8] hover:bg-[#1e40af] disabled:bg-[#1d4ed8]/40 dark:disabled:bg-zinc-700 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm shadow-[#1d4ed8]/20 cursor-pointer"
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
              <div className="flex items-center gap-2.5">
                <h3 className="text-[11px] font-extrabold text-zinc-400 tracking-wider">
                  결과 미리보기 <span className="font-medium">(OUTPUT PREVIEW)</span>
                </h3>
                {draftResult.trim() && (
                  <button
                    type="button"
                    onClick={handleCopyResult}
                    className={`p-1.5 rounded-lg border transition-all flex items-center justify-center cursor-pointer shadow-2xs ${
                      aiCopied
                        ? 'bg-emerald-500 text-white border-emerald-600 scale-105'
                        : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border-zinc-200/90 dark:border-zinc-700'
                    }`}
                    title={aiCopied ? "클립보드에 복사되었습니다!" : "결과 미리보기 전체 복사"}
                  >
                    {aiCopied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
              
              {/* Apply Buttons (Only visible when generated) */}
              {generationComplete && !isGenerating && draftResult.trim() && (
                <div className="flex items-center gap-2">
                  {targetScope !== 'none' && (
                    <>
                      <button
                        onClick={() => handleApply('replace')}
                        className="px-3 py-1.5 text-[11px] font-bold text-[#1d4ed8] border border-[#1d4ed8]/30 hover:bg-[#1d4ed8]/10 rounded-md transition-colors cursor-pointer"
                        title="기존 내용을 지우고 이 결과로 덮어씁니다."
                      >
                        덮어쓰기
                      </button>
                      <button
                        onClick={() => handleApply('append')}
                        className="px-3 py-1.5 text-[11px] font-bold text-white bg-[#1d4ed8] hover:bg-[#1e40af] rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                        title="기존 내용은 유지하고 그 아래에 결과를 이어서 붙입니다."
                      >
                        <Check className="w-3 h-3" />
                        아래에 추가
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleApply('insert')}
                    className="px-3 py-1.5 text-[11px] font-bold text-white bg-[#1d4ed8] hover:bg-[#1e40af] rounded-md transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                    title="에디터에서 현재 깜빡이고 있는 커서 위치에 결과를 삽입합니다."
                  >
                    <Check className="w-3 h-3" />
                    커서 위치에 삽입
                  </button>
                </div>
              )}
            </div>

            {/* 참조된 지식 출처 요약 배너 (재실행 시 즉시 초기화 및 실시간 탐색 상태 연동) */}
            {isGenerating && isAutoRagEnabled ? (
              <div className="mx-8 mb-3 p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/25 border border-blue-200 dark:border-blue-800/60 flex items-center justify-between shrink-0 shadow-2xs">
                <span className="text-[11px] font-bold text-[#1d4ed8] dark:text-blue-400 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1d4ed8]" />
                  새로운 프롬프트 관련 지식 문서 검색 중...
                </span>
                <span className="text-[10px] text-zinc-400">Auto-RAG 지식 엔진 실시간 연동</span>
              </div>
            ) : (!isGenerating && citedSources.length > 0) ? (
              <div className="mx-8 mb-3 p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-[#1d4ed8]/30 flex flex-col gap-1.5 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-[#1d4ed8] flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    참조된 지식 문서 ({citedSources.length}건)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-zinc-400">
                      단일 진실 공급원(SSOT) 기반 생성
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setCitedSources([]);
                        setAttachedKnowledgeChunks([]);
                        showToast('참조 지식 배너가 해제되었습니다.', 'info');
                      }}
                      className="p-1 rounded text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer flex items-center gap-0.5 text-[10px] font-medium"
                      title="참조 지식 배너 닫기 및 해제"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>해제</span>
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto custom-scrollbar">
                  {citedSources.map((c) => (
                    <span
                      key={c.chunkId}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-white dark:bg-zinc-800 border border-[#1d4ed8]/20 text-zinc-800 dark:text-zinc-200 shadow-2xs"
                      title={`${c.filePath} (L${c.startLine}~L${c.endLine})`}
                    >
                      <span className="font-bold text-[#1d4ed8]">{c.documentTitle}</span>
                      <span className="text-zinc-400">›</span>
                      <span className="truncate max-w-[130px]">{c.headingPath || c.headingTitle}</span>
                      <span className="font-mono text-zinc-400">L{c.startLine}</span>
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Right Pane Content */}
            <div className="flex-1 overflow-hidden relative">
              {(formattedError || lastError) && !isGenerating ? (
                // Dedicated High-Contrast User-Friendly Error State (Rule 8 compliant)
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 overflow-y-auto custom-scrollbar">
                  <div className="max-w-md w-full bg-rose-50/90 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-800/70 rounded-2xl p-6 shadow-md flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-[15px] font-extrabold text-rose-700 dark:text-rose-300 leading-tight">
                            {formattedError?.title || "AI 응답 생성 일시 지연"}
                          </h4>
                          <button
                            type="button"
                            onClick={() => {
                              setFormattedError(null);
                              setLastError(null);
                            }}
                            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-md transition cursor-pointer"
                            title="안내 닫기"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] font-mono font-bold text-rose-900 dark:text-rose-200 bg-rose-200/70 dark:bg-rose-900/50 px-2 py-0.5 rounded-md inline-block">
                          현재 선택된 모델: {ONRIVI_AI_MODELS.find(m => m.id === currentModel)?.name || currentModel}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2.5 bg-white dark:bg-zinc-900/95 p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 shadow-2xs">
                      <div>
                        <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 mb-0.5">발생 원인</div>
                        <div className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed">
                          {formattedError?.description || lastError}
                        </div>
                      </div>
                      {formattedError?.solution && (
                        <div className="pt-2.5 border-t border-rose-100 dark:border-zinc-800">
                          <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mb-0.5">권장 조치 방법</div>
                          <div className="text-[12px] font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed">
                            {formattedError.solution}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 pt-1">
                      <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 text-center">
                        원하시는 모델로 변경하거나 다시 실행할 수 있습니다:
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            handleModelSelect('gemini-2.5-flash');
                            showToast('AI 모델이 Gemini 2.5 Flash로 변경되었습니다. 이제 다시 실행하실 수 있습니다.', 'info');
                          }}
                          className={`flex-1 py-2 px-3 rounded-xl text-[12px] font-bold border shadow-2xs active:scale-98 transition flex items-center justify-center gap-1.5 cursor-pointer ${
                            currentModel === 'gemini-2.5-flash'
                              ? 'bg-[#1d4ed8] text-white border-[#1d4ed8]'
                              : 'text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 border-zinc-300 dark:border-zinc-700'
                          }`}
                          title="공인 안정 버전 Gemini 2.5 Flash로 모델을 변경합니다"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate">Gemini 2.5 Flash로 변경</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleModelSelect('gemini-1.5-flash');
                            showToast('AI 모델이 Gemini 1.5 Flash로 변경되었습니다. 이제 다시 실행하실 수 있습니다.', 'info');
                          }}
                          className={`flex-1 py-2 px-3 rounded-xl text-[12px] font-bold border shadow-2xs active:scale-98 transition flex items-center justify-center gap-1.5 cursor-pointer ${
                            currentModel === 'gemini-1.5-flash'
                              ? 'bg-[#1d4ed8] text-white border-[#1d4ed8]'
                              : 'text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 border-zinc-300 dark:border-zinc-700'
                          }`}
                          title="글로벌 표준 안정 버전 Gemini 1.5 Flash로 모델을 변경합니다"
                        >
                          <Zap className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="truncate">Gemini 1.5 Flash로 변경</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleGenerate()}
                        className="w-full py-2.5 px-4 rounded-xl text-[13px] font-bold text-white bg-[#1d4ed8] hover:bg-[#1e40af] shadow-xs active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer mt-1"
                      >
                        <RotateCcw className="w-4 h-4" />
                        현재 선택된 모델({currentModel})로 실행
                      </button>

                      <div className="flex items-center gap-2 pt-1 border-t border-rose-200 dark:border-rose-900/60 mt-1">
                        <button
                          type="button"
                          onClick={handleReset}
                          className="flex-1 py-2 px-3 rounded-xl text-[12px] font-bold text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                          title="모든 입력 및 에러 내용 초기화"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>초기화</span>
                        </button>
                        <button
                          type="button"
                          onClick={onClose}
                          className="flex-1 py-2 px-3 rounded-xl text-[12px] font-bold text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                          title="AI 모달을 닫고 에디터로 복귀"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>에디터 이동</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (!isGenerating && !generationComplete && !draftResult) ? (
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
