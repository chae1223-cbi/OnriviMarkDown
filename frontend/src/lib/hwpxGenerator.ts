// ====================================================================
// 📊 [OMD-IO-hwpxGenerator-0001] hwpxGenerator.ts ➔ generateHwpx
// 🎯 @KICK  : HTML/미리보기 DOM을 한글 표준 OWPML(.hwpx) 파일로 조판 및 변환 사출
// 🛡️ @GUARD : KS X 6101 OWPML 표준 엄격 준수 — secPr 용지설정, 7대 언어 fontface, ctrl/tbl 글자처럼 취급, 고유 p id 부여로 한글 프로그램 크래시 완전 방어
// 🚨 @PATCH : **2026-09-30** — [한글 프로그램 파서 크래시 완벽 해결]:
//             1. 루트 태그 <hs:sec> 및 OWPML 2011 네임스페이스 정규화
//             2. 첫 문단 내 필수 A4 용지설정(<hp:secPr>, <hp:pagePr>) 주입으로 한글 레이아웃 엔진 널포인터 크래시 방어
//             3. 7대 언어군(hangul, latin, hanja, japanese, other, symbol, user) fontface 및 beginNum, borderFills 완비
//             4. 표(<hp:tbl>)를 <hp:run><hp:ctrl><hp:tbl> 및 <hp:subList> 정규 OWPML 구조로 교정하고 treatAsChar='1' 글자처럼 취급 부여
//             5. 모든 문단(<hp:p>)에 고유 증분 id 부여
// 🔗 @CALLS : JSZip, downloadBlob
// ====================================================================

