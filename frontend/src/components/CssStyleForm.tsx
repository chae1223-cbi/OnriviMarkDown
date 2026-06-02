'use client';

/*
 * CssStyleForm.tsx — 서식 정의 제어판 (관보 서식 규격 지정)
 *
 * 좌측 50% 영역을 차지하는 패널로, 사용자가 선택한 CssProfile의
 * 전역 타이포그래피와 각 HTML 태그별 CSS 룰셋(CssRuleSet)을 편집합니다.
 *
 * 편집 모드는 두 가지:
 *   1. 위젯 편집 모드 (기본) — CSS 속성명/값을 개별 input으로 수정
 *   2. CSS 직접 편집 모드 — JSON textarea로 한꺼번에 편집
 *
 * DEFAULT_PROFILE(id='default') 선택 시 모든 입력이 비활성화(disabled)됩니다.
 */

import React, { useState, useEffect } from 'react';
import { CssProfile, CssRuleSet } from '@/types/cssProfile';
import { DEFAULT_PROFILE } from '@/constants/cssProfile';

/**
 * CssStyleForm 최상위 props
 */
interface CssStyleFormProps {
  profiles: CssProfile[];          // 전체 프로필 목록 (상태 끌어올림)
  activeProfileId: string;         // 현재 선택된 프로필 ID
  onSelectProfile: (id: string) => void;   // 프로필 선택 핸들러
  onUpdateProfile: (profile: CssProfile) => void;  // 프로필 업데이트 핸들러
  onAddProfile?: () => void;       // 새 프로필 생성 핸들러 (선택)
  onDeleteProfile?: (id: string) => void;  // 프로필 삭제 핸들러 (선택)
  onClose: () => void;             // css-style 모드 종료 → 에디터 복귀
}

/**
 * TagRuleEditor — 개별 태그(h1, p, table 등)의 CSS 룰셋을 편집하는 서브 컴포넌트
 *
 * 두 가지 뷰 모드를 제공합니다:
 * - 간편 모드: 등록된 CSS 속성을 input 목록으로 표시, "+ 속성 추가" 가능
 * - JSON 모드: 전체 CssRuleSet을 JSON 문자열로 직접 편집
 */
interface TagRuleEditorProps {
  tag: string;       // 태그명 (예: 'h1', 'table')
  label: string;     // UI에 표시할 설명
  rules: CssRuleSet; // 현재 CssRuleSet 객체
  isDefault: boolean; // DEFAULT_PROFILE 여부 (true면 모든 입력 disabled)
  onUpdateRule: (tag: string, property: string, value: string) => void;
  onRemoveRule: (tag: string, property: string) => void;
}

