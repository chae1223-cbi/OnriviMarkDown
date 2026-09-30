// ====================================================================
// 📊 [OMD-IO-docxGenerator-0001] docxGenerator.ts ➔ generateDocx
// 🎯 @KICK  : 마크다운(.md) 직접 토큰 파싱 또는 DOM을 표준 Office Open XML(.docx) 파일로 조판 및 변환 사출
// 🛡️ @GUARD : JSZip 기반 100% 클라이언트/오프라인 구동, marked 직접 파싱 1:1 무결성, DrawingML 이미지/다이어그램 임베딩, 헤딩 코발트 바 & 다크 코드블록 완벽 조판
// 🚨 @PATCH : **2026-10-01** — [마크다운 직접 파싱 기반 DOCX 사출 파이프라인 완비]: DOM 스크랩 대신 원본 마크다운(marked lexer)을 직접 파싱하여 H1 제목 누락 및 [TEXT] 코드블록 깨짐을 원천 차단하고, 표·목록·인용구 서식과 Mermaid/이미지 종횡비(가로 150mm x 세로 190mm) 듀얼 클램프 임베딩 실현
// 🚨 @PATCH : **2026-10-01** — [DOCX 파일 오픈 오류 긴급 해결 및 MS Word 완벽 호환]: w:document 루트에 필수 DrawingML(wp, a, pic) 네임스페이스 선언 완비, docProps/core.xml·app.xml 패키징, Relationship Id 정규 순차 번호(rId2~) 매핑 및 wp:docPr/pic:cNvPr 고유 ID 분리로 Word 유효성 검사 에러 완전 차단
// 🚨 @PATCH : **2026-10-01** — [DOCX 이미지·Mermaid 다이어그램 임베딩 및 원본 1:1 고품질 조판 보강]: DrawingML <w:drawing> 미디어 패키징, 헤딩 좌측 액센트 바, 다크 코드블록 및 캡션([그림 N]) 완전 연동
// 🚨 @PATCH : **2026-09-30** — MS Word (.docx) 내보내기 생성기 신규 구현 (구글 Docs 및 Word 완벽 호환)
// 🔗 @CALLS : JSZip, marked, ExtractedImage (exportMediaHelper.ts)
// ====================================================================

import JSZip from 'jszip';
import { marked } from 'marked';
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
  const documentXml = options.markdown && options.markdown.trim()
    ? buildDocumentXmlFromMarkdown(options.markdown, docTitle, defaultFont, images, imageRelIdMap)
    : buildDocumentXml(containerEl, docTitle, defaultFont, images, imageRelIdMap);
  zip.file('word/document.xml', documentXml);

  return await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}

/**
 * 마크다운 인라인 토큰을 WordprocessingML <w:r> 런 조각들로 변환
 */
function renderInlineTokensDocx(tokens: any[]): string {
  if (!tokens || !Array.isArray(tokens)) return '';
  let result = '';
  tokens.forEach((t) => {
    if (t.type === 'text') {
      result += `<w:r><w:t xml:space="preserve">${escapeXml(t.text)}</w:t></w:r>`;
    } else if (t.type === 'strong') {
      const inner = renderInlineTokensDocx(t.tokens || [{ type: 'text', text: t.text }]);
      result += inner.replace(/<w:r>/g, '<w:r><w:rPr><w:b/></w:rPr>').replace(/<w:rPr>/g, '<w:rPr><w:b/>');
    } else if (t.type === 'em') {
      const inner = renderInlineTokensDocx(t.tokens || [{ type: 'text', text: t.text }]);
      result += inner.replace(/<w:r>/g, '<w:r><w:rPr><w:i/></w:rPr>').replace(/<w:rPr>/g, '<w:rPr><w:i/>');
    } else if (t.type === 'codespan') {
      result += `<w:r><w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/><w:color w:val="BE185D"/></w:rPr><w:t xml:space="preserve">${escapeXml(t.text)}</w:t></w:r>`;
    } else if (t.type === 'link') {
      const inner = renderInlineTokensDocx(t.tokens || [{ type: 'text', text: t.text }]);
      result += inner.replace(/<w:r>/g, '<w:r><w:rPr><w:u w:val="single"/><w:color w:val="1D4ED8"/></w:rPr>').replace(/<w:rPr>/g, '<w:rPr><w:u w:val="single"/><w:color w:val="1D4ED8"/>');
    } else if (t.type === 'del') {
      const inner = renderInlineTokensDocx(t.tokens || [{ type: 'text', text: t.text }]);
      result += inner.replace(/<w:r>/g, '<w:r><w:rPr><w:strike/></w:rPr>').replace(/<w:rPr>/g, '<w:rPr><w:strike/>');
    } else if (t.type === 'br') {
      result += `<w:r><w:br/></w:r>`;
    }
  });
  return result;
}