import JSZip from 'jszip';

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
  const docTitle = options.title || 'document';
  const zip = new JSZip();

  // 1. mimetype (OWPML 규격: 압축 없이 STORE 모드로 패키징)
  zip.file('mimetype', 'application/hwp+zip', { compression: 'STORE' });

  // 2. META-INF/container.xml
  zip.file(
    'META-INF/container.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<ocf:container xmlns:ocf="urn:oasis:names:tc:opendocument:xmlns:container">
  <ocf:rootfiles>
    <ocf:rootfile ocf:full-path="Contents/content.hpf" ocf:media-type="application/hwp+zip"/>
  </ocf:rootfiles>
</ocf:container>`
  );

  // 3. META-INF/manifest.xml
  zip.file(
    'META-INF/manifest.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<odf:manifest xmlns:odf="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0">
  <odf:file-entry odf:full-path="/" odf:media-type="application/hwp+zip"/>
  <odf:file-entry odf:full-path="Contents/content.hpf" odf:media-type="application/hwp+zip"/>
  <odf:file-entry odf:full-path="Contents/header.xml" odf:media-type="application/xml"/>
  <odf:file-entry odf:full-path="Contents/section0.xml" odf:media-type="application/xml"/>
</odf:manifest>`
  );

  // 4. Contents/content.hpf
  zip.file(
    'Contents/content.hpf',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<opf:package xmlns:opf="http://www.idpf.org/2007/opf" version="2.0" unique-identifier="BookId">
  <opf:metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${escapeXml(docTitle)}</dc:title>
    <dc:language>ko</dc:language>
    <dc:creator>Onrivi Author</dc:creator>
  </opf:metadata>
  <opf:manifest>
    <opf:item id="header" href="header.xml" media-type="application/xml"/>
    <opf:item id="section0" href="section0.xml" media-type="application/xml"/>
  </opf:manifest>
  <opf:spine>
    <opf:itemref idref="section0"/>
  </opf:spine>
</opf:package>`
  );

  // 5. Contents/header.xml (7대 언어 글꼴, 글자모양, 문단모양, 테두리, 스타일 정의)
  zip.file(
    'Contents/header.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<hh:head xmlns:hh="http://www.hancom.co.kr/hwpml/2011/head"
         xmlns:hc="http://www.hancom.co.kr/hwpml/2011/core"
         xmlns:hp="http://www.hancom.co.kr/hwpml/2011/paragraph"
         version="1.0">
  <hh:beginNum page="1" footnote="1" endnote="1" pic="1" tbl="1" equation="1"/>

  <hh:fontfaces itemCnt="7">
    <hh:fontface lang="hangul" fontCnt="1"><hh:font id="0" face="맑은 고딕" type="ttf"/></hh:fontface>
    <hh:fontface lang="latin" fontCnt="1"><hh:font id="0" face="맑은 고딕" type="ttf"/></hh:fontface>
    <hh:fontface lang="hanja" fontCnt="1"><hh:font id="0" face="맑은 고딕" type="ttf"/></hh:fontface>
    <hh:fontface lang="japanese" fontCnt="1"><hh:font id="0" face="맑은 고딕" type="ttf"/></hh:fontface>
    <hh:fontface lang="other" fontCnt="1"><hh:font id="0" face="맑은 고딕" type="ttf"/></hh:fontface>
    <hh:fontface lang="symbol" fontCnt="1"><hh:font id="0" face="맑은 고딕" type="ttf"/></hh:fontface>
    <hh:fontface lang="user" fontCnt="1"><hh:font id="0" face="맑은 고딕" type="ttf"/></hh:fontface>
  </hh:fontfaces>

  <!-- 테두리/배경 목록 (borderFills) -->
  <hh:borderFills itemCnt="3">
    <!-- 1: 테두리 없음 -->
    <hh:borderFill id="1" backSlash="none" slash="none" crookedSlash="none">
      <hh:leftBorder type="none" width="0.1 mm" color="#000000"/>
      <hh:rightBorder type="none" width="0.1 mm" color="#000000"/>
      <hh:topBorder type="none" width="0.1 mm" color="#000000"/>
      <hh:bottomBorder type="none" width="0.1 mm" color="#000000"/>
    </hh:borderFill>
    <!-- 2: 표 기본 테두리 (실선 회색) -->
    <hh:borderFill id="2" backSlash="none" slash="none" crookedSlash="none">
      <hh:leftBorder type="solid" width="0.12 mm" color="#CBD5E1"/>
      <hh:rightBorder type="solid" width="0.12 mm" color="#CBD5E1"/>
      <hh:topBorder type="solid" width="0.12 mm" color="#CBD5E1"/>
      <hh:bottomBorder type="solid" width="0.2 mm" color="#94A3B8"/>
      <hh:fillBrush><hh:winBrush faceColor="#FFFFFF"/></hh:fillBrush>
    </hh:borderFill>
    <!-- 3: 표 헤더 테두리 및 음영 -->
    <hh:borderFill id="3" backSlash="none" slash="none" crookedSlash="none">
      <hh:leftBorder type="solid" width="0.12 mm" color="#CBD5E1"/>
      <hh:rightBorder type="solid" width="0.12 mm" color="#CBD5E1"/>
      <hh:topBorder type="solid" width="0.15 mm" color="#94A3B8"/>
      <hh:bottomBorder type="solid" width="0.25 mm" color="#1D4ED8"/>
      <hh:fillBrush><hh:winBrush faceColor="#F8FAFC"/></hh:fillBrush>
    </hh:borderFill>
  </hh:borderFills>

  <!-- 글자 모양 목록 (charPr) -->
  <hh:charProperties itemCnt="10">
    <!-- 0: 기본 본문 (10pt, 검정) -->
    <hh:charPr id="0" height="1000" textColor="#222222" fontFaceId="0"/>
    <!-- 1: H1 제목 (20pt, 코발트 블루 #1D4ED8, 볼드) -->
    <hh:charPr id="1" height="2000" textColor="#1D4ED8" bold="1" fontFaceId="0"/>
    <!-- 2: H2 제목 (16pt, 진한 네이비 #0F172A, 볼드) -->
    <hh:charPr id="2" height="1600" textColor="#0F172A" bold="1" fontFaceId="0"/>
    <!-- 3: H3 제목 (14pt, 슬레이트 #1E293B, 볼드) -->
    <hh:charPr id="3" height="1400" textColor="#1E293B" bold="1" fontFaceId="0"/>
    <!-- 4: H4 제목 (12pt, 슬레이트 #334155, 볼드) -->
    <hh:charPr id="4" height="1200" textColor="#334155" bold="1" fontFaceId="0"/>
    <!-- 5: 볼드 텍스트 -->
    <hh:charPr id="5" height="1000" textColor="#222222" bold="1" fontFaceId="0"/>
    <!-- 6: 이탤릭 텍스트 -->
    <hh:charPr id="6" height="1000" textColor="#475569" italic="1" fontFaceId="0"/>
    <!-- 7: 인라인 코드 (9pt, 마젠타) -->
    <hh:charPr id="7" height="950" textColor="#BE185D" fontFaceId="0"/>
    <!-- 8: 링크 (파랑, 밑줄) -->
    <hh:charPr id="8" height="1000" textColor="#1D4ED8" underline="1" fontFaceId="0"/>
    <!-- 9: 표 헤더 (10pt, 볼드, 진한 텍스트) -->
    <hh:charPr id="9" height="1000" textColor="#0F172A" bold="1" fontFaceId="0"/>
  </hh:charProperties>

  <!-- 문단 모양 목록 (paraPr) -->
  <hh:paraProperties itemCnt="6">
    <!-- 0: 기본 본문 문단 (줄간격 160%, 하단여백) -->
    <hh:paraPr id="0" align="left" lineSpacing="160" lineSpacingType="percent">
      <hh:margin bottom="160"/>
    </hh:paraPr>
    <!-- 1: H1 문단 (상단여백 400, 하단 200) -->
    <hh:paraPr id="1" align="left" lineSpacing="140" lineSpacingType="percent">
      <hh:margin top="400" bottom="200"/>
    </hh:paraPr>
    <!-- 2: H2 문단 (상단여백 300, 하단 150) -->
    <hh:paraPr id="2" align="left" lineSpacing="140" lineSpacingType="percent">
      <hh:margin top="300" bottom="150"/>
    </hh:paraPr>
    <!-- 3: H3/H4 문단 (상단 200, 하단 100) -->
    <hh:paraPr id="3" align="left" lineSpacing="140" lineSpacingType="percent">
      <hh:margin top="200" bottom="100"/>
    </hh:paraPr>
    <!-- 4: 인용구/리스트 문단 (왼쪽 들여쓰기 400) -->
    <hh:paraPr id="4" align="left" lineSpacing="150" lineSpacingType="percent">
      <hh:margin left="400" bottom="140"/>
    </hh:paraPr>
    <!-- 5: 표 셀 문단 (중앙 정렬) -->
    <hh:paraPr id="5" align="center" lineSpacing="130" lineSpacingType="percent">
      <hh:margin top="80" bottom="80"/>
    </hh:paraPr>
  </hh:paraProperties>

  <hh:styles itemCnt="4">
    <hh:style id="0" type="para" name="바탕글" engName="Normal" paraPrIDRef="0" charPrIDRef="0"/>
    <hh:style id="1" type="para" name="개요 1" engName="Heading 1" paraPrIDRef="1" charPrIDRef="1"/>
    <hh:style id="2" type="para" name="개요 2" engName="Heading 2" paraPrIDRef="2" charPrIDRef="2"/>
    <hh:style id="3" type="para" name="개요 3" engName="Heading 3" paraPrIDRef="3" charPrIDRef="3"/>
  </hh:styles>
</hh:head>`
  );

  // 6. Contents/section0.xml 본문 빌드
  const sectionXml = buildSectionXml(containerEl);
  zip.file('Contents/section0.xml', sectionXml);

  return await zip.generateAsync({ type: 'blob', mimeType: 'application/hwp+zip' });
}

