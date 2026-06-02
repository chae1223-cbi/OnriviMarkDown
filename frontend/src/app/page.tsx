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
import MarkdownViewer from '../components/MarkdownViewer'; // 마크다운 뷰어 - 마크다운 뷰어
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
import { idb, FileNode, scanDirectory, getFileIcon } from '@/lib/helper'; // indexedDB 헬퍼
import { preprocessMarkdownForPreview } from "@/lib/editorUtils"; // 마크다운 프리뷰
import { getSlashCommands, getDefaultHotkeys, getDefaultCommands, TOOLBAR_ITEMS } from "@/lib/toolbarConfig"; // 툴바 설정
import { EDITOR_THEMES, THEME_MAP } from "@/lib/editorThemes"; // 에디터 테마
import { CssProfile } from "@/types/cssProfile"; // css 프로필 타입
import { DEFAULT_PROFILE } from "@/constants/cssProfile"; // 기본 프로필
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
import AIGeneratorPanel from '@/components/AIGeneratorPanel'; // 모달
import WritingAssistant from '@/components/WritingAssistant'; // 모달

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
  | 'NEW_FILE' | 'OPEN_FILE' | 'OPEN_WORKSPACE' | 'SAVE' | 'SAVE_AS'                   //① 파일 시스템 및 입출력 제어 (OS I/O Message)
  | 'EXPORT_PDF' | 'EXPORT_HTML' | 'EXPORT_EPUB' | 'EXPORT_PNG' | 'EXIT'                    //② 출력(Export) 및 종료  
  | 'UNDO' | 'REDO' | 'FIND' | 'REPLACE' | 'ZOOM_IN' | 'ZOOM_OUT'                      //③ 편집 및 보기 제어
  | 'GLOBAL_SEARCH' | 'TOGGLE_HELP' | 'ERASER' | 'BOLD' | 'ITALIC'                       //④ 스타일 적용
  | 'STRIKETHROUGH' | 'INLINE_CODE' | 'H1' | 'H2' | 'H3' | 'H4' | 'H5' | 'H6'                 //⑤ 스타일 적용
  | 'HR' | 'ORDERED_LIST' | 'UNORDERED_LIST' | 'QUOTE' | 'CHECKLIST'                   //⑥ 스타일 적용
  | 'LINK' | 'IMAGE' | 'VIDEO' | 'MAP' | 'TABLE' | 'CODE' | 'LATEX' | 'CLEAN_DOC'       //⑦ 스타일 적용
  | 'YOUTUBE' | 'NOW' | 'CODE_BLOCK' | 'CHART' | 'MATH' | 'SETTINGS'                  //⑧ 스타일 적용
  | 'ABOUT' | 'UPDATES' | 'TOGGLE_FLOATING_TOOLBAR' | 'OPEN_EXPORT' | 'REMOVE_PREFIX' | 'LIST' | 'CHECK' | 'COPY_ALL'  //⑨ 스타일 적용
  | 'TOGGLE_TOOLBAR' | 'TOGGLE_SIDEBAR' | 'TOGGLE_MODE' | 'TOGGLE_THEME'                  //⑩ 스타일 적용 
  | 'WRAP_H1' | 'WRAP_H2' | 'WRAP_H3' | 'WRAP_QUOTE' | 'WRAP_CODE'                       // ⑪ 스타일 적용 
  | 'TOGGLE_CSS_STYLE' | 'SETTINGS_SHORTCUTS'                                                                // ⑫ 스타일 적용 
  | 'FOOTNOTE'                                                                         // ⑬ 각주 삽입 
  | 'INSERT_TABLE_ROW' | 'DELETE_TABLE_ROW'                                               // ⑭ 표 행 편집 명령
  | 'TAGLINK';                                                                          // ⑮ 태그링크

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
  }
}


/**
 * @file 
 * @description 초기 마크다운 텍스트 
 * @note @/app/page.tsx에서 사용되는 초기 마크다운 텍스트 정의  
 *       모나코 에디터의 초기 마크다운 텍스트로 사용됨
 */

