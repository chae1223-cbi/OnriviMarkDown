// ====================================================================
// 📊 [OMD-IO-hwpxGenerator-0001] hwpxGenerator.ts ➔ generateHwpx
// 🎯 @KICK  : HTML/미리보기 DOM을 한글 표준 OWPML(.hwpx) 파일로 조판 및 변환 사출
// 🛡️ @GUARD : KS X 6101 OWPML 표준 엄격 준수 — <hp:pic> 이미지/다이어그램 임베딩, BinData STORE 패키징, 헤딩/표/코드블록 무결성 보장
// 🚨 @PATCH : **2026-10-01** — [한글 HWPX 이미지 렌더링 무결성 보강]: KS X 6101 OWPML 스키마 XSD 시퀀스에 맞춰 <hp:pic> 자식 태그 순서(hp:sz, hp:pos, hp:outMargin 선행 ➔ hp:imgRect, hp:imgDim, hc:img 후행)를 정규화하여 한컴오피스 뷰어 및 한글 프로그램에서 이미지가 완벽히 보이도록 보정
// 🚨 @PATCH : **2026-10-01** — [한글 HWPX 이미지 및 Mermaid 다이어그램 임베딩·조판 강화]: OWPML 정규 <hp:pic> + <hc:img> 바이너리 적재, <hh:binDataList> 헤더 연동, 헤딩 코발트 바 & 다크 코드블록 조판 보강
// 🚨 @PATCH : **2026-10-01** — [한글 프로그램 크래시(Crash) 8대 근본 원인 완전 해결]:
//             1. 필수 루트 패키지 version.xml, settings.xml, META-INF/container.rdf, Preview/PrvText.txt 완비
//             2. container.xml 네임스페이스 및 media-type (application/hwpml-package+xml) 정규화
//             3. content.hpf 정규 manifest/spine 경로 매핑
//             4. KS X 6101 표준 템플릿 기반 Contents/header.xml 완비 (hh:refList 하위 정규 스키마 충족)
//             5. 첫 문단 내 필수 A4 용지설정(hp:secPr, hp:pagePr), hp:colPr, hp:linesegarray 주입
//             6. 표(hp:tbl) 구조에서 hp:ctrl 불필요 래핑 제거 및 hp:run > hp:tbl 직결
//             7. 표 셀(hp:tc) 속성 오류 교정: colAddr, rowAddr, colSpan, rowSpan을 hp:tc 속성이 아닌 정규 자식 요소(hp:cellAddr, hp:cellSpan, hp:cellSz, hp:cellMargin)로 완전 분리
//             8. 모든 문단(hp:p)에 merged="0" 및 고유 증분 id 부여
// 🔗 @CALLS : JSZip, BASE_HEADER_XML (hwpxHeaderTemplate.ts), ExtractedImage (exportMediaHelper.ts)
// ====================================================================

import JSZip from 'jszip';
import { BASE_HEADER_XML } from './hwpxHeaderTemplate';
import { ExtractedImage } from './exportMediaHelper';

