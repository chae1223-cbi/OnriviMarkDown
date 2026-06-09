import React, { useMemo, useState, useEffect, useLayoutEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
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

const mmToRem = (mm: string): string => {
  const v = parseInt(mm);
  if (isNaN(v)) return '1.5rem';
  return (v * 0.236).toFixed(2) + 'rem';
};

interface MarkdownViewerProps {
  content: string;
  originalContent?: string;
  lineMap?: number[];
  onCheckboxToggle?: (lineNumber: number, checked: boolean) => void;
  currentFilePath?: string;
  rootFolderPath?: string;
  onFileOpen?: (resolvedPath: string) => void;
  orientation?: 'portrait' | 'landscape';
  marginTop?: string;
  marginBottom?: string;
  marginLeft?: string;
  marginRight?: string;
  listIndent?: string;
  showPageBreaks?: boolean; // 💡 실시간 A4 페이지 경계선 표시 토글 프롭 추가
  calcKey?: number; // 💡 페이지 경계선 강제 초기화 트리거 키
}

const resolveRelativeImagePath = (srcPath: string, currentFileNodePath: string | undefined): string => {
  if (!srcPath) return "";

  if (srcPath.startsWith('http://') || srcPath.startsWith('https://') || srcPath.startsWith('data:') || srcPath.startsWith('blob:')) {
    return srcPath;
  }

  // URL 디코딩: 마크다운 파서가 한글/특수문자를 퍼센트 인코딩한 경우 파일시스템 경로로 복원
  let decoded = srcPath;
  try {
    decoded = decodeURIComponent(srcPath);
  } catch {
    decoded = srcPath;
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

// 🛡️ [한글 주석 완벽 탑재] 비동기 글로벌 Mermaid 스크립트 로더
// Next.js SSR 및 정적 배포 번들의 컴파일 문제를 방지하기 위해 클라이언트단에서 CDN 스크립트를 동적으로 로드합니다.
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
    const script = document.createElement('script');
    const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;
    script.src = isElectron ? './mermaid.min.js' : '/mermaid.min.js';
    script.async = true;
    script.onload = () => {
      const mermaidObj = (window as any).mermaid;
      if (mermaidObj) {
        mermaidObj.initialize({
          startOnLoad: false,
          theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
          securityLevel: 'loose',
        });
      }
      resolve(mermaidObj);
    };
    script.onerror = () => {
      mermaidPromise = null;
      resolve(null);
    };
    document.body.appendChild(script);
  });
  return mermaidPromise;
};

// 🛡️ [한글 주석 완벽 탑재] MermaidBlock은 머메이드 차트 원본 텍스트를 파싱하여 SVG 다이어그램 이미지로 실시간 변환 렌더링하고,
// 이미지 저장(PNG 다운로드) 및 이미지 복사(클립보드 기입) 툴바를 제공해 오피스 프로그램에 바로 붙여넣게 도와주는 컴포넌트입니다.
function MermaidBlock({ code }: { code: string }) {
  const [svgHtml, setSvgHtml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [imageCopied, setImageCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCopyImage = async () => {
    if (!containerRef.current) return;
    const svgElement = containerRef.current.querySelector('svg');
    if (!svgElement) return;

    const canvas = document.createElement('canvas');
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const img = new Image();
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    
    await new Promise((resolve) => img.onload = resolve);
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    canvas.toBlob(async (blob) => {
      if (blob) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setImageCopied(true);
        setTimeout(() => setImageCopied(false), 2000);
      }
    }, 'image/png');
  };

  const handleSaveImage = async () => {
    if (!containerRef.current) return;
    const svgElement = containerRef.current.querySelector('svg');
    if (!svgElement) return;

    const canvas = document.createElement('canvas');
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const img = new Image();
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    
    await new Promise((resolve) => img.onload = resolve);
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    const dataUrl = canvas.toDataURL('image/png');
    const api = (window as any).electronAPI;
    if (api && api.saveAs) {
      await api.saveAs(dataUrl, 'diagram.png', null, [{ name: 'PNG Image', extensions: ['png'] }]);
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
          if (active) {
            setError('Mermaid 라이브러리를 로드하지 못했습니다.');
            setLoading(false);
          }
          return;
        }

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
            className="w-full flex justify-center mermaid-svg-container"
            dangerouslySetInnerHTML={{ __html: svgHtml }} 
          />
        )}
      </div>
    </div>
  );
}

export default function MarkdownViewer({
  content, originalContent, lineMap, onCheckboxToggle, currentFilePath, rootFolderPath,
  onFileOpen, orientation, marginTop, marginBottom, marginLeft, marginRight, listIndent, showPageBreaks, calcKey
}: MarkdownViewerProps) {

  const containerRef = useRef<HTMLDivElement>(null);
  const prevBreaksRef = useRef<string>("");

  // 🛡️ [마크다운 원본 우회] 마크다운 본문의 HTML 이스케이프 깨짐 방지를 위해 원본 내용을 직접 컴포넌트에 공급합니다.
  // 💡 [한글 주석] 마크다운 링크 주소 내부에 소괄호()가 포함되어 파싱이 깨지는 현상 방지 필터 (부등호 <> 래핑 처리)
  const cleanContent = useMemo(() => {
    if (!content) return "";
    
    let processed = content;
    
    // 🛡️ [목록 번호 변환 방어]
    // 1) 웹 모드 처럼 숫자에 괄호 닫기 패턴(예: 1) )을 라인 시작 지점에 작성했을 때,
    // 마크다운 파서가 이를 ordered list <ol> 목록으로 오해하여 1. 등으로 변환 렌더링하는 것을 방지하기 위해 괄호 앞에 백슬래시 이스케이프(\))를 자동 적용합니다.
    processed = processed.replace(/(^\s*\d+)\)(?=\s)/gm, '$1\\)');

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

  const isLandscape = orientation === 'landscape';

  return (
    <div
      ref={containerRef}
      className={`markdown-viewer-root bg-transparent mx-auto transition-all duration-200 relative ${showPageBreaks ? 'show-page-breaks-active' : ''}`}
      style={{
        width: showPageBreaks ? (isLandscape ? '1123px' : '794px') : '100%',
        minHeight: '100%',
        boxShadow: 'none',
        borderRadius: '0px',
        paddingTop: showPageBreaks ? mmToRem(marginTop || '') : '1.5rem',
        paddingBottom: showPageBreaks ? mmToRem(marginBottom || '') : '1.5rem',
        paddingLeft: showPageBreaks ? mmToRem(marginLeft || '') : '1.5rem',
        paddingRight: showPageBreaks ? mmToRem(marginRight || '') : '1.5rem',
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
                    onFileOpen(resolved);

                    const hashPart = href.split('#')[1];
                    if (hashPart) {
                      setTimeout(() => {
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
                      }, 300);
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
              // 수동 페이지 나누기 div 태그가 화면에서 텍스트 노출되지 않고 실제 CSS 클래스를 먹도록 렌더링 보장
              if (className === 'page-break') {
                return <div className="page-break" {...props} />;
              }
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
