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

import React, { useState, useEffect, useMemo } from 'react';
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

  /* ─── 폰트 검색 피커 상태 ─── */
  const [systemFonts, setSystemFonts] = useState<string[]>([]);
  const [fontSearch, setFontSearch] = useState('');
  const [isFontListOpen, setIsFontListOpen] = useState(false);

  /* 마운트 시 시스템 폰트 목록 로드 (queryLocalFonts API 우선) */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('queryLocalFonts' in window) {
        (async () => {
          try {
            const availableFonts = await (window as any).queryLocalFonts();
            const fontNames = Array.from(new Set(availableFonts.map((f: any) => f.family))) as string[];
            setSystemFonts(fontNames.sort());
          } catch {
            setSystemFonts(['맑은 고딕', '바탕', '궁서', '돋움', '굴림', '휴먼명조', 'Segoe UI', 'Arial']);
          }
        })();
      } else {
        setSystemFonts(['맑은 고딕', '바탕', '궁서', '돋움', '굴림', '휴먼명조', 'Segoe UI', 'Arial']);
      }
    }
  }, []);

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

  /** 전역 타이포그래피(fontFamily/fontSize/lineHeight/letterSpacing) 변경 */
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
  const filteredFonts = useMemo(
    () => systemFonts.filter(f => f.toLowerCase().includes(fontSearch.toLowerCase())),
    [systemFonts, fontSearch]
  );

  /* H1 위젯 버튼 옵션 */
  const h1Rules = currentProfile.rules.h1 || {};

  const alignOptions = [
    { label: '왼쪽', value: 'left' },
    { label: '중앙', value: 'center' },
    { label: '오른쪽', value: 'right' },
    { label: '양끝', value: 'justify' },
  ] as const;

  const weightOptions = [
    { label: '보통', value: 'normal' },
    { label: '굵게', value: 'bold' },
  ] as const;

  const borderOptions = [
    { label: '선 없음', value: '' },
    { label: '일반 실선', value: '1px solid #18181b' },
    { label: '관보선(2px)', value: '2px solid #09090b' },
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
          <span className="font-bold text-zinc-700 dark:text-zinc-300">🏛️ 관보 서식 규격 지정</span>
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
          <label className="block text-zinc-400 mb-1">프로필 이름</label>
          <input type="text" value={currentProfile.name} onChange={(e) => handleNameChange(e.target.value)} className="w-full p-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-medium text-[12px] text-zinc-700 dark:text-zinc-300" />
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">

        <div className="bg-white dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm space-y-3">
          <h4 className="font-bold text-blue-600 dark:text-blue-400 border-b border-zinc-100 dark:border-zinc-900 pb-1.5 uppercase tracking-wider text-[11px]">
            가상 A4 용지 전역 타이포그래피
          </h4>
          <div className="relative">
            <label className="block text-zinc-400 mb-1">인쇄 대표 서체</label>
            <div className="flex gap-1">
              <input
                type="text"
                value={isFontListOpen ? fontSearch : currentProfile.pageStyle.fontFamily}
                onChange={(e) => { setFontSearch(e.target.value); setIsFontListOpen(true); }}
                onFocus={() => { setFontSearch(''); setIsFontListOpen(true); }}
                placeholder="시스템 글꼴 검색..."
                className="w-full p-2 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-900 font-mono text-blue-600 dark:text-blue-400 font-bold text-[11px]"
                disabled={isDefault}
              />
              {isFontListOpen && (
                <button type="button" onClick={() => setIsFontListOpen(false)} className="px-2 border border-zinc-300 dark:border-zinc-700 rounded bg-zinc-100 dark:bg-zinc-800 text-[11px]">
                  닫기
                </button>
              )}
            </div>
            {isFontListOpen && !isDefault && (
              <div className="absolute left-0 right-0 mt-1 max-h-40 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded shadow-xl overflow-y-auto z-50 divide-y divide-zinc-100 dark:divide-zinc-900">
                {filteredFonts.map(font => (
                  <button
                    key={font}
                    type="button"
                    onClick={() => { handlePageStyleChange('fontFamily', '"' + font + '", serif'); setIsFontListOpen(false); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-zinc-700 dark:text-zinc-300 transition-colors flex justify-between text-[11px]"
                    style={{ fontFamily: font }}
                  >
                    <span>{font}</span>
                    <span className="text-[10px] text-zinc-400">선택</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-zinc-400 mb-1">기본 크기</label>
              <input type="text" value={currentProfile.pageStyle.fontSize} onChange={(e) => handlePageStyleChange('fontSize', e.target.value)} className="w-full p-1.5 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-900 font-mono text-center text-[11px]" disabled={isDefault} placeholder="15px" />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">줄 간격</label>
              <input type="text" value={currentProfile.pageStyle.lineHeight} onChange={(e) => handlePageStyleChange('lineHeight', e.target.value)} className="w-full p-1.5 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-900 font-mono text-center text-[11px]" disabled={isDefault} placeholder="1.8" />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">자간</label>
              <input type="text" value={currentProfile.pageStyle.letterSpacing} onChange={(e) => handlePageStyleChange('letterSpacing', e.target.value)} className="w-full p-1.5 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-900 font-mono text-center text-[11px]" disabled={isDefault} placeholder="-0.02em" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-2">
            <span className="font-bold text-zinc-800 dark:text-zinc-200 text-[11px] flex items-center gap-1.5">
              H1 대제목 서식 정의 (Rule-base)
            </span>
          </div>
          <div className="space-y-4">
            <div>
              <span className="text-zinc-400 block mb-1.5 font-medium text-[11px]">정렬 (text-align)</span>
              <div className="flex rounded-md border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-50 dark:bg-zinc-900 w-2/3">
                {alignOptions.map(({ label, value }) => (
                  <button
                    key={value}
                    type="button"
                    disabled={isDefault}
                    onClick={() => updateCssRule('h1', 'text-align', value)}
                    className={'flex-1 py-1 rounded font-medium text-[11px] transition-all ' + (h1Rules['text-align'] === value ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-bold shadow-sm' : 'text-zinc-400 hover:text-zinc-600')}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-zinc-400 block mb-1.5 font-medium text-[11px]">굵기 (font-weight)</span>
              <div className="flex rounded-md border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-50 dark:bg-zinc-900 w-1/2">
                {weightOptions.map(({ label, value }) => (
                  <button
                    key={value}
                    type="button"
                    disabled={isDefault}
                    onClick={() => updateCssRule('h1', 'font-weight', value)}
                    className={'flex-1 py-1 rounded font-medium text-[11px] ' + (h1Rules['font-weight'] === value ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-bold shadow-sm' : 'text-zinc-400')}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-zinc-400 block mb-1.5 font-medium text-[11px]">하단 테두리 (border-bottom)</span>
              <div className="flex gap-1.5">
                {borderOptions.map(({ label, value }) => (
                  <button
                    key={label}
                    type="button"
                    disabled={isDefault}
                    onClick={() => {
                      updateCssRule('h1', 'border-bottom', value);
                      updateCssRule('h1', 'padding-bottom', value ? '6px' : '0px');
                    }}
                    className={'px-3 py-1 border rounded text-[10.5px] font-medium transition-all ' + (h1Rules['border-bottom'] === value ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-bold' : 'border-zinc-200 dark:border-zinc-800 text-zinc-500')}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-zinc-400 block mb-1.5 font-medium text-[11px]">위아래 여백 (margin-top/bottom)</span>
              <div className="flex gap-1.5">
                {marginOptions.map(({ label, top, bot }) => (
                  <button
                    key={label}
                    type="button"
                    disabled={isDefault}
                    onClick={() => {
                      updateCssRule('h1', 'margin-top', top);
                      updateCssRule('h1', 'margin-bottom', bot);
                    }}
                    className={'px-3 py-1 border rounded text-[10.5px] font-medium ' + (h1Rules['margin-top'] === top ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-bold' : 'border-zinc-200 dark:border-zinc-800 text-zinc-500')}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-blue-600 dark:text-blue-400 border-b border-zinc-200 dark:border-zinc-700 pb-1 uppercase tracking-wider text-[11px]">
            제목 요소
          </h4>
          <TagRuleEditor tag="h1" label="H1 - 보도자료 대제목" rules={currentProfile.rules.h1 || {}} isDefault={isDefault} onUpdateRule={updateCssRule} onRemoveRule={removeCssRule} />
          <TagRuleEditor tag="h2" label="H2 - 대분류/정책 과제 서두" rules={currentProfile.rules.h2 || {}} isDefault={isDefault} onUpdateRule={updateCssRule} onRemoveRule={removeCssRule} />
          <TagRuleEditor tag="h3" label="H3 - 중분류 항목" rules={currentProfile.rules.h3 || {}} isDefault={isDefault} onUpdateRule={updateCssRule} onRemoveRule={removeCssRule} />
          <TagRuleEditor tag="h4" label="H4 - 소분류 항목" rules={currentProfile.rules.h4 || {}} isDefault={isDefault} onUpdateRule={updateCssRule} onRemoveRule={removeCssRule} />
          <TagRuleEditor tag="h5" label="H5 - 각주형 제목" rules={currentProfile.rules.h5 || {}} isDefault={isDefault} onUpdateRule={updateCssRule} onRemoveRule={removeCssRule} />
          <TagRuleEditor tag="h6" label="H6 - 최소 제목" rules={currentProfile.rules.h6 || {}} isDefault={isDefault} onUpdateRule={updateCssRule} onRemoveRule={removeCssRule} />
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-blue-600 dark:text-blue-400 border-b border-zinc-200 dark:border-zinc-700 pb-1 uppercase tracking-wider text-[11px]">
            본문 및 인라인 서식
          </h4>
          <TagRuleEditor tag="p" label="P - 기본 본문 문단" rules={currentProfile.rules.p || {}} isDefault={isDefault} onUpdateRule={updateCssRule} onRemoveRule={removeCssRule} />
          <TagRuleEditor tag="strong" label="STRONG - 굵게" rules={currentProfile.rules.strong || {}} isDefault={isDefault} onUpdateRule={updateCssRule} onRemoveRule={removeCssRule} />
          <TagRuleEditor tag="em" label="EM - 기울임" rules={currentProfile.rules.em || {}} isDefault={isDefault} onUpdateRule={updateCssRule} onRemoveRule={removeCssRule} />
          <TagRuleEditor tag="del" label="DEL - 취소선" rules={currentProfile.rules.del || {}} isDefault={isDefault} onUpdateRule={updateCssRule} onRemoveRule={removeCssRule} />
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-blue-600 dark:text-blue-400 border-b border-zinc-200 dark:border-zinc-700 pb-1 uppercase tracking-wider text-[11px]">
            목록화 및 구조 제어
          </h4>
          <TagRuleEditor tag="ul" label="UL - 순서 없는 목록" rules={currentProfile.rules.ul || {}} isDefault={isDefault} onUpdateRule={updateCssRule} onRemoveRule={removeCssRule} />
          <TagRuleEditor tag="ol" label="OL - 순서 있는 목록" rules={currentProfile.rules.ol || {}} isDefault={isDefault} onUpdateRule={updateCssRule} onRemoveRule={removeCssRule} />
          <TagRuleEditor tag="taskList" label="TASKLIST - 체크리스트" rules={currentProfile.rules.taskList || {}} isDefault={isDefault} onUpdateRule={updateCssRule} onRemoveRule={removeCssRule} />
          <TagRuleEditor tag="hr" label="HR - 수평선" rules={currentProfile.rules.hr || {}} isDefault={isDefault} onUpdateRule={updateCssRule} onRemoveRule={removeCssRule} />
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-blue-600 dark:text-blue-400 border-b border-zinc-200 dark:border-zinc-700 pb-1 uppercase tracking-wider text-[11px]">
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
