"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Moon, Sun, Type, Layout, Folder, Settings, Command } from 'lucide-react';
import { TOOLBAR_ITEMS, getDefaultHotkeys, getDefaultCommands } from '@/lib/toolbarConfig';
import { EDITOR_THEMES } from '@/lib/editorThemes';

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
  quoteStyle: 'modern' | 'clean' | 'none';
  setQuoteStyle: (v: 'modern' | 'clean' | 'none') => void;
  customHotkeys: Record<string, string>;
  setCustomHotkeys: (v: Record<string, string>) => void;
  customSlashCommands: Record<string, string>;
  setCustomSlashCommands: (v: Record<string, string>) => void;
  licenseKey: string;
  setLicenseKey: (v: string) => void;
  initialTab?: 'editor' | 'app' | 'shortcuts';
  themePalette: string;
  onThemeChange: (themeId: string) => void;
}

export default function SettingsModal({
  isOpen, onClose, isDarkMode, setIsDarkMode,
  fontSize, setFontSize, wordWrap, setWordWrap,
  autoSave, setAutoSave, rootFolder, onSelectRootFolder,
  driveLetter, setDriveLetter,
  workspaceType, setWorkspaceType, cloudProvider,
  previewMode, setPreviewMode,
  quoteStyle, setQuoteStyle,
  customHotkeys, setCustomHotkeys,
  customSlashCommands, setCustomSlashCommands,
  licenseKey, setLicenseKey,
  initialTab = 'editor',
  themePalette,
  onThemeChange
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'app' | 'shortcuts'>(initialTab);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 모달이 열릴 때마다 부모에서 지정한 initialTab이 있으면 해당 탭으로 리셋
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const handleSaveLicense = (key: string) => {
    setLicenseKey(key);
    if (typeof window !== 'undefined') {
      localStorage.setItem('onrivi_license_key', key);
      
      // 크롬 익스텐션 스토리지 저장
      const chromeStorage = (window as any).chrome?.storage?.local;
      if (chromeStorage) {
        chromeStorage.set({ onrivi_license_key: key });
      }

      // 데스크탑 Electron 로컬 디스크 저장
      const api = (window as any).electronAPI;
      if (api && typeof api.saveLicense === 'function') {
        api.saveLicense(key);
      }
    }
  };

  if (!isOpen) return null;
  if (!mounted) return null;

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
        className="relative w-full max-w-5xl h-[780px] flex overflow-hidden rounded-xl shadow-2xl border animate-in zoom-in-95 duration-200"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        {/* 사이드바 탭 */}
        <aside className="w-48 shrink-0 flex flex-col border-r" style={{ backgroundColor: colors.container, borderColor: colors.border }}>
          <div className="p-4 border-b" style={{ borderColor: colors.border }}>
            <div className="flex items-center gap-2">
              <Settings size={16} style={{ color: colors.primary }} />
              <h2 className="text-sm font-bold" style={{ color: colors.onSurface }}>환경 설정</h2>
            </div>
          </div>
          <nav className="flex-1 p-2 space-y-1">
            <TabButton active={activeTab === 'editor'} onClick={() => setActiveTab('editor')} icon={<Type size={16}/>} label={"에디터"} colors={colors} />

            <TabButton active={activeTab === 'app'} onClick={() => setActiveTab('app')} icon={<Settings size={16}/>} label={"애플리케이션"} colors={colors} />
            <TabButton active={activeTab === 'shortcuts'} onClick={() => setActiveTab('shortcuts')} icon={<Command size={16}/>} label={"단축키/명령어"} colors={colors} />
          </nav>
          <div className="p-4 text-[10px] opacity-40" style={{ color: colors.onSurface }}>v1.2.0-beta</div>
        </aside>

        {/* 설정 본문 */}
        <div className="flex-1 overflow-y-auto p-8" style={{ backgroundColor: colors.surface }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <X size={18} style={{ color: colors.onSurface }} />
          </button>

          <div className={`${activeTab === 'shortcuts' ? 'max-w-4xl' : 'max-w-2xl'} mx-auto space-y-8`}>
            {activeTab === 'editor' && (
              <section className="space-y-8">
                <SettingItem
                  title={"글자 크기 (Font Size)"}
                  desc={"에디터에서 사용될 기본 글꼴 크기를 조절합니다."}
                  colors={colors}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="range" min="10" max="24" step="1"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="w-32 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <span className="text-xs font-mono font-bold w-8" style={{ color: colors.primary }}>{fontSize}px</span>
                  </div>
                </SettingItem>

                <SettingItem
                  title={"자동 줄 바꿈 (Word Wrap)"}
                  desc={"긴 문장을 화면 너비에 맞춰 자동으로 줄 바꿈합니다."}
                  colors={colors}
                >
                  <div className="flex bg-zinc-200 dark:bg-zinc-800 p-1 rounded-lg gap-1">
                    <ThemeButton active={wordWrap === 'on'} onClick={() => setWordWrap('on')} label={"켜기"} colors={colors} />
                    <ThemeButton active={wordWrap === 'off'} onClick={() => setWordWrap('off')} label={"끄기"} colors={colors} />
                  </div>
                </SettingItem>

                <SettingItem
                  title={"자동 저장 (Auto Save)"}
                  desc={"작성 중인 내용을 주기적으로 임시 보관합니다."}
                  colors={colors}
                >
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={autoSave} onChange={(e) => setAutoSave(e.target.checked)} className="sr-only peer" />
                    <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </SettingItem>

                <SettingItem
                  title={"인용문 스타일 (Quote Style)"}
                  desc={"문서 내 인용문(> 문구)의 시각적 디자인을 설정합니다."}
                  colors={colors}
                >
                  <div className="flex bg-zinc-200 dark:bg-zinc-800 p-1 rounded-lg gap-1">
                    <ThemeButton active={quoteStyle === 'modern'} onClick={() => setQuoteStyle('modern')} label={"강조형"} colors={colors} />
                    <ThemeButton active={quoteStyle === 'clean'} onClick={() => setQuoteStyle('clean')} label={"기본형"} colors={colors} />
                    <ThemeButton active={quoteStyle === 'none'} onClick={() => setQuoteStyle('none')} label={"숨김형"} colors={colors} />
                  </div>
                </SettingItem>
              </section>
            )}



            {activeTab === 'app' && (
              <section className="space-y-8">
                <SettingItem
                  title={"테마 설정"}
                  desc={"앱 및 에디터의 전체적인 색상 테마를 선택합니다."}
                  colors={colors}
                >
                  <select
                    value={themePalette}
                    onChange={(e) => onThemeChange(e.target.value)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border outline-none focus:ring-1 focus:ring-blue-500 w-48 shadow-sm transition-all cursor-pointer"
                    style={{ backgroundColor: colors.container, borderColor: colors.border, color: colors.onSurface }}
                  >
                    {EDITOR_THEMES.map((theme) => (
                      <option key={theme.id} value={theme.id} style={{ backgroundColor: colors.surface, color: colors.onSurface }}>
                        {theme.icon} {theme.name}
                      </option>
                    ))}
                  </select>
                </SettingItem>

                <SettingItem
                  title={"기본 시작 모드"}
                  desc={"앱 실행 시 처음 보여줄 화면 구성을 선택합니다."}
                  colors={colors}
                >
                  <div className="flex gap-2">
                    <ModeButton active={previewMode === 'edit'} onClick={() => setPreviewMode('edit')} label={"편집 전용"} colors={colors} />
                    <ModeButton active={previewMode === 'both'} onClick={() => setPreviewMode('both')} label={"분할 화면"} colors={colors} />
                    <ModeButton active={previewMode === 'preview'} onClick={() => setPreviewMode('preview')} label={"미리보기"} colors={colors} />
                  </div>
                </SettingItem>

                <SettingItem
                  title={"정품 인증 라이선스 키"}
                  desc={"온리비 어서 프로그램의 정품 인증 라이선스 키를 등록합니다."}
                  colors={colors}
                >
                  <input
                    type="text"
                    value={licenseKey}
                    onChange={(e) => handleSaveLicense(e.target.value)}
                    className="px-3 py-1.5 text-xs font-mono rounded border outline-none focus:ring-1 focus:ring-blue-500 w-64 shadow-sm"
                    style={{ backgroundColor: colors.container, borderColor: colors.border, color: colors.onSurface }}
                    placeholder="인증 키를 입력하세요"
                  />
                </SettingItem>
              </section>
            )}

            {activeTab === 'shortcuts' && (
              <section className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold" style={{ color: colors.onSurface }}>단축키 및 슬래시 커맨드 설정</h3>
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
                    기본값으로 초기화
                  </button>
                </div>

                <div className="overflow-x-auto rounded-lg border" style={{ borderColor: colors.border }}>
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
                              className="w-full px-2 py-1 text-xs font-mono text-center rounded outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                              style={{ backgroundColor: colors.container, borderColor: colors.border, border: `1px solid ${colors.border}`, color: colors.onSurface }}
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
                                className="flex-1 px-2 py-1 text-xs font-mono rounded outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                                style={{ backgroundColor: colors.container, border: `1px solid ${colors.border}`, color: colors.onSurface }}
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
            )}
          </div>
        </div>

        {/* 하단 푸터 */}
        <div className="absolute bottom-0 right-0 p-4 flex justify-end" style={{ backgroundColor: colors.surface }}>
          <button
            onClick={() => {
              if (workspaceType === 'browser' && (!rootFolder || rootFolder.name !== '브라우저 스토리지')) {
                onSelectRootFolder('browser', null);
              }
              onClose();
            }}
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

function TabButton({ active, onClick, icon, label, colors }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${active ? 'shadow-sm' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
      style={{
        backgroundColor: active ? colors.surface : 'transparent',
        color: active ? colors.primary : colors.onSurface,
        border: active ? `1px solid ${colors.border}` : '1px solid transparent'
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function SettingItem({ title, desc, children, colors }: any) {
  return (
    <div className="flex items-start justify-between gap-8">
      <div className="space-y-1">
        <h4 className="text-sm font-bold" style={{ color: colors.onSurface }}>{title}</h4>
        <p className="text-xs leading-relaxed opacity-60" style={{ color: colors.onSurface }}>{desc}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function ThemeButton({ active, onClick, icon, label, colors }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 text-[11px] rounded-md transition-all ${active ? 'bg-white dark:bg-zinc-700 shadow-sm font-bold' : 'opacity-50 hover:opacity-80'}`}
      style={{ color: colors.onSurface }}
    >
      {icon} {label}
    </button>
  );
}

function ModeButton({ active, onClick, label, colors }: any) {
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
