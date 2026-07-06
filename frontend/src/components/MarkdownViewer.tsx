// 🚨 @PATCH : **2026-07-04** — Mermaid 다이어그램 렌더링 문법 에러 복구 강화(유입된 중첩 백틱 펜스 태그 ```mermaid 및 깨진 기호/괄호 라인 자동 정제, 화살표 레이블 간격 자동 보정) 및 에러 발생 시 마크다운 코드 원본을 복사하고 대조해볼 수 있는 '코드 원본 보기' 디버깅 UI 추가 패치
//             **2026-06-20** — Mermaid 다이어그램 이미지 저장(handleSaveImage) 기능이 Electron 데스크톱 앱 내에서 동작하지 않던 API 명칭 불일치 버그(saveAs -> saveFileAs)를 해결하고, 웹 브라우저 환경에서 동작할 수 있도록 a 링크 다운로드 폴백을 추가; 다이어그램 저장, 이미지 복사 시 다이어그램 크기가 극도로 작게 나오는 찌그러짐 결함을 3배 스케일링 기법으로 최종 영구 해결; 딤드 오버레이 방식의 복잡한 확대 모달을 전면 걷어내고, 독립 새 브라우저 창(Pop-up Window)으로 다이어그램을 선명하게 확대 및 다중 작업할 수 있도록 openInNewWindow 기능으로 리팩토링 및 🔍 새 창으로 확대 버튼 제공

import React, { useMemo, useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import DOMPurify from 'dompurify';
import rehypeSanitize from 'rehype-sanitize';
import { getApiUrl } from '@/lib/apiUrlBuilder';
import VideoCard from '@/components/VideoCard';
import SocialVideoCard from '@/components/SocialVideoCard';

const getTextFromChildren = (children: React.ReactNode): string => {
  if (children === null || children === undefined) return '';
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(getTextFromChildren).join('');
  }
  if (React.isValidElement(children)) {
    return getTextFromChildren(children.props.children);
  }
  return '';
};

/**
 * [ONR-MD-005] MarkdownViewerProps 인터페이스
 * @description 마크다운 렌더러 뷰어 컴포넌트에 주입되는 마크다운 원문(content), 체크박스 토글 핸들러 규격 명세입니다.
 */
interface MarkdownViewerProps {
  content: string;
  originalContent?: string;
  lineMap?: number[];
  onCheckboxToggle?: (lineNumber: number, checked: boolean) => void;
  currentFilePath?: string;
  rootFolderPath?: string;
  onFileOpen?: (resolvedPath: string, hashPart?: string) => void;
  listIndent?: string;
  marginTop?: string;
  marginBottom?: string;
  marginLeft?: string;
  marginRight?: string;
}

const resolveRelativeImagePath = (srcPath: string, currentFileNodePath: string | undefined): string => {
  if (!srcPath) return "";

  // 앞뒤 꺾쇠 괄호 <> 제거 (경로 내 공백 처리를 위해 감싸진 경우 방어)
  let cleanSrcPath = srcPath.trim();
  if (cleanSrcPath.startsWith('<') && cleanSrcPath.endsWith('>')) {
    cleanSrcPath = cleanSrcPath.slice(1, -1);
  }

  if (cleanSrcPath.startsWith('http://') || cleanSrcPath.startsWith('https://') || cleanSrcPath.startsWith('data:') || cleanSrcPath.startsWith('blob:')) {
    return cleanSrcPath;
  }

  // URL 디코딩: 마크다운 파서가 한글/특수문자를 퍼센트 인코딩한 경우 파일시스템 경로로 복원
  let decoded = cleanSrcPath;
  try {
    decoded = decodeURIComponent(cleanSrcPath);
  } catch {
    decoded = cleanSrcPath;
  }

  // 윈도우 절대경로 (예: D:/, C:\ 등) 판별 시 그대로 반환
  const isAbsoluteWin = /^[a-zA-Z]:[\\/]/.test(decoded.replace(/\\/g, '/'));
  if (isAbsoluteWin) {
    return decoded.replace(/\\/g, '/');
  }

  let baseFolder = "";
  if (currentFileNodePath) {
    const normalizedFile = currentFileNodePath.replace(/\\/g, '/');
    const lastSlash = normalizedFile.lastIndexOf('/');
    if (lastSlash !== -1) {
      baseFolder = normalizedFile.substring(0, lastSlash);
    }
  }

  let cleanSrc = decoded.replace(/\\/g, '/');
  let isRootRelative = false;
  if (cleanSrc.startsWith('/')) {
    isRootRelative = true;
    cleanSrc = cleanSrc.substring(1);
  }

  if (cleanSrc.startsWith('./')) {
    cleanSrc = cleanSrc.substring(2);
  }

  let finalPath = "";
  if (isRootRelative) {
    finalPath = cleanSrc;
  } else if (baseFolder) {
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

// ====================================================================
// 📊 [OMD-CORE-MarkdownViewer-0009] MarkdownViewer ➔ remarkDisableIndentedCode
// 🎯 @KICK  : 4칸 들여쓰기/탭의 코드블록 인식을 차단하는 remark 플러그인
// 🛡️ @GUARD : micromarkExtensions에 codeIndented 비활성화 등록
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
// [ONR-MD-001] 들여쓰기 코드 블록 인식 차단: 4칸 들여쓰기/탭 입력 시 코드블록으로 인식되는 기본 마크다운 규격을 차단하는 커스텀 remark 플러그인입니다.
// 🛡️ 들여쓰기 4칸/탭 입력 시 코드블록으로 인식되는 것을 완전히 차단하는 플러그인
function remarkDisableIndentedCode(this: any) {
  const data = this.data();
  if (!data.micromarkExtensions) {
    data.micromarkExtensions = [];
  }
  data.micromarkExtensions.push({
    disable: { null: ['codeIndented'] }
  });
}

// ====================================================================
// 📊 [OMD-CORE-MarkdownViewer-0008] MarkdownViewer ➔ CodeBlock
// 🎯 @KICK  : 코드블록을 언어명 헤더 + 복사 버튼 + 모노스페이스 렌더링
// 🛡️ @GUARD : navigator.clipboard.writeText API 존재 여부
// 🚨 @PATCH : 없음
// 🔗 @CALLS : handleCopy, navigator.clipboard.writeText
// ====================================================================
function CodeBlock({ lang, code, className, ...props }: { lang: string; code: string; className?: string; [key: string]: any }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('[온리비 어서] 복사 실패', err);
    }
  };


  return (
    <div className="codeblock-area my-4 rounded-lg bg-blue-50/20 dark:bg-blue-950/15 overflow-hidden shadow-sm select-text">
      {/* 코드블록 상단 헤더 (언어명 및 복사 버튼) */}
      <div className="codeblock-header flex items-center justify-between px-4 py-1.5 bg-blue-100/50 dark:bg-blue-950/40">
        <span className="codeblock-header-text text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          {lang || 'plaintext'}
        </span>
        <button
          onClick={handleCopy}
          className="text-xs px-2.5 py-1 rounded bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-700 active:scale-95 transition-all shadow-sm font-medium"
        >
          {copied ? '✓ 복사됨' : '복사'}
        </button>
      </div>
      <pre className="m-0 p-4 overflow-x-auto font-mono text-sm leading-relaxed bg-transparent text-blue-700 dark:text-blue-300">
        <code className={`${className || ''} block text-blue-700 dark:text-blue-300`} {...props}>
          {code}
        </code>
      </pre>
    </div>
  );
}