/**
 * 원본 마크다운 텍스트를 marked lexer로 직접 파싱하여 100% 무결한 WordprocessingML 본문 생성
 */
function buildDocumentXmlFromMarkdown(
  markdown: string,
  title: string,
  defaultFont: string,
  images: ExtractedImage[],
  imageRelIdMap: Map<number, string>
): string {
  const bodyXmls: string[] = [];
  const tokens = marked.lexer(markdown);

  const mermaidQueue = images.filter((img) => img.isMermaid);
  const standardQueue = images.filter((img) => !img.isMermaid);

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

  tokens.forEach((token) => {
    // 1. 헤딩 (H1 ~ H6)
    if (token.type === 'heading') {
      const inlines = renderInlineTokensDocx(token.tokens || [{ type: 'text', text: token.text }]);
      bodyXmls.push(`
        <w:p>
          <w:pPr>
            <w:pStyle w:val="Heading${token.depth}"/>
          </w:pPr>
          ${inlines}
        </w:p>
      `);
      return;
    }

    // 2. 코드 블록 (Mermaid vs 일반 코드)
    if (token.type === 'code') {
      if (token.lang === 'mermaid') {
        const mermaidImg = mermaidQueue.shift() || images.find((img) => img.isMermaid);
        if (mermaidImg) {
          bodyXmls.push(renderDrawingML(mermaidImg, mermaidImg.caption || '다이어그램'));
        }
        return;
      }

      // 일반 코드 블록 (깔끔한 음영 박스 및 모노스페이스 서식)
      const lines = token.text.split('\n');
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

    // 3. 표 (TABLE)
    if (token.type === 'table') {
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

      // Header row
      tblXml += `<w:tr><w:trPr><w:tblHeader/></w:trPr>`;
      token.header.forEach((cell: any, cIdx: number) => {
        const align = token.align[cIdx] || 'left';
        const jcVal = align === 'center' ? 'center' : align === 'right' ? 'right' : 'left';
        const inlines = renderInlineTokensDocx(cell.tokens || [{ type: 'text', text: cell.text }]);
        tblXml += `
          <w:tc>
            <w:tcPr>
              <w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/>
            </w:tcPr>
            <w:p>
              <w:pPr><w:jc w:val="${jcVal}"/><w:spacing w:before="60" w:after="60"/></w:pPr>
              <w:r><w:rPr><w:b/></w:rPr></w:r>
              ${inlines}
            </w:p>
          </w:tc>
        `;
      });
      tblXml += `</w:tr>`;

      // Body rows
      token.rows.forEach((row: any) => {
        tblXml += `<w:tr>`;
        row.forEach((cell: any, cIdx: number) => {
          const align = token.align[cIdx] || 'left';
          const jcVal = align === 'center' ? 'center' : align === 'right' ? 'right' : 'left';
          const inlines = renderInlineTokensDocx(cell.tokens || [{ type: 'text', text: cell.text }]);
          tblXml += `
            <w:tc>
              <w:p>
                <w:pPr><w:jc w:val="${jcVal}"/><w:spacing w:before="60" w:after="60"/></w:pPr>
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

    // 4. 인용구 (BLOCKQUOTE)
    if (token.type === 'blockquote') {
      const inlines = renderInlineTokensDocx(token.tokens || [{ type: 'text', text: token.text }]);
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
      return;
    }

    // 5. 목록 (LIST)
    if (token.type === 'list') {
      token.items.forEach((item: any, idx: number) => {
        const prefix = token.ordered ? `${(token.start || 1) + idx}. ` : '• ';
        const inlines = renderInlineTokensDocx(item.tokens || [{ type: 'text', text: item.text }]);
        bodyXmls.push(`
          <w:p>
            <w:pPr>
              <w:ind w:left="480" w:hanging="240"/>
              <w:spacing w:after="80" w:line="260" w:lineRule="auto"/>
            </w:pPr>
            <w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">${prefix}</w:t></w:r>
            ${inlines}
          </w:p>
        `);
      });
      return;
    }

    // 6. 구분선 (HR)
    if (token.type === 'hr') {
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

    // 7. 단락 (PARAGRAPH)
    if (token.type === 'paragraph') {
      const imgToken = token.tokens?.find((t: any) => t.type === 'image') as any;
      if (imgToken) {
        const hrefFname = (imgToken.href || '').split(/[/\\]/).pop()?.split('?')[0]?.toLowerCase();
        const matched = standardQueue.find((img) => img.filename && img.filename.toLowerCase() === hrefFname)
          || standardQueue.find((img) => img.src && img.src.toLowerCase().includes(hrefFname))
          || standardQueue.shift()
          || images.find((img) => !img.isMermaid);

        let caption = '';
        const emToken = token.tokens?.find((t: any) => t.type === 'em') as any;
        if (emToken && emToken.text) {
          caption = emToken.text.trim();
        } else if (imgToken.text && !imgToken.text.startsWith('image') && imgToken.text.length > 2) {
          caption = imgToken.text.trim();
        }

        if (matched) {
          bodyXmls.push(renderDrawingML(matched, caption || matched.caption || ''));
        }
        return;
      }

      // 일반 텍스트 단락
      const inlines = renderInlineTokensDocx(token.tokens || [{ type: 'text', text: token.text }]);
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
  });

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

          const replaced = childInlines.replace(/<w:r>/g, `<w:r>${rPr}`).replace(/<w:rPr>.*?<\/w:rPr>/g, () => rPr);
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

    // 🌟 [핵심] 이미지 또는 다이어그램 개체 렌더링 (<w:drawing>)
    const targetImgEl = el.hasAttribute('data-export-img-id') ? el : el.querySelector('[data-export-img-id]');
    if (targetImgEl && (el.hasAttribute('data-export-img-id') || tag === 'figure' || tag === 'img' || el.classList.contains('mermaid-svg-container') || el.classList.contains('mermaid-block-container') || el.classList.contains('onrivi-image-wrapper'))) {
      const imgIdStr = targetImgEl.getAttribute('data-export-img-id');
      const imgId = parseInt(imgIdStr || '0', 10);
      const imgData = imageMap.get(imgId);

      if (imgData) {
        const caption = targetImgEl.getAttribute('data-export-caption') || imgData.caption || '';
        // A4 페이지 본문 여백 제외 가용 최대 너비/높이
        const maxW_emu = 5400000;
        const maxH_emu = 7200000;
        const origW_emu = Math.max(100, imgData.width) * 9525;
        const origH_emu = Math.max(100, imgData.height) * 9525;
        const scale = Math.min(1, maxW_emu / origW_emu, maxH_emu / origH_emu);
        const cx = Math.round(origW_emu * scale);
        const cy = Math.round(origH_emu * scale);

        const relId = imageRelIdMap.get(imgId) || `rId2`;
        const imgSeq = (Array.from(imageRelIdMap.keys()).indexOf(imgId) >= 0 ? Array.from(imageRelIdMap.keys()).indexOf(imgId) : 0) + 1;

        bodyXmls.push(`
          <w:p>
            <w:pPr>
              <w:jc w:val="center"/>
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
        `);

        if (caption) {
          bodyXmls.push(`
            <w:p>
              <w:pPr>
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
          `);
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

    // 5. 코드 블록 (PRE) — 다크 테마 및 언어 배지 상단 바 탑재
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

      // 상단 다크 배지 헤더
      bodyXmls.push(`
        <w:p>
          <w:pPr>
            <w:shd w:val="clear" w:color="auto" w:fill="0F172A"/>
            <w:spacing w:before="200" w:after="0" w:line="240" w:lineRule="auto"/>
            <w:ind w:left="200" w:right="200"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>
              <w:b/>
              <w:sz w:val="17"/>
              <w:szCs w:val="17"/>
              <w:color w:val="94A3B8"/>
            </w:rPr>
            <w:t xml:space="preserve">  ${langBadge}</w:t>
          </w:r>
        </w:p>
      `);

      lines.forEach((line) => {
        bodyXmls.push(`
          <w:p>
            <w:pPr>
              <w:shd w:val="clear" w:color="auto" w:fill="0F172A"/>
              <w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/>
              <w:ind w:left="200" w:right="200"/>
            </w:pPr>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>
                <w:sz w:val="19"/>
                <w:szCs w:val="19"/>
                <w:color w:val="F8FAFC"/>
              </w:rPr>
              <w:t xml:space="preserve">${escapeXml(line)}</w:t>
            </w:r>
          </w:p>
        `);
      });
      // 코드블록 후 여백
      bodyXmls.push(`<w:p><w:pPr><w:spacing w:after="200"/></w:pPr></w:p>`);
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
              <w:top w:val="single" w:sz="8" w:space="0" w:color="CBD5E1"/>
              <w:left w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
              <w:bottom w:val="single" w:sz="12" w:space="0" w:color="94A3B8"/>
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
      bodyXmls.push(`<w:p><w:pPr><w:spacing w:after="200"/></w:pPr></w:p>`);
      return;
    }

    // 8. 일반 래퍼 컨테이너 (DIV, SECTION, ARTICLE 등): 재귀 탐색
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