/**
 * HTML DOM 구조를 순회하여 한글 OWPML 본문 section0.xml 생성
 */
function buildSectionXml(containerEl: HTMLElement): string {
  const pListXml: string[] = [];
  let pCounter = 0;
  let tblCounter = 1;

  // 🌟 [핵심 안정성 가드] 첫 번째 문단에 반드시 필요한 A4 용지설정(secPr) 주입
  // A4 크기: 59528 x 84188 (1/7200 inch 단위 = 210mm x 297mm)
  // 좌우여백 8504 (30mm), 상하여백 5669/4252 (20mm/15mm)
  pListXml.push(`
  <hp:p id="${pCounter++}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0">
    <hp:run charPrIDRef="0">
      <hp:secPr id="0" textDirection="0" spaceColumns="1134" tabStop="8000" outlineShapeIdRef="1" memoShapeIdRef="1">
        <hp:grid char="0" line="0"/>
        <hp:pagePr width="59528" height="84188" gutterType="leftOnly">
          <hp:margin left="8504" right="8504" top="5669" bottom="4252" header="4252" footer="4252" gutter="0"/>
        </hp:pagePr>
      </hp:secPr>
    </hp:run>
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
        if (tag === 'strong' || tag === 'b') charPrId = 5;
        else if (tag === 'em' || tag === 'i') charPrId = 6;
        else if (tag === 'code') charPrId = 7;
        else if (tag === 'a') charPrId = 8;

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
      let charPrId = 1;
      let paraPrId = 1;
      let styleId = 1;

      if (level === 2) { charPrId = 2; paraPrId = 2; styleId = 2; }
      else if (level === 3) { charPrId = 3; paraPrId = 3; styleId = 3; }
      else if (level >= 4) { charPrId = 4; paraPrId = 3; styleId = 0; }

      const inlines = parseInlines(el, charPrId);
      pListXml.push(`
        <hp:p id="${pCounter++}" paraPrIDRef="${paraPrId}" styleIDRef="${styleId}" pageBreak="0" columnBreak="0">
          ${inlines}
        </hp:p>
      `);
      return;
    }

    // 2. 단락 (P)
    if (tag === 'p') {
      const inlines = parseInlines(el, 0);
      if (inlines.trim()) {
        pListXml.push(`
          <hp:p id="${pCounter++}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0">
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
          const inlines = parseInlines(p, 6);
          pListXml.push(`
            <hp:p id="${pCounter++}" paraPrIDRef="4" styleIDRef="0" pageBreak="0" columnBreak="0">
              <hp:run charPrIDRef="1"><hp:t>┃ </hp:t></hp:run>
              ${inlines}
            </hp:p>
          `);
        });
      } else {
        const inlines = parseInlines(el, 6);
        pListXml.push(`
          <hp:p id="${pCounter++}" paraPrIDRef="4" styleIDRef="0" pageBreak="0" columnBreak="0">
            <hp:run charPrIDRef="1"><hp:t>┃ </hp:t></hp:run>
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
        pListXml.push(`
          <hp:p id="${pCounter++}" paraPrIDRef="4" styleIDRef="0" pageBreak="0" columnBreak="0">
            <hp:run charPrIDRef="5"><hp:t>${prefix}</hp:t></hp:run>
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
        pListXml.push(`
          <hp:p id="${pCounter++}" paraPrIDRef="4" styleIDRef="0" pageBreak="0" columnBreak="0">
            <hp:run charPrIDRef="7"><hp:t>${escapeXml(line)}</hp:t></hp:run>
          </hp:p>
        `);
      });
      return;
    }

    // 6. 구분선 (HR)
    if (tag === 'hr') {
      pListXml.push(`
        <hp:p id="${pCounter++}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0">
          <hp:run charPrIDRef="0"><hp:t>────────────────────────────────────────────</hp:t></hp:run>
        </hp:p>
      `);
      return;
    }

    // 7. 표 (TABLE) — 🌟 [한글 공식 규격: hp:p > hp:run > hp:ctrl > hp:tbl 완벽 포장]
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
      const rowHeight = 850; // 약 3mm

      let tblRowsXml = '';

      trs.forEach((tr, rIdx) => {
        tblRowsXml += `<hp:tr>`;
        const cells = Array.from(tr.children).filter((c) => {
          const t = c.tagName.toLowerCase();
          return t === 'th' || t === 'td';
        });

        cells.forEach((cell, cIdx) => {
          const isTh = cell.tagName.toLowerCase() === 'th';
          const inlines = parseInlines(cell, isTh ? 9 : 0);
          const borderFillId = isTh ? '3' : '2';

          tblRowsXml += `
            <hp:tc colAddr="${cIdx}" rowAddr="${rIdx}" colSpan="1" rowSpan="1">
              <hp:cellSz width="${colWidth}" height="${rowHeight}"/>
              <hp:cellMargin left="283" right="283" top="283" bottom="283"/>
              <hp:subList id="${pCounter++}" textDirection="0" lineWrap="break" vertAlign="center">
                <hp:p id="${pCounter++}" paraPrIDRef="${isTh ? '5' : '0'}" styleIDRef="0" pageBreak="0" columnBreak="0">
                  ${inlines}
                </hp:p>
              </hp:subList>
            </hp:tc>
          `;
        });
        tblRowsXml += `</hp:tr>`;
      });

      const currentTblId = tblCounter++;
      const tblContainerXml = `
        <hp:p id="${pCounter++}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0">
          <hp:run charPrIDRef="0">
            <hp:ctrl>
              <hp:tbl id="${currentTblId}" zOrder="0" numberingType="table" textWrap="topAndBottom" textFlow="bothSides" lock="0" dropcapStyle="None">
                <hp:sz width="${totalWidth}" height="${rowHeight * rowCnt}" widthRelTo="absolute" heightRelTo="absolute"/>
                <hp:pos treatAsChar="1" affectLSpacing="0" flowWithText="1" allowOverlap="0" holdAnchorAndSO="0" vertRelTo="para" horzRelTo="para" vertAlign="top" horzAlign="left" vertOffset="0" horzOffset="0"/>
                <hp:outMargin left="0" right="0" top="283" bottom="283"/>
                <hp:inMargin left="283" right="283" top="283" bottom="283"/>
                ${tblRowsXml}
              </hp:tbl>
            </hp:ctrl>
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

  // 🌟 한글 OWPML 표준 루트 태그: <hs:sec>
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<hs:sec xmlns:hs="http://www.hancom.co.kr/hwpml/2011/section"
        xmlns:hp="http://www.hancom.co.kr/hwpml/2011/paragraph"
        xmlns:hc="http://www.hancom.co.kr/hwpml/2011/core"
        xmlns:hh="http://www.hancom.co.kr/hwpml/2011/head">
  ${pListXml.join('\n')}
</hs:sec>`;
}
