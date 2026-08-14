'use client';

/*
 * CssStyleForm.tsx — 사용자 친화적 서식 정의 제어판 (관보 서식 규격 지정)
 *
 * 좌측 영역을 차지하는 패널로, 사용자가 선택한 CssProfile의
 * 전역 타이포그래피와 각 HTML 태그별 CSS 룰셋(CssRuleSet)을 편집합니다.
 *
 * 편집 모드는 두 가지:
 *   1. 위젯 편집 모드 (기본) — 슬라이더와 컬러 피커를 통해 비개발자도 직관적으로 편집
 *   2. CSS 직접 편집 모드 — JSON textarea로 한꺼번에 편집
 *
 * 시스템 프로필(id='system-*') 선택 시 모든 입력이 비활성화(disabled)됩니다.
 *
 * 🚨 @PATCH
 *   2026-07-15 — AI 서식 생성 기능 추가: GoogleGenerativeAI 직접 호출로 processTextWithAI 대체
 *               (이전 방식의 사전 코드블록 제거가 JSON 파싱과 충돌하는 버그 수정)
 *             — 브레이스 밸런싱 JSON 파서 도입 (AI 응답 후미 설명글/괄호 오염 원천 차단)
 *             — 서식 삭제(🗑️)·이름변경(✏️) 버튼 항상 표시로 복구 (시스템 서식 선택 시 비활성화 처리)
 *             — window.confirm → ConfirmModal 공통 모달로 전환 (handleDeleteClick, resetToDefault)
 */

import React, { useState, useEffect, useRef } from 'react'; // useState : 상태 관리, useEffect : 컴포넌트 생명주기 관리, useRef : 참조 관리
import { CssProfile, CssRuleSet } from '@/types/cssProfile'; // CssProfile : 서식 프로필 타입, CssRuleSet : 서식 규칙 타입
import { DEFAULT_PROFILE, isSystemProfileId } from '@/constants/cssProfile'; // DEFAULT_PROFILE : 기본 프로필, isSystemProfileId : 시스템 프로필인지 확인
import { PAPER_SIZES } from '@/constants/paperSizes'; // PAPER_SIZES : 종이 크기
import { CSS_PROFILE_GUIDE_MD } from '@/constants/cssProfileGuide'; // CSS_PROFILE_GUIDE_MD : CSS 프로필 가이드
import FontSelectorModal from './FontSelectorModal'; // FontSelectorModal : 폰트 선택 모달
import ConfirmModal from './ConfirmModal'; // ConfirmModal : 확인 모달
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * 🎯 원클릭 서식 프리셋 템플릿 데이터 모델
 */


// ================================================================================
// CssStyleFormProps 인터페이스 정의서
//
// ================================================================================
interface CssStyleFormProps { // CssStyleForm 컴포넌트가 받을 속성(props)들의 타입 정의 
  profiles: CssProfile[]; // CssProfile[] : 서식 프로필 배열 
  activeProfileId: string; // activeProfileId : 활성화된 서식 프로필 ID 
  onSelectProfile: (id: string) => void; // onSelectProfile : 서식 프로필 선택 콜백 함수
  onUpdateProfile: (profile: CssProfile) => void; // onUpdateProfile : 서식 프로필 업데이트 콜백 함수
  onAddProfile?: () => void; // onAddProfile : 새 서식 프로필 추가 콜백 함수
  onDeleteProfile?: (id: string) => void; // onDeleteProfile : 서식 프로필 삭제 콜백 함수
  onImportProfile?: (profile: CssProfile) => void; // onImportProfile : 서식 프로필 불러오기 콜백 함수
  onClose: () => void; // onClose : 모달 닫기 콜백 함수
  isDarkMode?: boolean; // isDarkMode : 다크 모드 여부
  geminiApiKey?: string; // geminiApiKey : Google Gemini API 키
  aiModelName?: string; // aiModelName : AI 모델 이름
}

// ====================================================================
// [OMD-CORE-CssStyleForm-0001] CssStyleForm ➔ AccordionSection
// 1. 아코디언 섹션 래퍼 (글씨 크기를 시원하게 상향)
// ====================================================================
// AccordionSection 컴포넌트 정의
// ====================================================================
interface AccordionSectionProps { // AccordionSection 컴포넌트가 받을 속성(props)들의 타입 정의 
  id: string; // id : 아코디언 섹션 ID 
  title: string; // title : 아코디언 섹션 제목 
  isOpen: boolean; // isOpen : 아코디언 섹션 열림 여부 
  onToggle: () => void; // onToggle : 아코디언 섹션 토글 콜백 함수 
  children: React.ReactNode; // children : 아코디언 섹션 자식 컴포넌트
}

