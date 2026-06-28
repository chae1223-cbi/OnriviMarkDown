// @ts-nocheck
import { useState, useEffect, useCallback, useRef } from 'react';
import { getDefaultHotkeys, getDefaultCommands } from "@/lib/toolbarConfig";
import { THEME_MAP } from "@/lib/editorThemes";
import { idb } from '@/lib/indexedDbHelper';
import { getApiUrl } from '@/lib/apiUrlBuilder';

/**
 * [ONR-16-002] useEditorSettings 커스텀 훅
 * @description 에디터의 각종 사용자 편의 설정(테마, 단축키, 줄바꿈, 폰트크기 등)을 관리하고 영구 저장소에 저장/동기화합니다.
 */
// ====================================================================
// 📊 [OMD-EDIT-USEEDITORSETTINGS-0005] useEditorSettings.ts ➔ useEditorSettings
// 🎯 @KICK  : 에디터 사용자 설정(테마, 단축키, 폰트크기 등)을 관리하고 영구 저장소에 동기화
// 🛡️ @GUARD : 각 스토리지 로드 실패 시 기본값 fallback
// 🚨 @PATCH : 없음
// 🔗 @CALLS : getDefaultHotkeys, getDefaultCommands, idb.get, api.loadSettings, api.saveSettings
// ====================================================================
// 🚨 @PATCH : **2026-06-20** — 다크모드 전면 비활성화 패치: isDarkMode 상태를 항상 false로 고정하고 HTML documentElement의 dark 클래스 조작을 비활성화하여 에디터 및 렌더러가 항상 라이트 모드로 동작하도록 강제
export const useEditorSettings = (
  editorRef: any,
  mounted: boolean,
  setMounted: (val: boolean) => void,
  previewMode: string,
  setPreviewMode: any,
  setSidebarWidth: (val: number) => void,
  setActiveProfileId: (val: string) => void,
  setWorkspaceType: (val: any) => void,
  setRootFolder: (val: any) => void,
  setIsAddonEnv: (val: boolean) => void,
  showToast: (msg: string, type?: string) => void
) => {
  const isDarkMode = false;
  const setIsDarkMode = useCallback((val: boolean) => { }, []);
  const [fontSize, setFontSize] = useState<number>(14);
  const [wordWrap, setWordWrap] = useState<'on' | 'off'>('on');
  const [autoSave, setAutoSave] = useState(true);
  const [quoteStyle, setQuoteStyle] = useState<'modern' | 'clean' | 'none'>('modern');
  const [themePalette, setThemePalette] = useState<string>('onrivi-light');
  const [licenseKey, setLicenseKey] = useState<string>('');

  const [customHotkeys, setCustomHotkeys] = useState<Record<string, string>>({});
  const [customSlashCommands, setCustomSlashCommands] = useState<Record<string, string>>({});

  const customSlashCommandsRef = useRef<Record<string, string>>(customSlashCommands);
  useEffect(() => {
    customSlashCommandsRef.current = customSlashCommands;
  }, [customSlashCommands]);

  // ====================================================================
  // 📊 [OMD-EDIT-USEEDITORSETTINGS-0004] useEditorSettings.ts ➔ handleThemeChange
  // 🎯 @KICK  : 테마 변경 시 팔레트 ID와 다크모드 여부를 동시에 갱신
  // 🛡️ @GUARD : THEME_MAP_REF에 없는 themeId는 무시
  // 🚨 @PATCH : 없음
  // 🔗 @CALLS : 없음
  // ====================================================================
  const handleThemeChange = useCallback((themeId: string, THEME_MAP_REF: any) => {
    const theme = THEME_MAP_REF[themeId];
    if (!theme) return;
    setThemePalette(themeId);
    // 다크모드 전면 제거로 isDarkMode는 항상 false 고정
  }, []);

  // ====================================================================
  // 📊 [OMD-EDIT-USEEDITORSETTINGS-0003] useEditorSettings.ts ➔ restoreEffect
  // 🎯 @KICK  : 마운트 시 restoreSettings를 호출하여 모든 사용자 설정 초기 복원
  // 🛡️ @GUARD : editorRef/monaco 존재 시 Monaco 에디터 테마 적용
  // 🚨 @PATCH : 없음
  // 🔗 @CALLS : restoreSettings
  // ====================================================================
  // 1. 설정 로드 및 초기 복원
  useEffect(() => {
    // ====================================================================
    // 📊 [OMD-EDIT-USEEDITORSETTINGS-0002] useEditorSettings.ts ➔ restoreSettings
    // 🎯 @KICK  : localStorage/chrome.storage/Electron에서 저장된 설정을 로드하여 복원
    // 🛡️ @GUARD : 각 스토리지별 로드 실패 시 console.error 후 기본값 유지
    // 🚨 @PATCH : 없음
    // 🔗 @CALLS : getDefaultHotkeys, getDefaultCommands, idb.get, api.loadSettings
    // ====================================================================
    const restoreSettings = async () => {
      let baseSettings = {
        isDarkMode: false,
        fontSize: 15,
        wordWrap: 'on' as 'on' | 'off',
        autoSave: true,
        previewMode: 'both' as 'edit' | 'both' | 'preview' | 'css-style',
        quoteStyle: 'modern' as 'modern' | 'clean' | 'none',
        customHotkeys: getDefaultHotkeys(),
        customSlashCommands: getDefaultCommands(),
        themePalette: 'onrivi-light',
        licenseKey: 'chae6^jung1!jang3#&'
      };

      try {
        const localData = localStorage.getItem('onrivi_settings');
        if (localData) {
          Object.assign(baseSettings, JSON.parse(localData));
          if (baseSettings.previewMode === 'css-style') baseSettings.previewMode = 'both';
        } else {
          const legacyFontSize = localStorage.getItem('fontSize');
          if (legacyFontSize) baseSettings.fontSize = parseInt(legacyFontSize);
          const legacyWordWrap = localStorage.getItem('wordWrap');
          if (legacyWordWrap) baseSettings.wordWrap = legacyWordWrap as any;
          const legacyQuoteStyle = localStorage.getItem('quoteStyle');
          if (legacyQuoteStyle) baseSettings.quoteStyle = legacyQuoteStyle as any;
          const legacyTheme = localStorage.getItem('theme');
          if (legacyTheme) baseSettings.isDarkMode = legacyTheme === 'dark';
          const legacyThemePalette = localStorage.getItem('themePalette');
          if (legacyThemePalette) baseSettings.themePalette = legacyThemePalette;
          const legacyAutoSave = localStorage.getItem('autoSave');
          if (legacyAutoSave) baseSettings.autoSave = legacyAutoSave === 'true';
          const legacyPreviewMode = localStorage.getItem('previewMode');
          if (legacyPreviewMode) baseSettings.previewMode = legacyPreviewMode as any;

          const savedHotkeys = localStorage.getItem('customHotkeys');
          if (savedHotkeys) {
            Object.assign(baseSettings.customHotkeys, JSON.parse(savedHotkeys));
          }
          const savedSlashCmds = localStorage.getItem('customSlashCommands');
          if (savedSlashCmds) {
            Object.assign(baseSettings.customSlashCommands, JSON.parse(savedSlashCmds));
          }
        }
      } catch (e) {
        console.error('로컬스토리지 로드 실패:', e);
      }

      const chromeStorage = (window as any).chrome?.storage?.local;
      if (chromeStorage) {
        try {
          const result = await new Promise<any>((resolve) => {
            chromeStorage.get(['onrivi_settings'], (res: any) => resolve(res || {}));
          });
          if (result && result.onrivi_settings) {
            Object.assign(baseSettings, result.onrivi_settings);
            if (baseSettings.previewMode === 'css-style') baseSettings.previewMode = 'both';
          }
        } catch (e) {
          console.error('크롬 스토리지 로드 실패:', e);
        }
      }

      const api = (window as any).electronAPI;
      if (api && typeof api.loadSettings === 'function') {
        try {
          const desktopData = await api.loadSettings();
          if (desktopData) {
            Object.assign(baseSettings, desktopData);
          }
        } catch (e) {
          console.error('데스크탑 스토리지 로드 실패:', e);
        }
      }

      const defaultHotkeys = getDefaultHotkeys();
      const defaultCommands = getDefaultCommands();

      Object.keys(defaultHotkeys).forEach((key) => {
        if (baseSettings.customHotkeys[key] === undefined) {
          baseSettings.customHotkeys[key] = defaultHotkeys[key];
        }
      });

      Object.keys(defaultCommands).forEach((key) => {
        if (baseSettings.customSlashCommands[key] === undefined) {
          baseSettings.customSlashCommands[key] = defaultCommands[key];
        }
      });

      // 다크모드 무력화: 강제로 light 세팅 및 dark 클래스 제거
      setIsDarkMode(false);
      setFontSize(baseSettings.fontSize);
      setWordWrap(baseSettings.wordWrap);
      setAutoSave(baseSettings.autoSave);
      setPreviewMode(baseSettings.previewMode);
      setQuoteStyle(baseSettings.quoteStyle);
      setCustomHotkeys(baseSettings.customHotkeys);
      setCustomSlashCommands(baseSettings.customSlashCommands);
      setThemePalette(baseSettings.themePalette);
      setLicenseKey(baseSettings.licenseKey);

      document.documentElement.classList.remove('dark');

      if (editorRef.current && (window as any).monaco) {
        const monaco = (window as any).monaco;
        monaco.editor.setTheme(baseSettings.themePalette);
      }

      const savedWidth = localStorage.getItem('sidebarWidth');
      if (savedWidth) setSidebarWidth(parseInt(savedWidth));

      const savedProfileId = localStorage.getItem('activeCssProfileId');
      if (savedProfileId) setActiveProfileId(savedProfileId);

      const detectedAddon = typeof window !== 'undefined' && (
        new URLSearchParams(window.location.search).get('env') === 'addon' ||
        !!((window as any).chrome?.runtime?.id)
      );
      setIsAddonEnv(detectedAddon);

      const savedWorkspaceType = localStorage.getItem('workspaceType') || 'local';
      const activeWorkspaceType = detectedAddon ? 'browser' : savedWorkspaceType;
      setWorkspaceType(activeWorkspaceType as any);

      if (activeWorkspaceType === 'browser') {
        setPreviewMode(baseSettings.previewMode);

        try {
          const savedHandle = await idb.get('rootFolderHandle');
          if (savedHandle) {
            const isPermissionGranted = (await savedHandle.queryPermission({ mode: 'readwrite' })) === 'granted';
            if (isPermissionGranted) {
              setRootFolder({ name: savedHandle.name, handle: savedHandle });
            } else {
              setRootFolder({ name: savedHandle.name, handle: savedHandle, needPermission: true } as any);
            }
          } else {
            setRootFolder(null);
          }
        } catch (idbErr) {
          console.warn('[Onrivi Author] IndexedDB 폴더 핸들 복구 실패:', idbErr);
          setRootFolder(null);
        }
      } else {
        const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;
        let rootPath: string | null = null;

        // 🎯 [최종 청정화]: 웹 브라우저든 일렉트론이든 백엔드를 안 쓰면 
        // 굳이 fetch 쳐서 에러 내지 말고, 무조건 로컬 캐시를 쓰도록 안전 유도!
        const savedFolder = localStorage.getItem('rootFolder');

        if (savedFolder) {
          try {
            const folder = JSON.parse(savedFolder);
            const hasInvalidChar = folder.name && (
              folder.name.includes('?') ||
              folder.name.includes('\uFFFD')
            );
            if (hasInvalidChar) {
              showToast('워크스페이스 캐시가 유효하지 않아 초기화합니다.', 'warning');
              localStorage.removeItem('rootFolder');
              localStorage.removeItem('workspaceType');
              setRootFolder(null);
            } else if (folder.name && folder.name !== '브라우저 스토리지' && folder.name !== 'C:\\') {
              setRootFolder(folder);
            } else {
              localStorage.removeItem('rootFolder');
              localStorage.removeItem('workspaceType');
            }
          } catch (e) {
            localStorage.removeItem('rootFolder');
          }
        }
      }

      setMounted(true);
    };

    restoreSettings();
  }, [editorRef]);

  // ====================================================================
  // 📊 [OMD-EDIT-USEEDITORSETTINGS-0001] useEditorSettings.ts ➔ settingsSyncEffect
  // 🎯 @KICK  : isDarkMode/fontSize 등 설정 변경 시 localStorage/chrome/Electron에 동기화 저장
  // 🛡️ @GUARD : mounted 상태 미달 시 early return
  // 🚨 @PATCH : 없음
  // 🔗 @CALLS : api.saveSettings, chrome.storage.local.set
  // ====================================================================
  // 2. 설정 동기화 저장
  useEffect(() => {
    if (!mounted) return;

    const settings = {
      isDarkMode,
      fontSize,
      wordWrap,
      autoSave,
      previewMode,
      quoteStyle,
      customHotkeys,
      customSlashCommands,
      licenseKey,
      themePalette
    };

    localStorage.setItem('onrivi_settings', JSON.stringify(settings));
    localStorage.setItem('theme', 'light');
    localStorage.setItem('fontSize', fontSize.toString());
    localStorage.setItem('wordWrap', wordWrap);
    localStorage.setItem('quoteStyle', quoteStyle);
    localStorage.setItem('customHotkeys', JSON.stringify(customHotkeys));
    localStorage.setItem('customSlashCommands', JSON.stringify(customSlashCommands));
    localStorage.setItem('themePalette', themePalette);
    localStorage.setItem('autoSave', autoSave ? 'true' : 'false');
    if (previewMode !== 'css-style') localStorage.setItem('previewMode', previewMode);

    const chromeStorage = (window as any).chrome?.storage?.local;
    if (chromeStorage) {
      chromeStorage.set({ onrivi_settings: settings });
    }

    const api = (window as any).electronAPI;
    if (api && typeof api.saveSettings === 'function') {
      api.saveSettings(settings);
    }
  }, [
    mounted,
    isDarkMode,
    fontSize,
    wordWrap,
    autoSave,
    previewMode,
    quoteStyle,
    customHotkeys,
    customSlashCommands,
    licenseKey,
    themePalette
  ]);

  return {
    isDarkMode,
    setIsDarkMode,
    fontSize,
    setFontSize,
    wordWrap,
    setWordWrap,
    autoSave,
    setAutoSave,
    quoteStyle,
    setQuoteStyle,
    themePalette,
    setThemePalette,
    licenseKey,
    setLicenseKey,
    customHotkeys,
    setCustomHotkeys,
    customSlashCommands,
    setCustomSlashCommands,
    customSlashCommandsRef,
    handleThemeChange
  };
};