function escapeXml(text: string): string {
  return (text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export interface HwpxOptions {
  title?: string;
  creator?: string;
  images?: ExtractedImage[];
}

/**
 * 미리보기 DOM 요소를 한글 OWPML(.hwpx) 표준 규격 파일로 생성하여 Blob 반환
 */
export async function generateHwpx(containerEl: HTMLElement, options: HwpxOptions = {}): Promise<Blob> {
  const docTitle = options.title || '문서';
  const images = options.images || [];
  const zip = new JSZip();

  // 1. mimetype (OWPML 규격: 압축 없이 STORE 모드로 패키징)
  zip.file('mimetype', 'application/hwp+zip', { compression: 'STORE' });

  // 2. version.xml (한컴오피스가 가장 먼저 판독하는 핵심 버전 파일)
  zip.file(
    'version.xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?><hv:HCFVersion xmlns:hv="http://www.hancom.co.kr/hwpml/2011/version" tagetApplication="WORDPROCESSOR" major="5" minor="1" micro="1" buildNumber="0" os="1" xmlVersion="1.5" application="Hancom Office Hangul" appVersion="13, 0, 0, 1408 WIN32LEWindows_10"/>'
  );

  // 3. settings.xml (커서 위치 및 환경 설정)
  zip.file(
    'settings.xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?><ha:HWPApplicationSetting xmlns:ha="http://www.hancom.co.kr/hwpml/2011/app" xmlns:config="urn:oasis:names:tc:opendocument:xmlns:config:1.0"><ha:CaretPosition listIDRef="0" paraIDRef="0" pos="16"/></ha:HWPApplicationSetting>'
  );

  // 4. META-INF/container.xml
  zip.file(
    'META-INF/container.xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?><ocf:container xmlns:ocf="urn:oasis:names:tc:opendocument:xmlns:container" xmlns:hpf="http://www.hancom.co.kr/schema/2011/hpf"><ocf:rootfiles><ocf:rootfile full-path="Contents/content.hpf" media-type="application/hwpml-package+xml"/><ocf:rootfile full-path="Preview/PrvText.txt" media-type="text/plain"/><ocf:rootfile full-path="META-INF/container.rdf" media-type="application/rdf+xml"/></ocf:rootfiles></ocf:container>'
  );

  // 5. META-INF/manifest.xml
  zip.file(
    'META-INF/manifest.xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?><odf:manifest xmlns:odf="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0"/>'
  );

  // 6. META-INF/container.rdf
  zip.file(
    'META-INF/container.rdf',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about=""><ns0:hasPart xmlns:ns0="http://www.hancom.co.kr/hwpml/2016/meta/pkg#" rdf:resource="Contents/header.xml"/></rdf:Description><rdf:Description rdf:about="Contents/header.xml"><rdf:type rdf:resource="http://www.hancom.co.kr/hwpml/2016/meta/pkg#HeaderFile"/></rdf:Description><rdf:Description rdf:about=""><ns0:hasPart xmlns:ns0="http://www.hancom.co.kr/hwpml/2016/meta/pkg#" rdf:resource="Contents/section0.xml"/></rdf:Description><rdf:Description rdf:about="Contents/section0.xml"><rdf:type rdf:resource="http://www.hancom.co.kr/hwpml/2016/meta/pkg#SectionFile"/></rdf:Description><rdf:Description rdf:about=""><rdf:type rdf:resource="http://www.hancom.co.kr/hwpml/2016/meta/pkg#Document"/></rdf:Description></rdf:RDF>'
  );

  // 7. Contents/content.hpf (매니페스트에 이미지 리소스 등록)
  let manifestItems = `
    <opf:item id="header" href="Contents/header.xml" media-type="application/xml"/>
    <opf:item id="section0" href="Contents/section0.xml" media-type="application/xml"/>
    <opf:item id="settings" href="settings.xml" media-type="application/xml"/>
  `;

  images.forEach((img) => {
    manifestItems += `<opf:item id="BIN${img.id}" href="BinData/BIN${img.id}.png" media-type="image/png" isEmbeded="1"/>\n`;
    // 한컴오피스는 BinData 바이너리를 STORE(무압축)로 읽는 것을 가장 신뢰함
    zip.file(`BinData/BIN${img.id}.png`, img.buffer, { compression: 'STORE' });
  });

  zip.file(
    'Contents/content.hpf',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes" ?><opf:package xmlns:opf="http://www.idpf.org/2007/opf/" version="2.0" unique-identifier="BookId"><opf:metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><opf:title>${escapeXml(docTitle)}</opf:title><opf:language>ko</opf:language><opf:meta name="creator" content="text">Onrivi Author</opf:meta></opf:metadata><opf:manifest>${manifestItems}</opf:manifest><opf:spine><opf:itemref idref="header" linear="yes"/><opf:itemref idref="section0" linear="yes"/></opf:spine></opf:package>`
  );

  // 8. Contents/header.xml (binDataList 주입)
  let headerXml = BASE_HEADER_XML;
  if (images.length > 0) {
    const binListXml = `
      <hh:binDataList itemCnt="${images.length}">
        ${images.map((img) => `<hh:binItem id="${img.id}" Type="Embedding" BinData="BIN${img.id}.png" Format="png"/>`).join('')}
      </hh:binDataList>
    `;
    headerXml = headerXml.replace('</hh:refList>', `${binListXml}</hh:refList>`);
  }
  zip.file('Contents/header.xml', headerXml);

  // 9. Contents/section0.xml 본문 빌드
  const { sectionXml, plainText } = buildSectionXml(containerEl, images);
  zip.file('Contents/section0.xml', sectionXml);

  // 10. Preview/PrvText.txt (한컴 뷰어/검색용 텍스트 프리뷰)
  zip.file('Preview/PrvText.txt', plainText || `${docTitle}\n`);

  return await zip.generateAsync({ type: 'blob', mimeType: 'application/hwp+zip' });
}

/**
 * HTML DOM 구조를 순회하여 한글 OWPML 본문 section0.xml 및 평문 텍스트 생성
 */
function buildSectionXml(containerEl: HTMLElement, images: ExtractedImage[]): { sectionXml: string; plainText: string } {
  const pListXml: string[] = [];
  const textLines: string[] = [];
  let pCounter = 0;
  let tblCounter = 10;
  let picCounter = 10;

  const imageMap = new Map<number, ExtractedImage>(images.map((img) => [img.id, img]));

  // 🌟 [핵심 안정성 가드] 첫 번째 문단에 반드시 필요한 A4 용지설정(secPr) 및 colPr, linesegarray 주입
  // A4 크기: 59528 x 84186 (1/7200 inch 단위 = 210mm x 297mm)
  // 좌우여백 8504 (30mm), 상하여백 5668/4252 (20mm/15mm)
  pListXml.push(`
  <hp:p id="${pCounter++}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="0">
      <hp:secPr id="" textDirection="HORIZONTAL" spaceColumns="1134" tabStop="8000" tabStopVal="4000" tabStopUnit="HWPUNIT" outlineShapeIDRef="1" memoShapeIDRef="0" textVerticalWidthHead="0" masterPageCnt="0">
        <hp:grid lineGrid="0" charGrid="0" wonggojiFormat="0"/>
        <hp:startNum pageStartsOn="BOTH" page="0" pic="0" tbl="0" equation="0"/>
        <hp:visibility hideFirstHeader="0" hideFirstFooter="0" hideFirstMasterPage="0" border="SHOW_ALL" fill="SHOW_ALL" hideFirstPageNum="0" hideFirstEmptyLine="0" showLineNumber="0"/>
        <hp:lineNumberShape restartType="0" countBy="0" distance="0" startNumber="0"/>
        <hp:pagePr landscape="WIDELY" width="59528" height="84186" gutterType="LEFT_ONLY">
          <hp:margin header="4252" footer="4252" gutter="0" left="8504" right="8504" top="5668" bottom="4252"/>
        </hp:pagePr>
        <hp:footNotePr>
          <hp:autoNumFormat type="DIGIT" userChar="" prefixChar="" suffixChar=")" supscript="0"/>
          <hp:noteLine length="-1" type="SOLID" width="0.12 mm" color="#000000"/>
          <hp:noteSpacing betweenNotes="283" belowLine="567" aboveLine="850"/>
          <hp:numbering type="CONTINUOUS" newNum="1"/>
          <hp:placement place="EACH_COLUMN" beneathText="0"/>
        </hp:footNotePr>
        <hp:endNotePr>
          <hp:autoNumFormat type="DIGIT" userChar="" prefixChar="" suffixChar=")" supscript="0"/>
          <hp:noteLine length="14692344" type="SOLID" width="0.12 mm" color="#000000"/>
          <hp:noteSpacing betweenNotes="0" belowLine="567" aboveLine="850"/>
          <hp:numbering type="CONTINUOUS" newNum="1"/>
          <hp:placement place="END_OF_DOCUMENT" beneathText="0"/>
        </hp:endNotePr>
        <hp:pageBorderFill type="BOTH" borderFillIDRef="1" textBorder="PAPER" headerInside="0" footerInside="0" fillArea="PAPER">
          <hp:offset left="1417" right="1417" top="1417" bottom="1417"/>
        </hp:pageBorderFill>
        <hp:pageBorderFill type="EVEN" borderFillIDRef="1" textBorder="PAPER" headerInside="0" footerInside="0" fillArea="PAPER">
          <hp:offset left="1417" right="1417" top="1417" bottom="1417"/>
        </hp:pageBorderFill>
        <hp:pageBorderFill type="ODD" borderFillIDRef="1" textBorder="PAPER" headerInside="0" footerInside="0" fillArea="PAPER">
          <hp:offset left="1417" right="1417" top="1417" bottom="1417"/>
        </hp:pageBorderFill>
      </hp:secPr>
      <hp:ctrl>
        <hp:colPr id="" type="NEWSPAPER" layout="LEFT" colCount="1" sameSz="1" sameGap="0"/>
      </hp:ctrl>
    </hp:run>
    <hp:run charPrIDRef="0"><hp:t/></hp:run>
    <hp:linesegarray>
      <hp:lineseg textpos="0" vertpos="0" vertsize="1000" textheight="1000" baseline="850" spacing="600" horzpos="0" horzsize="42520" flags="393216"/>
    </hp:linesegarray>
  </hp:p>`);

  // 인라인 노드들을 <hp:run> 조각들로 분할 변환
  function parseInlines(element: Node, baseCharPrId: number = 0): string {
    let result = '';

    element.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        if (text) {
          result += `<hp:run charPrIDRef="${baseCharPrId}"><hp:t>${escapeXml(text)}</hp:t></hp:run>`;
        }
        return;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tag = el.tagName.toLowerCase();

        let charPrId = baseCharPrId;
        const isBold = tag === 'strong' || tag === 'b' || el.style.fontWeight === 'bold' || parseInt(el.style.fontWeight) >= 600;
        const isItalic = tag === 'em' || tag === 'i' || el.style.fontStyle === 'italic';
        const isCode = tag === 'code';
        const isLink = tag === 'a';

        if (isLink) charPrId = 13; // 파란색 밑줄
        else if (isCode) charPrId = 12; // 인라인 코드
        else if (isBold) charPrId = 10; // 볼드체
        else if (isItalic) charPrId = 11; // 이탤릭체

        if (tag === 'br') {
          result += `<hp:run charPrIDRef="${charPrId}"><hp:linesegarray><hp:lineseg/></hp:linesegarray></hp:run>`;
          return;
        }

        result += parseInlines(el, charPrId);
      }
    });

    return result;
  }

  // 블록 요소를 순회하며 OWPML 단락, 표, 이미지 배치
  function processBlockNode(node: Node) {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    // 불필요한 위젯, 스크립트, 병합된 캡션 p 태그 제외
    if (
      tag === 'script' ||
      tag === 'style' ||
      el.classList.contains('no-export') ||
      el.classList.contains('preview-toolbar-root') ||
      el.getAttribute('data-export-caption-merged') === 'true'
    ) {
      return;
    }

    // 🌟 [핵심] 이미지 또는 Mermaid 다이어그램 개체 렌더링 (<hp:pic>)
    const targetImgEl = el.hasAttribute('data-export-img-id') ? el : el.querySelector('[data-export-img-id]');
    if (targetImgEl && (el.hasAttribute('data-export-img-id') || tag === 'figure' || tag === 'img' || el.classList.contains('mermaid-svg-container') || el.classList.contains('mermaid-block-container') || el.classList.contains('onrivi-image-wrapper'))) {
      const imgIdStr = targetImgEl.getAttribute('data-export-img-id');
      const imgId = parseInt(imgIdStr || '0', 10);
      const imgData = imageMap.get(imgId);

      if (imgData) {
        const caption = targetImgEl.getAttribute('data-export-caption') || imgData.caption || '';
        // A4 본문 기본 너비: 42520 HWP단위 (150mm), 1px = 75 HWP단위
        const maxW_hwp = 42520;
        const origW_hwp = Math.max(100, imgData.width) * 75;
        const origH_hwp = Math.max(100, imgData.height) * 75;
        const scale = Math.min(1, maxW_hwp / origW_hwp);
        const w_hwp = Math.round(origW_hwp * scale);
        const h_hwp = Math.round(origH_hwp * scale);
        const w_px = Math.round(w_hwp / 75);
        const h_px = Math.round(h_hwp / 75);

        const currentPicId = picCounter++;

        pListXml.push(`
          <hp:p id="${pCounter++}" paraPrIDRef="11" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
            <hp:run charPrIDRef="0">
              <hp:pic id="${currentPicId}" zOrder="0" numberingType="PICTURE" textWrap="TOP_AND_BOTTOM" textFlow="BOTH_SIDES" lock="0" dropcapstyle="None">
                <hp:offset x="0" y="0"/>
                <hp:orgSz width="${w_hwp}" height="${h_hwp}"/>
                <hp:curSz width="${w_hwp}" height="${h_hwp}"/>
                <hp:flip x="0" y="0"/>
                <hp:rotationInfo angle="0" centerX="${Math.round(w_hwp / 2)}" centerY="${Math.round(h_hwp / 2)}"/>
                <hp:renderingInfo>
                  <hc:transMatrix e1="1" e2="0" e3="0" e4="0" e5="1" e6="0"/>
                  <hc:scaMatrix e1="1" e2="0" e3="0" e4="1"/>
                  <hc:rotMatrix e1="1" e2="0" e3="0" e4="1"/>
                </hp:renderingInfo>
                <hp:sz width="${w_hwp}" widthRelTo="ABSOLUTE" height="${h_hwp}" heightRelTo="ABSOLUTE" protect="0"/>
                <hp:pos treatAsChar="1" affectLSpacing="0" flowWithText="1" allowOverlap="0" holdAnchorAndSO="0" vertRelTo="PARA" horzRelTo="COLUMN" vertAlign="TOP" horzAlign="CENTER" vertOffset="0" horzOffset="0"/>
                <hp:outMargin left="0" right="0" top="0" bottom="0"/>
                <hp:imgRect pt0X="0" pt0Y="0" pt1X="${w_hwp}" pt1Y="0" pt2X="${w_hwp}" pt2Y="${h_hwp}" pt3X="0" pt3Y="${h_hwp}"/>
                <hp:imgClip left="0" right="${w_hwp}" top="0" bottom="${h_hwp}"/>
                <hp:inMargin left="0" right="0" top="0" bottom="0"/>
                <hp:imgDim dimwidth="${w_px}" dimheight="${h_px}"/>
                <hc:img binaryItemIDRef="BIN${imgId}"/>
              </hp:pic>
            </hp:run>
          </hp:p>
        `);

        if (caption) {
          textLines.push(caption);
          pListXml.push(`
            <hp:p id="${pCounter++}" paraPrIDRef="11" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
              <hp:run charPrIDRef="11"><hp:t>${escapeXml(caption)}</hp:t></hp:run>
            </hp:p>
          `);
        }
        return;
      }
    }

    // 1. 헤딩 (H1 ~ H6) — 원본 스타일을 반영한 코발트 블루 및 바(|) 조판
    if (/^h[1-6]$/.test(tag)) {
      const level = parseInt(tag.substring(1), 10);
      let charPrId = 14; // H1
      if (level === 2) charPrId = 15;
      else if (level === 3) charPrId = 16;
      else if (level >= 4) charPrId = 17;

      const inlines = parseInlines(el, charPrId);
      textLines.push(el.textContent || '');

      // 원본의 좌측 코발트 세로바(|) 느낌을 HWPX에도 적용
      const accentPrefix = level <= 2 ? `<hp:run charPrIDRef="14"><hp:t>| </hp:t></hp:run>` : '';

      pListXml.push(`
        <hp:p id="${pCounter++}" paraPrIDRef="0" styleIDRef="${level}" pageBreak="0" columnBreak="0" merged="0">
          ${accentPrefix}
          ${inlines}
        </hp:p>
      `);
      return;
    }

    // 2. 단락 (P)
    if (tag === 'p') {
      const inlines = parseInlines(el, 0);
      const text = el.textContent || '';
      if (text.trim()) {
        textLines.push(text);
        pListXml.push(`
          <hp:p id="${pCounter++}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
            ${inlines}
          </hp:p>
        `);
      }
      return;
    }

    // 3. 인용구 (BLOCKQUOTE)
    if (tag === 'blockquote') {
      const pElements = el.querySelectorAll('p');
      if (pElements.length > 0) {
        pElements.forEach((p) => {
          const inlines = parseInlines(p, 11);
          textLines.push(p.textContent || '');
          pListXml.push(`
            <hp:p id="${pCounter++}" paraPrIDRef="1" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
              <hp:run charPrIDRef="14"><hp:t>▎ </hp:t></hp:run>
              ${inlines}
            </hp:p>
          `);
        });
      } else {
        const inlines = parseInlines(el, 11);
        textLines.push(el.textContent || '');
        pListXml.push(`
          <hp:p id="${pCounter++}" paraPrIDRef="1" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
            <hp:run charPrIDRef="14"><hp:t>▎ </hp:t></hp:run>
            ${inlines}
          </hp:p>
        `);
      }
      return;
    }

    // 4. 리스트 (UL / OL)
    if (tag === 'ul' || tag === 'ol') {
      const isOrdered = tag === 'ol';
      const items = Array.from(el.children).filter((c) => c.tagName.toLowerCase() === 'li');
      items.forEach((item, idx) => {
        const prefix = isOrdered ? `${idx + 1}. ` : `• `;
        const inlines = parseInlines(item, 0);
        textLines.push(`${prefix}${item.textContent || ''}`);
        pListXml.push(`
          <hp:p id="${pCounter++}" paraPrIDRef="1" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
            <hp:run charPrIDRef="10"><hp:t>${prefix}</hp:t></hp:run>
            ${inlines}
          </hp:p>
        `);
      });
      return;
    }

    // 5. 코드 블록 (PRE) — 상단 배지 라인 및 다크 모노스페이스 단락 조판
    if (tag === 'pre') {
      const codeEl = el.querySelector('code') || el;
      const text = codeEl.textContent || '';
      const lines = text.split('\n');

      let langBadge = 'TEXT';
      const classAttr = (codeEl.className || el.className || '');
      const langMatch = classAttr.match(/language-([a-zA-Z0-9_-]+)/);
      if (langMatch && langMatch[1]) {
        langBadge = langMatch[1].toUpperCase();
      }

      // 배지 헤더 줄
      pListXml.push(`
        <hp:p id="${pCounter++}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
          <hp:run charPrIDRef="10"><hp:t>[${langBadge}]</hp:t></hp:run>
        </hp:p>
      `);

      lines.forEach((line) => {
        textLines.push(line);
        pListXml.push(`
          <hp:p id="${pCounter++}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
            <hp:run charPrIDRef="12"><hp:t>${escapeXml(line)}</hp:t></hp:run>
          </hp:p>
        `);
      });
      return;
    }

    // 6. 구분선 (HR)
    if (tag === 'hr') {
      pListXml.push(`
        <hp:p id="${pCounter++}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
          <hp:run charPrIDRef="0"><hp:t>────────────────────────────────────────────</hp:t></hp:run>
        </hp:p>
      `);
      return;
    }

    // 7. 표 (TABLE) — 🌟 [OWPML KS X 6101 정규 표준 표 구조]
    if (tag === 'table') {
      const trs = Array.from(el.querySelectorAll('tr'));
      if (trs.length === 0) return;

      const rowCnt = trs.length;
      let colCnt = 1;
      trs.forEach((tr) => {
        const cnt = tr.children.length;
        if (cnt > colCnt) colCnt = cnt;
      });

      // A4 본문 기본 너비: 42520 HWP단위 (150mm)
      const totalWidth = 42520;
      const colWidth = Math.floor(totalWidth / colCnt);
      const rowHeight = 400; // 약 1.4mm 기본단위

      let tblRowsXml = '';

      trs.forEach((tr, rIdx) => {
        tblRowsXml += `<hp:tr>`;
        const cells = Array.from(tr.children).filter((c) => {
          const t = c.tagName.toLowerCase();
          return t === 'th' || t === 'td';
        });

        cells.forEach((cell, cIdx) => {
          const isTh = cell.tagName.toLowerCase() === 'th';
          const inlines = parseInlines(cell, isTh ? 17 : 0);
          textLines.push(cell.textContent || '');

          tblRowsXml += `
            <hp:tc name="" header="${isTh ? 1 : 0}" hasMargin="0" protect="0" editable="0" dirty="0" borderFillIDRef="2">
              <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
                <hp:p paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${pCounter++}">
                  ${inlines}
                </hp:p>
              </hp:subList>
              <hp:cellAddr colAddr="${cIdx}" rowAddr="${rIdx}"/>
              <hp:cellSpan colSpan="1" rowSpan="1"/>
              <hp:cellSz width="${colWidth}" height="${rowHeight}"/>
              <hp:cellMargin left="510" right="510" top="141" bottom="141"/>
            </hp:tc>
          `;
        });
        tblRowsXml += `</hp:tr>`;
      });

      const currentTblId = tblCounter++;
      const tblContainerXml = `
        <hp:p id="${pCounter++}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
          <hp:run charPrIDRef="0">
            <hp:tbl id="${currentTblId}" zOrder="0" numberingType="TABLE" textWrap="TOP_AND_BOTTOM" textFlow="BOTH_SIDES" lock="0" dropcapstyle="None" pageBreak="CELL" repeatHeader="0" rowCnt="${rowCnt}" colCnt="${colCnt}" cellSpacing="0" borderFillIDRef="2" noAdjust="0">
              <hp:sz width="${totalWidth}" widthRelTo="ABSOLUTE" height="${rowHeight * rowCnt}" heightRelTo="ABSOLUTE" protect="0"/>
              <hp:pos treatAsChar="1" affectLSpacing="0" flowWithText="1" allowOverlap="0" holdAnchorAndSO="0" vertRelTo="PARA" horzRelTo="COLUMN" vertAlign="TOP" horzAlign="LEFT" vertOffset="0" horzOffset="0"/>
              <hp:outMargin left="0" right="0" top="0" bottom="0"/>
              <hp:inMargin left="510" right="510" top="141" bottom="141"/>
              ${tblRowsXml}
            </hp:tbl>
          </hp:run>
        </hp:p>
      `;

      pListXml.push(tblContainerXml);
      return;
    }

    // 8. 일반 래퍼 컨테이너: 재귀 처리
    Array.from(el.childNodes).forEach(processBlockNode);
  }

  Array.from(containerEl.childNodes).forEach(processBlockNode);

  const sectionXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<hs:sec xmlns:ha="http://www.hancom.co.kr/hwpml/2011/app"
        xmlns:hp="http://www.hancom.co.kr/hwpml/2011/paragraph"
        xmlns:hp10="http://www.hancom.co.kr/hwpml/2016/paragraph"
        xmlns:hs="http://www.hancom.co.kr/hwpml/2011/section"
        xmlns:hc="http://www.hancom.co.kr/hwpml/2011/core"
        xmlns:hh="http://www.hancom.co.kr/hwpml/2011/head"
        xmlns:hhs="http://www.hancom.co.kr/hwpml/2011/history"
        xmlns:hm="http://www.hancom.co.kr/hwpml/2011/master-page"
        xmlns:hpf="http://www.hancom.co.kr/schema/2011/hpf"
        xmlns:dc="http://purl.org/dc/elements/1.1/"
        xmlns:opf="http://www.idpf.org/2007/opf/"
        xmlns:ooxmlchart="http://www.hancom.co.kr/hwpml/2016/ooxmlchart"
        xmlns:hwpunitchar="http://www.hancom.co.kr/hwpml/2016/HwpUnitChar"
        xmlns:epub="http://www.idpf.org/2007/ops"
        xmlns:config="urn:oasis:names:tc:opendocument:xmlns:config:1.0">
  ${pListXml.join('\n')}
</hs:sec>`;

  return { sectionXml, plainText: textLines.join('\n') };
}
