import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * [ONR-AI-001] Gemini API 헬퍼 유틸리티
 * 🚨 @PATCH : **2026-09-12** — [Gemma 공식 식별자(gemma-2) 동기화 및 500 내부 오류 진단 & systemInstruction 호환]
 *             1) Gemma 모델 식별자를 구글 공식 모델(gemma-2-27b-it, gemma-2-9b-it)로 정정
 *             2) 구글 API에서 systemInstruction을 지원하지 않는 Gemma 계열 모델 호출 시 시스템 프롬프트를 유저 프롬프트로 통합 주입하여 500 오류 방어
 *             3) Google AI 서버 500 Internal Error 발생 시 직관적인 한국어 진단 및 안정 플래그십(Gemini 3.8/2.5 Flash) 변경 안내 제공
 * 🚨 @PATCH : **2026-09-12** — [AI 모델 단일 소스(SSOT) 표준화]: 환경설정, 에디터 하단 팝오버, AI 생성 모달 간 불일치를 원천 방지하기 위해 공인 10대 모델(ONRIVI_AI_MODELS, DEFAULT_AI_MODEL) 중앙 정의 및 내보내기
 *             **2026-09-12** — [사용자 직접 선택 존중: 임의 모델 자동 폴백 전면 제거 및 명확한 오류 진단창 노출]
 *             1) 시스템 임의 모델 자동 폴백(gemini-2.5-flash 등) 전면 제거: 사용자가 지정한 모델만 호출하고, 실패 시 숨기거나 임의 전환하지 않고 사용자에게 정확한 오류 원인과 조치 방법을 화면에 즉시 노출
 *             2) Google 503 / 스트림 파싱 에러(Failed to parse stream)를 명확한 'Google AI 서버 503 과부하'로 진단하여 하단 모델 선택기에서 안정 모델로 변경할 수 있도록 안내
 *             3) @google/generative-ai result.response catch 가드 유지로 브라우저 Uncaught rejection 방어
 *             **2026-09-12** — 스트리밍 출력 정제기(cleanOutputText) 내 상단 메타데이터(YAML Frontmatter `--- ... ---`, JSDoc 파일 주석 등) 자동 스트립 및 메타정보 추출 원천 차단 규칙 적용; Google Gemini 503(일시적 트래픽 폭증/High Demand) 및 429(할당량) 발생 시 1.5초 지연 1회 자동 재시도 로직 구축, 실패 시 명확한 한국어 진단 메시지(503/429/404/400) 변환 투척으로 사용자 조치 가이드 제공; 기본 모델 식별자 gemini-3.8-flash 정합성 유지
 * **2026-09-05** — 사용자 지시 반영: 선택 텍스트 5대 가공(다듬기/요약/확장/번역/마크다운 변환) 레거시 기능 및 스트리밍 제거, AIDraftModal(generateDraftWithAIStream) 및 연결 테스트(testGeminiConnection) 중심으로 정예화
 * **2026-07-15** — [출력결과] 태그 매칭 시 공백 허용 글로벌 정규식(/\[\s*출력\s*결과\s*\]/g) 및 lastMatch 추적 구조 도입 (태그 내 임의 공백 수용, AI가 초안(Draft) 작성 후 최종 출력을 위해 태그를 재출력할 시 초안을 배제하고 마지막 최종본 영역만 발라내도록 지능화)
 */

export interface OnriviAIModelItem {
  id: string;
  name: string;
  label: string;
  desc?: string;
  badge?: string;
}

