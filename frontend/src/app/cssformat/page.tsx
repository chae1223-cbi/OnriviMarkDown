"use client";

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import CssStyleForm from '@/components/CssStyleForm';
import MarkdownViewer from '@/components/MarkdownViewer';
import { CssProfile } from '@/types/cssProfile';
import { SYSTEM_PROFILES, DEFAULT_PROFILE, isSystemProfileId } from '@/constants/cssProfile';
import { CSS_PROFILE_GUIDE_MD } from '@/constants/cssProfileGuide';
import { getWelcomeContent } from '@/constants/welcomeContent';

export default function CssFormatPage() {
  const [profiles, setProfiles] = useState<CssProfile[]>(() => [...SYSTEM_PROFILES]);
  const [activeProfileId, setActiveProfileId] = useState('system-gov');

  useEffect(() => {
    const saved = localStorage.getItem('userCssProfiles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const userProfiles: CssProfile[] = (Array.isArray(parsed) ? parsed : []).filter(
          (p: CssProfile) => !isSystemProfileId(p.id) && p.id !== 'default'
        );
        if (userProfiles.length > 0) {
          setProfiles(prev => [...SYSTEM_PROFILES, ...userProfiles]);
        }
      } catch {}
    }
    const savedId = localStorage.getItem('activeCssProfileId');
    if (savedId) setActiveProfileId(savedId);
  }, []);

  useEffect(() => {
    const userProfiles = profiles.filter(p => !isSystemProfileId(p.id));
    localStorage.setItem('userCssProfiles', JSON.stringify(userProfiles));
    localStorage.setItem('activeCssProfileId', activeProfileId);
  }, [profiles, activeProfileId]);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || DEFAULT_PROFILE;

  const handleAddProfile = () => {
    const newId = 'profile-' + Date.now();
    const count = profiles.filter(p => !isSystemProfileId(p.id)).length + 1;
    setProfiles(prev => [...prev, {
      ...DEFAULT_PROFILE,
      id: newId,
      name: `나만의 서식 ${count}`,
      rules: JSON.parse(JSON.stringify(DEFAULT_PROFILE.rules)),
    }]);
    setActiveProfileId(newId);
  };

  const handleDeleteProfile = (id: string) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
    if (activeProfileId === id) setActiveProfileId('system-gov');
  };

  const handleImportProfile = (profile: CssProfile) => {
    const merged: CssProfile = {
      ...DEFAULT_PROFILE,
      id: 'imported-' + Date.now(),
      name: profile.name + ' (가져오기)',
      pageStyle: { ...DEFAULT_PROFILE.pageStyle, ...(profile.pageStyle || {}) },
      rules: JSON.parse(JSON.stringify(profile.rules || {})),
    };
    setProfiles(prev => [...prev, merged]);
    setActiveProfileId(merged.id);
  };

  const handleExport = () => {
    const json = JSON.stringify(activeProfile, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      alert('프로필 JSON이 클립보드에 복사되었습니다.');
    });
  };

  const ps = activeProfile.pageStyle;
  const isLandscape = ps.orientation === 'landscape';
  const paperSizeKey = ps.paperSize?.toLowerCase() || 'a4';
  const PAPER_SIZES: Record<string, { width: string; height: string }> = {
    a4: { width: '210mm', height: '297mm' },
    letter: { width: '215.9mm', height: '279.4mm' },
    a3: { width: '297mm', height: '420mm' },
    b4: { width: '250mm', height: '353mm' },
    b5: { width: '176mm', height: '250mm' },
  };
  const psSize = PAPER_SIZES[paperSizeKey] || PAPER_SIZES.a4;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200">
      <Navbar />
      <div className="flex flex-1 overflow-hidden pt-14">
        {/* 좌측: 템플릿 관리 */}
        <div className="w-72 shrink-0 h-full bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto p-4 flex flex-col">
          {/* 닫기 버튼 */}
          <button
            onClick={() => window.close()}
            className="self-start mb-4 px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1"
          >
            ✕ 닫기
          </button>

          {/* 액션 버튼 (상단) */}
          <div className="space-y-2 mb-4">
            <div className="flex gap-2">
              <button onClick={handleAddProfile} className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg bg-sky-500 hover:bg-sky-600 text-white transition-colors">
                + 새 프로필
              </button>
              <button onClick={handleExport} className="px-3 py-2 text-xs font-semibold rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors">
                내보내기
              </button>
            </div>
            <label className="block">
              <span className="block w-full px-3 py-2 text-xs font-semibold rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors cursor-pointer text-center">
                가져오기
              </span>
              <input type="file" accept=".json" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                  try {
                    const parsed = JSON.parse(ev.target?.result as string);
                    handleImportProfile(parsed);
                  } catch { alert('올바른 JSON 파일이 아닙니다.'); }
                };
                reader.readAsText(file);
              }} />
            </label>
            <div className="space-y-1">
              <a
                href={`data:text/markdown;charset=utf-8,${encodeURIComponent(CSS_PROFILE_GUIDE_MD)}`}
                download="css-profile-guide.md"
                className="block w-full px-3 py-2 text-xs font-semibold rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors text-center"
              >
                📖 서식 가이드 다운로드
              </a>
              <button
                onClick={() => {
                  const template = JSON.stringify(SYSTEM_PROFILES, null, 2);
                  const blob = new Blob([template], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'onrivi-templates.json';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="block w-full px-3 py-2 text-xs font-semibold rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors text-center"
              >
                📦 템플릿 JSON 내려받기
              </button>
            </div>
          </div>

          {/* 템플릿 리스트 (하단) */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <h2 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">템플릿</h2>
            <div className="space-y-2">
              {profiles.map(profile => (
                <button
                  key={profile.id}
                  onClick={() => setActiveProfileId(profile.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    activeProfileId === profile.id
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{profile.name}</span>
                    {isSystemProfileId(profile.id) && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 font-bold">시스템</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 중앙: 서식설정 폼 */}
        <div className="w-[450px] shrink-0 h-full overflow-y-auto border-r border-zinc-200 dark:border-zinc-800">
          <CssStyleForm
            profiles={profiles}
            activeProfileId={activeProfileId}
            onSelectProfile={setActiveProfileId}
            onUpdateProfile={(updated) => setProfiles(prev =>
              prev.map(p => p.id === updated.id ? updated : p)
            )}
            onAddProfile={handleAddProfile}
            onDeleteProfile={handleDeleteProfile}
            onImportProfile={handleImportProfile}
            onClose={() => {}}
          />
        </div>

        {/* 우측: 미리보기 */}
        <div className="flex-1 h-full overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
          <div
            className="mx-auto my-8 shadow-lg bg-white dark:bg-zinc-900"
            style={{
              width: isLandscape ? psSize.height : psSize.width,
              minHeight: isLandscape ? psSize.width : psSize.height,
              fontFamily: ps.fontFamily || 'inherit',
              fontSize: ps.fontSize || '15px',
              lineHeight: ps.lineHeight || '1.8',
              letterSpacing: ps.letterSpacing || '0px',
              padding: `${ps.marginTop || '20mm'} ${ps.marginRight || '20mm'} ${ps.marginBottom || '20mm'} ${ps.marginLeft || '20mm'}`,
              backgroundColor: ps.backgroundColor || '#ffffff',
            }}
          >
            <MarkdownViewer content={getWelcomeContent()} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
