/**
 * 프로그램명 : OnriviAuthor
 * 파일명 : StyleManagerModal.tsx
 * -----------------------------------------------------------------------
 * 🚨 @PATCH : **2026-09-25** — [시스템 제공 서식 개편 동기화]: 구버전 서식 2종 삭제 및 신규 시스템 제공 서식 5종(Onrivi 기술 표준 서식, Onrivi 법률·계약서 A4 공식 문서, Onrivi 네이버 블로그 감성 서식, Onrivi 일반 기술서적 표준 서식, Onrivi 공식 행사 및 가정통신문 안내장 서식) 🏛️ 시스템 제공 서식 탭 연동
 * 🚨 @PATCH : **2026-09-25** — [체크박스 및 체크리스트 글자색 본문 기본색(#2f2f2f) AI 프롬프트 지시]: AI 서식 생성 지시문에 체크박스 및 글자색을 본문과 동일한 #2f2f2f로 일치시키도록 명시
 * 🚨 @PATCH : **2026-09-25** — [체크리스트 완료 항목 스타일 '효과없음(none)' AI 프롬프트 강제 지시]: AI 서식 생성 지시문 및 checkboxStructure에 checkedEffect 'none'을 강제 지시하여 취소선/반투명 오염 방지
 * 🚨 @PATCH : **2026-09-24** — [새 서식 추가 Onrivi 기본서식 100% 완전체 정규화(normalizeCssProfile) 일원화]: handleCreateProfile에서 하드코딩된 폴백을 소거하고 normalizeCssProfile을 통해 DEFAULT_PROFILE의 7대 쇼케이스 태그 및 구조체를 100% 안전 복제하도록 개선
 * 🚨 @PATCH : **2026-09-24** — [AI 서식 생성 미디어(동영상·지도·이미지) 너비 100% 및 16:9 가로형 규격 강제 지시문 탑재]: AI 프롬프트 필수 요구사항에 미디어 객체(img, video, map)의 width: "100%", video height: "315px", map height: "400px" 명시적 규격을 탑재하여 기형적 폭 축소 방지
 * 🚨 @PATCH : **2026-09-24** — [기본 서식 명칭 'Onrivi 기본서식' 표준화]: 새 서식 추가 및 AI 프롬프트 지시문에서 기준 서식 명칭을 'Onrivi 기본서식'으로 확정
 * 🚨 @PATCH : **2026-09-24** — [기본 서식 'ChatGPT 스타일 콘텐츠' 전환 및 AI 프롬프트/새 서식 생성 동기화]: 새 서식 추가 시 DEFAULT_PROFILE 기반 100% 딥 클론 생성 및 AI 프롬프트 지시문 표준 여백(상하 22mm, 좌 19mm, 우 20mm), fontSize 16px, lineHeight 1.75 명시
 * 🚨 @PATCH : **2026-09-24** — [AI 서식 생성 모델 사용자 선택기 및 오류 발생 시 모델 변경·재시도 인터랙티브 UI 구축]:
 *             1) AIDraftModal과 동일한 사용자 주도 AI 모델 선택기(ONRIVI_AI_MODELS 연동) 탑재
 *             2) 503 과부하, 429 한도 초과 등 오류 발생 시 원인/해결책 상세 안내 및 원하는 모델(3.8/3.7/3.6 Flash 등)을 직접 선택하여 즉시 재시도할 수 있는 대화형 진단 카드 제공
 *             3) normalizeAIModelName 및 ensureDecryptedApiKey 연동으로 구버전/암호화 모델 및 키 무해 복호화 보장
 * 🚨 @PATCH : **2026-09-24** — [표준 여백(A4 세로, 상하 18mm, 좌우 12mm) 내보내기/가져오기/AI 프롬프트 생성 전면 동기화]:
 *             - AI 프롬프트 지시문에 pageStyle 표준 여백(marginTop: 18mm, marginBottom: 18mm, marginLeft: 12mm, marginRight: 12mm) 강제 규격 명시
 *             - 서식 히어로 헤더 및 안내 문구에 표준 여백 요약 정보 반영
 * 🚨 @PATCH : **2026-09-24** — [서식 관리 센터 Modern Technical Editorial 디자인 시스템 및 UI 전면 재구성]:
 *             1) [기본서식 기반 새로만들기]: 새 서식 추가 시 DEFAULT_PROFILE(ChatGPT 스타일 콘텐츠)의 pageStyle, rules, tableStructure, hrStructure, checkboxStructure를 100% 딥 클론하여 완전체로 즉시 생성 및 이름 입력 포커스 연동
 *             2) [표 테두리·행·열 두께(tableStructure) 전면 반영]: 내보내기/가져오기/붙여넣기/AI 프롬프트 생성 전 과정에 tableStructure(outerBorderWidth, rowBorderWidth, colBorderWidth) 완벽 연동 및 normalizeCssProfile 자동 하이드레이션
 *             3) [가져오기 & 붙여넣기 듀얼 허브]: 파일 업로드(.json) 및 JSON 텍스트 클립보드 붙여넣기 영역 전면 개편
 *             4) [내보내기 & 클립보드 복사 듀얼 지원]: 파일 다운로드 및 JSON 원클릭 클립보드 복사 동시 제공
 *             5) [LNB 사이드바 표준 디자인 적용]: 세로선 인디케이터 배제, 고대비 볼드 텍스트 및 코발트 라운드 배경 하이라이트 통일
 * 🚨 @PATCH : **2026-09-24** — [서식 내보내기 7대 쇼케이스 완전체 정규화(normalizeCssProfile) 및 안전 파일명 동기화]
 * 🚨 @PATCH : **2026-09-24** — [외부 서식 파일 올리기 및 JSON 붙여넣기 정제·선택 동기화 강화]
 * 🚨 @PATCH : **2026-09-24** — [프롬프트 AI 서식 생성 즉시 자동 적용 및 API 키 폴백 보강]
 * 🚨 @PATCH : **2026-09-12** — [모든 AI 질의 표준 재시도 적용]: 1회 실패 후 3초 대기 -> 2회 시도 후 3초 대기 -> 3회 시도 후 최종 실패 에러 표출 규칙 및 기본 모델 gemini-3.8-flash 통일 적용
 * -----------------------------------------------------------------------
 */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Plus, Trash2, Check, Upload, Download, Sparkles, BookOpen, 
  Copy, FileText, CheckCircle2, ChevronRight, Sliders, Table,
  Layers, ArrowUpRight, Search, FileCode2, AlertCircle, RefreshCw, Cpu
} from 'lucide-react';
import { CssProfile } from '@/types/cssProfile';
import { isSystemProfileId, DEFAULT_PROFILE, sanitizeAndParseCssProfileJson, normalizeCssProfile } from '@/constants/cssProfile';
import { CSS_PROFILE_GUIDE_MD } from '@/constants/cssProfileGuide';
import ConfirmModal from './ConfirmModal';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  ensureDecryptedApiKey, 
  normalizeAIModelName, 
  formatUserFriendlyAIError, 
  FormattedAIError, 
  DEFAULT_AI_MODEL, 
  ONRIVI_AI_MODELS 
} from '@/lib/gemini';

