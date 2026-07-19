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
      return await importHwp(arrayBuffer);
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
    } else {
      // 텍스트 추출 방식 사용
      result = await mammoth.extractRawText({ arrayBuffer });
    }
    return result.value;
  } catch (error: any) {
    console.error('DOCX Import Error:', error);
    throw new Error('워드 파일(DOCX)을 읽는 중 오류가 발생했습니다.');
  }
}

async function importPdf(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const MAX_PAGES = 20;
    if (pdf.numPages > MAX_PAGES) {
      throw new Error(`PDF 문서가 너무 큽니다. (현재 ${pdf.numPages}페이지 / 최대 허용 ${MAX_PAGES}페이지). 분할하여 가져와주세요.`);
    }

    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item: any) => item.str);
      text += strings.join(' ') + '\n\n';
    }
    
    return text.trim();
  } catch (error: any) {
    console.error('PDF Import Error:', error);
    throw new Error(error.message || 'PDF 파일을 읽는 중 오류가 발생했습니다.');
  }
}

async function importHwp(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const hwpDoc = hwpLib.parse(new Uint8Array(arrayBuffer), { type: 'array' });
    // hwp.js 파싱 결과를 텍스트로 단순 재귀 추출
    let text = '';
    const extractText = (obj: any) => {
      if (typeof obj === 'string') {
        // HWP 텍스트 파편들에 대해 강제로 공백을 주지 않고 그대로 잇습니다.
        // 공백은 HWP 내부에 이미 스페이스(' ')로 존재합니다.
        text += obj;
      } else if (Array.isArray(obj)) {
        obj.forEach(extractText);
      } else if (obj !== null && typeof obj === 'object') {
        if (obj.text) extractText(obj.text);
        else if (obj.chars) extractText(obj.chars);
        else Object.values(obj).forEach(extractText);
        
        // hwp.js에서 '문단(Paragraph)'을 나타내는 전형적인 속성(controls, lines 등)이 있다면
        // 해당 문단을 처리한 직후 줄바꿈을 두 번 넣어 문단을 분리해줍니다.
        if ('controls' in obj || 'lines' in obj) {
          text += '\n\n';
        }
      }
    };
    
    if (hwpDoc && hwpDoc.sections) {
      extractText(hwpDoc.sections);
    }
    return text.trim() || '[HWP 텍스트 추출에 실패했습니다 (지원하지 않는 포맷일 수 있습니다)]';
  } catch (error: any) {
    console.error('HWP Import Error:', error);
    throw new Error('한글 파일(HWP)을 읽는 중 오류가 발생했습니다.');
  }
}