// ====================================================================
// 📊 [OMD-CORE-MarkdownViewer-0007] MarkdownViewer ➔ TableWrapper
// 🎯 @KICK  : 마크다운 표를 HTML + TSV 형식으로 클립보드에 복사하는 래퍼 컴포넌트
// 🛡️ @GUARD : tableRef/tableEl 존재 여부 확인
// 🚨 @PATCH : 없음
// 🔗 @CALLS : handleCopy, ClipboardItem, navigator.clipboard.write
// ====================================================================
// 🛡️ [한글 주석 완벽 탑재] TableWrapper는 렌더링된 표 위에 마우스 오버 시 '시트/표형식 복사' 버튼을 표시하고, 
// 클릭하면 MS 오피스(워드, 엑셀) 및 한글 프로그램 등에 표 형태로 바로 붙여넣어지도록 HTML과 탭 구분 텍스트(TSV)로 클립보드에 적재해 주는 컴포넌트입니다.
function TableWrapper({ children }: { children: React.ReactElement }) {
  const [copied, setCopied] = useState(false);
  const tableRef = React.useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    if (!tableRef.current) return;
    const tableEl = tableRef.current.querySelector('table');
    if (!tableEl) return;

    try {
      // 1. HTML 데이터 추출 (복제하여 복사 버튼 등 외부 UI 태그가 들어가는 것 차단)
      const clone = tableEl.cloneNode(true) as HTMLTableElement;
      clone.removeAttribute('class');
      const tableHtml = clone.outerHTML;

      // 2. Plain Text (탭 구분 텍스트) 추출 (엑셀 등에 깔끔하게 붙여넣을 수 있도록 TSV 구성)
      const rows = Array.from(tableEl.querySelectorAll('tr'));
      const textLines = rows.map(row => {
        const cells = Array.from(row.querySelectorAll('th, td'));
        return cells.map(cell => cell.textContent?.trim() || '').join('\t');
      });
      const tableText = textLines.join('\n');

      // 3. 클립보드 다중 타입 데이터 적재
      if (navigator.clipboard && window.ClipboardItem) {
        const htmlBlob = new Blob([tableHtml], { type: 'text/html' });
        const plainBlob = new Blob([tableText], { type: 'text/plain' });
        
        const data = new ClipboardItem({
          'text/html': htmlBlob,
          'text/plain': plainBlob
        });
        await navigator.clipboard.write([data]);
      } else {
        await navigator.clipboard.writeText(tableText);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('[온리비 어서] 시트/표형식 복사 실패', err);
    }
  };

  // [ONR-MD-004] 표 데이터 래퍼 컴포넌트: 마크다운 렌더링 내의 표(table) 태그를 수신하여 가로 스크롤 레이아웃으로 감싸고, 마우스 오버 시 스프레드시트 호환 규격 복사 버튼을 제공하는 고기능 래퍼입니다.
  return (
    <div ref={tableRef} className="relative group my-6 border border-zinc-200/60 dark:border-zinc-800/60 rounded-lg overflow-x-auto shadow-sm bg-white dark:bg-zinc-900 select-text">
      {/* 마우스 호버 시 우측 상단에 노출되는 미려한 시트/표형식 복사 단추 */}
      <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
        <button
          onClick={handleCopy}
          className="text-xs px-2.5 py-1.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95 transition-all shadow-md font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <span>{copied ? '✓' : '📋'}</span>
          <span>{copied ? '시트/표형식 복사 완료' : '시트/표형식 복사'}</span>
        </button>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

// ====================================================================
// 📊 [OMD-CORE-MarkdownViewer-0006] MarkdownViewer ➔ loadMermaidScript
// 🎯 @KICK  : Mermaid CDN 스크립트를 동적으로 로드하고 초기화 (SSR 번들 충돌 방지)
// 🛡️ @GUARD : window.mermaid 존재 시 재사용; 중복 로딩 방지용 mermaidPromise 캐싱
// 🚨 @PATCH : **2026-06-20** — Mermaid 로드 시 define이 undefined인 비동기 갭 동안 Monaco 에디터 로더가 모듈을 호출해 TypeError: define is not a function이 발생하는 충돌을 방지하기 위해, fetch + eval 방식을 우선 구동하여 define 비활성 시간차를 차단하고 Monaco 에디터 로딩을 안정화; 확장프로그램 등 eval이 금지된 CSP 환경에서 eval 에러 발생 시 동적 script 태그 로드 방식으로 즉시 자동 우회하는 예외 처리 구현
// 🔗 @CALLS : mermaid.initialize
// ====================================================================
// 🛡️ [한글 주석 완벽 탑재] 비동기 글로벌 Mermaid 스크립트 로더
// Next.js app directory hydration + AMD define 충돌 + file:// 상대경로 3대 문제 대응:
// 1) 동적 <script src="./mermaid.min.js"> 생성 (CSP 'self' 허용, 상대경로로 file:// 대응)
// 2) define 일시 제거 → mermaid UMD global 할당(window.mermaid) 강제 (AMD 충돌 회피)
// 3) CSP 차단 시 fetch + eval 폴백 (CSP 'unsafe-eval' 허용)
let mermaidPromise: Promise<any> | null = null;
const loadMermaidScript = (): Promise<any> => {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if ((window as any).mermaid) {
    return Promise.resolve((window as any).mermaid);
  }
  if (mermaidPromise) {
    return mermaidPromise;
  }

  mermaidPromise = new Promise((resolve) => {
    const loaded = () => {
      const m = (window as any).mermaid;
      if (m) {
        m.initialize({
          startOnLoad: false,
          theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
          securityLevel: 'loose',
        });
        resolve(m);
      } else {
        mermaidPromise = null;
        resolve(null);
      }
    };

    const loadViaScriptTag = (savedDefine: any, callback: () => void) => {
      if ((window as any).mermaid) {
        callback();
        return;
      }
      (window as any).define = undefined;
      const script = document.createElement('script');
      script.src = './mermaid.min.js';
      const done = () => {
        if ((window as any).define === undefined) {
          (window as any).define = savedDefine;
        }
      };
      script.onload = () => { done(); callback(); };
      script.onerror = () => {
        done();
        mermaidPromise = null;
        resolve(null);
      };
      document.head.appendChild(script);
    };

    // 1) 레이스 컨디션 완벽 차단: <script> 비동기 태그 대신 fetch + eval 동기 실행으로만 로드합니다.
    //    이를 통해 define이 undefined로 유지되는 시간차(비동기 갭)를 소거하여 Monaco 에디터 로더와의 충돌을 원천 차단합니다.
    fetch('./mermaid.min.js')
      .then(r => r.text())
      .then(code => {
        const savedDefine = (window as any).define;
        (window as any).define = undefined;
        let evalSuccess = false;
        try {
          (0, eval)(code);
          evalSuccess = true;
        } catch (_) {
          // CSP 차단 등으로 eval 실패 (확장프로그램 환경 등)
        }
        if ((window as any).define === undefined) {
          (window as any).define = savedDefine;
        }
        
        if (evalSuccess && (window as any).mermaid) {
          loaded();
        } else {
          // eval 실패 시 script 태그를 통한 로딩으로 우회
          loadViaScriptTag(savedDefine, loaded);
        }
      })
      .catch(() => {
        // 2) 최후의 수단으로 fetch 실패 시에만 <script> 태그 비동기 로드 fallback 시도
        loadViaScriptTag((window as any).define, loaded);
      });
  });
  return mermaidPromise;
};

// 🛡️ [한글 주석 완벽 탑재] MermaidBlock은 머메이드 차트 원본 텍스트를 파싱하여 SVG 다이어그램 이미지로 실시간 변환 렌더링하고,
// 이미지 저장(PNG 다운로드) 및 이미지 복사(클립보드 기입) 툴바를 제공해 오피스 프로그램에 바로 붙여넣게 도와주는 컴포넌트입니다.
// ====================================================================
// 📊 [OMD-CORE-MarkdownViewer-0005] MarkdownViewer ➔ MermaidBlock
// 🎯 @KICK  : Mermaid 차트 텍스트를 SVG로 실시간 변환 렌더링 및 이미지 저장/복사 툴바 제공
// 🛡️ @GUARD : Mermaid 라이브러리 로드 실패 시 에러 메시지 표시; 문법 무결성 사전 검증
// 🚨 @PATCH : 대괄호/소괄호 전각 문자 변환으로 파싱 에러 방지; 렌더링 ID 충돌 방지용 타임스탬프; <br> → \n 전역 변환 (HTML 태그 파싱 충돌 방지); NBSP(\u00a0) → 공백 치환 + class 세미콜론(;) 제거 (외부 복사 노이즈 내성 강화) | 2026-06-18; **2026-06-20** — 다이어그램 이미지 저장(handleSaveImage) API 호출 버그 수정(saveFileAs) 및 웹 다운로드 폴백 적용
// 🔗 @CALLS : loadMermaidScript, handleCopyImage, handleSaveImage, handleCopyCode
// ====================================================================
const MermaidBlock = React.memo(function MermaidBlock({ code }: { code: string }) {
  const [svgHtml, setSvgHtml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageCopied, setImageCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const mermaidRetryRef = useRef(0);
  const mermaidRetryTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 🔍 다이어그램 새 브라우저 창/탭으로 확대 뷰잉 기능 구현
  const openInNewWindow = () => {
    if (!containerRef.current) return;
    const svgElement = containerRef.current.querySelector('svg');
    if (!svgElement) return;

    let svgWidth = 800;
    let svgHeight = 600;
    const viewBox = svgElement.getAttribute('viewBox');
    if (viewBox) {
      const parts = viewBox.split(/[ ,]+/);
      if (parts.length === 4) {
        svgWidth = parseFloat(parts[2]);
        svgHeight = parseFloat(parts[3]);
      }
    } else {
      const attrWidth = svgElement.getAttribute('width');
      const attrHeight = svgElement.getAttribute('height');
      if (attrWidth && attrHeight) {
        svgWidth = parseFloat(attrWidth);
        svgHeight = parseFloat(attrHeight);
      }
    }

    // 💡 인라인 스타일 및 width/height 족쇄 제거하여 브라우저에 맞춤 반응하도록 가공
    const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
    svgClone.removeAttribute('style');
    svgClone.style.maxWidth = 'none';
    svgClone.style.width = '100%';
    svgClone.style.height = 'auto';
    svgClone.style.display = 'block';

    const svgData = new XMLSerializer().serializeToString(svgClone);
    
    // 모니터 크기에 맞춰 적절한 윈도우 크기 동적 할당
    const winWidth = Math.min(svgWidth + 100, window.screen.availWidth * 0.85);
    const winHeight = Math.min(svgHeight + 150, window.screen.availHeight * 0.85);
    
    const newWindow = window.open(
      '',
      '_blank',
      `width=${winWidth},height=${winHeight},resizable=yes,scrollbars=yes`
    );

    if (!newWindow) {
      alert("💡 브라우저의 팝업이 차단되었습니다. 주소창 우측에서 팝업을 허용해주세요!");
      return;
    }

    newWindow.document.open();
    newWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>온리비 다이어그램 돋보기</title>
        <style>
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #ffffff;
            overflow: auto;
          }
          .svg-container {
            padding: 40px;
            box-sizing: border-box;
            width: 100%;
            max-width: 95%;
            height: auto;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          svg {
            width: 100% !important;
            height: auto !important;
            max-width: 100% !important;
            display: block;
          }
        </style>
      </head>
      <body>
        <div class="svg-container">
          ${svgData}
        </div>
      </body>
      </html>
    `);
    newWindow.document.close();
  };

  const getHighResCanvas = async (svgElement: SVGSVGElement): Promise<HTMLCanvasElement | null> => {
    let svgWidth = 800;
    let svgHeight = 600;
    const viewBox = svgElement.getAttribute('viewBox');
    if (viewBox) {
      const parts = viewBox.split(/[ ,]+/);
      if (parts.length === 4) {
        svgWidth = parseFloat(parts[2]);
        svgHeight = parseFloat(parts[3]);
      }
    } else {
      const attrWidth = svgElement.getAttribute('width');
      const attrHeight = svgElement.getAttribute('height');
      if (attrWidth && attrHeight) {
        svgWidth = parseFloat(attrWidth);
        svgHeight = parseFloat(attrHeight);
      } else {
        const rect = svgElement.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          svgWidth = rect.width;
          svgHeight = rect.height;
        }
      }
    }

    const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
    svgClone.removeAttribute('style');
    svgClone.style.maxWidth = 'none';
    svgClone.style.width = `${svgWidth}px`;
    svgClone.style.height = `${svgHeight}px`;
    svgClone.setAttribute('width', svgWidth.toString());
    svgClone.setAttribute('height', svgHeight.toString());

    // 💡 3배 고해상도 해상도로 스케일 업하여 글씨 깨짐 및 축소 현상 방지
    const scaleFactor = 3;
    const canvas = document.createElement('canvas');
    canvas.width = svgWidth * scaleFactor;
    canvas.height = svgHeight * scaleFactor;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(scaleFactor, scaleFactor);

    const svgData = new XMLSerializer().serializeToString(svgClone);
    const img = new Image();
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    
    await new Promise((resolve) => img.onload = resolve);
    ctx.drawImage(img, 0, 0, svgWidth, svgHeight);

    return canvas;
  };

  const handleCopyImage = async () => {
    if (!containerRef.current) return;
    const svgElement = containerRef.current.querySelector('svg');
    if (!svgElement) return;

    try {
      const canvas = await getHighResCanvas(svgElement);
      if (!canvas) return;

      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          setImageCopied(true);
          setTimeout(() => setImageCopied(false), 2000);
        }
      }, 'image/png');
    } catch (err) {
      console.error('이미지 복사 실패:', err);
    }
  };

  const handleSaveImage = async () => {
    if (!containerRef.current) return;
    const svgElement = containerRef.current.querySelector('svg');
    if (!svgElement) return;

    try {
      const canvas = await getHighResCanvas(svgElement);
      if (!canvas) return;

      const dataUrl = canvas.toDataURL('image/png');
      const api = (window as any).electronAPI;
      if (api && api.saveFileAs) {
        await api.saveFileAs(dataUrl, 'diagram.png', '', [{ name: 'PNG Image', extensions: ['png'] }]);
      } else {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'diagram.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('이미지 저장 실패:', err);
    }
  };

  // 다크모드 상태 추적
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      setIsDark(document.documentElement.classList.contains('dark'));
      
      const observer = new MutationObserver(() => {
        setIsDark(document.documentElement.classList.contains('dark'));
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    // 💡 [디바운스 가드] 300ms 대기 후 렌더링하여 타이핑 중 연속 파싱/렌더링으로 인한 화면 굳음 현상 방지
    const debounceTimer = setTimeout(() => {
      const renderChart = async () => {
        const mermaidObj = await loadMermaidScript();
        if (!mermaidObj) {
          if (active && mermaidRetryRef.current < 3) {
            mermaidRetryRef.current++;
            mermaidRetryTimerRef.current = setTimeout(renderChart, 3000);
          } else if (active) {
            setError('Mermaid 라이브러리를 로드하지 못했습니다.');
            setLoading(false);
          }
          return;
        }
        mermaidRetryRef.current = 0;

        // 🛡️ 매 렌더링마다 유일한 임시 ID를 생성하여 Mermaid 렌더러 간 캐시 충돌을 원천 차단 (무한 펜딩 방지)
        const renderId = `mermaid-temp-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

        // 💡 [Mermaid 전처리 가드] 큰따옴표 안쪽의 대괄호([, ]) 및 소괄호((, )) 문법이 파싱 에러를 유발하는 현상을
        // 렌더링 전에 자동으로 전각 문자(［, ］, （, ）)로 자동 보정하여 구문 에러를 원천 예방합니다.
        // 또한 마크다운 파서로 인해 HTML 이스케이프된 기호(&gt;, &lt; 등)를 본래의 코드로 복구합니다.
        let cleanCode = code;
        
        // 💡 [Mermaid 중첩 백틱 가드 2026-07-04] 코드 내용에 실수로 중첩 삽입된 ```mermaid 및 ``` 펜스 기호들을 제거합니다.
        try {
          cleanCode = cleanCode
            .replace(/```mermaid\s*/gi, '')
            .replace(/```\s*$/gi, '')
            .replace(/```/g, '');
        } catch (_) {}

        try {
          cleanCode = cleanCode
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"');
        } catch (_) {}

        // 💡 [Mermaid 문법 정제 가드] 붙여넣기 등으로 유입된 유령 공백(NBSP) 및 잘못된 class 문법 세미콜론 제거
        // 💡 [추가 패치 2026-07-04] 불필요한 빈 줄(\r 등)이나 줄 끝의 불완전한 공백들을 제거하여 문법 에러 최소화
        // 💡 [화살표 텍스트 간격 보정 가드 2026-07-04] 띄어쓰기가 없는 '--텍스트-->' 문법을 파서 호환을 위해 '-- 텍스트 -->' 로 자동 치환
        // 💡 [subgraph 명칭 자동 따옴표 래핑 가드 2026-07-04] subgraph 명칭에 공백/괄호가 포함되었으나 따옴표가 없으면 강제로 따옴표 씌우기
        try {
          cleanCode = cleanCode
            .replace(/\u00a0/g, ' ')
            .replace(/\r/g, '')
            .replace(/^class\s+\S+\s+\S+;/gm, (m) => m.slice(0, -1))
            .replace(/--([^-<>]+)-->/g, '-- $1 -->')
            .replace(/==([^=<>]+)==>/g, '== $1 ==>')
            .replace(/subgraph\s+([^"\n\r]+)$/gm, (match, title) => {
              const trimmed = title.trim();
              // 이미 따옴표가 있거나 방향 지시어(direction)인 경우는 건너뜀
              if (trimmed.startsWith('"') || trimmed.startsWith('\'') || trimmed.match(/^(TB|TD|BT|RL|LR)$/i)) {
                return match;
              }
              return `subgraph "${trimmed}"`;
            });
        } catch (_) {}

        // 💡 [Mermaid 깨진 라인/외톨이 괄호 자동 수리 가드 2026-07-04] 
        // 입력 도중 또는 실수로 복사된 줄 끝의 외톨이 닫는 괄호 ')' 나 불완전한 화살표 연결을 자동 복구합니다.
        try {
          const lines = cleanCode.split('\n');
          const fixedLines = lines.map(line => {
            let l = line.trimRight();
            // Case 1: '--> |텍스트| )' 또는 '--> )' 와 같이 화살표 뒤에 닫는 괄호 하나만 덜렁 있는 경우 제거
            if (l.match(/(-->|==>|-\.-\>)\s*(\|[^|]*\|)?\s*\)$/)) {
              l = l.replace(/\s*\)$/, '');
            }
            // Case 2: '--> |텍스트|' 혹은 '-->' 로 줄이 끝나고 다음 연결 노드가 누락된 경우, 임시 노드 'temp'를 붙여 파서 붕괴 예방
            if (l.endsWith('-->') || l.endsWith('==>') || l.endsWith('-.->')) {
              l = l + ' temp["..."]';
            }
            return line.endsWith('\n') ? l + '\n' : l;
          });
          cleanCode = fixedLines.join('\n');
        } catch (_) {}

        // 💡 [따옴표 내부 전각화 가드]
        try {
          cleanCode = cleanCode.replace(/"([^"]*)"/g, (match, p1) => {
            const sanitized = p1
              .replace(/\[/g, '［')
              .replace(/\]/g, '］')
              .replace(/\(/g, '（')
              .replace(/\)/g, '）');
            return `"${sanitized}"`;
          });
        } catch (_) {}

        // 💡 [대괄호 내부 소괄호 중첩 복구 가드 2026-07-04] 따옴표 없이 사용된 P[텍스트(프로젝트)] 와 같은 중첩 소괄호 전각화
        try {
          // [내부 텍스트(소괄호)텍스트] 패턴 감지하여 안쪽 소괄호만 전각으로 교환
          cleanCode = cleanCode.replace(/\[([^\]\n]*?)\(([^\]\n]*?)\)([^\]\n]*?)\]/g, (match, p1, p2, p3) => {
            return `[${p1}（${p2}）${p3}]`;
          });
        } catch (_) {}

        // 💡 [Mermaid 노드 외곽 괄호 수리 가드] 노드명 뒤에 따옴표 없이 대괄호/소괄호가 올 때, 
        // 괄호 내부에 다른 기호가 있으면 파서가 충돌하므로 안전하게 전각 문자로 보정합니다.
        try {
          cleanCode = cleanCode.replace(/(\[|{|{|\(|=>)\s*([^\]\)\n\"\'`]*?)([\/\:\;\*\&]+)([^\]\)\n\"\'`]*?)\s*(\]|}|\)|=>)/g, (match, open, prefix, invalidChar, suffix, close) => {
            const safeMid = (prefix + invalidChar + suffix).replace(/[\/\:\;\*\&]/g, ' ');
            return `${open}${safeMid}${close}`;
          });
        } catch (_) {}

        try {
          cleanCode = cleanCode.replace(/<br\s*\/?>/gi, '\\n');
        } catch (_) {}

        try {
          // 💡 [문법 무결성 사전 검증 가드] 타이핑 도중의 미완성 문법을 컴포넌트 락 없이 우회 유치
          let isValid = false;
          let parserErrorMsg = '';
          try {
            // v10+ parse API는 Promise를 반환하거나 에러를 throw할 수 있으므로 안전하게 처리
            const parseResult = mermaidObj.parse(cleanCode);
            if (parseResult instanceof Promise) {
              await parseResult;
            }
            isValid = true;
          } catch (parseErr: any) {
            console.error('[Onrivi Author] Mermaid parse error:', parseErr);
            parserErrorMsg = parseErr?.message || String(parseErr);
            isValid = false;
          }

          if (!isValid) {
            if (active) {
              setError(`🎨 온리비 어서: 다이어그램 문법을 입력하는 중이거나 문법이 불완전합니다. (${parserErrorMsg.substring(0, 150)})`);
              setLoading(false);
            }
            return;
          }

          mermaidObj.initialize({
            startOnLoad: false,
            theme: isDark ? 'dark' : 'default',
            securityLevel: 'loose',
            suppressErrors: true, // 에러 팝업 억제
          });

          // 비동기 렌더링을 통한 SVG 생성
          const { svg } = await mermaidObj.render(renderId, cleanCode);
          if (active) {
            setSvgHtml(svg);
            setLoading(false);
          }
        } catch (err: any) {
          console.warn('[온리비 어서] Mermaid 렌더링 실패 가드 가동', err);
          if (active) {
            setError('🎨 온리비 어서: 다이어그램 렌더링 중 문법 충돌로 오류가 발생했습니다.');
            setLoading(false);
          }
          const badEl = document.getElementById(renderId);
          if (badEl) badEl.remove();
        }
      };

      renderChart();
    }, 300);

    return () => {
      active = false;
      clearTimeout(debounceTimer);
      if (mermaidRetryTimerRef.current) {
        clearTimeout(mermaidRetryTimerRef.current);
        mermaidRetryTimerRef.current = null;
      }
    };
  }, [code, isDark]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(`\`\`\`mermaid\n${code}\n\`\`\``);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {}
  };

  return (
    <div ref={containerRef} className="relative group my-6 border border-zinc-200/60 dark:border-zinc-800/60 rounded-lg overflow-hidden shadow-sm bg-white dark:bg-zinc-900 select-text">

      <div className="flex items-center justify-between px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          📊 다이어그램 (Mermaid)
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyCode}
            className="text-[11px] px-2.5 py-1 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 active:scale-95 transition-all shadow-sm font-medium cursor-pointer"
            title="마크다운 소스 복사"
          >
            {copied ? '✓ 코드 복사됨' : '코드 복사'}
          </button>
          {!error && !loading && (
            <>
              <button
                onClick={openInNewWindow}
                className="text-[11px] px-2.5 py-1 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95 transition-all shadow-sm font-medium cursor-pointer"
                title="다이어그램을 새 웹브라우저 창으로 크게 보기"
              >
                🔍 새 창으로 확대
              </button>
              <button
                onClick={handleCopyImage}
                className="text-[11px] px-2.5 py-1 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95 transition-all shadow-sm font-medium cursor-pointer"
                title="차트 이미지를 클립보드에 복사해 워드나 한글에 바로 붙여넣기"
              >
                {imageCopied ? '✓ 이미지 복사됨' : '이미지 복사'}
              </button>
              <button
                onClick={handleSaveImage}
                className="text-[11px] px-2.5 py-1 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95 transition-all shadow-sm font-medium cursor-pointer"
                title="차트를 PNG 파일로 저장"
              >
                💾 저장
              </button>
            </>
          )}
        </div>
      </div>
      <div className="p-6 flex flex-col justify-center items-center overflow-x-auto min-h-[100px]">
        {loading && <div className="text-sm text-zinc-400 dark:text-zinc-500 flex items-center gap-2">🔄 차트를 렌더링하는 중...</div>}
        {error && (
          <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-md p-4 w-full font-mono">
            <div className="flex items-center justify-between border-b border-red-200/55 dark:border-red-900/30 pb-2 mb-2">
              <span className="font-semibold flex items-center gap-1">⚠️ 렌더링 에러</span>
              <button 
                onClick={() => setShowRaw(!showRaw)}
                className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-zinc-800 border border-red-300 dark:border-red-900/40 text-red-700 dark:text-red-400 hover:bg-red-100/50 cursor-pointer transition-all active:scale-95"
              >
                {showRaw ? '코드 접기' : '코드 원본 보기'}
              </button>
            </div>
            <div className="whitespace-pre-wrap leading-relaxed">{error}</div>
            
            {showRaw && (
              <div className="mt-3 p-3 bg-zinc-900 dark:bg-black text-zinc-300 dark:text-zinc-400 rounded border border-zinc-800 text-xs overflow-x-auto select-all max-h-[250px]">
                {code}
              </div>
            )}
          </div>
        )}
        {!loading && !error && (
          <div 
            onDoubleClick={openInNewWindow}
            title="더블클릭하면 새 웹브라우저 창으로 크게 확대해서 볼 수 있습니다."
            className="w-full flex justify-center mermaid-svg-container cursor-zoom-in"
            dangerouslySetInnerHTML={{ __html: svgHtml }} 
          />
        )}
      </div>
    </div>
  );
});

