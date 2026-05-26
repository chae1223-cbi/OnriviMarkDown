"use client";

import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import MarkdownViewer from '../components/MarkdownViewer';
import Script from 'next/script';
import 'katex/dist/katex.min.css';
import {
  PanelLeft as SidebarIcon, FileText, Copy, Check, Folder, Plus, FolderPlus, Edit2,
  ChevronRight, ChevronDown, FileJson, FileCode, FileType, File, Trash2,
  Layers, X
} from 'lucide-react';

import { useToast } from '@/components/ToastProvider';
import { getApiUrl } from '@/lib/api';
import { exportPDF, exportHTML, exportEPUB, exportPNG } from '@/lib/exportHandlers';

import { idb, FileNode, scanDirectory, getFileIcon } from '@/lib/helper';
import { preprocessMarkdownForPreview } from "@/lib/editorUtils";
import { getSlashCommands, getDefaultHotkeys, getDefaultCommands, TOOLBAR_ITEMS } from "@/lib/toolbarConfig";
import { getVfsFiles, vfsReadFile, vfsWriteFile, vfsCreateFile, vfsCreateFolder } from '@/lib/vfsHelper';
import ColorText from '@/components/ColorText';
import FileTreeItem from '@/components/FileTreeItem';
import CopyButton from '@/components/CopyButton';
import ExportModal from '@/components/ExportModal';
import OAIcon from './icon_onriveauther.png';

// 분리된 컴포넌트들 임포트
import MenuBar from '@/components/MenuBar';
import Toolbar from '@/components/Toolbar';
import StatusBar from '@/components/StatusBar';
import ImageModal from '@/components/ImageModal';
import MapModal from '@/components/MapModal';
import TableModal from '@/components/TableModal';
import SettingsModal from '@/components/SettingsModal';
import PromptModal from '@/components/PromptModal';
import GlobalSearch from '@/components/GlobalSearch';
import LeftSidebar from '@/components/LeftSidebar';
import ConfirmModal from '@/components/ConfirmModal';
import FormulaModal from '@/components/FormulaModal';
import EmojiPicker from '@/components/EmojiPicker';
import MergeModal from '@/components/MergeModal';
import YoutubeModal from '@/components/YoutubeModal';
import AboutModal from '@/components/AboutModal';
import AIGeneratorPanel from '@/components/AIGeneratorPanel';
import WritingAssistant from '@/components/WritingAssistant';

// 모듈 레벨 Monaco 설정: 컴포넌트 렌더 전에 loader 경로 확정 (레이스 컨디션 방지)
if (typeof window !== 'undefined') {
  const addonQuery = new URLSearchParams(window.location.search).get('env') === 'addon';
  const addonRuntime = !!((window as any).chrome?.runtime?.id);
  if (addonQuery || addonRuntime) {
    const getExtensionUrl = (relativePath: string) => {
      if (typeof (window as any).chrome?.runtime?.getURL === 'function') {
        return (window as any).chrome.runtime.getURL(relativePath);
      }
      return relativePath;
    };
    (window as any).MonacoEnvironment = {
      getWorkerUrl: function (_moduleId: string, label: string) {
        if (label === 'json') return getExtensionUrl('/monaco-editor/min/vs/language/json/json.worker.js');
        if (label === 'css') return getExtensionUrl('/monaco-editor/min/vs/language/css/css.worker.js');
        if (label === 'html') return getExtensionUrl('/monaco-editor/min/vs/language/html/html.worker.js');
        if (label === 'typescript' || label === 'javascript') return getExtensionUrl('/monaco-editor/min/vs/language/typescript/ts.worker.js');
        return getExtensionUrl('/monaco-editor/min/vs/editor/editor.worker.js');
      }
    };
    try {
      const vsPath = getExtensionUrl('/monaco-editor/min/vs');
      loader.config({ paths: { vs: vsPath } });
    } catch (err) {
      console.error("Monaco loader configuration error:", err);
    }
  }
}

