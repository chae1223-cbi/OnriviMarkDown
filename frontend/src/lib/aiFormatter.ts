// ====================================================================
// 🚀 [OMD-LIB-AiFormatter-0001] aiFormatter
// 📝 @KICK : 추출된 원본 텍스트를 AI를 통해 구조화된 마크다운으로 변환
// 🚨 @PATCH : **2026-09-12** — [모든 AI 질의 표준 재시도 적용]: 1회 실패 후 3초 대기 -> 2회 시도 후 3초 대기 -> 3회 시도 후 최종 실패 에러 표출 규칙 및 기본 모델 gemini-3.8-flash 통일 적용
// 🚨 @PATCH : **2026-08-20** HWP 문서에서 추출된 표 데이터(뭉쳐진 텍스트)를 정확히 행/열로 분리하여 마크다운 표로 복원하도록 프롬프트 지시 강화.
// ====================================================================
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * 추출된 거친 텍스트(Raw Text)를 Gemini AI를 사용하여
 * 서식이 잘 갖춰진 마크다운(Markdown)으로 재구성(포맷팅)합니다.
 * @param rawText 외부 문서에서 추출한 원시 텍스트
 * @param apiKey Google Gemini API 키
 * @param modelName 사용할 모델 (기본: gemini-3.8-flash)
 */
export async function formatRawTextToMarkdown(
  rawText: string,
  apiKey: string,
  modelName: string = 'gemini-3.8-flash'
): Promise<string> {
  if (!apiKey) {
    throw new Error('AI API 키가 설정되지 않았습니다.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = `
당신은 마크다운(Markdown) 문서 편집 전문가입니다. 
다음 텍스트는 외부 문서(HWP, Word, PDF 등)에서 서식을 잃고 순수 텍스트만 거칠게 추출된 데이터입니다.
이 텍스트의 맥락과 구조를 유추하여, 사람이 읽기 좋고 깔끔하게 구조화된 마크다운 문서로 재구성해주세요.

요구사항:
1. 적절한 제목(Heading: #, ##, ###)을 추가하여 문단을 구분하세요.
2. 표(Table)로 보이는 데이터는 마크다운 표 형식으로 변환하세요.
3. [중요] 특히 한글(HWP) 문서에서 추출된 데이터의 경우, 표의 셀(Cell) 내용이나 단어들이 줄바꿈이나 공백 없이 하나로 뭉쳐서(예: "항목값1값2") 추출되었을 수 있습니다. 문맥을 매우 신중히 분석하여 뭉쳐진 텍스트를 논리적인 표의 행과 열로 분리해 마크다운 표로 완벽하게 복원하세요.
3. 목록(List)으로 보이는 항목들은 글머리 기호(-, *, 1. 2.)를 적용하세요.
4. 필요하다면 볼드체(**텍스트**)를 사용하여 중요 내용을 강조하세요.
5. 내용은 절대 생략하거나 임의로 지어내지 말고, 원본 텍스트에 있는 내용만 사용하여 서식만 개선하세요.
6. 원본 데이터에 HTML 이미지 태그(<img src="...">)가 포함되어 있다면 마크다운 이미지 문법인 ![이미지 설명](src 속성값) 으로 변환하여 원래 위치에 삽입하세요.
7. [매우 중요] 만약 텍스트가 거의 없고 HTML 이미지 태그만 있다면, 대화형 응답("텍스트를 입력해주세요" 등)을 절대 하지 말고, 오직 해당 HTML 이미지들을 마크다운 이미지 문법(![...](...))으로만 변환하여 출력하십시오.

[중요 규칙] 당신이 작성한 최종 마크다운 본문은 반드시 첫 시작 부분에 [출력형식] 이라는 한글 태그를 달고 시작하십시오. 이 태그 밖(앞부분)에는 당신의 생각 과정(Thinking process)이나 개요를 자유롭게 작성하셔도 좋으나, [출력형식] 태그 이하에는 오직 마크다운 형식의 최종 결과물만 출력해야 합니다.

추출된 텍스트:
=================
${rawText}
=================
`;

  try {
    let result;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        result = await model.generateContent(prompt);
        break;
      } catch (e: any) {
        if (e.message && e.message.includes('404')) {
          throw new Error(`선택하신 AI 모델 '${modelName}'을(를) 호출할 수 없습니다 (404). 상단 헤더의 모델 뱃지에서 다른 AI 모델을 직접 선택해 주세요.`);
        }
        if (attempts < maxAttempts) {
          console.warn(`[aiFormatter] '${modelName}' 변환 ${attempts}회 실패. 3초 후 재시도합니다...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
          continue;
        }
        throw e;
      }
    }
    
    if (!result) {
      throw new Error(`AI 모델 '${modelName}' 응답이 비어있습니다.`);
    }

    const response = await result.response;
    let markdown = response.text();
    
    // AI 모달(gemini.ts)과 동일한 [출력형식] 태그 기반 지능형 추출 로직 적용
    const regex = /\[\s*출력\s*형식\s*\]/g;
    let match;
    let lastMatch = null;
    
    // 여러 번 태그를 썼을 경우를 대비하여 마지막 태그 위치를 찾음
    while ((match = regex.exec(markdown)) !== null) {
      lastMatch = match;
    }
    
    if (lastMatch && lastMatch.index !== undefined) {
      markdown = markdown.substring(lastMatch.index + lastMatch[0].length).trim();
    } else {
      // 태그를 빼먹은 경우를 대비한 최후의 폴백
      const firstHeadingIndex = markdown.indexOf('# ');
      if (firstHeadingIndex > 0) {
        markdown = markdown.substring(firstHeadingIndex).trim();
      }
    }
    
    // 전체 텍스트가 마크다운 코드블럭(```)으로 완전히 감싸진 경우 껍질 제거 로직 (gemini.ts 방식)
    if (markdown.startsWith('```') && markdown.endsWith('```')) {
      markdown = markdown.replace(/^```[a-zA-Z0-9-]*\r?\n/, '');
      markdown = markdown.replace(/\r?\n```$/, '');
    }
    
    return markdown.trim();
  } catch (error: any) {
    console.error('AI Formatting Error:', error);
    throw new Error(`AI 변환 실패: ${error.message || '알 수 없는 오류'}`);
  }
}
