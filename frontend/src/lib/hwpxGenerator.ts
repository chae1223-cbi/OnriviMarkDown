// ====================================================================
// 📊 [OMD-IO-hwpxGenerator-0001] hwpxGenerator.ts ➔ generateHwpx
// 🎯 @KICK  : HTML/미리보기 DOM을 한글 표준 OWPML(.hwpx) 파일로 조판 및 변환 사출
// 🛡️ @GUARD : KS X 6101 OWPML 표준 엄격 준수 — version.xml, settings.xml, container.rdf, canonical header.xml, cellAddr/cellSpan 분리 자식 노드로 한글 C++ 레이아웃 엔진 crash 원천 차단
// 🚨 @PATCH : **2026-10-01** — [한글 프로그램 크래시(Crash) 8대 근본 원인 완전 해결]:
//             1. 필수 루트 패키지 version.xml, settings.xml, META-INF/container.rdf, Preview/PrvText.txt 완비
//             2. container.xml 네임스페이스 및 media-type (application/hwpml-package+xml) 정규화
//             3. content.hpf 정규 manifest/spine 경로 매핑
//             4. KS X 6101 표준 템플릿 기반 Contents/header.xml 완비 (hh:refList 하위 정규 스키마 충족)
//             5. 첫 문단 내 필수 A4 용지설정(hp:secPr, hp:pagePr), hp:colPr, hp:linesegarray 주입
//             6. 표(hp:tbl) 구조에서 hp:ctrl 불필요 래핑 제거 및 hp:run > hp:tbl 직결
//             7. 표 셀(hp:tc) 속성 오류 교정: colAddr, rowAddr, colSpan, rowSpan을 hp:tc 속성이 아닌 정규 자식 요소(hp:cellAddr, hp:cellSpan, hp:cellSz, hp:cellMargin)로 완전 분리
//             8. 모든 문단(hp:p)에 merged="0" 및 고유 증분 id 부여
// 🔗 @CALLS : JSZip, BASE_HEADER_XML (hwpxHeaderTemplate.ts)
// ====================================================================

import JSZip from 'jszip';
import { BASE_HEADER_XML } from './hwpxHeaderTemplate';

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
}

/**
 * 미리보기 DOM 요소를 한글 OWPML(.hwpx) 표준 규격 파일로 생성하여 Blob 반환
 */
export async function generateHwpx(containerEl: HTMLElement, options: HwpxOptions = {}): Promise<Blob> {
  const docTitle = options.title || '문서';
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

  // 7. Contents/content.hpf
  zip.file(
    'Contents/content.hpf',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes" ?><opf:package xmlns:opf="http://www.idpf.org/2007/opf/" version="2.0" unique-identifier="BookId"><opf:metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><opf:title>${escapeXml(docTitle)}</opf:title><opf:language>ko</opf:language><opf:meta name="creator" content="text">Onrivi Author</opf:meta></opf:metadata><opf:manifest><opf:item id="header" href="Contents/header.xml" media-type="application/xml"/><opf:item id="section0" href="Contents/section0.xml" media-type="application/xml"/><opf:item id="settings" href="settings.xml" media-type="application/xml"/></opf:manifest><opf:spine><opf:itemref idref="header" linear="yes"/><opf:itemref idref="section0" linear="yes"/></opf:spine></opf:package>`
  );

  // 8. Contents/header.xml (한컴 표준 헤더 템플릿 사용)
  zip.file('Contents/header.xml', BASE_HEADER_XML);

  // 9. Contents/section0.xml 본문 빌드
  const { sectionXml, plainText } = buildSectionXml(containerEl);
  zip.file('Contents/section0.xml', sectionXml);

  // 10. Preview/PrvText.txt (한컴 뷰어/검색용 텍스트 프리뷰)
  zip.file('Preview/PrvText.txt', plainText || `${docTitle}\n`);

  return await zip.generateAsync({ type: 'blob', mimeType: 'application/hwp+zip' });
}

/**
 * HTML DOM 구조를 순회하여 한글 OWPML 본문 section0.xml 및 평문 텍스트 생성
 */
function buildSectionXml(containerEl: HTMLElement): { sectionXml: string; plainText: string } {
  const pListXml: string[] = [];
  const textLines: string[] = [];
  let pCounter = 0;
  let tblCounter = 10;

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
  function parseInlines(element: Node, defaultCharPr = 0): string {
    let result = '';

    element.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        if (text) {
          result += `<hp:run charPrIDRef="${defaultCharPr}"><hp:t>${escapeXml(text)}</hp:t></hp:run>`;
        }
        return;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tag = el.tagName.toLowerCase();

        let charPrId = defaultCharPr;
        if (tag === 'strong' || tag === 'b') charPrId = 10;
        else if (tag === 'em' || tag === 'i') charPrId = 11;
        else if (tag === 'code') charPrId = 12;
        else if (tag === 'a') charPrId = 13;

        if (tag === 'br') {
          result += `<hp:run charPrIDRef="${defaultCharPr}"><hp:t>&#10;</hp:t></hp:run>`;
          return;
        }

        result += parseInlines(el, charPrId);
      }
    });

    return result;
  }

  // 블록 요소들을 순회하며 한글 문단(<hp:p>) 및 표(<hp:tbl>) 생성
  function processBlockNode(node: Node) {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    if (tag === 'script' || tag === 'style' || el.classList.contains('no-export') || el.classList.contains('preview-toolbar-root')) {
      return;
    }

    // 1. 헤딩 (H1 ~ H6)
    if (/^h[1-6]$/.test(tag)) {
      const level = parseInt(tag.substring(1), 10);
      let charPrId = 14;
      let paraPrId = 2;
      let styleId = 2;

      if (level === 2) { charPrId = 15; paraPrId = 3; styleId = 3; }
      else if (level === 3) { charPrId = 16; paraPrId = 4; styleId = 4; }
      else if (level >= 4) { charPrId = 16; paraPrId = 5; styleId = 5; }

      const inlines = parseInlines(el, charPrId);
      textLines.push(el.textContent || '');
      pListXml.push(`
        <hp:p id="${pCounter++}" paraPrIDRef="${paraPrId}" styleIDRef="${styleId}" pageBreak="0" columnBreak="0" merged="0">
          ${inlines}
        </hp:p>
      `);
      return;
    }

    // 2. 단락 (P)
    if (tag === 'p') {
      const inlines = parseInlines(el, 0);
      if (inlines.trim()) {
        textLines.push(el.textContent || '');
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
          textLines.push(`| ${p.textContent || ''}`);
          pListXml.push(`
            <hp:p id="${pCounter++}" paraPrIDRef="9" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
              <hp:run charPrIDRef="14"><hp:t>┃ </hp:t></hp:run>
              ${inlines}
            </hp:p>
          `);
        });
      } else {
        const inlines = parseInlines(el, 11);
        textLines.push(`| ${el.textContent || ''}`);
        pListXml.push(`
          <hp:p id="${pCounter++}" paraPrIDRef="9" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
            <hp:run charPrIDRef="14"><hp:t>┃ </hp:t></hp:run>
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

    // 5. 코드 블록 (PRE)
    if (tag === 'pre') {
      const codeEl = el.querySelector('code') || el;
      const text = codeEl.textContent || '';
      const lines = text.split('\n');

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
    // 1) hp:run 직하에 hp:tbl 위치 (hp:ctrl 포장 금지)
    // 2) hp:tc 직하에 hp:subList 위치
    // 3) colAddr, rowAddr, colSpan, rowSpan은 hp:tc 속성이 아닌 hp:cellAddr, hp:cellSpan 하위 요소로 배치
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
