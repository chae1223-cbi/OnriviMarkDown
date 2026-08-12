/**
 * 프로그램명 : OnriviAuthor 
 * 버전 정보 : 1.0.1
 * 프로그램 ID : oaar-001
 * -----------------------------------------------------------------------
 * 변경내역
 * -----------------------------------------------------------------------
 * <2026.05.29> 최초작성
 * 작성자 : 채병익
 *   * 🚨 @PATCH : **2026-07-22** — 클라이언트 직접 supabase.rpc() 호출 전량 서버단 API Route fetch()로 이전: insert_license_activation→/api/rpc/license/insert, check_license_session(×2)→/api/license/check-session, verify_desktop_license→/api/license/verify-desktop; Realtime 구독 테이블명 license_activations→license_activations 전환
 *   * 🚨 @PATCH : **2026-07-22** — subscriptions 단일 통합 테이블 개편에 맞춰 software_licenses 및 users 레거시 쿼리 참조를 subscriptions 단일 쿼리로 일괄 마이그레이션 적용
 *   * 🚨 @PATCH : **2026-07-20** — 플로팅 툴바의 단독 AI Sparkles(✨) 아이콘 클릭 시 기존의 미작동하던 인라인 미리보기(setAiPreviewState)를 제거하고, 정상적인 AI 에디토리얼 어시스턴트 모달(AiDraftModal)이 열리도록 OPEN_AI_WRITER 커맨드 디스패치로 수정. 또한 텍스트/마크다운 조작 그룹에 중복으로 존재하던 텍스트 이모지(✨) 버튼을 제거하여 툴바 장황성 개선 및 기능 단일화 패치 적용 | **2026-07-18** — 라이선스 만료 및 미승인 상태(isExpired)일 때 Monaco 에디터가 편집 불가(readOnly, domReadOnly) 상태로 전환되도록 강제화 보강, 웰컴페이지 유예 시간 빨간색 경고 메시지 배너 UI 제거
   *             **2026-07-15** — ModalManager deps 객체에서 window.SYSTEM_PROFILES/DEFAULT_PROFILE/isSystemProfileId를 window 전역에서 읽던 잘못된 코드를 모듈 import 상수 직접 참조로 수정 (window에 주입되지 않아 항상 빈 배열/객체로 폴백 → 서식 삭제 시 SYSTEM_PROFILES[0] undefined TypeError 버그 수정) | AI 재생성 및 모달 닫기/취소 시 백그라운드 스트리밍을 무효화하는 generationIdRef 가드 추가(동일 모달 재진입 또는 재생성 시 이전 버퍼가 오버랩되는 현상 완벽 조치), 에디터 마지막 행 타이핑 시 화면이 위아래로 흔들리는(jitter) 현상 해결을 위해 scrollBeyondLastLine: false와 충돌하는 bottom 패딩을 0으로 조정, AI 결과 반영 시(본문 대체 삽입 및 하단 추가) 에디터 포커스를 획득하고 커서의 위치를 반영된 텍스트 블록의 처음 시작 지점으로 자동 스위칭(setPosition/revealPositionInCenter)하도록 개선, AI 에디토리얼 어시스턴트에 컨텍스트 없음(일반 질문) 선택 옵션(targetScope: none)을 기본값으로 추가 제공하여 불필요한 본문 참조 현상 해결 및 본문 삽입/추가 로직 커서 위치 연동 보강, AI 에디토리얼 어시스턴트 모달 오픈 시 명령 입력창(textarea)에 자동으로 포커스(autoFocus)가 가도록 기능 보완, 문서 연결(문서링크) 픽커 모달의 노출 위치를 기존 floatingToolbar 기준에서 현재 Monaco 에디터의 커서(Cursor) 좌표 위치로 실시간 계산하여 출력되도록 스페이스 보정 및 화면 이탈 방지 가드 추가 | **2026-07-14** — AI 글쓰기 어시스턴트 적용 범위(선택 영역 vs 전체 문서) 스위칭 토글 옵션 및 지능형 문맥 자동 결합 옵션 탑재, 툴바 장황성 극복을 위한 상단 및 플로팅 툴바 단독 AI Sparkles(✨) 아이콘 주입, 맞춤법/오탈자 등 일반 지시 사항에 반응하도록 action 하드코딩 교정 및 [출력결과] 개행 앵커 정규식 필터 보정 | **2026-07-04** — 서식설정(CSS 프로필) 진입 방식을 기존 가상 탭바 기반 통합 개편에서 **전체화면 모달 팝업 갤러리(CssStyleModal)** 방식으로 재차 전면 개편. 탭 충돌 버그 및 데스크탑 렌더링 에러를 원천 차단하고 직관적인 샘플 문서 기반 프리뷰 환경 제공 | **2026-07-04** — 탭을 모두 닫거나 파일 전환 시 제한(만료) 사용자는 항상 미리보기 전용('preview') 모드로 강제 고정하고, 전체(일반) 사용자는 하단 상태바 등에서 활성화된 직전의 에디터 뷰잉 모드를 그대로 상속 및 유지하여 탭과 유기적으로 동기화하는 UI 보정 패치
   *             **2026-06-23** — 동시접속 제한 초과 여부를 실시간 총 세션 수로 판별하도록 `fiveMinAgo` 필터 제거 / 동시접속자 요금제 한도 초과 시 강제 로그아웃/로그인 튕김 대신 에디터가 편집 불가 및 미리보기 전용 모드로 제한되도록 개선 / isExpired 상태 변화 시 Monaco Editor의 readOnly/domReadOnly 옵션을 실시간 강제 동기화하도록 보완 / 탭 추가(+) 버튼 기능 제거치로 실시간 계산하여 출력되도록 스페이스 보정 및 화면 이탈 방지 가드 추가 | **2026-07-14** — AI 글쓰기 어시스턴트 적용 범위(선택 영역 vs 전체 문서) 스위칭 토글 옵션 및 지능형 문맥 자동 결합 옵션 탑재, 툴바 장황성 극복을 위한 상단 및 플로팅 툴바 단독 AI Sparkles(✨) 아이콘 주입, 맞춤법/오탈자 등 일반 지시 사항에 반응하도록 action 하드코딩 교정 및 [출력결과] 개행 앵커 정규식 필터 보정 | **2026-07-04** — 서식설정(CSS 프로필) 진입 방식을 기존 가상 탭바 기반 통합 개편에서 **전체화면 모달 팝업 갤러리(CssStyleModal)** 방식으로 재차 전면 개편. 탭 충돌 버그 및 데스크탑 렌더링 에러를 원천 차단하고 직관적인 샘플 문서 기반 프리뷰 환경 제공 | **2026-07-04** — 탭을 모두 닫거나 파일 전환 시 제한(만료) 사용자는 항상 미리보기 전용('preview') 모드로 강제 고정하고, 전체(일반) 사용자는 하단 상태바 등에서 활성화된 직전의 에디터 뷰잉 모드를 그대로 상속 및 유지하여 탭과 유기적으로 동기화하는 UI 보정 패치
 *             **2026-06-23** — 동시접속 제한 초과 여부를 실시간 총 세션 수로 판별하도록 `fiveMinAgo` 필터 제거 / 동시접속자 요금제 한도 초과 시 강제 로그아웃/로그인 튕김 대신 에디터가 편집 불가 및 미리보기 전용 모드로 제한되도록 개선 / isExpired 상태 변화 시 Monaco Editor의 readOnly/domReadOnly 옵션을 실시간 강제 동기화하도록 보완 / 탭 추가(+) 버튼 기능 제거
 *             **2026-06-22** — 에디터 진입/새로고침 시 license_activations 테이블에 등록된 기존 활성 세션(existingAct)이 유실되었더라도, 유효 요금제 기기 허용 한도(max_devices) 미만인 경우 자동으로 세션 등록(Auto register)을 보장하여 강제 로그아웃/로그인 튕김 현상을 근본적으로 차단하는 접속 세션 자동 복구 복원 가드 패치
 *             **2026-06-19** — 에디터 미리보기(반반 모드/미리보기 전용)의 상하좌우 여백을 서식설정(CSS 프로필) 수치 그대로 동기화하도록 pageStyle 및 부모 컨테이너 패딩 레이아웃 개정 | **2026-06-20** — 데스크톱 라이선스 자동 DB 등록 및 로컬 발급 로직 전면 배제 (무조건 미인증 시 미리보기 전용 잠금), 로컬 시간 조작 방어 가드 구현, 만료일 자정 차단 백그라운드 스케줄러 및 10분 유예 카운트다운 타이머 연동, 만료 시 preview 모드 강제 제한 가드 적용
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
const _monacoVsPath = typeof window !== 'undefined' && !!(window as any).electronAPI
  ? './monaco-editor/min/vs'
  : 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs';
loader.config({ paths: { vs: _monacoVsPath } });
import MarkdownViewer from '@/components/MarkdownViewer'; // 마크다운 뷰어 - 마크다운 뷰어
import Script from 'next/script'; // 넥스트 스크립트 - 
import 'katex/dist/katex.min.css'; // 카텍스 스타일 - 수학 공식 렌더링
import 'highlight.js/styles/github.css'; // 코드 하이라이팅 스타일

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
  Layers, X, Eraser, Sparkles, Loader2, Lock
} from 'lucide-react';

/**
 * ==================================================================================
 * 프로젝트 내부 모듈 @가 있는 내부 components 참조선언
 * ==================================================================================
 */
import { EditorProvider } from '@/context/EditorContext';
import { useMonacoSetup } from '@/hooks/editor/useMonacoSetup';
import { useUIStore } from '@/store/useUIStore';
import { useToast } from '@/components/ToastProvider';  // 토스트 메시지
import { msg } from '@/lib/systemMessages'; // 메시지
import { getApiUrl } from '@/lib/apiUrlBuilder'; // api 서버 경로
import { exportPDF, exportHTML, exportEPUB, exportPNG } from '@/lib/exportHandlers'; // 파일 내보내기 핸들러
import { configureMonacoEnvironment } from '@/lib/monacoEnv'; // Monaco 환경 설정
import { idb, FileNode, scanDirectory, getFileIcon } from '@/lib/indexedDbHelper'; // indexedDB 헬퍼
import { preprocessMarkdownForPreview, stripFrontmatter } from "@/lib/editorUtils"; // 마크다운 프리뷰
import { getSlashCommands, getDefaultHotkeys, getDefaultCommands, TOOLBAR_ITEMS } from "@/lib/toolbarConfig"; // 툴바 설정
import { EDITOR_THEMES, THEME_MAP } from "@/lib/editorThemes"; // 에디터 테마
import { CssProfile } from "@/types/cssProfile"; // css 프로필 타입
import { DEFAULT_PROFILE, SYSTEM_PROFILES, isSystemProfileId } from "@/constants/cssProfile"; // 기본 프로필
import { WELCOME_CONTENT } from "@/constants/welcomeContent"; // 웰컴 컨텐츠
import { PAPER_SIZES } from "@/constants/paperSizes";
import { getWelcomeContent, saveWelcomeContent } from "@/constants/welcomeContent"; // 웰컴 컨텐츠
import { getVfsFiles, vfsReadFile, vfsWriteFile, vfsCreateFile, vfsCreateFolder } from '@/lib/virtualFileSystem'; // 가상 파일 시스템 헬퍼
import { processTextWithAI, processTextWithAIStream, generateDraftWithAIStream, AI_ACTIONS, AiActionType } from '@/lib/gemini'; // Gemini AI 모듈
import FileTreeItem from '@/components/FileTreeItem'; // 파일 트리 아이템
import ExportModal from '@/components/ExportModal'; // 모달
import OAIcon from './icon_onriveauther.png'; // 아이콘 

// 분리된 컴포넌트들 임포트
import MenuBar from '@/components/MenuBar'; // 메뉴바
import Toolbar from '@/components/Toolbar'; // 툴바
import FormattingToolbar from '@/components/FormattingToolbar'; // 서식 툴바
import StatusBar from '@/components/StatusBar'; // 상태바
import ImageModal from '@/components/ImageModal'; // 모달
import MapModal from '@/components/MapModal'; // 모달
import TableModal from '@/components/TableModal'; // 모달
import SettingsModal from '@/components/SettingsModal'; // 모달
import GlobalSearch from '@/components/GlobalSearch'; // 모달
import LeftSidebar from '@/components/LeftSidebar'; // 모달
import FormulaModal from '@/components/FormulaModal'; // 모달
import MergeModal from '@/components/MergeModal'; // 모달
import YoutubeModal from '@/components/YoutubeModal'; // 모달
import AboutModal from '@/components/AboutModal'; // 모달
import LicenseModal from '@/components/LicenseModal'; // 라이선스 모달
import AIDraftModal from '@/components/AIDraftModal'; // 초안 생성 모달
import { supabase } from '@/lib/supabaseClient';
import { saveSecureData, loadSecureData } from '@/lib/secureStorage';
import UnifiedTabBar, { EditorTab } from '@/components/UnifiedTabBar';
import * as utilsPasteHandlers from '@/utils/pasteHandlers';
import * as utilsEditorActions from '@/utils/editorActions';
import { useEditorTabs } from '@/hooks/useEditorTabs';
import { useEditorSettings } from '@/hooks/useEditorSettings';
import { useEditorHandlers } from '@/hooks/useEditorHandlers';
import { useFileExplorer } from '@/hooks/useFileExplorer';

// ====================================================================
// 🚀 [리팩토링 V2 이관 준비] 새로 생성된 모듈 Import
// 기존 하드코딩된 상태와 뷰를 이 파일들로 점진적으로 마이그레이션해야 합니다.
// ====================================================================
import { useEditorAuth } from '@/hooks/editor/useEditorAuth';
import { useEditorModals } from '@/hooks/editor/useEditorModals';
// import EditorLayout from '@/components/editor/layout/EditorLayout';
// import EditorCore from '@/components/editor/core/EditorCore';
import ModalManager from '@/components/editor/modals/ModalManager';
import { extractFrontmatter, updateCssProfileInFrontmatter } from '@/lib/frontmatter';


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
  | 'NEW_FILE' | 'OPEN_FILE' | 'SAVE' | 'SAVE_AS' | 'OPEN_WORKSPACE'                   //① 파일 시스템 및 입출력 제어 (OS I/O Message)
  | 'PRINT' | 'EXPORT_HTML' | 'EXPORT_EPUB' | 'EXPORT_PNG' | 'EXIT'                    //② 출력(Export) 및 종료  
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
  | 'DOCLINK'                                                                          // ⑮ 문서링크
  | 'MERGE'                                                                             // ⑯ 파일 병합
  | 'AI_HELP'                                                                           // ⑰ AI 글쓰기 도우미
  | 'ADD_REFERENCE'                                                                     // ⑱ 참조 파일 추가
  | 'AI_DRAFT' | 'OPEN_AI_WRITER' | 'SLASH_COMMAND';

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


// ====================================================================
// 📊 [OMD-FILE-MainEditorApp-0000] MainEditorApp.tsx ➔ parseDateStringToMs
// 🎯 @KICK  : 날짜 문자열(YYYYMMDD 또는 ISO)을 ms 타임스탬프로 안전하게 파싱
// ====================================================================
export const parseDateStringToMs = (str?: string): number => {
  if (!str) return 0;
  if (str === '99991231') return Number.MAX_SAFE_INTEGER;
  if (/^\d{8}$/.test(str)) {
    const y = parseInt(str.substring(0, 4), 10);
    const m = parseInt(str.substring(4, 6), 10) - 1;
    const d = parseInt(str.substring(6, 8), 10);
    return new Date(y, m, d, 23, 59, 59, 999).getTime();
  }
  const parsed = new Date(str).getTime();
  return isNaN(parsed) ? 0 : parsed;
};

// ====================================================================
// 📊 [OMD-FILE-MainEditorApp-0001] MainEditorApp.tsx ➔ getMdFiles
// 🎯 @KICK  : FileNode 트리를 순회하여 모든 .md 파일을 재귀적으로 수집합니다
// 🛡️ @GUARD : None
// 🚨 @PATCH : None
// 🔗 @CALLS : None
// ====================================================================
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

