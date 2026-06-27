"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Settings, Palette, Pen, Command, ShieldCheck } from 'lucide-react';
import { TOOLBAR_ITEMS, getDefaultHotkeys, getDefaultCommands } from '@/lib/toolbarConfig';


interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (v: boolean) => void;
  fontSize: number;
  setFontSize: (v: number) => void;
  wordWrap: 'on' | 'off';
  setWordWrap: (v: 'on' | 'off') => void;
  autoSave: boolean;
  setAutoSave: (v: boolean) => void;
  rootFolder: { name: string, handle?: any } | null;
  onSelectRootFolder: (type: 'local' | 'cloud' | 'browser', provider: string | null) => void;
  driveLetter: string;
  setDriveLetter: (v: string) => void;
  workspaceType: 'local' | 'cloud' | 'browser';
  setWorkspaceType: (v: 'local' | 'cloud' | 'browser') => void;
  cloudProvider: string | null;
  previewMode: 'edit' | 'both' | 'preview' | 'css-style';
  setPreviewMode: (v: 'edit' | 'both' | 'preview' | 'css-style') => void;
  customHotkeys: Record<string, string>;
  setCustomHotkeys: (v: Record<string, string>) => void;
  customSlashCommands: Record<string, string>;
  setCustomSlashCommands: (v: Record<string, string>) => void;
  licenseKey: string;
  setLicenseKey: (v: string) => void;
  themePalette: string;
  onThemeChange: (themeId: string) => void;
}

const SEVEN_THEMES = [
  { id: 'editorial', name: 'The Technical Editorial (기본)', monaco: 'onrivi-light', isDark: false },
  { id: 'gov', name: '정부 표준 서식 테마', monaco: 'github-light', isDark: false },
  { id: 'dark', name: '시크 다크 블랙', monaco: 'onrivi-dark', isDark: true },
  { id: 'terminal', name: '엔지니어 터미널', monaco: 'onrivi-dark', isDark: true },
  { id: 'slate', name: '고급 미디어 에디션', monaco: 'midnight-neon', isDark: true },
  { id: 'vellum', name: '디지털 매뉴스크립트', monaco: 'solarized-light', isDark: false },
  { id: 'office', name: '미니멀 오피스 (Pure White)', monaco: 'onrivi-light', isDark: false },
];

const THEME_CLASSES = SEVEN_THEMES.map(t => `theme-${t.id}`);

const MONACO_TO_USER_THEME: Record<string, string> = {
  'onrivi-light': 'editorial',
  'github-light': 'gov',
  'onrivi-dark': 'dark',
  'midnight-neon': 'slate',
  'solarized-light': 'vellum',
};

// ====================================================================
// 📊 [OMD-EDIT-SettingsModal-0006] SettingsModal ➔ SettingsModal
// 🎯 @KICK  : 환경 설정 모달 - 일반 설정, 정품 인증, 단축키/명령어 테이블, 테마 선택 제공
// 🛡️ @GUARD : isOpen/mounted false 시 null 반환
// 🚨 @PATCH : 없음
// 🔗 @CALLS : handleThemeSelect, handleSaveLicense, ThemeButton, ModeButton
// ====================================================================
export default function SettingsModal({
  isOpen, onClose, isDarkMode, setIsDarkMode,
  fontSize, setFontSize, wordWrap, setWordWrap,
  autoSave, setAutoSave,
  previewMode, setPreviewMode,
  customHotkeys, setCustomHotkeys,
  customSlashCommands, setCustomSlashCommands,
  licenseKey, setLicenseKey,
  themePalette,
  onThemeChange
}: SettingsModalProps) {
  const [mounted, setMounted] = useState(false);

  const [restoreSession, setRestoreSession] = useState(true);

  const initialTheme = (() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ONRIVI_SELECTED_THEME');
      if (stored && SEVEN_THEMES.some(t => t.id === stored)) return stored;
    }
    return MONACO_TO_USER_THEME[themePalette] || 'editorial';
  })();
  const [selectedTheme, setSelectedTheme] = useState(initialTheme);