// ====================================================================
// 📊 [OMD-CORE-MarkdownViewer-0004] MarkdownViewer ➔ MarkdownViewer
// 🎯 @KICK  : 마크다운 텍스트를 ReactMarkdown으로 렌더링 - 코드블록, 표, 머메이드, 이미지 경로 변환 등 고기능 뷰어
// 🛡️ @GUARD : 이미지 경로는 media:// 프록시로 변환; HTML 이스케이프/위키링크 전처리
// 🚨 @PATCH : 쿼리 스트링 분리 가드, 웰컴 페이지 예외 가드, 단위 자동 보완 가드
// 🔗 @CALLS : CodeBlock, TableWrapper, MermaidBlock, rehypeSourceLinesPlugin, rehypeBrRaw, cleanContent
// ====================================================================
export default function MarkdownViewer({
  content, originalContent, lineMap, onCheckboxToggle, currentFilePath, rootFolderPath,
  onFileOpen, listIndent, marginTop, marginBottom, marginLeft, marginRight
}: MarkdownViewerProps) {

  const containerRef = useRef<HTMLDivElement>(null);

// ====================================================================
// 📊 [OMD-CORE-MarkdownViewer-0003] MarkdownViewer ➔ cleanContent
// 🎯 @KICK  : 마크다운 원문 전처리 - 위키링크 변환, 괄호 링크 이스케이프, 목록 번호 방어
// 🛡️ @GUARD : 숫자+괄호 패턴을 백슬래시 이스케이프로 목록 변환 방지
// 🚨 @PATCH : 소괄호 포함 URL 파싱 깨짐 방지를 위해 <> 래핑 필터 적용
// 🔗 @CALLS : 없음
// ====================================================================
  // 🛡️ [마크다운 원본 우회] 마크다운 본문의 HTML 이스케이프 깨짐 방지를 위해 원본 내용을 직접 컴포넌트에 공급합니다.
  // 💡 [한글 주석] 마크다운 링크 주소 내부에 소괄호()가 포함되어 파싱이 깨지는 현상 방지 필터 (부등호 <> 래핑 처리)
  const cleanContent = useMemo(() => {
    if (!content) return "";
    
    let processed = content;
    
    // 🛡️ [목록 번호 변환 방어]
    // 1) 웹 모드 처럼 숫자에 괄호 닫기 패턴(예: 1) )을 라인 시작 지점에 작성했을 때,
    // 마크다운 파서가 이를 ordered list <ol> 목록으로 오해하여 1. 등으로 변환 렌더링하는 것을 방지하기 위해 괄호 앞에 백슬래시 이스케이프(\))를 자동 적용합니다.
    processed = processed.replace(/(^\s*\d+)\)(?=\s)/gm, '$1\\)');

    // 💡 [옵시디언 위키링크 변환 필터]
    // [[../relative/path.md#heading]] -> [path.md#heading](<../relative/path.md#heading>)
    // [[../relative/path.md]] -> [path.md](<../relative/path.md>)
    const wikiLinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
    processed = processed.replace(wikiLinkRegex, (match, linkTarget, customText) => {
      const trimmedTarget = linkTarget.trim();
      const text = customText ? customText.trim() : trimmedTarget.split('/').pop() || trimmedTarget;
      return `[${text}](<${trimmedTarget}>)`;
    });

    const mdLinkRegex = /\[([^\]]+)\]\(((?:[^()]+|\([^()]*\))+)\)/g;
    return processed.replace(mdLinkRegex, (match, text, url) => {
      if (url.startsWith('<') && url.endsWith('>')) {
        return match;
      }
      return `[${text}](<${url}>)`;
    });
  }, [content]);

  // 최신 content 및 originalContent 상태를 참조하기 위한 Ref
  const contentRef = useRef(content);
  const originalContentRef = useRef(originalContent);
  useEffect(() => {
    contentRef.current = content;
    originalContentRef.current = originalContent;
  }, [content, originalContent]);

  // 🛡️ [들여쓰기 및 인덴트 가드] 에디터 원본 텍스트의 해당 줄에 있는 탭과 공백을 계산하여 스타일(marginLeft)을 리턴하는 헬퍼 함수
  const getIndentStyle = useCallback((node: any) => {
    const line = node?.position?.start?.line;
    const origLine = line ? ((lineMap || [])[line - 1] || line) : undefined;
    if (!origLine) return {};

    const targetContent = originalContentRef.current || contentRef.current;
    if (!targetContent || typeof targetContent !== 'string') return {};
    const lines = targetContent.split('\n');
    const lineText = lines[origLine - 1] || '';
    const indentMatch = lineText.match(/^([ \t]*)/);
    const indentStr = indentMatch ? indentMatch[1] : '';

    // 💡 [목록 들여쓰기 동적 연동]
    // listIndent prop이 전달되면 (예: '16px'), 그 값을 파싱하여 탭/공백당 들여쓰기 px 단위를 조정합니다.
    // 기본값은 16px (탭 1개당 16px, 공백 1개당 4px) 입니다.
    let baseIndentPx = 16;
    if (listIndent) {
      const parsed = parseInt(listIndent, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        baseIndentPx = parsed;
      }
    }

    let marginLeft = 0;
    for (const char of indentStr) {
      if (char === '\t') {
        marginLeft += baseIndentPx; // 탭 1개당 baseIndentPx 여백 (예: 16px)
      } else if (char === ' ') {
        marginLeft += (baseIndentPx / 4);  // 공백 1개당 baseIndentPx / 4 여백 (예: 4px)
      }
    }

    if (marginLeft > 0) {
      return { marginLeft: `${marginLeft}px` };
    }
    return {};
  }, [lineMap, listIndent]);

