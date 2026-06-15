/**
 * 프로그램명 : OnriviAuthor 
 * 버전 정보 : 1.0.1
 * 프로그램 ID : oaar-001
 * -----------------------------------------------------------------------
 * 변경내역
 * -----------------------------------------------------------------------
 * <2026.05.29> 최초작성
 * 작성자 : 채병익
 * 기능 설명 : 전체 시스템의 컨트롤 타워.
 * 모든 전역 상태 및 화면 분할 레이아웃 조립.
 * 메뉴바 , 툴바, 상태바, 사이드바 등 모든 컴포넌트의 렌더링을 책임짐.
 * -----------------------------------------------------------------------
 */

// @ts-nocheck

"use client"; // next.js의 규칙, 이 페이지는 client side에서 렌더링됨. 
//지시어 종류실행 및 렌더링 위치설명 및 아키텍처적 역할"use client";
//최종 유저의 웹 브라우저자바스크립트 Hooks(useState, useEffect)를 허용하고, 마우스 클릭·키보드 타이핑 등 실시간 UI 인터랙션을 처리할 때 선언합니다.
//"use server";백엔드 Node.js 서버프론트엔드(브라우저)에서 백엔드 서버의 함수를 마치 API 호출하듯이 다이렉트로 안전하게 원격 실행할 수 있게 만드는 서버 
//액션(Server Actions) 전용 지시어입니다. (보안 키 검증, DB 직접 CRUD 시 사용)

/** ======================================================================== 
 * 참고 
 *  src/lib/api.ts -> api 서버 경로
 * =========================================================================
*/

import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';   // 리액트 훅 - 상태관리, 렌더링 제어 등
import Editor, { loader } from '@monaco-editor/react'; // 모나코 에디터 - 코드 편집기
import MarkdownViewer from '@/components/MarkdownViewer'; // 마크다운 뷰어 - 마크다운 뷰어
import MarkdownPageViewer from '@/components/MarkdownPageViewer'; // 📄 용지별 자동 페이지 나누기 뷰어
import Script from 'next/script'; // 넥스트 스크립트 - 
import 'katex/dist/katex.min.css'; // 카텍스 스타일 - 수학 공식 렌더링

/**
 * ==================================================================================
 * 아이콘 라이브러리 - lucide-react 
 * PanelLeft as SidebarIcon, FileText, Copy, Check, Folder, Plus, FolderPlus, Edit2,
  ChevronRight, ChevronDown, FileJson, FileCode, FileType, File, Trash2,
  Layers, X
 * ==================================================================================
 */
import {
  PanelLeft as SidebarIcon, FileText, Copy, Check, Folder, Plus, FolderPlus, Edit2,
  ChevronRight, ChevronDown, FileJson, FileCode, FileType, File, Trash2,
  Layers, X, Eraser
} from 'lucide-react';

/**
 * ==================================================================================
 * 프로젝트 내부 모듈 @가 있는 내부 components 참조선언
 * ==================================================================================
 */
import { useToast } from '@/components/ToastProvider';  // 토스트 메시지
import { msg } from '@/lib/msg'; // 메시지
import { getApiUrl } from '@/lib/api'; // api 서버 경로
import { exportPDF, exportHTML, exportEPUB, exportPNG } from '@/lib/exportHandlers'; // 파일 내보내기 핸들러
import { configureMonacoEnvironment } from '@/lib/monacoEnv'; // Monaco 환경 설정
import { idb, FileNode, scanDirectory, getFileIcon } from '@/lib/helper'; // indexedDB 헬퍼
import { preprocessMarkdownForPreview, stripFrontmatter } from "@/lib/editorUtils"; // 마크다운 프리뷰
import { getSlashCommands, getDefaultHotkeys, getDefaultCommands, TOOLBAR_ITEMS } from "@/lib/toolbarConfig"; // 툴바 설정
import { EDITOR_THEMES, THEME_MAP } from "@/lib/editorThemes"; // 에디터 테마
import { CssProfile } from "@/types/cssProfile"; // css 프로필 타입
import { DEFAULT_PROFILE, SYSTEM_PROFILES, isSystemProfileId } from "@/constants/cssProfile"; // 기본 프로필
import { WELCOME_CONTENT } from "@/constants/welcomeContent"; // 웰컴 컨텐츠
import { getWelcomeContent, saveWelcomeContent } from "@/constants/welcomeContent"; // 웰컴 컨텐츠
import CssStyleForm from "@/components/CssStyleForm"; // css 스타일 폼
import { getVfsFiles, vfsReadFile, vfsWriteFile, vfsCreateFile, vfsCreateFolder } from '@/lib/vfsHelper'; // 가상 파일 시스템 헬퍼
import ColorText from '@/components/ColorText'; // 컬러 텍스트
import FileTreeItem from '@/components/FileTreeItem'; // 파일 트리 아이템
import CopyButton from '@/components/CopyButton'; // 버튼
import ExportModal from '@/components/ExportModal'; // 모달
import OAIcon from './icon_onriveauther.png'; // 아이콘 

// 분리된 컴포넌트들 임포트
import MenuBar from '@/components/MenuBar'; // 메뉴바
import Toolbar from '@/components/Toolbar'; // 툴바
import StatusBar from '@/components/StatusBar'; // 상태바
import ImageModal from '@/components/ImageModal'; // 모달
import MapModal from '@/components/MapModal'; // 모달
import TableModal from '@/components/TableModal'; // 모달
import SettingsModal from '@/components/SettingsModal'; // 모달
import PromptModal from '@/components/PromptModal'; // 모달
import GlobalSearch from '@/components/GlobalSearch'; // 모달
import LeftSidebar from '@/components/LeftSidebar'; // 모달
import ConfirmModal from '@/components/ConfirmModal'; // 모달
import FormulaModal from '@/components/FormulaModal'; // 모달
import MergeModal from '@/components/MergeModal'; // 모달
import YoutubeModal from '@/components/YoutubeModal'; // 모달
import AboutModal from '@/components/AboutModal'; // 모달
import LicenseModal from '@/components/LicenseModal'; // 라이선스 모달
import { supabase } from '@/lib/supabaseClient';
import { saveSecureData, loadSecureData } from '@/lib/secureStorage';
import UnifiedTabBar, { EditorTab } from '@/components/UnifiedTabBar';
import * as utilsPasteHandlers from '@/utils/pasteHandlers';
import * as utilsEditorActions from '@/utils/editorActions';
import { useEditorTabs } from '@/hooks/useEditorTabs';
import { useEditorSettings } from '@/hooks/useEditorSettings';
import { usePageBreak } from '@/hooks/usePageBreak';
import { useEditorHandlers } from '@/hooks/useEditorHandlers';
import { useFileExplorer } from '@/hooks/useFileExplorer';


/**
 * ==================================================================================
 * 타입 선언
 * ==================================================================================
 */

/**
 * @fileType 
 *  @File 
 *  @Description 
 *  @Link https://onrivi.com/documentation/workflow/workflow/20240320123456-editorcommandtypes
 *  @note @/app/page.tsx에서 명령어를 직접 사용하는 대신 @/lib/editorCommandType.ts에서 정의된 명령어 타입을 사용  
 *        모나코 에디터의 명령어를 @/lib/editorCommandType.ts에 정의된 명령어 타입으로 매핑하여 사용  
 *        @/lib/editorCommandType.ts는 @/app/page.tsx에서 사용되는 모나코 에디터의 명령어를 정의한 파일   
 */

export type EditorCommandType =
  | 'NEW_FILE' | 'SAVE' | 'SAVE_AS' | 'OPEN_WORKSPACE'                   //① 파일 시스템 및 입출력 제어 (OS I/O Message)
  | 'EXPORT_PDF' | 'EXPORT_HTML' | 'EXPORT_EPUB' | 'EXPORT_PNG' | 'EXIT'                    //② 출력(Export) 및 종료  
  | 'UNDO' | 'REDO' | 'FIND' | 'REPLACE' | 'ZOOM_IN' | 'ZOOM_OUT'                      //③ 편집 및 보기 제어
  | 'GLOBAL_SEARCH' | 'TOGGLE_HELP' | 'ERASER' | 'BOLD' | 'ITALIC'                       //④ 스타일 적용
  | 'STRIKETHROUGH' | 'INLINE_CODE' | 'H1' | 'H2' | 'H3' | 'H4' | 'H5' | 'H6'                 //⑤ 스타일 적용
  | 'HR' | 'ORDERED_LIST' | 'UNORDERED_LIST' | 'QUOTE' | 'CHECKLIST'                   //⑥ 스타일 적용
  | 'LINK' | 'IMAGE' | 'VIDEO' | 'MAP' | 'TABLE' | 'CODE' | 'LATEX' | 'CLEAN_DOC'       //⑦ 스타일 적용
  | 'YOUTUBE' | 'NOW' | 'CODE_BLOCK' | 'CHART' | 'MATH' | 'SETTINGS'                  //⑧ 스타일 적용
  | 'ABOUT' | 'LICENSE' | 'TOGGLE_FLOATING_TOOLBAR' | 'OPEN_EXPORT' | 'REMOVE_PREFIX' | 'LIST' | 'CHECK' | 'COPY_ALL'  //⑨ 스타일 적용
  | 'TOGGLE_TOOLBAR' | 'TOGGLE_SIDEBAR' | 'TOGGLE_MODE' | 'TOGGLE_THEME'                  //⑩ 스타일 적용 
  | 'WRAP_H1' | 'WRAP_H2' | 'WRAP_H3' | 'WRAP_QUOTE' | 'WRAP_CODE'                       // ⑪ 스타일 적용 
  | 'TOGGLE_CSS_STYLE' | 'SETTINGS_SHORTCUTS'                                                                // ⑫ 스타일 적용 
  | 'FOOTNOTE'                                                                         // ⑬ 각주 삽입 
  | 'INSERT_TABLE_ROW' | 'DELETE_TABLE_ROW'                                               // ⑭ 표 행 편집 명령
  | 'TAGLINK' | 'DOCLINK' | 'PAGE_BREAK';                                                                          // ⑮ 문서링크 및 페이지나누기                                                                          // ⑮ 문서링크 및 페이지나누기

// 모듈 레벨 Monaco 설정: 컴포넌트 렌더 전에 loader 경로 확정 (레이스 컨디션 방지)
if (typeof window !== 'undefined') { // @window : 브라우저에서만 사용되는 객체, @undefined : 브라우저가 아닌 환경(Node.js 등)에서 사용되는 값 
  const addonQuery = new URLSearchParams(window.location.search).get('env') === 'addon'; // @addonQuery : 환경 변수 
  const addonRuntime = !!((window as any).chrome?.runtime?.id); // @addonRuntime : 환경 변수 

  // 크롬 확장 프로그램 환경에서만 Monaco loader 경로를 설정 (레이스 컨디션 방지)
  if (addonQuery || addonRuntime) { // @addonQuery : 환경 변수, @addonRuntime : 환경 변수 
    const getExtensionUrl = (relativePath: string) => { // @getExtensionUrl : 환경 변수 
      if (typeof (window as any).chrome?.runtime?.getURL === 'function') { // @getExtensionUrl : 환경 변수 
        return (window as any).chrome.runtime.getURL(relativePath); // @getExtensionUrl : 환경 변수 
      }
      return relativePath; // @getExtensionUrl : 환경 변수 
    };
    (window as any).MonacoEnvironment = {
      getWorkerUrl: function (_moduleId: string, label: string) { // @getWorkerUrl : 환경 변수 
        // 🛡️ 크롬 확장 프로그램 MV3의 CSP(script-src 'self') 제약 하에서는
        // 동일 origin인 로컬 패키지 내의 vs/base/worker/workerMain.js 경로를 다이렉트로 반환하여
        // 동일 origin(chrome-extension://) 하에 워커 컨텍스트를 생성해야 내부 importScripts 로드가 차단되지 않습니다.
        return getExtensionUrl('/monaco-editor/min/vs/base/worker/workerMain.js');
      }
    };
    try {
      const vsPath = getExtensionUrl('/monaco-editor/min/vs');
      loader.config({ paths: { vs: vsPath } });
    } catch (err) {
      showToast('에디터 로드 실패. 오프라인 모드로 안전 복구합니다.', 'warning');
    }
  } else {
    // 🌐 Electron / Local Web: 로컬 또는 CDN Monaco 워커 설정
    configureMonacoEnvironment();
  }
}


/**
 * @file 
 * @description 초기 마크다운 텍스트 
 * @note @/app/page.tsx에서 사용되는 초기 마크다운 텍스트 정의  
 *       모나코 에디터의 초기 마크다운 텍스트로 사용됨
 */

const getMdFiles = (nodes: FileNode[]): FileNode[] => {
  const result: FileNode[] = [];
  const traverse = (list: FileNode[]) => {
    for (const node of list) {
      if (node.kind === 'file') {
        const ext = node.name.split('.').pop()?.toLowerCase();
        if (ext === 'md' && node.path) {
          result.push(node);
        }
      } else if (node.kind === 'directory' && node.children) {
        traverse(node.children);
      }
    }
  };
  traverse(nodes);
  return result;
};

const fetchAllMdFiles = async (
  workspaceType: string,
  fileList: FileNode[],
  rootFolder: { name: string; handle?: any } | null
): Promise<FileNode[]> => {
  const api = (window as any).electronAPI;

  if (workspaceType === 'browser') {
    return getMdFiles(fileList);
  }

  if (workspaceType === 'local') {
    if (api?.listDirectory && rootFolder?.name) {
      const allFiles: FileNode[] = [];
      const visited = new Set<string>();

      const scan = async (dirPath: string) => {
        if (visited.has(dirPath)) return;
        visited.add(dirPath);
        try {
          const list: FileNode[] = await api.listDirectory(dirPath);
          for (const item of list) {
            if (item.kind === 'file') {
              const nameLower = item.name.toLowerCase();
              if (nameLower.endsWith('.md') || nameLower.endsWith('.markdown')) {
                allFiles.push(item);
              }
            } else if (item.kind === 'directory' && item.path) {
              await scan(item.path);
            }
          }
        } catch (e) {
          console.error('[fetchAllMdFiles] scan error for path:', dirPath, e);
        }
      };

      await scan(rootFolder.name);
      return allFiles;
    }

    try {
      const res = await fetch(getApiUrl(`/api/files?t=${Date.now()}`));
      if (res.ok) {
        const list = await res.json();
        return getMdFiles(list);
      }
    } catch (err) {
      console.error('[fetchAllMdFiles] fetch full files error:', err);
    }
  }

  return getMdFiles(fileList);
};

const resolveRelativeImagePath = (srcPath: string, currentFileNodePath: string | undefined): string => {
  if (!srcPath) return "";   // @srcPath : 이미지 경로 

  if (srcPath.startsWith('http://') || srcPath.startsWith('https://') || srcPath.startsWith('data:') || srcPath.startsWith('blob:')) {
    return srcPath;   // @srcPath : 절대 경로 (외부 링크, data URI, blob URI 등) 
  }

  // 💡 [윈도우 절대 경로 방어] 드라이브 문자(D:/)나 절대 경로로 시작하면 그대로 반환합니다.
  const normalizedSrc = srcPath.replace(/\\/g, '/');
  const isAbsolute = /^[a-zA-Z]:\//.test(normalizedSrc) || normalizedSrc.startsWith('/');
  if (isAbsolute) {
    return normalizedSrc;
  }

  // @currentFileNodePath : 현재 파일의 노드 경로 
  let baseFolder = "";
  if (currentFileNodePath) {
    const normalizedFile = currentFileNodePath.replace(/\\/g, '/'); // @normalizedFile : 현재 파일의 노드 경로 (정규화)
    const lastSlash = normalizedFile.lastIndexOf('/'); // @lastSlash : 현재 파일의 노드 경로에서 마지막 슬래시의 위치 
    if (lastSlash !== -1) {
      baseFolder = normalizedFile.substring(0, lastSlash); // @baseFolder : 현재 파일의 노드 경로에서 마지막 슬래시 이전의 경로 
    }
  }

  // @cleanSrc : 이미지 경로 (정규화) 
  let cleanSrc = srcPath.replace(/\\/g, '/'); // @cleanSrc : 이미지 경로 (정규화) 
  if (cleanSrc.startsWith('/')) {
    cleanSrc = cleanSrc.substring(1); // @cleanSrc : 이미지 경로 (정규화) 
  }

  if (cleanSrc.startsWith('./')) {
    cleanSrc = cleanSrc.substring(2); // @cleanSrc : 이미지 경로 (정규화) 
  }

  // @finalPath : 이미지 경로 (절대 경로) 
  let finalPath = "";
  if (baseFolder) {
    finalPath = baseFolder + '/' + cleanSrc; // @finalPath : 이미지 경로 (절대 경로) 
  } else {
    finalPath = cleanSrc; // @finalPath : 이미지 경로 (절대 경로) 
  }

  // @segments : 이미지 경로 (분석된 경로) 
  const segments = finalPath.split('/');
  const stack: string[] = [];
  for (const seg of segments) {
    if (seg === '.' || seg === '') continue; // @seg : 이미지 경로 (분석된 경로) 
    if (seg === '..') {
      stack.pop(); // @stack : 이미지 경로 (분석된 경로) 
    } else {
      stack.push(seg); // @stack : 이미지 경로 (분석된 경로) 
    }
  }

  return stack.join('/'); // @stack : 이미지 경로 (분석된 경로) 
};

const getRelativePath = (fromPath: string | null | undefined, toPath: string): string => {
  if (!fromPath) {
    return toPath.startsWith('/') || toPath.startsWith('.') ? toPath : `./${toPath}`;
  }
  const normFrom = fromPath.replace(/\\/g, '/');
  const normTo = toPath.replace(/\\/g, '/');
  const fromParts = normFrom.split('/').filter(Boolean);
  const toParts = normTo.split('/').filter(Boolean);
  
  // 파일명을 제외한 폴더 경로만 추출
  fromParts.pop(); 
  
  let commonIndex = 0;
  while (commonIndex < fromParts.length && commonIndex < toParts.length && fromParts[commonIndex] === toParts[commonIndex]) {
    commonIndex++;
  }
  
  const upCount = fromParts.length - commonIndex;
  const upParts = Array(upCount).fill('..');
  const downParts = toParts.slice(commonIndex);
  
  const relParts = [...upParts, ...downParts];
  let relPath = relParts.join('/');
  if (!relPath.startsWith('.') && !relPath.startsWith('/')) {
    relPath = './' + relPath;
  }
  return relPath;
};