const INITIAL_TEXT = `# Onrivi Author: 일상의 기록이 출판이 되고 가치가 되는 순간

> "당신의 생각은 소중합니다. 우리는 그 생각을 가장 아름답고 머물 만한 공간으로 만듭니다."

![Hero Image](./hero.png)

### 따뜻하고 포근한 햇살 아래, 당신만의 기록 보관소
**Onrivi Author**는 복잡한 기술을 넘어, 당신의 아이디어가 방해받지 않고 기록될 수 있는 평화롭고 포근한 집안 환경을 지향합니다.

---

### 영혼을 담은 글쓰기 (Writing with Heart and Soul)

#### 하나. 편안한 집안 경험
가장 친숙하고 강력한 편집기를 통해, 마치 종이 위에 펜을 굴리듯 매끄럽게 당신의 생각을 써 내려가 보세요. 당신의 손끝에서 태어나는 모든 단어는 실시간으로 아름다운 문서가 됩니다.

#### 둘. 시간의 흐름을 따르는 동기화
당신의 글을 쓰는 리듬에 맞춰 미리보기 창이 부드럽게 따라옵니다. 기술은 뒤로 숨고, 오직 당신의 글과 결과물과의 대화에만 시간을 선물합니다.

#### 셋. 잊힌 기억을 찾아주는 지능형 검색
수개월 전에 적어두었던 한 줄의 생각이나 단어가 떠오르지 않을 때, \`Ctrl + Shift + F\`를 눌러보세요. 당신의 워크스페이스 전체를 샅샅이 뒤져 잊고 있던 소중한 기록을 찾아드립니다.

---

![Lifestyle Workspace](https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80)

### 당신의 진심을 세상에 전하는 방법
정성스럽게 작성한 글을 **PDF, HTML, 이미지**로 깔끔하게 담아보세요. 소중한 사람에게, 혹은 더 넓은 세상으로 당신의 목소리를 전할 준비가 되었습니다.

---

#### 시작하는 방법
왼쪽 **탐색기**에서 당신의 기록들을 담을 폴더를 선택하거나, **새 파일**을 만들어 오늘의 첫 문장을 열어보세요.

---
© 2026 Onrivi Studio. *Crafting tools for human expression.*
`;

const resolveRelativeImagePath = (srcPath: string, currentFileNodePath: string | undefined): string => {
  if (!srcPath) return "";

  if (srcPath.startsWith('http://') || srcPath.startsWith('https://') || srcPath.startsWith('data:') || srcPath.startsWith('blob:')) {
    return srcPath;
  }

  let baseFolder = "";
  if (currentFileNodePath) {
    const normalizedFile = currentFileNodePath.replace(/\\/g, '/');
    const lastSlash = normalizedFile.lastIndexOf('/');
    if (lastSlash !== -1) {
      baseFolder = normalizedFile.substring(0, lastSlash);
    }
  }

  let cleanSrc = srcPath.replace(/\\/g, '/');
  if (cleanSrc.startsWith('/')) {
    cleanSrc = cleanSrc.substring(1);
  }
  if (cleanSrc.startsWith('./')) {
    cleanSrc = cleanSrc.substring(2);
  }

  let finalPath = "";
  if (baseFolder) {
    finalPath = baseFolder + '/' + cleanSrc;
  } else {
    finalPath = cleanSrc;
  }

  const segments = finalPath.split('/');
  const stack: string[] = [];
  for (const seg of segments) {
    if (seg === '.' || seg === '') continue;
    if (seg === '..') {
      stack.pop();
    } else {
      stack.push(seg);
    }
  }

  return stack.join('/');
};