// ====================================================================
// AccordionSection 컴포넌트 구현
// ==================================================================== 
function AccordionSection({ title, isOpen, onToggle, children }: AccordionSectionProps) {
  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950 shadow-sm transition-all duration-200">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-left"
      >
        <span className="font-bold text-[16px] text-zinc-800 dark:text-zinc-200">{title}</span>
        <span className={`text-[13px] text-zinc-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="p-5 border-t border-zinc-100 dark:border-zinc-900 space-y-5">
          {children}
        </div>
      )}
    </div>
  );
}


// 0 또는 '0' 값(Falsy)을 누락시키지 않고 기본값을 안전하게 처리하는 헬퍼 함수
const getNumValue = (val: string | number | undefined | null, defaultVal: number): number => {
  if (val === undefined || val === null || val === '') return defaultVal;
  const parsed = typeof val === 'number' ? val : parseFloat(val);
  return isNaN(parsed) ? defaultVal : parsed;
};

// ====================================================================
// 📊 [OMD-CORE-CssStyleForm-0002] CssStyleForm ➔ SliderWidget
// 🎯 @KICK  : HTML5 range 슬라이더로 숫자 값 실시간 조정 위젯
// 🛡️ @GUARD : getNumValue로 falsy 값 안전 처리
// 🚨 @PATCH : 없음
// 🔗 @CALLS : getNumValue
// ====================================================================
// 2. HTML5 표준 슬라이더 위젯 (가독성 높은 폰트 크기 및 두툼한 슬라이더 적용)
interface SliderWidgetProps { // SliderWidget 컴포넌트가 받을 속성(props)들의 타입 정의 
  label: string; // label : 슬라이더 레이블 
  min: number; // min : 슬라이더 최소값 
  max: number; // max : 슬라이더 최대값 
  step?: number; // step : 슬라이더 스텝 
  value: number | string; // value : 슬라이더 값 
  unit: string; // unit : 슬라이더 단위 
  disabled: boolean; // disabled : 슬라이더 비활성화 여부 
  onChange: (val: string) => void; // onChange : 슬라이더 값 변경 콜백 함수 
}

// ====================================================================
// SliderWidget 컴포넌트 구현
// ==================================================================== 
function SliderWidget({ label, min, max, step = 1, value, unit, disabled, onChange }: SliderWidgetProps) {
  const numVal = getNumValue(value, min);
  return (
    <div className="space-y-2.5 bg-zinc-50 dark:bg-zinc-900/40 p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-800/60">
      <div className="flex items-center justify-between">
        <span className="text-zinc-700 dark:text-zinc-300 font-semibold text-[13.5px]">{label}</span>
        <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
          {numVal}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={numVal}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-650 disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
}

// ====================================================================
// 📊 [OMD-CORE-CssStyleForm-0003] CssStyleForm ➔ ColorPickerWidget
// 🎯 @KICK  : 브라우저 내장 컬러 피커와 텍스트 입력을 연동한 색상 선택 위젯
// 🛡️ @GUARD : value가 #으로 시작하지 않으면 #000000 기본값 사용
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
// 3. 브라우저 내장 컬러 피커 연동 위젯 
interface ColorPickerWidgetProps { // ColorPickerWidget 컴포넌트가 받을 속성(props)들의 타입 정의 
  label: string; // label : 컬러 피커 레이블 
  value: string; // value : 컬러 피커 값 
  disabled: boolean; // disabled : 컬러 피커 비활성화 여부 
  onChange: (val: string) => void; // onChange : 컬러 피커 값 변경 콜백 함수 
}

// ===================================================================
// ColorPickerWidget 컴포넌트 구현
// ===================================================================  
function ColorPickerWidget({ label, value, disabled, onChange }: ColorPickerWidgetProps) {
  const hexValue = value && value.startsWith('#') ? value : '#000000';
  return (
    <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40 p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-800/60">
      <span className="text-zinc-700 dark:text-zinc-300 font-semibold text-[13.5px]">{label}</span>
      <div className="flex items-center gap-2.5">
        <input
          type="text"
          value={value || ''}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder="inherit"
          className="w-28 p-2 text-center font-mono text-sm text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 rounded outline-none"
        />
        <div className="relative w-8 h-8 rounded-full border border-zinc-250 dark:border-zinc-700 overflow-hidden cursor-pointer shrink-0 shadow-sm">
          <input
            type="color"
            value={hexValue}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            style={{ transform: 'scale(2)' }}
          />
          <div
            className="w-full h-full rounded-full transition-transform hover:scale-105"
            style={{ backgroundColor: value || 'transparent' }}
          />
        </div>
      </div>
    </div>
  );
}

// ====================================================================
// 📊 [OMD-CORE-CssStyleForm-0004] CssStyleForm ➔ TagRuleEditor
// 🎯 @KICK  : 특정 HTML 태그의 CSS 룰셋을 키-값 쌍으로 편집하는 서브 에디터
// 🛡️ @GUARD : isSystemProfile true면 모든 입력 비활성화
// 🚨 @PATCH : 없음
// 🔗 @CALLS : onUpdateRule, onRemoveRule
// ====================================================================
// 4. 복합 태그용 간편 편집 에디터 
interface TagRuleEditorProps { // TagRuleEditor 컴포넌트가 받을 속성(props)들의 타입 정의 
  tag: string; // tag : HTML 태그 
  label: string; // label : 태그 레이블 
  rules: CssRuleSet; // rules : CSS 규칙 세트 
  isSystemProfile: boolean; // isSystemProfile : 시스템 프로파일 여부 
  onUpdateRule: (tag: string, property: string, value: string) => void; // onUpdateRule : CSS 속성 업데이트 콜백 함수 
  onRemoveRule: (tag: string, property: string) => void; // onRemoveRule : CSS 속성 제거 콜백 함수 
}

// ===================================================================
// TagRuleEditor 컴포넌트 구현
// ===================================================================  
function TagRuleEditor({ tag, label, rules, isSystemProfile, onUpdateRule, onRemoveRule }: TagRuleEditorProps) {
  const entries = Object.entries(rules).filter(([, v]) => v !== '');

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-3.5 bg-white dark:bg-zinc-950 shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-2 mb-2.5">
        <span className="font-bold text-zinc-700 dark:text-zinc-300 text-sm">{label}</span>
      </div>

      <div className="space-y-2">
        {entries.length === 0 && (
          <span className="text-xs text-zinc-450 italic block font-semibold">지정된 CSS 규칙 없음 (기본값 사용)</span>
        )}
        {entries.map(([prop, val]) => (
          <div key={prop} className="flex items-center gap-2">
            <span className="text-zinc-650 font-mono text-xs w-36 shrink-0">{prop}:</span>
            <input
              type="text"
              value={val}
              onChange={(e) => onUpdateRule(tag, prop, e.target.value)}
              className="flex-1 p-1.5 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-900 font-mono text-sm text-blue-600 dark:text-blue-400"
              disabled={isSystemProfile}
            />
            {!isSystemProfile && (
              <button
                onClick={() => onRemoveRule(tag, prop)}
                className="text-zinc-400 hover:text-red-400 text-sm px-1.5"
              >
                X
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   🏛️ [메인 CssStyleForm 컴포넌트]
   ──────────────────────────────────────────────────────── */

// [ONR-MD-003] 서식설정 CSS 실시간 컴파일 및 주입: 사용자가 좌측 서식 정의 에디터 폼 위젯의 폰트 크기, 마진 등을 변경할 때마다 requestAnimationFrame 프레임 가드를 거쳐 CSS Profile을 실시간 갱신하고 미리보기에 자동 렌더링을 지시합니다.
// ====================================================================
// 📊 [OMD-CORE-CssStyleForm-0005] CssStyleForm ➔ CssStyleForm
// 🎯 @KICK  : 좌측 서식 정의 에디터 폼 - CSS 프로필 전역 타이포그래피 및 태그별 룰셋 편집
// 🛡️ @GUARD : 시스템 프로필(isSystemProfileId) 선택 시 모든 입력 비활성화
// 🚨 @PATCH : RAF 기반 triggerUpdate로 고속 업데이트 병합 최적화
// 🔗 @CALLS : AccordionSection, SliderWidget, ColorPickerWidget, TagRuleEditor, FontSelectorModal
// ====================================================================
// CssStyleForm 컴포넌트가 받을 속성(props)들의 타입 정의 

// ===================================================================
// CssStyleForm 컴포넌트 구현 
// ===================================================================
export default function CssStyleForm({ // CssStyleForm 컴포넌트 구현 
  profiles, activeProfileId, onSelectProfile, onUpdateProfile, onAddProfile, onDeleteProfile, onImportProfile, onClose, isDarkMode, geminiApiKey, aiModelName
}: CssStyleFormProps) { // CssStyleForm 컴포넌트 속성(props) 해체 
  const currentProfile = profiles.find(p => p.id === activeProfileId) || DEFAULT_PROFILE; // 현재 프로파일 
  const isSystemProfile = isSystemProfileId(currentProfile.id);

  /* ─── 아코디언 상태 관리 ─── */
  const [openAccordion, setOpenAccordion] = useState<string | null>('typography');

  /* ─── 폰트 선택 및 위계 탭 관리 ─── */
  const [isFontModalOpen, setIsFontModalOpen] = useState(false); // 폰트 선택 모달 상태 
  const [activeHeadingTab, setActiveHeadingTab] = useState(2); // 활성 헤딩 탭 
  const [activeInlineTab, setActiveInlineTab] = useState<'strong' | 'em' | 'u' | 'del'>('strong'); // 활성 인라인 탭 
  const [showJson, setShowJson] = useState<string | null>(null); // JSON 보기 상태 

  /* ─── 가져오기/내보내기 상태 ─── */
  const [showImportModal, setShowImportModal] = useState(false); // 가져오기 모달 상태 
  const [importJsonText, setImportJsonText] = useState(''); // 가져오기 JSON 텍스트 
  const [toastMessage, setToastMessage] = useState<string | null>(null); // 토스트 메시지 

  /* ─── 인라인 이름 변경 상태 ─── */
  const [isEditingName, setIsEditingName] = useState(false); // 이름 편집 상태 
  const [tempName, setTempName] = useState(''); // 임시 이름 
  const [showAllProfiles, setShowAllProfiles] = useState(false); // 모든 프로파일 표시 여부 

  /* ─── AI 서식 테마 자동 생성 상태 및 함수 ─── */
  const [showAiGenerator, setShowAiGenerator] = useState(false); // AI 생성기 표시 여부 
  const [aiPromptInput, setAiPromptInput] = useState(''); // AI 생성기 입력값 
  const [isAiGenerating, setIsAiGenerating] = useState(false); // AI 생성기 상태 

  /* ─── 커스텀 컨펌 모달 상태 ─── */
  // [ONR-MD-006] 서식 설정 마법사 프롬프트 모달: 사용자가 AI 테마 생성 기능을 사용할 때, 입력값 검증 및 실행 전 확정을 위해 이 모달을 사용합니다. 
  // [ONR-MD-007] 서식 규칙 충돌 경고: 사용자가 이미 존재하는 다른 프로파일과 동일한 CSS 규칙(property=value)을 추가하려고 할 때 충돌을 감지하고 사용자에게 경고하는 기능입니다.    
  const [confirmConfig, setConfirmConfig] = useState<{ // 확인 모달 설정 
    isOpen: boolean; // 확인 모달 열림 상태 
    title: string; // 확인 모달 제목 
    message: string; // 확인 모달 메시지 
    onConfirm: () => void; // 확인 모달 확인 함수 
    isDanger?: boolean; // 확인 모달 위험 여부 
  } | null>(null); // 확인 모달 설정 

  /* ─── AI 서식 테마 자동 생성 함수 ─── */
  const handleGenerateAiProfile = async () => { // AI 서식 테마 자동 생성 함수 
    if (!aiPromptInput.trim() || !geminiApiKey) return; // AI 생성기 입력값 또는 API 키가 없으면 반환 

    setIsAiGenerating(true); // AI 생성기 상태를 true로 변경 
    try {
      // 최신 CSS 가이드 문서 불러오기
      let guideContent = '';
      try {
        const res = await fetch('/CSS_PROFILE_GUIDE.md');
        if (res.ok) {
          guideContent = await res.text();
        }
      } catch (e) {
        console.warn('CSS 가이드 문서를 불러오지 못했습니다.', e);
      }

      const promptText = `당신은 마크다운 조판 서식 디자이너입니다. 사용자가 입력한 설명에 부합하는 세련되고 아름다운 CSS 서식 테마(CssProfile) 데이터를 생성해 주세요.
사용자 요청: "${aiPromptInput}"

다음은 Onrivi Author의 공식 CSS 서식 프로필 가이드 문서입니다. 이를 바탕으로 JSON 객체 규격을 완벽하게 준수하여 생성하세요:
--- 가이드 시작 ---
${guideContent}
--- 가이드 끝 ---

반드시 위 가이드라인과 JSON 구조를 준수해야 하며, 다른 텍스트 설명이나 코드 블록 기호(\`\`\`) 없이 오직 순수한 JSON 문자열만 출력해 주세요.`;

      // GoogleGenerativeAI 직접 호출 — processTextWithAI의 사전 코드블록 제거가 JSON 파싱과 충돌하므로 raw 응답을 직접 수신
      const genAI = new GoogleGenerativeAI((geminiApiKey || '').trim());
      const model = genAI.getGenerativeModel({
        model: aiModelName || 'gemini-1.5-pro',
        systemInstruction: '당신은 CSS 서식 JSON 생성 전문가입니다. 오직 순수한 JSON 객체만 출력하십시오. 마크다운 코드 블록 기호, 설명 문구, 부연 텍스트는 절대 포함하지 마십시오. 가이드에 정의된 모든 태그와 CSS 속성을 단 하나도 빠짐없이 완벽하게 채워서 JSON 결과물로 출력해야 합니다.',
      });
      const result = await model.generateContent(promptText);
      const responseText = result.response.text();

      // JSON 문자열 정제 (코드 블록 및 사족 제거)
      let cleanedText = responseText.trim();
      const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
      const match = cleanedText.match(jsonBlockRegex);
      if (match && match[1]) {
        cleanedText = match[1].trim();
      }

      // [ONR-AI-JSON-GUARD] 코드 블록 여부와 무관하게 항상 첫 { 부터 매칭되는 닫는 } 까지 브레이스 밸런싱 방식으로 정확히 발라냄
      const startIdx = cleanedText.indexOf('{');
      if (startIdx !== -1) {
        let braceCount = 0;
        let inString = false;
        let escape = false;
        let foundEnd = false;

        for (let i = startIdx; i < cleanedText.length; i++) {
          const char = cleanedText[i];
          if (escape) {
            escape = false;
            continue;
          }
          if (char === '\\') {
            escape = true;
            continue;
          }
          if (char === '"') {
            inString = !inString;
            continue;
          }
          if (!inString) {
            if (char === '{') {
              braceCount++;
            } else if (char === '}') {
              braceCount--;
              if (braceCount === 0) {
                cleanedText = cleanedText.substring(startIdx, i + 1);
                foundEnd = true;
                break;
              }
            }
          }
        }

        if (!foundEnd) {
          const endIdx = cleanedText.lastIndexOf('}');
          if (endIdx > startIdx) {
            cleanedText = cleanedText.substring(startIdx, endIdx + 1).trim();
          }
        }
      }

      const parsedData = JSON.parse(cleanedText);

      if (onImportProfile) {
        onImportProfile(parsedData);
      }
      setAiPromptInput('');
      setShowAiGenerator(false);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'AI 서식 생성 실패. 형식에 맞지 않는 응답이거나 서버 오류입니다.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  /* ─── ⚡ [고속 업데이트 최적화 가드] ─── */
  const rafIdRef = useRef<number | null>(null);
  const pendingProfileRef = useRef<CssProfile | null>(null);

  // ====================================================================
  // 📊 [OMD-CORE-CssStyleForm-0006] CssStyleForm ➔ triggerUpdate
  // 🎯 @KICK  : requestAnimationFrame 기반 고속 업데이트 최적화 게이트 - 중복 호출 병합
  // 🛡️ @GUARD : pendingProfileRef 및 rafIdRef로 중복 RAF 실행 방어
  // 🚨 @PATCH : 없음
  // 🔗 @CALLS : onUpdateProfile
  // ====================================================================
  const triggerUpdate = (updated: CssProfile) => {
    pendingProfileRef.current = updated;
    if (!rafIdRef.current) {
      rafIdRef.current = requestAnimationFrame(() => {
        if (pendingProfileRef.current) {
          onUpdateProfile(pendingProfileRef.current);
        }
        rafIdRef.current = null;
      });
    }
  };

  /* ─── 📤 📥 가져오기/내보내기 비즈니스 로직 ─── */
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ====================================================================
  // 📊 [OMD-CORE-CssStyleForm-0007] CssStyleForm ➔ downloadGuideSpec
  // 🎯 @KICK  : CSS 프로필 명세서 가이드 마크다운 파일을 다운로드
  // 🛡️ @GUARD : try-catch로 다운로드 실패 시 토스트 메시지
  // 🚨 @PATCH : 없음
  // 🔗 @CALLS : showToast
  // ====================================================================
  const downloadGuideSpec = () => {
    try {
      const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(CSS_PROFILE_GUIDE_MD);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "Onrivi_CSS_Profile_명세서.md");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast("서식 작성 가이드가 다운로드되었습니다.");
    } catch (e) {
      showToast("가이드 다운로드 실패!");
    }
  };

  const exportCurrentProfile = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentProfile, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `${currentProfile.name || 'onrivi_style'}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast("서식 파일(.json)이 다운로드되었습니다.");
    } catch (e) {
      showToast("서식 내보내기 실패!");
    }
  };

  // ====================================================================
  // 📊 [OMD-CORE-CssStyleForm-0009] CssStyleForm ➔ copyProfileToClipboard
  // 🎯 @KICK  : 현재 서식 프로필을 JSON 문자열로 클립보드에 복사
  // 🛡️ @GUARD : clipboard.writeText 실패 시 catch로 안전 처리
  // 🚨 @PATCH : 없음
  // 🔗 @CALLS : showToast
  // ====================================================================
  const copyProfileToClipboard = () => {
    try {
      navigator.clipboard.writeText(JSON.stringify(currentProfile, null, 2));
      showToast("서식이 클립보드에 복사되었습니다.");
    } catch (e) {
      showToast("클립보드 복사 실패!");
    }
  };

  // ====================================================================
  // 📊 [OMD-CORE-CssStyleForm-0010] CssStyleForm ➔ importProfileString
  // 🎯 @KICK  : JSON 문자열을 파싱하여 유효성 검증 후 서식 프로필 가져오기
  // 🛡️ @GUARD : name/pageStyle/rules 필수 속성 검증, JSON 파싱 실패 시 alert
  // 🚨 @PATCH : 없음
  // 🔗 @CALLS : onImportProfile, showToast
  // ====================================================================
  const importProfileString = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.name || !parsed.pageStyle || !parsed.rules) {
        showToast("올바른 Onrivi 서식 양식이 아닙니다. name, pageStyle, rules 속성이 필수입니다.");
        return false;
      }
      if (onImportProfile) {
        onImportProfile(parsed);
        showToast("서식이 성공적으로 추가되었습니다.");
        setShowImportModal(false);
        setImportJsonText('');
        return true;
      }
    } catch (e) {
      showToast("JSON 문법 에러! 형식을 확인해 주세요.");
    }
    return false;
  };

  // ====================================================================
  // 📊 [OMD-CORE-CssStyleForm-0011] CssStyleForm ➔ handleFileUpload
  // 🎯 @KICK  : JSON 서식 파일을 FileReader로 읽어 importProfileString으로 가져오기
  // 🛡️ @GUARD : 파일 미선택 시 실행 차단
  // 🚨 @PATCH : 없음
  // 🔗 @CALLS : importProfileString
  // ====================================================================
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      importProfileString(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  /* ─── CssRuleSet 조작 헬퍼 ─── */
  const getTagRules = (tag: string): CssRuleSet => {
    const tagKey = tag as keyof CssProfile['rules'];
    const currentRules = currentProfile?.rules?.[tagKey] || {};
    const defaultRules = DEFAULT_PROFILE?.rules?.[tagKey] || {};
    return { ...defaultRules, ...currentRules };
  };

  const getMediaAlign = (tag: string): string => {
    const rules = getTagRules(tag);
    if (rules['margin-left'] === '0px' && rules['margin-right'] === 'auto') return 'left';
    if (rules['margin-left'] === 'auto' && rules['margin-right'] === '0px') return 'right';
    return 'center';
  };

  // ====================================================================
  // 📊 [OMD-CORE-CssStyleForm-0012] CssStyleForm ➔ updateMediaAlign
  // 🎯 @KICK  : 이미지/동영상/지도 미디어 객체의 정렬 방식(좌/중/우) 업데이트
  // 🛡️ @GUARD : isSystemProfile true면 실행 차단
  // 🚨 @PATCH : 없음
  // 🔗 @CALLS : triggerUpdate, getTagRules, getMediaAlign
  // ====================================================================
  const updateMediaAlign = (tag: string, align: string) => {
    if (isSystemProfile) return;
    const tagKey = tag as keyof CssProfile['rules'];
    const baseRule = currentProfile.rules[tagKey] || {};
    let newRules: CssRuleSet = { ...baseRule, 'display': 'block', 'float': 'none' };

    if (align === 'left') {
      newRules['margin-left'] = '0px';
      newRules['margin-right'] = 'auto';
    } else if (align === 'right') {
      newRules['margin-left'] = 'auto';
      newRules['margin-right'] = '0px';
    } else {
      // center
      newRules['margin-left'] = 'auto';
      newRules['margin-right'] = 'auto';
    }

    const updated = {
      ...currentProfile,
      rules: {
        ...currentProfile.rules,
        [tagKey]: newRules
      }
    };
    triggerUpdate(updated);
  };

  // ====================================================================
  // 📊 [OMD-CORE-CssStyleForm-0013] CssStyleForm ➔ updateCssRule
  // 🎯 @KICK  : 특정 HTML 태그의 단일 CSS 속성 값을 업데이트
  // 🛡️ @GUARD : isSystemProfile true면 실행 차단
  // 🚨 @PATCH : 없음
  // 🔗 @CALLS : triggerUpdate, getTagRules
  // ====================================================================
  const updateCssRule = (tag: string, property: string, value: string) => {
    if (isSystemProfile) return;
    const tagKey = tag as keyof CssProfile['rules'];
    const currentTagRules = currentProfile.rules[tagKey] || {};
    const updated = {
      ...currentProfile,
      rules: {
        ...currentProfile.rules,
        [tagKey]: { ...currentTagRules, [property]: value },
      },
    };
    triggerUpdate(updated);
  };

  // ====================================================================
  // 📊 [OMD-CORE-CssStyleForm-0014] CssStyleForm ➔ removeCssRule
  // 🎯 @KICK  : 특정 태그의 CSS 속성 하나를 제거
  // 🛡️ @GUARD : isSystemProfile true면 실행 차단
  // 🚨 @PATCH : 없음
  // 🔗 @CALLS : triggerUpdate, getTagRules
  // ====================================================================
  const removeCssRule = (tag: string, property: string) => {
    if (isSystemProfile) return;
    const tagKey = tag as keyof CssProfile['rules'];
    const currentTagRules = currentProfile.rules[tagKey] || {};
    const { [property]: _, ...rest } = currentTagRules as any;
    const updated = {
      ...currentProfile,
      rules: { ...currentProfile.rules, [tagKey]: rest },
    };
    triggerUpdate(updated);
  };

  /* ─── 표 테두리 묶음 업데이트 ─── */
  // ====================================================================
  // 📊 [OMD-CORE-CssStyleForm-0015] CssStyleForm ➔ updateTableBorder
  // 🎯 @KICK  : 표(table/th/td) 테두리 스타일/두께/색상을 일괄 업데이트
  // 🛡️ @GUARD : isSystemProfile true면 실행 차단
  // 🚨 @PATCH : 없음
  // 🔗 @CALLS : triggerUpdate, getTagRules
  // ====================================================================
  const updateTableBorder = (property: string, value: string) => {
    if (isSystemProfile) return;
    const tableRules = getTagRules('table');
    const thRules = getTagRules('th');
    const tdRules = getTagRules('td');
    const updated = {
      ...currentProfile,
      rules: {
        ...currentProfile.rules,
        table: { ...tableRules, [property]: value },
        th: { ...thRules, [property]: value },
        td: { ...tdRules, [property]: value },
      }
    };
    triggerUpdate(updated);
  };

  /* ─── 표 셀 여백 묶음 업데이트 ─── */
  // ====================================================================
  // 📊 [OMD-CORE-CssStyleForm-0016] CssStyleForm ➔ updateCellPadding
  // 🎯 @KICK  : 표 th/td 셀 내부 여백을 일괄 업데이트
  // 🛡️ @GUARD : isSystemProfile true면 실행 차단
  // 🚨 @PATCH : 없음
  // 🔗 @CALLS : triggerUpdate, getTagRules
  // ====================================================================
  const updateCellPadding = (value: string) => {
    if (isSystemProfile) return;
    const thRules = getTagRules('th');
    const tdRules = getTagRules('td');
    const updated = {
      ...currentProfile,
      rules: {
        ...currentProfile.rules,
        th: { ...thRules, 'padding': value },
        td: { ...tdRules, 'padding': value },
      }
    };
    triggerUpdate(updated);
  };

  /* ─── 표 글자 크기 묶음 업데이트 ─── */
  // ====================================================================
  // 📊 [OMD-CORE-CssStyleForm-0017] CssStyleForm ➔ updateTableFontSize
  // 🎯 @KICK  : 표(table/th/td) 글자 크기를 일괄 업데이트 또는 제거
  // 🛡️ @GUARD : isSystemProfile true면 실행 차단, value가 비면 font-size 속성 제거
  // 🚨 @PATCH : 없음
  // 🔗 @CALLS : triggerUpdate, getTagRules
  // ====================================================================
  const updateTableFontSize = (value: string) => {
    if (isSystemProfile) return;
    const tableRules = getTagRules('table');
    const thRules = getTagRules('th');
    const tdRules = getTagRules('td');
    const updatedRules = { ...currentProfile.rules };
    if (!value) {
      const { 'font-size': _, ...restTable } = tableRules;
      const { 'font-size': __, ...restTh } = thRules;
      const { 'font-size': ___, ...restTd } = tdRules;
      updatedRules.table = restTable;
      updatedRules.th = restTh;
      updatedRules.td = restTd;
    } else {
      updatedRules.table = { ...tableRules, 'font-size': value };
      updatedRules.th = { ...thRules, 'font-size': value };
      updatedRules.td = { ...tdRules, 'font-size': value };
    }
    const updated = {
      ...currentProfile,
      rules: updatedRules
    };
    triggerUpdate(updated);
  };

  // ====================================================================
  // 📊 [OMD-CORE-CssStyleForm-0018] CssStyleForm ➔ handlePageStyleChange
  // 🎯 @KICK  : 용지 레이아웃 속성(글꼴, 글자 크기, 줄 간격, 용지 크기, 여백 등) 업데이트
  // 🛡️ @GUARD : isSystemProfile true면 실행 차단
  // 🚨 @PATCH : paperSize(용지 크기) 선택 기능 추가
  // 🔗 @CALLS : triggerUpdate
  // ====================================================================
  const handlePageStyleChange = (key: keyof CssProfile['pageStyle'], value: string) => {
    if (isSystemProfile) return;
    const updated = {
      ...currentProfile,
      pageStyle: { ...currentProfile.pageStyle, [key]: value },
    };
    triggerUpdate(updated);
  };

  const handleNameChange = (name: string) => {
    if (isSystemProfile) return;
    onUpdateProfile({ ...currentProfile, name });
  };

  const handleRenameClick = () => {
    if (isSystemProfile) return;
    setTempName(currentProfile.name);
    setIsEditingName(true);
  };

  const handleRenameSave = () => {
    if (isSystemProfile) return;
    const trimmed = tempName.trim();
    if (trimmed !== '') {
      handleNameChange(trimmed);
    }
    setIsEditingName(false);
  };

  // ====================================================================
  // 📊 [OMD-CORE-CssStyleForm-0019] CssStyleForm ➔ handleDeleteClick
  // 🎯 @KICK  : 현재 선택된 서식 프로필 삭제 처리
  // 🛡️ @GUARD : canDelete 및 onDeleteProfile 존재 여부 확인, confirm 창으로 재확인
  // 🚨 @PATCH : 없음
  // 🔗 @CALLS : onDeleteProfile
  // ====================================================================
  const handleDeleteClick = () => {
    if (!canDelete || !onDeleteProfile) return;
    setConfirmConfig({
      isOpen: true,
      title: "서식 삭제",
      message: `서식 "${currentProfile.name}"을(를) 정말로 삭제하시겠습니까?`,
      isDanger: true,
      onConfirm: () => {
        onDeleteProfile(currentProfile.id);
        setConfirmConfig(null);
      }
    });
  };


  /* ─── 구조제어 데이터 ─── */
  const hrStructure = currentProfile.hrStructure || {
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    marginTopBottom: '32px',
    lineWidth: '100%'
  };

  const checkboxStructure = {
    checkedEffect: currentProfile.checkboxStructure?.checkedEffect || DEFAULT_PROFILE.checkboxStructure?.checkedEffect || 'none',
    boxSize: currentProfile.checkboxStructure?.boxSize || DEFAULT_PROFILE.checkboxStructure?.boxSize || '16px',
    textGap: currentProfile.checkboxStructure?.textGap || DEFAULT_PROFILE.checkboxStructure?.textGap || '10px',
    color: currentProfile.checkboxStructure?.color || DEFAULT_PROFILE.checkboxStructure?.color || '#333333'
  };

  // ====================================================================
  // 📊 [OMD-CORE-CssStyleForm-0020] CssStyleForm ➔ updateHrStructure
  // 🎯 @KICK  : 수평 구분선(HR) 스타일(선 스타일, 두께, 여백, 너비) 업데이트
  // 🛡️ @GUARD : isSystemProfile true면 실행 차단
  // 🚨 @PATCH : 없음
  // 🔗 @CALLS : triggerUpdate
  // ====================================================================
  const updateHrStructure = (key: string, value: string) => {
    if (isSystemProfile) return;
    const updated = {
      ...currentProfile,
      hrStructure: { ...hrStructure, [key]: value }
    };
    triggerUpdate(updated);
  };

  // ====================================================================
  // 📊 [OMD-CORE-CssStyleForm-0021] CssStyleForm ➔ updateCheckboxStructure
  // 🎯 @KICK  : 체크박스 구조(완료 효과, 박스 크기, 텍스트 간격) 업데이트
  // 🛡️ @GUARD : isSystemProfile true면 실행 차단
  // 🚨 @PATCH : 없음
  // 🔗 @CALLS : triggerUpdate
  // ====================================================================
  const updateCheckboxStructure = (key: string, value: string) => {
    if (isSystemProfile) return;
    const updated = {
      ...currentProfile,
      checkboxStructure: { ...checkboxStructure, [key]: value }
    };
    triggerUpdate(updated);
  };

  /* ─── 공장 초기 설정 복구 ─── */
  // ====================================================================
  // 📊 [OMD-CORE-CssStyleForm-0022] CssStyleForm ➔ resetToDefault
  // 🎯 @KICK  : 시스템 기본 서식(DEFAULT_PROFILE)으로 즉시 전환
  // 🛡️ @GUARD : isSystemProfile true면 실행 차단, confirm 창으로 재확인
  // 🚨 @PATCH : 없음
  // 🔗 @CALLS : onSelectProfile
  // ====================================================================
  const resetToDefault = () => {
    if (isSystemProfile) return;
    setConfirmConfig({
      isOpen: true,
      title: "서식 초기화",
      message: "시스템 기본 서식으로 전환하시겠습니까?",
      isDanger: false,
      onConfirm: () => {
        onSelectProfile(DEFAULT_PROFILE.id); // DEFAULT_PROFILE = system-gov
        setConfirmConfig(null);
      }
    });
  };

  const nonDefaultProfiles = profiles.filter(p => !isSystemProfileId(p.id)).length;
  const canDelete = !isSystemProfile && nonDefaultProfiles > 0;

  const h1Rules = currentProfile.rules.h1 || {};
  const alignOptions = [
    { label: '왼쪽', value: 'left' },
    { label: '중앙', value: 'center' },
    { label: '오른쪽', value: 'right' },
    { label: '양끝', value: 'justify' },
  ] as const;

  const styleOptions = [
    { label: '굵게', property: 'font-weight', onVal: 'bold', offVal: 'normal' },
    { label: '기울임', property: 'font-style', onVal: 'italic', offVal: 'normal' },
    { label: '밑줄', property: 'text-decoration', onVal: 'underline', offVal: 'none' },
  ] as const;

  const borderOptions = [
    { label: '선 없음', value: '' },
    { label: '실선', value: '1px solid' },
    { label: '관보선', value: '3px double' },
  ] as const;

  const marginOptions = [
    { label: '여백 없음', value: '0px' },
    { label: '좁게', value: '12px' },
    { label: '기본', value: '24px' },
    { label: '넓게', value: '40px' },
  ] as const;

  // 팝오버 토글 상태: showAllProfiles를 팝오버 On/Off로 사용
  const isGalleryOpen = showAllProfiles;

  // 📥 JSON 파일 내보내기 핸들러
  const handleExportJson = () => {
    if (!currentProfile) return;
    const jsonString = JSON.stringify(currentProfile, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // 파일명: 테마이름_theme.json
    const safeName = currentProfile.name.replace(/[^a-z0-9가-힣]/gi, '_');
    link.download = `${safeName}_theme.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-[420px] shrink-0 h-full bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col select-none text-sm animate-fadeIn relative">

      {/* 1단계: 최상단 메가 메뉴 토글 타이틀 바 (항상 보임) */}
      <div className="px-4 py-3 bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-800 shrink-0 z-20 flex flex-col gap-2">

        <div className="flex items-center justify-between">
          <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            📌 현재 선택된 테마
          </div>

          {/* 이름 편집 / 삭제 / 추가 버튼 모음 */}
          <div className="flex items-center gap-1 shrink-0">
            {onAddProfile && (
              <button onClick={onAddProfile} className="p-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors" title="새 테마 추가">
                📖
              </button>
            )}
            {onImportProfile && (
              <button
                onClick={() => {
                  if (!geminiApiKey) {
                    showToast("AI 기능을 사용하려면 설정에서 Gemini API Key를 등록해 주세요.");
                    return;
                  }
                  setShowAiGenerator(!showAiGenerator);
                }}
                className={`p-1.5 rounded-md transition-colors ${showAiGenerator ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50'}`}
                title="AI 서식 테마 자동 생성"
              >
                ✨
              </button>
            )}
            <button onClick={() => setShowImportModal(true)} className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 transition-colors" title="외부 서식 테마 가져오기 (JSON)">
              📥
            </button>
            <button onClick={handleExportJson} className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 transition-colors" title="현재 테마 내보내기 (JSON)">
              📤
            </button>
            <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700 mx-1"></div>
            {!isEditingName && (
              <button
                onClick={() => {
                  if (isSystemProfile) {
                    showToast("시스템 기본 서식은 이름을 변경할 수 없습니다.");
                    return;
                  }
                  handleRenameClick();
                }}
                className={`p-1.5 rounded-md shadow-sm border border-zinc-200 dark:border-zinc-700 transition-colors ${isSystemProfile ? 'opacity-40 cursor-not-allowed text-zinc-400' : 'bg-white dark:bg-zinc-800 text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400'}`}
                title="이름 변경"
              >
                ✏️
              </button>
            )}
            {onDeleteProfile && !isEditingName && (
              <button
                onClick={() => {
                  if (isSystemProfile) {
                    showToast("시스템 기본 서식은 삭제할 수 없습니다.");
                    return;
                  }
                  handleDeleteClick();
                }}
                className={`p-1.5 rounded-md shadow-sm border border-zinc-200 dark:border-zinc-700 transition-colors ${isSystemProfile ? 'opacity-40 cursor-not-allowed text-zinc-400' : 'bg-white dark:bg-zinc-800 text-zinc-500 hover:text-red-500'}`}
                title="서식 삭제"
              >
                ❎
              </button>
            )}
          </div>
        </div>

        {/* AI 서식 생성기 패널 */}
        {showAiGenerator && (
          <div className="p-3 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/50 rounded-xl flex flex-col gap-2 animate-slideIn">
            <div className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1">
              <span>✨ AI 테마 스타일 생성기</span>
            </div>

            {/* AI 퀵 스타일 선택 칩 */}
            <div className="flex flex-wrap gap-1.5 mt-0.5 mb-0.5">
              {[
                { label: '#따뜻한 감성에세이', text: 'Noto Serif KR 명조체, 따뜻하고 은은한 아이보리 미색 배경(#FAF6ED), 넓고 부드러운 줄간격 1.8, 차분한 밤색 텍스트와 단정한 인용상자' },
                { label: '#현대적인 기술보고서', text: 'Noto Sans KR 고딕체, 맑고 깨끗한 화이트 배경(#FFFFFF), 신뢰감을 주는 네이비 블루 강조색상(#0058BC), 정돈된 표 서식과 구분선' },
                { label: '#영화 시나리오 대본', text: 'monospace 계열의 타자기 글꼴, 시선을 사로잡는 차분한 다크 슬레이트 배경(#1E1E24), 흑백 모노톤 강조색상, 단락 앞뒤 마진을 크게 주어 대본 느낌 극대화' },
                { label: '#빈티지 미색잡지', text: '부드러운 바탕체, 예스러운 빈티지 황토 베이지 배경(#F4EDE0), 세련된 올리브 그린 포인트 색상, 넓은 자간과 여유로운 패딩 규칙' }
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => setAiPromptInput(chip.text)}
                  disabled={isAiGenerating}
                  className="px-2 py-0.5 text-[9px] rounded-full border border-purple-200 dark:border-purple-800 bg-white/70 dark:bg-zinc-800/70 text-purple-600 dark:text-purple-300 hover:bg-purple-100 transition-colors"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <textarea
              placeholder="원하는 서식 스타일을 직접 적거나 위의 퀵 칩을 클릭해 보세요! (예: '나눔고딕 본문, 따뜻한 책 느낌, 줄간격 1.8, 주황색 강조색상')"
              value={aiPromptInput}
              onChange={(e) => setAiPromptInput(e.target.value)}
              disabled={isAiGenerating}
              className="w-full p-2 text-xs border border-purple-200 dark:border-purple-800 rounded-lg outline-none bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 h-16 resize-none focus:ring-1 focus:ring-purple-400"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowAiGenerator(false)}
                disabled={isAiGenerating}
                className="px-2.5 py-1 text-[11px] font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
              >
                닫기
              </button>
              <button
                onClick={handleGenerateAiProfile}
                disabled={isAiGenerating || !aiPromptInput.trim()}
                className="px-3 py-1 text-[11px] font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors flex items-center gap-1"
              >
                {isAiGenerating ? (
                  <>
                    <span className="animate-spin">⏳</span> 생성 중...
                  </>
                ) : (
                  <>
                    <span>🚀</span> 스타일 생성
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 메가 메뉴 토글 스위치 (이름 렌더링) */}
        {isEditingName && !isSystemProfile ? (
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={handleRenameSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameSave();
              if (e.key === 'Escape') setIsEditingName(false);
            }}
            autoFocus
            className="w-full p-2.5 border-2 border-blue-400 rounded-lg outline-none text-base font-extrabold bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
          />
        ) : (
          <button
            onClick={() => setShowAllProfiles(!isGalleryOpen)}
            className="flex items-center justify-between w-full p-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800/50 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{isSystemProfile ? '🏛️' : '🖌️'}</span>
              <span className="text-[17px] font-extrabold text-zinc-900 dark:text-zinc-100 truncate pr-2">
                {currentProfile.name}
              </span>
            </div>
            <span className={`text-zinc-400 group-hover:text-blue-500 transition-transform duration-200 ${isGalleryOpen ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
        )}
      </div>

      {/* 팝오버 메가 메뉴 갤러리 (z-index 40) */}
      {isGalleryOpen && (
        <div className="absolute top-[104px] left-0 right-0 max-h-[400px] overflow-y-auto z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-2xl p-4 custom-scrollbar animate-in slide-in-from-top-2">
          <div className="text-xs font-bold text-zinc-500 mb-3">테마 선택 ({profiles.length}개)</div>
          <div className="grid grid-cols-3 gap-2.5">
            {profiles.map(p => {
              const isActive = p.id === activeProfileId;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelectProfile(p.id);
                    setShowAllProfiles(false); // 선택 후 자동 닫힘
                  }}
                  className={`w-full h-[70px] rounded-xl border-2 flex flex-col items-center justify-center p-2 transition-all ${isActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm' : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 hover:border-blue-300 dark:hover:border-zinc-600'}`}
                >
                  <span className="text-[18px] mb-1">{isSystemProfileId(p.id) ? '🏛️' : '🖌️'}</span>
                  <span className={`text-[11px] font-bold truncate w-full text-center ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-zinc-600 dark:text-zinc-400'}`}>
                    {p.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2단계: 스크롤 가능한 본문 영역 (슬라이더 패널) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">

        {/* 2단계: 필수 스무스 슬라이더 컨트롤 패널 */}
        <div className="space-y-4.5 bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-bold text-zinc-700 dark:text-zinc-300">✍️ 기본 타이포그래피</span>
          </div>

          {/* 글꼴 선택 */}
          <div className="flex gap-2.5 items-end">
            <div className="flex-1">
              <span className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold block mb-1">문서 전체 글꼴</span>
              <input
                type="text"
                value={isFontModalOpen ? '선택 중...' : (currentProfile.pageStyle.fontFamily || '')}
                readOnly
                className="w-full p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900 font-mono text-sm text-zinc-800 dark:text-zinc-200 cursor-not-allowed"
              />
            </div>
            <button
              type="button"
              onClick={() => { if (!isSystemProfile) setIsFontModalOpen(true); }}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white text-sm font-bold rounded-lg transition-colors shrink-0 disabled:opacity-50"
              disabled={isSystemProfile}
            >
              변경
            </button>
          </div>

          {/* 스무스 슬라이더들 */}
          <SliderWidget
            label="기본 글자 크기"
            min={10}
            max={36}
            value={parseInt(currentProfile.pageStyle.fontSize) || 15}
            unit="px"
            disabled={isSystemProfile}
            onChange={(v) => handlePageStyleChange('fontSize', v + 'px')}
          />
          <SliderWidget
            label="기본 줄 간격"
            min={1.0}
            max={3.0}
            step={0.1}
            value={parseFloat(currentProfile.pageStyle.lineHeight) || 1.8}
            unit="배"
            disabled={isSystemProfile}
            onChange={(v) => handlePageStyleChange('lineHeight', v)}
          />
        </div>

        {/* 3단계: 고급 레이아웃 아코디언 설정들 */}
        <AccordionSection
          id="advanced"
          title="⚙️ 고급 레이아웃 및 본문 문단"
          isOpen={openAccordion === 'advanced'}
          onToggle={() => setOpenAccordion(openAccordion === 'advanced' ? null : 'advanced')}
        >
          <div className="space-y-4.5">

            {/* 자간 간격 슬라이더 */}
            <SliderWidget
              label="자간 간격 (Letter Spacing)"
              min={-0.05}
              max={0.05}
              step={0.01}
              value={parseFloat(currentProfile.pageStyle.letterSpacing) || 0}
              unit="em"
              disabled={isSystemProfile}
              onChange={(v) => handlePageStyleChange('letterSpacing', v + 'em')}
            />

            {/* 용지 크기 */}
            <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40 p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-800/60">
              <span className="text-zinc-650 dark:text-zinc-350 font-semibold text-sm">용지 크기</span>
              <select
                disabled={isSystemProfile}
                value={currentProfile.pageStyle.paperSize || 'a4'}
                onChange={(e) => handlePageStyleChange('paperSize', e.target.value)}
                className="px-3 py-2 rounded text-sm border bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 disabled:opacity-50"
              >
                {Object.entries(PAPER_SIZES).map(([key, spec]) => (
                  <option key={key} value={key}>
                    {spec.label} ({spec.width}×{spec.height}mm)
                  </option>
                ))}
              </select>
            </div>

            {/* 용지 방향 */}
            <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40 p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-800/60">
              <span className="text-zinc-650 dark:text-zinc-350 font-semibold text-sm">용지 방향</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isSystemProfile}
                  onClick={() => handlePageStyleChange('orientation', 'portrait')}
                  className={`px-4 py-2 rounded text-sm font-bold border transition-all ${currentProfile.pageStyle.orientation === 'portrait'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-500'
                    }`}
                >
                  세로
                </button>
                <button
                  type="button"
                  disabled={isSystemProfile}
                  onClick={() => handlePageStyleChange('orientation', 'landscape')}
                  className={`px-4 py-2 rounded text-sm font-bold border transition-all ${currentProfile.pageStyle.orientation === 'landscape'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-500'
                    }`}
                >
                  가로
                </button>
              </div>
            </div>

            {/* 내보내기 페이지 분할 기준 */}
            <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40 p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-800/60">
              <span className="text-zinc-650 dark:text-zinc-350 font-semibold text-sm">내보내기 페이지 나누기</span>
              <select
                disabled={isSystemProfile}
                value={currentProfile.pageStyle.exportPageBreakLevel || 'none'}
                onChange={(e) => handlePageStyleChange('exportPageBreakLevel', e.target.value)}
                className="px-3 py-2 rounded text-sm border bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 disabled:opacity-50"
              >
                <option value="none">사용 안함</option>
                <option value="h1">제목 1단계 기준</option>
                <option value="h2">제목 2단계 기준</option>
                <option value="h3">제목 3단계 기준</option>
                <option value="h4">제목 4단계 기준</option>
                <option value="h5">제목 5단계 기준</option>
                <option value="h6">제목 6단계 기준</option>
              </select>
            </div>

            {/* 페이지 배경색 */}
            <ColorPickerWidget
              label="페이지 배경색"
              value={currentProfile.pageStyle.backgroundColor || '#ffffff'}
              disabled={isSystemProfile}
              onChange={(v) => handlePageStyleChange('backgroundColor', v)}
            />
            {/* 용지 여백 설정 */}
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 space-y-2">
              <span className="text-zinc-650 dark:text-zinc-350 font-bold text-sm block">용지 마진 여백 (mm)</span>
              <div className="grid grid-cols-2 gap-2.5">
                <SliderWidget
                  label="위 여백"
                  min={5}
                  max={50}
                  value={parseInt(currentProfile.pageStyle.marginTop) || 10}
                  unit="mm"
                  disabled={isSystemProfile}
                  onChange={(v) => handlePageStyleChange('marginTop', v + 'mm')}
                />
                <SliderWidget
                  label="아래 여백"
                  min={5}
                  max={50}
                  value={parseInt(currentProfile.pageStyle.marginBottom) || 10}
                  unit="mm"
                  disabled={isSystemProfile}
                  onChange={(v) => handlePageStyleChange('marginBottom', v + 'mm')}
                />
                <SliderWidget
                  label="왼쪽 여백"
                  min={5}
                  max={50}
                  value={parseInt(currentProfile.pageStyle.marginLeft) || 10}
                  unit="mm"
                  disabled={isSystemProfile}
                  onChange={(v) => handlePageStyleChange('marginLeft', v + 'mm')}
                />
                <SliderWidget
                  label="오른쪽 여백"
                  min={5}
                  max={50}
                  value={parseInt(currentProfile.pageStyle.marginRight) || 10}
                  unit="mm"
                  disabled={isSystemProfile}
                  onChange={(v) => handlePageStyleChange('marginRight', v + 'mm')}
                />
              </div>
            </div>

            {/* 탭 간격(Tab Size) 슬라이더 */}
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
              <SliderWidget
                label="탭 간격 (Tab Size)"
                min={1}
                max={10}
                step={1}
                value={parseInt(currentProfile.pageStyle.tabSize) || 4}
                unit="칸"
                disabled={isSystemProfile}
                onChange={(v) => handlePageStyleChange('tabSize', String(v))}
              />
            </div>
          </div>

          {/* 本문 문단 (P) 설정 */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">기본 본문 문단 (P) 스타일</span>
              <button
                type="button"
                onClick={() => setShowJson(showJson === 'p' ? null : 'p')}
                className="text-xs text-blue-500 hover:text-blue-600 font-bold"
              >
                {showJson === 'p' ? '위젯 보기' : 'JSON 직접 편집'}
              </button>
            </div>

            {showJson === 'p' ? (
              <textarea
                value={JSON.stringify(currentProfile.rules.p || {}, null, 2)}
                disabled={isSystemProfile}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    onUpdateProfile({
                      ...currentProfile,
                      rules: { ...currentProfile.rules, p: parsed }
                    });
                  } catch { }
                }}
                className="w-full h-32 p-2 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-900 text-emerald-400 font-mono text-sm leading-relaxed"
              />
            ) : (
              <div className="space-y-3">
                {/* 1. 글자 정렬 */}
                <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40 p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-800/60">
                  <span className="text-zinc-650 dark:text-zinc-350 font-semibold text-sm">본문 글자 정렬</span>
                  <select
                    value={(currentProfile.rules.p || {})['text-align'] || 'left'}
                    disabled={isSystemProfile}
                    onChange={(e) => updateCssRule('p', 'text-align', e.target.value)}
                    className="bg-transparent border-none outline-none text-sm text-blue-600 dark:text-blue-400 font-bold cursor-pointer text-right"
                  >
                    <option value="left">왼쪽 정렬</option>
                    <option value="center">가운데 정렬</option>
                    <option value="right">오른쪽 정렬</option>
                    <option value="justify">양끝 정렬 (Justify)</option>
                  </select>
                </div>

                {/* 2. 위 여백 */}
                <SliderWidget
                  label="문단 위 여백"
                  min={0}
                  max={48}
                  value={parseInt((currentProfile.rules.p || {})['margin-top'] || '0') || 0}
                  unit="px"
                  disabled={isSystemProfile}
                  onChange={(v) => updateCssRule('p', 'margin-top', v + 'px')}
                />

                {/* 3. 하단 여백 */}
                <SliderWidget
                  label="문단 아래 여백"
                  min={0}
                  max={48}
                  value={parseInt((currentProfile.rules.p || {})['margin-bottom'] || '16') || 16}
                  unit="px"
                  disabled={isSystemProfile}
                  onChange={(v) => updateCssRule('p', 'margin-bottom', v + 'px')}
                />

                {/* 4. 들여쓰기 */}
                <SliderWidget
                  label="첫 줄 들여쓰기 (Text Indent)"
                  min={0}
                  max={48}
                  value={parseInt((currentProfile.rules.p || {})['text-indent'] || '0') || 0}
                  unit="px"
                  disabled={isSystemProfile}
                  onChange={(v) => updateCssRule('p', 'text-indent', v + 'px')}
                />

                {/* 5. 줄간격 */}
                <SliderWidget
                  label="문단 줄 간격 (Line Height)"
                  min={1.0}
                  max={3.0}
                  step={0.1}
                  value={parseFloat((currentProfile.rules.p || {})['line-height'] || '1.8') || 1.8}
                  unit="배"
                  disabled={isSystemProfile}
                  onChange={(v) => updateCssRule('p', 'line-height', v)}
                />

                {/* 6. 글자 색상 (컬러 피커 연동) */}
                <ColorPickerWidget
                  label="본문 글자 색상"
                  value={(currentProfile.rules.p || {})['color'] || ''}
                  disabled={isSystemProfile}
                  onChange={(v) => updateCssRule('p', 'color', v)}
                />
              </div>
            )}
          </div>
        </AccordionSection>

        {/* 🟢 아코디언 [2]: 제목 스타일 H1 ~ H6 */}
        <AccordionSection
          id="headings"
          title="👑 제목 위계 스타일 (H1 ~ H6)"
          isOpen={openAccordion === 'headings'}
          onToggle={() => setOpenAccordion(openAccordion === 'headings' ? null : 'headings')}
        >
          <div className="space-y-4">
            <div className="bg-zinc-100 dark:bg-zinc-800/40 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3.5">
              <div className="text-sm font-bold text-blue-600 dark:text-blue-400 border-b border-zinc-200 dark:border-zinc-700 pb-1.5">
                H1 마스터 설정
              </div>

              {/* H1 정렬 */}
              <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-lg shadow-sm space-y-1.5">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block">정렬</span>
                <div className="flex gap-1.5 flex-wrap">
                  {alignOptions.map(({ label, value }) => (
                    <button key={value} type="button" disabled={isSystemProfile}
                      onClick={() => updateCssRule('h1', 'text-align', value)}
                      className={'px-3 py-1.5 rounded text-sm font-semibold border transition-all ' + (h1Rules['text-align'] === value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-500')}
                    >{label}</button>
                  ))}
                </div>
              </div>

              {/* H1 크기 (슬라이더화) */}
              <SliderWidget
                label="H1 기준 글자 크기"
                min={16}
                max={48}
                value={parseInt(h1Rules['font-size']) || 28}
                unit="px"
                disabled={isSystemProfile}
                onChange={(v) => updateCssRule('h1', 'font-size', v + 'px')}
              />

              {/* H2~H6 크기 감소폭 (슬라이더화) */}
              <SliderWidget
                label="단계별 크기 감소폭"
                min={0}
                max={10}
                value={parseInt(currentProfile.pageStyle.headingSizeOffset) || 4}
                unit="px"
                disabled={isSystemProfile}
                onChange={(v) => handlePageStyleChange('headingSizeOffset', v)}
              />

              {/* 서식 */}
              <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-lg shadow-sm space-y-1.5">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block">기본 스타일 효과</span>
                <div className="flex gap-1.5 flex-wrap">
                  {styleOptions.map(({ label, property, onVal, offVal }) => {
                    const isActive = h1Rules[property] === onVal;
                    return (
                      <button key={property} type="button" disabled={isSystemProfile}
                        onClick={() => updateCssRule('h1', property, isActive ? offVal : onVal)}
                        className={'px-3 py-1.5 rounded text-sm font-semibold border transition-all ' + (isActive
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                          : 'border-zinc-200 dark:border-zinc-700 text-zinc-500')}
                      >{label}</button>
                    );
                  })}
                </div>
              </div>

              {/* H1 자간 (슬라이더화) */}
              <SliderWidget
                label="H1 자간 간격"
                min={-0.05}
                max={0.05}
                step={0.01}
                value={parseFloat(h1Rules['letter-spacing']) || 0}
                unit="em"
                disabled={isSystemProfile}
                onChange={(v) => updateCssRule('h1', 'letter-spacing', v + 'em')}
              />

              {/* 위 여백 */}
              <SliderWidget
                label="H1 위 여백"
                min={0}
                max={80}
                value={parseInt(h1Rules['margin-top']) || 24}
                unit="px"
                disabled={isSystemProfile}
                onChange={(v) => updateCssRule('h1', 'margin-top', v + 'px')}
              />

              {/* 아래 여백 */}
              <SliderWidget
                label="H1 아래 여백"
                min={0}
                max={80}
                value={parseInt(h1Rules['margin-bottom']) || 16}
                unit="px"
                disabled={isSystemProfile}
                onChange={(v) => updateCssRule('h1', 'margin-bottom', v + 'px')}
              />

              {/* H1 글자 색상 (컬러 피커 연동) */}
              <ColorPickerWidget
                label="H1 글자 색상"
                value={h1Rules['color'] || ''}
                disabled={isSystemProfile}
                onChange={(v) => updateCssRule('h1', 'color', v)}
              />

              {/* H1 하단 밑줄 테두리 */}
              <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-lg shadow-sm space-y-1.5">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block">하단 밑줄</span>
                <div className="flex gap-1.5 flex-wrap">
                  {borderOptions.map(({ label, value }) => (
                    <button key={label} type="button" disabled={isSystemProfile}
                      onClick={() => updateCssRule('h1', 'border-bottom', value)}
                      className={'px-3 py-1.5 rounded text-sm font-semibold border transition-all ' + (h1Rules['border-bottom'] === value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-500')}
                    >{label}</button>
                  ))}
                </div>
              </div>

              {/* H1 불필요한 장식 제거 */}
              {(h1Rules['border-left'] || h1Rules['background-color'] || h1Rules['border'] || h1Rules['border-right'] || h1Rules['border-top']) && (
                <div className="bg-red-50 dark:bg-red-900/20 p-2.5 rounded-lg shadow-sm border border-red-100 dark:border-red-900/30 flex flex-col sm:flex-row items-center justify-between gap-2 mt-2">
                  <span className="text-xs font-semibold text-red-600 dark:text-red-400 text-center sm:text-left">비표준 장식(배경/왼쪽 테두리 등)이 감지되었습니다.</span>
                  <button type="button" disabled={isSystemProfile}
                    onClick={() => {
                      const newRule = { ...(currentProfile.rules['h1'] || {}) };
                      delete newRule['border-left'];
                      delete newRule['border-right'];
                      delete newRule['border-top'];
                      delete newRule['border'];
                      delete newRule['background-color'];
                      delete newRule['padding'];
                      onUpdateProfile({ ...currentProfile, rules: { ...currentProfile.rules, h1: newRule }});
                    }}
                    className="px-3 py-1.5 rounded text-xs font-bold bg-white dark:bg-zinc-800 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors whitespace-nowrap"
                  >
                    장식 모두 제거
                  </button>
                </div>
              )}
            </div>

            {/* H2~H6 세부 설정 구역 */}
            <div className="space-y-3">
              {/* 위계 선택 탭 바 */}
              <div className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-800/40 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <span className="text-sm font-bold text-zinc-650 dark:text-zinc-400 pl-2">세부 H 위계</span>
                <div className="inline-flex bg-zinc-200/60 dark:bg-zinc-700/60 p-0.5 rounded-md text-sm font-semibold">
                  {[2, 3, 4, 5, 6].map((level) => (
                    <button key={level}
                      onClick={() => setActiveHeadingTab(level)}
                      className={'px-3 py-1.5 rounded transition-all ' + (activeHeadingTab === level ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 font-bold shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700')}
                    >H{level}</button>
                  ))}
                </div>
              </div>

              {/* 활성 H{n} 스타일 구성 */}
              {(() => {
                const tag = 'h' + activeHeadingTab;
                const tagRules = currentProfile.rules[tag as keyof typeof currentProfile.rules] || {};
                const offset = parseInt(currentProfile.pageStyle.headingSizeOffset) || 4;
                const h1Size = parseInt(h1Rules['font-size']) || 28;
                const calculatedSize = Math.max(10, h1Size - (activeHeadingTab - 1) * offset);
                return (
                  <div className="bg-zinc-100 dark:bg-zinc-800/40 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700 pb-2">
                      <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">H{activeHeadingTab} 설정</span>
                      <span className="font-mono text-sm text-blue-600 dark:text-blue-400 font-bold">
                        {calculatedSize}px
                      </span>
                    </div>

                    {/* 서식 선택 */}
                    <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-lg shadow-sm space-y-1.5">
                      <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block">효과</span>
                      <div className="flex gap-1.5 flex-wrap">
                        {styleOptions.map(({ label, property, onVal, offVal }) => {
                          const isActive = tagRules[property] === onVal;
                          return (
                            <button key={property} type="button" disabled={isSystemProfile}
                              onClick={() => updateCssRule(tag, property, isActive ? offVal : onVal)}
                              className={'px-3 py-1.5 rounded text-sm font-semibold border transition-all ' + (isActive
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                                : 'border-zinc-200 dark:border-zinc-700 text-zinc-500')}
                            >{label}</button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 하단 테두리 */}
                    <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-lg shadow-sm space-y-1.5">
                      <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block">하단 밑줄</span>
                      <div className="flex gap-1.5 flex-wrap">
                        {borderOptions.map(({ label, value }) => (
                          <button key={label} type="button" disabled={isSystemProfile}
                            onClick={() => updateCssRule(tag, 'border-bottom', value)}
                            className={'px-3 py-1.5 rounded text-sm font-semibold border transition-all ' + (tagRules['border-bottom'] === value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                              : 'border-zinc-200 dark:border-zinc-700 text-zinc-500')}
                          >{label}</button>
                        ))}
                      </div>
                    </div>

                    {/* 위 여백 */}
                    <SliderWidget
                      label="위 여백"
                      min={0}
                      max={80}
                      value={parseInt(tagRules['margin-top']) || 16}
                      unit="px"
                      disabled={isSystemProfile}
                      onChange={(v) => updateCssRule(tag, 'margin-top', v + 'px')}
                    />

                    {/* 아래 여백 */}
                    <SliderWidget
                      label="아래 여백"
                      min={0}
                      max={80}
                      value={parseInt(tagRules['margin-bottom']) || 8}
                      unit="px"
                      disabled={isSystemProfile}
                      onChange={(v) => updateCssRule(tag, 'margin-bottom', v + 'px')}
                    />

                    {/* 글자 색상 (컬러 피커 연동) */}
                    <ColorPickerWidget
                      label="글자 색상"
                      value={tagRules['color'] || ''}
                      disabled={isSystemProfile}
                      onChange={(v) => updateCssRule(tag, 'color', v)}
                    />

                    {/* Hn 불필요한 장식 제거 */}
                    {(tagRules['border-left'] || tagRules['background-color'] || tagRules['border'] || tagRules['border-right'] || tagRules['border-top']) && (
                      <div className="bg-red-50 dark:bg-red-900/20 p-2.5 rounded-lg shadow-sm border border-red-100 dark:border-red-900/30 flex flex-col sm:flex-row items-center justify-between gap-2 mt-2">
                        <span className="text-xs font-semibold text-red-600 dark:text-red-400 text-center sm:text-left">비표준 장식(배경/왼쪽 테두리 등)이 감지되었습니다.</span>
                        <button type="button" disabled={isSystemProfile}
                          onClick={() => {
                            const newRule = { ...(currentProfile.rules[tag as keyof typeof currentProfile.rules] || {}) };
                            delete newRule['border-left'];
                            delete newRule['border-right'];
                            delete newRule['border-top'];
                            delete newRule['border'];
                            delete newRule['background-color'];
                            delete newRule['padding'];
                            onUpdateProfile({ ...currentProfile, rules: { ...currentProfile.rules, [tag]: newRule }});
                          }}
                          className="px-3 py-1.5 rounded text-xs font-bold bg-white dark:bg-zinc-800 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors whitespace-nowrap"
                        >
                          장식 모두 제거
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* 인라인 서식 (Strong, Em, U, Del) 설정 */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 space-y-3.5">
            <div className="flex items-center justify-between animate-fadeIn">
              <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">본문 내 인라인 강조 요소</span>
              <div className="inline-flex bg-zinc-200/60 dark:bg-zinc-700/60 p-0.5 rounded-md text-sm font-semibold">
                {(['strong', 'em', 'u', 'del'] as const).map((tab) => (
                  <button key={tab} onClick={() => setActiveInlineTab(tab)}
                    className={'px-3.5 py-1.5 rounded transition-all ' + (activeInlineTab === tab ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 font-bold shadow-sm' : 'text-zinc-500 hover:text-zinc-700')}>
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900/40 p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-800/60 space-y-3.5">
              {(() => {
                const tag = activeInlineTab;
                const tagRules = currentProfile.rules[tag] || {};

                switch (tag) {
                  case 'strong':
                    return (
                      <>
                        <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-2.5 rounded-lg shadow-sm">
                          <span className="text-zinc-650 dark:text-zinc-350 font-semibold text-sm">굵기</span>
                          <select value={tagRules['font-weight'] || 'bold'} disabled={isSystemProfile}
                            onChange={(e) => updateCssRule('strong', 'font-weight', e.target.value)}
                            className="bg-transparent border-none outline-none text-sm text-blue-600 dark:text-blue-400 font-bold cursor-pointer text-right">
                            <option value="normal">일반 (normal)</option>
                            <option value="bold">굵게 (bold)</option>
                            <option value="900">최대 굵게 (900)</option>
                          </select>
                        </div>
                        <ColorPickerWidget label="강조 글자 색상" value={tagRules['color'] || ''} disabled={isSystemProfile} onChange={(v) => updateCssRule('strong', 'color', v)} />
                        <ColorPickerWidget label="강조 배경 색상" value={tagRules['background-color'] || ''} disabled={isSystemProfile} onChange={(v) => updateCssRule('strong', 'background-color', v)} />
                      </>
                    );
                  case 'em':
                    return (
                      <>
                        <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-2.5 rounded-lg shadow-sm">
                          <span className="text-zinc-650 dark:text-zinc-350 font-semibold text-sm">기울임 모양</span>
                          <select value={tagRules['font-style'] || 'italic'} disabled={isSystemProfile}
                            onChange={(e) => updateCssRule('em', 'font-style', e.target.value)}
                            className="bg-transparent border-none outline-none text-sm text-blue-600 dark:text-blue-400 font-bold cursor-pointer text-right">
                            <option value="normal">정체</option>
                            <option value="italic">이탤릭</option>
                            <option value="oblique">기울임</option>
                          </select>
                        </div>
                        <ColorPickerWidget label="기울임 글자 색상" value={tagRules['color'] || ''} disabled={isSystemProfile} onChange={(v) => updateCssRule('em', 'color', v)} />
                      </>
                    );
                  case 'u':
                    return (
                      <>
                        <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-2.5 rounded-lg shadow-sm">
                          <span className="text-zinc-650 dark:text-zinc-350 font-semibold text-sm">밑줄 모양</span>
                          <select value={tagRules['text-decoration-style'] || 'solid'} disabled={isSystemProfile}
                            onChange={(e) => updateCssRule('u', 'text-decoration-style', e.target.value)}
                            className="bg-transparent border-none outline-none text-sm text-blue-600 dark:text-blue-400 font-bold cursor-pointer text-right">
                            <option value="solid">실선</option>
                            <option value="dashed">대시선</option>
                            <option value="dotted">점선</option>
                            <option value="wavy">물결선</option>
                          </select>
                        </div>
                        <ColorPickerWidget label="밑줄 색상" value={tagRules['text-decoration-color'] || ''} disabled={isSystemProfile} onChange={(v) => updateCssRule('u', 'text-decoration-color', v)} />
                        <SliderWidget label="밑줄 간격" min={0} max={12} value={parseInt(tagRules['text-underline-offset']) || 2} unit="px" disabled={isSystemProfile} onChange={(v) => updateCssRule('u', 'text-underline-offset', v + 'px')} />
                      </>
                    );
                  case 'del':
                    return (
                      <>
                        <ColorPickerWidget label="취소선 색상" value={tagRules['text-decoration-color'] || ''} disabled={isSystemProfile} onChange={(v) => updateCssRule('del', 'text-decoration-color', v)} />
                        <SliderWidget label="취소선 굵기" min={1} max={8} value={parseInt(tagRules['text-decoration-thickness']) || 1} unit="px" disabled={isSystemProfile} onChange={(v) => updateCssRule('del', 'text-decoration-thickness', v + 'px')} />
                        <SliderWidget label="투명도" min={10} max={100} step={5} value={parseFloat(tagRules['opacity']) * 100 || 60} unit="%" disabled={isSystemProfile} onChange={(v) => updateCssRule('del', 'opacity', (parseFloat(v) / 100).toString())} />
                      </>
                    );
                  default:
                    return null;
                }
              })()}
            </div>
          </div>
        </AccordionSection>

        {/* 🟢 아코디언 [3]: 목록 및 체크박스 */}
        <AccordionSection
          id="lists"
          title="📋 목록 및 태스크 체크박스"
          isOpen={openAccordion === 'lists'}
          onToggle={() => setOpenAccordion(openAccordion === 'lists' ? null : 'lists')}
        >
          <div className="space-y-3.5">
            <div className="text-sm font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">글머리 & 숫자 목록 설정</div>

            {/* 글머리 마커 종류 */}
            <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40 p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-800/60">
              <span className="text-zinc-650 dark:text-zinc-350 font-semibold text-sm">글머리 마커</span>
              <select
                value={(currentProfile.rules.ul || {})['list-style-type'] || 'disc'}
                disabled={isSystemProfile}
                onChange={(e) => updateCssRule('ul', 'list-style-type', e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-blue-600 dark:text-blue-400 font-bold cursor-pointer text-right"
              >
                <option value="disc">채워진 원</option>
                <option value="circle">비어있는 원</option>
                <option value="square">정사각형</option>
                <option value="none">없음</option>
              </select>
            </div>

            {/* 글머리 마커 색상 */}
            <ColorPickerWidget
              label="글머리 마커 색상"
              value={(currentProfile.rules.ul || {})['color'] || ''}
              disabled={isSystemProfile}
              onChange={(v) => updateCssRule('ul', 'color', v)}
            />

            {/* 숫자 마커 종류 */}
            <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40 p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-800/60">
              <span className="text-zinc-650 dark:text-zinc-350 font-semibold text-sm">숫자 목록 마커</span>
              <select
                value={(currentProfile.rules.ol || {})['list-style-type'] || 'decimal'}
                disabled={isSystemProfile}
                onChange={(e) => updateCssRule('ol', 'list-style-type', e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-blue-600 dark:text-blue-400 font-bold cursor-pointer text-right"
              >
                <option value="decimal">1, 2, 3</option>
                <option value="decimal-leading-zero">01, 02, 03</option>
                <option value="lower-roman">i, ii, iii</option>
                <option value="upper-roman">I, II, III</option>
                <option value="none">없음</option>
              </select>
            </div>

            {/* 숫자 마커 색상 */}
            <ColorPickerWidget
              label="숫자 마커 색상"
              value={(currentProfile.rules.ol || {})['color'] || ''}
              disabled={isSystemProfile}
              onChange={(v) => updateCssRule('ol', 'color', v)}
            />

            {/* 목록 줄 간격 슬라이더 */}
            <SliderWidget
              label="목록 항목 간 줄 여백"
              min={0}
              max={32}
              value={getNumValue((currentProfile.rules.li || {})['margin-bottom'], 6)}
              unit="px"
              disabled={isSystemProfile}
              onChange={(v) => updateCssRule('li', 'margin-bottom', v + 'px')}
            />

            {/* 목록 전체 들여쓰기 슬라이더 */}
            <SliderWidget
              label="목록 기본 들여쓰기 너비"
              min={0}
              max={60}
              value={getNumValue((currentProfile.rules.ul || {})['padding-left'], 16)}
              unit="px"
              disabled={isSystemProfile}
              onChange={(v) => {
                const pxVal = v + 'px';
                onUpdateProfile({
                  ...currentProfile,
                  rules: {
                    ...currentProfile.rules,
                    ul: { ...(currentProfile.rules.ul || {}), 'padding-left': pxVal },
                    ol: { ...(currentProfile.rules.ol || {}), 'padding-left': pxVal },
                  }
                });
              }}
            />

            {/* 마커-글자 간격 슬라이더 */}
            <SliderWidget
              label="기호 마커와 글자 간격"
              min={0}
              max={32}
              value={getNumValue((currentProfile.rules.li || {})['padding-inline-start'], 8)}
              unit="px"
              disabled={isSystemProfile}
              onChange={(v) => updateCssRule('li', 'padding-inline-start', v + 'px')}
            />

            {/* 태스크 체크박스 규칙 */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3.5 space-y-3.5">
              <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider block">태스크 리스트 체크박스</span>

              {/* 완료 항목 효과 */}
              <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40 p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-800/60">
                <span className="text-zinc-650 dark:text-zinc-350 font-semibold text-sm">완료 항목 스타일</span>
                <select
                  value={checkboxStructure.checkedEffect}
                  disabled={isSystemProfile}
                  onChange={(e) => updateCheckboxStructure('checkedEffect', e.target.value)}
                  className="bg-transparent border-none outline-none text-sm text-blue-600 dark:text-blue-400 font-bold cursor-pointer text-right"
                >
                  <option value="line-through-and-dim">취소선 + 반투명</option>
                  <option value="dim-only">반투명 효과만</option>
                  <option value="none">효과 없음</option>
                </select>
              </div>

              {/* 체크박스 색상 */}
              <ColorPickerWidget
                label="체크박스 색상"
                value={checkboxStructure.color || ''}
                disabled={isSystemProfile}
                onChange={(v) => updateCheckboxStructure('color', v)}
              />

              {/* 박스 크기 슬라이더 */}
              <SliderWidget
                label="체크박스 물리 크기"
                min={8}
                max={32}
                value={getNumValue(checkboxStructure.boxSize, 16)}
                unit="px"
                disabled={isSystemProfile}
                onChange={(v) => updateCheckboxStructure('boxSize', v + 'px')}
              />

              {/* 체크박스-글자 간격 슬라이더 */}
              <SliderWidget
                label="체크박스와 텍스트 간격"
                min={0}
                max={32}
                value={getNumValue(checkboxStructure.textGap, 10)}
                unit="px"
                disabled={isSystemProfile}
                onChange={(v) => updateCheckboxStructure('textGap', v + 'px')}
              />
            </div>
          </div>
        </AccordionSection>

        {/* 🟢 아코디언 [4]: 구분선 규칙 (HR) */}
        <AccordionSection
          id="hr"
          title="➖ 수평 구분선 (HR) 규격"
          isOpen={openAccordion === 'hr'}
          onToggle={() => setOpenAccordion(openAccordion === 'hr' ? null : 'hr')}
        >
          <div className="space-y-3.5">
            {/* 선 모양 종류 */}
            <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40 p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-800/60">
              <span className="text-zinc-650 dark:text-zinc-350 font-semibold text-sm">선 스타일</span>
              <select
                value={hrStructure.borderTopStyle}
                disabled={isSystemProfile}
                onChange={(e) => updateHrStructure('borderTopStyle', e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-blue-600 dark:text-blue-400 font-bold cursor-pointer text-right"
              >
                <option value="solid">실선</option>
                <option value="dotted">점선</option>
                <option value="dashed">대시선</option>
                <option value="double">이중선</option>
              </select>
            </div>

            {/* 선 두께 슬라이더 */}
            <SliderWidget
              label="구분선 선 두께"
              min={1}
              max={10}
              value={parseInt(hrStructure.borderTopWidth) || 1}
              unit="px"
              disabled={isSystemProfile}
              onChange={(v) => updateHrStructure('borderTopWidth', v + 'px')}
            />

            {/* 위아래 여백 슬라이더 */}
            <SliderWidget
              label="구분선 상하 여백 너비"
              min={0}
              max={100}
              value={parseInt(hrStructure.marginTopBottom) || 32}
              unit="px"
              disabled={isSystemProfile}
              onChange={(v) => updateHrStructure('marginTopBottom', v + 'px')}
            />

            {/* 가로 길이 비율 */}
            <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40 p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-800/60">
              <span className="text-zinc-650 dark:text-zinc-350 font-semibold text-sm">구분선 너비</span>
              <select
                value={hrStructure.lineWidth}
                disabled={isSystemProfile}
                onChange={(e) => updateHrStructure('lineWidth', e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-blue-600 dark:text-blue-400 font-bold cursor-pointer text-right"
              >
                <option value="100%">100% (전체)</option>
                <option value="75%">75% (중앙)</option>
                <option value="50%">50% (중앙)</option>
                <option value="30%">30% (짧은 선)</option>
              </select>
            </div>

            {/* 선 색상 (컬러 피커 연동) */}
            <ColorPickerWidget
              label="구분선 색상"
              value={(currentProfile.rules.hr || {})['border-top-color'] || ''}
              disabled={isSystemProfile}
              onChange={(v) => updateCssRule('hr', 'border-top-color', v)}
            />
          </div>
        </AccordionSection>

        {/* 🟢 아코디언 [5]: 표, 하이퍼링크, 소스코드, 인용구 */}
        <AccordionSection
          id="others"
          title="🏺 표, 하이퍼링크, 소스코드, 인용구"
          isOpen={openAccordion === 'others'}
          onToggle={() => setOpenAccordion(openAccordion === 'others' ? null : 'others')}
        >
          {/* 인용구 (Blockquote) 설정 */}
          <div className="space-y-3.5">
            <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider block">💬 인용구 (Blockquote) 스타일</span>
            
            {/* 인용구 형태 프리셋 버튼 */}
            {(() => {
              // 버튼 활성화 상태(선택 표시)는 DEFAULT_PROFILE과 병합된 getTagRules 대신 
              // 현재 프로필에 실제로 저장된 raw 객체를 기준으로 판단해야 삭제된 속성이 되살아나지 않습니다.
              const rawBq = currentProfile.rules.blockquote || {};
              const hasBorderLeft = !!rawBq['border-left'] && rawBq['border-left'] !== 'none';
              const hasBorder = !!rawBq['border'] && rawBq['border'] !== 'none';
              const hasBoxShadow = !!rawBq['box-shadow'] && rawBq['box-shadow'] !== 'none';

              const isLeftLine = hasBorderLeft && !hasBorder && !hasBoxShadow;
              const isFullBox = hasBorder && !hasBorderLeft && !hasBoxShadow;
              const isShadowBox = hasBoxShadow && !hasBorder && !hasBorderLeft;
              
              const activeClass = 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300';
              const inactiveClass = 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300';

              return (
                <div className="flex gap-2 mb-4">
                  <button 
                    disabled={isSystemProfile}
                    onClick={() => {
                      const newBq = { ...(currentProfile.rules.blockquote || {}) };
                      newBq['border-left'] = (newBq['border-left'] && newBq['border-left'] !== 'none') ? newBq['border-left'] : '4px solid #2563eb';
                      delete newBq['border'];
                      delete newBq['border-width'];
                      delete newBq['border-color'];
                      newBq['box-shadow'] = 'none';
                      newBq['border-radius'] = '0 8px 8px 0';
                      newBq['padding'] = '14px 20px';
                      onUpdateProfile({ ...currentProfile, rules: { ...currentProfile.rules, blockquote: newBq }});
                    }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${isSystemProfile ? 'opacity-50 cursor-not-allowed border-zinc-200' : isLeftLine ? activeClass : inactiveClass}`}
                  >
                    왼쪽 띠형
                  </button>
                  <button 
                    disabled={isSystemProfile}
                    onClick={() => {
                      const newBq = { ...(currentProfile.rules.blockquote || {}) };
                      delete newBq['border-left'];
                      delete newBq['border-left-width'];
                      delete newBq['border-left-color'];
                      newBq['border'] = (newBq['border'] && newBq['border'] !== 'none') ? newBq['border'] : '1px solid #cbd5e1';
                      newBq['box-shadow'] = 'none';
                      newBq['border-radius'] = '8px';
                      newBq['padding'] = '16px';
                      onUpdateProfile({ ...currentProfile, rules: { ...currentProfile.rules, blockquote: newBq }});
                    }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${isSystemProfile ? 'opacity-50 cursor-not-allowed border-zinc-200' : isFullBox ? activeClass : inactiveClass}`}
                  >
                    전체 박스형
                  </button>
                  <button 
                    disabled={isSystemProfile}
                    onClick={() => {
                      const newBq = { ...(currentProfile.rules.blockquote || {}) };
                      delete newBq['border-left'];
                      delete newBq['border-left-width'];
                      delete newBq['border-left-color'];
                      delete newBq['border'];
                      delete newBq['border-width'];
                      delete newBq['border-color'];
                      // 그림자 효과 강화 (더 진하고 넓게)
                      newBq['box-shadow'] = '0 8px 24px rgba(0,0,0,0.15)';
                      newBq['border-radius'] = '8px';
                      newBq['padding'] = '16px';
                      onUpdateProfile({ ...currentProfile, rules: { ...currentProfile.rules, blockquote: newBq }});
                    }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${isSystemProfile ? 'opacity-50 cursor-not-allowed border-zinc-200' : isShadowBox ? activeClass : inactiveClass}`}
                  >
                    그림자 박스형
                  </button>
                </div>
              );
            })()}

            {/* 인용구 배경 색상 (컬러 피커 연동) */}
            <ColorPickerWidget
              label="인용구 채우기 배경색"
              value={(currentProfile.rules.blockquote || {})['background-color'] || ''}
              disabled={isSystemProfile}
              onChange={(v) => updateCssRule('blockquote', 'background-color', v)}
            />

            {/* 강조선 색상 (컬러 피커 연동) */}
            <ColorPickerWidget
              label="테두리/왼쪽 선 색상"
              value={(currentProfile.rules.blockquote || {})['border-left-color'] || (currentProfile.rules.blockquote || {})['border-color'] || ''}
              disabled={isSystemProfile}
              onChange={(v) => {
                const bq = currentProfile.rules.blockquote || {};
                if (bq['border'] && bq['border'] !== 'none') {
                  updateCssRule('blockquote', 'border-color', v);
                } else {
                  updateCssRule('blockquote', 'border-left-color', v);
                }
              }}
            />

            {/* 테두리 두께 슬라이더 */}
            <SliderWidget
              label="테두리/선 두께"
              min={0}
              max={20}
              value={getNumValue((currentProfile.rules.blockquote || {})['border-width'] || (currentProfile.rules.blockquote || {})['border-left-width'], 4)}
              unit="px"
              disabled={isSystemProfile}
              onChange={(v) => {
                const newBq = { ...(currentProfile.rules.blockquote || {}) };
                if (newBq['border'] && newBq['border'] !== 'none') {
                  newBq['border-width'] = v + 'px';
                  delete newBq['border-left-width'];
                } else {
                  newBq['border-left-width'] = v + 'px';
                  delete newBq['border-width'];
                }
                onUpdateProfile({ ...currentProfile, rules: { ...currentProfile.rules, blockquote: newBq }});
              }}
            />

            {/* 모서리 둥글기 슬라이더 */}
            <SliderWidget
              label="모서리 둥글기 (Border Radius)"
              min={0}
              max={40}
              value={getNumValue((currentProfile.rules.blockquote || {})['border-radius'], 8)}
              unit="px"
              disabled={isSystemProfile}
              onChange={(v) => updateCssRule('blockquote', 'border-radius', v + 'px')}
            />

            {/* 바깥 상하 여백 슬라이더 */}
            <SliderWidget
              label="인용 상하 바깥 여백"
              min={0}
              max={80}
              value={getNumValue((currentProfile.rules.blockquote || {})['margin-top'], 24)}
              unit="px"
              disabled={isSystemProfile}
              onChange={(v) => {
                const pxVal = v + 'px';
                onUpdateProfile({
                  ...currentProfile,
                  rules: {
                    ...currentProfile.rules,
                    blockquote: {
                      ...(currentProfile.rules.blockquote || {}),
                      'margin-top': pxVal,
                      'margin-bottom': pxVal
                    }
                  }
                });
              }}
            />

            {/* 내부 패딩 슬라이더 */}
            <SliderWidget
              label="인용 내부 패딩 여백"
              min={0}
              max={64}
              value={getNumValue((currentProfile.rules.blockquote || {})['padding'], 16)}
              unit="px"
              disabled={isSystemProfile}
              onChange={(v) => updateCssRule('blockquote', 'padding', v + 'px')}
            />

            {/* 인용구 글자 굵기 설정 */}
            <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40 p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-800/60">
              <span className="text-zinc-650 dark:text-zinc-350 font-semibold text-sm">인용 글자 굵기</span>
              <select
                value={getTagRules('blockquote')['font-weight'] || 'normal'}
                disabled={isSystemProfile}
                onChange={(e) => updateCssRule('blockquote', 'font-weight', e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-blue-600 dark:text-blue-400 font-bold cursor-pointer text-right"
              >
                <option value="normal">보통</option>
                <option value="bold">굵게</option>
              </select>
            </div>
          </div>

          {/* 표 (Table) 설정 */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 space-y-3.5">
            <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider block">📊 표 (Table) 스타일</span>

            {/* 표 형태 프리셋 버튼 */}
            {(() => {
              const t = currentProfile.rules.table || {};
              const th = currentProfile.rules.th || {};
              const isGrid = !!t['border'] && t['border'] !== 'none' && !t['border-top'];
              const isHorizontal = t['border-left'] === 'none' && !!t['border-top'];
              const isMinimal = t['border'] === 'none' && !t['border-top'];
              
              const activeClass = 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300';
              const inactiveClass = 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300';

              return (
                <div className="flex gap-2 mb-4">
                  <button 
                    disabled={isSystemProfile}
                    onClick={() => {
                      const newT = { ...(currentProfile.rules.table || {}) };
                      const newTh = { ...(currentProfile.rules.th || {}) };
                      const newTd = { ...(currentProfile.rules.td || {}) };
                      const color = newT['border-color'] || '#cbd5e1';
                      // 모든 테두리
                      newT['border'] = `1px solid ${color}`;
                      newTh['border'] = `1px solid ${color}`;
                      newTd['border'] = `1px solid ${color}`;
                      // 기존 가로선 설정 제거
                      delete newT['border-top']; delete newT['border-bottom']; delete newT['border-left']; delete newT['border-right'];
                      delete newTh['border-bottom']; delete newTh['border-top']; delete newTh['border-left']; delete newTh['border-right'];
                      delete newTd['border-bottom']; delete newTd['border-top']; delete newTd['border-left']; delete newTd['border-right'];
                      onUpdateProfile({ ...currentProfile, rules: { ...currentProfile.rules, table: newT, th: newTh, td: newTd }});
                    }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${isSystemProfile ? 'opacity-50 cursor-not-allowed border-zinc-200' : isGrid ? activeClass : inactiveClass}`}
                  >
                    모든 테두리 (Grid)
                  </button>
                  <button 
                    disabled={isSystemProfile}
                    onClick={() => {
                      const newT = { ...(currentProfile.rules.table || {}) };
                      const newTh = { ...(currentProfile.rules.th || {}) };
                      const newTd = { ...(currentProfile.rules.td || {}) };
                      const color = newT['border-color'] || '#cbd5e1';
                      // 가로선 강조
                      newT['border-top'] = `2px solid ${color}`;
                      newT['border-bottom'] = `2px solid ${color}`;
                      newT['border-left'] = 'none';
                      newT['border-right'] = 'none';
                      newTh['border-bottom'] = `1px solid ${color}`;
                      newTh['border-left'] = 'none';
                      newTh['border-right'] = 'none';
                      newTd['border-bottom'] = `1px solid ${color}`;
                      newTd['border-left'] = 'none';
                      newTd['border-right'] = 'none';
                      // 기존 전체 테두리 제거
                      delete newT['border']; delete newTh['border']; delete newTd['border'];
                      onUpdateProfile({ ...currentProfile, rules: { ...currentProfile.rules, table: newT, th: newTh, td: newTd }});
                    }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${isSystemProfile ? 'opacity-50 cursor-not-allowed border-zinc-200' : isHorizontal ? activeClass : inactiveClass}`}
                  >
                    가로선 강조
                  </button>
                  <button 
                    disabled={isSystemProfile}
                    onClick={() => {
                      const newT = { ...(currentProfile.rules.table || {}) };
                      const newTh = { ...(currentProfile.rules.th || {}) };
                      const newTd = { ...(currentProfile.rules.td || {}) };
                      // 미니멀 (테두리 없음)
                      newT['border'] = 'none';
                      newTh['border'] = 'none';
                      newTd['border'] = 'none';
                      newTh['background-color'] = '#f8fafc';
                      // 기존 테두리 설정 모두 제거
                      delete newT['border-top']; delete newT['border-bottom']; delete newT['border-left']; delete newT['border-right'];
                      delete newTh['border-bottom']; delete newTh['border-top']; delete newTh['border-left']; delete newTh['border-right'];
                      delete newTd['border-bottom']; delete newTd['border-top']; delete newTd['border-left']; delete newTd['border-right'];
                      onUpdateProfile({ ...currentProfile, rules: { ...currentProfile.rules, table: newT, th: newTh, td: newTd }});
                    }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${isSystemProfile ? 'opacity-50 cursor-not-allowed border-zinc-200' : isMinimal ? activeClass : inactiveClass}`}
                  >
                    미니멀
                  </button>
                </div>
              );
            })()}

            {/* 표 전체 너비 */}
            <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40 p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-800/60">
              <span className="text-zinc-650 dark:text-zinc-350 font-semibold text-sm">표 전체 너비</span>
              <select
                value={getTagRules('table')['width'] || '100%'}
                disabled={isSystemProfile}
                onChange={(e) => updateCssRule('table', 'width', e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-blue-600 dark:text-blue-400 font-bold cursor-pointer text-right"
              >
                <option value="100%">100% (최대)</option>
                <option value="auto">auto (콘텐츠 맞춤)</option>
                <option value="50%">50% (반 너비)</option>
              </select>
            </div>

            {/* 표 테두리 스타일 */}
            <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40 p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-800/60">
              <span className="text-zinc-650 dark:text-zinc-350 font-semibold text-sm">표 테두리 모양</span>
              <select
                value={getTagRules('table')['border-style'] || 'solid'}
                disabled={isSystemProfile}
                onChange={(e) => updateTableBorder('border-style', e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-blue-600 dark:text-blue-400 font-bold cursor-pointer text-right"
              >
                <option value="solid">실선</option>
                <option value="double">이중선</option>
                <option value="dotted">점선</option>
                <option value="dashed">대시선</option>
                <option value="none">없음</option>
              </select>
            </div>

            {/* 표 테두리 두께 */}
            <SliderWidget
              label="표 테두리 두께"
              min={0}
              max={8}
              value={parseInt(getTagRules('table')['border-width']) || 1}
              unit="px"
              disabled={isSystemProfile}
              onChange={(v) => updateTableBorder('border-width', v + 'px')}
            />

            {/* 표 테두리 색상 */}
            <ColorPickerWidget
              label="표 테두리 색상"
              value={getTagRules('table')['border-color'] || ''}
              disabled={isSystemProfile}
              onChange={(v) => updateTableBorder('border-color', v)}
            />

            {/* 헤더 배경색 */}
            <ColorPickerWidget
              label="표 헤더(TH) 배경색"
              value={getTagRules('th')['background-color'] || ''}
              disabled={isSystemProfile}
              onChange={(v) => updateCssRule('th', 'background-color', v)}
            />

            {/* 행 배경색 */}
            <ColorPickerWidget
              label="표 본문(TD) 배경색"
              value={getTagRules('td')['background-color'] || ''}
              disabled={isSystemProfile}
              onChange={(v) => updateCssRule('td', 'background-color', v)}
            />

            {/* 셀 패딩 (여백) */}
            <SliderWidget
              label="표 셀 내부 여백 (Padding)"
              min={0}
              max={24}
              value={parseInt(getTagRules('th')['padding']) || 8}
              unit="px"
              disabled={isSystemProfile}
              onChange={(v) => updateCellPadding(v + 'px')}
            />

            {/* 표 글자 크기 */}
            <SliderWidget
              label="표 글자 크기 (0인 경우 페이지 기본 크기 사용)"
              min={0}
              max={36}
              value={parseInt(getTagRules('table')['font-size']) || 0}
              unit={parseInt(getTagRules('table')['font-size']) === 0 || !getTagRules('table')['font-size'] ? "기본값" : "px"}
              disabled={isSystemProfile}
              onChange={(v) => {
                if (v === '0') {
                  updateTableFontSize('');
                } else {
                  updateTableFontSize(v + 'px');
                }
              }}
            />
          </div>

          {/* 하이퍼링크 (A) 설정 */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 space-y-3.5">
            <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider block">🔗 하이퍼링크 (Link) 스타일</span>

            <ColorPickerWidget
              label="링크 글자 색상"
              value={getTagRules('a')['color'] || ''}
              disabled={isSystemProfile}
              onChange={(v) => updateCssRule('a', 'color', v)}
            />

            <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40 p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-800/60">
              <span className="text-zinc-650 dark:text-zinc-350 font-semibold text-sm">링크 밑줄 여부</span>
              <select
                value={getTagRules('a')['text-decoration'] || 'underline'}
                disabled={isSystemProfile}
                onChange={(e) => updateCssRule('a', 'text-decoration', e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-blue-600 dark:text-blue-400 font-bold cursor-pointer text-right"
              >
                <option value="underline">밑줄 노출</option>
                <option value="none">밑줄 소거</option>
              </select>
            </div>

            <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40 p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-800/60">
              <span className="text-zinc-650 dark:text-zinc-350 font-semibold text-sm">링크 글자 굵기</span>
              <select
                value={getTagRules('a')['font-weight'] || 'normal'}
                disabled={isSystemProfile}
                onChange={(e) => updateCssRule('a', 'font-weight', e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-blue-600 dark:text-blue-400 font-bold cursor-pointer text-right"
              >
                <option value="normal">보통</option>
                <option value="bold">굵게</option>
              </select>
            </div>
          </div>

          {/* 소스코드 및 코드 블록 설정 */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 space-y-3.5">
            <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider block">💻 소스코드 및 코드 블록</span>

            {/* 코드 블록 형태 프리셋 버튼 */}
            {(() => {
              const cb = getTagRules('codeBlock');
              const isBasic = cb['background-color'] === '#f1f5f9';
              const isMac = cb['background-color'] === '#282c34';
              const isDark = cb['background-color'] === '#0f172a';
              
              const activeClass = 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300';
              const inactiveClass = 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300';

              return (
                <div className="flex gap-2 mb-4">
                  <button 
                    disabled={isSystemProfile}
                    onClick={() => {
                      const newCb = { ...(currentProfile.rules.codeBlock || {}) };
                      const newCbt = { ...(currentProfile.rules.codeBlockTitle || {}) };
                      newCb['background-color'] = '#f1f5f9';
                      newCb['color'] = '#1e293b';
                      newCb['border-radius'] = '6px';
                      newCbt['background-color'] = '#e2e8f0';
                      newCbt['color'] = '#475569';
                      newCbt['padding'] = '8px 12px';
                      newCbt['border-radius'] = '6px 6px 0 0';
                      onUpdateProfile({ ...currentProfile, rules: { ...currentProfile.rules, codeBlock: newCb, codeBlockTitle: newCbt }});
                    }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${isSystemProfile ? 'opacity-50 cursor-not-allowed border-zinc-200' : isBasic ? activeClass : inactiveClass}`}
                  >
                    기본 박스
                  </button>
                  <button 
                    disabled={isSystemProfile}
                    onClick={() => {
                      const newCb = { ...(currentProfile.rules.codeBlock || {}) };
                      const newCbt = { ...(currentProfile.rules.codeBlockTitle || {}) };
                      newCb['background-color'] = '#282c34';
                      newCb['color'] = '#abb2bf';
                      newCb['border-radius'] = '0 0 8px 8px';
                      newCbt['background-color'] = '#21252b';
                      newCbt['color'] = '#abb2bf';
                      newCbt['padding'] = '10px 16px';
                      newCbt['border-radius'] = '8px 8px 0 0';
                      onUpdateProfile({ ...currentProfile, rules: { ...currentProfile.rules, codeBlock: newCb, codeBlockTitle: newCbt }});
                    }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${isSystemProfile ? 'opacity-50 cursor-not-allowed border-zinc-200' : isMac ? activeClass : inactiveClass}`}
                  >
                    Mac OS 테마
                  </button>
                  <button 
                    disabled={isSystemProfile}
                    onClick={() => {
                      const newCb = { ...(currentProfile.rules.codeBlock || {}) };
                      const newCbt = { ...(currentProfile.rules.codeBlockTitle || {}) };
                      newCb['background-color'] = '#0f172a';
                      newCb['color'] = '#e2e8f0';
                      newCb['border-radius'] = '0 0 8px 8px';
                      newCbt['background-color'] = '#1e293b';
                      newCbt['color'] = '#94a3b8';
                      newCbt['padding'] = '8px 12px';
                      newCbt['border-radius'] = '8px 8px 0 0';
                      onUpdateProfile({ ...currentProfile, rules: { ...currentProfile.rules, codeBlock: newCb, codeBlockTitle: newCbt }});
                    }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${isSystemProfile ? 'opacity-50 cursor-not-allowed border-zinc-200' : isDark ? activeClass : inactiveClass}`}
                  >
                    다크 테마 고정
                  </button>
                </div>
              );
            })()}

            <ColorPickerWidget
              label="코드 블록 타이틀 배경색"
              value={getTagRules('codeBlockTitle')['background-color'] || ''}
              disabled={isSystemProfile}
              onChange={(v) => updateCssRule('codeBlockTitle', 'background-color', v)}
            />
            <ColorPickerWidget
              label="코드 블록 타이틀 글자색"
              value={getTagRules('codeBlockTitle')['color'] || ''}
              disabled={isSystemProfile}
              onChange={(v) => updateCssRule('codeBlockTitle', 'color', v)}
            />

            <ColorPickerWidget
              label="코드 블록 배경색"
              value={getTagRules('codeBlock')['background-color'] || ''}
              disabled={isSystemProfile}
              onChange={(v) => updateCssRule('codeBlock', 'background-color', v)}
            />
            <ColorPickerWidget
              label="코드 블록 글자색"
              value={getTagRules('codeBlock')['color'] || ''}
              disabled={isSystemProfile}
              onChange={(v) => updateCssRule('codeBlock', 'color', v)}
            />
            <SliderWidget
              label="코드 글자 크기"
              min={10}
              max={24}
              value={parseInt(getTagRules('codeBlock')['font-size']) || 13}
              unit="px"
              disabled={isSystemProfile}
              onChange={(v) => updateCssRule('codeBlock', 'font-size', v + 'px')}
            />

            <SliderWidget
              label="코드 블록 내부 패딩"
              min={0}
              max={32}
              value={parseInt(getTagRules('codeBlock')['padding']) || 12}
              unit="px"
              disabled={isSystemProfile}
              onChange={(v) => updateCssRule('codeBlock', 'padding', v + 'px')}
            />

            <SliderWidget
              label="코드 블록 테두리 둥글기"
              min={0}
              max={16}
              value={parseInt(getTagRules('codeBlock')['border-radius']) || 6}
              unit="px"
              disabled={isSystemProfile}
              onChange={(v) => updateCssRule('codeBlock', 'border-radius', v + 'px')}
            />
          </div>

          {/* 인라인 코드 (Code) 설정 */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 space-y-3.5">
            <span className="text-[13.5px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider block">💻 CODE - 인라인 소스 코드 스타일</span>
            <ColorPickerWidget
              label="코드 글자 색상"
              value={getTagRules('code')['color'] || ''}
              disabled={isSystemProfile}
              onChange={(v) => updateCssRule('code', 'color', v)}
            />
            <ColorPickerWidget
              label="코드 배경 색상"
              value={getTagRules('code')['background-color'] || ''}
              disabled={isSystemProfile}
              onChange={(v) => updateCssRule('code', 'background-color', v)}
            />

            <SliderWidget
              label="코드 테두리 둥글기"
              min={0}
              max={16}
              value={parseInt(getTagRules('code')['border-radius']) || 4}
              unit="px"
              disabled={isSystemProfile}
              onChange={(v) => updateCssRule('code', 'border-radius', v + 'px')}
            />

            {/* 인라인 코드 글자 굵기 설정 */}
            <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40 p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-800/60">
              <span className="text-zinc-650 dark:text-zinc-350 font-semibold text-sm">코드 글자 굵기</span>
              <select
                value={getTagRules('code')['font-weight'] || 'normal'}
                disabled={isSystemProfile}
                onChange={(e) => updateCssRule('code', 'font-weight', e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-blue-600 dark:text-blue-400 font-bold cursor-pointer text-right"
              >
                <option value="normal">보통</option>
                <option value="bold">굵게</option>
              </select>
            </div>
          </div>

          {/* 각주 영역 (Footnote) 설정 */}
          <div className="border-t border-zinc-200 dark:border-zinc-800/60 pt-4 space-y-3.5">
            <span className="text-[13.5px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider block">📌 FOOTNOTE - 각주 영역 스타일 조작</span>
            <ColorPickerWidget
              label="각주 글자 색상"
              value={getTagRules('footnote')['color'] || ''}
              disabled={isSystemProfile}
              onChange={(v) => updateCssRule('footnote', 'color', v)}
            />
            <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <span className="text-[13.5px] font-bold text-zinc-700 dark:text-zinc-300">각주 굵기 (Font Weight)</span>
              <select
                value={getTagRules('footnote')['font-weight'] || 'normal'}
                disabled={isSystemProfile}
                onChange={(e) => updateCssRule('footnote', 'font-weight', e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-blue-600 dark:text-blue-400 font-bold cursor-pointer text-right"
              >
                <option value="normal">보통</option>
                <option value="bold">굵게</option>
              </select>
            </div>
            <SliderWidget
              label="각주 글자 크기"
              min={10}
              max={20}
              value={parseInt(getTagRules('footnote')['font-size']) || 12}
              unit="px"
              disabled={isSystemProfile}
              onChange={(v) => updateCssRule('footnote', 'font-size', v + 'px')}
            />
            <SliderWidget
              label="각주 줄 간격"
              min={1.0}
              max={2.5}
              step={0.1}
              value={parseFloat(getTagRules('footnote')['line-height']) || 1.4}
              unit="배"
              disabled={isSystemProfile}
              onChange={(v) => updateCssRule('footnote', 'line-height', v)}
            />
            <SliderWidget
              label="각주 상하 바깥 여백"
              min={0}
              max={60}
              value={parseInt(getTagRules('footnote')['margin-top']) || 8}
              unit="px"
              disabled={isSystemProfile}
              onChange={(v) => {
                const px = v + 'px';
                if (!isSystemProfile) {
                  onUpdateProfile({
                    ...currentProfile,
                    rules: {
                      ...currentProfile.rules,
                      footnote: {
                        ...(currentProfile.rules.footnote || {}),
                        'margin-top': px,
                        'margin-bottom': px
                      }
                    }
                  });
                }
              }}
            />
          </div>
        </AccordionSection>

        {/* 🎬 아코디언 [6]: 미디어 (이미지, 동영상, 지도, 수식) */}
        <AccordionSection
          id="media"
          title="🎬 미디어 (이미지, 동영상, 지도, 수식)"
          isOpen={openAccordion === 'media'}
          onToggle={() => setOpenAccordion(openAccordion === 'media' ? null : 'media')}
        >
          {/* 이미지 객체 (Image) 설정 */}
          <div className="space-y-3.5">
            <span className="text-[13.5px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider block">🖼️ IMG - 이미지 객체 규격 조작</span>

            {/* 이미지 형태 프리셋 버튼 */}
            {(() => {
              const imgRules = currentProfile.rules.img || {};
              const hasImgBorderBottom = !!imgRules['border-bottom-width'] && imgRules['border-bottom-width'] !== 'none';
              const hasImgBoxShadow = !!imgRules['box-shadow'] && imgRules['box-shadow'] !== 'none';
              
              const isBasic = imgRules['border-radius'] === '4px' && !hasImgBorderBottom && !hasImgBoxShadow;
              const isPolaroid = imgRules['border-bottom-width'] === '32px';
              const isThumbnail = imgRules['border-radius'] === '16px' && hasImgBoxShadow && !hasImgBorderBottom;
              
              const activeClass = 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300';
              const inactiveClass = 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300';

              return (
                <div className="flex gap-2 mb-4">
                  <button 
                    disabled={isSystemProfile}
                    onClick={() => {
                      const img = { ...(currentProfile.rules.img || {}) };
                      delete img['border'];
                      delete img['border-bottom-width'];
                      delete img['box-shadow'];
                      img['border-radius'] = '4px';
                      img['padding'] = '0px';
                      img['background-color'] = 'transparent';
                      onUpdateProfile({ ...currentProfile, rules: { ...currentProfile.rules, img }});
                    }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${isSystemProfile ? 'opacity-50 cursor-not-allowed border-zinc-200' : isBasic ? activeClass : inactiveClass}`}
                  >
                    기본형
                  </button>
                  <button 
                    disabled={isSystemProfile}
                    onClick={() => {
                      const img = { ...(currentProfile.rules.img || {}) };
                      img['border'] = '10px solid white';
                      img['border-bottom-width'] = '32px';
                      img['box-shadow'] = '0 8px 16px rgba(0,0,0,0.15)';
                      img['border-radius'] = '2px';
                      img['background-color'] = 'white';
                      onUpdateProfile({ ...currentProfile, rules: { ...currentProfile.rules, img }});
                    }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${isSystemProfile ? 'opacity-50 cursor-not-allowed border-zinc-200' : isPolaroid ? activeClass : inactiveClass}`}
                  >
                    폴라로이드형
                  </button>
                  <button 
                    disabled={isSystemProfile}
                    onClick={() => {
                      const img = { ...(currentProfile.rules.img || {}) };
                      delete img['border'];
                      delete img['border-bottom-width'];
                      img['box-shadow'] = '0 4px 12px rgba(0,0,0,0.1)';
                      img['border-radius'] = '16px';
                      img['padding'] = '0px';
                      onUpdateProfile({ ...currentProfile, rules: { ...currentProfile.rules, img }});
                    }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${isSystemProfile ? 'opacity-50 cursor-not-allowed border-zinc-200' : isThumbnail ? activeClass : inactiveClass}`}
                  >
                    둥근 썸네일형
                  </button>
                </div>
              );
            })()}

            {/* 모서리 둥글기 슬라이더 */}
            <SliderWidget
              label="모서리 둥글기 (Border Radius)"
              min={0}
              max={60}
              value={getNumValue((currentProfile.rules.img || {})['border-radius'], 4)}
              unit="px"
              disabled={isSystemProfile}
              onChange={(v) => updateCssRule('img', 'border-radius', v + 'px')}
            />

            {/* 그림자 두께 슬라이더 */}
            <SliderWidget
              label="그림자 강도 (Shadow Blur)"
              min={0}
              max={40}
              value={
                (currentProfile.rules.img || {})['box-shadow'] 
                  ? parseInt(((currentProfile.rules.img || {})['box-shadow'] || '').match(/0 \d+px (\d+)px/) ? ((currentProfile.rules.img || {})['box-shadow'] || '').match(/0 \d+px (\d+)px/)![1] : '0') 
                  : 0
              }
              unit="px"
              disabled={isSystemProfile}
              onChange={(v) => {
                const numV = parseInt(v);
                const shadow = numV > 0 ? `0 ${Math.floor(numV/2)}px ${numV}px rgba(0,0,0,0.15)` : 'none';
                updateCssRule('img', 'box-shadow', shadow);
              }}
            />
            <SliderWidget
              label="이미지 가로 너비"
              min={50}
              max={800}
              value={parseInt(getTagRules('img')['width']) || 400}
              unit="px"
              disabled={isSystemProfile}
              onChange={(v) => updateCssRule('img', 'width', v + 'px')}
            />
            <SliderWidget
              label="이미지 세로 높이"
              min={50}
              max={600}
              value={parseInt(getTagRules('img')['height']) || 300}
              unit="px"
              disabled={isSystemProfile}
              onChange={(v) => updateCssRule('img', 'height', v + 'px')}
            />
            <SliderWidget
              label="이미지 상하 바깥 여백"
              min={0}
              max={80}
              value={parseInt(getTagRules('img')['margin-top']) || 16}
              unit="px"
              disabled={isSystemProfile}
              onChange={(v) => {
                const px = v + 'px';
                if (!isSystemProfile) {
                  onUpdateProfile({
                    ...currentProfile,
                    rules: {
                      ...currentProfile.rules,
                      img: {
                        ...(currentProfile.rules.img || {}),
                        'margin-top': px,
                        'margin-bottom': px,
                        'display': 'block',
                        'margin-left': 'auto',
                        'margin-right': 'auto'
                      }
                    }
                  });
                }
              }}
            />
            <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40 p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-800/60">
              <span className="text-zinc-650 dark:text-zinc-350 font-semibold text-sm">이미지 정렬 방식</span>
              <select
                value={getMediaAlign('img')}
                disabled={isSystemProfile}
                onChange={(e) => updateMediaAlign('img', e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-blue-600 dark:text-blue-400 font-bold cursor-pointer text-right"
              >
                <option value="center">중앙 정렬</option>
                <option value="left">왼쪽 정렬</option>
                <option value="right">오른쪽 정렬</option>
              </select>
            </div>
          </div>

          {/* 동영상 객체 (Video) 설정 */}
          <div className="border-t border-zinc-200 dark:border-zinc-800/60 pt-4 space-y-3.5">
            <span className="text-[13.5px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider block">🎥 VIDEO - 동영상 객체 규격 조작</span>
            <SliderWidget
              label="동영상 가로 너비"
              min={100}
              max={800}
              value={parseInt(getTagRules('video')['width']) || 560}
              unit="px"
              disabled={isSystemProfile}
              onChange={(v) => updateCssRule('video', 'width', v + 'px')}
            />
            <SliderWidget
              label="동영상 세로 높이"
              min={100}
              max={600}
              value={parseInt(getTagRules('video')['height']) || 315}
              unit="px"
              disabled={isSystemProfile}
              onChange={(v) => updateCssRule('video', 'height', v + 'px')}
            />
            <SliderWidget
              label="동영상 상하 바깥 여백"
              min={0}
              max={80}
              value={parseInt(getTagRules('video')['margin-top']) || 16}
              unit="px"
              disabled={isSystemProfile}
              onChange={(v) => {
                const px = v + 'px';
                if (!isSystemProfile) {
                  onUpdateProfile({
                    ...currentProfile,
                    rules: {
                      ...currentProfile.rules,
                      video: {
                        ...(currentProfile.rules.video || {}),
                        'margin-top': px,
                        'margin-bottom': px,
                        'display': 'block',
                        'margin-left': 'auto',
                        'margin-right': 'auto'
                      }
                    }
                  });
                }
              }}
            />
            <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40 p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-800/60">
              <span className="text-zinc-650 dark:text-zinc-350 font-semibold text-sm">동영상 정렬 방식</span>
              <select
                value={getMediaAlign('video')}
                disabled={isSystemProfile}
                onChange={(e) => updateMediaAlign('video', e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-blue-600 dark:text-blue-400 font-bold cursor-pointer text-right"
              >
                <option value="center">중앙 정렬</option>
                <option value="left">왼쪽 정렬</option>
                <option value="right">오른쪽 정렬</option>
              </select>
            </div>
          </div>

          {/* 지도 객체 (Map) 설정 */}
          <div className="border-t border-zinc-200 dark:border-zinc-800/60 pt-4 space-y-3.5">
            <span className="text-[13.5px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider block">🗺️ MAP - 지도 객체 규격 조작</span>
            <SliderWidget
              label="지도 가로 너비"
              min={100}
              max={800}
              value={parseInt(getTagRules('map')['width']) || 600}
              unit="px"
              disabled={isSystemProfile}
              onChange={(v) => updateCssRule('map', 'width', v + 'px')}
            />
            <SliderWidget
              label="지도 세로 높이"
              min={100}
              max={600}
              value={parseInt(getTagRules('map')['height']) || 450}
              unit="px"
              disabled={isSystemProfile}
              onChange={(v) => updateCssRule('map', 'height', v + 'px')}
            />
            <SliderWidget
              label="지도 상하 바깥 여백"
              min={0}
              max={80}
              value={parseInt(getTagRules('map')['margin-top']) || 16}
              unit="px"
              disabled={isSystemProfile}
              onChange={(v) => {
                const px = v + 'px';
                if (!isSystemProfile) {
                  onUpdateProfile({
                    ...currentProfile,
                    rules: {
                      ...currentProfile.rules,
                      map: {
                        ...(currentProfile.rules.map || {}),
                        'margin-top': px,
                        'margin-bottom': px,
                        'display': 'block',
                        'margin-left': 'auto',
                        'margin-right': 'auto'
                      }
                    }
                  });
                }
              }}
            />
            <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40 p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-800/60">
              <span className="text-zinc-650 dark:text-zinc-350 font-semibold text-sm">지도 정렬 방식</span>
              <select
                value={getMediaAlign('map')}
                disabled={isSystemProfile}
                onChange={(e) => updateMediaAlign('map', e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-blue-600 dark:text-blue-400 font-bold cursor-pointer text-right"
              >
                <option value="center">중앙 정렬</option>
                <option value="left">왼쪽 정렬</option>
                <option value="right">오른쪽 정렬</option>
              </select>
            </div>
          </div>

          {/* 수식 블록 (Math) 설정 */}
          <div className="border-t border-zinc-200 dark:border-zinc-800/60 pt-4 space-y-3.5">
            <span className="text-[13.5px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider block">📐 MATH - KaTeX 수식 블록 스타일</span>
            <ColorPickerWidget
              label="수식 글자 색상"
              value={getTagRules('math')['color'] || ''}
              disabled={isSystemProfile}
              onChange={(v) => updateCssRule('math', 'color', v)}
            />
            <SliderWidget
              label="수식 글자 크기"
              min={10}
              max={32}
              value={parseInt(getTagRules('math')['font-size']) || 16}
              unit="px"
              disabled={isSystemProfile}
              onChange={(v) => updateCssRule('math', 'font-size', v + 'px')}
            />
            <SliderWidget
              label="수식 상하 바깥 여백"
              min={0}
              max={80}
              value={parseInt(getTagRules('math')['margin-top']) || 16}
              unit="px"
              disabled={isSystemProfile}
              onChange={(v) => {
                const px = v + 'px';
                if (!isSystemProfile) {
                  onUpdateProfile({
                    ...currentProfile,
                    rules: {
                      ...currentProfile.rules,
                      math: {
                        ...(currentProfile.rules.math || {}),
                        'margin-top': px,
                        'margin-bottom': px
                      }
                    }
                  });
                }
              }}
            />
            <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40 p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-800/60">
              <span className="text-zinc-650 dark:text-zinc-350 font-semibold text-sm">수식 정렬 방식</span>
              <select
                value={getTagRules('math')['text-align'] || 'center'}
                disabled={isSystemProfile}
                onChange={(e) => updateCssRule('math', 'text-align', e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-blue-600 dark:text-blue-400 font-bold cursor-pointer text-right"
              >
                <option value="center">중앙 정렬</option>
                <option value="left">왼쪽 정렬</option>
                <option value="right">오른쪽 정렬</option>
              </select>
            </div>
          </div>
        </AccordionSection>

        {/* ─── 접이식 아코디언 그룹 끝 ─── */}

        {/* 🚨 기본 서식 복구 버튼 - DEFAULT 프로필이 아닐 때 하단에 배치 */}
        {!isSystemProfile && (
          <div className="pt-2 animate-fadeIn">
            <button
              type="button"
              onClick={resetToDefault}
              className="w-full py-3.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 font-bold border border-red-200 dark:border-red-900/50 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm text-base"
            >
              <span>🔄</span>
              <span>기본 서식(Onrivi Default)으로 전환</span>
            </button>
          </div>
        )}

      </div>

      <FontSelectorModal
        isOpen={isFontModalOpen}
        onClose={() => setIsFontModalOpen(false)}
        currentFont={currentProfile.pageStyle.fontFamily}
        onSelectFont={(font) => {
          handlePageStyleChange('fontFamily', '"' + font + '", serif');
        }}
        isDarkMode={isDarkMode || false}
      />

      {/* ⚡ 실시간 알림 토스트 레이어 */}
      {toastMessage && (
        <div className="fixed bottom-4 left-4 z-[99999] px-4 py-3 rounded-lg bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xl border border-zinc-700 dark:border-zinc-200 text-sm font-bold animate-fadeIn flex items-center gap-2">
          <span>🔔</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 📥 외부 서식 가져오기 (JSON 직접 붙여넣기 및 파일 드래그) 모달 */}
      {showImportModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-[480px] max-w-full shadow-2xl p-5 space-y-4 animate-scaleUp text-left">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <span className="font-bold text-zinc-800 dark:text-zinc-200 text-base">📥 외부 서식 가져오기 / 업로드</span>
              <button onClick={() => { setShowImportModal(false); setImportJsonText(''); }} className="text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 font-bold text-base leading-none">X</button>
            </div>

            <div className="space-y-3.5">
              {/* 파일 선택 방식 */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">방법 1: 서식 파일(.json) 업로드</span>
                <div className="relative border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl p-4 text-center cursor-pointer transition-colors group">
                  <input type="file" accept=".json" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                  <span className="text-zinc-500 dark:text-zinc-400 group-hover:text-blue-500 transition-colors text-sm font-bold block">📁 서식 JSON 파일 선택하기</span>
                  <span className="text-xs text-zinc-400 mt-1 block">AI가 저장해 준 서식 JSON 파일을 로드합니다.</span>
                </div>
              </div>

              {/* 텍스트 붙여넣기 방식 */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">방법 2: AI 생성 JSON 텍스트 붙여넣기</span>
                <textarea
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder="AI가 출력해 준 Onrivi 규격 JSON 텍스트를 여기에 붙여넣어 주세요..."
                  className="w-full h-44 p-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl font-mono text-xs leading-relaxed outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => { setShowImportModal(false); setImportJsonText(''); }}
                className="flex-1 py-2.5 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl font-bold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (!importJsonText.trim()) {
                    showToast("가져올 JSON 텍스트를 입력해 주세요!");
                    return;
                  }
                  importProfileString(importJsonText);
                }}
                style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
                className="flex-1 py-2.5 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-sm transition-colors cursor-pointer"
              >
                가져오기 실행
              </button>
            </div>
          </div>
        </div>
      )}

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
