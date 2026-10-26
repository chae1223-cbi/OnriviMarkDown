// ====================================================================
// 📊 [OMD-STYLE-DETAIL-HEADING-0001] DetailHeadingPanel.tsx
// 🎯 @KICK  : 제목 위계(H1~H6) 정렬, 크기, 밑줄, 여백, 색상 세부 디자인 패널
// 🛡️ @GUARD : Rule 1(단일 주석 관리), Rule 3(컴포넌트 분리 원칙), Rule 6(LDSG & 고대비 가독성 보장)
// 🚨 @PATCH : **2026-10-26** — [제목 활자 크기 pt 단위 표준화]:
//             H1 기준 활자 크기 및 단계별 감소폭, 자동 계산 크기 단위를 pt로 전면 일원화
// ====================================================================

import React, { useState } from 'react';
import type { CssProfile } from '@/types/cssProfile';

type CssPageStyle = CssProfile['pageStyle'];
import {
  SectionCard, SliderWidget, ColorPickerWidget, getNumValue, parsePt,
  ALIGN_OPTIONS, STYLE_OPTIONS, BORDER_BOTTOM_OPTIONS,
  isAlignActive, isStyleOptionActive, isBorderMatch
} from './DetailWidgets';

interface DetailHeadingPanelProps {
  currentProfile: CssProfile;
  isSystemProfile: boolean;
  currentOutlineSummary: string;
  activeHeadingTab?: number;
  onSelectHeadingTab?: (level: number) => void;
  onUpdateProfile: (profile: CssProfile) => void;
  triggerUpdate: (profile: CssProfile, tag?: string, label?: string) => void;
  handlePageStyleChange: (propOrChanges: keyof CssPageStyle | Partial<CssPageStyle>, val?: any) => void;
  updateCssRule: (tag: string, prop: string, val: string) => void;
  onSwitchToQuickMode: () => void;
}