export default function Home() {
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [content, setContent] = useState(INITIAL_TEXT);
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const lastSelectionRef = useRef<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isToolbarOpen, setIsToolbarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAddonEnv, setIsAddonEnv] = useState(false);
  const [previewMode, setPreviewMode] = useState<'edit' | 'both' | 'preview'>('both');
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
  const [workspaceType, setWorkspaceType] = useState<'local' | 'cloud' | 'browser'>('local');
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
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState({ top: 0, left: 0 });
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
  const decorationsCollectionRef = useRef<any>(null);

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
  const lastSavedContentRef = useRef<string>(INITIAL_TEXT);
  const isScrollingRef = useRef<'editor' | 'preview' | null>(null);
  const scrollTimeoutRef = useRef<any>(null);
  const completionProviderRef = useRef<any>(null);
  const [floatingToolbar, setFloatingToolbar] = useState<{ visible: boolean, top: number, left: number }>({ visible: false, top: 0, left: 0 });
  const cursorPositionRef = useRef<any>(null);
  const cursorSelectionRef = useRef<any>(null);
  const handlersRef = useRef<any>(null);
  const hotkeyDisposablesRef = useRef<any[]>([]);

  useEffect(() => {
    const restoreSettings = async () => {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') setIsDarkMode(true);

      // 애드온 환경 감지 (동기 처리)
      const detectedAddon = typeof window !== 'undefined' && (
        new URLSearchParams(window.location.search).get('env') === 'addon' ||
        !!((window as any).chrome?.runtime?.id)
      );
      setIsAddonEnv(detectedAddon);

      // 애드온 모드: File System Access API 사용, 백엔드 불필요
      if (detectedAddon) {
        setWorkspaceType('browser');
        setRootFolder(null);
        setPreviewMode('preview');
      } else {
        // 백엔드에서 현재 ROOT 조회 (우선)
        let rootPath: string | null = null;
        try {
          const res = await fetch(getApiUrl('/api/get-root'));
          if (res.ok) {
            const data = await res.json();
            if (data.currentRoot) {
              rootPath = data.currentRoot;
            }
          }
        } catch (err) {
          console.warn('Backend root 조회 실패:', err);
        }

        if (rootPath) {
          setRootFolder({ name: rootPath });
          localStorage.setItem('rootFolder', JSON.stringify({ name: rootPath }));
        } else {
          // 저장된 폴더가 있으면 사용, 없으면 기본값 없이 빈 상태로 시작
          const savedFolder = localStorage.getItem('rootFolder');
          if (savedFolder) {
            try {
              const folder = JSON.parse(savedFolder);
              if (folder.name && folder.name !== '브라우저 스토리지' && folder.name !== 'C:\\') {
                setRootFolder(folder);
              } else {
                // 유효하지 않은 기본값 삭제
                localStorage.removeItem('rootFolder');
                localStorage.removeItem('workspaceType');
              }
            } catch (e) {
              localStorage.removeItem('rootFolder');
            }
          }
        }
      }

      const savedWidth = localStorage.getItem('sidebarWidth');
      if (savedWidth) setSidebarWidth(parseInt(savedWidth));

      const savedQuoteStyle = localStorage.getItem('quoteStyle') as any;
      if (savedQuoteStyle) setQuoteStyle(savedQuoteStyle);

      const savedHotkeys = localStorage.getItem('customHotkeys');
      if (savedHotkeys) {
        setCustomHotkeys({ ...getDefaultHotkeys(), ...JSON.parse(savedHotkeys) });
      }

      const savedSlashCmds = localStorage.getItem('customSlashCommands');
      if (savedSlashCmds) {
        setCustomSlashCommands({ ...getDefaultCommands(), ...JSON.parse(savedSlashCmds) });
      }

      const savedFontSize = localStorage.getItem('fontSize');
      if (savedFontSize) setFontSize(parseInt(savedFontSize));

      const savedWordWrap = localStorage.getItem('wordWrap') as any;
      if (savedWordWrap) setWordWrap(savedWordWrap);



      setMounted(true);
    };

    restoreSettings();
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('quoteStyle', quoteStyle);
    }
  }, [quoteStyle, mounted]);

  useEffect(() => {
    if (!mounted) return;
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode, mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('workspaceType', workspaceType);
    }
  }, [workspaceType, mounted]);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      const api = (window as any).electronAPI;
      api.onNewFileRequested(() => handlers.newFile());
      api.onOpenFileRequested(() => handlers.openFolder());
      api.onSaveFileRequested(() => handlers.save());
      api.onSaveFileAsRequested(() => handlers.saveAs());
      
      return () => {
        api.removeListeners();
      };
    }
  }, [mounted, content, currentFileNode]);

  // 애드온 모드: 클립보드 내용 읽어서 에디터에 붙여넣기
  useEffect(() => {
    if (mounted && isAddonEnv && typeof navigator !== 'undefined' && navigator.clipboard) {
      (async () => {
        try {
          const text = await navigator.clipboard.readText();
          if (text) {
            setContent(text);
            lastSavedContentRef.current = text;
            if (editorRef.current) {
              editorRef.current.setValue(text);
            }
          }
        } catch (e) {
          // 클립보드 읽기 실패 (권한 없음 등) - 무시
        }
      })();
    }
  }, [mounted]);

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

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('fontSize', fontSize.toString());
    }
  }, [fontSize, mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('wordWrap', wordWrap);
    }
  }, [wordWrap, mounted]);

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
      if (rootFolder?.handle) {
        const list = await scanDirectory(rootFolder.handle);
        setFileList(list);
      } else {
        const list = getVfsFiles();
        setFileList(list);
      }
    } else if (activeType === 'local') {
      const api = (window as any).electronAPI;
      if (api?.readFromPath && rootFolder?.name) {
        try {
          const list = await api.listDirectory(rootFolder.name);
          if (list) setFileList(list);
        } catch (e) {
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
          console.error("Local file fetch error:", err);
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
        console.error(err);
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
        // Electron: OS 탐색기 다이얼로그 (Documents 기본 폴더)
        try {
          const result = await (window as any).electronAPI.selectFolder();
          if (result.status === 'success') {
            const finalRoot = result.path;
            // 백엔드에 저장 (실패해도 로컬에는 저장)
            try {
              await fetch(getApiUrl('/api/set-root'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newRoot: finalRoot })
              });
            } catch (_) {}
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
        // 브라우저/애드온: File System Access API (OS 탐색기)
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
            console.error(err);
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

  const handleFileClick = async (node: FileNode | null) => {
    if (!node) {
      setCurrentFileNode(null);
      setCurrentFileName('새 파일.md');
      setContent(INITIAL_TEXT);
      lastSavedContentRef.current = INITIAL_TEXT;
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
          setContent(text);
          lastSavedContentRef.current = text;
          if (editorRef.current) {
            editorRef.current.setValue(text);
          }
        } else if (node.path) {
          // LocalStorage 가상 파일 읽기
          const text = vfsReadFile(node.path);
          setContent(text);
          lastSavedContentRef.current = text;
          if (editorRef.current) {
            editorRef.current.setValue(text);
          }
        }
      } else if (activeMode === 'local' && node.path) {
        const api = (window as any).electronAPI;
        if (api?.readFromPath) {
          try {
            const file = await api.readFromPath(node.path);
            if (file) {
              setContent(file.content);
              lastSavedContentRef.current = file.content;
              if (editorRef.current) editorRef.current.setValue(file.content);
            }
          } catch (e) {
            showToast('파일 읽기 실패', 'error');
          }
        } else {
          const res = await fetch(getApiUrl(`/api/file-content?path=${encodeURIComponent(node.path)}`));
          if (res.ok) {
            const data = await res.json();
            setContent(data.content);
            lastSavedContentRef.current = data.content;
            if (editorRef.current) editorRef.current.setValue(data.content);
          }
        }
      }
      setCurrentFileName(node.name);
      setCurrentFileNode(node);
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
      console.error("Save failed:", e);
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
      const selection = editor.getSelection();
      if (selection) {
        const range = new (window as any).monaco.Range(
          selection.startLineNumber,
          selection.startColumn,
          selection.endLineNumber,
          selection.endColumn
        );
        editor.executeEdits("insert", [{ range, text, forceMoveMarkers: true }]);
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
    editor.focus();
  };

  const wrapSelection = (before: string, after: string = before, defaultText: string = "") => {
    if (editorRef.current) {
      const editor = editorRef.current;
      let selection = editor.getSelection();
      if ((!selection || selection.isEmpty()) && lastSelectionRef.current && !lastSelectionRef.current.isEmpty()) {
        selection = lastSelectionRef.current;
      }
      if (!selection) return;
      const model = editor.getModel();
      const text = model.getValueInRange(selection);
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
        }
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
      console.error('HTML Table parsing error', err);
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
              setContent(newValue);
            }
          }
        } catch (err) {
          console.error("클립보드 이미지 업로드 실패:", err);
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
            setContent(editorRef.current.getValue());
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
            setContent(editorRef.current.getValue());
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

      const match = trimmed.match(/^([-*+]|\d+\.|>+|- \[[ xX]\])\s+(.*)/);
      if (match) {
        return leadingSpaces + match[2];
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

    editor.focus();
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'x') {
        e.preventDefault();
        removePrefix();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown, true);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown, true);
  }, []);

  const { processedContent, lineMap } = useMemo(() => {
    const res = preprocessMarkdownForPreview(content);
    return {
      processedContent: res.text,
      lineMap: res.lineMap
    };
  }, [content]);



  const handlers = {
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
      if (previewRef.current) {
        try {
          const html = previewRef.current.innerHTML;
          const text = previewRef.current.textContent || "";
          
          const blobHtml = new Blob([html], { type: 'text/html' });
          const blobText = new Blob([text], { type: 'text/plain' });
          
          const data = [new ClipboardItem({
            'text/html': blobHtml,
            'text/plain': blobText
          })];
          
          await navigator.clipboard.write(data);
          showToast("미리보기 내용이 서식이 있는 텍스트로 복사되었습니다.", "success");
        } catch (err) {
          // 리치 텍스트 복사 실패 시 일반 텍스트 복사로 Fallback
          navigator.clipboard.writeText(previewRef.current.textContent || "");
          showToast("미리보기 내용이 일반 텍스트로 복사되었습니다.", "success");
        }
      } else {
        showToast("미리보기 창이 활성화되어 있지 않습니다.", "warning");
      }
    },
    newFile: () => {
      setContent('');
      setCurrentFileName('새 파일.md');
      setCurrentFileNode(null);
      lastSavedContentRef.current = '';
      if (editorRef.current) {
        editorRef.current.setValue('');
      }
      setIsSidebarOpen(true);
      showToast("새 문서를 시작합니다.", "info");
    },
    openFolder: async () => {
      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        try {
          const file = await (window as any).electronAPI.openFile();
          if (file) {
            setContent(file.content);
            lastSavedContentRef.current = file.content;
            if (editorRef.current) {
              editorRef.current.setValue(file.content);
            }
            setCurrentFileName(file.name);
            setCurrentFileNode({ name: file.name, kind: 'file', path: file.path });
            setIsSidebarOpen(true);
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
      setContent(text);
            lastSavedContentRef.current = text;
            if (editorRef.current) {
              editorRef.current.setValue(text);
            }
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
      const isNewDocument = !currentFileNode || !currentFileNode.path || currentFileName === '새 파일.md';
      const api = (window as any).electronAPI;
      const hasFilePicker = typeof window !== 'undefined' && 'showSaveFilePicker' in window;
      setSaveStatus('saving');
      if (isNewDocument) {
        if (api) {
          // === Desktop: OS 저장 대화상자 하나로 파일명+폴더 선택 ===
          try {
            const suggestedName = currentFileName !== '새 파일.md' ? currentFileName : undefined;
            const defaultDir = rootFolder?.name && rootFolder.name !== '브라우저 스토리지' ? rootFolder.name : undefined;
            const file = await api.saveFileAs(content, suggestedName, defaultDir);
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
              lastSavedContentRef.current = content;
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
        } else if (typeof (window as any).showDirectoryPicker === 'function') {
          // === Addon/Browser: 폴더 선택 = 워크스페이스 → 파일명 입력 → 저장 ===
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
              defaultValue: '',
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
            defaultValue: currentFileName,
            type: 'createFile',
            error: ""
          });
          setSaveStatus('unsaved');
        }
      } else if (api) {
        // === Desktop: 기존 파일 저장 ===
        try {
          const success = await api.saveFile(currentFileNode.path, content);
          if (success) {
            lastSavedContentRef.current = content;
            setSaveStatus('saved');
            showToast("저장되었습니다.", "success");
          } else {
            setSaveStatus('unsaved');
            showToast("저장 실패", 'error');
          }
        } catch (e) {
          setSaveStatus('unsaved');
          showToast("저장 실패: " + e, 'error');
        }
      } else if (workspaceType === 'local') {
          try {
            const res = await fetch(getApiUrl('/api/save'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ path: currentFileNode.path, content })
            });
            if (res.ok) {
              lastSavedContentRef.current = content;
              setSaveStatus('saved');
              showToast("저장되었습니다.", "success");
            } else {
              setSaveStatus('unsaved');
              showToast("저장 실패", 'error');
            }
          } catch (e: any) {
            setSaveStatus('unsaved');
            showToast("저장 실패: " + e.message, 'error');
          }
        } else if (workspaceType === 'browser') {
          if (currentFileNode?.handle) {
            try {
              const writable = await currentFileNode.handle.createWritable();
              await writable.write(content);
              await writable.close();
              lastSavedContentRef.current = content;
              setSaveStatus('saved');
              showToast("저장되었습니다.", "success");
            } catch (e: any) {
              setSaveStatus('unsaved');
              showToast("저장 실패: " + e.message, 'error');
            }
          } else if (currentFileNode?.path) {
            // VFS 파일 → showSaveFilePicker로 내PC 저장소로 마이그레이션
            if (hasFilePicker) {
              try {
                const fh = await (window as any).showSaveFilePicker({
                  suggestedName: currentFileNode.path,
                  startIn: rootFolder?.handle || 'documents',
                  types: [{ description: 'Markdown', accept: { 'text/markdown': ['.md', '.markdown', '.txt'] } }],
                });
                const w = await fh.createWritable();
                await w.write(content);
                await w.close();
                setCurrentFileName(fh.name);
                setCurrentFileNode({ name: fh.name, kind: 'file', path: fh.name, handle: fh });
                lastSavedContentRef.current = content;
                setSaveStatus('saved');
                showToast("저장되었습니다.", "success");
              } catch (e: any) {
                if (e.name !== 'AbortError') {
                  setSaveStatus('unsaved');
                } else {
                  setSaveStatus('unsaved');
                }
              }
            } else {
              vfsWriteFile(currentFileNode.path, content);
              lastSavedContentRef.current = content;
              setSaveStatus('saved');
              showToast("저장되었습니다.", "success");
            }
          } else {
            showToast("데스크톱 모드(또는 로컬 서버 연동)에서만 사용 가능한 기능입니다.", "warning");
          }
        } else {
          showToast("데스크톱 모드(또는 로컬 서버 연동)에서만 사용 가능한 기능입니다.", "warning");
        }
    },

    saveAs: async () => {
      const api = (window as any).electronAPI;
      const suggestedName = currentFileName !== '새 파일.md' ? currentFileName : undefined;
      const defaultDir = rootFolder?.name && rootFolder.name !== '브라우저 스토리지' ? rootFolder.name : undefined;

      setSaveStatus('saving');

      if (api) {
        // === Desktop (Electron): showSaveDialog (워크스페이스 폴더부터 열림) → 워크스페이스 변경 ===
        try {
          const file = await api.saveFileAs(content, suggestedName, defaultDir);
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
            lastSavedContentRef.current = content;
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
      } else if (typeof (window as any).showDirectoryPicker === 'function') {
        // === Addon/Browser: 폴더 선택 → 파일명 입력 → 저장 ===
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
          defaultValue: currentFileName,
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
    image: () => setIsImageModalOpen(true),
    video: () => setIsYoutubeModalOpen(true),
    now: () => insertAtCursor(new Date().toLocaleString()),
    emoji: (e: any) => {
      if (e && e.currentTarget) {
        const rect = e.currentTarget.getBoundingClientRect();
        setEmojiPickerPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX
        });
        setIsEmojiPickerOpen(prev => !prev);
      }
    },
    map: () => setIsMapModalOpen(true),
    table: () => setIsTableModalOpen(true),
    code: () => insertBlockTag('```javascript', '```', '코드'),
    chart: () => insertBlockTag('```mermaid', '```', '그래프'),
    math: () => setIsFormulaModalOpen(true),
    zoomIn: () => setFontSize(prev => Math.min(prev + 2, 32)),
    zoomOut: () => setFontSize(prev => Math.max(prev - 2, 12)),
    globalSearch: () => setIsSearchOpen(true),
    settings: () => setIsSettingsModalOpen(true),
    about: () => setIsAboutModalOpen(true),
    updates: () => setIsUpdatesModalOpen(true),
    toggleFloatingToolbar: () => {
      setFloatingToolbar(prev => {
        if (prev.visible) return { ...prev, visible: false };
        if (editorRef.current) {
          const position = editorRef.current.getPosition();
          if (position) {
            const visiblePos = editorRef.current.getScrolledVisiblePosition(position);
            if (visiblePos) {
              return { visible: true, top: Math.max(0, visiblePos.top - 10), left: visiblePos.left };
            }
          }
        }
        return { visible: true, top: 100, left: 100 }; // fallback
      });
    },
  };

  handlersRef.current = handlers;

  useEffect(() => {
    if (!editorRef.current || !(window as any).monaco) return;
    const editor = editorRef.current;
    const monaco = (window as any).monaco;

    hotkeyDisposablesRef.current.forEach(d => d.dispose());
    hotkeyDisposablesRef.current = [];

    const parseKeybinding = (keyStr: string) => {
      if (!keyStr) return 0;
      let binding = 0;
      const parts = keyStr.split('+').map(p => p.trim().toUpperCase());
      if (parts.includes('CTRL')) binding |= monaco.KeyMod.CtrlCmd;
      if (parts.includes('SHIFT')) binding |= monaco.KeyMod.Shift;
      if (parts.includes('ALT')) binding |= monaco.KeyMod.Alt;
      
      const keyPart = parts[parts.length - 1];
      if (keyPart.length === 1 && keyPart >= 'A' && keyPart <= 'Z') {
        binding |= monaco.KeyCode[`Key${keyPart}`];
      } else if (keyPart >= '0' && keyPart <= '9') {
        binding |= monaco.KeyCode[`Digit${keyPart}`];
      }
      return binding;
    };

    Object.entries(handlersRef.current || {}).forEach(([key, handler]) => {
      const kbStr = customHotkeys[key];
      const kb = kbStr ? parseKeybinding(kbStr) : 0;
      
      const disposable = editor.addAction({
        id: `custom-action-${key}`,
        label: `Custom ${key}`,
        keybindings: kb !== 0 ? [kb] : [],
        run: () => {
          if (typeof handler === 'function') {
            (handler as Function)();
          }
        }
      });
      hotkeyDisposablesRef.current.push(disposable);
    });
  }, [customHotkeys, isEditorReady]);

  const toc = useMemo(() => {
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
        handlers={handlers}
        setContent={setContent}
        isSearchOpen={isSearchOpen}
       
        isAddonEnv={isAddonEnv}
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
              handlers={handlers}
             
            />
          )}
          <div className="flex flex-1 overflow-hidden">
            {previewMode !== 'preview' && (
              <div className="flex-1 min-w-0 h-full relative border-r border-black/5 dark:border-white/5">
                <Editor
                  height="100%"
                  language="markdown"
                  theme={isDarkMode ? "onrivi-dark" : "onrivi-light"}
                  value={content}
                  onChange={(val) => {
                    setContent(val || '');
                    updateDecorations(editorRef.current);
                  }}
                  beforeMount={(monaco) => {
                    monaco.editor.defineTheme('onrivi-light', {
                      base: 'vs',
                      inherit: true,
                      rules: [
                        { token: 'keyword.md', fontStyle: 'bold', foreground: '0055CC' },
                        { token: 'strong.md', fontStyle: 'bold', foreground: '000000' },
                        { token: 'emphasis.md', fontStyle: 'italic', foreground: '000000' },
                        { token: 'string.link.md', fontStyle: 'bold', foreground: '0066CC' }
                      ],
                      colors: {}
                    });
                    monaco.editor.defineTheme('onrivi-dark', {
                      base: 'vs-dark',
                      inherit: true,
                      rules: [
                        { token: 'keyword.md', fontStyle: 'bold', foreground: '569CD6' },
                        { token: 'strong.md', fontStyle: 'bold', foreground: 'FFFFFF' },
                        { token: 'emphasis.md', fontStyle: 'italic', foreground: 'FFFFFF' },
                        { token: 'string.link.md', fontStyle: 'bold', foreground: '4FC1FF' }
                      ],
                      colors: {}
                    });
                  }}
                  onMount={(editor, monaco) => {
                    editorRef.current = editor;
                    if (typeof window !== 'undefined') {
                      (window as any).monaco = monaco;
                    }
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

                    // Ctrl+Space: 커서 위치에서 플로팅 툴바 토글
                    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space, () => {
                      setFloatingToolbar(prev => {
                        if (prev.visible) return { ...prev, visible: false };
                        const position = editor.getPosition();
                        if (!position) return prev;
                        const visiblePos = editor.getScrolledVisiblePosition(position);
                        if (!visiblePos) return prev;
                        return { visible: true, top: Math.max(0, visiblePos.top - 10), left: visiblePos.left };
                      });
                    });
                    
                    decorationsCollectionRef.current = editor.createDecorationsCollection();
                    updateDecorations(editor);
                    setIsEditorReady(true);
                    const container = editor.getContainerDomNode();
                    container.addEventListener('paste', handleEditorPaste, true);
                    editor.onDidChangeCursorPosition((e) => {
                      setActiveLine(e.position.lineNumber);
                      setCursorLine(e.position.lineNumber);
                      setCursorColumn(e.position.column);
                    });
                    editor.onDidChangeCursorSelection((e) => {
                      lastSelectionRef.current = e.selection;
                      if (!e.selection.isEmpty() && editor.hasTextFocus()) {
                        const position = editor.getScrolledVisiblePosition(e.selection.getStartPosition());
                        if (position) {
                          setFloatingToolbar({ visible: true, top: Math.max(0, position.top - 10), left: position.left });
                        }
                      } else {
                        setFloatingToolbar(prev => prev.visible ? { ...prev, visible: false } : prev);
                      }
                    });

                    if (completionProviderRef.current) {
                      completionProviderRef.current.dispose();
                    }
                    completionProviderRef.current = monaco.languages.registerCompletionItemProvider('markdown', {
                      triggerCharacters: ['/'],
                      provideCompletionItems: (model: any, position: any) => {
                        const textUntilPosition = model.getValueInRange({
                          startLineNumber: position.lineNumber,
                          startColumn: 1,
                          endLineNumber: position.lineNumber,
                          endColumn: position.column
                        });
                        
                        const match = textUntilPosition.match(/(^|\s)\/$/);
                        if (!match) {
                          return { suggestions: [] };
                        }

                        const suggestions = getSlashCommands(monaco, customSlashCommands);

                        return {
                          suggestions: suggestions.map(s => ({
                            ...s,
                            range: {
                              startLineNumber: position.lineNumber,
                              endLineNumber: position.lineNumber,
                              startColumn: position.column - 1,
                              endColumn: position.column
                            }
                          }))
                        };
                      }
                    });

                    editor.onDidScrollChange(() => {
                      if (isScrollingRef.current === 'preview' || previewMode !== 'both' || !previewRef.current) return;
                      
                      isScrollingRef.current = 'editor';
                      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                      scrollTimeoutRef.current = setTimeout(() => { isScrollingRef.current = null; }, 50);

                      const visibleRanges = editor.getVisibleRanges();
                      if (visibleRanges.length > 0) {
                        const topVisibleLine = visibleRanges[0].startLineNumber;
                        
                        const elements = Array.from(previewRef.current.querySelectorAll('[data-line]')) as HTMLElement[];
                        let targetEl: HTMLElement | null = null;
                        let maxLine = -1;
                        for (const el of elements) {
                          const lineStr = el.getAttribute('data-line');
                          if (lineStr) {
                            const line = parseInt(lineStr, 10);
                            if (line <= topVisibleLine && line > maxLine) {
                              maxLine = line;
                              targetEl = el;
                            }
                          }
                        }
                        
                        if (targetEl) {
                          const getRelativeOffsetTop = (el: HTMLElement, container: HTMLElement): number => {
                            let offsetTop = 0;
                            let current: HTMLElement | null = el;
                            while (current && current !== container) {
                              offsetTop += current.offsetTop;
                              current = current.offsetParent as HTMLElement | null;
                            }
                            return offsetTop;
                          };
                          const relativeTop = getRelativeOffsetTop(targetEl, previewRef.current);
                          previewRef.current.scrollTo({
                            top: Math.max(0, relativeTop - 20),
                            behavior: 'auto'
                          });
                        }
                      }
                    });
                  }}
                  options={{
                    padding: { top: 24, bottom: 96 },
                    scrollBeyondLastLine: true,
                    fontSize,
                    wordWrap,
                    lineNumbers: 'on',
                    minimap: { enabled: false },
                    scrollbar: { vertical: 'visible', horizontal: 'visible' },
                    quickSuggestions: { other: true, comments: true, strings: true },
                    suggestOnTriggerCharacters: true
                  }}
                />
                {floatingToolbar.visible && (
                  <div 
                    className="absolute z-50 flex items-center bg-white dark:bg-zinc-800 shadow-lg rounded-md border border-gray-200 dark:border-zinc-700 px-1 py-1 gap-0.5 animate-in fade-in zoom-in-95 duration-100 flex-wrap max-w-[500px] -translate-y-full"
                    style={{ top: floatingToolbar.top, left: floatingToolbar.left }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {TOOLBAR_ITEMS.filter(item => item.group !== '푸터').map((item, idx, arr) => {
                      const isNewGroup = idx > 0 && arr[idx - 1].group !== item.group;
                      return (
                        <React.Fragment key={item.id}>
                          {isNewGroup && <div className="w-px h-4 bg-gray-300 dark:bg-zinc-600 mx-1" />}
                          <button 
                            className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-zinc-700 text-[13px] font-medium"
                            title={`${item.name} (${customHotkeys[item.id] || ''})`} 
                            onClick={(e) => { 
                              e.preventDefault(); 
                              if (handlers[item.id as keyof typeof handlers]) {
                                (handlers[item.id as keyof typeof handlers] as any)();
                              }
                            }}
                          >
                            {item.icon}
                          </button>
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {previewMode !== 'edit' && (
              <div 
                ref={previewRef}
                className={`flex-1 h-[calc(100vh-64px)] overflow-y-auto px-8 py-10 print:h-auto print:overflow-visible prose prose-sm md:prose-base dark:prose-invert max-w-none`}
                style={{ width: previewMode === 'preview' ? '100%' : '50%' }}
                onScroll={(e) => {
                  if (isScrollingRef.current === 'editor' || previewMode !== 'both' || !editorRef.current) return;
                  
                  isScrollingRef.current = 'preview';
                  if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                  scrollTimeoutRef.current = setTimeout(() => { isScrollingRef.current = null; }, 50);

                  const target = e.target as HTMLElement;
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
                  
                  if (targetLine !== -1) {
                    editorRef.current.revealLineInCenter(targetLine);
                  }
                }}
              >
                <MarkdownViewer content={content} />
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
           
          />
        </main>
      </div>

      <SettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)}
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
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={(format) => {
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
      {isEmojiPickerOpen && (
        <EmojiPicker
          isOpen={isEmojiPickerOpen}
          position={emojiPickerPosition}
          onSelect={(emoji) => {
            insertAtCursor(emoji);
            setIsEmojiPickerOpen(false);
          }}
          onClose={() => setIsEmojiPickerOpen(false)}
          isDarkMode={isDarkMode}
        />
      )}
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
