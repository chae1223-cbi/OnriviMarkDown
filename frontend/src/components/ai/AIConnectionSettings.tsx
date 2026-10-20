// ====================================================================
// 📊 [OMD-AI-Settings-0001] src/components/ai/AIConnectionSettings.tsx
// 🎯 @KICK  : 다중 AI(Google, OpenAI, Claude) 제공자별 API 키 설정 및 연결 관리
// 🛡️ @GUARD : Rule 1(주석 최신화), Rule 6(Modern Technical Editorial), AES 보안 저장소 영구 보존
// 🚨 @PATCH : **2026-10-20** — [등록된 API 키 마스킹 표준화 ('****************') 및 E2E 테스트 정합성 완료]:
//             1) 등록된 API 키의 마스킹 표기를 '****************'(16자리 고정)으로 통일하여 보안 가드 및 E2E 테스트 정합성 100% 보장
// 🚨 @PATCH : **2026-10-20** — [OpenAI/Claude API 키 로컬 암호화 영구 보관 및 새로고침 후 자동 복원 완비]:
//             1) 웹/데스크톱 공통 remember=true 기본 적용 및 saveSecureData(AES-256) 자동 연동으로 새로고침 후 키 소실 결함 원천 해결
//             2) 직관적인 연결 상태 배지 및 명확한 제공자별(OpenAI, Google, Claude) 안내 UI 제공
// ====================================================================
'use client';
import React, { useEffect, useState } from 'react';
import {
  AI_LABELS,
  configureAI,
  connectedAI,
  aiRequest,
  readConnections,
  saveConnection,
  removeConnection,
  selectConnection,
  selectedConnection,
  getProviderApiKey,
} from '@/lib/ai/client';
import { recommendedModels } from '@/lib/ai/recommendedModels';
import type { AIProvider } from '@/lib/ai/types';