export default function DetailHeadingPanel({
  currentProfile,
  isSystemProfile,
  currentOutlineSummary,
  activeHeadingTab: externalHeadingTab,
  onSelectHeadingTab,
  onUpdateProfile,
  handlePageStyleChange,
  updateCssRule,
  onSwitchToQuickMode,
}: DetailHeadingPanelProps) {
  const [internalHeadingTab, setInternalHeadingTab] = useState(2);
  const activeLevel = externalHeadingTab || internalHeadingTab;

  const handleHeadingTabChange = (level: number) => {
    setInternalHeadingTab(level);
    onSelectHeadingTab?.(level);
  };

  const h1Rules = currentProfile.rules.h1 || {};

  const handleBorderBottomClick = (tag: string, targetValue: string, currentVal: string | undefined, tagColor?: string) => {
    if (targetValue === '') {
      updateCssRule(tag, 'border-bottom', 'none');
      return;
    }
    const colorMatch = currentVal?.match(/(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))/);
    const colorToUse = colorMatch ? colorMatch[1] : (tagColor || '#e5e5e5');
    updateCssRule(tag, 'border-bottom', `${targetValue} ${colorToUse}`.trim());
  };

  return (
    <div className="space-y-4">
      {/* 💡 제목 번호 체계 간편 모드 위임 안내 배너 */}
      <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 rounded-xl text-xs space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
            <span>⚡ 제목 개요 번호 체계 (1., Ⅰ., 가., 제1장 등)</span>
          </span>
          <button
            type="button"
            onClick={onSwitchToQuickMode}
            className="font-bold text-[#1d4ed8] dark:text-blue-400 hover:underline cursor-pointer"
          >
            ⚡ 간편 모드에서 변경 ➔
          </button>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
          제목 앞머리/뒷머리 번호 매김 및 사용자 정의 서식은 <span className="font-bold text-zinc-800 dark:text-zinc-200">[간편 스타일링]</span>에서 일괄 관리됩니다. 세부 서식 다듬기에서는 각 제목의 1px 단위 디자인(밑줄, 정렬, 글자크기, 여백)을 정밀 조정합니다.
        </p>
        <div className="pt-1 text-[11px] font-mono text-zinc-700 dark:text-zinc-300">
          <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            현재 개요: <strong>{currentOutlineSummary}</strong>
          </span>
        </div>
      </div>

      {/* 1. H1 마스터 설정 */}
      <SectionCard
        title="H1 대제목 마스터 설정"
        badge="최상위 제목"
        description="문서의 메인 타이틀(H1) 기준 서식 및 단계별 크기 감소 규칙을 정합니다."
      >
        {/* H1 정렬 */}
        <div className="bg-zinc-50 dark:bg-zinc-900/40 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-650 dark:text-zinc-350">H1 글자 정렬</span>
          <div className="flex gap-1.5">
            {ALIGN_OPTIONS.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                disabled={isSystemProfile}
                onClick={() => updateCssRule('h1', 'text-align', value)}
                className={`px-3 py-1 rounded text-xs font-semibold border transition-all cursor-pointer ${
                  isAlignActive(h1Rules['text-align'], value)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-bold'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-800'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* H1 글자 크기 & 단계별 감소폭 */}
        <div className="grid grid-cols-2 gap-2.5">
          <SliderWidget
            label="H1 기준 활자 크기"
            min={12}
            max={36}
            step={0.5}
            value={parsePt(h1Rules['font-size'], 21)}
            unit="pt"
            disabled={isSystemProfile}
            onChange={(v) => updateCssRule('h1', 'font-size', v + 'pt')}
          />
          <SliderWidget
            label="단계별 크기 감소폭"
            min={0}
            max={6}
            step={0.5}
            value={parsePt(currentProfile.pageStyle.headingSizeOffset, 3)}
            unit="pt"
            disabled={isSystemProfile}
            onChange={(v) => handlePageStyleChange('headingSizeOffset', v + 'pt')}
          />
        </div>

        {/* 서식 효과 버튼 */}
        <div className="bg-zinc-50 dark:bg-zinc-900/40 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-650 dark:text-zinc-350">글자 효과</span>
          <div className="flex gap-1.5">
            {STYLE_OPTIONS.map(({ label, property, onVal, offVal }) => {
              const isActive = isStyleOptionActive(h1Rules, property, onVal);
              return (
                <button
                  key={property}
                  type="button"
                  disabled={isSystemProfile}
                  onClick={() => updateCssRule('h1', property, isActive ? offVal : onVal)}
                  className={`px-3 py-1 rounded text-xs font-semibold border transition-all cursor-pointer ${
                    isActive
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-bold'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-800'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* H1 하단 밑줄 테두리 */}
        <div className="bg-zinc-50 dark:bg-zinc-900/40 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-650 dark:text-zinc-350">하단 밑줄</span>
          <div className="flex gap-1.5">
            {BORDER_BOTTOM_OPTIONS.map(({ label, value }) => (
              <button
                key={label}
                type="button"
                disabled={isSystemProfile}
                onClick={() => handleBorderBottomClick('h1', value, h1Rules['border-bottom'], h1Rules['color'])}
                className={`px-3 py-1 rounded text-xs font-semibold border transition-all cursor-pointer ${
                  isBorderMatch(h1Rules['border-bottom'], value)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-bold'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-800'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 상/하/왼쪽 여백 & 자간 */}
        <div className="grid grid-cols-2 gap-2.5">
          <SliderWidget
            label="H1 위 여백"
            min={0}
            max={80}
            value={getNumValue(h1Rules['margin-top'], 24)}
            unit="px"
            disabled={isSystemProfile}
            onChange={(v) => updateCssRule('h1', 'margin-top', v + 'px')}
          />
          <SliderWidget
            label="H1 아래 여백"
            min={0}
            max={80}
            value={getNumValue(h1Rules['margin-bottom'], 16)}
            unit="px"
            disabled={isSystemProfile}
            onChange={(v) => updateCssRule('h1', 'margin-bottom', v + 'px')}
          />
        </div>

        <SliderWidget
          label="H1 왼쪽 들여쓰기 여백"
          min={0}
          max={60}
          value={getNumValue(h1Rules['padding-left'], 0)}
          unit="px"
          disabled={isSystemProfile}
          onChange={(v) => updateCssRule('h1', 'padding-left', v + 'px')}
        />

        <ColorPickerWidget
          label="H1 글자 색상"
          value={h1Rules['color'] || ''}
          disabled={isSystemProfile}
          onChange={(v) => updateCssRule('h1', 'color', v)}
        />
      </SectionCard>

      {/* 2. H2~H6 세부 위계 설정 */}
      <SectionCard
        title={`H${activeLevel} 하위 제목 개별 서식`}
        description="장, 절, 소제목 등 각 위계 레벨별로 크기, 밑줄, 여백을 독립 설정합니다."
      >
        {/* 위계 선택 탭 바 */}
        <div className="flex items-center justify-between p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 pl-2">세부 H 위계</span>
          <div className="flex gap-1">
            {[2, 3, 4, 5, 6].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => handleHeadingTabChange(level)}
                className={`px-3 py-1.5 rounded-md text-xs font-extrabold transition-all cursor-pointer ${
                  activeLevel === level
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                H{level}
              </button>
            ))}
          </div>
        </div>

        {/* 활성 H 레벨 설정 */}
        {(() => {
          const tag = 'h' + activeLevel;
          const tagRules = currentProfile.rules[tag as keyof typeof currentProfile.rules] || {};
          const offset = parsePt(currentProfile.pageStyle.headingSizeOffset, 3);
          const h1Size = parsePt(h1Rules['font-size'], 21);
          const calculatedSize = Math.max(8, Math.round((h1Size - (activeLevel - 1) * offset) * 10) / 10);

          return (
            <div className="space-y-3.5 pt-1">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">자동 계산된 활자 크기</span>
                <span className="font-mono text-sm text-blue-600 dark:text-blue-400 font-bold">
                  {calculatedSize}pt
                </span>
              </div>

              {/* 서식 효과 */}
              <div className="bg-zinc-50 dark:bg-zinc-900/40 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-650 dark:text-zinc-350">글자 효과</span>
                <div className="flex gap-1.5">
                  {STYLE_OPTIONS.map(({ label, property, onVal, offVal }) => {
                    const isActive = isStyleOptionActive(tagRules, property, onVal);
                    return (
                      <button
                        key={property}
                        type="button"
                        disabled={isSystemProfile}
                        onClick={() => updateCssRule(tag, property, isActive ? offVal : onVal)}
                        className={`px-3 py-1 rounded text-xs font-semibold border transition-all cursor-pointer ${
                          isActive
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-bold'
                            : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-800'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 하단 밑줄 */}
              <div className="bg-zinc-50 dark:bg-zinc-900/40 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-650 dark:text-zinc-350">하단 밑줄</span>
                <div className="flex gap-1.5">
                  {BORDER_BOTTOM_OPTIONS.map(({ label, value }) => (
                    <button
                      key={label}
                      type="button"
                      disabled={isSystemProfile}
                      onClick={() => handleBorderBottomClick(tag, value, tagRules['border-bottom'], tagRules['color'])}
                      className={`px-3 py-1 rounded text-xs font-semibold border transition-all cursor-pointer ${
                        isBorderMatch(tagRules['border-bottom'], value)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-bold'
                          : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-800'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 여백 조절 */}
              <div className="grid grid-cols-2 gap-2.5">
                <SliderWidget
                  label="위 여백"
                  min={0}
                  max={80}
                  value={getNumValue(tagRules['margin-top'], 16)}
                  unit="px"
                  disabled={isSystemProfile}
                  onChange={(v) => updateCssRule(tag, 'margin-top', v + 'px')}
                />
                <SliderWidget
                  label="아래 여백"
                  min={0}
                  max={80}
                  value={getNumValue(tagRules['margin-bottom'], 8)}
                  unit="px"
                  disabled={isSystemProfile}
                  onChange={(v) => updateCssRule(tag, 'margin-bottom', v + 'px')}
                />
              </div>

              <SliderWidget
                label="왼쪽 들여쓰기 여백"
                min={0}
                max={60}
                value={getNumValue(tagRules['padding-left'], 0)}
                unit="px"
                disabled={isSystemProfile}
                onChange={(v) => updateCssRule(tag, 'padding-left', v + 'px')}
              />

              <ColorPickerWidget
                label={`H${activeLevel} 글자 색상`}
                value={tagRules['color'] || ''}
                disabled={isSystemProfile}
                onChange={(v) => updateCssRule(tag, 'color', v)}
              />
            </div>
          );
        })()}
      </SectionCard>
    </div>
  );
}
