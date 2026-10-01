// ====================================================================
// 📊 [OMD-IO-docxGenerator-0001] docxGenerator.ts ➔ generateDocx
// 🎯 @KICK  : 미리보기 렌더링 DOM을 표준 Office Open XML(.docx) 파일로 조판 및 변환 사출
// 🛡️ @GUARD : JSZip 기반 100% 클라이언트/오프라인 구동, 미리보기 DOM 1:1 무결성, DrawingML 이미지/다이어그램 임베딩, 헤딩 코발트 바 & 라이트 음영 코드블록 완벽 조판
// 🚨 @PATCH : **2026-10-01** — [Word(.docx) 사출 시 Heading keepNext 및 Caption 네이티브 스타일 매핑]: Heading1~Heading6에 keepNext를 선언하여 페이지 하단 단독 잔존(Orphan heading)을 원천 방지하고, figcaption을 Word 표준 Caption 스타일(<w:pStyle w:val="Caption"/>)로 지정 및 이미지-캡션 간 keepNext 연동을 통해 전문가급 Word 네이티브 조판 실현
// 🚨 @PATCH : **2026-10-01** — [미리보기 DOM 직접 파싱 기반 Word(.docx) 사출 엔진 전면 개편 및 마크다운 태그 누출 완전 해결]: marked AST 대신 이미 서식이 100% 렌더링된 미리보기 DOM을 직접 순회하여 유니코드 불릿(• ) 및 인라인 볼드/인라인 코드 태그(**, `) 누출을 원천 박멸하고, 코드블록 다크 배지([TEXT])를 단일 라이트 음영 카드로 일원화하며, 메타영역(Frontmatter) 제외 및 DrawingML 듀얼 클램프 이미지/Mermaid 완벽 임베딩 실현
// 🚨 @PATCH : **2026-10-01** — [DOCX 파일 오픈 오류 긴급 해결 및 MS Word 완벽 호환]: w:document 루트에 필수 DrawingML(wp, a, pic) 네임스페이스 선언 완비, docProps/core.xml·app.xml 패키징, Relationship Id 정규 순차 번호(rId2~) 매핑 및 wp:docPr/pic:cNvPr 고유 ID 분리로 Word 유효성 검사 에러 완전 차단
// 🚨 @PATCH : **2026-09-30** — MS Word (.docx) 내보내기 생성기 신규 구현 (구글 Docs 및 Word 완벽 호환)
// 🔗 @CALLS : JSZip, ExtractedImage (exportMediaHelper.ts)
// ====================================================================

import JSZip from 'jszip';
import { ExtractedImage } from './exportMediaHelper';

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
  images?: ExtractedImage[];
  markdown?: string;
}

/**
 * 미리보기 DOM 요소를 Office Open XML(.docx) 규격 파일로 생성하여 Blob 반환
 */
export async function generateDocx(containerEl: HTMLElement, options: DocxOptions = {}): Promise<Blob> {
  const docTitle = options.title || 'document';
  const defaultFont = options.defaultFont || '맑은 고딕';
  const images = options.images || [];

  const zip = new JSZip();

  // 1. [Content_Types].xml (이미지 포맷 Default 및 docProps Override 선언 완비)
  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Default Extension="jpeg" ContentType="image/jpeg"/>
  <Default Extension="jpg" ContentType="image/jpeg"/>
  <Default Extension="gif" ContentType="image/gif"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`
  );

  // 2. _rels/.rels
  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`
  );

  // 3. docProps/core.xml & docProps/app.xml (Word 신뢰성 보장)
  zip.file(
    'docProps/core.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${escapeXml(docTitle)}</dc:title>
  <dc:creator>Onrivi Author</dc:creator>
  <cp:lastModifiedBy>Onrivi Author</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:modified>
</cp:coreProperties>`
  );

  zip.file(
    'docProps/app.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Onrivi Author</Application>
  <DocSecurity>0</DocSecurity>
  <ScaleCrop>false</ScaleCrop>
  <Company>Onrivi</Company>
  <LinksUpToDate>false</LinksUpToDate>
  <SharedDoc>false</SharedDoc>
  <HyperlinksChanged>false</HyperlinksChanged>
  <AppVersion>16.0000</AppVersion>
</Properties>`
  );

  // 4. word/_rels/document.xml.rels (스타일 및 이미지 Relationships 등록 - 정규 순차 rId 할당)
  let relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
