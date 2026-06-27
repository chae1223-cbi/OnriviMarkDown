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
 */

import React, { useState, useEffect, useRef } from 'react';
import { CssProfile, CssRuleSet } from '@/types/cssProfile';
import { DEFAULT_PROFILE, isSystemProfileId } from '@/constants/cssProfile';
import { PAPER_SIZES } from '@/constants/paperSizes';
import { CSS_PROFILE_GUIDE_MD } from '@/constants/cssProfileGuide';
import FontSelectorModal from './FontSelectorModal';

/**
 * 🎯 원클릭 서식 프리셋 템플릿 데이터 모델
 */


interface CssStyleFormProps {
  profiles: CssProfile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onUpdateProfile: (profile: CssProfile) => void;
  onAddProfile?: () => void;
  onDeleteProfile?: (id: string) => void;
  onImportProfile?: (profile: CssProfile) => void;
  onClose: () => void;
  isDarkMode?: boolean;
}

/* ────────────────────────────────────────────────────────
   🧩 [서브 위젯 컴포넌트]
   ──────────────────────────────────────────────────────── */

// ====================================================================
// 📊 [OMD-CORE-CssStyleForm-0001] CssStyleForm ➔ AccordionSection
// 🎯 @KICK  : 접이식 아코디언 섹션 래퍼 컴포넌트 - 타이틀 클릭으로 열기/닫기 토글
// 🛡️ @GUARD : isOpen 상태에 따라 자식 렌더링 조건 분기
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
// 1. 아코디언 섹션 래퍼 (글씨 크기를 시원하게 상향)
interface AccordionSectionProps {
  id: string;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

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
interface SliderWidgetProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number | string;
  unit: string;
  disabled: boolean;
  onChange: (val: string) => void;
}

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
interface ColorPickerWidgetProps {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (val: string) => void;
}

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
interface TagRuleEditorProps {
  tag: string;
  label: string;
  rules: CssRuleSet;
  isSystemProfile: boolean;
  onUpdateRule: (tag: string, property: string, value: string) => void;
  onRemoveRule: (tag: string, property: string) => void;
}

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
export default function CssStyleForm({
  profiles, activeProfileId, onSelectProfile, onUpdateProfile, onAddProfile, onDeleteProfile, onImportProfile, onClose, isDarkMode
}: CssStyleFormProps) {
  const currentProfile = profiles.find(p => p.id === activeProfileId) || DEFAULT_PROFILE;
  const isSystemProfile = isSystemProfileId(currentProfile.id);

  /* ─── 아코디언 상태 관리 ─── */
  const [openAccordion, setOpenAccordion] = useState<string | null>('typography');

  /* ─── 폰트 선택 및 위계 탭 관리 ─── */
  const [isFontModalOpen, setIsFontModalOpen] = useState(false);
  const [activeHeadingTab, setActiveHeadingTab] = useState(2);
  const [activeInlineTab, setActiveInlineTab] = useState<'strong' | 'em' | 'u' | 'del'>('strong');
  const [showJson, setShowJson] = useState<string | null>(null);

  /* ─── 가져오기/내보내기 상태 ─── */
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  /* ─── 인라인 이름 변경 상태 ─── */
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

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
        alert("올바른 Onrivi 서식 양식이 아닙니다. name, pageStyle, rules 속성이 필수입니다.");
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
      alert("JSON 문법 에러! 형식을 확인해 주세요.");
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
    return currentProfile.rules[tagKey] || {};
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
    const baseRule = getTagRules(tag);
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
    const updated = {
      ...currentProfile,
      rules: {
        ...currentProfile.rules,
        [tagKey]: { ...getTagRules(tag), [property]: value },
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
    const current = getTagRules(tag);
    const { [property]: _, ...rest } = current;
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
    if (window.confirm(`서식 "${currentProfile.name}"을(를) 정말로 삭제하시겠습니까?`)) {
      onDeleteProfile(currentProfile.id);
    }
  };


  /* ─── 구조제어 데이터 ─── */
  const hrStructure = currentProfile.hrStructure || {
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    marginTopBottom: '32px',
    lineWidth: '100%'
  };

  const checkboxStructure = currentProfile.checkboxStructure || {
    boxSize: '16px',
    checkedEffect: 'line-through-and-dim',
    textGap: '10px'
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
    if (window.confirm('시스템 기본 서식으로 전환하시겠습니까?')) {
      onSelectProfile(DEFAULT_PROFILE.id); // DEFAULT_PROFILE = system-gov
    }
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

  return (
    <div className="w-[420px] shrink-0 h-full bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col select-none text-sm animate-fadeIn">
      {/* 상단 헤더 (글자 크기 상향) */}
      <div className="h-14 bg-white dark:bg-zinc-850 border-b border-zinc-200 dark:border-zinc-850 px-4 flex items-center justify-between shrink-0 gap-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {isEditingName ? (
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
              className="p-1 border border-blue-500 rounded bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-bold text-sm outline-none w-full max-w-[200px]"
            />
          ) : (
            <>
              <span className="font-bold text-zinc-700 dark:text-zinc-300 text-base shrink-0 whitespace-nowrap">🏛️ 서식 정의</span>
              <select
                value={activeProfileId}
                onChange={(e) => onSelectProfile(e.target.value)}
                className="p-1 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-semibold text-sm outline-none cursor-pointer max-w-[120px] truncate"
              >
                {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </>
          )}
          
          <div className="flex items-center gap-1 shrink-0">
            {onAddProfile && (
              <button onClick={onAddProfile} className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-550 hover:text-blue-500 transition-colors shrink-0" title="새 서식 추가">
                <span className="text-[15px] font-bold leading-none">➕</span>
              </button>
            )}
            {!isSystemProfile && (
              <button onClick={handleRenameClick} className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-550 hover:text-blue-500 transition-colors shrink-0" title="서식 이름 변경">
                <span className="text-[15px] font-bold leading-none">✏️</span>
              </button>
            )}
            {canDelete && onDeleteProfile && (
              <button onClick={handleDeleteClick} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-400 hover:text-red-500 transition-colors shrink-0" title="서식 삭제">
                <span className="text-[15px] font-bold leading-none">🗑️</span>
              </button>
            )}
            <button
              onClick={() => {
                exportCurrentProfile();
                copyProfileToClipboard();
              }}
              className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-550 hover:text-blue-500 transition-colors shrink-0"
              title="서식 데이터 내보내기 (.json 파일 다운로드 & 클립보드 복사)"
            >
              <span className="text-[14px] font-bold leading-none">📤</span>
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-550 hover:text-green-500 transition-colors shrink-0"
              title="외부 서식 업로드 / 가져오기 (JSON 직접 붙여넣기 가능)"
            >
              <span className="text-[14px] font-bold leading-none">📥</span>
            </button>
            <button
              onClick={downloadGuideSpec}
              className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-550 hover:text-amber-500 transition-colors shrink-0"
              title="서식 작성 표준 명세서 다운로드 (AI에게 요청할 때 활용)"
            >
              <span className="text-[14px] font-bold leading-none">📖</span>
            </button>
          </div>
        </div>
      </div>

      {/* 프로필 이름 지정 (인풋 크기 상향) */}
      {!isSystemProfile && (
        <div className="px-4 py-3 shrink-0 bg-white dark:bg-zinc-850 border-b border-zinc-150 dark:border-zinc-800">
          <label className="block text-zinc-500 dark:text-zinc-400 text-sm font-semibold mb-1.5">서식 명칭</label>
          <input type="text" value={currentProfile.name} onChange={(e) => handleNameChange(e.target.value)} className="w-full p-2.5 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-bold text-base text-zinc-750 dark:text-zinc-300 outline-none focus:border-blue-500 transition-colors" placeholder="예: 정부표준_보고서_양식" />
        </div>
      )}

      {/* 스크롤 가능한 본문 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">

        {/* ─── 접이식 아코디언 그룹 시작 ─── */}

        {/* 🟢 아코디언 [1]: 글꼴 및 본문 문단 */}
        <AccordionSection
          id="typography"
          title="✍️ 전역 글꼴 및 본문 문단"
          isOpen={openAccordion === 'typography'}
          onToggle={() => setOpenAccordion(openAccordion === 'typography' ? null : 'typography')}
        >
          {/* 가상 A4 용지 기본 서식 */}
          <div className="space-y-4.5">
            <div className="text-sm font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider">용지 레이아웃 & 전역 타이포</div>
            
            {/* 글꼴 선택 */}
            <div className="flex gap-2.5 items-end">
              <div className="flex-1">
                <span className="text-zinc-650 dark:text-zinc-350 font-semibold text-sm block mb-1.5">용지 기본 글꼴</span>
                <input
                  type="text"
                  value={isFontModalOpen ? '글꼴 선택 중...' : currentProfile.pageStyle.fontFamily}
                  readOnly
                  className="w-full p-2.5 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-100 dark:bg-zinc-900 font-mono text-blue-600 dark:text-blue-400 font-bold text-sm cursor-not-allowed"
                />
              </div>
              <button
                type="button"
                onClick={() => { if (!isSystemProfile) setIsFontModalOpen(true); }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-md transition-colors shrink-0 h-[40px] disabled:opacity-50 shadow-sm"
                disabled={isSystemProfile}
              >
                변경...
              </button>
            </div>

            {/* 기본 크기 슬라이더 */}
            <SliderWidget
              label="기본 글자 크기"
              min={10}
              max={36}
              value={parseInt(currentProfile.pageStyle.fontSize) || 15}
              unit="px"
              disabled={isSystemProfile}
              onChange={(v) => handlePageStyleChange('fontSize', v + 'px')}
            />

            {/* 줄 간격 슬라이더 */}
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
                  className={`px-4 py-2 rounded text-sm font-bold border transition-all ${
                    currentProfile.pageStyle.orientation === 'portrait'
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
                  className={`px-4 py-2 rounded text-sm font-bold border transition-all ${
                    currentProfile.pageStyle.orientation === 'landscape'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-500'
                  }`}
                >
                  가로
                </button>
              </div>
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
                  } catch {}
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
            <div className="border-t border-zinc-150 dark:border-zinc-800 pt-3.5 space-y-3.5">
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

            {/* 인용구 배경 색상 (컬러 피커 연동) */}
            <ColorPickerWidget
              label="인용구 채우기 배경색"
              value={(currentProfile.rules.blockquote || {})['background-color'] || ''}
              disabled={isSystemProfile}
              onChange={(v) => updateCssRule('blockquote', 'background-color', v)}
            />

            {/* 강조선 색상 (컬러 피커 연동) */}
            <ColorPickerWidget
              label="왼쪽 강조선 테두리 색상"
              value={(currentProfile.rules.blockquote || {})['border-left-color'] || ''}
              disabled={isSystemProfile}
              onChange={(v) => updateCssRule('blockquote', 'border-left-color', v)}
            />

            {/* 강조선 두께 슬라이더 */}
            <SliderWidget
              label="왼쪽 강조선 두께"
              min={0}
              max={20}
              value={getNumValue((currentProfile.rules.blockquote || {})['border-left-width'], 4)}
              unit="px"
              disabled={isSystemProfile}
              onChange={(v) => updateCssRule('blockquote', 'border-left-width', v + 'px')}
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
          </div>

          {/* 표 (Table) 설정 */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 space-y-3.5">
            <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider block">📊 표 (Table) 스타일</span>
            
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
              label="코드 글자 크기"
              min={10}
              max={24}
              value={parseInt(getTagRules('code')['font-size']) || 13}
              unit="px"
              disabled={isSystemProfile}
              onChange={(v) => updateCssRule('code', 'font-size', v + 'px')}
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
          </div>

          {/* 각주 영역 (Footnote) 설정 */}
          <div className="border-t border-zinc-150 dark:border-zinc-850/60 pt-4 space-y-3.5">
            <span className="text-[13.5px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider block">📌 FOOTNOTE - 각주 영역 스타일 조작</span>
            <ColorPickerWidget
              label="각주 글자 색상"
              value={getTagRules('footnote')['color'] || ''}
              disabled={isSystemProfile}
              onChange={(v) => updateCssRule('footnote', 'color', v)}
            />
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
          <div className="border-t border-zinc-150 dark:border-zinc-850/60 pt-4 space-y-3.5">
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
          <div className="border-t border-zinc-150 dark:border-zinc-850/60 pt-4 space-y-3.5">
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
          <div className="border-t border-zinc-150 dark:border-zinc-850/60 pt-4 space-y-3.5">
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
            <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-3">
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
                  className="w-full h-44 p-3 border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 rounded-xl font-mono text-xs leading-relaxed outline-none focus:border-blue-500 transition-colors resize-none"
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
                    alert("가져올 JSON 텍스트를 입력해 주세요!");
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
    </div>
  );
}
