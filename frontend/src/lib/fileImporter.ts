// ====================================================================
// 🚨 @PATCH : **2026-08-20** (2차) HWP 이미지 추출 시 순차 치환으로 인해 이미지가 뒤섞이는 현상을 완벽 해결하기 위해, hwp.js의 Picture 객체의 binID를 추출하여 정확한 플레이스홀더를 삽입하고 OLE/DocInfo와 매핑. 또한 표(Table) 객체를 감지하여 뭉친 텍스트 대신 완전한 마크다운 표 구조를 생성하도록 extractText를 재귀적으로 리팩토링함.
// 🚀 [OMD-LIB-FileImporter-0001] fileImporter
// 📝 @KICK : 외부 파일(HWP, DOCX, PDF 등) 텍스트/이미지 추출 모듈
// 🚨 @PATCH : **2026-08-20** HWP 추출 시 표 데이터 뭉침 방지를 위해 hwp.js 배열 순회 시 탭(Tab) 공백 삽입. BMP/GIF 등 HWP 내장 이미지의 MIME 타입을 정확히 매핑하여 엑스박스 출력 해결. 이미지 위치 유지를 위해 hwp.js 파싱 중 그림 컨트롤 검출 시 ::HWP_IMAGE_PLACEHOLDER:: 꼬리표 삽입 로직 추가.
// ====================================================================
import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import * as hwpLib from 'hwp.js';
import { Buffer } from 'buffer';

// Next.js 14 (Webpack 5) 환경에서 mammoth.js가 내부적으로 Buffer를 참조할 때 발생하는 오류 방지용 폴리필
if (typeof globalThis !== 'undefined' && !(globalThis as any).Buffer) {
  (globalThis as any).Buffer = Buffer;
}

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

/**
 * 외부 파일을 마크다운 평문으로 변환합니다.
 */
export async function convertFileToMarkdown(
  file: File,
  imageSaveCallback?: (base64Data: string, contentType: string) => Promise<string>
): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  const arrayBuffer = await file.arrayBuffer();

  switch (extension) {
    case 'docx':
      return await importDocx(arrayBuffer, imageSaveCallback);
    case 'pdf':
      return await importPdf(arrayBuffer);
    case 'hwp':
      return await importHwp(arrayBuffer, imageSaveCallback);
    case 'txt':
    case 'md':
    case 'markdown':
    case 'html':
      return await file.text();
    default:
      throw new Error(`지원하지 않는 파일 형식입니다: ${extension}`);
  }
}

async function importDocx(
  arrayBuffer: ArrayBuffer,
  imageSaveCallback?: (base64Data: string, contentType: string) => Promise<string>
): Promise<string> {
  try {
    let result;
    if (imageSaveCallback) {
      const options = {
        convertImage: mammoth.images.imgElement(function(image) {
          return image.read("base64").then(function(imageBuffer) {
            return imageSaveCallback(imageBuffer, image.contentType).then(function(src) {
              return { src: src };
            });
          });
        })
      };
      // 이미지 콜백이 있을 경우 HTML 변환 후 반환
      result = await mammoth.convertToHtml({ arrayBuffer }, options);
      // 추출된 HTML에서 <img src="..."> 태그를 찾아 마크다운 ![...](...) 문법으로 강제 변환
      let htmlContent = result.value;
      htmlContent = htmlContent.replace(/<img[^>]*src="([^"]+)"[^>]*>/gi, '![]($1)');
      // 쓸데없는 <p>, </p> 등 기본 HTML 래퍼 제거 (AI가 헷갈리지 않도록 평문화)
      htmlContent = htmlContent.replace(/<\/?p[^>]*>/gi, '\n\n');
      return htmlContent.trim();
    } else {
      // 텍스트 추출 방식 사용
      result = await mammoth.extractRawText({ arrayBuffer });
    }
    return result.value.trim();
  } catch (error: any) {
    console.error('DOCX Import Error:', error);
    throw new Error('워드 파일(DOCX)을 읽는 중 오류가 발생했습니다.');
  }
}

