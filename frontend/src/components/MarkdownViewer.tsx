// 🚨 @PATCH : **2026-06-20** — Mermaid 다이어그램 이미지 저장(handleSaveImage) 기능이 Electron 데스크톱 앱 내에서 동작하지 않던 API 명칭 불일치 버그(saveAs -> saveFileAs)를 해결하고, 웹 브라우저 환경에서 동작할 수 있도록 a 링크 다운로드 폴백을 추가; 다이어그램 저장, 이미지 복사 시 다이어그램 크기가 극도로 작게 나오는 찌그러짐 결함을 3배 스케일링 기법으로 최종 영구 해결; 딤드 오버레이 방식의 복잡한 확대 모달을 전면 걷어내고, 독립 새 브라우저 창(Pop-up Window)으로 다이어그램을 선명하게 확대 및 다중 작업할 수 있도록 openInNewWindow 기능으로 리팩토링 및 🔍 새 창으로 확대 버튼 제공

import React, { useMemo, useState, useEffect, useLayoutEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import DOMPurify from 'dompurify';

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
function MermaidBlock({ code }: { code: string }) {
  const [svgHtml, setSvgHtml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
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
        try {
          cleanCode = cleanCode
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"');
        } catch (_) {}

        // 💡 [Mermaid 문법 정제 가드] 붙여넣기 등으로 유입된 유령 공백(NBSP) 및 잘못된 class 문법 세미콜론 제거
        try {
          cleanCode = cleanCode
            .replace(/\u00a0/g, ' ')
            .replace(/^class\s+\S+\s+\S+;/gm, (m) => m.slice(0, -1));
        } catch (_) {}

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
              setError(`🎨 온리비 아서: 다이어그램 문법을 입력하는 중이거나 문법이 불완전합니다. (${parserErrorMsg.substring(0, 100)})`);
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
            setError('🎨 온리비 어서: 다이어그램 렌더링 중 오류를 복구했습니다.');
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
      <div className="p-6 flex justify-center items-center overflow-x-auto min-h-[100px]">
        {loading && <div className="text-sm text-zinc-400 dark:text-zinc-500 flex items-center gap-2">🔄 차트를 렌더링하는 중...</div>}
        {error && (
          <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-md p-3 w-full font-mono whitespace-pre-wrap">
            ⚠️ 렌더링 에러:<br />
            {error}
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
}

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

  // 🛡️ [들여쓰기 및 인덴트 가드] 에디터 원본 텍스트의 해당 줄에 있는 탭과 공백을 계산하여 스타일(marginLeft)을 리턴하는 헬퍼 함수
  const getIndentStyle = (node: any) => {
    const line = node?.position?.start?.line;
    const origLine = line ? ((lineMap || [])[line - 1] || line) : undefined;
    if (!origLine) return {};

    const targetContent = originalContent || content;
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
  };

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
            if (child.type === 'raw' && /<br\s*\/?>/i.test(child.value)) {
              const parts = child.value.split(/(<br\s*\/?>)/gi);
              for (const part of parts) {
                if (/^<br\s*\/?>$/i.test(part)) {
                  newChildren.push({ type: 'element', tagName: 'br', properties: {}, children: [] });
                } else if (part) {
                  newChildren.push({ type: 'raw', value: part });
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
          // 🛡️ [보안 필터 우회] blob: 및 chrome-extension: 프로토콜 이미지/동영상 리소스가 유실되지 않도록 주소를 그대로 변환 허용합니다.
          urlTransform={(uri) => uri}
          remarkPlugins={[remarkGfm, remarkBreaks, remarkMath, remarkDisableIndentedCode]}
          rehypePlugins={[
            [rehypeKatex, { strict: false }],
            rehypeBrRaw,
            rehypeRaw,
            rehypeHighlight,
            rehypeSourceLinesPlugin,
          ]}
          components={{
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
              const isExternal = pureSrc.startsWith('http://') || pureSrc.startsWith('https://') || pureSrc.startsWith('data:') || pureSrc.startsWith('blob:');

              if (!isExternal && typeof window !== 'undefined' && (window as any).electronAPI) {
                let absolutePath = pureSrc;
                const isAbsoluteWin = /^[a-zA-Z]:[\\/]/.test(pureSrc);
                const isAbsoluteUnix = pureSrc.startsWith('/');
                const isAbsolute = isAbsoluteWin || isAbsoluteUnix;

                // 🛡️ [웰컴 페이지 예외 가드] 웰컴 페이지 내장 이미지는 로컬 워크스페이스 경로로 강제 확장하지 않고,
                // 원래의 상대경로 그대로 에셋 폴백 서빙을 탈 수 있도록 우회합니다.
                const isWelcomePage = currentFilePath && (
                  currentFilePath.endsWith('Welcome.md') || 
                  currentFilePath.endsWith('Welcome.markdown') || 
                  currentFilePath === 'Welcome.md'
                );

                const isWelcomeAsset = pureSrc === './hero.png' || pureSrc === 'hero.png' || isWelcomePage;

                if (!isAbsolute && currentFilePath && !isWelcomeAsset) {
                  absolutePath = resolveRelativeImagePath(pureSrc, currentFilePath);
                } else if (!isAbsolute && rootFolderPath && rootFolderPath !== '브라우저 스토리지' && !isWelcomeAsset) {
                  // currentFilePath가 없는 새 파일인 경우, 활성화된 로컬 워크스페이스 디렉토리를 기준으로 상대경로를 해결합니다.
                  const sep = rootFolderPath.includes('/') ? '/' : '\\';
                  const folder = rootFolderPath.endsWith(sep) ? rootFolderPath : rootFolderPath + sep;
                  absolutePath = folder + pureSrc;
                } else if (isWelcomeAsset) {
                  // 웰컴 에셋인 경우, './hero.png' 에서 './'를 제거하여 'hero.png' 로 안전하게 전송합니다.
                  // 이를 통해 URL 내 상대경로 문자 정규화 꼬임으로 인한 이미지 엑스박스 결함을 영구 방지합니다.
                  absolutePath = pureSrc.startsWith('./') ? pureSrc.slice(2) : pureSrc;
                }
                
                // 순수 경로에 대해서만 encodeURIComponent를 수행하고, 쿼리가 존재할 시 뒤에 덧붙입니다.
                finalSrc = `media://local/serve?url=${encodeURIComponent(absolutePath)}`;
                if (queryString) {
                  finalSrc += '&' + queryString.substring(1);
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
              return <img src={finalSrc} alt={alt} style={imgStyle} className="rounded-lg shadow-sm border border-zinc-200/30 dark:border-zinc-800/30 my-3" {...props} />;
            },
            a: ({ node, href, children, ...props }: any) => {
              const isWebLink = href && (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:'));
              const isAnchor = href && (href.startsWith('#') || href.startsWith('.#'));
              
              if (isAnchor) {
                const handleClick = (e: React.MouseEvent) => {
                  e.preventDefault();
                  const targetId = decodeURIComponent(href.startsWith('.#') ? href.slice(2) : href.slice(1));
                  
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

              return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
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
              return (
                <blockquote
                  style={{ ...style, ...getIndentStyle(node) }}
                  className="my-4 p-4 rounded-r-lg border-l-4 border-blue-500 bg-blue-50/30 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 font-normal not-italic"
                  {...props}
                >
                  {children}
                </blockquote>
              );
            }
          }}
        >
          {cleanContent}
        </ReactMarkdown>
      </div>
    </div>
  );
}
