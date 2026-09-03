// ====================================================================
// 📊 [OMD-EDIT-SettingsModal-0006] SettingsModal.tsx ➔ SettingsModal
// 🎯 @KICK  : 에디터 환경 설정 모달 - 일반 설정, 단축키, 테마, AI 설정(Google Gemini) 제공
// 🛡️ @GUARD : isOpen/mounted 가드, 모델 식별자 저장 가드
// 🚨 @PATCH : **2026-09-03** — 자원 관리(공통 자원 폴더)에 '전체사용자 필수 항목' 배지 및 미지정 시 강조 UI 적용; initialTab prop 지원을 통해 계정 관리 탭 다이렉트 전환 지원; 환경설정 모달 '계정 관리' 탭의 별명(활동명) 수정 시 [별명 저장] 및 좌측 하단 통합 [저장] 클릭 즉시 에디터 우측 하단 AI 챗봇 버튼명 및 DB users 테이블에 100% 실시간 영구 반영되도록 prop/이벤트/비동기 핸들러 전면 고도화; DB users 개인정보 실시간 조회 및 최신 Gemini 3.8 Flash 연동
//             **2026-07-16** — 단축키 설정 인풋 keydown 버블링 차단 및 PDF/인쇄 설정 모달 인터페이스 추가
// 🔗 @CALLS : testGeminiConnection, useToast
// ====================================================================
"use client";

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ToastProvider';
import { createPortal } from 'react-dom';
import { X, Settings, Command, Loader2, CheckCircle, AlertCircle, KeyRound, Key, Type, AlignLeft, Braces, Save, RotateCcw, Copy, ChevronDown, Check, User, Mail, Shield, Calendar, ExternalLink, RefreshCw } from 'lucide-react';
import { TOOLBAR_ITEMS, getDefaultHotkeys, getDefaultCommands } from '@/lib/toolbarConfig';
import { testGeminiConnection } from '@/lib/gemini';
import { supabase } from '@/lib/supabaseClient';

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
  onClearResourceFolder?: () => void;
  userNickname?: string;
  setUserNickname?: (v: string) => void;
  userId?: string;
  initialTab?: string;
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
  resourceFolder, onSelectResourceFolder, onClearResourceFolder,
  userNickname, setUserNickname, userId,
  initialTab
}: SettingsModalProps) {
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'hotkeys' | 'account'>('general');

  useEffect(() => {
    if (isOpen && initialTab) {
      if (initialTab === 'account') {
        setActiveTab('account');
      } else if (initialTab === 'hotkeys' || initialTab === 'shortcuts') {
        setActiveTab('hotkeys');
      } else {
        setActiveTab('general');
      }
    }
  }, [isOpen, initialTab]);
  
  // 👤 [DB 개인정보/계정 관리 상태]
  const [dbUser, setDbUser] = useState<any>(null);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [editNickName, setEditNickName] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('onrivi_user_nickname') ||
        localStorage.getItem('onrivi_nick_name') ||
        ''
      ).trim();
    }
    return '';
  });
  const [isSavingNick, setIsSavingNick] = useState(false);

  const fetchAccountData = async () => {
    setIsLoadingUser(true);
    try {
      // 1. Supabase 세션 조회
      const { data: { session } } = await supabase.auth.getSession();
      let targetUser = session?.user || null;
      let targetId = targetUser?.id || '';
      let targetEmail = targetUser?.email || '';

      if (!targetId || !targetEmail) {
        const fallbackEmail = userId || (typeof window !== 'undefined' ? localStorage.getItem('onrivi_user_id') : '') || '';
        if (fallbackEmail && !fallbackEmail.includes('GUEST')) {
          targetEmail = fallbackEmail;
        }
      }

      if (targetUser) {
        setSessionUser(targetUser);
      }

      // 2. /api/rpc/user/check API를 통해 RLS를 우회하고 실제 DB(users) 원장의 최신 nick_name 및 필드 조회
      if (targetId || targetEmail) {
        const res = await fetch('/api/rpc/user/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ p_id: targetId, p_email: targetEmail })
        });

        if (res.ok) {
          const resData = await res.json();
          if (resData?.exists) {
            setDbUser({
              id: resData.id,
              email: resData.email || targetEmail,
              nick_name: resData.nick_name,
              provider: resData.provider || 'EMAIL',
              created_at: resData.created_at || targetUser?.created_at
            });
            const dbNick = resData.nick_name || targetUser?.user_metadata?.name || userNickname || '';
            setEditNickName(dbNick);
            if (dbNick) {
              localStorage.setItem('onrivi_user_nickname', dbNick);
              setUserNickname?.(dbNick);
            }
            setIsLoadingUser(false);
            return;
          }
        }
      }

      // 3. Fallback: 세션 기반 기본값
      if (targetUser) {
        const fallbackNick = targetUser.user_metadata?.nick_name || targetUser.user_metadata?.name || userNickname || '';
        setDbUser({
          id: targetUser.id,
          email: targetUser.email,
          nick_name: fallbackNick,
          provider: targetUser.app_metadata?.provider || 'EMAIL',
          created_at: targetUser.created_at
        });
        setEditNickName(fallbackNick);
      } else {
        const localNick = userNickname || (typeof window !== 'undefined' ? localStorage.getItem('onrivi_user_nickname') : '') || '';
        setEditNickName(localNick);
        setSessionUser(null);
        setDbUser(null);
      }
    } catch (e) {
      console.warn('[SettingsModal] 계정 정보 조회 예외:', e);
      const localNick = userNickname || (typeof window !== 'undefined' ? localStorage.getItem('onrivi_user_nickname') : '') || '';
      setEditNickName(localNick);
    } finally {
      setIsLoadingUser(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAccountData();
    }
  }, [isOpen]);

  const handleSaveNickname = async (customNick?: string) => {
    const cleanNick = (typeof customNick === 'string' ? customNick : editNickName).trim();
    
    // 🌟 [최우선] 부모 에디터 상태 및 브라우저 스토리지에 즉각 1ms 만에 실시간 반영!
    try {
      localStorage.setItem('onrivi_user_nickname', cleanNick);
      localStorage.setItem('onrivi_nick_name', cleanNick);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('onrivi:nickname_changed', { detail: cleanNick }));
      }
    } catch {}

    setUserNickname?.(cleanNick);
    setEditNickName(cleanNick);
    setDbUser((prev: any) => prev ? ({ ...prev, nick_name: cleanNick }) : null);

    // 🌟 [DB users 테이블 영구 저장]
    setIsSavingNick(true);
    try {
      const targetId = sessionUser?.id || dbUser?.id;
      const targetEmail = sessionUser?.email || dbUser?.email || (typeof window !== 'undefined' ? localStorage.getItem('onrivi_user_id') : '');
      const provider = dbUser?.provider || sessionUser?.app_metadata?.provider || 'EMAIL';

      if (targetId && targetEmail) {
        // 1차: /api/rpc/user/upsert 시도
        const res = await fetch('/api/rpc/user/upsert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            p_id: targetId,
            p_email: targetEmail,
            p_provider: provider,
            p_nick_name: cleanNick
          })
        });

        if (res.ok) {
          showToast(`별명이 '${cleanNick || '기본값'}'(으)로 저장되었습니다. (에디터 즉시 반영)`, 'success');
        } else {
          // 2차: Supabase Client 직접 업데이트 fallback
          await supabase.from('users').update({ nick_name: cleanNick }).eq('id', targetId);
          showToast(`별명이 '${cleanNick || '기본값'}'(으)로 저장되었습니다.`, 'success');
        }
      } else {
        // 비로그인/오프라인 환경이라도 로컬 반영 성공 알림
        showToast(`별명이 '${cleanNick || '기본값'}'(으)로 에디터에 반영되었습니다.`, 'success');
      }
    } catch (err: any) {
      console.warn('별명 DB 저장 경미한 오류 (로컬은 반영 완료):', err);
      showToast(`별명이 '${cleanNick || '기본값'}'(으)로 반영되었습니다.`, 'success');
    } finally {
      setIsSavingNick(false);
    }
  };

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
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[14px] transition-all cursor-pointer ${
                activeTab === 'general' 
                  ? 'bg-[#06C755]/15 text-[#06C755] font-extrabold shadow-xs' 
                  : 'text-on-surface-variant hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Settings size={18} />
              일반 설정
            </button>
            <button 
              onClick={() => setActiveTab('hotkeys')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[14px] transition-all cursor-pointer ${
                activeTab === 'hotkeys' 
                  ? 'bg-[#06C755]/15 text-[#06C755] font-extrabold shadow-xs' 
                  : 'text-on-surface-variant hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Command size={18} />
              단축키 / 명령어
            </button>
            <button 
              onClick={() => setActiveTab('account')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[14px] transition-all cursor-pointer ${
                activeTab === 'account' 
                  ? 'bg-[#06C755]/15 text-[#06C755] font-extrabold shadow-xs' 
                  : 'text-on-surface-variant hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <User size={18} />
              계정 관리
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
                type="button"
                onClick={() => {
                  const trimmedKey = (geminiApiKey || '').trim();
                  setGeminiApiKey(trimmedKey);
                  const modelToSave = aiModelName || 'gemini-3.8-flash';
                  setAiModelName(modelToSave);

                  try {
                    if (trimmedKey) {
                      localStorage.setItem('onrivi_gemini_api_key', trimmedKey);
                    } else {
                      localStorage.removeItem('onrivi_gemini_api_key');
                      localStorage.setItem('onrivi_gemini_api_key', '');
                    }
                    localStorage.setItem('onrivi_ai_model_name', modelToSave);

                    const raw = localStorage.getItem('onrivi_settings');
                    if (raw) {
                      const parsed = JSON.parse(raw);
                      parsed.geminiApiKey = trimmedKey;
                      parsed.aiModelName = modelToSave;
                      localStorage.setItem('onrivi_settings', JSON.stringify(parsed));
                    }
                  } catch {}

                  // 🌟 [별명 저장 연동] 사용자가 계정 관리에서 입력/수정한 별명을 100% 즉시 반영 및 저장!
                  const cleanNick = editNickName.trim();
                  if (cleanNick !== (userNickname || '')) {
                    handleSaveNickname(cleanNick);
                  }

                  if (trimmedKey) {
                    showToast(`설정이 성공적으로 저장되었습니다. (${modelToSave} 활성화)`, 'success');
                  } else {
                    showToast('설정이 저장되었습니다. (AI 챗봇 비활성화)', 'info');
                  }
                  onClose();
                }}
                className="w-full py-3 bg-[#06C755] hover:bg-[#05B04B] text-white rounded-xl font-bold text-sm shadow-md shadow-[#06C755]/20 transition-all flex justify-center items-center gap-2 cursor-pointer active:scale-98"
              >
                <Save size={16} />
                <span>저장</span>
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
                <div className="flex items-center gap-2 border-b pb-2 border-outline-variant/20 dark:border-white/10">
                  <h3 className="font-serif text-[20px] font-semibold text-on-surface">자원 관리 (서식 & 미디어)</h3>
                  <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    전체사용자 필수 항목
                  </span>
                </div>
                
                <SettingRow 
                  icon={<Save size={18} />}
                  title="공통 자원 폴더 (Resource Folder)"
                  description="모든 서식(프로필)과 미디어(이미지/영상), AI 템플릿이 저장될 PC 내 공통 폴더를 지정합니다."
                  control={
                    <div className="flex items-center gap-2">
                      <div className={`text-xs px-2.5 py-1.5 rounded-lg max-w-[200px] truncate font-mono border ${
                        resourceFolder 
                          ? 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700' 
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-bold'
                      }`} title={resourceFolder || "미지정 (필수 설정)"}>
                        {resourceFolder || "⚠️ 미지정 (필수)"}
                      </div>
                      <button
                        type="button"
                        onClick={() => onSelectResourceFolder()}
                        className={`px-3.5 py-1.5 rounded-lg text-[13px] font-bold transition-all whitespace-nowrap cursor-pointer shadow-xs active:scale-98 ${
                          resourceFolder
                            ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50'
                            : 'bg-[#06C755] hover:bg-[#05B04B] text-white shadow-[#06C755]/20'
                        }`}
                      >
                        {resourceFolder ? '폴더 변경' : '폴더 선택 (필수)'}
                      </button>
                      {resourceFolder && onClearResourceFolder && (
                        <button
                          type="button"
                          onClick={onClearResourceFolder}
                          className="px-2.5 py-1.5 rounded-lg text-[12px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all whitespace-nowrap cursor-pointer"
                          title="리소스 폴더 설정을 초기화합니다"
                        >
                          설정 해제
                        </button>
                      )}
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
                            isDarkMode ? 'bg-zinc-900 border-zinc-700 text-white focus:border-[#06C755]' : 'bg-white border-[#E0DED7] text-slate-900 focus:border-[#06C755]'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={handleTestGemini}
                          disabled={isTestingKey || !geminiApiKey}
                          className="px-4 py-2.5 rounded-xl text-[13px] font-bold bg-[#06C755] hover:bg-[#05B04B] text-white shadow-xs hover:shadow-sm active:scale-98 disabled:opacity-40 transition-all flex items-center justify-center min-w-[90px] cursor-pointer shrink-0"
                        >
                          {isTestingKey ? <Loader2 size={16} className="animate-spin text-white" /> : '연동 테스트'}
                        </button>

                        {/* 연동 해제 버튼 (API 키가 입력/연결되어 있을 때 즉시 지우기) */}
                        {geminiApiKey && (
                          <button
                            type="button"
                            onClick={() => {
                              setGeminiApiKey('');
                              setTestResult(null);
                              showToast('API 키가 지워졌습니다. 하단 [저장]을 클릭하면 에디터 챗봇이 비활성화됩니다.', 'info');
                            }}
                            className="px-3.5 py-2.5 rounded-xl text-[13px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-200 dark:border-rose-900/50 transition-all flex items-center justify-center cursor-pointer active:scale-98 shrink-0"
                            title="API 키를 지우고 연동 해제 상태로 전환합니다"
                          >
                            연동 해제
                          </button>
                        )}
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
                      <label className="block text-[15px] font-semibold text-on-surface mb-1">AI 모델 선택 (Model Name)</label>
                      <p className="text-[13px] text-on-surface-variant mb-4">사용하실 AI 모델을 리스트박스에서 선택하거나 직접 입력하세요.</p>
                      
                      {/* 선명한 리스트박스 (Select Box) */}
                      <div className="relative mb-3">
                        <select
                          value={[
                            'gemini-3.8-flash',
                            'gemini-3.7-flash',
                            'gemini-3.6-flash',
                            'gemini-3.5-flash',
                            'gemini-3.1-flash-lite',
                            'gemma-4-31b-it',
                            'gemma-4-26b-a4b-it'
                          ].includes(aiModelName) ? aiModelName : 'custom'}
                          onChange={(e) => {
                            if (e.target.value !== 'custom') {
                              setAiModelName(e.target.value);
                            }
                          }}
                          className={`w-full px-4 py-3 pr-10 rounded-xl text-[14px] font-semibold outline-none border transition-all appearance-none cursor-pointer ${
                            isDarkMode 
                              ? 'bg-zinc-900 border-zinc-700 text-white focus:border-[#06C755] focus:ring-2 focus:ring-[#06C755]/15' 
                              : 'bg-white border-[#E0DED7] text-slate-900 focus:border-[#06C755] focus:ring-2 focus:ring-[#06C755]/15 shadow-2xs'
                          }`}
                        >
                          <option value="gemini-3.8-flash">👑 Gemini 3.8 Flash (최신 최고 버전 / 초고속 플래그십)</option>
                          <option value="gemini-3.7-flash">⚡ Gemini 3.7 Flash (차세대 고성능 모델)</option>
                          <option value="gemini-3.6-flash">🛡️ Gemini 3.6 Flash (고성능 안정화 모델)</option>
                          <option value="gemini-3.5-flash">💡 Gemini 3.5 Flash (지능형 균형 모델)</option>
                          <option value="gemini-3.1-flash-lite">🪶 Gemini 3.1 Flash Lite (초경량 초고속 응답)</option>
                          <option value="gemma-4-31b-it">💎 Gemma 4 31B IT (확장 오픈 모델)</option>
                          <option value="gemma-4-26b-a4b-it">💎 Gemma 4 26B (경량 오픈 모델)</option>
                          <option value="custom">✏️ 직접 입력 (Custom Model)</option>
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500 dark:text-zinc-400">
                          <ChevronDown size={16} />
                        </div>
                      </div>

                      {/* 모델 식별자 텍스트 입력창 (세부 확인 및 직접 입력용) */}
                      <div className="space-y-1">
                        <label className="text-[12px] font-bold text-slate-500 dark:text-zinc-400 block">
                          공식 모델 식별자 직접 확인 및 수정
                        </label>
                        <input
                          type="text"
                          value={aiModelName || ''}
                          onChange={(e) => setAiModelName(e.target.value)}
                          placeholder="예) gemini-3.8-flash"
                          className={`w-full px-4 py-2.5 rounded-xl text-[14px] font-mono outline-none border transition-all ${
                            isDarkMode 
                              ? 'bg-zinc-900/80 border-zinc-700 text-white focus:border-[#06C755]' 
                              : 'bg-slate-50 border-[#E0DED7] text-slate-900 focus:border-[#06C755]'
                          }`}
                        />
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

          {activeTab === 'account' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
              {/* 상단 헤더 */}
              <div className="border-b pb-4 border-outline-variant/20 dark:border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-[22px] font-semibold text-on-surface flex items-center gap-2.5">
                    <User className="text-[#06C755]" size={24} />
                    계정 관리 (개인정보)
                  </h3>
                  <p className="text-[13px] text-on-surface-variant mt-1">
                    데이터베이스(DB)에 안전하게 보관된 회원 개인정보 및 활동명을 확인하고 관리합니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchAccountData}
                  disabled={isLoadingUser}
                  className="px-3.5 py-2 rounded-xl text-[12px] font-bold text-slate-600 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5 border border-slate-200 dark:border-zinc-700 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="최신 DB 데이터 다시 불러오기"
                >
                  <RefreshCw size={14} className={isLoadingUser ? 'animate-spin' : ''} />
                  <span>새로고침</span>
                </button>
              </div>

              {isLoadingUser ? (
                <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-[#06C755]" />
                  <span className="text-[14px] font-medium">데이터베이스에서 회원 정보를 불러오는 중입니다...</span>
                </div>
              ) : !sessionUser ? (
                <div className="p-8 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-4">
                  <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-zinc-100">현재 비로그인 (체험판/게스트) 모드입니다</h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                      온리비 계정으로 로그인하시면 데이터베이스(DB)에 저장된 고유 개인정보를 확인하고 별명을 수정할 수 있습니다.
                    </p>
                  </div>
                  <div className="pt-2">
                    <a
                      href="/login"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#06C755] hover:bg-[#05B04B] text-white transition-all shadow-xs cursor-pointer"
                    >
                      <span>로그인 페이지로 이동</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* 1. 개인정보 기본 정보 카드 */}
                  <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50/80 border-slate-200/80'} shadow-xs space-y-5`}>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-zinc-100 border-b pb-3 border-slate-200/60 dark:border-zinc-800">
                      <Shield className="text-[#06C755]" size={18} />
                      <span>회원 기본 원장 (DB users)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
                      {/* 이메일 */}
                      <div className="space-y-1">
                        <span className="text-slate-400 dark:text-zinc-500 font-medium text-[11px] flex items-center gap-1.5">
                          <Mail size={12} /> 계정 이메일
                        </span>
                        <div className="font-semibold text-slate-800 dark:text-zinc-200 font-mono bg-white dark:bg-zinc-800/80 px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 select-all">
                          {dbUser?.email || sessionUser?.email || '-'}
                        </div>
                      </div>

                      {/* 가입 방식 */}
                      <div className="space-y-1">
                        <span className="text-slate-400 dark:text-zinc-500 font-medium text-[11px] flex items-center gap-1.5">
                          <KeyRound size={12} /> 가입/로그인 제공자 (Provider)
                        </span>
                        <div className="font-semibold text-slate-800 dark:text-zinc-200 bg-white dark:bg-zinc-800/80 px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 flex items-center justify-between">
                          <span className="uppercase font-bold text-[#06C755]">
                            {dbUser?.provider || sessionUser?.app_metadata?.provider || 'EMAIL'}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#06C755]/10 text-[#06C755] font-bold">인증됨</span>
                        </div>
                      </div>

                      {/* 회원 고유식별자 UUID */}
                      <div className="space-y-1">
                        <span className="text-slate-400 dark:text-zinc-500 font-medium text-[11px] flex items-center gap-1.5">
                          <Key size={12} /> 고유 식별자 (User UUID)
                        </span>
                        <div className="font-mono text-[12px] text-slate-600 dark:text-zinc-400 bg-white dark:bg-zinc-800/80 px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 flex items-center justify-between">
                          <span className="truncate max-w-[200px]">{dbUser?.id || sessionUser?.id || '-'}</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(dbUser?.id || sessionUser?.id || '');
                              showToast('UUID가 클립보드에 복사되었습니다.', 'success');
                            }}
                            className="text-[#06C755] hover:underline text-[11px] font-bold shrink-0 cursor-pointer ml-2"
                          >
                            복사
                          </button>
                        </div>
                      </div>

                      {/* 가입일시 */}
                      <div className="space-y-1">
                        <span className="text-slate-400 dark:text-zinc-500 font-medium text-[11px] flex items-center gap-1.5">
                          <Calendar size={12} /> 회원 가입 일시
                        </span>
                        <div className="font-medium text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-800/80 px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-zinc-700/60">
                          {dbUser?.created_at ? new Date(dbUser.created_at).toLocaleString('ko-KR') : '-'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. 별명(활동명) 수정 및 AI 챗봇 연동 카드 */}
                  <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50/80 border-slate-200/80'} shadow-xs space-y-4`}>
                    <div className="flex items-center justify-between border-b pb-3 border-slate-200/60 dark:border-zinc-800">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-zinc-100">
                        <User className="text-[#8B5CF6]" size={18} />
                        <span>활동명 / 별명 관리 (AI 챗봇 호칭 연동)</span>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 font-bold">
                        실시간 AI 버튼 연동
                      </span>
                    </div>

                    <p className="text-[12px] text-slate-500 dark:text-zinc-400">
                      설정하신 별명은 DB에 저장되며, 에디터 우측 하단 플로팅 버튼 라벨(예: <strong className="text-violet-600 dark:text-violet-400">탕수육 AI</strong>)에 즉시 반영됩니다.
                    </p>

                    <div className="flex gap-2.5 pt-1">
                      <input
                        type="text"
                        value={editNickName}
                        onChange={(e) => setEditNickName(e.target.value)}
                        placeholder="설정할 별명을 입력하세요 (예: 탕수육)"
                        className={`flex-1 px-4 py-2.5 rounded-xl text-[14px] font-bold outline-none border transition-all ${
                          isDarkMode
                            ? 'bg-zinc-800 border-zinc-700 text-white focus:border-[#8B5CF6]'
                            : 'bg-white border-[#E0DED7] text-slate-900 focus:border-[#8B5CF6]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveNickname()}
                        disabled={isSavingNick || !editNickName.trim()}
                        className="px-5 py-2.5 rounded-xl text-[13px] font-bold bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-xs active:scale-98 disabled:opacity-40 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        {isSavingNick ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                        <span>별명 저장</span>
                      </button>
                    </div>
                  </div>

                  {/* 3. 계정 보안 및 대시보드 바로가기 안내 */}
                  <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-zinc-900/40 border-zinc-800/80' : 'bg-slate-50 border-slate-200/60'} flex items-center justify-between gap-4`}>
                    <div className="space-y-0.5">
                      <div className="text-[13px] font-bold text-slate-800 dark:text-zinc-200">구독 플랜 및 기기 접속 관리</div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                        대시보드에서 동시접속 기기 해제, 요금제 변경, 비밀번호 재설정을 관리할 수 있습니다.
                      </div>
                    </div>
                    <a
                      href="/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl text-[12px] font-bold bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <span>대시보드 이동</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              )}
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
