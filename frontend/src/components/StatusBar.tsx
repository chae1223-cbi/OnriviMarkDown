// ====================================================================
// 📊 [OMD-EDIT-StatusBar-0003] StatusBar.tsx ➔ StatusBar
// 🎯 @KICK  : 하단 상태표시줄 - 글자 수, 단어 수, 서식 프로필, 저장 상태, 뷰포트 모드 및 행/열 정보 표시
// 🚨 @PATCH : **2026-09-05** — 제한사용자/읽기 전용 모드(isRestrictedUser) 시 하단 상태바의 편집보기 및 분할모드 버튼을 비활성화(disabled, opacity-40, 안내 툴팁) 처리하고 미리보기 버튼만 상시 활성화 유지
//             **2026-09-05** — AI 연동 해제(!geminiApiKey) 시 흐릿하게 노출되던 상태바 AI 버튼(✨)을 완전히 숨김 처리하여 깔끔한 UI 유지
//             **2026-09-05** — AI 연동 해제(!geminiApiKey) 시 상태바 하단 AI 버튼(✨) 비활성화(disabled, opacity-30, grayscale) 및 안내 툴팁/토스트 적용
//             **2026-09-04** — 툴바 숨기기/보이기 옆에 에디터 하단 2줄 AI 버튼 숨기기/보이기 토글 버튼(✨) 및 다국어 툴팁(aiButtonHide/aiButtonShow) 추가 연동
//             **2026-09-03** — 모니터 해상도 축소 시 프로그레스바와 서식 이름이 겹치는 현상을 해결하기 위해 프로그레스바를 xl 브레이크포인트로 최적화하고 서식 이름에 max-w 및 truncate 적용
// 🔗 @CALLS : useEditorContext, EDITOR_THEMES
// ====================================================================
"use client";

import React, { useState } from 'react';
import { EDITOR_THEMES } from '@/lib/editorThemes';

import { useEditorContext } from '@/context/EditorContext';

const localTranslations: Record<string, Record<string, string>> = {
  ko: {
    charCount: "글자 수",
    wordCount: "단어 수",
    manuscript: "원고지",
    page: "매",
    target: "목표",
    path: "경로",
    saved: "저장됨",
    saving: "저장 중...",
    unsaved: "저장되지 않음",
    toolbarHide: "툴바 숨기기",
    toolbarShow: "툴바 보이기",
    aiButtonHide: "AI 버튼 숨기기",
    aiButtonShow: "AI 버튼 보이기",
    sidebarHide: "사이드바 숨기기",
    sidebarShow: "사이드바 보이기",
    toSplitMode: "분할 화면 모드로 전환",
    toPreviewMode: "미리보기 전용 모드로 전환",
    toEditMode: "편집 전용 모드로 전환",
    theme: "테마 전환"
  },
  en: {
    charCount: "Characters",
    wordCount: "Words",
    manuscript: "Ms.",
    page: "p",
    target: "Target",
    path: "Path",
    saved: "Saved",
    saving: "Saving...",
    unsaved: "Unsaved",
    toolbarHide: "Hide Toolbar",
    toolbarShow: "Show Toolbar",
    aiButtonHide: "Hide AI Button",
    aiButtonShow: "Show AI Button",
    sidebarHide: "Hide Sidebar",
    sidebarShow: "Show Sidebar",
    toSplitMode: "Switch to Split View",
    toPreviewMode: "Switch to Preview Only",
    toEditMode: "Switch to Editor Only",
    theme: "Toggle Dark/Light Mode"
  },
  ja: {
    charCount: "文字数",
    wordCount: "単語数",
    manuscript: "原稿用紙",
    page: "枚",
    target: "目標",
    path: "パス",
    saved: "保存済み",
    saving: "保存中...",
    unsaved: "未保存",
    toolbarHide: "ツールバーを隠す",
    toolbarShow: "ツールバーを表示",
    aiButtonHide: "AIボタンを隠す",
    aiButtonShow: "AIボタンを表示",
    sidebarHide: "サイドバーを隠す",
    sidebarShow: "サイドバーを表示",
    toSplitMode: "分割表示モードに切り替え",
    toPreviewMode: "プレビュー専用モードに切り替え",
    toEditMode: "編集専用モードに切り替え",
    theme: "テーマ切り替え"
  },
  zh: {
    charCount: "字数",
    wordCount: "词数",
    manuscript: "原稿纸",
    page: "张",
    target: "目标",
    path: "路径",
    saved: "已保存",
    saving: "保存中...",
    unsaved: "未保存",
    toolbarHide: "隐藏工具栏",
    toolbarShow: "显示工具栏",
    aiButtonHide: "隐藏AI按钮",
    aiButtonShow: "显示AI按钮",
    sidebarHide: "隐藏侧边栏",
    sidebarShow: "显示侧边栏",
    toSplitMode: "切换到双栏视图模式",
    toPreviewMode: "切换到仅预览模式",
    toEditMode: "切换到仅编辑模式",
    theme: "切换主题配色"
  }
};