export default function MainEditorApp() {                  // @MainEditorApp : MainEditorApp component  
  const { showToast } = useToast();             // @showToast : Toast component  
  const [mounted, setMounted] = useState(false);  // @mounted : mounted state 
  const [content, setContent] = useState('');   // @content : content state 
  
  const contentRef = useRef(content);
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  const [previewMode, setPreviewModeRaw] = useState<'edit' | 'both' | 'preview' | 'css-style'>('both');
  const previewModeRef = useRef(previewMode);
  const isEditorMountedRef = useRef(false);

  // 💡 [TDZ 방어] 모든 상태를 즉시 const로 선언하여 Webpack 번들러의 TDZ 최적화 오류 방지
  // 이후 useEditorSettings 훅 호출 시 해당 훅의 반환값으로 구조분해 재선언하지 않고,
  // 컴포넌트 내에서 useEditorSettingsResult.xxx 형태로 직접 접근합니다.
  const [_isDarkMode_init, _setIsDarkMode_init] = useState(false);
  const [_fontSize_init, _setFontSize_init] = useState<number>(14);
  const [_wordWrap_init, _setWordWrap_init] = useState<'on' | 'off'>('on');
  const [_autoSave_init, _setAutoSave_init] = useState(true);
  const [_quoteStyle_init, _setQuoteStyle_init] = useState<'modern' | 'clean' | 'none'>('modern');
  const [_themePalette_init, _setThemePalette_init] = useState<string>('onrivi-light');
  const [_licenseKey_init, _setLicenseKey_init] = useState<string>('');
  const [_customHotkeys_init, _setCustomHotkeys_init] = useState<Record<string, string>>({});
  const [_customSlashCommands_init, _setCustomSlashCommands_init] = useState<Record<string, string>>({});
  const _customSlashCommandsRef_init = useRef<Record<string, string>>({});
  const _handleThemeChange_init = () => {};

  const _isAutoPageBreakingRef_init = useRef(false);
  const _lastPageBreakCountRef_init = useRef(0);
  const _handleResetPageBreaks_init = () => {};
  const _executeAutoPageBreak_init = () => {};

  // 💡 [초기화 순서 방어] 라이선스 및 디바이스 ID 상태 선행 선언
  const [deviceId, setDeviceId] = useState<string>('');
  const [licenseStatus, setLicenseStatus] = useState({
    isActivated: false,
    isExpired: false,
    remainingDays: 14,
    userId: '',
    licenseKey: ''
  });

  // 💡 [초기화 순서 방어] useEditorTabs 반환 바인딩 전 하위 함수들이 참조하는 탭 관리 상태의 선행 선언
  const [tabs, setTabs] = useState<any[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const tabsRef = useRef<any[]>([]);
  const activeTabIdRef = useRef<string | null>(null);

  // 💡 미리보기 업데이트 지연 디바운스 타이머 Ref (타이핑 시 번쩍거림/깜빡거림 방쇄)
  const previewDebounceRef = useRef<NodeJS.Timeout | null>(null);
  // 💡 [IME 락 가드] 한글 IME 조합 진행 여부를 저장하는 Ref
  const isComposingRef = useRef(false);



  // 💡 [SYNC-03 / 요구사항 3] 양방향 스크롤 관성 튕김 루프 원천 차단을 위해 호버 감지 Ref 도입
  const isEditorHovered = useRef(false);
  const isPreviewHovered = useRef(false);



  const [activeLine, setActiveLine] = useState<number | null>(null); // @activeLine : active line state 
  const lastSelectionRef = useRef<any>(null);    // @lastSelectionRef : last selection state 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // @isSidebarOpen : sidebar open state 
  const [isToolbarOpen, setIsToolbarOpen] = useState(true); // @isToolbarOpen : toolbar open state 
  const [sidebarWidth, setSidebarWidth] = useState(340); // @sidebarWidth : sidebar width state 
  /*
   * profiles state — CssProfile 배열
   * - 시스템 프로필(SYSTEM_PROFILES)은 항상 앞에 고정
   * - 사용자 프로필: Addon → localStorage, Desktop → electronAPI(userData)
   */
  const [profiles, setProfiles] = useState<CssProfile[]>(() => {
    if (typeof window === 'undefined') return [...SYSTEM_PROFILES];
    // SSR 이후: 시스템 프로필만 우선 세팅, 사용자 프로필은 useEffect에서 비동기 로드
    return [...SYSTEM_PROFILES];
  });
  // 사용자 프로필 로드 (환경별)
  useEffect(() => {
    if (!mounted) return;
    const api = (window as any).electronAPI;
    const loadUserProfiles = async () => {
      let userProfiles: CssProfile[] = [];
      if (api) {
        // Desktop: electronAPI
        userProfiles = await api.readProfiles();
      } else {
        // Addon/Browser: localStorage
        try {
          const saved = localStorage.getItem('userCssProfiles');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) userProfiles = parsed;
          } else {
            // 구버전 마이그레이션
            const oldSaved = localStorage.getItem('cssProfiles');
            if (oldSaved) {
              const parsed = JSON.parse(oldSaved);
              if (Array.isArray(parsed)) {
                userProfiles = (parsed as CssProfile[]).filter(p => !isSystemProfileId(p.id) && p.id !== 'default');
              }
              localStorage.removeItem('cssProfiles');
            }
          }
        } catch {}
      }
      setProfiles(prev => {
        const systemPart = prev.filter(p => isSystemProfileId(p.id));
        return [...systemPart, ...userProfiles];
      });
    };
    loadUserProfiles();
  }, [mounted]);
  const [activeProfileId, setActiveProfileId] = useState<string>(
    () => SYSTEM_PROFILES[0].id
  );
  const [isAddonEnv, setIsAddonEnv] = useState(false);
  const [helpContent, setHelpContent] = useState<string | null>(null);
  const [helpTitle, setHelpTitle] = useState('');
  const helpContentRef = useRef(helpContent);
  helpContentRef.current = helpContent;

  useEffect(() => {
    previewModeRef.current = previewMode;
  }, [previewMode]);

  // helpContent 설정 시 previewMode를 'preview'로 강제 전환
  useEffect(() => {
    if (helpContent) {
      setPreviewModeRaw('preview');
      previewModeRef.current = 'preview';
      isEditorMountedRef.current = false;
    }
  }, [helpContent]);

  const [rootFolder, setRootFolder] = useState<{ name: string, handle?: any } | null>(null);
  const [fileList, setFileList] = useState<FileNode[]>([]);
  const [workspaceType, setWorkspaceType] = useState<'local' | 'cloud' | 'browser'>('local');
  const [currentFileName, setCurrentFileName] = useState<string>('새 파일.md');
  const [currentFileNode, setCurrentFileNode] = useState<FileNode | null>(null);
  const [promptConfig, setPromptConfig] = useState<{
    isOpen: boolean;
    title: string;
    defaultValue: string;
    type: 'createFile' | 'createFolder' | 'rename' | null;
    error: string;
  }>({ isOpen: false, title: "", defaultValue: "", type: null, error: "" });

  // 📄 [자동 페이지 나누기 미리보기] 상태 선언 및 로컬 스토리지 보존
  const [isPageViewEnabled, setIsPageViewEnabled] = useState(false);
  const [pageCalcKey, setPageCalcKey] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('isPageViewEnabled');
      if (saved === 'true') {
        // 당분간 페이지 나누기 기능을 숨겨두기 위해 강제로 false 상태를 유지합니다.
        // setIsPageViewEnabled(true);
      }
    }
  }, []);

  const handleTogglePageView = useCallback(() => {
    setIsPageViewEnabled(prev => {
      const next = !prev;
      localStorage.setItem('isPageViewEnabled', String(next));
      return next;
    });
  }, []);

  const pendingExternalFileRef = useRef<string | null>(null); // 윈도우 파일 연결 경로 (마운트 전 확보용)
  const [driveLetter, setDriveLetter] = useState('D:');

  // 탭 메타데이터(파일명, 노드 정보, 경로) 변경 시 활성 탭 동기화
  useEffect(() => {
    if (activeTabId) {
      setTabs(prev => prev.map(t => 
        t.id === activeTabId 
          ? { 
              ...t, 
              name: currentFileName, 
              path: currentFileNode?.path || null, 
              node: currentFileNode 
            } 
          : t
      ));
    }
  }, [currentFileName, currentFileNode, activeTabId]);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'toc' | 'search' | 'explorer'>('explorer');

  useEffect(() => {
    if (isSearchOpen) {
      setIsSidebarOpen(true);
      setSidebarTab('search');
    } else if (sidebarTab === 'search') {
      setSidebarTab('toc');
    }
  }, [isSearchOpen]);

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [editingImageInfo, setEditingImageInfo] = useState<{
    range: any;
    alt: string;
    path: string;
    width: string;
    height: string;
    align: string;
  } | null>(null);
  const [isYoutubeModalOpen, setIsYoutubeModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [showTagLinkPicker, setShowTagLinkPicker] = useState(false);
  const [showDocLinkPicker, setShowDocLinkPicker] = useState(false);
  const [docLinkSearchText, setDocLinkSearchText] = useState('');
  const [allMdFiles, setAllMdFiles] = useState<FileNode[]>([]);
  const [isDocLinkLoading, setIsDocLinkLoading] = useState(false);
  
  // 💡 [다른 문서 헤딩 연결] 헤딩 파싱 및 UI 조작을 위한 상태값
  const [selectedDocNode, setSelectedDocNode] = useState<FileNode | null>(null);
  const [docHeadings, setDocHeadings] = useState<string[]>([]);
  const [isHeadingLoading, setIsHeadingLoading] = useState(false);
  const [docHeadingSearchText, setDocHeadingSearchText] = useState('');

  useEffect(() => {
    if (showDocLinkPicker) {
      const loadFiles = async () => {
        setIsDocLinkLoading(true);
        try {
          const files = await fetchAllMdFiles(workspaceType, fileList, rootFolder);
          setAllMdFiles(files);
        } catch (e) {
          console.error(e);
        } finally {
          setIsDocLinkLoading(false);
        }
      };
      loadFiles();
    } else {
      setAllMdFiles([]);
      setDocLinkSearchText('');
      setSelectedDocNode(null);
      setDocHeadings([]);
      setIsHeadingLoading(false);
      setDocHeadingSearchText('');
    }
  }, [showDocLinkPicker, workspaceType, fileList, rootFolder]);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsModalInitialTab, setSettingsModalInitialTab] = useState<'editor' | 'app' | 'shortcuts'>('editor');

  // 1. 디바이스 고유 ID 수집 훅
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initDeviceId = async () => {
      const api = (window as any).electronAPI;
      if (api && typeof api.getMachineId === 'function') {
        // A. 데스크탑 Electron 실기기 ID 수집
        const realId = await api.getMachineId();
        setDeviceId(realId);
      } else {
        // B. 브라우저 애드온 환경
        const chromeStorage = (window as any).chrome?.storage?.sync;
        if (chromeStorage) {
          chromeStorage.get(['onrivi_device_id'], (result: any) => {
            if (result.onrivi_device_id) {
              setDeviceId(result.onrivi_device_id);
            } else {
              const newId = crypto.randomUUID();
              chromeStorage.set({ onrivi_device_id: newId }, () => {
                setDeviceId(newId);
              });
            }
          });
        } else {
          // 일반 브라우저 로컬 스토리지 Fallback
          let localId = localStorage.getItem('onrivi_device_id');
          if (!localId) {
            localId = crypto.randomUUID();
            localStorage.setItem('onrivi_device_id', localId);
          }
          setDeviceId(localId);
        }
      }
    };
    initDeviceId();
  }, []);

  // 2. 라이선스 키 및 확인 인증키 로드 & 검증 훅 (deviceId 세팅 완료 후 실행)
  useEffect(() => {
    if (typeof window === 'undefined' || !deviceId) return;

    const loadAndVerifyLicense = async () => {
      const api = (window as any).electronAPI;
      let savedKey = '';
      let savedVerifyKey = '';
      let savedUserId = '';

      // A. 스토리지 로드
      if (api && typeof api.loadLicenseFull === 'function') {
        // Electron
        const fullData = await api.loadLicenseFull();
        if (fullData) {
          savedKey = fullData.licenseKey || '';
          savedVerifyKey = fullData.verifyKey || '';
          savedUserId = fullData.userId || '';
        }
      } else {
        // 애드온 / 브라우저
        const chromeStorage = (window as any).chrome?.storage?.local;
        if (chromeStorage) {
          const result = await new Promise<any>((resolve) => {
            chromeStorage.get(['onrivi_license_key', 'onrivi_verify_key', 'onrivi_user_id'], resolve);
          });
          savedKey = result.onrivi_license_key || '';
          savedVerifyKey = result.onrivi_verify_key || '';
          savedUserId = result.onrivi_user_id || '';
        } else {
          savedKey = localStorage.getItem('onrivi_license_key') || '';
          savedVerifyKey = localStorage.getItem('onrivi_verify_key') || '';
          savedUserId = localStorage.getItem('onrivi_user_id') || '';
        }
      }

      // B. 라이선스 키가 없는 경우 최초 자체 생성 (로컬에만 키 생성)
      if (!savedKey) {
        try {
          const randomSeed = Math.random().toString(36).substring(2, 10).toUpperCase();
          const textEncoder = new TextEncoder();
          const hashBuffer = await window.crypto.subtle.digest('SHA-256', textEncoder.encode(`ANON|${deviceId}|${randomSeed}`));
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          savedKey = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase().substring(0, 24);

          // 스토리지에 최초 저장
          if (api && typeof api.saveLicenseFull === 'function') {
            await api.saveLicenseFull({ licenseKey: savedKey });
          } else {
            const chromeStorage = (window as any).chrome?.storage?.local;
            if (chromeStorage) {
              chromeStorage.set({ onrivi_license_key: savedKey });
            }
            localStorage.setItem('onrivi_license_key', savedKey);
          }
        } catch (e) {
          // 오프라인 대비 임시 로컬 키 생성
          savedKey = `ANON-${deviceId.substring(0, 16)}`.toUpperCase();
        }
      }

      setLicenseKey(savedKey);

      // C. Supabase DB 라이선스 검증 (실제 schema 조인 쿼리 검사)
      if (savedVerifyKey) {
        try {
          const { data, error } = await supabase
            .from('license_activations')
            .select(`
              activated_at,
              software_licenses!inner (
                is_active,
                verify_key,
                license_key,
                subscription_id,
                subscriptions (
                  trial_end_at,
                  current_period_end
                )
              )
            `)
            .eq('device_uuid', deviceId)
            .eq('software_licenses.verify_key', savedVerifyKey)
            .single();

          if (!error && data) {
            const license = (data as any).software_licenses;
            const sub = license?.subscriptions;
            const isActivated = license?.is_active === true;
            
            let trialEndMs = Date.now() + 14 * 24 * 60 * 60 * 1000;
            if (sub) {
              const targetDate = sub.current_period_end || sub.trial_end_at;
              if (targetDate) trialEndMs = new Date(targetDate).getTime();
            }
            
            const elapsed = Date.now() - trialEndMs;
            const isExpired = !isActivated && elapsed > 0;
            const remainingDays = isActivated ? 0 : Math.max(0, Math.ceil((trialEndMs - Date.now()) / (24 * 60 * 60 * 1000)));

            setLicenseStatus({
              isActivated: isActivated,
              isExpired: isExpired,
              remainingDays: remainingDays,
              userId: savedUserId,
              licenseKey: savedKey
            });
            
            // 암호화 보안 캐시 갱신
            saveSecureData('onrivi_license_status', { isActivated, isExpired, remainingDays, userId: savedUserId, licenseKey: savedKey, lastVerifiedAt: Date.now() });
            return;
          }
        } catch (err) {}
      }

      // D. 로컬 암호화 보안 캐시 로드 및 오프라인 검증 (유예 기간 3일 체크)
      const cached = loadSecureData<any>('onrivi_license_status');
      if (cached && cached.licenseKey === savedKey && cached.userId === savedUserId) {
        const elapsedSinceVerify = Date.now() - (cached.lastVerifiedAt || 0);
        const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
        if (elapsedSinceVerify < threeDaysMs) {
          setLicenseStatus({
            isActivated: cached.isActivated,
            isExpired: cached.isExpired,
            remainingDays: cached.remainingDays,
            userId: cached.userId,
            licenseKey: cached.licenseKey
          });
          return;
        }
      }

      // E. 확인 인증키가 없거나 오프라인인 경우의 Fallback (최초 가입 시 14일 체험 보장)
      let firstTime = localStorage.getItem('onrivi_first_run_time');
      if (!firstTime) {
        firstTime = Date.now().toString();
        localStorage.setItem('onrivi_first_run_time', firstTime);
      }
      const elapsed = Date.now() - parseInt(firstTime, 10);
      const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
      const isExpired = elapsed > fourteenDaysMs;
      const remainingDays = Math.max(0, Math.ceil((fourteenDaysMs - elapsed) / (24 * 60 * 60 * 1000)));

      setLicenseStatus({
        isActivated: false,
        isExpired: isExpired,
        remainingDays: remainingDays,
        userId: savedUserId,
        licenseKey: savedKey
      });
    };

    loadAndVerifyLicense();
  }, [deviceId]);

  // 3. Supabase Realtime 기반 결제/정품 실시간 반영 훅 + 데스크톱 프로토콜 수신
  useEffect(() => {
    if (!deviceId) return;

    // A. Supabase 실시간 DB 상태 모니터링 구독 (license_activations 변경 감시)
    const channel = supabase
      .channel(`device-activation-${deviceId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT/UPDATE/DELETE 모두 감지
          schema: 'public',
          table: 'license_activations',
          filter: `device_uuid=eq.${deviceId}`
        },
        async (payload: any) => {
          const newRecord = payload.new;
          if (newRecord && newRecord.license_id) {
            // 연동된 software_licenses 테이블에서 verify_key 및 user 이메일을 직접 조회
            const { data, error } = await supabase
              .from('software_licenses')
              .select(`
                verify_key,
                users (
                  email
                )
              `)
              .eq('id', newRecord.license_id)
              .single();

            if (!error && data && data.verify_key) {
              const userEmail = (data as any).users?.email || licenseStatus.userId || 'user@onrivi.com';
              handleSuccessActivation(data.verify_key, userEmail);
              showToast("🎉 정품 라이선스가 결제 즉시 안전하게 승인되었습니다!", "success");
            }
          }
        }
      )
      .subscribe();

    // B. 데스크톱 기존 프로토콜 수신 백업
    const api = (window as any).electronAPI;
    let removeListener: any = null;
    if (api && typeof api.onLicenseActivated === 'function') {
      removeListener = api.onLicenseActivated((updatedData: any) => {
        handleSuccessActivation(updatedData.verifyKey, updatedData.userId);
        showToast("🎉 정품 라이선스가 자동으로 성공적으로 등록되었습니다!", "success");
      });
    }

    return () => {
      supabase.removeChannel(channel);
      if (typeof removeListener === 'function') removeListener();
    };
  }, [deviceId, _licenseKey_init]);

  // 💡 정품 인증 완료 성공 시 로컬 및 플랫폼 스토리지 영구 저장 핸들러
  const handleSuccessActivation = async (verifyKey: string, userId: string) => {
    const api = (window as any).electronAPI;

    setLicenseStatus(prev => ({
      ...prev,
      isActivated: true,
      isExpired: false,
      userId: userId
    }));

    if (api && typeof api.saveLicenseFull === 'function') {
      await api.saveLicenseFull({
        licenseKey: licenseKey,
        verifyKey: verifyKey,
        userId: userId
      });
    } else {
      const chromeStorage = (window as any).chrome?.storage?.local;
      if (chromeStorage) {
        chromeStorage.set({
          onrivi_verify_key: verifyKey,
          onrivi_user_id: userId
        });
      }
      localStorage.setItem('onrivi_verify_key', verifyKey);
      localStorage.setItem('onrivi_user_id', userId);
    }
  };

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
    onCancel?: () => void;
  }>({ isOpen: false, title: "", message: "", onConfirm: () => { } });


  const [isEditorReady, setIsEditorReady] = useState(false);

  const [isMergeMode, setIsMergeMode] = useState(false);
  const [selectedMergeNodes, setSelectedMergeNodes] = useState<FileNode[]>([]);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [cursorLine, setCursorLine] = useState(1);
  const [cursorColumn, setCursorColumn] = useState(1);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | ''>('');
  const [floatingHeadingLevel, setFloatingHeadingLevel] = useState(3);

  const toggleMergeNodeSelect = (node: FileNode) => {
    setSelectedMergeNodes(prev => {
      const exists = prev.some(n => n.path ? n.path === node.path : n.name === node.name);
      if (exists) {
        return prev.filter(n => n.path ? n.path !== node.path : n.name !== node.name);
      } else {
        return [...prev, node];
      }
    });
  };

  const handleOpenMergeModal = () => {
    if (selectedMergeNodes.length < 2) {
      showToast("병합하려면 최소 2개 이상의 파일을 선택해야 합니다.", 'warning');
      return;
    }
    setIsMergeModalOpen(true);
  };





  const previewRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  const autoPageBreakDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // 💡 다중 탭 관련 상태 선언 및 백업 레퍼런스
  const useEditorTabsResult = useEditorTabs(
    editorRef,
    setContent,
    setCurrentFileName,
    setCurrentFileNode,
    isEditorMountedRef,
    previewModeRef,
    previewDebounceRef,
    isComposingRef,
    workspaceType,
    showToast,
    getRelativePath,
    tabs,        // 💡 [TDZ 방어] 최상단에서 선언된 상태를 주입
    setTabs,
    activeTabId,
    setActiveTabId
  );

  // 💡 [TDZ 방어] useEditorTabs 반환값 중 상단에서 선언되지 않은 것들만 추가 추출
  const updateContent = useEditorTabsResult.updateContent;
  const switchTab = useEditorTabsResult.switchTab;
  const createNewTab = useEditorTabsResult.createNewTab;

  // Ref를 공유 tabsRef/activeTabIdRef에 동기화
  tabsRef.current = useEditorTabsResult.tabsRef.current;
  activeTabIdRef.current = useEditorTabsResult.activeTabIdRef.current;

  // 💡 [TDZ 방어] lastSavedContentRef는 useFileExplorer에서 먼저 참조되므로 상단에 선언
  const lastSavedContentRef = useRef<string>('');

  // 💡 [WBS CORE-02 / 요구사항 4] State Stale Closure 방지를 위한 Ref 백업 시스템 도입
  const currentFileNodeRef = useRef(currentFileNode);
  const currentFileParentHandleRef = useRef<any>(null);
  const currentFileNameRef = useRef(currentFileName);
  const workspaceTypeRef = useRef(workspaceType);
  const rootFolderRef = useRef(rootFolder);
  const tabSizeRef = useRef(4);

  useEffect(() => { currentFileNodeRef.current = currentFileNode; }, [currentFileNode]);
  useEffect(() => { currentFileNameRef.current = currentFileName; }, [currentFileName]);
  useEffect(() => { workspaceTypeRef.current = workspaceType; }, [workspaceType]);
  useEffect(() => { rootFolderRef.current = rootFolder; }, [rootFolder]);
  useEffect(() => {
    const activeProfile = profiles.find(p => p.id === activeProfileId) || DEFAULT_PROFILE;
    tabSizeRef.current = parseInt(activeProfile.pageStyle.tabSize) || 4;
  }, [profiles, activeProfileId]);

  const useFileExplorerResult = useFileExplorer({
    editorRef,
    contentRef,
    currentFileNode,
    currentFileName,
    lastSavedContentRef,
    currentFileParentHandleRef,
    tabsRef,
    isSearchOpen,
    activeTabIdRef,
    setContent,
    setCurrentFileName,
    setCurrentFileNode,
    setTabs,
    setActiveTabId,
    setSaveStatus,
    setIsSidebarOpen,
    setIsSearchOpen,
    setHelpContent,
    setHelpTitle,
    setPreviewModeRaw,
    previewModeRef,
    isEditorMountedRef,
    showToast,
    createNewTab,
    switchTab,
    rootFolder,
    setRootFolder,
    fileList,
    setFileList,
    workspaceType,
    setWorkspaceType
  });

  // 💡 [TDZ 방어] useFileExplorer 반환값에서 즉시 구조분해 할당하여 참조 에러 방지
  const {
    refreshFileList,
    saveFile,
    handleFileClick,
    selectRootFolder,
    restoreFolderPermission,
    handleFileOpenByPath
  } = useFileExplorerResult;

  // 💡 [동기식 가드] previewMode 변경 즉시 에디터 마운트 상태 플래그를 제어하는 동기 래핑 헬퍼 함수
  const setPreviewMode = useCallback((modeOrFn: 'edit' | 'both' | 'preview' | 'css-style' | ((prev: 'edit' | 'both' | 'preview' | 'css-style') => 'edit' | 'both' | 'preview' | 'css-style')) => {
    // 모드 전환 전 에디터 내용을 즉시 React 상태에 반영 (100ms 디바운스 손실 방지)
    if (editorRef.current && previewModeRef.current !== 'preview') {
      if (previewDebounceRef.current) {
        clearTimeout(previewDebounceRef.current);
        previewDebounceRef.current = null;
      }
      const latestVal = editorRef.current.getValue();
      if (latestVal !== contentRef.current) {
        setContent(latestVal);
      }
    }
    setPreviewModeRaw(prev => {
      const next = typeof modeOrFn === 'function' ? modeOrFn(prev) : modeOrFn;
      if (prev === 'css-style' && next !== 'css-style') return prev;
      if (helpContentRef.current && next !== 'css-style') return prev;
      
      // 💡 서식 정의(css-style) 모드로 스위칭될 때, 대조할 웰컴페이지 샘플 마크다운 탭을 강제 신규 생성 및 포커싱
      if (next === 'css-style' && prev !== 'css-style') {
        // 💡 도움말이 켜져 있었다면 강제 종료하여 웰컴페이지 미리보기 화면이 보이도록 연동
        setHelpContent(null);
        setHelpTitle('');
        
        const hasWelcomeTab = tabsRef.current.some(t => t.name === '서식 정의 미리보기.md');
        if (!hasWelcomeTab) {
          createNewTab(getWelcomeContent(), '서식 정의 미리보기.md');
        } else {
          const welcomeTab = tabsRef.current.find(t => t.name === '서식 정의 미리보기.md');
          if (welcomeTab) switchTab(welcomeTab.id);
        }
      }

      previewModeRef.current = next;
      if (next === 'preview') {
        isEditorMountedRef.current = false;
      } else {
        isEditorMountedRef.current = true;
      }
      return next;
    });
  }, [setContent, createNewTab, switchTab]);

  const closeTab = useCallback((tabId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }

    const tabToClose = tabsRef.current.find(t => t.id === tabId);
    if (!tabToClose) return;

    const performClose = () => {
      if (tabToClose.model) {
        tabToClose.model.dispose();
      }

      // 💡 서식 설정 전용 '서식 정의 미리보기.md' 탭을 닫으면 서식 설정창(CssStyleForm) 패널도 함께 닫음 (기본 분할 화면 'both' 모드로 전환)
      if (tabToClose.name === '서식 정의 미리보기.md') {
        setPreviewModeRaw('both');
        previewModeRef.current = 'both';
        isEditorMountedRef.current = true;
      }

      const nextTabs = tabsRef.current.filter(t => t.id !== tabId);
      setTabs(nextTabs);

      if (activeTabIdRef.current === tabId) {
        if (nextTabs.length > 0) {
          const closeIndex = tabsRef.current.findIndex(t => t.id === tabId);
          const nextActiveIndex = Math.max(0, closeIndex - 1);
          const nextActiveTab = nextTabs[nextActiveIndex] || nextTabs[0];
          switchTab(nextActiveTab.id);
        } else {
          createNewTab("");
        }
      }
    };

    if (tabToClose.isModified) {
      setConfirmConfig({
        isOpen: true,
        title: "저장되지 않은 변경사항",
        message: `'${tabToClose.name}' 파일의 변경사항이 저장되지 않았습니다. 저장하지 않고 닫으시겠습니까?`,
        confirmText: "저장하지 않고 닫기",
        cancelText: "취소",
        isDanger: true,
        onConfirm: () => {
          performClose();
        }
      });
      return;
    }

    performClose();
  }, [createNewTab, switchTab, setTabs]);
  
  const useEditorSettingsResult = useEditorSettings(
    editorRef,
    mounted,
    setMounted,
    previewMode,
    setPreviewMode,
    setSidebarWidth,
    setActiveProfileId,
    setWorkspaceType,
    setRootFolder,
    setIsAddonEnv,
    showToast
  );

  // 💡 [TDZ 방어] useEditorSettings 반환값을 즉시 구조분해 할당하여 TDZ 에러 방지
  const {
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
  } = useEditorSettingsResult;

  // 💡 [TDZ 방어] autoSaveRef: useEditorSettingsResult에서 autoSave를 확보한 후 선언
  const autoSaveRef = useRef(autoSave);
  useEffect(() => { autoSaveRef.current = autoSave; }, [autoSave]);

  const isActivated = licenseStatus.isActivated;

  const usePageBreakResult = usePageBreak(editorRef, previewRef, profiles, activeProfileId, showToast);

  // 💡 [TDZ 방어] usePageBreak 반환값을 즉시 구조분해 할당
  const {
    isAutoPageBreakingRef,
    lastPageBreakCountRef,
    handleResetPageBreaks,
    executeAutoPageBreak
  } = usePageBreakResult;

  const decorationsCollectionRef = useRef<any>(null);
  const decorationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 🛡️ 미리보기 체크박스 클릭 시 에디터 본문의 상태를 동기화하는 함수
  const handleCheckboxToggle = useCallback((lineNumber: number, checked: boolean) => {
    if (!editorRef.current || typeof window === 'undefined' || !(window as any).monaco) return;
    const editor = editorRef.current;
    const model = editor.getModel();
    if (!model) return;

    if (lineNumber < 1 || lineNumber > model.getLineCount()) return;

    const lineContent = model.getLineContent(lineNumber);
    const checkboxRegex = /^([ \t]*[-*+]\s+\[)([ xX])(\].*)$/;
    const match = lineContent.match(checkboxRegex);

    if (match) {
      const [_, prefix, currentStatus, suffix] = match;
      const newStatus = checked ? 'x' : ' ';
      const newLineContent = `${prefix}${newStatus}${suffix}`;

      const Range = (window as any).monaco.Range;
      editor.pushUndoStop();
      editor.executeEdits("checkboxToggle", [
        {
          range: new Range(lineNumber, 1, lineNumber, lineContent.length + 1),
          text: newLineContent,
          forceMoveMarkers: true,
        }
      ]);
      editor.pushUndoStop();
    }
  }, []);

  const updateDecorations = useCallback((editor: any) => {
    if (!editor || typeof window === 'undefined' || !(window as any).monaco) return;
    const model = editor.getModel();
    if (!model) return;

    const lines = model.getLinesContent();
    const newDecorations: any[] = [];
    const Range = (window as any).monaco.Range;

    lines.forEach((line: string, i: number) => {
      const lineNumber = i + 1;

      // Heading
      const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const prefixLen = level + 1;
        newDecorations.push({
          range: new Range(lineNumber, 1, lineNumber, prefixLen + 1),
          options: { inlineClassName: 'monaco-md-syntax' }
        });
        const cName = level === 1 ? 'monaco-h1-text' : level === 2 ? 'monaco-h2-text' : 'monaco-h3-text';
        newDecorations.push({
          range: new Range(lineNumber, prefixLen + 1, lineNumber, line.length + 1),
          options: { inlineClassName: cName }
        });
      }

      // Bold
      const boldRegex = /\*\*(.*?)\*\*/g;
      let match;
      while ((match = boldRegex.exec(line)) !== null) {
        const start = match.index + 1;
        const end = start + match[0].length;
        newDecorations.push({
          range: new Range(lineNumber, start, lineNumber, start + 2),
          options: { inlineClassName: 'monaco-md-syntax' }
        });
        newDecorations.push({
          range: new Range(lineNumber, end - 2, lineNumber, end),
          options: { inlineClassName: 'monaco-md-syntax' }
        });
        newDecorations.push({
          range: new Range(lineNumber, start + 2, lineNumber, end - 2),
          options: { inlineClassName: 'monaco-bold-text' }
        });
      }

      // Italic
      const italicRegex = /(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g;
      while ((match = italicRegex.exec(line)) !== null) {
        const start = match.index + 1;
        const end = start + match[0].length;
        newDecorations.push({
          range: new Range(lineNumber, start, lineNumber, start + 1),
          options: { inlineClassName: 'monaco-md-syntax' }
        });
        newDecorations.push({
          range: new Range(lineNumber, end - 1, lineNumber, end),
          options: { inlineClassName: 'monaco-md-syntax' }
        });
        newDecorations.push({
          range: new Range(lineNumber, start + 1, lineNumber, end - 1),
          options: { inlineClassName: 'monaco-italic-text' }
        });
      }

      // Strikethrough
      const strikeRegex = /~~(.*?)~~/g;
      while ((match = strikeRegex.exec(line)) !== null) {
        const start = match.index + 1;
        const end = start + match[0].length;
        newDecorations.push({
          range: new Range(lineNumber, start, lineNumber, start + 2),
          options: { inlineClassName: 'monaco-md-syntax' }
        });
        newDecorations.push({
          range: new Range(lineNumber, end - 2, lineNumber, end),
          options: { inlineClassName: 'monaco-md-syntax' }
        });
        newDecorations.push({
          range: new Range(lineNumber, start + 2, lineNumber, end - 2),
          options: { inlineClassName: 'monaco-strikethrough-text' }
        });
      }
    });

    if (decorationsCollectionRef.current) {
      decorationsCollectionRef.current.set(newDecorations);
    }
  }, []);
  const isResizing = useRef(false);
  // autoSaveRef, lastSavedContentRef는 위(L1101)에서 이미 선언됨
  const isScrollingRef = useRef<'editor' | 'preview' | null>(null);
  const scrollTimeoutRef = useRef<any>(null);
  const prevCursorLineRef = useRef<number | null>(null);
  const contentChangeTimeoutRef = useRef<any>(null);
  const completionProviderRef = useRef<any>(null);
  const [floatingToolbar, setFloatingToolbar] = useState<{ visible: boolean, top: number, left: number }>({ visible: false, top: 0, left: 0 });



  const cursorPositionRef = useRef<any>(null);
  const cursorSelectionRef = useRef<any>(null);
  const handlersRef = useRef<any>(null);
  const hotkeyDisposablesRef = useRef<any[]>([]);

  useEffect(() => {
    const previewEl = previewRef.current;
    if (!previewEl) return;

    const handleWheel = (e: WheelEvent) => {
      if (previewModeRef.current === 'both' && editorRef.current) {
        e.preventDefault();
        const editor = editorRef.current;
        const currentScrollTop = editor.getScrollTop();
        editor.setScrollTop(currentScrollTop + e.deltaY);
      }
    };

    previewEl.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      previewEl.removeEventListener('wheel', handleWheel);
    };
  }, [previewMode]);





  // 💡 [다크모드 DOM 스타일 바인딩]
  useEffect(() => {
    if (!mounted) return;
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode, mounted]);

  // 💡 [에디터 설정 및 테마 연동 가드] themePalette, fontSize, wordWrap 변경 시 또는 에디터 마운트 완료 시 모나코 에디터 옵션 및 테마 수동 강제 갱신 (레이스 컨디션 및 시차 방지)
  useEffect(() => {
    if (mounted && isEditorReady && editorRef.current) {
      // 1. 테마 강제 적용
      if ((window as any).monaco) {
        const monaco = (window as any).monaco;
        monaco.editor.setTheme(themePalette);
      }
      // 2. 에디터 옵션(폰트 크기, 줄 바꿈) 강제 동기화
      editorRef.current.updateOptions({
        fontSize: fontSize,
        wordWrap: wordWrap,
      });
      // 3. 레이아웃 리플로우 강제 트리거 (찌그러짐 방지)
      requestAnimationFrame(() => {
        editorRef.current?.layout();
      });
    }
  }, [themePalette, fontSize, wordWrap, mounted, isEditorReady]);

  // 💡 [다크모드 상태 - 테마 팰릿 동기화 가드] 다크모드 토글 시 에디터 테마 팰릿도 세트로 강제 자동 연동 스위칭
  useEffect(() => {
    if (!mounted) return;
    if (isDarkMode) {
      const currentTheme = THEME_MAP[themePalette];
      if (!currentTheme || !currentTheme.isDark) {
        setThemePalette('onrivi-dark');
      }
    } else {
      const currentTheme = THEME_MAP[themePalette];
      if (!currentTheme || currentTheme.isDark) {
        setThemePalette('onrivi-light');
      }
    }
  }, [isDarkMode, mounted, themePalette]);

  useEffect(() => {
    if (!mounted) return;
    const userProfiles = profiles.filter(p => !isSystemProfileId(p.id));
    const api = (window as any).electronAPI;
    if (api) {
      // Desktop: electronAPI 저장
      api.saveProfiles(userProfiles);
    } else {
      // Addon/Browser: localStorage
      try { localStorage.setItem('userCssProfiles', JSON.stringify(userProfiles)); } catch {}
    }
  }, [profiles, mounted]);

  useEffect(() => {
    if (mounted && activeProfileId) {
      localStorage.setItem('activeCssProfileId', activeProfileId);
    }
  }, [activeProfileId, mounted]);

  // workspaceType 변경 시 로컬스토리지 저장은 통합 저장 이펙트 또는 워크스페이스 직접 마운트 로직에서 담당

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      const api = (window as any).electronAPI;
      api.onNewFileRequested(() => handlers.newFile());
      api.onSaveFileRequested(() => handlers.save());
      api.onSaveFileAsRequested(() => handlers.saveAs());

      // 윈도우 파일 연결(더블클릭)로 외부 .md 파일 열기 요청 수신 (두 번째 실행부터)
      let unsubscribeReceiveFile: (() => void) | undefined;
      if (api.onReceiveFile) {
        unsubscribeReceiveFile = api.onReceiveFile((filePath: string) => {
          openExternalFile(filePath);
        });
      }

      // restoreSettings에서 확보해 둔 pending 파일 경로 처리
      if (pendingExternalFileRef.current) {
        const path = pendingExternalFileRef.current;
        pendingExternalFileRef.current = null;
        openExternalFile(path);
      }

      return () => {
        api.removeListeners();
        if (unsubscribeReceiveFile) unsubscribeReceiveFile();
      };
    }
  }, [mounted, content, currentFileNode]);

  // 외부 파일 연결(더블클릭) 전용 핸들러: fileList/workspaceType 무관하게 직접 읽어서 표시
  const openExternalFile = async (filePath: string) => {
    try {
      const api = (window as any).electronAPI;
      if (api?.readFromPath) {
        const file = await api.readFromPath(filePath);
        if (file) {
          const existingTab = tabsRef.current.find(t => t.path === file.path);
          if (existingTab) {
            switchTab(existingTab.id);
            showToast(`📂 ${file.name}`, "info");
            return;
          }
          
          const monaco = (window as any).monaco;
          let model: any = null;
          if (monaco) {
            model = monaco.editor.createModel(file.content, 'markdown');
            model.onDidChangeContent(() => {
              const val = model.getValue();
              setContent(val);
              setTabs(prev => prev.map(t => t.id === file.path ? { ...t, content: val, isModified: true } : t));
            });
          }
          
          const newTabId = file.path;
          const newTab: EditorTab = {
            id: newTabId,
            name: file.name,
            path: file.path,
            node: { name: file.name, kind: 'file', path: file.path },
            content: file.content,
            isModified: false,
            model: model
          };
          
          setTabs(prev => [...prev, newTab]);
          setActiveTabId(newTabId);
          setContent(file.content);
          setCurrentFileName(file.name);
          setCurrentFileNode({ name: file.name, kind: 'file', path: file.path });
          
          if (editorRef.current && model) {
            editorRef.current.setModel(model);
          }
          showToast(`📂 ${file.name}`, "info");
          return;
        }
      }
      await handleFileOpenByPath(filePath);
    } catch (e) {
      showToast('파일을 열 수 없습니다.', 'error');
    }
  };

  // 최초 마운트 시 웰컴 콘텐츠 로드 (단, 외부 파일 연결 pending이면 skip)
  useEffect(() => {
    if (!mounted) return;
    if (pendingExternalFileRef.current) return;
    
    if (tabs.length === 0) {
      const welcome = getWelcomeContent();
      const welcomeTabId = 'welcome-tab';
      
      const welcomeTab: EditorTab = {
        id: welcomeTabId,
        name: '새 파일.md',
        path: null,
        node: null,
        content: welcome,
        isModified: false
      };
      
      setTabs([welcomeTab]);
      setActiveTabId(welcomeTabId);
      setContent(welcome);
      setCurrentFileName('새 파일.md');
      setCurrentFileNode(null);
    }
  }, [mounted]);

  // 💡 [조치 완료] 애드온 구동 시 사용자의 클립보드 내용을 동의 없이 강제 읽기 하여 첫 웰컴페이지를 무조건 덮어쓰던 로직을 제거(주석 처리)하여 웰컴 페이지 노출을 보장합니다.
  // useEffect(() => {
  //   if (mounted && isAddonEnv && typeof navigator !== 'undefined' && navigator.clipboard) {
  //     (async () => {
  //       try {
  //         const text = await navigator.clipboard.readText();
  //         if (text) {
  //           updateContent(text);
  //           lastSavedContentRef.current = text;
  //         }
  //       } catch (e) {
  //         // 클립보드 읽기 실패 (권한 없음 등) - 무시
  //       }
  //     })();
  //   }
  // }, [mounted]);

  // 동적 타이틀바 세팅 (온리비 어서 - 파일명.md)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ((currentFileNode && currentFileNode.path) || currentFileName === '새 파일.md') {
        document.title = `온리비 어서 - ${currentFileName}`;
      } else {
        document.title = `온리비 어서`;
      }
    }
  }, [currentFileName, currentFileNode]);

  useEffect(() => {
    if (!previewRef.current) return;

    const elements = isPageViewEnabled
      ? Array.from(previewRef.current.querySelectorAll('.page-view-paper [data-line]')) as HTMLElement[]
      : Array.from(previewRef.current.querySelectorAll('[data-line]')) as HTMLElement[];
    elements.forEach(element => element.classList.remove('preview-highlight-line'));

    if (previewMode !== 'both' || !activeLine) return;

    // activeLine 이하이면서 가장 가까운(최대값) data-line을 가진 요소를 찾음
    let targetEl: HTMLElement | null = null;
    let maxLine = -1;

    elements.forEach(element => {
      const lineStr = element.getAttribute('data-line');
      if (lineStr) {
        const line = parseInt(lineStr, 10);
        if (line <= activeLine && line > maxLine) {
          maxLine = line;
          targetEl = element;
        }
      }
    });

    if (targetEl) {
      (targetEl as HTMLElement).classList.add('preview-highlight-line'); // 💡 사장님 지시: 마우스 클릭/타이핑 시 미리보기 행 마킹 하이라이트색 복구
    }
  }, [activeLine, previewMode]);

  // 💡 [엔터/타이핑 내용 변경 후 스크롤 보정] 
  //    마크다운 파싱 및 리렌더링 완료 후, 최신 DOM이 그려진 시점에 에디터 커서 비율에 맞춰 미리보기 스크롤 동기화
  useEffect(() => {
    if (previewMode !== 'both' || !previewRef.current || !editorRef.current) return;
    
    requestAnimationFrame(() => {
      const editor = editorRef.current;
      if (!editor) return;

      const position = editor.getPosition();
      const curLine = position ? position.lineNumber : 1;

      // 에디터 내 커서 뷰포트 Y축 비율(ratio) 계산
      const viewportHeight = editor.getLayoutInfo().height;
      if (viewportHeight <= 0) return;
      
      const cursorTop = editor.getTopForLineNumber(curLine);
      const scrollTop = editor.getScrollTop();
      const lineHeight = editor.getOption(monaco.editor.EditorOption.lineHeight) || 20;
      const cursorYInViewport = cursorTop + lineHeight - scrollTop;
      const targetRatio = cursorYInViewport / viewportHeight;

      const parent = previewRef.current!;
      let targetEl: HTMLElement | null = null;
      for (let line = curLine; line >= 1; line--) {
        const found = parent.querySelector(`[data-line="${line}"]`) as HTMLElement;
        if (found) {
          targetEl = found;
          break;
        }
      }

      if (targetEl) {
        isScrollingRef.current = 'editor';
        const parentRect = parent.getBoundingClientRect();
        const childRect = targetEl.getBoundingClientRect();
        
        // 에디터 비율에 맞춰 정밀 위치 제어
        const relativeTop = childRect.top - parentRect.top + parent.scrollTop - (parentRect.height * targetRatio);
        parent.scrollTop = Math.max(0, relativeTop);

        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => { isScrollingRef.current = null; }, 80);
      }
    });
  }, [content, previewMode]);


  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = e.clientX;
    if (newWidth > 150 && newWidth < 600) {
      setSidebarWidth(newWidth);
      localStorage.setItem('sidebarWidth', newWidth.toString());
    }
  }, []);

  // fontSize 및 wordWrap 저장은 통합 환경설정 저장 가드에서 처리

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  }, [handleMouseMove]);

  const startResizing = useCallback((e: React.MouseEvent) => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [handleMouseMove, stopResizing]);







  useEffect(() => {
    if (currentFileNode) {
      const isUnsaved = content !== lastSavedContentRef.current;
      setSaveStatus(isUnsaved ? 'unsaved' : 'saved');
      setTabs(prev => prev.map(t => 
        t.id === activeTabIdRef.current 
          ? { ...t, isModified: isUnsaved } 
          : t
      ));
    }
  }, [content, currentFileNode]);

  useEffect(() => {
    // 🌟 [세이프티 가드 1]: 원고 본문이 비어있거나 데이터가 초기화되기 전 상태라면 
    // 시스템 오염 저장을 원천 차단합니다.
    if (!content || content.trim() === "") {
      return;
    }

    // 🌟 [세이프티 가드 2]: 유저가 뷰 모드(분할/에디터/프리뷰)를 변환하는 찰나의 순간에는 
    // 컴포넌트 오염 타이밍이므로 자동 저장을 생략하고 무조건 대기시킵니다.
    if (autoSave && currentFileNode) {
      if (content === lastSavedContentRef.current) return;

      setSaveStatus('saving');
      const timer = setTimeout(async () => {
        if (content === lastSavedContentRef.current) return;

        const success = await saveFile(content, currentFileNode);
        setSaveStatus(success ? 'saved' : 'unsaved');
        if (success) {
          console.log("✏️ [Onrivi Guard] 자동 저장 완료");
        }
      }, 5000); // 🕒 5초 디바운스 — 안정적인 실시간 저장
      return () => clearTimeout(timer);
    }
  }, [content, autoSave, currentFileNode, saveFile]);

  /**
   * [ONR-01-011] insertAtCursor 함수
   * @description 에디터의 현재 커서 위치 또는 마지막으로 선택된 영역에 텍스트를 주입하고 Monaco 에디터 토크나이저를 강제로 갱신합니다.
   * @param text 삽입할 텍스트 내용
   */
  const insertAtCursor = (text: string) => {
    utilsEditorActions.insertAtCursor(editorRef, lastSelectionRef, text);
  };

  /**
   * [ONR-01-012] findLineNumberByHeading 함수
   * @description 문서 내에서 특정 제목(Heading) 텍스트가 위치한 라인 번호를 탐색합니다.
   * @param content 전체 문서 내용
   * @param heading 찾고자 하는 대상 제목 텍스트
   * @returns 대상 제목이 발견된 라인 번호 (기본값: 1)
   */
  const findLineNumberByHeading = (content: string, heading: string): number => {
    return utilsEditorActions.findLineNumberByHeading(content, heading);
  };

  /**
   * [ONR-01-010] scrollToLine 함수
   * @description Monaco 에디터 내에서 특정 라인 번호로 스크롤하고 커서 위치를 해당 라인의 첫 번째 열로 이동한 뒤 포커스를 줍니다.
   * @param lineNumber 에디터에서 이동하고자 하는 대상 라인 번호
   */
  const scrollToLine = (lineNumber: number) => {
    utilsEditorActions.scrollToLine(editorRef, lineNumber);
  };

  /**
   * [ONR-01-013] handlePreviewClick 함수
   * @description 미리보기 화면 클릭 시 해당 요소의 data-line 속성을 읽어 에디터의 동일 행으로 스크롤하고 하이라이트 효과를 부여합니다.
   * @param e 마우스 클릭 이벤트 객체
   */
  const handlePreviewClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const lineEl = target.closest('[data-line]');
    if (lineEl) {
      const lineStr = lineEl.getAttribute('data-line');
      if (lineStr) {
        const lineNumber = parseInt(lineStr, 10);
        scrollToLine(lineNumber);

        if (previewRef.current) {
          const elements = isPageViewEnabled
            ? Array.from(previewRef.current.querySelectorAll('.page-view-paper [data-line]'))
            : Array.from(previewRef.current.querySelectorAll('[data-line]'));
          elements.forEach(element => element.classList.remove('preview-highlight-line'));
          lineEl.classList.add('preview-highlight-line'); // 💡 사장님 지시: 마우스 클릭 시 미리보기 행 마킹 하이라이트색 복구
        }
      }
    }
  };

  /**
   * [ONR-01-014] insertBlockTag 함수
   * @description 선택된 영역 또는 커서 위치를 HTML/마크다운 블록 태그(예: 코드 블록, 인용구 등)로 감싸주는 텍스트 에디팅 유틸리티입니다.
   * @param startTag 시작 태그
   * @param endTag 종료 태그
   * @param defaultText 선택 영역이 없을 때 삽입할 기본 텍스트
   */
  const insertBlockTag = (startTag: string, endTag: string, defaultText: string = "") => {
    utilsEditorActions.insertBlockTag(editorRef, startTag, endTag, defaultText);
  };

  /**
   * [ONR-01-015] wrapSelection 함수
   * @description 현재 드래그 선택된 텍스트의 앞뒤를 지정된 문자열(예: bold의 경우 **, italic의 경우 * 등)로 감싸거나, 이미 감싸져 있는 경우 토글식으로 제거합니다.
   * @param before 텍스트 앞에 감쌀 문자열
   * @param after 텍스트 뒤에 감쌀 문자열 (기본값은 before와 동일)
   * @param defaultText 선택 영역이 비어있을 때 입력될 기본 텍스트
   */
  const wrapSelection = (before: string, after: string = before, defaultText: string = "") => {
    utilsEditorActions.wrapSelection(editorRef, lastSelectionRef, before, after, defaultText);
  };

  const insertLink = () => {
    if (!editorRef.current) return;
    const editor = editorRef.current;
    editor.focus();

    let selection = editor.getSelection();
    if ((!selection || selection.isEmpty()) && lastSelectionRef.current && !lastSelectionRef.current.isEmpty()) {
      selection = lastSelectionRef.current;
    }
    if (!selection) return;
    const model = editor.getModel();
    const selectedText = model.getValueInRange(selection);

    if (selectedText) {
      const textToInsert = `[${selectedText}](https://)`;
      const range = {
        startLineNumber: selection.startLineNumber,
        startColumn: selection.startColumn,
        endLineNumber: selection.endLineNumber,
        endColumn: selection.endColumn
      };
      editor.executeEdits("insertLink", [{ range, text: textToInsert, forceMoveMarkers: true }]);

      const cursorColumn = selection.startColumn + 1 + selectedText.length + 2 + 8;

      editor.setSelection({
        startLineNumber: selection.startLineNumber,
        startColumn: cursorColumn,
        endLineNumber: selection.startLineNumber,
        endColumn: cursorColumn
      });
    } else {
      const textToInsert = `[홈페이지명](https://)`;
      const range = {
        startLineNumber: selection.startLineNumber,
        startColumn: selection.startColumn,
        endLineNumber: selection.endLineNumber,
        endColumn: selection.endColumn
      };
      editor.executeEdits("insertLink", [{ range, text: textToInsert, forceMoveMarkers: true }]);

      const startColumn = selection.startColumn + 1;
      const endColumn = startColumn + 5;

      editor.setSelection({
        startLineNumber: selection.startLineNumber,
        startColumn: startColumn,
        endLineNumber: selection.startLineNumber,
        endColumn: endColumn
      });
    }
  };

  const insertTagLink = () => {
    setShowTagLinkPicker(true);
  };

  const handleTagLinkSelect = (headingText: string) => {
    setShowTagLinkPicker(false);
    if (!editorRef.current || !headingText) return;
    const editor = editorRef.current;
    editor.focus();

    let selection = editor.getSelection();
    if ((!selection || selection.isEmpty()) && lastSelectionRef.current && !lastSelectionRef.current.isEmpty()) {
      selection = lastSelectionRef.current;
    }
    if (!selection) return;
    const model = editor.getModel();
    const selectedText = model.getValueInRange(selection);

    const headingTarget = headingText.replace(/\s+/g, ' ').trim();
    if (selectedText) {
      const textToInsert = `[[#${headingTarget}|${selectedText}]]`;
      const range = {
        startLineNumber: selection.startLineNumber,
        startColumn: selection.startColumn,
        endLineNumber: selection.endLineNumber,
        endColumn: selection.endColumn
      };
      editor.executeEdits("insertTagLink", [{ range, text: textToInsert, forceMoveMarkers: true }]);
    } else {
      const textToInsert = `[[#${headingTarget}]]`;
      const range = {
        startLineNumber: selection.startLineNumber,
        startColumn: selection.startColumn,
        endLineNumber: selection.endLineNumber,
        endColumn: selection.endColumn
      };
      editor.executeEdits("insertTagLink", [{ range, text: textToInsert, forceMoveMarkers: true }]);
    }
    editor.focus();
  };

  const readFileText = async (node: FileNode): Promise<string> => {
    let fileContent = '';
    let activeMode = workspaceType;
    if (workspaceType === 'browser') {
      activeMode = 'browser';
    } else if (node.path && !node.handle) {
      activeMode = 'local';
    } else if (node.handle && !node.path) {
      activeMode = 'browser';
    }

    if (activeMode === 'browser') {
      if (node.handle) {
        const file = await node.handle.getFile();
        fileContent = await file.text();
      } else if (node.path) {
        fileContent = vfsReadFile(node.path);
      }
    } else if (activeMode === 'local' && node.path) {
      const api = (window as any).electronAPI;
      if (api?.readFromPath) {
        try {
          const file = await api.readFromPath(node.path);
          if (file) {
            fileContent = file.content;
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        try {
          const res = await fetch(getApiUrl(`/api/file-content?path=${encodeURIComponent(node.path)}`));
          if (res.ok) {
            const data = await res.json();
            fileContent = data.content;
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    return fileContent;
  };

  const extractHeadings = (text: string): string[] => {
    if (!text) return [];
    const headingLines = text.split('\n');
    const headings: string[] = [];
    const headingRegex = /^(#{1,6})\s+(.*)$/;
    headingLines.forEach(line => {
      const trimmed = line.trim();
      const match = trimmed.match(headingRegex);
      if (match) {
        const hText = match[2].replace(/#+\s*$/, '').trim(); // 뒤에 붙는 불필요한 샵 제거
        if (hText) {
          headings.push(hText);
        }
      }
    });
    return headings;
  };

  const handleDocFileClick = async (targetNode: FileNode) => {
    setSelectedDocNode(targetNode);
    setIsHeadingLoading(true);
    try {
      const text = await readFileText(targetNode);
      const headings = extractHeadings(text);
      setDocHeadings(headings);
    } catch (e) {
      console.error(e);
      setDocHeadings([]);
    } finally {
      setIsHeadingLoading(false);
    }
  };

  const handleDocLinkSelect = (targetNode: FileNode, heading?: string) => {
    setShowDocLinkPicker(false);
    setDocLinkSearchText('');
    setSelectedDocNode(null);
    setDocHeadings([]);
    setDocHeadingSearchText('');
    
    if (!editorRef.current || !targetNode || !targetNode.path) return;
    const editor = editorRef.current;
    editor.focus();

    let selection = editor.getSelection();
    if ((!selection || selection.isEmpty()) && lastSelectionRef.current && !lastSelectionRef.current.isEmpty()) {
      selection = lastSelectionRef.current;
    }
    if (!selection) return;
    const model = editor.getModel();
    const selectedText = model.getValueInRange(selection);

    const targetPath = targetNode.path;
    const currentPath = currentFileNode?.path;
    const relativePath = getRelativePath(currentPath, targetPath);

    const headingText = heading ? `#${heading}` : '';
    const textToInsert = `[[${relativePath}${headingText}]]`;

    const range = {
      startLineNumber: selection.startLineNumber,
      startColumn: selection.startColumn,
      endLineNumber: selection.endLineNumber,
      endColumn: selection.endColumn
    };
    editor.executeEdits("insertDocLink", [{ range, text: textToInsert, forceMoveMarkers: true }]);
    editor.focus();
  };

  /**
   * [ONR-01-024] parseHtmlTableToMarkdown 함수
   * @description 웹에서 복사해 붙여넣어진 HTML 형식의 `<table>` 구문을 표준 마크다운 표 형식으로 변환합니다.
   * @param html 붙여넣기 시도된 원본 HTML 문자열
   * @returns 마크다운 표 문자열 또는 변환 실패 시 null
   */
  const parseHtmlTableToMarkdown = (html: string) => {
    return utilsPasteHandlers.parseHtmlTableToMarkdown(html, showToast);
  };

  /**
   * [ONR-01-025] sanitizePastedText 함수
   * @description 붙여넣기된 문자열에 대해 줄바꿈 통일, 특수문자 제거, 불필요한 HTML 태그 정리 등 마크다운에 적합한 데이터로 정제 및 살균합니다.
   * @param text 원본 붙여넣기 텍스트
   * @param skipTsvConversion TSV 표 변환 로직을 우회할지 여부
   * @returns 위생 가공된 결과 텍스트
   */
  const sanitizePastedText = (text: string, skipTsvConversion = false) => {
    return utilsPasteHandlers.sanitizePastedText(text, skipTsvConversion);
  };

  /**
   * [ONR-01-026] fixMarkdownTable 함수
   * @description 여러 줄로 쪼개진 마크다운 표 셀 데이터를 한 행으로 강제 병합하여 정합성 있는 마크다운 표 형태로 보정합니다.
   * @param text 보정 대상 마크다운 표 텍스트
   * @returns 정돈된 마크다운 표 텍스트
   */
  const fixMarkdownTable = (text: string) => {
    return utilsPasteHandlers.fixMarkdownTable(text);
  };

  const handleEditorPaste = async (e: any) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    let imageItem = null;
    let hasText = false;
    let hasHtml = false;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        imageItem = items[i];
      }
      if (items[i].type === 'text/plain') {
        hasText = true;
      }
      if (items[i].type === 'text/html') {
        hasHtml = true;
      }
    }

    if (imageItem) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;
        if (!base64Data) return;

        try {
          const response = await fetch(getApiUrl('/api/upload-pasted-image'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base64Data })
          });

          if (response.ok) {
            const data = await response.json();
            const relativePath = data.relativePath;

            if (editorRef.current) {
              const editor = editorRef.current;
              const selection = editor.getSelection();
              const range = {
                startLineNumber: selection.startLineNumber,
                startColumn: selection.startColumn,
                endLineNumber: selection.endLineNumber,
                endColumn: selection.endColumn
              };
              const textToInsert = `![이미지](${relativePath})`;
              editor.executeEdits("pasteImage", [{ range, text: textToInsert, forceMoveMarkers: true }]);

              const newValue = editor.getValue();
              updateContent(newValue, true);
            }
          }
        } catch (err) {
          showToast('클립보드 이미지 업로드에 실패했습니다.', 'error');
        }
      };
      reader.readAsDataURL(file);
      return;
    }

    // Try HTML Table extraction first
    if (hasHtml) {
      const htmlData = e.clipboardData.getData('text/html');
      if (htmlData && htmlData.includes('<table')) {
        const mdTable = parseHtmlTableToMarkdown(htmlData);
        if (mdTable) {
          e.preventDefault();
          insertAtCursor(mdTable);
          if (editorRef.current) {
            updateContent(editorRef.current.getValue(), true);
          }
          showToast("웹 표 데이터가 마크다운으로 완벽하게 변환되었습니다.", "success");
          return;
        }
      }
    }

    // Fallback to text/plain
    if (hasText) {
      const text = e.clipboardData.getData('text/plain');
      if (text) {
        let processedText = sanitizePastedText(text);

        if (processedText.includes('|')) {
          processedText = fixMarkdownTable(processedText);
        }

        if (processedText !== text) {
          e.preventDefault();
          insertAtCursor(processedText);
          if (editorRef.current) {
            updateContent(editorRef.current.getValue(), true);
          }
          showToast("붙여넣은 텍스트가 자동으로 정제(교정)되었습니다.", "success");
        }
      }
    }
  };

  const applyLinePrefix = (prefixType: 'orderedList' | 'list' | 'quote' | 'check') => {
    if (!editorRef.current) return;
    const editor = editorRef.current;
    let selection = editor.getSelection();
    if ((!selection || selection.isEmpty()) && lastSelectionRef.current && !lastSelectionRef.current.isEmpty()) {
      selection = lastSelectionRef.current;
    }
    if (!selection) return;
    const model = editor.getModel();

    const startLine = selection.startLineNumber;
    const endLine = selection.endLineNumber;

    const edits = [];
    let counter = 1;
    if (prefixType === 'orderedList') {
      for (let j = startLine - 1; j > 0; j--) {
        const prevLine = model.getLineContent(j);
        if (prevLine.trim() === '') {
          break;
        }
        const match = prevLine.match(/^(\s*)(\d+)\.\s/);
        if (match) {
          counter = parseInt(match[2], 10) + 1;
          break;
        }
        if (startLine - j > 10) break;
      }
    }

    for (let i = startLine; i <= endLine; i++) {
      const lineContent = model.getLineContent(i);
      const match = lineContent.match(/^(\s*)(>+\s*)?((?:- \[[ xX]\]|[-*+]|\d+\.)\s+)?(.*)/);

      if (match) {
        const indent = match[1] || '';
        const quotes = match[2] || '';
        const listSymbol = match[3] || '';
        const text = match[4] || '';

        let newQuotes = quotes;
        let newListSymbol = listSymbol;

        if (prefixType === 'quote') {
          if (quotes) {
            newQuotes = '>' + quotes;
          } else {
            newQuotes = '> ';
          }
        } else {
          let targetListSymbol = '';
          if (prefixType === 'orderedList') {
            targetListSymbol = `${counter}. `;
            counter++;
          } else if (prefixType === 'list') {
            targetListSymbol = '- ';
          } else if (prefixType === 'check') {
            targetListSymbol = '- [ ] ';
          }

          if (listSymbol) {
            newListSymbol = targetListSymbol;
          } else {
            newListSymbol = targetListSymbol;
          }
        }

        const textStartIndex = lineContent.length - text.length;
        const newPrefix = `${indent}${newQuotes}${newListSymbol}`;

        edits.push({
          range: new (window as any).monaco.Range(i, 1, i, textStartIndex + 1),
          text: newPrefix,
          forceMoveMarkers: true
        });
      } else {
        let fallbackPrefix = '';
        if (prefixType === 'orderedList') {
          fallbackPrefix = `${counter}. `;
          counter++;
        } else if (prefixType === 'list') {
          fallbackPrefix = '- ';
        } else if (prefixType === 'quote') {
          fallbackPrefix = '> ';
        } else if (prefixType === 'check') {
          fallbackPrefix = '- [ ] ';
        }

        edits.push({
          range: new (window as any).monaco.Range(i, 1, i, 1),
          text: fallbackPrefix,
          forceMoveMarkers: true
        });
      }
    }

    editor.executeEdits("applyPrefix", edits);

    // [WBS SYNC-02] 주입 직후 구문 강조와 배경 스타일이 즉시 화면에 렌더링되도록 Monaco 모델의 강제 토큰화 수동 격발
    try {
      const model = editor.getModel();
      if (model && typeof model.forceTokenization === 'function') {
        for (let i = startLine; i <= endLine; i++) {
          model.forceTokenization(i);
        }
      }
      editor.layout();
    } catch (_) {}

    editor.focus();
  };

  const removePrefix = () => {
    if (!editorRef.current) return;
    const editor = editorRef.current;
    let selection = editor.getSelection();
    if ((!selection || selection.isEmpty()) && lastSelectionRef.current && !lastSelectionRef.current.isEmpty()) {
      selection = lastSelectionRef.current;
    }
    if (!selection) return;
    const model = editor.getModel();

    let rangeToProcess = selection;
    if (selection.isEmpty()) {
      const cursorLine = selection.positionLineNumber;
      const lineLen = model.getLineLength(cursorLine);
      rangeToProcess = new (window as any).monaco.Range(cursorLine, 1, cursorLine, lineLen + 1);
    }

    const selectedText = model.getValueInRange(rangeToProcess);
    let cleanedText = selectedText;

    cleanedText = cleanedText.replace(/<\/?(u|mark|span|b|i|strong|em|ins|del)[^>]*>/gi, '');
    cleanedText = cleanedText.replace(/(\*\*|__)(.*?)\1/g, '$2');
    cleanedText = cleanedText.replace(/(\*|_)(.*?)\1/g, '$2');
    cleanedText = cleanedText.replace(/~~(.*?)~~/g, '$1');
    cleanedText = cleanedText.replace(/`(.*?)`/g, '$1');
    cleanedText = cleanedText.replace(/!\[(.*?)\]\(.*?\)/g, '$1');
    cleanedText = cleanedText.replace(/\[(.*?)\]\(.*?\)/g, '$1');

    const lines = cleanedText.split('\n');
    const processedLines = lines.map((line: string) => {
      const leadingSpaces = line.match(/^(\s*)/)?.[1] || "";
      const trimmed = line.trim();

      const match = trimmed.match(/^(#{1,6}|[-*+]\s+\[[ xX]\]|[-*+]|\d+\.|>+)(?:\s+(.*))?$/);
      if (match) {
        return leadingSpaces + (match[2] || "");
      }
      return line;
    });

    cleanedText = processedLines.join('\n');

    editor.executeEdits("removeMarkdownTags", [
      {
        range: rangeToProcess,
        text: cleanedText,
        forceMoveMarkers: true
      }
    ]);

    // [WBS SYNC-02] 주입 직후 구문 강조와 배경 스타일이 즉시 화면에 렌더링되도록 Monaco 모델의 강제 토큰화 수동 격발
    try {
      const model = editor.getModel();
      if (model && typeof model.forceTokenization === 'function') {
        const startLine = rangeToProcess.startLineNumber;
        const endLine = rangeToProcess.endLineNumber;
        for (let i = startLine; i <= endLine; i++) {
          model.forceTokenization(i);
        }
      }
      editor.layout();
    } catch (_) {}

    editor.focus();
  };



  const { processedContent, lineMap } = useMemo(() => {
    const res = preprocessMarkdownForPreview(content);
    return {
      processedContent: res.text,
      lineMap: res.lineMap
    };
  }, [content]);

  /*
   * dynamicCssString — 선택한 프로필의 CssRuleSet을 실제 CSS 문자열로 변환
   *
   * 동작 방식:
   * 1. DEFAULT_PROFILE(id='default')이면 빈 문자열 반환 (<style> 미주입)
   * 2. 전역 타이포그래피(.custom-preview-container) CSS 생성
   * 3. 각 태그별 rules를 순회하며 CSS 셀렉터 생성
   *    - taskList → .task-list-item
   *    - codeBlock → pre, code
   *    - 그 외 태그명 그대로
   * 4. 모든 값에 !important를 붙여 prose 클래스 기본 스타일 오버라이드
   */
  const dynamicCssString = useMemo(() => {
    if (activeProfileId === 'default') return '';
    const prof = profiles.find(p => p.id === activeProfileId) || DEFAULT_PROFILE;
    const ps = prof.pageStyle;
    
    // 💡 프로필에 설정된 배경색 사용 (없으면 흰색), 다크모드이면 다크모드 전용 배경으로 강제
    const profileBg = ps.backgroundColor || '#ffffff';
    const bg = isDarkMode ? '#09090b' : profileBg;
    const fg = isDarkMode ? '#e4e4e7' : 'inherit';

    let css = `
.custom-preview-container {
  background: ${bg} !important;
  color: ${fg} !important;
  font-family: ${ps.fontFamily} !important;
  font-size: ${ps.fontSize} !important;
  line-height: ${ps.lineHeight} !important;
  letter-spacing: ${ps.letterSpacing} !important;
}
.custom-preview-container p,
.custom-preview-container li,
.custom-preview-container blockquote {
  font-size: inherit !important;
  line-height: inherit !important;
}
/* 탭 간격 (Tab Size) — pre/code에서 탭 문자가 표시될 폭 */
.custom-preview-container pre,
.custom-preview-container code {
  tab-size: ${ps.tabSize || '4'} !important;
  -moz-tab-size: ${ps.tabSize || '4'} !important;
}
`;
    /* H2~H6 자동 크기 계산 (headingSizeOffset 기반) */
    const h1SizeVal = (prof.rules.h1 && prof.rules.h1['font-size']) || '28px';
    const h1Size = parseFloat(h1SizeVal) || 28;
    const offset = parseFloat(ps.headingSizeOffset) || 4;
    for (let level = 2; level <= 6; level++) {
      const calcSize = Math.max(10, h1Size - (level - 1) * offset);
      css += `.custom-preview-container h${level} {\n  font-size: ${calcSize}px !important;\n}\n`;
    }
    Object.entries(prof.rules).forEach(([tag, ruleObj]) => {
      // 💡 다크모드일 때 인용구(blockquote)는 사용자 정의 서식을 무시하고 다크모드 테마의 기본 스타일을 유지합니다.
      if (tag === 'blockquote' && isDarkMode) return;
      // 💡 다크모드일 때 구분선(hr)은 사용자 정의 서식을 무시하고 선명한 다크모드 전용 고정 색상을 사용합니다.
      if (tag === 'hr' && isDarkMode) return;

      /* h2~h6의 font-size는 headingSizeOffset 자동 계산으로 대체 */
      const skipFontSize = ['h2','h3','h4','h5','h6'].includes(tag);
      const entries = Object.entries(ruleObj).filter(([prop, v]) => {
        if (v === '') return false;
        if (skipFontSize && prop === 'font-size') return false;
        // 💡 다크모드일 경우 기본적으로 개별 규칙의 글자색(color) 설정을 무시하지만, 
        // 코드 블록, 인용구 등 사용자가 명시적으로 색상을 지정해야 하는 태그는 예외 처리합니다.
        const keepColorTags = ['codeBlock', 'codeBlockTitle', 'code', 'math', 'footnote'];
        if (isDarkMode && prop === 'color' && !keepColorTags.includes(tag)) return false;
        return true;
      });
      if (entries.length === 0) return;
      
      if (tag === 'codeBlockTitle') {
        const bgColor = ruleObj['background-color'];
        const textColor = ruleObj['color'];
        if (bgColor) {
          css += `.custom-preview-container .codeblock-header {\n  background-color: ${bgColor} !important;\n}\n`;
        }
        if (textColor) {
          css += `.custom-preview-container .codeblock-header-text {\n  color: ${textColor} !important;\n}\n`;
        }
        return;
      }

      if (tag === 'codeBlock') {
        const bgColor = ruleObj['background-color'];
        const color = ruleObj['color'];
        const fontSize = ruleObj['font-size'];
        const padding = ruleObj['padding'];
        const borderRadius = ruleObj['border-radius'];

        if (bgColor) {
          css += `.custom-preview-container .codeblock-area {\n  background-color: ${bgColor} !important;\n}\n`;
        }
        if (borderRadius) {
          css += `.custom-preview-container .codeblock-area {\n  border-radius: ${borderRadius} !important;\n}\n`;
        }
        if (color) {
          css += `.custom-preview-container .codeblock-area pre, .custom-preview-container .codeblock-area pre code {\n  color: ${color} !important;\n}\n`;
        }
        if (fontSize) {
          css += `.custom-preview-container .codeblock-area pre, .custom-preview-container .codeblock-area pre code {\n  font-size: ${fontSize} !important;\n}\n`;
        }
        if (padding) {
          css += `.custom-preview-container .codeblock-area pre {\n  padding: ${padding} !important;\n}\n`;
        }
        
        // 💡 프리뷰 모드에서 중첩된 테두리와 배경색(박스 안의 박스 현상) 원천 차단
        css += `.custom-preview-container .codeblock-area pre, .custom-preview-container .codeblock-area pre code {\n  border: none !important;\n  background: transparent !important;\n}\n`;
        return;
      }

      const selector = tag === 'taskList' ? '.task-list-item' :
        tag === 'code' ? ':not(pre) > code' :
        tag === 'map' ? 'iframe[src*="map"]' :
        tag === 'video' ? 'video, iframe[src*="youtube"], iframe[src*="vimeo"], a[href*="youtube.com"] img, a[href*="youtu.be"] img' :
        tag === 'math' ? '.katex-display, .katex' : tag;
      css += `.custom-preview-container ${selector} {\n`;
      entries.forEach(([prop, val]) => {
        css += `  ${prop}: ${val} !important;\n`;
      });
      css += `}\n`;
    });

    // 🧰 구조제어: 표 글자 크기 동적 상속 (설정하지 않은 경우 페이지 기본 크기를 따름)
    const tableHasFontSize = prof.rules.table && prof.rules.table['font-size'];
    if (!tableHasFontSize) {
      css += `
.custom-preview-container th,
.custom-preview-container td {
  font-size: inherit !important;
}
`;
    }

    // 📊 표 정교화 보정: 세로 중앙 정렬 및 단어 단위 줄바꿈(keep-all) 강제 적용
    css += `
.custom-preview-container th,
.custom-preview-container td {
  vertical-align: middle !important;
  word-break: keep-all !important;
}
`;

    // 🧰 구조제어: 구분선 규칙 (HR) 동적 인젝션
    if (prof.hrStructure) {
      const hrRules = prof.rules.hr || {};
      const hrStyle = hrRules['border-top-style'] || hrRules['border-style'] || prof.hrStructure.borderTopStyle || 'solid';
      const hrWidth = hrRules['border-top-width'] || hrRules['border-width'] || prof.hrStructure.borderTopWidth || '1px';
      const hrMargin = hrRules['margin-top'] || hrRules['margin-bottom'] || hrRules['margin'] || prof.hrStructure.marginTopBottom || '32px';
      const hrLen = hrRules['width'] || prof.hrStructure.lineWidth || '100%';
      // 💡 다크모드계열이면 구분선의 색상을 선명한 전용 색상(rgba(255,255,255,0.35))으로 고정하고,
      // 라이트모드는 서식정의(border-top-color, border-color 또는 color)가 있으면 그 색상을, 없으면 은은한 회색(#e5e7eb)을 사용합니다.
      const hrColor = isDarkMode
        ? 'rgba(255, 255, 255, 0.35)'
        : (hrRules['border-top-color'] || hrRules['border-color'] || hrRules['color'] || '#e5e7eb');
      css += `
.custom-preview-container hr {
  border-left: none !important;
  border-right: none !important;
  border-bottom: none !important;
  border-top-width: ${hrWidth} !important;
  border-top-style: ${hrStyle} !important;
  border-top-color: ${hrColor} !important;
  margin-top: ${hrMargin} !important;
  margin-bottom: ${hrMargin} !important;
  width: ${hrLen} !important;
  ${hrLen !== '100%' ? 'margin-left: auto !important;\n  margin-right: auto !important;' : ''}
}
`;
    }

    // 🧰 구조제어: 체크박스 규칙 (Task List) 동적 인젝션
    if (prof.checkboxStructure) {
      const cbSize = prof.checkboxStructure.boxSize || '16px';
      const cbGap = prof.checkboxStructure.textGap || '10px';
      const cbEffect = prof.checkboxStructure.checkedEffect || 'line-through-and-dim';
      css += `
.custom-preview-container input[type="checkbox"] {
  width: ${cbSize} !important;
  height: ${cbSize} !important;
  margin-right: ${cbGap} !important;
}
`;
      if (cbEffect === 'line-through-and-dim') {
        css += `
.custom-preview-container .task-list-item:has(input:checked) {
  text-decoration: line-through !important;
  opacity: 0.5 !important;
}
`;
      } else if (cbEffect === 'dim-only') {
        css += `
.custom-preview-container .task-list-item:has(input:checked) {
  opacity: 0.5 !important;
}
`;
      }
    }

    return css;
  }, [profiles, activeProfileId, isDarkMode]);

  const quickWrap = (format: 'h1' | 'h2' | 'h3' | 'quote' | 'code') => {
    if (!editorRef.current) return;
    const editor = editorRef.current;
    let selection = editor.getSelection();
    if (!selection) return;
    const model = editor.getModel();
    if (!model) return;
    const monaco = (window as any).monaco;
    if (!monaco) return;

    // No selection → auto-select entire current line
    if (selection.isEmpty()) {
      const pos = editor.getPosition();
      if (!pos) return;
      const lineNum = pos.lineNumber;
      const lineContent = model.getLineContent(lineNum);
      editor.setSelection(new monaco.Selection(
        lineNum, 1,
        lineNum, lineContent.length + 1
      ));
      selection = editor.getSelection();
      if (!selection || selection.isEmpty()) return;
    }

    switch (format) {
      case 'h1': wrapSelection('# ', '', ''); break;
      case 'h2': wrapSelection('## ', '', ''); break;
      case 'h3': wrapSelection('### ', '', ''); break;
      case 'quote': applyLinePrefix('quote'); break;
      case 'code': insertBlockTag('```', '```', ''); break;
    }
    editor.focus();
  };

  const handlers = useEditorHandlers({
    editorRef,
    contentRef,
    currentFileNameRef,
    currentFileNodeRef,
    workspaceTypeRef,
    rootFolderRef,
    lastSavedContentRef,
    currentFileParentHandleRef,
    profiles,
    activeProfileId,
    isDarkMode,
    dynamicCssString,
    isPageViewEnabled,
    setSaveStatus,
    setCurrentFileName,
    setCurrentFileNode,
    setRootFolder,
    setWorkspaceType,
    setIsSidebarOpen,
    setIsExportModalOpen,
    setIsYoutubeModalOpen,
    setIsMapModalOpen,
    setIsTableModalOpen,
    setIsFormulaModalOpen,
    setIsSearchOpen,
    setIsAboutModalOpen,
    setIsLicenseModalOpen,
    setSettingsModalInitialTab,
    setFontSize,
    setHelpTitle,
    setHelpContent,
    setFloatingToolbar,
    setPromptConfig,
    showToast,
    refreshFileList,
    updateContent,
    wrapSelection,
    insertAtCursor,
    applyLinePrefix,
    removePrefix,
    insertLink,
    quickWrap,
    insertBlockTag,
    setShowTagLinkPicker,
    setShowDocLinkPicker,
    sanitizePastedText,
    isComposingRef
  });

  handlersRef.current = handlers;

  const dispatchCommand = useCallback((type: EditorCommandType, payload?: any) => {
    // [WBS SYNC-01] 명령어 실행 초입 단계에 반드시 editor.focus()를 강제 격발하여 브라우저 포커스 뺏김 방지 및 포지션 최우선 확보
    let editorPosition = null;
    if (editorRef.current) {
      const editor = editorRef.current;
      editor.focus();
      editorPosition = editor.getPosition();
    }

    // 1. 에디터 텍스트 비조작 명령어 (상태 제어 및 파일 입출력 위임)
    switch (type) {
      // 파일 관련
      case 'NEW_FILE': handlers.newFile(); return;
      case 'OPEN_WORKSPACE': selectRootFolder('local', null); return;
      case 'SAVE': handlers.save(); return;
      case 'SAVE_AS': handlers.saveAs(); return;
      case 'EXIT': handlers.exit(); return;

      // 내보내기 관련
      case 'EXPORT_PDF': handlers.exportPDF(); return;
      case 'EXPORT_HTML': handlers.exportHTML(); return;
      case 'EXPORT_EPUB': handlers.exportEPUB(); return;
      case 'EXPORT_PNG': handlers.exportPNG(); return;
      case 'OPEN_EXPORT': handlers.openExport(); return;

      // 보기/제어 관련
      case 'ZOOM_IN': handlers.zoomIn(); return;
      case 'ZOOM_OUT': handlers.zoomOut(); return;
      case 'UNDO': handlers.undo(); return;
      case 'REDO': handlers.redo(); return;
      case 'FIND': handlers.find(); return;
      case 'REPLACE': handlers.replace(); return;
      case 'GLOBAL_SEARCH': handlers.globalSearch(); return;
      case 'SETTINGS': handlers.settings('editor'); return;
      case 'SETTINGS_SHORTCUTS': handlers.settings('shortcuts'); return;
      case 'ABOUT': handlers.about(); return;
      case 'HELP': handlers.help(); return;
      case 'LICENSE': handlers.license(); return;
      case 'TOGGLE_FLOATING_TOOLBAR': handlers.toggleFloatingToolbar(); return;
      case 'CLEAN_DOC': handlers.cleanDoc(); return;
      case 'COPY_ALL': handlers.copyAll(); return;
      // 🎯 TOOLBAR_ITEMS '푸터' 그룹 토글 명령어 (handlers에 없으므로 직접 상태 변환)
      case 'TOGGLE_TOOLBAR': setIsToolbarOpen(prev => !prev); return;
      case 'TOGGLE_SIDEBAR': setIsSidebarOpen(prev => !prev); return;
      case 'TOGGLE_MODE':
        setPreviewMode(prev => {
          if (prev === 'css-style') return prev;
          if (prev === 'edit') return 'both';
          if (prev === 'both') return 'preview';
          return 'edit';
        });
        return;
      case 'TOGGLE_THEME': {
        const currentIndex = EDITOR_THEMES.findIndex(t => t.id === themePalette);
        const nextIndex = (currentIndex + 1) % EDITOR_THEMES.length;
        const nextTheme = EDITOR_THEMES[nextIndex];
        setThemePalette(nextTheme.id);
        setIsDarkMode(nextTheme.isDark);
        return;
      }
      /*
       * TOGGLE_CSS_STYLE — CssStyleForm 패널 토글 (Ctrl+Shift+S)
       *
       * - css-style 모드: 좌측 50%가 CssStyleForm(서식 정의), 우측 50%가 미리보기
       * - 다시 누르면 'both'(편집+미리보기 분할)로 복귀
       */
      case 'TOGGLE_CSS_STYLE':
        setPreviewMode(prev => prev === 'css-style' ? prev : 'css-style');
        return;
    }

    // 2. 에디터 본문 서식 조작 명령어 (포커스 가드 강제 추적)
    if (!editorRef.current) return;
    const editor = editorRef.current;

    // [WBS SYNC-01] 이미 초입부에서 editor.focus() 및 getPosition()을 최우선 확보하였으므로 중복 호출 제거
    const MODAL_COMMANDS: EditorCommandType[] = ['IMAGE', 'VIDEO', 'YOUTUBE', 'MAP', 'TABLE', 'LATEX', 'MATH', 'LINK'];

    const selection = editor.getSelection();
    const model = editor.getModel();
    if (!model || !selection) return;

    switch (type) {
      // 서식 관련
      case 'BOLD': handlers.bold(); break;
      case 'FOOTNOTE': handlers.footnote(); break;
      case 'ITALIC': handlers.italic(); break;
      case 'INLINE_CODE': handlers.inlineCode(); break;
      case 'UNDERLINE': handlers.underline(); break;
      case 'STRIKETHROUGH': handlers.strikethrough(); break;
      case 'H1': handlers.h1(); break;
      case 'H2': handlers.h2(); break;
      case 'H3': handlers.h3(); break;
      case 'H4': handlers.h4(); break;
      case 'H5': handlers.h5(); break;
      case 'H6': handlers.h6(); break;
      case 'HR': handlers.hr(); break;
      case 'ORDERED_LIST': handlers.orderedList(); break;
      case 'LIST': handlers.list(); break;
      case 'QUOTE': handlers.quote(); break;
      case 'CHECK':
      case 'CHECKLIST': handlers.check(); break;
      case 'ERASER':
      case 'REMOVE_PREFIX': handlers.removePrefix(); break;

      // 삽입 관련
      case 'LINK': handlers.link(); break;
      case 'TAGLINK': handlers.taglink(); break;
      case 'DOCLINK': handlers.doclink(); break;
      case 'IMAGE': handlers.image(); break;
      case 'YOUTUBE':
      case 'VIDEO': handlers.video(); break;
      case 'NOW': handlers.now(); break;
      case 'MAP': handlers.map(); break;
      case 'TABLE': handlers.table(); break;
      case 'QUICK_TABLE': handlers.quickTable(); break;
      case 'INSERT_TABLE_ROW': handlers.insertTableRow(); break;
      case 'DELETE_TABLE_ROW': handlers.deleteTableRow(); break;
      case 'CODE':
      case 'CODE_BLOCK': handlers.code(); break;
      case 'CHART': handlers.chart(); break;
      case 'PAGE_BREAK': handlers.pageBreak(); break;
      case 'LATEX':
      case 'MATH': handlers.math(); break;

      // ★ 퀵 래핑 (Quick Transform)
      case 'WRAP_H1': handlers.quickWrap('h1'); break;
      case 'WRAP_H2': handlers.quickWrap('h2'); break;
      case 'WRAP_H3': handlers.quickWrap('h3'); break;
      case 'WRAP_QUOTE': handlers.quickWrap('quote'); break;
      case 'WRAP_CODE': handlers.quickWrap('code'); break;

      default:
        showToast(`알 수 없는 명령어: ${type}`, 'warning');
        break;
    }

    // 🛡️ 모달이 팝업되는 명령어는 에디터로 포커스를 뺏기지 않도록 예외 처리
    // (IMAGE, VIDEO, MAP, TABLE, LATEX, MATH, LINK 계열은 모달 입력 필드가 포커스를 가져야 함)
    // [WBS SYNC-02] 50ms 비동기 지연을 두어 에디터 버퍼의 완전 기록 후 토큰 리프레시 및 레이아웃 재적용으로 글자 겹침 완벽 해결
    setTimeout(() => {
      try {
        if (editorRef.current) {
          const editor = editorRef.current;
          const model = editor.getModel();
          const selection = editor.getSelection();
          if (model && selection) {
            const startLine = selection.startLineNumber;
            const endLine = selection.endLineNumber;
            for (let i = startLine; i <= endLine; i++) {
              if (model && typeof model.forceTokenization === 'function') {
                model.forceTokenization(i);
              }
            }
            editor.layout();
          }
        }
      } catch (_) {}
    }, 50);
  }, [handlers]);

  // 🎯 툴바 아이템 ID(camelCase)를 EditorCommandType(UPPER_SNAKE_CASE)으로 변환하는 헬퍼
  // 일부 아이템은 ID와 커맨드 타입이 의미적으로 다르므로 명시적 매핑 테이블을 우선 사용
  const mapIdToCommandType = useCallback((id: string): EditorCommandType => {
    // 🔑 명시적 매핑 테이블: TOOLBAR_ITEMS id → EditorCommandType
    // (id ≠ commandType 인 항목들을 수동으로 정의하여 싱크 보장)
    const EXPLICIT_MAP: Record<string, EditorCommandType> = {
      bold: 'BOLD',
      italic: 'ITALIC',
      inlineCode: 'INLINE_CODE',
      underline: 'UNDERLINE',
      strikethrough: 'STRIKETHROUGH',
      h1: 'H1', h2: 'H2', h3: 'H3', h4: 'H4', h5: 'H5', h6: 'H6',
      divider: 'HR',        // id는 divider이지만 커맨드는 HR
      pageBreak: 'PAGE_BREAK',
      orderedList: 'ORDERED_LIST',
      list: 'LIST',
      quote: 'QUOTE',
      checklist: 'CHECKLIST',
      clear: 'REMOVE_PREFIX',  // id는 clear이지만 커맨드는 REMOVE_PREFIX
      cleanDoc: 'CLEAN_DOC',
      link: 'LINK',
      taglink: 'TAGLINK',
      doclink: 'DOCLINK',
      image: 'IMAGE',
      video: 'VIDEO',
      youtube: 'YOUTUBE',
      calendar: 'NOW',
      now: 'NOW',
      map: 'MAP',
      chart: 'CHART',
      codeblock: 'CODE_BLOCK',
      math: 'MATH',
      table: 'TABLE',
      quickTable: 'QUICK_TABLE',
      insertTableRow: 'INSERT_TABLE_ROW',
      deleteTableRow: 'DELETE_TABLE_ROW',
      toggleFloatingToolbar: 'TOGGLE_FLOATING_TOOLBAR',
      toggleToolbar: 'TOGGLE_TOOLBAR',
      toggleSidebar: 'TOGGLE_SIDEBAR',
      toggleMode: 'TOGGLE_MODE',
      toggleTheme: 'TOGGLE_THEME',
      'wrap-h1': 'WRAP_H1',
      'wrap-h2': 'WRAP_H2',
      'wrap-h3': 'WRAP_H3',
      'wrap-quote': 'WRAP_QUOTE',
      'wrap-code': 'WRAP_CODE',
    };
    if (EXPLICIT_MAP[id]) return EXPLICIT_MAP[id];
    // 명시적 매핑이 없으면 camelCase → UPPER_SNAKE_CASE 자동 변환으로 폴백
    const snake = id.replace(/([A-Z])/g, '_$1').toUpperCase();
    return snake as EditorCommandType;
  }, []);

  useEffect(() => {
    if (!editorRef.current || !(window as any).monaco) return;
    const editor = editorRef.current;
    const monaco = (window as any).monaco;

    hotkeyDisposablesRef.current.forEach(d => d.dispose());
    hotkeyDisposablesRef.current = [];

    // 글로벌 trigger-custom-action 명령어를 위한 최신 디스패처 갱신
    if (typeof window !== 'undefined') {
      (window as any).dispatchEditorCommand = (id: string) => {
        const cmdType = mapIdToCommandType(id);
        dispatchCommand(cmdType);
      };
    }

    const parseKeybinding = (keyStr: string) => {
      if (!keyStr) return 0;
      let binding = 0;
      const parts = keyStr.split('+').map(p => p.trim().toUpperCase());
      if (parts.includes('CTRL') || parts.includes('CTRLCMD')) binding |= monaco.KeyMod.CtrlCmd;
      if (parts.includes('SHIFT')) binding |= monaco.KeyMod.Shift;
      if (parts.includes('ALT')) binding |= monaco.KeyMod.Alt;
      if (parts.includes('WIN') || parts.includes('META')) binding |= monaco.KeyMod.WinCtrl;

      const keyPart = parts[parts.length - 1];
      if (keyPart.length === 1 && keyPart >= 'A' && keyPart <= 'Z') {
        binding |= monaco.KeyCode[`Key${keyPart}`];
      } else if (keyPart >= '0' && keyPart <= '9') {
        binding |= monaco.KeyCode[`Digit${keyPart}`];
      } else if (keyPart === '-') {
        binding |= monaco.KeyCode.Minus;
      } else if (keyPart === '=') {
        binding |= monaco.KeyCode.Equal;
      } else if (keyPart === '\\') {
        binding |= monaco.KeyCode.Backslash;
      } else if (keyPart === '[') {
        binding |= monaco.KeyCode.BracketLeft;
      } else if (keyPart === ']') {
        binding |= monaco.KeyCode.BracketRight;
      } else if (keyPart === ';') {
        binding |= monaco.KeyCode.Semicolon;
      } else if (keyPart === "'") {
        binding |= monaco.KeyCode.Quote;
      } else if (keyPart === ',') {
        binding |= monaco.KeyCode.Comma;
      } else if (keyPart === '.') {
        binding |= monaco.KeyCode.Period;
      } else if (keyPart === '/') {
        binding |= monaco.KeyCode.Slash;
      } else if (keyPart === 'SPACE') {
        binding |= monaco.KeyCode.Space;
      } else if (keyPart === 'ENTER') {
        binding |= monaco.KeyCode.Enter;
      } else if (keyPart === 'DELETE') {
        binding |= monaco.KeyCode.Delete;
      } else if (keyPart === 'BACKSPACE') {
        binding |= monaco.KeyCode.Backspace;
      } else if (keyPart === 'TAB') {
        binding |= monaco.KeyCode.Tab;
      } else if (keyPart === 'ESCAPE' || keyPart === 'ESC') {
        binding |= monaco.KeyCode.Escape;
      } else if (keyPart.length >= 2 && keyPart.startsWith('F')) {
        const fNum = parseInt(keyPart.substring(1));
        if (fNum >= 1 && fNum <= 12) {
          binding |= monaco.KeyCode[`F${fNum}`];
        }
      }
      return binding;
    };

    // 🚀 기존 Object.entries(handlers) 방식 → TOOLBAR_ITEMS 기준 순회로 전환
    // 이유: handlers 메소드명과 TOOLBAR_ITEMS의 id가 불일치하면(예: checklist vs check, divider vs hr)
    //       일부 단축키가 등록되지 않아 툴바·슬래시·단축키 3자 사이의 갯수·기능 싱크가 깨짐
    TOOLBAR_ITEMS.forEach(item => {
      const kbStr = customHotkeys[item.id];
      const kb = kbStr ? parseKeybinding(kbStr) : 0;

      const disposable = editor.addAction({
        id: `custom-action-${item.id}`,
        label: `${item.name} (${item.group})`,
        keybindings: kb !== 0 ? [kb] : [],
        run: () => {
          // 🚀 handlers 직접 호출 대신 dispatchCommand 단방향 파이프라인으로 일원화
          const cmdType = mapIdToCommandType(item.id);
          dispatchCommand(cmdType);
        }
      });
      hotkeyDisposablesRef.current.push(disposable);
    });

    // 💡 Monaco Editor 인스턴스에 Ctrl+S 및 Ctrl+Shift+S 저장 액션 바인딩
    const saveAction = editor.addAction({
      id: 'custom-action-save',
      label: '저장 (Save)',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: () => {
        dispatchCommand('SAVE');
      }
    });
    hotkeyDisposablesRef.current.push(saveAction);

    const saveAsAction = editor.addAction({
      id: 'custom-action-save-as',
      label: '다른 이름으로 저장 (Save As)',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KeyS],
      run: () => {
        dispatchCommand('SAVE_AS');
      }
    });
    hotkeyDisposablesRef.current.push(saveAsAction);
  }, [customHotkeys, isEditorReady, dispatchCommand, mapIdToCommandType]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // 💡 포커스가 모나코 에디터 외부의 일반 HTML 입력 요소(input, select, textarea)인 경우
      // 글로벌 단축키 가로채기 동작을 차단하고 브라우저 기본 입력을 전적으로 허용합니다.
      const target = e.target as HTMLElement;
      if (target) {
        const isFormElement = target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA';
        const isInsideMonaco = target.closest('.monaco-editor') !== null;
        if (isFormElement && !isInsideMonaco) {
          return;
        }
      }

      // Escape: 플로팅 툴바 숨김 또는 문서링크 선택기 닫기 (에디터 포커스 무관)
      if (e.key === 'Escape') {
        if (showTagLinkPicker) {
          e.preventDefault();
          e.stopPropagation();
          setShowTagLinkPicker(false);
          return;
        }
        if (floatingToolbar.visible) {
          e.preventDefault();
          e.stopPropagation();
          setFloatingToolbar(prev => ({ ...prev, visible: false }));
          return;
        }
      }

      const isCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const isAlt = e.altKey;

      // 💡 [IME-02] 브라우저 환경에서 Ctrl+S 저장 시 웹페이지 저장(HTML) 다이얼로그가 강제 노출되는 이벤트를 차단하고 
      // 우리 에디터 고유의 저장 커맨드를 실행하도록 원천 차단합니다. (에디터 포커스 여부와 관계없이 전역 방어)
      if (isCtrl) {
        const keyUpper = e.key.toUpperCase();
        if (keyUpper === 'S' && isShift) {
          e.preventDefault();
          e.stopPropagation();
          dispatchCommand('SAVE_AS');
          return;
        }
        if (keyUpper === 'S' && !isShift) {
          e.preventDefault();
          e.stopPropagation();
          dispatchCommand('SAVE');
          return;
        }
      }

      // 💡 [Ctrl+O 차단] 파일 열기 기능이 제거되었으므로, 브라우저 기본 파일 열기 다이얼로그(Ctrl+O)가 나타나지 않도록 원천 차단합니다.
      if (isCtrl && !isAlt && !isShift) {
        const keyUpper = e.key.toUpperCase();
        if (keyUpper === 'O') {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
      }

      // 💡 [글로벌 푸터 제어 단축키 예외 가드]
      // 플로팅 툴바, 툴바, 사이드바, 모드, 테마 전환 단축키(Ctrl+Shift+F1 ~ F5)는
      // 에디터 포커스 유무와 관계없이 브라우저 기본 동작(예: F5 새로고침, F3 검색 등)과 충돌하여 오작동하는 것을 원천 차단하기 위해
      // 포커스 체크 전에 전역적으로 이벤트를 가로채서 수동 격발시킵니다.
      const combinationPartsForGlobal: string[] = [];
      if (isCtrl) combinationPartsForGlobal.push('CTRL');
      if (isShift) combinationPartsForGlobal.push('SHIFT');
      if (isAlt) combinationPartsForGlobal.push('ALT');
      combinationPartsForGlobal.push(e.key.toUpperCase());
      const combinationStrForGlobal = combinationPartsForGlobal.join('+');

      const globalOnlyKeys = ['toggleFloatingToolbar', 'toggleToolbar', 'toggleSidebar', 'toggleMode', 'toggleTheme'];
      let handledGlobal = false;
      for (const keyId of globalOnlyKeys) {
        const configuredHotkey = customHotkeys[keyId] || (TOOLBAR_ITEMS.find(item => item.id === keyId)?.defaultHotkey);
        if (!configuredHotkey) continue;
        const normalizedConfig = configuredHotkey
          .replace(/\s+/g, '')
          .toUpperCase()
          .replace('CTRLCMD', 'CTRL');

        if (combinationStrForGlobal === normalizedConfig) {
          e.preventDefault();
          e.stopPropagation();
          const cmdType = mapIdToCommandType(keyId);
          dispatchCommand(cmdType);
          handledGlobal = true;
          break;
        }
      }
      if (handledGlobal) return;

      // 에디터 포커스가 활성화되어 있을 때만 에디터 단축키 인터셉터 작동
      if (!editorRef.current || !editorRef.current.hasTextFocus()) return;

      let key = e.key.toUpperCase();

      // 1. Shift 눌림에 의한 숫자 키의 기호 변조 보정 (& -> 7, * -> 8)
      if (e.code.startsWith('Digit')) {
        key = e.code.substring(5); // 'Digit7' -> '7'
      }

      // 2. 한글 입력기(IME) 상태에서 Ctrl+Shift 조합 입력 시 229 Process 상태 물리 복원
      if (e.keyCode === 229 && isCtrl && isShift) {
        if (e.code.startsWith('Key')) {
          key = e.code.substring(3).toUpperCase(); // 'KeyX' -> 'X'
        }
      }

      // 조합 스캔 키 문자열 생성 (예: CTRL+SHIFT+X)
      const combinationParts: string[] = [];
      if (isCtrl) combinationParts.push('CTRL');
      if (isShift) combinationParts.push('SHIFT');
      if (isAlt) combinationParts.push('ALT');
      combinationParts.push(key);

      const combinationStr = combinationParts.join('+');

      // 등록된 단축키 목록에서 일치하는 기능 스캔
      for (const item of TOOLBAR_ITEMS) {
        const configuredHotkey = customHotkeys[item.id] || item.defaultHotkey;
        if (!configuredHotkey) continue;

        // 단축키 비교 포맷 표준 정규화 (예: 'Ctrl + Shift + X' -> 'CTRL+SHIFT+X')
        const normalizedConfig = configuredHotkey
          .replace(/\s+/g, '')
          .toUpperCase()
          .replace('CTRLCMD', 'CTRL');

        if (combinationStr === normalizedConfig) {
          // 단축키 매치 성공: 브라우저 기본 및 이벤트 전파 강제 억제
          e.preventDefault();
          e.stopPropagation();

          const cmdType = mapIdToCommandType(item.id);
          dispatchCommand(cmdType);
          break;
        }
      }
    };

    // 캡처(true) 모드로 등록하여 최우선순위로 가로챕니다.
    window.addEventListener('keydown', handleGlobalKeyDown, true);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown, true);
  }, [customHotkeys, dispatchCommand, mapIdToCommandType, floatingToolbar.visible, setFloatingToolbar, showTagLinkPicker, setShowTagLinkPicker]);

  const toc = useMemo(() => {
    if (typeof content !== 'string') return [];
    // 윈도우 스타일의 개행(\r\n)과 일반 개행(\n) 모두를 안전하게 분리
    const lines = content.split(/\r?\n/);
    const items: { id: string, text: string, level: number, lineNumber: number }[] = [];
    let isInCodeBlock = false;
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('```')) {
        isInCodeBlock = !isInCodeBlock;
        return;
      }
      if (isInCodeBlock) return;

      // UTF-8 BOM(\ufeff)을 제거하고, 양쪽 공백이 정리된 깨끗한 텍스트로 헤더를 매칭
      const cleanLine = trimmed.replace(/^\ufeff/, '');
      const match = cleanLine.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const lineNumber = index + 1;
        items.push({
          id: `toc-line-${lineNumber}`,
          text,
          level,
          lineNumber
        });
      }
    });
    return items;
  }, [content]);

  const heightClass = isToolbarOpen ? 'h-[calc(100vh-176px)]' : 'h-[calc(100vh-128px)]';

  return (
    <div className={`flex h-screen flex-col text-slate-800 ${mounted && isDarkMode ? 'dark bg-zinc-950 text-zinc-100' : 'bg-amber-50/20'}`}>

      <MenuBar
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isToolbarOpen={isToolbarOpen}
        setIsToolbarOpen={setIsToolbarOpen}
        previewMode={previewMode}
        setPreviewMode={setPreviewMode}
        dispatch={dispatchCommand}
        setContent={setContent}
        isSearchOpen={isSearchOpen}
        isAddonEnv={isAddonEnv}
        themePalette={themePalette}
        onThemeChange={(themeId) => handleThemeChange(themeId, THEME_MAP)}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <LeftSidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          sidebarWidth={sidebarWidth}
          setSidebarWidth={setSidebarWidth}
          sidebarTab={sidebarTab}
          setSidebarTab={setSidebarTab}
          isSearchOpen={isSearchOpen}
          setIsSearchOpen={setIsSearchOpen}
          isDarkMode={isDarkMode}
          content={content}
          currentFileName={currentFileName}
          setCurrentFileName={setCurrentFileName}
          setCurrentFileNode={setCurrentFileNode}
          setContent={setContent}
          lastSavedContentRef={lastSavedContentRef}
          editorRef={editorRef}
          previewRef={previewRef}
          toc={toc}
          scrollToLine={scrollToLine}
          showToast={showToast}
          fileList={fileList}
          rootFolder={rootFolder}
          workspaceType={workspaceType}
          openFile={handleFileClick}
          currentFileNode={currentFileNode}
          refreshFileList={refreshFileList}

          askConfirm={(config) => setConfirmConfig({ isOpen: true, ...config })}
          isMergeMode={isMergeMode}
          previewMode={previewMode}
          setPreviewMode={setPreviewMode}
          selectedMergeNodes={selectedMergeNodes}
          toggleMergeNodeSelect={toggleMergeNodeSelect}
          onSelectRootFolder={() => selectRootFolder('local', null)}
          onRestoreFolder={restoreFolderPermission}
        />

        <main className="flex flex-1 flex-col overflow-hidden bg-white dark:bg-zinc-950">
          {/* 툴바가 열려있을 때 오른쪽 에디터/미리보기 영역에만 위치하도록 main 상단에 배치 */}
          {isToolbarOpen && (
            <div className="relative">
              <Toolbar
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                previewMode={previewMode}
                setPreviewMode={setPreviewMode}
                fontSize={fontSize}
                setFontSize={setFontSize}
                wordWrap={wordWrap}
                setWordWrap={setWordWrap}
                dispatch={dispatchCommand}
              />
              {licenseStatus.isExpired && (
                <div className="absolute inset-0 bg-white/25 dark:bg-zinc-900/25 backdrop-blur-[0.5px] cursor-not-allowed z-30" title="라이선스 기간이 만료되어 도구 모음이 잠겨 있습니다." />
              )}
            </div>
          )}

          {/* 탭 바를 오른쪽 에디터/미리보기 영역에만 위치하도록 main 상단에 배치 */}
          <UnifiedTabBar
            tabs={tabs}
            activeTabId={activeTabId}
            onSwitchTab={switchTab}
            onCloseTab={closeTab}
            onCreateNewTab={() => createNewTab()}
            isDarkMode={isDarkMode}
          />
          <div className="flex flex-1 overflow-hidden">
            {previewMode === 'css-style' && (
              <CssStyleForm
                profiles={profiles}
                activeProfileId={activeProfileId}
                onSelectProfile={setActiveProfileId}
                onUpdateProfile={(updated) => setProfiles(prev =>
                  prev.map(p => p.id === updated.id ? updated : p)
                )}
                /*
                 * onAddProfile — 새 사용자 프로필 생성:
                 * DEFAULT_PROFILE을 템플릿으로 복제
                 * 생성 직후 새 프로필로 자동 전환
                 */
                onAddProfile={() => {
                  const newId = 'profile-' + Date.now();
                  const count = profiles.filter(p => !isSystemProfileId(p.id)).length + 1;
                  setProfiles(prev => [...prev, {
                    ...DEFAULT_PROFILE,
                    id: newId,
                    name: `나만의 서식 ${count}`,
                    rules: JSON.parse(JSON.stringify(DEFAULT_PROFILE.rules)),
                  }]);
                  setActiveProfileId(newId);
                }}
                /*
                 * onDeleteProfile — 사용자 프로필 삭제:
                 * 시스템 프로필은 삭제 불가
                 * 현재 보고 있던 프로필이 삭제되면 첫 번째 시스템 프로필로 전환
                 */
                onDeleteProfile={(id) => {
                  if (isSystemProfileId(id)) return;
                  setProfiles(prev => prev.filter(p => p.id !== id));
                  if (activeProfileId === id) {
                    setActiveProfileId(SYSTEM_PROFILES[0].id);
                  }
                }}
                onImportProfile={(imported) => {
                  const newId = 'profile-' + Date.now();
                  const merged: CssProfile = {
                    ...DEFAULT_PROFILE,
                    ...imported,
                    id: newId,
                    name: imported.name || '가져온 서식',
                    pageStyle: { ...DEFAULT_PROFILE.pageStyle, ...(imported.pageStyle || {}) },
                    rules: imported.rules ? { ...DEFAULT_PROFILE.rules, ...imported.rules } : JSON.parse(JSON.stringify(DEFAULT_PROFILE.rules)),
                    hrStructure: imported.hrStructure ? { ...DEFAULT_PROFILE.hrStructure, ...imported.hrStructure } : DEFAULT_PROFILE.hrStructure ? { ...DEFAULT_PROFILE.hrStructure } : undefined,
                    checkboxStructure: imported.checkboxStructure ? { ...DEFAULT_PROFILE.checkboxStructure, ...imported.checkboxStructure } : DEFAULT_PROFILE.checkboxStructure ? { ...DEFAULT_PROFILE.checkboxStructure } : undefined,
                  };
                  setProfiles(prev => [...prev, merged]);
                  setActiveProfileId(newId);
                  showToast(`서식 '${merged.name}'이(가) 추가되었습니다.`, 'success');
                }}
                onClose={() => setPreviewMode('both')}
              />
            )}

            <div
              className={`flex-1 min-w-0 ${heightClass} relative border-r border-black/5 dark:border-white/5 pt-3`}
              style={{ display: (previewMode === 'preview' || previewMode === 'css-style') ? 'none' : 'block' }}
            >
                <Editor
                  height="100%"
                  language="markdown"
                  theme={themePalette}
                  options={{
                    readOnly: licenseStatus.isExpired,
                    domReadOnly: licenseStatus.isExpired,
                  }}
                  // 💡 value={content} 속성을 배제하고 defaultValue를 적용하여
                  // React 상태 갱신 시 모나코 내부의 불필요한 setValue 호출로 인한 한글 composition 깨짐 및 중복 입력을 원천 방어합니다.
                  defaultValue={content}
                  onChange={(val) => {
                    // 💡 [에디터 언마운트 데이터 유실 가드]
                    // 에디터가 언마운트된 상태이거나 파괴 진행 중이면 모든 변경 입력을 무시하여 데이터 유실을 완전 가드합니다.
                    if (!isEditorMountedRef.current) return;
                    if (previewModeRef.current === 'preview') return; // 💡 [가드] 미리보기 모드일 땐 입력 버퍼 갱신 원천 방지

                    const editor = editorRef.current;
                    if (editor) {
                      const dom = editor.getDomNode();
                      const model = editor.getModel();
                      if (!dom || !model) {
                        return; // 에디터가 파괴 중이므로 빈 값 무시
                      }
                    }
                    updateContent(val || '', true);
                  }}
                  beforeMount={(monaco) => {
                    EDITOR_THEMES.forEach(t => {
                      monaco.editor.defineTheme(t.id, {
                        base: t.base,
                        inherit: true,
                        rules: t.rules,
                        colors: t.colors
                      });
                    });
                  }}
                  onMount={(editor, monaco) => {
                    editorRef.current = editor;
                    if (typeof window !== 'undefined') {
                      (window as any).monaco = monaco;
                    }

                    const updatedTabs = tabsRef.current.map(tab => {
                      if (!tab.model) {
                        const model = monaco.editor.createModel(tab.content, 'markdown');
                        model.onDidChangeContent(() => {
                          const val = model.getValue();
                          setContent(val);
                          setTabs(prev => prev.map(t => t.id === tab.id ? { ...t, content: val, isModified: true } : t));
                        });
                        return { ...tab, model };
                      }
                      return tab;
                    });
                    setTabs(updatedTabs);

                    const activeTab = updatedTabs.find(t => t.id === activeTabIdRef.current);
                    if (activeTab && activeTab.model) {
                      editor.setModel(activeTab.model);
                    } else {
                      editor.setValue(contentRef.current);
                    }

                    // 💡 [IME 조합 감지 락 구현]
                    const textarea = editor.getDomNode()?.querySelector('textarea');
                    if (textarea) {
                      textarea.addEventListener('compositionstart', () => {
                        isComposingRef.current = true;
                      });
                      textarea.addEventListener('compositionend', () => {
                        isComposingRef.current = false;
                        // 조합이 종료된 시점에 에디터 모델이 완전히 갱신되도록 10ms 지연 후 최종값 동기화
                        setTimeout(() => {
                          if (editorRef.current) {
                            setContent(editorRef.current.getValue());
                          }
                        }, 10);
                      });
                    }

                    // 💡 [에디터 하단 여유 공간 확보] scrollBeyondLastLine + padding.bottom 500px로 쾌적한 작문 환경 제공
                    editor.updateOptions({
                      scrollBeyondLastLine: true,
                      padding: { top: 20, bottom: 500 },
                      lineDecorationsWidth: 26, // 💡 decorations 폭을 적절히 줄여 본문을 왼쪽으로 당김
                      lineNumbersMinChars: 4,  // 💡 라인 넘버 영역을 약간 키워서 숫자 노출 폭 확보
                      automaticLayout: true,
                      wrappingStrategy: 'advanced', // 💡 브라우저 폰트 가로폭을 실측하여 텍스트 줄바꿈 계산
                      
                      // 🔒 [하단 클릭 시 에디터 붕 뜸 및 상단 유실 방어 3대 마스터 가드]
                      cursorSurroundingLines: 0,
                      cursorSurroundingLinesStyle: 'all',
                      occurrencesHighlight: 'off',
                      scrollbar: {
                        vertical: 'visible',
                        horizontal: 'auto',
                        useShadows: false,
                        verticalHasArrows: false,
                        horizontalHasArrows: false
                      }
                    });

                    // 💡 [테마 연동 가드] 비동기 세션 복원(restoreSettings)과 에디터 마운트 시차로 인한 테마 미적용 레이스 컨디션 방지
                    if (themePalette) {
                      monaco.editor.setTheme(themePalette);
                    }

                    // 💡 브라우저 맞춤법 검사(빨간 물결선)가 잘려 잔상/찌꺼기처럼 보이는 현상 차단
                    try {
                      const textarea = editor.getDomNode()?.querySelector('textarea');
                      if (textarea) textarea.setAttribute('spellcheck', 'false');
                    } catch (_) {}

                    // 💡 [추가 하드닝] 사이드바 신설/닫힘 시 에디터 굳음 방어: 50ms 후 강제 레이아웃 리프레시
                    setTimeout(() => { editor.layout(); }, 50);

                    // 🤝 [레이스 컨디션 진압 트리거] 
                    // 유저가 하단을 클릭하여 가상 스크롤 컨텍스트가 임의로 깨졌을 때를 대비해,
                    // 포커스 이벤트가 격발되는 순간 에디터의 레이아웃 좌표계를 강제로 제자리로 스냅(Snap) 백 시킵니다.
                    editor.onDidFocusEditorText(() => {
                      // 0.01초 만에 뒤틀린 레이아웃 좌표를 수평 정렬하여 상단 짤림을 영구 방어합니다.
                      editor.layout(); 
                    });
                    
                    // 💡 [IME-blur] 포커스 아웃 시 즉시 React 상태와 에디터 최종 값 동기화 (이중 입력 방지 가드 탑재)
                    editor.onDidBlurEditorText(() => {
                      if (previewDebounceRef.current) {
                        clearTimeout(previewDebounceRef.current);
                        previewDebounceRef.current = null;
                      }
                      // 💡 [IME-blur 보완] 한글 입력 조합(Composition) 종료와 React 상태 갱신 타이밍 간의 레이스 컨디션을 방지하기 위해 
                      // 100ms 지연 후 에디터 최종 값을 React 상태에 동기화하여 마지막 글자 중복 입력을 원천 방어합니다.
                      setTimeout(() => {
                        if (editorRef.current) {
                          const latestVal = editorRef.current.getValue();
                          setContent(latestVal);
                        }
                      }, 100);
                    });

                    // 💡 에디터 내용이 바뀔 때마다(타이핑 및 setValue 포함) 다음 렌더링 프레임에서 데코레이션 즉시 업데이트
                    // 모나코 에디터의 자체 뷰 렌더러가 화면을 새로 그린 직후에 데코레이션을 덮어씌워 파란색 뒤집힘 버그 방지
                    editor.onDidChangeModelContent(() => {
                      requestAnimationFrame(() => {
                        updateDecorations(editor);
                      });
                    });

                    if (!(monaco.editor as any)._customActionCommandRegistered) {
                      (monaco.editor as any)._customActionCommandRegistered = true;
                      (monaco.editor as any).registerCommand('trigger-custom-action', (accessor: any, actionId: string) => {
                        if (typeof window !== 'undefined' && (window as any).dispatchEditorCommand) {
                          (window as any).dispatchEditorCommand(actionId);
                        }
                      });
                    }

                    // 💡 [슬래시 명령어 플레이스홀더 선택] 툴바/단축키와 동일하게 삽입 후 플레이스홀더를 자동 선택합니다.
                    //    arguments: [insertTextLength, placeholderOffset, placeholderLength]
                    //    Monaco completion command는 삽입 완료 후 실행되므로, 커서 위치에서 역산하여 선택 범위를 계산합니다.
                    if (!(monaco.editor as any)._slashPlaceholderCommandRegistered) {
                      (monaco.editor as any)._slashPlaceholderCommandRegistered = true;
                      (monaco.editor as any).registerCommand(
                        'select-slash-placeholder',
                        (accessor: any, insertTextLength: number, placeholderOffset: number, placeholderLength: number) => {
                          // 활성 에디터를 전역 참조에서 가져옴
                          const activeEditor = (monaco.editor as any).getEditors?.()[0];
                          if (!activeEditor) return;

                          const pos = activeEditor.getPosition();
                          if (!pos) return;

                          // 삽입된 텍스트는 단일 라인이므로: 삽입 후 커서 컬럼 = 삽입 시작 컬럼 + insertTextLength
                          // 플레이스홀더 시작 컬럼 = 삽입 시작 컬럼 + placeholderOffset
                          const insertStartCol = pos.column - insertTextLength;
                          const selStartCol = insertStartCol + placeholderOffset;
                          const selEndCol = selStartCol + placeholderLength;

                          if (selStartCol < 1) return;

                          setTimeout(() => {
                            activeEditor.setSelection(new (window as any).monaco.Selection(
                              pos.lineNumber,
                              selStartCol,
                              pos.lineNumber,
                              selEndCol
                            ));
                            activeEditor.focus();
                          }, 10);
                        }
                      );
                    }
                    // 대용량 문서 엔터 키 입력 시 자동 스크롤 패치 (CORE-01)
                    editor.onKeyDown((e) => {
                      if (e.keyCode === monaco.KeyCode.Enter) {
                        // 엔터가 입력되어 행이 추가된 직후, 커널 스케줄러를 한 틱 늦춰서 최신 좌표 추출
                        setTimeout(() => {
                          const position = editor.getPosition();
                          if (position) {
                            // 커서가 뷰포트 바깥으로 나가면 무조건 화면 중앙이나 하단으로 스크롤 강제 이송
                            editor.revealPositionInCenterIfOutsideViewport(position);
                          }
                        }, 10);
                      }
                    });

                    editor.onKeyUp((e) => {
                      if (e.browserEvent.key === '/') {
                        editor.trigger('keyboard', 'editor.action.triggerSuggest', {});
                      }
                    });

                    // Shift + Enter 를 누르면 실제 엔터(\n) 대신 <br> 태그를 삽입 (표 내부 줄바꿈 용도)
                    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
                      const position = editor.getPosition();
                      if (!position) return;
                      editor.executeEdits("insertBr", [{
                        range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
                        text: "<br>",
                        forceMoveMarkers: true
                      }]);
                    });

                    // 🛡️ [한글 주석 탑재] 표(Table) 자동 정렬 및 너비 계산 헬퍼 함수 정의
                    const getVisualLength = (str: string): number => {
                      let len = 0;
                      for (let i = 0; i < str.length; i++) {
                        const code = str.charCodeAt(i);
                        if (code >= 0x2e80 || (code >= 0xac00 && code <= 0xd7a3)) {
                          len += 2;
                        } else {
                          len += 1;
                        }
                      }
                      return len;
                    };

                    const padVisual = (str: string, targetVisualLen: number): string => {
                      const currentLen = getVisualLength(str);
                      const needed = targetVisualLen - currentLen;
                      if (needed <= 0) return str;
                      return str + ' '.repeat(needed);
                    };

                    const formatTableBlock = (editorInstance: any, targetLineNumber: number) => {
                      const model = editorInstance.getModel();
                      if (!model) return;

                      const lineCount = model.getLineCount();
                      let startLine = targetLineNumber;
                      let endLine = targetLineNumber;

                      // 위쪽 표 영역 시작점 찾기
                      while (startLine > 1) {
                        const prevLineContent = model.getLineContent(startLine - 1);
                        if (isTableLine(prevLineContent)) {
                          startLine--;
                        } else {
                          break;
                        }
                      }

                      // 아래쪽 표 영역 끝점 찾기
                      while (endLine < lineCount) {
                        const nextLineContent = model.getLineContent(endLine + 1);
                        if (isTableLine(nextLineContent)) {
                          endLine++;
                        } else {
                          break;
                        }
                      }

                      const rows: { lineNumber: number; content: string; isDivider: boolean; cells: string[] }[] = [];
                      let maxCols = 0;

                      for (let i = startLine; i <= endLine; i++) {
                        const content = model.getLineContent(i);
                        const isDivider = isTableDividerLine(content);
                        const trimmed = content.trim();
                        const inner = trimmed.substring(1, trimmed.length - 1);
                        
                        const cells: string[] = [];
                        let currentCell = "";
                        for (let j = 0; j < inner.length; j++) {
                          if (inner[j] === '|') {
                            if (j > 0 && inner[j - 1] === '\\') {
                              currentCell += '|';
                            } else {
                              cells.push(currentCell);
                              currentCell = "";
                            }
                          } else {
                            currentCell += inner[j];
                          }
                        }
                        cells.push(currentCell);
                        
                        const trimmedCells = cells.map(c => c.trim());
                        maxCols = Math.max(maxCols, trimmedCells.length);
                        
                        rows.push({
                          lineNumber: i,
                          content,
                          isDivider,
                          cells: trimmedCells
                        });
                      }

                      if (rows.length === 0 || maxCols === 0) return;

                      // 각 열별 비주얼 너비 최댓값 계산 (구분행은 배제)
                      const colWidths = Array(maxCols).fill(0);
                      for (const row of rows) {
                        if (row.isDivider) continue;
                        for (let colIdx = 0; colIdx < maxCols; colIdx++) {
                          const cellText = row.cells[colIdx] || "";
                          const visualLen = getVisualLength(cellText);
                          colWidths[colIdx] = Math.max(colWidths[colIdx], visualLen);
                        }
                      }

                      // 최소 너비 3 보장
                      for (let colIdx = 0; colIdx < maxCols; colIdx++) {
                        colWidths[colIdx] = Math.max(3, colWidths[colIdx]);
                      }

                      const edits: any[] = [];
                      for (const row of rows) {
                        let formattedLine = "|";
                        for (let colIdx = 0; colIdx < maxCols; colIdx++) {
                          const cellText = row.cells[colIdx] || "";
                          const width = colWidths[colIdx];
                          if (row.isDivider) {
                            const text = cellText.trim();
                            const alignLeft = text.startsWith(':');
                            const alignRight = text.endsWith(':');
                            let dividerStr = "";
                            if (alignLeft && alignRight) {
                              dividerStr = ":" + "-".repeat(Math.max(1, width - 2)) + ":";
                            } else if (alignLeft) {
                              dividerStr = ":" + "-".repeat(Math.max(2, width - 1));
                            } else if (alignRight) {
                              dividerStr = "-".repeat(Math.max(2, width - 1)) + ":";
                            } else {
                              dividerStr = "-".repeat(Math.max(3, width));
                            }
                            formattedLine += ` ${dividerStr} |`;
                          } else {
                            const padded = padVisual(cellText, width);
                            formattedLine += ` ${padded} |`;
                          }
                        }
                        const originalLine = model.getLineContent(row.lineNumber);
                        const indentMatch = originalLine.match(/^([ \t]*)/);
                        const indent = indentMatch ? indentMatch[1] : '';
                        const finalLineText = indent + formattedLine;

                        if (finalLineText !== originalLine) {
                          edits.push({
                            range: new monaco.Range(row.lineNumber, 1, row.lineNumber, originalLine.length + 1),
                            text: finalLineText
                          });
                        }
                      }

                      if (edits.length > 0) {
                        editorInstance.pushUndoStop();
                        editorInstance.executeEdits("formatTable", edits);
                        editorInstance.pushUndoStop();
                      }
                    };

                    // 🛡️ [한글 주석 탑재] 표(Table) 여부 및 구분행 판별 헬퍼 함수 정의
                    const isTableLine = (text: string): boolean => {
                      const trimmed = text.trim();
                      return trimmed.startsWith('|') && trimmed.endsWith('|') && (trimmed.match(/\|/g) || []).length >= 2;
                    };

                    const isTableDividerLine = (text: string): boolean => {
                      const trimmed = text.trim();
                      if (!isTableLine(trimmed)) return false;
                      const inner = trimmed.substring(1, trimmed.length - 1);
                      const parts = inner.split('|');
                      return parts.every(part => /^[ \t]*:?-+:?[ \t]*$/.test(part));
                    };

                    const getCellRanges = (lineContent: string, lineNumber: number) => {
                      const ranges: { lineNumber: number; startColumn: number; endColumn: number; isEmpty: boolean }[] = [];
                      const pipeIndices: number[] = [];
                      for (let i = 0; i < lineContent.length; i++) {
                        if (lineContent[i] === '|') {
                          if (i > 0 && lineContent[i - 1] === '\\') continue;
                          pipeIndices.push(i);
                        }
                      }
                      if (pipeIndices.length < 2) return { ranges: [], pipeIndices: [] };
                      for (let i = 0; i < pipeIndices.length - 1; i++) {
                        const startIdx = pipeIndices[i] + 1;
                        const endIdx = pipeIndices[i + 1];
                        const rawText = lineContent.substring(startIdx, endIdx);
                        const hasLeftSpace = rawText.startsWith(' ');
                        const hasRightSpace = rawText.endsWith(' ');
                        const trimLeft = hasLeftSpace ? 1 : 0;
                        const trimRight = hasRightSpace ? 1 : 0;
                        const cellStartCol = startIdx + 1 + trimLeft;
                        const cellEndCol = endIdx + 1 - trimRight;
                        const coreText = rawText.substring(trimLeft, rawText.length - trimRight);
                        const isEmpty = coreText.trim().length === 0;

                        if (isEmpty) {
                          // 빈 셀: 파이프 사이 공백들의 정중앙 컬럼에 크기 0의 셀 범위를 생성 (타이핑 시 양옆 공백 1칸 보존)
                          const centerCol = startIdx + 1 + Math.max(1, Math.floor(rawText.length / 2));
                          ranges.push({
                            lineNumber,
                            startColumn: centerCol,
                            endColumn: centerCol,
                            isEmpty: true
                          });
                        } else {
                          ranges.push({
                            lineNumber,
                            startColumn: cellStartCol,
                            endColumn: cellEndCol,
                            isEmpty: false
                          });
                        }
                      }
                      return { ranges, pipeIndices };
                    };

                    // 🛡️ [한글 주석 탑재] Tab 키 입력 시 마크다운 표 셀 내비게이션 / 행 생성 및 목록 들여쓰기(Indent) 통합 처리
                    // 자동완성(Suggest Widget)이 열려 있으면 Tab → 자동완성 수락에 양보하고,
                    // 표 안이라면 다음 셀 이동 및 끝 셀에서 행 자동 생성을 수행하며,
                    // 그 외 마크다운 목록 또는 인용문이 감지되면 2칸 들여쓰기를 삽입합니다.
                    editor.addCommand(monaco.KeyCode.Tab, () => {
                      // ① 자동완성 위젯이 열려 있으면 Tab = 자동완성 항목 수락
                      try {
                        const contextKeyService = (editor as any)._contextKeyService;
                        const isSuggestVisible = contextKeyService?.getContextKeyValue('suggestWidgetVisible') === true;
                        if (isSuggestVisible) {
                          editor.trigger('keyboard', 'acceptSelectedSuggestion', {});
                          return;
                        }
                      } catch (_) { /* 위젯 접근 실패 시 무시 */ }

                      const selection = editor.getSelection();
                      const model = editor.getModel();
                      if (!model || !selection) {
                        editor.trigger('keyboard', 'tab', null);
                        return;
                      }

                      // ② 마크다운 표 영역인지 검사 및 표 내비게이션 / 행 추가 처리
                      const position = editor.getPosition();
                      if (position) {
                        const lineContent = model.getLineContent(position.lineNumber);
                        if (isTableLine(lineContent) && !isTableDividerLine(lineContent)) {
                          const { ranges, pipeIndices } = getCellRanges(lineContent, position.lineNumber);
                          if (ranges.length > 0) {
                            let currentCellIdx = -1;
                            for (let i = 0; i < pipeIndices.length - 1; i++) {
                              const leftCol = pipeIndices[i] + 1;
                              const rightCol = pipeIndices[i + 1] + 2;
                              if (position.column >= leftCol && position.column <= rightCol) {
                                currentCellIdx = i;
                                break;
                              }
                            }

                            if (currentCellIdx !== -1) {
                              if (currentCellIdx < ranges.length - 1) {
                                // 다음 셀로 이동
                                const nextCell = ranges[currentCellIdx + 1];
                                editor.setSelection(new monaco.Selection(
                                  nextCell.lineNumber, nextCell.startColumn,
                                  nextCell.lineNumber, nextCell.endColumn
                                ));
                                return;
                              } else {
                                // 현재 행이 마지막 셀인 경우 -> 다음 행으로 이동 또는 신규 행 삽입
                                let targetLine = position.lineNumber + 1;
                                const lineCount = model.getLineCount();
                                if (targetLine <= lineCount) {
                                  let nextLineContent = model.getLineContent(targetLine);
                                  if (isTableLine(nextLineContent) && isTableDividerLine(nextLineContent)) {
                                    targetLine++;
                                    if (targetLine <= lineCount) {
                                      nextLineContent = model.getLineContent(targetLine);
                                    } else {
                                      nextLineContent = "";
                                    }
                                  }

                                  if (isTableLine(nextLineContent)) {
                                    const nextLineRanges = getCellRanges(nextLineContent, targetLine).ranges;
                                    if (nextLineRanges.length > 0) {
                                      const firstCell = nextLineRanges[0];
                                      editor.setSelection(new monaco.Selection(
                                        firstCell.lineNumber, firstCell.startColumn,
                                        firstCell.lineNumber, firstCell.endColumn
                                      ));

                                      // 💡 다음 행으로 이동 시 스크롤 튀는 현상 방지 락 및 강제 동기화
                                      isScrollingRef.current = 'editor';
                                      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                                      scrollTimeoutRef.current = setTimeout(() => { isScrollingRef.current = null; }, 200);
                                      setTimeout(() => {
                                        if (previewRef.current) {
                                          const targetElement = previewRef.current.querySelector(`[data-line="${targetLine}"]`);
                                          if (targetElement) {
                                            targetElement.scrollIntoView({ behavior: 'auto', block: 'nearest' });
                                          }
                                        }
                                      }, 50);
                                      return;
                                    }
                                  }
                                }

                                // 다음 행이 없거나 표 행이 아니라면 -> 신규 행 자동 추가
                                const cellCount = ranges.length;
                                const newRowText = "\n|" + "  |".repeat(cellCount);
                                const lastLineMaxCol = model.getLineMaxColumn(position.lineNumber);
                                editor.pushUndoStop();
                                editor.executeEdits("insertTableRow", [{
                                  range: new monaco.Range(position.lineNumber, lastLineMaxCol, position.lineNumber, lastLineMaxCol),
                                  text: newRowText,
                                  forceMoveMarkers: true
                                }]);
                                editor.pushUndoStop();

                                const newRowNumber = position.lineNumber + 1;
                                const newRowContent = model.getLineContent(newRowNumber);
                                const newRowRanges = getCellRanges(newRowContent, newRowNumber).ranges;
                                if (newRowRanges.length > 0) {
                                  const firstCell = newRowRanges[0];
                                  editor.setSelection(new monaco.Selection(
                                    firstCell.lineNumber, firstCell.startColumn,
                                    firstCell.lineNumber, firstCell.endColumn
                                  ));
                                }

                                // 💡 행 추가 후 스크롤 튀는 현상 방지 락 및 강제 동기화
                                isScrollingRef.current = 'editor';
                                if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                                scrollTimeoutRef.current = setTimeout(() => { isScrollingRef.current = null; }, 300);
                                setTimeout(() => {
                                  if (previewRef.current) {
                                    const targetElement = previewRef.current.querySelector(`[data-line="${newRowNumber}"]`);
                                    if (targetElement) {
                                      targetElement.scrollIntoView({ behavior: 'auto', block: 'center' });
                                    }
                                  }
                                }, 80);
                                return;
                              }
                            }
                          }
                        }
                      }

                      // ③ 기존 리스트 및 인용문 들여쓰기(Indent) 처리
                      const startLine = selection.startLineNumber;
                      const endLine = selection.endLineNumber;

                      let hasList = false;
                      for (let i = startLine; i <= endLine; i++) {
                        const lineContent = model.getLineContent(i);
                        if (/^[ \t]*([-*+]|\d+\.|>)/.test(lineContent)) {
                          hasList = true;
                          break;
                        }
                      }

                      if (hasList) {
                        editor.pushUndoStop();
                        const edits: any[] = [];
                        for (let i = startLine; i <= endLine; i++) {
                          edits.push({
                            range: new monaco.Range(i, 1, i, 1),
                            text: " ".repeat(tabSizeRef.current)
                          });
                        }
                        editor.executeEdits("indentList", edits);
                        editor.pushUndoStop();
                        return;
                      }

                      // 목록이 아니라면 기본의 탭 이동을 트리거
                      editor.trigger('keyboard', 'tab', null);
                    });

                    // 🛡️ [한글 주석 탑재] Shift + Tab 키 입력 시 마크다운 표 역방향 셀 이동 및 목록 내어쓰기(Outdent) 통합 처리
                    // 현재 커서가 표 내부이면 이전 셀로 커서를 이동하고,
                    // 목록 계층에 있으면 맨 앞에 존재하는 2칸 공백 또는 1칸 탭 문자를 소거하여 아웃덴트 정렬합니다.
                    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Tab, () => {
                      const selection = editor.getSelection();
                      const model = editor.getModel();
                      if (!model || !selection) return;

                      // ① 마크다운 표 영역인지 검사 및 표 역방향 셀 이동 처리
                      const position = editor.getPosition();
                      if (position) {
                        const lineContent = model.getLineContent(position.lineNumber);
                        if (isTableLine(lineContent) && !isTableDividerLine(lineContent)) {
                          const { ranges, pipeIndices } = getCellRanges(lineContent, position.lineNumber);
                          if (ranges.length > 0) {
                            let currentCellIdx = -1;
                            for (let i = 0; i < pipeIndices.length - 1; i++) {
                              const leftCol = pipeIndices[i] + 1;
                              const rightCol = pipeIndices[i + 1] + 2;
                              if (position.column >= leftCol && position.column <= rightCol) {
                                currentCellIdx = i;
                                break;
                              }
                            }

                            if (currentCellIdx !== -1) {
                              if (currentCellIdx > 0) {
                                // 이전 셀로 이동
                                const prevCell = ranges[currentCellIdx - 1];
                                editor.setSelection(new monaco.Selection(
                                  prevCell.lineNumber, prevCell.startColumn,
                                  prevCell.lineNumber, prevCell.endColumn
                                ));
                                return;
                              } else {
                                // 첫 번째 셀에서 Shift+Tab -> 이전 행의 마지막 셀로 이동
                                let targetLine = position.lineNumber - 1;
                                if (targetLine >= 1) {
                                  let prevLineContent = model.getLineContent(targetLine);
                                  if (isTableLine(prevLineContent) && isTableDividerLine(prevLineContent)) {
                                    targetLine--;
                                    if (targetLine >= 1) {
                                      prevLineContent = model.getLineContent(targetLine);
                                    } else {
                                      prevLineContent = "";
                                    }
                                  }

                                  if (isTableLine(prevLineContent)) {
                                    const prevLineRanges = getCellRanges(prevLineContent, targetLine).ranges;
                                    if (prevLineRanges.length > 0) {
                                      const lastCell = prevLineRanges[prevLineRanges.length - 1];
                                      editor.setSelection(new monaco.Selection(
                                        lastCell.lineNumber, lastCell.startColumn,
                                        lastCell.lineNumber, lastCell.endColumn
                                      ));

                                      // 💡 이전 행으로 이동 시 스크롤 튀는 현상 방지 락 및 강제 동기화
                                      isScrollingRef.current = 'editor';
                                      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                                      scrollTimeoutRef.current = setTimeout(() => { isScrollingRef.current = null; }, 200);
                                      setTimeout(() => {
                                        if (previewRef.current) {
                                          const targetElement = previewRef.current.querySelector(`[data-line="${targetLine}"]`);
                                          if (targetElement) {
                                            targetElement.scrollIntoView({ behavior: 'auto', block: 'nearest' });
                                          }
                                        }
                                      }, 50);
                                      return;
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }

                      // 일반 문장이면 기본 아웃덴트 기능 트리거
                      editor.trigger('keyboard', 'outdent', null);
                    });

                    // 🛡️ [한글 주석 탑재] 엔터 키 입력 시 자동완성 및 리스트 연속 번호 매기기 처리 (텍스트 보존 및 커서 추적 지원)
                    // 자동완성(Suggest Widget)이 열려 있으면 Enter → 자동완성 수락에 양보
                    // 그 외에는 리스트 상태에서 엔터를 치면 다음 줄에 불릿 기호를 자동 주입합니다.
                    editor.addAction({
                      id: 'custom-enter-list-auto',
                      label: '리스트 자동완성 (Enter)',
                      keybindings: [monaco.KeyCode.Enter],
                      // suggestWidgetVisible = true 이면 이 액션 발동 안됨 → Monaco 기본 Enter(자동완성 수락)에 양보
                      precondition: '!suggestWidgetVisible && !editorReadonly',
                      run: () => {
                      // ① 자동완성 위젯이 열려 있으면 Enter = 자동완성 항목 수락
                      try {
                        const suggestCtrl = editor.getContribution('editor.contrib.suggestController') as any;
                        if (suggestCtrl?.widget?.value?.suggestWidgetVisible?.get?.()) {
                          editor.trigger('keyboard', 'acceptSelectedSuggestion', {});
                          return;
                        }
                      } catch (_) { /* 위젯 접근 실패 시 무시 */ }

                      const position = editor.getPosition();
                      if (!position) return;
                      const model = editor.getModel();
                      if (!model) return;

                      const lineNumber = position.lineNumber;
                      const lineContent = model.getLineContent(lineNumber);
                      // 커서를 기점으로 앞과 뒤의 텍스트 조각을 안전하게 분리
                      const beforeCursor = lineContent.substring(0, position.column - 1);
                      const afterCursor = lineContent.substring(position.column - 1);

                      // 목록 판단용 웅장한 정규식 엔진 모음
                      const taskRegex = /^([ \t]*)([-*+])[ \t]+\[([ xX])\](?:[ \t]+(.*)|)$/;
                      const orderRegex = /^([ \t]*)(\d+)\.(?:[ \t]+(.*)|)$/;
                      const listRegex = /^([ \t]*)([-*+])(?:[ \t]+(.*)|)$/;
                      const quoteRegex = /^([ \t]*)(>+)(?:[ \t]+(.*)|)$/;

                      let match: RegExpMatchArray | null = null;

                      // 1. 태스크 리스트 판단 가드 (예: - [ ] 작업)
                      if ((match = beforeCursor.match(taskRegex))) {
                        const indent = match[1];
                        const marker = match[2];
                        const checked = match[3];
                        const text = match[4] || '';

                        // 사용자가 아무것도 적지 않고 연속 엔터를 칠 경우 불릿 기호 말끔히 삭제 (리스트 탈출)
                        if (text.trim() === '' && afterCursor.trim() === '') {
                          editor.executeEdits("removeBullet", [{
                            range: new monaco.Range(lineNumber, 1, lineNumber, position.column + afterCursor.length),
                            text: indent,
                            forceMoveMarkers: true
                          }]);
                        } else {
                          // 작성 내용이 있다면 다음 줄에 태스크 불릿(- [ ]) 자동 연속 생성 및 커서 정밀 이전
                          const insertText = `\n${indent}${marker} [ ] ${afterCursor}`;
                          editor.executeEdits("insertBullet", [{
                            range: new monaco.Range(lineNumber, position.column, lineNumber, lineContent.length + 1),
                            text: insertText,
                            forceMoveMarkers: true
                          }]);
                          const nextLine = lineNumber + 1;
                          const nextColumn = indent.length + marker.length + 6 + 1;
                          editor.setPosition({ lineNumber: nextLine, column: nextColumn });
                        }
                        return;
                      }

                      // 2. 숫자로 나열된 순번 리스트 판단 가드 (예: 1. 첫 번째 작업)
                      if ((match = beforeCursor.match(orderRegex))) {
                        const indent = match[1];
                        const numStr = match[2];
                        const text = match[3] || '';

                        // 연속 엔터 시 번호 기호 자동 철거
                        if (text.trim() === '' && afterCursor.trim() === '') {
                          editor.executeEdits("removeBullet", [{
                            range: new monaco.Range(lineNumber, 1, lineNumber, position.column + afterCursor.length),
                            text: indent,
                            forceMoveMarkers: true
                          }]);
                        } else {
                          // 작성 내용 발견 시 다음 숫자를 계산(+1)하여 자동 연속 기입 수행
                          const nextNum = parseInt(numStr, 10) + 1;
                          const insertText = `\n${indent}${nextNum}. ${afterCursor}`;
                          editor.executeEdits("insertBullet", [{
                            range: new monaco.Range(lineNumber, position.column, lineNumber, lineContent.length + 1),
                            text: insertText,
                            forceMoveMarkers: true
                          }]);
                          const nextLine = lineNumber + 1;
                          const nextColumn = indent.length + String(nextNum).length + 2 + 1;
                          editor.setPosition({ lineNumber: nextLine, column: nextColumn });
                        }
                        return;
                      }

                      // 3. 일반 동그라미/대시 불릿 리스트 판단 가드 (예: - 내용)
                      if ((match = beforeCursor.match(listRegex))) {
                        const indent = match[1];
                        const marker = match[2];
                        const text = match[3] || '';

                        // 연속 엔터 시 리스트 불릿 소거
                        if (text.trim() === '' && afterCursor.trim() === '') {
                          editor.executeEdits("removeBullet", [{
                            range: new monaco.Range(lineNumber, 1, lineNumber, position.column + afterCursor.length),
                            text: indent,
                            forceMoveMarkers: true
                          }]);
                        } else {
                          // 다음 줄 불릿 기호 자동 확장
                          const insertText = `\n${indent}${marker} ${afterCursor}`;
                          editor.executeEdits("insertBullet", [{
                            range: new monaco.Range(lineNumber, position.column, lineNumber, lineContent.length + 1),
                            text: insertText,
                            forceMoveMarkers: true
                          }]);
                          const nextLine = lineNumber + 1;
                          const nextColumn = indent.length + marker.length + 1 + 1;
                          editor.setPosition({ lineNumber: nextLine, column: nextColumn });
                        }
                        return;
                      }

                      // 4. 인용구 블록 판단 가드 (예: > 내용)
                      if ((match = beforeCursor.match(quoteRegex))) {
                        const indent = match[1];
                        const quote = match[2];
                        const text = match[3] || '';

                        // 연속 엔터 시 인용구 기호 소거
                        if (text.trim() === '' && afterCursor.trim() === '') {
                          editor.executeEdits("removeBullet", [{
                            range: new monaco.Range(lineNumber, 1, lineNumber, position.column + afterCursor.length),
                            text: indent,
                            forceMoveMarkers: true
                          }]);
                        } else {
                          // 다음 줄 > 기호 연속 생성
                          const insertText = `\n${indent}${quote} ${afterCursor}`;
                          editor.executeEdits("insertBullet", [{
                            range: new monaco.Range(lineNumber, position.column, lineNumber, lineContent.length + 1),
                            text: insertText,
                            forceMoveMarkers: true
                          }]);
                          const nextLine = lineNumber + 1;
                          const nextColumn = indent.length + quote.length + 1 + 1;
                          editor.setPosition({ lineNumber: nextLine, column: nextColumn });
                        }
                        return;
                      }

                      // 5. 일반 문장 개행 처리 (기본 들여쓰기 탭 깊이 자동 보존 개행)
                      const indentMatch = beforeCursor.match(/^([ \t]*)/);
                      const indent = indentMatch ? indentMatch[1] : '';
                      editor.executeEdits("insertNewline", [{
                        range: new monaco.Range(lineNumber, position.column, lineNumber, position.column),
                        text: `\n${indent}`,
                        forceMoveMarkers: true
                      }]);
                    
                      }
                    });

                    // 🛡️ [한글 주석 탑재] Ctrl + Shift + = (즉, Ctrl+Shift++) 입력 시 표 행 삽입
                    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Equal, () => {
                      const position = editor.getPosition();
                      const model = editor.getModel();
                      if (!position || !model) return;
                      const lineContent = model.getLineContent(position.lineNumber);
                      if (isTableLine(lineContent)) {
                        const { ranges } = getCellRanges(lineContent, position.lineNumber);
                        const cellCount = ranges.length;
                        if (cellCount > 0) {
                          const newRowText = "|" + "  |".repeat(cellCount) + "\n";
                          editor.pushUndoStop();
                          editor.executeEdits("insertTableRowAbove", [{
                            range: new monaco.Range(position.lineNumber, 1, position.lineNumber, 1),
                            text: newRowText,
                            forceMoveMarkers: false
                          }]);
                          editor.pushUndoStop();
                          
                          // 삽입된 행의 첫 셀로 포커싱
                          const newRanges = getCellRanges(model.getLineContent(position.lineNumber), position.lineNumber).ranges;
                          if (newRanges.length > 0) {
                            editor.setSelection(new monaco.Selection(
                              position.lineNumber, newRanges[0].startColumn,
                              position.lineNumber, newRanges[0].endColumn
                            ));
                          }
                        }
                      }
                    });

                    // 🛡️ [한글 주석 탑재] Ctrl + Shift + - 입력 시 표 행 삭제 (구분행은 삭제 방지 가드 처리)
                    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Minus, () => {
                      const position = editor.getPosition();
                      const model = editor.getModel();
                      if (!position || !model) return;
                      const lineContent = model.getLineContent(position.lineNumber);
                      if (isTableLine(lineContent)) {
                        // 구분행(| --- | --- |)인 경우 표 붕괴를 막기 위해 삭제 완전 차단
                        if (isTableDividerLine(lineContent)) {
                          return;
                        }
                        editor.pushUndoStop();
                        const lineMaxCol = model.getLineMaxColumn(position.lineNumber);
                        let range: any;
                        if (position.lineNumber < model.getLineCount()) {
                          range = new monaco.Range(position.lineNumber, 1, position.lineNumber + 1, 1);
                        } else if (position.lineNumber > 1) {
                          const prevMaxCol = model.getLineMaxColumn(position.lineNumber - 1);
                          range = new monaco.Range(position.lineNumber - 1, prevMaxCol, position.lineNumber, lineMaxCol);
                        } else {
                          range = new monaco.Range(position.lineNumber, 1, position.lineNumber, lineMaxCol);
                        }
                        editor.executeEdits("deleteTableRow", [{
                          range,
                          text: ""
                        }]);
                        editor.pushUndoStop();
                      }
                    });

                    // Ctrl+Space: 슬래시 명령어 입력 중인 경우 제안 팝업 트리거, 그렇지 않으면 플로팅 툴바 토글
                    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space, () => {
                      const position = editor.getPosition();
                      const model = editor.getModel();
                      if (position && model) {
                        const lineContent = model.getLineContent(position.lineNumber);
                        const beforeCursor = lineContent.substring(0, position.column - 1);
                        // 커서 바로 직전이 / 이거나, / 뒤에 공백 없이 영문/숫자가 연속되는 슬래시 입력 패턴인 경우
                        const slashMatch = beforeCursor.match(/\/([a-zA-Z0-9]*)$/);
                        if (slashMatch) {
                          editor.trigger('keyboard', 'editor.action.triggerSuggest', {});
                          return;
                        }
                      }

                      setFloatingToolbar(prev => {
                        if (prev.visible) return { ...prev, visible: false };
                        let targetPosition = editor.getPosition();
                        const selection = editor.getSelection();
                        const activeSelection = (selection && !selection.isEmpty()) ? selection : lastSelectionRef.current;
                        if (activeSelection && !activeSelection.isEmpty()) {
                          targetPosition = activeSelection.getStartPosition();
                        }
                        if (!targetPosition) return prev;
                        const visiblePos = editor.getScrolledVisiblePosition(targetPosition);
                        if (!visiblePos) return prev;
                        return { visible: true, top: Math.max(0, visiblePos.top - 10), left: visiblePos.left };
                      });
                    });

                    // 💡 [테마 적용 안전장치] 마운트 시점에 수동으로 모든 테마를 다시 정의하고 강제 적용
                    EDITOR_THEMES.forEach(t => {
                      monaco.editor.defineTheme(t.id, {
                        base: t.base,
                        inherit: true,
                        rules: t.rules,
                        colors: t.colors
                      });
                    });
                    monaco.editor.setTheme(themePalette);

                    decorationsCollectionRef.current = editor.createDecorationsCollection();
                    updateDecorations(editor);
                    setIsEditorReady(true);
                    const container = editor.getContainerDomNode();
                    container.addEventListener('paste', handleEditorPaste, true);
                    
                    // 💡 다른 문서에서 글을 마우스로 드래그앤드롭(Drag & Drop)하여 옮길 때 끝에 $0이 붙는 버그 방지 커스텀 핸들러
                    container.addEventListener('drop', (e: DragEvent) => {
                      const text = e.dataTransfer?.getData('text');
                      if (text) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        const target = editor.getTargetAtClientPoint(e.clientX, e.clientY);
                        const position = target?.position || editor.getPosition();
                        
                        if (position) {
                          editor.executeEdits('dragDropText', [{
                            range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
                            text: text,
                            forceMoveMarkers: true
                          }]);
                          editor.focus();
                        }
                      }
                    }, true);

                    container.addEventListener('mouseenter', () => { isEditorHovered.current = true; });
                    container.addEventListener('mouseleave', () => { isEditorHovered.current = false; });

                    // 💡 [고속/역방향 드래그 가드] Monaco anchor 리셋 방어 — 마우스 다운 위치를 anchor로 고정
                    let editorMouseDown = false;
                    let editorMouseAnchor: { lineNumber: number; column: number } | null = null;

                    editor.onMouseDown((e: any) => {
                      editorMouseDown = true;
                      if (e.target?.position) {
                        editorMouseAnchor = {
                          lineNumber: e.target.position.lineNumber,
                          column: e.target.position.column
                        };
                      }
                    });

                    editor.onMouseUp(() => {
                      editorMouseDown = false;
                      editorMouseAnchor = null;
                    });
                    editor.onDidChangeModelContent((e: any) => {
                      if (isAutoPageBreakingRef.current) return;

                      let isPageBreakModified = false;
                      let targetLineNum = Infinity;

                      const model = editor.getModel();
                      if (!model) return;

                      // 총 페이지나누기(page-break) 문구 개수 체크
                      const currentText = model.getValue();
                      const pageBreakMatches = currentText.match(/page-break/gi);
                      const currentCount = pageBreakMatches ? pageBreakMatches.length : 0;

                      if (currentCount !== lastPageBreakCountRef.current) {
                        lastPageBreakCountRef.current = currentCount;
                        isPageBreakModified = true;
                      }

                      e.changes.forEach((change: any) => {
                        if (change.text.includes('page-break')) {
                          isPageBreakModified = true;
                          targetLineNum = Math.min(targetLineNum, change.range.startLineNumber);
                        }
                        const lineContent = model.getLineContent(change.range.startLineNumber);
                        if (lineContent.includes('page-break')) {
                          isPageBreakModified = true;
                          targetLineNum = Math.min(targetLineNum, change.range.startLineNumber);
                        }
                      });

                      if (isPageBreakModified) {
                        const finalLine = targetLineNum === Infinity ? 1 : targetLineNum;
                        if (autoPageBreakDebounceRef.current) clearTimeout(autoPageBreakDebounceRef.current);
                        autoPageBreakDebounceRef.current = setTimeout(() => {
                          executeAutoPageBreak(editor, finalLine);
                        }, 800); // 800ms 디바운스로 타이핑 중 부하 방지
                      }
                    });
                    editor.onDidChangeCursorPosition((e) => {
                      setActiveLine(e.position.lineNumber);
                      setCursorLine(e.position.lineNumber);
                      setCursorColumn(e.position.column);

                      // 💡 [커서 연동 방향 감지 및 이전 줄 업데이트]
                      const currentLine = e.position.lineNumber;
                      const prevLine = prevCursorLineRef.current;
                      prevCursorLineRef.current = currentLine;

                      // 분할모드에서 커서가 새로운 행으로 이동 시 미리보기 동기화
                      if (prevLine !== null && prevLine !== currentLine && previewModeRef.current === 'both' && previewRef.current) {
                        const targetEl = previewRef.current.querySelector(`[data-line="${currentLine}"]`) as HTMLElement;
                        if (targetEl) {
                          targetEl.scrollIntoView({ behavior: 'instant', block: 'nearest' });
                        }
                      }

                      // 💡 표(Table) 영역 이탈 시 자동 정렬 수행
                      if (prevLine && prevLine !== currentLine) {
                        const model = editor.getModel();
                        if (model) {
                          const lineCount = model.getLineCount();
                          if (prevLine >= 1 && prevLine <= lineCount && currentLine >= 1 && currentLine <= lineCount) {
                            const prevLineContent = model.getLineContent(prevLine);
                            const currentLineContent = model.getLineContent(currentLine);
                            if (isTableLine(prevLineContent) && (!isTableLine(currentLineContent) || Math.abs(currentLine - prevLine) > 1)) {
                              // 스크롤 및 렌더링 간섭을 차단하기 위해 비동기 틱으로 정렬 수행
                              setTimeout(() => {
                                const currentModel = editor.getModel();
                                if (currentModel && prevLine >= 1 && prevLine <= currentModel.getLineCount()) {
                                  formatTableBlock(editor, prevLine);
                                }
                              }, 50);
                            }
                          }
                        }
                      }

                      // [WBS CORE-03] 마우스 클릭 등으로 명시적인 커서 행 강제 이동 감지 시 자동완성 팝업 강제 파괴
                      if (e.reason === 3) {
                        try {
                          const suggestCtrl = editor.getContribution('editor.contrib.suggestController') as any;
                          if (suggestCtrl && suggestCtrl.widget && suggestCtrl.widget.value) {
                            suggestCtrl.widget.value.hide();
                          }
                        } catch (_) {
                          editor.trigger('keyboard', 'hideSuggestWidget', {});
                        }
                      }
                    });
                    let scrollSyncRafId: number | null = null;
                    editor.onDidScrollChange(() => {
                      if (isScrollingRef.current === 'preview') return;
                      if (previewModeRef.current !== 'both' || !previewRef.current) return;
                      if (scrollSyncRafId !== null) return;
                      scrollSyncRafId = requestAnimationFrame(() => {
                        scrollSyncRafId = null;
                        
                        const parent = previewRef.current!;
                        const range = editor.getVisibleRanges();
                        if (range && range.length > 0) {
                          const firstVisible = range[0].startLineNumber;
                          
                          // 1. 역추적으로 가장 가까운 data-line을 검색하여 라인 누락 방어
                          let targetEl: HTMLElement | null = null;
                          for (let line = firstVisible; line >= 1; line--) {
                            const found = parent.querySelector(`[data-line="${line}"]`) as HTMLElement;
                            if (found) {
                              targetEl = found;
                              break;
                            }
                          }

                          if (targetEl) {
                            isScrollingRef.current = 'editor';
                            // 2. scrollIntoView 대신 offset 기반 직접 scrollTop 제어로 화면 요동 방지 및 정밀 제어
                            const parentRect = parent.getBoundingClientRect();
                            const childRect = targetEl.getBoundingClientRect();
                            const relativeTop = childRect.top - parentRect.top + parent.scrollTop;
                            
                            parent.scrollTop = relativeTop;

                            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                            scrollTimeoutRef.current = setTimeout(() => { isScrollingRef.current = null; }, 100);
                          }
                        }
                      });
                    });

                    // 💡 [커서 위치 실시간 비율 싱크 및 Typewriter Scroll]
                    let cursorSyncRafId: number | null = null;
                    editor.onDidChangeCursorPosition((e) => {
                      if (e.reason === 2) return; // 드래그 선택 복구 시 등 예외 제외

                      // 1. [에디터 자체 Typewriter Scroll] 커서가 화면의 80% 이상 아래로 내려오면 화면 30% 지점으로 에디터를 올림
                      const viewportHeight = editor.getLayoutInfo().height;
                      const curLine = e.position.lineNumber;
                      const cursorTop = editor.getTopForLineNumber(curLine);
                      const scrollTop = editor.getScrollTop();
                      const lineHeight = editor.getOption(monaco.editor.EditorOption.lineHeight) || 20;
                      
                      const cursorYInViewport = cursorTop + lineHeight - scrollTop;
                      const ratio = cursorYInViewport / viewportHeight;

                      let targetRatio = ratio;
                      if (ratio >= 0.8) {
                        const newScrollTop = cursorTop - (viewportHeight * 0.3);
                        editor.setScrollTop(Math.max(0, newScrollTop));
                        targetRatio = 0.3; // 에디터가 상단 30%로 스크롤되었으므로 비율도 30%로 맞춤
                      }

                      // 2. [미리보기 실시간 비율 싱크] 에디터 커서의 뷰포트 Y축 비율을 미리보기에 1:1 동기화하여 완벽한 수평선 유지
                      if (previewModeRef.current !== 'both' || !previewRef.current) return;
                      if (isScrollingRef.current === 'preview') return;
                      if (cursorSyncRafId !== null) return;

                      cursorSyncRafId = requestAnimationFrame(() => {
                        cursorSyncRafId = null;
                        
                        const actualLine = editor.getPosition()?.lineNumber || curLine;
                        const parent = previewRef.current!;

                        let targetEl: HTMLElement | null = null;
                        for (let line = actualLine; line >= 1; line--) {
                          const found = parent.querySelector(`[data-line="${line}"]`) as HTMLElement;
                          if (found) {
                            targetEl = found;
                            break;
                          }
                        }

                        if (targetEl) {
                          isScrollingRef.current = 'editor';
                          
                          const parentRect = parent.getBoundingClientRect();
                          const childRect = targetEl.getBoundingClientRect();
                          
                          // 에디터의 커서 상대 비율(targetRatio)과 동일한 높이에 미리보기 단락이 위치하도록 scrollTop 연산
                          const relativeTop = childRect.top - parentRect.top + parent.scrollTop - (parentRect.height * targetRatio);
                          
                          parent.scrollTop = Math.max(0, relativeTop);

                          if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                          scrollTimeoutRef.current = setTimeout(() => { isScrollingRef.current = null; }, 80);
                        }
                      });
                    });

                    // 💡 [Enter 즉시 저장] 엔터를 치면 곧바로 저장 — 5초 디바운스 기다림 없음
                    editor.onKeyDown((e) => {
                      if (e.keyCode === monaco.KeyCode.Enter && !isComposingRef.current) {
                        if (autoSaveRef.current && currentFileNodeRef.current) {
                          const val = editor.getValue();
                          if (val && val !== lastSavedContentRef.current) {
                            setSaveStatus('saving');
                            saveFile(val, currentFileNodeRef.current).then(success => {
                              if (success) lastSavedContentRef.current = val;
                              setSaveStatus(success ? 'saved' : 'unsaved');
                            });
                          }
                        }
                      }
                    });

                    editor.onMouseDown((e) => {
                      // 🔥 마우스 클릭 시 자동완성 팝업 즉시 닫기
                      // 다른 행 클릭 시 이전 입력 버퍼 잔재로 팝업이 엉뚱한 위치에 뜨는 현상 방지
                      editor.trigger('mouse', 'hideSuggestWidget', {});

                      setTimeout(() => {
                        const position = editor.getPosition();
                        if (!position) return;
                        const clickedLine = position.lineNumber;

                        if (previewRef.current) {
                          // 💡 반반(both) 모드이고 미리보기가 한 페이지를 초과하는 경우에만 연동 진행
                          const isNotScrollable = previewRef.current.scrollHeight <= previewRef.current.clientHeight;
                          if (previewModeRef.current !== 'both' || isNotScrollable) return;

                          const totalLines = editor.getModel()?.getLineCount() || 1;

                          // 맨 위(첫 줄) 클릭 시 최상단 스크롤
                          if (clickedLine === 1) {
                            previewRef.current.scrollTo({
                              top: 0,
                              behavior: 'smooth'
                            });
                            return;
                          }

                          // 맨 아래(끝 줄) 클릭 시 최하단 스크롤
                          if (clickedLine === totalLines) {
                            previewRef.current.scrollTo({
                              top: previewRef.current.scrollHeight,
                              behavior: 'smooth'
                            });
                            return;
                          }

                          const targetElement = previewRef.current.querySelector(`[data-line="${clickedLine}"]`);
                          if (targetElement) {
                            targetElement.scrollIntoView({
                              behavior: 'smooth',
                              block: 'center'
                            });
                          } else {
                            // 일치하는 엘리먼트가 없으면, 클릭한 라인보다 작거나 같은 가장 가까운 상위 엘리먼트를 찾아 스크롤
                            const elements = Array.from(previewRef.current.querySelectorAll('[data-line]')) as HTMLElement[];
                            let targetEl: HTMLElement | null = null;
                            let maxLine = -1;
                            for (const el of elements) {
                               const lineStr = el.getAttribute('data-line');
                               if (lineStr) {
                                 const line = parseInt(lineStr, 10);
                                 if (line <= clickedLine && line > maxLine) {
                                   maxLine = line;
                                   targetEl = el;
                                 }
                               }
                             }
                             if (targetEl) {
                               targetEl.scrollIntoView({
                                 behavior: 'smooth',
                                 block: 'center'
                               });
                             }
                           }
                         }
                       }, 10);
                     });
                      editor.onDidChangeCursorSelection((e) => {
                         // 실제 텍스트 선택 시에만 lastSelectionRef 갱신 (커서 이동으로 덮어써지는 버그 방지)
                         if (!e.selection.isEmpty()) {
                           lastSelectionRef.current = e.selection;
                         } else {
                           lastSelectionRef.current = null;
                         }
                         // 사장님 요청으로 텍스트 멀티선택 시 자동 노출은 완전 차단하되, 선택 영역이 지워지면(isEmpty) 플로팅 툴바를 자동으로 닫습니다.
                         if (e.selection.isEmpty()) {
                           setFloatingToolbar(prev => prev.visible ? { ...prev, visible: false } : prev);
                         }
                         // 💡 [고속 드래그 anchor 리셋 보정] Monaco가 mousemove 이벤트 간격 중 anchor를 잃으면 선택이 리셋되는 현상 방어
                         if (editorMouseDown && editorMouseAnchor && e.source === 'mouse') {
                           const sel = e.selection;
                           const anchorMatchStart = sel.startLineNumber === editorMouseAnchor.lineNumber && sel.startColumn === editorMouseAnchor.column;
                           const anchorMatchEnd = sel.endLineNumber === editorMouseAnchor.lineNumber && sel.endColumn === editorMouseAnchor.column;
                           if (!anchorMatchStart && !anchorMatchEnd) {
                             const aL = editorMouseAnchor.lineNumber, aC = editorMouseAnchor.column;
                             const fL = sel.positionLineNumber, fC = sel.positionColumn;
                             const forward = aL < fL || (aL === fL && aC < fC);
                             editor.setSelection({
                               startLineNumber: forward ? aL : fL,
                               startColumn: forward ? aC : fC,
                               endLineNumber: forward ? fL : aL,
                               endColumn: forward ? fC : aC
                             });
                           }
                         }
                       });

                    if (completionProviderRef.current) {
                      completionProviderRef.current.dispose();
                    }
                    completionProviderRef.current = monaco.languages.registerCompletionItemProvider('markdown', {
                      // 슬래시(/)와 일반 문자 모두에서 자동완성 트리거
                      triggerCharacters: ['/'],  // '/' 입력 시에만 슬래시 커맨드 팝업
                      provideCompletionItems: (model: any, position: any) => {
                        const textUntilPosition = model.getValueInRange({
                          startLineNumber: position.lineNumber,
                          startColumn: 1,
                          endLineNumber: position.lineNumber,
                          endColumn: position.column
                        });

                        // 현재 줄에서 마지막 '/' 부터 커서까지를 슬래시 단어로 추출
                        // 예) 'hello /bold' → slashWord = '/bold'
                        const slashMatch = textUntilPosition.match(/(^|\s)(\/\S*)$/);
                        if (!slashMatch) {
                          return { suggestions: [] };
                        }

                        const slashWord = slashMatch[2]; // '/bold', '/', '/im' 등
                        // '/' 하나만 있거나, '/단어' 형태일 때만 제안
                        if (!slashWord.startsWith('/')) {
                          return { suggestions: [] };
                        }

                        // 슬래시 단어 시작 컬럼 (교체 범위 시작)
                        const startColumn = position.column - slashWord.length;

                        const suggestions = getSlashCommands(monaco, customSlashCommandsRef.current);

                        // 입력한 단어로 필터링 (/ 이후 글자 기준)
                        const filterWord = slashWord.slice(1).toLowerCase(); // 'bold', 'im' 등

                        const filtered = filterWord.length === 0
                          ? suggestions  // '/' 만 입력 → 전체 표시
                          : suggestions.filter(s => {
                              const labelStr = typeof s.label === 'string' ? s.label : '';
                              const filterStr = typeof s.filterText === 'string' ? s.filterText : '';
                              return (
                                labelStr.toLowerCase().includes(filterWord) ||
                                filterStr.toLowerCase().includes(filterWord)
                              );
                            });

                        return {
                          suggestions: filtered.map(s => ({
                            ...s,
                            // '/bold' 전체를 교체하여 '/bold' → '**텍스트**' 로 올바르게 변환
                            range: {
                              startLineNumber: position.lineNumber,
                              endLineNumber: position.lineNumber,
                              startColumn: startColumn,
                              endColumn: position.column
                            }
                          }))
                        };
                      }
                    });

                    // ⛔ [반반 스크롤 동기화 제거] — 타이핑 시 Monaco 자동 스크롤이 프리뷰를 흔들던 문제 수정
                    // 프리뷰 → 에디터 단방향 동기화만 유지 (프리뷰 onScroll)

                    }}
                      options={{
                    padding: { top: 20, bottom: 500 },
                    scrollBeyondLastLine: true,
                    automaticLayout: true,
                    fontSize,
                    fontFamily: "'Nanum Gothic Coding', 'NanumGothicCoding', 'D2Coding', '굴림체', 'GulimChe', '돋움체', 'DotumChe', Consolas, 'Courier New', Courier, monospace",
                    fontLigatures: false,
                    letterSpacing: 0,
                    'semanticHighlighting.enabled': true,
                    wordWrap,
                    lineNumbers: 'on',
                    minimap: { enabled: false },
                    scrollbar: { vertical: 'visible', horizontal: 'visible' },
                    // 슬래시(/) 입력 시에만 자동완성 트리거 (일반 타이핑 시 팝업 방지)
                    quickSuggestions: false,
                    suggestOnTriggerCharacters: true,
                    // Enter/Tab 수락은 커스텀 핸들러에서 처리 (리스트 자동완성과 충돌 방지)
                    acceptSuggestionOnEnter: 'on',
                    tabCompletion: 'on',
                    fixedOverflowWidgets: true,
                    renderValidationDecorations: 'on',
                    matchBrackets: 'always',
                    wordBasedSuggestions: "off",
                    renderLineHighlight: 'all',
                    tabSize: parseInt(profiles.find(p => p.id === activeProfileId)?.pageStyle?.tabSize) || 4,
                    detectIndentation: false,
                    insertSpaces: true,
                    autoIndent: 'none',
                    links: false
                  }}
                />
                {floatingToolbar.visible && (() => {
                  const editorDom = editorRef.current?.getContainerDomNode();
                  let fixedTop = floatingToolbar.top;
                  let fixedLeft = floatingToolbar.left;
                  if (editorDom) {
                    const rect = editorDom.getBoundingClientRect();
                    fixedTop += rect.top;
                    fixedLeft += rect.left;
                  }
                  const handleDragStart = (dragEvent: React.MouseEvent) => {
                    const target = dragEvent.target as HTMLElement;
                    if (target.closest('button') || target.closest('input')) {
                      return;
                    }
                    dragEvent.preventDefault();
                    const startX = dragEvent.clientX;
                    const startY = dragEvent.clientY;
                    const startLeft = floatingToolbar.left;
                    const startTop = floatingToolbar.top;

                    const handleDragMove = (moveEvent: MouseEvent) => {
                      const deltaX = moveEvent.clientX - startX;
                      const deltaY = moveEvent.clientY - startY;
                      setFloatingToolbar(prev => ({
                        ...prev,
                        left: startLeft + deltaX,
                        top: startTop + deltaY
                      }));
                    };

                    const handleDragEnd = () => {
                      document.removeEventListener('mousemove', handleDragMove);
                      document.removeEventListener('mouseup', handleDragEnd);
                    };

                    document.addEventListener('mousemove', handleDragMove);
                    document.addEventListener('mouseup', handleDragEnd);
                  };

                  return (
                   <div
                      id="floating-toolbar"
                      tabIndex={-1}
                      onKeyDown={(e) => {
                        const buttons = Array.from(e.currentTarget.querySelectorAll('button')) as HTMLButtonElement[];
                        const activeEl = document.activeElement as HTMLButtonElement;
                        const currentIndex = buttons.indexOf(activeEl);
                        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                          e.preventDefault();
                          const nextIndex = (currentIndex + 1) % buttons.length;
                          buttons[nextIndex]?.focus();
                        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                          e.preventDefault();
                          const prevIndex = (currentIndex - 1 + buttons.length) % buttons.length;
                          buttons[prevIndex]?.focus();
                        } else if (e.key === 'Escape') {
                          e.preventDefault();
                          setFloatingToolbar(prev => ({ ...prev, visible: false }));
                          editorRef.current?.focus();
                        }
                      }}
                      className="fixed z-[99999] flex items-center bg-white dark:bg-zinc-800 shadow-2xl rounded-xl border border-gray-200 dark:border-zinc-700 px-3 py-1.5 gap-1 animate-in fade-in zoom-in-95 duration-100 focus:outline-none cursor-move select-none"
                     style={{ top: Math.max(fixedTop, 60), left: fixedLeft, transform: 'translateY(-100%)' }}
                    onMouseDown={handleDragStart}
                  >
                  {helpContent && (
                    <div className="flex items-center justify-between px-5 py-2.5 mb-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-lg mx-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">📖</span>
                        <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{helpTitle || '사용 설명서'}</span>
                        <span className="text-xs text-blue-400 dark:text-blue-500 ml-1">(서식 설정이 적용된 미리보기)</span>
                      </div>
                      <button
                        onClick={() => { setHelpContent(null); setHelpTitle(''); }}
                        className="text-xs px-3 py-1.5 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 font-semibold transition-colors"
                      >
                        닫기
                      </button>
                    </div>
                  )}
                  {(() => {
                      return (
                        <div className="flex flex-row items-center gap-3 min-w-max">
                          {/* 서식 */}
                          <div className="flex flex-row items-center gap-0.5">
                            <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('BOLD'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px] font-black" title="굵게">B</button>
                            <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('ITALIC'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px] italic font-serif" title="기울임">I</button>
                            <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('INLINE_CODE'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="인라인 코드">{'</>'}</button>
                            <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('UNDERLINE'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px] underline" title="밑줄">U</button>
                            <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('STRIKETHROUGH'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="취소선"><span className="line-through">S</span></button>
                          </div>
                          <div className="w-px h-8 bg-black/10 dark:bg-white/10" />
                          {/* 제목 */}
                          <div className="flex flex-row items-center gap-0.5">
                            <div className="flex items-center border border-emerald-500/20 dark:border-emerald-500/30 rounded bg-emerald-500/5 dark:bg-emerald-500/10 py-0.5 px-1.5 gap-1.5">
                              <button onMouseDown={(e) => { e.preventDefault(); setFloatingHeadingLevel(Math.max(1, floatingHeadingLevel - 1)); }} disabled={floatingHeadingLevel === 1} className="w-5 h-6 flex items-center justify-center rounded hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 text-[9px]" title="제목 크기 키우기 (H1 방향)">▲</button>
                              <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand(`H${floatingHeadingLevel}`); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-6 flex items-center justify-center font-bold text-[11px] hover:bg-black/10 dark:hover:bg-white/10 rounded shrink-0" title={`제목 ${floatingHeadingLevel} 적용`}>H{floatingHeadingLevel}</button>
                              <button onMouseDown={(e) => { e.preventDefault(); setFloatingHeadingLevel(Math.min(6, floatingHeadingLevel + 1)); }} disabled={floatingHeadingLevel === 6} className="w-5 h-6 flex items-center justify-center rounded hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 text-[9px]" title="제목 크기 줄이기 (H6 방향)">▼</button>
                            </div>
                          </div>
                          <div className="w-px h-8 bg-black/10 dark:bg-white/10" />
                          {/* 문단 */}
                          <div className="flex flex-row items-center gap-0.5">
                            <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('HR'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="구분선">—</button>
                            <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('ORDERED_LIST'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="숫자 목록">1.</button>
                            <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('LIST'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="글머리 기호">☰</button>
                            <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('QUOTE'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="인용구">❝</button>
                            <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('CHECK'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="체크리스트">☑️</button>
                            <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('REMOVE_PREFIX'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="태그 취소"><Eraser size={14} className="text-red-500 opacity-80 hover:opacity-100" /></button>
                            <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('CLEAN_DOC'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="문서 서식 일괄 정리">✨</button>
                          </div>
                          <div className="w-px h-8 bg-black/10 dark:bg-white/10" />
                          {/* 삽입 */}
                          <div className="flex flex-row items-center gap-0.5">
                            <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('LINK'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="링크">🔗</button>
                            <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('TAGLINK'); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="문서링크">🔖</button>
                            <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('DOCLINK'); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="다른 문서 연결">📄</button>
                            <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('IMAGE'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="이미지">🖼️</button>
                            <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('YOUTUBE'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="유튜브 동영상 삽입">🎥</button>
                            <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('NOW'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="현재 날짜/시간">📅</button>
                          </div>
                          <div className="w-px h-8 bg-black/10 dark:bg-white/10" />
                          {/* 고급 */}
                          <div className="flex flex-row items-center gap-0.5">
                            <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('MAP'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="지도 삽입">🗺️</button>
                            <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('TABLE'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="표 생성">📊</button>
                            <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('CODE'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="코드 블록">💻</button>
                            <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('LATEX'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="수식(LaTeX)">Σ</button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  )})()}
              </div>

            {showDocLinkPicker && (
              <>
                <div
                  className="fixed inset-0 z-[9998]"
                  onMouseDown={() => {
                    setShowDocLinkPicker(false);
                    setDocLinkSearchText('');
                  }}
                />
                <div
                  className="fixed z-[9999] bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-600 rounded-lg shadow-xl p-2 w-[280px] max-h-[350px] flex flex-col"
                  style={{ top: floatingToolbar.top + 60, left: floatingToolbar.left }}
                >
                  {!selectedDocNode ? (
                    <>
                      <div className="px-2 py-1 text-[11px] font-semibold text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-700 mb-2">
                        다른 문서 연결
                      </div>
                      <div className="px-2 mb-2">
                        <input
                          type="text"
                          placeholder="파일 검색..."
                          value={docLinkSearchText}
                          onChange={(e) => setDocLinkSearchText(e.target.value)}
                          className="w-full px-2 py-1 text-[12px] border border-slate-200 dark:border-zinc-700 rounded bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500"
                          autoFocus
                        />
                      </div>
                      <div className="flex-1 overflow-y-auto min-h-0">
                        {isDocLinkLoading ? (
                          <div className="px-2 py-3 text-center text-[12px] text-slate-400 dark:text-zinc-500">
                            문서 목록 로딩 중...
                          </div>
                        ) : (() => {
                          const filtered = allMdFiles.filter(f => 
                            f.name.toLowerCase().includes(docLinkSearchText.toLowerCase()) ||
                            (f.path && f.path.toLowerCase().includes(docLinkSearchText.toLowerCase()))
                          );
                          if (filtered.length === 0) {
                            return (
                              <div className="px-2 py-3 text-center text-[12px] text-slate-400 dark:text-zinc-500">
                                검색 결과가 없습니다.
                              </div>
                            );
                          }
                          return filtered.map((node) => (
                            <button
                              key={node.path}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleDocFileClick(node);
                              }}
                              className="w-full text-left px-2 py-1.5 text-[12px] hover:bg-slate-100 dark:hover:bg-zinc-700 rounded flex flex-col transition-colors mb-0.5"
                            >
                              <span className="font-semibold truncate text-slate-800 dark:text-zinc-200">{node.name}</span>
                              <span className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">{node.path}</span>
                            </button>
                          ));
                        })()}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="px-2 py-1 text-[11px] font-semibold text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-700 mb-2 flex items-center justify-between">
                        <span>헤딩(제목) 연결 선택</span>
                        <button
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSelectedDocNode(null);
                            setDocHeadings([]);
                            setDocHeadingSearchText('');
                          }}
                          className="text-xs text-blue-500 hover:text-blue-600 font-normal"
                        >
                          이전
                        </button>
                      </div>
                      <div className="px-2 mb-2">
                        <input
                          type="text"
                          placeholder="헤딩 검색..."
                          value={docHeadingSearchText}
                          onChange={(e) => setDocHeadingSearchText(e.target.value)}
                          className="w-full px-2 py-1 text-[12px] border border-slate-200 dark:border-zinc-700 rounded bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500"
                          autoFocus
                        />
                      </div>
                      <div className="flex-1 overflow-y-auto min-h-0">
                        {isHeadingLoading ? (
                          <div className="px-2 py-3 text-center text-[12px] text-slate-400 dark:text-zinc-500">
                            헤딩 분석 중...
                          </div>
                        ) : (
                          <>
                            <button
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleDocLinkSelect(selectedDocNode);
                              }}
                              className="w-full text-left px-2 py-1.5 text-[12px] text-blue-600 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-zinc-700 rounded transition-colors mb-1 font-semibold"
                            >
                              📂 [문서 자체를 바로 연결]
                            </button>
                            {(() => {
                              const filteredHeadings = docHeadings.filter(h =>
                                h.toLowerCase().includes(docHeadingSearchText.toLowerCase())
                              );
                              if (filteredHeadings.length === 0) {
                                return (
                                  <div className="px-2 py-2 text-[11px] text-slate-400 dark:text-zinc-500 text-center">
                                    문서 내에 감지된 헤딩이 없거나 검색 결과가 없습니다.
                                  </div>
                                );
                              }
                              return filteredHeadings.map((h, i) => (
                                <button
                                  key={i}
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleDocLinkSelect(selectedDocNode, h);
                                  }}
                                  className="w-full text-left px-2 py-1.5 text-[12px] hover:bg-slate-100 dark:hover:bg-zinc-700 rounded transition-colors truncate text-slate-700 dark:text-zinc-300"
                                >
                                  #{h}
                                </button>
                              ));
                            })()}
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {showTagLinkPicker && toc.length > 0 && (
              <>
                <div
                  className="fixed inset-0 z-[9998]"
                  onMouseDown={() => setShowTagLinkPicker(false)}
                />
                <div
                  className="fixed z-[9999] bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-600 rounded-lg shadow-xl py-1 min-w-[200px] max-h-[300px] overflow-y-auto"
                  style={{ top: floatingToolbar.top + 60, left: floatingToolbar.left }}
                >
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-700">
                    문서링크 - 헤딩 선택
                  </div>
                  {toc.map((h) => (
                    <button
                      key={h.id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleTagLinkSelect(h.text);
                      }}
                      className="w-full text-left px-3 py-1.5 text-[13px] hover:bg-slate-100 dark:hover:bg-zinc-700 flex items-center gap-2"
                    >
                      <span className="text-slate-400 dark:text-zinc-500 font-mono text-[10px] shrink-0">
                        {'#'.repeat(h.level)}
                      </span>
                      <span className="truncate">{h.text}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            <div
              className="flex-1 flex flex-col bg-white dark:bg-zinc-950 overflow-hidden relative"
              style={{
                width: previewMode === 'preview' ? '100%' : '50%',
                display: (previewMode === 'edit') ? 'none' : 'flex'
              }}
            >
                {/* 📄 상단 고정 헤더 바 (페이지 분할 토글 등) - 당분간 숨김 처리 */}
                {false && (
                <div className="flex items-center justify-between px-6 py-2 border-b border-black/5 dark:border-white/5 bg-slate-50 dark:bg-zinc-900 select-none z-10 no-print">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                      📄 A4 인쇄 페이지 경계선 표시
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium">
                      LIGHT
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleTogglePageView}
                      className={`px-3 py-1 text-[11px] font-semibold rounded-md border transition-all flex items-center gap-1.5 ${
                        isPageViewEnabled
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm hover:bg-indigo-700'
                          : 'bg-white dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {isPageViewEnabled ? '경계선 표시 끄기' : 'A4 페이지 경계선 표시'}
                    </button>
                    {isPageViewEnabled && (
                      <button
                        onClick={handleResetPageBreaks}
                        className="px-3 py-1 text-[11px] font-semibold rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-all flex items-center gap-1.5"
                        title="페이지 나누기 계산을 강제로 초기화하고 실시간으로 다시 실측합니다."
                      >
                        <span>🔄</span>
                        <span>경계선 초기화</span>
                      </button>
                    )}
                  </div>
                </div>
                )}

                {/* 🔍 스크롤 가능한 실제 본문 컨테이너 */}
                <div
                  ref={previewRef}
                  className={`flex-1 ${heightClass} px-8 pt-10 pb-32 print:h-auto print:overflow-visible prose prose-sm md:prose-base dark:prose-invert max-w-none custom-preview-container bg-white dark:bg-zinc-950 ${
                    previewMode === 'both' || previewMode === 'css-style' ? 'overflow-y-auto no-scrollbar' : 'overflow-y-auto'
                  }`}
                  onMouseEnter={() => { isPreviewHovered.current = true; }}
                  onMouseLeave={() => { isPreviewHovered.current = false; }}
                  onScroll={(e) => {
                    const target = e.target as HTMLElement;

                    // 💡 [요구사항 3 / SYNC-03] 미리보기 최상단(0점) 복귀 시 스크롤 락에 관계없이 에디터를 자석처럼 최상단 영점으로 복구
                    if (target.scrollTop === 0 && editorRef.current) {
                      editorRef.current.setScrollTop(0);
                    }

                    // 💡 [요구사항 3 / SYNC-03] 미리보기 마우스 오버 상태일 때만 에디터로 스크롤 송신 허용 (관성 튕김 루프 원천 방쇄)
                    if (!isPreviewHovered.current || previewModeRef.current !== 'both' || !editorRef.current) return;

                    isScrollingRef.current = 'preview';
                    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                    scrollTimeoutRef.current = setTimeout(() => { isScrollingRef.current = null; }, 50);

                    const elements = isPageViewEnabled
                      ? Array.from(target.querySelectorAll('.page-view-paper [data-line]')) as HTMLElement[]
                      : Array.from(target.querySelectorAll('[data-line]')) as HTMLElement[];

                    let targetLine = -1;
                    for (const element of elements) {
                      const rect = element.getBoundingClientRect();
                      const containerRect = target.getBoundingClientRect();
                      if (rect.top >= containerRect.top) {
                        const lineStr = element.getAttribute('data-line');
                        if (lineStr) {
                          targetLine = parseInt(lineStr, 10);
                          break;
                        }
                      }
                    }

                    if (targetLine !== -1 && editorRef.current) {
                      const editor = editorRef.current;
                      if (typeof editor.getTopForLineNumber === 'function' && typeof editor.setScrollPosition === 'function') {
                        editor.setScrollPosition({
                          scrollTop: editor.getTopForLineNumber(targetLine)
                        });
                      } else if (typeof editor.revealLine === 'function') {
                        editor.revealLine(targetLine);
                      }
                    }
                  }}
                >
                  {(() => {
                    const activeProfile = profiles.find(p => p.id === activeProfileId) || DEFAULT_PROFILE;
                    const isLandscape = activeProfile.pageStyle.orientation === 'landscape';
                    return (
                      <div className={`${isLandscape ? 'max-w-6xl' : 'max-w-4xl'} mx-auto w-full`}>
                        <MarkdownViewer
                          content={helpContent || processedContent}
                          originalContent={helpContent || content}
                          lineMap={helpContent ? undefined : lineMap}
                          onCheckboxToggle={helpContent ? undefined : handleCheckboxToggle}
                          currentFilePath={currentFileNode?.path}
                          rootFolderPath={rootFolder?.name}
                          onFileOpen={handleFileOpenByPath}
                          orientation={activeProfile.pageStyle.orientation as 'portrait' | 'landscape'}
                          marginTop={activeProfile.pageStyle.marginTop}
                          marginBottom={activeProfile.pageStyle.marginBottom}
                          marginLeft={activeProfile.pageStyle.marginLeft}
                          marginRight={activeProfile.pageStyle.marginRight}
                          listIndent={activeProfile.rules.ul?.['padding-left'] || activeProfile.rules.ol?.['padding-left']}
                          showPageBreaks={isPageViewEnabled}
                          calcKey={pageCalcKey}
                        />
                      </div>
                    );
                  })()}
                  {/*
                   * 동적 CSS 스타일 인젝션:
                   * custom-preview-container 내부의 태그들에 CssRuleSet을 적용합니다.
                   * activeProfileId === 'default'면 dynamicCssString이 빈 문자열이므로
                   * 이 <style> 태그는 자동으로 생략됩니다.
                   * 모든 값에 !important가 붙어 prose 클래스 스타일을 오버라이드합니다.
                   */}
                  {dynamicCssString && (
                    <style dangerouslySetInnerHTML={{ __html: dynamicCssString }} />
                  )}
                </div>
              </div>
          </div>

          <StatusBar
            content={content}
            fileName={currentFileName}
            folderName={rootFolder?.name}
            driveLetter={driveLetter}
            workspaceType={workspaceType}
            activeProfileName={profiles.find(p => p.id === activeProfileId)?.name || DEFAULT_PROFILE.name}
            cloudProvider={null}
            path={currentFileNode?.path}
            cursorLine={cursorPositionRef.current?.lineNumber}
            cursorColumn={cursorPositionRef.current?.column}
            saveStatus={saveStatus}
            isToolbarOpen={isToolbarOpen}
            setIsToolbarOpen={setIsToolbarOpen}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            previewMode={previewMode}
            setPreviewMode={setPreviewMode}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            themePalette={themePalette}
            onThemeChange={(themeId) => handleThemeChange(themeId, THEME_MAP)}
            isActivated={isActivated}
          />
        </main>
      </div>

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        initialTab={settingsModalInitialTab}
        isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}
        fontSize={fontSize} setFontSize={setFontSize}
        wordWrap={wordWrap} setWordWrap={setWordWrap}
        autoSave={autoSave} setAutoSave={setAutoSave}
        rootFolder={rootFolder} onSelectRootFolder={selectRootFolder}
        driveLetter={driveLetter} setDriveLetter={setDriveLetter}
        workspaceType={workspaceType} setWorkspaceType={setWorkspaceType}
        cloudProvider={null}
        previewMode={previewMode} setPreviewMode={setPreviewMode}
        customHotkeys={customHotkeys} setCustomHotkeys={setCustomHotkeys}
        customSlashCommands={customSlashCommands} setCustomSlashCommands={setCustomSlashCommands}
        licenseKey={licenseKey} setLicenseKey={setLicenseKey}
        themePalette={themePalette}
        onThemeChange={(themeId) => handleThemeChange(themeId, THEME_MAP)}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={(format) => {
          if (!isActivated) {
            showToast("정품 라이선스 키 등록이 필요합니다. (설정 -> 애플리케이션 탭에서 등록)", 'error');
            return;
          }
          if (format === 'pdf') handlers.exportPDF();
          else if (format === 'html') handlers.exportHTML();
          else if (format === 'png') handlers.exportPNG();
          else if (format === 'epub') handlers.exportEPUB();
        }}
        isDarkMode={isDarkMode}
      />
      {promptConfig.isOpen && (
        <PromptModal
          isOpen={promptConfig.isOpen}
          title={promptConfig.title}
          defaultValue={promptConfig.defaultValue}
          error={promptConfig.error}
          onConfirm={async (value) => {
            if (!value.trim()) {
              setPromptConfig(prev => ({ ...prev, error: '이름을 입력해주세요.' }));
              return;
            }
            try {
              if (promptConfig.type === 'createFile') {
                const finalName = value.endsWith('.md') ? value : `${value}.md`;
                const api = (window as any).electronAPI;
                if (api && rootFolder?.name && rootFolder.name !== '브라우저 스토리지') {
                  // === Desktop (Electron): 워크스페이스 경로에 직접 저장 ===
                  const fullPath = rootFolder.name + '\\' + finalName;
                  const success = await api.saveFile(fullPath, content);
                  if (success) {
                    setPromptConfig(prev => ({ ...prev, isOpen: false, error: '' }));
                    setCurrentFileName(finalName);
                    setCurrentFileNode({ name: finalName, kind: 'file', path: fullPath });
                    lastSavedContentRef.current = content;
                    setSaveStatus('saved');
                    await refreshFileList();
                    showToast(`${finalName} 저장 완료`, 'success');
                  } else {
                    showToast("저장 실패", 'error');
                  }
                } else if (workspaceType === 'browser') {
                  if (rootFolder?.handle) {
                    const handle = await rootFolder.handle.getFileHandle(finalName, { create: true });
                    const writable = await handle.createWritable();
                    await writable.write(content);
                    await writable.close();
                    setPromptConfig(prev => ({ ...prev, isOpen: false, error: '' }));
                    setCurrentFileName(finalName);
                    setCurrentFileNode({ name: finalName, kind: 'file', handle });
                    lastSavedContentRef.current = content;
                    setSaveStatus('saved');
                    await refreshFileList();
                    showToast(`${finalName} 저장 완료`, 'success');
                  } else {
                    vfsCreateFile('', finalName);
                    vfsWriteFile(finalName, content);
                    setPromptConfig(prev => ({ ...prev, isOpen: false, error: '' }));
                    setCurrentFileName(finalName);
                    setCurrentFileNode({ name: finalName, kind: 'file', path: finalName });
                    lastSavedContentRef.current = content;
                    setSaveStatus('saved');
                    await refreshFileList();
                    showToast(`${finalName} 저장 완료`, 'success');
                  }
                } else {
                  const res = await fetch(getApiUrl('/api/create-file'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ parentPath: '', name: finalName })
                  });
                  if (res.ok) {
                    const data = await res.json();
                    if (content) {
                      await fetch(getApiUrl('/api/save'), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ path: data.path, content })
                      });
                    }
                    setPromptConfig(prev => ({ ...prev, isOpen: false, error: '' }));
                    await refreshFileList();
                    const newFileNode = { name: finalName, kind: 'file' as const, path: data.path };
                    setCurrentFileName(finalName);
                    setCurrentFileNode(newFileNode);
                    lastSavedContentRef.current = content;
                    setSaveStatus('saved');
                    showToast(`${finalName} 생성 및 저장 완료`, 'success');
                  }
                }
              } else if (promptConfig.type === 'createFolder') {
                if (workspaceType === 'browser') {
                  if (rootFolder?.handle) {
                    await rootFolder.handle.getDirectoryHandle(value, { create: true });
                  } else {
                    // LocalStorage 가상 폴더 생성
                    vfsCreateFolder('', value);
                  }
                } else {
                  await fetch(getApiUrl('/api/create-folder'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ parentPath: '', name: value })
                  });
                }
                setPromptConfig(prev => ({ ...prev, isOpen: false, error: '' }));
                await refreshFileList();
                showToast(`${value} 폴더 생성 완료`, 'success');
              } else {
                setPromptConfig(prev => ({ ...prev, isOpen: false, error: '' }));
              }
            } catch (e: any) {
              showToast('작업 실패: ' + e.message, 'error');
            }
          }}
          onCancel={() => setPromptConfig(prev => ({ ...prev, isOpen: false, error: '' }))}
        />
      )}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        cancelText={confirmConfig.cancelText}
        isDanger={confirmConfig.isDanger}
        onConfirm={() => {
          confirmConfig.onConfirm();
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => {
          if (confirmConfig.onCancel) confirmConfig.onCancel();
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }}
      />
      <FormulaModal
        isOpen={isFormulaModalOpen}
        onClose={() => setIsFormulaModalOpen(false)}
        onInsert={(formula) => insertAtCursor(formula)}
        isDarkMode={isDarkMode}
      />
      <MergeModal
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
        selectedNodes={selectedMergeNodes}
        rootFolder={rootFolder}
        workspaceType={workspaceType}
        refreshParent={refreshFileList}
        openFile={handleFileClick}

      />
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        isDarkMode={isDarkMode}
        licenseKey={licenseKey}
        setLicenseKey={setLicenseKey}
        isActivated={isActivated}
      />

      <LicenseModal
        isOpen={isLicenseModalOpen}
        onClose={() => setIsLicenseModalOpen(false)}
        deviceId={deviceId}
        licenseStatus={licenseStatus}
        onSuccessActivation={handleSuccessActivation}
        isDarkMode={isDarkMode}
      />

      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => {
          setIsImageModalOpen(false);
          setEditingImageInfo(null);
        }}
        initialData={editingImageInfo}
        targetFolder={(() => {
          let folder = '';
          if (currentFileNodeRef.current?.path) {
            const filePath = currentFileNodeRef.current.path;
            const lastSlashIndex = filePath.lastIndexOf('\\');
            if (lastSlashIndex !== -1) {
              folder = filePath.substring(0, lastSlashIndex);
            }
          } else if (rootFolderRef.current?.name && rootFolderRef.current.name !== '브라우저 스토리지') {
            folder = rootFolderRef.current.name;
          }
          return folder;
        })()}
        showToast={showToast}
        onInsert={(path, alt, range) => {
          if (range) {
            const editor = editorRef.current;
            if (editor) {
              editor.executeEdits("edit-image", [{
                range: range,
                text: `![${alt}](${path})`,
                forceMoveMarkers: true
              }]);
              editor.focus();
            }
          } else {
            insertAtCursor(`![${alt}](${path})`);
          }
          setEditingImageInfo(null);
        }}
        isDarkMode={isDarkMode}
      />
      <YoutubeModal
        isOpen={isYoutubeModalOpen}
        onClose={() => setIsYoutubeModalOpen(false)}
        onInsert={(code) => insertAtCursor(code)}
        isDarkMode={isDarkMode}
      />
      <MapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onInsert={(code) => insertAtCursor(code)}
        isDarkMode={isDarkMode}
      />
      <TableModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        onInsert={(code) => insertAtCursor(code)}
        isDarkMode={isDarkMode}
      />

    </div>
  );
}
