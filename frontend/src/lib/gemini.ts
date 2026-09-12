import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * [ONR-AI-001] Gemini API 헬퍼 유틸리티
 * 🚨 @PATCH : **2026-09-12** — [모든 AI 질의 표준 재시도 주기 적용: 1회 실패 시 3초 대기 -> 2회차 시도 -> 실패 시 3초 대기 -> 3회차 시도 최종 실패 시 에러 메시지 표출]:
 *             1) 3초 주기 3회 재시도 규칙 확립: 1차 실패 후 3000ms 대기, 2차 실패 후 3000ms 대기, 3차 최종 실패 시에만 사용자 에러 팝업을 표출하는 표준 루프 전면 적용
 *             2) 500 내부 오류(Internal Error), 503, 429, 네트워크 지연 등 통신 오류 전반을 재시도 대상에 편입하고 비정상 상태 시 즉각 에러 팝업 방어
 *             3) 스트림 단절/파싱 에러(Failed to parse stream) 발생 시 동일 모델 기반 단일 완성형(generateContent) 무결성 대체 자동 호출로 스트림 패킷 누락 시에도 최종 결과 정상 수신 보장
 *             4) 오류 진단 메시지 내 권장 플래그십 안내(Gemini 3.8 Flash, 3.7 Flash) 최신화 및 Gemma 오픈 모델 자원 특성 친절 안내
 * 🚨 @PATCH : **2026-09-12** — [Gemma 공식 식별자(gemma-2) 동기화 및 500 내부 오류 진단 & systemInstruction 호환]
 *             1) Gemma 모델 식별자를 구글 공식 모델(gemma-2-27b-it, gemma-2-9b-it)로 정정
 *             2) 구글 API에서 systemInstruction을 지원하지 않는 Gemma 계열 모델 호출 시 시스템 프롬프트를 유저 프롬프트로 통합 주입하여 500 오류 방어
 *             3) Google AI 서버 500 Internal Error 발생 시 직관적인 한국어 진단 및 안정 플래그십(Gemini 3.8/2.5 Flash) 변경 안내 제공
 * 🚨 @PATCH : **2026-09-12** — [순수 텍스트/대화 생성 LLM 한정 및 비LLM 모델 전면 차단]:
 *             1) 모델 필터 강화: 이미지 생성(Imagen), 비디오(Veo), 음성/TTS, 오디오, 임베딩(embedding), AQA, 로보틱스 등 비대화형/비LLM 모델 목록 진입 원천 배제
 *             2) 오직 Google 공식 텍스트/코드 생성 LLM 계열(Gemini 3.5+ 및 Gemma 4+)만 추출하여 모델 목록 정제
 * 🚨 @PATCH : **2026-09-12** — [Google AI Studio 공식 모델 한정 및 Gemini 3.1 이하 전면 제거, 동적 모델 탐색 반영]:
 *             1) 구글 AI 스튜디오 적용 공식 모델로 한정: Gemini 3.1 이하 버전(gemini-3.1-flash-lite, 2.5, 2.0, 1.5) 및 구형 Gemma(gemma-2) 완전 제거
 *             2) 공식 모델 라인업 갱신: Gemini 3.8/3.7/3.6/3.5 Flash 및 Google DeepMind 최신 오픈 모델 Gemma 4(gemma-4-31b-it, gemma-4-26b-a4b-it) 반영
 *             3) 하드코딩 탈피 및 동적 모델 탐색: fetchGoogleAIStudioModels를 통해 Google Generative Language API(v1beta/models) 실시간 질의 및 캐싱 연동
 *             4) 구버전 저장 모델 자동 정규화(normalizeAIModelName): 로컬스토리지에 기존 <= 3.1 모델 잔존 시 기본 플래그십(gemini-3.8-flash)으로 즉시 무해 전환
 * 🚨 @PATCH : **2026-09-12** — [AI 모델 단일 소스(SSOT) 표준화]: 환경설정, 에디터 하단 팝오버, AI 생성 모달 간 불일치를 원천 방지하기 위해 공인 모델(ONRIVI_AI_MODELS, DEFAULT_AI_MODEL) 중앙 정의 및 내보내기
 * 🚨 @PATCH : **2026-09-12** — [사용자 직접 선택 존중: 임의 모델 자동 폴백 전면 제거 및 명확한 오류 진단창 노출]
 *             1) 시스템 임의 모델 자동 폴백(gemini-2.5-flash 등) 전면 제거: 사용자가 지정한 모델만 호출하고, 실패 시 숨기거나 임의 전환하지 않고 사용자에게 정확한 오류 원인과 조치 방법을 화면에 즉시 노출
 *             2) Google 503(High Demand/일시적 과부하) 발생 시 지수 백오프 자동 1회 재시도 후에도 불가 시 명확한 'Google AI 서버 503 과부하'로 진단하여 하단 모델 선택기에서 안정 모델로 변경할 수 있도록 안내
 *             3) @google/generative-ai result.response catch 가드를 유지하여 스트림 처리 안정성 확보
 * 🚨 @PATCH : **2026-09-12** — 스트리밍 출력 정제기(cleanOutputText) 내 상단 메타데이터(YAML Frontmatter `--- ... ---`, JSDoc 파일 주석 등) 자동 스트립 및 메타정보 추출 원천 차단 규칙 적용; Google Gemini 503(일시적 트래픽 폭증/High Demand) 및 429(할당량) 발생 시 1.5초 지연 1회 자동 재시도 로직 구축, 실패 시 명확한 한국어 진단 메시지(503/429/404/400) 변환 투척으로 사용자 조치 가이드 제공; 기본 모델 식별자 gemini-3.8-flash 정합성 유지
 * -----------------------------------------------------------------------
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
  { id: 'gemma-4-31b-it', name: 'Gemma 4 31B IT', label: '💎 Gemma 4 31B IT (Google DeepMind 256K 플래그십 오픈 모델)', desc: 'Google DeepMind 256K 오픈 모델', badge: '신규' },
  { id: 'gemma-4-26b-a4b-it', name: 'Gemma 4 26B A4B IT', label: '💎 Gemma 4 26B A4B IT (MoE 경량 고처리량 오픈 모델)', desc: 'MoE 경량 고처리량 오픈 모델', badge: '신규' },
];

