import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * [ONR-AI-001] Gemini API 헬퍼 유틸리티
 * @description 구글 Gemini API를 사용하여 텍스트 생성, 교정, 요약 등의 기능을 제공합니다.
 */

// API 키 유효성 검사 헬퍼
const getGenAI = (apiKey: string) => {
  const cleanKey = (apiKey || '').trim();
  if (!cleanKey) {
    throw new Error('Gemini API Key가 설정되지 않았습니다. 환경설정에서 API 키를 입력해주세요.');
  }
  return new GoogleGenerativeAI(cleanKey);
};

export const AI_ACTIONS = {
  POLISH: 'polish',
  SUMMARIZE: 'summarize',
  EXPAND: 'expand',
  TRANSLATE: 'translate',
  MARKDOWNIFY: 'markdownify',
} as const;

export type AiActionType = typeof AI_ACTIONS[keyof typeof AI_ACTIONS];

/**
 * 선택된 텍스트를 AI로 가공합니다.
 */
export const processTextWithAI = async (apiKey: string, modelName: string, text: string, action: AiActionType): Promise<string> => {
  const genAI = getGenAI(apiKey);
  
  let systemPrompt = '';
  switch (action) {
    case AI_ACTIONS.POLISH:
      systemPrompt = '당신은 전문적이고 세련된 글쓰기 교정자입니다. 원본 텍스트의 마크다운 서식과 의미를 유지하면서, 문맥을 더 매끄럽고 가독성 좋게 다듬어주세요. 절대 인사말, 분석 과정, 대안 리스트(Option A/B 등), 부연 설명을 넣지 말고 오직 교정된 최종 결과 텍스트만 단 한 번 출력하세요. 마크다운 외의 부수적인 영어 사족이나 생각 로그는 금지합니다.';
      break;
    case AI_ACTIONS.SUMMARIZE:
      systemPrompt = '당신은 전문 요약가입니다. 다음 텍스트의 핵심 내용을 간결하게 요약해주세요. 불필요한 설명, 대안 나열, 분석 과정 없이 오직 요약된 최종 결과만 출력하세요.';
      break;
    case AI_ACTIONS.EXPAND:
      systemPrompt = '당신은 글쓰기 전문가입니다. 문장의 핵심 아이디어를 유지하면서, 더 풍부한 표현과 논리적인 부연 설명을 덧붙여서 길게 작성해주세요. 오직 자연스러운 한국어로 완성된 결과만 출력하고 설명은 배제하세요.';
      break;
    case AI_ACTIONS.TRANSLATE:
      systemPrompt = '당신은 전문 번역가입니다. 주어진 텍스트를 가장 자연스럽고 전문적인 영어(English)로 번역해주세요. 만약 입력된 텍스트가 영어 등 외국어라면 반대로 친절하고 매끄러운 한국어(Korean)로 번역해주세요. 인사말, 부연 설명, 코드 블록 기호 없이 번역 결과만 출력하세요.';
      break;
    case AI_ACTIONS.MARKDOWNIFY:
      systemPrompt = '당신은 마크다운 글쓰기 전문가입니다. 주어진 평문 텍스트의 맥락을 분석하여 가독성이 아주 뛰어난 최적의 마크다운 형식으로 변환해주세요. 본문에 부합하도록 적절한 헤더(#, ##), 목록(-, *), 강조(**), 구분선(---), 혹은 표(|)나 인용구(>) 등을 내용에 맞게 입히되, 본래 텍스트의 핵심 정보나 의미는 절대 훼손하거나 바꾸지 마세요. 인사말, 부연 설명, 코드 블록 기호 없이 오직 변환된 마크다운 텍스트만 출력하세요.';
      break;
    default:
      systemPrompt = '주어진 텍스트를 개선해 주세요. 오직 최종 텍스트만 출력하세요.';
  }

  // 사용자가 설정한 커스텀 모델명으로 요청하되, systemInstruction 속성을 사용하여 프롬프트 주입 혼동 차단
  const model = genAI.getGenerativeModel({ 
    model: modelName || 'gemini-3.5-flash',
    systemInstruction: systemPrompt
  });

  try {
    // 시스템 프롬프트가 격리되었으므로, 사용자 입력 텍스트만 순수하게 전달
    const result = await model.generateContent(text);
    const response = await result.response;
    const finalResult = response.text();
    // 결과에 앞뒤 공백이나 불필요한 마크다운 코드블럭(```)이 섞여올 경우 제거
    return finalResult.replace(/^```[a-z]*\n?/im, '').replace(/\n?```$/im, '').trim();
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    throw new Error(error.message || 'AI 요청 중 오류가 발생했습니다.');
  }
};

/**
 * 환경설정에서 API Key 유효성을 간단하게 테스트합니다.
 */
export const testGeminiConnection = async (apiKey: string, modelName: string): Promise<boolean> => {
  try {
    const genAI = getGenAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName || 'gemini-3.5-flash' });
    // 가장 짧고 단순한 응답을 유도하여 연결만 확인
    const result = await model.generateContent("Respond with 'OK' only.");
    const text = result.response.text();
    return text.includes('OK');
  } catch (error) {
    console.error('Gemini test connection failed:', error);
    return false;
  }
};

