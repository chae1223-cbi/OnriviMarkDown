"use client";

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ToastProvider';
import { createPortal } from 'react-dom';
import { X, Settings, Command, Loader2, CheckCircle, AlertCircle, KeyRound, Type, AlignLeft, Braces, Save, RotateCcw, Copy } from 'lucide-react';
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
  isExpired: boolean;
  geminiApiKey: string;
  setGeminiApiKey: (v: string) => void;
  aiModelName: string;
  setAiModelName: (v: string) => void;
  resourceFolder: string | null;
  onSelectResourceFolder: () => void;
}

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
  isActivated, isExpired,
  autoClosingBrackets, setAutoClosingBrackets,
  geminiApiKey, setGeminiApiKey,
  aiModelName, setAiModelName,
  resourceFolder, onSelectResourceFolder
}: SettingsModalProps) {
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'hotkeys'>('general');
  
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setClosing(false);
    }
  }, [isOpen]);

  if (!isOpen && !closing) return null;
  if (!mounted) return null;

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      onClose();
      setClosing(false);
    }, 300); 
  };

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
        setTestResult({ success: true, msg: '테스트 성공! API 키 및 모델이 유효합니다.' });
      } else {
        setTestResult({ success: false, msg: '응답이 올바르지 않습니다.' });
      }
    } catch (err: any) {
      setTestResult({ success: false, msg: err.message || '연동 실패' });
    } finally {
      setIsTestingKey(false);
    }
  };

  return createPortal(
    <div 
      className={`fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${closing ? 'opacity-0' : 'opacity-100'}`} 
      onClick={handleClose}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.nativeEvent) {
          e.nativeEvent.stopImmediatePropagation?.();
        }
      }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,400;500;600;700&family=Geist+Mono&display=swap');
        
        .settings-shadow {
            box-shadow: 0 40px 100px rgba(15, 0, 109, 0.04), 0 10px 30px rgba(0, 0, 0, 0.04);
        }
        
        .settings-paper-feel {
            background-image: radial-gradient(#1e00a9 0.5px, transparent 0.5px);
            background-size: 24px 24px;
            background-color: transparent;
            opacity: 0.02;
            position: absolute;
            inset: 0;
            pointer-events: none;
        }
      `}} />
      
      <main 
        className={`w-full max-w-6xl h-[85vh] flex flex-col md:flex-row ${isDarkMode ? 'bg-zinc-900 border border-white/10' : 'bg-white'} rounded-2xl settings-shadow overflow-hidden relative z-10 transition-all duration-300 font-sans`}
        style={{
          transform: closing ? 'translateY(20px) scale(0.98)' : 'translateY(0) scale(1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {!isDarkMode && <div className="settings-paper-feel"></div>}

        {/* Global Close Button (Top Right) */}
        <button 
          onClick={handleClose} 
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors z-50 text-outline hover:text-on-surface"
        >
          <X size={24} />
        </button>

        {/* Sidebar */}
        <aside className={`w-full md:w-[260px] shrink-0 border-r ${isDarkMode ? 'border-white/10' : 'border-outline-variant/15'} p-6 flex flex-col relative z-10`}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#06C755]/15 text-[#06C755]">
              <Settings size={18} />
            </div>
            <h2 className="text-lg font-bold text-[#06C755] tracking-tight">환경 설정</h2>
          </div>
          
          <nav className="flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab('general')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[14px] transition-all ${
                activeTab === 'general' 
                  ? 'bg-[#06C755]/10 text-[#06C755]' 
                  : 'text-on-surface-variant hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Settings size={18} />
              일반 설정
            </button>
            <button 
              onClick={() => setActiveTab('hotkeys')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[14px] transition-all ${
                activeTab === 'hotkeys' 
                  ? 'bg-[#06C755]/10 text-[#06C755]' 
                  : 'text-on-surface-variant hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Command size={18} />
              단축키 / 명령어
            </button>
          </nav>

          <div className="mt-auto pt-8 flex flex-col gap-4">
             {/* 💡 라이선스 뱃지 (StatusBar에서 이동) */}
             <div className={`px-4 py-3 rounded-xl ${isDarkMode ? 'bg-black/20' : 'bg-black/5'} border border-outline-variant/10 flex flex-col gap-2 items-center justify-center text-center`}>
               <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">라이선스 상태</span>
               {isExpired ? (
                 <span className="text-[12px] text-rose-600 dark:text-rose-400 font-extrabold px-3 py-1.5 rounded-md bg-rose-500/10 border border-rose-500/20 w-full animate-pulse">
                   🔒 미리보기 전용
                 </span>
               ) : isActivated ? (
                 <span className="text-[12px] text-[#06C755] font-extrabold px-3 py-1.5 rounded-md bg-[#06C755]/10 border border-[#06C755]/20 w-full">
                   ✅ 정품 인증됨
                 </span>
               ) : (
                 <span className="text-[12px] text-amber-600 dark:text-amber-400 font-extrabold px-3 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 w-full">
                   ⚠️ 체험판 (인증 필요)
                 </span>
               )}
             </div>

             <button
              onClick={() => showToast('설정이 성공적으로 저장되었습니다.', 'success')}
              className="w-full py-3 bg-[#06C755] hover:bg-[#05B04B] text-white rounded-xl font-bold text-sm shadow-md shadow-[#06C755]/20 transition-all flex justify-center items-center gap-2"
             >
               저장
             </button>
          </div>
        </aside>

        {/* Content Area */}
        <section className="flex-1 overflow-y-auto relative z-10 p-8 md:p-12">
          
          {activeTab === 'general' && (
            <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-300">
              
              {/* 에디터 설정 그룹 */}
              <div className="space-y-6">
                <h3 className="font-serif text-[20px] font-semibold text-on-surface border-b pb-2 border-outline-variant/20 dark:border-white/10">에디터 동작</h3>
                
                <SettingRow 
                  icon={<AlignLeft size={18} />}
                  title="자동 줄 바꿈 (Word Wrap)"
                  description="에디터 너비에 맞춰 텍스트를 자동으로 줄바꿈합니다."
                  control={
                    <ToggleSwitch 
                      active={wordWrap === 'on'} 
                      onChange={() => setWordWrap(wordWrap === 'on' ? 'off' : 'on')} 
                    />
                  }
                />

                <SettingRow 
                  icon={<Braces size={18} />}
                  title="괄호 자동 완성 (Auto Closing Brackets)"
                  description="여는 괄호를 입력할 때 닫는 괄호를 자동으로 추가합니다."
                  control={
                    <ToggleSwitch 
                      active={autoClosingBrackets} 
                      onChange={() => setAutoClosingBrackets(!autoClosingBrackets)} 
                    />
                  }
                />

                <SettingRow 
                  icon={<Save size={18} />}
                  title="자동 저장 (Auto Save)"
                  description="문서를 자동으로 저장하는 주기를 설정합니다."
                  control={
                    <select
                      value={autoSave}
                      onChange={(e) => setAutoSave(parseInt(e.target.value))}
                      className={`px-4 py-2 rounded-lg text-[13px] font-medium outline-none cursor-pointer border transition-colors ${
                        isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-surface-container-low border-outline-variant/30 text-on-surface'
                      }`}
                    >
                      <option value={0}>사용 안함</option>
                      <option value={5}>5초</option>
                      <option value={10}>10초</option>
                      <option value={30}>30초</option>
                      <option value={60}>1분</option>
                    </select>
                  }
                />
              </div>

              {/* 자원 관리 설정 그룹 */}
              <div className="space-y-6">
                <h3 className="font-serif text-[20px] font-semibold text-on-surface border-b pb-2 border-outline-variant/20 dark:border-white/10">자원 관리 (서식 & 미디어)</h3>
                
                <SettingRow 
                  icon={<Save size={18} />}
                  title="공통 자원 폴더 (Resource Folder)"
                  description="모든 서식(프로필)과 미디어(이미지/영상)가 저장될 PC 내 공통 폴더를 지정합니다."
                  control={
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-gray-500 max-w-[200px] truncate" title={resourceFolder || "지정 안 됨"}>
                        {resourceFolder || "지정 안 됨"}
                      </div>
                      <button
                        onClick={() => onSelectResourceFolder()}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-lg text-[13px] font-semibold transition-colors whitespace-nowrap"
                      >
                        폴더 선택
                      </button>
                    </div>
                  }
                />
              </div>

              {/* AI 설정 그룹 */}
              <div className="space-y-6">
                <h3 className="font-serif text-[20px] font-semibold text-on-surface border-b pb-2 border-outline-variant/20 dark:border-white/10">AI 어시스턴트</h3>
                
                <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-zinc-800/50 border-white/10' : 'bg-surface-container-low/50 border-outline-variant/20'}`}>
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <KeyRound size={20} />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[15px] font-semibold text-on-surface mb-1">Google Gemini API Key</label>
                      <p className="text-[13px] text-on-surface-variant mb-4">AI 통신을 위한 구글 Gemini API 키를 입력하세요.</p>
                      
                      <div className="flex gap-2">
                        <input
                          type="password"
                          placeholder="AI0xxxx..."
                          value={geminiApiKey || ''}
                          onChange={(e) => {
                            setGeminiApiKey(e.target.value);
                            if (testResult) setTestResult(null);
                          }}
                          className={`flex-1 px-4 py-2.5 rounded-xl text-[14px] font-mono outline-none border transition-all ${
                            isDarkMode ? 'bg-zinc-900 border-zinc-700 text-white focus:border-primary-fixed-dim' : 'bg-white border-outline-variant/30 text-on-surface focus:border-primary-container'
                          }`}
                        />
                        <button
                          onClick={handleTestGemini}
                          disabled={isTestingKey || !geminiApiKey}
                          className="px-5 py-2.5 rounded-xl text-[13px] font-bold bg-primary-container text-white dark:bg-primary-fixed-dim dark:text-black hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center min-w-[100px]"
                        >
                          {isTestingKey ? <Loader2 size={16} className="animate-spin" /> : '연동 테스트'}
                        </button>
                      </div>
                      
                      {testResult && (
                        <div className={`mt-3 px-4 py-2.5 rounded-lg text-[13px] font-medium flex items-center gap-2 ${
                          testResult.success ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}>
                          {testResult.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                          {testResult.msg}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      <Type size={20} />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[15px] font-semibold text-on-surface mb-1">AI 모델 식별자 (Model Name)</label>
                      <p className="text-[13px] text-on-surface-variant mb-4">사용하실 AI 모델의 공식 식별자를 입력하세요.</p>
                      
                      <input
                        type="text"
                        value={aiModelName || ''}
                        onChange={(e) => setAiModelName(e.target.value)}
                        placeholder="예) gemini-1.5-flash"
                        className={`w-full px-4 py-2.5 rounded-xl text-[14px] font-mono outline-none border transition-all mb-3 ${
                          isDarkMode ? 'bg-zinc-900 border-zinc-700 text-white focus:border-primary-fixed-dim' : 'bg-white border-outline-variant/30 text-on-surface focus:border-primary-container'
                        }`}
                      />
                      
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: 'gemma-4-26b-a4b-it', label: 'gemma-4-26b-a4b-it' },
                          { id: 'gemma-4-31b-it', label: 'Gemma 4 31B IT' },
                          { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite' },
                          { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash' },
                          { id: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash Lite' },
                          { id: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash' },
                        ].map(model => (
                          <button
                            key={model.id}
                            onClick={() => setAiModelName(model.id)}
                            className={`px-3 py-1.5 text-[12px] font-medium rounded-full border transition-all ${
                              aiModelName === model.id 
                                ? 'bg-primary-container text-white border-primary-container dark:bg-primary-fixed-dim dark:text-black dark:border-primary-fixed-dim'
                                : 'bg-transparent text-on-surface-variant border-outline-variant/30 hover:border-outline-variant/60'
                            }`}
                          >
                            {model.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hotkeys' && (
            <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20 dark:border-white/10">
                <div>
                  <h3 className="font-serif text-[20px] font-semibold text-on-surface">단축키 및 명령어 매핑</h3>
                  <p className="text-[13px] text-on-surface-variant mt-1">마크다운 에디터 내에서 사용할 단축키와 슬래시(/) 명령어를 커스텀하세요.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const textLines = ['[단축키 및 명령어 매핑]'];
                      TOOLBAR_ITEMS.forEach(item => {
                        const hk = customHotkeys[item.id] || '없음';
                        const cmd = customSlashCommands[item.id] || '없음';
                        textLines.push(`- ${item.name}: 단축키 [${hk}], 명령어 [/${cmd}]`);
                      });
                      navigator.clipboard.writeText(textLines.join('\n')).then(() => {
                        showToast('단축키 및 명령어가 복사되었습니다.', 'success');
                      }).catch(() => {
                        showToast('복사에 실패했습니다.', 'error');
                      });
                    }}
                    className="px-4 py-2 text-[13px] font-bold rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-all flex items-center gap-2"
                  >
                    <Copy size={14} />
                    복사하기
                  </button>
                  <button
                    onClick={() => {
                      const defaultHotkeys = getDefaultHotkeys();
                    const defaultCmds = getDefaultCommands();
                    setCustomHotkeys(defaultHotkeys);
                    setCustomSlashCommands(defaultCmds);
                    localStorage.setItem('customHotkeys', JSON.stringify(defaultHotkeys));
                    localStorage.setItem('customSlashCommands', JSON.stringify(defaultCmds));
                    showToast('초기화 되었습니다.', 'success');
                  }}
                  className="px-4 py-2 text-[13px] font-bold rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-2"
                >
                  <RotateCcw size={14} />
                  초기화
                  </button>
                </div>
              </div>

              <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'border-white/10' : 'border-outline-variant/20'}`}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`text-[12px] font-bold uppercase tracking-wider ${isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-surface-container-low text-on-surface-variant'}`}>
                      <th className="px-5 py-4 w-12 text-center">아이콘</th>
                      <th className="px-5 py-4 w-40">기능명</th>
                      <th className="px-5 py-4 text-center">단축키 조합</th>
                      <th className="px-5 py-4 text-center">명령어 (/)</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y text-[14px] ${isDarkMode ? 'divide-white/5 text-zinc-200' : 'divide-outline-variant/10 text-on-surface'}`}>
                    {TOOLBAR_ITEMS.map((item) => (
                      <tr key={item.id} className={`transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>
                        <td className="px-5 py-3 text-center text-lg">{item.icon}</td>
                        <td className="px-5 py-3 font-medium">{item.name}</td>
                        <td className="px-5 py-3 text-center">
                          <input
                            type="text"
                            value={customHotkeys[item.id] !== undefined ? customHotkeys[item.id] : ''}
                            onChange={() => {}}
                            onKeyDown={(e) => {
                              e.stopPropagation();
                              if (e.nativeEvent) e.nativeEvent.stopImmediatePropagation?.();
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
                              if (e.key === 'Control' || e.key === 'Shift' || e.key === 'Alt' || e.key === 'Meta') return;
                              e.preventDefault();
                              let key = e.key.toUpperCase();
                              if (e.code && e.code.startsWith('Key')) key = e.code.substring(3).toUpperCase();
                              else if (e.code && e.code.startsWith('Digit')) key = e.code.substring(5);
                              
                              const parts = [];
                              if (isCtrl) parts.push('Ctrl');
                              if (isShift) parts.push('Shift');
                              if (isAlt) parts.push('Alt');
                              parts.push(key);
                              const combo = parts.join('+');
                              
                              const conflictItem = TOOLBAR_ITEMS.find(t => t.id !== item.id && (customHotkeys[t.id] || t.defaultHotkey) === combo);
                              if (conflictItem) {
                                showToast(`⚠️ 이미 [${conflictItem.name}] 기능에 할당된 단축키입니다.`, 'warning');
                                return;
                              }
                              const newHotkeys = { ...customHotkeys, [item.id]: combo };
                              setCustomHotkeys(newHotkeys);
                              localStorage.setItem('customHotkeys', JSON.stringify(newHotkeys));
                            }}
                            className={`w-full max-w-[120px] mx-auto px-3 py-1.5 text-[12px] font-mono font-bold text-center rounded-lg outline-none transition-all cursor-pointer border ${
                              isDarkMode ? 'bg-zinc-900 border-zinc-700 text-white focus:border-primary-fixed-dim' : 'bg-white border-outline-variant/30 text-on-surface focus:border-primary-container shadow-sm'
                            }`}
                            placeholder="클릭 후 입력"
                            readOnly
                          />
                        </td>
                        <td className="px-5 py-3 text-center">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border focus-within:border-primary-container transition-all ${
                            isDarkMode ? 'bg-zinc-900 border-zinc-700 focus-within:border-primary-fixed-dim' : 'bg-white border-outline-variant/30 shadow-sm'
                          }`}>
                            <span className="font-mono font-bold opacity-40">/</span>
                            <input
                              type="text"
                              value={customSlashCommands[item.id] !== undefined ? customSlashCommands[item.id] : ''}
                              onChange={(e) => {
                                const newCmds = { ...customSlashCommands, [item.id]: e.target.value };
                                setCustomSlashCommands(newCmds);
                                localStorage.setItem('customSlashCommands', JSON.stringify(newCmds));
                              }}
                              className="w-[80px] text-[12px] font-mono font-bold outline-none bg-transparent"
                              placeholder="명령어"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>,
    document.body
  );
}

function SettingRow({ icon, title, description, control }: { icon: React.ReactNode, title: string, description: string, control: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 py-1">
      <div className="flex items-start gap-4">
        <div className="mt-0.5 text-on-surface-variant/70">
          {icon}
        </div>
        <div>
          <div className="text-[15px] font-semibold text-on-surface mb-0.5">{title}</div>
          <div className="text-[13px] text-on-surface-variant">{description}</div>
        </div>
      </div>
      <div className="shrink-0">
        {control}
      </div>
    </div>
  );
}

function ToggleSwitch({ active, onChange }: { active: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-[44px] h-[24px] rounded-full transition-colors duration-300 outline-none ${
        active ? 'bg-green-500' : 'bg-zinc-300 dark:bg-zinc-700'
      }`}
    >
      <div 
        className={`absolute top-[2px] left-[2px] w-[20px] h-[20px] bg-white rounded-full shadow-sm transition-transform duration-300 ${
          active ? 'translate-x-[20px]' : 'translate-x-0'
        }`}
      />
    </button>
  );
}