`;

  // 이미지 ID -> 순차 rId 매핑
  const imageRelIdMap = new Map<number, string>();
  images.forEach((img, idx) => {
    const relId = `rId${idx + 2}`;
    imageRelIdMap.set(img.id, relId);
    relsXml += `  <Relationship Id="${relId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image${img.id}.png"/>\n`;
    // 바이너리 데이터 ZIP에 패키징
    zip.file(`word/media/image${img.id}.png`, img.buffer);
  });

  relsXml += `</Relationships>`;
  zip.file('word/_rels/document.xml.rels', relsXml);

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
      <w:keepNext/>
      <w:spacing w:before="400" w:after="200" w:line="320" w:lineRule="auto"/>
      <w:pBdr>
        <w:left w:val="single" w:sz="36" w:space="12" w:color="1D4ED8"/>
      </w:pBdr>
      <w:ind w:left="160"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="38"/>
      <w:szCs w:val="38"/>
      <w:color w:val="1D4ED8"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:keepNext/>
      <w:spacing w:before="320" w:after="160" w:line="300" w:lineRule="auto"/>
      <w:pBdr>
        <w:left w:val="single" w:sz="28" w:space="10" w:color="1D4ED8"/>
      </w:pBdr>
      <w:ind w:left="140"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="30"/>
      <w:szCs w:val="30"/>
      <w:color w:val="0F172A"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="heading 3"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:keepNext/>
      <w:spacing w:before="240" w:after="120" w:line="280" w:lineRule="auto"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="26"/>
      <w:szCs w:val="26"/>
      <w:color w:val="1E293B"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="Heading4">
    <w:name w:val="heading 4"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:keepNext/>
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
      <w:keepNext/>
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
      <w:keepNext/>
      <w:spacing w:before="140" w:after="60"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="20"/>
      <w:szCs w:val="20"/>
      <w:color w:val="64748B"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="Caption">
    <w:name w:val="caption"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:jc w:val="center"/>
      <w:spacing w:before="60" w:after="240" w:line="240" w:lineRule="auto"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="${defaultFont}" w:eastAsia="${defaultFont}"/>
      <w:sz w:val="18"/>
      <w:szCs w:val="18"/>
      <w:color w:val="475569"/>
      <w:i/>
    </w:rPr>
  </w:style>
</w:styles>`
  );

  // 5. word/document.xml 본문 빌드 (미리보기 DOM 직접 파싱 기반 100% 무결 조판)
  const documentXml = buildDocumentXml(containerEl, docTitle, defaultFont, images, imageRelIdMap);
  zip.file('word/document.xml', documentXml);

  return await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}

/**
 * HTML DOM 구조를 순회하여 WordprocessingML 본문 문자열을 생성
 */