async function importPdf(
  arrayBuffer: ArrayBuffer,
  imageSaveCallback?: (base64Data: string, contentType: string) => Promise<string>
): Promise<string> {
  try {
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const MAX_PAGES = 50;
    if (pdf.numPages > MAX_PAGES) {
      throw new Error(`PDF 문서가 너무 큽니다. (현재 ${pdf.numPages}페이지 / 최대 허용 ${MAX_PAGES}페이지). 분할하여 가져와주세요.`);
    }

    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item: any) => item.str);
      const pageText = strings.join(' ').trim();
      
      text += pageText + '\n\n';

      // 페이지에 텍스트가 거의 없는 경우(스캔본, 캔바 PPT 등) 페이지 전체를 이미지로 캡처하여 삽입
      if (pageText.length < 100 && imageSaveCallback && typeof document !== 'undefined') {
        try {
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
            const dataUrl = canvas.toDataURL('image/png');
            const base64 = dataUrl.split(',')[1];
            if (base64) {
              const src = await imageSaveCallback(base64, 'image/png');
              text += `<img src="${src}" alt="PDF Page ${i}" />\n\n`;
            }
          }
        } catch (e) {
          console.warn(`PDF 페이지 ${i} 렌더링 실패:`, e);
        }
      }
    }
    
    return text.trim();
  } catch (error: any) {
    console.error('PDF Import Error:', error);
    throw new Error(error.message || 'PDF 파일을 읽는 중 오류가 발생했습니다.');
  }
}