interface StyleManagerModalProps {
  profiles: CssProfile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onUpdateProfile: (profile: CssProfile) => void;
  onAddProfile?: () => void;
  onDeleteProfile?: (id: string) => void;
  onImportProfile?: (profile: CssProfile) => void;
  onClose: () => void;
  isDarkMode?: boolean;
  geminiApiKey?: string;
  aiModelName?: string;
}

export default function StyleManagerModal({
  profiles,
  activeProfileId,
  onSelectProfile,
  onUpdateProfile,
  onAddProfile,
  onDeleteProfile,
  onImportProfile,
  onClose,
  isDarkMode,
  geminiApiKey,
  aiModelName,
}: StyleManagerModalProps) {
  const [selectedId, setSelectedId] = useState(activeProfileId);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'system' | 'custom'>('all');
  const [toast, setToast] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  
  // 가져오기 탭 / 텍스트
  const [importJsonText, setImportJsonText] = useState('');
  const [importTab, setImportTab] = useState<'file' | 'text'>('file');

  // AI 프롬프트 생성기
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return normalizeAIModelName(
      aiModelName || 
      (typeof window !== 'undefined' ? (localStorage.getItem('onrivi_ai_model_name') || localStorage.getItem('aiModelName') || '') : '') || 
      DEFAULT_AI_MODEL
    );
  });
  const [aiError, setAiError] = useState<FormattedAIError | null>(null);

  useEffect(() => {
    if (aiModelName) {
      setSelectedModel(normalizeAIModelName(aiModelName));
    }
  }, [aiModelName]);

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean; title: string; message: string; isDanger?: boolean; onConfirm: () => void;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // 로컬스토리지 API 키 자동 감지 및 복호화 보장
  const rawKey = geminiApiKey || (typeof window !== 'undefined' ? (localStorage.getItem('onrivi_gemini_api_key') || localStorage.getItem('geminiApiKey') || '') : '');
  const effectiveApiKey = ensureDecryptedApiKey(rawKey);
  const hasApiKey = !!effectiveApiKey;

  const selectedProfile = profiles.find(p => p.id === selectedId) || profiles[0];
  const isSystem = isSystemProfileId(selectedProfile?.id || '');

  useEffect(() => {
    setSelectedId(activeProfileId);
  }, [activeProfileId]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  const dk = isDarkMode;

  /* ─── 이름 변경 ─── */
  const handleRenameStart = () => {
    if (isSystem) return;
    setTempName(selectedProfile.name);
    setIsEditingName(true);
    setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
        nameInputRef.current.select();
      }
    }, 60);
  };

  const handleRenameSave = () => {
    if (!tempName.trim()) return;
    onUpdateProfile({ ...selectedProfile, name: tempName.trim() });
    setIsEditingName(false);
    showToast(`서식 이름이 '${tempName.trim()}'(으)로 변경되었습니다.`);
  };

  /* ─── 기본 서식 기반 새 서식 자동 생성 ─── */
  const handleAddNewProfile = () => {
    setAiPromptInput('');
    setImportJsonText('');
    setSearchTerm('');

    const newId = 'profile-' + Date.now();
    const count = profiles.filter(p => !isSystemProfileId(p.id)).length + 1;
    const initialName = `새 서식 ${count}`;

    // 💡 DEFAULT_PROFILE(Onrivi 기본서식)을 100% 완전 복제(Deep Clone)하여 생성
    const newProfile: CssProfile = normalizeCssProfile({
      ...DEFAULT_PROFILE,
      id: newId,
      name: initialName,
      description: 'Onrivi 기본서식을 기반으로 생성된 사용자 정의 서식입니다.',
    }, profiles);

    if (onImportProfile) {
      onImportProfile(newProfile);
    } else if (onAddProfile) {
      onAddProfile();
    }
    setSelectedId(newId);
    onSelectProfile(newId);

    setTempName(initialName);
    setIsEditingName(true);

    setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
        nameInputRef.current.select();
      }
    }, 80);

    showToast(`기본 서식을 바탕으로 '${initialName}'이(가) 자동 생성되었습니다.`);
  };

  /* ─── 서식 삭제 ─── */
  const handleDeleteClick = () => {
    if (isSystem || !onDeleteProfile) return;
    setConfirmConfig({
      isOpen: true,
      title: '서식 삭제',
      message: `서식 "${selectedProfile.name}"을(를) 정말로 삭제하시겠습니까?`,
      isDanger: true,
      onConfirm: () => {
        onDeleteProfile(selectedProfile.id);
        const remaining = profiles.filter(p => p.id !== selectedProfile.id);
        if (remaining.length > 0) {
          setSelectedId(remaining[0].id);
          onSelectProfile(remaining[0].id);
        }
        setConfirmConfig(null);
        showToast('서식이 안전하게 삭제되었습니다.');
      },
    });
  };

  /* ─── 내보내기 (JSON 파일 다운로드) ─── */
  const handleExport = () => {
    // 💡 최신 Onrivi 서식 기준(7대 쇼케이스 태그, tableStructure, hrStructure 등)으로 정규화하여 내보내기
    const exportData = normalizeCssProfile(selectedProfile, profiles);
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = (exportData.name || 'onrivi_theme').trim().replace(/[/\\?%*:|"<>]/g, '_');
    a.download = `${safeName}_theme.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`서식 파일('${exportData.name}')이 다운로드되었습니다.`);
  };

  /* ─── 클립보드로 JSON 복사 ─── */
  const handleCopyJson = async () => {
    try {
      const exportData = normalizeCssProfile(selectedProfile, profiles);
      const json = JSON.stringify(exportData, null, 2);
      await navigator.clipboard.writeText(json);
      showToast(`'${selectedProfile.name}' 서식 JSON이 클립보드에 복사되었습니다.`);
    } catch {
      showToast('클립보드 복사에 실패했습니다.');
    }
  };

  /* ─── 가져오기 (파일 올리기) ─── */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const parsed = sanitizeAndParseCssProfileJson(text);
        if (!parsed || !parsed.name || !parsed.pageStyle || !parsed.rules) {
          showToast('올바른 Onrivi 서식 양식이 아닙니다. name, pageStyle, rules 속성이 필수입니다.');
          return;
        }
        // 💡 불러온 서식을 최신 Onrivi 규격(tableStructure 등)으로 자동 정규화
        const normalized = normalizeCssProfile(parsed, profiles);
        if (onImportProfile) {
          onImportProfile(normalized);
          setSelectedId(normalized.id);
          onSelectProfile(normalized.id);
          showToast(`서식 '${normalized.name}'을(를) 성공적으로 가져왔습니다.`);
        }
      } catch {
        showToast('JSON 문법 오류! 파일을 확인해 주세요.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  /* ─── 가져오기 (JSON 텍스트 붙여넣기) ─── */
  const handleJsonImport = () => {
    if (!importJsonText.trim()) {
      showToast('가져올 JSON 텍스트를 먼저 입력창에 붙여넣어 주세요.');
      return;
    }
    try {
      const parsed = sanitizeAndParseCssProfileJson(importJsonText);
      if (!parsed || !parsed.name || !parsed.pageStyle || !parsed.rules) {
        showToast('올바른 Onrivi 서식 양식이 아닙니다. name, pageStyle, rules 속성이 필수입니다.');
        return;
      }
      // 💡 불러온 서식을 최신 Onrivi 규격(tableStructure 등)으로 자동 정규화
      const normalized = normalizeCssProfile(parsed, profiles);
      if (onImportProfile) {
        onImportProfile(normalized);
        setSelectedId(normalized.id);
        onSelectProfile(normalized.id);
        setImportJsonText('');
        showToast(`서식 '${normalized.name}'을(를) 성공적으로 적용했습니다.`);
      }
    } catch {
      showToast('JSON 문법 오류! 내용을 확인해 주세요.');
    }
  };

  /* ─── AI 서식 생성 (프롬프트로 만들기) ─── */
  const handleAiGenerate = async (overrideModel?: string) => {
    if (!aiPromptInput.trim()) {
      showToast('원하는 서식 스타일을 먼저 설명해 주세요.');
      return;
    }
    if (!hasApiKey) {
      showToast('⚠️ AI 연동을 위해 환경설정에서 Gemini API Key를 등록해 주세요.');
      return;
    }

    const targetModel = normalizeAIModelName(overrideModel || selectedModel || DEFAULT_AI_MODEL);
    if (overrideModel && overrideModel !== selectedModel) {
      setSelectedModel(targetModel);
    }

    setIsAiGenerating(true);
    setAiError(null);

    try {
      let guideContent = '';
      try {
        const res = await fetch('/CSS_PROFILE_GUIDE.md');
        if (res.ok) guideContent = await res.text();
      } catch {}

      const promptText = `당신은 최고급 출판/웹 조판 전문 CSS 디자이너입니다. 사용자가 요청한 스타일에 부합하는 완성도 높은 Onrivi Author 서식 프로필(JSON)을 설계해 주세요.

[사용자 요청 스타일]:
"${aiPromptInput}"

[필수 요구사항]:
1. 7대 서식 쇼케이스(본문, 제목 h1~h6, 목록 및 체크박스, 표, 인용구, 코드블록, 미디어/수식/각주)를 빠짐없이 조화롭게 구성하세요.
2. 용지 규격 및 표준 여백(pageStyle)을 반드시 A4 규격(세로)과 상하 22mm, 좌 19mm, 우 20mm로 지정하세요:
   "pageStyle": {
     "paperSize": "a4",
     "orientation": "portrait",
     "marginTop": "22mm",
     "marginBottom": "22mm",
     "marginLeft": "19mm",
     "marginRight": "20mm",
     "fontFamily": "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', 'Noto Sans', Arial, sans-serif",
     "fontSize": "16px",
     "lineHeight": "1.75",
     "letterSpacing": "-0.01em",
     "backgroundColor": "#ffffff",
     "headingSizeOffset": "0px",
     "tabSize": "2",
     "exportPageBreakLevel": "h1"
   }
3. 특히 표(tableStructure) 구조체를 반드시 포함하여 외곽 테두리 및 행/열 두께를 명확히 지정하세요:
   "tableStructure": {
     "outerBorderWidth": "1px",  // 표 외곽 테두리 두께 (예: "1px", "2px", "0px")
     "rowBorderWidth": "1px",    // 표 행(가로선) 구분선 두께 (예: "1px", "2px", "0px")
     "colBorderWidth": "1px"     // 표 열(세로선) 구분선 두께 (예: "1px", "0px" - 가로선 강조형은 "0px")
   }
4. 구분선(hrStructure - 28px/1px/solid/100%) 및 체크박스(checkboxStructure - boxSize: "16px", checkedEffect: "none", textGap: "9px", color: "#2f2f2f", 체크박스 및 체크리스트 글자색은 별도의 다른 색으로 하지 말고 본문 글자색과 동일한 #2f2f2f, 완료 효과 checkedEffect는 무조건 "none" 효과없음) 구조체도 완벽히 포함하세요.
5. 미디어 객체(rules.img, rules.video, rules.map)는 본문 폭에 맞춰 자연스럽게 전개되도록 너비를 100%("width": "100%")로 설정하고, video는 "height": "315px", map은 "height": "400px"으로 안정적인 16:9 와이드 가로형 비율을 유지하세요.
6. 설명이나 마크다운 코드블록(\`\`\`) 없이 오직 유효한 단일 JSON 객체({ ... })만 출력하세요.

--- 공식 가이드라인 참조 ---
${guideContent || CSS_PROFILE_GUIDE_MD}
---------------------------`;

      const cleanKey = ensureDecryptedApiKey(effectiveApiKey);
      const genAI = new GoogleGenerativeAI(cleanKey);
      let model = genAI.getGenerativeModel({
        model: targetModel,
        systemInstruction: '당신은 CSS 서식 JSON 생성 전문가입니다. 오직 순수한 JSON 객체만 출력하십시오.',
      });

      let attempts = 0;
      const maxAttempts = 3;
      let resultText = '';

      while (attempts < maxAttempts) {
        try {
          attempts++;
          const result = await model.generateContent(promptText);
          resultText = result.response.text().trim();
          break;
        } catch (callErr: any) {
          console.warn(`[StyleManagerModal] '${targetModel}' AI 서식 생성 ${attempts}회 실패:`, callErr);

          if (attempts < maxAttempts) {
            console.warn(`[StyleManagerModal] '${targetModel}' AI 서식 생성 3초 후 재시도합니다... (${attempts}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 3000));
            continue;
          }
          throw callErr;
        }
      }
      let cleanedText = resultText;

      const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
      const match = cleanedText.match(jsonBlockRegex);
      if (match && match[1]) cleanedText = match[1].trim();

      const startIdx = cleanedText.indexOf('{');
      if (startIdx !== -1) {
        let braceCount = 0, inString = false, escape = false;
        for (let i = startIdx; i < cleanedText.length; i++) {
          const char = cleanedText[i];
          if (escape) { escape = false; continue; }
          if (char === '\\') { escape = true; continue; }
          if (char === '"') { inString = !inString; continue; }
          if (!inString) {
            if (char === '{') braceCount++;
            else if (char === '}') {
              braceCount--;
              if (braceCount === 0) { cleanedText = cleanedText.substring(startIdx, i + 1); break; }
            }
          }
        }
      }

      const parsedData = JSON.parse(cleanedText);
      if (!parsedData.name) {
        parsedData.name = aiPromptInput.trim().slice(0, 16) || 'AI 맞춤 서식';
      }

      // 💡 AI가 생성한 서식도 normalizeCssProfile을 거쳐 tableStructure 등 누락 방지 보장
      const normalizedData = normalizeCssProfile(parsedData, profiles);

      if (onImportProfile) {
        onImportProfile(normalizedData);
      }
      setSelectedId(normalizedData.id);
      onSelectProfile(normalizedData.id);
      setAiPromptInput('');
      setIsEditingName(false);
      setAiError(null);
      showToast(`✨ '${normalizedData.name}' 서식이 AI(${targetModel})로 생성되어 즉시 반영되었습니다!`);
    } catch (err: any) {
      console.error('[StyleManagerModal] AI 서식 생성 최종 에러:', err);
      const friendly = formatUserFriendlyAIError(err, targetModel);
      setAiError(friendly);
      showToast(`⚠️ [${friendly.title}] ${friendly.solution || friendly.description}`);
    } finally {
      setIsAiGenerating(false);
    }
  };

  /* ─── CSS 가이드 다운로드 ─── */
  const handleDownloadGuide = () => {
    const blob = new Blob([CSS_PROFILE_GUIDE_MD], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Onrivi_CSS_Profile_명세서.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('서식 작성 가이드가 다운로드되었습니다.');
  };

  // Modern Technical Editorial 디자인 시스템 테마 토큰
  const surfaceBase = dk ? 'bg-[#090D16]' : 'bg-[#F8FAFC]';
  const hairline = dk ? 'border-slate-800' : 'border-slate-200/90';
  const cardSurface = dk ? 'bg-[#0F172A]/90 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs';
  const textTitle = dk ? 'text-zinc-100 font-bold' : 'text-slate-900 font-bold';
  const textBody = dk ? 'text-zinc-300' : 'text-slate-700';
  const textMuted = dk ? 'text-zinc-400' : 'text-slate-500';

  // 필터링된 프로필 목록
  const filteredProfiles = profiles
    .filter(p => {
      if (filterType === 'system') return isSystemProfileId(p.id);
      if (filterType === 'custom') return !isSystemProfileId(p.id);
      return true;
    })
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // 선택된 서식의 상세 정보 요약
  const currentTable = selectedProfile?.tableStructure || {
    outerBorderWidth: '1px', rowBorderWidth: '1px', colBorderWidth: '1px'
  };

  return (
    <div className={`fixed inset-0 z-[210] flex flex-col font-sans ${surfaceBase}`}>
      
      {/* 🌟 1. 상단 글로벌 헤더 바 (Modern Technical Editorial) */}
      <header className={`h-16 px-6 flex items-center justify-between border-b ${hairline} ${dk ? 'bg-[#090D16]/95 backdrop-blur-md' : 'bg-white/95 backdrop-blur-md'} shrink-0`}>
        <div className="flex items-center gap-3.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#1d4ed8]/10 dark:bg-[#1d4ed8]/20 text-[#1d4ed8] border border-[#1d4ed8]/20 shadow-xs">
            <BookOpen className="w-5 h-5 text-[#1d4ed8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                서식 관리 센터
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-bold tracking-wide bg-[#1d4ed8]/10 dark:bg-[#1d4ed8]/20 text-[#1d4ed8] border border-[#1d4ed8]/20">
                {profiles.length} Profiles
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              출판 서식 프로필 관리 · AI 서식 생성 · 가져오기 / 내보내기 허브
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* 기본 서식으로 새로 만들기 상단 퀵 버튼 */}
          <button
            onClick={handleAddNewProfile}
            className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-bold text-white bg-[#1d4ed8] hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
            title="온리비 표준 기본 서식을 복제하여 새 서식을 생성합니다"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>기본 서식으로 새로 만들기</span>
          </button>

          <button
            onClick={onClose}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-bold rounded-xl transition-colors border ${hairline} ${
              dk ? 'bg-slate-900 hover:bg-slate-800 text-zinc-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>서식 편집기로 돌아가기</span>
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 🌟 2. 본문 2단 분할 레이아웃 */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── 좌측 LNB 사이드바 (.bg-sidebar-luxury 표준 준수) ── */}
        <aside className={`w-[300px] shrink-0 border-r ${hairline} bg-sidebar-luxury flex flex-col overflow-hidden`}>
          
          {/* 사이드바 상단 헤더 & 새로만들기 버튼 */}
          <div className={`p-4 border-b ${hairline} space-y-3`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold tracking-wider uppercase text-slate-500 dark:text-zinc-400">
                등록된 서식 목록
              </span>
              <button
                onClick={handleAddNewProfile}
                className="text-[11px] font-bold text-[#1d4ed8] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>추가</span>
              </button>
            </div>

            {/* 실시간 검색창 */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                placeholder="서식 이름 검색..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`w-full pl-8 pr-3 py-2 text-[12px] rounded-lg border ${hairline} ${
                  dk ? 'bg-slate-900/80 text-zinc-100 placeholder-zinc-500' : 'bg-white text-slate-800 placeholder-slate-400'
                } focus:outline-none focus:ring-1 focus:ring-[#1d4ed8] font-medium`}
              />
            </div>

            {/* 필터 탭 (전체 / 시스템 / 사용자 정의) */}
            <div className="flex p-0.5 rounded-lg bg-slate-200/60 dark:bg-slate-900/60 text-[11px] font-bold">
              {[
                { key: 'all', label: '전체' },
                { key: 'custom', label: '내 서식' },
                { key: 'system', label: '시스템' },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilterType(f.key as any)}
                  className={`flex-1 py-1 rounded-md transition-all duration-150 ${
                    filterType === f.key
                      ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* 서식 목록 아이템 영역 (AGENTS.md Rule 6: 세로선 금지, 고대비 볼드 + 코발트 음영 라운드 박스) */}
          <div className="flex-1 overflow-y-auto px-2.5 py-2 space-y-1 custom-scrollbar">
            {filteredProfiles.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-zinc-500 text-[12px]">
                일치하는 서식이 없습니다.
              </div>
            ) : (
              filteredProfiles.map(p => {
                const isSys = isSystemProfileId(p.id);
                const isActive = p.id === selectedId;

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedId(p.id);
                      onSelectProfile(p.id);
                      setIsEditingName(false);
                    }}
                    className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                      isActive
                        ? 'bg-[#1d4ed8]/10 dark:bg-[#1d4ed8]/20 shadow-xs'
                        : 'hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-[14px] shrink-0">
                        {isSys ? '🏛️' : '🎨'}
                      </span>
                      <div className="min-w-0 text-left">
                        <p className={`text-[12.5px] truncate leading-tight ${
                          isActive
                            ? 'text-blue-700 dark:text-blue-400 font-extrabold'
                            : 'text-slate-700 dark:text-zinc-300 font-semibold group-hover:text-slate-900 dark:group-hover:text-zinc-100'
                        }`}>
                          {p.name}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">
                          {p.pageStyle?.fontSize || '15px'} · {p.pageStyle?.fontFamily?.split(',')[0].replace(/['"]/g, '') || '기본서체'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <span className={`text-[9.5px] px-1.5 py-0.5 rounded font-bold ${
                        isSys
                          ? 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-zinc-400'
                          : 'bg-blue-100/60 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      }`}>
                        {isSys ? '시스템' : '사용자'}
                      </span>

                      {!isSys && onDeleteProfile && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(p.id);
                            handleDeleteClick();
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all"
                          title="서식 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* ── 우측 메인 디테일 & 작업 허브 패널 ── */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-[780px] mx-auto space-y-7 pb-20">

            {/* 🌟 [A. 현재 선택된 서식 히어로 헤더 카드] */}
            <div className={`p-6 rounded-2xl border ${hairline} ${cardSurface} flex flex-col sm:flex-row sm:items-center justify-between gap-5`}>
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[10.5px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider ${
                    isSystem
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-slate-700'
                      : 'bg-blue-50 dark:bg-blue-950/50 text-[#1d4ed8] dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                  }`}>
                    {isSystem ? '🏛️ 시스템 기본 서식 (수정제한)' : '🎨 사용자 정의 서식'}
                  </span>
                </div>

                {isEditingName ? (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={tempName}
                      onChange={e => setTempName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleRenameSave();
                        if (e.key === 'Escape') setIsEditingName(false);
                      }}
                      className={`px-3 py-1.5 text-base font-bold rounded-lg border border-[#1d4ed8] ${
                        dk ? 'bg-slate-900 text-zinc-100' : 'bg-white text-slate-900'
                      } outline-none`}
                    />
                    <button onClick={handleRenameSave} className="px-3 py-1.5 text-[12px] font-bold text-white bg-[#1d4ed8] rounded-lg">
                      저장
                    </button>
                    <button onClick={() => setIsEditingName(false)} className="px-3 py-1.5 text-[12px] font-bold rounded-lg border border-slate-300 dark:border-slate-700">
                      취소
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-zinc-100 truncate">
                      {selectedProfile?.name}
                    </h1>
                    {!isSystem && (
                      <button
                        onClick={handleRenameStart}
                        className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors"
                        title="이름 변경"
                      >
                        <img src="/icons/icon-rename.png" width={14} height={14} alt="이름 변경" className="opacity-90" />
                      </button>
                    )}
                  </div>
                )}

                {/* 서식 사양 요약 뱃지 모음 (표 외곽/행/열 두께 및 문서 여백 포함) */}
                <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] font-medium text-slate-600 dark:text-zinc-400">
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    글꼴: <b className="text-slate-800 dark:text-zinc-200">{selectedProfile.pageStyle?.fontFamily?.split(',')[0].replace(/['"]/g, '') || 'GulimChe'}</b>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    글자크기: <b className="text-slate-800 dark:text-zinc-200">{selectedProfile.pageStyle?.fontSize || '14px'}</b>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    여백: 상하 <b className="text-slate-800 dark:text-zinc-200">{selectedProfile.pageStyle?.marginTop || '18mm'}</b> · 좌우 <b className="text-slate-800 dark:text-zinc-200">{selectedProfile.pageStyle?.marginLeft || '12mm'}</b>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900 text-blue-700 dark:text-blue-300">
                    표 테두리: 외곽 <b className="text-[#1d4ed8]">{currentTable.outerBorderWidth}</b> · 행 <b>{currentTable.rowBorderWidth}</b> · 열 <b>{currentTable.colBorderWidth}</b>
                  </span>
                </div>
              </div>

              {/* 반영 및 닫기 버튼 */}
              <button
                onClick={() => {
                  onSelectProfile(selectedProfile.id);
                  onClose();
                }}
                className="shrink-0 px-5 py-3 text-[13px] font-extrabold text-white bg-[#1d4ed8] hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-sm transition-all duration-150 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>이 서식 적용하기</span>
              </button>
            </div>


            {/* 🌟 [B. 프롬프트로 서식 만들기 (AI 서식 제너레이터)] */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#1d4ed8]" />
                  <h3 className={`text-[13.5px] font-extrabold tracking-tight ${textTitle}`}>
                    프롬프트로 서식 만들기 (AI 제너레이터)
                  </h3>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#1d4ed8]/10 text-[#1d4ed8]">
                  7대 쇼케이스 & 표준 여백(18/12mm) & 표 구조체 지원
                </span>
              </div>

              <div className={`p-6 rounded-2xl border ${hairline} ${cardSurface} relative overflow-hidden group space-y-4`}>
                {/* 배경 은은한 코발트 앰비언트 글로우 */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-[#1d4ed8]/10 to-transparent rounded-bl-full pointer-events-none" />

                <div className="relative z-10 space-y-3">
                  <p className="text-[12px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                    원하는 문서의 톤앤매너, 글꼴, 색상, <b>표준 여백(상하 18mm, 좌우 12mm)</b>, 그리고 <b>표 테두리(외곽 굵은선/가로선 강조/격자 등)</b>를 자연어로 서술하면 온리비 맞춤 서식을 즉시 생성합니다.
                  </p>

                  {/* 추천 스타일 프리셋 칩 */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { 
                        label: '🏛️ 공공기관 보고서', 
                        text: 'KoPubBatang 바탕체, 정갈한 화이트 배경(#FFFFFF), 줄간격 1.8, 네이비 헤딩(#1e3a8a), 표준 여백(상하 18mm/좌우 12mm), 논문형 표 스타일(외곽 2px 굵은선, 행 1px, 열 0px 세로선 없음), 왼쪽 띠형 인용구' 
                      },
                      { 
                        label: '💻 GitHub 기술 명세서', 
                        text: 'Pretendard 고딕체, 15px, 표준 여백(상하 18mm/좌우 12mm), 깔끔한 엑셀 격자형 표(외곽 1px, 행 1px, 열 1px), 다크 계열 코드블록, 텍스트 하단 옅은 밑줄 구분선' 
                      },
                      { 
                        label: '📖 감성 출판 에세이', 
                        text: 'Noto Serif KR 명조체, 따뜻한 아이보리 미색 배경(#FAF6ED), 넓은 줄간격 1.85, 표준 여백(상하 18mm/좌우 12mm), 미니멀 표 서식(외곽 0px, 행 1px, 열 0px), 감성적인 박스형 인용구' 
                      },
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => setAiPromptInput(chip.text)}
                        disabled={isAiGenerating || !hasApiKey}
                        className="px-3 py-1.5 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 text-slate-700 dark:text-zinc-300 hover:text-[#1d4ed8] transition-all disabled:opacity-50"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>

                  {/* AI 모델 선택 셀렉터 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 pb-0.5">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-[#1d4ed8]" />
                      <span className="text-[11.5px] font-bold text-slate-700 dark:text-zinc-300">
                        적용 AI 모델:
                      </span>
                      <select
                        value={selectedModel}
                        onChange={e => {
                          setSelectedModel(e.target.value);
                          setAiError(null);
                        }}
                        disabled={isAiGenerating}
                        className={`text-[11.5px] font-bold py-1 px-2.5 rounded-lg border ${hairline} ${
                          dk ? 'bg-slate-900 text-zinc-100' : 'bg-white text-slate-800'
                        } focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/30 cursor-pointer shadow-2xs`}
                      >
                        {ONRIVI_AI_MODELS.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <span className="text-[10.5px] text-slate-400 dark:text-zinc-500 font-medium">
                      원하는 모델을 직접 선택하여 서식을 생성할 수 있습니다.
                    </span>
                  </div>

                  {/* 프롬프트 텍스트 영역 */}
                  <textarea
                    placeholder={
                      !hasApiKey 
                        ? "AI 서식 생성을 위해 환경설정에서 Gemini API Key를 등록해 주세요." 
                        : "예: 글꼴은 Pretendard, 본문 15px, 제목은 짙은 네이비, 표준 여백(상하 18mm, 좌우 12mm), 표는 외곽선 2px에 가로선 1px, 세로선은 없는 논문형으로 만들어줘..."
                    }
                    value={aiPromptInput}
                    onChange={e => setAiPromptInput(e.target.value)}
                    disabled={isAiGenerating || !hasApiKey}
                    className={`w-full h-24 p-3.5 text-[12.5px] rounded-xl border ${hairline} ${
                      dk ? 'bg-slate-900/80 text-zinc-100 placeholder-zinc-500' : 'bg-slate-50 text-slate-900 placeholder-slate-400'
                    } focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/30 resize-none font-medium leading-relaxed`}
                  />

                  {/* 실행 바 */}
                  <div className="flex items-center justify-between pt-1">
                    {!hasApiKey ? (
                      <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                        ⚠️ 환경설정에서 Gemini API Key를 입력해야 활성화됩니다.
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                        선택된 모델: <b className="text-slate-800 dark:text-zinc-200">{ONRIVI_AI_MODELS.find(m => m.id === selectedModel)?.name || selectedModel}</b>
                      </span>
                    )}

                    <button
                      onClick={() => handleAiGenerate()}
                      disabled={isAiGenerating || !aiPromptInput.trim() || !hasApiKey}
                      className="px-5 py-2 text-[12px] font-bold text-white bg-[#1d4ed8] hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAiGenerating ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          <span>AI 서식 생성 중...</span>
                        </>
                      ) : (
                        <>
                          <span>마법 실행</span>
                          <Sparkles className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* 🚨 AI 오류 발생 시: 상세 진단 안내 및 대화형 모델 변경 재시도 카드 */}
                  {aiError && (
                    <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/30 space-y-3 mt-3 animate-in fade-in duration-200">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                          <div>
                            <h4 className="text-[13.5px] font-extrabold text-rose-700 dark:text-rose-300 leading-tight">
                              {aiError.title}
                            </h4>
                            <span className="text-[10.5px] font-mono font-bold text-rose-900 dark:text-rose-200 bg-rose-200/70 dark:bg-rose-900/50 px-2 py-0.5 rounded mt-0.5 inline-block">
                              발생 모델: {ONRIVI_AI_MODELS.find(m => m.id === selectedModel)?.name || selectedModel}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAiError(null)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 rounded-md transition cursor-pointer"
                          title="안내 닫기"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="bg-white/90 dark:bg-zinc-900/90 p-3 rounded-lg border border-rose-200/70 dark:border-rose-900/40 text-[12px] space-y-2">
                        <div>
                          <div className="text-[10.5px] font-bold text-rose-600 dark:text-rose-400 mb-0.5">발생 원인</div>
                          <div className="text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed">
                            {aiError.description}
                          </div>
                        </div>
                        {aiError.solution && (
                          <div className="pt-2 border-t border-rose-100 dark:border-zinc-800">
                            <div className="text-[10.5px] font-bold text-blue-600 dark:text-blue-400 mb-0.5">권장 조치 방법</div>
                            <div className="text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                              {aiError.solution}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 모델 빠른 변경 칩 및 재실행 버튼 */}
                      <div className="space-y-2 pt-1">
                        <div className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300">
                          원하시는 모델로 변경하거나 다시 실행할 수 있습니다:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {[
                            { id: 'gemini-3.8-flash', label: '👑 Gemini 3.8 Flash' },
                            { id: 'gemini-3.7-flash', label: '⚡ Gemini 3.7 Flash' },
                            { id: 'gemini-3.6-flash', label: '🛡️ Gemini 3.6 Flash' },
                          ].map(m => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                setSelectedModel(m.id);
                                showToast(`AI 모델이 ${m.label}(으)로 변경되었습니다. 이제 다시 실행하실 수 있습니다.`);
                              }}
                              className={`py-2 px-2.5 rounded-xl text-[11.5px] font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                                selectedModel === m.id
                                  ? 'bg-[#1d4ed8] text-white border-[#1d4ed8]'
                                  : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700'
                              }`}
                            >
                              <span>{m.label}로 변경</span>
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAiGenerate(selectedModel)}
                          disabled={isAiGenerating}
                          className="w-full py-2.5 px-4 rounded-xl text-[12.5px] font-bold text-white bg-[#1d4ed8] hover:bg-blue-700 active:bg-blue-800 shadow-xs transition flex items-center justify-center gap-2 cursor-pointer mt-1 disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isAiGenerating ? 'animate-spin' : ''}`} />
                          <span>선택된 모델({ONRIVI_AI_MODELS.find(m => m.id === selectedModel)?.name || selectedModel})로 다시 실행</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>


            {/* 🌟 [C. 서식 가져오기 & 붙여넣기 (Import Hub)] */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#1d4ed8]" />
                  <h3 className={`text-[13.5px] font-extrabold tracking-tight ${textTitle}`}>
                    서식 가져오기 (파일 불러오기 / JSON 붙여넣기)
                  </h3>
                </div>

                <div className="flex p-0.5 rounded-lg bg-slate-200/60 dark:bg-slate-800 text-[11px] font-bold">
                  <button
                    onClick={() => setImportTab('file')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      importTab === 'file'
                        ? 'bg-white dark:bg-slate-700 text-[#1d4ed8] shadow-xs'
                        : 'text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    파일 불러오기
                  </button>
                  <button
                    onClick={() => setImportTab('text')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      importTab === 'text'
                        ? 'bg-white dark:bg-slate-700 text-[#1d4ed8] shadow-xs'
                        : 'text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    JSON 직접 붙여넣기
                  </button>
                </div>
              </div>

              <div className={`p-6 rounded-2xl border ${hairline} ${cardSurface}`}>
                {importTab === 'file' ? (
                  /* 파일 업로드 모드 */
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed ${hairline} hover:border-[#1d4ed8] rounded-xl p-8 text-center cursor-pointer transition-all ${
                      dk ? 'bg-slate-900/40 hover:bg-slate-900/80' : 'bg-slate-50 hover:bg-blue-50/40'
                    } group`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="w-12 h-12 mx-auto rounded-full bg-blue-100/60 dark:bg-blue-950/60 flex items-center justify-center text-[#1d4ed8] group-hover:scale-110 transition-transform mb-3">
                      <Upload className="w-6 h-6 stroke-[2]" />
                    </div>
                    <p className={`text-[13px] font-bold ${textTitle}`}>
                      서식 파일(.json) 클릭하여 불러오기
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                      구버전 서식이더라도 최신 표준 여백(상하 18mm, 좌우 12mm) 및 표 구조체(tableStructure)로 100% 자동 복원 및 정규화됩니다.
                    </p>
                  </div>
                ) : (
                  /* JSON 붙여넣기 모드 */
                  <div className="space-y-3">
                    <p className="text-[12px] text-slate-600 dark:text-zinc-400">
                      외부에서 복사한 서식 JSON 문자열을 아래에 붙여넣고 [서식 등록하기]를 눌러주세요.
                    </p>
                    <textarea
                      value={importJsonText}
                      onChange={e => setImportJsonText(e.target.value)}
                      placeholder='{ "name": "가져올 서식", "pageStyle": {...}, "rules": {...}, "tableStructure": {...} }'
                      className={`w-full h-32 p-3 text-[11.5px] font-mono rounded-xl border ${hairline} ${
                        dk ? 'bg-slate-900 text-zinc-200' : 'bg-slate-50 text-slate-800'
                      } outline-none focus:ring-2 focus:ring-[#1d4ed8]/30 resize-none`}
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleJsonImport}
                        disabled={!importJsonText.trim()}
                        className="px-5 py-2 text-[12px] font-bold text-white bg-[#1d4ed8] hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-all disabled:opacity-50"
                      >
                        서식 등록하기
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>


            {/* 🌟 [D. 서식 내보내기 & 공유 (Export Hub)] */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-[#1d4ed8]" />
                <h3 className={`text-[13.5px] font-extrabold tracking-tight ${textTitle}`}>
                  서식 내보내기 & 공유
                </h3>
              </div>

              <div className={`p-6 rounded-2xl border ${hairline} ${cardSurface}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 1. JSON 파일 다운로드 */}
                  <div
                    onClick={handleExport}
                    className={`p-4 rounded-xl border ${hairline} ${
                      dk ? 'bg-slate-900/40 hover:bg-slate-900/80' : 'bg-slate-50 hover:bg-blue-50/40'
                    } cursor-pointer transition-all flex items-center gap-3.5 group`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-100/70 dark:bg-blue-950/60 flex items-center justify-center text-[#1d4ed8] shrink-0 group-hover:scale-105 transition-transform">
                      <Download className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className={`text-[13px] font-bold ${textTitle}`}>파일로 내보내기 (.json)</h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                        표준 여백 및 표 구조체 완전체 파일 저장
                      </p>
                    </div>
                  </div>

                  {/* 2. 클립보드 복사 */}
                  <div
                    onClick={handleCopyJson}
                    className={`p-4 rounded-xl border ${hairline} ${
                      dk ? 'bg-slate-900/40 hover:bg-slate-900/80' : 'bg-slate-50 hover:bg-blue-50/40'
                    } cursor-pointer transition-all flex items-center gap-3.5 group`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-100/70 dark:bg-blue-950/60 flex items-center justify-center text-[#1d4ed8] shrink-0 group-hover:scale-105 transition-transform">
                      <Copy className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className={`text-[13px] font-bold ${textTitle}`}>클립보드로 JSON 복사</h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                        메신저나 팀원에게 즉시 공유
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 🌟 [E. 하단 가이드 링크] */}
            <div className={`pt-4 border-t ${hairline} flex items-center justify-between`}>
              <button
                onClick={handleDownloadGuide}
                className="flex items-center gap-2 text-[12px] font-bold text-slate-500 dark:text-zinc-400 hover:text-[#1d4ed8] dark:hover:text-blue-400 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>Onrivi CSS 서식 프로필 공식 명세서 다운로드 (.md)</span>
              </button>
            </div>

          </div>
        </main>
      </div>

      {/* Toast 알림 */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[250] px-5 py-2.5 bg-slate-900/95 dark:bg-zinc-100 text-white dark:text-slate-900 text-[12.5px] font-bold rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmConfig && (
        <ConfirmModal
          isOpen={confirmConfig.isOpen}
          title={confirmConfig.title}
          message={confirmConfig.message}
          isDanger={confirmConfig.isDanger}
          onConfirm={confirmConfig.onConfirm}
          onCancel={() => setConfirmConfig(null)}
        />
      )}
    </div>
  );
}