// ====================================================================
// 📊 [OMD-EDIT-SettingsModal-0005] SettingsModal ➔ useEffect (mounted)
// 🎯 @KICK  : 마운트 시 마운트 상태 설정 및 세션 복원 설정 로드
// 🛡️ @GUARD : 없음
// 🚨 @PATCH : 없음
// 🔗 @CALLS : setMounted, setRestoreSession, localStorage.getItem
// ====================================================================
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const rs = localStorage.getItem('ONRIVI_RESTORE_SESSION');
      if (rs !== null) setRestoreSession(rs === 'true');
    }
  }, []);

  if (!isOpen) return null;
  if (!mounted) return null;

// ====================================================================
// 📊 [OMD-EDIT-SettingsModal-0004] SettingsModal ➔ handleThemeSelect
// 🎯 @KICK  : 테마 선택 시 DOM 클래스/로컬스토리지/다크모드/onThemeChange를 일괄 적용
// 🛡️ @GUARD : 테마 ID가 SEVEN_THEMES에 존재하는지 확인
// 🚨 @PATCH : 없음
// 🔗 @CALLS : setIsDarkMode, onThemeChange, localStorage.setItem
// ====================================================================
  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    const theme = SEVEN_THEMES.find(t => t.id === themeId);
    if (!theme) return;

    const root = document.documentElement;
    root.classList.remove(...THEME_CLASSES);
    root.classList.add(`theme-${themeId}`);
    localStorage.setItem('ONRIVI_SELECTED_THEME', themeId);

    setIsDarkMode(theme.isDark);
    onThemeChange(theme.monaco);
  };

