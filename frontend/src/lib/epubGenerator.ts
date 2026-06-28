// 🚨 @PATCH : **2026-06-19** — EPUB 생성 시 수동 챕터 분할 흔적 코드를 전면 제거하고 단일 챕터 구조로 단순화

import JSZip from 'jszip';
import { msg } from './systemMessages';

// [ONR-EXP-002] EPUB 규격 파일 어셈블링: 마크다운 렌더링된 XHTML 소스와 정적 스타일, OPF 메타데이터 파일을 JSZip을 통해 표준 e-book 구조로 빌드하고 내보내는 비동기 생성기입니다.
/** XML/EPUB에서 literal 텍스트를 XHTML에 안전하게 삽입하기 위한 XML 이스케이프 헬퍼 */
// ====================================================================
// 📊 [OMD-IO-epubGenerator-0001] epubGenerator.ts ➔ escapeXml
// 🎯 @KICK  : XML/EPUB용 literal 문자열 XHTML 안전 이스케이프
// 🛡️ @GUARD : &, <, >, ", ' 문자 변환
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

/**
 * 파일 확장자 기반으로 올바른 이미지 MIME 타입을 결정해주는 헬퍼
 */
// ====================================================================
// 📊 [OMD-IO-epubGenerator-0002] epubGenerator.ts ➔ getMimeType
// 🎯 @KICK  : 파일 확장자 기반 MIME 타입 결정
// 🛡️ @GUARD : 소문자 변환, 미등록 확장자 fallback
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'svg') return 'image/svg+xml';
  if (ext === 'webp') return 'image/webp';
  return 'application/octet-stream';
}

/**
 * HTML content를 XHTML 규격에 맞추기 위해 self-closing 태그를 수정하고 
 * 엔티티를 이스케이프하거나 속성을 보정해주는 정교한 XHTML 변환 헬퍼입니다.
 * 추가적으로 외부/내부 하이퍼링크의 e-reader 규격 보정 및 보안 처리를 실시간으로 자동 가공합니다!
 */
// ====================================================================
// 📊 [OMD-IO-epubGenerator-0003] epubGenerator.ts ➔ sanitizeToXHTML
// 🎯 @KICK  : HTML 콘텐츠를 EPUB XHTML 규격으로 변환 — UI 요소 제거, 링크 보정, 앵커 삽입, 속성 정리
// 🛡️ @GUARD : window 부재, data- 속성 필터링, 스키마 없는 외부 링크 자동 교정
// 🚨 @PATCH : .md 내부 링크를 EPUB 앵커 해시로 재작성, 첫 헤더에 destination ID 강제 삽입
// 🔗 @CALLS : 없음
// ====================================================================
function sanitizeToXHTML(htmlString: string, currentDocTitle: string): string {
  if (typeof window === 'undefined') return htmlString;
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  
  // UI 제어 요소 (복사 버튼, 지도 컨트롤 등) 제거
  const copyButtons = doc.querySelectorAll('button, .copy-btn, [title*="복사"]');
  copyButtons.forEach(btn => btn.remove());
  
  // 🔗 하이퍼링크(<a> 태그) 규격 표준화 및 보안 등급 정비
  const links = doc.querySelectorAll('a');
  links.forEach(a => {
    let href = a.getAttribute('href') || '';
    if (href) {
      // 🏆 프로토콜 자동 주입: www.naver.com 이나 naver.com 등 스키마가 생략된 외부 도메인 주소 자동 교정!
      if (!href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        if (/^(www\.)|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(href)) {
          href = `https://${href}`;
          a.setAttribute('href', href);
        }
      }

      if (href.startsWith('http://') || href.startsWith('https://')) {
        // 1. 외부 도메인 링크: e-reader 리더기 앱 보안 우회 및 외부 시스템 기본 브라우저 팝업 강제 구동!
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
      } else if (href.toLowerCase().endsWith('.md') || href.includes('.md#') || href.includes('.md?')) {
        // 2. 내부 로컬 마크다운 파일 링크: EPUB 내부의 앵커 해시 링크로 스마트 변환(Rewrite)하여 깨짐 원천 방지!
        const filename = href.substring(href.lastIndexOf('/') + 1).split('#')[0].split('?')[0];
        const hash = href.includes('#') ? href.split('#')[1] : '';
        
        // 확장자를 제거하고 특수문자를 언더바로 정형화한 안전한 영숫자 앵커 ID 생성
        const safeDocId = 'doc-' + filename.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_");
        
        if (hash) {
          // 기존에 구체적인 앵커 링크(#헤더)가 걸려 있었다면 리더기가 인식할 수 있도록 승계
          a.setAttribute('href', `#${decodeURIComponent(hash)}`);
        } else {
          // 마크다운 파일 단위로의 단순 이동은 EPUB 내 해당 챕터의 첫 앵커로 스마트 점프!
          a.setAttribute('href', `#${safeDocId}`);
        }
      }
    }
  });

  // 각 챕터의 도입부에 앵커 점프를 받을 수 있는 Destination Anchor ID 강제 삽입!
  const firstHeader = doc.querySelector('h1, h2, h3, p');
  if (firstHeader) {
    const safeDocId = 'doc-' + currentDocTitle.replace(/[^a-zA-Z0-9]/g, "_");
    firstHeader.setAttribute('id', safeDocId);
  }
  
  // XML/XHTML에서 허용되지 않는 일부 속성이나 class 정돈
  const allElements = doc.querySelectorAll('*');
  allElements.forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('data-') && attr.name !== 'data-line') {
        el.removeAttribute(attr.name);
      }
    });
  });

  // XHTML 직렬화기 사용 (브라우저 내장 XMLSerializer 사용 시 100% 규격 보장 가능!)
  const serializer = new XMLSerializer();
  let xhtml = serializer.serializeToString(doc.body);
  
  xhtml = xhtml.replace(/^<body[^>]*>/, '').replace(/<\/body>$/, '');
  
  return xhtml;
}

interface EpubOptions {
  title: string;
  creator?: string;
  language?: string;
  contentHtml: string;
  dynamicCssString?: string;
  fontFamily?: string;
}

interface EmbeddedImage {
  id: string;
  href: string;
  mimeType: string;
}