export const ONRIVI_AI_MODELS: OnriviAIModelItem[] = [
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', label: '👑 Gemini 3.8 Flash (최신 최고 버전 / 초고속 플래그십)', desc: '최신 플래그십 / 초고속', badge: '최신' },
  { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash', label: '⚡ Gemini 3.7 Flash (차세대 고성능 모델)', desc: '차세대 고성능 모델', badge: '추천' },
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', label: '🛡️ Gemini 3.6 Flash (고성능 안정화 모델)', desc: '고성능 안정화 모델' },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', label: '💡 Gemini 3.5 Flash (지능형 균형 모델)', desc: '지능형 균형 모델' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', label: '🪶 Gemini 3.1 Flash Lite (초경량 초고속 응답)', desc: '초경량 초고속 응답' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', label: '🚀 Gemini 2.5 Flash (최신 공인 안정 플래그십)', desc: '최신 공인 안정 플래그십', badge: '안정' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', label: '📦 Gemini 1.5 Flash (글로벌 공인 표준 모델)', desc: '글로벌 공인 표준 모델' },
  { id: 'gemma-2-27b-it', name: 'Gemma 2 27B IT', label: '💎 Gemma 2 27B IT (고성능 오픈 모델)', desc: '고성능 오픈 모델' },
  { id: 'gemma-2-9b-it', name: 'Gemma 2 9B IT', label: '💎 Gemma 2 9B IT (경량 오픈 모델)', desc: '경량 오픈 모델' },
];

export const DEFAULT_AI_MODEL = 'gemini-3.8-flash';

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
    const modelsToTest = [modelName || 'gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];
    for (const m of modelsToTest) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        const result = await model.generateContent("Respond with 'OK' only.");
        const text = result.response.text();
        if (text.includes('OK')) return true;
      } catch (innerErr: any) {
        const msg = String(innerErr?.message || '').toLowerCase();
        // 키 자체가 잘못된 경우(400, 401, 403) 즉시 false 반환
        if (innerErr?.status === 400 || innerErr?.status === 401 || innerErr?.status === 403 || msg.includes('api_key') || msg.includes('invalid')) {
          return false;
        }
      }
    }
    return false;
  } catch (error) {
    console.error('Gemini test connection failed:', error);
    return false;
  }
};

export interface FormattedAIError {
  title: string;
  description: string;
  solution: string;
  category: 'high_demand' | 'rate_limit' | 'auth' | 'not_found' | 'network' | 'unknown';
}

/**
 * 기술적인 원시 오류(503, 429, API 스택 등)를 사용자가 직관적으로 인식할 수 있는 한국어 안내로 변환합니다.
 */