function buildDocumentXml(
  containerEl: HTMLElement,
  title: string,
  defaultFont: string,
  images: ExtractedImage[],
  imageRelIdMap: Map<number, string>
): string {
  const bodyXmls: string[] = [];
  const imageMap = new Map<number, ExtractedImage>(images.map((img) => [img.id, img]));

  interface FormatState {
    bold?: boolean;
    italic?: boolean;
    strike?: boolean;
    underline?: boolean;
    code?: boolean;
    link?: boolean;
  }

  // 인라인 노드들을 <w:r> 런 조각들로 변환 (중첩 태그 및 서식 완벽 보존)
  function parseInlines(element: Node, format: FormatState = {}): string {
    let result = '';

    element.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        if (!text) return;
        let rPr = '';
        if (format.bold || format.italic || format.strike || format.underline || format.code || format.link) {
          rPr = '<w:rPr>';
          if (format.bold) rPr += '<w:b/>';
          if (format.italic) rPr += '<w:i/>';
          if (format.strike) rPr += '<w:strike/>';
          if (format.underline || format.link) rPr += '<w:u w:val="single"/>';
          if (format.link) rPr += '<w:color w:val="1D4ED8"/>';
          if (format.code) {
            rPr += '<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>';
            rPr += '<w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/>';
            rPr += '<w:color w:val="BE185D"/>';
          }
          rPr += '</w:rPr>';
        }
        result += `<w:r>${rPr}<w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`;
        return;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tag = el.tagName.toLowerCase();

        // 🌟 버튼 및 복사 위젯 등 내보내기 제외 요소 건너뛰기
        if (
          tag === 'button' ||
          tag === 'script' ||
          tag === 'style' ||
          el.classList.contains('no-export') ||
          el.classList.contains('copy-button-hook') ||
          el.classList.contains('copy-btn') ||
          el.classList.contains('preview-toolbar-root')
        ) {
          return;
        }

        if (tag === 'br') {
          result += `<w:r><w:br/></w:r>`;
          return;
        }

        // 체크박스 input 태그 대응
        if (tag === 'input' && el.getAttribute('type') === 'checkbox') {
          const isChecked = el.hasAttribute('checked') || (el as HTMLInputElement).checked;
          result += `<w:r><w:rPr><w:rFonts w:ascii="MS Gothic" w:eastAsia="MS Gothic"/></w:rPr><w:t xml:space="preserve">${isChecked ? '☑ ' : '☐ '}</w:t></w:r>`;
          return;
        }

        // 인라인 스타일 및 태그 판별
        const isBold = format.bold || tag === 'strong' || tag === 'b' || el.style?.fontWeight === 'bold' || parseInt(el.style?.fontWeight || '0') >= 600;
        const isItalic = format.italic || tag === 'em' || tag === 'i' || el.style?.fontStyle === 'italic';
        const isStrike = format.strike || tag === 'del' || tag === 's' || tag === 'strike' || el.style?.textDecoration?.includes('line-through');
        const isUnderline = format.underline || tag === 'u' || el.style?.textDecoration?.includes('underline');
        const isCode = format.code || tag === 'code';
        const isLink = format.link || tag === 'a';

        result += parseInlines(el, {
          bold: isBold,
          italic: isItalic,
          strike: isStrike,
          underline: isUnderline,
          code: isCode,
          link: isLink,
        });
      }
    });

    return result;
  }

  // 이미지 및 다이어그램 개체 렌더링 (<w:drawing>)
  function renderDrawingML(imgData: ExtractedImage, caption: string = ''): string {
    const maxW_emu = 5400000; // ~150mm
    const maxH_emu = 7200000; // ~190mm
    const origW_emu = Math.max(100, imgData.width) * 9525;
    const origH_emu = Math.max(100, imgData.height) * 9525;
    const scale = Math.min(1, maxW_emu / origW_emu, maxH_emu / origH_emu);
    const cx = Math.round(origW_emu * scale);
    const cy = Math.round(origH_emu * scale);

    const relId = imageRelIdMap.get(imgData.id) || `rId2`;
    const imgSeq = (Array.from(imageRelIdMap.keys()).indexOf(imgData.id) >= 0 ? Array.from(imageRelIdMap.keys()).indexOf(imgData.id) : 0) + 1;

    let xml = `
      <w:p>
        <w:pPr>
          <w:jc w:val="center"/>
          ${caption ? '<w:keepNext/>' : ''}
          <w:spacing w:before="240" w:after="${caption ? 60 : 200}"/>
        </w:pPr>
        <w:r>
          <w:drawing>
            <wp:inline distT="0" distB="0" distL="0" distR="0">
              <wp:extent cx="${cx}" cy="${cy}"/>
              <wp:effectExtent l="0" t="0" r="0" b="0"/>
              <wp:docPr id="${imgSeq}" name="Picture ${imgSeq}"/>
              <wp:cNvGraphicFramePr>
                <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
              </wp:cNvGraphicFramePr>
              <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
                <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                  <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                    <pic:nvPicPr>
                      <pic:cNvPr id="0" name="Picture ${imgSeq}"/>
                      <pic:cNvPicPr/>
                    </pic:nvPicPr>
                    <pic:blipFill>
                      <a:blip r:embed="${relId}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>
                      <a:stretch><a:fillRect/></a:stretch>
                    </pic:blipFill>
                    <pic:spPr>
                      <a:xfrm>
                        <a:off x="0" y="0"/>
                        <a:ext cx="${cx}" cy="${cy}"/>
                      </a:xfrm>
                      <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
                    </pic:spPr>
                  </pic:pic>
                </a:graphicData>
              </a:graphic>
            </wp:inline>
          </w:drawing>
        </w:r>
      </w:p>
    `;

    if (caption) {
      xml += `
        <w:p>
          <w:pPr>
            <w:pStyle w:val="Caption"/>
            <w:jc w:val="center"/>
            <w:spacing w:before="60" w:after="240"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="${defaultFont}" w:eastAsia="${defaultFont}"/>
              <w:sz w:val="18"/>
              <w:szCs w:val="18"/>
              <w:color w:val="475569"/>
              <w:i/>
            </w:rPr>
            <w:t xml:space="preserve">${escapeXml(caption)}</w:t>
          </w:r>
        </w:p>
      `;
    }

    return xml;
  }

  // 블록 요소들을 순회하며 Word 단락 및 표 구성
  function processBlockNode(node: Node) {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    // 불필요한 위젯, 스크립트, 메타 블록, 병합된 캡션 p 태그 제외
    if (
      tag === 'script' ||
      tag === 'style' ||
      tag === 'button' ||
      el.classList.contains('no-export') ||
      el.classList.contains('preview-toolbar-root') ||
      el.classList.contains('frontmatter-block') ||
      el.classList.contains('metadata-block') ||
      el.classList.contains('codeblock-header') ||
      el.classList.contains('copy-button-hook') ||
      el.classList.contains('copy-btn') ||
      el.getAttribute('data-export-caption-merged') === 'true'
    ) {
      return;
    }

    // 🌟 [핵심] 이미지 또는 다이어그램 개체 렌더링 (<w:drawing>)
    const targetImgEl = el.hasAttribute('data-export-img-id') ? el : el.querySelector('[data-export-img-id]');
    if (targetImgEl && (
      el.hasAttribute('data-export-img-id') ||
      tag === 'figure' ||
      tag === 'img' ||
      tag === 'p' ||
      el.classList.contains('mermaid-svg-container') ||
      el.classList.contains('mermaid-block-container') ||
      el.classList.contains('onrivi-image-wrapper')
    )) {
      const imgIdStr = targetImgEl.getAttribute('data-export-img-id');
      const imgId = parseInt(imgIdStr || '0', 10);
      const imgData = imageMap.get(imgId);

      if (imgData) {
        const caption =
          targetImgEl.getAttribute('data-export-caption') ||
          el.querySelector('figcaption')?.textContent?.trim() ||
          imgData.caption ||
          '';
        bodyXmls.push(renderDrawingML(imgData, caption));
        if (tag === 'p') {
          targetImgEl.remove();
          const remainingInlines = parseInlines(el);
          if (remainingInlines.trim()) {
            bodyXmls.push(`
              <w:p>
                <w:pPr>
                  <w:spacing w:after="160" w:line="276" w:lineRule="auto"/>
                </w:pPr>
                ${remainingInlines}
              </w:p>
            `);
          }
        }
        return;
      }
    }

    // 1. 헤딩 (H1 ~ H6)
    if (/^h[1-6]$/.test(tag)) {
      const level = tag.substring(1);
      const inlines = parseInlines(el);
      bodyXmls.push(`
        <w:p>
          <w:pPr>
            <w:pStyle w:val="Heading${level}"/>
            <w:keepNext/>
          </w:pPr>
          ${inlines}
        </w:p>
      `);
      return;
    }

    // 1-1. 캡션 단독 노드 (FIGCAPTION)
    if (tag === 'figcaption') {
      const inlines = parseInlines(el);
      if (inlines.trim()) {
        bodyXmls.push(`
          <w:p>
            <w:pPr>
              <w:pStyle w:val="Caption"/>
              <w:jc w:val="center"/>
              <w:spacing w:before="60" w:after="240"/>
            </w:pPr>
            ${inlines}
          </w:p>
        `);
      }
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
              <w:spacing w:after="120"/>
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
        const hasCheckbox = item.querySelector('input[type="checkbox"]') !== null;
        const prefix = hasCheckbox ? '' : (isOrdered ? `${idx + 1}. ` : `• `);
        const inlines = parseInlines(item);
        bodyXmls.push(`
          <w:p>
            <w:pPr>
              <w:ind w:left="400" w:hanging="200"/>
              <w:spacing w:after="80"/>
            </w:pPr>
            ${prefix ? `<w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">${prefix}</w:t></w:r>` : ''}
            ${inlines}
          </w:p>
        `);
      });
      return;
    }

    // 5. 코드 블록 (PRE 또는 .codeblock-area) — 깔끔한 라이트 음영 및 코발트 액센트 단일 박스 조판
    if (tag === 'pre' || el.classList.contains('codeblock-area')) {
      const codeEl = el.querySelector('code') || el.querySelector('pre') || el;
      const text = (codeEl.textContent || '').replace(/\r\n/g, '\n');
      const lines = text.split('\n');
      while (lines.length > 0 && lines[lines.length - 1] === '') {
        lines.pop();
      }
      const runs = lines.map((l: string, i: number) => `<w:t xml:space="preserve">${escapeXml(l)}</w:t>${i < lines.length - 1 ? '<w:br/>' : ''}`).join('');
      bodyXmls.push(`
        <w:p>
          <w:pPr>
            <w:pBdr>
              <w:left w:val="single" w:sz="24" w:space="10" w:color="1D4ED8"/>
              <w:top w:val="single" w:sz="6" w:space="6" w:color="E2E8F0"/>
              <w:right w:val="single" w:sz="6" w:space="6" w:color="E2E8F0"/>
              <w:bottom w:val="single" w:sz="6" w:space="6" w:color="E2E8F0"/>
            </w:pBdr>
            <w:shd w:val="clear" w:color="auto" w:fill="F8FAFC"/>
            <w:spacing w:before="160" w:after="160" w:line="240" w:lineRule="auto"/>
            <w:ind w:left="240" w:right="240"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>
              <w:sz w:val="18"/>
              <w:szCs w:val="18"/>
              <w:color w:val="1E293B"/>
            </w:rPr>
            ${runs}
          </w:r>
        </w:p>
      `);
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
            <w:jc w:val="center"/>
            <w:tblBorders>
              <w:top w:val="single" w:sz="8" w:space="0" w:color="CBD5E1"/>
              <w:bottom w:val="single" w:sz="8" w:space="0" w:color="CBD5E1"/>
              <w:left w:val="none"/>
              <w:right w:val="none"/>
              <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
              <w:insideV w:val="none"/>
            </w:tblBorders>
            <w:tblCellMar>
              <w:top w:w="120" w:type="dxa"/>
              <w:left w:w="160" w:type="dxa"/>
              <w:bottom w:w="120" w:type="dxa"/>
              <w:right w:w="160" w:type="dxa"/>
            </w:tblCellMar>
          </w:tblPr>
      `;

      trs.forEach((tr, rowIdx) => {
        const isHeader = rowIdx === 0 && (tr.querySelector('th') !== null || tr.parentElement?.tagName.toLowerCase() === 'thead');
        tblXml += `<w:tr>${isHeader ? '<w:trPr><w:tblHeader/></w:trPr>' : ''}`;
        const cells = Array.from(tr.children).filter((c) => {
          const t = c.tagName.toLowerCase();
          return t === 'th' || t === 'td';
        });

        cells.forEach((cell) => {
          const isTh = cell.tagName.toLowerCase() === 'th';
          const inlines = parseInlines(cell);
          const bgFill = isTh ? 'F1F5F9' : (rowIdx % 2 === 1 ? 'FAFAFA' : 'FFFFFF');

          tblXml += `
            <w:tc>
              <w:tcPr>
                <w:tcMar>
                  <w:top w:w="140" w:type="dxa"/>
                  <w:left w:w="160" w:type="dxa"/>
                  <w:bottom w:w="140" w:type="dxa"/>
                  <w:right w:w="160" w:type="dxa"/>
                </w:tcMar>
                <w:shd w:val="clear" w:color="auto" w:fill="${bgFill}"/>
              </w:tcPr>
              <w:p>
                <w:pPr>
                  <w:spacing w:before="60" w:after="60" w:line="240" w:lineRule="auto"/>
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

    // 8. 일반 래퍼 컨테이너 (DIV, SECTION, ARTICLE 등): 재귀 순회
    Array.from(el.childNodes).forEach(processBlockNode);
  }

  // 본문 탐색 시작
  Array.from(containerEl.childNodes).forEach(processBlockNode);

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
            xmlns:v="urn:schemas-microsoft-com:vml"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
            xmlns:w10="urn:schemas-microsoft-com:office:word"
            xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
            xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
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