const resolveRelativeImagePath = (srcPath: string, currentFileNodePath: string | undefined): string => {
  if (!srcPath) return "";   // @srcPath : 이미지 경로 

  if (srcPath.startsWith('http://') || srcPath.startsWith('https://') || srcPath.startsWith('data:') || srcPath.startsWith('blob:')) {
    return srcPath;   // @srcPath : 절대 경로 (외부 링크, data URI, blob URI 등) 
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

/**
 * @file 
 * @description Home component  
 * @returns Home component
 */
export default function Home() {                  // @Home : Home component  
  const { showToast } = useToast();             // @showToast : Toast component  
  const [mounted, setMounted] = useState(false);  // @mounted : mounted state 
  const [content, setContent] = useState('');   // @content : content state 
  
  // 💡 [CORE-02 / 요구사항 4] Stale 클로저 완벽 격리를 위해 content Ref 백업 도입
  const contentRef = useRef(content);
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // 💡 미리보기 업데이트 지연 디바운스 타이머 Ref (타이핑 시 번쩍거림/깜빡거림 방쇄)
  const previewDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // 💡 [IME-01] 에디터 비제어(Uncontrolled) 컴포넌트 전환을 위한 상태 동기화 도우미
  // 에디터 내부의 onChange 변경인 경우 setValue를 호출하지 않아 한글 IME composition 깨짐 및 중복 입력을 원천 방어합니다.
  const updateContent = useCallback((newValue: string, fromEditor: boolean = false) => {
    if (fromEditor) {
      if (previewDebounceRef.current) clearTimeout(previewDebounceRef.current);
      previewDebounceRef.current = setTimeout(() => {
        setContent(newValue);
      }, 250); // 250ms 최적의 지연 시간 설정으로 깜빡임 현상을 완전히 해소합니다.
    } else {
      if (previewDebounceRef.current) clearTimeout(previewDebounceRef.current);
      setContent(newValue);
      if (editorRef.current && editorRef.current.getValue() !== newValue) {
        editorRef.current.setValue(newValue);
      }
    }
  }, []);

  // 💡 [SYNC-03 / 요구사항 3] 양방향 스크롤 관성 튕김 루프 원천 차단을 위해 호버 감지 Ref 도입
  const isEditorHovered = useRef(false);
  const isPreviewHovered = useRef(false);



  const [activeLine, setActiveLine] = useState<number | null>(null); // @activeLine : active line state 
  const lastSelectionRef = useRef<any>(null);    // @lastSelectionRef : last selection state 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // @isSidebarOpen : sidebar open state 
  const [isToolbarOpen, setIsToolbarOpen] = useState(true); // @isToolbarOpen : toolbar open state 
  const [sidebarWidth, setSidebarWidth] = useState(280); // @sidebarWidth : sidebar width state 
  const [isDarkMode, setIsDarkMode] = useState(false); // @isDarkMode : dark mode state 
  const [themePalette, setThemePalette] = useState<string>('onrivi-light'); // @themePalette : theme palette state 
  /*
   * profiles state — CssProfile 배열 (루셋 기반 CSS 서식 프로필)
   *
   * localStorage['cssProfiles']에서 초기화:
   * - 저장값이 없으면 [DEFAULT_PROFILE]로 시작
   * - 오래된 포맷(parsed[0].rules 없음) 감지 시 [DEFAULT_PROFILE]로 안전 리셋
   * - 파싱 실패 시에도 [DEFAULT_PROFILE] fallback
   */
  const [profiles, setProfiles] = useState<CssProfile[]>(() => { // @profiles : profiles state 
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('cssProfiles') : null; // @saved : cssProfiles state 
      if (!saved) return [DEFAULT_PROFILE]; // @saved : cssProfiles state 
      const parsed = JSON.parse(saved); // @parsed : cssProfiles state 
      if (!Array.isArray(parsed)) return [DEFAULT_PROFILE]; // @parsed : cssProfiles state
      /*
       * 마이그레이션 감지: tagClasses 포맷(문자열 값) 기존 프로필 감지 시
       * -> CssRuleSet 포맷(객체)로 바뀌었으므로 완전 리셋
       */
      if (parsed.length > 0 && !parsed[0].rules) return [DEFAULT_PROFILE]; // @parsed : cssProfiles state 
      return parsed as CssProfile[]; // @parsed : cssProfiles state 
    } catch { return [DEFAULT_PROFILE]; } // @DEFAULT_PROFILE : cssProfiles state 
  });
  const [activeProfileId, setActiveProfileId] = useState<string>(
    () => DEFAULT_PROFILE.id
  );
  const [isAddonEnv, setIsAddonEnv] = useState(false);
  const [previewMode, setPreviewMode] = useState<'edit' | 'both' | 'preview' | 'css-style'>('both');
  const previewModeRef = useRef(previewMode);
  useEffect(() => {
    previewModeRef.current = previewMode;
  }, [previewMode]);

  const [promptConfig, setPromptConfig] = useState<{
    isOpen: boolean;
    title: string;
    defaultValue: string;
    type: 'createFile' | 'createFolder' | 'rename' | null;
    error: string;
  }>({ isOpen: false, title: "", defaultValue: "", type: null, error: "" });
  const [wordWrap, setWordWrap] = useState<'on' | 'off'>('on');
  const [autoSave, setAutoSave] = useState(true);
  const [quoteStyle, setQuoteStyle] = useState<'modern' | 'clean' | 'none'>('modern');
  const [rootFolder, setRootFolder] = useState<{ name: string, handle?: any } | null>(null);
  const [fileList, setFileList] = useState<FileNode[]>([]);
  const [currentFileName, setCurrentFileName] = useState<string>('새 파일.md');
  const [fontSize, setFontSize] = useState<number>(14);
  const [customHotkeys, setCustomHotkeys] = useState<Record<string, string>>(getDefaultHotkeys());
  const [customSlashCommands, setCustomSlashCommands] = useState<Record<string, string>>(getDefaultCommands());
  
  // 💡 [한글 주석] 슬래시 명령어 변경 시 Monaco Editor Completion Provider가 Stale 클로저에 갇혀 실시간 갱신되지 않는 문제를 방어하기 위해 Ref 객체 도입
  const customSlashCommandsRef = useRef<Record<string, string>>(customSlashCommands);
  useEffect(() => {
    customSlashCommandsRef.current = customSlashCommands;
  }, [customSlashCommands]);

  const [workspaceType, setWorkspaceType] = useState<'local' | 'cloud' | 'browser'>('local');
  const pendingExternalFileRef = useRef<string | null>(null); // 윈도우 파일 연결 경로 (마운트 전 확보용)
  const [driveLetter, setDriveLetter] = useState('D:');
  const [currentFileNode, setCurrentFileNode] = useState<FileNode | null>(null);
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
  const [isYoutubeModalOpen, setIsYoutubeModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [showTagLinkPicker, setShowTagLinkPicker] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsModalInitialTab, setSettingsModalInitialTab] = useState<'editor' | 'app' | 'shortcuts'>('editor');
  const [licenseKey, setLicenseKey] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('onrivi_license_key') || 'chae6^jung1!jang3#&';
    }
    return 'chae6^jung1!jang3#&';
  });
  const isActivated = licenseKey === 'chae6^jung1!jang3#&';

  // 💡 [애드온/데스크탑 연동] 라이선스 키가 변경될 때 스토리지 동기화 및 최초 로드 시 크롬/데스크탑 스토리지 조회
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 1. 크롬 익스텐션 스토리지 조회
      const chromeStorage = (window as any).chrome?.storage?.local;
      if (chromeStorage) {
        chromeStorage.get(['onrivi_license_key'], (result: any) => {
          if (result.onrivi_license_key) {
            setLicenseKey(result.onrivi_license_key);
          }
        });
      }

      // 2. 데스크탑 Electron 스토리지 조회
      const api = (window as any).electronAPI;
      if (api && typeof api.loadLicense === 'function') {
        api.loadLicense().then((savedKey: string | null) => {
          if (savedKey) {
            setLicenseKey(savedKey);
          }
        });
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('onrivi_license_key', licenseKey);
      
      // 크롬 익스텐션 스토리지에 동시 저장
      const chromeStorage = (window as any).chrome?.storage?.local;
      if (chromeStorage) {
        chromeStorage.set({ onrivi_license_key: licenseKey });
      }

      // 데스크탑 Electron 로컬 디스크에 동시 저장
      const api = (window as any).electronAPI;
      if (api && typeof api.saveLicense === 'function') {
        api.saveLicense(licenseKey);
      }
    }
  }, [licenseKey]);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isUpdatesModalOpen, setIsUpdatesModalOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
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





  const editorRef = useRef<any>(null);
  
  // 💡 [WBS CORE-02 / 요구사항 4] State Stale Closure 방지를 위한 Ref 백업 시스템 도입
  const currentFileNodeRef = useRef(currentFileNode);
  const currentFileParentHandleRef = useRef<any>(null); // 💡 저장 시 startIn으로 활용하기 위한 부모 폴더 핸들 레퍼런스
  const currentFileNameRef = useRef(currentFileName);
  const workspaceTypeRef = useRef(workspaceType);
  const rootFolderRef = useRef(rootFolder);

  useEffect(() => { currentFileNodeRef.current = currentFileNode; }, [currentFileNode]);
  useEffect(() => { currentFileNameRef.current = currentFileName; }, [currentFileName]);
  useEffect(() => { workspaceTypeRef.current = workspaceType; }, [workspaceType]);
  useEffect(() => { rootFolderRef.current = rootFolder; }, [rootFolder]);
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
  const previewRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const lastSavedContentRef = useRef<string>('');
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

  useEffect(() => {
    const restoreSettings = async () => {
      // 1. 기본 설정 및 복원용 임시 구조체 정의
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

      // 2. 브라우저 로컬 스토리지 복원 시도
      try {
        const localData = localStorage.getItem('onrivi_settings');
        if (localData) {
          Object.assign(baseSettings, JSON.parse(localData));
        } else {
          // 하위 호환용 개별 로드
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

      // 3. 크롬 익스텐션(애드온) 스토리지 복원 시도
      const chromeStorage = (window as any).chrome?.storage?.local;
      if (chromeStorage) {
        try {
          const result = await new Promise<any>((resolve) => {
            chromeStorage.get(['onrivi_settings'], (res: any) => resolve(res || {}));
          });
          if (result && result.onrivi_settings) {
            Object.assign(baseSettings, result.onrivi_settings);
          }
        } catch (e) {
          console.error('크롬 스토리지 로드 실패:', e);
        }
      }

      // 4. 데스크탑 Electron 로컬 디스크 복원 시도
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

      // 단축키 마이그레이션 적용 (이전 패치의 결함 값 자동 교정)
      if (baseSettings.customHotkeys['css-style'] === 'Ctrl+Shift+S') {
        baseSettings.customHotkeys['css-style'] = 'Ctrl+Alt+S';
      }
      if (baseSettings.customSlashCommands['quickTable'] === '표') {
        baseSettings.customSlashCommands['quickTable'] = 'qtable';
      }
      if (baseSettings.customSlashCommands['cleanDoc'] === 'cleanDoc') {
        baseSettings.customSlashCommands['cleanDoc'] = 'cleandoc';
      }

      // 구버전 단축키 보정용 정규화 헬퍼 함수
      const normalizeKeyForMig = (val?: string) => {
        if (!val) return '';
        return val.replace(/\s+/g, '').toUpperCase().replace('CTRLCMD', 'CTRL');
      };

      // 표 행 추가/삭제의 구버전 기본 단축키를 신규 기본 단축키(Ctrl+Alt+I, Ctrl+Alt+D)로 보정 (사용자 커스텀 예외, 공백 대응)
      if (normalizeKeyForMig(baseSettings.customHotkeys['insertTableRow']) === 'CTRL+ALT+ENTER') {
        baseSettings.customHotkeys['insertTableRow'] = 'Ctrl+Alt+I';
      }
      if (normalizeKeyForMig(baseSettings.customHotkeys['deleteTableRow']) === 'CTRL+ALT+DELETE') {
        baseSettings.customHotkeys['deleteTableRow'] = 'Ctrl+Alt+D';
      }
      // 이미지 단축키의 구버전 기본값(Ctrl+Alt+I)이 남아있는 경우 충돌 방지를 위해 공란으로 보정
      if (normalizeKeyForMig(baseSettings.customHotkeys['image']) === 'CTRL+ALT+I') {
        baseSettings.customHotkeys['image'] = '';
      }

      // 푸터 토글류 구버전 기본 단축키(Ctrl+Shift+F/T/B/P/D)를 신규 기본 단축키(Ctrl+Shift+F1 ~ F5)로 보정 (사용자 커스텀 예외, 공백 대응)
      if (normalizeKeyForMig(baseSettings.customHotkeys['toggleFloatingToolbar']) === 'CTRL+SHIFT+F') {
        baseSettings.customHotkeys['toggleFloatingToolbar'] = 'Ctrl+Shift+F1';
      }
      if (normalizeKeyForMig(baseSettings.customHotkeys['toggleToolbar']) === 'CTRL+SHIFT+T') {
        baseSettings.customHotkeys['toggleToolbar'] = 'Ctrl+Shift+F2';
      }
      if (normalizeKeyForMig(baseSettings.customHotkeys['toggleSidebar']) === 'CTRL+SHIFT+B') {
        baseSettings.customHotkeys['toggleSidebar'] = 'Ctrl+Shift+F3';
      }
      if (normalizeKeyForMig(baseSettings.customHotkeys['toggleMode']) === 'CTRL+SHIFT+P') {
        baseSettings.customHotkeys['toggleMode'] = 'Ctrl+Shift+F4';
      }
      if (normalizeKeyForMig(baseSettings.customHotkeys['toggleTheme']) === 'CTRL+SHIFT+D') {
        baseSettings.customHotkeys['toggleTheme'] = 'Ctrl+Shift+F5';
      }

      // 신규 단축키 및 명령어 주입 (기존 사용자 설정 온전 보존)
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

      // 5. 기본 상태 세팅
      setIsDarkMode(baseSettings.isDarkMode);
      setFontSize(baseSettings.fontSize);
      setWordWrap(baseSettings.wordWrap);
      setAutoSave(baseSettings.autoSave);
      setPreviewMode(baseSettings.previewMode);
      setQuoteStyle(baseSettings.quoteStyle);
      setCustomHotkeys(baseSettings.customHotkeys);
      setCustomSlashCommands(baseSettings.customSlashCommands);
      setThemePalette(baseSettings.themePalette);
      setLicenseKey(baseSettings.licenseKey);

      // DOM 다크모드 적용
      if (baseSettings.isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // 모나코 테마 수동 세팅
      if (editorRef.current && (window as any).monaco) {
        const monaco = (window as any).monaco;
        monaco.editor.setTheme(baseSettings.themePalette);
      }

      // 사이드바 너비 로드
      const savedWidth = localStorage.getItem('sidebarWidth');
      if (savedWidth) setSidebarWidth(parseInt(savedWidth));

      const savedProfileId = localStorage.getItem('activeCssProfileId');
      if (savedProfileId) setActiveProfileId(savedProfileId);

      // 6. 애드온 환경 감지 및 폴더 연결 복원
      const detectedAddon = typeof window !== 'undefined' && (
        new URLSearchParams(window.location.search).get('env') === 'addon' ||
        !!((window as any).chrome?.runtime?.id)
      );
      setIsAddonEnv(detectedAddon);

      // 로컬스토리지에 저장된 워크스페이스 타입 복원
      const savedWorkspaceType = localStorage.getItem('workspaceType') || 'local';
      const activeWorkspaceType = detectedAddon ? 'browser' : savedWorkspaceType;
      setWorkspaceType(activeWorkspaceType as any);

      // 브라우저/애드온(browser) 모드: File System Access API 사용, 백엔드 불필요
      if (activeWorkspaceType === 'browser') {
        setPreviewMode(baseSettings.previewMode);

        // 🛡️ [브라우저/애드온 폴더 자동 연결 가드] IndexedDB에서 이전 폴더 핸들을 가져와 복원 시도
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

        if (!isElectron) {
          try {
            const res = await fetch(getApiUrl('/api/get-root'));
            if (res.ok) {
              const data = await res.json();
              if (data.currentRoot) {
                rootPath = data.currentRoot;
              }
            }
          } catch (err) {
            showToast('백엔드 루트 경로 조회 실패.', 'warning');
          }
        }

        if (rootPath) {
          setRootFolder({ name: rootPath });
          localStorage.setItem('rootFolder', JSON.stringify({ name: rootPath }));
        } else {
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
      }

      // 윈도우 파일 연결: 초기 파일 경로를 pull (마운트 전에 확보)
      if (typeof window !== 'undefined' && !!(window as any).electronAPI) {
        try {
          const pendingPath = await (window as any).electronAPI.getInitialFilePath();
          if (pendingPath) {
            pendingExternalFileRef.current = pendingPath;
          }
        } catch (e) {
          // getInitialFilePath 미지원 환경 → 조용히 무시
        }
      }

      setMounted(true);
    };

    restoreSettings();
  }, []);

  // 💡 [환경설정 통합 영구 저장 가드]
  // 모든 개별 설정값 중 하나라도 변경되면 localStorage, 크롬 익스텐션 스토리지, 데스크탑 스토리지에 동시 영구 저장합니다.
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

    // 1. 브라우저 로컬 스토리지 저장
    localStorage.setItem('onrivi_settings', JSON.stringify(settings));
    // 개별 레거시 키 호환 유지
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('fontSize', fontSize.toString());
    localStorage.setItem('wordWrap', wordWrap);
    localStorage.setItem('quoteStyle', quoteStyle);
    localStorage.setItem('customHotkeys', JSON.stringify(customHotkeys));
    localStorage.setItem('customSlashCommands', JSON.stringify(customSlashCommands));
    localStorage.setItem('themePalette', themePalette);
    localStorage.setItem('autoSave', autoSave ? 'true' : 'false');
    localStorage.setItem('previewMode', previewMode);

    // 2. 크롬 익스텐션(애드온) 스토리지 동시 저장
    const chromeStorage = (window as any).chrome?.storage?.local;
    if (chromeStorage) {
      chromeStorage.set({ onrivi_settings: settings });
    }

    // 3. 데스크탑 Electron 로컬 디스크 동시 저장
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
    if (mounted) {
      localStorage.setItem('cssProfiles', JSON.stringify(profiles));
    }
  }, [profiles, mounted]);

  useEffect(() => {
    if (mounted && activeProfileId) {
      localStorage.setItem('activeCssProfileId', activeProfileId);
    }
  }, [activeProfileId, mounted]);

  const handleThemeChange = useCallback((themeId: string) => {
    const theme = THEME_MAP[themeId];
    if (!theme) return;
    setThemePalette(themeId);
    setIsDarkMode(theme.isDark);
  }, []);

  // workspaceType 변경 시 로컬스토리지 저장은 통합 저장 이펙트 또는 워크스페이스 직접 마운트 로직에서 담당

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      const api = (window as any).electronAPI;
      api.onNewFileRequested(() => handlers.newFile());
      api.onOpenFileRequested(() => handlers.openFolder());
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
          updateContent(file.content);
          lastSavedContentRef.current = file.content;
          setCurrentFileName(file.name);
          setCurrentFileNode({ name: file.name, kind: 'file', path: file.path });
          showToast(`📂 ${file.name}`, "info");
          return;
        }
      }
      // fallback: handleFileOpenByPath 시도
      await handleFileOpenByPath(filePath);
    } catch (e) {
      showToast('파일을 열 수 없습니다.', 'error');
    }
  };

  // 최초 마운트 시 웰컴 콘텐츠 로드 (단, 외부 파일 연결 pending이면 skip)
  useEffect(() => {
    if (!mounted) return;
    // 윈도우 파일 연결로 열 파일이 대기 중이면 웰컴을 덮어쓰지 않음
    if (pendingExternalFileRef.current) return;
    const welcome = getWelcomeContent();
    if (!currentFileNode || currentFileName === '새 파일.md') {
      updateContent(welcome);
      lastSavedContentRef.current = welcome;
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

    const elements = Array.from(previewRef.current.querySelectorAll('[data-line]')) as HTMLElement[];
    elements.forEach(el => el.classList.remove('preview-highlight-line'));

    if (previewMode !== 'both' || !activeLine) return;

    // activeLine 이하이면서 가장 가까운(최대값) data-line을 가진 요소를 찾음
    let targetEl: HTMLElement | null = null;
    let maxLine = -1;

    elements.forEach(el => {
      const lineStr = el.getAttribute('data-line');
      if (lineStr) {
        const line = parseInt(lineStr, 10);
        if (line <= activeLine && line > maxLine) {
          maxLine = line;
          targetEl = el;
        }
      }
    });

    if (targetEl) {
      (targetEl as HTMLElement).classList.add('preview-highlight-line');
    }
  }, [activeLine, previewMode]);

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

  const refreshFileList = useCallback(async () => {
    let activeType = workspaceType;

    if (activeType === 'browser') {
      if (rootFolder?.handle && !(rootFolder as any)?.needPermission) {
        try {
          const list = await scanDirectory(rootFolder.handle);
          setFileList(list);
        } catch (e) {
          if (rootFolder) {
            setRootFolder({ ...rootFolder, needPermission: true } as any);
          }
          const list = getVfsFiles();
          setFileList(list);
        }
      } else {
        const list = getVfsFiles();
        setFileList(list);
      }
    } else if (activeType === 'local') {
      const api = (window as any).electronAPI;
      if (api?.readFromPath) {
        if (rootFolder?.name) {
          try {
            const list = await api.listDirectory(rootFolder.name);
            if (list) setFileList(list);
          } catch (e: any) {
            showToast('파일 목록 조회 실패. 잠시 후 다시 시도해 주세요.', 'error');
            showToast(`워크스페이스 파일 목록을 갱신하지 못했습니다: ${e?.message || e}`, 'warning');
          }
        } else {
          setFileList([]);
        }
      } else {
        try {
          const res = await fetch(getApiUrl(`/api/files?t=${Date.now()}`));
          if (res.ok) {
            const list = await res.json();
            setFileList(list);
          }
        } catch (err) {
          showToast('파일 목록 조회 실패. 잠시 후 다시 시도해 주세요.', 'error');
        }
      }
    }
  }, [rootFolder, workspaceType]);

  useEffect(() => {
    if (mounted) {
      refreshFileList();
    }
  }, [refreshFileList, mounted]);

  const selectRootFolder = async (type: 'local' | 'cloud' | 'browser', provider: string | null = null) => {
    if (type === 'browser') {
      try {
        // 웹 브라우저 로컬스토리지 3번 선택 시 (provider가 없을 때)
        if (!provider) {
          const folder = { name: '브라우저 스토리지' };
          await idb.set('rootFolderHandle', null); // 기존 디렉토리 핸들 클리어
          setRootFolder(folder);
          setWorkspaceType('browser');
          localStorage.setItem('rootFolder', JSON.stringify({ name: '브라우저 스토리지' }));
          localStorage.setItem('workspaceType', 'browser');
          await refreshFileList();
          showToast("로컬 스토리지 워크스페이스가 연결되었습니다.", "success");
          return;
        }

        if (typeof (window as any).showDirectoryPicker === 'function') {
          const handle = await (window as any).showDirectoryPicker();
          const folder = { name: handle.name, handle };
          await idb.set('rootFolderHandle', handle); // 새로고침 유지용 핸들 저장
          setRootFolder(folder);
          setWorkspaceType('browser');
          localStorage.setItem('rootFolder', JSON.stringify({ name: handle.name }));
          localStorage.setItem('workspaceType', 'browser');
          await refreshFileList();
          showToast("브라우저 워크스페이스가 연결되었습니다.", "success");
        } else {
          const folder = { name: '브라우저 스토리지' };
          await idb.set('rootFolderHandle', null);
          setRootFolder(folder);
          setWorkspaceType('browser');
          localStorage.setItem('rootFolder', JSON.stringify({ name: '브라우저 스토리지' }));
          localStorage.setItem('workspaceType', 'browser');
          await refreshFileList();
          showToast("로컬 스토리지 워크스페이스가 연결되었습니다.", "success");
        }
      } catch (err) {
        showToast('워크스페이스 선택 중 오류가 발생했습니다.', 'error');
        // 에러 또는 거부 시 로컬스토리지로 대체
        const folder = { name: '브라우저 스토리지' };
        await idb.set('rootFolderHandle', null);
        setRootFolder(folder);
        setWorkspaceType('browser');
        localStorage.setItem('rootFolder', JSON.stringify({ name: '브라우저 스토리지' }));
        localStorage.setItem('workspaceType', 'browser');
        await refreshFileList();
        showToast("로컬 스토리지 워크스페이스로 전환되었습니다.", "info");
      }
    } else if (type === 'local') {
      await idb.set('rootFolderHandle', null);

      const hasElectronAPI = typeof window !== 'undefined' && !!(window as any).electronAPI;

      if (hasElectronAPI) {
        try {
          let currentLocalPath: string | undefined = undefined;
          try {
            const savedRoot = localStorage.getItem('rootFolder');
            if (savedRoot) {
              const parsed = JSON.parse(savedRoot);
              if (parsed && parsed.name && parsed.name !== '브라우저 스토리지') {
                currentLocalPath = parsed.name;
              }
            }
          } catch (_) {}

          const targetPath = currentLocalPath || rootFolderRef.current?.name;
          const result = await (window as any).electronAPI.selectFolder(targetPath);
          if (result.status === 'success') {
            const finalRoot = result.path;
            // 백엔드에 저장 (실패해도 로컬에는 저장)
            try {
              await fetch(getApiUrl('/api/set-root'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newRoot: finalRoot })
              });
            } catch (_) { }
            setRootFolder({ name: finalRoot });
            setWorkspaceType('local');
            localStorage.setItem('rootFolder', JSON.stringify({ name: finalRoot }));
            localStorage.setItem('workspaceType', 'local');
            await refreshFileList();
            showToast(`워크스페이스가 ${finalRoot}(으)로 변경되었습니다.`, 'success');
          } else if (result.status === 'canceled') {
            showToast("폴더 선택이 취소되었습니다.", "info");
          }
        } catch (err: any) {
          showToast("폴더 선택 오류: " + err.message, "error");
        }
      } else if (typeof (window as any).showDirectoryPicker === 'function') {
        // 브라우저: File System Access API (OS 탐색기)
        try {
          const handle = await (window as any).showDirectoryPicker();
          const folder = { name: handle.name, handle };
          await idb.set('rootFolderHandle', handle);
          setRootFolder(folder);
          setWorkspaceType('browser');
          localStorage.setItem('rootFolder', JSON.stringify({ name: handle.name }));
          localStorage.setItem('workspaceType', 'browser');
          await refreshFileList();
          showToast("워크스페이스 폴더가 연결되었습니다.", "success");
        } catch (err) {
          if ((err as any)?.name !== 'AbortError' && (err as any)?.name !== 'SecurityError') {
            showToast('워크스페이스 선택 중 오류가 발생했습니다.', 'error');
          }
          showToast("폴더 선택이 취소되었습니다.", "info");
        }
      } else {
        // showDirectoryPicker 미지원 환경 → localStorage VFS
        const folder = { name: '브라우저 스토리지' };
        await idb.set('rootFolderHandle', null);
        setRootFolder(folder);
        setWorkspaceType('browser');
        localStorage.setItem('rootFolder', JSON.stringify({ name: '브라우저 스토리지' }));
        localStorage.setItem('workspaceType', 'browser');
        await refreshFileList();
        showToast("로컬 스토리지 워크스페이스가 연결되었습니다.", "success");
      }
    }
  };

  const restoreFolderPermission = async () => {
    if (!rootFolder?.handle) return;
    try {
      const status = await rootFolder.handle.requestPermission({ mode: 'readwrite' });
      if (status === 'granted') {
        const restoredFolder = { name: rootFolder.handle.name, handle: rootFolder.handle };
        setRootFolder(restoredFolder);
        showToast("이전 워크스페이스 폴더가 정상 복구되었습니다.", "success");
        // 상태 갱신 반영을 유도
        setTimeout(() => refreshFileList(), 100);
      } else {
        showToast("폴더 읽기/쓰기 권한 승인이 거부되었습니다.", "warning");
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        showToast(`권한 복구 실패: ${err.message}`, "error");
      }
    }
  };

  const handleFileOpenByPath = async (resolvedPath: string) => {
    // 💡 [한글 주석] 전체 fileList 트리 구조에서 resolvedPath와 일치하는 파일 노드를 재귀 탐색
    const findNodeByPath = (nodes: FileNode[], targetPath: string): { node: FileNode, parent: any } | null => {
      const normalizedTarget = targetPath.replace(/\\/g, '/').toLowerCase();
      for (const node of nodes) {
        const normalizedNodePath = (node.path || '').replace(/\\/g, '/').toLowerCase();
        if (normalizedNodePath === normalizedTarget && node.kind === 'file') {
          return { node, parent: rootFolder?.handle || null };
        }
        if (node.children && node.children.length > 0) {
          const found = findNodeByPath(node.children, targetPath);
          if (found) {
            return { node: found.node, parent: found.parent || node.handle };
          }
        }
      }
      return null;
    };

    const foundResult = findNodeByPath(fileList, resolvedPath);
    if (foundResult) {
      await handleFileClick(foundResult.node, foundResult.parent);
      return;
    }

    // 💡 [한글 주석] 로컬 모드에서 트리에 아직 편입되지 않은 절대 경로가 넘어왔을 때의 폴백 구조
    if (workspaceType !== 'browser') {
      const filename = resolvedPath.split('/').pop() || '파일.md';
      const dummyNode: FileNode = {
        name: filename,
        path: resolvedPath,
        kind: 'file'
      };
      await handleFileClick(dummyNode);
      return;
    }

    showToast('해당 파일 노드를 찾을 수 없습니다.', 'error');
  };

  const handleFileClick = async (node: FileNode | null, parentHandle?: any) => {
    // 💡 부모 폴더 핸들을 레퍼런스에 저장하여 저장 시 startIn 경로로 활용
    currentFileParentHandleRef.current = parentHandle || null;

    if (!node) {
      setCurrentFileNode(null);
      setCurrentFileName('새 파일.md');
      const welcome = getWelcomeContent();
      updateContent(welcome);
      lastSavedContentRef.current = welcome;
      setSaveStatus('saved');
      return;
    }
    if (node.kind === 'directory') return;
    try {
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
          const text = await file.text();
          updateContent(text);
          lastSavedContentRef.current = text;
        } else if (node.path) {
          // LocalStorage 가상 파일 읽기
          const text = vfsReadFile(node.path);
          updateContent(text);
          lastSavedContentRef.current = text;
        }
      } else if (activeMode === 'local' && node.path) {
        const api = (window as any).electronAPI;
        if (api?.readFromPath) {
          try {
            const file = await api.readFromPath(node.path);
            if (file) {
              updateContent(file.content);
              lastSavedContentRef.current = file.content;
            }
          } catch (e) {
            showToast('파일 읽기 실패', 'error');
          }
        } else {
          const res = await fetch(getApiUrl(`/api/file-content?path=${encodeURIComponent(node.path)}`));
          if (res.ok) {
            const data = await res.json();
            updateContent(data.content);
            lastSavedContentRef.current = data.content;
          }
        }
      }
      setCurrentFileName(node.name);
      setCurrentFileNode(node);

      // 📌 파일 열기 완료 후 에디터 및 미리보기 스크롤을 맨 위로 초기화
      // (requestAnimationFrame: Monaco가 content 렌더링을 완료한 후 scroll position이 React 리렌더링에 덮어써지는 것을 방지)
      if (editorRef.current) {
        requestAnimationFrame(() => {
          const editor = editorRef.current;
          if (editor) {
            if (typeof editor.setScrollTop === 'function') {
              editor.setScrollTop(0);
            } else if (typeof editor.revealLine === 'function') {
              editor.revealLine(1);
            }
          }
        });
      }
      if (previewRef.current) {
        previewRef.current.scrollTop = 0;
      }

      const openedMsg = `${node.name} 파일을 열었습니다.`;
      showToast(openedMsg, "info");
      if (isSearchOpen) setIsSearchOpen(false);
      setIsSidebarOpen(true);
    } catch (err) {
      showToast("파일을 여는데 실패했습니다.", "error");
    }
  };

  const saveFile = useCallback(async (targetContent: string, targetFile: FileNode | null) => {
    if (!targetFile) return false;
    try {
      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        const success = await (window as any).electronAPI.saveFile(targetFile.path, targetContent);
        if (success) {
          lastSavedContentRef.current = targetContent;
        }
        return success;
      } else if (workspaceType === 'local') {
        const res = await fetch(getApiUrl('/api/save'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: targetFile.path, content: targetContent })
        });
        if (res.ok) {
          lastSavedContentRef.current = targetContent;
          return true;
        }
      } else if (workspaceType === 'browser') {
        if (targetFile.handle) {
          const writable = await targetFile.handle.createWritable();
          await writable.write(targetContent);
          await writable.close();
          lastSavedContentRef.current = targetContent;
          return true;
        } else if (targetFile.path) {
          vfsWriteFile(targetFile.path, targetContent);
          lastSavedContentRef.current = targetContent;
          return true;
        }
      }
    } catch (e) {
      showToast('파일 저장 중 오류가 발생했습니다. 권한을 확인해 주세요.', 'error');
    }
    return false;
  }, [workspaceType]);

  useEffect(() => {
    if (currentFileNode) {
      if (content === lastSavedContentRef.current) {
        setSaveStatus('saved');
        return;
      }
      setSaveStatus('unsaved');
    }
  }, [content, currentFileNode]);

  useEffect(() => {
    if (autoSave && currentFileNode) {
      if (content === lastSavedContentRef.current) return;

      setSaveStatus('saving');
      const timer = setTimeout(async () => {
        if (content === lastSavedContentRef.current) return;

        const success = await saveFile(content, currentFileNode);
        setSaveStatus(success ? 'saved' : 'unsaved');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [content, autoSave, currentFileNode, saveFile]);

  const insertAtCursor = (text: string) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      let selection = editor.getSelection();
      if (!selection || (selection.isEmpty() && lastSelectionRef.current)) {
        selection = lastSelectionRef.current;
      }
      if (selection) {
        const range = new (window as any).monaco.Range(
          selection.startLineNumber,
          selection.startColumn,
          selection.endLineNumber,
          selection.endColumn
        );
        editor.executeEdits("insert", [{ range, text, forceMoveMarkers: true }]);
        
        // [WBS SYNC-02] 주입 직후 구문 강조와 배경 스타일이 즉시 화면에 렌더링되도록 Monaco 모델의 강제 토큰화 수동 격발
        try {
          const model = editor.getModel();
          if (model && typeof model.forceTokenization === 'function') {
            const startLine = selection.startLineNumber;
            const lineCount = text.split('\n').length;
            for (let i = startLine; i <= startLine + lineCount; i++) {
              model.forceTokenization(i);
            }
          }
          editor.layout();
        } catch (_) {}

        editor.focus();
      }
    }
  };

  const scrollToLine = (lineNumber: number) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      editor.revealLineInCenter(lineNumber);
      editor.setPosition({ lineNumber, column: 1 });
      editor.focus();
    }
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const lineEl = target.closest('[data-line]');
    if (lineEl) {
      const lineStr = lineEl.getAttribute('data-line');
      if (lineStr) {
        const lineNumber = parseInt(lineStr, 10);
        scrollToLine(lineNumber);

        if (previewRef.current) {
          const elements = Array.from(previewRef.current.querySelectorAll('[data-line]'));
          elements.forEach(el => el.classList.remove('preview-highlight-line'));
          lineEl.classList.add('preview-highlight-line');
        }
      }
    }
  };

  const insertBlockTag = (startTag: string, endTag: string, defaultText: string = "") => {
    if (!editorRef.current) return;
    const editor = editorRef.current;
    let selection = editor.getSelection();
    if (!selection) return;

    const model = editor.getModel();
    const text = model.getValueInRange(selection);

    if (text) {
      const newText = `${startTag}\n${text}\n${endTag}`;
      editor.executeEdits("insertBlockTag", [{
        range: selection,
        text: newText,
        forceMoveMarkers: true
      }]);
      const linesAdded = startTag.split('\n').length;
      editor.setSelection(new (window as any).monaco.Selection(
        selection.startLineNumber + linesAdded,
        selection.startColumn,
        selection.endLineNumber + linesAdded,
        selection.endColumn
      ));
    } else {
      const textToWrap = defaultText;
      const newText = textToWrap ? `${startTag}\n${textToWrap}\n${endTag}` : `${startTag}\n\n${endTag}`;
      editor.executeEdits("insertBlockTag", [{
        range: selection,
        text: newText,
        forceMoveMarkers: true
      }]);

      const linesAdded = startTag.split('\n').length;
      if (textToWrap) {
        editor.setSelection(new (window as any).monaco.Selection(
          selection.startLineNumber + linesAdded,
          1,
          selection.startLineNumber + linesAdded,
          1 + textToWrap.length
        ));
      } else {
        editor.setPosition({
          lineNumber: selection.startLineNumber + linesAdded,
          column: 1
        });
      }
    }
    // [WBS SYNC-02] 주입 직후 구문 강조와 배경 스타일이 즉시 화면에 렌더링되도록 Monaco 모델의 강제 토큰화 수동 격발
    try {
      const model = editor.getModel();
      if (model && typeof model.forceTokenization === 'function') {
        const startLine = selection.startLineNumber;
        const endLine = selection.endLineNumber;
        const linesAdded = startTag.split('\n').length + endTag.split('\n').length + 2;
        for (let i = startLine; i <= endLine + linesAdded; i++) {
          model.forceTokenization(i);
        }
      }
      editor.layout();
    } catch (_) {}

    editor.focus();
  };

  const wrapSelection = (before: string, after: string = before, defaultText: string = "") => {
    if (editorRef.current) {
      const editor = editorRef.current;
      const refreshTokens = (start: number, end: number) => {
        try {
          const model = editor.getModel();
          if (model && typeof model.forceTokenization === 'function') {
            for (let i = start; i <= end; i++) {
              model.forceTokenization(i);
            }
          }
          editor.layout();
        } catch (_) {}
      };

      let selection = editor.getSelection();
      if ((!selection || selection.isEmpty()) && lastSelectionRef.current && !lastSelectionRef.current.isEmpty()) {
        selection = lastSelectionRef.current;
      }
      if (!selection) return;
      const model = editor.getModel();

      let startLine = selection.startLineNumber;
      let startCol = selection.startColumn;
      let endLine = selection.endLineNumber;
      let endCol = selection.endColumn;
      let text = model.getValueInRange(selection);

      // 💡 [개행 트리밍 보정] 선택 영역 앞뒤의 개행 문자를 파싱하여 범위를 안쪽으로 좁힙니다.
      // 이를 통해 태그 주입 시 중간에 뜬금없는 줄바꿈이 삽입되는 버그를 원천 차단합니다.
      let adjusted = false;
      while (text.length > 0 && (text[0] === '\r' || text[0] === '\n')) {
        adjusted = true;
        if (text[0] === '\n') {
          startLine++;
          startCol = 1;
        } else {
          startCol++;
        }
        text = text.slice(1);
      }
      while (text.length > 0 && (text[text.length - 1] === '\r' || text[text.length - 1] === '\n')) {
        adjusted = true;
        const lastChar = text[text.length - 1];
        if (lastChar === '\n') {
          endLine--;
          endCol = model.getLineMaxColumn(endLine);
        } else {
          endCol = Math.max(1, endCol - 1);
        }
        text = text.slice(0, -1);
      }

      if (adjusted) {
        selection = new (window as any).monaco.Selection(startLine, startCol, endLine, endCol);
      }

      const isEmpty = !text || text.length === 0;
      const textToWrap = (isEmpty && defaultText) ? defaultText : text;

      if (before && after && text.startsWith(before) && text.endsWith(after) && text.length >= (before.length + after.length)) {
        const stripped = text.slice(before.length, text.length - after.length);

        const range = new (window as any).monaco.Range(
          selection.startLineNumber,
          selection.startColumn,
          selection.endLineNumber,
          selection.endColumn
        );
        editor.executeEdits("toggle-off-inside", [{ range, text: stripped, forceMoveMarkers: true }]);

        setTimeout(() => {
          if (!selection) return;
          const startLine = selection.startLineNumber;
          const startCol = selection.startColumn;
          editor.setSelection(new (window as any).monaco.Selection(
            startLine,
            startCol,
            startLine,
            startCol + stripped.length
          ));
          refreshTokens(startLine, startLine);
        }, 10);
        editor.focus();
        return;
      }

      if (before && after) {
        const startLine = selection.startLineNumber;
        const startCol = selection.startColumn;
        const endLine = selection.endLineNumber;
        const endCol = selection.endColumn;

        if (startLine === endLine && startCol > before.length) {
          const rangeBefore = new (window as any).monaco.Range(startLine, startCol - before.length, startLine, startCol);
          const rangeAfter = new (window as any).monaco.Range(endLine, endCol, endLine, endCol + after.length);

          const textBefore = model.getValueInRange(rangeBefore);
          const textAfter = model.getValueInRange(rangeAfter);

          if (textBefore === before && textAfter === after) {
            const fullRange = new (window as any).monaco.Range(startLine, startCol - before.length, endLine, endCol + after.length);
            editor.executeEdits("toggle-off-outside", [{ range: fullRange, text: text, forceMoveMarkers: true }]);

            setTimeout(() => {
              if (!selection) return;
              editor.setSelection(new (window as any).monaco.Selection(
                startLine,
                startCol - before.length,
                endLine,
                startCol - before.length + text.length
              ));
              refreshTokens(startLine, endLine);
            }, 10);
            editor.focus();
            return;
          }
        }
      }

      const range = new (window as any).monaco.Range(
        selection.startLineNumber,
        selection.startColumn,
        selection.endLineNumber,
        selection.endColumn
      );
      editor.executeEdits("toggle-on", [{ range, text: `${before}${textToWrap}${after}`, forceMoveMarkers: true }]);

      setTimeout(() => {
        if (!selection) return;
        const startLine = selection.startLineNumber;
        const startCol = selection.startColumn;
        const endLine = selection.endLineNumber;
        const endCol = selection.endColumn;

        if (startLine === endLine) {
          const selectStart = startCol + before.length;
          const selectEnd = isEmpty && defaultText ? selectStart + defaultText.length : endCol + before.length;
          editor.setSelection(new (window as any).monaco.Selection(
            startLine,
            selectStart,
            endLine,
            selectEnd
          ));
        } else {
          // 멀티행 선택: 태그 적용 후에도 선택 범위 유지
          editor.setSelection(new (window as any).monaco.Selection(
            startLine,
            startCol,
            endLine,
            endCol + after.length
          ));
        }
        refreshTokens(startLine, endLine);
      }, 10);
      editor.focus();
    }
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
      const textToInsert = `[${selectedText}](<#${headingTarget}>)`;
      const range = {
        startLineNumber: selection.startLineNumber,
        startColumn: selection.startColumn,
        endLineNumber: selection.endLineNumber,
        endColumn: selection.endColumn
      };
      editor.executeEdits("insertTagLink", [{ range, text: textToInsert, forceMoveMarkers: true }]);
    } else {
      const textToInsert = `[${headingTarget}](<#${headingTarget}>)`;
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

  const parseHtmlTableToMarkdown = (html: string) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const table = doc.querySelector('table');
      if (!table) return null;

      let mdTable = '';
      const rows = table.querySelectorAll('tr');
      let isFirstRow = true;

      rows.forEach((row) => {
        const cells = row.querySelectorAll('th, td');
        if (cells.length === 0) return;

        const cellTexts = Array.from(cells).map(cell => {
          let inner = cell.innerHTML;
          inner = inner.replace(/<br\s*\/?>/gi, ' <br> ');
          inner = inner.replace(/<\/(p|div)>/gi, ' <br> ');

          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = inner;
          let text = tempDiv.textContent || tempDiv.innerText || '';

          text = text.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
          text = text.replace(/(<br>\s*)+/g, '<br>');
          if (text.startsWith('<br>')) text = text.substring(4).trim();
          if (text.endsWith('<br>')) text = text.substring(0, text.length - 4).trim();

          return text;
        });

        mdTable += '| ' + cellTexts.join(' | ') + ' |\n';

        if (isFirstRow) {
          mdTable += '|' + cellTexts.map(() => '---').join('|') + '|\n';
          isFirstRow = false;
        }
      });
      return mdTable.trim() + '\n';
    } catch (err) {
      showToast('HTML 표 파싱 중 오류가 발생했습니다.', 'error');
      return null;
    }
  };

  const sanitizePastedText = (text: string) => {
    let sanitized = text;

    // 1. 운영체제 간 줄바꿈 차이 통합 (\r\n -> \n)
    sanitized = sanitized.replace(/\r\n/g, '\n');

    // 2. 눈에 보이지 않는 유령 문자(Zero-width space 등) 제거
    sanitized = sanitized.replace(/[\u200B-\u200D\uFEFF]/g, '');

    // 3. 웹 복사 시 자주 딸려오는 지저분한 HTML 태그 찌꺼기 제거 (마크다운 포맷팅 방해 요소)
    sanitized = sanitized.replace(/<\/?(span|div|font|style|script|meta)[^>]*>/gi, '');

    // 4. 표 등에서 줄바꿈이 파괴되지 않도록 <br>과 섞인 실제 줄바꿈(\n)을 제거하고 <br>로 통일합니다.
    // 사용자의 요청대로 <br>\n\n<br> 형태는 <br><br>로 보존하여 문단 간격을 유지합니다.
    sanitized = sanitized.replace(/<br\s*\/?>\s*[\r\n]+\s*<br\s*\/?>/gi, '<br><br>');
    sanitized = sanitized.replace(/<br\s*\/?>\s*[\r\n]+/gi, '<br>');
    sanitized = sanitized.replace(/[\r\n]+\s*<br\s*\/?>/gi, '<br>');

    // 불필요한 다중 줄바꿈 정리 (3개 이상의 줄바꿈을 2개로)
    sanitized = sanitized.replace(/\n{3,}/g, '\n\n');

    // Auto-convert TSV to Markdown Table
    if (sanitized.includes('\t') && sanitized.includes('\n') && !sanitized.includes('|')) {
      const lines = sanitized.split('\n');
      const isTable = lines.some(line => line.includes('\t'));

      if (isTable) {
        const mdLines = lines.map((line, index) => {
          if (!line.trim()) return line;
          const cells = line.split('\t').map(cell => cell.trim());
          const row = '| ' + cells.join(' | ') + ' |';

          if (index === 0) {
            const separator = '|' + cells.map(() => '---').join('|') + '|';
            return row + '\n' + separator;
          }
          return row;
        });
        sanitized = mdLines.join('\n');
      }
    }

    return sanitized;
  };

  const fixMarkdownTable = (text: string) => {
    if (!text.includes('|')) return text;

    const lines = text.split('\n');
    const result: string[] = [];
    let currentRow = '';
    let inTable = false;

    for (const line of lines) {
      const trimmed = line.trim();

      if (!inTable && trimmed.startsWith('|')) {
        inTable = true;
      }

      if (inTable) {
        if (trimmed === '' && currentRow === '') {
          inTable = false;
          result.push(line);
          continue;
        }

        if (currentRow === '') {
          currentRow = line;
        } else {
          if (trimmed === '') {
            currentRow += ' ';
          } else {
            if (!currentRow.trim().endsWith(' ')) {
              currentRow += ' ';
            }
            currentRow += line;
          }
        }

        if (currentRow.trim().endsWith('|')) {
          result.push(currentRow);
          currentRow = '';
        }
      } else {
        result.push(line);
      }
    }

    if (currentRow !== '') {
      result.push(currentRow);
    }

    return result.join('\n');
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
    
    // 💡 다크모드인 경우 뒤의 흰색 배경을 다크모드 전용 배경(#09090b)으로 교체하고, 기본 글자색을 흰색 계통(#e4e4e7)으로 강제 적용합니다.
    const bg = isDarkMode ? '#09090b' : '#ffffff';
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
      /* h2~h6의 font-size는 headingSizeOffset 자동 계산으로 대체 */
      const skipFontSize = ['h2','h3','h4','h5','h6'].includes(tag);
      const entries = Object.entries(ruleObj).filter(([prop, v]) => {
        if (v === '') return false;
        if (skipFontSize && prop === 'font-size') return false;
        // 💡 다크모드일 경우 개별 규칙의 글자색(color) 설정을 무시(생략)하여 강제 지정된 흰색 계통이 원활히 표시되도록 가드합니다.
        if (isDarkMode && prop === 'color') return false;
        return true;
      });
      if (entries.length === 0) return;
      const selector = tag === 'taskList' ? '.task-list-item' :
        tag === 'codeBlock' ? 'pre, code' : tag;
      css += `.custom-preview-container ${selector} {\n`;
      entries.forEach(([prop, val]) => {
        css += `  ${prop}: ${val} !important;\n`;
      });
      css += `}\n`;
    });
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

  const handlers = {
    footnote: () => {
      if (!editorRef.current || typeof window === 'undefined' || !(window as any).monaco) return;
      const editor = editorRef.current;
      const model = editor.getModel();
      if (!model) return;

      const selection = editor.getSelection();
      const position = editor.getPosition();
      if (!position || !selection) return;

      const fullText = model.getValue();
      const footnoteRegex = /\[\^(\d+)\]/g;
      let maxNumber = 0;
      let match;
      while ((match = footnoteRegex.exec(fullText)) !== null) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) {
          maxNumber = num;
        }
      }
      const nextNumber = maxNumber + 1;
      const footnoteRef = `[^${nextNumber}]`;
      const footnoteDef = `\n\n[^${nextNumber}]: `;

      editor.pushUndoStop();
      const Range = (window as any).monaco.Range;
      
      const range = new Range(
        selection.startLineNumber,
        selection.startColumn,
        selection.endLineNumber,
        selection.endColumn
      );
      
      const lineCount = model.getLineCount();
      const lastLineLength = model.getLineLength(lineCount);
      const lastLineRange = new Range(
        lineCount,
        lastLineLength + 1,
        lineCount,
        lastLineLength + 1
      );

      editor.executeEdits("insertFootnote", [
        {
          range: range,
          text: footnoteRef,
          forceMoveMarkers: true
        },
        {
          range: lastLineRange,
          text: footnoteDef,
          forceMoveMarkers: true
        }
      ]);
      editor.pushUndoStop();

      setTimeout(() => {
        const newLineCount = model.getLineCount();
        const newLastLineLength = model.getLineLength(newLineCount);
        editor.setPosition({
          lineNumber: newLineCount,
          column: newLastLineLength + 1
        });
        editor.focus();
      }, 20);
    },
    insertText: (text: string) => {
      if (!editorRef.current) return;
      const position = editorRef.current.getPosition();
      editorRef.current.executeEdits("insertText", [{
        range: new (window as any).monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
        text: text,
        forceMoveMarkers: true
      }]);
      editorRef.current.focus();
    },
    cleanDoc: () => {
      if (!editorRef.current) return;
      const text = editorRef.current.getValue();
      const cleanedText = sanitizePastedText(text);
      if (text !== cleanedText) {
        editorRef.current.pushUndoStop();
        editorRef.current.executeEdits("cleanDoc", [{
          range: editorRef.current.getModel().getFullModelRange(),
          text: cleanedText
        }]);
        editorRef.current.pushUndoStop();
        showToast("문서 내 서식(<br> 태그 등)이 일괄 정리되었습니다.", "success");
      } else {
        showToast("정리할 서식이 없습니다.", "info");
      }
    },
    copyAll: async () => {
      const rawMarkdown = contentRef.current || "";
      if (rawMarkdown) {
        try {
          await navigator.clipboard.writeText(rawMarkdown);
          showToast("에디터의 원본 마크다운 전체 내용이 클립보드에 복사되었습니다.", "success");
        } catch (err) {
          showToast("마크다운 복사에 실패했습니다.", "error");
        }
      } else {
        showToast("복사할 마크다운 내용이 없습니다.", "info");
      }
    },
    newFile: () => {
      updateContent('');
      setCurrentFileName('새 파일.md');
      setCurrentFileNode(null);
      lastSavedContentRef.current = '';
      setIsSidebarOpen(true);
      showToast("새 문서를 시작합니다.", "info");
    },
    openFolder: async () => {
      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        try {
          const file = await (window as any).electronAPI.openFile(rootFolder?.name);
          if (file) {
            updateContent(file.content);
            lastSavedContentRef.current = file.content;
            setCurrentFileName(file.name);
            setCurrentFileNode({ name: file.name, kind: 'file', path: file.path });
            setIsSidebarOpen(true);

            if (editorRef.current) {
              requestAnimationFrame(() => {
                const editor = editorRef.current;
                if (editor) {
                  if (typeof editor.setScrollTop === 'function') {
                    editor.setScrollTop(0);
                  } else if (typeof editor.revealLine === 'function') {
                    editor.revealLine(1);
                  }
                }
              });
            }
            if (previewRef.current) {
              previewRef.current.scrollTop = 0;
            }
            // 선택한 파일의 부모 폴더를 워크스페이스로 자동 설정
            const normalizedPath = file.path.replace(/\\/g, '/');
            const parentPath = normalizedPath.includes('/')
              ? normalizedPath.substring(0, normalizedPath.lastIndexOf('/'))
              : '';
            const osParentPath = parentPath.replace(/\//g, '\\');
            if (osParentPath) {
              setRootFolder({ name: osParentPath });
              setWorkspaceType('local');
              localStorage.setItem('rootFolder', JSON.stringify({ name: osParentPath }));
              localStorage.setItem('workspaceType', 'local');
              await refreshFileList();
            }
            showToast(`'${file.name}' · 워크스페이스 → ${osParentPath || parentPath}`, 'success');
          }
        } catch (err) {
          showToast("파일 열기 실패: " + err, 'error');
        }
      } else if (isAddonEnv && typeof window !== 'undefined' && 'showOpenFilePicker' in window) {
        try {
          const [fileHandle] = await (window as any).showOpenFilePicker({
            types: [{ description: 'Markdown', accept: { 'text/markdown': ['.md', '.markdown', '.txt'] } }],
            multiple: false,
          });
          const file = await fileHandle.getFile();
          const text = await file.text();
          updateContent(text);
          lastSavedContentRef.current = text;
          setCurrentFileName(file.name);
          setCurrentFileNode({ name: file.name, kind: 'file', path: file.name, handle: fileHandle });
          setIsSidebarOpen(true);
          showToast(`'${file.name}' 파일을 열었습니다.`, 'success');
        } catch (err: any) {
          if (err.name !== 'AbortError' && err.name !== 'SecurityError') {
            showToast("파일 열기 실패: " + err, 'error');
          }
        }
      } else {
        showToast("데스크톱 모드(또는 최신 Chrome 브라우저)에서만 사용 가능한 기능입니다.", "warning");
      }
    },
    openWorkspace: () => {
      selectRootFolder('local', null);
    },
    save: async () => {
      const api = (window as any).electronAPI;
      setSaveStatus('saving');

      // 💡 [WBS CORE-02 / 요구사항 4] Ref 백업값을 활용하여 Stale 클로저 덮어쓰기 버그 완벽 방어
      const fileNode = currentFileNodeRef.current;
      const fileName = currentFileNameRef.current;
      const wType = workspaceTypeRef.current;
      const currentVal = contentRef.current; // content 상태 대신 Ref 사용

      // 1. 기존 파일이 이미 디스크/스토리지에 매핑되어 있는 경우 (명확한 덮어쓰기 저장)
      const hasPathOrHandle = fileNode && (fileNode.path || fileNode.handle);
      if (hasPathOrHandle && fileName !== '새 파일.md') {
        if (api) {
          try {
            const success = await api.saveFile(fileNode.path, currentVal);
            if (success) {
              lastSavedContentRef.current = currentVal;
              setSaveStatus('saved');
              showToast("현재 파일에 안전하게 저장되었습니다.", "success");
              return;
            }
          } catch (e) {
            setSaveStatus('unsaved');
            showToast("저장 실패: " + e, 'error');
            return;
          }
        } else if (wType === 'local') {
          try {
            const res = await fetch(getApiUrl('/api/save'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ path: fileNode.path, content: currentVal })
            });
            if (res.ok) {
              lastSavedContentRef.current = currentVal;
              setSaveStatus('saved');
              showToast("현재 파일에 안전하게 저장되었습니다.", "success");
              return;
            }
          } catch (e: any) {
            setSaveStatus('unsaved');
            showToast("저장 실패: " + e.message, 'error');
            return;
          }
        } else if (wType === 'browser') {
          if (fileNode.handle) {
            try {
              const writable = await fileNode.handle.createWritable();
              await writable.write(currentVal);
              await writable.close();
              lastSavedContentRef.current = currentVal;
              setSaveStatus('saved');
              showToast("현재 파일에 안전하게 저장되었습니다.", "success");
              return;
            } catch (e: any) {
              setSaveStatus('unsaved');
              showToast("저장 실패: " + e.message, 'error');
              return;
            }
          } else {
            vfsWriteFile(fileNode.path, currentVal);
            lastSavedContentRef.current = currentVal;
            setSaveStatus('saved');
            showToast("현재 파일에 안전하게 저장되었습니다.", "success");
            return;
          }
        }
      }

      // 2. 새 파일이거나 경로가 매핑되지 않은 완전한 신규 문서인 경우 (대화상자 호출)
      if (api) {
        // === Desktop: OS 저장 대화상자 하나로 파일명+폴더 선택 ===
        try {
          const suggestedName = fileName !== '새 파일.md' ? fileName : undefined;
          const defaultDir = rootFolderRef.current?.name && rootFolderRef.current.name !== '브라우저 스토리지' ? rootFolderRef.current.name : undefined;
          const file = await api.saveFileAs(currentVal, suggestedName, defaultDir);
          if (file) {
            const normalizedPath = file.path.replace(/\\/g, '/');
            const parentPath = normalizedPath.includes('/')
              ? normalizedPath.substring(0, normalizedPath.lastIndexOf('/'))
              : '';
            const osParentPath = parentPath.replace(/\//g, '\\');
            setRootFolder({ name: osParentPath });
            setWorkspaceType('local');
            localStorage.setItem('rootFolder', JSON.stringify({ name: osParentPath }));
            localStorage.setItem('workspaceType', 'local');
            setCurrentFileName(file.name);
            setCurrentFileNode({ name: file.name, kind: 'file', path: file.path });
            lastSavedContentRef.current = currentVal;
            setSaveStatus('saved');
            await refreshFileList();
            showToast(`'${file.name}' 저장 완료 · 워크스페이스 → ${osParentPath}`, 'success');
          } else {
            setSaveStatus('unsaved');
          }
        } catch (e) {
          setSaveStatus('unsaved');
          showToast("저장 실패: " + e, 'error');
        }
      } else if (typeof (window as any).showSaveFilePicker === 'function') {
        // === Addon/Browser: OS 표준 파일 저장 대화상자 (사용자가 직접 폴더 이동 및 파일명 설정) ===
        try {
          const suggestedName = fileName !== '새 파일.md' ? fileName : 'untitled.md';

          // 💡 현재 파일의 부모 핸들이 존재한다면 해당 경로에서 대화상자가 시작되도록 startIn 속성 결속
          let startIn: any = undefined;
          if (currentFileParentHandleRef.current) {
            startIn = currentFileParentHandleRef.current;
          } else if (fileNode?.handle) {
            startIn = fileNode.handle;
          } else if (rootFolderRef.current?.handle) {
            startIn = rootFolderRef.current.handle;
          }

          const fileHandle = await (window as any).showSaveFilePicker({
            suggestedName,
            excludeAcceptAllOption: true,
            startIn,
            types: [{
              description: 'Markdown Files (*.md)',
              accept: {
                'text/markdown': ['.md', '.markdown'],
                'text/plain': ['.md', '.markdown']
              }
            }]
          });

          const writable = await fileHandle.createWritable();
          await writable.write(currentVal);
          await writable.close();

          setCurrentFileName(fileHandle.name);
          setCurrentFileNode({ name: fileHandle.name, kind: 'file', handle: fileHandle });
          lastSavedContentRef.current = currentVal;
          setSaveStatus('saved');
          await refreshFileList();
          showToast(`'${fileHandle.name}' 파일이 저장되었습니다.`, 'success');
        } catch (e: any) {
          if (e.name !== 'AbortError') {
            setSaveStatus('unsaved');
            showToast("저장 실패: " + e.message, 'error');
          } else {
            setSaveStatus('unsaved');
          }
        }
      } else if (typeof (window as any).showDirectoryPicker === 'function') {
        // === Fallback: showDirectoryPicker (showSaveFilePicker 미지원 시) ===
        try {
          const dirHandle = await (window as any).showDirectoryPicker();
          const folderName = dirHandle.name;
          setRootFolder({ name: folderName, handle: dirHandle });
          setWorkspaceType('browser');
          localStorage.setItem('rootFolder', JSON.stringify({ name: folderName }));
          localStorage.setItem('workspaceType', 'browser');
          setSaveStatus('unsaved');
          showToast(`워크스페이스가 '${folderName}'(으)로 설정됨`, 'success');
          setPromptConfig({
            isOpen: true,
            title: '파일명 입력',
            defaultValue: fileName === '새 파일.md' ? 'untitled.md' : fileName,
            type: 'createFile',
            error: ""
          });
        } catch (e: any) {
          if (e.name !== 'AbortError') {
            setSaveStatus('unsaved');
            showToast("폴더 선택 실패", 'error');
          } else {
            setSaveStatus('unsaved');
          }
        }
      } else {
        // VFS fallback: PromptModal
        setPromptConfig({
          isOpen: true,
          title: '새 파일 생성',
          defaultValue: fileName,
          type: 'createFile',
          error: ""
        });
        setSaveStatus('unsaved');
      }
    },

    saveAs: async () => {
      const api = (window as any).electronAPI;
      const fileName = currentFileNameRef.current;
      const fileNode = currentFileNodeRef.current;
      const rootFld = rootFolderRef.current;
      const currentVal = contentRef.current; // Stale 클로저 버그 방어

      const suggestedName = fileName !== '새 파일.md' ? fileName : undefined;
      const defaultDir = rootFld?.name && rootFld.name !== '브라우저 스토리지' ? rootFld.name : undefined;

      setSaveStatus('saving');

      if (api) {
        // === Desktop (Electron): showSaveDialog (워크스페이스 폴더부터 열림) → 워크스페이스 변경 ===
        try {
          const file = await api.saveFileAs(currentVal, suggestedName, defaultDir);
          if (file) {
            const normalizedPath = file.path.replace(/\\/g, '/');
            const parentPath = normalizedPath.includes('/')
              ? normalizedPath.substring(0, normalizedPath.lastIndexOf('/'))
              : '';
            const osParentPath = parentPath.replace(/\//g, '\\');
            setRootFolder({ name: osParentPath });
            setWorkspaceType('local');
            localStorage.setItem('rootFolder', JSON.stringify({ name: osParentPath }));
            localStorage.setItem('workspaceType', 'local');
            setCurrentFileName(file.name);
            setCurrentFileNode({ name: file.name, kind: 'file', path: file.path });
            lastSavedContentRef.current = currentVal;
            setSaveStatus('saved');
            await refreshFileList();
            showToast(`'${file.name}' 저장 완료`, 'success');
          } else {
            setSaveStatus('unsaved');
          }
        } catch (e) {
          setSaveStatus('unsaved');
          showToast("저장 실패: " + e, 'error');
        }
      } else if (typeof (window as any).showSaveFilePicker === 'function') {
        // === Addon/Browser: 다른 이름으로 저장 (OS 표준 대화상자) ===
        try {
          // 💡 현재 파일의 부모 핸들이 존재한다면 해당 경로에서 대화상자가 시작되도록 startIn 속성 결속
          let startIn: any = undefined;
          if (currentFileParentHandleRef.current) {
            startIn = currentFileParentHandleRef.current;
          } else if (fileNode?.handle) {
            startIn = fileNode.handle;
          } else if (rootFld?.handle) {
            startIn = rootFld.handle;
          }

          const fileHandle = await (window as any).showSaveFilePicker({
            suggestedName: suggestedName || 'untitled.md',
            excludeAcceptAllOption: true,
            startIn,
            types: [{
              description: 'Markdown Files (*.md)',
              accept: {
                'text/markdown': ['.md', '.markdown'],
                'text/plain': ['.md', '.markdown']
              }
            }]
          });

          const writable = await fileHandle.createWritable();
          await writable.write(currentVal);
          await writable.close();

          setCurrentFileName(fileHandle.name);
          setCurrentFileNode({ name: fileHandle.name, kind: 'file', handle: fileHandle });
          lastSavedContentRef.current = currentVal;
          setSaveStatus('saved');
          await refreshFileList();
          showToast(`'${fileHandle.name}' 파일이 저장되었습니다.`, 'success');
        } catch (e: any) {
          if (e.name !== 'AbortError') {
            setSaveStatus('unsaved');
            showToast("저장 실패: " + e.message, 'error');
          } else {
            setSaveStatus('unsaved');
          }
        }
      } else if (typeof (window as any).showDirectoryPicker === 'function') {
        // === Fallback: showDirectoryPicker ===
        try {
          const dirHandle = await (window as any).showDirectoryPicker();
          const folderName = dirHandle.name;
          setRootFolder({ name: folderName, handle: dirHandle });
          setWorkspaceType('browser');
          localStorage.setItem('rootFolder', JSON.stringify({ name: folderName }));
          localStorage.setItem('workspaceType', 'browser');
          setSaveStatus('unsaved');
          showToast(`워크스페이스가 '${folderName}'(으)로 변경됨`, 'info');
          setPromptConfig({
            isOpen: true,
            title: '파일명 입력',
            defaultValue: suggestedName || '',
            type: 'createFile',
            error: ""
          });
        } catch (e: any) {
          if (e.name !== 'AbortError') {
            setSaveStatus('unsaved');
            showToast("저장 실패: " + (e.message || e), 'error');
          } else {
            setSaveStatus('unsaved');
          }
        }
      } else {
        // VFS fallback
        setPromptConfig({
          isOpen: true,
          title: "다른 이름으로 저장",
          defaultValue: fileName,
          type: 'createFile',
          error: ""
        });
        setSaveStatus('unsaved');
      }
    },
    openExport: () => setIsExportModalOpen(true),
    exportPDF: async () => {
      if (!previewRef.current) return;
      await exportPDF({ previewEl: previewRef.current, currentFileName, isDarkMode, showToast });
    },
    exportHTML: async () => {
      if (!previewRef.current) return;
      await exportHTML({ previewEl: previewRef.current, currentFileName, isDarkMode, showToast });
    },
    exportEPUB: async () => {
      if (!previewRef.current) return;
      await exportEPUB({ previewEl: previewRef.current, currentFileName, isDarkMode, showToast });
    },
    exportPNG: async () => {
      if (!previewRef.current) return;
      await exportPNG({ previewEl: previewRef.current, currentFileName, isDarkMode, showToast });
    },
    exit: () => window.confirm("종료하시겠습니까?") && window.close(),
    undo: () => editorRef.current?.trigger('keyboard', 'undo', null),
    redo: () => editorRef.current?.trigger('keyboard', 'redo', null),
    find: () => editorRef.current?.getAction('actions.find').run(),
    replace: () => editorRef.current?.getAction('editor.action.startFindReplaceAction').run(),
    bold: () => wrapSelection('**', '**', '텍스트'),
    italic: () => wrapSelection('*', '*', '텍스트'),
    inlineCode: () => wrapSelection('`', '`', '코드'),
    strikethrough: () => wrapSelection('~~', '~~', '텍스트'),
    h1: () => wrapSelection('# ', '', '제목'),
    h2: () => wrapSelection('## ', '', '제목'),
    h3: () => wrapSelection('### ', '', '제목'),
    h4: () => wrapSelection('#### ', '', '제목'),
    h5: () => wrapSelection('##### ', '', '제목'),
    h6: () => wrapSelection('###### ', '', '제목'),
    hr: () => insertAtCursor('\n---\n'),
    orderedList: () => applyLinePrefix('orderedList'),
    list: () => applyLinePrefix('list'),
    quote: () => applyLinePrefix('quote'),
    check: () => applyLinePrefix('check'),
    removePrefix: () => removePrefix(),
    link: () => insertLink(),
    taglink: () => setShowTagLinkPicker(prev => !prev),
    image: () => setIsImageModalOpen(true),
    video: () => setIsYoutubeModalOpen(true),
    youtube: () => setIsYoutubeModalOpen(true),
    now: () => insertAtCursor(new Date().toLocaleString()),
    map: () => setIsMapModalOpen(true),
    table: () => setIsTableModalOpen(true),
    quickTable: () => insertAtCursor('| 구분 | 데이터 1 | 데이터 2 |\n| --- | --- | --- |\n| 항목A | 100 | 200 |\n| 항목B | 300 | 400 |\n'),
    insertTableRow: () => {
      // 💡 [한글 주석] 현재 커서가 위치한 표 아래에 새 빈 행 추가 및 포커스 이동
      if (!editorRef.current) return;
      const editor = editorRef.current;
      const position = editor.getPosition();
      if (!position) return;
      const model = editor.getModel();
      if (!model) return;

      const lineText = model.getLineContent(position.lineNumber);
      const trimmed = lineText.trim();
      if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) {
        showToast("커서가 표 행에 위치해야 행을 추가할 수 있습니다.", "warning");
        return;
      }

      const cells = trimmed.split(/(?<!\\)\|/);
      const cellCount = cells.length - 2;

      if (cellCount < 1) return;

      const newRowText = '\n|' + '  |'.repeat(cellCount);
      const lineMaxColumn = model.getLineMaxColumn(position.lineNumber);
      const Range = (window as any).monaco.Range;
      const Selection = (window as any).monaco.Selection;

      editor.executeEdits("insertTableRow", [{
        range: new Range(position.lineNumber, lineMaxColumn, position.lineNumber, lineMaxColumn),
        text: newRowText,
        forceMoveMarkers: true
      }]);

      const nextLineNumber = position.lineNumber + 1;
      editor.setSelection(new Selection(
        nextLineNumber, 3,
        nextLineNumber, 3
      ));
      editor.focus();
      showToast("표 행이 추가되었습니다.", "info");
    },
    deleteTableRow: () => {
      // 💡 [한글 주석] 현재 커서가 위치한 표 행 삭제
      if (!editorRef.current) return;
      const editor = editorRef.current;
      const position = editor.getPosition();
      if (!position) return;
      const model = editor.getModel();
      if (!model) return;

      const lineText = model.getLineContent(position.lineNumber);
      const trimmed = lineText.trim();
      if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) {
        showToast("커서가 표 행에 위치해야 행을 삭제할 수 있습니다.", "warning");
        return;
      }

      const maxColumn = model.getLineMaxColumn(position.lineNumber);
      let startLine = position.lineNumber;
      let startColumn = 1;
      let endLine = position.lineNumber;
      let endColumn = maxColumn;

      if (position.lineNumber < model.getLineCount()) {
        endLine = position.lineNumber + 1;
        endColumn = 1;
      } else if (position.lineNumber > 1) {
        startLine = position.lineNumber - 1;
        startColumn = model.getLineMaxColumn(startLine);
      }

      const Range = (window as any).monaco.Range;
      editor.executeEdits("deleteTableRow", [{
        range: new Range(startLine, startColumn, endLine, endColumn),
        text: "",
        forceMoveMarkers: true
      }]);

      editor.focus();
      showToast("표 행이 삭제되었습니다.", "info");
    },
    code: () => insertBlockTag('```javascript', '```', '코드'),
    chart: () => insertBlockTag('```mermaid', '```', '그래프'),
    math: () => setIsFormulaModalOpen(true),
    latex: () => setIsFormulaModalOpen(true),
    zoomIn: () => setFontSize(prev => Math.min(prev + 2, 32)),
    zoomOut: () => setFontSize(prev => Math.max(prev - 2, 12)),
    globalSearch: () => setIsSearchOpen(true),
    settings: (tab: 'editor' | 'app' | 'shortcuts' = 'editor') => {
      setSettingsModalInitialTab(tab);
      setIsSettingsModalOpen(true);
    },
    about: () => setIsAboutModalOpen(true),
    updates: () => setIsUpdatesModalOpen(true),
    toggleFloatingToolbar: () => {
      setFloatingToolbar(prev => {
        if (prev.visible) return { ...prev, visible: false };
        if (editorRef.current) {
          const editor = editorRef.current;
          // 💡 데스크톱 모드(Electron) 등에서 포커스 유실로 인한 1행 1열(최상단) 좌표 리셋을 방어하기 위해 포커스 강제 복구
          editor.focus();
          const position = editor.getPosition();
          if (position) {
            const visiblePos = editor.getScrolledVisiblePosition(position);
            if (visiblePos) {
              return { visible: true, top: Math.max(0, visiblePos.top - 10), left: visiblePos.left };
            }
          }
        }
        return { visible: true, top: 100, left: 100 }; // fallback
      });
    },
    quickWrap: (format: 'h1' | 'h2' | 'h3' | 'quote' | 'code') => quickWrap(format),
  };

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
      case 'OPEN_FILE': handlers.openFolder(); return;
      case 'OPEN_WORKSPACE': handlers.openWorkspace(); return;
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
      case 'UPDATES': handlers.updates(); return;
      case 'TOGGLE_FLOATING_TOOLBAR': handlers.toggleFloatingToolbar(); return;
      case 'CLEAN_DOC': handlers.cleanDoc(); return;
      case 'COPY_ALL': handlers.copyAll(); return;
      // 🎯 TOOLBAR_ITEMS '푸터' 그룹 토글 명령어 (handlers에 없으므로 직접 상태 변환)
      case 'TOGGLE_TOOLBAR': setIsToolbarOpen(prev => !prev); return;
      case 'TOGGLE_SIDEBAR': setIsSidebarOpen(prev => !prev); return;
      case 'TOGGLE_MODE':
        setPreviewMode(prev => {
          if (prev === 'edit') return 'both';
          if (prev === 'both') return 'preview';
          if (prev === 'preview') return 'css-style';
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
        setPreviewMode(prev => prev === 'css-style' ? 'both' : 'css-style');
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
      strikethrough: 'STRIKETHROUGH',
      h1: 'H1', h2: 'H2', h3: 'H3', h4: 'H4', h5: 'H5', h6: 'H6',
      divider: 'HR',        // id는 divider이지만 커맨드는 HR
      orderedList: 'ORDERED_LIST',
      list: 'LIST',
      quote: 'QUOTE',
      checklist: 'CHECKLIST',
      clear: 'REMOVE_PREFIX',  // id는 clear이지만 커맨드는 REMOVE_PREFIX
      cleanDoc: 'CLEAN_DOC',
      link: 'LINK',
      taglink: 'TAGLINK',
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
      'css-style': 'TOGGLE_CSS_STYLE',
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
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyS],
      run: () => {
        dispatchCommand('SAVE_AS');
      }
    });
    hotkeyDisposablesRef.current.push(saveAsAction);
  }, [customHotkeys, isEditorReady, dispatchCommand, mapIdToCommandType]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Escape: 플로팅 툴바 숨김 또는 태그링크 선택기 닫기 (에디터 포커스 무관)
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
      if (isCtrl && !isAlt) {
        const keyUpper = e.key.toUpperCase();
        if (keyUpper === 'S') {
          e.preventDefault();
          e.stopPropagation();
          if (isShift) {
            dispatchCommand('SAVE_AS');
          } else {
            dispatchCommand('SAVE');
          }
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
        onThemeChange={handleThemeChange}
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
          selectedMergeNodes={selectedMergeNodes}
          toggleMergeNodeSelect={toggleMergeNodeSelect}
          onSelectRootFolder={() => selectRootFolder('local', null)}
          onRestoreFolder={restoreFolderPermission}
        />

        <main className="flex flex-1 flex-col overflow-hidden bg-white dark:bg-zinc-950">
          {isToolbarOpen && (
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
          )}
          <div className="flex flex-1 overflow-hidden">
            {previewMode === 'css-style' ? (
              <CssStyleForm
                profiles={profiles}
                activeProfileId={activeProfileId}
                onSelectProfile={setActiveProfileId}
                onUpdateProfile={(updated) => setProfiles(prev =>
                  prev.map(p => p.id === updated.id ? updated : p)
                )}
                /*
                 * onAddProfile — 새 CssProfile 생성:
                 * DEFAULT_PROFILE의 구조를 복제하되 id/id/name/rules를 재할당
                 * (rules는 JSON parse/stringify로 깊은 복사하여 참조 분리)
                 * 생성 직후 새 프로필로 자동 전환
                 */
                onAddProfile={() => {
                  const newId = 'profile-' + Date.now();
                  const count = profiles.filter(p => p.id !== 'default').length + 1;
                  setProfiles(prev => [...prev, {
                    ...DEFAULT_PROFILE,
                    id: newId,
                    name: `나만의 서식 ${count}`,
                    rules: JSON.parse(JSON.stringify(DEFAULT_PROFILE.rules)),
                  }]);
                  setActiveProfileId(newId);
                }}
                /*
                 * onDeleteProfile — 프로필 삭제:
                 * profiles 배열에서 해당 id 제거
                 * 현재 보고 있던 프로필이 삭제되면 DEFAULT_PROFILE로 전환
                 */
                onDeleteProfile={(id) => {
                  setProfiles(prev => prev.filter(p => p.id !== id));
                  if (activeProfileId === id) {
                    setActiveProfileId(DEFAULT_PROFILE.id);
                  }
                }}
                onClose={() => setPreviewMode('both')}
              />
            ) : previewMode !== 'preview' && (
              <div className="flex-1 min-w-0 h-full relative border-r border-black/5 dark:border-white/5">
                <Editor
                  height="100%"
                  language="markdown"
                  theme={themePalette}
                  // 💡 value={content} 속성을 배제하고 defaultValue를 적용하여
                  // React 상태 갱신 시 모나코 내부의 불필요한 setValue 호출로 인한 한글 composition 깨짐 및 중복 입력을 원천 방어합니다.
                  defaultValue={content}
                  onChange={(val) => {
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
                    // 마운트 시 최신 content 내용을 에디터 버퍼에 안전하게 동기화
                    editor.setValue(contentRef.current);
                    if (typeof window !== 'undefined') {
                      (window as any).monaco = monaco;
                    }

                    // 🔒 [에디터 레이아웃 영점 가드] 하단 공백 소멸 및 상단 짤림 버그 진압
                    editor.updateOptions({
                      scrollBeyondLastLine: false,
                      padding: { top: 4, bottom: 4 },
                      automaticLayout: true,
                      
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
                    
                    // 💡 [IME-blur] 포커스 아웃 시 작성 중이던 마지막 글자 유실 버그 방어 (이중 입력 방지 가드 탑재)
                    editor.onDidBlurEditorText(() => {
                      if (previewDebounceRef.current) {
                        clearTimeout(previewDebounceRef.current);
                        previewDebounceRef.current = null;
                        const latestVal = editor.getValue();
                        setContent(latestVal);
                      }
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
                            text: "  "
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
                    editor.onDidChangeCursorPosition((e) => {
                      setActiveLine(e.position.lineNumber);
                      setCursorLine(e.position.lineNumber);
                      setCursorColumn(e.position.column);

                      // 💡 표(Table) 영역 이탈 시 자동 정렬 수행
                      const currentLine = e.position.lineNumber;
                      const prevLine = prevCursorLineRef.current;
                      prevCursorLineRef.current = currentLine;

                      if (prevLine && prevLine !== currentLine) {
                        const model = editor.getModel();
                        if (model) {
                          const prevLineContent = model.getLineContent(prevLine);
                          const currentLineContent = model.getLineContent(currentLine);
                          if (isTableLine(prevLineContent) && (!isTableLine(currentLineContent) || Math.abs(currentLine - prevLine) > 1)) {
                            // 스크롤 및 렌더링 간섭을 차단하기 위해 비동기 틱으로 정렬 수행
                            setTimeout(() => {
                              formatTableBlock(editor, prevLine);
                            }, 50);
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

                    editor.onMouseDown((e) => {
                      // 🔥 마우스 클릭 시 자동완성 팝업 즉시 닫기
                      // 다른 행 클릭 시 이전 입력 버퍼 잔재로 팝업이 엉뚱한 위치에 뜨는 현상 방지
                      editor.trigger('mouse', 'hideSuggestWidget', {});

                      setTimeout(() => {
                        const position = editor.getPosition();
                        if (!position) return;
                        const clickedLine = position.lineNumber;

                        if (previewRef.current && isScrollingRef.current !== 'editor') {
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

                    editor.onDidScrollChange((scrollEvent) => {
                      if (!previewRef.current) return;
                      const editor = editorRef.current;
                      if (!editor) return;

                      const scrollTop = editor.getScrollTop();

                      // [WBS SYNC-03] 스크롤탑이 절대 영점(0)인 경우, 락 상태나 isSender 분기 이전에 
                      // 0점 스냅 자석 연동을 최우선 실행하고 조기 종료하여 1줄 잘림을 원천 차단
                      if (scrollTop === 0) {
                        previewRef.current.scrollTo({ top: 0, behavior: 'auto' });
                        return; // 최우선 실행 후 즉시 복귀
                      }

                      // 💡 [요구사항 3 / SYNC-03] 에디터 마우스 오버 상태이거나 에디터가 키보드 포커싱된 상황일 때만 스크롤 송신 허용 (관성 튕김 방지)
                      const isSender = isEditorHovered.current || editor.hasTextFocus();
                      if (!isSender || previewModeRef.current !== 'both') return;

                      isScrollingRef.current = 'editor';
                      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                      scrollTimeoutRef.current = setTimeout(() => { isScrollingRef.current = null; }, 50);
                      const scrollHeight = editor.getScrollHeight();
                      const layoutInfo = editor.getLayoutInfo();
                      const visibleRanges = editor.getVisibleRanges();

                      // 2. 최하단 감지 (30px 마진 또는 스크롤 비율 98% 이상일 때 강제 하단 스냅하여 대용량 문서 스냅 깨짐 해결)
                      const isAtBottom = (scrollTop + layoutInfo.height >= scrollHeight - 30) || 
                                         (scrollHeight - layoutInfo.height > 0 && scrollTop / (scrollHeight - layoutInfo.height) >= 0.98);
                      if (isAtBottom) {
                        previewRef.current.scrollTo({ top: previewRef.current.scrollHeight, behavior: 'auto' });
                        return;
                      }

                      // 3. 중간범위: requestAnimationFrame으로 preview DOM 갱신 대기 후 data-line 정합
                      requestAnimationFrame(() => {
                        if (!previewRef.current || !editorRef.current) return;
                        const pv = previewRef.current;
                        const ed = editorRef.current;
                        const vr = ed.getVisibleRanges();
                        if (vr.length === 0) return;

                        const topVisibleLine = vr[0].startLineNumber;
                        const targetElement = pv.querySelector(`[data-line="${topVisibleLine}"]`) as HTMLElement | null;

                        if (targetElement) {
                          if (topVisibleLine <= 3 && scrollEvent.scrollTopChanged) {
                            pv.scrollTo({ top: 0, behavior: 'auto' });
                          } else {
                            const containerTop = pv.getBoundingClientRect().top;
                            const elementTop = targetElement.getBoundingClientRect().top;
                            const targetScrollTop = pv.scrollTop + (elementTop - containerTop) - 20;
                            pv.scrollTo({ top: Math.max(0, targetScrollTop), behavior: 'auto' });
                          }
                        } else {
                          if (topVisibleLine <= 3) {
                            pv.scrollTo({ top: 0, behavior: 'auto' });
                          } else {
                            const editorContentHeight = scrollHeight - layoutInfo.height;
                            if (editorContentHeight > 0) {
                              const pct = scrollTop / editorContentHeight;
                              const previewContentHeight = pv.scrollHeight - pv.clientHeight;
                              pv.scrollTo({ top: Math.min(pct * previewContentHeight, pv.scrollHeight), behavior: 'auto' });
                            }
                          }
                        }
                      });
                      });

                    }}
                      options={{
                    padding: { top: 4, bottom: 4 },
                    scrollBeyondLastLine: false,
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
                    quickSuggestions: { other: true, comments: true, strings: true },  // 일반 단어 타이핑 시에도 IntelliSense 팝업
                    suggestOnTriggerCharacters: true,
                    // Enter/Tab 수락은 커스텀 핸들러에서 처리 (리스트 자동완성과 충돌 방지)
                    acceptSuggestionOnEnter: 'on',
                    tabCompletion: 'on',
                    fixedOverflowWidgets: true,
                    renderValidationDecorations: 'on',
                    matchBrackets: 'always',
                    wordBasedSuggestions: "allDocuments",  // 현재 문서의 모든 단어를 학습해 추천 풀 생성  // 자동완성 팝업을 최상위 레이어로 올려서 클릭 이벤트 정상 전달
                    renderLineHighlight: 'all',
                    tabSize: 4,
                    detectIndentation: true,
                    insertSpaces: false,
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
                    {(() => {
                      return (
                        <div className="flex flex-row items-center gap-3 min-w-max">
                          {/* 서식 */}
                          <div className="flex flex-row items-center gap-0.5">
                            <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('BOLD'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px] font-black" title="굵게">B</button>
                            <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('ITALIC'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px] italic font-serif" title="기울임">I</button>
                            <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('INLINE_CODE'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="인라인 코드">{'</>'}</button>
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
                            <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('TAGLINK'); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="태그링크">🔖</button>
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
                    헤딩 선택
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

            {previewMode !== 'edit' && (
              <div
                ref={previewRef}
                className={`flex-1 h-[calc(100vh-64px)] px-8 pt-10 pb-32 print:h-auto print:overflow-visible prose prose-sm md:prose-base dark:prose-invert max-w-none custom-preview-container bg-white dark:bg-zinc-950 ${previewMode === 'both' || previewMode === 'css-style' ? 'overflow-y-auto no-scrollbar' : 'overflow-y-auto'
                  }`}
                style={{ width: previewMode === 'preview' ? '100%' : '50%' }}
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

                  const elements = Array.from(target.querySelectorAll('[data-line]')) as HTMLElement[];

                  let targetLine = -1;
                  for (const el of elements) {
                    const rect = el.getBoundingClientRect();
                    const containerRect = target.getBoundingClientRect();
                    if (rect.top >= containerRect.top) {
                      const lineStr = el.getAttribute('data-line');
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
                        content={processedContent}
                        originalContent={content}
                        lineMap={lineMap}
                        onCheckboxToggle={handleCheckboxToggle}
                        currentFilePath={currentFileNode?.path}
                        onFileOpen={handleFileOpenByPath}
                        orientation={activeProfile.pageStyle.orientation as 'portrait' | 'landscape'}
                        marginTop={activeProfile.pageStyle.marginTop}
                        marginBottom={activeProfile.pageStyle.marginBottom}
                        marginLeft={activeProfile.pageStyle.marginLeft}
                        marginRight={activeProfile.pageStyle.marginRight}
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
            )}
          </div>

          <StatusBar
            content={content}
            fileName={currentFileName}
            folderName={rootFolder?.name}
            driveLetter={driveLetter}
            workspaceType={workspaceType}
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
            onThemeChange={handleThemeChange}
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
        quoteStyle={quoteStyle} setQuoteStyle={setQuoteStyle}

        customHotkeys={customHotkeys} setCustomHotkeys={setCustomHotkeys}
        customSlashCommands={customSlashCommands} setCustomSlashCommands={setCustomSlashCommands}
        licenseKey={licenseKey} setLicenseKey={setLicenseKey}
        themePalette={themePalette}
        onThemeChange={handleThemeChange}
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
        onConfirm={() => {
          confirmConfig.onConfirm();
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
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
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onInsert={(path, alt) => insertAtCursor(`![${alt}](${path})`)}
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
