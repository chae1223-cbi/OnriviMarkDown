import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * [ONR-AI-001] Gemini API 헬퍼 유틸리티
 * @description 구글 Gemini API를 사용하여 텍스트 생성, 교정, 요약 등의 기능을 제공합니다.
 * 🚨 @PATCH : **2026-09-05** — 사용자 지시 반영: 선택 텍스트 5대 가공(다듬기/요약/확장/번역/마크다운 변환) 레거시 기능 및 스트리밍 제거, AIDraftModal(generateDraftWithAIStream) 및 연결 테스트(testGeminiConnection) 중심으로 정예화
 *             **2026-07-15** — [출력결과] 태그 매칭 시 공백 허용 글로벌 정규식(/\[\s*출력\s*결과\s*\]/g) 및 lastMatch 추적 구조 도입 (태그 내 임의 공백 수용, AI가 초안(Draft) 작성 후 최종 출력을 위해 태그를 재출력할 시 초안을 배제하고 마지막 최종본 영역만 발라내도록 지능화)
 */

// API 키 유효성 검사 헬퍼
const getGenAI = (apiKey: string) => {
  const cleanKey = (apiKey || '').trim();
  if (!cleanKey) {
    throw new Error('Gemini API Key가 설정되지 않았습니다. 환경설정에서 API 키를 입력해주세요.');
  }
  return new GoogleGenerativeAI(cleanKey);
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
 * 도메인과 문서 종류에 맞게 맞춤형 초안을 생성하는 AI 스트리밍 함수
 */
export const generateDraftWithAIStream = async (
  apiKey: string,
  modelName: string,
  systemPrompt: string,
  userPrompt: string,
  onChunk: (chunkText: string) => void
): Promise<string> => {
  const genAI = getGenAI(apiKey);
  
  const tagRule = '\n\n[중요 규칙] 당신이 작성한 초안의 마크다운 본문은 반드시 첫 시작 부분에 [출력결과] 라는 한글 태그를 달고 시작하십시오. 이 태그 밖(앞부분)에는 당신의 생각 과정이나 개요를 영어로 자유롭게 작성하셔도 좋으나, 태그 이하에는 오직 마크다운 형식의 초안 문서만 출력해야 합니다.';
  const finalSystemPrompt = systemPrompt + tagRule;

  const model = genAI.getGenerativeModel({ 
    model: modelName || 'gemini-3.5-flash',
    systemInstruction: finalSystemPrompt
  });

  const cleanOuterCodeBlock = (val: string): string => {
    let clean = val.trim();
    if (clean.startsWith('```') && clean.endsWith('```')) {
      clean = clean.replace(/^```[a-zA-Z0-9-]*\r?\n/, '');
      clean = clean.replace(/\r?\n```$/, '');
    }
    return clean.trim();
  };

  const cleanOutputText = (raw: string, isFinished: boolean = false): string => {
    const regex = /\[\s*출력\s*결과\s*\]/g;
    let match;
    let lastMatch = null;
    while ((match = regex.exec(raw)) !== null) { lastMatch = match; }
    
    if (lastMatch && lastMatch.index !== undefined) {
      const content = raw.substring(lastMatch.index + lastMatch[0].length);
      return cleanOuterCodeBlock(content);
    }
    if (raw.length > 120 || isFinished) {
      return cleanOuterCodeBlock(raw);
    }
    return '';
  };

  try {
    const prompt = userPrompt;
    const result = await model.generateContentStream(prompt);
    let fullText = '';
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      onChunk(cleanOutputText(fullText, false));
    }
    const finalText = cleanOutputText(fullText, true);
    onChunk(finalText);
    return finalText;
  } catch (error: any) {
    console.error('Gemini Stream Error:', error);
    throw new Error(error.message || 'AI 초안 생성 중 오류가 발생했습니다.');
  }
};