// ====================================================================
// 📊 [OMD-FILE-MainEditorApp-0002] MainEditorApp.tsx ➔ fetchAllMdFiles
// 🎯 @KICK  : 멀티 플랫폼 비동기 파일 트리 스캔: 브라우저, 로컬/Electron 또는 클라우드 API
// 🛡️ @GUARD : visited Set으로 무한 디렉토리 루프 사이클 방지
// 🚨 @PATCH : None
// 🔗 @CALLS : getMdFiles, fetch, api.listDirectory
// ====================================================================
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
              if (nameLower.endsWith('.md') || nameLower.endsWith('.markdown') || nameLower.endsWith('.bib')) {
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

// ====================================================================
// 📊 [OMD-CORE-MainEditorApp-0003] MainEditorApp.tsx ➔ resolveRelativeImagePath
// 🎯 @KICK  : 상대 마크다운 이미지 경로를 절대 경로로 변환, 백슬래시 및 ../.. 세그먼트 정규화
// 🛡️ @GUARD : http/https/data/blob URI, Windows 드라이브 문자, 빈 src 처리
// 🚨 @PATCH : None
// 🔗 @CALLS : None
// ====================================================================
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

// ====================================================================
// 📊 [OMD-CORE-MainEditorApp-0004] MainEditorApp.tsx ➔ getRelativePath
// 🎯 @KICK  : 위키 스타일 문서 링크를 위한 두 파일 간 상대 경로 계산
// 🛡️ @GUARD : null fromPath 처리, 절대 경로가 아니면 ./로 시작하도록 보장
// 🚨 @PATCH : None
// 🔗 @CALLS : None
// ====================================================================
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

// ====================================================================
// 📊 [OMD-CORE-MainEditorApp-0005] MainEditorApp.tsx ➔ MainEditorApp
// 🎯 @KICK  : 컨트롤 타워: 모든 전역 상태, 레이아웃 조립, Monaco 에디터, 미리보기, 사이드바, 메뉴 조정
// 🛡️ @GUARD : TDZ 선언 순서 방어, IME 조합 잠금, 스테일 클로저 Ref 백업, 마운트 시 레이스 컨디션 가드
// 🚨 @PATCH : **2026-07-16** — 분할 화면 모드에서 CSS 테마 배경색이 반영되지 않고 흰색으로 롤백되던 결함 수정 (모든 미리보기 모드에 배경색이 적용되도록 CSS 오버라이드 가드 조치).
//             **2026-07-05** — MainEditorApp에 하드코딩된 UI 껍데기(MenuBar, LeftSidebar 등 6종) Props 의존성을 전면 제거하고 EditorContext로 마이그레이션하여 모듈화 아키텍처 개편; 아래 상세 하위 항목 참조
// 🔗 @CALLS : useToast, useEditorTabs, useFileExplorer, useEditorSettings, useEditorHandlers, getMdFiles, fetchAllMdFiles, resolveRelativeImagePath, getRelativePath, utilsEditorActions, utilsPasteHandlers, getSlashCommands, preprocessMarkdownForPreview, saveSecureData, loadSecureData, idb, getApiUrl
// ====================================================================
export default function MainEditorApp() {                  // @MainEditorApp : MainEditorApp component
  const { showToast } = useToast();             // @showToast : Toast component  
  const {
    isSidebarOpen, setIsSidebarOpen,
    isToolbarOpen, setIsToolbarOpen,
    sidebarWidth, setSidebarWidth,
    sidebarTab, setSidebarTab
  } = useUIStore();
  const [mounted, setMounted] = useState(false);  // @mounted : mounted state 
  const [content, setContent] = useState('');   // @content : content state 

  const contentRef = useRef(content);
  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0006] MainEditorApp.tsx ➔ contentRef_sync
  // 🎯 @KICK  : 클로저에서 사용하기 위해 contentRef.current를 content 상태와 동기화
  // 🛡️ @GUARD : 스테일 클로저가 ref에서 이전 콘텐츠를 읽는 것을 방지
  // 🚨 @PATCH : None
  // 🔗 @CALLS : None
  // ====================================================================
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  const [previewMode, setPreviewModeRaw] = useState<'edit' | 'both' | 'preview' | 'css-style'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('previewMode');
      if (saved && saved !== 'css-style') return saved as any;
    }
    return 'both';
  });
  const [isA4GuardEnabled, setIsA4GuardEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isA4GuardEnabled') === 'true';
    }
    return false;
  });
  const [previewZoomScale, setPreviewZoomScale] = useState<number>(1);
  const previewModeRef = useRef(previewMode);
  // 💡 서식설정(css-style)이나 도움말 진입 전의 일반 마크다운 모드를 격리 보관하여 복원하는 Ref
  const lastGeneralPreviewModeRef = useRef<'edit' | 'both' | 'preview'>('both');
  const isEditorMountedRef = useRef(false);

  // ====================================================================
  // 📊 [OMD-CORE-0003 TDZ-GUARD] MainEditorApp.tsx ➔ 훅 호출 전 선행 상태 선언 블록
  // 🎯 @KICK  : useEditorSettings/useEditorTabs 훅 호출 이전에 반환값을 참조하는
  //             하위 코드(useEffect 등)를 위해 모든 관련 상태를 const로 선행 선언
  // 🛡️ @GUARD : Webpack 번들러가 let 변수를 단일 글자(rS, r0 등)로 난독화 시 TDZ 에러 유발 → const로 즉시 초기화
  // 🚨 @PATCH : _init 더미 변수 패턴 도입 (useEditorSettings 분리 리팩토링) | 이전 버전
  //           | tabs/setTabs/activeTabId/setActiveTabId를 실제 이름으로 선행 선언, useEditorTabs 외부 주입 전환 | 2026-06-15 | rS TDZ 에러(tabMetadata_sync L526) 해결
  // 🔗 @CALLS : useState (React)
  // ====================================================================
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
  const _handleThemeChange_init = () => { };

  // 💡 [Step 1 리팩토링 완료] 라이선스 및 권한 관리를 별도 Hook으로 완전히 분리!
  const {
    deviceId, setDeviceId,
    licenseStatus, setLicenseStatus,
    isLicenseChecking, setIsLicenseChecking
  } = useEditorAuth();

  // 💡 [Step 2 리팩토링 완료] 수십 개에 달하던 모달/팝업 상태를 단 하나의 Hook으로 완전히 분리!
  const {
    isSettingsModalOpen, setIsSettingsModalOpen,
    settingsModalInitialTab, setSettingsModalInitialTab,
    isStyleModalOpen, setIsStyleModalOpen,
    isExportModalOpen, setIsExportModalOpen,
    isImageModalOpen, setIsImageModalOpen,
    editingImageInfo, setEditingImageInfo,
    isMapModalOpen, setIsMapModalOpen,
    isTableModalOpen, setIsTableModalOpen,
    isMergeModalOpen, setIsMergeModalOpen,
    isYoutubeModalOpen, setIsYoutubeModalOpen,
    youtubeInitialUrl, setYoutubeInitialUrl,
    isLicenseModalOpen, setIsLicenseModalOpen,
    isFormulaModalOpen, setIsFormulaModalOpen,
    isHelpModalOpen, setIsHelpModalOpen,
    isReferenceModalOpen, setIsReferenceModalOpen,
    isCitationModalOpen, setIsCitationModalOpen,
    promptConfig, setPromptConfig,
    confirmConfig, setConfirmConfig
  } = useEditorModals();

  // ====================================================================
  // 📊 [OMD-EDIT-0004 TDZ-GUARD] MainEditorApp.tsx ➔ tabs/activeTabId 선행 선언
  // 🎯 @KICK  : tabMetadata_sync(L526)가 useEditorTabs 훅 호출(L935) 이전에 setTabs/activeTabId를
  //             참조하므로, Webpack TDZ 에러 방지를 위해 실제 이름으로 최상단 선행 선언
  // 🛡️ @GUARD : useEditorTabs 내부에서 useState를 갖지 않고 이 상태를 주입받아 사용
  // 🚨 @PATCH : _tabs_init/_activeTabId_init 더미 이름 → tabs/activeTabId 실제 이름으로 변경 | 2026-06-15 | rS TDZ(tabMetadata_sync) 해결
  // 🔗 @CALLS : useState (React)
  // ====================================================================
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
  // ====================================================================
  // 📊 [OMD-CORE-MainEditorApp-0007] MainEditorApp.tsx ➔ loadUserProfiles
  // 🎯 @KICK  : 마운트 시 플랫폼 저장소(electronAPI 또는 localStorage)에서 사용자 CSS 프로필 로드
  // 🛡️ @GUARD : 사용자 저장 데이터에서 시스템 프로필 필터링, 레거시 형식 마이그레이션 병합
  // 🚨 @PATCH : 2026-08-05 — 웹과 데스크탑 환경 모두 무조건 `profiles/userCssProfiles.json` 경로를 통합하여 서식 로드/저장하도록 표준화.
  // 🔗 @CALLS : api.readProfiles, localStorage.getItem, JSON.parse, setProfiles
  // ====================================================================
  useEffect(() => {
    if (!mounted) return;
    const api = (window as any).electronAPI;
    const loadUserProfiles = async () => {
      let userProfiles: CssProfile[] = [];
      if (api) {
        // Desktop: electronAPI
        const savedResourceFolder = loadSecureData('resourceFolder') || null;
        userProfiles = await api.readProfiles(savedResourceFolder);
      } else {
        // Addon/Browser: localStorage & File System Access API
        try {
          const handle = await idb.get('resourceFolderHandle');
          if (handle) {
            setResourceFolderHandle(handle);
            try {
              // 권한 확인 없이 읽기 시도 (크롬은 세션 내에서는 허용될 수 있음)
              const profilesDir = await handle.getDirectoryHandle('profiles', { create: false });
              const fileHandle = await profilesDir.getFileHandle('userCssProfiles.json', { create: false });
              const file = await fileHandle.getFile();
              const text = await file.text();
              const parsed = JSON.parse(text);
              if (Array.isArray(parsed)) userProfiles = parsed;
              (window as any)._resourceFolderSynced = true; // 읽기 권한 획득 성공
            } catch (err: any) {
              if (err.name === 'NotFoundError') {
                // 파일이나 폴더가 없을 뿐 권한은 있는 상태이므로 동기화 허용
                (window as any)._resourceFolderSynced = true;
              }
              console.warn('[loadUserProfiles] Failed to read from resource folder handle, falling back to localStorage:', err);
              // 권한이 없거나 파일이 없는 경우 아래 localStorage 로직으로 폴백
            }
          }
        } catch (err) {
          console.warn('[loadUserProfiles] Failed to get resourceFolderHandle from idb:', err);
        }

        if (userProfiles.length === 0) {
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
          } catch { }
        }
      }
      setProfiles(prev => {
        const systemPart = prev.filter(p => isSystemProfileId(p.id));
        return [...systemPart, ...userProfiles];
      });
      setIsProfilesLoaded(true);
    };
    loadUserProfiles();
  }, [mounted]);
  const [activeProfileId, setActiveProfileId] = useState<string>(
    () => SYSTEM_PROFILES[0].id
  );
  const [isProfilesLoaded, setIsProfilesLoaded] = useState(false);
  const [isAddonEnv, setIsAddonEnv] = useState(false);
  const [helpContent, setHelpContent] = useState<string | null>(null);
  const [helpTitle, setHelpTitle] = useState('');
  const helpContentRef = useRef(helpContent);
  helpContentRef.current = helpContent;

  // 🌟 존재하지 않는 삭제된 테마(프로필) ID가 localStorage에 남아있을 경우 
  // 시스템 기본 프로필로 자동 복구하여 테마 찌꺼기를 안전하게 소거합니다.
  useEffect(() => {
    if (isProfilesLoaded && activeProfileId) {
      const exists = profiles.some(p => p.id === activeProfileId);
      if (!exists) {
        setActiveProfileId(SYSTEM_PROFILES[0].id);
      }
    }
  }, [isProfilesLoaded, profiles, activeProfileId]);

  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0008] MainEditorApp.tsx ➔ previewModeRef_sync
  // 🎯 @KICK  : previewModeRef.current를 previewMode 상태와 동기화
  // 🛡️ @GUARD : 이벤트 핸들러 및 비동기 콜백에서 스테일 ref 방지
  // 🚨 @PATCH : None
  // 🔗 @CALLS : None
  // ====================================================================
  useEffect(() => {
    previewModeRef.current = previewMode;
  }, [previewMode]);



  const [rootFolder, setRootFolder] = useState<{ name: string, handle?: any } | null>(null);
  const [resourceFolder, setResourceFolder] = useState<string | null>(() => loadSecureData('resourceFolder') || null);
  const [resourceFolderHandle, setResourceFolderHandle] = useState<any>(null);
  const [fileList, setFileList] = useState<FileNode[]>([]);
  const [workspaceType, setWorkspaceType] = useState<'local' | 'cloud' | 'browser'>('local');
  const [currentFileName, setCurrentFileName] = useState<string>('새 파일.md');
  const [currentFileNode, setCurrentFileNode] = useState<FileNode | null>(null);
  const [bibContent, setBibContent] = useState<string>('');

  // 💡 [Step 2 리팩토링으로 promptConfig 삭제됨 (useEditorModals로 이관)]

  const pendingExternalFileRef = useRef<string | null>(null); // 윈도우 파일 연결 경로 (마운트 전 확보용)
  const sessionRestoredRef = useRef<boolean>(false); // 세션 복원 최초 1회 실행 가드
  const [driveLetter, setDriveLetter] = useState('D:');

  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0012] MainEditorApp.tsx ➔ tabMetadata_sync
  // 🎯 @KICK  : 현재 파일 정보가 변경될 때 탭 메타데이터(fileName, path, node) 동기화
  // 🛡️ @GUARD : None
  // 🚨 @PATCH : 2026-08-05 — 앱 시작 시 리소스 폴더 미지정 안내 메시지 표시 로직 추가 (hasShownResourceWarningRef)
  // 🔗 @CALLS : setTabs
  // ====================================================================
  const hasShownResourceWarningRef = useRef(false);

  useEffect(() => {
    if (hasShownResourceWarningRef.current) return;
    const timer = setTimeout(() => {
      hasShownResourceWarningRef.current = true;
      const api = (window as any).electronAPI;
      const savedFolder = loadSecureData('resourceFolder');
      // 데스크탑은 문자열 경로 유무로, 웹은 핸들 유무로 판단
      const isMissing = api ? !savedFolder : !resourceFolderHandle;
      if (isMissing) {
        showToast('환경설정에 리소스폴드가 미지정되어 서식과 멀티미디어를 사용할 수 없습니다.', 'warning');
      }
    }, 1500); // 초기 로딩 후 1.5초 뒤 확인
    return () => clearTimeout(timer);
  }, [resourceFolderHandle, showToast]);

  // ====================================================================
  useEffect(() => {
    if (activeTabId) {
      setTabs(prev => prev.map(t =>
        t.id === activeTabId
          ? {
            ...t,
            name: t.path || t.model ? currentFileName : t.name,
            path: currentFileNode?.path || null,
            node: currentFileNode
          }
          : t
      ));
    }
  }, [currentFileName, currentFileNode, activeTabId]);

  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0012b] MainEditorApp.tsx ➔ file:tab-renamed listener
  // 🎯 @KICK  : 탐색기에서 파일/폴더 이름 변경 시 새 탭을 열지 않고 기존 탭 메타데이터만 갱신
  // 🛡️ @GUARD : oldPath가 현재 열린 탭과 일치하거나 하위 경로에 포함될 때만 동작
  // 🚨 @PATCH : **2026-07-06** — 추가 (이름 변경 시 새 탭이 생기는 버그 수정)
  // 🔗 @CALLS : setCurrentFileName, setCurrentFileNode, setTabs
  // ====================================================================
  useEffect(() => {
    const handler = (e: Event) => {
      const { oldPath, newPath, newName, newHandle } = (e as CustomEvent).detail;
      if (!oldPath || !newPath) return;

      const normOld = oldPath.replace(/\\/g, '/');
      const normNew = newPath.replace(/\\/g, '/');

      // 현재 열린 파일이 변경된 파일이거나 변경된 폴더 하위에 있을 때
      setTabs(prev => prev.map(t => {
        const tabPath = (t.path || '').replace(/\\/g, '/');
        if (tabPath === normOld) {
          // 정확히 이름 변경된 파일
          return { ...t, name: newName, path: newPath, node: { ...t.node, name: newName, path: newPath, ...(newHandle ? { handle: newHandle } : {}) } };
        } else if (tabPath.startsWith(normOld + '/')) {
          // 이름 변경된 폴더의 하위 파일
          const updatedPath = newPath + t.path.substring(oldPath.length);
          const updatedName = t.name; // 파일명 자체는 변경 없음
          return { ...t, path: updatedPath, node: { ...t.node, path: updatedPath } };
        }
        return t;
      }));

      // 현재 활성 파일도 갱신
      setCurrentFileNode(prev => {
        if (!prev) return prev;
        const normCur = (prev.path || '').replace(/\\/g, '/');
        if (normCur === normOld) {
          return { ...prev, name: newName, path: newPath, ...(newHandle ? { handle: newHandle } : {}) };
        } else if (normCur.startsWith(normOld + '/')) {
          const updatedPath = newPath + (prev.path || '').substring(oldPath.length);
          return { ...prev, path: updatedPath };
        }
        return prev;
      });
      setCurrentFileName(prev => {
        const normCur = (currentFileNode?.path || '').replace(/\\/g, '/');
        if (normCur === normOld) return newName;
        return prev;
      });
    };
    window.addEventListener('file:tab-renamed', handler);
    return () => window.removeEventListener('file:tab-renamed', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFileNode]);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAIDraftModalOpen, setIsAIDraftModalOpen] = useState(false);
  const [aiDraftInitialMode, setAiDraftInitialMode] = useState<'draft' | 'editorial'>('draft');
  const [aiEditorContext, setAiEditorContext] = useState<{ selectedText: string; fullText: string }>({ selectedText: '', fullText: '' });

  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0013] MainEditorApp.tsx ➔ searchOpen_sidebar_behavior
  // 🎯 @KICK  : 글로벌 검색이 열릴 때 사이드바 열기 및 검색 탭으로 전환
  // 🛡️ @GUARD : 검색이 닫힐 때 (여전히 검색 탭인 경우) 사이드바 탭을 TOC로 재설정
  // 🚨 @PATCH : None
  // 🔗 @CALLS : setIsSidebarOpen, setSidebarTab
  // ====================================================================
  useEffect(() => {
    if (isSearchOpen) {
      setIsSidebarOpen(true);
      setSidebarTab('search');
    } else if (sidebarTab === 'search') {
      setSidebarTab('toc');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSearchOpen]);

  // 💡 [Step 2 리팩토링으로 각종 모달 상태들 삭제됨 (useEditorModals로 이관)]
  const youtubeEditRangeRef = useRef<any>(null);

  const [showDocLinkPicker, setShowDocLinkPicker] = useState(false);
  const [docLinkSearchText, setDocLinkSearchText] = useState('');
  const [allMdFiles, setAllMdFiles] = useState<FileNode[]>([]);
  const [isDocLinkLoading, setIsDocLinkLoading] = useState(false);

  // 💡 [다른 문서 헤딩 연결] 헤딩 파싱 및 UI 조작을 위한 상태값
  const [selectedDocNode, setSelectedDocNode] = useState<FileNode | null>(null);
  const [docHeadings, setDocHeadings] = useState<string[]>([]);
  const [isHeadingLoading, setIsHeadingLoading] = useState(false);
  const [docHeadingSearchText, setDocHeadingSearchText] = useState('');

  // ====================================================================
  // 📊 [OMD-FILE-MainEditorApp-0014] MainEditorApp.tsx ➔ loadFilesForDocLinkPicker
  // 🎯 @KICK  : 문서 링크 선택기 열릴 때 모든 .md 파일 로드, 닫힐 때 상태 정리
  // 🛡️ @GUARD : 선택기 닫힐 때 모든 제목/파일 선택 상태 초기화
  // 🚨 @PATCH : None
  // 🔗 @CALLS : fetchAllMdFiles, setAllMdFiles
  // ====================================================================
  useEffect(() => {
    if (showDocLinkPicker) {
      const loadFiles = async () => {
        setIsDocLinkLoading(true);
        try {
          const files = await fetchAllMdFiles(workspaceType, fileList, rootFolder);
          setAllMdFiles(files);
          docLinkFilesRef.current = files;
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

  // 📊 [[ 자동완성용 파일 목록 로드
  useEffect(() => {
    if (workspaceType && fileList.length > 0 && !showDocLinkPicker) {
      fetchAllMdFiles(workspaceType, fileList, rootFolder).then(files => {
        docLinkFilesRef.current = files;
      }).catch(() => { });
    }
  }, [workspaceType, fileList, rootFolder, showDocLinkPicker]);

  // 💡 [Step 2 리팩토링으로 세팅 및 스타일 모달 상태 삭제됨 (useEditorModals로 이관)]

  // ====================================================================
  // 📊 [OMD-AUTH-MainEditorApp-0015] MainEditorApp.tsx ➔ initDeviceId
  // 🎯 @KICK  : electronAPI, chrome.storage 또는 localStorage 폴백에서 고유 장치 ID 초기화
  // 🛡️ @GUARD : 순서가 다른 환경 처리; 존재하지 않으면 crypto-random UUID 생성
  // 🚨 @PATCH : 2026-06-28 — 크롬 스토리지 동기화 완전 제거 및 로컬스토리지 격리로 세션 기반 접속 관리 전환
  // 🔗 @CALLS : api.getMachineId, crypto.randomUUID, localStorage.getItem/setItem, setDeviceId
  // ====================================================================
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initDeviceId = async () => {
      const api = (window as any).electronAPI;
      if (api && typeof api.getMachineId === 'function') {
        // A. 데스크탑 Electron 실기기 ID 수집
        const realId = await api.getMachineId();
        setDeviceId(realId);
      } else {
        // B. 일반 웹 브라우저 (스토리지 동기화 완전 제거 및 로컬스토리지 격리)
        let localId = localStorage.getItem('onrivi_device_id');
        if (!localId) {
          localId = crypto.randomUUID();
          localStorage.setItem('onrivi_device_id', localId);
        }
        setDeviceId(localId);
      }
    };
    initDeviceId();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ====================================================================
  // 📊 [OMD-AUTH-MainEditorApp-0016] MainEditorApp.tsx ➔ loadAndVerifyLicense (payment_no)
  // 🎯 @KICK  : 저장소에서 라이선스 키 로드, Supabase DB로 검증; payment_no 없는 경우 user_id fallback
  // 🛡️ @GUARD : 암호화 캐시를 통한 오프라인 유예 기간(3일), 시간 조작 방어; 웹 SaaS는 count 조회만 (upsert/장비 체크 없음)
  // 🚨 @PATCH : 2026-06-28 — 확장프로그램(chrome.storage.local) 스토리지 읽기 로직 제거 (로컬스토리지 격리);
  //              2026-06-23 — payment_no 미존재 시의 subscriptions 폴백 쿼리에 다중구독 cardinality violation 방지용 활성 구독 필터(is_expired/plan_end_date/plan_status 등) 추가 개편;
  //              2026-06-22 — payment_no 미존재 시 supabase Auth 세션 → subscriptions → software_licenses fallback;
  //              웹 SaaS: count 조회만 수행, upsert/device UUID 완전 제거 (auth callback에서 insert 담당)
  // 🔗 @CALLS : api.loadLicenseFull, fetch(/api/rpc/license/insert, /api/license/check-session), crypto.subtle.digest, saveSecureData, loadSecureData, setLicenseStatus, setLicenseKey
  // ====================================================================
  const loadAndVerifyLicense = useCallback(async () => {
    if (typeof window === 'undefined' || !deviceId) return;
    console.log('[LICENSE] loadAndVerifyLicense START deviceId=%o', deviceId);
    const api = (window as any).electronAPI;
    const isDesktop = !!api;
    let savedKey = '';
    let savedPaymentNo = '';
    let savedUserId = '';
    let savedLastRunTime = 0;

    let savedNextPaymentDate = '';
    let savedLicenseKey = '';
    let savedPlanName = '';

    // A. 스토리지 로드 (로컬스토리지를 최우선 단일 진실 공급원(SSOT)으로 사용)
    savedKey = localStorage.getItem('onrivi_license_key') || '';
    savedUserId = localStorage.getItem('onrivi_user_id') || '';
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) savedUserId = session.user.id;
    } catch (e) {}
    savedPaymentNo = localStorage.getItem('onrivi_payment_no') || '';
    savedLastRunTime = parseInt(localStorage.getItem('onrivi_last_run_time') || '0', 10);

    const cachedStatus = loadSecureData<any>('onrivi_license_status');
    if (cachedStatus && cachedStatus.userId === savedUserId) {
      savedNextPaymentDate = cachedStatus.nextPaymentDate || '';
      savedPlanName = cachedStatus.planName || '';
      // 캐시된 라이선스 키가 있으면 병합
      if (!savedKey && cachedStatus.licenseKey) savedKey = cachedStatus.licenseKey;
    }

    if (isDesktop) {
      if (typeof api.loadLicenseFull === 'function') {
        const fullData = await api.loadLicenseFull();
        if (fullData && fullData.userId) {
          savedUserId = fullData.userId || savedUserId;
          savedLastRunTime = fullData.lastRunTime || savedLastRunTime;
          savedNextPaymentDate = fullData.nextPaymentDate || savedNextPaymentDate;
          savedLicenseKey = fullData.licenseKey || savedKey;
          savedPlanName = fullData.planName || savedPlanName;
        }
      }
    } else {
      savedLicenseKey = savedKey;
    }

    const nowTime = Date.now();

    // B. 시간 조작 가드
    if (savedLastRunTime > 0 && nowTime < savedLastRunTime) {
      showToast("⚠️ 로컬 시스템 시간 조작이 감지되었습니다. 에디터 편집 기능이 제한됩니다.", "error");
      setLicenseStatus(prev => ({
        ...prev, isActivated: false, isExpired: true, planName: '시간 역전 제한 모드'
      }));
      return;
    }

    // ============================================
    // 🚨 데스크탑 전용 로직: 무조건 DB 조회 (USERID + DeviceID)
    // ============================================
    if (isDesktop) {
      // 시스템 실행 시간 갱신 및 기존 라이선스 오프라인 토큰 유지
      if (typeof api.saveLicenseFull === 'function') {
        await api.saveLicenseFull({
          userId: savedUserId,
          lastRunTime: nowTime,
          nextPaymentDate: savedNextPaymentDate,
          licenseKey: savedLicenseKey,
          planName: savedPlanName
        });
      }

      if (!savedUserId) {
        setLicenseStatus({
          isActivated: false, isExpired: true, remainingDays: 0,
          userId: '', licenseKey: '', paymentNo: '',
          planName: '제한사용자', nextPaymentDate: ''
        });
        return;
      }

      try {
        const verifyRes = await fetch(getApiUrl('/api/license/verify-desktop'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ p_email: savedUserId, p_device_uuid: deviceId })
        });
        const data = verifyRes.ok ? await verifyRes.json() : null;
        const error = !verifyRes.ok ? new Error('서버 오류') : null;

        if (error || !data) {
          console.warn('[loadAndVerifyLicense] Desktop verification network error:', error);
          // 오프라인 유예기간(Grace Period) 검증 (네트워크 오류 시에만 작동)
          if (savedNextPaymentDate) {
            const expiryMs = parseDateStringToMs(savedNextPaymentDate);
            const remainingDays = Math.max(0, Math.ceil((expiryMs - Date.now()) / (24 * 60 * 60 * 1000)));
            if (remainingDays > 0) {
              console.log('[loadAndVerifyLicense] Offline grace period active. Days remaining:', remainingDays);
              showToast(`네트워크 오프라인 모드로 실행 중입니다. (구독 만료까지 D-${remainingDays})`, "warning");
              setLicenseStatus({
                isActivated: true, isExpired: false, remainingDays,
                userId: savedUserId, licenseKey: savedLicenseKey, paymentNo: '',
                planName: savedPlanName || '오프라인 프리미엄 요금제',
                nextPaymentDate: savedNextPaymentDate
              });
              setIsLicenseChecking(false);
              return;
            }
          }
          setLicenseStatus({
            isActivated: false, isExpired: true, remainingDays: 0,
            userId: savedUserId, licenseKey: '', paymentNo: '',
            planName: '제한사용자', nextPaymentDate: ''
          });
        } else if (!data.success) {
          console.warn('[loadAndVerifyLicense] Desktop verification explicitly rejected:', data.message);
          if (data.code === 'ERR_MAX_DEVICES_EXCEEDED') {
            setLicenseStatus({
              isActivated: false, isExpired: true, remainingDays: 0,
              userId: savedUserId, licenseKey: '', paymentNo: '',
              planName: data.message, nextPaymentDate: ''
            });
          } else {
            // NO_PLAN, NOT_FOUND 등 구독 자체가 없는 경우 로컬 라이선스 완전 초기화
            if (typeof api !== 'undefined' && api.saveLicenseFull) {
              await api.saveLicenseFull({});
            }
            localStorage.removeItem('onrivi_license_key');
            localStorage.removeItem('onrivi_payment_no');
            localStorage.removeItem('onrivi_verify_key');
            localStorage.removeItem('onrivi_user_id');
            setLicenseStatus({
              isActivated: false, isExpired: true, remainingDays: 0,
              userId: '', licenseKey: '', paymentNo: '',
              planName: '제한사용자', nextPaymentDate: ''
            });
          }
        } else {
          const expiryMs = data.next_payment_date ? parseDateStringToMs(data.next_payment_date) : 0;
          const isExpired = expiryMs === 0 ? true : (Date.now() > expiryMs);
          const remainingDays = expiryMs === 0 ? 0 : Math.max(0, Math.ceil((expiryMs - Date.now()) / (24 * 60 * 60 * 1000)));

          if (isExpired) {
            setLicenseStatus({
              isActivated: false, isExpired: true, remainingDays: 0,
              userId: savedUserId, licenseKey: '', paymentNo: '',
              planName: '기간 만료 (제한 사용자)', nextPaymentDate: ''
            });

            if (typeof api.saveLicenseFull === 'function') {
              await api.saveLicenseFull({
                userId: savedUserId,
                lastRunTime: Date.now(),
                nextPaymentDate: data.next_payment_date || '',
                licenseKey: '',
                planName: '기간 만료 (제한 사용자)'
              });
            }
            
            localStorage.setItem('onrivi_license_key', '');
            localStorage.setItem('onrivi_last_run_time', Date.now().toString());
            saveSecureData('onrivi_license_status', {
              isActivated: false, isExpired: true, remainingDays: 0,
              userId: savedUserId, licenseKey: '', paymentNo: '',
              planName: '기간 만료 (제한 사용자)', nextPaymentDate: data.next_payment_date || '',
              lastVerifiedAt: Date.now()
            });
          } else {
            const newStatus = {
              isActivated: true, isExpired: false, remainingDays,
              userId: savedUserId, licenseKey: data.license_key || '', paymentNo: data.payment_no || '',
              planName: data.plan_name || '프리미엄 요금제',
              nextPaymentDate: data.next_payment_date || data.trial_end_at || ''
            };

            setLicenseStatus(newStatus);

            // 인증 성공 시 최신 라이선스 정보로 로컬 오프라인 토큰 갱신
            if (typeof api.saveLicenseFull === 'function') {
              await api.saveLicenseFull({
                userId: savedUserId,
                lastRunTime: Date.now(),
                nextPaymentDate: newStatus.nextPaymentDate,
                licenseKey: newStatus.licenseKey,
                planName: newStatus.planName
              });
            }
            
            // 데스크탑 환경에서도 로컬스토리지를 최신 DB 정보로 완벽하게 동기화 (오프라인 폴백 용도)
            localStorage.setItem('onrivi_license_key', newStatus.licenseKey);
            localStorage.setItem('onrivi_payment_no', newStatus.paymentNo);
            localStorage.setItem('onrivi_user_id', newStatus.userId);
            localStorage.setItem('onrivi_last_run_time', Date.now().toString());
            
            saveSecureData('onrivi_license_status', {
              ...newStatus,
              lastVerifiedAt: Date.now()
            });
          }
        }
      } catch (err) {
        console.warn('[loadAndVerifyLicense] Desktop DB error (Network offline):', err);

        // 🚨 오프라인 유예기간(Grace Period) 검증 🚨
        if (savedNextPaymentDate) {
          const expiryMs = parseDateStringToMs(savedNextPaymentDate);
          const remainingDays = Math.max(0, Math.ceil((expiryMs - Date.now()) / (24 * 60 * 60 * 1000)));

          if (remainingDays > 0) {
            console.log('[loadAndVerifyLicense] Offline grace period active. Days remaining:', remainingDays);
            showToast(`네트워크 오프라인 모드로 실행 중입니다. (구독 만료까지 D-${remainingDays})`, "warning");
            setLicenseStatus({
              isActivated: true, isExpired: false, remainingDays,
              userId: savedUserId, licenseKey: savedLicenseKey, paymentNo: '',
              planName: savedPlanName || '오프라인 프리미엄 요금제',
              nextPaymentDate: savedNextPaymentDate
            });
            return;
          }
        }

        setLicenseStatus({
          isActivated: false, isExpired: true, remainingDays: 0,
          userId: savedUserId, licenseKey: '', paymentNo: '',
          planName: '제한사용자', nextPaymentDate: ''
        });
      }
      return; // 데스크탑은 여기서 검증 완전 종료!
    }

    // ============================================
    // ── 웹 SaaS 전용 기존 로직 ──
    // ============================================
    if (!savedPaymentNo) {
      savedKey = '';
      savedUserId = '';
      savedPaymentNo = '';
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: userSub } = await supabase
            .from('subscriptions')
            .select('id, plan_name, plan_status, current_period_end, max_devices, license_key, payment_no')
            .eq('user_id', session.user.id)
            .eq('plan_status', 'ACTIVE')
            .neq('plan_name', 'ELITEPRO')
            .not('plan_name', 'ilike', '%DESKTOP%')
            .order('current_period_end', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (userSub?.payment_no) {
            savedPaymentNo = userSub.payment_no;
            savedKey = userSub.license_key || '';
            savedUserId = session.user.id;
          }
        }
      } catch (e) {
        console.warn('[loadAndVerifyLicense] user_id fallback failed:', e);
      }
    }

    // chromeStorage.set 로직 완전 제거 (순수 localStorage만 유지)
    localStorage.setItem('onrivi_license_key', savedKey);
    localStorage.setItem('onrivi_user_id', savedUserId);
    localStorage.setItem('onrivi_payment_no', savedPaymentNo);
    localStorage.setItem('onrivi_last_run_time', nowTime.toString());

    if (!savedKey) savedKey = '';
    setLicenseKey(savedKey);

    if (savedPaymentNo) {
      // 🛡️ 웹 전용: savedPaymentNo가 localStorage에 남아있어도 Supabase 세션이 유효한지 다시 확인 (데스크탑은 라이선스 기반, Supabase 불필요)
      const isDesktop = typeof window !== 'undefined' && !!(window as any).electronAPI;
      if (!isDesktop) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user) {
            Object.keys(localStorage).filter(k => k.startsWith('onrivi_')).forEach(k => localStorage.removeItem(k));
            window.location.href = '/login';
            return;
          }
        } catch (_) {
          Object.keys(localStorage).filter(k => k.startsWith('onrivi_')).forEach(k => localStorage.removeItem(k));
          window.location.href = '/login';
          return;
        }
      }
      try {
        let sessionId = localStorage.getItem('onrivi_session_id') || localStorage.getItem('onrivi_device_id');
        if (!sessionId) {
          sessionId = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
            ? crypto.randomUUID()
            : 'session-' + Date.now() + '-' + Math.random().toString(36).substring(2, 15);
          localStorage.setItem('onrivi_session_id', sessionId);
        }

        const { data: license } = await supabase
          .from('subscriptions')
          .select('id, is_active, license_key, payment_no, plan_name, plan_status, current_period_end, created_at, max_devices')
          .eq('payment_no', savedPaymentNo)
          .maybeSingle();

          if (!license) {
            console.warn('[loadAndVerifyLicense] web: license not found for payment_no. Auto-clearing cache...');
            localStorage.removeItem('onrivi_payment_no');
            localStorage.removeItem('onrivi_license_key');
            localStorage.removeItem('onrivi_session_id');
            return;
          } else {
            let sub = license;
            let currentLicenseId = sub.id;
            let currentPaymentNo = savedPaymentNo;

            let expiryMs = 0;
            if (sub) {
              if (sub.plan_name && (sub.plan_name.toUpperCase() === 'DESKTOP_ONLY' || sub.plan_name.toUpperCase().includes('DESKTOP'))) {
                console.warn('[loadAndVerifyLicense] Desktop plan cannot be used in Web SaaS.');
                setLicenseStatus({
                  isActivated: false, isExpired: true, remainingDays: 0, userId: savedUserId,
                  licenseKey: '', paymentNo: savedPaymentNo || license?.payment_no || '',
                  planName: '데스크탑 전용 플랜 (웹 사용 불가)', nextPaymentDate: ''
                });
                return;
              }
              const targetDate = sub.current_period_end;
              if (targetDate) expiryMs = parseDateStringToMs(targetDate);
              else expiryMs = Number.MAX_SAFE_INTEGER;
              
              if (sub.plan_status === 'FREE' && sub.created_at) {
                if (expiryMs === 0 || expiryMs === Number.MAX_SAFE_INTEGER) {
                  expiryMs = new Date(sub.created_at).getTime() + 7 * 24 * 60 * 60 * 1000;
                }
              }
            }

            let isExpired = expiryMs === 0 ? true : (Date.now() > expiryMs);

            // 🚨 @PATCH : 만료된 경우 API를 호출하여 상태를 EXPIRED로 변경하고 새로운 READER 발급
            if (isExpired && sub.plan_status !== 'EXPIRED') {
              try {
                const expireRes = await fetch(getApiUrl('/api/subscription/expire'), {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ p_subscription_id: sub.id, p_user_id: savedUserId })
                });
                const expireData = await expireRes.json();
                if (expireData.success && expireData.new_subscription_id) {
                  currentLicenseId = expireData.new_subscription_id;
                  if (expireData.new_payment_no) {
                    currentPaymentNo = expireData.new_payment_no;
                    localStorage.setItem('onrivi_payment_no', currentPaymentNo);
                    savedPaymentNo = currentPaymentNo;
                  }
                  sub.plan_name = 'READER';
                  sub.plan_status = 'ACTIVE';
                  isExpired = false; // 새로운 READER 구독이 활성화되었으므로 만료 아님 (하지만 READER 플랜이므로 insert시 제한됨)
                }
              } catch (err) {
                console.error('[LICENSE] Failed to execute expire API:', err);
              }
            }

            const remainingDays = expiryMs === 0 ? 0 : Math.max(0, Math.ceil((expiryMs - Date.now()) / (24 * 60 * 60 * 1000)));
            const isFreeTrial = sub?.plan_name === 'FREE' || currentPaymentNo.startsWith('FREE_TRIAL_');
            let planName = isFreeTrial ? '무료 체험판 플랜' : (sub?.plan_name === 'READER' ? '기간 만료 (제한 사용자)' : `${sub?.plan_name || 'PRO'} 프리미엄 플랜`);

            let activationFailed = false;
            let activationError = '';

            console.log('[loadAndVerifyLicense] insert: user=', savedUserId, 'session=', sessionId, 'licenseId=', currentLicenseId, 'isREADER=', sub?.plan_name === 'READER');
            const actRes = await fetch(getApiUrl('/api/rpc/license/insert'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ p_license_id: currentLicenseId, p_device_uuid: sessionId, p_device_name: 'Web SaaS', p_user_id: savedUserId, p_is_expired: sub?.plan_name === 'READER' })
            });
            const actResult = actRes.ok ? await actRes.json() : null;
            const actErr = !actRes.ok ? new Error('서버 오류') : null;
            
            if (actErr || (actResult && !actResult.success)) {
              activationFailed = true;
              activationError = (actResult?.code === 'ERR_MAX_DEVICES_EXCEEDED' || actResult?.code === 'EXCEED_MAX_DEVICES')
                ? `동시 접속 초과 (${actResult?.max_devices || '?'}대) - 제한 사용자` 
                : `라이선스 오류: ${actResult?.message || actErr?.message || '알 수 없는 오류'}`;
            }

            if (activationFailed) {
              const chk2Res = await fetch(getApiUrl('/api/license/check-session'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ p_payment_no: currentPaymentNo, p_device_uuid: sessionId })
              });
              const chk2 = chk2Res.ok ? await chk2Res.json() : null;
              
              if (!(chk2 && chk2.success && chk2.has_session)) {
                isExpired = true;
                planName = activationError;
              }
            }

            const isActivated = !isExpired;

            console.log('[LICENSE] VERIFIED setLicenseStatus isActivated=%o isExpired=%o planName=%o', isActivated, isExpired, planName);
            setLicenseStatus({
              isActivated, isExpired, remainingDays, userId: savedUserId,
              licenseKey: isActivated ? savedKey : '', paymentNo: currentPaymentNo || '',
              planName, nextPaymentDate: sub?.current_period_end || sub?.trial_end_at || (expiryMs > 0 ? new Date(expiryMs).toISOString() : '')
            });

            saveSecureData('onrivi_license_status', {
              isActivated, isExpired, remainingDays, userId: savedUserId,
              licenseKey: isActivated ? savedKey : '', paymentNo: currentPaymentNo || '',
              planName, nextPaymentDate: sub?.current_period_end || sub?.trial_end_at || (expiryMs > 0 ? new Date(expiryMs).toISOString() : ''),
              lastVerifiedAt: Date.now()
            });
            return;
        }
      } catch (err) {
        console.warn('[loadAndVerifyLicense] web unexpected error:', err);
      }
    }

    // 웹 버전에서도 3일 캐시를 사용하지 않고 매번 DB/서버를 통해 인증을 진행하도록 수정 (요청 사항 반영)
    const cached = loadSecureData<any>('onrivi_license_status');

    const finalPlanName = cached?.planName || (savedPaymentNo ? '프리미엄 요금제' : '미인증 라이선스');
    console.log('[LICENSE] FINAL setLicenseStatus isExpired=true planName=%o', finalPlanName);
    setLicenseStatus({
      isActivated: false, isExpired: true, remainingDays: 0, userId: savedUserId,
      licenseKey: savedKey || cached?.licenseKey || '', paymentNo: savedPaymentNo,
      planName: finalPlanName,
      nextPaymentDate: cached?.nextPaymentDate || (savedPaymentNo ? '-' : undefined)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId]);


  useEffect(() => {
    if (!deviceId) {
      console.log('[WELCOME-TRIGGER] skipped: deviceId empty');
      return;
    }
    console.log('[WELCOME-TRIGGER] calling loadAndVerifyLicense deviceId=%o', deviceId);
    loadAndVerifyLicense().finally(() => {
      console.log('[WELCOME-TRIGGER] loadAndVerifyLicense done, setting isLicenseChecking=false');
      setIsLicenseChecking(false);
    });
  }, [loadAndVerifyLicense, deviceId, setIsLicenseChecking]);

  // 💻 [Heartbeat 가드] 20초마다 라이선스 세션의 활동 시각(last_active_at)을 갱신하고 강탈 여부를 검사
  useEffect(() => {
    if (typeof window === 'undefined' || !deviceId || isLicenseChecking) return;

    const intervalId = setInterval(async () => {
      const paymentNo = localStorage.getItem('onrivi_payment_no');
      if (!paymentNo) return;

      try {
        // p_device_uuid는 로컬의 sessionId를 넘겨야 현재 브라우저 탭 세션을 추적함
        const currentSessionId = localStorage.getItem('onrivi_session_id') || deviceId;
        const chkRes = await fetch(getApiUrl('/api/license/check-session'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ p_payment_no: paymentNo, p_device_uuid: currentSessionId })
        });
        const chk = chkRes.ok ? await chkRes.json() : null;

        if (chk) {
          if (chk.success && chk.has_session === false && chk.is_restricted === false) {
            // 세션 자체가 DB에서 완전히 삭제(DELETE)된 경우 (대시보드 기기 해제 등) -> 무조건 강제 로그아웃
            setLicenseStatus(prev => {
              showToast("🛑 동시접속 관리에 의해 현재 기기의 세션이 강제 해제되었습니다. 보호를 위해 로그아웃됩니다.", "error");
              setTimeout(async () => {
                const pNo = localStorage.getItem('onrivi_payment_no');
                const sId = localStorage.getItem('onrivi_session_id') || deviceId;
                if (pNo && sId) {
                  await fetch(getApiUrl('/api/device/deactivate'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ p_payment_no: pNo, p_device_uuid: sId }) });
                }
                localStorage.removeItem('onrivi_session_id');
                Object.keys(localStorage).filter(k => k.startsWith('sb-')).forEach(k => localStorage.removeItem(k));
                await supabase.auth.signOut({ scope: 'local' });
                window.location.href = '/login';
              }, 3000);
              return { ...prev, isActivated: false, isExpired: true, planName: '세션 해제 (로그아웃 중...)' };
            });
          } else if (chk.success && chk.has_session === false && chk.is_restricted !== false) {
            // 세션은 존재하지만 활성화되지 않은 제한 사용자 상태인 경우 -> 제한 모드 유지
            setLicenseStatus(prev => {
              if (!prev.isExpired) {
                showToast("⚠️ 동시 접속 한도를 초과하여 본 세션은 제한 모드(읽기 전용)로 동작합니다.", "warning");
              }
              return {
                ...prev,
                isActivated: false,
                isExpired: true,
                isRestricted: true
              };
            });
          } else {
            // 정상 복구/유지인 경우 상태 동기화
            setLicenseStatus(prev => {
              if (prev.isExpired) {
                // 🚨 @PATCH : 이미 날짜 만료로 판단되어 EXPIRED 처리된 경우 강제로 복구시키지 않도록 방어 로직 추가
                let isActuallyExpired = false;
                if (prev.nextPaymentDate) {
                  const expMs = parseDateStringToMs(prev.nextPaymentDate);
                  if (expMs > 0 && Date.now() > expMs) isActuallyExpired = true;
                } else if (prev.remainingDays === 0 && !prev.planName.includes('캐시')) {
                  isActuallyExpired = true;
                }

                if (isActuallyExpired) {
                  return prev; // 날짜 만료로 판명되었으면 해제 불가
                }

                return {
                  ...prev,
                  isActivated: true,
                  isExpired: false,
                  planName: chk.plan_name || prev.planName || '프리미엄 요금제'
                };
              }
              return prev;
            });
          }
        }
      } catch (err) {
        console.warn('[Heartbeat] session verify failed:', err);
      }
    }, 20000); // 20초마다 주기적 검사 수행 (60초 DB 만료 대비 충분한 신뢰성 확보)

    return () => clearInterval(intervalId);
  }, [deviceId, isLicenseChecking, setLicenseStatus, showToast]);

  // 📊 [OMD-CITATION-MainEditorApp] .bib 워크스페이스 자동 로드
  // 🎯 @KICK  : 워크스페이스 전체를 재귀 탐색하여 .bib 파일을 모두 병합 로드
  // 🚨 @PATCH : **2026-07-07** — allMdFiles 의존성 완전 제거.
  //              Electron IPC(listDirectory) 직접 재귀 스캔 + fileList 트리 병렭 탐색.
  //              웹 환경: bib.handle → VFS → getApiUrl REST API 순서로 폴백 처리.
  // 🔗 @CALLS : electronAPI.listDirectory, electronAPI.readFromPath, vfsReadFile, getApiUrl
  useEffect(() => {
    if (!rootFolder?.name && !currentFileNode?.path) return;

    const tryLoadBib = async () => {
      const api = (window as any).electronAPI;
      const bibPaths: { path: string; handle?: any }[] = [];
      const seen = new Set<string>();

      const addBib = (p: string, handle?: any) => {
        const key = p.toLowerCase().replace(/\\/g, '/');
        if (!seen.has(key)) { seen.add(key); bibPaths.push({ path: p, handle }); }
      };

      // ① Electron: listDirectory IPC로 워크스페이스 전체 재귀 탐색
      if (api?.listDirectory && api?.readFromPath && rootFolder?.name) {
        const scanDir = async (dirPath: string) => {
          try {
            const entries: any[] = await api.listDirectory(dirPath);
            for (const entry of entries) {
              if (entry.kind === 'file' && entry.name.toLowerCase().endsWith('.bib') && entry.path) {
                addBib(entry.path);
              } else if (entry.kind === 'directory' && entry.path) {
                await scanDir(entry.path);
              }
            }
          } catch { }
        };
        if (rootFolder?.name) await scanDir(rootFolder.name);
        if (resourceFolder) {
          // 리소스 폴더의 경우 전체가 아닌 bible 폴더만 한정하여 스캔
          await scanDir(`${resourceFolder}\\bible`);
        }
      }

      // ② fileList 트리(1단계 + 운영 중인 children) 재귀 탐색
      const scanTree = (nodes: any[]) => {
        nodes.forEach(n => {
          if (n.kind === 'file' && n.name.toLowerCase().endsWith('.bib') && n.path) {
            addBib(n.path, n.handle);
          } else if (n.kind === 'directory' && n.children) {
            scanTree(n.children);
          }
        });
      };
      scanTree(fileList);

      // + Browser FileSystem Access API (리소스 폴더 탐색 - bible 한정)
      if (resourceFolderHandle && !api?.listDirectory) {
         const scanHandle = async (handle: any) => {
           try {
             for await (const [name, childHandle] of handle.entries()) {
               if (childHandle.kind === 'file' && name.toLowerCase().endsWith('.bib')) {
                 addBib(name, childHandle);
               } else if (childHandle.kind === 'directory') {
                 await scanHandle(childHandle);
               }
             }
           } catch (e) {}
         };
         try {
           const bibleHandle = await resourceFolderHandle.getDirectoryHandle('bible');
           await scanHandle(bibleHandle);
         } catch (e) {
           // bible 폴더가 없으면 무시
         }
      }

      if (bibPaths.length === 0) { setBibContent(''); return; }

      // ③ 발견된 모든 .bib 파일 읽고 합치기
      let mergedBibContent = '';
      for (const bib of bibPaths) {
        try {
          if (bib.handle) {
            // Browser FileSystem Access API (실제 폴더 선택)
            const file = await bib.handle.getFile();
            const text = await file.text();
            if (text) mergedBibContent += '\n' + text;
          } else if (api?.readFromPath) {
            // Electron: 백슬래시 경로로 전달
            const nativePath = bib.path.replace(/\//g, '\\');
            const file = await api.readFromPath(nativePath);
            if (file?.content) mergedBibContent += '\n' + file.content;
          } else {
            // 웹 환경: VFS 먼저 시도 → REST API 폴백
            const { vfsReadFile: vfsRead } = await import('@/lib/virtualFileSystem');
            const vfsContent = vfsRead(bib.path);
            if (vfsContent) {
              mergedBibContent += '\n' + vfsContent;
            } else {
              try {
                const res = await fetch(getApiUrl(`/api/file-content?path=${encodeURIComponent(bib.path)}`));
                if (res.ok) { const d = await res.json(); if (d?.content) mergedBibContent += '\n' + d.content; }
              } catch { }
            }
          }
        } catch { }
      }
      setBibContent(mergedBibContent.trim());
    };
    tryLoadBib();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFileNode?.path, rootFolder?.name, fileList, workspaceType, resourceFolder, resourceFolderHandle]);

  // 📊 [OMD-LICENSE-MainEditorApp-POLLING]
  // 🚨 @PATCH: 2026-07-05 - 사용자 지시에 따라 무거운 백그라운드 실시간 감시(Polling) 및 강제 로그아웃 차단 로직 전면 제거.
  // 오직 초기 진입 시(loadAndVerifyLicense)에만 권한을 1회 판별하여 웰컴 페이지 제어로 대체합니다.

  // G. 만료일 자정(24:00) 차단 백그라운드 타이머 (유예 없이 즉시 차단)
  useEffect(() => {
    if (!licenseStatus.nextPaymentDate || licenseStatus.isActivated) return;

    const expiryDate = new Date(licenseStatus.nextPaymentDate);
    expiryDate.setHours(24, 0, 0, 0); // 만료일 자정
    const expiryTime = expiryDate.getTime();

    const checkExpiry = () => {
      const now = Date.now();
      if (now >= expiryTime && !licenseStatus.isExpired) {
        showToast("🔒 라이선스가 만료되었습니다. 에디터가 미리보기 전용 모드로 잠깁니다.", "error");
        setPreviewModeRaw('preview');
        setLicenseStatus(prev => ({ ...prev, isExpired: true }));
      }
    };

    const intervalId = setInterval(checkExpiry, 60 * 60 * 1000); // 1시간 주기 검사
    checkExpiry();

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [licenseStatus.nextPaymentDate, licenseStatus.isActivated, licenseStatus.isExpired, showToast]);

  // ====================================================================
  // 📊 [OMD-LICENSE-MainEditorApp-0090] MainEditorApp.tsx ➔ license_force_preview
  // 🎯 @KICK  : 미인증 또는 계약만료 시 에디터 모드를 무조건 미리보기 전용으로 강제
  // 🛡️ @GUARD : mounted 이후에만 실행; 불필요한 재설정 방지를 위해 현재 모드와 목표 모드 비교;
  //             css-style 모드는 허용 (서식 설정 중에는 강제 전환하지 않음) → 미인증 시 preview만 허용
  //             유효 라이선스 시에는 모드 자유롭게 전환 가능 (preview 고정 해제)
  // 🚨 @PATCH : 2026-06-21 — 신규: 미인증/계약만료 시 preview 강제; previewMode deps 추가
  //             2026-06-22 — `else if` (유효 시 both 복원) 제거 → 유효 라이선스도 미리보기 전환 가능
  // 🔗 @CALLS : setPreviewModeRaw
  // ====================================================================
  useEffect(() => {
    if (!mounted || isLicenseChecking) return;

    if (licenseStatus.isExpired) {
      // 🔒 제한 사용자 (만료/미인증): 에디터 모드를 미리보기 전용으로 강제
      // (초기 웰컴 페이지 노출은 하단의 통합 라우팅 가드에서 담당합니다)
      if (previewModeRef.current !== 'preview') {
        setPreviewModeRaw('preview');
        previewModeRef.current = 'preview';
      }
    }
  }, [licenseStatus.isExpired, mounted, isLicenseChecking]);

  // ====================================================================
  // 📊 [OMD-PAY-MainEditorApp-0017] MainEditorApp.tsx ➔ supabaseRealtime_license
  // 🎯 @KICK  : 실시간 활성화를 위해 license_activations의 Supabase postgres_changes 구독, 데스크톱 프로토콜 폴백 포함
  // 🛡️ @GUARD : 언마운트 시 채널 및 리스너 정리; device_uuid 필터로 중복 제거
  // 🚨 @PATCH : **2026-07-22** — Realtime 구독 테이블명 license_activations→license_activations 전환; Electron 환경을 위한 데스크톱 onLicenseActivated 백업 및 결제번호(paymentNo) 전달 보완
  // 🔗 @CALLS : supabase.channel, supabase.from.license_activations.select, handleSuccessActivation, showToast
  // ====================================================================
  useEffect(() => {
    if (!deviceId) return;

    const api = (window as any).electronAPI;
    const isDesktop = !!api;

    // 데스크탑: Electron IPC 리스너만 사용 (Supabase WebSocket 불필요)
    let removeListener: any = null;
    if (isDesktop) {
      if (typeof api.onLicenseActivated === 'function') {
        removeListener = api.onLicenseActivated(async (updatedData: any) => {
          await handleSuccessActivation(updatedData.verifyKey, updatedData.userId, updatedData.paymentNo || '', updatedData.licenseKey || '');
          showToast("🎉 정품 라이선스 연동 성공! 깨끗한 환경을 위해 에디터를 다시 시작합니다...", "success");
          setTimeout(() => { window.location.reload(); }, 2000);
        });
      }
      return () => {
        if (typeof removeListener === 'function') removeListener();
      };
    }

    // 웹 전용: Supabase Realtime 구독
    const channel = supabase
      .channel(`device-activation-${deviceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'license_activations',
          filter: `device_uuid=eq.${deviceId}`
        },
        async (payload: any) => {
          // 🚨 @PATCH : 대시보드(기기 관리)에서 세션을 강제 해제(DELETE)할 경우, 하트비트를 기다리지 않고 즉시 강제 로그아웃
          if (payload.eventType === 'DELETE') {
            showToast("🛑 동시접속 관리에 의해 현재 기기의 세션이 강제 해제되었습니다. 보호를 위해 로그아웃됩니다.", "error");
            setTimeout(async () => {
              localStorage.removeItem('onrivi_session_id');
              Object.keys(localStorage).filter(k => k.startsWith('sb-')).forEach(k => localStorage.removeItem(k));
              await supabase.auth.signOut({ scope: 'local' });
              window.location.href = '/login';
            }, 3000);
            return;
          }

          const newRecord = payload.new;
          if (newRecord && newRecord.subscription_id) {
            const { data, error } = await supabase
              .from('subscriptions')
              .select(`
                verify_key,
                license_key,
                user_id
              `)
              .eq('id', newRecord.subscription_id)
              .single();

            if (!error && data && data.verify_key) {
              const userEmail = licenseStatus.userId || 'user@onrivi.com';
              handleSuccessActivation(data.verify_key, userEmail, data.id || '', data.license_key || '');
              showToast("🎉 정품 라이선스가 결제 즉시 안전하게 승인되었습니다!", "success");
            }

          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId, _licenseKey_init, licenseStatus.userId]);

  // ====================================================================
  // 📊 [OMD-AUTH-MainEditorApp-0018] MainEditorApp.tsx ➔ handleSuccessActivation
  // 🎯 @KICK  : 성공적인 결제/활성화 후 모든 저장소 계층에 확인된 라이선스 활성화 유지
  // 🛡️ @GUARD : 원자적 setLicenseStatus + 플랫폼 저장소 저장 (electronAPI, chrome.storage, localStorage) 및 실시간 동기화
  // 🚨 @PATCH : 2026-06-28 — chrome.storage.local.set 제거 (로컬스토리지 격리)
  //              결제번호(paymentNo) 인자 수용 및 loadAndVerifyLicense() 호출을 통한 상태 실시간 동기화
  // 🔗 @CALLS : setLicenseStatus, api.saveLicenseFull, localStorage.setItem, loadAndVerifyLicense
  // ====================================================================
  const handleSuccessActivation = async (verifyKey: string, userId: string, paymentNo: string, explicitLicenseKey?: string) => {
    const api = (window as any).electronAPI;
    const finalLicenseKey = explicitLicenseKey || licenseKey;

    if (api && typeof api.saveLicenseFull === 'function') {
      await api.saveLicenseFull({
        licenseKey: finalLicenseKey,
        verifyKey: verifyKey,
        userId: userId,
        paymentNo: paymentNo
      });
    } 
    
    // 데스크탑(Electron) 환경이라 하더라도 웹뷰 내부의 범용적인 활용 및 폴백을 위해 항상 로컬스토리지에 저장합니다.
    localStorage.setItem('onrivi_license_key', finalLicenseKey);
    localStorage.setItem('onrivi_verify_key', verifyKey);
    localStorage.setItem('onrivi_user_id', userId);
    localStorage.setItem('onrivi_payment_no', paymentNo);

    await loadAndVerifyLicense();
  };

  // 💡 [Step 2 리팩토링으로 내보내기, 어바웃, 컴펌 등 기타 모달 상태 싹 다 삭제됨 (useEditorModals로 이관)]

  const [isEditorReady, setIsEditorReady] = useState(false);

  const [isMergeMode, setIsMergeMode] = useState(false);
  const [selectedMergeNodes, setSelectedMergeNodes] = useState<FileNode[]>([]);
  // 💡 [Step 2 리팩토링으로 isMergeModalOpen 삭제됨]
  const [cursorLine, setCursorLine] = useState(1);
  const [cursorColumn, setCursorColumn] = useState(1);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | ''>('');
  const [floatingHeadingLevel, setFloatingHeadingLevel] = useState(3);

  // ====================================================================
  // 📊 [OMD-FILE-MainEditorApp-0019] MainEditorApp.tsx ➔ toggleMergeNodeSelect
  // 🎯 @KICK  : 병합 선택 목록에서 FileNode 추가/제거 토글
  // 🛡️ @GUARD : 중복 추가 방지를 위해 경로 또는 이름으로 중복 제거
  // 🚨 @PATCH : None
  // 🔗 @CALLS : setSelectedMergeNodes
  // ====================================================================
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

  // ====================================================================
  // 📊 [OMD-FILE-MainEditorApp-0020] MainEditorApp.tsx ➔ handleOpenMergeModal
  // 🎯 @KICK  : 2개 이상의 파일이 선택된 경우에만 병합 모달 열기
  // 🛡️ @GUARD : 모달 열기 전 최소 선택 개수(2) 검증
  // 🚨 @PATCH : None
  // 🔗 @CALLS : showToast, setIsMergeModalOpen
  // ====================================================================
  const handleOpenMergeModal = () => {
    if (selectedMergeNodes.length < 2) {
      showToast("병합하려면 최소 2개 이상의 파일을 선택해야 합니다.", 'warning');
      return;
    }
    setIsMergeModalOpen(true);
  };





  const previewRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
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
    setActiveTabId,
    setPreviewModeRaw
  );

  // 💡 [TDZ 방어] useEditorTabs 반환값 중 상단에서 선언되지 않은 것들만 추가 추출
  const updateContent = useEditorTabsResult.updateContent;
  const switchTab = useEditorTabsResult.switchTab;
  const createNewTab = useEditorTabsResult.createNewTab;

  // Ref를 공유 tabsRef/activeTabIdRef에 동기화 (React state 직접 사용 — useEffect로 업데이트된 useEditorTabs ref는 stale할 수 있음)
  // 🚨 @PATCH : useEditorTabsResult.ref → React state 직접 참조로 변경 (stale ref가 closeTab에서 삭제된 탭을 복원하는 버그 수정) | 2026-06-18
  tabsRef.current = tabs;
  activeTabIdRef.current = activeTabId;

  // ====================================================================
  // 📊 [OMD-EDIT-0012 TDZ-GUARD] MainEditorApp.tsx ➔ autoSaveRef/lastSavedContentRef 선행 선언
  // 🎯 @KICK  : autoSaveRef는 L1117 useEffect에서 먼저 참조되고, lastSavedContentRef는
  //             useFileExplorer 인자로 먼저 참조되므로 훅 호출 이전에 선행 선언
  // 🛡️ @GUARD : 기존 L1289 위치에 있던 선언을 사용 지점 이전으로 이동하여 TDZ 제거
  // 🚨 @PATCH : autoSaveRef 선언 위치를 L1289→L1101로 이동 | 2026-06-15 | rS TDZ(autoSaveRef_sync useEffect) 해결
  // 🔗 @CALLS : useRef (React)
  // ====================================================================
  // 💡 [TDZ 방어] lastSavedContentRef는 useFileExplorer에서 먼저 참조되므로 상단에 선언
  const lastSavedContentRef = useRef<string>('');
  const prevActiveTabRef = useRef<string | null>(null);

  // 💡 [WBS CORE-02 / 요구사항 4] State Stale Closure 방지를 위한 Ref 백업 시스템 도입
  const currentFileNodeRef = useRef(currentFileNode);
  const currentFileParentHandleRef = useRef<any>(null);
  const currentFileNameRef = useRef(currentFileName);
  const workspaceTypeRef = useRef(workspaceType);
  const rootFolderRef = useRef(rootFolder);
  const licenseStatusRef = useRef(licenseStatus);
  const tabSizeRef = useRef(4);
  // 🚨 @PATCH : A4 조판 가드 스케일링 로직
  useEffect(() => {
    if (!isA4GuardEnabled) {
      setPreviewZoomScale(1);
      return;
    }

    const container = previewRef.current;
    if (!container) return;

    // ResizeObserver를 통해 custom-preview-container 너비를 감지하여 A4(210mm) 비율에 맞게 zoom 계산
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        // 브라우저 기본 96 DPI 기준: 210mm = 793.7px (대략 794px)
        const A4_PIXEL_WIDTH = 794;

        // 여백(Padding) 등을 고려하여 컨테이너 너비보다 A4가 크면 축소, 아니면 1 유지
        // 40px은 양옆 여유 여백(패딩 및 스크롤바)
        if (width < A4_PIXEL_WIDTH + 40) {
          const scale = Math.max(0.3, (width - 40) / A4_PIXEL_WIDTH);
          setPreviewZoomScale(scale);
        } else {
          setPreviewZoomScale(1);
        }
      }
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [isA4GuardEnabled, previewRef]);

  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0021] MainEditorApp.tsx ➔ currentFileNodeRef_sync
  // 🎯 @KICK  : 핸들러에서 스테일 클로저 방지를 위해 currentFileNodeRef 동기화
  // 🛡️ @GUARD : WBS CORE-02 스테일 클로저 방지 시스템의 일부
  // 🚨 @PATCH : None
  // 🔗 @CALLS : None
  // ====================================================================
  useEffect(() => { currentFileNodeRef.current = currentFileNode; }, [currentFileNode]);
  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0022] MainEditorApp.tsx ➔ currentFileNameRef_sync
  // 🎯 @KICK  : 핸들러에서 스테일 클로저 방지를 위해 currentFileNameRef 동기화
  // 🛡️ @GUARD : WBS CORE-02 스테일 클로저 방지의 일부
  // 🚨 @PATCH : None
  // 🔗 @CALLS : None
  // ====================================================================
  useEffect(() => { currentFileNameRef.current = currentFileName; }, [currentFileName]);
  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0023] MainEditorApp.tsx ➔ workspaceTypeRef_sync
  // 🎯 @KICK  : 핸들러에서 스테일 클로저 방지를 위해 workspaceTypeRef 동기화
  // 🛡️ @GUARD : WBS CORE-02 스테일 클로저 방지의 일부
  // 🚨 @PATCH : None
  // 🔗 @CALLS : None
  // ====================================================================
  useEffect(() => { workspaceTypeRef.current = workspaceType; }, [workspaceType]);
  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0024] MainEditorApp.tsx ➔ rootFolderRef_sync
  // 🎯 @KICK  : 핸들러에서 스테일 클로저 방지를 위해 rootFolderRef 동기화
  // 🛡️ @GUARD : WBS CORE-02 스테일 클로저 방지의 일부
  // 🚨 @PATCH : None
  // 🔗 @CALLS : None
  // ====================================================================
  useEffect(() => { rootFolderRef.current = rootFolder; }, [rootFolder]);
  const resourceFolderRef = useRef(resourceFolder);
  useEffect(() => { resourceFolderRef.current = resourceFolder; }, [resourceFolder]);

  const resourceFolderHandleRef = useRef(resourceFolderHandle);
  useEffect(() => { resourceFolderHandleRef.current = resourceFolderHandle; }, [resourceFolderHandle]);
  // ====================================================================
  // 📊 [OMD-LICENSE-MainEditorApp-0075] MainEditorApp.tsx ➔ licenseStatusRef_sync
  // 🎯 @KICK  : 핸들러에서 스테일 클로저 방지를 위해 licenseStatusRef 동기화
  // 🛡️ @GUARD : WBS CORE-02 스테일 클로저 방지 시스템의 일부
  // 🚨 @PATCH : **2026-06-21** — 신규: 만료 시 Ctrl+S/내보내기 차단을 위한 ref 추가
  // 🔗 @CALLS : None
  // ====================================================================
  useEffect(() => { licenseStatusRef.current = licenseStatus; }, [licenseStatus]);
  // ====================================================================
  // 📊 [OMD-CORE-MainEditorApp-0025] MainEditorApp.tsx ➔ tabSizeRef_sync
  // 🎯 @KICK  : 활성 CSS 프로필 tabSize 설정에서 tabSizeRef 업데이트
  // 🛡️ @GUARD : None
  // 🚨 @PATCH : None
  // 🔗 @CALLS : parseInt
  // ====================================================================
  useEffect(() => {
    // 💡 [버그 픽스] 마크다운에서 하위 리스트(Nested List)로 파싱되려면 들여쓰기가 최소 3~4칸 필요합니다.
    // 사용자가 CSS 프로필에서 탭 너비를 2 등으로 설정하더라도 에디터 편집 환경에서는 무조건 4를 강제해야 합니다.
    tabSizeRef.current = 4;
  }, []);

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
    setWorkspaceType,
    licenseStatus
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

  const selectResourceFolder = async () => {
    const api = (window as any).electronAPI;
    if (api && api.selectFolder) {
      const result = await api.selectFolder(resourceFolder || '');
      if (result && result.status !== 'canceled' && result.path) {
        setResourceFolder(result.path);
        try { saveSecureData('resourceFolder', result.path); } catch { }
        
        // 💡 새 폴더 연동 시 폴더 내 기존 서식이 있다면 로드
        try {
          const loadedProfiles = await api.readProfiles(result.path);
          if (Array.isArray(loadedProfiles) && loadedProfiles.length > 0) {
            setProfiles(prev => {
              const systemPart = prev.filter(p => isSystemProfileId(p.id));
              return [...systemPart, ...loadedProfiles];
            });
            showToast('공통 폴더에서 기존 서식을 불러왔습니다.', 'success');
          } else {
             showToast('자원 관리 폴더가 설정되었습니다.', 'success');
             // 빈 폴더라면 현재 로컬 서식을 저장 유도
             setProfiles(prev => {
               if (prev.length > SYSTEM_PROFILES.length) {
                 (window as any)._lastSavedProfilesHash = null;
                 return [...prev];
               }
               return prev;
             });
          }
        } catch (e) {
          showToast('자원 관리 폴더가 설정되었습니다.', 'success');
        }
      }
    } else if (typeof (window as any).showDirectoryPicker === 'function') {
      try {
        const handle = await (window as any).showDirectoryPicker();
        setResourceFolderHandle(handle);
        setResourceFolder(handle.name);
        await idb.set('resourceFolderHandle', handle);
        try { saveSecureData('resourceFolder', handle.name); } catch { }
        
        // 💡 새 폴더 연동 시 폴더 내 기존 서식(profiles)이 있다면 로드하여 덮어쓰기 방지
        try {
          const profilesDir = await handle.getDirectoryHandle('profiles', { create: false });
          const fileHandle = await profilesDir.getFileHandle('userCssProfiles.json', { create: false });
          const file = await fileHandle.getFile();
          const text = await file.text();
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProfiles(prev => {
              const systemPart = prev.filter(p => isSystemProfileId(p.id));
              return [...systemPart, ...parsed];
            });
            showToast('공통 폴더에서 기존 서식을 불러왔습니다.', 'success');
          } else {
             showToast('자원 관리 폴더가 설정되었습니다.', 'success');
          }
          (window as any)._resourceFolderSynced = true;
        } catch (err) {
          // 파일이 없으면 기존 로컬/빈 상태 유지
          showToast('자원 관리 폴더가 설정되었습니다.', 'success');
          (window as any)._resourceFolderSynced = true; // 파일이 없는 신규 폴더라도 동기화 권한은 획득함
          
          // 기존에 로컬 스토리지에 들고 있던 서식들을 방금 연동한 폴더에 즉시 저장하도록 유도
          setProfiles(prev => {
            if (prev.length > SYSTEM_PROFILES.length) {
               // 내용물의 변경 없이 참조만 갱신하여 profilesSave effect 트리거
               (window as any)._lastSavedProfilesHash = null; // 강제 저장 유도
               return [...prev];
            }
            return prev;
          });
        }
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          showToast('폴더 선택 중 오류가 발생했습니다.', 'error');
        }
      }
    } else {
      showToast('이 브라우저에서는 폴더 선택 기능을 지원하지 않습니다.', 'warning');
    }
  };

  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0026 ✅ FIXED] MainEditorApp.tsx ➔ setPreviewMode
  // 🎯 @KICK  : 에디터 콘텐츠 보존, css-style 웰컴 탭 자동 생성 및 도움말 콘텐츠 가드와 함께 미리보기 모드 전환
  // 🛡️ @GUARD : css-style 잠금 중 모드 변경 방지, 전환 전 에디터 콘텐츠 강제 동기화, helpContent 재정의 차단, 도움말 탭('도움말.md') 모드 변경 차단
  // 🚨 @PATCH : 도움말 탭 읽기 전용 잠금 가드 추가 (2026-06-17)
  // 🔗 @CALLS : editorRef.current.getValue, setContent, setPreviewModeRaw, setHelpContent, createNewTab, switchTab, clearTimeout
  // ====================================================================
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

      if (licenseStatus.isExpired) {
        if (next !== 'preview') {
          showToast("🔒 라이선스가 만료되었거나 정품 인증되지 않았습니다. 미리보기 전용 모드로 제한됩니다.", "warning");
        }
        return 'preview';
      }
      const activeTab = tabsRef.current.find(t => t.id === activeTabIdRef.current);
      if (activeTab?.name === '도움말.md' && next !== 'preview' && next !== 'css-style') return prev;

      // 💡 일반 보기 모드(edit, both, preview)로 변경하는 경우, 이를 전역 상태용 Ref에 백업해둡니다.
      if (next === 'edit' || next === 'both' || next === 'preview') {
        lastGeneralPreviewModeRef.current = next;
      }

      // 💡 서식 정의(css-style) 모드로 스위칭될 때 -> 기존 탭 생성 로직을 폐기하고, 새 모달을 띄우도록 가로챕니다.
      if (next === 'css-style') {
        setTimeout(() => setIsStyleModalOpen(true), 0);
        return prev; // 에디터 뷰잉 모드는 이전 상태 그대로 유지
      }

      previewModeRef.current = next;
      if (typeof window !== 'undefined' && next !== 'css-style') {
        localStorage.setItem('previewMode', next);
      }
      if (next === 'preview') {
        isEditorMountedRef.current = false;
      } else {
        isEditorMountedRef.current = true;
      }

      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setContent, createNewTab, setTabs, licenseStatus, showToast]);

  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0027 ✅ FIXED] MainEditorApp.tsx ➔ closeTab
  // 🎯 @KICK  : 저장되지 않은 변경사항 확인, 모델 폐기 및 css-style/도움말 모드 자동 종료와 함께 탭 닫기
  // 🛡️ @GUARD : 이벤트 stopPropagation, 수정된 탭 확인, Monaco 모델 폐기, 다음 탭으로 전환 또는 빈 탭 생성
  // 🚨 @PATCH : 도움말 탭 닫을 때 'both' 모드 복원 추가 (2026-06-17); tabsRef 즉시 동기화 + isDisposed() 가드로 Model is disposed! 크래시 방지 (2026-06-18); stale ref로 인한 삭제 탭 복원 버그 수정 (2026-06-18)
  // 🔗 @CALLS : setTabs, switchTab, createNewTab, setConfirmConfig, tab.model.dispose
  // ====================================================================
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

      // 💡 웰컴페이지 전용 'Onrivi Author 시작하기.md' 탭을 닫거나 도움말을 닫을 때의 모드 조정
      if (tabToClose.name === 'Onrivi Author 시작하기.md' || tabToClose.name === '도움말.md') {
        const targetMode = licenseStatus.isExpired ? 'preview' : (previewModeRef.current === 'css-style' ? 'both' : previewModeRef.current);
        setPreviewModeRaw(targetMode);
        previewModeRef.current = targetMode;
        isEditorMountedRef.current = targetMode !== 'preview';
      }

      const nextTabs = tabsRef.current.filter(t => t.id !== tabId);
      const closeIndex = tabsRef.current.findIndex(t => t.id === tabId);
      tabsRef.current = nextTabs;
      setTabs(nextTabs);

      if (activeTabIdRef.current === tabId) {
        if (nextTabs.length > 0) {
          const nextActiveIndex = Math.max(0, closeIndex - 1);
          const nextActiveTab = nextTabs[nextActiveIndex] || nextTabs[0];
          switchTab(nextActiveTab.id);
        } else {
          setContent('');
          setCurrentFileName('새 파일.md');
          setCurrentFileNode(null);
          setActiveTabId(null);
          if (editorRef.current) {
            editorRef.current.setValue('');
          }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    handleThemeChange,
    autoClosingBrackets,
    setAutoClosingBrackets,
    geminiApiKey,
    setGeminiApiKey,
    aiModelName,
    setAiModelName
  } = useEditorSettingsResult;

  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAiAction = async (action: AiActionType) => {
    if (!geminiApiKey) {
      showToast("환경설정(애플리케이션)에서 Google Gemma API Key를 먼저 입력해주세요.", 'error');
      return;
    }
    const editor = editorRef.current;
    if (!editor) return;
    const model = editor.getModel();
    const selection = editor.getSelection();
    if (!model || !selection || selection.isEmpty()) {
      showToast("가공할 텍스트를 먼저 드래그(선택) 해주세요.", 'warning');
      return;
    }
    const selectedText = model.getValueInRange(selection);

    const currentGenId = ++generationIdRef.current;

    // 프리뷰 카드 열고 상태 초기화
    setAiPreviewState({
      isOpen: true,
      originalRange: selection,
      streamingText: '',
      action,
      originalText: selectedText,
      isFinished: false
    });
    setFloatingToolbar(prev => ({ ...prev, visible: false }));

    try {
      await processTextWithAIStream(
        geminiApiKey,
        aiModelName,
        selectedText,
        action,
        (chunkText) => {
          if (currentGenId !== generationIdRef.current) return;
          if (chunkText === '') {
            return;
          }
          setAiPreviewState(prev => ({
            ...prev,
            streamingText: chunkText
          }));
        }
      );

      if (currentGenId !== generationIdRef.current) return;

      setAiPreviewState(prev => ({
        ...prev,
        isFinished: true
      }));
      showToast("AI 가공이 완료되었습니다. 결과물을 검토해 주세요.", 'success');
    } catch (err: any) {
      if (currentGenId !== generationIdRef.current) return;
      showToast(err.message || "AI 요청 실패", 'error');
      setAiPreviewState(prev => ({ ...prev, isOpen: false }));
    }
  };

  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0028] MainEditorApp.tsx ➔ autoSaveRef_sync
  // 🎯 @KICK  : 자동 저장 로직에서 스테일 클로저 방지를 위해 autoSaveRef를 autoSave 상태와 동기화
  // 🛡️ @GUARD : 스테일 클로저 방지 시스템의 일부
  // 🚨 @PATCH : None
  // 🔗 @CALLS : None
  // ====================================================================
  const autoSaveRef = useRef(autoSave);
  useEffect(() => { autoSaveRef.current = autoSave; }, [autoSave]);

  const isActivated = licenseStatus.isActivated;



  const decorationsCollectionRef = useRef<any>(null);
  const decorationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ====================================================================
  // 📊 [OMD-CORE-MainEditorApp-0029] MainEditorApp.tsx ➔ handleCheckboxToggle
  // 🎯 @KICK  : 미리보기 체크박스 클릭을 에디터 모델 라인 콘텐츠에 동기화
  // 🛡️ @GUARD : window.monaco 존재 확인, 라인 범위 검사, 정규식 검증으로 가드
  // 🚨 @PATCH : None
  // 🔗 @CALLS : editor.getModel, editor.pushUndoStop, editor.executeEdits
  // ====================================================================
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

  // ====================================================================
  // 📊 [OMD-CORE-MainEditorApp-0030] MainEditorApp.tsx ➔ updateDecorations
  // 🎯 @KICK  : 마크다운 구문 강조(제목, 굵게, 기울임, 취소선)를 위한 인라인 Monaco 데코레이션 적용
  // 🛡️ @GUARD : editor/window.monaco를 사용할 수 없으면 건너뜀
  // 🚨 @PATCH : None
  // 🔗 @CALLS : decorationsCollectionRef.current.set
  // ====================================================================
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
  const wikilinkProviderRef = useRef<any>(null);
  const docLinkFilesRef = useRef<FileNode[]>([]);
  const [floatingToolbar, setFloatingToolbar] = useState<{ visible: boolean, top: number, left: number }>({ visible: false, top: 0, left: 0 });
  const aiDecorationsRef = useRef<string[]>([]);
  const generationIdRef = useRef<number>(0);
  const readFileTextRef = useRef<(node: FileNode) => Promise<string>>(null!);
  const [aiPreviewState, setAiPreviewState] = useState<{
    isOpen: boolean;
    isModalOpen: boolean;
    promptInput: string;
    originalRange: any;
    streamingText: string;
    action: string;
    originalText: string;
    isFinished: boolean;
    isStarted: boolean;
    targetScope: 'selection' | 'document' | 'none';
  }>({
    isOpen: false,
    isModalOpen: false,
    promptInput: '',
    originalRange: null,
    streamingText: '',
    action: '',
    originalText: '',
    isFinished: false,
    isStarted: false,
    targetScope: 'none'
  });

  const [aiCopied, setAiCopied] = useState(false);

  // 📱 모바일 상태 관리를 Rules of Hooks에 따라 최상위(Top-level)로 상향 조정
  const [isMobile, setIsMobile] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize(); // 마운트 시점 확인
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);



  const cursorPositionRef = useRef<any>(null);
  const cursorSelectionRef = useRef<any>(null);
  const handlersRef = useRef<any>(null);
  const hotkeyDisposablesRef = useRef<any[]>([]);

  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0031] MainEditorApp.tsx ➔ previewWheelSync
  // 🎯 @KICK  : 분할 모드에서 미리보기 영역의 마우스 휠 이벤트를 에디터 스크롤로 전달
  // 🛡️ @GUARD : 기본 스크롤 중지를 위해 passive:false로 e.preventDefault
  // 🚨 @PATCH : None
  // 🔗 @CALLS : editor.setScrollTop
  // ====================================================================
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

  // ====================================================================
  // 📊 [OMD-CORE-MainEditorApp-0032] MainEditorApp.tsx ➔ darkModeDOMClass
  // 🎯 @KICK  : Tailwind 다크 모드를 위해 documentElement에 'dark' 클래스 토글
  // 🛡️ @GUARD : SSR 불일치 방지를 위해 마운트 후에만 실행
  // 🚨 @PATCH : None
  // 🔗 @CALLS : document.documentElement.classList.add/remove
  // ====================================================================

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.remove('dark');
  }, [mounted]);

  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0033] MainEditorApp.tsx ➔ editorSettingsSync
  // 🎯 @KICK  : 설정 또는 에디터 마운트 변경 시 테마, 폰트 크기, 줄 바꿈 재적용
  // 🛡️ @GUARD : 레이스 컨디션 방지를 위해 mounted && isEditorReady로 가드
  // 🚨 @PATCH : 2026-06-23 — 라이선스 만료/제한 여부(isExpired) 변경 시 readOnly/domReadOnly 동기화 연동 추가
  // 🔗 @CALLS : monaco.editor.setTheme, editor.updateOptions, requestAnimationFrame
  // ====================================================================
  useEffect(() => {
    if (mounted && isEditorReady && editorRef.current) {
      // 1. 테마 강제 적용
      if ((window as any).monaco) {
        const monaco = (window as any).monaco;
        monaco.editor.setTheme(themePalette);
      }
      // 2. 에디터 옵션(폰트 크기, 줄 바꿈, 읽기 전용 여부) 강제 동기화
      editorRef.current.updateOptions({
        fontSize: fontSize,
        wordWrap: wordWrap,
        wordBreak: 'normal',
        readOnly: tabs.length === 0 || licenseStatus.isExpired,
        domReadOnly: tabs.length === 0 || licenseStatus.isExpired,
      });
      // 3. 레이아웃 리플로우 강제 트리거 및 비동기 웹폰트 로딩 후 글자 폭 재계산 (핵심 버그 수정)
      requestAnimationFrame(() => {
        editorRef.current?.layout();
      });
      document.fonts.ready.then(() => {
        if ((window as any).monaco) {
          (window as any).monaco.editor.remeasureFonts();
        }
      });
    }
  }, [themePalette, fontSize, wordWrap, mounted, isEditorReady, licenseStatus.isExpired, previewMode, tabs.length]);

  // ====================================================================
  // 📊 [OMD-CORE-MainEditorApp-0034] MainEditorApp.tsx ➔ darkModePaletteSync
  // 🎯 @KICK  : 다크모드(isDarkMode)는 강제 비활성화되어 있으므로 자동 테마 전환을 수행하지 않음
  // 🛡️ @GUARD : 없음
  // 🚨 @PATCH : 2026-07-09 — 다크 테마가 isDarkMode=false여도 강제로 onrivi-light로 되돌려지던 버그 수정. effect를 무효화하여 사용자가 설정에서 선택한 테마를 유지하도록 변경.
  // 🔗 @CALLS : 없음
  // ====================================================================
  useEffect(() => {
    // isDarkMode는 항상 false로 고정되어 있으므로 아무 동작도 하지 않음
  }, []);

  // ====================================================================
  // 📊 [OMD-CORE-MainEditorApp-0035] MainEditorApp.tsx ➔ profilesSave
  // 🎯 @KICK  : 변경 시마다 사용자 CSS 프로필을 플랫폼 저장소에 유지
  // 🛡️ @GUARD : 중복 방지를 위해 저장 전 시스템 프로필 필터링
  // 🚨 @PATCH : 2026-08-05 — 웹 브라우저 로컬 권한 파일시스템(handle) 사용 시에도 `profiles/userCssProfiles.json` 로 통일 저장하도록 로직 변경.
  //             2026-07-30 — resourceFolderHandle이 변경될 때 이전 빈 프로필(profiles) 상태로 덮어쓰는 버그 방지 (의존성 분리)
  // 🔗 @CALLS : api.saveProfiles, localStorage.setItem
  // ====================================================================
  useEffect(() => {
    if (!mounted || !isProfilesLoaded) return;
    const userProfiles = profiles.filter(p => !isSystemProfileId(p.id));
    const api = (window as any).electronAPI;
    
    // Check if the profiles array actually changed to avoid redundant saves
    const savedHash = JSON.stringify(userProfiles);
    if ((window as any)._lastSavedProfilesHash === savedHash) return;
    (window as any)._lastSavedProfilesHash = savedHash;

    if (api) {
      // Desktop: electronAPI 저장
      api.saveProfiles(userProfiles, resourceFolder);
    } else {
      // Addon/Browser: localStorage
      try { localStorage.setItem('userCssProfiles', JSON.stringify(userProfiles)); } catch { }
      
      // File System Access API를 통한 로컬 폴더 저장
      const handle = resourceFolderHandleRef?.current || resourceFolderHandle;
      if (handle && (window as any)._resourceFolderSynced) {
        (async () => {
          try {
            const profilesDir = await (handle as any).getDirectoryHandle('profiles', { create: true });
            const fileHandle = await profilesDir.getFileHandle('userCssProfiles.json', { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify(userProfiles, null, 2));
            await writable.close();
          } catch (err) {
            console.warn('[profilesSave] Failed to save profiles to resource folder handle:', err);
          }
        })();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profiles]);

  // ====================================================================
  // 📊 [OMD-CORE-MainEditorApp-0036] MainEditorApp.tsx ➔ activeProfileSave
  // 🎯 @KICK  : 활성 CSS 프로필 ID를 localStorage에 유지
  // 🛡️ @GUARD : None
  // 🚨 @PATCH : None
  // 🔗 @CALLS : localStorage.setItem
  // ====================================================================
  useEffect(() => {
    if (mounted && activeProfileId) {
      localStorage.setItem('activeCssProfileId', activeProfileId);
    }
  }, [activeProfileId, mounted]);


  // ====================================================================
  // 📊 [OMD-CORE-MainEditorApp-0000] MainEditorApp.tsx ➔ Sync Frontmatter Profile
  // 🎯 @KICK  : 에디터 본문(content)이 변경될 때 Frontmatter에서 css_profile을 추출하여 현재 서식(activeProfileId)을 동기화
  // 🛡️ @GUARD : 기존 activeProfileId와 다를 때만 업데이트하여 무한루프 방지
  // 🚨 @PATCH : 2026-07-30 (Frontmatter 서식 개별 지정 지원)
  // 🔗 @CALLS : extractFrontmatter, setActiveProfileId
  // ====================================================================
  useEffect(() => {
    const { data } = extractFrontmatter(content);
    if (data.css_profile && data.css_profile !== activeProfileId) {
      setActiveProfileId(data.css_profile);
    }
  }, [content, activeProfileId]);

  // ====================================================================
  // 📊 [OMD-IO-MainEditorApp-0037] MainEditorApp.tsx ➔ electronAPI_listeners
  // 🎯 @KICK  : 파일 작업 및 외부 파일 열기를 위한 Electron 메인 프로세스 IPC 리스너 등록
  // 🛡️ @GUARD : 정리 시 리스너 제거, 보류 중인 외부 파일 참조 처리
  // 🚨 @PATCH : **2026-06-28** — 최초 실행 시 api.getInitialFilePath() 호출을 추가하여 윈도우 탐색기/바탕화면에서
  //             .md 파일 더블클릭 시 앱 기동 후 해당 파일이 자동으로 열리도록 IPC 연결 패치
  // 🔗 @CALLS : api.onNewFileRequested, api.onSaveFileRequested, api.onSaveFileAsRequested, api.onReceiveFile, api.getInitialFilePath, openExternalFile, handlers.newFile, handlers.save, handlers.saveAs
  // ====================================================================
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      const api = (window as any).electronAPI;
      api.onNewFileRequested(() => { });
      api.onSaveFileRequested(() => handlers.save());
      api.onSaveFileAsRequested(() => handlers.saveAs());

      // 윈도우 파일 연결(더블클릭)로 외부 .md 파일 열기 요청 수신 (두 번째 실행부터)
      let unsubscribeReceiveFile: (() => void) | undefined;
      if (api.onReceiveFile) {
        unsubscribeReceiveFile = api.onReceiveFile((filePath: string) => {
          openExternalFile(filePath);
        });
      }

      // 🆕 최초 실행 시: .md 더블클릭 파일 우선, 없으면 마지막 세션 파일 복원
      // sessionRestoredRef로 effect 재실행 시 중복 호출 방지
      if (api.getInitialFilePath && !sessionRestoredRef.current) {
        sessionRestoredRef.current = true; // 복원 시도 플래그 즉시 설정 (중복 방지)
        api.getInitialFilePath().then(async (filePath: string | null) => {
          if (filePath) {
            // 더블클릭 파일 우선 오픈
            openExternalFile(filePath);
          } else if (api.getLastSession) {
            // 더블클릭 파일이 없으면 마지막 멀티 세션 복원
            const sessionData = await api.getLastSession();
            if (sessionData && Array.isArray(sessionData.openFilePaths) && sessionData.openFilePaths.length > 0) {
              await restoreSessionTabs(sessionData.openFilePaths, sessionData.activeFilePath);
            }
          }
        }).catch(() => { sessionRestoredRef.current = false; }); // 실패 시 재시도 허용
      }

      // restoreSettings에서 확보해 둔 pending 파일 경로 처리 (폴백)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, content, currentFileNode]);

  // ====================================================================
  // 📊 [OMD-IO-MainEditorApp-0039] MainEditorApp.tsx ➔ session_auto_save
  // 🎯 @KICK  : 현재 열려있는 탭 목록 또는 활성 탭이 변경될 때마다 electronAPI.saveLastSession()을
  //             호출하여 모든 열린 파일 경로와 활성 파일 경로를 session.json에 자동 저장.
  //             앱 재시작 시 session:getLastSession IPC로 그대로 복원됨.
  // 🛡️ @GUARD : Electron 환경에서만 동작. 저장할 파일 목록이 없으면 빈 세션 저장.
  // 🚨 @PATCH : **2026-08-12** — 멀티 탭 전체 복원 동기화 기능으로 고도화 개편
  // 🔗 @CALLS : api.saveLastSession
  // ====================================================================
  useEffect(() => {
    const api = typeof window !== 'undefined' ? (window as any).electronAPI : null;
    if (!api?.saveLastSession) return;
    
    const openFilePaths = tabs.map(t => t.path).filter((p): p is string => typeof p === 'string' && !!p);
    const activeFilePath = currentFileNode?.path || null;

    api.saveLastSession({
      openFilePaths,
      activeFilePath
    }).catch(() => {});
  }, [tabs, currentFileNode]);

  // ====================================================================
  // 📊 [OMD-IO-MainEditorApp-0041] MainEditorApp.tsx ➔ a4_guard_auto_save
  // 🎯 @KICK  : isA4GuardEnabled 가드 상태가 변경될 때마다 localStorage에 즉시 보존.
  // 🛡️ @GUARD : Electron 및 일반 브라우저 환경 지원
  // 🚨 @PATCH : **2026-08-12** — 초기 생성 (A4 가드 레이아웃 보존 기능)
  // 🔗 @CALLS : 없음
  // ====================================================================
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('isA4GuardEnabled', String(isA4GuardEnabled));
    }
  }, [isA4GuardEnabled]);

  // ====================================================================
  // 📊 [OMD-IO-MainEditorApp-0042] MainEditorApp.tsx ➔ beforeunload_safety_flush
  // 🎯 @KICK  : 브라우저가 예기치 않게 닫히거나 강제 종료될 때, React 갱신 지연 상태를 무시하고
  //             Ref(tabsRef, currentFileNodeRef)를 직접 읽어 session.json에 즉각 플러시 저장.
  // 🛡️ @GUARD : React 최신 Ref 참조로 동기화 누락 방지.
  // 🚨 @PATCH : **2026-08-12** — 초기 생성 (강제 종료 유실 방지 가드)
  // 🔗 @CALLS : api.saveLastSession
  // ====================================================================
  useEffect(() => {
    const handleBeforeUnload = () => {
      const api = typeof window !== 'undefined' ? (window as any).electronAPI : null;
      if (api?.saveLastSession) {
        const openFilePaths = tabsRef.current.map(t => t.path).filter((p): p is string => typeof p === 'string' && !!p);
        const activeFilePath = currentFileNodeRef.current?.path || null;
        api.saveLastSession({ openFilePaths, activeFilePath }).catch(() => {});
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);


  // 🎯 @KICK  : 사이드바 UI에서 서식을 변경했을 때, 에디터 본문에 Frontmatter를 주입/갱신하고 상태를 업데이트한다.
  // 🛡️ @GUARD : Monaco 모델 값이 변경될 때 자동으로 onDidChangeContent가 트리거되므로 setContent는 별도 호출하지 않음.
  // 🚨 @PATCH : 2026-07-30 (Frontmatter 서식 개별 지정 지원)
  // 🔗 @CALLS : updateCssProfileInFrontmatter, setActiveProfileId
  // ====================================================================
  const handleProfileChange = useCallback((newProfileId: string) => {
    setActiveProfileId(newProfileId);
    
    // 서식 이름 찾기
    const selectedProfile = profiles.find(p => p.id === newProfileId);
    const profileName = selectedProfile ? selectedProfile.name : undefined;
    
    if (editorRef.current) {
      const currentModel = editorRef.current.getModel();
      if (currentModel) {
        const currentContent = currentModel.getValue();
        const newContent = updateCssProfileInFrontmatter(currentContent, newProfileId, profileName);
        if (currentContent !== newContent) {
          currentModel.setValue(newContent);
          // Monaco onDidChangeContent 이벤트가 발생하여 탭과 content 상태가 자동으로 갱신됨
        }
      }
    }
  }, [setActiveProfileId, editorRef, profiles]);

  // 🟢 [권한 기반 초기 화면 제어: 웰컴 탭 영구 잠금 및 강제 노출 로직 2026-07-05]
  const prevRestrictedRef = useRef<boolean | null>(null);
  useEffect(() => {
    if (!mounted || isLicenseChecking) return;

    // 제한 사용자 조건: 사용 기간 만료 혹은 웹에서 동시 접속을 초과하여 인증을 상실한 경우
    const isRestrictedUser = licenseStatus.isExpired ||
      licenseStatus.isRestricted ||
      licenseStatus.planName?.includes('미인증') ||
      licenseStatus.planName?.includes('제한사용자');

    if (prevRestrictedRef.current === isRestrictedUser) return;
    prevRestrictedRef.current = isRestrictedUser;

    if (!isRestrictedUser) {
      setTabs(prev => {
        const hasWelcome = prev.some(t => t.name === 'Onrivi Author 시작하기.md' && !t.isStyleTab);
        if (!hasWelcome) return prev;
        const cleaned = prev.filter(t => !(t.name === 'Onrivi Author 시작하기.md' && !t.isStyleTab));
        if (cleaned.length === 0) {
          setActiveTabId(null);
          setContent(localStorage.getItem('onrivi_content') || '');
          setCurrentFileName('새 파일.md');
          setCurrentFileNode(null);
        }
        return cleaned;
      });
    } else {
      // 🛡️ [EMBEDDED WELCOME 2026-07-07] 제한사용자 — welcome tab을 만들지 않고
      // activeTabId=null로 유지. embedded 환영 페이지가 렌더링에서 직접 표시됩니다.
      setTabs([]);
      setActiveTabId(null);
      setPreviewModeRaw('preview');
      previewModeRef.current = 'preview';
    }
  }, [mounted, isLicenseChecking, licenseStatus.isExpired, licenseStatus.planName, licenseStatus.isRestricted]);

  // ====================================================================
  // 📊 [OMD-FILE-MainEditorApp-0043] MainEditorApp.tsx ➔ restoreSessionTabs
  // 🎯 @KICK  : 앱 재시작 시, 이전 세션의 파일 목록 전체를 일괄 로드하여 탭 리스트를 생성 및 바인딩.
  //             단일 일괄 트랜잭션 처리로 React 상태 갱신 배치 충돌 및 Monaco 모델 중복 방지.
  // 🛡️ @GUARD : 비인증 사용자 복원 제한, 디스크 삭제 파일 예외 가드.
  // 🚨 @PATCH : **2026-08-12** — 초기 생성 (멀티 탭 복원 충돌 버그 해결)
  // 🔗 @CALLS : api.readFromPath, setTabs, setActiveTabId, setContent, showToast
  // ====================================================================
  const restoreSessionTabs = async (openFilePaths: string[], activeFilePath: string | null) => {
    try {
      const api = (window as any).electronAPI;
      if (!api?.readFromPath) return;

      const loadedTabs: EditorTab[] = [];
      const monaco = (window as any).monaco;

      // 1. 순서대로 파일 콘텐츠들을 비동기로 미리 다 로드
      for (const filePath of openFilePaths) {
        try {
          const file = await api.readFromPath(filePath);
          if (file) {
            // 줄바꿈 정규화
            file.content = file.content.replace(/\r\n/g, '\n');
            
            let model: any = null;
            if (monaco) {
              model = monaco.editor.createModel(file.content, 'markdown');
              model.onDidChangeContent(() => {
                const val = model.getValue();
                setContent(val);
                setTabs(prev => prev.map(t => t.id === file.path ? { ...t, content: val, isModified: val !== t.content } : t));
              });
            }

            loadedTabs.push({
              id: file.path,
              name: file.name,
              path: file.path,
              node: { name: file.name, kind: 'file', path: file.path },
              content: file.content,
              isModified: false,
              model: model
            });
          }
        } catch (e) {
          console.error(`[restoreSessionTabs] Failed to read ${filePath}:`, e);
        }
      }

      if (loadedTabs.length === 0) return;

      // 2. 단 한 번의 setTabs 호출로 React 탭 전체를 동시에 세팅
      setTabs(loadedTabs);

      // 3. activeFilePath가 존재하고 로드된 탭 중에 있다면, 해당 탭으로 즉시 포커싱
      const activeTab = loadedTabs.find(t => t.path === activeFilePath) || loadedTabs[loadedTabs.length - 1];
      if (activeTab) {
        setActiveTabId(activeTab.id);
        setContent(activeTab.content);
        setCurrentFileName(activeTab.name);
        setCurrentFileNode({ name: activeTab.name, kind: 'file', path: activeTab.path });

        if (editorRef.current && activeTab.model) {
          try {
            editorRef.current.setModel(activeTab.model);
          } catch (e) {
            console.warn("[Monaco] setModel failed on restored active tab:", e);
          }
        }
      }
      showToast(`📂 이전 세션에서 ${loadedTabs.length}개의 탭이 복원되었습니다.`, "success");
    } catch (err) {
      console.error("[restoreSessionTabs] 오류:", err);
    }
  };


  // ====================================================================
  // 📊 [OMD-FILE-MainEditorApp-0038] MainEditorApp.tsx ➔ openExternalFile
  // 🎯 @KICK  : OS 수준 더블클릭 또는 명령줄에서 파일 열기, Monaco 모델로 탭 생성
  // 🛡️ @GUARD : 중복 탭 방지 및 기존 탭 발견 시 최신 컨텐츠 강제 플러시 갱신
  // 🚨 @PATCH : 동일 파일명/경로 재호출 시 무반응 버그 수정: setModel 및 content 강제 동기화 (2026-07-17)
  // 🔗 @CALLS : api.readFromPath, switchTab, setContent, showToast
  // ====================================================================
  const openExternalFile = async (filePath: string) => {
    try {
      const api = (window as any).electronAPI;
      if (api?.readFromPath) {
        const file = await api.readFromPath(filePath);
        if (file) {
          const existingTab = tabsRef.current.find(t => t.path === file.path);

          if (existingTab) {
            if (existingTab.model && existingTab.model.isDisposed()) {
              const cleaned = tabsRef.current.filter(t => t.id !== existingTab.id);
              tabsRef.current = cleaned;
              setTabs(cleaned);
            } else {
              // 🎯 [현행화 패치] 기존 탭이 존재하면 포커스를 이동하고 최신 원문 데이터를 강제 주입
              switchTab(existingTab.id);
              setContent(file.content);
              setCurrentFileName(file.name);
              setCurrentFileNode({ name: file.name, kind: 'file', path: file.path });

              if (existingTab.model) {
                // 기존 모델에 외부에서 바뀐 최신 텍스트를 강제로 덮어씌움
                existingTab.model.setValue(file.content);
                if (editorRef.current) {
                  try {
                    editorRef.current.setModel(existingTab.model);
                  } catch (e) {
                    console.warn("[Monaco] setModel failed on existing tab:", e);
                  }
                }
              }

              showToast(`📂 ${file.name} (최신화 완료)`, "info");
              return;
            }
          }

          // --- 이하 신규 탭 생성 로직은 기존과 동일 ---
          // [Bug Fix] CRLF를 LF로 정규화하여 Monaco getValue()와의 비교 시 isModified가 오작동하는 문제 해결
          file.content = file.content.replace(/\r\n/g, '\n');

          const monaco = (window as any).monaco;
          let model: any = null;
          if (monaco) {
            model = monaco.editor.createModel(file.content, 'markdown');
            model.onDidChangeContent(() => {
              const val = model.getValue();
              setContent(val);
              setTabs(prev => prev.map(t => t.id === file.path ? { ...t, content: val, isModified: val !== t.content } : t));
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
            try {
              editorRef.current.setModel(model);
            } catch (e) {
              console.warn("[Monaco] setModel failed on new tab:", e);
            }
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

  // ====================================================================
  // 📊 [OMD-FILE-MainEditorApp-0039] MainEditorApp.tsx ➔ welcomeContentLoad
  // 🎯 @KICK  : 첫 마운트 시 탭이 없고 보류 중인 외부 파일이 없으면 웰컴 콘텐츠 로드
  // 🛡️ @GUARD : pendingExternalFileRef가 설정되어 있으면 건너뜀 (파일 열기로 연기)
  // 🚨 @PATCH : None
  // 🔗 @CALLS : getWelcomeContent, setTabs, setActiveTabId, setContent, setCurrentFileName
  // ====================================================================
  // 💡 초기 빈 탭을 생성하지 않음 — 사용자는 탐색기에서만 파일을 열거나 생성할 수 있음

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

  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0040] MainEditorApp.tsx ➔ dynamicTitleBar
  // 🎯 @KICK  : document.title을 'Onrivi Author'로 고정 (탭 UI가 파일명 표시하므로)
  // 🛡️ @GUARD : None
  // 🚨 @PATCH : 2026-06-22 — 파일명 제거, 'Onrivi Author'만 표시 (탭으로 대체)
  // 🔗 @CALLS : None
  // ====================================================================
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.title = 'Onrivi Author';
    }
  }, []);

  // ====================================================================
  // 📊 [OMD-CORE-MainEditorApp-0041] MainEditorApp.tsx ➔ previewHighlightLine
  // 🎯 @KICK  : 분할 모드에서 에디터의 activeLine과 일치하는 미리보기 줄 강조
  // 🛡️ @GUARD : 중복 방지를 위해 모든 강조 먼저 제거, 불일치 위치에 대해 가장 가까운 하위 data-line 찾기
  // 🚨 @PATCH : None
  // 🔗 @CALLS : element.classList.add/remove
  // ====================================================================
  useEffect(() => {
    if (!previewRef.current) return;

    const elements = Array.from(previewRef.current.querySelectorAll('[data-line]')) as HTMLElement[];
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

  // ====================================================================
  // 📊 [OMD-CORE-MainEditorApp-0042] MainEditorApp.tsx ➔ postContentScrollCorrection
  // 🎯 @KICK  : 콘텐츠 변경/파싱 후 에디터 커서 비율에 맞게 미리보기 스크롤 위치 동기화
  // 🛡️ @GUARD : 에디터 커서에서 뷰포트 비율 계산하여 미리보기 스크롤에 동일 비율 적용
  // 🚨 @PATCH : isScrollingRef 잠금으로 스크롤 루프 방지; 정확한 타이밍을 위한 requestAnimationFrame
  // 🔗 @CALLS : requestAnimationFrame, editor.getPosition, editor.getTopForLineNumber, editor.getScrollTop
  // ====================================================================
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

      const parent = previewRef.current;
      if (!parent) return;

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

  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0043] MainEditorApp.tsx ➔ handleMouseMove
  // 🎯 @KICK  : 사이드바 크기 조정 드래그 mousemove 이벤트 처리
  // 🛡️ @GUARD : 너비를 150-600px 사이로 제한
  // 🚨 @PATCH : None
  // 🔗 @CALLS : setSidebarWidth, localStorage.setItem
  // ====================================================================

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = e.clientX;
    if (newWidth > 150 && newWidth < 600) {
      setSidebarWidth(newWidth);
      localStorage.setItem('sidebarWidth', newWidth.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fontSize 및 wordWrap 저장은 통합 환경설정 저장 가드에서 처리

  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0044] MainEditorApp.tsx ➔ stopResizing
  // 🎯 @KICK  : 사이드바 크기 조정 종료: 리스너 제거, 커서 및 user-select 복원
  // 🛡️ @GUARD : None
  // 🚨 @PATCH : None
  // 🔗 @CALLS : document.removeEventListener, document.body.style.cursor/userSelect
  // ====================================================================
  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  }, [handleMouseMove]);

  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0045] MainEditorApp.tsx ➔ startResizing
  // 🎯 @KICK  : 사이드바 크기 조정 시작: 리스너 추가, col-resize 커서 설정
  // 🛡️ @GUARD : None
  // 🚨 @PATCH : None
  // 🔗 @CALLS : document.addEventListener, document.body.style
  // ====================================================================
  const startResizing = useCallback((e: React.MouseEvent) => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [handleMouseMove, stopResizing]);

  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0046] MainEditorApp.tsx ➔ tabModeSync
  // 🎯 @KICK  : 탭 전환 시 도움말은 미리보기 전용으로 강제하고 일반 문서는 직전의 전역 에디터 모드로 복구 동기화
  // 🛡️ @GUARD : 라이선스 만료 시 preview 모드로 가드
  // 🚨 @PATCH : 2026-07-04 — 신규 추가
  // 🔗 @CALLS : setPreviewModeRaw
  // ====================================================================
  useEffect(() => {
    if (!mounted || !activeTabId) return;
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (!activeTab) return;

    if (activeTab.name === '도움말.md') {
      // 💡 1. 도움말 탭은 예외없이 무조건 미리보기 전용('preview') 고정
      if (previewModeRef.current !== 'preview') {
        setPreviewModeRaw('preview');
        previewModeRef.current = 'preview';
      }
    } else if (activeTab.isStyleTab === true) {
      // 💡 2. 서식설정 전용 탭: 모드 전환 없이 현재 모드 유지 (CssStyleForm은 Ctrl+Shift+S로만 토글)
    } else {
      // 💡 3. 그 외 일반 마크다운 문서들은 전역으로 공유되는 마크다운 보기 모드를 그대로 상속 및 유지
      const target = licenseStatus.isExpired ? 'preview' : lastGeneralPreviewModeRef.current;
      if (previewModeRef.current !== target) {
        setPreviewModeRaw(target);
        previewModeRef.current = target;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabId, mounted, licenseStatus.isExpired, helpContent]);
  // 🟢 [권한 기반 초기 화면 제어: 웰컴 탭 차단 및 강제 노출 로직 2026-07-05]
  // 초기 로딩 후 제한 사용자인지 판단하여 웰컴 페이지를 남기거나, 일반 사용자면 지웁니다.
  const hasHandledWelcomeRef = useRef(false);

  useEffect(() => {
    if (!mounted || isLicenseChecking || hasHandledWelcomeRef.current) return;

    console.log('[WELCOME#2] FIRED! isExpired=%o planName=%o tabsRef=%o', licenseStatus.isExpired, licenseStatus.planName, tabsRef.current.map((t: any) => t.name));

    // 이펙트를 단 한 번만 실행하여 다른 컴포넌트나 훅이 웰컴탭을 덮어쓰거나 무한루프 도는 것을 원천 방지
    hasHandledWelcomeRef.current = true;

    // 제한 사용자 조건: 사용 기간 만료 혹은 웹에서 동시 접속을 초과하여 인증을 상실한 경우 (undefined 방어를 위해 Optional Chaining 추가)
    const isRestrictedUser = licenseStatus.isExpired ||
      licenseStatus.isRestricted ||
      licenseStatus.planName?.includes('미인증') ||
      licenseStatus.planName?.includes('제한사용자');

    // tabs 상태값 대신 refs로 현재 상황을 안전하게 스냅샷
    const hasWelcome = tabsRef.current.some(t => t.name === 'Onrivi Author 시작하기.md' && !t.isStyleTab);

    if (!isRestrictedUser) {
      // 1. [정상/전체 사용자]: 웰컴 페이지 강제 삭제 (빈 문서 시작)
      if (hasWelcome) {
        const cleaned = tabsRef.current.filter(t => !(t.name === 'Onrivi Author 시작하기.md' && !t.isStyleTab));
        setTabs(cleaned);
        if (cleaned.length === 0) {
          setActiveTabId(null);
          // 시작 페이지 없이(Empty) 시작하도록 요청됨 -> 로컬 스토리지에 남아있는 게 있다면 복원하거나 빈 문자열.
          const localDraft = localStorage.getItem('onrivi_content');
          setContent(localDraft || '');
          setCurrentFileName('새 파일.md');
          setCurrentFileNode(null);
        }
      }
    } else {
      // 🛡️ [EMBEDDED WELCOME 2026-07-07] 제한사용자 — 탭을 만들지 않고
      // 빈 탭 상태로 유지하면 embedded 환영 페이지가 렌더링됩니다.
      setTabs([]);
      setActiveTabId(null);
      setPreviewModeRaw('preview');
      previewModeRef.current = 'preview';
    }
  }, [mounted, isLicenseChecking, licenseStatus.isExpired, licenseStatus.planName, licenseStatus.isRestricted]);
  useEffect(() => {
    if (currentFileNode && activeTabId) {
      if (prevActiveTabRef.current !== activeTabId) {
        prevActiveTabRef.current = activeTabId;
        lastSavedContentRef.current = content;
        // 탭 전환 시 saveStatus를 현재 탭의 isModified에 맞게 동기화
        const activeTab = tabsRef.current.find(t => t.id === activeTabId);
        setSaveStatus(activeTab?.isModified ? 'unsaved' : 'saved');
        return;
      }
      const isUnsaved = content !== lastSavedContentRef.current;
      setSaveStatus(isUnsaved ? 'unsaved' : 'saved');
      setTabs(prev => prev.map(t =>
        t.id === activeTabId
          ? { ...t, isModified: isUnsaved }
          : t
      ));
    }
  }, [content, currentFileNode, activeTabId]);
  // ====================================================================
  // 📊 [OMD-FILE-MainEditorApp-0047] MainEditorApp.tsx ➔ autoSave
  // 🎯 @KICK  : 콘텐츠 변경 및 autoSave 활성화 시 5초 디바운스 후 파일 자동 저장
  // 🛡️ @GUARD : 콘텐츠가 비어있거나, 미리보기 모드가 변경 중이거나, 콘텐츠가 변경되지 않았으면 건너뜀; 5초 디바운스 정리
  // 🚨 @PATCH : None
  // 🔗 @CALLS : saveFile, setSaveStatus, setTimeout, clearTimeout
  // ====================================================================
  useEffect(() => {
    // 🌟 [세이프티 가드 1]: 원고 본문이 비어있거나 데이터가 초기화되기 전 상태라면 
    // 시스템 오염 저장을 원천 차단합니다.
    if (!content || content.trim() === "") {
      return;
    }

    // 🌟 [세이프티 가드 2]: 유저가 뷰 모드(분할/에디터/프리뷰)를 변환하는 찰나의 순간에는 
    // 컴포넌트 오염 타이밍이므로 자동 저장을 생략하고 무조건 대기시킵니다.
    if (typeof autoSave === 'number' && autoSave > 0 && currentFileNode && licenseStatus.isActivated) {
      if (content === lastSavedContentRef.current) return;

      setSaveStatus('saving');
      const timer = setTimeout(async () => {
        let saveContent = content;
        
        // [서식 자동 주입 패치] 자동 저장 시에도 현재 활성화된 프로필 정보를 Frontmatter에 자동 갱신
        if (activeProfileId) {
          const profile = profiles?.find((p: any) => p.id === activeProfileId);
          const nextVal = updateCssProfileInFrontmatter(content, activeProfileId, profile?.name);
          if (nextVal !== content) {
            saveContent = nextVal;
            if (editorRef?.current) {
              const model = editorRef.current.getModel();
              if (model) {
                model.pushEditOperations(
                  [],
                  [{ range: model.getFullModelRange(), text: nextVal }],
                  () => null
                );
              }
            }
          }
        }

        const success = await saveFile(saveContent, currentFileNode);
        setSaveStatus(success ? 'saved' : 'unsaved');
        if (success) {
          console.log(`✏️ [Onrivi Guard] 자동 저장 완료 (${autoSave}초)`);
          // 자동 저장 후 현재 탭의 isModified 상태를 false로 복구
          setTabs(prev => prev.map(t =>
            t.id === activeTabIdRef.current ? { ...t, isModified: false } : t
          ));
        }
      }, autoSave * 1000); // 🕒 설정된 초(seconds) 기반 디바운스
      return () => clearTimeout(timer);
    }
  }, [content, autoSave, currentFileNode, saveFile, licenseStatus.isActivated, activeProfileId, profiles]);

  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0048] MainEditorApp.tsx ➔ insertAtCursor
  // 🎯 @KICK  : 커서 위치 텍스트 삽입을 utilsEditorActions에 위임
  // 🛡️ @GUARD : None
  // 🚨 @PATCH : None
  // 🔗 @CALLS : utilsEditorActions.insertAtCursor
  // ====================================================================
  const insertAtCursor = (text: string) => {
    utilsEditorActions.insertAtCursor(editorRef, lastSelectionRef, text);
  };

  // ====================================================================
  // 📊 [OMD-CORE-MainEditorApp-0049] MainEditorApp.tsx ➔ findLineNumberByHeading
  // 🎯 @KICK  : 제목 줄 검색을 utilsEditorActions에 위임
  // 🛡️ @GUARD : None
  // 🚨 @PATCH : None
  // 🔗 @CALLS : utilsEditorActions.findLineNumberByHeading
  // ====================================================================
  const findLineNumberByHeading = (content: string, heading: string): number => {
    return utilsEditorActions.findLineNumberByHeading(content, heading);
  };

  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0050] MainEditorApp.tsx ➔ scrollToLine
  // 🎯 @KICK  : 에디터 특정 줄로 스크롤을 utilsEditorActions에 위임
  // 🛡️ @GUARD : None
  // 🚨 @PATCH : None
  // 🔗 @CALLS : utilsEditorActions.scrollToLine
  // ====================================================================
  const scrollToLine = (lineNumber: number) => {
    utilsEditorActions.scrollToLine(editorRef, lineNumber);
  };

  // ====================================================================
  // 📊 [OMD-CORE-MainEditorApp-0051] MainEditorApp.tsx ➔ handlePreviewClick
  // 🎯 @KICK  : 미리보기 클릭 시: 에디터를 일치하는 줄로 스크롤, 미리보기에서 줄 강조
  // 🛡️ @GUARD : 중첩 요소 처리를 위해 DOM closest [data-line] 순회
  // 🚨 @PATCH : None
  // 🔗 @CALLS : scrollToLine, element.closest, classList.add/remove
  // ====================================================================
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
          elements.forEach(element => element.classList.remove('preview-highlight-line'));
          lineEl.classList.add('preview-highlight-line'); // 💡 사장님 지시: 마우스 클릭 시 미리보기 행 마킹 하이라이트색 복구
        }
      }
    }
  };

  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0052] MainEditorApp.tsx ➔ insertBlockTag
  // 🎯 @KICK  : 블록 태그 감싸기를 utilsEditorActions에 위임
  // 🛡️ @GUARD : None
  // 🚨 @PATCH : None
  // 🔗 @CALLS : utilsEditorActions.insertBlockTag
  // ====================================================================
  const insertBlockTag = (startTag: string, endTag: string, defaultText: string = "") => {
    utilsEditorActions.insertBlockTag(editorRef, startTag, endTag, defaultText);
  };

  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0053] MainEditorApp.tsx ➔ wrapSelection
  // 🎯 @KICK  : 선택 영역 감싸기/풀기를 utilsEditorActions에 위임
  // 🛡️ @GUARD : None
  // 🚨 @PATCH : None
  // 🔗 @CALLS : utilsEditorActions.wrapSelection
  // ====================================================================
  const wrapSelection = (before: string, after: string = before, defaultText: string = "") => {
    utilsEditorActions.wrapSelection(editorRef, lastSelectionRef, before, after, defaultText);
  };

  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0054] MainEditorApp.tsx ➔ insertLink
  // 🎯 @KICK  : 커서에 마크다운 링크 삽입, URL 플레이스홀더 텍스트 자동 선택
  // 🛡️ @GUARD : 현재 선택이 비어있으면 lastSelectionRef 사용; 선택 텍스트와 빈 경우 모두 처리
  // 🚨 @PATCH : None
  // 🔗 @CALLS : editor.focus, editor.getSelection, editor.executeEdits, editor.setSelection
  // ====================================================================
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

  // ====================================================================
  // 📊 [OMD-FILE-MainEditorApp-0057] MainEditorApp.tsx ➔ readFileText
  // 🎯 @KICK  : 브라우저 FileSystemHandle, 로컬 electronAPI, VFS 또는 클라우드 API에서 파일 내용 읽기
  // 🛡️ @GUARD : 경로/핸들 존재 여부에 따라 활성 모드 결정; 오류를 정상적으로 처리
  // 🚨 @PATCH : None
  // 🔗 @CALLS : node.handle.getFile, vfsReadFile, api.readFromPath, fetch
  // ====================================================================
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
  readFileTextRef.current = readFileText;

  // ====================================================================
  // 📊 [OMD-CORE-MainEditorApp-0058] MainEditorApp.tsx ➔ extractHeadings
  // 🎯 @KICK  : 마크다운 텍스트를 파싱하여 제목 텍스트 줄(H1-H6) 추출
  // 🛡️ @GUARD : 제목 텍스트에서 후행 # 문자 제거
  // 🚨 @PATCH : None
  // 🔗 @CALLS : None
  // ====================================================================
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

  // ====================================================================
  // 📊 [OMD-FILE-MainEditorApp-0059] MainEditorApp.tsx ➔ handleDocFileClick
  // 🎯 @KICK  : 문서 링크 선택기를 위해 선택된 문서 파일에서 제목 로드
  // 🛡️ @GUARD : 로딩 상태 설정, 오류 시 제목 초기화
  // 🚨 @PATCH : None
  // 🔗 @CALLS : readFileText, extractHeadings, setDocHeadings, setIsHeadingLoading
  // ====================================================================
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

  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0060] MainEditorApp.tsx ➔ handleDocLinkSelect
  // 🎯 @KICK  : 커서에 [[relativePath#heading|text]] 문서 간 링크 삽입
  // 🛡️ @GUARD : 완료 시 모든 선택기 상태 초기화; lastSelectionRef로 폴백
  // 🚨 @PATCH : None
  // 🔗 @CALLS : getRelativePath, editor.focus, editor.getSelection, editor.executeEdits
  // ====================================================================
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

  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0061] MainEditorApp.tsx ➔ parseHtmlTableToMarkdown
  // 🎯 @KICK  : HTML 표를 마크다운으로 변환하는 작업을 paste handlers에 위임
  // 🛡️ @GUARD : None
  // 🚨 @PATCH : None
  // 🔗 @CALLS : utilsPasteHandlers.parseHtmlTableToMarkdown
  // ====================================================================
  const parseHtmlTableToMarkdown = (html: string) => {
    return utilsPasteHandlers.parseHtmlTableToMarkdown(html, showToast);
  };

  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0062] MainEditorApp.tsx ➔ sanitizePastedText
  // 🎯 @KICK  : 붙여넣기 텍스트 정제를 paste handlers에 위임
  // 🛡️ @GUARD : None
  // 🚨 @PATCH : None
  // 🔗 @CALLS : utilsPasteHandlers.sanitizePastedText
  // ====================================================================
  const sanitizePastedText = (text: string, skipTsvConversion = false) => {
    return utilsPasteHandlers.sanitizePastedText(text, skipTsvConversion);
  };

  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0063] MainEditorApp.tsx ➔ fixMarkdownTable
  // 🎯 @KICK  : 마크다운 표 수정을 paste handlers에 위임
  // 🛡️ @GUARD : None
  // 🚨 @PATCH : None
  // 🔗 @CALLS : utilsPasteHandlers.fixMarkdownTable
  // ====================================================================
  const fixMarkdownTable = (text: string) => {
    return utilsPasteHandlers.fixMarkdownTable(text);
  };

  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0064] MainEditorApp.tsx ➔ resolveClipboardImage
  // 🎯 @KICK  : 클립보드에서 이미지 Blob/File 추출 (items → files → navigator.clipboard 순)
  // 🛡️ @GUARD : 모든 경로 실패 시 null 반환, 성공 시 Blob 반환
  // 🔗 @CALLS : 없음
  // ====================================================================
  const resolveClipboardImage = async (e: any, imageItem: any): Promise<Blob | null> => {
    // 1) clipboardData.items[i].getAsFile()
    if (imageItem) {
      const file = imageItem.getAsFile();
      if (file) return file;
      // 1b) items에서 찾았지만 getAsFile()이 null → clipboardData.files 폴백
      const files = e.clipboardData.files;
      if (files && files.length > 0 && files[0].type.startsWith('image/')) return files[0];
    }
    // 2) clipboardData.files (items에 이미지가 없을 때)
    const files = e.clipboardData.files;
    if (files && files.length > 0 && files[0].type.startsWith('image/')) return files[0];
    // 3) navigator.clipboard.read() (Async Clipboard API, 권한 필요)
    try {
      if (navigator.clipboard && typeof navigator.clipboard.read === 'function') {
        const clipboardItems = await navigator.clipboard.read();
        for (const ci of clipboardItems) {
          for (const type of ci.types) {
            if (type.startsWith('image/')) {
              return await ci.getType(type);
            }
          }
        }
      }
    } catch { }
    return null;
  };

  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0065] MainEditorApp.tsx ➔ handleEditorPaste
  // 🎯 @KICK  : 붙여넣기 이벤트 처리: 이미지 업로드, HTML 표 변환, 텍스트 정제
  // 🛡️ @GUARD : 이미지 붙여넣기 시 기본 동작 차단, 일반 텍스트 폴백 전 HTML 표 시도
  // 🚨 @PATCH : None
  // 🔗 @CALLS : fetch, FileReader, parseHtmlTableToMarkdown, sanitizePastedText, fixMarkdownTable, insertAtCursor, updateContent, showToast
  // ====================================================================
  const handleEditorPaste = async (e: any) => {
    const items = e.clipboardData?.items;
    let hasText = false;
    let hasHtml = false;
    let imageItem = null;

    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) imageItem = items[i];
        if (items[i].type === 'text/plain') hasText = true;
        if (items[i].type === 'text/html') hasHtml = true;
      }
    }

    const resolvedBlob = await resolveClipboardImage(e, imageItem);

    if (resolvedBlob) {
      e.preventDefault();
      handlePasteImageFile(resolvedBlob);
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

  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0065] MainEditorApp.tsx ➔ handlePasteImageFile
  // 🎯 @KICK  : 이미지 Blob/File을 받아 로컬(데스크탑) 또는 R2(웹)에 저장 후 에디터 커서 위치에 삽입
  // 🛡️ @GUARD : FileReader onload/onerror 처리, 데스크탑/웹 분기
  // 🚨 @PATCH : 2026-07-06 이미지 붙여넣기 시 데스크탑 로컬 선저장이 아닌 R2 선저장으로 로직 순서 반전
  // 🔗 @CALLS : fetch, FileReader, showToast
  // ====================================================================
  const handlePasteImageFile = async (fileOrBlob: Blob) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      if (!base64Data) {
        showToast('이미지 데이터를 읽을 수 없습니다.', 'error');
        return;
      }
      try {
        const base64DataClean = base64Data.split(',')[1] || base64Data;
        const api = (window as any).electronAPI;
        
        let fileName = `image_${Date.now()}.png`;
        try {
          const binaryString = atob(base64DataClean);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i);
          }
          const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 12);
          fileName = `img_${hashHex}.png`;
        } catch (e) {
          console.warn('해시 생성 실패, 기본 시간 기반 이름 사용', e);
        }
        
        let targetFolder = currentFilePath || rootFolderRef.current?.name || '';
        if (resourceFolderRef.current) {
          targetFolder = resourceFolderRef.current + '\\media';
        }

        if (api) {
          // 🖥️ 데스크탑 (Electron): 우선적으로 R2 업로드를 시도하고, 실패 시 로컬 assets/ 에 저장
          await insertWithR2Fallback(base64DataClean, targetFolder, fileName);
        } else {
          // 🌐 웹 브라우저 (SaaS)
          if (resourceFolderHandle) {
            try {
              const mediaDir = await resourceFolderHandle.getDirectoryHandle('media', { create: true });
              const fileHandle = await mediaDir.getFileHandle(fileName, { create: true });
              const writable = await fileHandle.createWritable();
              await writable.write(fileOrBlob);
              await writable.close();
              insertImageMarkdown(`/media/${fileName}`);
              showToast('로컬 공통 폴더(media)에 이미지가 저장되었습니다.', 'success');
              return;
            } catch (err) {
              console.warn('[Paste Image] Failed to save to resource folder:', err);
              // 실패하면 아래 R2 업로드로 폴백
            }
          }
          await webUploadImage(base64Data);
        }
      } catch (err) {
        console.error('[Paste Image Error]', err);
        showToast('클립보드 이미지 처리 중 오류가 발생했습니다.', 'error');
      }
    };
    reader.onerror = () => {
      showToast('이미지 파일을 읽는데 실패했습니다.', 'error');
    };
    reader.readAsDataURL(fileOrBlob);
  };

  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0066] MainEditorApp.tsx ➔ insertWithR2Fallback
  // 🎯 @KICK  : 데스크탑: 우선 R2 클라우드 업로드 시도, 실패 시 로컬 파일 시스템(assets/)에 fallback 저장
  // 🛡️ @GUARD : R2 실패 시 api.saveImage 호출
  // 🚨 @PATCH : 2026-07-06 우선 R2 클라우드 업로드 시도 후 실패 시 api.saveImage로 로컬 assets에 저장하도록 재설계
  // 🔗 @CALLS : fetch, api.saveImage, showToast
  // ====================================================================
  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0031] MainEditorApp ➔ insertWithLocalSave
  // 🎯 @KICK  : 데스크탑 이미지 붙여넣기 시 무조건 로컬(resourceFolder) 저장
  // 🛡️ @GUARD : api.saveImage 실패 시 toast 안내
  // 🚨 @PATCH : 2026-07-30 — R2 업로드 제거, 무조건 로컬 저장으로 단순화
  // 🔗 @CALLS : api.saveImage, showToast
  // ====================================================================
  const insertWithR2Fallback = async (base64DataClean: string, targetFolder: string, fileName: string) => {
    const api = (window as any).electronAPI;
    if (!api) return;

    const saveResult = await api.saveImage(targetFolder, base64DataClean, fileName);
    if (saveResult && saveResult.success) {
      const finalPath = saveResult.mediaPath
        ? saveResult.mediaPath
        : `media://local/serve?url=${encodeURIComponent(saveResult.absolutePath)}`;
      insertImageMarkdown(finalPath);
      showToast('이미지가 로컬 폴더에 저장되었습니다.', 'success');
    } else {
      showToast('이미지 로컬 저장에 실패했습니다.', 'error');
    }
  };

  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0067] MainEditorApp.tsx ➔ webUploadImage
  // 🎯 @KICK  : 웹 브라우저: API를 통해 R2(또는 dev 로컬)에 이미지 업로드 후 에디터 삽입
  // 🛡️ @GUARD : dev/production 엔드포인트 분기, JWT 인증
  // 🔗 @CALLS : fetch, showToast
  // ====================================================================
  const webUploadImage = async (base64Data: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const isDev = process.env.NODE_ENV === 'development';
      const uploadEndpoint = isDev ? getApiUrl('/api/upload-pasted-image') : '/api/upload-image';
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(uploadEndpoint, {
        method: 'POST', headers,
        body: JSON.stringify({ base64Data, targetFolder: currentFilePath || rootFolderRef.current?.name || '' }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && data.relativePath) {
          insertImageMarkdown(data.relativePath);
          showToast(isDev ? '개발 환경: 로컬 assets 폴더에 저장되었습니다.' : '웹 환경: 클라우드 서버(R2)에 성공적으로 업로드되었습니다.', 'success');
        } else {
          showToast('이미지 업로드 실패: ' + (data.error || '알 수 없는 오류'), 'error');
        }
      } else {
        showToast(`서버 오류 발생 (${response.status})`, 'error');
      }
    } catch (err) {
      console.error('[Web Upload Error]', err);
      showToast('이미지 업로드 전송 중 네트워크 오류가 발생했습니다.', 'error');
    }
  };

  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0068] MainEditorApp.tsx ➔ insertImageMarkdown
  // 🎯 @KICK  : 에디터 커서 위치에 마크다운 이미지 문법 삽입
  // 🛡️ @GUARD : editorRef.current null 체크, readOnly 우회
  // 🔗 @CALLS : editor.executeEdits, updateContent
  // ====================================================================
  const insertImageMarkdown = (path: string) => {
    if (!editorRef.current) {
      showToast('에디터를 찾을 수 없어 이미지를 삽입할 수 없습니다.', 'error');
      return;
    }
    const editor = editorRef.current;
    const selection = editor.getSelection();
    const range = {
      startLineNumber: selection.startLineNumber,
      startColumn: selection.startColumn,
      endLineNumber: selection.endLineNumber,
      endColumn: selection.endColumn
    };
    const textToInsert = `![이미지](${path})`;
    editor.executeEdits("pasteImage", [{ range, text: textToInsert, forceMoveMarkers: true }]);
    try {
      const newValue = editor.getValue();
      updateContent(newValue, true);
    } catch { }
  };

  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0065] MainEditorApp.tsx ➔ applyLinePrefix
  // 🎯 @KICK  : 선택된 줄에 순서 목록/글머리 기호/인용구/체크리스트 접두사 적용
  // 🛡️ @GUARD : 이전 비어있지 않은 줄(최대 10줄)에서 연속 순서 번호 계산; 중첩 인용구 처리
  // 🚨 @PATCH : 구문 강조 새로고침을 위해 편집 후 forceTokenization
  // 🔗 @CALLS : editor.getSelection, editor.executeEdits, model.forceTokenization, editor.layout
  // ====================================================================
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
    } catch (_) { }

    editor.focus();
  };

  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0066] MainEditorApp.tsx ➔ removePrefix
  // 🎯 @KICK  : 선택 영역에서 마크다운 서식 태그 제거: 굵게, 기울임, 취소선, 코드, 링크, 제목, 목록
  // 🛡️ @GUARD : 빈 선택 영역을 전체 줄로 확장 처리; 정규식 기반 정리로 선행 공백 보존
  // 🚨 @PATCH : 구문 강조 새로고침을 위해 편집 후 forceTokenization
  // 🔗 @CALLS : editor.getSelection, editor.executeEdits, model.forceTokenization, editor.layout
  // ====================================================================
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
    } catch (_) { }

    editor.focus();
  };

  // ====================================================================
  // 📊 [OMD-CORE-MainEditorApp-0067] MainEditorApp.tsx ➔ processedContent_lineMap
  // 🎯 @KICK  : 미리보기를 위해 마크다운 콘텐츠를 전처리하고 스크롤 동기화를 위한 라인 매핑 생성
  // 🛡️ @GUARD : None
  // 🚨 @PATCH : None
  // 🔗 @CALLS : preprocessMarkdownForPreview
  // ====================================================================

  const { processedContent, lineMap } = useMemo(() => {
    const res = preprocessMarkdownForPreview(content);
    return {
      processedContent: res.text,
      lineMap: res.lineMap
    };
  }, [content]);

  // ====================================================================
  // 📊 [OMD-CORE-MainEditorApp-0068] MainEditorApp.tsx ➔ dynamicCssString
  // 🎯 @KICK  : 활성 CSS 프로필에서 타이포그래피, 코드 블록, 표, 체크박스, 구분선, 다크모드 재정의를 포함한 동적 CSS 생성
  // 🛡️ @GUARD : 기본 프로필은 빈 문자열 반환; blockquote, hr, color에 대한 다크모드 재정의; h2-h6 font-size 건너뜀(자동 계산)
  // 🚨 @PATCH : 박스 중첩 아티팩트 방지를 위한 codeBlock 중첩 border/background 투명 재정의
  // 🔗 @CALLS : None
  // ====================================================================
  const dynamicCssString = useMemo(() => {
    if (activeProfileId === 'default') return '';
    const prof = profiles.find(p => p.id === activeProfileId) || DEFAULT_PROFILE;
    const ps = prof.pageStyle;

    const profileBg = ps.backgroundColor || '#ffffff';
    const bg = profileBg;
    // Set a very dark gray/black color instead of 'inherit' for much better contrast on white backgrounds
    const fg = '#1a1a1a';

    let css = `
.custom-preview-container {
  background: ${bg} !important;
  color: ${fg} !important;
  font-family: ${ps.fontFamily} !important;
  font-size: ${ps.fontSize} !important;
  line-height: ${ps.lineHeight} !important;
  letter-spacing: ${ps.letterSpacing} !important;
  -webkit-font-smoothing: subpixel-antialiased !important;
  -moz-osx-font-smoothing: auto !important;
  text-rendering: optimizeLegibility !important;
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
  tab-size: ${ps.tabSize || '2'} !important;
  -moz-tab-size: ${ps.tabSize || '2'} !important;
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
      const skipFontSize = ['h2', 'h3', 'h4', 'h5', 'h6'].includes(tag);
      const entries = Object.entries(ruleObj).map(([prop, v]) => {
        // 💡 [OMD-PATCH] 구버전 유저 프로필에 저장된 keep-all이 불러와지면서 거대 공백 버그를 유발하는 것을 막기 위해 강제 마이그레이션
        if (prop === 'word-break' && v === 'keep-all') return [prop, 'break-all'];
        return [prop, v];
      }).filter(([prop, v]) => {
        if (v === '') return false;
        if (skipFontSize && prop === 'font-size') return false;
        return true;
      }).sort((a, b) => a[0].localeCompare(b[0]));
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

        // 💡 코드블록 전용 명시적 가로 스크롤바 (테마의 글자 색상을 바탕으로 한층 더 밝고 두껍게)
        const trackColor = color ? `color-mix(in srgb, ${color} 15%, transparent)` : 'rgba(200, 200, 200, 0.1)';
        const thumbColor = color ? `color-mix(in srgb, ${color} 60%, transparent)` : 'rgba(200, 200, 200, 0.6)';
        const thumbHoverColor = color ? `color-mix(in srgb, ${color} 85%, transparent)` : 'rgba(200, 200, 200, 0.8)';

        css += `.custom-preview-container .codeblock-area .custom-scrollbar::-webkit-scrollbar {\n  height: 10px !important;\n}\n`;
        css += `.custom-preview-container .codeblock-area .custom-scrollbar::-webkit-scrollbar-track {\n  background: ${trackColor} !important;\n  border-radius: 5px !important;\n}\n`;
        css += `.custom-preview-container .codeblock-area .custom-scrollbar::-webkit-scrollbar-thumb {\n  background: ${thumbColor} !important;\n  border-radius: 5px !important;\n}\n`;
        css += `.custom-preview-container .codeblock-area .custom-scrollbar::-webkit-scrollbar-thumb:hover {\n  background: ${thumbHoverColor} !important;\n}\n`;
        return;
      }

      if (tag === 'math') {
        const layoutProps = ['text-align', 'margin-top', 'margin-bottom'];
        
        // 1. 블록 레이아웃(디스플레이 수식) 속성
        css += `.custom-preview-container .katex-display {\n`;
        entries.forEach(([prop, val]) => {
          if (layoutProps.includes(prop)) {
            css += `  ${prop}: ${val} !important;\n`;
          }
        });
        css += `}\n`;
        
        // 1-1. 수식이 <p>로 감싸져 있는 경우 <p>의 마진을 강제 소거 (수식의 마진만 온전히 적용)
        css += `.custom-preview-container p:has(> .katex-display) {\n`;
        css += `  margin: 0 !important;\n`;
        css += `}\n`;

        // 1-2. 내부 .katex 요소에도 정렬 방식을 강제 주입하여 globals.css의 left 강제화 돌파
        if (entries.some(([prop]) => prop === 'text-align')) {
          const alignVal = entries.find(([prop]) => prop === 'text-align')[1];
          css += `.custom-preview-container .katex-display {\n`;
          css += `  display: flex !important;\n`;
          if (alignVal === 'center') {
            css += `  justify-content: center !important;\n`;
          } else if (alignVal === 'right') {
            css += `  justify-content: flex-end !important;\n`;
          } else {
            css += `  justify-content: flex-start !important;\n`;
          }
          css += `}\n`;
          css += `.custom-preview-container .katex-display > .katex {\n`;
          css += `  text-align: ${alignVal} !important;\n`;
          css += `}\n`;
        }
        
        // 2. 인라인 및 텍스트 속성 (색상, 크기 등)
        css += `.custom-preview-container .katex-display .katex, .custom-preview-container :not(.katex-display) > .katex {\n`;
        entries.forEach(([prop, val]) => {
          if (!layoutProps.includes(prop)) {
            css += `  ${prop}: ${val} !important;\n`;
          }
        });
        css += `}\n`;
        return;
      }

      if (tag === 'footnote') {
        const color = ruleObj['color'];
        const fontSize = ruleObj['font-size'];
        const lineHeight = ruleObj['line-height'];
        const marginTop = ruleObj['margin-top'];
        const fontWeight = ruleObj['font-weight'];

        if (marginTop) {
          css += `.custom-preview-container .footnotes {\n  margin-top: ${marginTop} !important;\n}\n`;
        }
        if (color) {
          css += `.custom-preview-container .footnotes, .custom-preview-container .footnotes p, .custom-preview-container .footnotes li, .custom-preview-container .footnotes a {\n  color: ${color} !important;\n}\n`;
        }
        if (fontSize) {
          css += `.custom-preview-container .footnotes, .custom-preview-container .footnotes p, .custom-preview-container .footnotes li, .custom-preview-container .footnotes a {\n  font-size: ${fontSize} !important;\n}\n`;
        }
        if (lineHeight) {
          css += `.custom-preview-container .footnotes, .custom-preview-container .footnotes p, .custom-preview-container .footnotes li, .custom-preview-container .footnotes a {\n  line-height: ${lineHeight} !important;\n}\n`;
        }
        if (fontWeight) {
          css += `.custom-preview-container .footnotes, .custom-preview-container .footnotes p, .custom-preview-container .footnotes li, .custom-preview-container .footnotes a {\n  font-weight: ${fontWeight} !important;\n}\n`;
        }
        return;
      }

      const selector = tag === 'taskList' ? '.task-list-item' :
        tag === 'code' ? ':not(pre) > code' :
          tag === 'map' ? 'iframe[src*="map"]' :
            tag === 'video' ? 'video, iframe[src*="youtube"], iframe[src*="vimeo"], a[href*="youtube.com"] img, a[href*="youtu.be"] img' : tag;
            
      const isMediaTag = tag === 'img' || tag === 'video' || tag === 'map';
      const sizeProps = ['width', 'height', 'max-width', 'max-height'];
      css += `.custom-preview-container ${selector} {\n`;
      entries.forEach(([prop, val]) => {
        const skipImportant = isMediaTag && sizeProps.includes(prop);
        css += `  ${prop}: ${val}${skipImportant ? '' : ' !important'};\n`;
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
      const hrColor = hrRules['border-top-color'] || hrRules['border-color'] || hrRules['color'] || '#e5e7eb';
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
      const cbEffect = prof.checkboxStructure.checkedEffect || 'none';
      const cbColor = prof.checkboxStructure.color || 'currentColor';
      css += `
.custom-preview-container input[type="checkbox"] {
  appearance: none !important;
  -webkit-appearance: none !important;
  width: ${cbSize} !important;
  height: ${cbSize} !important;
  margin-right: ${cbGap} !important;
  border: 1px solid ${cbColor} !important;
  border-radius: 3px !important;
  background-color: transparent !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  position: relative !important;
  vertical-align: middle !important;
  flex-shrink: 0 !important;
}

.custom-preview-container input[type="checkbox"]:checked {
  background-color: ${cbColor} !important;
  border-color: ${cbColor} !important;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3E%3C/svg%3E") !important;
  background-size: 100% 100% !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
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



    // 💡 마커 색상: ul/ol 텍스트 색상을 상속받도록 강제 (Tailwind 기본색상 무시)
    css += `
.custom-preview-container ul li::marker,
.custom-preview-container ol li::marker {
  color: inherit !important;
}
`;

    return css;
  }, [profiles, activeProfileId]);

  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0069] MainEditorApp.tsx ➔ quickWrap
  // 🎯 @KICK  : 선택 영역 또는 현재 줄을 제목/인용구/코드 서식으로 빠르게 감쌉니다
  // 🛡️ @GUARD : 선택 영역이 없으면 전체 줄 자동 선택; Monaco 가드 확인
  // 🚨 @PATCH : None
  // 🔗 @CALLS : wrapSelection, applyLinePrefix, insertBlockTag, editor.focus
  // ====================================================================
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
    setIsLicenseModalOpen,
    setIsSettingsModalOpen,
    setIsImageModalOpen,
    setIsReferenceModalOpen,
    setEditingImageInfo,
    setSettingsModalInitialTab,
    setFontSize,
    setHelpTitle,
    setHelpContent,
    setIsHelpModalOpen,
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
    setShowDocLinkPicker,
    sanitizePastedText,
    isComposingRef,
    previewRef,
    createNewTab,
    switchTab,
    setTabs,
    activeTabIdRef,
    licenseStatusRef
  });

  handlersRef.current = handlers;

  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0070] MainEditorApp.tsx ➔ dispatchCommand
  // 🎯 @KICK  : 에디터 포커스 가드와 함께 EditorCommandType을 핸들러 메서드로 라우팅하는 통합 명령 디스패처
  // 🛡️ @GUARD : 브라우저 포커스 손실 방지를 위한 entry에서 editor.focus(); 모달 명령 후 50ms 비동기 forceTokenization; previewMode !== 'preview' 가드를 이용한 내보내기 제한
  // 🚨 @PATCH : **2026-06-19** — 내보내기 모드 가드 패치: previewMode가 'preview'(미리보기 전용) 모드가 아닐 때 내보내기 명령(PRINT, EXPORT_*)이 트리거되는 경우 경고 토스트를 띄우고 명령 실행을 차단하도록 보정; 문자 겹침 수정을 위한 50ms setTimeout 토큰화 + 레이아웃 (WBS SYNC-02)
  // 🔗 @CALLS : handlers.newFile/save/saveAs/exit/print/exportHTML/exportEPUB/exportPNG/openExport, handlers.zoomIn/zoomOut/undo/redo/find/replace/globalSearch/settings/about/help/license, handlers.toggleFloatingToolbar/cleanDoc/copyAll, handlers.bold/italic/inlineCode/underline/strikethrough/h1-h6/hr/orderedList/list/quote/check/removePrefix, handlers.link/doclink/image/video/now/map/table/quickTable/insertTableRow/deleteTableRow/code/chart/math, handlers.quickWrap, selectRootFolder, setPreviewMode, setIsToolbarOpen, setIsSidebarOpen, setThemePalette, setIsDarkMode
  // ====================================================================
  const dispatchCommand = useCallback((type: EditorCommandType, payload?: any) => {
    // [WBS SYNC-01] 명령어 실행 초입 단계에 반드시 editor.focus()를 강제 격발하여 브라우저 포커스 뺏김 방지 및 포지션 최우선 확보
    let editorPosition = null;
    if (editorRef.current) {
      const editor = editorRef.current;
      editor.focus();
      editorPosition = editor.getPosition();
    }

    // 🔒 [제한 사용자 쓰기 방어 가드] 기능 제거됨

    // 1. 에디터 텍스트 비조작 명령어 (상태 제어 및 파일 입출력 위임)
    switch (type) {
      // 파일 관련
      case 'NEW_FILE': return;
      case 'OPEN_FILE': (async () => {
        if (typeof (window as any).showOpenFilePicker !== 'function') {
          showToast('이 브라우저는 로컬 파일 열기를 지원하지 않습니다.', 'error');
          return;
        }
        try {
          const [fileHandle] = await (window as any).showOpenFilePicker({
            multiple: false,
            types: [{
              description: 'Markdown Files',
              accept: { 'text/markdown': ['.md', '.markdown'], 'text/plain': ['.md'] }
            }]
          });
          const file = await fileHandle.getFile();
          const text = await file.text();
          updateContent(text);
          setCurrentFileName(file.name);
          setCurrentFileNode({ name: file.name, kind: 'file', handle: fileHandle });
          lastSavedContentRef.current = text;
          setSaveStatus('saved');
          refreshFileList();
          showToast(`'${file.name}' 파일을 열었습니다.`, 'success');
        } catch (e: any) {
          if (e.name !== 'AbortError') showToast(`파일 열기 실패: ${e.message}`, 'error');
        }
      })(); return;
      case 'OPEN_WORKSPACE': selectRootFolder('local', null); return;
      case 'SAVE': handlers.save(); return;
      case 'SAVE_AS': handlers.saveAs(); return;
      case 'EXIT': handlers.exit(); return;

      // 내보내기 관련
      case 'PRINT':
      case 'EXPORT_HTML':
      case 'EXPORT_EPUB':
      case 'EXPORT_PNG':
      case 'OPEN_EXPORT': {
        // 🔒 [내보내기 방어 가드] 기능 제거됨
        if (previewMode !== 'preview') {
          showToast('내보내기는 미리보기 전용 모드에서만 가능합니다. (상단 도구 > 미리보기 선택)', 'warning');
          return;
        }
        if (type === 'PRINT') handlers.print();
        else if (type === 'EXPORT_HTML') handlers.exportHTML();
        else if (type === 'EXPORT_EPUB') handlers.exportEPUB();
        else if (type === 'EXPORT_PNG') handlers.exportPNG();
        else if (type === 'OPEN_EXPORT') handlers.openExport();
        return;
      }

      // 보기/제어 관련
      case 'ZOOM_IN': handlers.zoomIn(); return;
      case 'ZOOM_OUT': handlers.zoomOut(); return;
      case 'UNDO': handlers.undo(); return;
      case 'REDO': handlers.redo(); return;
      case 'FIND': handlers.find(); return;
      case 'REPLACE': handlers.replace(); return;
      case 'GLOBAL_SEARCH': handlers.globalSearch(); return;
      case 'SETTINGS':
        setIsSettingsModalOpen(true);
        return;
      case 'SETTINGS_SHORTCUTS':
        setSettingsModalInitialTab('shortcuts');
        setIsSettingsModalOpen(true);
        return;
      case 'TOGGLE_CSS_STYLE':
        setIsStyleModalOpen(true);
        return;
      case 'ADD_REFERENCE':
        setIsReferenceModalOpen(true);
        return;
      case 'ABOUT': handlers.about(); return;
      case 'HELP': handlers.help(); return;
      case 'LICENSE': handlers.license(); return;
      case 'TOGGLE_FLOATING_TOOLBAR': {
        if (!activeTabId || previewMode === 'preview') {
          showToast('편집 모드에서 문서가 열려있을 때만 사용 가능합니다.', 'warning');
          return;
        }
        handlers.toggleFloatingToolbar(); 
        return;
      }
      case 'AI_DRAFT': {
        if (!geminiApiKey) {
          showToast('설정에서 Gemini API 키를 먼저 등록해주세요.', 'warning');
          setIsSettingsModalOpen(true);
          return;
        }
        if (!activeTabId || previewMode === 'preview') {
          showToast('편집 모드에서 문서가 열려있을 때만 사용 가능합니다.', 'warning');
          return;
        }
        setAiDraftInitialMode('draft');
        setIsAIDraftModalOpen(true); 
        return;
      }
      case 'OPEN_AI_WRITER': {
        if (!geminiApiKey) {
          showToast('설정에서 Gemini API 키를 먼저 등록해주세요.', 'warning');
          setIsSettingsModalOpen(true);
          return;
        }
        if (!activeTabId || previewMode === 'preview') {
          showToast('편집 모드에서 문서가 열려있을 때만 사용 가능합니다.', 'warning');
          return;
        }
        const editor = editorRef.current;
        const selection = editor ? editor.getSelection() : null;
        const model = editor ? editor.getModel() : null;
        let selectedText = '';
        let fullText = '';
        if (editor && model) {
          fullText = model.getValue();
          if (selection && !selection.isEmpty()) {
            selectedText = model.getValueInRange(selection);
          }
        }
        setAiEditorContext({ selectedText, fullText });
        setAiDraftInitialMode('editorial');
        setIsAIDraftModalOpen(true);
        return;
      }
      case 'SLASH_COMMAND': {
        if (!activeTabId || previewMode === 'preview') {
          showToast('편집 모드에서 문서가 열려있을 때만 사용 가능합니다.', 'warning');
          return;
        }
        const editor = editorRef.current;
        if (editor) {
          editor.focus();
          const position = editor.getPosition();
          if (position) {
            editor.executeEdits('slash-trigger', [
              {
                range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
                text: '/',
                forceMoveMarkers: true
              }
            ]);
            setTimeout(() => {
              editor.trigger('keyboard', 'editor.action.triggerSuggest', {});
            }, 50);
          }
        }
        return;
      }
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
      case 'TOGGLE_THEME':
        // 사용자 요청으로 테마 변경 기능 비활성화
        return;
      /*
       * TOGGLE_CSS_STYLE — CssStyleForm 패널 토글 (Ctrl+Shift+S)
       *
       * - css-style 모드: 좌측 50%가 CssStyleForm(서식 정의), 우측 50%가 미리보기
       * - 다시 누르면 'both'(편집+미리보기 분할)로 복귀
       */
      // TOGGLE_CSS_STYLE is merged above with SETTINGS
      case 'MERGE':
        setIsMergeMode(true);
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
      case 'DOCLINK': handlers.doclink(); break;
      case 'IMAGE': handlers.image(); break;
      case 'CITE': setIsCitationModalOpen(true); break;
      case 'YOUTUBE':
      case 'VIDEO': {
        const selText = model.getValueInRange(selection);
        const mdLink = selText.match(/^\[([^\]]*)\]\(([^)]*)\)$/);
        if (mdLink) {
          setYoutubeInitialUrl(mdLink[2]);
          youtubeEditRangeRef.current = new (window as any).monaco.Range(
            selection.startLineNumber, selection.startColumn,
            selection.endLineNumber, selection.endColumn
          );
        } else {
          setYoutubeInitialUrl(null);
          youtubeEditRangeRef.current = null;
        }
        handlers.video();
        break;
      }
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
      } catch (_) { }
    }, 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handlers]);

  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0071] MainEditorApp.tsx ➔ mapIdToCommandType
  // 🎯 @KICK  : 툴바 항목의 camelCase ID를 명시적 재정의 테이블로 EditorCommandType UPPER_SNAKE_CASE에 매핑
  // 🛡️ @GUARD : 불일치 ID에 대한 명시적 매핑(divider→HR, clear→REMOVE_PREFIX, calendar→NOW); 자동 UPPER_SNAKE 폴백
  // 🚨 @PATCH : None
  // 🔗 @CALLS : None
  // ====================================================================
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
      orderedList: 'ORDERED_LIST',
      list: 'LIST',
      quote: 'QUOTE',
      checklist: 'CHECKLIST',
      clear: 'REMOVE_PREFIX',  // id는 clear이지만 커맨드는 REMOVE_PREFIX
      cleanDoc: 'CLEAN_DOC',
      link: 'LINK',
      taglink: 'DOCLINK',
      image: 'IMAGE',
      video: 'VIDEO',
      vidio: 'VIDEO',
      youtube: 'YOUTUBE',
      calendar: 'NOW',
      now: 'NOW',
      map: 'MAP',
      chart: 'CHART',
      codeblock: 'CODE_BLOCK',
      math: 'MATH',
      styleSettings: 'TOGGLE_CSS_STYLE',
      table: 'TABLE',
      footnote: 'FOOTNOTE',
      citation: 'CITE',
      quickTable: 'QUICK_TABLE',
      insertTableRow: 'INSERT_TABLE_ROW',
      deleteTableRow: 'DELETE_TABLE_ROW',
      toggleFloatingToolbar: 'TOGGLE_FLOATING_TOOLBAR',
      toggleToolbar: 'TOGGLE_TOOLBAR',
      toggleSidebar: 'TOGGLE_SIDEBAR',
      toggleMode: 'TOGGLE_MODE',
      toggleTheme: 'TOGGLE_THEME',
      'wrap-h1': 'WRAP_H1',
      aiHelp: 'AI_DRAFT',
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

  // ====================================================================
  // 📊 [OMD-EDIT-MainEditorApp-0072] MainEditorApp.tsx ➔ hotkeyRegistration
  // 🎯 @KICK  : 모든 TOOLBAR_ITEMS에 대해 사용자 정의 단축키(Ctrl+S/Ctrl+Shift+S 포함)로 Monaco 에디터 액션 등록
  // 🛡️ @GUARD : 재실행 시 이전 disposables 해제; 키바인딩 문자열을 Monaco KeyMod/KeyCode로 파싱
  // 🚨 @PATCH : None
  // 🔗 @CALLS : TOOLBAR_ITEMS.forEach, editor.addAction, monaco.editor.defineTheme, monaco.editor.setTheme, updateDecorations, handleEditorPaste
  // ====================================================================
  useEffect(() => {
    if (!editorRef.current || !(window as any).monaco) return;
    const editor = editorRef.current;
    const monaco = (window as any).monaco;

    hotkeyDisposablesRef.current.forEach(d => d.dispose());
    hotkeyDisposablesRef.current = [];

    // 글로벌 trigger-custom-action 명령어를 위한 최신 디스패처 갱신
    if (typeof window !== 'undefined') {
      (window as any).dispatchEditorCommand = (id: string) => {
        if (id === 'AI_MODAL') {
          // 💡 [AI API 가드] API Key가 설정되어 있지 않으면 작동하지 않고 경고 후 설정창을 켭니다.
          if (!geminiApiKey) {
            showToast("AI 기능을 사용하려면 설정(톱니바퀴)에서 Gemini API Key를 등록해 주세요.", "warning");
            dispatchCommand('SETTINGS');
            return;
          }

          const editor = editorRef.current;
          const selection = editor ? editor.getSelection() : null;
          const model = editor ? editor.getModel() : null;
          let selectedText = '';
          if (editor && model && selection && !selection.isEmpty()) {
            selectedText = model.getValueInRange(selection);
          }

          generationIdRef.current++;
          setAiPreviewState(prev => ({
            ...prev,
            isOpen: true,
            promptInput: '',
            streamingText: '',
            isFinished: false,
            isStarted: false,
            action: 'expand',
            originalRange: selection,
            originalText: selectedText,
            targetScope: selectedText ? 'selection' : 'none'
          }));
          return;
        }
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
  }, [customHotkeys, isEditorReady, dispatchCommand, mapIdToCommandType, geminiApiKey, showToast]);

  // ====================================================================
  // 📊 [OMD-EDIT-0037] MainEditorApp.tsx ➔ globalKeydownHandler
  // 🎯 @KICK  : 전역 키보드 단축키 처리기: S/O의 브라우저 기본 동작 차단, Escape로 플로팅 툴바/태그 선택기 처리, 사용자 정의 단축키 라우팅
  // 🛡️ @GUARD : capture 단계 리스너; Monaco 외부 폼 요소 이벤트 무시; IME 229 keyCode 복구; 에디터 포커스 체크 전 글로벌 전용 단축키 감지; Shift+방향키 조기 반환(Monaco 선택 보호)
  // 🚨 @PATCH : Ctrl+S/O 브라우저 기본 저장/열기 다이얼로그 preventDefault 처리; 한글 입력을 위한 keyCode 229 IME 조합 복구
  //           | Shift+방향키를 capture 단계에서 가로채지 않도록 early return 추가 | 2026-06-15 | IME+방향키 충돌로 Monaco 텍스트 선택 버그 해결
  // 🔗 @CALLS : dispatchCommand, mapIdToCommandType, setFloatingToolbar
  // ====================================================================
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // 💡 [비표준 이벤트 가드] getModifierState 메서드가 없는 가상/비표준 이벤트 유입 차단
      if (typeof e.getModifierState !== 'function') {
        return;
      }

      // 💡 [Shift+방향키 가드] capture:true 단계에서 Shift+방향키를 절대 가로채지 않음
      // Monaco 에디터의 cursorLeftSelect/cursorRightSelect 등 기본 텍스트 선택 동작 보호
      // 특히 IME(한글) 상태에서 keyCode 229 복구 로직과 충돌하여 선택이 끊기는 버그 방지
      if (e.shiftKey && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        return;
      }

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

      // Escape: 플로팅 툴바 숨김 (에디터 포커스 무관)
      if (e.key === 'Escape') {
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
        if (e.key === ',') {
          e.preventDefault();
          e.stopPropagation();
          dispatchCommand('SETTINGS');
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

      // 2. 한글 입력기(IME) 상태이거나 한/영 전환 상태에서 영문자가 아닌 키 입력 물리 복원
      if (isCtrl || isAlt) {
        if (e.code && e.code.startsWith('Key')) {
          key = e.code.substring(3).toUpperCase(); // 'KeyX' -> 'X'
        } else if (e.code && e.code.startsWith('Digit')) {
          key = e.code.substring(5); // 'Digit7' -> '7'
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
  }, [customHotkeys, dispatchCommand, mapIdToCommandType, floatingToolbar.visible, setFloatingToolbar]);

  // ====================================================================
  // 📊 [OMD-CORE-MainEditorApp-0074] MainEditorApp.tsx ➔ toc
  // 🎯 @KICK  : 마크다운 제목에서 목차를 생성하고 코드 블록은 건너뜁니다
  // 🛡️ @GUARD : BOM 문자를 제거하고 코드 블록 펜스를 감지하여 오탐을 방지합니다
  // 🚨 @PATCH : None
  // 🔗 @CALLS : None
  // ====================================================================
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

  const heightClass = 'h-[calc(100vh-128px)]';
  const activeTab = tabs.find(t => t.id === activeTabId);
  // 🛡️ [EMBEDDED WELCOME 2026-07-07] 제한사용자 — licenseStatus로 직접 판단.
  // 탭/콘텐츠/activeTabId 상태와 무관하게 강제로 embedded 환영 페이지를 렌더링합니다.
  const showEmbeddedWelcome = false;
  const openTabPaths = useMemo(() => tabs.map(t => t.path).filter(Boolean) as string[], [tabs]);

  const contextValue = {
    content, setContent,
    tabs, setTabs,
    activeTabId, setActiveTabId,
    previewMode, setPreviewMode,
    isA4GuardEnabled, setIsA4GuardEnabled,
    currentFileName, setCurrentFileName,
    currentFileNode, setCurrentFileNode,
    workspaceType, setWorkspaceType,
    rootFolder, setRootFolder,
    resourceFolder, resourceFolderHandle,
    fileList, setFileList,
    dispatchCommand,
    isDarkMode, setIsDarkMode,
    themePalette, handleThemeChange,
    licenseStatus, isExpired: licenseStatus.isExpired,
    isAddonEnv, editorRef, previewRef, showToast, openTabPaths, refreshFileList,
    driveLetter, profiles, activeProfileId, DEFAULT_PROFILE: (window as any).DEFAULT_PROFILE || {},
    saveStatus, isToolbarOpen, setIsToolbarOpen, isSidebarOpen, setIsSidebarOpen, isActivated, THEME_MAP,
    cursorLine,
    cursorColumn,
    switchTab, closeTab, createNewTab,
    isSearchOpen, setIsSearchOpen,
    sidebarWidth, setSidebarWidth, sidebarTab, setSidebarTab,
    setCurrentFileName, lastSavedContentRef, toc, scrollToLine, openFile: handleFileClick,
    askConfirm: (config: any) => setConfirmConfig({ isOpen: true, ...config }),
    isMergeMode, setIsMergeMode, selectedMergeNodes, setSelectedMergeNodes, toggleMergeNodeSelect,
    onOpenMergeModal: handleOpenMergeModal, onSelectRootFolder: () => selectRootFolder('local', null),
    onRestoreFolder: restoreFolderPermission,
    isHelpModalOpen, setIsHelpModalOpen, helpTitle, setHelpTitle, helpContent, setHelpContent,
    tabs,
    geminiApiKey,
    aiModelName
  };

  const { handleMount } = useMonacoSetup({
    editorRef, tabsRef, activeTabIdRef, contentRef, isComposingRef, previewDebounceRef,
    setContent, setTabs, activeTabId, setSaveStatus, currentFileNodeRef, lastSavedContentRef,
    saveFile, autoSaveRef, previewModeRef, previewRef, isScrollingRef, scrollTimeoutRef,
    isEditorReady, setIsEditorReady, themePalette, EDITOR_THEMES, updateDecorations,
    decorationsCollectionRef, isEditorHovered, prevCursorLineRef,
    setActiveLine, setCursorLine, setCursorColumn, tabSizeRef, setFloatingToolbar, lastSelectionRef,
    completionProviderRef, getSlashCommands, customSlashCommandsRef,
    handleEditorPaste, handlePasteImageFile,
    wikilinkProviderRef, docLinkFilesRef, readFileTextRef, extractHeadings, getRelativePath,
    isEditorMountedRef, updateContent
  });

  // Get docLinkPicker absolute screen coordinates based on cursor position
  let docLinkPickerStyle: React.CSSProperties = { top: 0, left: 0 };
  if (showDocLinkPicker && editorRef.current) {
    const editor = editorRef.current;
    const position = editor.getPosition();
    if (position) {
      const visiblePos = editor.getScrolledVisiblePosition(position);
      if (visiblePos) {
        const editorDom = editor.getContainerDomNode();
        if (editorDom) {
          const rect = editorDom.getBoundingClientRect();
          let top = visiblePos.top + rect.top + 22;
          let left = visiblePos.left + rect.left;
          if (typeof window !== 'undefined') {
            if (left + 280 > window.innerWidth) {
              left = Math.max(16, window.innerWidth - 296);
            }
            if (left < 16) {
              left = 16;
            }
            if (top + 350 > window.innerHeight) {
              top = Math.max(16, visiblePos.top + rect.top - 356);
            }
          }
          docLinkPickerStyle = { top, left };
        }
      }
    }
  }
  if (docLinkPickerStyle.top === 0 && docLinkPickerStyle.left === 0) {
    let fixedTop = floatingToolbar.top;
    let fixedLeft = floatingToolbar.left;
    if (editorRef.current) {
      const editorDom = editorRef.current.getContainerDomNode();
      if (editorDom) {
        const rect = editorDom.getBoundingClientRect();
        fixedTop += rect.top;
        fixedLeft += rect.left;
      }
    }
    docLinkPickerStyle = { top: fixedTop + 44, left: fixedLeft };
  }
  const handleAIDraftApply = (draftContent: string, action: 'insert' | 'replace' | 'append') => {
    setIsAIDraftModalOpen(false); // Close modal
    
    if (editorRef.current) {
      const editor = editorRef.current;
      const position = editor.getPosition() || { lineNumber: 1, column: 1 };
      const selection = editor.getSelection();
      const model = editor.getModel();
      const monacoObj = typeof window !== 'undefined' && (window as any).monaco ? (window as any).monaco : null;
      
      if (model && monacoObj) {
        if (action === 'insert') {
          const insertText = `\n\n${draftContent}\n\n`;
          editor.executeEdits("AI_DRAFT_INSERT", [{
            range: new monacoObj.Range(position.lineNumber, position.column, position.lineNumber, position.column),
            text: insertText,
            forceMoveMarkers: true
          }]);
          editor.setPosition({ lineNumber: position.lineNumber + 2, column: 1 });
          editor.revealPositionInCenter({ lineNumber: position.lineNumber + 2, column: 1 }, 1);
          showToast("작성된 초안이 본문에 삽입되었습니다. (Ctrl+Z 실행취소 가능)", "success");
        } else if (action === 'replace') {
          if (selection && !selection.isEmpty()) {
            editor.executeEdits("AI_MODAL_REPLACE", [{
              range: selection,
              text: draftContent,
              forceMoveMarkers: true
            }]);
            showToast("기존 텍스트가 덮어씌워졌습니다. (Ctrl+Z 실행취소 가능)", "success");
          }
        } else if (action === 'append') {
          let endLine = model.getLineCount();
          if (selection && !selection.isEmpty()) {
            endLine = selection.endLineNumber;
          }
          const endCol = model.getLineMaxColumn(endLine);
          const insertRange = new monacoObj.Range(endLine, endCol, endLine, endCol);
          
          const formattedText = `\n\n---\n#### [AI 교정문]\n${draftContent}\n---\n`;
          editor.executeEdits("AI_MODAL_APPEND", [{
            range: insertRange,
            text: formattedText,
            forceMoveMarkers: true
          }]);
          showToast("텍스트 하단에 이어쓰기가 완료되었습니다. (Ctrl+Z 실행취소 가능)", "success");
        }
        editor.focus();
        updateContent(editor.getValue());
      }
    }
  };


  return (
    <>
      <style>{`
        .ai-changed-highlight {
          background-color: rgba(168, 85, 247, 0.25) !important;
          animation: ai-flash-fade 1.5s ease-out forwards;
        }
        @keyframes ai-flash-fade {
          0% { background-color: rgba(168, 85, 247, 0.35); }
          100% { background-color: rgba(168, 85, 247, 0); }
        }
        .ai-stream-pulse {
          animation: ai-pulse-bg 2s infinite ease-in-out;
        }
        @keyframes ai-pulse-bg {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .mic-pulse {
          animation: mic-pulse-anim 1.5s infinite;
        }
        @keyframes mic-pulse-anim {
          0% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(168, 85, 247, 0); }
          100% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0); }
        }
      `}</style>
      <EditorProvider value={contextValue}>
        <div className={`flex h-screen overflow-hidden flex-col text-on-surface transition-colors duration-300 ${mounted && isDarkMode ? 'dark bg-zinc-950 text-zinc-100' : 'bg-surface'}`}>

          <MenuBar />



          <div className="flex flex-1 overflow-hidden relative">
            <LeftSidebar />

            <main className="flex flex-1 flex-col overflow-hidden bg-transparent">
              <FormattingToolbar />

              {/* 탭 바를 오른쪽 에디터/미리보기 영역에만 위치하도록 main 상단에 배치 */}
              {!showEmbeddedWelcome && (
                <div className="no-print flex flex-col w-full">
                  <UnifiedTabBar />
                  {activeTab && (
                    <div className="flex items-center px-4 py-1 border-b border-black/5 dark:border-white/5 bg-zinc-100 dark:bg-zinc-900/80 text-[10px] text-zinc-500 font-semibold shadow-inner z-10">
                      <span className="truncate max-w-full opacity-70 hover:opacity-100 transition-opacity cursor-default">
                        📁 {workspaceType === 'browser' ? (rootFolder?.name ? `${rootFolder.name} \\ ${(currentFileNode?.path || currentFileName).replace(/[\\/]/g, ' \\ ')}` : `🌐 Browser Storage \\ ${(currentFileNode?.path || currentFileName).replace(/[\\/]/g, ' \\ ')}`) : (workspaceType === 'cloud' ? `[${cloudProvider || 'Cloud'}] \\ ${rootFolder?.name || 'Sync'} \\ ${(currentFileNode?.path || currentFileName).replace(/[\\/]/g, ' \\ ')}` : (currentFileNode?.path?.includes(':') ? currentFileNode.path : `${driveLetter}\\새 문서\\${currentFileName}`))}
                      </span>
                    </div>
                  )}
                </div>
              )}
              {showEmbeddedWelcome ? (
                <div className="flex-1 overflow-y-auto bg-zinc-100">
                  <div className="max-w-4xl mx-auto py-8 px-4">
                    <MarkdownViewer
                      content={getWelcomeContent()}
                      originalContent={getWelcomeContent()}
                      lineMap={[]}
                      onFileOpen={handleFileOpenByPath}
                      rootFolderPath={rootFolder?.name}
                      rootFolder={rootFolder}
                      resourceFolderHandle={resourceFolderHandle}
                      resourceFolder={resourceFolder}
                      workspaceType={workspaceType}
                    />
                  </div>
                </div>
              ) : (
                // 💡 [지능형 빈 페이지 가드] 열려있는 탭이 아예 없을 때 에디터 및 미리보기를 회색 차단 영역으로 렌더링
                tabs.length === 0 || !activeTab ? (
                  <div className="flex-grow flex flex-col items-center justify-center bg-zinc-200 dark:bg-zinc-900 text-center gap-4 transition-all duration-300 p-8 select-none">
                    <div className="p-4 bg-zinc-300/60 dark:bg-zinc-800/85 rounded-full text-zinc-500 dark:text-zinc-400 shadow-sm">
                      <Lock size={32} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-sm font-black text-zinc-700 dark:text-zinc-200">
                        활성화된 문서가 없습니다 (편집 및 조작 불가)
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold max-w-sm leading-relaxed">
                        현재 아무런 작업도 수행할 수 없는 빈 상태입니다.
                        <br />
                        좌측 파일 탐색기에서 마크다운(.md) 파일을 선택하여 문서를 열어주세요.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-1 overflow-hidden">

                    <div
                      className="flex-1 min-w-0 relative border-r border-transparent hover:border-black/5 dark:hover:border-white/5 transition-colors duration-500 no-print bg-surface-container-low dark:bg-zinc-950"
                      style={{ display: (previewMode === 'preview' || activeTab?.isStyleTab === true) ? 'none' : 'block' }}
                    >
                      <Editor
                        height="100%"
                        language="markdown"
                        theme={themePalette}
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
                              colors: {
                                ...t.colors,
                                'editor.background': '#00000000', // 프리미엄 룩을 위한 완전 투명 배경 (부모 UI와 일체화)
                                'editor.lineHighlightBackground': '#88888810', // 연한 하이라이트
                                'editorLineNumber.foreground': '#88888850', // 튀지 않는 줄번호
                                'editorIndentGuide.background': '#88888815', // 은은한 들여쓰기 가이드
                                'editorIndentGuide.activeBackground': '#88888830',
                              }
                            });
                          });
                        }}
                        onMount={handleMount}
                        options={{
                          readOnly: tabs.length === 0 || licenseStatus.isExpired,
                          domReadOnly: tabs.length === 0 || licenseStatus.isExpired,
                          padding: { top: 48, bottom: 0, right: 64 }, // 적절한 포커스 패딩 (bottom 0으로 설정하여 마지막 줄 흔들림 버그 해결)
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          fontSize,
                          lineHeight: 1.7, // 시원한 줄간격 유지 (세련됨)
                          fontFamily: "'D2Coding', 'JetBrains Mono', 'Pretendard', Consolas, 'Malgun Gothic', '맑은 고딕', monospace",
                          fontLigatures: false, // 글자 폭 계산 오차를 유발할 수 있는 합자(Ligature) 기능 해제
                          letterSpacing: 0,
                          'semanticHighlighting.enabled': true,
                          wordWrap,
                          lineNumbers: 'on',
                          minimap: { enabled: false },
                          autoClosingBrackets: autoClosingBrackets ? 'languageDefined' : 'never',
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
                          // 💡 마크다운 들여쓰기 규격 준수를 위해 4칸 강제 고정
                          tabSize: 4,
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
                              e.stopPropagation();
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
                            className="fixed z-[99999] flex items-center bg-white dark:bg-zinc-800 shadow-2xl shadow-black/15 rounded-xl border border-black/5 dark:border-white/10 px-3 py-1.5 gap-1 animate-in fade-in zoom-in-95 duration-100 focus:outline-none cursor-move select-none"
                            style={{ top: Math.max(fixedTop, 60), left: fixedLeft, transform: 'translateY(-100%)' }}
                            onMouseDown={handleDragStart}
                          >
                            {(() => {
                              return (
                                <div className="flex flex-row items-center gap-3 min-w-max">
                                  {/* AI 단독 아이콘 */}
                                  <div className="flex items-center">
                                    <button
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        dispatchCommand('OPEN_AI_WRITER' as any);
                                        setFloatingToolbar(prev => ({ ...prev, visible: false }));
                                      }}
                                      className={`w-7 h-7 rounded-lg transition-all flex items-center justify-center shrink-0 ${geminiApiKey
                                        ? 'hover:bg-purple-500/10 text-purple-600 dark:text-purple-400'
                                        : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-400 dark:text-zinc-500'
                                        }`}
                                      title={geminiApiKey ? "AI 글쓰기 어시스턴트" : "AI 글쓰기 (설정에서 API 키를 등록해 주세요)"}
                                    >
                                      <Sparkles size={14} className={geminiApiKey ? "animate-pulse" : ""} />
                                    </button>

                                  </div>
                                  <div className="w-px h-5 bg-black/10 dark:bg-white/10 shrink-0" />

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
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('ORDERED_LIST'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="숫자 목록">🔢</button>
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('LIST'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="글머리 기호">☰</button>
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('QUOTE'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="인용구">❝</button>
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('CHECK'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="체크리스트">☑️</button>
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('REMOVE_PREFIX'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="태그 취소"><Eraser size={14} className="text-red-500 opacity-80 hover:opacity-100" /></button>
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('CLEAN_DOC'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="문서 서식 일괄 정리">🧹</button>
                                  </div>
                                  <div className="w-px h-8 bg-black/10 dark:bg-white/10" />
                                  {/* 삽입 */}
                                  <div className="flex flex-row items-center gap-0.5">
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('LINK'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="링크">🔗</button>
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('DOCLINK'); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="문서 연결">🔖</button>
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('CITE'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="인용(참조문헌)">📝</button>
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('FOOTNOTE'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px] font-bold font-serif" title="각주">fn</button>
                                    <div className="w-px h-5 mx-0.5 bg-black/10 dark:bg-white/10 shrink-0" />
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('IMAGE'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="이미지">🖼️</button>
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('YOUTUBE'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="동영상삽입">🎞️</button>
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('NOW'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="현재 날짜/시간">📅</button>
                                  </div>
                                  <div className="w-px h-8 bg-black/10 dark:bg-white/10" />
                                  {/* 고급 */}
                                  <div className="flex flex-row items-center gap-0.5">
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('MAP'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="지도 삽입">🌏</button>
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('TABLE'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="표 생성">📶</button>
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('CODE'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="코드 블록">⌨️</button>
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('LATEX'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="수식(LaTeX)">🧮</button>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )
                      })()}
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
                          style={docLinkPickerStyle}
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

                    <div
                      className="flex-1 flex flex-col bg-surface-container-low text-on-surface overflow-hidden print:overflow-visible relative"
                      style={{
                        width: previewMode === 'preview' ? '100%' : '50%',
                        display: (previewMode === 'edit' || activeTab?.isStyleTab === true) ? 'none' : 'flex'
                      }}
                    >


                      {/* 🔍 스크롤 가능한 실제 본문 컨테이너 */}
                      <div
                        ref={previewRef}
                        className={`flex-1 print:h-auto print:overflow-visible prose prose-sm md:prose-base max-w-none break-words custom-preview-container text-on-surface ${previewMode === 'preview'
                          ? 'bg-surface-container-high p-4 overflow-y-auto'
                          : 'bg-surface-container-low px-0 pt-0 pb-32 overflow-y-auto'}`}
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
                          // A4 조판 가드가 켜져 있으면 편집+미리보기 모드라도 렌더링 규격은 미리보기 모드와 동일하게 취급
                          const isPreviewOnly = previewMode === 'preview' || isA4GuardEnabled;

                          const paperSizeKey = activeProfile.pageStyle.paperSize?.toLowerCase() || 'a4';
                          const ps = PAPER_SIZES[paperSizeKey] || PAPER_SIZES.a4;
                          const paperWidth = isLandscape ? `${ps.height}mm` : `${ps.width}mm`;
                          const minHeight = isLandscape ? `${ps.width}mm` : `${ps.height}mm`;

                          const pTop = activeProfile.pageStyle.marginTop || '20mm';
                          const pBottom = activeProfile.pageStyle.marginBottom || '20mm';
                          const pLeft = activeProfile.pageStyle.marginLeft || '20mm';
                          const pRight = activeProfile.pageStyle.marginRight || '20mm';

                          const pageStyle: React.CSSProperties = {
                            boxSizing: 'border-box' as const,
                            ...(isPreviewOnly ? {
                              width: paperWidth,
                              minHeight: minHeight,
                              zoom: isA4GuardEnabled ? previewZoomScale : undefined
                            } : {})
                          };

                          return (
                            <div
                              className={isPreviewOnly
                                ? "preview-page-sheet mx-auto my-8 border border-purple-500/5 shadow-[0_16px_48px_rgba(15,0,109,0.04)] bg-white dark:bg-zinc-900 rounded-2xl transition-all duration-300 transform-gpu origin-top overflow-hidden"
                                : `preview-page-sheet mx-auto my-6 ${isLandscape ? 'max-w-6xl' : 'max-w-3xl'} w-full bg-white dark:bg-zinc-900 border border-purple-500/5 shadow-[0_12px_42px_rgba(15,0,109,0.03)] rounded-2xl transition-all duration-300 origin-top overflow-hidden`
                              }
                              style={pageStyle}
                            >
                              <MarkdownViewer
                                content={processedContent}
                                originalContent={content}
                                lineMap={lineMap}
                                onCheckboxToggle={handleCheckboxToggle}
                                currentFilePath={currentFileNode?.path}
                                rootFolderPath={rootFolder?.name}
                                onFileOpen={handleFileOpenByPath}
                                listIndent={activeProfile.rules.ul?.['padding-left'] || activeProfile.rules.ol?.['padding-left']}
                                marginTop={pTop}
                                marginBottom={pBottom}
                                marginLeft={pLeft}
                                marginRight={pRight}
                                bibContent={bibContent}
                                rootFolder={rootFolder}
                                resourceFolderHandle={resourceFolderHandle}
                                resourceFolder={resourceFolder}
                                workspaceType={workspaceType}
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
                        {/* 미리보기 전용 모드이거나 A4 조판 가드가 켜져 있을 때 스킨의 배경색과 외부 감싸기용 회색 배경 분리 지정 */}
                        {(() => {
                          const activeProfile = profiles.find(p => p.id === activeProfileId) || DEFAULT_PROFILE;
                          const paperBg = activeProfile.pageStyle.backgroundColor || '#ffffff';
                          return (
                            <style dangerouslySetInnerHTML={{
                              __html: `
                        ${(previewMode === 'preview' || isA4GuardEnabled) ? `
                        .custom-preview-container {
                          background: ${isDarkMode ? '#13121a' : '#faf9f5'} !important;
                        }
                        ` : ''}
                        .preview-page-sheet {
                          background: ${paperBg} !important;
                          border-color: ${isDarkMode ? '#36343e' : '#e4e1ed'} !important;
                          box-shadow: none !important;
                        }
                      `}} />
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )
              )}

            </main>

            {isToolbarOpen && (
              <div className="no-print h-full w-12 flex flex-col justify-end bg-zinc-50 dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-700/60 pb-3">
                <Toolbar />
              </div>
            )}
          </div>

          <StatusBar />

          {isAIDraftModalOpen && (
            <AIDraftModal 
              onClose={() => setIsAIDraftModalOpen(false)} 
              onApply={handleAIDraftApply} 
              geminiApiKey={geminiApiKey || ''}
              aiModelName={aiModelName || 'gemini-1.5-flash'}
              initialMode={aiDraftInitialMode}
              editorContext={aiEditorContext}
            />
          )}

          {/* 💡 [Step 4 리팩토링 완료] 모든 모달 껍데기들을 ModalManager로 완벽하게 이관 완료! */}
          <ModalManager
            modals={{
              isSettingsModalOpen, setIsSettingsModalOpen,
              settingsModalInitialTab, setSettingsModalInitialTab,
              isStyleModalOpen, setIsStyleModalOpen,
              isExportModalOpen, setIsExportModalOpen,
              isImageModalOpen, setIsImageModalOpen,
              editingImageInfo, setEditingImageInfo,
              isMergeModalOpen, setIsMergeModalOpen,
              isYoutubeModalOpen, setIsYoutubeModalOpen,
              youtubeInitialUrl, setYoutubeInitialUrl,
              isLicenseModalOpen, setIsLicenseModalOpen,
              isHelpModalOpen, setIsHelpModalOpen,
              isFormulaModalOpen, setIsFormulaModalOpen,
              promptConfig, setPromptConfig,
              confirmConfig, setConfirmConfig,
              isMapModalOpen, setIsMapModalOpen,
              isTableModalOpen, setIsTableModalOpen,
              isReferenceModalOpen, setIsReferenceModalOpen,
              isCitationModalOpen, setIsCitationModalOpen
            }}
            deps={{
              isDarkMode, setIsDarkMode, fontSize, setFontSize, wordWrap, setWordWrap,
              autoSave, setAutoSave, rootFolder, selectRootFolder, driveLetter, setDriveLetter,
              workspaceType, setWorkspaceType, previewMode, setPreviewMode, customHotkeys, setCustomHotkeys,
              customSlashCommands, setCustomSlashCommands, licenseKey, setLicenseKey, themePalette, handleThemeChange,
              isActivated, autoClosingBrackets, setAutoClosingBrackets, geminiApiKey, setGeminiApiKey, aiModelName, setAiModelName,
              isActivated, licenseStatus, deviceId, handleSuccessActivation, handlers, content, currentFileNodeRef,
              setCurrentFileName, setCurrentFileNode, lastSavedContentRef, setSaveStatus, refreshFileList,
              showToast, editorRef, insertAtCursor, setIsMergeMode, selectedMergeNodes, setSelectedMergeNodes,
              handleFileClick, profiles, activeProfileId, dynamicCssString, setActiveProfileId: handleProfileChange, setProfiles,
              isSystemProfileId,
              getApiUrl,
              DEFAULT_PROFILE,
              SYSTEM_PROFILES,
              vfsCreateFile,
              vfsWriteFile,
              vfsCreateFolder,
              helpTitle, helpContent, setHelpContent,
              resourceFolder, resourceFolderRef, resourceFolderHandle, selectResourceFolder
            }}
          />



          {/* 🔮 AI 인라인 프리뷰 카드 (수락/취소 안전장치) */}
          {aiPreviewState.isOpen && (() => {
            const handleApplyInsert = () => {
              const editor = editorRef.current;
              if (!editor || !aiPreviewState.originalRange) return;
              const monaco = (window as any).monaco;

              editor.executeEdits("AI_INSERT", [{
                range: aiPreviewState.originalRange,
                text: aiPreviewState.streamingText,
                forceMoveMarkers: true
              }]);

              // 바뀐 곳으로 스크롤 고정 및 하이라이트
              const lines = aiPreviewState.streamingText.split('\n');
              const startLine = aiPreviewState.originalRange.startLineNumber;
              const startCol = aiPreviewState.originalRange.startColumn;
              const endLine = startLine + lines.length - 1;
              const endCol = lines.length === 1 ? startCol + aiPreviewState.streamingText.length : lines[lines.length - 1].length + 1;
              const newRange = new monaco.Range(startLine, startCol, endLine, endCol);

              editor.setSelection(newRange);
              editor.revealRangeInCenter(newRange, 1);

              const newDeco = [{ range: newRange, options: { className: 'ai-changed-highlight', isWholeLine: false } }];
              aiDecorationsRef.current = editor.deltaDecorations(aiDecorationsRef.current, newDeco);
              setTimeout(() => {
                if (editorRef.current) aiDecorationsRef.current = editorRef.current.deltaDecorations(aiDecorationsRef.current, []);
              }, 1500);

              setAiPreviewState(prev => ({ ...prev, isOpen: false }));
              showToast("문장이 본문에 성공적으로 적용되었습니다. (Ctrl+Z 실행취소 가능)", 'success');
            };

            const handleApplyAppend = () => {
              const editor = editorRef.current;
              const model = editor?.getModel();
              if (!editor || !model || !aiPreviewState.originalRange) return;
              const monaco = (window as any).monaco;

              const endLine = aiPreviewState.originalRange.endLineNumber;
              const endCol = model.getLineMaxColumn(endLine);
              const insertRange = new monaco.Range(endLine, endCol, endLine, endCol);

              let formattedText = '';
              if (aiPreviewState.action === 'summarize') {
                formattedText = `\n\n> 📝 **AI 요약**:\n> ` + aiPreviewState.streamingText.replace(/\r?\n/g, '\n> ') + `\n`;
              } else {
                formattedText = `\n\n> ✨ **AI 가공 결과**:\n> ` + aiPreviewState.streamingText.replace(/\r?\n/g, '\n> ') + `\n`;
              }

              editor.executeEdits("AI_APPEND", [{
                range: insertRange,
                text: formattedText,
                forceMoveMarkers: true
              }]);

              // 새로 추가된 위치 계산 및 포커싱/하이라이트
              const lines = formattedText.split('\n');
              const startLine = endLine;
              const startCol = endCol;
              const endLineNum = startLine + lines.length - 1;
              const endColNum = lines.length === 1 ? startCol + formattedText.length : lines[lines.length - 1].length + 1;
              const newRange = new monaco.Range(startLine, startCol, endLineNum, endColNum);

              editor.setSelection(newRange);
              editor.revealRangeInCenter(newRange, 1);

              const newDeco = [{ range: newRange, options: { className: 'ai-changed-highlight', isWholeLine: false } }];
              aiDecorationsRef.current = editor.deltaDecorations(aiDecorationsRef.current, newDeco);
              setTimeout(() => {
                if (editorRef.current) aiDecorationsRef.current = editorRef.current.deltaDecorations(aiDecorationsRef.current, []);
              }, 1500);

              setAiPreviewState(prev => ({ ...prev, isOpen: false }));
              showToast("결과물이 아랫줄에 덧붙여졌습니다. (Ctrl+Z 실행취소 가능)", 'success');
            };

            const handleCancel = () => {
              generationIdRef.current++;
              setAiPreviewState(prev => ({ ...prev, isOpen: false }));
              showToast("AI 결과가 취소되었습니다.", 'info');
            };

            return (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999] w-[90%] max-w-xl bg-white dark:bg-zinc-900 shadow-2xl rounded-2xl border border-purple-500/20 p-4 flex flex-col gap-3 animate-in slide-in-from-bottom-5 duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-purple-500 animate-pulse" />
                    <span className="text-sm font-extrabold text-purple-600 dark:text-purple-400">
                      AI 가공 결과 프리뷰 ({aiPreviewState.action.toUpperCase()})
                    </span>
                  </div>
                  {!aiPreviewState.isFinished && (
                    <span className="text-[11px] font-bold text-purple-500/80 animate-pulse bg-purple-500/10 px-2 py-0.5 rounded-full">
                      글자 생성 중...
                    </span>
                  )}
                </div>

                <div
                  className="text-xs font-mono p-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950/80 text-slate-800 dark:text-zinc-200 overflow-y-auto whitespace-pre-wrap select-text cursor-text min-h-[80px]"
                  style={{ maxHeight: '180px' }}
                >
                  {aiPreviewState.streamingText ? (
                    <span className="w-full text-left">{aiPreviewState.streamingText}</span>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 py-4 select-none">
                      <Loader2 className="animate-spin text-purple-500" size={20} />
                      <span className="text-slate-500 dark:text-zinc-400 italic text-[11px] font-bold animate-pulse">
                        AI가 최적의 문장 구조를 가공하는 중입니다...
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                    Ctrl+Z로 본문 치환 후 즉시 원복할 수 있습니다.
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCancel}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleApplyAppend}
                      disabled={!aiPreviewState.streamingText}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg border border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/15 text-purple-600 dark:text-purple-400 disabled:opacity-40 transition-colors"
                    >
                      아래에 추가
                    </button>
                    <button
                      onClick={handleApplyInsert}
                      disabled={!aiPreviewState.streamingText}
                      className="px-4 py-1.5 text-xs font-bold rounded-lg text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-40 transition-opacity"
                    >
                      본문에 적용
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 🎙️ 모바일 플로팅 음성 비서 (STT) */}
          {mounted && isMobile && (() => {
            const handleSpeechToText = () => {
              const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
              if (!SpeechRecognition) {
                showToast("죄송합니다. 현재 브라우저는 음성 인식을 지원하지 않습니다.", 'error');
                return;
              }

              if (isRecording) {
                // 녹음 중지
                setIsRecording(false);
                return;
              }

              const recognition = new SpeechRecognition();
              recognition.lang = 'ko-KR';
              recognition.interimResults = false;
              recognition.maxAlternatives = 1;

              recognition.onstart = () => {
                setIsRecording(true);
                showToast("🎙️ 마이크가 켜졌습니다. 말씀해 주세요...", 'info');
              };

              recognition.onerror = (e: any) => {
                console.error('Speech recognition error:', e);
                setIsRecording(false);
                showToast("음성 인식에 실패했습니다.", 'error');
              };

              recognition.onend = () => {
                setIsRecording(false);
              };

              recognition.onresult = async (event: any) => {
                const transcript = event.results[0][0].transcript;
                if (!transcript.trim()) return;

                showToast(`음성 감지: "${transcript}"`, 'success');

                // 음성을 AI 다듬기(POLISH)로 가공하여 에디터에 주입
                if (!geminiApiKey) {
                  // API Key가 없으면 원본 음성 텍스트라도 본문에 직접 삽입
                  insertAtCursor(transcript);
                  showToast("API 키가 설정되어 있지 않아 원본 음성을 그대로 입력했습니다.", 'info');
                  return;
                }

                // 가짜 렌더링 범위 생성 후 AI 스트리밍 구동
                const editor = editorRef.current;
                if (!editor) return;
                const model = editor.getModel();
                if (!model) return;
                const pos = editor.getPosition() || { lineNumber: 1, column: 1 };
                const dummyRange = new ((window as any).monaco).Range(pos.lineNumber, pos.column, pos.lineNumber, pos.column);

                const currentGenId = ++generationIdRef.current;

                setAiPreviewState({
                  isOpen: true,
                  originalRange: dummyRange,
                  streamingText: '',
                  action: 'polish',
                  originalText: transcript,
                  isFinished: false
                });

                try {
                  await processTextWithAIStream(
                    geminiApiKey,
                    aiModelName,
                    `이 구어체 음성을 깔끔하고 정갈한 공지글 또는 설명글 템플릿으로 가공해줘: "${transcript}"`,
                    'polish',
                    (chunkText) => {
                      if (currentGenId !== generationIdRef.current) return;
                      setAiPreviewState(prev => ({ ...prev, streamingText: chunkText }));
                    }
                  );
                  if (currentGenId !== generationIdRef.current) return;
                  setAiPreviewState(prev => ({ ...prev, isFinished: true }));
                } catch (err: any) {
                  if (currentGenId !== generationIdRef.current) return;
                  showToast("음성 가공 요청 실패", 'error');
                  setAiPreviewState(prev => ({ ...prev, isOpen: false }));
                }
              };

              recognition.start();
            };

            return (
              <button
                onClick={handleSpeechToText}
                className={`fixed bottom-20 right-6 z-[99999] w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-transform hover:scale-105 active:scale-95 cursor-pointer ${isRecording ? 'bg-rose-500 mic-pulse' : 'bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-purple-500/20'}`}
              >
                {isRecording ? (
                  <span className="w-4 h-4 bg-white rounded-full animate-ping" />
                ) : (
                  <span className="text-xl">🎙️</span>
                )}
              </button>
            );
          })()}

          {isAiLoading && (
            <div className="fixed inset-0 z-[99999] bg-black/25 dark:bg-black/55 flex items-center justify-center pointer-events-none select-none">
              <div className="bg-white dark:bg-zinc-800 shadow-2xl border border-purple-500/20 rounded-2xl px-6 py-4 flex items-center gap-3.5 animate-in fade-in zoom-in-95 duration-200">
                <Loader2 className="animate-spin text-purple-500" size={20} />
                <span className="text-[13px] font-bold text-zinc-700 dark:text-zinc-200">
                  AI가 문장을 다듬고 있습니다...
                </span>
              </div>
            </div>
          )}
        </div>
      </EditorProvider>
    </>
  );
}