function TagRuleEditor({ tag, label, rules, isDefault, onUpdateRule, onRemoveRule }: TagRuleEditorProps) {
  const [showJson, setShowJson] = useState(false);
  const [jsonText, setJsonText] = useState('');

  /* rules가 바뀔 때마다 JSON 미러링 */
  useEffect(() => {
    setJsonText(JSON.stringify(rules, null, 2));
  }, [rules]);

  /* 값이 비어있지 않은 항목만 목록에 표시 */
  const entries = Object.entries(rules).filter(([, v]) => v !== '');

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 bg-white dark:bg-zinc-950 shadow-sm">
      {/* 헤더: 태그명 + 뷰 전환 버튼 */}
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-2 mb-2">
        <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-[11px]">{label}</span>
        <button
          type="button"
          onClick={() => setShowJson(!showJson)}
          className="text-[10px] text-zinc-400 hover:text-blue-500 font-medium"
        >
          {showJson ? '위젯 편집' : 'CSS 직접 편집'}
        </button>
      </div>

      {showJson ? (
        /*
         * JSON 편집 모드:
         * - 텍스트를 직접 수정하면 실시간으로 파싱하여 rules에 반영
         * - JSON 파싱 실패 시 무시(기존 rules 유지)
         * - 제거된 속성은 onRemoveRule로 정리
         */
        <div className="space-y-1">
          <span className="text-[10px] text-zinc-400 block font-mono">CSS RuleSet JSON</span>
          <textarea
            disabled={isDefault}
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              try {
                const parsed = JSON.parse(e.target.value);
                for (const [prop, val] of Object.entries(parsed)) {
                  onUpdateRule(tag, prop, val as string);
                }
                for (const existingProp of Object.keys(rules)) {
                  if (!(existingProp in parsed)) {
                    onRemoveRule(tag, existingProp);
                  }
                }
              } catch {}
            }}
            className="w-full h-24 p-2 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-900 text-emerald-400 font-mono text-[11px] leading-relaxed"
          />
        </div>
      ) : (
        /*
         * 위젯 편집 모드 (기본):
         * - 각 CSS 속성을 개별 input으로 표시
         * - 값이 비어있으면 "지정된 CSS 규칙 없음" 안내
         * - "+ 속성 추가" 버튼으로 새 속성 추가 가능
         * - 각 속성 우측 X 버튼으로 삭제 가능
         */
        <div className="space-y-1.5">
          {entries.length === 0 && (
            <span className="text-[10px] text-zinc-400 italic">지정된 CSS 규칙 없음 (기본값 사용)</span>
          )}
          {entries.map(([prop, val]) => (
            <div key={prop} className="flex items-center gap-1.5">
              <span className="text-zinc-500 font-mono text-[10px] w-28 shrink-0">{prop}:</span>
              <input
                type="text"
                value={val}
                onChange={(e) => onUpdateRule(tag, prop, e.target.value)}
                className="flex-1 p-1 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-900 font-mono text-[11px] text-blue-600 dark:text-blue-400"
                disabled={isDefault}
              />
              {!isDefault && (
                <button
                  onClick={() => onRemoveRule(tag, prop)}
                  className="text-zinc-300 hover:text-red-400 text-[11px] px-1"
                >
                  X
                </button>
              )}
            </div>
          ))}
          {!isDefault && (
            <button
              onClick={() => {
                const key = prompt('추가할 CSS 속성명 (예: color):');
                if (key) onUpdateRule(tag, key.trim(), '');
              }}
              className="text-[10px] text-blue-500 hover:text-blue-600 font-medium mt-1"
            >
              + 속성 추가
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/*
 * CssStyleForm 메인 컴포넌트
 *
 * 전체 레이아웃:
 * ┌─────────────────────────────────────────────┐
 * │  🏛️ 관보 서식 규격 지정  [select] [+] [✕]  │  <- 헤더 (프로필 선택)
 * │                         [에디터로 복귀]     │
 * ├─────────────────────────────────────────────┤
 * │  프로필 이름 (DEFAULT 제외)                  │
 * ├─────────────────────────────────────────────┤
 * │  [섹션 1] 전역 타이포그래피                  │
 * │  - 폰트 검색 피커 + 글자크기/줄간격/자간     │
 * ├─────────────────────────────────────────────┤
 * │  [섹션 2] H1 위젯 (정렬/굵기/테두리/여백)    │
 * ├─────────────────────────────────────────────┤
 * │  [섹션 3] 제목 요소 (H1~H6 TagRuleEditor)    │
 * ├─────────────────────────────────────────────┤
 * │  [섹션 4] 본문 및 인라인 서식                │
 * ├─────────────────────────────────────────────┤
 * │  [섹션 5] 목록화 및 구조 제어                │
 * ├─────────────────────────────────────────────┤
 * │  [섹션 6] 복합 객체 정의                     │
 * └─────────────────────────────────────────────┘
 */
export default function CssStyleForm({
  profiles, activeProfileId, onSelectProfile, onUpdateProfile, onAddProfile, onDeleteProfile, onClose
}: CssStyleFormProps) {
  /* 현재 선택된 프로필 (없으면 DEFAULT) */
  const currentProfile = profiles.find(p => p.id === activeProfileId) || DEFAULT_PROFILE;
  const isDefault = currentProfile.id === 'default';

  /* ─── 폰트 선택 상태 ─── */
  const [isFontDialogOpen, setIsFontDialogOpen] = useState(false);

  /* ─── H2~H6 탭 선택 상태 ─── */
  const [activeHeadingTab, setActiveHeadingTab] = useState(2);

  /* ─── 인라인 서식 탭 선택 상태 (좌측 P 고정, 우측 STRONG/EM/U/DEL 전환) ─── */
  const [activeInlineTab, setActiveInlineTab] = useState<'strong' | 'em' | 'u' | 'del'>('strong');

  /* ─── CSS 직접 편집 토글 상태 (TagRuleEditor에서 분리) ─── */
  const [showJson, setShowJson] = useState<string | null>(null);

  /* ─── CssRuleSet 조작 헬퍼 ─── */

  /** 특정 태그의 CssRuleSet을 안전하게 반환 (undefined 방어) */
  const getTagRules = (tag: string): CssRuleSet => {
    const tagKey = tag as keyof CssProfile['rules'];
    return currentProfile.rules[tagKey] || {};
  };

  /**
   * 특정 태그의 CSS 속성 값을 설정합니다.
   * 내부적으로 onUpdateProfile을 호출하여 profiles 상태를 갱신합니다.
   * DEFAULT_PROFILE에서는 동작하지 않습니다.
   */
  const updateCssRule = (tag: string, property: string, value: string) => {
    if (isDefault) return;
    const tagKey = tag as keyof CssProfile['rules'];
    onUpdateProfile({
      ...currentProfile,
      rules: {
        ...currentProfile.rules,
        [tagKey]: { ...getTagRules(tag), [property]: value },
      },
    });
  };

  /**
   * 특정 태그에서 CSS 속성을 제거합니다.
   * 구조 분해 할당으로 해당 key를 제외한 나머지를 복사합니다.
   */
  const removeCssRule = (tag: string, property: string) => {
    if (isDefault) return;
    const tagKey = tag as keyof CssProfile['rules'];
    const current = getTagRules(tag);
    const { [property]: _, ...rest } = current;
    onUpdateProfile({
      ...currentProfile,
      rules: { ...currentProfile.rules, [tagKey]: rest },
    });
  };

  /** h1 위아래 여백 동시 업데이트 (두 번의 updateCssRule 호출로 인한 stale state 덮어쓰기 버그 방지) */
  const updateH1Margin = (top: string, bot: string) => {
    if (isDefault) return;
    const tagKey = 'h1' as keyof CssProfile['rules'];
    const current = getTagRules('h1');
    onUpdateProfile({
      ...currentProfile,
      rules: {
        ...currentProfile.rules,
        [tagKey]: { ...current, 'margin-top': top, 'margin-bottom': bot },
      },
    });
  };

  /** 임의 태그 위아래 여백 동시 업데이트 (stale state 방지) */
  const updateTagMargin = (tag: string, top: string, bot: string) => {
    if (isDefault) return;
    const tagKey = tag as keyof CssProfile['rules'];
    const current = getTagRules(tag);
    onUpdateProfile({
      ...currentProfile,
      rules: {
        ...currentProfile.rules,
        [tagKey]: { ...current, 'margin-top': top, 'margin-bottom': bot },
      },
    });
  };

  /** 전역 타이포그래피 및 페이지 설정 변경 */
  const handlePageStyleChange = (key: keyof CssProfile['pageStyle'], value: string) => {
    if (isDefault) return;
    onUpdateProfile({
      ...currentProfile,
      pageStyle: { ...currentProfile.pageStyle, [key]: value },
    });
  };

  /** 프로필 이름 변경 */
  const handleNameChange = (name: string) => {
    if (isDefault) return;
    onUpdateProfile({ ...currentProfile, name });
  };

  /* ─── 파생 상태 ─── */
  const nonDefaultProfiles = profiles.filter(p => p.id !== 'default').length;
  const canDelete = !isDefault && nonDefaultProfiles > 0;

  /* H1 위젯 버튼 옵션 */
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
    { label: '좁게', top: '12px', bot: '12px' },
    { label: '기본', top: '24px', bot: '24px' },
    { label: '넓게', top: '40px', bot: '40px' },
  ] as const;

  return (
    <div className="w-1/2 h-full bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col select-none text-xs">
      <div className="h-11 bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-zinc-700 dark:text-zinc-300">🏛️ 서식 정의</span>
          <select
            value={activeProfileId}
            onChange={(e) => onSelectProfile(e.target.value)}
            className="p-1 border border-zinc-300 dark:border-zinc-700 rounded bg-transparent font-medium text-[11px]"
          >
            {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {onAddProfile && (
            <button onClick={onAddProfile} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500" title="새 프로필 만들기">
              <span className="text-[13px] leading-none">+</span>
            </button>
          )}
          {canDelete && onDeleteProfile && (
            <button onClick={() => onDeleteProfile(currentProfile.id)} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-400 hover:text-red-500" title="프로필 삭제">
              <span className="text-[13px] leading-none">X</span>
            </button>
          )}
        </div>
        <button onClick={onClose} className="bg-zinc-800 hover:bg-zinc-700 text-white dark:bg-zinc-700 dark:hover:bg-zinc-600 px-2.5 py-1 rounded font-medium transition-colors">
          에디터로 복귀
        </button>
      </div>

      {!isDefault && (
        <div className="px-4 pt-3 pb-1">
          <label className="block text-zinc-400 mb-1">서식 이름</label>
          <input type="text" value={currentProfile.name} onChange={(e) => handleNameChange(e.target.value)} className="w-full p-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-medium text-[12px] text-zinc-700 dark:text-zinc-300" placeholder="예: 정부표준_보고서_양식" />
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">

        <div className="bg-white dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm space-y-4">
          <h4 className="font-bold text-blue-600 dark:text-blue-400 border-b border-zinc-100 dark:border-zinc-900 pb-1.5 text-[13px]">
            가상 A4 용지 전역 타이포그래피
          </h4>

          {/* 페이지 글꼴 — 읽기 전용 + [글꼴 선택] 버튼 */}
          <div>
            <label className="block text-zinc-400 mb-1">페이지 글꼴</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={isFontDialogOpen ? '글꼴 선택 중...' : currentProfile.pageStyle.fontFamily}
                readOnly
                placeholder="시스템 글꼴 선택"
                className="flex-1 p-2 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-100 dark:bg-zinc-900 font-mono text-blue-600 dark:text-blue-400 font-bold text-[11px] cursor-not-allowed"
                disabled={isDefault}
              />
              <button
                type="button"
                onClick={async () => {
                  if (isDefault) return;
                  setIsFontDialogOpen(true);
                  try {
                    const api = (window as any).electronAPI;
                    if (api && typeof api.openFontDialog === 'function') {
                      const result = await api.openFontDialog();
                      if (result) {
                        const parsed = typeof result === 'string' ? JSON.parse(result) : result;
                        if (parsed.family) {
                          handlePageStyleChange('fontFamily', '"' + parsed.family + '", serif');
                        }
                      }
                    } else if ('queryLocalFonts' in window) {
                      const availableFonts = await (window as any).queryLocalFonts();
                      if (availableFonts && availableFonts.length > 0) {
                        const families = Array.from(new Set(availableFonts.map((f: any) => f.family))) as string[];
                        const picked = families[0];
                        if (picked) {
                          handlePageStyleChange('fontFamily', '"' + picked + '", serif');
                        }
                      }
                    } else {
                      const picked = window.prompt('글꼴 이름을 입력하세요:', '');
                      if (picked) {
                        handlePageStyleChange('fontFamily', '"' + picked + '", serif');
                      }
                    }
                  } finally {
                    setIsFontDialogOpen(false);
                  }
                }}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-md transition-colors flex items-center gap-1 shrink-0"
                disabled={isDefault}
              >
                <span>📝</span>
                글꼴 선택
              </button>
            </div>
          </div>

          {/* 기본 크기 + 줄 간격 + 자간 */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-zinc-400 mb-1">기본 크기</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={parseInt(currentProfile.pageStyle.fontSize) || 15}
                  onChange={(e) => handlePageStyleChange('fontSize', e.target.value + 'px')}
                  className="w-full p-1.5 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-900 font-mono text-center text-[11px]"
                  disabled={isDefault}
                  min="10" max="36"
                />
                <span className="text-[10px] text-zinc-400 shrink-0">px</span>
              </div>
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">줄 간격</label>
              <input type="text" value={currentProfile.pageStyle.lineHeight} onChange={(e) => handlePageStyleChange('lineHeight', e.target.value)} className="w-full p-1.5 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-900 font-mono text-center text-[11px]" disabled={isDefault} placeholder="1.8" />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">자간 간격</label>
              <div className="flex flex-col items-center gap-1">
                <input
                  type="range" min="-0.05" max="0.05" step="0.01"
                  value={parseFloat(currentProfile.pageStyle.letterSpacing) || 0}
                  onChange={(e) => handlePageStyleChange('letterSpacing', e.target.value + 'em')}
                  className="w-full accent-blue-500"
                  disabled={isDefault}
                />
                <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                  {(() => {
                    const v = parseFloat(currentProfile.pageStyle.letterSpacing) || 0;
                    return (v > 0 ? '+' : '') + v.toFixed(2) + ' em';
                  })()}
                </span>
              </div>
            </div>
          </div>

          {/* 용지 여백 */}
          <div>
            <label className="block text-zinc-400 mb-1.5">용지 여백 (mm)</label>
            <div className="grid grid-cols-4 gap-2">
              {(['marginTop', 'marginBottom', 'marginLeft', 'marginRight'] as const).map((key) => (
                <div key={key}>
                  <label className="block text-[10px] text-zinc-400 mb-0.5 text-center">
                    {key === 'marginTop' ? '위' : key === 'marginBottom' ? '아래' : key === 'marginLeft' ? '왼쪽' : '오른쪽'}
                  </label>
                  <input
                    type="number"
                    value={parseInt(currentProfile.pageStyle[key]) || 20}
                    onChange={(e) => handlePageStyleChange(key, e.target.value + 'mm')}
                    className="w-full p-1.5 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-900 font-mono text-center text-[11px]"
                    disabled={isDefault}
                    min="5" max="50"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 용지 방향 */}
          <div>
            <label className="block text-zinc-400 mb-1.5">용지 방향</label>
            <div className="flex gap-3">
              <label className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] cursor-pointer border transition-all ${
                currentProfile.pageStyle.orientation === 'portrait'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                  : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400'
              } ${isDefault ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <input type="radio" name="orientation" value="portrait"
                  checked={currentProfile.pageStyle.orientation === 'portrait'}
                  onChange={() => handlePageStyleChange('orientation', 'portrait')}
                  className="sr-only" disabled={isDefault} />
                <span>📄</span>
                <span>세로</span>
              </label>
              <label className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] cursor-pointer border transition-all ${
                currentProfile.pageStyle.orientation === 'landscape'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                  : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400'
              } ${isDefault ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <input type="radio" name="orientation" value="landscape"
                  checked={currentProfile.pageStyle.orientation === 'landscape'}
                  onChange={() => handlePageStyleChange('orientation', 'landscape')}
                  className="sr-only" disabled={isDefault} />
                <span>📃</span>
                <span>가로</span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-2">
            <span className="font-bold text-zinc-800 dark:text-zinc-200 text-[13px]">
              통합 제목 서식 가드
            </span>
            {!isDefault && (
              <span className="text-xs px-2.5 py-0.5 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 font-bold rounded">규칙 적용 중</span>
            )}
          </div>
          <div className="grid grid-cols-10 gap-4">
            {/* 🟢 좌측 5열: H1 마스터 기둥 */}
            <div className="col-span-5 bg-zinc-100 dark:bg-zinc-800/50 p-3 rounded-lg space-y-3">
              <div className="text-[13px] font-bold text-blue-600 dark:text-blue-400">H1 마스터 기둥</div>
              {/* H1 정렬 */}
              <div className="bg-white dark:bg-zinc-900 p-2.5 rounded shadow-sm space-y-1.5">
                <span className="text-xs font-medium text-zinc-400 block">정렬</span>
                <div className="flex gap-1 flex-wrap">
                  {alignOptions.map(({ label, value }) => (
                    <button key={value} type="button" disabled={isDefault}
                      onClick={() => updateCssRule('h1', 'text-align', value)}
                      className={'px-2 py-1 rounded text-xs font-medium border transition-all ' + (h1Rules['text-align'] === value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-500')}
                    >{label}</button>
                  ))}
                </div>
              </div>
              {/* H1 기준 크기 */}
              <div className="bg-white dark:bg-zinc-900 p-2.5 rounded shadow-sm space-y-1.5">
                <span className="text-xs font-medium text-zinc-400 block">H1 기준 크기</span>
                <div className="flex items-center gap-1">
                  <input type="number"
                    value={parseInt(h1Rules['font-size']) || 28}
                    onChange={(e) => updateCssRule('h1', 'font-size', e.target.value + 'px')}
                    className="w-14 p-1 border border-zinc-200 dark:border-zinc-700 rounded bg-transparent font-mono text-center text-[13px] font-bold text-blue-600"
                    disabled={isDefault} min="16" max="48"
                  />
                  <span className="text-xs text-zinc-400">px</span>
                </div>
              </div>
              {/* 단계별 감소폭 */}
              <div className="bg-white dark:bg-zinc-900 p-2.5 rounded shadow-sm space-y-1.5">
                <span className="text-xs font-medium text-zinc-400 block">단계별 감소폭</span>
                <div className="flex items-center gap-1">
                  <input type="number"
                    value={parseInt(currentProfile.pageStyle.headingSizeOffset) || 4}
                    onChange={(e) => handlePageStyleChange('headingSizeOffset', e.target.value)}
                    className="w-14 p-1 border border-zinc-200 dark:border-zinc-700 rounded bg-transparent font-mono text-center text-[13px] font-bold text-blue-600"
                    disabled={isDefault} min="0" max="10"
                  />
                  <span className="text-xs text-zinc-400">px</span>
                </div>
              </div>
              {/* H1 서식 */}
              <div className="bg-white dark:bg-zinc-900 p-2.5 rounded shadow-sm space-y-1.5">
                <span className="text-xs font-medium text-zinc-400 block">서식</span>
                <div className="flex gap-1 flex-wrap">
                  {styleOptions.map(({ label, property, onVal, offVal }) => {
                    const isActive = h1Rules[property] === onVal;
                    return (
                      <button key={property} type="button" disabled={isDefault}
                        onClick={() => updateCssRule('h1', property, isActive ? offVal : onVal)}
                        className={'px-2 py-1 rounded text-xs font-medium border transition-all ' + (isActive
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                          : 'border-zinc-200 dark:border-zinc-700 text-zinc-500')}
                      >{label}</button>
                    );
                  })}
                </div>
              </div>
              {/* H1 자간 */}
              <div className="bg-white dark:bg-zinc-900 p-2.5 rounded shadow-sm space-y-1.5">
                <span className="text-xs font-medium text-zinc-400 block">자간</span>
                <div className="flex items-center gap-2">
                  <input type="range" min="-0.05" max="0.05" step="0.01"
                    value={parseFloat(h1Rules['letter-spacing']) || 0}
                    onChange={(e) => updateCssRule('h1', 'letter-spacing', e.target.value + 'em')}
                    className="flex-1 accent-blue-500 h-1" disabled={isDefault}
                  />
                  <span className="font-mono text-xs text-blue-600 font-bold w-14 text-right">
                    {(() => {
                      const v = parseFloat(h1Rules['letter-spacing']) || 0;
                      return (v > 0 ? '+' : '') + v.toFixed(2) + 'em';
                    })()}
                  </span>
                </div>
              </div>
              {/* H1 위아래 여백 */}
              <div className="bg-white dark:bg-zinc-900 p-2.5 rounded shadow-sm space-y-1.5">
                <span className="text-xs font-medium text-zinc-400 block">위아래 여백</span>
                <div className="flex gap-1 flex-wrap">
                  {marginOptions.map(({ label, top }) => (
                    <button key={label} type="button" disabled={isDefault}
                      onClick={() => updateH1Margin(top, top)}
                      className={'px-2 py-1 rounded text-xs font-medium border transition-all ' + (h1Rules['margin-top'] === top
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-500')}
                    >{label}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* 🎨 우측 5열: H2~H6 탭 기반 압착 구역 */}
            <div className="col-span-5 space-y-3">
              {/* 탭 바 */}
              <div className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-lg">
                <span className="text-xs font-bold text-zinc-400 pl-2">세부 위계 선택</span>
                <div className="inline-flex bg-zinc-200/60 dark:bg-zinc-700/60 p-0.5 rounded-md text-xs font-medium">
                  {[2, 3, 4, 5, 6].map((level) => {
                    const tag = 'h' + level;
                    return (
                      <button key={level}
                        onClick={() => setActiveHeadingTab(level)}
                        className={'px-3 py-1 rounded transition-all ' + (activeHeadingTab === level ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 font-bold shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700')}
                      >H{level}</button>
                    );
                  })}
                </div>
              </div>
              {/* 활성 탭 스타일 팩 */}
              {(() => {
                const tag = 'h' + activeHeadingTab;
                const tagRules = currentProfile.rules[tag as keyof typeof currentProfile.rules] || {};
                const offset = parseInt(currentProfile.pageStyle.headingSizeOffset) || 4;
                const h1Size = parseInt(h1Rules['font-size']) || 28;
                const calculatedSize = Math.max(10, h1Size - (activeHeadingTab - 1) * offset);
                return (
                  <div className="bg-zinc-100 dark:bg-zinc-800/50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700 pb-2">
                      <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">H{activeHeadingTab} 세부 설정</span>
                      <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold">
                        계산 크기: {calculatedSize}px
                      </span>
                    </div>
                    {/* 서식 */}
                    <div className="flex items-center">
                      <span className="w-28 shrink-0 text-xs text-zinc-400 font-medium">서식</span>
                      <div className="flex gap-1 flex-wrap">
                        {styleOptions.map(({ label, property, onVal, offVal }) => {
                          const isActive = tagRules[property] === onVal;
                          return (
                            <button key={property} type="button" disabled={isDefault}
                              onClick={() => updateCssRule(tag, property, isActive ? offVal : onVal)}
                              className={'px-2 py-1 rounded text-xs font-medium border transition-all ' + (isActive
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                                : 'border-zinc-200 dark:border-zinc-700 text-zinc-500')}
                            >{label}</button>
                          );
                        })}
                      </div>
                    </div>
                    {/* 하단 테두리 */}
                    <div className="flex items-center">
                      <span className="w-28 shrink-0 text-xs text-zinc-400 font-medium">하단 테두리</span>
                      <div className="flex gap-1 flex-wrap">
                        {borderOptions.map(({ label, value }) => (
                          <button key={label} type="button" disabled={isDefault}
                            onClick={() => updateCssRule(tag, 'border-bottom', value)}
                            className={'px-2 py-1 rounded text-xs font-medium border transition-all ' + (tagRules['border-bottom'] === value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                              : 'border-zinc-200 dark:border-zinc-700 text-zinc-500')}
                          >{label}</button>
                        ))}
                      </div>
                    </div>
                    {/* 위아래 여백 */}
                    <div className="flex items-center">
                      <span className="w-28 shrink-0 text-xs text-zinc-400 font-medium">위아래 여백</span>
                      <div className="flex gap-1 flex-wrap">
                        {marginOptions.map(({ label, top }) => (
                          <button key={label} type="button" disabled={isDefault}
                            onClick={() => updateTagMargin(tag, top, top)}
                            className={'px-2 py-1 rounded text-xs font-medium border transition-all ' + (tagRules['margin-top'] === top
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                              : 'border-zinc-200 dark:border-zinc-700 text-zinc-500')}
                          >{label}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-2">
            <span className="font-bold text-zinc-800 dark:text-zinc-200 text-[13px]">본문 및 인라인 서식 통합 가드</span>
            {!isDefault && <span className="text-xs px-2.5 py-0.5 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 font-bold rounded">규칙 적용 중</span>}
          </div>
          <div className="grid grid-cols-10 gap-4">
            {/* 🟢 좌측 5열: P - 기본 본문 문단 고정 */}
            <div className="col-span-5 bg-zinc-100 dark:bg-zinc-800/50 p-3 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-blue-600 dark:text-blue-400">P - 기본 본문 문단</span>
                <button onClick={() => setShowJson(prev => prev === 'p' ? null : 'p')}
                  className="text-xs text-blue-500 hover:text-blue-600 font-bold">{showJson === 'p' ? '위젯 보기' : '직접 편집'}</button>
              </div>
              {(showJson === 'p') ? (
                <div className="space-y-1">
                  <textarea value={JSON.stringify(currentProfile.rules.p || {}, null, 2)}
                    disabled={isDefault}
                    onChange={(e) => {
                      try { const parsed = JSON.parse(e.target.value); Object.entries(parsed).forEach(([prop, val]) => updateCssRule('p', prop, val as string)); } catch {}
                    }}
                    className="w-full h-24 p-2 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-900 text-emerald-400 font-mono text-[11px] leading-relaxed" />
                </div>
              ) : (() => {
                const pRules = currentProfile.rules.p || {};
                const knownPProps = ['text-align', 'margin-bottom', 'text-indent', 'line-height', 'color'];
                const customPProps = Object.entries(pRules).filter(([k, v]) => v !== '' && !knownPProps.includes(k));
                return (
                  <div className="space-y-1.5">
                    {customPProps.length === 0 && Object.entries(pRules).filter(([, v]) => v !== '').length === 0 && (
                      <span className="text-xs text-zinc-400 italic block">지정된 CSS 규칙 없음 (기본값 사용)</span>
                    )}

                    {/* 1. text-align: select */}
                    <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-2 rounded-lg shadow-sm">
                      <span className="font-mono text-[12px] w-24 text-zinc-500">글자 정렬</span>
                      <select value={pRules['text-align'] || 'left'} disabled={isDefault}
                        onChange={(e) => updateCssRule('p', 'text-align', e.target.value)}
                        className="bg-transparent border-none outline-none text-[13px] text-blue-600 dark:text-blue-400 font-bold cursor-pointer text-right">
                        <option value="left">왼쪽 정렬</option>
                        <option value="center">가운데 정렬</option>
                        <option value="right">오른쪽 정렬</option>
                        <option value="justify">양끝 정렬</option>
                      </select>
                    </div>

                    {/* 2. margin-bottom: number + px */}
                    <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-2 rounded-lg shadow-sm">
                      <span className="font-mono text-[12px] w-24 text-zinc-500">하단 여백</span>
                      <div className="flex items-center gap-1 font-mono text-[13px] font-bold text-blue-600 dark:text-blue-400">
                        <input type="number" min="0" max="48"
                          value={parseInt(pRules['margin-bottom']) || 0} disabled={isDefault}
                          onChange={(e) => updateCssRule('p', 'margin-bottom', (parseInt(e.target.value) || 0) + 'px')}
                          className="w-12 text-center bg-transparent border-none outline-none font-mono text-[13px] text-blue-600 dark:text-blue-400 font-bold" />
                        <span className="text-[11px] text-zinc-400 font-normal">px</span>
                      </div>
                    </div>

                    {/* 3. text-indent: number + px */}
                    <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-2 rounded-lg shadow-sm">
                      <span className="font-mono text-[12px] w-24 text-zinc-500">첫줄 들여쓰기</span>
                      <div className="flex items-center gap-1 font-mono text-[13px] font-bold text-blue-600 dark:text-blue-400">
                        <input type="number" min="0" max="32"
                          value={parseInt(pRules['text-indent']) || 0} disabled={isDefault}
                          onChange={(e) => updateCssRule('p', 'text-indent', (parseInt(e.target.value) || 0) + 'px')}
                          className="w-12 text-center bg-transparent border-none outline-none font-mono text-[13px] text-blue-600 dark:text-blue-400 font-bold" />
                        <span className="text-[11px] text-zinc-400 font-normal">px</span>
                      </div>
                    </div>

                    {/* 4. line-height: number step 0.1 + 배수 */}
                    <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-2 rounded-lg shadow-sm">
                      <span className="font-mono text-[12px] w-24 text-zinc-500">줄 간격</span>
                      <div className="flex items-center gap-1 font-mono text-[13px] font-bold text-blue-600 dark:text-blue-400">
                        <input type="number" step="0.1" min="1.2" max="2.5"
                          value={parseFloat(pRules['line-height']) || 1.7} disabled={isDefault}
                          onChange={(e) => updateCssRule('p', 'line-height', (parseFloat(e.target.value) || 1.7).toString())}
                          className="w-12 text-center bg-transparent border-none outline-none font-mono text-[13px] text-blue-600 dark:text-blue-400 font-bold" />
                        <span className="text-[11px] text-zinc-400 font-normal">배수</span>
                      </div>
                    </div>

                    {/* 5. color: select */}
                    <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-2 rounded-lg shadow-sm">
                      <span className="font-mono text-[12px] w-24 text-zinc-500">글자 색상</span>
                      <select value={pRules['color'] || '#1b1b23'} disabled={isDefault}
                        onChange={(e) => updateCssRule('p', 'color', e.target.value)}
                        className="bg-transparent border-none outline-none text-[13px] text-blue-600 dark:text-blue-400 font-bold cursor-pointer text-right">
                        <option value="#1b1b23">소프트 블랙</option>
                        <option value="#2b2d35">미드나잇 차콜</option>
                        <option value="#3c342a">에디토리얼 브라운</option>
                      </select>
                    </div>

                    {/* 나머지 사용자 정의 속성 (5개 외) */}
                    {customPProps.map(([prop, val]) => (
                      <div key={prop} className="flex items-center gap-1.5">
                        <input value={prop} disabled={isDefault}
                          onChange={(e) => { const old = prop; const np = e.target.value; if (np && np !== old) { removeCssRule('p', old); updateCssRule('p', np, val); } }}
                          className="w-24 p-1 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 font-mono text-xs text-zinc-500" />
                        <span className="text-zinc-300">:</span>
                        <input value={val} disabled={isDefault}
                          onChange={(e) => updateCssRule('p', prop, e.target.value)}
                          className="flex-1 p-1 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 font-mono text-xs text-blue-600 dark:text-blue-400" />
                        {!isDefault && (
                          <button onClick={() => removeCssRule('p', prop)} className="text-zinc-300 hover:text-red-400 text-xs px-1">X</button>
                        )}
                      </div>
                    ))}
                    {!isDefault && (
                      <button onClick={() => { const k = prompt('추가할 CSS 속성명 (예: font-size):'); if (k) updateCssRule('p', k.trim(), ''); }}
                        className="text-xs text-blue-500 hover:text-blue-600 font-medium">+ 속성 추가</button>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* 🎨 우측 5열: STRONG / EM / U / DEL 인라인 서식 탭 압착 */}
            <div className="col-span-5 space-y-3">
              <div className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-lg">
                <span className="text-xs font-bold text-zinc-400 pl-2">인라인 요소 선택</span>
                <div className="inline-flex bg-zinc-200/60 dark:bg-zinc-700/60 p-0.5 rounded-md text-xs font-medium">
                  {(['strong', 'em', 'u', 'del'] as const).map((tab) => (
                    <button key={tab} onClick={() => setActiveInlineTab(tab)}
                      className={'px-3 py-1 rounded transition-all ' + (activeInlineTab === tab ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 font-bold shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700')}>
                      {tab === 'strong' ? 'STRONG' : tab === 'em' ? 'EM' : tab === 'u' ? 'U' : 'DEL'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-zinc-100 dark:bg-zinc-800/50 p-4 rounded-lg space-y-3 min-h-[160px] flex flex-col justify-between">
                {(() => {
                  const tag = activeInlineTab;
                  const tagRules = currentProfile.rules[tag] || {};
                  const showJsonKey = 'inline_json_' + tag;

                  /* 탭별 전용 제어기 정의 */
                  type ControlDef = { label: string; prop: string; widget: 'select' | 'spin'; options?: { label: string; value: string }[]; min?: number; max?: number; step?: number; unit?: string; def?: string };
                  const controls: ControlDef[] = (() => {
                    switch (tag) {
                      case 'strong': return [
                        { label: '글자 굵기', prop: 'font-weight', widget: 'select', options: [
                          { label: '굵게 (700)', value: '700' }, { label: '아주 굵게 (800)', value: '800' }, { label: '최대 굵게 (900)', value: '900' },
                        ], def: '700' },
                        { label: '글자 색상', prop: 'color', widget: 'select', options: [
                          { label: '사용 안 함', value: '' }, { label: '브랜드 블루', value: '#2563eb' }, { label: '파이어 브릭', value: '#b22222' },
                        ], def: '' },
                        { label: '배경색', prop: 'background-color', widget: 'select', options: [
                          { label: '사용 안 함', value: '' }, { label: '노랑 형광펜', value: '#fef08a' }, { label: '보라 형광펜', value: '#e9d5ff' },
                        ], def: '' },
                      ];
                      case 'em': return [
                        { label: '글자 스타일', prop: 'font-style', widget: 'select', options: [
                          { label: '이탤릭', value: 'italic' }, { label: '오블리크', value: 'oblique' },
                        ], def: 'italic' },
                        { label: '글자 색상', prop: 'color', widget: 'select', options: [
                          { label: '사용 안 함', value: '' }, { label: '차분한 차콜', value: '#374151' }, { label: '뮤트 그레이', value: '#6b7280' },
                        ], def: '' },
                      ];
                      case 'u': return [
                        { label: '줄 종류', prop: 'text-decoration-line', widget: 'select', options: [
                          { label: '밑줄', value: 'underline' },
                        ], def: 'underline' },
                        { label: '줄 색상', prop: 'text-decoration-color', widget: 'select', options: [
                          { label: '기본값', value: 'inherit' }, { label: '블루', value: '#3b82f6' }, { label: '오렌지', value: '#f97316' },
                        ], def: 'inherit' },
                        { label: '줄 모양', prop: 'text-decoration-style', widget: 'select', options: [
                          { label: '실선', value: 'solid' }, { label: '점선', value: 'dashed' }, { label: '물결', value: 'wavy' },
                        ], def: 'solid' },
                        { label: '밑줄 간격', prop: 'text-underline-offset', widget: 'spin', min: 0, max: 8, unit: 'px', def: '3px' },
                      ];
                      case 'del': return [
                        { label: '줄 종류', prop: 'text-decoration-line', widget: 'select', options: [
                          { label: '취소선', value: 'line-through' },
                        ], def: 'line-through' },
                        { label: '줄 색상', prop: 'text-decoration-color', widget: 'select', options: [
                          { label: '기본값', value: 'inherit' }, { label: '빨간색', value: '#ef4444' }, { label: '다크 레드', value: '#b91c1c' },
                        ], def: 'inherit' },
                        { label: '취소선 굵기', prop: 'text-decoration-thickness', widget: 'spin', min: 1, max: 5, unit: 'px', def: '2px' },
                        { label: '투명도', prop: 'opacity', widget: 'spin', min: 0, max: 100, unit: '%', def: '50' },
                      ];
                      default: return [];
                    }
                  })();
                  const knownProps = controls.map(c => c.prop);
                  const customProps = Object.entries(tagRules).filter(([k, v]) => v !== '' && !knownProps.includes(k));

                  /* 셀렉트 위젯 렌더 */
                  const renderSelect = (c: ControlDef) => {
                    const val = tagRules[c.prop] || c.def || '';
                    return (
                      <div key={c.prop} className="flex items-center justify-between bg-white dark:bg-zinc-900 p-2 rounded-lg shadow-sm">
                        <span className="font-mono text-[12px] w-28 text-zinc-500">{c.label}</span>
                        <select value={val} disabled={isDefault}
                          onChange={(e) => updateCssRule(tag, c.prop, e.target.value)}
                          className="bg-transparent border-none outline-none text-[13px] text-blue-600 dark:text-blue-400 font-bold cursor-pointer text-right">
                          {(c.options || []).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                    );
                  };

                  /* 스핀 위젯 렌더 */
                  const renderSpin = (c: ControlDef) => {
                    const currentVal = tagRules[c.prop] || c.def || '0';
                    const numVal = c.unit === '%' ? parseInt(currentVal) : parseFloat(currentVal);
                    return (
                      <div key={c.prop} className="flex items-center justify-between bg-white dark:bg-zinc-900 p-2 rounded-lg shadow-sm">
                        <span className="font-mono text-[12px] w-28 text-zinc-500">{c.label}</span>
                        <div className="flex items-center gap-1 font-mono text-[13px] font-bold text-blue-600 dark:text-blue-400">
                          <input type="number" min={c.min} max={c.max} step={c.step ?? 1}
                            value={numVal || 0} disabled={isDefault}
                            onChange={(e) => {
                              const raw = parseFloat(e.target.value) || 0;
                              const clamped = Math.min(Math.max(raw, c.min ?? 0), c.max ?? 100);
                              updateCssRule(tag, c.prop, c.unit === '%' ? clamped.toString() : clamped + (c.unit || ''));
                            }}
                            className="w-12 text-center bg-transparent border-none outline-none font-mono text-[13px] text-blue-600 dark:text-blue-400 font-bold" />
                          <span className="text-[11px] text-zinc-400 font-normal">{c.unit}</span>
                        </div>
                      </div>
                    );
                  };

                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700 pb-2">
                        <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">{tag.toUpperCase()} 서식 규칙</span>
                        <button onClick={() => setShowJson(prev => prev === showJsonKey ? null : showJsonKey)}
                          className="text-[10px] text-blue-500 hover:text-blue-600 font-bold">{showJson === showJsonKey ? '위젯 편집' : 'CSS 직접 편집'}</button>
                      </div>
                      {showJson === showJsonKey ? (
                        <textarea value={JSON.stringify(tagRules, null, 2)}
                          disabled={isDefault}
                          onChange={(e) => { try { const parsed = JSON.parse(e.target.value); Object.entries(parsed).forEach(([prop, val]) => updateCssRule(tag, prop, val as string)); } catch {} }}
                          className="w-full h-24 p-2 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-900 text-emerald-400 font-mono text-[11px] leading-relaxed" />
                      ) : (
                        <div className="space-y-1.5">
                          {controls.length === 0 && customProps.length === 0 && (
                            <span className="text-[10px] text-zinc-400 italic block">지정된 CSS 규칙 없음 (기본값 사용)</span>
                          )}
                          {controls.map(c => c.widget === 'select' ? renderSelect(c) : renderSpin(c))}
                           {customProps.map(([prop, val]) => (
                             <div key={prop} className="flex items-center gap-1.5">
                               <span className="font-mono text-xs w-24 shrink-0 break-all">{prop}</span>
                               <input value={val} disabled={isDefault}
                                 onChange={(e) => updateCssRule(tag, prop, e.target.value)}
                                 className="flex-1 p-1 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 font-mono text-xs text-blue-600 dark:text-blue-400" />
                               {!isDefault && (
                                 <button onClick={() => removeCssRule(tag, prop)} className="text-zinc-300 hover:text-red-400 text-xs px-1">X</button>
                               )}
                             </div>
                           ))}
                           {!isDefault && (
                             <button onClick={() => { const k = prompt('추가할 CSS 속성명 (예: color):'); if (k) updateCssRule(tag, k.trim(), ''); }}
                               className="text-xs text-blue-500 hover:text-blue-600 font-medium">+ 속성 추가</button>
                           )}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-blue-600 dark:text-blue-400 border-b border-zinc-200 dark:border-zinc-700 pb-1 uppercase tracking-wider text-[13px]">
            목록화 및 구조 제어
          </h4>
          <TagRuleEditor tag="ul" label="UL - 순서 없는 목록" rules={currentProfile.rules.ul || {}} isDefault={isDefault} onUpdateRule={updateCssRule} onRemoveRule={removeCssRule} />
          <TagRuleEditor tag="ol" label="OL - 순서 있는 목록" rules={currentProfile.rules.ol || {}} isDefault={isDefault} onUpdateRule={updateCssRule} onRemoveRule={removeCssRule} />
          <TagRuleEditor tag="taskList" label="TASKLIST - 체크리스트" rules={currentProfile.rules.taskList || {}} isDefault={isDefault} onUpdateRule={updateCssRule} onRemoveRule={removeCssRule} />
          <TagRuleEditor tag="hr" label="HR - 수평선" rules={currentProfile.rules.hr || {}} isDefault={isDefault} onUpdateRule={updateCssRule} onRemoveRule={removeCssRule} />
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-blue-600 dark:text-blue-400 border-b border-zinc-200 dark:border-zinc-700 pb-1 uppercase tracking-wider text-[13px]">
            복합 객체 정의
          </h4>
          <TagRuleEditor tag="table" label="TABLE - 표 전체" rules={currentProfile.rules.table || {}} isDefault={isDefault} onUpdateRule={updateCssRule} onRemoveRule={removeCssRule} />
          <TagRuleEditor tag="th" label="TH - 헤더 셀" rules={currentProfile.rules.th || {}} isDefault={isDefault} onUpdateRule={updateCssRule} onRemoveRule={removeCssRule} />
          <TagRuleEditor tag="td" label="TD - 데이터 셀" rules={currentProfile.rules.td || {}} isDefault={isDefault} onUpdateRule={updateCssRule} onRemoveRule={removeCssRule} />
          <TagRuleEditor tag="blockquote" label="BLOCKQUOTE - 인용 상자" rules={currentProfile.rules.blockquote || {}} isDefault={isDefault} onUpdateRule={updateCssRule} onRemoveRule={removeCssRule} />
          <TagRuleEditor tag="codeBlock" label="CODE BLOCK - 코드 블록" rules={currentProfile.rules.codeBlock || {}} isDefault={isDefault} onUpdateRule={updateCssRule} onRemoveRule={removeCssRule} />
          <TagRuleEditor tag="a" label="A - 링크" rules={currentProfile.rules.a || {}} isDefault={isDefault} onUpdateRule={updateCssRule} onRemoveRule={removeCssRule} />
          <TagRuleEditor tag="img" label="IMG - 이미지" rules={currentProfile.rules.img || {}} isDefault={isDefault} onUpdateRule={updateCssRule} onRemoveRule={removeCssRule} />
        </div>

      </div>
    </div>
  );
}