export function formatUserFriendlyAIError(error: any, modelName: string): FormattedAIError {
  const msg = String(error?.message || error || '').toLowerCase();
  const status = error?.status;
  const isStreamParseError = msg.includes('failed to parse stream') || msg.includes('parse stream');

  // 1. Google 서버 일시적 과부하 및 500 내부 오류 (500, 503 / high demand / spikes in demand / stream parse failure)
  if (
    status === 500 ||
    status === 503 ||
    msg.includes('500') ||
    msg.includes('503') ||
    msg.includes('internal error') ||
    msg.includes('high demand') ||
    msg.includes('spikes in demand') ||
    msg.includes('overloaded') ||
    msg.includes('service unavailable') ||
    isStreamParseError
  ) {
    return {
      title: 'Google AI 서버 일시 오류 / 과부하 (500/503)',
      description: `현재 Google AI 서버에서 '${modelName}' 모델 처리 중 일시적인 서버 오류(500) 또는 과부하(503)가 발생했습니다.`,
      solution: '하단 AI 모델 선택기에서 안정적인 공인 플래그십 모델(Gemini 3.8 Flash 또는 Gemini 2.5 Flash)로 변경하시면 즉시 작성하실 수 있습니다.',
      category: 'high_demand'
    };
  }

  // 2. 요청 한도 초과 (429 / Quota / Rate limit)
  if (
    status === 429 ||
    msg.includes('429') ||
    msg.includes('quota') ||
    msg.includes('rate limit') ||
    msg.includes('resource_exhausted')
  ) {
    return {
      title: 'API 무료 호출 한도 초과',
      description: 'Google Gemini API의 단시간 요청 한도(Quota)를 모두 소모했습니다.',
      solution: '약 1~2분 정도 잠시 기다리신 후 다시 시도해 주시기 바랍니다.',
      category: 'rate_limit'
    };
  }

  // 3. API 키 미등록 또는 인증 실패 (400, 401, 403, API_KEY_INVALID)
  if (
    status === 400 ||
    status === 401 ||
    status === 403 ||
    msg.includes('api_key') ||
    msg.includes('api key') ||
    msg.includes('unauthorized') ||
    msg.includes('permission_denied')
  ) {
    return {
      title: 'API 키 인증 오류',
      description: '입력된 Google Gemini API 키가 올바르지 않거나 사용 권한이 만료되었습니다.',
      solution: '에디터 환경설정에서 유효한 Gemini API 키를 다시 입력해 주세요.',
      category: 'auth'
    };
  }

  // 4. 모델 미지원 / 404 (Not Found)
  if (status === 404 || msg.includes('404') || msg.includes('not found') || msg.includes('unsupported')) {
    return {
      title: '선택하신 AI 모델 사용 불가',
      description: `'${modelName}' 모델을 Google API에서 찾을 수 없거나 현재 지원되지 않는 식별자입니다.`,
      solution: '하단 AI 모델 목록에서 Gemini 2.5 Flash 등 서비스 중인 공식 모델을 선택해 주세요.',
      category: 'not_found'
    };
  }

  // 5. 네트워크 통신 오류 (Offline / Fetch failed)
  if (msg.includes('fetch failed') || msg.includes('network') || msg.includes('offline') || msg.includes('failed to fetch')) {
    return {
      title: '네트워크 연결 상태 확인 필요',
      description: '인터넷 연결이 원활하지 않아 Google AI 서버와 통신하지 못했습니다.',
      solution: 'PC의 인터넷 연결을 확인하신 후 다시 시도해 주세요.',
      category: 'network'
    };
  }

  // 6. 기타 오류 (기술적인 스택/URL/라이브러리명 정제)
  const cleanMsg = msg
    .replace(/https?:\/\/[^\s]+/g, '')
    .replace(/\[googlegenerativeai error\]:?/gi, '')
    .replace(/error fetching from/gi, '')
    .replace(/google_genai_error/gi, '')
    .trim();

  return {
    title: 'AI 응답 생성 일시 지연',
    description: cleanMsg || 'AI 서버 응답 처리 중 일시적인 지연이 발생했습니다.',
    solution: '잠시 후 다시 시도하시거나 하단에서 다른 AI 모델을 선택해 주세요.',
    category: 'unknown'
  };
}

/**
 * 도메인과 문서 종류에 맞게 맞춤형 초안을 생성하는 AI 스트리밍 함수
 * 🛡️ 사용자가 지정한 모델만 호출하며, 실패 시 임의로 모델을 바꿔치기하지 않고 명확한 오류 진단을 반환합니다.
 */