// ====================================================================
// 📊 [OMD-IO-epubGenerator-0004] epubGenerator.ts ➔ generateEpub
// 🎯 @KICK  : EPUB 규격 파일 어셈블링 — XHTML/OPF/NCX/TOC/CSS 생성, 이미지 임베딩, 페이지 분할
// 🛡️ @GUARD : crypto.randomUUID 폴백, 이미지 fetch 5초 타임아웃, 빈 sections 방어 fallback
// 🚨 @PATCH : **2026-06-19** — EPUB 각주 렌더링 정상화 패치 및 수식(MathML/SVG) 지원을 위한 properties="math svg" 속성 추가; style.css 내부에 KaTeX 코어 CSS 및 미리보기 인라인 코드 스타일 병합; mimetype STORE 압축, 한글/공백 파일명을 영숫자로 정규화, EPUB2/3 하위호환
// 🔗 @CALLS : sanitizeToXHTML, escapeXml, getMimeType
// ====================================================================
export async function generateEpub({
  title,
  creator = 'Onrivi Author',
  language = 'ko',
  contentHtml,
  dynamicCssString,
  fontFamily
}: EpubOptions): Promise<Blob> {
  const zip = new JSZip();
  const uuid = typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : 'onrivi-author-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    
  const modifiedTime = new Date().toISOString().split('.')[0] + 'Z';

  // 1. mimetype 파일 생성 (규격 상 반드시 첫 번째 파일이어야 하며, 압축되지 않아야(Stored) 합니다)
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  // 2. META-INF/container.xml 생성
  const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
  zip.file('META-INF/container.xml', containerXml);

  // 3. 🖼️ 본문 내 이미지 탐색, 다운로드 및 EPUB 동봉(Embedding) 파이프라인
  const embeddedImages: EmbeddedImage[] = [];
  let processedHtml = contentHtml;

  if (typeof window !== 'undefined') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(contentHtml, 'text/html');
    const images = doc.querySelectorAll('img');
    
    // 비동기 이미지 다운로드 일괄 처리
    for (let idx = 0; idx < images.length; idx++) {
      const img = images[idx];
      const srcUrl = img.getAttribute('src');
      
      if (srcUrl) {
        try {
          // 💡 [Data URI 보완] Base64 인라인 이미지인 경우 fetch 없이 직접 디코딩하여 zip 동봉
          if (srcUrl.startsWith('data:')) {
            const parts = srcUrl.split(',');
            const meta = parts[0];
            const base64Data = parts[1];
            
            if (base64Data) {
              const mimeMatch = meta.match(/data:([^;]+)/);
              const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
              
              let ext = 'png';
              if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
              else if (mimeType.includes('gif')) ext = 'gif';
              else if (mimeType.includes('svg')) ext = 'svg';
              else if (mimeType.includes('webp')) ext = 'webp';
              
              const filename = `image_${idx}.${ext}`;
              const epubImgPath = `OEBPS/images/${filename}`;
              
              const binaryString = atob(base64Data);
              const len = binaryString.length;
              const bytes = new Uint8Array(len);
              for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const buffer = bytes.buffer;
              
              zip.file(epubImgPath, buffer);
              embeddedImages.push({
                id: `img_${idx}`,
                href: `images/${filename}`,
                mimeType
              });
              img.setAttribute('src', `../images/${filename}`);
            }
            continue;
          }

          // 확장자 추출 (기본값 png)
          let ext = srcUrl.substring(srcUrl.lastIndexOf('.') + 1).split('?')[0].split('#')[0].toLowerCase();
          if (!['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
            ext = 'png';
          }
          
          // 🏆 마스터 아키텍트 가이드: 
          // 한글/공백 인코딩 깨짐 및 각 운영체제별 파일명 정규화(NFC/NFD) 버그를 원천 봉쇄하기 위해
          // 책 내부 보관용 파일명을 안전한 영숫자 규격 순차 ID(image_0.png)로 일치화하여 완벽하게 포장합니다!
          const filename = `image_${idx}.${ext}`;
          const epubImgPath = `OEBPS/images/${filename}`;
          
          // 브라우저 Fetch를 이용해 이미지 바이너리(ArrayBuffer) 획득 (5초 타임아웃)
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          const response = await fetch(srcUrl, { signal: controller.signal });
          clearTimeout(timeoutId);
          if (response.ok) {
            const buffer = await response.arrayBuffer();
            
            // ZIP에 파일 직접 동봉
            zip.file(epubImgPath, buffer);
            
            const mimeType = response.headers.get('content-type') || getMimeType(filename);
            embeddedImages.push({
              id: `img_${idx}`,
              href: `images/${filename}`,
              mimeType
            });
            
            // XHTML 본문 내부의 img src를 순차 영문 상대경로로 완벽 교체!
            img.setAttribute('src', `../images/${filename}`);
          }
        } catch (err) {
          msg.warn(`이미지 동봉 실패: ${srcUrl}`, err);
        }
      }
    }
    processedHtml = doc.body.innerHTML;
  }

  // 4. XHTML 본문 데이터 변환 및 하이퍼링크 표준 조율
  const sanitizedBody = sanitizeToXHTML(processedHtml, title);

  // 5. 📄 [EPUB 페이지 분할 코어 제거] 전체 내용을 단일 챕터로 즉시 생성
  const sections = [{
    id: 'section1',
    html: sanitizedBody,
    title: title
  }];

  // 6. 각 분 분할된 챕터(XHTML) 파일 개별 생성 및 매니페스트/스파인 리스트 빌드
  const manifestSectionItems: string[] = [];
  const spineSectionItems: string[] = [];
  
  sections.forEach((sec) => {
    const safeTitle = escapeXml(sec.title);
    const sectionHtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${language}" lang="${language}">
  <head>
    <meta charset="utf-8" />
    <title>${safeTitle}</title>
    <link rel="stylesheet" type="text/css" href="../styles/style.css" />
  </head>
  <body>
    <section class="epub-body">
      ${sec.html}
    </section>
  </body>
</html>`;
    zip.file(`OEBPS/text/${sec.id}.xhtml`, sectionHtml);
    
    manifestSectionItems.push(`<item id="${sec.id}" href="text/${sec.id}.xhtml" media-type="application/xhtml+xml" properties="math svg"/>`);
    spineSectionItems.push(`<itemref idref="${sec.id}"/>`);
  });

  // 7. OEBPS/text/toc.xhtml (EPUB3 표준 네비게이션 목차 문서에 쪼개진 챕터 자동 매핑)
  const tocItems = sections.map(sec => 
    `<li><a href="${sec.id}.xhtml">${escapeXml(sec.title)}</a></li>`
  ).join('\n        ');

  const tocHtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${language}" lang="${language}">
  <head>
    <meta charset="utf-8" />
    <title>Table of Contents</title>
    <link rel="stylesheet" type="text/css" href="../styles/style.css" />
  </head>
  <body>
    <nav epub:type="toc" id="toc">
      <h1 class="toc-title">목차 (Table of Contents)</h1>
      <ol>
        ${tocItems}
      </ol>
    </nav>
  </body>
</html>`;
  zip.file('OEBPS/text/toc.xhtml', tocHtml);

  // 8. OEBPS/styles/style.css (EPUB 가독성 최적화 스타일 시트 + 사용자 CSS 프로필 반영)
  const bodyFontFamily = fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  
  // 🌟 구글 웹폰트 자동 연동 (미리보기/프로필의 한국어 폰트가 리더기 환경에서도 다운로드되어 동일하게 렌더링되도록 처리)
  let fontImports = '';
  if (bodyFontFamily) {
    const fontFamilyLower = bodyFontFamily.toLowerCase();
    if (fontFamilyLower.includes('nanum gothic coding') || fontFamilyLower.includes('nanumgothiccoding')) {
      fontImports += `@import url('https://fonts.googleapis.com/css2?family=Nanum+Gothic+Coding:wght@400;700&display=swap');\n`;
    } else if (fontFamilyLower.includes('nanum gothic') || fontFamilyLower.includes('nanumgothic')) {
      fontImports += `@import url('https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700&display=swap');\n`;
    }
    if (fontFamilyLower.includes('nanum myeongjo') || fontFamilyLower.includes('nanummyeongjo')) {
      fontImports += `@import url('https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700&display=swap');\n`;
    }
    if (fontFamilyLower.includes('noto sans kr') || fontFamilyLower.includes('notosanskr')) {
      fontImports += `@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap');\n`;
    }
    if (fontFamilyLower.includes('noto serif kr') || fontFamilyLower.includes('notoserifkr')) {
      fontImports += `@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700&display=swap');\n`;
    }
  }

  let styleCss = `${fontImports}body {
  font-family: ${bodyFontFamily};
  line-height: 1.62;
  color: #333333;
  margin: 1.5em;
  padding: 0;
}
.epub-body {
  max-width: 100%;
}
h1 {
  font-size: 1.8em;
  font-weight: bold;
  color: #0058bc;
  border-bottom: 1px solid #eaeaea;
  padding-bottom: 0.3em;
  margin-top: 1.2em;
  margin-bottom: 0.6em;
}
h2 {
  font-size: 1.4em;
  font-weight: bold;
  color: #0058bc;
  margin-top: 1.2em;
  margin-bottom: 0.5em;
}
h3 {
  font-size: 1.2em;
  font-weight: bold;
  color: #333333;
  margin-top: 1em;
  margin-bottom: 0.4em;
}
p {
  margin-top: 0;
  margin-bottom: 1em;
  text-align: justify;
}
blockquote {
  margin: 1em 0;
  padding-left: 1em;
  border-left: 4px solid #0058bc;
  color: #555555;
  font-style: italic;
  background-color: #f9f9f9;
  padding-top: 0.5em;
  padding-bottom: 0.5em;
}
pre {
  background-color: #f6f8fa;
  border: 1px solid #eaeaea;
  border-radius: 6px;
  padding: 1em;
  overflow: auto;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
  font-size: 0.9em;
  tab-size: 4;
  -moz-tab-size: 4;
}
code {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'Nanum Gothic Coding', 'D2Coding', '맑은 고딕', 'Malgun Gothic', monospace !important;
  background-color: rgba(27,31,35,0.05) !important;
  border-radius: 3px !important;
  font-size: 0.9em !important;
  padding: 1px 4.5px !important;
  display: inline-block !important;
  vertical-align: 0 !important;
  line-height: 1.35 !important;
  margin: 0 2px !important;
  tab-size: 4;
  -moz-tab-size: 4;
}
ul, ol {
  margin-top: 0;
  margin-bottom: 0.8em;
  padding-left: 1.5em;
}
li {
  margin-bottom: 0.2em;
}
table {
  border-collapse: collapse;
  width: 100%;
  margin-top: 1.5em;
  margin-bottom: 1.5em;
}
th, td {
  border: 1px solid #eaeaea;
  padding: 0.6em 1em;
  text-align: left;
  vertical-align: middle;
  word-break: keep-all;
}
th {
  background-color: #f6f8fa;
  font-weight: bold;
}
img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1.5em auto;
  border-radius: 6px;
}
a {
  color: #0058bc;
  text-decoration: underline;
}
a:hover {
  color: #003a80;
}
/* 인라인 강조: EPUB 리더기가 기본 스타일을 생략하는 경우 대비 명시적 선언 */
strong {
  font-weight: bold;
}
em {
  font-style: italic;
}
u {
  text-decoration: underline;
}
del {
  text-decoration: line-through;
}
.toc-title {
  font-size: 1.6em;
  border-bottom: 2px solid #0058bc;
  padding-bottom: 0.4em;
}
/* 🛡️ 각주 타이틀 및 영어 라벨 원천 차단 */
.footnotes h2,
.footnotes #footnote-label,
.footnotes .sr-only {
  display: none !important;
}
/* 🛡️ 각주 리스트 정렬 보정: 번호와 내용이 한 줄에 조화롭게 나오도록 강제 */
.footnotes ol {
  list-style-type: decimal !important;
  padding-left: 1.5em !important;
  margin: 0 !important;
}
.footnotes li {
  margin-bottom: 0.5em !important;
  list-style-position: outside !important;
  display: list-item !important;
}
.footnotes li p {
  display: inline !important;
  margin: 0 !important;
}
.footnotes li::before {
  display: none !important;
  content: none !important;
}
.footnote-backref {
  text-decoration: none !important;
  margin-left: 4px !important;
}
/* EPUB 리더기 강제 페이징 속성 (추후 대체) */
  padding: 0 !important;
}`;

  // 사용자 CSS 프로필이 있으면 EPUB 스타일시트에 추가
  // (dynamicCssString의 .custom-preview-container 선택자를 EPUB용 body로 치환하여 전체 폰트 및 배경색 완벽 일치)
  if (dynamicCssString) {
    const epubCss = dynamicCssString
      .replace(/\.custom-preview-container\s/g, 'body ')
      .replace(/\.custom-preview-container/g, 'body');
    styleCss += `\n\n/* 사용자 지정 CSS 프로필 */\n${epubCss}`;
  }
  
  // 🌟 KaTeX 공식 CSS 코어 규칙 병합 탑재 (수식 정밀 렌더링용)
  styleCss += `\n\n/* KaTeX Core CSS */\n${KATEX_CSS}`;

  zip.file('OEBPS/styles/style.css', styleCss);

  // 8.5. OEBPS/toc.ncx (EPUB2 호환성 목차 파일 생성 - 교보문고, 예스24, 리디북스 등 국내외 이북 리더기 필수 하위 호환 규격)
  const ncxNavPoints = sections.map((sec, idx) => `
    <navPoint id="num_${idx + 1}" playOrder="${idx + 1}">
      <navLabel>
        <text>${escapeXml(sec.title)}</text>
      </navLabel>
      <content src="text/${sec.id}.xhtml"/>
    </navPoint>`).join('');

  const tocNcx = `<?xml version="1.0" encoding="utf-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:uuid:${uuid}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle>
    <text>${escapeXml(title)}</text>
  </docTitle>
  <navMap>
    ${ncxNavPoints}
  </navMap>
</ncx>`;
  zip.file('OEBPS/toc.ncx', tocNcx);

  // 9. OEBPS/content.opf (메타데이터 및 리소스 목록 매니페스트 동적 생성)
  const imageManifestItems = embeddedImages.map(img => 
    `<item id="${img.id}" href="${img.href}" media-type="${img.mimeType}"/>`
  ).join('\n    ');

  const sectionManifestItems = manifestSectionItems.join('\n    ');
  const sectionSpineItems = spineSectionItems.join('\n    ');

  const contentOpf = `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="BookId">urn:uuid:${uuid}</dc:identifier>
    <dc:title>${escapeXml(title)}</dc:title>
    <dc:language>${language}</dc:language>
    <dc:creator id="creator">${escapeXml(creator)}</dc:creator>
    <meta refines="#creator" property="role" scheme="marc:relators">aut</meta>
    <meta property="dcterms:modified">${modifiedTime}</meta>
  </metadata>
  <manifest>
    <item id="toc" href="text/toc.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    ${sectionManifestItems}
    <item id="style" href="styles/style.css" media-type="text/css"/>
    ${imageManifestItems}
  </manifest>
  <spine toc="ncx">
    <itemref idref="toc"/>
    ${sectionSpineItems}
  </spine>
</package>`;
  zip.file('OEBPS/content.opf', contentOpf);

  // 10. ZIP 파일 생성 및 Blob 반환 (arraybuffer로 생성 후 Blob으로 수동 래핑하여 mimetype이 첫 바이트임을 보장)
  // mimetype은 압축하지 않고(STORE), 나머지 리소스는 표준대로 효율적으로 압축(DEFLATE) 처리합니다!
  const arrayBuffer = await zip.generateAsync({ type: 'arraybuffer', compression: 'DEFLATE' });
  return new Blob([arrayBuffer], { type: 'application/epub+zip' });
  return new Blob([arrayBuffer], { type: 'application/epub+zip' });
}

/**
 * 생성된 EPUB Blob을 다운로드 다이얼로그로 내보내는 유틸리티 함수
 */
// ====================================================================
// 📊 [OMD-IO-epubGenerator-0005] epubGenerator.ts ➔ downloadBlob
// 🎯 @KICK  : EPUB Blob을 브라우저 다운로드 다이얼로그로 내보내기
// 🛡️ @GUARD : Blob URL 생성/해제, DOM 정리
// 🚨 @PATCH : 100ms 지연 후 URL revoke로 메모리 누수 방지
// 🔗 @CALLS : 없음
// ====================================================================
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

// ====================================================================
// 📊 [OMD-IO-epubGenerator-0006] epubGenerator.ts ➔ KATEX_CSS (Constant)
// 🎯 @KICK  : KaTeX 렌더링 결과를 EPUB에서 정상 출력하기 위한 코어 CSS 상수
// ====================================================================
const KATEX_CSS = `@font-face{font-display:block;font-family:KaTeX_AMS;font-style:normal;font-weight:400;src:url(fonts/KaTeX_AMS-Regular.woff2) format("woff2"),url(fonts/KaTeX_AMS-Regular.woff) format("woff"),url(fonts/KaTeX_AMS-Regular.ttf) format("truetype")}@font-face{font-display:block;font-family:KaTeX_Caligraphic;font-style:normal;font-weight:700;src:url(fonts/KaTeX_Caligraphic-Bold.woff2) format("woff2"),url(fonts/KaTeX_Caligraphic-Bold.woff) format("woff"),url(fonts/KaTeX_Caligraphic-Bold.ttf) format("truetype")}@font-face{font-display:block;font-family:KaTeX_Caligraphic;font-style:normal;font-weight:400;src:url(fonts/KaTeX_Caligraphic-Regular.woff2) format("woff2"),url(fonts/KaTeX_Caligraphic-Regular.woff) format("woff"),url(fonts/KaTeX_Caligraphic-Regular.ttf) format("truetype")}@font-face{font-display:block;font-family:KaTeX_Fraktur;font-style:normal;font-weight:700;src:url(fonts/KaTeX_Fraktur-Bold.woff2) format("woff2"),url(fonts/KaTeX_Fraktur-Bold.woff) format("woff"),url(fonts/KaTeX_Fraktur-Bold.ttf) format("truetype")}@font-face{font-display:block;font-family:KaTeX_Fraktur;font-style:normal;font-weight:400;src:url(fonts/KaTeX_Fraktur-Regular.woff2) format("woff2"),url(fonts/KaTeX_Fraktur-Regular.woff) format("woff"),url(fonts/KaTeX_Fraktur-Regular.ttf) format("truetype")}@font-face{font-display:block;font-family:KaTeX_Main;font-style:normal;font-weight:700;src:url(fonts/KaTeX_Main-Bold.woff2) format("woff2"),url(fonts/KaTeX_Main-Bold.woff) format("woff"),url(fonts/KaTeX_Main-Bold.ttf) format("truetype")}@font-face{font-display:block;font-family:KaTeX_Main;font-style:italic;font-weight:700;src:url(fonts/KaTeX_Main-BoldItalic.woff2) format("woff2"),url(fonts/KaTeX_Main-BoldItalic.woff) format("woff"),url(fonts/KaTeX_Main-BoldItalic.ttf) format("truetype")}@font-face{font-display:block;font-family:KaTeX_Main;font-style:italic;font-weight:400;src:url(fonts/KaTeX_Main-Italic.woff2) format("woff2"),url(fonts/KaTeX_Main-Italic.woff) format("woff"),url(fonts/KaTeX_Main-Italic.ttf) format("truetype")}@font-face{font-display:block;font-family:KaTeX_Main;font-style:normal;font-weight:400;src:url(fonts/KaTeX_Main-Regular.woff2) format("woff2"),url(fonts/KaTeX_Main-Regular.woff) format("woff"),url(fonts/KaTeX_Main-Regular.ttf) format("truetype")}@font-face{font-display:block;font-family:KaTeX_Math;font-style:italic;font-weight:700;src:url(fonts/KaTeX_Math-BoldItalic.woff2) format("woff2"),url(fonts/KaTeX_Math-BoldItalic.woff) format("woff"),url(fonts/KaTeX_Math-BoldItalic.ttf) format("truetype")}@font-face{font-display:block;font-family:KaTeX_Math;font-style:italic;font-weight:400;src:url(fonts/KaTeX_Math-Italic.woff2) format("woff2"),url(fonts/KaTeX_Math-Italic.woff) format("woff"),url(fonts/KaTeX_Math-Italic.ttf) format("truetype")}@font-face{font-display:block;font-family:\\"KaTeX_SansSerif\\";font-style:normal;font-weight:700;src:url(fonts/KaTeX_SansSerif-Bold.woff2) format(\\"woff2\\"),url(fonts/KaTeX_SansSerif-Bold.woff) format(\\"woff\\"),url(fonts/KaTeX_SansSerif-Bold.ttf) format(\\"truetype\\")}@font-face{font-display:block;font-family:\\"KaTeX_SansSerif\\";font-style:italic;font-weight:400;src:url(fonts/KaTeX_SansSerif-Italic.woff2) format(\\"woff2\\"),url(fonts/KaTeX_SansSerif-Italic.woff) format(\\"woff\\"),url(fonts/KaTeX_SansSerif-Italic.ttf) format(\\"truetype\\")}@font-face{font-display:block;font-family:\\"KaTeX_SansSerif\\";font-style:normal;font-weight:400;src:url(fonts/KaTeX_SansSerif-Regular.woff2) format(\\"woff2\\"),url(fonts/KaTeX_SansSerif-Regular.woff) format(\\"woff\\"),url(fonts/KaTeX_SansSerif-Regular.ttf) format(\\"truetype\\")}@font-face{font-display:block;font-family:KaTeX_Script;font-style:normal;font-weight:400;src:url(fonts/KaTeX_Script-Regular.woff2) format(\\"woff2\\"),url(fonts/KaTeX_Script-Regular.woff) format(\\"woff\\"),url(fonts/KaTeX_Script-Regular.ttf) format(\\"truetype\\")}@font-face{font-display:block;font-family:KaTeX_Size1;font-style:normal;font-weight:400;src:url(fonts/KaTeX_Size1-Regular.woff2) format(\\"woff2\\"),url(fonts/KaTeX_Size1-Regular.woff) format(\\"woff\\"),url(fonts/KaTeX_Size1-Regular.ttf) format(\\"truetype\\")}@font-face{font-display:block;font-family:KaTeX_Size2;font-style:normal;font-weight:400;src:url(fonts/KaTeX_Size2-Regular.woff2) format(\\"woff2\\"),url(fonts/KaTeX_Size2-Regular.woff) format(\\"woff\\"),url(fonts/KaTeX_Size2-Regular.ttf) format(\\"truetype\\")}@font-face{font-display:block;font-family:KaTeX_Size3;font-style:normal;font-weight:400;src:url(fonts/KaTeX_Size3-Regular.woff2) format(\\"woff2\\"),url(fonts/KaTeX_Size3-Regular.woff) format(\\"woff\\"),url(fonts/KaTeX_Size3-Regular.ttf) format(\\"truetype\\")}@font-face{font-display:block;font-family:KaTeX_Size4;font-style:normal;font-weight:400;src:url(fonts/KaTeX_Size4-Regular.woff2) format(\\"woff2\\"),url(fonts/KaTeX_Size4-Regular.woff) format(\\"woff\\"),url(fonts/KaTeX_Size4-Regular.ttf) format(\\"truetype\\")}@font-face{font-display:block;font-family:KaTeX_Typewriter;font-style:normal;font-weight:400;src:url(fonts/KaTeX_Typewriter-Regular.woff2) format(\\"woff2\\"),url(fonts/KaTeX_Typewriter-Regular.woff) format(\\"woff\\"),url(fonts/KaTeX_Typewriter-Regular.ttf) format(\\"truetype\\")}.katex{font:normal 1.21em KaTeX_Main,Times New Roman,serif;line-height:1.2;position:relative;text-indent:0;text-rendering:auto}.katex *{-ms-high-contrast-adjust:none!important;border-color:currentColor}.katex .katex-version:after{content:\\"0.17.0\\"}.katex .katex-mathml{border:0;-webkit-clip-path:inset(50%);clip-path:inset(50%);height:1px;overflow:hidden;padding:0;position:absolute;width:1px}.katex .katex-html>.newline{display:block}.katex .base{position:relative;white-space:nowrap;width:-webkit-min-content;width:-moz-min-content;width:min-content}.katex .base,.katex .strut{display:inline-block}.katex .textbf{font-weight:700}.katex .textit{font-style:italic}.katex .textrm{font-family:KaTeX_Main}.katex .textsf{font-family:KaTeX_SansSerif}.katex .texttt{font-family:KaTeX_Typewriter}.katex .mathnormal{font-family:KaTeX_Math;font-style:italic}.katex .mathit{font-family:KaTeX_Main;font-style:italic}.katex .mathrm{font-style:normal}.katex .mathbf{font-family:KaTeX_Main;font-weight:700}.katex .boldsymbol{font-family:KaTeX_Math;font-style:italic;font-weight:700}.katex .amsrm,.katex .mathbb,.katex .textbb{font-family:KaTeX_AMS}.katex .mathcal{font-family:KaTeX_Caligraphic}.katex .mathfrak,.katex .textfrak{font-family:KaTeX_Fraktur}.katex .mathboldfrak,.katex .textboldfrak{font-family:KaTeX_Fraktur;font-weight:700}.katex .mathtt{font-family:KaTeX_Typewriter}.katex .mathscr,.katex .textscr{font-family:KaTeX_Script}.katex .mathsf,.katex .textsf{font-family:KaTeX_SansSerif}.katex .mathboldsf,.katex .textboldsf{font-family:KaTeX_SansSerif;font-weight:700}.katex .mathitsf,.katex .mathsfit,.katex .textitsf{font-family:KaTeX_SansSerif;font-style:italic}.katex .mainrm{font-family:KaTeX_Main;font-style:normal}.katex .vlist-t{border-collapse:collapse;display:inline-table;table-layout:fixed}.katex .vlist-r{display:table-row}.katex .vlist{display:table-cell;position:relative;vertical-align:bottom}.katex .vlist>span{display:block;height:0;position:relative}.katex .vlist>span>span{display:inline-block}.katex .vlist>span>.pstrut{overflow:hidden;width:0}.katex .vlist-t2{margin-right:-2px}.katex .vlist-s{display:table-cell;font-size:1px;min-width:2px;vertical-align:bottom;width:2px}.katex .vbox{align-items:baseline;display:inline-flex;flex-direction:column}.katex .hbox{width:100%}.katex .hbox,.katex .thinbox{display:inline-flex;flex-direction:row}.katex .thinbox{max-width:0;width:0}.katex .msupsub{text-align:left}.katex .mfrac>span>span{text-align:center}.katex .mfrac .frac-line{border-bottom-style:solid;display:inline-block;width:100%}.katex .hdashline,.katex .hline,.katex .mfrac .frac-line,.katex .overline .overline-line,.katex .rule,.katex .underline .underline-line{min-height:1px}.katex .mspace{display:inline-block}.katex .smash{display:inline;line-height:0}.katex .clap,.katex .llap,.katex .rlap{position:relative;width:0}.katex .clap>.inner,.katex .llap>.inner,.katex .rlap>.inner{position:absolute}.katex .clap>.fix,.katex .llap>.fix,.katex .rlap>.fix{display:inline-block}.katex .llap>.inner{right:0}.katex .clap>.inner,.katex .rlap>.inner{left:0}.katex .clap>.inner>span{margin-left:-50%;margin-right:50%}.katex .rule{border:0 solid;display:inline-block;position:relative}.katex .hline,.katex .overline .overline-line,.katex .underline .underline-line{border-bottom-style:solid;display:inline-block;width:100%}.katex .hdashline{border-bottom-style:dashed;display:inline-block;width:100%}.katex .sqrt>.root{margin-left:.2777777778em;margin-right:-.5555555556em}.katex .fontsize-ensurer.reset-size1.size1,.katex .sizing.reset-size1.size1{font-size:1em}.katex .fontsize-ensurer.reset-size1.size2,.katex .sizing.reset-size1.size2{font-size:1.2em}.katex .fontsize-ensurer.reset-size1.size3,.katex .sizing.reset-size1.size3{font-size:1.4em}.katex .fontsize-ensurer.reset-size1.size4,.katex .sizing.reset-size1.size4{font-size:1.6em}.katex .fontsize-ensurer.reset-size1.size5,.katex .sizing.reset-size1.size5{font-size:1.8em}.katex .fontsize-ensurer.reset-size1.size6,.katex .sizing.reset-size1.size6{font-size:2em}.katex .fontsize-ensurer.reset-size1.size7,.katex .sizing.reset-size1.size7{font-size:2.4em}.katex .fontsize-ensurer.reset-size1.size8,.katex .sizing.reset-size1.size8{font-size:2.88em}.katex .fontsize-ensurer.reset-size1.size9,.katex .sizing.reset-size1.size9{font-size:3.456em}.katex .fontsize-ensurer.reset-size1.size10,.katex .sizing.reset-size1.size10{font-size:4.148em}.katex .fontsize-ensurer.reset-size1.size11,.katex .sizing.reset-size1.size11{font-size:4.976em}.katex .fontsize-ensurer.reset-size2.size1,.katex .sizing.reset-size2.size1{font-size:.8333333333em}.katex .fontsize-ensurer.reset-size2.size2,.katex .sizing.reset-size2.size2{font-size:1em}.katex .fontsize-ensurer.reset-size2.size3,.katex .sizing.reset-size2.size3{font-size:1.1666666667em}.katex .fontsize-ensurer.reset-size2.size4,.katex .sizing.reset-size2.size4{font-size:1.3333333333em}.katex .fontsize-ensurer.reset-size2.size5,.katex .sizing.reset-size2.size5{font-size:1.5em}.katex .fontsize-ensurer.reset-size2.size6,.katex .sizing.reset-size2.size6{font-size:1.6666666667em}.katex .fontsize-ensurer.reset-size2.size7,.katex .sizing.reset-size2.size7{font-size:2em}.katex .fontsize-ensurer.reset-size2.size8,.katex .sizing.reset-size2.size8{font-size:2.4em}.katex .fontsize-ensurer.reset-size2.size9,.katex .sizing.reset-size2.size9{font-size:2.88em}.katex .fontsize-ensurer.reset-size2.size10,.katex .sizing.reset-size2.size10{font-size:3.4566666667em}.katex .fontsize-ensurer.reset-size2.size11,.katex .sizing.reset-size2.size11{font-size:4.1466666667em}.katex .fontsize-ensurer.reset-size3.size1,.katex .sizing.reset-size3.size1{font-size:.7142857143em}.katex .fontsize-ensurer.reset-size3.size2,.katex .sizing.reset-size3.size2{font-size:.8571428571em}.katex .fontsize-ensurer.reset-size3.size3,.katex .sizing.reset-size3.size3{font-size:1em}.katex .fontsize-ensurer.reset-size3.size4,.katex .sizing.reset-size3.size4{font-size:1.1428571429em}.katex .fontsize-ensurer.reset-size3.size5,.katex .sizing.reset-size3.size5{font-size:1.2857142857em}.katex .fontsize-ensurer.reset-size3.size6,.katex .sizing.reset-size3.size6{font-size:1.4285714286em}.katex .fontsize-ensurer.reset-size3.size7,.katex .sizing.reset-size3.size7{font-size:1.7142857143em}.katex .fontsize-ensurer.reset-size3.size8,.katex .sizing.reset-size3.size8{font-size:2.0571428571em}.katex .fontsize-ensurer.reset-size3.size9,.katex .sizing.reset-size3.size9{font-size:2.4685714286em}.katex .fontsize-ensurer.reset-size3.size10,.katex .sizing.reset-size3.size10{font-size:2.9628571429em}.katex .fontsize-ensurer.reset-size3.size11,.katex .sizing.reset-size3.size11{font-size:3.5542857143em}.katex .fontsize-ensurer.reset-size4.size1,.katex .sizing.reset-size4.size1{font-size:.625em}.katex .fontsize-ensurer.reset-size4.size2,.katex .sizing.reset-size4.size2{font-size:.75em}.katex .fontsize-ensurer.reset-size4.size3,.katex .sizing.reset-size4.size3{font-size:.875em}.katex .fontsize-ensurer.reset-size4.size4,.katex .sizing.reset-size4.size4{font-size:1em}.katex .fontsize-ensurer.reset-size4.size5,.katex .sizing.reset-size4.size5{font-size:1.125em}.katex .fontsize-ensurer.reset-size4.size6,.katex .sizing.reset-size4.size6{font-size:1.25em}.katex .fontsize-ensurer.reset-size4.size7,.katex .sizing.reset-size4.size7{font-size:1.5em}.katex .fontsize-ensurer.reset-size4.size8,.katex .sizing.reset-size4.size8{font-size:1.8em}.katex .fontsize-ensurer.reset-size4.size9,.katex .sizing.reset-size4.size9{font-size:2.16em}.katex .fontsize-ensurer.reset-size4.size10,.katex .sizing.reset-size4.size10{font-size:2.5925em}.katex .fontsize-ensurer.reset-size4.size11,.katex .sizing.reset-size4.size11{font-size:3.11em}.katex .fontsize-ensurer.reset-size5.size1,.katex .sizing.reset-size5.size1{font-size:.5555555556em}.katex .fontsize-ensurer.reset-size5.size2,.katex .sizing.reset-size5.size2{font-size:.6666666667em}.katex .fontsize-ensurer.reset-size5.size3,.katex .sizing.reset-size5.size3{font-size:.7777777778em}.katex .fontsize-ensurer.reset-size5.size4,.katex .sizing.reset-size5.size4{font-size:.8888888889em}.katex .fontsize-ensurer.reset-size5.size5,.katex .sizing.reset-size5.size5{font-size:1em}.katex .fontsize-ensurer.reset-size5.size6,.katex .sizing.reset-size5.size6{font-size:1.1111111111em}.katex .fontsize-ensurer.reset-size5.size7,.katex .sizing.reset-size5.size7{font-size:1.3333333333em}.katex .fontsize-ensurer.reset-size5.size8,.katex .sizing.reset-size5.size8{font-size:1.6em}.katex .fontsize-ensurer.reset-size5.size9,.katex .sizing.reset-size5.size9{font-size:1.92em}.katex .fontsize-ensurer.reset-size5.size10,.katex .sizing.reset-size5.size10{font-size:2.3044444444em}.katex .fontsize-ensurer.reset-size5.size11,.katex .sizing.reset-size5.size11{font-size:2.7644444444em}.katex .fontsize-ensurer.reset-size6.size1,.katex .sizing.reset-size6.size1{font-size:.5em}.katex .fontsize-ensurer.reset-size6.size2,.katex .sizing.reset-size6.size2{font-size:.6em}.katex .fontsize-ensurer.reset-size6.size3,.katex .sizing.reset-size6.size3{font-size:.7em}.katex .fontsize-ensurer.reset-size6.size4,.katex .sizing.reset-size6.size4{font-size:.8em}.katex .fontsize-ensurer.reset-size6.size5,.katex .sizing.reset-size6.size5{font-size:.9em}.katex .fontsize-ensurer.reset-size6.size6,.katex .sizing.reset-size6.size6{font-size:1em}.katex .fontsize-ensurer.reset-size6.size7,.katex .sizing.reset-size6.size7{font-size:1.2em}.katex .fontsize-ensurer.reset-size6.size8,.katex .sizing.reset-size6.size8{font-size:1.44em}.katex .fontsize-ensurer.reset-size6.size9,.katex .sizing.reset-size6.size9{font-size:1.728em}.katex .fontsize-ensurer.reset-size6.size10,.katex .sizing.reset-size6.size10{font-size:2.074em}.katex .fontsize-ensurer.reset-size6.size11,.katex .sizing.reset-size6.size11{font-size:2.488em}.katex .fontsize-ensurer.reset-size7.size1,.katex .sizing.reset-size7.size1{font-size:.4166666667em}.katex .fontsize-ensurer.reset-size7.size2,.katex .sizing.reset-size7.size2{font-size:.5em}.katex .fontsize-ensurer.reset-size7.size3,.katex .sizing.reset-size7.size3{font-size:.5833333333em}.katex .fontsize-ensurer.reset-size7.size4,.katex .sizing.reset-size7.size4{font-size:.6666666667em}.katex .fontsize-ensurer.reset-size7.size5,.katex .sizing.reset-size7.size5{font-size:.75em}.katex .fontsize-ensurer.reset-size7.size6,.katex .sizing.reset-size7.size6{font-size:.8333333333em}.katex .fontsize-ensurer.reset-size7.size7,.katex .sizing.reset-size7.size7{font-size:1em}.katex .fontsize-ensurer.reset-size7.size8,.katex .sizing.reset-size7.size8{font-size:1.2em}.katex .fontsize-ensurer.reset-size7.size9,.katex .sizing.reset-size7.size9{font-size:1.44em}.katex .fontsize-ensurer.reset-size7.size10,.katex .sizing.reset-size7.size10{font-size:1.7283333333em}.katex .fontsize-ensurer.reset-size7.size11,.katex .sizing.reset-size7.size11{font-size:2.0733333333em}.katex .fontsize-ensurer.reset-size8.size1,.katex .sizing.reset-size8.size1{font-size:.3472222222em}.katex .fontsize-ensurer.reset-size8.size2,.katex .sizing.reset-size8.size2{font-size:.4166666667em}.katex .fontsize-ensurer.reset-size8.size3,.katex .sizing.reset-size8.size3{font-size:.4861111111em}.katex .fontsize-ensurer.reset-size8.size4,.katex .sizing.reset-size8.size4{font-size:.5555555556em}.katex .fontsize-ensurer.reset-size8.size5,.katex .sizing.reset-size8.size5{font-size:.625em}.katex .fontsize-ensurer.reset-size8.size6,.katex .sizing.reset-size8.size6{font-size:.6944444444em}.katex .fontsize-ensurer.reset-size8.size7,.katex .sizing.reset-size8.size7{font-size:.8333333333em}.katex .fontsize-ensurer.reset-size8.size8,.katex .sizing.reset-size8.size8{font-size:1em}.katex .fontsize-ensurer.reset-size8.size9,.katex .sizing.reset-size8.size9{font-size:1.2em}.katex .fontsize-ensurer.reset-size8.size10,.katex .sizing.reset-size8.size10{font-size:1.4402777778em}.katex .fontsize-ensurer.reset-size8.size11,.katex .sizing.reset-size8.size11{font-size:1.7277777778em}.katex .fontsize-ensurer.reset-size9.size1,.katex .sizing.reset-size9.size1{font-size:.2893518519em}.katex .fontsize-ensurer.reset-size9.size2,.katex .sizing.reset-size9.size2{font-size:.3472222222em}.katex .fontsize-ensurer.reset-size9.size3,.katex .sizing.reset-size9.size3{font-size:.4050925926em}.katex .fontsize-ensurer.reset-size9.size4,.katex .sizing.reset-size9.size4{font-size:.462962963em}.katex .fontsize-ensurer.reset-size9.size5,.katex .sizing.reset-size9.size5{font-size:.5208333333em}.katex .fontsize-ensurer.reset-size9.size6,.katex .sizing.reset-size9.size6{font-size:.5787037037em}.katex .fontsize-ensurer.reset-size9.size7,.katex .sizing.reset-size9.size7{font-size:.6944444444em}.katex .fontsize-ensurer.reset-size9.size8,.katex .sizing.reset-size9.size8{font-size:.8333333333em}.katex .fontsize-ensurer.reset-size9.size9,.katex .sizing.reset-size9.size9{font-size:1em}.katex .fontsize-ensurer.reset-size9.size10,.katex .sizing.reset-size9.size10{font-size:1.2002314815em}.katex .fontsize-ensurer.reset-size9.size11,.katex .sizing.reset-size9.size11{font-size:1.4398148148em}.katex .fontsize-ensurer.reset-size10.size1,.katex .sizing.reset-size10.size1{font-size:.2410800386em}.katex .fontsize-ensurer.reset-size10.size2,.katex .sizing.reset-size10.size2{font-size:.2892960463em}.katex .fontsize-ensurer.reset-size10.size3,.katex .sizing.reset-size10.size3{font-size:.337512054em}.katex .fontsize-ensurer.reset-size10.size4,.katex .sizing.reset-size10.size4{font-size:.3857280617em}.katex .fontsize-ensurer.reset-size10.size5,.katex .sizing.reset-size10.size5{font-size:.4339440694em}.katex .fontsize-ensurer.reset-size10.size6,.katex .sizing.reset-size10.size6{font-size:.4821600771em}.katex .fontsize-ensurer.reset-size10.size7,.katex .sizing.reset-size10.size7{font-size:.5785920926em}.katex .fontsize-ensurer.reset-size10.size8,.katex .sizing.reset-size10.size8{font-size:.6943105111em}.katex .fontsize-ensurer.reset-size10.size9,.katex .sizing.reset-size10.size9{font-size:.8331726133em}.katex .fontsize-ensurer.reset-size10.size10,.katex .sizing.reset-size10.size10{font-size:1em}.katex .fontsize-ensurer.reset-size10.size11,.katex .sizing.reset-size10.size11{font-size:1.1996142719em}.katex .fontsize-ensurer.reset-size11.size1,.katex .sizing.reset-size11.size1{font-size:.2009646302em}.katex .fontsize-ensurer.reset-size11.size2,.katex .sizing.reset-size11.size2{font-size:.2411575563em}.katex .fontsize-ensurer.reset-size11.size3,.katex .sizing.reset-size11.size3{font-size:.2813504823em}.katex .fontsize-ensurer.reset-size11.size4,.katex .sizing.reset-size11.size4{font-size:.3215434084em}.katex .fontsize-ensurer.reset-size11.size5,.katex .sizing.reset-size11.size5{font-size:.3617363344em}.katex .fontsize-ensurer.reset-size11.size6,.katex .sizing.reset-size11.size6{font-size:.4019292605em}.katex .fontsize-ensurer.reset-size11.size7,.katex .sizing.reset-size11.size7{font-size:.4823151125em}.katex .fontsize-ensurer.reset-size11.size8,.katex .sizing.reset-size11.size8{font-size:.578778135em}.katex .fontsize-ensurer.reset-size11.size9,.katex .sizing.reset-size11.size9{font-size:.6945337621em}.katex .fontsize-ensurer.reset-size11.size10,.katex .sizing.reset-size11.size10{font-size:.8336012862em}.katex .fontsize-ensurer.reset-size11.size11,.katex .sizing.reset-size11.size11{font-size:1em}.katex .delimsizing.size1{font-family:KaTeX_Size1}.katex .delimsizing.size2{font-family:KaTeX_Size2}.katex .delimsizing.size3{font-family:KaTeX_Size3}.katex .delimsizing.size4{font-family:KaTeX_Size4}.katex .delimsizing.mult .delim-size1>span{font-family:KaTeX_Size1}.katex .delimsizing.mult .delim-size4>span{font-family:KaTeX_Size4}.katex .nulldelimiter{display:inline-block;width:.12em}.katex .delimcenter,.katex .op-symbol{position:relative}.katex .op-symbol.small-op{font-family:KaTeX_Size1}.katex .op-symbol.large-op{font-family:KaTeX_Size2}.katex .accent>.vlist-t,.katex .op-limits>.vlist-t{text-align:center}.katex .accent .accent-body{position:relative}.katex .accent .accent-body:not(.accent-full){width:0}.katex .overlay{display:block}.katex .mtable .vertical-separator{display:inline-block;min-width:1px}.katex .mtable .arraycolsep{display:inline-block}.katex .mtable .col-align-c>.vlist-t{text-align:center}.katex .mtable .col-align-l>.vlist-t{text-align:left}.katex .mtable .col-align-r>.vlist-t{text-align:right}.katex .svg-align{text-align:left}.katex svg{fill:currentColor;stroke:currentColor;display:block;height:inherit;position:absolute;width:100%}.katex svg path{stroke:none}.katex svg{fill-rule:nonzero;fill-opacity:1;stroke-width:1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1}.katex img{border-style:none;max-height:none;max-width:none;min-height:0;min-width:0}.katex .stretchy{display:block;overflow:hidden;position:relative;width:100%}.katex .stretchy:after,.katex .stretchy:before{content:""}.katex .hide-tail{overflow:hidden;position:relative;width:100%}.katex .halfarrow-left{left:0;overflow:hidden;position:absolute;width:50.2%}.katex .halfarrow-right{overflow:hidden;position:absolute;right:0;width:50.2%}.katex .brace-left{left:0;overflow:hidden;position:absolute;width:25.1%}.katex .brace-center{left:25%;overflow:hidden;position:absolute;width:50%}.katex .brace-right{overflow:hidden;position:absolute;right:0;width:25.1%}.katex .x-arrow-pad{padding:0 .5em}.katex .cd-arrow-pad{padding:0 .55556em 0 .27778em}.katex .mover,.katex .munder,.katex .x-arrow{text-align:center}.katex .boxpad{padding:0 .3em}.katex .fbox,.katex .fcolorbox{border:.04em solid;box-sizing:border-box}.katex .cancel-pad{padding:0 .2em}.katex .cancel-lap{margin-left:-.2em;margin-right:-.2em}.katex .sout{border-bottom-style:solid;border-bottom-width:.08em}.katex .angl{border-right:.049em solid;border-top:.049em solid;box-sizing:border-box;margin-right:.03889em}.katex .anglpad{padding:0 .03889em}.katex .eqn-num:before{content:"(" counter(katexEqnNo) ")";counter-increment:katexEqnNo}.katex .mml-eqn-num:before{content:"(" counter(mmlEqnNo) ")";counter-increment:mmlEqnNo}.katex .mtr-glue{width:50%}.katex .cd-vert-arrow{display:inline-block;position:relative}.katex .cd-label-left{display:inline-block;position:absolute;right:calc(50% + .3em);text-align:left}.katex .cd-label-right{display:inline-block;left:calc(50% + .3em);position:absolute;text-align:right}.katex-display{display:block;margin:1em 0;text-align:center}.katex-display>.katex{display:block;text-align:center;white-space:nowrap}.katex-display>.katex>.katex-html{display:block;position:relative}.katex-display>.katex>.katex-html>.tag{position:absolute;right:0}.katex-display.leqno>.katex>.katex-html>.tag{left:0;right:auto}.katex-display.fleqn>.katex{padding-left:2em;text-align:left}body{counter-reset:katexEqnNo mmlEqnNo}`;
