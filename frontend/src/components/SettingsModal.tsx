"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Settings, Palette, Pen, Command, ShieldCheck, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { TOOLBAR_ITEMS, getDefaultHotkeys, getDefaultCommands } from '@/lib/toolbarConfig';
import { testGeminiConnection } from '@/lib/gemini';


interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (v: boolean) => void;
  fontSize: number;
  setFontSize: (v: number) => void;
  wordWrap: 'on' | 'off';
  setWordWrap: (v: 'on' | 'off') => void;
  autoSave: number;
  setAutoSave: (v: number) => void;
  autoClosingBrackets: boolean;
  setAutoClosingBrackets: (v: boolean) => void;
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
  isActivated: boolean;
  geminiApiKey: string;
  setGeminiApiKey: (v: string) => void;
  aiModelName: string;
  setAiModelName: (v: string) => void;
}

const THEMES = [
  { id: 'editorial', name: 'The Technical Editorial (기본)', monaco: 'onrivi-light', isDark: false },
  { id: 'dark', name: 'GitHub Dark Dimmed', monaco: 'github-dark-dimmed', isDark: true },
  { id: 'slate', name: 'Solarized Dark', monaco: 'solarized-dark', isDark: true },
];

const THEME_CLASSES = THEMES.map(t => `theme-${t.id}`);