async function importHwp(
  arrayBuffer: ArrayBuffer,
  imageSaveCallback?: (base64Data: string, contentType: string) => Promise<string>
): Promise<string> {
  try {
    const view = new Uint8Array(arrayBuffer);
    
    // 💡 [OLE CF 시그니처 검증] HWP 5.0 포맷은 항상 OLE 복합 파일 구조를 띱니다. (시그니처: D0 CF 11 E0 A1 B1 1A E1)
    const isOle = view[0] === 0xD0 && view[1] === 0xCF && view[2] === 0x11 && view[3] === 0xE0 &&
                  view[4] === 0xA1 && view[5] === 0xB1 && view[6] === 0x1A && view[7] === 0xE1;
                  
    if (!isOle) {
      // 💡 [ZIP 포맷 체크] HWPX는 zip 압축 파일 구조입니다. (시그니처: 50 4B 03 04 -> PK..)
      const isZip = view[0] === 0x50 && view[1] === 0x4B && view[2] === 0x03 && view[3] === 0x04;
      if (isZip) {
        throw new Error(
          '가져오려는 파일이 XML 기반의 HWPX(한글 표준 문서) 포맷으로 판별되었습니다.\n\n' +
          '현재 한글 문서 가져오기는 일반 HWP(한글 2002~2018 호환) 포맷만 지원합니다. ' +
          '한컴오피스에서 파일 메뉴 -> "다른 이름으로 저장"을 선택하여 파일 형식을 [한글 문서(*.hwp)]로 변경한 후 다시 시도해 주세요.'
        );
      }
      
      throw new Error('올바른 한글 문서(HWP) 파일이 아닙니다. 파일 손상 여부 및 올바른 OLE 복합 문서 포맷인지 확인해 주세요.');
    }

    let text = '';

    try {
      // 1단계: 기본 hwp.js 파서 작동 시도
      const hwpDoc = hwpLib.parse(view, { type: 'array' });
      const extractTextNode = (obj: any): string => {
          let result = '';
          if (typeof obj === 'string') {
            return obj;
          } else if (Array.isArray(obj)) {
            return obj.map(item => extractTextNode(item)).join(' ');
          } else if (obj !== null && typeof obj === 'object') {
            // Table (id = 543974004)
            if (obj.id === 543974004 && Array.isArray(obj.content)) {
              let mdTable = '\n\n';
              obj.content.forEach((row: any, rIdx: number) => {
                let rowText = '| ';
                if (Array.isArray(row)) {
                  row.forEach((cell: any) => {
                    let cellStr = extractTextNode(cell).replace(/\r?\n/g, ' ').trim();
                    rowText += cellStr + ' | ';
                  });
                }
                mdTable += rowText + '\n';
                if (rIdx === 0) {
                  let sep = '|';
                  if (Array.isArray(row)) {
                    row.forEach(() => { sep += '---|'; });
                  }
                  mdTable += sep + '\n';
                }
              });
              return mdTable + '\n\n';
            }
            
            // Picture (type = 1667854372 or GenShapeObject = 544174951)
            if (obj.type === 1667854372 || obj.id === 544174951) {
              let placeholder = '::HWP_IMAGE_PLACEHOLDER::';
              if (obj.info && obj.info.binID !== undefined) {
                placeholder = '::HWP_IMAGE_PLACEHOLDER_' + obj.info.binID + '::';
              }
              return '\n\n' + placeholder + '\n\n';
            }

            if (obj.text) result += extractTextNode(obj.text);
            else if (obj.chars) result += extractTextNode(obj.chars);
            else {
              Object.values(obj).forEach(v => {
                if (typeof v === 'string' || typeof v === 'number' || (typeof v === 'object' && v !== null)) {
                   result += extractTextNode(v);
                }
              });
            }
            
            if ('controls' in obj || 'lines' in obj) {
              result += '\n\n';
            }
          }
          return result;
        };
        
        if (hwpDoc && hwpDoc.sections) {
          text = extractTextNode(hwpDoc.sections);
          // hwpDoc 객체를 외부에 노출하여 이미지 맵핑에 활용할 수 있도록 함
          (view as any)._parsedHwpDoc = hwpDoc;
        }
    } catch (parseError: any) {
      console.warn('hwp.js 파서 실패, 초경량 OLE 텍스트 복구 폴백 파서 기동:', parseError);
      
      const cfb = await import('cfb');
      const pako = (await import('pako')).default;

      // 2단계: cfb 라이브러리로 수동 텍스트 레코드 복구 시도
      const cfbFile = cfb.read(view, { type: 'array' });
      
      // BodyText 내부의 Section 스트림 엔트리들 수집
      const sectionEntries = cfbFile.FileIndex.filter(entry => 
        entry.type === 2 && // 2 = stream
        entry.name.includes('Section') && 
        entry.size > 0
      );
      
      if (sectionEntries.length === 0) {
        throw new Error('HWP 문서 내에서 본문 텍스트 스트림(Section)을 찾을 수 없습니다.');
      }
      
      // Section 엔트리 이름 정렬 (Section0, Section1 ... 순)
      sectionEntries.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
      
      let fallbackText = '';
      
      for (const entry of sectionEntries) {
        const streamData = new Uint8Array(entry.content);
        let decrypted: Uint8Array;
        
        try {
          // 💡 zlib 표준 inflate
          decrypted = pako.inflate(streamData);
        } catch (e) {
          try {
            // 💡 zlib raw inflate
            decrypted = pako.inflateRaw(streamData);
          } catch (e2) {
            try {
              // 💡 HWP 2바이트 헤더 제거 후 raw inflate
              decrypted = pako.inflateRaw(streamData.subarray(2));
            } catch (e3) {
              console.error(`스트림 ${entry.name} 압축 해제 실패:`, e3);
              continue;
            }
          }
        }
        
        // 문단 텍스트(HWPTAG_PARA_TEXT, TagId = 67) 레코드 바이트 스캔
        let offset = 0;
        while (offset < decrypted.length) {
          if (offset + 4 > decrypted.length) break;
          
          const header = decrypted[offset] | 
                         (decrypted[offset + 1] << 8) | 
                         (decrypted[offset + 2] << 16) | 
                         (decrypted[offset + 3] << 24);
          offset += 4;
          
          const tagId = header & 0x3ff;
          let recordSize = (header >> 20) & 0xfff;
          
          if (recordSize === 0xfff) {
            if (offset + 4 > decrypted.length) break;
            recordSize = decrypted[offset] | 
                         (decrypted[offset + 1] << 8) | 
                         (decrypted[offset + 2] << 16) | 
                         (decrypted[offset + 3] << 24);
            offset += 4;
          }
          
          if (offset + recordSize > decrypted.length) break;
          const recordData = decrypted.subarray(offset, offset + recordSize);
          offset += recordSize;
          
          if (tagId === 67) { // HWPTAG_PARA_TEXT (문단 텍스트 레코드)
            let textSegment = '';
            let hasTableDelimiter = false;
            
            // 💡 [인라인 컨트롤 및 테이블 경계자 1차 스캔]
            // 먼저 문단 전체를 훑어서 표 경계 코드가 포함되어 있는지 확인합니다.
            for (let i = 0; i < recordData.length; i += 2) {
              if (i + 1 >= recordData.length) break;
              const charCode = recordData[i] | (recordData[i+1] << 8);
              if (charCode === 24 || charCode === 25) {
                hasTableDelimiter = true;
                break;
              }
            }
            
            for (let i = 0; i < recordData.length; i += 2) {
              if (i + 1 >= recordData.length) break;
              const charCode = recordData[i] | (recordData[i+1] << 8);
              
              // 💡 [인라인 컨트롤 스킵 알고리즘 개량]
              // 24(셀 경계), 25(행 경계)는 표의 구조를 파악해야 하므로 스킵하지 않고 파싱합니다.
              if (charCode > 0 && charCode < 32 && 
                  charCode !== 9 && charCode !== 10 && charCode !== 13 && 
                  charCode !== 24 && charCode !== 25) {
                if (charCode === 11) {
                  // 💡 [TOC/목차 그림 밀림 방지 가드]
                  // 현재 문단 텍스트(textSegment)나 지금까지 수집된 본문(fallbackText)의 끝자락에
                  // 목차(차례), 페이지 점선(....) 등이 감지되면, 플레이스홀더를 심지 않고 스킵합니다.
                  const lastFallbackSlice = fallbackText.substring(Math.max(0, fallbackText.length - 150));
                  const isTocZone = textSegment.includes('차례') || 
                                     textSegment.includes('목차') || 
                                     textSegment.includes('.....') || 
                                     textSegment.includes('…') ||
                                     lastFallbackSlice.includes('차례') ||
                                     lastFallbackSlice.includes('목차') ||
                                     lastFallbackSlice.includes('.....') ||
                                     /[\.·…\s]{4,}\d+$/.test(textSegment.trim()) ||
                                     /[\.·…\s]{4,}\d+$/.test(lastFallbackSlice.trim());
                  
                  if (!isTocZone) {
                    // 그림 앵커 지시자 자리에 임시 플레이스홀더 심기
                    textSegment += `\n\n::HWP_IMAGE_PLACEHOLDER::\n\n`;
                  }
                }
                // 12바이트 데이터 영역 패스 (16비트 인덱스로는 6만큼 i를 가산)
                i += 12;
                continue;
              }
              
              if (charCode === 24) {
                textSegment += ' | ';
              } else if (charCode === 25) {
                textSegment += ' |\n| ';
              } else if (charCode === 9) {
                textSegment += '\t';
              } else if (charCode === 10 || charCode === 13) {
                // 💡 표(Table) 내부에서는 개행 문자(\n)가 셀을 깨뜨리므로 공백으로 정제 치환하고, 일반 문단일 때만 개행으로 적용합니다.
                if (hasTableDelimiter) {
                  textSegment += ' ';
                } else {
                  textSegment += '\n';
                }
              } else if (charCode >= 32 && charCode !== 0x3000 && charCode !== 0xFEFF) {
                textSegment += String.fromCharCode(charCode);
              }
            }
            
            // 💡 만약 문단 내에 표 경계자가 검출되었다면, 행의 시작/끝을 파이프(|) 기호로 감싸주고 단일 개행으로 정합합니다.
            if (hasTableDelimiter && textSegment.trim()) {
              let tableLine = textSegment.trim();
              
              // 내부의 다중 파이프 및 양끝 공백 정합
              tableLine = tableLine.replace(/[\r\n]+/g, ' '); // 표 행 내부 줄바꿈 완전 제거
              if (!tableLine.startsWith('|')) tableLine = '| ' + tableLine;
              if (!tableLine.endsWith('|')) tableLine = tableLine + ' |';
              
              textSegment = tableLine;
            }
            
            if (textSegment.trim()) {
              if (hasTableDelimiter) {
                // 표 행은 빈 줄 없이 밀착하여 병합
                fallbackText += textSegment + '\n';
              } else {
                fallbackText += textSegment + '\n\n';
              }
            }
          }
        }
      }
      
      text = fallbackText;
    }

    // 💡 3단계: OLE BinData 내 첨부 이미지 디코딩 및 미디어 결합 파이프라인
    const imageTags: string[] = [];
    const imageMap: Record<number, string> = {};
    let parsedDoc = (view as any)._parsedHwpDoc;

    try {
      if (parsedDoc && parsedDoc.info && parsedDoc.info.binData && parsedDoc.info.binData.length > 0 && imageSaveCallback) {
        // hwp.js가 성공적으로 파싱한 경우, 해제된 이미지를 그대로 사용
        const binDataArray = parsedDoc.info.binData;
        for (let i = 0; i < binDataArray.length; i++) {
          const image = binDataArray[i];
          if (!image || !image.payload) continue;
          
          const base64 = Buffer.from(image.payload).toString('base64');
          const ext = (image.extension || 'png').toLowerCase();
          let mimeType = 'image/png';
          if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
          else if (ext === 'bmp') mimeType = 'image/bmp';
          else if (ext === 'gif') mimeType = 'image/gif';
          else if (ext === 'webp') mimeType = 'image/webp';
          else if (ext === 'svg') mimeType = 'image/svg+xml';
          
          try {
            const src = await imageSaveCallback(base64, mimeType);
            const imgTag = `<img src="${src}" alt="image_${i}" style="max-width: 100%; height: auto;" />`;
            imageTags.push(imgTag);
            imageMap[i] = imgTag;
          } catch (e) {
            console.error('이미지 저장 콜백 실패 (hwp.js):', e);
          }
        }
      } else {
        // fallbackText 등을 탔거나 binData가 비어있는 경우 OLE CFB로 강제 추출
        const cfb = await import('cfb');
        const pako = (await import('pako')).default;
        const cfbFile = cfb.read(view, { type: 'array' });
        const imageEntries = cfbFile.FileIndex.filter((entry: any) => 
          entry.type === 2 && 
          (
            entry.name.toLowerCase().includes('bindata') ||
            entry.name.toLowerCase().includes('bin00') ||
            /bin\d+/i.test(entry.name)
          ) && 
          entry.size > 0 &&
          !entry.name.toLowerCase().endsWith('.wmf')
        );
        
        imageEntries.sort((a: any, b: any) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
        
        if (imageEntries.length > 0 && imageSaveCallback) {
          for (const entry of imageEntries) {
            const streamData = new Uint8Array(entry.content);
            let decrypted: Uint8Array;
            try { decrypted = pako.inflate(streamData); }
            catch {
              try { decrypted = pako.inflateRaw(streamData); }
              catch {
                try { decrypted = pako.inflateRaw(streamData.subarray(2)); }
                catch (err) { decrypted = streamData; }
              }
            }
            
            const base64 = Buffer.from(decrypted).toString('base64');
            const ext = entry.name.split('.').pop()?.toLowerCase() || 'png';
            let mimeType = 'image/png';
            if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
            else if (ext === 'bmp') mimeType = 'image/bmp';
            else if (ext === 'gif') mimeType = 'image/gif';
            else if (ext === 'webp') mimeType = 'image/webp';
            else if (ext === 'svg') mimeType = 'image/svg+xml';
            
            try {
              const src = await imageSaveCallback(base64, mimeType);
              const imgTag = `<img src="${src}" alt="${entry.name.split('/').pop()}" style="max-width: 100%; height: auto;" />`;
              imageTags.push(imgTag);
              
              // HEX ID 추출 (예: BIN000A.bmp -> A -> 10)
              const binMatch = entry.name.match(/bin0*([0-9a-f]+)\./i);
              if (binMatch) {
                const binId = parseInt(binMatch[1], 16) - 1; // 1-based index in file -> 0-based binID
                imageMap[binId] = imgTag;
              }
            } catch (saveError) {
              console.error('이미지 저장 콜백 실패 (CFB):', saveError);
            }
          }
        }
      }
    } catch (cfbError) {
      console.warn('이미지 추출 실패:', cfbError);
    }
    
    // 💡 이미지 플레이스홀더 치환 (매핑된 binID 우선, 나머지는 순차)
    let replacedText = text;
    
    // 1. binID 매핑된 플레이스홀더 치환
    for (const [binId, imgTag] of Object.entries(imageMap)) {
      const ph = `::HWP_IMAGE_PLACEHOLDER_${binId}::`;
      replacedText = replacedText.replaceAll(ph, imgTag);
    }
    
    // 2. 매핑되지 못한 남은 특정 ID 플레이스홀더 정리
    replacedText = replacedText.replace(/::HWP_IMAGE_PLACEHOLDER_\d+::/g, '');
    
    // 3. 범용 플레이스홀더 (fallbackText 등에서 삽입한 경우) 순차 치환
    let imageIdx = 0;
    while (replacedText.includes('::HWP_IMAGE_PLACEHOLDER::') && imageIdx < imageTags.length) {
      replacedText = replacedText.replace('::HWP_IMAGE_PLACEHOLDER::', imageTags[imageIdx]);
      imageIdx++;
    }
    replacedText = replacedText.replaceAll('::HWP_IMAGE_PLACEHOLDER::', ''); 
    
    // 💡 남은 이미지는 하단 첨부 이미지 목록에 순차 나열
    // (이미 맵핑에 사용된 태그도 남을 수 있으나, 보통 fallback일때만 발생함)
    if (imageIdx < imageTags.length && !parsedDoc) {
      replacedText += '\n\n---\n### 📎 첨부 이미지 목록\n\n';
      for (let i = imageIdx; i < imageTags.length; i++) {
        replacedText += imageTags[i] + '\n\n';
      }
    }
    replacedText = replacedText.replace(/\n{3,}/g, '\n\n');

    const lines = replacedText.split('\n');
    let isInTable = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('|') && line.endsWith('|')) {
        if (!isInTable) {
          // 표의 시작 감지! 열(Column) 개수를 세어 구분선 구성
          const colCount = line.split('|').length - 2; // 양 끝 제외한 열 개수
          if (colCount > 0) {
            const separator = '|' + Array(colCount).fill('---').join('|') + '|';
            lines.splice(i + 1, 0, separator);
            i++; // 삽입된 구분선 인덱스 패스
          }
          isInTable = true;
        }
      } else if (line === '') {
        // 빈 줄을 만나면 표 구역 종료
        isInTable = false;
      } else {
        isInTable = false;
      }
    }
    replacedText = lines.join('\n');
    
    text = replacedText;
    return text.trim() || '[HWP 텍스트 추출에 실패했습니다 (지원하지 않는 포맷일 수 있습니다)]';
  } catch (error: any) {
    console.error('HWP Import Error:', error);
    
    const errorMsg = String(error?.message || error || '');
    
    // 이미 custom 에러를 던진 경우 그대로 전파 (중복 래핑 방지)
    if (errorMsg.includes('HWPX') || errorMsg.includes('복합 문서') || errorMsg.includes('올바른 한글 문서')) {
      throw error;
    }
    
    if (errorMsg.includes('invalid block type') || errorMsg.includes('incorrect header check') || errorMsg.includes('inflate') || errorMsg.includes('zlib')) {
      throw new Error(
        '한글 문서(HWP)의 내부 데이터 압축을 푸는 중 오류가 발생했습니다.\n\n' +
        '암호화되거나 배포용 문서로 잠금 설정된 파일일 수 있습니다. ' +
        '또는 HWPX 파일의 확장자만 수동으로 .hwp로 변경한 파일일 수 있으니 일반 HWP로 다른 이름으로 저장하여 업로드해 주세요.'
      );
    }
    
    throw new Error(error?.message || String(error) || '한글 파일(HWP)을 읽는 중 오류가 발생했습니다.');
  }
}
