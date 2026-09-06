// ====================================================================
// 📊 [OMD-CORE-llmProvider-0001] llmProvider.ts ➔ Knowledge LLM Provider
// 🎯 @KICK  : Gemini JSON Mode 기반 정형 분석(요약, 핵심요점, 태그, 검색어) 및 질의응답 프로바이더 구현
// 🛡️ @GUARD : API 키 미연결 방어, JSON Mode 강제 파싱, Rate-Limit(429) 지수 백오프 재시도, 다중 블록 병합
// 🚨 @PATCH : **2026-09-05** — [사용자 지시 반영: 임의 모델 폴백 전면 제거 및 실패 원인 진단 고도화] gemini-2.5-flash 등 레거시 모델로의 임의 자동 폴백 로직을 전면 제거하고 사용자가 지정한 모델만 호출하도록 단일화; 404(모델 미지원/폐기), 503(일시적 트래픽 폭증/High Demand), 429(할당량 초과) 등 구체적 실패 원인과 조치 방법을 명확히 진단 메시지로 전달하도록 개편
//             **2026-09-04** — [503 Service Unavailable 및 고수요 모델 자동 폴백] gemma 등 특정 모델의 일시적 고수요(503 high demand) 또는 404 발생 시 gemini-2.5-flash/1.5-flash 안정 모델로 자동 폴백 및 503 재시도 로직 구축
//             **2026-09-04** — [Gemma 등 다중 JSON 블록 분할 및 비정형 출력 복원] llmJsonParser 연동, 균형 잡힌 중괄호 추출 및 다중 블록 자동 병합(Object.assign), 트레일링 콤마 보정 탑재
//             **2026-09-04** — [비정형 텍스트 및 사족 자동 정제] Gemma 등 모델이 JSON 서두에 설명문/사족을 붙이거나 코드블록을 출력할 때 순수 JSON 블록 자동 슬라이싱 및 파싱 안전 가드 탑재
//             **2026-09-04** — [ONRIVI-KNOWLEDGE-ENGINE-002.1] LLMProvider 추상화 인터페이스 및 GeminiKnowledgeProvider 최초 구현
// 🔗 @CALLS : @google/generative-ai, ./knowledgeValidator.ts, ./llmJsonParser.ts
// ====================================================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { LLMProvider, KnowledgeAnalysisResult } from '../../types/knowledge';
import { validateKnowledgeAnalysis } from './knowledgeValidator';
import { parseAndRepairLlmJson } from './llmJsonParser';

const ANALYSIS_SYSTEM_PROMPT = `
당신은 개인 지식 베이스를 구축하는 전문 마크다운 분석 AI입니다.
주어진 마크다운 문서를 읽고, 반드시 유효한 단 하나의 JSON 객체 { ... } 로만 응답해야 합니다.

[응답 JSON 포맷 예시]:
{
  "summary": "온리비 마크다운 에디터의 주요 단축키와 기본 사용법을 정리한 안내 문서입니다.",
  "key_points": [
    "마크다운 문법 실시간 미리보기 지원",
    "단축키를 통한 서식 편집 최적화",
    "로컬 지식 베이스 통합 검색 기능 탑재"
  ],
  "document_type": "guide",
  "tags": [
    { "name": "에디터", "score": 95 },
    { "name": "단축키", "score": 88 },
    { "name": "생산성", "score": 75 }
  ],
  "search_terms": ["단축키 목록", "미리보기 분할", "로컬 지식"]
}
`.trim();

export class GeminiKnowledgeProvider implements LLMProvider {
  public readonly name = 'GeminiKnowledgeProvider';
  private genAI: GoogleGenerativeAI;
  private modelName: string;

