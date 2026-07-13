import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * [ONR-AI-001] Gemini API 헬퍼 유틸리티
 * @description 구글 Gemini API를 사용하여 텍스트 생성, 교정, 요약 등의 기능을 제공합니다.
 */

// API 키 유효성 검사 헬퍼
const getGenAI = (apiKey: string) => {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Gemini API Key가 설정되지 않았습니다. 환경설정에서 API 키를 입력해주세요.');
  }
  return new GoogleGenerativeAI(apiKey);
};

export const AI_ACTIONS = {
  POLISH: 'polish',
  SUMMARIZE: 'summarize',
  EXPAND: 'expand',
  TRANSLATE: 'translate',
} as const;

export type AiActionType = typeof AI_ACTIONS[keyof typeof AI_ACTIONS];

/**
 * 선택된 텍스트를 AI로 가공합니다.
 */
export const processTextWithAI = async (apiKey: string, modelName: string, text: string, action: AiActionType): Promise<string> => {
  const genAI = getGenAI(apiKey);
  // 사용자가 설정한 커스텀 모델명으로 요청
  const model = genAI.getGenerativeModel({ model: modelName || 'gemini-3.5-flash' });

  let systemPrompt = '';
  switch (action) {
    case AI_ACTIONS.POLISH:
      systemPrompt = '당신은 전문적이고 세련된 글쓰기 교정자입니다. 다음 문장의 의미를 유지하면서, 문맥을 더 매끄럽고 가독성 좋게 다듬어주세요. 마크다운 형식을 유지하고, 인사말이나 부연 설명 없이 오직 교정된 결과 텍스트만 출력하세요.';
      break;
    case AI_ACTIONS.SUMMARIZE:
      systemPrompt = '다음 텍스트의 핵심 내용을 간결하게 요약해주세요. 불필요한 서론 없이 요약된 내용만 출력하세요.';
      break;
    case AI_ACTIONS.EXPAND:
      systemPrompt = '다음 문장의 핵심 아이디어를 유지하면서, 더 풍부한 표현과 논리적인 부연 설명을 덧붙여서 길게 작성해주세요. 자연스러운 한국어로 출력하세요.';
      break;
    case AI_ACTIONS.TRANSLATE:
      systemPrompt = '다음 텍스트를 자연스럽고 전문적인 영문으로 번역해주세요. 부연 설명 없이 번역 결과만 출력하세요.';
      break;
    default:
      systemPrompt = '다음 텍스트를 적절히 개선해주세요.';
  }

  const prompt = `${systemPrompt}\n\n[원본 텍스트]:\n${text}`;

  try {
    const result = await model.generateContent(prompt);
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
    return !!text;
  } catch (error: any) {
    console.error('Gemini Connection Test Error:', error);
    throw new Error(error.message || 'Gemini 서버와 통신할 수 없습니다. 키를 다시 확인해주세요.');
  }
};