// ====================================================================
// 📊 [OMD-CORE-MarkdownViewer-0002] MarkdownViewer ➔ rehypeSourceLinesPlugin
// 🎯 @KICK  : 마크다운 노드에 data-line 속성으로 원본 줄 번호를 매핑
// 🛡️ @GUARD : lineMap을 통해 processedLine을 originalLine으로 역매핑
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
  // 🛡️ [마크다운 물리 줄번호 매핑 플러그인] 마크다운 노드가 화면에 렌더링될 때 data-line 속성에 원본 줄 번호를 매핑합니다.
  const rehypeSourceLinesPlugin = useMemo(() => {
    return () => (tree: any) => {
      const visit = (node: any) => {
        if (node.type === 'element' && node.position && node.position.start) {
          if (!node.properties) {
            node.properties = {};
          }
          const processedLine = node.position.start.line;
          const originalLine = (lineMap || [])[processedLine - 1] || processedLine;
          node.properties['data-line'] = originalLine;
        }
        if (node.children) {
          node.children.forEach(visit);
        }
      };
      visit(tree);
    };
  }, [lineMap]);

// ====================================================================
// 📊 [OMD-CORE-MarkdownViewer-0001] MarkdownViewer ➔ rehypeBrRaw
// 🎯 @KICK  : raw HTML <br> 태그를 안전하게 br 엘리먼트로 교체하는 rehype 플러그인
// 🛡️ @GUARD : raw 노드를 분할하여 br 태그만 엘리먼트로, 나머지는 보존
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
  // 🛡️ [강제 수동 개행 플러그인] <br> 태그가 날것의 HTML로 들어올 때, Next.js의 rehypeRaw 삼킴 우려 없이 안전하게 br 엘리먼트로 교체합니다.
  const rehypeBrRaw = useMemo(() => {
    return () => (tree: any) => {
      const walk = (node: any) => {
        if (node.children) {
          const newChildren: any[] = [];
          for (const child of node.children) {
            // 💡 [OMD-HOTFIX] 기존 병합 파일에서 <div style="page-break-before: always"></div> 문자열이 
            // 텍스트나 인라인 코드로 파싱되어 화면에 노출되는 현상 방어 및 출판용 페이지 나누기로 강제 변환
            const isPageBreakString = (val: string) => 
              typeof val === 'string' && (val.includes('page-break-before: always') || val.includes('class="page-break"'));

            if (child.type === 'raw' && /<br\s*\/?>/i.test(child.value)) {
              const parts = child.value.split(/(<br\s*\/?>)/gi);
              for (const part of parts) {
                if (/^<br\s*\/?>$/i.test(part)) {
                  newChildren.push({ type: 'element', tagName: 'br', properties: {}, children: [] });
                } else if (part) {
                  newChildren.push({ type: 'raw', value: part });
                }
              }
            } else if (child.type === 'raw' && isPageBreakString(child.value)) {
              // raw HTML 텍스트로 인식되었을 때 교체
              newChildren.push({ type: 'element', tagName: 'hr', properties: { className: ['page-break'] }, children: [] });
            } else if (child.type === 'element' && child.tagName === 'code' && child.children?.length === 1 && child.children[0].type === 'text' && isPageBreakString(child.children[0].value)) {
              // inlineCode 안의 텍스트로 인식되었을 때 (파서 오작동 방어)
              newChildren.push({ type: 'element', tagName: 'hr', properties: { className: ['page-break'] }, children: [] });
            } else if (child.type === 'text' && isPageBreakString(child.value)) {
              // 일반 텍스트 노드로 인식되었을 때
              const parts = child.value.split(/(<div[^>]*page-break[^>]*><\/div>|<hr[^>]*page-break[^>]*\/>)/i);
              for (const part of parts) {
                if (isPageBreakString(part)) {
                  newChildren.push({ type: 'element', tagName: 'hr', properties: { className: ['page-break'] }, children: [] });
                } else if (part) {
                  newChildren.push({ type: 'text', value: part });
                }
              }
            } else {
              newChildren.push(child);
              if (child.children) walk(child);
            }
          }
          node.children = newChildren;
        }
      };
      walk(tree);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="markdown-viewer-root bg-transparent mx-auto transition-all duration-200 relative"
      style={{
        width: '100%',
        minHeight: '100%',
        boxShadow: 'none',
        borderRadius: '0px',
        paddingTop: marginTop || '0',
        paddingBottom: marginBottom || '0',
        paddingLeft: marginLeft || '0',
        paddingRight: marginRight || '0',
      }}
    >
      <div className="print:!block">
        <ReactMarkdown
          urlTransform={(uri) => {
            // 🛡️ [보안 필터 강화] XSS 공격 방어 (javascript: 차단, blob: 등 허용)
            const cleanUri = DOMPurify.sanitize(uri);
            if (cleanUri.trim().toLowerCase().startsWith('javascript:')) return '';
            return cleanUri;
          }}
          remarkPlugins={[remarkGfm, remarkBreaks, remarkMath, remarkDisableIndentedCode]}
          rehypePlugins={[
            [rehypeKatex, { strict: false }],
            rehypeBrRaw,
            rehypeRaw,
            rehypeHighlight,
            rehypeSourceLinesPlugin,
          ]}
          components={useMemo(() => ({
            img: ({ node, src, alt, style, ...props }: any) => {
              if (!src) return <img alt={alt} {...props} />;
              
              // 💡 [쿼리 스트링 분리 가드]
              // 이미지 URL 내에 ?width=300&height=200 등의 쿼리 파라미터가 덧붙여 있는 경우,
              // 로컬 파일 경로 해석 시 이 쿼리가 포함되면 404 에러가 나므로 분리 처리합니다.
              let pureSrc = src;
              let queryString = '';
              const qIndex = src.indexOf('?');
              if (qIndex !== -1) {
                pureSrc = src.substring(0, qIndex);
                queryString = src.substring(qIndex);
              }

              let finalSrc = pureSrc;
              const isHttp = pureSrc.startsWith('http://') || pureSrc.startsWith('https://');
              const isBlobOrData = pureSrc.startsWith('data:') || pureSrc.startsWith('blob:');
              const isExternal = isHttp || isBlobOrData;
              const isR2ApiPath = pureSrc.startsWith('/api/image/');

              // 🛡️ media://local/serve → Electron 전용, 웹에선 filePath 추출
              const isMediaServe = pureSrc === 'media://local/serve';
              let mediaFilePath = '';
              if (isMediaServe && queryString) {
                const urlMatch = queryString.match(/[?&]url=([^&]+)/);
                if (urlMatch) mediaFilePath = decodeURIComponent(urlMatch[1]);
              }

              if (isR2ApiPath) {
                const api = typeof window !== 'undefined' ? (window as any).electronAPI : null;
                if (api || process.env.NODE_ENV === 'development') {
                  finalSrc = `https://onrivi.com${pureSrc}`;
                } else {
                  finalSrc = pureSrc;
                }
                if (queryString) {
                  finalSrc += finalSrc.includes('?') ? '&' + queryString.substring(1) : queryString;
                }
              } else if (isMediaServe && mediaFilePath) {
                // media://local/serve → 웹에선 /api/view?filePath=... 로 변환
                const api = (window as any).electronAPI;
                if (api) {
                  finalSrc = `media://local/serve?url=${encodeURIComponent(mediaFilePath)}`;
                } else if (process.env.NODE_ENV === 'development') {
                  finalSrc = `/api/view?filePath=${encodeURIComponent(mediaFilePath)}`;
                } else {
                  finalSrc = mediaFilePath;
                }
                if (queryString && !finalSrc.includes('?')) {
                  // 쿼리스트링에 url=... 외 다른 파라미터가 있을 경우 처리
                  const otherParams = queryString.replace(/[?&]url=[^&]*/, '');
                  if (otherParams) finalSrc += otherParams;
                }
              } else if (!isExternal && typeof window !== 'undefined') {
                const api = (window as any).electronAPI;
                let absolutePath = pureSrc;
                const isAbsoluteWin = /^[a-zA-Z]:[\\/]/.test(pureSrc);
                const isAbsoluteUnix = pureSrc.startsWith('/');
                const isAbsolute = isAbsoluteWin || isAbsoluteUnix;

                const isWelcomePage = currentFilePath && (
                  currentFilePath.endsWith('Welcome.md') || 
                  currentFilePath.endsWith('Welcome.markdown') || 
                  currentFilePath === 'Welcome.md'
                );

                const isWelcomeAsset = pureSrc === './hero.png' || pureSrc === 'hero.png' || isWelcomePage;

                if (!isAbsolute && currentFilePath && !isWelcomeAsset) {
                  absolutePath = resolveRelativeImagePath(pureSrc, currentFilePath);
                } else if (!isAbsolute && rootFolderPath && rootFolderPath !== '브라우저 스토리지' && !isWelcomeAsset) {
                  const sep = rootFolderPath.includes('/') ? '/' : '\\';
                  const folder = rootFolderPath.endsWith(sep) ? rootFolderPath : rootFolderPath + sep;
                  absolutePath = folder + pureSrc;
                } else if (isWelcomeAsset) {
                  absolutePath = pureSrc.startsWith('./') ? pureSrc.slice(2) : pureSrc;
                }
                
                if (api) {
                  finalSrc = `media://local/serve?url=${encodeURIComponent(absolutePath)}`;
                } else if (process.env.NODE_ENV === 'development') {
                  finalSrc = `/api/view?filePath=${encodeURIComponent(absolutePath)}`;
                } else {
                  finalSrc = pureSrc;
                }
                
                if (queryString) {
                  if (finalSrc.includes('?')) {
                    finalSrc += '&' + queryString.substring(1);
                  } else {
                    finalSrc += queryString;
                  }
                }
              }

              let width: string | undefined;
              let height: string | undefined;
              try {
                const wMatch = src.match(/[?&](?:width|w)=([^&#]+)/);
                const hMatch = src.match(/[?&](?:height|h)=([^&#]+)/);
                if (wMatch) width = decodeURIComponent(wMatch[1]);
                if (hMatch) height = decodeURIComponent(hMatch[1]);
              } catch (e) {}

              // 💡 [단위 자동 보완 가드]
              // 가로/세로 크기에 단위가 없는 순수 숫자가 들어오는 경우(예: 300), 
              // 브라우저 CSS 스펙에 부합하도록 px 단위를 기본적으로 붙여 렌더링에 실질 반영되게 합니다.
              if (width && /^\d+$/.test(width)) width = `${width}px`;
              if (height && /^\d+$/.test(height)) height = `${height}px`;

              const imgStyle: React.CSSProperties = {
                ...style, maxWidth: '100%', height: height || 'auto',
              };
              imgStyle.width = width || undefined;
              if (!width) imgStyle.maxWidth = '600px';
              const onImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
                const img = e.currentTarget;
                if (img.dataset.fallbackAttempted) return;
                img.dataset.fallbackAttempted = 'true';
                const api = (window as any).electronAPI;
                if (!api) return;
                const isR2Path = pureSrc.startsWith('/api/image/') || img.src.includes('/api/image/');
                if (!isR2Path) return;
                const match = pureSrc.match(/\/api\/image\/users\/[^/]+\/(.+)/) || img.src.match(/\/api\/image\/users\/[^/]+\/([^?#]+)/);
                if (!match) return;
                const localFileName = match[1];
                const baseFolder = currentFilePath?.replace(/\\/g, '/').replace(/\/[^/]+$/, '') || '';
                if (baseFolder) {
                  const localPath = baseFolder + '/assets/' + localFileName;
                  img.src = `media://local/serve?url=${encodeURIComponent(localPath)}`;
                }
              };
              const imgElement = <img src={finalSrc} alt={alt} style={imgStyle} className="rounded-lg shadow-sm border border-zinc-200/30 dark:border-zinc-800/30 my-3 mx-auto block" onError={onImgError} {...props} />;
              
              if (alt && alt.trim() !== '') {
                return (
                  <figure className="my-6 text-center flex flex-col items-center">
                    {imgElement}
                    <figcaption className="text-[0.9em] text-zinc-500 dark:text-zinc-400 mt-2 font-medium">
                      {alt}
                    </figcaption>
                  </figure>
                );
              }
              return imgElement;
            },
            a: ({ node, href, children, ...props }: any) => {
              const isWebLink = href && (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:'));
              const isAnchor = href && (href.startsWith('#') || href.startsWith('.#'));
              
              if (isAnchor) {
                const handleClick = (e: React.MouseEvent) => {
                  e.preventDefault();
                  const targetId = decodeURIComponent(href.startsWith('.#') ? href.slice(2) : href.slice(1));
                  
                  let targetEl = document.getElementById(targetId);
                  
                  if (!targetEl && targetId.includes('fnref-')) {
                    const fnId = targetId.replace('fnref-', 'fn-');
                    targetEl = document.querySelector(`a[href="#${fnId}"]`) || document.getElementById(fnId.replace('user-content-', ''));
                  }

                  if (!targetEl) {
                    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
                    const cleanTarget = targetId.toLowerCase().replace(/\s+/g, '').normalize('NFC');
                    for (const h of Array.from(headings)) {
                      const headingText = h.textContent?.trim() || '';
                      const cleanHeading = headingText.toLowerCase().replace(/\s+/g, '').normalize('NFC');
                      if (cleanHeading === cleanTarget || h.id === targetId || (cleanTarget.length > 2 && cleanHeading.includes(cleanTarget))) {
                        targetEl = h as HTMLElement;
                        break;
                      }
                    }
                  }

                  if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                };
                return <a href={href} onClick={handleClick} {...props}>{children}</a>;
              }

              if (href && !isWebLink && (href.endsWith('.md') || href.endsWith('.markdown') || href.includes('.md#') || href.includes('.markdown#'))) {
                const handleClick = (e: React.MouseEvent) => {
                  e.preventDefault();
                  if (onFileOpen) {
                    const cleanHref = href.split('#')[0];
                    const resolved = resolveRelativeImagePath(cleanHref, currentFilePath);
                    
                    const normalizePath = (p: string | undefined) => (p || '').replace(/\\/g, '/').toLowerCase();
                    const isSameFile = normalizePath(resolved) === normalizePath(currentFilePath);

                    if (isSameFile) {
                      // 💡 [동일 파일 가드] 같은 파일인 경우 파일을 다시 로드하지 않고 헤딩 위치로 즉시 스크롤 이동합니다.
                      const hashPart = href.split('#')[1];
                      if (hashPart) {
                        const targetId = decodeURIComponent(hashPart);
                        let targetEl = document.getElementById(targetId);
                        if (!targetEl) {
                          const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
                          const cleanTarget = targetId.toLowerCase().replace(/\s+/g, '').normalize('NFC');
                          for (const h of Array.from(headings)) {
                            const headingText = h.textContent?.trim() || '';
                            const cleanHeading = headingText.toLowerCase().replace(/\s+/g, '').normalize('NFC');
                            if (cleanHeading === cleanTarget || h.id === targetId || (cleanTarget.length > 2 && cleanHeading.includes(cleanTarget))) {
                              targetEl = h as HTMLElement;
                              break;
                            }
                          }
                        }
                        if (targetEl) {
                          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }
                    } else {
                      // 다른 파일인 경우 파일을 열고 헤딩이 있다면 대기 후 이동합니다.
                      const hashPart = href.split('#')[1];
                      onFileOpen(resolved, hashPart || undefined);
                    }
                  }
                };
                return <a href={href} onClick={handleClick} {...props}>{children}</a>;
              }

              const apiHref = href && href.startsWith('/api/image/')
                ? `https://onrivi.com${href}`
                : href && (href.startsWith('/api/') || href.match(/^https?:\/\/localhost:/))
                  ? getApiUrl(href.replace(/^https?:\/\/localhost:\d+/, ''))
                  : href;

              const displayName = getTextFromChildren(children);

              const youtubeMatch = href && href.match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/);
              if (youtubeMatch && youtubeMatch[2] && youtubeMatch[2].length === 11) {
                return (
                  <VideoCard
                    src={`https://img.youtube.com/vi/${youtubeMatch[2]}/maxresdefault.jpg`}
                    href={`https://www.youtube.com/watch?v=${youtubeMatch[2]}`}
                    displayName={displayName || 'YouTube 동영상'}
                    isYoutube
                    youtubeId={youtubeMatch[2]}
                  />
                );
              }

              const isSocialVideo = href && !youtubeMatch && /(tiktok\.com|instagram\.com\/(p|reel|tv)\/|vimeo\.com|twitch\.tv|dailymotion\.com)/i.test(href);
              if (isSocialVideo) {
                return <SocialVideoCard url={href} displayName={displayName || '동영상'} />;
              }

              const isVideo = apiHref && /\.(mp4|webm|ogg|mov|avi|mkv)(\?|#|$)/i.test(apiHref);
              if (isVideo) {
                const videoSrc = apiHref.startsWith('http://') || apiHref.startsWith('https://') || apiHref.startsWith('media://')
                  ? apiHref
                  : resolveRelativeImagePath(apiHref, currentFilePath);
                
                let finalDisplayName = displayName || apiHref.split('/').pop()?.split('?')[0] || '동영상';
                // 만약 파일명(또는 링크 텍스트)이 단순히 UUID 형식이라면 친근한 이름으로 교체합니다.
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(\.[a-zA-Z0-9]+)?$/i;
                if (uuidRegex.test(finalDisplayName)) {
                  finalDisplayName = '로컬 첨부 동영상';
                }

                return (
                  <VideoCard
                    src={videoSrc}
                    href={apiHref}
                    displayName={finalDisplayName}
                  />
                );
              }
              return <a href={apiHref} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
            },
            table: ({ node, children, ...props }: any) => {
               return (
                 <TableWrapper>
                   <table {...props}>
                     {children}
                   </table>
                 </TableWrapper>
               );
             },
            div: ({ node, className, children, ...props }: any) => {
              return <div className={className} {...props}>{children}</div>;
            },
            pre: ({ node, children, ...props }: any) => <div className="not-prose">{children}</div>,
            code: ({ node, className, children, ...props }: any) => {
              const match = /language-(\S+)/.exec(className || '');
              const lang = match ? match[1] : '';
              const codeContent = getTextFromChildren(children).replace(/\n$/, '');
              const isInline = !match && !getTextFromChildren(children).includes('\n');
              if (isInline) {
                return <code className="px-1.5 py-0.5 mx-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-mono text-[0.9em] border border-blue-200 dark:border-blue-800" {...props}>{children}</code>;
              }
              if (lang === 'mermaid') {
                return <MermaidBlock code={codeContent} />;
              }
              return <CodeBlock lang={lang} code={codeContent} className={className} {...props} />;
            },
            h1: ({ node, children, style, ...props }) => {
              const line = (node as any).position?.start?.line;
              const origLine = line ? ((lineMap || [])[line - 1] || line) : undefined;
              return <h1 id={origLine ? `toc-line-${origLine}` : undefined} style={{ ...style, ...getIndentStyle(node) }} {...props}>{children}</h1>;
            },
            h2: ({ node, children, style, ...props }) => {
              const line = (node as any).position?.start?.line;
              const origLine = line ? ((lineMap || [])[line - 1] || line) : undefined;
              return <h2 id={origLine ? `toc-line-${origLine}` : undefined} style={{ ...style, ...getIndentStyle(node) }} {...props}>{children}</h2>;
            },
            h3: ({ node, children, style, ...props }) => {
              const line = (node as any).position?.start?.line;
              const origLine = line ? ((lineMap || [])[line - 1] || line) : undefined;
              return <h3 id={origLine ? `toc-line-${origLine}` : undefined} style={{ ...style, ...getIndentStyle(node) }} {...props}>{children}</h3>;
            },
            h4: ({ node, children, style, ...props }) => {
              const line = (node as any).position?.start?.line;
              const origLine = line ? ((lineMap || [])[line - 1] || line) : undefined;
              return <h4 id={origLine ? `toc-line-${origLine}` : undefined} style={{ ...style, ...getIndentStyle(node) }} {...props}>{children}</h4>;
            },
            h5: ({ node, children, style, ...props }) => {
              const line = (node as any).position?.start?.line;
              const origLine = line ? ((lineMap || [])[line - 1] || line) : undefined;
              return <h5 id={origLine ? `toc-line-${origLine}` : undefined} style={{ ...style, ...getIndentStyle(node) }} {...props}>{children}</h5>;
            },
            h6: ({ node, children, style, ...props }) => {
              const line = (node as any).position?.start?.line;
              const origLine = line ? ((lineMap || [])[line - 1] || line) : undefined;
              return <h6 id={origLine ? `toc-line-${origLine}` : undefined} style={{ ...style, ...getIndentStyle(node) }} {...props}>{children}</h6>;
            },
            input: ({ node, ...props }: any) => <input {...props} />,
            p: ({ node, children, style, ...props }) => {
              if (!children) return <p />;
              // react-markdown은 마크다운 문단의 자식으로 img가 오면 p 태그로 감쌉니다.
              // AST(mdast) node의 children을 검사하여 'image' 타입이 있는지 확인합니다.
              const hasImage = node && node.children && node.children.some((c: any) => c.type === 'image');
              if (hasImage) {
                return <div style={{ ...style, ...getIndentStyle(node) }} {...props} className="my-4">{children}</div>;
              }
              return <p style={{ ...style, ...getIndentStyle(node) }} {...props}>{children}</p>;
            },
            ul: ({ node, children, style, ...props }) => <ul style={style} {...props}>{children}</ul>,
            ol: ({ node, children, style, start, ...props }) => {
              return <ol start={start} style={style} {...props}>{children}</ol>;
            },
            li: ({ node, children, style, ...props }) => {
              const textContent = getTextFromChildren(children).trim();
              const isEmptyRow = textContent.includes("onrivi-empty-row");

              if (isEmptyRow) {
                const liStyle = {
                  ...style,
                  listStyleType: 'none',
                  listStyle: 'none',
                  height: '12px',
                  maxHeight: '12px',
                  lineHeight: '12px',
                  overflow: 'hidden',
                  background: 'transparent',
                  margin: '0',
                  padding: '0',
                  pointerEvents: 'none'
                } as React.CSSProperties;

                return <li style={liStyle} className="onrivi-empty-list-row" {...props} />;
              }

              const line = (node as any).position?.start?.line;
              const origLine = line ? ((lineMap || [])[line - 1] || line) : undefined;
              const modifiedChildren = React.Children.map(children, (child) => {
                if (React.isValidElement(child) && child.type === 'input' && (child.props as any).type === 'checkbox') {
                  return React.cloneElement(child as React.ReactElement<any>, {
                    disabled: false,
                    className: "w-4 h-4 rounded border-emerald-500/20 text-emerald-600 focus:ring-emerald-500 cursor-pointer mr-2 align-middle",
                    onChange: (e: any) => {
                      if (origLine && onCheckboxToggle) {
                        onCheckboxToggle(origLine, e.target.checked);
                      }
                    }
                  });
                }
                return child;
              });

              return <li style={{ ...style, ...getIndentStyle(node) }} className={props.className} {...props}>{modifiedChildren}</li>;
            },
            blockquote: ({ node, children, style, ...props }) => {
              // GitHub style Alerts 파싱: [!NOTE], [!TIP], [!IMPORTANT], [!WARNING], [!CAUTION]
              let alertType: 'NOTE' | 'TIP' | 'IMPORTANT' | 'WARNING' | 'CAUTION' | null = null;
              let processedChildren = children;

              const childrenArray = React.Children.toArray(children);
              if (childrenArray.length > 0) {
                const firstChild: any = childrenArray[0];
                if (firstChild && firstChild.props && firstChild.props.children) {
                  const pChildren = React.Children.toArray(firstChild.props.children);
                  console.error("DEBUG_PCHILDREN:", pChildren);
                  
                  // 첫 번째 의미 있는 텍스트 노드 찾기 (빈 줄바꿈 문자열 등 무시)
                  let firstTextIndex = -1;
                  for (let i = 0; i < pChildren.length; i++) {
                    if (typeof pChildren[i] === 'string' && (pChildren[i] as string).trim() !== '') {
                      firstTextIndex = i;
                      break;
                    }
                  }

                  if (firstTextIndex !== -1) {
                    const firstText = pChildren[firstTextIndex] as string;
                    const match = firstText.trimStart().match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);
                    
                    if (match) {
                      alertType = match[1].toUpperCase() as any;
                      
                      // 텍스트에서 [!TYPE] 부분 제거
                      const matchStr = match[0];
                      // 원본 문자열에서 matchStr이 나타나는 첫 번째 인덱스를 찾아서 자름
                      const typeIndex = firstText.indexOf(matchStr);
                      const newFirstText = firstText.substring(0, typeIndex) + firstText.substring(typeIndex + matchStr.length).trimStart();
                      
                      let newPChildren = [...pChildren];
                      
                      if (newFirstText.trim() === '') {
                        // 해당 텍스트 노드가 [!TYPE] 외에 남는게 없다면 빈 문자열로 만듬
                        newPChildren[firstTextIndex] = '';
                        // 바로 다음이 <br> 이면 그것도 제거
                        if (firstTextIndex + 1 < newPChildren.length && React.isValidElement(newPChildren[firstTextIndex + 1])) {
                          const nextChild: any = newPChildren[firstTextIndex + 1];
                          if (nextChild.type === 'br' || nextChild.props?.node?.tagName === 'br') {
                            newPChildren[firstTextIndex + 1] = '';
                          }
                        }
                      } else {
                        newPChildren[firstTextIndex] = newFirstText;
                      }

                      const newFirstChild = React.cloneElement(firstChild, {}, ...newPChildren);
                      processedChildren = [newFirstChild, ...childrenArray.slice(1)];
                    }
                  }
                }
              }

              if (alertType) {
                const alertStyles = {
                  NOTE: { border: 'border-[#0969da] dark:border-[#2f81f7]', bg: 'bg-blue-50/50 dark:bg-[#1f6feb]/10', text: 'text-[#0969da] dark:text-[#2f81f7]', icon: 'ℹ️', title: 'Note' },
                  TIP: { border: 'border-[#1a7f37] dark:border-[#3fb950]', bg: 'bg-green-50/50 dark:bg-[#2ea043]/10', text: 'text-[#1a7f37] dark:text-[#3fb950]', icon: '💡', title: 'Tip' },
                  IMPORTANT: { border: 'border-[#8250df] dark:border-[#a371f7]', bg: 'bg-purple-50/50 dark:bg-[#8957e5]/10', text: 'text-[#8250df] dark:text-[#a371f7]', icon: '📢', title: 'Important' },
                  WARNING: { border: 'border-[#9a6700] dark:border-[#d29922]', bg: 'bg-yellow-50/50 dark:bg-[#d29922]/10', text: 'text-[#9a6700] dark:text-[#d29922]', icon: '⚠️', title: 'Warning' },
                  CAUTION: { border: 'border-[#d1242f] dark:border-[#f85149]', bg: 'bg-red-50/50 dark:bg-[#f85149]/10', text: 'text-[#d1242f] dark:text-[#f85149]', icon: '🚨', title: 'Caution' },
                }[alertType];

                return (
                  <div style={{ ...style, ...getIndentStyle(node) }} className={`my-4 border-l-[3px] rounded-r-lg ${alertStyles.border} ${alertStyles.bg} p-4`} {...(props as any)}>
                    <div className={`flex items-center gap-2 font-semibold mb-2 ${alertStyles.text}`}>
                      <span>{alertStyles.icon}</span>
                      <span>{alertStyles.title}</span>
                    </div>
                    <div className="text-zinc-700 dark:text-zinc-300 prose-p:my-1 prose-p:last:mb-0 text-[0.95em]">
                      {processedChildren}
                    </div>
                  </div>
                );
              }

              return (
                <blockquote
                  style={{ ...style, ...getIndentStyle(node) }}
                  className="my-4 p-4 rounded-r-lg border-l-4 border-zinc-400 bg-zinc-50 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 font-normal not-italic"
                  {...props}
                >
                  {children}
                </blockquote>
              );
            }
          }), [lineMap, onCheckboxToggle, currentFilePath, rootFolderPath, onFileOpen, getIndentStyle])}
        >
          {cleanContent}
        </ReactMarkdown>
      </div>
    </div>
  );
}