  constructor(apiKey: string, modelName: string = 'gemini-3.8-flash') {
    if (!apiKey || !apiKey.trim()) {
      throw new Error('MISSING_API_KEY: Google Gemini API 키가 제공되지 않았습니다.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey.trim());
    this.modelName = modelName.trim() || 'gemini-3.8-flash';
  }

  /**
   * 마크다운 텍스트를 입력받아 LLM 정형 분석을 수행합니다.
   * 특정 모델(gemma 등)이 503(high demand) 또는 404를 반환할 경우 표준 안정 모델로 자동 폴백합니다.
   */
  async analyzeDocument(markdownText: string): Promise<KnowledgeAnalysisResult> {
    if (!markdownText || !markdownText.trim()) {
      return {
        summary: '',
        keyPoints: [],
        documentType: 'note',
        tags: [],
        searchTerms: [],
      };
    }

    const selectedModel = this.modelName;
    const prompt = `${ANALYSIS_SYSTEM_PROMPT}\n\n[분석할 마크다운 원문]:\n${markdownText.slice(0, 15000)}`;

    const model = this.genAI.getGenerativeModel({
      model: selectedModel,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    let attempts = 0;
    const maxAttempts = 2; // 일시적 통신 지연(429/503) 시 동일 모델 1회 재시도

    while (attempts < maxAttempts) {
      try {
        attempts++;
        const result = await model.generateContent(prompt);
        const rawText = result.response.text().trim();

        const parsed = parseAndRepairLlmJson(rawText);
        const validated = validateKnowledgeAnalysis(parsed);
        return validated;
      } catch (err: any) {
        const status = err?.status;
        const msg = String(err?.message || '');

        const isTransient = status === 429 || status === 503 ||
          msg.includes('429') || msg.includes('503') || msg.includes('high demand');

        if (isTransient && attempts < maxAttempts) {
          console.warn(`[GeminiKnowledgeProvider] '${selectedModel}' 모델 일시적 지연/과부하 (${status || '503'}). 1.5초 후 1회 재시도합니다...`);
          await new Promise(resolve => setTimeout(resolve, 1500));
          continue;
        }

        // 404 / 지원 중단 에러 진단
        if (status === 404 || msg.includes('404') || msg.includes('no longer available') || msg.includes('not found')) {
          throw new Error(
            `MODEL_NOT_FOUND: 선택하신 AI 모델 '${selectedModel}'을(를) Google API에서 찾을 수 없거나 사용 중단되었습니다 (404 Not Found).\n` +
            `상세 사유: ${msg}\n` +
            `조치 방법: 에디터 하단 또는 환경설정에서 현재 서비스 중인 다른 Gemini 모델(예: gemini-3.6-flash, gemini-3.7-flash 등)을 선택해 주세요.`
          );
        }

        // 503 일시적 수요 폭증 (High Demand)
        if (status === 503 || msg.includes('503') || msg.includes('high demand')) {
          throw new Error(
            `MODEL_BUSY: 선택하신 AI 모델 '${selectedModel}'이(가) Google 서버의 일시적 트래픽 폭증으로 응답할 수 없습니다 (503 Service Unavailable / High Demand).\n` +
            `잠시 후 다시 시도하시거나, 다른 모델로 변경해 주세요.`
          );
        }

        // 429 요청 한도 초과
        if (status === 429 || msg.includes('429') || msg.includes('Quota')) {
          throw new Error(
            `RATE_LIMIT_EXCEEDED: Google Gemini API 요청 한도(Quota/Rate Limit)를 초과했습니다 (429).\n` +
            `잠시 후 다시 시도해 주세요.`
          );
        }

        // 400 잘못된 요청 또는 JSON 모드 미지원
        if (status === 400 || msg.includes('400')) {
          throw new Error(
            `INVALID_REQUEST: 모델 '${selectedModel}' 호출 중 오류가 발생했습니다 (400 Bad Request).\n` +
            `상세 사유: ${msg}`
          );
        }

        throw new Error(`ANALYSIS_FAILED: 선택한 모델 '${selectedModel}' 분석 실패 (${msg || '알 수 없는 오류'})`);
      }
    }

    throw new Error(`ANALYSIS_FAILED: 선택한 모델 '${selectedModel}' 호출 실패`);
  }

  /**
   * 검색된 컨텍스트를 근거로 사용자의 질의에 답변을 생성합니다.
   * 사용자가 선택한 모델만을 단일 호출하며, 임의의 모델 폴백을 수행하지 않습니다.
   */
  async answerQuestion(query: string, contextText: string): Promise<{ answer: string; tokensUsed?: number }> {
    const prompt = `
당신은 사용자의 마크다운 지식 보관함을 기반으로 정확하게 답변하는 친절한 AI 어시스턴트입니다.
아래 제공된 [참고 지식 컨텍스트]를 최우선 근거로 활용하여 사용자의 질문에 한국어로 명확하고 구조적으로 답변하세요.

[참고 지식 컨텍스트]:
${contextText}

[사용자 질문]:
${query}

지침:
1. 제공된 지식 컨텍스트에 포함된 내용만을 사실 기반으로 답변하세요.
2. 답변 마지막에 어떤 문서의 내용을 참조했는지 언급하지 마세요 (UI에서 자동으로 출처 카드가 렌더링됩니다).
3. 컨텍스트만으로 알 수 없는 내용인 경우 추측하지 말고 "보관함 내 관련 문서에서 해당 내용을 찾을 수 없습니다"라고 정직하게 답변하세요.
`.trim();

    const selectedModel = this.modelName;

    try {
      const model = this.genAI.getGenerativeModel({
        model: selectedModel,
        generationConfig: {
          temperature: 0.3,
        },
      });

      const result = await model.generateContent(prompt);
      const answer = result.response.text().trim();
      return { answer };
    } catch (err: any) {
      const status = err?.status;
      const msg = String(err?.message || '');

      if (status === 404 || msg.includes('404') || msg.includes('no longer available') || msg.includes('not found')) {
        throw new Error(
          `MODEL_NOT_FOUND: 선택하신 AI 모델 '${selectedModel}'을(를) Google API에서 찾을 수 없거나 사용 중단되었습니다 (404 Not Found).\n` +
          `상세 사유: ${msg}\n` +
          `조치 방법: 에디터 또는 환경설정에서 다른 Gemini 모델을 선택해 주세요.`
        );
      }

      if (status === 503 || msg.includes('503') || msg.includes('high demand')) {
        throw new Error(
          `MODEL_BUSY: 선택하신 AI 모델 '${selectedModel}'이(가) Google 서버의 일시적 트래픽 폭증으로 응답할 수 없습니다 (503 Service Unavailable / High Demand).\n` +
          `잠시 후 다시 시도하시거나 다른 모델을 선택해 주세요.`
        );
      }

      if (status === 429 || msg.includes('429') || msg.includes('Quota')) {
        throw new Error(`RATE_LIMIT_EXCEEDED: API 요청 한도(429)를 초과했습니다. 잠시 후 다시 시도해 주세요.`);
      }

      throw new Error(`답변 생성 실패 (${msg || '알 수 없는 오류'})`);
    }
  }
}

/**
 * LLM 프로바이더 팩토리 함수
 */
export function createKnowledgeLLMProvider(
  providerType: 'gemini' | 'openai' | 'claude' = 'gemini',
  apiKey: string,
  modelName?: string
): LLMProvider {
  switch (providerType) {
    case 'gemini':
    default:
      return new GeminiKnowledgeProvider(apiKey, modelName);
  }
}