/**
 * 선택된 텍스트를 AI로 실시간 스트리밍 가공합니다.
 */
export const processTextWithAIStream = async (
  apiKey: string,
  modelName: string,
  text: string,
  action: AiActionType,
  onChunk: (chunkText: string) => void
): Promise<string> => {
  const genAI = getGenAI(apiKey);
  
  let systemPrompt = '';
  const tagRule = ' [중요 규칙] 당신이 작성한 최종 가공 마크다운 본문은 반드시 첫 시작 부분에 [출력결과] 라는 한글 태그를 달고 시작하십시오. 이 태그 밖(앞부분)에는 당신의 생각 과정(Thinking process)이나 개요를 영어로 자유롭게 작성하셔도 좋으나, 태그 이하에는 오직 마크다운 형식의 한글 최종 결과물만 출력해야 합니다.';
  
  switch (action) {
    case AI_ACTIONS.POLISH:
      systemPrompt = '당신은 전문적인 한국어 작가이자 문장 교정자입니다. 원본 텍스트의 마크다운 서식을 완벽히 유지하면서, 한국어로 아주 매끄럽고 품격 있게 다듬어주세요.' + tagRule;
      break;
    case AI_ACTIONS.SUMMARIZE:
      systemPrompt = '당신은 전문 요약가입니다. 다음 텍스트의 핵심 내용을 친절하고 정갈한 한국어로 요약해 출력하세요.' + tagRule;
      break;
    case AI_ACTIONS.EXPAND:
      systemPrompt = '당신은 한국어 작가입니다. 문장의 핵심 아이디어를 유지하면서, 풍부한 한글 표현과 설명을 덧붙여 문단을 길게 완성해주세요.' + tagRule;
      break;
    case AI_ACTIONS.TRANSLATE:
      systemPrompt = '당신은 전문 번역가입니다. 주어진 텍스트를 가장 자연스럽고 전문적인 영어(English)로 번역해주세요. 만약 입력된 텍스트가 영어 등 외국어라면 반대로 한국어(Korean)로 번역해 출력하십시오.' + tagRule;
      break;
    case AI_ACTIONS.MARKDOWNIFY:
      systemPrompt = '당신은 마크다운 글쓰기 전문가입니다. 주어진 평문 텍스트의 맥락을 분석하여 가독성이 가장 뛰어난 최적의 마크다운 형식으로 정돈해 출력하십시오.' + tagRule;
      break;
    default:
      systemPrompt = '당신은 정교하고 유능한 한국어 문서 가공 비서입니다. 사용자의 구체적인 명령과 요구사항(예: 맞춤법만 고쳐달라거나, 번역해달라거나, 요약해달라거나)에 정확하고 성실하게 순응하십시오. 임의로 살을 붙여 내용을 길게 늘리지 말고 오직 사용자가 명한 가공 작업만 깨끗하게 완료한 최종 결과 한글 텍스트를 제공해야 합니다.' + tagRule;
  }

  // SDK 공식 가이드라인 규격인 단일 String 형태로 주입하여 모델의 시스템 지침 해석 오작동 방지
  const model = genAI.getGenerativeModel({ 
    model: modelName || 'gemini-3.5-flash',
    systemInstruction: systemPrompt
  });

  // 생각 로그(CoT) 및 안내 사족을 물리적으로 안전하게 발라내는 정제 함수 ([출력결과] 태그 이하 추출)
  const cleanOutputText = (raw: string): string => {
    // 줄의 시작 부분에 단독 라인으로 존재하는 [출력결과] 태그를 수색 (문장 중간의 설명용 텍스트 매칭 차단)
    const regex = /^\[출력결과\]/m;
    const match = regex.exec(raw);
    
    if (match && match.index !== undefined) {
      const content = raw.substring(match.index + match[0].length);
      return content.replace(/^```[a-z]*\n?/im, '').replace(/\n?```$/im, '').trim();
    }

    // 💡 [지능형 폴백 가드] 누적 스트리밍 텍스트가 120자 이상 쌓였음에도 [출력결과] 태그가 없다면,
    // AI가 태그 지침을 빠뜨리고 본론을 다이렉트로 적는 것으로 판단하여 무한 대기를 차단하고 원본 전체를 표출합니다.
    if (raw.length > 120) {
      return raw.replace(/^```[a-z]*\n?/im, '').replace(/\n?```$/im, '').trim();
    }

    // 마커가 아직 들어오지 않은 생각 흐름(CoT) 구간은 사용자 화면에 노출하지 않고 빈 문자로 대기 유도
    return '';
  };


  try {
    const result = await model.generateContentStream(text);
    let fullText = '';
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      onChunk(cleanOutputText(fullText));
    }
    return cleanOutputText(fullText);
  } catch (error: any) {
    console.error('Gemini Stream Error:', error);
    throw new Error(error.message || 'AI 스트리밍 요청 중 오류가 발생했습니다.');
  }
};