export const generateDraftWithAIStream = async (
  apiKey: string,
  modelName: string,
  systemPrompt: string,
  userPrompt: string,
  onChunk: (chunkText: string) => void
): Promise<string> => {
  const genAI = getGenAI(apiKey);
  const targetModelName = modelName || 'gemini-3.8-flash';
  
  const tagRule = '\n\n[중요 규칙]\n1. 당신이 작성한 초안의 마크다운 본문은 반드시 첫 시작 부분에 [출력결과] 라는 한글 태그를 달고 시작하십시오. 이 태그 밖(앞부분)에는 당신의 생각 과정이나 개요를 영어로 자유롭게 작성하셔도 좋으나, 태그 이하에는 오직 마크다운 형식의 초안 문서만 출력해야 합니다.\n2. [메타정보 추출 금지] 원본 문서나 참고 자료 상단의 메타데이터(YAML Frontmatter `--- ... ---`, 문서 속성, 작성자/작성일 등)는 절대로 추출하거나 출력물 상단에 복제하지 마십시오. 본문의 실제 제목 헤딩(#)이나 첫 단락부터 곧바로 작성하십시오.';
  const finalSystemPrompt = systemPrompt + tagRule;

  const cleanOuterCodeBlock = (val: string): string => {
    let clean = val.trim();
    if (clean.startsWith('```') && clean.endsWith('```')) {
      clean = clean.replace(/^```[a-zA-Z0-9-]*\r?\n/, '');
      clean = clean.replace(/\r?\n```$/, '');
    }
    return clean.trim();
  };

  const stripLeadingMeta = (val: string, isFinished: boolean): string => {
    let clean = val.trim();
    // 1. YAML Frontmatter (--- ... ---) 제거
    if (clean.startsWith('---')) {
      const match = clean.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
      if (match) {
        clean = clean.substring(match[0].length).trim();
      } else if (isFinished) {
        // 생성이 종료되었는데도 닫히지 않은 단일 --- 메타 블록인 경우 제거
        clean = clean.replace(/^---[^\n]*\r?\n?/, '').trim();
      } else {
        // 스트리밍 중 아직 --- 가 닫히지 않은 상태면 메타데이터 노출 방지를 위해 빈 문자열 반환
        return '';
      }
    }
    // 2. JSDoc 스타일 파일 주석 (/** ... */) 제거
    if (clean.startsWith('/**')) {
      const match = clean.match(/^\/\*\*[\s\S]*?\*\/\r?\n?/);
      if (match) {
        clean = clean.substring(match[0].length).trim();
      } else if (!isFinished) {
        return '';
      }
    }
    return clean;
  };

  const cleanOutputText = (raw: string, isFinished: boolean = false): string => {
    const regex = /\[\s*출력\s*결과\s*\]/g;
    let match;
    let lastMatch = null;
    while ((match = regex.exec(raw)) !== null) { lastMatch = match; }
    
    let content = '';
    if (lastMatch && lastMatch.index !== undefined) {
      content = raw.substring(lastMatch.index + lastMatch[0].length);
    } else if (raw.length > 120 || isFinished) {
      content = raw;
    } else {
      return '';
    }

    const unblocked = cleanOuterCodeBlock(content);
    return stripLeadingMeta(unblocked, isFinished);
  };

  const isGemma = targetModelName.toLowerCase().startsWith('gemma');
  const modelOptions: any = { 
    model: targetModelName,
  };
  if (!isGemma) {
    modelOptions.systemInstruction = finalSystemPrompt;
  }
  const effectiveUserPrompt = isGemma 
    ? `${finalSystemPrompt}\n\n${userPrompt}` 
    : userPrompt;

  const modelInstance = genAI.getGenerativeModel(modelOptions);

  let attempts = 0;
  const maxAttempts = 2; // 일시적 통신 지연(503 High Demand / 429) 시 동일 모델 1회 자동 재시도 (타 모델 임의 전환 일체 없음)

  while (attempts < maxAttempts) {
    try {
      attempts++;
      const result = await modelInstance.generateContentStream(effectiveUserPrompt);
      // 🛡️ [크리티컬 가드] @google/generative-ai 내부의 result.response 프로미스가 스트림 도중 거부될 때
      // 브라우저에서 'Uncaught (in promise) Failed to parse stream' 에러가 발생하는 현상을 방어하기 위해 catch 핸들러 사전 부착
      result.response?.catch(() => {});

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
      const status = error?.status;
      const msg = String(error?.message || '').toLowerCase();
      const isStreamParseError = msg.includes('failed to parse stream') || msg.includes('parse stream');
      const isTransient = status === 429 || status === 503 ||
        msg.includes('429') || msg.includes('503') || msg.includes('high demand') ||
        msg.includes('overloaded') || msg.includes('service unavailable') || isStreamParseError;

      // 동일 모델 1회 재시도
      if (isTransient && attempts < maxAttempts) {
        console.warn(`[GeminiStream] '${targetModelName}' 모델 일시적 지연/과부하 (${status || '503'}). 1.2초 후 1회 재시도합니다...`);
        await new Promise(resolve => setTimeout(resolve, 1200));
        continue;
      }

      console.error('Gemini Stream Error:', error);
      const diagnosed = formatUserFriendlyAIError(error, targetModelName);
      const friendlyError = new Error(diagnosed.description);
      (friendlyError as any).diagnosed = diagnosed;
      throw friendlyError;
    }
  }

  throw new Error(`AI 호출 실패: '${targetModelName}' 모델이 응답하지 않았습니다.`);
};
