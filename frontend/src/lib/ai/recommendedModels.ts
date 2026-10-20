// ====================================================================
// 📊 [OMD-AI-recommendedModels-0001] src/lib/ai/recommendedModels.ts
// 🎯 @KICK  : 공식 AI 모델 카탈로그 및 추천 모델 목록 관리 (Google, OpenAI, Claude)
// 🛡️ @GUARD : Rule 1(단일 주석 관리), 사용자 요청 모델(GPT: Sol, Astra, Luna / Gemini: 4.0, 3.8, 3.6 Flash / Gemma: Gemma 4) 표준화
// 🚨 @PATCH : **2026-10-20** — [Claude Sonnet 5.5 모델 추가 및 available 모델 카탈로그 매핑 복원]:
//             1) MODEL_CATALOG에 'claude-sonnet-5-5' (Claude Sonnet 5.5) 추가
//             2) recommendedModels(provider, available)에서 제공된 available 모델이 있을 때 카탈로그 정식 명칭 매핑 반환 완비
// 🚨 @PATCH : **2026-10-20** — [Google 오픈 모델 Gemma 4(gemma-4-31b-it, gemma-4-26b-a4b-it) 모델 카탈로그 재탑재]:
//             1) 사용자 요청에 따라 Google 최신 오픈 가중치 모델 Gemma 4(Gemma 4 31B IT, Gemma 4 26B A4B IT) 공식 추가
//             2) familyOrder에 'Gemma' 그룹을 편입하여 Gemini 바로 아래에 독립 패밀리로 깔끔하게 정렬 표출
// 🚨 @PATCH : **2026-10-20** — [사용자 지정 최신 3대 모델 라인업으로 전면 정돈]:
//             1) OpenAI GPT: 불필요한 모델 배제하고 사용자가 지정한 최신 3대 모델(GPT-6.1 Sol, GPT-6 Astra, GPT-6 Luna)만 탑재
//             2) Google Gemini: 구버전(2.5, 2.0, 1.5) 완전 정리하고 Gemini 4.0 Flash, Gemini 3.8 Flash, Gemini 3.6 Flash 3종만 탑재
//             3) recommendedModels에서 사용자 지정 추천 모델 세트를 상시 고정 반환하도록 보장
// ====================================================================

import type { AIModel, AIProvider } from './types';

const MODEL_CATALOG: { provider: AIProvider; id: string; name: string; family: string; releasedAt: string }[] = [
  // --- Google Gemini (최신 3대 모델: 4.0, 3.8, 3.6 Flash) ---
  { provider: 'google', id: 'gemini-4.0-flash', name: 'Gemini 4.0 Flash', family: 'Gemini', releasedAt: '2026-10-01' },
  { provider: 'google', id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', family: 'Gemini', releasedAt: '2026-09-02' },
  { provider: 'google', id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', family: 'Gemini', releasedAt: '2026-06-15' },

  // --- Google Gemma (최신 오픈 모델: Gemma 4) ---
  { provider: 'google', id: 'gemma-4-31b-it', name: 'Gemma 4 31B IT', family: 'Gemma', releasedAt: '2026-09-15' },
  { provider: 'google', id: 'gemma-4-26b-a4b-it', name: 'Gemma 4 26B A4B IT', family: 'Gemma', releasedAt: '2026-09-10' },

  // --- OpenAI GPT (최신 3대 모델: Sol, Astra, Luna) ---
  { provider: 'openai', id: 'gpt-6.1-sol', name: 'GPT-6.1 Sol', family: 'GPT', releasedAt: '2026-10-01' },
  { provider: 'openai', id: 'gpt-6-astra', name: 'GPT-6 Astra', family: 'GPT', releasedAt: '2026-08-15' },
  { provider: 'openai', id: 'gpt-6-luna', name: 'GPT-6 Luna', family: 'GPT', releasedAt: '2026-07-01' },

  // --- Anthropic Claude ---
  { provider: 'anthropic', id: 'claude-sonnet-5-5', name: 'Claude Sonnet 5.5', family: 'Claude', releasedAt: '2026-10-01' },
  { provider: 'anthropic', id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', family: 'Claude', releasedAt: '2024-10-22' },
  { provider: 'anthropic', id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', family: 'Claude', releasedAt: '2024-10-22' },
  { provider: 'anthropic', id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', family: 'Claude', releasedAt: '2024-02-29' },
];

const familyOrder = ['Gemini', 'Gemma', 'GPT', 'Claude'];

export const RECOMMENDED_MODELS = [...MODEL_CATALOG].sort(
  (a, b) => familyOrder.indexOf(a.family) - familyOrder.indexOf(b.family) || b.releasedAt.localeCompare(a.releasedAt) || b.id.localeCompare(a.id, undefined, { numeric: true })
);

export function compareRecommendedModels(a: { id: string }, b: { id: string }) {
  return RECOMMENDED_MODELS.findIndex(row => row.id === a.id) - RECOMMENDED_MODELS.findIndex(row => row.id === b.id);
}

export function recommendedModels(provider: AIProvider, available?: AIModel[]): AIModel[] {
  if (Array.isArray(available) && available.length > 0) {
    return available.map((m) => {
      const catalog = RECOMMENDED_MODELS.find((c) => c.id === m.id);
      return {
        provider,
        id: m.id,
        name: catalog ? catalog.name : m.name && m.name !== '검증 모델' ? m.name : m.id,
        family: catalog ? catalog.family : m.family || (provider === 'anthropic' ? 'Claude' : provider === 'openai' ? 'GPT' : 'Gemini'),
        releasedAt: catalog ? catalog.releasedAt : new Date().toISOString(),
      };
    });
  }
  return RECOMMENDED_MODELS.filter((model) => model.provider === provider);
}
