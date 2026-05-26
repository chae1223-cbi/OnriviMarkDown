import JSZip from 'jszip';

/**
 * 파일 확장자 기반으로 올바른 이미지 MIME 타입을 결정해주는 헬퍼
 */
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
}

interface EmbeddedImage {
  id: string;
  href: string;
  mimeType: string;
}

export async function generateEpub({
  title,
  creator = 'Onrivi Author',
  language = 'ko',
  contentHtml
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
  zip.folder('META-INF')?.file('container.xml', containerXml);

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
          
          // 브라우저 Fetch를 이용해 이미지 바이너리(ArrayBuffer) 획득
          const response = await fetch(srcUrl);
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
          console.warn(`[EPUB Builder] 이미지 동봉 실패: ${srcUrl}`, err);
        }
      }
    }
    processedHtml = doc.body.innerHTML;
  }

  // 4. XHTML 본문 데이터 변환 및 하이퍼링크 표준 조율
  const sanitizedBody = sanitizeToXHTML(processedHtml, title);

  // 5. OEBPS/text/section1.xhtml (실제 책 본문)
  const sectionHtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${language}" lang="${language}">
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <link rel="stylesheet" type="text/css" href="../styles/style.css" />
  </head>
  <body>
    <section class="epub-body">
      ${sanitizedBody}
    </section>
  </body>
</html>`;
  zip.folder('OEBPS/text')?.file('section1.xhtml', sectionHtml);

  // 6. OEBPS/text/toc.xhtml (EPUB3 표준 네비게이션 목차 문서)
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
        <li><a href="section1.xhtml">${title}</a></li>
      </ol>
    </nav>
  </body>
</html>`;
  zip.folder('OEBPS/text')?.file('toc.xhtml', tocHtml);

  // 7. OEBPS/styles/style.css (EPUB 가독성 최적화 스타일 시트)
  const styleCss = `body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
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
}
code {
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
  background-color: rgba(27,31,35,0.05);
  border-radius: 3px;
  font-size: 0.9em;
  padding: 0.2em 0.4em;
}
ul, ol {
  margin-top: 0;
  margin-bottom: 1em;
  padding-left: 2em;
}
li {
  margin-bottom: 0.3em;
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
.toc-title {
  font-size: 1.6em;
  border-bottom: 2px solid #0058bc;
  padding-bottom: 0.4em;
}`;
  zip.folder('OEBPS/styles')?.file('style.css', styleCss);

  // 8. OEBPS/content.opf (메타데이터 및 리소스 목록 매니페스트 동적 생성)
  const manifestItems = embeddedImages.map(img => 
    `<item id="${img.id}" href="${img.href}" media-type="${img.mimeType}"/>`
  ).join('\n    ');

  const contentOpf = `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="BookId">urn:uuid:${uuid}</dc:identifier>
    <dc:title>${title}</dc:title>
    <dc:language>${language}</dc:language>
    <dc:creator id="creator">${creator}</dc:creator>
    <meta refines="#creator" property="role" scheme="marc:relators">aut</meta>
    <meta property="dcterms:modified">${modifiedTime}</meta>
  </metadata>
  <manifest>
    <item id="toc" href="text/toc.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="section1" href="text/section1.xhtml" media-type="application/xhtml+xml"/>
    <item id="style" href="styles/style.css" media-type="text/css"/>
    ${manifestItems}
  </manifest>
  <spine>
    <itemref idref="toc"/>
    <itemref idref="section1"/>
  </spine>
</package>`;
  zip.file('OEBPS/content.opf', contentOpf);

  // 9. ZIP 파일 생성 및 Blob 반환
  return await zip.generateAsync({ type: 'blob', mimeType: 'application/epub+zip' });
}

/**
 * 생성된 EPUB Blob을 다운로드 다이얼로그로 내보내는 유틸리티 함수
 */
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