// ====================================================================
// 📊 [OMD-EDIT-StatusBar-0003] StatusBar ➔ StatusBar
// 🎯 @KICK  : 상태 표시줄 컴포넌트 - 글자 수, 단어 수, 저장 상태, 라인/컬럼 정보, 테마, 프리뷰 모드 표시
// 🛡️ @GUARD : StatusBarProps 인터페이스로 props 타입 검증
// 🚨 @PATCH : **2026-09-02** — 방향키 이동 시 커서 좌표 자릿수 가변에 따른 상태바 흔들림(Jitter) 방지를 위해 고정 너비 및 React.memo 렌더링 격리 적용
//             **2026-08-26** — StatusBar에서 커서 위치 동기화(setLocalCursor) 시 이전 값과 동일하면 업데이트를 무시하도록 방어 로직을 추가하여 무한 렌더링(Maximum update depth exceeded) 에러 해결; **2026-08-12** — 에디터 타이핑 중 상태바 서식 텍스트가 깜빡거리며 깜빡임/언마운트되는 현상을 이전 유효 서식명을 캐싱하는 Ref 기반 리텐션 가드 및 고정 렌더링으로 개편 완벽 해결;
// 🔗 @CALLS : getFullPath, t
// ====================================================================
function StatusBar() {
  const { 
    content, rootFolder, currentFileName: fileName, driveLetter, 
    workspaceType, cloudProvider, currentFileNode, cursorLine, cursorColumn, saveStatus,
    isToolbarOpen, setIsToolbarOpen,
    isAiButtonVisible, setIsAiButtonVisible,
    isSidebarOpen, setIsSidebarOpen,
    previewMode, setPreviewMode,
    isA4GuardEnabled, setIsA4GuardEnabled,
    isDarkMode, setIsDarkMode,
    themePalette, handleThemeChange: onThemeChange,
    isActivated,
    isExpired,
    activeProfileId, profiles, DEFAULT_PROFILE,
    editorRef,
    geminiApiKey,
    showToast,
    isRestrictedUser
  } = useEditorContext();

  const folderName = rootFolder?.name;
  const relativePath = currentFileNode?.path;
  const activeProfileName = profiles?.find((p: any) => p.id === activeProfileId)?.name || DEFAULT_PROFILE?.name;

  // 💡 [서식 깜빡임 방지 리텐션 가드] 타이핑 도중 서식명이 undefined 가 되는 찰나에도 이전 이름을 유지
  const lastActiveProfileNameRef = React.useRef('기본 서식');
  if (activeProfileName) {
    lastActiveProfileNameRef.current = activeProfileName;
  }
  const displayProfileName = activeProfileName || lastActiveProfileNameRef.current || '기본 서식';

  const [localCursor, setLocalCursor] = useState({ line: cursorLine || 1, column: cursorColumn || 1 });

  // 💡 [커서 실시간 업데이트 픽스] Editor의 Cursor 이벤트를 직접 감지하여 Context 지연/렌더링 블락 방지
  React.useEffect(() => {
    let disposable: any;
    
    const attachListener = () => {
      const editor = editorRef?.current || (window as any).monaco?.editor?.getEditors?.()?.[0];
      if (editor) {
        disposable = editor.onDidChangeCursorPosition((e: any) => {
          setLocalCursor(prev => {
            if (prev.line === e.position.lineNumber && prev.column === e.position.column) return prev;
            return { line: e.position.lineNumber, column: e.position.column };
          });
        });
        // 현재 위치 동기화
        const pos = editor.getPosition();
        if (pos) {
          setLocalCursor(prev => {
            if (prev.line === pos.lineNumber && prev.column === pos.column) return prev;
            return { line: pos.lineNumber, column: pos.column };
          });
        }
      } else {
        // 에디터가 아직 마운트되지 않은 경우 0.5초 후 재시도
        setTimeout(attachListener, 500);
      }
    };
    
    attachListener();
    
    return () => {
      if (disposable) disposable.dispose();
    };
  }, [editorRef, workspaceType, activeProfileId, fileName]); // 탭이나 모드가 변경될 때마다 재연결

  const currentTheme = EDITOR_THEMES.find(t => t.id === themePalette) || EDITOR_THEMES[0];
  const charCount = content.length;
  const charCountNoSpace = content.replace(/\s/g, '').length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  // 기자들을 위해 원고지 매수를 소수점 첫째 자리까지 표시 (제거됨)
  const targetCharCount = 2000;
  const progressPercent = Math.min(100, Math.round((charCount / targetCharCount) * 100));

// ====================================================================
// 📊 [OMD-EDIT-StatusBar-0002] StatusBar ➔ t
// 🎯 @KICK  : 다국어 키-값 조회 함수 - localTranslations에서 key에 해당하는 번역 문자열 반환
// 🛡️ @GUARD : dict[key]가 없으면 key 자체를 fallback으로 반환
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
  const t = (key: string) => {
    const dict = localTranslations["ko"] || localTranslations['en'];
    return dict[key] || key;
  };

  // 전체 경로 계산
// ====================================================================
// 📊 [OMD-EDIT-StatusBar-0001] StatusBar ➔ getFullPath
// 🎯 @KICK  : 전체 파일 경로를 workspaceType에 따라 조합하여 반환
// 🛡️ @GUARD : 없음
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
  const getFullPath = () => {
    if (workspaceType === 'browser') {
      const displayPath = relativePath || fileName;
      return folderName ? `${folderName} \\ ${displayPath.replace(/\//g, ' \\ ')}` : `🌐 Browser Storage \\ ${displayPath.replace(/\//g, ' \\ ')}`;
    }
    if (workspaceType === 'cloud') {
      const displayPath = relativePath || fileName;
      return `[${cloudProvider || 'Cloud'}] \\ ${folderName || 'Sync'} \\ ${displayPath.replace(/\//g, ' \\ ')}`;
    }
    
    // 저장된 파일의 전체 경로가 있으면 그대로 사용
    if (relativePath?.includes(':')) return relativePath;
    
    // folderName에서 끝 백슬래시 제거 후 경로 조합
    const cleanFolder = folderName ? folderName.replace(/\\+$/, '') : undefined;
    if (cleanFolder?.includes(':')) return `${cleanFolder}\\${fileName}`;
    
    return `${driveLetter}\\새 문서\\${fileName}`;
  };

  const saveStatusText = saveStatus ? t(saveStatus) : '';
  const saveStatusColor = saveStatus === 'saved' ? 'text-green-600' : saveStatus === 'saving' ? 'text-blue-500' : saveStatus === 'unsaved' ? 'text-amber-500' : '';

  return (
    <footer className="h-12 bg-zinc-100 dark:bg-zinc-900 border-t border-black/5 dark:border-white/10 flex justify-between items-center px-4 text-[12px] font-bold text-gray-700 dark:text-zinc-300 relative z-40 whitespace-nowrap select-none">
      <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
        {/* 💡 라이선스 뱃지(isExpired/isActivated)는 SettingsModal로 이동되었습니다. */}
        <span className="shrink-0">|</span>
        <span className="shrink-0 tabular-nums">{t('charCount')}: {charCount.toLocaleString()} (공백제외 {charCountNoSpace.toLocaleString()})</span>
        <span className="shrink-0">|</span>
        <span className="shrink-0 tabular-nums">{t('wordCount')}: {wordCount.toLocaleString()}</span>
        <span className="hidden xl:inline shrink-0">|</span>
        <div className="hidden xl:flex items-center gap-1.5 shrink-0">
          <div className="w-16 h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: progressPercent >= 100 ? '#10b981' : '#3b82f6'
              }}
            />
          </div>
          <span className="tabular-nums shrink-0">
            {Math.min(charCount, targetCharCount).toLocaleString()}/{targetCharCount.toLocaleString()} ({progressPercent}%)
          </span>
        </div>

      </div>
      <div className="flex items-center gap-2 shrink-0 ml-2">
        {displayProfileName && (
          <>
            <span className="hidden md:inline-block max-w-[140px] xl:max-w-[240px] truncate text-blue-600 dark:text-blue-400 font-semibold align-middle" title={`현재 서식: ${displayProfileName}`}>
              서식: {displayProfileName}
            </span>
            <span className="hidden md:inline shrink-0 text-black/20 dark:text-white/20">|</span>
          </>
        )}
        <div className="w-[85px] flex justify-center shrink-0">
          {saveStatusText && (
            <span className={`${saveStatusColor} font-semibold text-center`}>{saveStatusText}</span>
          )}
        </div>
        <span className="shrink-0 text-black/20 dark:text-white/20">|</span>
        {/* 툴바 숨기기/보이기 */}
        {setIsToolbarOpen && (
          <button
            onClick={() => setIsToolbarOpen(!isToolbarOpen)}
            className={`px-2 py-1 rounded-md text-[12px] font-semibold transition-all hover:bg-black/10 dark:hover:bg-white/10 ${
              isToolbarOpen ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-zinc-500'
            }`}
            title={isToolbarOpen ? t('toolbarHide') : t('toolbarShow')}
          >
            <span className="leading-none">♻️</span>
          </button>
        )}
        {/* AI 버튼 숨기기/보이기 (AI 연동 시에만 노출) */}
        {setIsAiButtonVisible && Boolean(geminiApiKey) && (
          <button
            onClick={() => {
              if (!geminiApiKey) {
                showToast?.("AI 연동이 해제된 상태입니다. 환경설정에서 Gemini API Key를 등록해주세요.", "warning");
                return;
              }
              const next = !isAiButtonVisible;
              setIsAiButtonVisible(next);
              try {
                localStorage.setItem('onrivi_show_editor_ai_btn', String(next));
              } catch {}
            }}
            disabled={!geminiApiKey}
            className={`px-2 py-1 rounded-md text-[12px] font-semibold transition-all ${
              !geminiApiKey
                ? 'opacity-30 cursor-not-allowed grayscale text-gray-400 dark:text-zinc-600'
                : isAiButtonVisible 
                  ? 'text-purple-600 dark:text-purple-400 font-bold hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer' 
                  : 'text-gray-400 dark:text-zinc-500 hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer'
            }`}
            title={
              !geminiApiKey 
                ? "AI 연동 해제됨 (환경설정에서 API 키 등록 필요)" 
                : isAiButtonVisible ? t('aiButtonHide') : t('aiButtonShow')
            }
          >
            <span className="leading-none">✨</span>
          </button>
        )}
        {/* 사이드바 숨기기/보이기 */}
        {setIsSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`px-2 py-1 rounded-md text-[12px] font-semibold transition-all hover:bg-black/10 dark:hover:bg-white/10 ${
              isSidebarOpen ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-zinc-500'
            }`}
            title={isSidebarOpen ? t('sidebarHide') : t('sidebarShow')}
          >
            <span className="leading-none">🗃️</span>
          </button>
        )}
        {/* 모드 표시 세그먼트 (항상 표시) */}
        {setPreviewMode && (
          <div className="flex items-center bg-black/5 dark:bg-white/5 rounded-lg overflow-hidden border border-black/10 dark:border-white/10">
            {/* 조판 가드(Layout Guard) 토글 */}
            {setIsA4GuardEnabled && (
              <button
                onClick={() => setIsA4GuardEnabled(!isA4GuardEnabled)}
                title={isA4GuardEnabled ? "조판 가드 끄기 (Disable Layout Guard)" : "조판 가드 켜기 (Enable Layout Guard)"}
                className={`px-3 py-1.5 text-[12px] font-bold transition-all duration-150 select-none border-r border-black/10 dark:border-white/10 ${
                  isA4GuardEnabled
                    ? 'bg-amber-500 text-white'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/8 dark:hover:bg-white/8'
                }`}
              >
                Layout Guard {isA4GuardEnabled ? 'ON' : 'OFF'}
              </button>
            )}
            {(() => {
              const isEditDisabled = Boolean(isExpired || isRestrictedUser);
              const disabledTitle = isRestrictedUser
                ? "🔒 읽기 전용(제한사용자) 모드에서는 미리보기만 가능합니다. 상단 '이 화면에서 편집 시작하기'를 눌러주세요."
                : (isExpired ? "🔒 라이선스 만료로 편집 모드가 잠겨 있습니다." : "");

              return (
                <>
                  <button
                    disabled={isEditDisabled}
                    onClick={() => !isEditDisabled && setPreviewMode('edit')}
                    title={disabledTitle || "편집보기 - 에디터만 표시"}
                    className={`px-3 py-1.5 text-[12px] font-bold transition-all duration-150 select-none ${
                      isEditDisabled ? 'opacity-40 cursor-not-allowed' : ''
                    } ${
                      previewMode === 'edit'
                        ? 'bg-emerald-500 text-white'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/8 dark:hover:bg-white/8'
                    }`}
                  >{isEditDisabled ? '🔒' : ''}편집보기</button>
                  <div className="w-px h-4 bg-black/10 dark:bg-white/10" />
                  <button
                    disabled={isEditDisabled}
                    onClick={() => !isEditDisabled && setPreviewMode('both')}
                    title={disabledTitle || "분할모드 - 에디터와 미리보기 함께 표시"}
                    className={`px-3 py-1.5 text-[12px] font-bold transition-all duration-150 select-none ${
                      isEditDisabled ? 'opacity-40 cursor-not-allowed' : ''
                    } ${
                      previewMode === 'both' || previewMode === 'css-style'
                        ? 'bg-emerald-500 text-white'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/8 dark:hover:bg-white/8'
                    }`}
                  >{isEditDisabled ? '🔒' : ''}분할모드</button>
                  <div className="w-px h-4 bg-black/10 dark:bg-white/10" />
                  <button
                    onClick={() => setPreviewMode('preview')}
                    title={isEditDisabled ? "미리보기 전용 모드 (읽기 전용/제한 상태)" : "미리보기 - 렌더링된 문서만 표시"}
                    className={`px-3 py-1.5 text-[12px] font-bold transition-all duration-150 select-none ${
                      previewMode === 'preview'
                        ? 'bg-emerald-500 text-white'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/8 dark:hover:bg-white/8'
                    }`}
                  >미리보기</button>
                </>
              );
            })()}
          </div>
        )}

        <span className="text-gray-300 dark:text-zinc-600 mx-1">|</span>
        <span className="hover:text-[#0058bc] cursor-default text-[12px] tabular-nums font-mono min-w-[100px] text-right inline-block ml-1">
          Ln {localCursor.line}, Col {localCursor.column}
        </span>
      </div>
    </footer>
  );
}

export default React.memo(StatusBar);