export default function AIConnectionSettings({ scope }: { scope: string }) {
  return (
    <section aria-label="여러 AI 연결 설정" className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2 border-outline-variant/20 dark:border-white/10">
        <h3 className="font-serif text-[20px] font-semibold text-on-surface">다중 AI 연결 관리</h3>
        <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-[#1d4ed8]/10 text-[#1d4ed8] dark:text-blue-400">
          Google · OpenAI · Claude
        </span>
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Google Gemini, OpenAI(GPT), Claude를 각각 연결해 함께 사용할 수 있습니다. 제공사별 API 키를 등록하면 이 기기의 암호화 저장소에 안전하게 보관되어 새로고침 후에도 유지됩니다.
      </p>
      {(['google', 'openai', 'anthropic'] as AIProvider[]).map((provider) => (
        <AIProviderConnection key={scope + ':' + provider} scope={scope} provider={provider} />
      ))}
    </section>
  );
}

function AIProviderConnection({ scope, provider }: { scope: string; provider: AIProvider }) {
  const [key, setKey] = useState('');
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState('');
  const [connections, setConnections] = useState(readConnections);
  const [editingKey, setEditingKey] = useState(false);

  useEffect(() => {
    const sync = () => setConnections(readConnections());
    window.addEventListener('onrivi:ai-connections', sync);
    return () => window.removeEventListener('onrivi:ai-connections', sync);
  }, [scope]);

  useEffect(() => {
    let live = true;
    setKey('');
    // 런타임 및 보안 저장소 키 조회
    const hasExisting = Boolean(getProviderApiKey(scope, provider));
    if (hasExisting && live) setConnected(true);

    void connectedAI(scope, provider).then((value) => {
      if (live) setConnected(value || hasExisting);
    });
    return () => {
      live = false;
    };
  }, [provider, scope]);

  const connect = async () => {
    setBusy(true);
    setMessage('');
    try {
      if (key.trim()) {
        await configureAI(scope, provider, key.trim(), remember);
        const previous = readConnections()[provider];
        saveConnection(provider, { model: previous?.model || '', models: [] });
      }
      const controller = new AbortController(),
        timer = setTimeout(() => controller.abort(), 30000);
      try {
        const models = await aiRequest(scope, provider, 'models', undefined, controller.signal);
        const previous = readConnections()[provider];
        saveConnection(provider, { model: previous?.model || '', models, updatedAt: Date.now() });
        setConnected(true);
        setKey('');
        setEditingKey(false);
        setMessage(`✅ 추천 모델 ${recommendedModels(provider, models).length}개를 확인했습니다. 아래에서 사용할 모델을 선택해 주세요.`);
      } finally {
        clearTimeout(timer);
      }
    } catch (error) {
      setMessage(`❌ 연결 실패: ${error instanceof Error ? error.message : '연결을 확인하지 못했습니다.'}`);
    } finally {
      setBusy(false);
    }
  };

  const shortlist = recommendedModels(provider, connections[provider]?.models || []);
  const locked = connected && !editingKey;

  return (
    <section
      className="rounded-xl border border-purple-200 dark:border-zinc-700 p-4 space-y-3 text-sm bg-white dark:bg-zinc-900/60 shadow-xs"
      aria-label={AI_LABELS[provider] + ' 연결'}
    >
      <div className="flex justify-between items-center">
        <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
          <span>🤖</span> {AI_LABELS[provider]}
        </span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-bold ${
            connected
              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
          }`}
        >
          {connected ? '● 연결 등록됨' : '○ 연결 안 됨'}
        </span>
      </div>

      <label className="block space-y-1">
        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
          API 키 {locked ? '(등록됨 · 암호화 보호)' : ''}
        </span>
        <input
          aria-label={locked ? '등록된 AI API 키' : '새 AI API 키'}
          type="password"
          autoComplete="off"
          readOnly={locked}
          disabled={busy}
          className={`block w-full p-2.5 rounded-lg border text-xs font-mono transition outline-none ${
            locked
              ? 'bg-blue-50/70 border-blue-200 text-blue-700 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300 select-none'
              : 'bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
          }`}
          value={locked ? '****************' : key}
          onCopy={(e) => {
            if (locked) e.preventDefault();
          }}
          onCut={(e) => {
            if (locked) e.preventDefault();
          }}
          onChange={(e) => {
            if (!locked) setKey(e.target.value);
          }}
          placeholder={`${AI_LABELS[provider]} 발급 API 키 입력 (예: ${provider === 'openai' ? 'sk-...' : provider === 'google' ? 'AIza...' : 'sk-ant-...'})`}
        />
      </label>

      {connected && (
        <div className="text-xs flex items-center gap-2">
          <button
            type="button"
            disabled={busy}
            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
            onClick={() => {
              setKey('');
              setEditingKey((v) => !v);
              setMessage('');
            }}
          >
            {editingKey ? '키 변경 취소' : '키 변경'}
          </button>
          <span className="text-zinc-400 text-[11px]">
            {locked ? '🔒 등록된 키는 안전하게 암호화 보관 중입니다.' : '새 키를 붙여넣은 뒤 [연결 · 모델 확인]을 누르세요.'}
          </span>
        </div>
      )}

      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
        <span>🛡️</span> 등록된 키는 이 기기(PC/브라우저)의 로컬 AES 보안 저장소에 암호화 보관되어 새로고침 후에도 안전하게 유지됩니다.
      </p>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          disabled={busy || (!key.trim() && (!connected || editingKey))}
          onClick={() => void connect()}
          className="rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2 text-xs font-bold disabled:opacity-40 transition cursor-pointer shadow-xs"
        >
          {busy ? '연결 확인 중…' : '연결 · 모델 목록 확인'}
        </button>
        <button
          type="button"
          disabled={busy}
          className="border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          onClick={() => {
            void configureAI(scope, provider, '', false, true)
              .then(() => {
                removeConnection(provider);
                setConnected(false);
                setKey('');
                setEditingKey(false);
                if (selectedConnection().provider === provider) selectConnection(provider, '');
                setMessage('연결을 해제했습니다.');
              })
              .catch((error) => setMessage(error instanceof Error ? error.message : '연결 해제 실패'));
          }}
        >
          연결 해제
        </button>
      </div>

      {!!connections[provider]?.models.length && (
        <label className="block space-y-1 pt-1 border-t border-zinc-100 dark:border-zinc-800">
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">사용할 기본 모델</span>
          <select
            aria-label="연결한 AI 모델 선택"
            className="block w-full p-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            disabled={busy}
            value={connections[provider]?.model || ''}
            onChange={(e) => {
              const model = e.target.value;
              saveConnection(provider, { ...connections[provider]!, model });
              selectConnection(provider, model);
              setMessage('✅ 사용할 모델을 저장했습니다. 에디터 AI 패널에서 바로 질문하세요.');
            }}
          >
            <option value="">모델을 선택해 주세요</option>
            {connections[provider]?.model && !shortlist.some((m) => m.id === connections[provider]?.model) && (
              <option disabled value={connections[provider]!.model}>
                {connections[provider]!.model} (기존 선택 · 추천 외)
              </option>
            )}
            {shortlist.map((m) => (
              <option key={m.id} value={m.id}>
                {m.family} · {m.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {message && <p role="status" className="text-xs whitespace-pre-wrap font-medium pt-1 text-purple-700 dark:text-purple-300">{message}</p>}
    </section>
  );
}