export const DEFAULT_AI_MODEL = 'gemini-3.8-flash';

/**
 * 레거시 구버전(<= 3.1) 모델명이 저장되어 있을 경우 기본 플래그십으로 안전하게 정규화
 */
export function normalizeAIModelName(rawModel?: string): string {
  const model = (rawModel || '').trim();
  if (!model) return DEFAULT_AI_MODEL;
  if (model.startsWith('gemini-')) {
    const match = model.match(/^gemini-(\d+(?:\.\d+)?)/);
    if (match && parseFloat(match[1]) <= 3.1) {
      return DEFAULT_AI_MODEL;
    }
  }
  if (model.startsWith('gemma-')) {
    const match = model.match(/^gemma-(\d+)/);
    if (match && parseInt(match[1], 10) < 4) {
      return 'gemma-4-31b-it';
    }
  }
  return model;
}

/**
 * Google AI Studio API로부터 현재 사용 가능한 공식 모델 목록을 실시간 동적 조회합니다.
 * - generateContent 지원 모델만 추출
 * - Gemini 3.1 이하 레거시(gemini-3.1 및 그 이하) 및 구버전 Gemma(gemma-1/2/3) 완전 배제
 */
export async function fetchGoogleAIStudioModels(apiKey?: string): Promise<OnriviAIModelItem[]> {
  const cleanKey = (apiKey || '').trim();
  if (!cleanKey) return getCachedAIModels();

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`);
    if (!res.ok) return getCachedAIModels();
    const data = await res.json();
    if (!data.models || !Array.isArray(data.models)) return getCachedAIModels();

    const filtered: OnriviAIModelItem[] = [];

    for (const m of data.models) {
      const id: string = (m.name || '').replace(/^models\//, '');
      const methods: string[] = m.supportedGenerationMethods || [];
      if (!methods.includes('generateContent')) continue;

      // Gemini 3.1 이하 버전 제외 (gemini-3.1 및 이하 완전 배제)
      if (id.startsWith('gemini-')) {
        const verMatch = id.match(/^gemini-(\d+(?:\.\d+)?)/);
        if (verMatch) {
          const verNum = parseFloat(verMatch[1]);
          if (verNum <= 3.1) continue;
        }
      }

      // Gemma 구버전 제외 (gemma-4 이상 허용)
      if (id.startsWith('gemma-')) {
        const verMatch = id.match(/^gemma-(\d+)/);
        if (verMatch) {
          const verNum = parseInt(verMatch[1], 10);
          if (verNum < 4) continue;
        }
      }

      // 🛡️ [순수 텍스트/대화 생성 LLM만 한정]: 이미지 생성, 비디오, 오디오/TTS, 로보틱스, 임베딩 등 비LLM 모델 전면 배제
      const nonLlmKeywords = [
        'embedding', 'aqa', 'imagen', 'veo', 'whisper', 'tts', 'audio',
        'music', 'speech', 'vision-only', 'bimodal', 'robotics'
      ];
      if (nonLlmKeywords.some(keyword => id.toLowerCase().includes(keyword))) {
        continue;
      }

      // Gemini 및 Gemma 등 검증된 대형 언어 모델(LLM) 제품군만 통과
      const isGeminiLLM = id.startsWith('gemini-');
      const isGemmaLLM = id.startsWith('gemma-');
      if (!isGeminiLLM && !isGemmaLLM) {
        continue;
      }

      let label = m.displayName || id;
      let badge: string | undefined = undefined;
      if (id.includes('3.8')) { label = `👑 ${label} (최신 플래그십)`; badge = '최신'; }
      else if (id.includes('3.7')) { label = `⚡ ${label} (고성능 모델)`; badge = '추천'; }
      else if (id.includes('3.6')) label = `🛡️ ${label} (안정화 모델)`;
      else if (id.includes('3.5')) label = `💡 ${label} (지능형 모델)`;
      else if (id.includes('gemma-4-31b')) { label = `💎 ${label} (Google DeepMind 256K)`; badge = '신규'; }
      else if (id.includes('gemma-4-26b')) { label = `💎 ${label} (MoE 경량 고처리량)`; badge = '신규'; }
      else if (id.startsWith('gemma')) label = `💎 ${label}`;
      else label = `✨ ${label}`;

      filtered.push({
        id,
        name: m.displayName || id,
        label,
        desc: m.description,
        badge,
      });
    }

    if (filtered.length > 0) {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('onrivi_dynamic_ai_models', JSON.stringify(filtered));
        } catch {}
      }
      return filtered;
    }
  } catch (e) {
    console.warn('[gemini] Google AI Studio 모델 동적 조회 실패, 캐시/SSOT 기준 목록 유지:', e);
  }

  return getCachedAIModels();
}

export function getCachedAIModels(): OnriviAIModelItem[] {
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('onrivi_dynamic_ai_models');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = parsed.filter((m: any) => {
            if (!m || !m.id) return false;
            if (m.id.startsWith('gemini-')) {
              const match = m.id.match(/^gemini-(\d+(?:\.\d+)?)/);
              if (match && parseFloat(match[1]) <= 3.1) return false;
            }
            if (m.id.startsWith('gemma-')) {
              const match = m.id.match(/^gemma-(\d+)/);
              if (match && parseInt(match[1], 10) < 4) return false;
            }
            const nonLlmKeywords = [
              'embedding', 'aqa', 'imagen', 'veo', 'whisper', 'tts', 'audio',
              'music', 'speech', 'vision-only', 'bimodal', 'robotics'
            ];
            if (nonLlmKeywords.some(keyword => m.id.toLowerCase().includes(keyword))) {
              return false;
            }
            const isGeminiLLM = m.id.startsWith('gemini-');
            const isGemmaLLM = m.id.startsWith('gemma-');
            if (!isGeminiLLM && !isGemmaLLM) {
              return false;
            }
            return true;
          });
          if (valid.length > 0) return valid;
        }
      }
    } catch {}
  }
  return ONRIVI_AI_MODELS;
}

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
    const modelsToTest = [modelName || 'gemini-3.8-flash', 'gemini-3.7-flash'];
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
    const isGemma = modelName.toLowerCase().startsWith('gemma');
    return {
      title: 'Google AI 서버 일시 오류 / 과부하 (500/503)',
      description: `현재 Google AI 서버에서 '${modelName}' 모델 처리 중 일시적인 서버 오류(500) 또는 과부하(503)가 발생했습니다.`,
      solution: isGemma
        ? 'Gemma 오픈 모델은 Google AI 스튜디오 공유 클러스터 상황에 따라 지연이 발생할 수 있습니다. 하단 AI 모델 선택기에서 공인 플래그십 모델(Gemini 3.8 Flash 또는 Gemini 3.7 Flash)로 변경하시면 즉시 안정적으로 작성하실 수 있습니다.'
        : 'Google AI 서버의 일시적인 트래픽 폭증 상태입니다. 잠시 후 다시 시도하시거나, 하단 AI 모델 선택기에서 Gemini 3.7 Flash 등 다른 플래그십 모델로 변경하시면 즉시 작성하실 수 있습니다.',
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
      solution: '하단 AI 모델 목록에서 Gemini 3.8 Flash 또는 Gemini 3.7 Flash 등 서비스 중인 공식 모델을 선택해 주세요.',
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
  const maxAttempts = 3; // 일시적 통신 지연(500/503/429/스트림파싱) 시 최대 2회 자동 재시도 (총 3회 시도, 동일 모델 유지)

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
      const isAuthError = status === 401 || status === 403 || msg.includes('api_key') || msg.includes('api key') || msg.includes('permission_denied') || msg.includes('unauthorized');
      const isNotFoundError = status === 404 || msg.includes('404') || msg.includes('not found');
      const isStreamParseError = msg.includes('failed to parse stream') || msg.includes('parse stream');

      // 인증 오류 및 모델 미지원(404)은 재시도해도 불가능하므로 즉시 에러 표출
      const canRetry = !isAuthError && !isNotFoundError;

      // 🛡️ 스트림 단절/파싱 에러(isStreamParseError) 또는 2회차 이상 시도 실패 시:
      // 동일 모델에 대해 단일 완성형(generateContent - non-streaming) 대체 수신 시도
      if (canRetry && (isStreamParseError || attempts >= 2)) {
        try {
          console.warn(`[GeminiStream] '${targetModelName}' 스트림 연결 불안정 감지 (${isStreamParseError ? 'ParseError' : status || '500/503'}). 단일 완성형(generateContent) 대체 수신을 시도합니다...`);
          const fallbackResult = await modelInstance.generateContent(effectiveUserPrompt);
          const fallbackText = fallbackResult.response?.text() || '';
          if (fallbackText) {
            const finalText = cleanOutputText(fallbackText, true);
            onChunk(finalText);
            console.info(`[GeminiStream] '${targetModelName}' 단일 완성형 대체 수신 성공 (${finalText.length}자).`);
            return finalText;
          }
        } catch (fallbackError: any) {
          console.warn(`[GeminiStream] 단일 완성형 대체 요청도 실패했습니다:`, fallbackError?.message || fallbackError);
        }
      }

      // 🔁 [표준 재시도 규칙]: 1회 실패 후 1초 대기 -> 2회 시도 후 1초 대기 -> 3회차 시도에서도 문제 발생 시 최종 에러 메시지 표출
      if (canRetry && attempts < maxAttempts) {
        onChunk(''); // 이전 실패 시도의 불완전한 파편 텍스트 UI 초기화
        console.warn(`[GeminiStream] '${targetModelName}' ${attempts}회차 호출 오류 (${status || '일시 오류'}). 1초 후 ${attempts + 1}회차 재시도합니다...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }

      console.error(`[GeminiStream] '${targetModelName}' 총 ${attempts}회 시도 실패. 에러 메시지를 표출합니다:`, error);
      const diagnosed = formatUserFriendlyAIError(error, targetModelName);
      const friendlyError = new Error(diagnosed.description);
      (friendlyError as any).diagnosed = diagnosed;
      throw friendlyError;
    }
  }

  throw new Error(`AI 호출 실패: '${targetModelName}' 모델이 응답하지 않았습니다.`);
};