const MONACO_TO_USER_THEME: Record<string, string> = {
  'onrivi-light': 'editorial',
  'github-dark-dimmed': 'dark',
  'solarized-dark': 'slate',
  // backward compatibility with legacy saved settings
  'onrivi-dark': 'dark',
  'midnight-neon': 'slate',
  'github-light': 'editorial',
  'solarized-light': 'editorial',
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
  onThemeChange,
  isActivated,
  autoClosingBrackets, setAutoClosingBrackets,
  geminiApiKey, setGeminiApiKey,
  aiModelName, setAiModelName
}: SettingsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [restoreSession, setRestoreSession] = useState(true);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  const handleTestGemini = async () => {
    if (!geminiApiKey) {
      setTestResult({ success: false, msg: 'API 키를 먼저 입력해주세요.' });
      return;
    }
    setIsTestingKey(true);
    setTestResult(null);
    try {
      const isOk = await testGeminiConnection(geminiApiKey, aiModelName);
      if (isOk) {
        setTestResult({ success: true, msg: '연동 테스트 성공! API 키 및 모델이 유효합니다.' });
      } else {
        setTestResult({ success: false, msg: '응답이 올바르지 않습니다.' });
      }
    } catch (err: any) {
      setTestResult({ success: false, msg: err.message || '연동 실패' });
    } finally {
      setIsTestingKey(false);
    }
  };

  const initialTheme = (() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ONRIVI_SELECTED_THEME');
      if (stored && THEMES.some(t => t.id === stored)) return stored;
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
// 🛡️ @GUARD : 테마 ID가 THEMES에 존재하는지 확인
// 🚨 @PATCH : 없음
// 🔗 @CALLS : setIsDarkMode, onThemeChange, localStorage.setItem
// ====================================================================
  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    const theme = THEMES.find(t => t.id === themeId);
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
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-200" style={{ overflowY: "auto" }}>
      <div
        className="relative w-full max-w-3xl flex flex-col rounded-xl shadow-2xl border animate-in zoom-in-95 duration-200"
        style={{ maxHeight: "90dvh", backgroundColor: colors.surface, borderColor: colors.border }}
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
        <div className="flex-1 overflow-y-auto min-h-0 px-6 py-6 space-y-8">
          {/* ---------- 일반 설정 ---------- */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold px-2" style={{ color: colors.primary }}>
              <Settings size={16} />
              <span>일반 설정</span>
            </div>
            <div className="pl-6 space-y-4">
              <div className="flex justify-between items-center text-sm font-medium" style={{ color: colors.onSurface }}>
                <span>자동 줄 바꿈 (Word Wrap)</span>
                <div className="flex p-1 rounded-lg gap-1" style={{ backgroundColor: colors.container }}>
                  <ThemeButton active={wordWrap === 'on'} onClick={() => setWordWrap('on')} label="켜기" colors={colors} />
                  <ThemeButton active={wordWrap === 'off'} onClick={() => setWordWrap('off')} label="끄기" colors={colors} />
                </div>
              </div>

              <div className="flex justify-between items-center text-sm font-medium" style={{ color: colors.onSurface }}>
                <span>괄호 자동 완성 (Auto Closing Brackets)</span>
                <div className="flex p-1 rounded-lg gap-1" style={{ backgroundColor: colors.container }}>
                  <ThemeButton active={autoClosingBrackets === true} onClick={() => setAutoClosingBrackets(true)} label="켜기" colors={colors} />
                  <ThemeButton active={autoClosingBrackets === false} onClick={() => setAutoClosingBrackets(false)} label="끄기" colors={colors} />
                </div>
              </div>

              <div className="flex justify-between items-center text-sm font-medium" style={{ color: colors.onSurface }}>
                <span className="flex items-center gap-2">
                  자동 저장 (Auto Save)
                </span>
                <select
                  value={autoSave}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setAutoSave(val);
                  }}
                  className="px-3 py-1.5 rounded text-xs outline-none cursor-pointer"
                  style={{
                    backgroundColor: colors.container,
                    color: colors.onSurface,
                    border: `1px solid ${colors.border}`
                  }}
                >
                  <option value={0}>사용 안함</option>
                  <option value={5}>5초</option>
                  <option value={10}>10초</option>
                  <option value={30}>30초</option>
                  <option value={60}>1분</option>
                </select>
              </div>
              
              <div className="flex flex-col gap-2 pt-2">
                <span className="text-sm font-medium" style={{ color: colors.onSurface }}>Google Gemma API Key (AI 어시스턴트용)</span>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="AI 통신을 위한 구글 API 키를 입력하세요"
                    value={geminiApiKey || ''}
                    onChange={(e) => {
                      setGeminiApiKey(e.target.value);
                      if (testResult) setTestResult(null);
                    }}
                    onCopy={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    onContextMenu={(e) => e.preventDefault()}
                    className="px-3 py-2 rounded text-sm outline-none flex-1 font-mono"
                    style={{
                      backgroundColor: colors.container,
                      color: colors.onSurface,
                      border: `1px solid ${colors.border}`
                    }}
                  />
                  <button
                    onClick={handleTestGemini}
                    disabled={isTestingKey || !geminiApiKey}
                    className="px-4 py-2 text-xs font-bold rounded flex items-center gap-2 whitespace-nowrap transition-colors disabled:opacity-50"
                    style={{
                      backgroundColor: colors.primary,
                      color: '#ffffff'
                    }}
                  >
                    {isTestingKey ? <Loader2 size={14} className="animate-spin" /> : '연동 테스트'}
                  </button>
                </div>
                {testResult && (
                  <div className={`text-[11px] font-bold flex items-center gap-1.5 ${testResult.success ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {testResult.success ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                    {testResult.msg}
                  </div>
                )}
                <div className="flex flex-col gap-2 pt-2 text-sm font-medium" style={{ color: colors.onSurface }}>
                  <span>AI 모델 식별자 (Model Name)</span>
                  <input
                    type="text"
                    placeholder="예) gemini-3.5-flash, gemma-4-9b-it"
                    value={aiModelName || ''}
                    onChange={(e) => {
                      setAiModelName(e.target.value);
                      if (testResult) setTestResult(null);
                    }}
                    className="px-3 py-2 rounded text-xs outline-none w-full"
                    style={{
                      backgroundColor: colors.container,
                      color: colors.onSurface,
                      border: `1px solid ${colors.border}`
                    }}
                  />
                  <span className="text-[11px] opacity-70">원하시는 모델의 공식 API 식별자를 입력하세요. (기본: gemini-3.5-flash)</span>
                  
                  {/* 추천 모델 빠른 선택 칩 */}
                  <div className="flex flex-wrap gap-2 mt-1">
                    {[
                      { id: 'gemini-3.5-flash', label: 'Gemini 3.5 (추천/고속)' },
                      { id: 'gemini-pro', label: 'Gemini Pro (안정판)' },
                      { id: 'gemma-4-26b-a4b-it', label: 'Gemma 4 (최신 오픈모델)' },
                      { id: 'gemma-2-9b-it', label: 'Gemma 2 (가벼움)' },
                    ].map(model => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setAiModelName(model.id);
                          if (testResult) setTestResult(null);
                        }}
                        className="px-2 py-1 text-[10px] rounded-full border hover:opacity-80 transition-opacity"
                        style={{
                          backgroundColor: aiModelName === model.id ? colors.primary : 'transparent',
                          color: aiModelName === model.id ? '#ffffff' : colors.onSurface,
                          borderColor: aiModelName === model.id ? colors.primary : colors.border
                        }}
                      >
                        {model.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
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
                          onKeyDown={(e) => {
                            // 단축키 입력 레코딩 처리
                            if (e.key === 'Backspace' || e.key === 'Delete') {
                              e.preventDefault();
                              const newHotkeys = { ...customHotkeys, [item.id]: '' };
                              setCustomHotkeys(newHotkeys);
                              localStorage.setItem('customHotkeys', JSON.stringify(newHotkeys));
                              return;
                            }
                            if (e.key === 'Tab' || e.key === 'Escape' || e.key === 'Enter') return;
                            
                            const isCtrl = e.ctrlKey || e.metaKey;
                            const isShift = e.shiftKey;
                            const isAlt = e.altKey;
                            
                            // Modifier만 누른 상태면 리턴
                            if (e.key === 'Control' || e.key === 'Shift' || e.key === 'Alt' || e.key === 'Meta') return;
                            
                            e.preventDefault();
                            
                            let key = e.key.toUpperCase();
                            if (e.code && e.code.startsWith('Key')) {
                              key = e.code.substring(3).toUpperCase();
                            } else if (e.code && e.code.startsWith('Digit')) {
                              key = e.code.substring(5);
                            }
                            
                            const parts = [];
                            if (isCtrl) parts.push('Ctrl');
                            if (isShift) parts.push('Shift');
                            if (isAlt) parts.push('Alt');
                            parts.push(key);
                            
                            const combo = parts.join('+');
                            
                            // 단축키 중복 방지 검증
                            const conflictItem = TOOLBAR_ITEMS.find(
                              t => t.id !== item.id && (customHotkeys[t.id] || t.defaultHotkey) === combo
                            );
                            if (conflictItem) {
                              alert(`⚠️ 이미 [${conflictItem.name}] 기능에 할당된 단축키입니다.`);
                              return;
                            }
                            
                            const newHotkeys = { ...customHotkeys, [item.id]: combo };
                            setCustomHotkeys(newHotkeys);
                            localStorage.setItem('customHotkeys', JSON.stringify(newHotkeys));
                          }}
                          className="w-full px-2 py-1 text-xs font-mono text-center rounded outline-none transition-colors focus:ring-1 focus:ring-primary focus:bg-black/5 dark:focus:bg-white/5"
                          style={{
                            backgroundColor: colors.container,
                            border: `1px solid ${colors.border}`,
                            color: colors.onSurface
                          }}
                          placeholder="클릭 후 단축키 누르기"
                          readOnly
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
