// ====================================================================
// 📊 [OMD-IO-docxGenerator-0001] docxGenerator.ts ➔ generateDocx
// 🎯 @KICK  : HTML/미리보기 DOM을 표준 Office Open XML(.docx) 파일로 조판 및 변환 사출
// 🛡️ @GUARD : JSZip 기반 100% 클라이언트/오프라인 구동, 제목/본문/표/인용구/코드/리스트 정밀 변환
// 🚨 @PATCH : **2026-09-30** — MS Word (.docx) 내보내기 생성기 신규 구현 (구글 Docs 및 Word 완벽 호환)
// 🔗 @CALLS : JSZip, saveAs / downloadBlob
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

export interface DocxOptions {
  title?: string;
  creator?: string;
  defaultFont?: string;
}

/**
 * 미리보기 DOM 요소를 Office Open XML(.docx) 규격 파일로 생성하여 Blob 반환
 */
export async function generateDocx(containerEl: HTMLElement, options: DocxOptions = {}): Promise<Blob> {
  const docTitle = options.title || 'document';
  const defaultFont = options.defaultFont || '맑은 고딕';

  const zip = new JSZip();

  // 1. [Content_Types].xml
  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`
  );

  // 2. _rels/.rels
  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
  );

  // 3. word/_rels/document.xml.rels
  zip.file(
    'word/_rels/document.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`
  );

  // 4. word/styles.xml
  zip.file(
    'word/styles.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="${defaultFont}" w:eastAsia="${defaultFont}" w:hAnsi="${defaultFont}" w:cs="${defaultFont}"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
        <w:lang w:val="ko-KR" w:eastAsia="ko-KR"/>
        <w:color w:val="222222"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:after="160" w:line="276" w:lineRule="auto"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>

  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
  </w:style>

  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:spacing w:before="400" w:after="200" w:line="320" w:lineRule="auto"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="40"/>
      <w:szCs w:val="40"/>
      <w:color w:val="1D4ED8"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:spacing w:before="320" w:after="160" w:line="300" w:lineRule="auto"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="32"/>
      <w:szCs w:val="32"/>
      <w:color w:val="0F172A"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="heading 3"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:spacing w:before="240" w:after="120" w:line="280" w:lineRule="auto"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="28"/>
      <w:szCs w:val="28"/>
      <w:color w:val="1E293B"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="Heading4">
    <w:name w:val="heading 4"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:spacing w:before="200" w:after="100"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="24"/>
      <w:szCs w:val="24"/>
      <w:color w:val="334155"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="Heading5">
    <w:name w:val="heading 5"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:spacing w:before="160" w:after="80"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="22"/>
      <w:szCs w:val="22"/>
      <w:color w:val="475569"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="Heading6">
    <w:name w:val="heading 6"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:spacing w:before="140" w:after="60"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="20"/>
      <w:szCs w:val="20"/>
      <w:color w:val="64748B"/>
    </w:rPr>
  </w:style>
</w:styles>`
  );

  // 5. word/document.xml 본문 빌드
  const documentXml = buildDocumentXml(containerEl, docTitle);
  zip.file('word/document.xml', documentXml);

  return await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}

/**
 * HTML DOM 구조를 순회하여 WordprocessingML 본문 문자열을 생성
 */
function buildDocumentXml(containerEl: HTMLElement, title: string): string {
  const bodyXmls: string[] = [];

  // 인라인 노드들을 <w:r> 런 조각들로 변환
  function parseInlines(element: Node): string {
    let result = '';

    element.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        if (text) {
          result += `<w:r><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`;
        }
        return;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tag = el.tagName.toLowerCase();

        // 텍스트 수집 전 인라인 스타일 확인
        let isBold = tag === 'strong' || tag === 'b' || el.style.fontWeight === 'bold' || parseInt(el.style.fontWeight) >= 600;
        let isItalic = tag === 'em' || tag === 'i' || el.style.fontStyle === 'italic';
        let isStrike = tag === 'del' || tag === 's' || tag === 'strike' || el.style.textDecoration.includes('line-through');
        let isUnderline = tag === 'u' || el.style.textDecoration.includes('underline');
        let isCode = tag === 'code';
        let isLink = tag === 'a';

        if (tag === 'br') {
          result += `<w:r><w:br/></w:r>`;
          return;
        }

        // 재귀적으로 텍스트 수집
        const childInlines = parseInlines(el);

        // 자식 런에 스타일 래핑 적용
        if (isBold || isItalic || isStrike || isUnderline || isCode || isLink) {
          let rPr = '<w:rPr>';
          if (isBold) rPr += '<w:b/>';
          if (isItalic) rPr += '<w:i/>';
          if (isStrike) rPr += '<w:strike/>';
          if (isUnderline || isLink) rPr += '<w:u w:val="single"/>';
          if (isLink) rPr += '<w:color w:val="1D4ED8"/>';
          if (isCode) {
            rPr += '<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>';
            rPr += '<w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/>';
            rPr += '<w:color w:val="BE185D"/>';
          }
          rPr += '</w:rPr>';

          // 단순 텍스트 런 추출하여 rPr 주입
          const replaced = childInlines.replace(/<w:r>/g, `<w:r>${rPr}`).replace(/<w:rPr>.*?<\/w:rPr>/g, (m) => {
            // 중첩 스타일 병합 처리
            return rPr;
          });
          result += replaced;
        } else {
          result += childInlines;
        }
      }
    });

    return result;
  }

  // 블록 요소들을 순회하며 Word 단락 및 표 구성
  function processBlockNode(node: Node) {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    // 불필요한 위젯, 스크립트 제외
    if (tag === 'script' || tag === 'style' || el.classList.contains('no-export') || el.classList.contains('preview-toolbar-root')) {
      return;
    }

    // 1. 헤딩 (H1 ~ H6)
    if (/^h[1-6]$/.test(tag)) {
      const level = tag.substring(1);
      const inlines = parseInlines(el);
      bodyXmls.push(`
        <w:p>
          <w:pPr>
            <w:pStyle w:val="Heading${level}"/>
          </w:pPr>
          ${inlines}
        </w:p>
      `);
      return;
    }

    // 2. 단락 (P)
    if (tag === 'p') {
      const inlines = parseInlines(el);
      if (inlines.trim()) {
        bodyXmls.push(`
          <w:p>
            <w:pPr>
              <w:spacing w:after="160" w:line="276" w:lineRule="auto"/>
            </w:pPr>
            ${inlines}
          </w:p>
        `);
      }
      return;
    }

    // 3. 인용구 (BLOCKQUOTE)
    if (tag === 'blockquote') {
      const pElements = el.querySelectorAll('p');
      if (pElements.length > 0) {
        pElements.forEach((p) => {
          const inlines = parseInlines(p);
          bodyXmls.push(`
            <w:p>
              <w:pPr>
                <w:pBdr>
                  <w:left w:val="single" w:sz="24" w:space="12" w:color="1D4ED8"/>
                </w:pBdr>
                <w:ind w:left="400"/>
                <w:spacing w:after="120"/>
              </w:pPr>
              <w:r><w:rPr><w:color w:val="475569"/><w:i/></w:rPr><w:t xml:space="preserve"> </w:t></w:r>
              ${inlines}
            </w:p>
          `);
        });
      } else {
        const inlines = parseInlines(el);
        bodyXmls.push(`
          <w:p>
            <w:pPr>
              <w:pBdr>
                <w:left w:val="single" w:sz="24" w:space="12" w:color="1D4ED8"/>
              </w:pBdr>
              <w:ind w:left="400"/>
            </w:pPr>
            ${inlines}
          </w:p>
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
        const inlines = parseInlines(item);
        bodyXmls.push(`
          <w:p>
            <w:pPr>
              <w:ind w:left="400" w:hanging="200"/>
              <w:spacing w:after="80"/>
            </w:pPr>
            <w:r>
              <w:rPr><w:b/></w:rPr>
              <w:t xml:space="preserve">${prefix}</w:t>
            </w:r>
            ${inlines}
          </w:p>
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
        bodyXmls.push(`
          <w:p>
            <w:pPr>
              <w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/>
              <w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/>
              <w:ind w:left="200" w:right="200"/>
            </w:pPr>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>
                <w:sz w:val="19"/>
                <w:szCs w:val="19"/>
                <w:color w:val="334155"/>
              </w:rPr>
              <w:t xml:space="preserve">${escapeXml(line)}</w:t>
            </w:r>
          </w:p>
        `);
      });
      // 코드블록 후 여백
      bodyXmls.push(`<w:p><w:pPr><w:spacing w:after="160"/></w:pPr></w:p>`);
      return;
    }

    // 6. 구분선 (HR)
    if (tag === 'hr') {
      bodyXmls.push(`
        <w:p>
          <w:pPr>
            <w:pBdr>
              <w:bottom w:val="single" w:sz="6" w:space="1" w:color="E2E8F0"/>
            </w:pBdr>
            <w:spacing w:before="240" w:after="240"/>
          </w:pPr>
        </w:p>
      `);
      return;
    }

    // 7. 표 (TABLE)
    if (tag === 'table') {
      const trs = Array.from(el.querySelectorAll('tr'));
      if (trs.length === 0) return;

      let tblXml = `
        <w:tbl>
          <w:tblPr>
            <w:tblW w:w="5000" w:type="pct"/>
            <w:tblBorders>
              <w:top w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
              <w:left w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
              <w:bottom w:val="single" w:sz="8" w:space="0" w:color="94A3B8"/>
              <w:right w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
              <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
              <w:insideV w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
            </w:tblBorders>
          </w:tblPr>
      `;

      trs.forEach((tr, rowIdx) => {
        tblXml += `<w:tr>`;
        const cells = Array.from(tr.children).filter((c) => {
          const t = c.tagName.toLowerCase();
          return t === 'th' || t === 'td';
        });

        cells.forEach((cell) => {
          const isTh = cell.tagName.toLowerCase() === 'th';
          const inlines = parseInlines(cell);
          const bgFill = isTh ? 'F8FAFC' : (rowIdx % 2 === 1 ? 'FDFDFD' : 'FFFFFF');

          tblXml += `
            <w:tc>
              <w:tcPr>
                <w:tcMar>
                  <w:top w:w="120" w:type="dxa"/>
                  <w:left w:w="160" w:type="dxa"/>
                  <w:bottom w:w="120" w:type="dxa"/>
                  <w:right w:w="160" w:type="dxa"/>
                </w:tcMar>
                <w:shd w:val="clear" w:color="auto" w:fill="${bgFill}"/>
              </w:tcPr>
              <w:p>
                <w:pPr>
                  <w:spacing w:after="0" w:line="240" w:lineRule="auto"/>
                  ${isTh ? '<w:jc w:val="center"/>' : ''}
                </w:pPr>
                ${isTh ? `<w:r><w:rPr><w:b/><w:color w:val="0F172A"/></w:rPr></w:r>` : ''}
                ${inlines}
              </w:p>
            </w:tc>
          `;
        });
        tblXml += `</w:tr>`;
      });

      tblXml += `</w:tbl>`;
      bodyXmls.push(tblXml);
      bodyXmls.push(`<w:p><w:pPr><w:spacing w:after="160"/></w:pPr></w:p>`);
      return;
    }

    // 8. 일반 래퍼 컨테이너 (DIV, SECTION, ARTICLE 등): 재귀 탐색
    Array.from(el.childNodes).forEach(processBlockNode);
  }

  // 본문 탐색 시작
  Array.from(containerEl.childNodes).forEach(processBlockNode);

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    ${bodyXmls.join('\n')}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;
}

/**
 * 생성된 Blob을 브라우저에 다운로드하는 헬퍼
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
  }, 300);
}