// ====================================================================
// 📊 [OMD-EDIT-SettingsModal-0003] SettingsModal ➔ handleSaveLicense
// 🎯 @KICK  : 라이선스 키를 localStorage, chrome.storage, electronAPI에 동시 저장
// 🛡️ @GUARD : 각 storage API 존재 여부 확인 후 저장
// 🚨 @PATCH : 없음
// 🔗 @CALLS : setLicenseKey, localStorage.setItem, chrome.storage.local.set, api.saveLicense
// ====================================================================
  const handleSaveLicense = (key: string) => {
    setLicenseKey(key);
    if (typeof window !== 'undefined') {
      localStorage.setItem('onrivi_license_key', key);
      const chromeStorage = (window as any).chrome?.storage?.local;
      if (chromeStorage) {
        chromeStorage.set({ onrivi_license_key: key });
      }
      const api = (window as any).electronAPI;
      if (api && typeof api.saveLicense === 'function') {
        api.saveLicense(key);
      }
    }
  };

  const colors = isDarkMode ? {
    surface: '#1e1e1e',
    container: '#252526',
    onSurface: '#e5e5e5',
    onSurfaceVariant: '#c1c6d7',
    primary: '#adc6ff',
    border: '#333333',
  } : {
    surface: '#ffffff',
    container: '#f5f5f5',
    onSurface: '#1a1a1a',
    onSurfaceVariant: '#49454f',
    primary: '#0058bc',
    border: '#e0e0e0',
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl max-h-[780px] flex flex-col overflow-hidden rounded-xl shadow-2xl border animate-in zoom-in-95 duration-200"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        {/* 헤더 */}
        <div className="flex items-center gap-2 px-6 py-4 border-b shrink-0" style={{ borderColor: colors.border }}>
          <Settings size={16} style={{ color: colors.primary }} />
          <h2 className="text-sm font-bold" style={{ color: colors.onSurface }}>환경 설정</h2>
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <X size={18} style={{ color: colors.onSurface }} />
          </button>
        </div>

        {/* 본문 (스크롤) */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          {/* ---------- 일반 설정 ---------- */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold px-2" style={{ color: colors.primary }}>
              <Settings size={16} />
              <span>일반 설정</span>
            </div>
            <div className="pl-6 space-y-4">
              <label className="flex justify-between items-center text-sm font-medium cursor-pointer" style={{ color: colors.onSurface }}>
                <span>프로그램 시작 시 이전 문서 열기</span>
                <input
                  type="checkbox"
                  checked={restoreSession}
                  onChange={(e) => {
                    setRestoreSession(e.target.checked);
                    localStorage.setItem('ONRIVI_RESTORE_SESSION', String(e.target.checked));
                  }}
                  className="rounded"
                />
              </label>

              <div className="flex justify-between items-center text-sm font-medium" style={{ color: colors.onSurface }}>
                <span>글자 크기 (Font Size)</span>
                <div className="flex items-center gap-3">
                  <input
                    type="range" min="10" max="24" step="1"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-32 h-1.5 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    style={{ backgroundColor: colors.border }}
                  />
                  <span className="text-xs font-mono font-bold w-8" style={{ color: colors.primary }}>{fontSize}px</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm font-medium" style={{ color: colors.onSurface }}>
                <span>자동 줄 바꿈 (Word Wrap)</span>
                <div className="flex p-1 rounded-lg gap-1" style={{ backgroundColor: colors.container }}>
                  <ThemeButton active={wordWrap === 'on'} onClick={() => setWordWrap('on')} label="켜기" colors={colors} />
                  <ThemeButton active={wordWrap === 'off'} onClick={() => setWordWrap('off')} label="끄기" colors={colors} />
                </div>
              </div>

              <div className="flex justify-between items-center text-sm font-medium" style={{ color: colors.onSurface }}>
                <span>자동 저장 (Auto Save)</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={autoSave} onChange={(e) => setAutoSave(e.target.checked)} className="sr-only peer" />
                  <div className="w-9 h-5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all"
                    style={{
                      backgroundColor: autoSave ? '#3b82f6' : (isDarkMode ? '#525252' : '#d4d4d4'),
                      borderColor: colors.border
                    }}
                  ></div>
                </label>
              </div>

              <div className="flex justify-between items-center text-sm font-medium" style={{ color: colors.onSurface }}>
                <span>기본 시작 모드</span>
                <div className="flex gap-2">
                  <ModeButton active={previewMode === 'edit'} onClick={() => setPreviewMode('edit')} label="편집 전용" colors={colors} />
                  <ModeButton active={previewMode === 'both'} onClick={() => setPreviewMode('both')} label="분할 화면" colors={colors} />
                  <ModeButton active={previewMode === 'preview'} onClick={() => setPreviewMode('preview')} label="미리보기" colors={colors} />
                </div>
              </div>
            </div>
          </section>

          {/* ---------- 정품 인증 ---------- */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold px-2" style={{ color: colors.primary }}>
              <ShieldCheck size={16} />
              <span>정품 인증</span>
            </div>
            <div className="pl-6">
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => handleSaveLicense(e.target.value)}
                className="w-full max-w-md px-3 py-1.5 text-xs font-mono rounded outline-none border shadow-sm"
                style={{
                  backgroundColor: colors.container,
                  borderColor: colors.border,
                  color: colors.onSurface,
                  border: `1px solid ${colors.border}`
                }}
                placeholder="라이선스 키를 입력하세요"
              />
            </div>
          </section>

          {/* ---------- 단축키/명령어 ---------- */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 text-sm font-bold" style={{ color: colors.primary }}>
                <Command size={16} />
                <span>단축키/명령어</span>
              </div>
              <button
                onClick={() => {
                  const defaultHotkeys = getDefaultHotkeys();
                  const defaultCmds = getDefaultCommands();
                  setCustomHotkeys(defaultHotkeys);
                  setCustomSlashCommands(defaultCmds);
                  localStorage.setItem('customHotkeys', JSON.stringify(defaultHotkeys));
                  localStorage.setItem('customSlashCommands', JSON.stringify(defaultCmds));
                }}
                className="px-3 py-1 text-[11px] font-bold rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all border border-red-500/20"
              >
                기본값 초기화
              </button>
            </div>
            <div className="pl-6 overflow-x-auto rounded-lg border" style={{ borderColor: colors.border }}>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b" style={{ backgroundColor: colors.container, borderColor: colors.border, color: colors.onSurface }}>
                    <th className="px-4 py-3 text-xs font-bold w-12 text-center">아이콘</th>
                    <th className="px-4 py-3 text-xs font-bold w-28">이름</th>
                    <th className="px-4 py-3 text-xs font-bold">태그</th>
                    <th className="px-4 py-3 text-xs font-bold w-44 text-center">단축키</th>
                    <th className="px-4 py-3 text-xs font-bold w-44 text-center">명령어 (/)</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm" style={{ borderColor: colors.border, color: colors.onSurface }}>
                  {TOOLBAR_ITEMS.map((item) => (
                    <tr key={item.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="px-4 py-2 text-center text-base">{item.icon}</td>
                      <td className="px-4 py-2 text-xs whitespace-nowrap">{item.name}</td>
                      <td className="px-4 py-2 font-mono text-[11px] truncate max-w-[120px]">{item.tagFormat}</td>
                      <td className="px-4 py-2 text-center">
                        <input
                          type="text"
                          value={customHotkeys[item.id] !== undefined ? customHotkeys[item.id] : ''}
                          onChange={(e) => {
                            const newHotkeys = { ...customHotkeys, [item.id]: e.target.value };
                            setCustomHotkeys(newHotkeys);
                            localStorage.setItem('customHotkeys', JSON.stringify(newHotkeys));
                          }}
                          className="w-full px-2 py-1 text-xs font-mono text-center rounded outline-none transition-colors"
                          style={{
                            backgroundColor: colors.container,
                            border: `1px solid ${colors.border}`,
                            color: colors.onSurface
                          }}
                          placeholder="없음"
                        />
                      </td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-xs opacity-50">/</span>
                          <input
                            type="text"
                            value={customSlashCommands[item.id] !== undefined ? customSlashCommands[item.id] : ''}
                            onChange={(e) => {
                              const newCmds = { ...customSlashCommands, [item.id]: e.target.value };
                              setCustomSlashCommands(newCmds);
                              localStorage.setItem('customSlashCommands', JSON.stringify(newCmds));
                            }}
                            className="flex-1 px-2 py-1 text-xs font-mono rounded outline-none transition-colors"
                            style={{
                              backgroundColor: colors.container,
                              border: `1px solid ${colors.border}`,
                              color: colors.onSurface
                            }}
                            placeholder="명령어"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* 하단 확인 버튼 */}
        <div className="px-6 py-4 border-t flex justify-end shrink-0" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-lg hover:opacity-90 transition-all active:scale-95 shadow-lg"
            style={{ backgroundColor: colors.primary, color: isDarkMode ? '#002e69' : '#ffffff' }}
          >
            확인
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ====================================================================
// 📊 [OMD-EDIT-SettingsModal-0002] SettingsModal ➔ ThemeButton
// 🎯 @KICK  : 설정 창의 토글 버튼(켜기/끄기) 렌더링
// 🛡️ @GUARD : 없음
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
function ThemeButton({ active, onClick, label, colors }: { active: boolean; onClick: () => void; label: string; colors: any }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-[11px] rounded-md transition-all ${active ? 'shadow-sm font-bold' : 'opacity-50 hover:opacity-80'}`}
      style={{
        color: colors.onSurface
      }}
    >
      {label}
    </button>
  );
}

// ====================================================================
// 📊 [OMD-EDIT-SettingsModal-0001] SettingsModal ➔ ModeButton
// 🎯 @KICK  : 화면 보기 모드(편집/분할/미리보기) 전환 버튼 렌더링
// 🛡️ @GUARD : 없음
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
function ModeButton({ active, onClick, label, colors }: { active: boolean; onClick: () => void; label: string; colors: any }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-[11px] rounded border transition-all ${active ? 'font-bold' : 'opacity-60'}`}
      style={{
        borderColor: active ? colors.primary : colors.border,
        color: active ? colors.primary : colors.onSurface,
        backgroundColor: active ? `${colors.primary}15` : 'transparent'
      }}
    >
      {label}
    </button>
  );
}
